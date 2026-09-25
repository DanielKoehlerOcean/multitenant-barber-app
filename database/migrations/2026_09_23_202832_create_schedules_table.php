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
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreignId('payment_types_id')->constrained('payment_types'); 
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete(); // Cliente atrelado
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Barbeiro responsável
            $table->enum('status', ['pendente', 'concluido', 'cancelado'])->default('pendente');
            $table->dateTime('started_at');
            $table->dateTime('end_at');
            $table->decimal('paid_value', 10, 2)->nullable(); // CORREÇÃO: Decimal
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
