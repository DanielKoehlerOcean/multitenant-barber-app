<?php

use Illuminate\Support\Facades\Route;



foreach (config('tenancy.central_domains') as $domain) {
    Route::domain($domain)->group(function () {
        Route::inertia('/', 'welcome')->name('central.home');

        Route::middleware(['auth', 'verified'])->group(function () {
            Route::inertia('dashboard', 'dashboard')->name('central.dashboard');
        });
    });
}

require __DIR__.'/settings.php';

