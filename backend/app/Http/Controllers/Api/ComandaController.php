<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ComandaRequest;
use App\Models\Comanda;
use App\Services\ComandaService;
use App\Services\PedidoService;
use Illuminate\Http\Request;

class ComandaController extends Controller
{
    protected $comandaService;
    protected $pedidoService;

    public function __construct(ComandaService $comandaService, PedidoService $pedidoService)
    {
        $this->comandaService = $comandaService;
        $this->pedidoService = $pedidoService;
    }

    public function index()
    {
        $comandas = Comanda::orderBy('created_at', 'desc')->get();
        return response()->json($comandas, 200);
    }

    public function store(ComandaRequest $request)
    {
        $dados = $request->validated();
        $comanda = $this->comandaService->criarComanda($dados);
        return response()->json($comanda, 201);
    }

    public function show(string $id)
    {
        $comanda = Comanda::with([
            'pedidos.itens.produto.categoria',
            'pagamentos'
        ])->findOrFail($id);
        
        // Transformar dados dos pedidos para itens da comanda
        $itens = [];
        
        foreach ($comanda->pedidos as $pedido) {
            foreach ($pedido->itens as $item) {
                // Garantir que os valores numéricos sejam tratados como números no JSON
                $valorUnitario = floatval($item->valor_unitario);
                $quantidade = intval($item->quantidade);
                $valorTotal = floatval($item->valor_total);
                
                $itens[] = [
                    'id' => intval($item->id),
                    'comanda_id' => intval($comanda->id),
                    'produto_id' => intval($item->produto_id),
                    'produto' => [
                        'id' => intval($item->produto->id),
                        'nome' => $item->produto->nome,
                        'preco' => floatval($item->produto->preco),
                        'categoria_id' => intval($item->produto->categoria_id),
                        'status' => $item->produto->status,
                        'observacao' => $item->produto->observacao,
                        'categoria' => $item->produto->categoria
                    ],
                    'quantidade' => $quantidade,
                    'valor_unitario' => $valorUnitario,
                    'valor_total' => $valorTotal,
                    'observacao' => $item->observacao ?? null,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at
                ];
            }
        }
        
        // Transformar os pagamentos para garantir valores numéricos corretos
        $pagamentos = [];
        
        foreach ($comanda->pagamentos as $pagamento) {
            $pagamentos[] = [
                'id' => intval($pagamento->id),
                'comanda_id' => intval($pagamento->comanda_id),
                'metodo_pagamento' => $pagamento->metodo_pagamento,
                'valor' => floatval($pagamento->valor),
                'status' => $pagamento->status,
                'observacao' => $pagamento->observacao,
                'created_at' => $pagamento->created_at,
                'updated_at' => $pagamento->updated_at
            ];
        }
        
        // Adicionar log de debug para verificar os itens
        //error_log('Itens da comanda ' . $id . ': ' . json_encode($itens));
        
        // Adicionar os itens à resposta
        $resposta = $comanda->toArray();
        $resposta['itens'] = $itens;
        $resposta['pagamentos'] = $pagamentos;
        $resposta['total'] = floatval($comanda->total);
        
        return response()->json($resposta, 200);
    }

    public function update(ComandaRequest $request, string $comandaId)
    {
        $dados = $request->validated();
        $comanda = $this->comandaService->editarComanda($dados, $comandaId);
        return response()->json($comanda, 200);
    }

    public function close(Request $request, string $comandaId)
    {
        $dados = $request->all();
        $comanda = $this->comandaService->fecharComanda($comandaId, $dados);
        return response()->json($comanda, 200);
    }

    public function cancel(string $comandaId)
    {
        $comanda = $this->comandaService->cancelarComanda($comandaId);
        return response()->json($comanda, 200);
    }

    /**
     * Verificar se a comanda possui pedidos pendentes de envio para a cozinha
     */
    public function verificarPedidosPendentes(string $comandaId)
    {
        $pedido = $this->pedidoService->buscarPedidosPendentesEnvio($comandaId);
        
        if ($pedido) {
            return response()->json([
                'tem_pedido_pendente' => true,
                'pedido' => $pedido
            ], 200);
        }
        
        return response()->json([
            'tem_pedido_pendente' => false
        ], 200);
    }
}
