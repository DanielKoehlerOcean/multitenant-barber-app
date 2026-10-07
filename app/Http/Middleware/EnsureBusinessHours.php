<?php

namespace App\Http\Middleware;

use App\Models\BusinessHour;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBusinessHours
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = tenant();

        if ($tenant) {
            $hasBusinessHours = BusinessHour::query()
                ->where('tenant_id', $tenant->id)
                ->exists();

            if (! $hasBusinessHours) {
                $this->createDefaultBusinessHours($tenant->id);
            }
        }

        return $next($request);
    }

    private function createDefaultBusinessHours(string $tenantId): void
    {
        $days = [
            0 => false, // Domingo
            1 => true,  // Segunda
            2 => true,  // Terça
            3 => true,  // Quarta
            4 => true,  // Quinta
            5 => true,  // Sexta
            6 => true,  // Sábado
        ];

        foreach ($days as $dayOfWeek => $isOpen) {
            BusinessHour::updateOrCreate(
                [
                    'tenant_id' => $tenantId,
                    'day_of_week' => $dayOfWeek,
                ],
                [
                    'is_open' => $isOpen,
                    'start_time' => $isOpen ? '09:00:00' : null,
                    'end_time' => $isOpen ? '18:00:00' : null,
                ],
            );
        }
    }
}