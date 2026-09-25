<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CentralDomainRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, $role): Response
    {

        $user = $request->user();

        if ($user->hasRole($role)){ 
            return $next($request);
        }

        if($user->hasRole('tenant')){
            return redirect('central.create-tenant');
        }

        if($user->hasRole('admin')){
            return redirect('central.dashboard');
        }

        abort(403);
     
    }
}
