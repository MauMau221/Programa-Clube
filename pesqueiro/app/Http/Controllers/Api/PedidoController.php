<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PedidoRequest;
use App\Services\PedidoService;
use Illuminate\Http\Request;
use App\Models\Pedido;

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
            'status' => 'required|in:pedido_iniciado,pendente,entregue,cancelado'
        ]);

        $pedido = $this->pedidoService->atualizarStatus($pedidoId, $request->status);
        return response()->json($pedido, 200);
    }

    public function index()
    {
        $pedidos = Pedido::with(['produtos', 'comanda'])->get();
        return response()->json($pedidos, 200);
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
}
