<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\BarberWorkingHour;
use App\Models\BusinessHour;
use Carbon\Carbon;


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

        /*
        * Primeiro procuramos uma configuração específica
        * para este barbeiro neste dia.
        */
        $barberHour = BarberWorkingHour::query()
            ->where('tenant_id', tenant('id'))
            ->where('user_id', $barber->id)
            ->where('day_of_week', $dayOfWeek)
            ->with('breaks')
            ->first();

        /*
        * Se existe configuração individual,
        * ela tem prioridade sobre a configuração geral.
        */
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
            /*
            * Sem configuração individual:
            * utiliza o horário geral da barbearia.
            */
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
            ->where('user_id', $barber->id)
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
            $slot->addMinutes(15)
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
