<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TenantController;
use Illuminate\Support\Facades\Route;

foreach (config('tenancy.central_domains') as $domain) {
    Route::domain($domain)->group(function () {
        Route::inertia('/', 'welcome')->name('central.home');

        Route::middleware(['auth', 'verified'])->group(function () {
            Route::get('/dashboard', [DashboardController::class, 'index'])->name('central.dashboard');
            Route::get('/tenants', [TenantController::class, 'index'])->name('central.tenants');
            Route::get('/create-tenant', [TenantController::class, 'create'])->name('central.create-tenant');
        });
    });
}

require __DIR__.'/settings.php';

