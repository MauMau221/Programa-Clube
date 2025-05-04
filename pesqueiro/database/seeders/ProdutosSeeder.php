<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Produto;
use App\Models\Categoria;

class ProdutosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Criar categorias
        $categoriaBebidas = Categoria::firstOrCreate([
            'nome' => 'Bebidas',
            'status' => 'disponivel'
        ]);

        $categoriaLanches = Categoria::firstOrCreate([
            'nome' => 'Lanches',
            'status' => 'disponivel'
        ]);

        $categoriaPeixes = Categoria::firstOrCreate([
            'nome' => 'Peixes',
            'status' => 'disponivel'
        ]);

        // Criar produtos
        $produtos = [
            // Bebidas
            [
                'nome' => 'Refrigerante Lata',
                'preco' => 5.00,
                'status' => 'disponivel',
                'observacao' => 'Coca-Cola, Guaraná, Sprite',
                'categoria_id' => $categoriaBebidas->id,
                'estoque_minimo' => 10
            ],
            [
                'nome' => 'Cerveja Long Neck',
                'preco' => 8.50,
                'status' => 'disponivel',
                'observacao' => 'Heineken, Budweiser, Stella Artois',
                'categoria_id' => $categoriaBebidas->id,
                'estoque_minimo' => 10
            ],
            [
                'nome' => 'Água Mineral',
                'preco' => 3.50,
                'status' => 'disponivel',
                'observacao' => 'Com gás ou sem gás',
                'categoria_id' => $categoriaBebidas->id,
                'estoque_minimo' => 10
            ],
            
            // Lanches
            [
                'nome' => 'Porção de Batata Frita',
                'preco' => 25.00,
                'status' => 'disponivel',
                'observacao' => 'Serve 2 pessoas',
                'categoria_id' => $categoriaLanches->id,
                'estoque_minimo' => 5
            ],
            [
                'nome' => 'Isca de Peixe',
                'preco' => 35.00,
                'status' => 'disponivel',
                'observacao' => 'Acompanha molho tártaro',
                'categoria_id' => $categoriaLanches->id,
                'estoque_minimo' => 5
            ],
            
            // Peixes
            [
                'nome' => 'Tilápia Frita',
                'preco' => 45.00,
                'status' => 'disponivel',
                'observacao' => 'Acompanha arroz, feijão e salada',
                'categoria_id' => $categoriaPeixes->id,
                'estoque_minimo' => 5
            ],
            [
                'nome' => 'Pintado na Brasa',
                'preco' => 65.00,
                'status' => 'disponivel',
                'observacao' => 'Acompanha mandioca e vinagrete',
                'categoria_id' => $categoriaPeixes->id,
                'estoque_minimo' => 5
            ],
            [
                'nome' => 'Pacu Assado',
                'preco' => 55.00,
                'status' => 'disponivel',
                'observacao' => 'Serve 2 pessoas',
                'categoria_id' => $categoriaPeixes->id,
                'estoque_minimo' => 5
            ]
        ];

        foreach ($produtos as $produto) {
            Produto::firstOrCreate(
                ['nome' => $produto['nome']],
                $produto
            );
        }

        $this->command->info('Produtos adicionados com sucesso!');
    }
}
