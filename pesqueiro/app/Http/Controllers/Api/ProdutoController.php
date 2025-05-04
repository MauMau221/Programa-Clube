<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProdutoRequest;
use App\Models\Produto;
use App\Services\ProdutoService;
use Illuminate\Http\Request;
use App\Services\EstoqueService;

class ProdutoController extends Controller
{
    protected $produtoService;

    public function __construct(ProdutoService $produtoService)
    {
        $this->produtoService = $produtoService;
    }

    public function index()
    {
        $produtos = Produto::with('categoria')->get();
        
        // Adicionar o campo quantidade_estoque a cada produto
        foreach ($produtos as $produto) {
            $produto->quantidade_estoque = $produto->estoque_atual;
        }
        
        return response()->json($produtos, 200);
    }

    public function store(ProdutoRequest $request)
    {
        try {
        $dados = $request->validated();
            $resultado = $this->produtoService->criarProduto($dados);
            
            if ($resultado instanceof \Illuminate\Http\JsonResponse) {
                return $resultado;
            }
            
            return response()->json($resultado, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao criar produto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $produtoId)
    {
        $produto = $this->produtoService->buscarProduto($produtoId);
        return response()->json($produto, 200);
    }

    public function update(ProdutoRequest $request, string $produtoId)
    {
        $dados = $request->validated();
        $produto = $this->produtoService->editarProduto($dados, $produtoId);
        return response()->json($produto, 200);
    }

    public function destroy(string $produtoId)
    {
        return $this->produtoService->deletarProduto($produtoId);
    }

    public function atualizarEstoque(Request $request, string $produtoId)
    {
        $request->validate([
            'quantidade' => 'required|integer|min:0'
        ]);

        return $this->produtoService->atualizarEstoque($produtoId, $request->quantidade);
    }

    public function atualizarDisponibilidade(Request $request, string $produtoId)
    {
        $request->validate([
            'status' => 'required|in:disponivel,indisponivel'
        ]);
        
        $produto = Produto::findOrFail($produtoId);
        $produto->status = $request->status;
        $produto->save();
        
        return response()->json([
            'message' => 'Disponibilidade atualizada com sucesso',
            'produto' => $produto
        ], 200);
    }

    public function porCategoria(string $categoriaId)
    {
        return $this->produtoService->buscarPorCategoria($categoriaId);
    }

    public function atualizarEstoqueMinimo(Request $request, string $produtoId)
    {
        $request->validate([
            'estoque_minimo' => 'required|integer|min:1'
        ]);
        
        $produto = Produto::findOrFail($produtoId);
        $produto->estoque_minimo = $request->estoque_minimo;
        $produto->save();
        
        // Verifica se há alerta de estoque baixo após atualização
        $estoqueService = app(EstoqueService::class);
        $alerta = $estoqueService->gerarAlertaEstoqueBaixo($produto);
        
        $response = [
            'message' => 'Estoque mínimo atualizado com sucesso',
            'produto' => $produto
        ];
        
        if ($alerta) {
            $response['alerta'] = $alerta;
        }
        
        return response()->json($response, 200);
    }
}
