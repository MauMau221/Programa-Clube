<?php

namespace App\Services;

use App\Models\Produto;

class ProdutoService
{

    public function criarProduto(array $dados)
    {
        $produto = Produto::create([
            "nome" => $dados['nome'],
            "preco" => $dados['preco'],
            "status" => $dados['status'],
            "observacao" => $dados['observacao'],
            "categoria_id" => $dados['categoria_id']
        ]);

        return response()->json($produto, 201);
    }


    public function buscarProduto(int $produtoId)
    {
        $produto = Produto::with('categoria')->findOrFail($produtoId);
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
        return response()->json(null, 204);
    }
}
