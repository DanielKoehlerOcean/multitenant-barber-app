<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantsRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {

        $user = $request->user();

        $role = $user->tenants()
            ->first()
            ?->pivot
            ?->role;        

        if(in_array($role, $roles)){
            return $next($request);
        }

        return redirect()->route('dashboard');
    }
}
