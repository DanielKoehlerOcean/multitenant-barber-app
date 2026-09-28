<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_hour_breaks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('business_hour_id')
                ->constrained('business_hours')
                ->cascadeOnDelete();

            $table->time('start_time');
            $table->time('end_time');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_hour_breaks');
    }
};