<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modificando a coluna para aceitar o novo valor 'cancelado'
        DB::statement("ALTER TABLE pedidos MODIFY COLUMN status ENUM('pedido_iniciado', 'pendente', 'entregue', 'cancelado')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertendo para os valores originais
        DB::statement("ALTER TABLE pedidos MODIFY COLUMN status ENUM('pedido_iniciado', 'pendente', 'entregue')");
    }
}; 