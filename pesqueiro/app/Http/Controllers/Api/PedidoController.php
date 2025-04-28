<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PedidoRequest;
use App\Services\PedidoService;
use Illuminate\Http\Request;

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

        return $comanda;
    }

    public function updateStatus(Request $request, string $pedidoId)
    {
        $request->validate([
            'status' => 'required|in:pedido_iniciado,pendente,entregue'
        ]);

        $pedido = $this->pedidoService->atualizarStatus($pedidoId, $request->status);
        return $pedido;
    }
}
