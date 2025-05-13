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
        Schema::table('pedido_produto', function (Blueprint $table) {
            if (!Schema::hasColumn('pedido_produto', 'pedido_id')) {
                $table->foreignId('pedido_id')->constrained('pedidos')->onDelete('cascade');
            }
            
            if (!Schema::hasColumn('pedido_produto', 'produto_id')) {
                $table->foreignId('produto_id')->constrained('produtos')->onDelete('restrict');
            }
            
            if (!Schema::hasColumn('pedido_produto', 'quantidade')) {
                $table->unsignedInteger('quantidade');
            }
            
            if (!Schema::hasColumn('pedido_produto', 'valor_unitario')) {
                $table->decimal('valor_unitario', 10, 2)->nullable();
            }
            
            if (!Schema::hasColumn('pedido_produto', 'valor_total')) {
                $table->decimal('valor_total', 10, 2)->nullable();
            }
            
            if (!Schema::hasColumn('pedido_produto', 'observacao')) {
                $table->string('observacao')->nullable();
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
