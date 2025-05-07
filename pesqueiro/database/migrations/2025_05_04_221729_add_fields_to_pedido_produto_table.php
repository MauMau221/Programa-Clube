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
            // Verifica se a coluna já existe antes de adicionar
            if (!Schema::hasColumn('pedido_produto', 'valor_unitario')) {
                $table->decimal('valor_unitario', 10, 2)->nullable();
            }
            
            if (!Schema::hasColumn('pedido_produto', 'valor_total')) {
                $table->decimal('valor_total', 10, 2)->nullable();
            }
            
            // Garante que a coluna observacao existe
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
        Schema::table('pedido_produto', function (Blueprint $table) {
            $table->dropColumn(['valor_unitario', 'valor_total']);
        });
    }
};
