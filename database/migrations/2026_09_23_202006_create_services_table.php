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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('name');
            $table->decimal('value', 10, 2); // CORREÇÃO: Decimal para não haver erros com centavos
            $table->integer('duration'); // CORREÇÃO: Duração em minutos (ex: 45)
            $table->string('photo_path')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('original_name')->nullable();
            $table->string('file_size')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
