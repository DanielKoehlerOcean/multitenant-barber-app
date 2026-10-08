<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\PaymentType;

class EnsurePaymentTypes
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        $paymentTypes = ['local','pix', 'credito', 'debito', 'dinheiro'];

        foreach ($paymentTypes as $paymentType) {
            PaymentType::firstOrCreate(['type' => $paymentType]);
        }
        
        return $next($request);
    }
}
