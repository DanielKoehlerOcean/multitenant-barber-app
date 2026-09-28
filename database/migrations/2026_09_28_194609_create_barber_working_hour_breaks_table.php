<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barber_working_hour_breaks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('barber_working_hour_id')
                ->constrained('barber_working_hours')
                ->cascadeOnDelete();

            $table->time('start_time');
            $table->time('end_time');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barber_working_hour_breaks');
    }
};