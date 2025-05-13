<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Primeiro, verificar o tipo atual do ENUM usando SQL nativo
        $type = DB::select("SHOW COLUMNS FROM pedidos WHERE Field = 'status'")[0]->Type;
        
        // Verificar se os valores já estão presentes no enum
        if (!str_contains($type, 'em preparo') && !str_contains($type, 'pronto')) {
            // Adicionando os novos valores ao enum
            DB::statement("ALTER TABLE pedidos MODIFY COLUMN status ENUM('pedido_iniciado', 'pendente', 'em preparo', 'pronto', 'entregue', 'cancelado') DEFAULT 'pedido_iniciado'");
            
            // Log para confirmar a alteração
            Log::info('Status "em preparo" e "pronto" adicionados ao enum da tabela pedidos');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverter para os valores originais (não podemos remover valores que já estão em uso)
        // Mas mantemos os valores por segurança
        DB::statement("ALTER TABLE pedidos MODIFY COLUMN status ENUM('pedido_iniciado', 'pendente', 'entregue', 'cancelado') DEFAULT 'pedido_iniciado'");
    }
};
