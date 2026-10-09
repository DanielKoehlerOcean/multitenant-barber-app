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
use App\Models\TenantUser;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;


class ScheduleController extends Controller
{

    public function index(){
        $user = auth()->user();
        $role = TenantUser::query()->where('user_id', $user->id)->first()->role;

        switch ($role) {
            case 'admin':
                $schedules = Schedule::with('services', 'client', 'barber')->get();
                break;
            case 'barber':
                $schedules = Schedule::query()->with('services', 'client', 'barber')->where('barber_id', $user->id)->get();
                break;
            case 'client':
                $schedules = Schedule::query()->with('services', 'client', 'barber')->where('client_id', $user->id)->get();
                break;
            default:
                $schedules = [];
        }

        return Inertia::render('schedules/index', [
            'schedules' => $schedules,
            'role' => $role
        ]);
    }

    public function create(){

        $services = Service::all();
        $clients = [['id' => 1, 'name' => 'Daniel']];
        $barbers = tenant()
            ->users()
            ->where('role', 'barber')
            ->orderBy('name')
            ->get(['users.id', 'users.name']);

        return Inertia::render('schedules/create', [
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
        $client = auth()->user();

        $clitenVerify = tenant()->users()
                ->whereKey($client->id)
                ->wherePivot('role', 'client')
                ->exists();

        $this->validateSchedule((!$clitenVerify), 'Usuário não aturoizado', 'Você não possui permissão para realizar agendamento');
        
        $barber = tenant()
            ->users()
            ->where('role', 'barber')
            ->whereKey($validated['barber_id'])
            ->firstOrFail();

        $services = Service::query()
            ->where('tenant_id', $tenantId)
            ->whereIn('id', $validated['service_ids'])
            ->get();
        
        $this->validateSchedule($services->count() !== count(array_unique($validated['service_ids'])), 'Erro No serviço selecionado', 'Um ou mais serviços selecionados são inválidos.');

        $totalDuration = $services->sum('duration');
        $totalValue = $services->sum('value');

        $startedAt = Carbon::createFromFormat(
            'Y-m-d H:i',
            "{$validated['date']} {$validated['time']}",
            config('app.timezone')
        );

        $endAt = $startedAt->copy()->addMinutes($totalDuration);

        $dayOfWeek = $startedAt->dayOfWeek;

        $barberHour = BarberWorkingHour::query()
            ->with('breaks')
            ->where('tenant_id', $tenantId)
            ->where('user_id', $barber->id)
            ->where('day_of_week', $dayOfWeek)
            ->first();

        if ($barberHour) {
            
            $this->validateSchedule(!$barberHour->is_working, 'Erro no Horário do Barbeiro', 'O barbeiro não trabalha neste dia.');
            
            $workStart = Carbon::parse(
                "{$validated['date']} {$barberHour->start_time}"
            );

            $workEnd = Carbon::parse(
                "{$validated['date']} {$barberHour->end_time}"
            );

            $breaks = $barberHour->breaks;
        } else {
            $businessHour = BusinessHour::query()
                ->with('breaks')
                ->where('tenant_id', $tenantId)
                ->where('day_of_week', $dayOfWeek)
                ->first();

            $this->validateSchedule(!$businessHour || !$businessHour->is_open, 'Erro na Data Selecionado', 'A barbearia não funciona este dia.');

            $workStart = Carbon::parse(
                "{$validated['date']} {$businessHour->start_time}"
            );

            $workEnd = Carbon::parse(
                "{$validated['date']} {$businessHour->end_time}"
            );

            $breaks = $businessHour->breaks;
        }

        $this->validateSchedule($startedAt->lt($workStart) ||
            $endAt->gt($workEnd), 'Erro no Horário Selecionado', 'O horário selecionado não comporta a duração dos serviços.');
        
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

            $this->validateSchedule($overlapsBreak, 'Erro no Horário Selecionado', 'O horário selecionado está dentro de um intervalo do barbeiro.');

        }

        $hasConflict = Schedule::query()
            ->where('tenant_id', $tenantId)
            ->where('barber_id', $barber->id)
            ->whereIn('status', ['pendente', 'concluido'])
            ->where('started_at', '<', $endAt)
            ->where('end_at', '>', $startedAt)
            ->exists();

        $this->validateSchedule($hasConflict, 'Erro no Horário Selecionado', 'O barbeiro já possui um agendamento neste horário.');

        $paymentType = PaymentType::query()->where('type', $validated['payment_type'])->first();

        DB::transaction(function () use (
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
        });

        return redirect()
            ->route('dashboard')
            ->with(
                'success',
                'Agendamento criado com sucesso.'
            );
    }

     private function validateSchedule(bool $condition, string $title,  string $description){
        
         if ($condition) {
            throw ValidationException::withMessages([
                'title' => $title,
                'description' => $description
            ]);
        }
    }

    public function destroy(int $id){
        
        $client = auth()->user();
    
        $schedule = Schedule::findOrFail($id);

        if($schedule->client_id === $client->id){
            $schedule->delete();
            
            return redirect()->back()->with('Agendamento deletado com sucesso');
        }

        abort(403);

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
