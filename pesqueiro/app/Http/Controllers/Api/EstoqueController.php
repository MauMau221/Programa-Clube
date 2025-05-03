<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produto;
use App\Services\EstoqueService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EstoqueController extends Controller
{
    protected $estoqueService;

    public function __construct(EstoqueService $estoqueService)
    {
        $this->estoqueService = $estoqueService;
    }

    /**
     * Adiciona quantidade ao estoque
     *
     * @param Request $request
     * @param int $produtoId
     * @return JsonResponse
     */
    public function adicionar(Request $request, int $produtoId): JsonResponse
    {
        try {
            // Verifica se o produto existe
            if (!Produto::where('id', $produtoId)->exists()) {
                return response()->json([
                    'message' => 'Produto não encontrado'
                ], 404);
            }
            
            $produto = Produto::findOrFail($produtoId);
            
            $request->validate([
                'quantidade' => 'required|integer|min:1',
                'motivo' => 'required|string|max:255'
            ]);

            $movimentacao = $this->estoqueService->adicionarEstoque(
                $produto,
                $request->quantidade,
                $request->motivo
            );

            return response()->json([
                'message' => 'Estoque adicionado com sucesso',
                'movimentacao' => $movimentacao,
                'estoque_atual' => $this->estoqueService->getSaldoAtual($produto)
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dados inválidos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao adicionar estoque: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove quantidade do estoque
     *
     * @param Request $request
     * @param int $produtoId
     * @return JsonResponse
     */
    public function remover(Request $request, int $produtoId): JsonResponse
    {
        try {
            // Verifica se o produto existe
            if (!Produto::where('id', $produtoId)->exists()) {
                return response()->json([
                    'message' => 'Produto não encontrado'
                ], 404);
            }
            
            $produto = Produto::findOrFail($produtoId);
            
            $request->validate([
                'quantidade' => 'required|integer|min:1',
                'motivo' => 'required|string|max:255'
            ]);

            $resultado = $this->estoqueService->removerEstoqueComAlerta(
                $produto,
                $request->quantidade,
                $request->motivo
            );

            $response = [
                'message' => 'Estoque removido com sucesso',
                'movimentacao' => $resultado['movimentacao'],
                'estoque_atual' => $resultado['estoque_atual']
            ];
            
            // Adiciona alerta se existir
            if (isset($resultado['alerta'])) {
                $response['alerta'] = $resultado['alerta'];
            }

            return response()->json($response, 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dados inválidos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao remover estoque: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtém o histórico de movimentações
     *
     * @param int $produtoId
     * @return JsonResponse
     */
    public function historico(int $produtoId): JsonResponse
    {
        try {
            // Verifica se o produto existe
            if (!Produto::where('id', $produtoId)->exists()) {
                return response()->json([
                    'message' => 'Produto não encontrado'
                ], 404);
            }
            
            $produto = Produto::findOrFail($produtoId);
            $historico = $this->estoqueService->getHistorico($produto);

            return response()->json([
                'historico' => $historico,
                'estoque_atual' => $this->estoqueService->getSaldoAtual($produto)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao obter histórico: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Lista produtos com estoque baixo
     *
     * @return JsonResponse
     */
    public function produtosComEstoqueBaixo(): JsonResponse
    {
        try {
            $produtos = Produto::all();
            $produtosBaixos = [];
            
            foreach ($produtos as $produto) {
                if ($this->estoqueService->verificarEstoqueBaixo($produto)) {
                    $produtosBaixos[] = [
                        'produto' => $produto,
                        'estoque_atual' => $produto->estoque_atual,
                        'estoque_minimo' => $produto->estoque_minimo,
                        'alerta' => $this->estoqueService->gerarAlertaEstoqueBaixo($produto)
                    ];
                }
            }
            
            return response()->json([
                'produtos_estoque_baixo' => $produtosBaixos,
                'total' => count($produtosBaixos)
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao listar produtos com estoque baixo: ' . $e->getMessage()
            ], 500);
        }
    }
} 