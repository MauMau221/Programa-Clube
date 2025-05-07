<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comanda;
use App\Models\Pedido;
use App\Models\PedidoProduto;
use App\Models\Produto;
use App\Services\EstoqueService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class VendaController extends Controller
{
    protected $estoqueService;

    public function __construct(EstoqueService $estoqueService)
    {
        $this->estoqueService = $estoqueService;
    }

    /**
     * Registra uma venda direta (sem comanda na mesa)
     * 
     * Este método permite que o caixa registre vendas diretas sem a
     * necessidade de criar uma comanda para o cliente.
     */
    public function vendaDireta(Request $request)
    {
        try {
            Log::info('Iniciando venda direta', ['dados' => $request->all()]);
            
            // Validar dados
            $validator = Validator::make($request->all(), [
                'cliente' => 'nullable|string|max:255',
                'metodo_pagamento' => 'required|string|in:dinheiro,credito,debito,pix,outro',
                'itens' => 'required|array|min:1',
                'itens.*.produto_id' => 'required|integer|exists:produtos,id',
                'itens.*.quantidade' => 'required|integer|min:1',
                'itens.*.observacao' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                Log::error('Erro de validação na venda direta', ['erros' => $validator->errors()]);
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            try {
                // Criar uma comanda para venda direta
                $comanda = new Comanda();
                $comanda->mesa = 'CAIXA';
                
                // Verificar se o cliente é null ou string vazia e tratar adequadamente
                $clienteNome = $request->input('cliente');
                $comanda->cliente = (!empty($clienteNome)) ? $clienteNome : 'Cliente Não Identificado';
                
                $comanda->status = 'paga'; // Alterado de 'fechada' para 'paga' conforme enum definido na migração
                $comanda->metodo_pagamento = $request->metodo_pagamento;
                $comanda->total = 0;
                $comanda->save();
                
                Log::info('Comanda criada', ['id' => $comanda->id]);
    
                // Criar pedido
                $pedido = new Pedido();
                $pedido->comanda_id = $comanda->id;
                $pedido->status = 'entregue';
                $pedido->total = 0;
                $pedido->save();
                
                Log::info('Pedido criado', ['id' => $pedido->id]);
    
                $total = 0;
    
                // Adicionar itens
                foreach ($request->itens as $item) {
                    $produto = Produto::findOrFail($item['produto_id']);
                    
                    $quantidade = (int)$item['quantidade'];
                    $valorUnitario = (float)$produto->preco;
                    $valorTotal = $valorUnitario * $quantidade;
                    
                    // Verificar se há estoque disponível
                    if (!$this->estoqueService->verificarDisponibilidadeEstoque($produto, $quantidade)) {
                        DB::rollBack();
                        Log::warning('Tentativa de venda direta com produto sem estoque suficiente', [
                            'produto_id' => $produto->id,
                            'produto_nome' => $produto->nome,
                            'estoque_atual' => $produto->estoque,
                            'quantidade_solicitada' => $quantidade
                        ]);
                        
                        return response()->json([
                            'message' => "Produto {$produto->nome} está esgotado ou com estoque insuficiente!",
                            'estoque_atual' => $produto->estoque,
                            'quantidade_solicitada' => $quantidade
                        ], 422);
                    }
                    
                    // Criar o item do pedido usando o create para simplificar
                    $pedidoProduto = PedidoProduto::create([
                        'pedido_id' => $pedido->id,
                        'produto_id' => $produto->id,
                        'quantidade' => $quantidade,
                        'valor_unitario' => $valorUnitario,
                        'valor_total' => $valorTotal,
                        'observacao' => $item['observacao'] ?? null
                    ]);
                    
                    Log::info('Item adicionado', [
                        'id' => $pedidoProduto->id,
                        'produto' => $produto->nome,
                        'quantidade' => $quantidade,
                        'valor_total' => $valorTotal
                    ]);
                    
                    // Atualizar o estoque (registrar saída)
                    try {
                        $this->estoqueService->removerEstoque(
                            $produto, 
                            $quantidade, 
                            "Venda direta - Comanda #{$comanda->id}"
                        );
                        
                        Log::info('Estoque atualizado para item', [
                            'produto_id' => $produto->id,
                            'quantidade_removida' => $quantidade
                        ]);
                    } catch (\Exception $estoqueException) {
                        Log::warning('Não foi possível atualizar o estoque, mas a venda continuará', [
                            'erro' => $estoqueException->getMessage(),
                            'produto' => $produto->nome
                        ]);
                        // Não interrompemos a venda se houver problema no estoque
                    }
                    
                    $total += $valorTotal;
                }
                
                // Atualizar totais
                $comanda->total = $total;
                $comanda->save();
                
                $pedido->total = $total;
                $pedido->save();
                
                Log::info('Venda finalizada', ['total' => $total]);
                
                DB::commit();
                
                return response()->json([
                    'id' => $comanda->id,
                    'data' => now(),
                    'total' => $total,
                    'cliente' => $comanda->cliente,
                    'metodo_pagamento' => $comanda->metodo_pagamento,
                    'message' => 'Venda direta registrada com sucesso!'
                ], 201);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Erro na transação', [
                    'message' => $e->getMessage(),
                    'line' => $e->getLine(),
                    'file' => $e->getFile()
                ]);
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Erro geral na venda direta', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Erro ao registrar venda direta',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 