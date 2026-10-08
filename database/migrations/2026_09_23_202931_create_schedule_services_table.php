<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('schedule_service', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained('schedules')->cascadeOnDelete();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->decimal('value', 10, 2); // Salva o valor exato no dia do agendamento
            $table->integer('duration'); // Salva os minutos no dia do agendamento
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_services');
    }
};
