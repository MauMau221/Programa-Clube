<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Produto;
use App\Models\User;
use App\Models\EstoqueMovimentacao;
use Illuminate\Support\Facades\DB;

class EstoqueMovimentacoesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Adicionando entradas iniciais de estoque...');
        
        // Obter um usuário (preferencialmente o admin)
        $usuario = User::where('role', 'gerente')->first();
        
        if (!$usuario) {
            $this->command->error('Nenhum usuário gerente encontrado! Executando AdminSeeder primeiro...');
            $this->call(AdminSeeder::class);
            $usuario = User::where('role', 'gerente')->first();
        }
        
        // Buscar todos os produtos
        $produtos = Produto::all();
        
        foreach ($produtos as $produto) {
            // Verificar se já existe movimentação para este produto
            $existeMovimentacao = EstoqueMovimentacao::where('produto_id', $produto->id)->exists();
            
            if (!$existeMovimentacao) {
                $this->command->info("Adicionando estoque inicial para o produto: {$produto->nome}");
                
                // Adicionar uma quantidade aleatória entre o estoque mínimo e o dobro dele
                $quantidade = rand($produto->estoque_minimo, $produto->estoque_minimo * 2);
                
                // Registrar a entrada de estoque
                DB::table('estoque_movimentacoes')->insert([
                    'produto_id' => $produto->id,
                    'quantidade' => $quantidade,
                    'quantidade_anterior' => 0,
                    'quantidade_atual' => $quantidade,
                    'tipo' => 'entrada',
                    'motivo' => 'Estoque inicial',
                    'usuario_id' => $usuario->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                $this->command->info("Adicionado {$quantidade} unidades ao estoque de {$produto->nome}");
            } else {
                $this->command->info("Produto {$produto->nome} já possui movimentações de estoque. Pulando...");
            }
        }
        
        $this->command->info('Movimentações iniciais de estoque concluídas!');
    }
} 