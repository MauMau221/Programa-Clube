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
        $comanda = Comanda::with('pedidos.produtos')->findOrFail($id);
        
        // Transformar dados dos pedidos para itens da comanda
        $itens = [];
        
        foreach ($comanda->pedidos as $pedido) {
            foreach ($pedido->produtos as $produto) {
                // Garantir que os valores numéricos sejam tratados como números no JSON
                $valorUnitario = floatval($produto->preco);
                $quantidade = intval($produto->pivot->quantidade);
                $valorTotal = $valorUnitario * $quantidade;
                
                $itens[] = [
                    'id' => intval($produto->pivot->id),
                    'comanda_id' => intval($comanda->id),
                    'produto_id' => intval($produto->id),
                    'produto' => [
                        'id' => intval($produto->id),
                        'nome' => $produto->nome,
                        'preco' => $valorUnitario,
                        'categoria_id' => intval($produto->categoria_id),
                        'status' => $produto->status,
                        'observacao' => $produto->observacao
                    ],
                    'quantidade' => $quantidade,
                    'valor_unitario' => $valorUnitario,
                    'valor_total' => $valorTotal,
                    'observacao' => $produto->pivot->observacao ?? null,
                    'created_at' => $produto->pivot->created_at,
                    'updated_at' => $produto->pivot->updated_at
                ];
            }
        }
        
        // Adicionar log de debug para verificar os itens
        error_log('Itens da comanda ' . $id . ': ' . json_encode($itens));
        
        // Adicionar os itens à resposta
        $resposta = $comanda->toArray();
        $resposta['itens'] = $itens;
        $resposta['total'] = floatval($comanda->total);
        
        return response()->json($resposta, 200);
    }

    public function update(ComandaRequest $request, string $comandaId)
    {
        $dados = $request->validated();
        $comanda = $this->comandaService->editarComanda($dados, $comandaId);
        return response()->json($comanda, 200);
    }

    public function close(string $comandaId)
    {
        $comanda = $this->comandaService->fecharComanda($comandaId);
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
