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
        // Estoque Movimentações
        Schema::create('estoque_movimentacoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produto_id')->constrained()->onDelete('cascade');
            $table->string('tipo', 20); // entrada, saida
            $table->integer('quantidade');
            $table->integer('quantidade_anterior');
            $table->integer('quantidade_atual');
            $table->text('motivo')->nullable();
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->string('usuario_nome')->nullable();
            $table->timestamps();
        });

        // Estoque Saldos
        Schema::create('estoque_saldos', function (Blueprint $table) {
            $table->foreignId('produto_id')->primary();
            $table->integer('quantidade')->default(0);
            $table->timestamps();
            
            $table->foreign('produto_id')->references('id')->on('produtos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estoque_saldos');
        Schema::dropIfExists('estoque_movimentacoes');
    }
}; 