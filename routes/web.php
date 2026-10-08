<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TenantController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\OperationController;

foreach (config('tenancy.central_domains') as $domain) {
    Route::domain($domain)->group(function () {
        Route::inertia('/', 'welcome')->name('central.home');

        Route::middleware(['auth', 'verified'])->group(function () {
            Route::get('/dashboard', [DashboardController::class, 'index'])->name('central.dashboard');
            Route::get('/tenants', [TenantController::class, 'index'])->name('central.tenants');
            Route::get('/create-tenant', [TenantController::class, 'create'])->name('central.create-tenant');

            Route::resource('services', ServiceController::class);
            Route::get('/services/{service}/photo', [ServiceController::class, 'photo'])->name('services.photo');
            
            Route::get('/schedules', [ScheduleController::class, 'index']);
            Route::get('/schedules/availability', [ScheduleController::class, 'availability'])->name('schedules.availability');

            Route::get('/operation', [OperationController::class, 'index'])->name('operation');
            Route::put('/operation/business-hour', [OperationController::class, 'updateBusinessHours'])->name('update.business-hour');
            Route::put('/operation/barber-hour/{user}', [OperationController::class, 'updateBarberHours'])->name('update.barber-hour');
        });
    });
}

require __DIR__.'/settings.php';

