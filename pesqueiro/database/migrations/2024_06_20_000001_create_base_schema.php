<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Migration consolidada para criar todas as tabelas do sistema
     */
    public function up(): void
    {
        // Adicionar campo role na tabela de usuários
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['gerente', 'garcom', 'cozinheiro'])->default('gerente');
        });

        // Categorias
        Schema::create('categorias', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->enum('status', ['disponivel', 'indisponivel'])->default('disponivel');
            $table->timestamps();
        });

        // Produtos
        Schema::create('produtos', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->decimal('preco', 8, 2);
            $table->enum('status', ['disponivel', 'indisponivel'])->default('disponivel');
            $table->text('observacao')->nullable();
            $table->foreignId('categoria_id')->constrained()->onDelete('cascade');
            $table->integer('estoque_minimo')->default(5);
            $table->timestamps();
        });

        // Comandas
        Schema::create('comandas', function (Blueprint $table) {
            $table->id();
            $table->decimal('total', 8, 2)->default(0);
            $table->string('mesa');
            $table->enum('status', ['paga', 'aberta', 'cancelada'])->default('aberta');
            $table->text('observacao')->nullable();
            $table->string('cliente');
            $table->timestamps();
        });

        // Pedidos
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comanda_id')->constrained('comandas')->onDelete('cascade');
            $table->decimal('total', 8, 2)->default(0);
            $table->enum('status', ['pedido_iniciado', 'pendente', 'entregue', 'cancelado'])->default('pedido_iniciado');
            $table->enum('prioridade', ['normal', 'urgente'])->default('normal');
            $table->timestamp('pedido_aberto')->nullable();
            $table->timestamp('pedido_fechado')->nullable();
            $table->timestamps();
        });

        // Pedido Produtos (pivot)
        Schema::create('pedido_produto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained()->onDelete('cascade');
            $table->foreignId('produto_id')->constrained()->onDelete('cascade');
            $table->integer('quantidade');
            $table->text('observacao')->nullable();
            $table->timestamps();
        });

        // Estoque Movimentações
        Schema::create('estoque_movimentacoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produto_id')->constrained()->onDelete('cascade');
            $table->enum('tipo', ['entrada', 'saida']);
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
     * Reverter todas as operações
     */
    public function down(): void
    {
        Schema::dropIfExists('estoque_saldos');
        Schema::dropIfExists('estoque_movimentacoes');
        Schema::dropIfExists('pedido_produto');
        Schema::dropIfExists('pedidos');
        Schema::dropIfExists('comandas');
        Schema::dropIfExists('produtos');
        Schema::dropIfExists('categorias');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
}; 