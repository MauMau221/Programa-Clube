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
        Schema::create('comandas', function (Blueprint $table) {
            $table->id();
            $table->decimal('total', 8, 2)->default(0);
            $table->string('mesa');
            $table->string('status', 20)->default('aberta'); // Aumentado para 20 caracteres
            $table->string('metodo_pagamento')->nullable();
            $table->unsignedInteger('pessoas')->nullable();
            $table->text('observacao')->nullable();
            $table->string('cliente')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comandas');
    }
}; 