<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\Service;
use App\Models\User;
use App\Models\PaymentType;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\BarberWorkingHour;
use App\Models\BusinessHour;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;


class ScheduleController extends Controller
{
    public function index(){

        $services = Service::all();
        $clients = [['id' => 1, 'name' => 'Daniel']];
        $barbers = tenant()
            ->users()
            ->where('role', 'barber')
            ->orderBy('name')
            ->get(['users.id', 'users.name']);

        return Inertia::render('schedules/index', [
            'services' => $services,
            'clients' => $clients,
            'barbers' => $barbers
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'barber_id' => ['required', 'integer'],
            'payment_type' => ['required'],
            'date' => ['required', 'date_format:Y-m-d'],
            'time' => ['required', 'date_format:H:i'],
            'service_ids' => ['required', 'array', 'min:1'],
            'service_ids.*' => ['required', 'integer'],
        ]);

        $tenantId = tenant('id');

        /*
        * Cliente pertence ao tenant
        */
        $client = auth()->user();

        abort_unless(
            tenant()->users()
                ->whereKey($client->id)
                ->wherePivot('role', 'client')
                ->exists(),
            403
        );

        /*
        * Barbeiro pertence ao tenant
        */
        $barber = tenant()
            ->users()
            ->where('role', 'barber')
            ->whereKey($validated['barber_id'])
            ->firstOrFail();

        /*
        * Forma de pagamento pertence ao tenant
        */

        /*
        * Serviços pertencem ao tenant
        */
        $services = Service::query()
            ->where('tenant_id', $tenantId)
            ->whereIn('id', $validated['service_ids'])
            ->get();

        if ($services->count() !== count(array_unique($validated['service_ids']))) {
            abort(422, 'Um ou mais serviços selecionados são inválidos.');
        }

        /*
        * Calcula duração e valor diretamente do banco.
        * Nunca devemos confiar no valor/duração enviados pelo frontend.
        */
        $totalDuration = $services->sum('duration');
        $totalValue = $services->sum('value');

        $startedAt = Carbon::createFromFormat(
            'Y-m-d H:i',
            "{$validated['date']} {$validated['time']}",
            config('app.timezone')
        );

        $endAt = $startedAt->copy()->addMinutes($totalDuration);

        /*
        * Dia da semana:
        * 0 = domingo
        * 1 = segunda
        * ...
        * 6 = sábado
        */
        $dayOfWeek = $startedAt->dayOfWeek;

        /*
        * Primeiro procura uma configuração individual
        * do barbeiro para aquele dia.
        */
        $barberHour = BarberWorkingHour::query()
            ->with('breaks')
            ->where('tenant_id', $tenantId)
            ->where('user_id', $barber->id)
            ->where('day_of_week', $dayOfWeek)
            ->first();

        if ($barberHour) {
            /*
            * Existe configuração individual.
            * Ela sobrescreve o horário geral.
            */
            if (!$barberHour->is_working) {
                abort(422, 'O barbeiro não trabalha neste dia.');
            }

            $workStart = Carbon::parse(
                "{$validated['date']} {$barberHour->start_time}"
            );

            $workEnd = Carbon::parse(
                "{$validated['date']} {$barberHour->end_time}"
            );

            $breaks = $barberHour->breaks;
        } else {
            /*
            * Não existe configuração individual.
            * Usa o horário geral da barbearia.
            */
            $businessHour = BusinessHour::query()
                ->with('breaks')
                ->where('tenant_id', $tenantId)
                ->where('day_of_week', $dayOfWeek)
                ->first();

            if (!$businessHour || !$businessHour->is_open) {
                abort(422, 'A barbearia não funciona neste dia.');
            }

            $workStart = Carbon::parse(
                "{$validated['date']} {$businessHour->start_time}"
            );

            $workEnd = Carbon::parse(
                "{$validated['date']} {$businessHour->end_time}"
            );

            $breaks = $businessHour->breaks;
        }

        /*
        * O agendamento inteiro precisa caber dentro
        * do horário de trabalho.
        */
        if (
            $startedAt->lt($workStart) ||
            $endAt->gt($workEnd)
        ) {
            abort(
                422,
                'O horário selecionado não comporta a duração dos serviços.'
            );
        }

        /*
        * Verifica se o horário começa ou termina
        * dentro de uma pausa.
        */
        foreach ($breaks as $break) {
            $breakStart = Carbon::parse(
                "{$validated['date']} {$break->start_time}"
            );

            $breakEnd = Carbon::parse(
                "{$validated['date']} {$break->end_time}"
            );

            $overlapsBreak =
                $startedAt->lt($breakEnd) &&
                $endAt->gt($breakStart);

            if ($overlapsBreak) {
                abort(
                    422,
                    'O horário selecionado está dentro de um intervalo do barbeiro.'
                );
            }
        }

        /*
        * Verifica conflito com outro agendamento.
        *
        * Cancelados não bloqueiam horário.
        */
        $hasConflict = Schedule::query()
            ->where('tenant_id', $tenantId)
            ->where('barber_id', $barber->id)
            ->whereIn('status', ['pendente', 'concluido'])
            ->where('started_at', '<', $endAt)
            ->where('end_at', '>', $startedAt)
            ->exists();

        if ($hasConflict) {
            abort(
                422,
                'O barbeiro já possui um agendamento neste horário.'
            );
        }

        /*
        * Criação do agendamento + serviços.
        */

        $paymentType = PaymentType::query()->where('type', $validated['payment_type'])->first();


        $schedule = DB::transaction(function () use (
            $tenantId,
            $client,
            $validated,
            $services,
            $totalValue,
            $startedAt,
            $endAt,
            $paymentType
        ) {
            $schedule = Schedule::create([
                'tenant_id' => $tenantId,
                'client_id' => $client->id,
                'payment_types_id' => $paymentType->id,
                'barber_id' => $validated['barber_id'],
                'status' => 'pendente',
                'started_at' => $startedAt,
                'end_at' => $endAt,
                'paid_value' => null,
            ]);

            $schedule->services()->attach(
                $services->mapWithKeys(fn ($service) => [
                    $service->id => [
                        'value' => $service->value,
                        'duration' => $service->duration,
                    ],
                ])->toArray()
            );

            return $schedule;
        });

        return redirect()
            ->route('dashboard')
            ->with(
                'success',
                'Agendamento criado com sucesso.'
            );
    }

    public function availability(Request $request)
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'barber_id' => ['required', 'integer'],
            'duration' => ['required', 'integer', 'min:1'],
        ]);

        $date = Carbon::parse($validated['date'])->startOfDay();

        $barber = tenant()
            ->users()
            ->where('role', 'barber')
            ->whereKey($validated['barber_id'])
            ->firstOrFail();

        $dayOfWeek = $date->dayOfWeek;

        $barberHour = BarberWorkingHour::query()
            ->where('tenant_id', tenant('id'))
            ->where('user_id', $barber->id)
            ->where('day_of_week', $dayOfWeek)
            ->with('breaks')
            ->first();

        if ($barberHour) {
            if (! $barberHour->is_working) {
                return response()->json([
                    'times' => [],
                ]);
            }

            $startTime = $barberHour->start_time;
            $endTime = $barberHour->end_time;
            $breaks = $barberHour->breaks;
        } else {
            
            $businessHour = BusinessHour::query()
                ->where('tenant_id', tenant('id'))
                ->where('day_of_week', $dayOfWeek)
                ->with('breaks')
                ->first();

            if (! $businessHour || ! $businessHour->is_open) {
                return response()->json([
                    'times' => [],
                ]);
            }

            $startTime = $businessHour->start_time;
            $endTime = $businessHour->end_time;
            $breaks = $businessHour->breaks;
        }

        $start = $date->copy()->setTimeFromTimeString($startTime);
        $end = $date->copy()->setTimeFromTimeString($endTime);

        $duration = (int) $validated['duration'];

        /*
        * Agendamentos existentes do barbeiro naquele dia.
        * Cancelados não bloqueiam horário.
        */
        $schedules = Schedule::query()
            ->where('tenant_id', tenant('id'))
            ->where('barber_id', $barber->id)
            ->whereDate('started_at', $date)
            ->whereIn('status', ['pendente', 'concluido'])
            ->get(['started_at', 'end_at']);

        $times = [];

        /*
        * Gera slots de 15 em 15 minutos.
        */
        for (
            $slot = $start->copy();
            $slot->copy()->addMinutes($duration)->lte($end);
            $slot->addMinutes(30)
        ) {
            $slotEnd = $slot->copy()->addMinutes($duration);

            /*
            * Verifica se bate com algum intervalo.
            */
            $insideBreak = $breaks->contains(function ($break) use (
                $slot,
                $slotEnd,
                $date
            ) {
                $breakStart = $date->copy()->setTimeFromTimeString(
                    $break->start_time
                );

                $breakEnd = $date->copy()->setTimeFromTimeString(
                    $break->end_time
                );

                return $slot->lt($breakEnd)
                    && $slotEnd->gt($breakStart);
            });

            if ($insideBreak) {
                continue;
            }

            /*
            * Verifica conflito com agendamento existente.
            */
            $hasConflict = $schedules->contains(function ($schedule) use (
                $slot,
                $slotEnd
            ) {
                return $slot->lt($schedule->end_at)
                    && $slotEnd->gt($schedule->started_at);
            });

            if ($hasConflict) {
                continue;
            }

            $times[] = $slot->format('H:i');
        }

        return response()->json([
            'times' => $times,
        ]);
    }
}
