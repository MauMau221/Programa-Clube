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
        Schema::create('comanda_pagamentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comanda_id')->constrained('comandas')->onDelete('cascade');
            $table->string('metodo_pagamento'); // dinheiro, credito, debito, pix, outro
            $table->decimal('valor', 10, 2);
            $table->enum('status', ['pendente', 'pago'])->default('pendente');
            $table->string('observacao')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comanda_pagamentos');
    }
}; 