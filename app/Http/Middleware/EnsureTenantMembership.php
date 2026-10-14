<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantMembership
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('web')->user();
        $tenant = tenancy()->tenant;

        if (
            ! $user ||
            ! $tenant ||
            ! $user->tenants()
                ->where('tenants.id', $tenant->id)
                ->exists()
        ) {
            abort(403);
        }

        return $next($request);
    }
}