<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Produto;
use App\Models\EstoqueSaldo;
use Illuminate\Support\Facades\DB;

class EstoqueSaldosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Iniciando preenchimento da tabela de saldos de estoque...');
        
        // Buscar todos os produtos
        $produtos = Produto::all();
        
        foreach ($produtos as $produto) {
            $this->command->info("Processando produto {$produto->id}: {$produto->nome}");
            
            // Calcular o saldo atual do produto
            $entradas = DB::table('estoque_movimentacoes')
                ->where('produto_id', $produto->id)
                ->where('tipo', 'entrada')
                ->sum('quantidade');
                
            $saidas = DB::table('estoque_movimentacoes')
                ->where('produto_id', $produto->id)
                ->where('tipo', 'saida')
                ->sum('quantidade');
                
            $saldoAtual = $entradas - $saidas;
            
            // Inserir na tabela de saldos
            DB::table('estoque_saldos')->insert([
                'produto_id' => $produto->id,
                'quantidade' => $saldoAtual,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            $this->command->info("Saldo para o produto {$produto->nome}: {$saldoAtual}");
        }
        
        $this->command->info('Preenchimento da tabela de saldos de estoque concluído!');
    }
} 