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
        Schema::table('pedidos', function (Blueprint $table) {
            if (!Schema::hasColumn('pedidos', 'comanda_id')) {
                $table->foreignId('comanda_id')->constrained('comandas')->onDelete('cascade');
            }
            
            if (!Schema::hasColumn('pedidos', 'total')) {
                $table->decimal('total', 8, 2)->default(0);
            }
            
            if (!Schema::hasColumn('pedidos', 'status')) {
                $table->string('status', 20)->default('pendente');
            }
            
            if (!Schema::hasColumn('pedidos', 'prioridade')) {
                $table->string('prioridade', 20)->default('normal');
            }
            
            if (!Schema::hasColumn('pedidos', 'pedido_aberto')) {
                $table->timestamp('pedido_aberto')->nullable();
            }
            
            if (!Schema::hasColumn('pedidos', 'pedido_fechado')) {
                $table->timestamp('pedido_fechado')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Não fazemos nada no método down, pois essa migração é apenas para garantir
        // que as colunas existam.
    }
};
