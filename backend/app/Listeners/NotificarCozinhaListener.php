<?php

namespace App\Listeners;

use App\Events\NovoPedidoEvent;
use App\Events\StatusPedidoEvent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class NotificarCozinhaListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle($event)
    {
        if ($event instanceof NovoPedidoEvent) {
            $this->handleNovoPedido($event);
        } elseif ($event instanceof StatusPedidoEvent) {
            $this->handleStatusPedido($event);
        }
    }

    /**
     * Invokable handler (Laravel 8+)
     */
    public function __invoke($event)
    {
        return $this->handle($event);
    }

    protected function handleNovoPedido(NovoPedidoEvent $event)
    {
        // Aqui você pode implementar a lógica para notificar a cozinha
        // Por exemplo, enviar um email, SMS ou notificação push
        Log::info('Novo pedido recebido: ' . $event->pedido->id);
    }

    public function handleStatusPedido(StatusPedidoEvent $event)
    {
        // Aqui você pode implementar a lógica para notificar sobre mudanças de status
        Log::info('Status do pedido atualizado: ' . $event->pedido->id . ' - Novo status: ' . $event->novoStatus);
    }
} 