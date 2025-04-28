<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProdutoRequest;
use App\Models\Produto;
use App\Services\ProdutoService;
use Illuminate\Http\Request;

class ProdutoController extends Controller
{
    protected $produtoService;

    public function __construct(ProdutoService $produtoService)
    {
        $this->produtoService = $produtoService;
    }

    public function index()
    {
        return Produto::with('categoria')->get();
    }

    public function store(ProdutoRequest $request)
    {
        $dados = $request->validated();
        $produto = $this->produtoService->criarProduto($dados);
        return $produto;
    }

    public function show(string $produtoId)
    {
        $produto = $this->produtoService->buscarProduto($produtoId);
        return $produto;
    }

    public function update(ProdutoRequest $request, string $produtoId)
    {
        $dados = $request->validated();
        $produto = $this->produtoService->editarProduto($dados, $produtoId);
        return $produto;
    }

    public function destroy(string $produtoId)
    {
        $produto = $this->produtoService->deletarProduto($produtoId);
        return $produto;
    }
}
