<?php

namespace App\Events;

use App\Models\Pedido;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StatusPedidoEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $pedido;
    public $novoStatus;

    public function __construct(Pedido $pedido, string $novoStatus)
    {
        $this->pedido = $pedido;
        $this->novoStatus = $novoStatus;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('pedidos'),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'pedido' => $this->pedido->load('produtos'),
            'novoStatus' => $this->novoStatus,
            'mensagem' => "Status do pedido atualizado para: {$this->novoStatus}"
        ];
    }
} 