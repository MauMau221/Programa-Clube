<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PedidoRequest;
use App\Services\PedidoService;
use Illuminate\Http\Request;
use App\Models\Pedido;
use App\Models\Produto;
use App\Models\Comanda;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PedidoController extends Controller
{
    
    protected $pedidoService;

    public function __construct(PedidoService $pedidoService)
    {
        $this->pedidoService = $pedidoService;
    }


    public function commandorder(PedidoRequest $request, string $comandaId) //adicionando pedido á comanda
    {
        $dados = $request->validated();
        $comanda = $this->pedidoService->adicionarPedido($dados, $comandaId);
        return response()->json($comanda, 201);
    }

    public function updateStatus(Request $request, string $pedidoId)
    {
        $request->validate([
            'status' => 'required|in:pedido_iniciado,pendente,em preparo,pronto,entregue,cancelado'
        ]);

        // Encontrar o pedido
        $pedido = Pedido::findOrFail($pedidoId);
        
        // Atualizar o status como string
        $pedido->status = $request->status;
        $pedido->save();
        
        return response()->json([
            'message' => 'Status do pedido atualizado com sucesso',
            'pedido' => $pedido->load('produtos')
        ], 200);
    }

    /**
     * Atualiza o status de um pedido
     * Este método é chamado pela rota /api/pedido/{id}/status
     */
    public function atualizarStatus(Request $request, string $pedidoId)
    {
        $request->validate([
            'status' => 'required|in:pedido_iniciado,pendente,em preparo,pronto,entregue,cancelado'
        ]);

        // Encontrar o pedido
        $pedido = Pedido::findOrFail($pedidoId);
        
        // Atualizar o status como string
        $pedido->status = $request->status;
        $pedido->save();
        
        return response()->json([
            'message' => 'Status do pedido atualizado com sucesso',
            'pedido' => $pedido->load('produtos')
        ], 200);
    }

    public function index()
    {
        // Carregar pedidos com produtos e comanda, incluindo produtos com eager loading
        $pedidos = Pedido::with([
            'produtos' => function($query) {
                $query->select('produtos.id', 'nome', 'preco', 'status', 'categoria_id');
            },
            'comanda:id,mesa'
        ])->get();
        
        // Formatar os pedidos para incluir itens formatados
        $pedidosFormatados = $pedidos->map(function($pedido) {
            $itens = $pedido->produtos->map(function($produto) {
                // Valores numéricos garantidos
                $valorUnitario = floatval($produto->preco);
                $quantidade = intval($produto->pivot->quantidade);
                $valorTotal = $valorUnitario * $quantidade;
                
                return [
                    'id' => intval($produto->pivot->id),
                    'produto_id' => intval($produto->id),
                    'produto' => [
                        'id' => intval($produto->id),
                        'nome' => $produto->nome,
                        'preco' => $valorUnitario
                    ],
                    'quantidade' => $quantidade,
                    'valor_unitario' => $valorUnitario,
                    'valor_total' => $valorTotal,
                    'observacao' => $produto->pivot->observacao
                ];
            });
            
            // Montar pedido formatado
            $pedidoFormatado = [
                'id' => $pedido->id,
                'comanda_id' => $pedido->comanda_id,
                'mesa' => $pedido->comanda->mesa,
                'status' => $pedido->status,
                'itens' => $itens,
                'total' => floatval($pedido->total),
                'created_at' => $pedido->created_at,
                'updated_at' => $pedido->updated_at
            ];
            
            return $pedidoFormatado;
        });
        
        return response()->json($pedidosFormatados, 200);
    }

    public function show(string $id)
    {
        $pedido = Pedido::with(['produtos', 'comanda'])->findOrFail($id);
        return response()->json($pedido, 200);
    }
    
    public function update(PedidoRequest $request, string $id)
    {
        $dados = $request->validated();
        $pedido = $this->pedidoService->editarPedido($dados, $id);
        return response()->json($pedido, 200);
    }
    
    public function cancel(string $id)
    {
        $pedido = $this->pedidoService->cancelarPedido($id);
        return response()->json($pedido, 200);
    }
    
    public function byComanda(string $comandaId)
    {
        $pedidos = $this->pedidoService->buscarPorComanda($comandaId);
        return response()->json($pedidos, 200);
    }
    
    public function removeProduto(string $pedidoId, string $produtoId)
    {
        $result = $this->pedidoService->removerProduto($pedidoId, $produtoId);
        return response()->json($result, 200);
    }
    
    public function updateQuantidade(Request $request, string $pedidoId, string $produtoId)
    {
        $request->validate([
            'quantidade' => 'required|integer|min:1'
        ]);
        
        $result = $this->pedidoService->atualizarQuantidadeProduto(
            $pedidoId, 
            $produtoId, 
            $request->quantidade
        );
        
        return response()->json($result, 200);
    }

    /**
     * Adicionar um item à comanda (criar pedido ou adicionar produto a um pedido existente)
     */
    public function adicionarItem(Request $request, string $comandaId)
    {
        $request->validate([
            'produto_id' => 'required|exists:produtos,id',
            'quantidade' => 'required|integer|min:1',
            'observacao' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            // Verificar se a comanda existe e está aberta
            $comanda = Comanda::findOrFail($comandaId);
            if ($comanda->status !== 'aberta') {
                return response()->json([
                    'message' => 'Não é possível adicionar itens a uma comanda que não está aberta'
                ], 422);
            }

            // Buscar o produto para obter o preço
            $produto = Produto::findOrFail($request->produto_id);
            
            // Verificar se o produto está disponível
            if ($produto->status !== 'disponivel') {
                return response()->json([
                    'message' => 'Produto indisponível'
                ], 422);
            }

            // Verificar se já existe um pedido em aberto para esta comanda
            $pedido = Pedido::where('comanda_id', $comandaId)
                ->where('status', 'pedido_iniciado')
                ->first();

            // Se não existir, criar um novo pedido
            if (!$pedido) {
                $pedido = new Pedido();
                $pedido->comanda_id = $comandaId;
                $pedido->total = 0;
                $pedido->status = 'pedido_iniciado';
                $pedido->prioridade = 'normal';
                $pedido->pedido_aberto = now();
                $pedido->save();
            }

            // Adicionar o produto ao pedido
            $valorTotal = $produto->preco * $request->quantidade;
            
            $itemId = DB::table('pedido_produto')->insertGetId([
                'pedido_id' => $pedido->id,
                'produto_id' => $produto->id,
                'quantidade' => $request->quantidade,
                'observacao' => $request->observacao,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            // Atualizar o total do pedido
            $pedido->total += $valorTotal;
            $pedido->save();
            
            // Atualizar o total da comanda
            $comanda->total += $valorTotal;
            $comanda->save();
            
            // Preparar a resposta
            $item = [
                'id' => $itemId,
                'comanda_id' => $comanda->id,
                'produto_id' => $produto->id,
                'produto' => $produto,
                'quantidade' => $request->quantidade,
                'valor_unitario' => $produto->preco,
                'valor_total' => $valorTotal,
                'observacao' => $request->observacao,
                'created_at' => now(),
                'updated_at' => now()
            ];
            
            DB::commit();
            
            return response()->json($item, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao adicionar item à comanda',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Atualizar um item da comanda
     */
    public function atualizarItem(Request $request, string $comandaId, string $itemId)
    {
        $request->validate([
            'quantidade' => 'required|integer|min:1',
            'observacao' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            // Verificar se a comanda existe e está aberta
            $comanda = Comanda::findOrFail($comandaId);
            if ($comanda->status !== 'aberta') {
                return response()->json([
                    'message' => 'Não é possível atualizar itens de uma comanda que não está aberta'
                ], 422);
            }

            // Buscar o item na tabela pivot
            $pivotItem = DB::table('pedido_produto')
                ->join('pedidos', 'pedido_produto.pedido_id', '=', 'pedidos.id')
                ->where('pedido_produto.id', $itemId)
                ->where('pedidos.comanda_id', $comandaId)
                ->select('pedido_produto.*', 'pedidos.id as pedido_id')
                ->first();

            if (!$pivotItem) {
                return response()->json([
                    'message' => 'Item não encontrado'
                ], 404);
            }

            // Buscar o produto para obter o preço
            $produto = Produto::findOrFail($pivotItem->produto_id);
            
            // Calcular a diferença de valor
            $valorAnterior = $produto->preco * $pivotItem->quantidade;
            $valorNovo = $produto->preco * $request->quantidade;
            $diferenca = $valorNovo - $valorAnterior;
            
            // Atualizar o item
            DB::table('pedido_produto')
                ->where('id', $itemId)
                ->update([
                    'quantidade' => $request->quantidade,
                    'observacao' => $request->observacao,
                    'updated_at' => now()
                ]);
                
            // Atualizar o total do pedido
            $pedido = Pedido::findOrFail($pivotItem->pedido_id);
            $pedido->total += $diferenca;
            $pedido->save();
            
            // Atualizar o total da comanda
            $comanda->total += $diferenca;
            $comanda->save();
            
            // Preparar a resposta
            $item = [
                'id' => $itemId,
                'comanda_id' => $comanda->id,
                'produto_id' => $produto->id,
                'produto' => $produto,
                'quantidade' => $request->quantidade,
                'valor_unitario' => $produto->preco,
                'valor_total' => $produto->preco * $request->quantidade,
                'observacao' => $request->observacao,
                'updated_at' => now()
            ];
            
            DB::commit();
            
            return response()->json($item, 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao atualizar item da comanda',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remover um item da comanda
     */
    public function removerItem(string $comandaId, string $itemId)
    {
        try {
            DB::beginTransaction();

            // Verificar se a comanda existe e está aberta
            $comanda = Comanda::findOrFail($comandaId);
            if ($comanda->status !== 'aberta') {
                return response()->json([
                    'message' => 'Não é possível remover itens de uma comanda que não está aberta'
                ], 422);
            }

            // Buscar o item na tabela pivot
            $pivotItem = DB::table('pedido_produto')
                ->join('pedidos', 'pedido_produto.pedido_id', '=', 'pedidos.id')
                ->where('pedido_produto.id', $itemId)
                ->where('pedidos.comanda_id', $comandaId)
                ->select('pedido_produto.*', 'pedidos.id as pedido_id')
                ->first();

            if (!$pivotItem) {
                return response()->json([
                    'message' => 'Item não encontrado'
                ], 404);
            }

            // Buscar o produto para obter o preço
            $produto = Produto::findOrFail($pivotItem->produto_id);
            
            // Calcular o valor do item
            $valorItem = $produto->preco * $pivotItem->quantidade;
            
            // Remover o item
            DB::table('pedido_produto')->where('id', $itemId)->delete();
                
            // Atualizar o total do pedido
            $pedido = Pedido::findOrFail($pivotItem->pedido_id);
            $pedido->total -= $valorItem;
            $pedido->save();
            
            // Atualizar o total da comanda
            $comanda->total -= $valorItem;
            $comanda->save();
            
            // Se não houver mais itens no pedido, excluir o pedido
            $itensRestantes = DB::table('pedido_produto')->where('pedido_id', $pedido->id)->count();
            if ($itensRestantes === 0) {
                $pedido->delete();
            }
            
            DB::commit();
            
            return response()->json([
                'message' => 'Item removido com sucesso'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao remover item da comanda',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enviar pedido para a cozinha (alterar status para pendente)
     */
    public function enviarParaCozinha(string $pedidoId)
    {
        try {
            DB::beginTransaction();
            
            $pedido = Pedido::findOrFail($pedidoId);
            
            // Verificar se o pedido está no estado correto para enviar à cozinha
            if ($pedido->status !== 'pedido_iniciado') {
                return response()->json([
                    'message' => 'Este pedido não pode ser enviado para a cozinha porque não está no estado inicial'
                ], 422);
            }
            
            // Alterar o status para pendente
            $pedido->status = 'pendente';
            $pedido->save();
            
            DB::commit();
            
            return response()->json([
                'message' => 'Pedido enviado para a cozinha com sucesso',
                'pedido' => $pedido
            ], 200);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao enviar pedido para a cozinha',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retorna pedidos em preparo e prontos para exibição no painel de clientes
     */
    public function painelCliente()
    {
        try {
            // Buscar pedidos em preparo ou prontos, ordenados por status e data de criação
            $pedidos = Pedido::whereIn('status', ['em preparo', 'pronto'])
                ->with(['produtos:id,nome', 'comanda:id,mesa'])
                ->orderByRaw("CASE WHEN status = 'pronto' THEN 1 ELSE 0 END")
                ->orderBy('updated_at', 'asc')
                ->get();
            
            // Formatar dados para exibição simples
            $resultado = $pedidos->map(function ($pedido) {
                $itens = $pedido->produtos->map(function ($produto) {
                    return [
                        'nome' => $produto->nome,
                        'quantidade' => $produto->pivot->quantidade
                    ];
                });
                
                return [
                    'id' => $pedido->id,
                    'mesa' => $pedido->comanda->mesa,
                    'status' => $pedido->status,
                    'tempo_espera' => now()->diffInMinutes($pedido->pedido_aberto) . ' min',
                    'itens' => $itens
                ];
            });
            
            // Agrupar por status
            $emPreparo = $resultado->where('status', 'em preparo')->values();
            $prontos = $resultado->where('status', 'pronto')->values();
            
            return response()->json([
                'em_preparo' => $emPreparo,
                'prontos' => $prontos
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao buscar painel de pedidos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar pedidos com detalhes para visualização Kanban
     */
    public function listarDetalhados()
    {
        try {
            $pedidos = Pedido::with([
                'comanda',
                'produtos' => function($query) {
                    $query->select('produtos.*', 'pedido_produto.quantidade', 'pedido_produto.observacao');
                }
            ])
            ->whereIn('status', ['pendente', 'em preparo', 'pronto'])
            ->orderBy('created_at', 'desc')
            ->get();
            
            // Adicionar campos necessários para o frontend e processar dados
            $pedidos->each(function ($pedido) {
                // Adicionar a mesa da comanda diretamente no pedido para facilitar
                if ($pedido->comanda) {
                    $pedido->mesa = $pedido->comanda->mesa;
                }
                
                // Garantir que os timestamps para os status estejam disponíveis
                if ($pedido->status === 'em preparo' && !$pedido->pedido_aberto) {
                    $pedido->pedido_aberto = $pedido->updated_at;
                }
                
                if ($pedido->status === 'pronto' && !$pedido->pedido_fechado) {
                    $pedido->pedido_fechado = $pedido->updated_at;
                }
                
                // Processar produtos para terem a quantidade correta
                $pedido->produtos->each(function ($produto) {
                    if (isset($produto->pivot)) {
                        $produto->quantidade = $produto->pivot->quantidade;
                        $produto->observacao = $produto->pivot->observacao;
                    }
                });
            });
            
            return response()->json($pedidos);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao listar pedidos detalhados',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Iniciar o preparo de um pedido
     */
    public function iniciarPreparo($id)
    {
        try {
            DB::beginTransaction();
            
            Log::info("Iniciando preparo do pedido ID: " . $id);
            
            $pedido = Pedido::with(['comanda', 'produtos'])->findOrFail($id);
            Log::info("Pedido encontrado, status atual: " . $pedido->status);
            
            if ($pedido->status !== 'pendente') {
                Log::warning("Erro: Pedido não está pendente, status atual: " . $pedido->status);
                return response()->json([
                    'message' => 'Este pedido não está pendente'
                ], 422);
            }
            
            // Atualizar status do pedido diretamente no banco de dados
            $statusAnterior = $pedido->status;
            
            // Método 2: Atualização direta no banco de dados
            $affected = DB::table('pedidos')
                ->where('id', $id)
                ->update([
                    'status' => 'em preparo', 
                    'pedido_aberto' => now(),
                    'updated_at' => now()
                ]);
                
            Log::info("Pedido atualizado diretamente no DB: ID {$id}, status alterado de {$statusAnterior} para 'em preparo', linhas afetadas: {$affected}");
            
            // Forçar commit da transação
            DB::commit();
            
            // Recarregar o pedido com relacionamentos para retornar dados completos
            // Usar findOrFail com consulta direta para evitar problemas de cache
            $pedido = DB::table('pedidos')->where('id', $id)->first();
            
            if (!$pedido) {
                throw new \Exception("Pedido não encontrado após atualização");
            }
            
            // Verificar se o status foi realmente atualizado
            if ($pedido->status === 'em preparo') {
                Log::info("Status atualizado com sucesso para 'em preparo'");
            } else {
                Log::warning("FALHA: Status não foi atualizado. Status atual: " . $pedido->status);
            }
            
            // Carregar o modelo completo novamente
            $pedidoCompleto = Pedido::with(['comanda', 'produtos'])->findOrFail($id);
            
            // Adicionar a mesa diretamente no pedido para facilitar
            if ($pedidoCompleto->comanda) {
                $pedidoCompleto->mesa = $pedidoCompleto->comanda->mesa;
            }
            
            Log::info("Retornando resposta de sucesso para iniciar preparo do pedido ID: " . $id);
            return response()->json([
                'message' => 'Pedido enviado para preparo com sucesso',
                'pedido' => $pedidoCompleto,
                'status' => 'em preparo'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erro ao iniciar preparo do pedido ID {$id}: " . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao iniciar preparo do pedido',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Finalizar o preparo de um pedido (marcar como pronto)
     */
    public function finalizarPreparo($id)
    {
        try {
            DB::beginTransaction();
            
            Log::info("Finalizando preparo do pedido ID: " . $id);
            
            $pedido = Pedido::with(['comanda', 'produtos'])->findOrFail($id);
            Log::info("Pedido encontrado, status atual: " . $pedido->status);
            
            if ($pedido->status !== 'em preparo') {
                Log::warning("Erro: Pedido não está em preparo, status atual: " . $pedido->status);
                return response()->json([
                    'message' => 'Este pedido não está em preparo'
                ], 422);
            }
            
            // Atualizar status do pedido diretamente no banco de dados
            $statusAnterior = $pedido->status;
            
            // Método 2: Atualização direta no banco de dados
            $affected = DB::table('pedidos')
                ->where('id', $id)
                ->update([
                    'status' => 'pronto', 
                    'pedido_fechado' => now(),
                    'updated_at' => now()
                ]);
                
            Log::info("Pedido atualizado diretamente no DB: ID {$id}, status alterado de {$statusAnterior} para 'pronto', linhas afetadas: {$affected}");
            
            // Forçar commit da transação
            DB::commit();
            
            // Recarregar o pedido com relacionamentos para retornar dados completos
            // Usar findOrFail com consulta direta para evitar problemas de cache
            $pedido = DB::table('pedidos')->where('id', $id)->first();
            
            if (!$pedido) {
                throw new \Exception("Pedido não encontrado após atualização");
            }
            
            // Verificar se o status foi realmente atualizado
            if ($pedido->status === 'pronto') {
                Log::info("Status atualizado com sucesso para 'pronto'");
            } else {
                Log::warning("FALHA: Status não foi atualizado. Status atual: " . $pedido->status);
            }
            
            // Carregar o modelo completo novamente
            $pedidoCompleto = Pedido::with(['comanda', 'produtos'])->findOrFail($id);
            
            // Adicionar a mesa diretamente no pedido para facilitar
            if ($pedidoCompleto->comanda) {
                $pedidoCompleto->mesa = $pedidoCompleto->comanda->mesa;
            }
            
            Log::info("Retornando resposta de sucesso para finalizar preparo do pedido ID: " . $id);
            return response()->json([
                'message' => 'Pedido finalizado com sucesso',
                'pedido' => $pedidoCompleto,
                'status' => 'pronto'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erro ao finalizar preparo do pedido ID {$id}: " . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao finalizar preparo do pedido',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Contar pedidos por status (para diagnóstico)
     */
    public function contarPorStatus()
    {
        $contagem = [
            'pendente' => Pedido::where('status', 'pendente')->count(),
            'em_preparo' => Pedido::where('status', 'em preparo')->count(),
            'pronto' => Pedido::where('status', 'pronto')->count(),
            'total' => Pedido::whereIn('status', ['pendente', 'em preparo', 'pronto'])->count()
        ];
        
        return response()->json($contagem);
    }
}
