<?php

namespace App\Services;

use App\Models\Produto;

class ProdutoService
{

    public function criarProduto(array $dados)
    {
        // Verifica se a categoria existe antes de tentar criar o produto
        if (!\App\Models\Categoria::where('id', $dados['categoria_id'])->exists()) {
            return response()->json([
                'message' => 'A categoria informada não existe',
                'errors' => [
                    'categoria_id' => ['A categoria informada não existe']
                ]
            ], 422);
        }

        $produto = Produto::create([
            "nome" => $dados['nome'],
            "preco" => $dados['preco'],
            "status" => $dados['status'],
            "observacao" => $dados['observacao'],
            "categoria_id" => $dados['categoria_id']
        ]);

        return $produto;
    }


    public function buscarProduto(int $produtoId)
    {
        $produto = Produto::with('categoria')->findOrFail($produtoId);
        
        // Adicionar o campo quantidade_estoque à resposta
        $produto->quantidade_estoque = $produto->estoque_atual;
        
        return response()->json($produto, 200);  
    }

    public function editarProduto(array $dados, int $produtoId)
    {
        $produto = Produto::findOrFail($produtoId);
        $produto->update($dados);
        return response()->json($produto, 200);
    }

    public function deletarProduto(int $produtoId)
    {
        $produto = Produto::findOrFail($produtoId);
        $produto->delete();
        return response()->json([
            'message' => 'Produto deletado com sucesso'
        ], 200);
    }

    public function atualizarEstoque(int $produtoId, int $quantidade)
    {
        $produto = Produto::findOrFail($produtoId);
        $produto->estoque = $quantidade;
        $produto->save();

        return response()->json([
            'message' => 'Estoque atualizado com sucesso',
            'produto' => $produto
        ], 200);
    }

    public function buscarPorCategoria(int $categoriaId)
    {
        $produtos = Produto::where('categoria_id', $categoriaId)
            ->with('categoria')
            ->get();

        return response()->json($produtos, 200);
    }
}
