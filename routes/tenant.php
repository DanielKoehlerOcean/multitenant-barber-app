<?php

declare(strict_types=1);

use App\Http\Controllers\BarberController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\OperationController;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\EnsureTenantMembership;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/

Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
    EnsureTenantMembership::class,
])->group(function () {

    Route::middleware(['auth:web', 'verified'])->group(function () {

        Route::inertia('dashboard', 'dashboard')->name('dashboard');
        Route::get('/schedules', [ScheduleController::class, 'index'])->name('schedules.index');

        Route::middleware(['role:owner'])->group(function(){
            Route::get('/operation', [OperationController::class, 'index'])->name('operation.index');
            Route::put('/operation/business-hour', [OperationController::class, 'updateBusinessHours'])->name('update.business-hour');
            Route::put('/operation/barber-hour/{user}', [OperationController::class, 'updateBarberHours'])->name('update.barber-hour');

            Route::resource('barbers', BarberController::class);

            Route::resource('services', ServiceController::class);
            Route::get('/services/{service}/photo', [ServiceController::class, 'photo'])->name('services.photo');
        });

        Route::middleware(['role:client'])->group(function(){
            Route::get('/schedules/create', [ScheduleController::class, 'create']);
            Route::post('/schedules/store', [ScheduleController::class, 'store']);
            Route::delete('/schedules/destroy/{id}', [ScheduleController::class, 'destroy']);
            Route::get('/schedules/availability', [ScheduleController::class, 'availability'])->name('schedules.availability');
        });
    });
});
