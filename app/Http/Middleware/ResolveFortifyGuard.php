<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveFortifyGuard
{
    public function handle(Request $request, Closure $next): Response
    {
        $isCentralDomain = in_array(
            $request->getHost(),
            config('tenancy.central_domains', []),
            true
        );

        config([
            'fortify.guard' => $isCentralDomain ? 'central' : 'web',
        ]);

        // Cadastro público somente no Core.

        return $next($request);
    }
}