<?php

namespace App\Services;

use App\Events\NovoPedidoEvent;
use App\Events\StatusPedidoEvent;
use App\Models\Comanda;
use App\Models\Pedido;
use App\Models\Produto;

class PedidoService
{
    public function adicionarPedido(array $dados, int $comandaId)
    {
        $comanda = Comanda::findOrFail($comandaId);
        
        $pedido = new Pedido([
            'status' => $dados['status'],
            'prioridade' => $dados['prioridade'],
            'pedido_aberto' => now(),
        ]);

        $comanda->pedidos()->save($pedido);

        // Adiciona os produtos ao pedido
        foreach ($dados['produtos'] as $produto) {
            $pedido->produtos()->attach($produto['id'], [
                'quantidade' => $produto['quantidade']
            ]);
        }

        // Dispara evento de novo pedido
        event(new NovoPedidoEvent($pedido));

        return response()->json([
            'pedido' => $pedido->load('produtos'),
            'message' => 'Pedido adicionado com sucesso'
        ], 201);
    }

    public function atualizarStatus(int $pedidoId, string $novoStatus)
    {
        $pedido = Pedido::findOrFail($pedidoId);
        $pedido->status = $novoStatus;
        $pedido->save();

        // Dispara evento de atualização de status
        event(new StatusPedidoEvent($pedido, $novoStatus));

        return response()->json([
            'pedido' => $pedido->load('produtos'),
            'message' => 'Status do pedido atualizado com sucesso'
        ]);
    }
}
