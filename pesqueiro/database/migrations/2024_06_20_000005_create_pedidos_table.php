<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comanda_id')->constrained('comandas')->onDelete('cascade');
            $table->decimal('total', 8, 2);
            $table->enum('status', ['pedido_iniciado', 'pendente', 'entregue']);
            $table->enum('prioridade', ['normal', 'urgente']);
            $table->timestamp('pedido_aberto')->nullable();
            $table->timestamp('pedido_fechado')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};
