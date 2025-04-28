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
            $table->decimal('total', 8, 2);  // (8) numero de digitos (2) quantidade de numeros após o ponto
            $table->decimal('mesa', 8, 2)->nullable();
            $table->enum('status', ['paga', 'aberta']);
            $table->text('observacao')->nullable();
            $table->timestamps();
            $table->string('cliente');
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
