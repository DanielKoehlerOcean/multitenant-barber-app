<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\BusinessHour;
use App\Models\BarberWorkingHour;
use App\Models\BusinessHourBreak;
use App\Models\TenantUser;
use App\Models\User;

class OperationController extends Controller
{
    public function index(){

        $businessHours = BusinessHour::with('breaks')
            ->orderBy('day_of_week')
            ->get();

        $barbers = tenant()
            ->users()
            ->where('role', 'barber')
            ->with([
                'workingHours' => fn ($query) => $query
                    ->where('tenant_id', tenant('id'))
                    ->with('breaks'),
            ])
            ->orderBy('name')
            ->get(['users.id', 'users.name']);


        return Inertia::render('operation/index', [
            'business_hours' => $businessHours,
            'barbers' => $barbers,
        ]);
    }

    public function updateBusinessHours(Request $request){

        $validated = $request->validate([
            'days' => ['required', 'array'],
            'days.*.day_of_week' => [
                'required',
                'integer',
                'between:0,6',
            ],
            'days.*.is_open' => ['required', 'boolean'],
            'days.*.start_time' => [
                'nullable',
            ],
            'days.*.end_time' => [
                'nullable',
            ],
            'days.*.breaks' => ['array'],
            'days.*.breaks.*.start_time' => [
                'required',
            ],
            'days.*.breaks.*.end_time' => [
                'required',
            ],
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['days'] as $day) {
                $businessHour = BusinessHour::updateOrCreate(
                    [
                        'tenant_id' => tenant('id'),
                        'day_of_week' => $day['day_of_week'],
                    ],
                    [
                        'is_open' => $day['is_open'],
                        'start_time' => $day['is_open']
                            ? $day['start_time']
                            : null,
                        'end_time' => $day['is_open']
                            ? $day['end_time']
                            : null,
                    ],
                );

                $businessHour->breaks()->delete();

                if ($day['is_open'] && !empty($day['breaks'])) {
                    $businessHour->breaks()->createMany(
                        $day['breaks']
                    );
                }
            }
        });

        return redirect()->back()->with(
            'success',
            'Horários da barbearia salvos com sucesso.'
        );
    }

    public function updateBarberHours(
        Request $request,
        User $user
    ) {
        abort_unless(
            tenant()->users()->whereKey($user->id)->exists(),
            404
        );
        

        $validated = $request->validate([
            'days' => ['required', 'array'],
            'days.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'days.*.is_working' => ['required', 'boolean'],
            'days.*.start_time' => ['nullable'],
            'days.*.end_time' => ['nullable'],
            'days.*.breaks' => ['array'],
            'days.*.breaks.*.start_time' => ['required'],
            'days.*.breaks.*.end_time' => ['required'],
        ]);

        

        DB::transaction(function () use ($validated, $user) {
            foreach ($validated['days'] as $day) {
                $workingHour = BarberWorkingHour::updateOrCreate(
                    [
                        'tenant_id' => tenant('id'),
                        'user_id' => $user->id,
                        'day_of_week' => $day['day_of_week'],
                    ],
                    [
                        'is_working' => $day['is_working'],
                        'start_time' => $day['is_working']
                            ? $day['start_time']
                            : null,
                        'end_time' => $day['is_working']
                            ? $day['end_time']
                            : null,
                    ],
                );

                $workingHour->breaks()->delete();

                if ($day['is_working'] && !empty($day['breaks'])) {
                    $workingHour->breaks()->createMany(
                        $day['breaks']
                    );
                }
            }
        });

        return redirect()->back()->with(
            'success',
            'Horários do barbeiro atualizados com sucesso.'
        );
    }
}
