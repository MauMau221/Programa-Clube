<?php

namespace App\Services;

use App\Events\NovoPedidoEvent;
use App\Events\StatusPedidoEvent;
use App\Models\Comanda;
use App\Models\Pedido;
use App\Models\Produto;

class PedidoService
{
    protected $estoqueService;

    public function __construct(EstoqueService $estoqueService)
    {
        $this->estoqueService = $estoqueService;
    }

    public function adicionarPedido(array $dados, int $comandaId)
    {
        $comanda = Comanda::findOrFail($comandaId);
        
        // Calcula o total do pedido
        $total = 0;
        foreach ($dados['produtos'] as $item) {
            $prod = Produto::findOrFail($item['id']);
            
            // Verifica se há estoque suficiente
            if ($prod->estoque_atual < $item['quantidade']) {
                return response()->json([
                    'message' => "Estoque insuficiente para o produto {$prod->nome}. Disponível: {$prod->estoque_atual}"
                ], 422);
            }
            
            $total += $prod->preco * $item['quantidade'];
        }

        // Cria novo pedido incluindo total
        $pedido = new Pedido([
            'total' => $total,
            'status' => $dados['status'],
            'prioridade' => $dados['prioridade'],
            'pedido_aberto' => now(),
        ]);

        $comanda->pedidos()->save($pedido);

        // Associa os produtos ao pedido e baixa o estoque
        $alertas = [];
        foreach ($dados['produtos'] as $produto) {
            $pedido->produtos()->attach($produto['id'], [
                'quantidade' => $produto['quantidade']
            ]);
            
            // Baixa o estoque
            $prod = Produto::findOrFail($produto['id']);
            try {
                $resultado = $this->estoqueService->removerEstoqueComAlerta(
                    $prod,
                    $produto['quantidade'],
                    "Saída para Pedido #{$pedido->id}"
                );
                
                // Adiciona alerta se existir
                if (isset($resultado['alerta'])) {
                    $alertas[] = $resultado['alerta'];
                }
            } catch (\Exception $e) {
                // Se ocorrer erro ao baixar estoque, registra no log
                \Illuminate\Support\Facades\Log::error("Erro ao baixar estoque: " . $e->getMessage());
            }
        }

        // Atualiza o total da comanda
        $comanda->total += $total;
        $comanda->save();

        // Dispara evento de novo pedido
        event(new NovoPedidoEvent($pedido));

        $resposta = [
            'pedido' => $pedido->load('produtos'),
            'message' => 'Pedido adicionado com sucesso'
        ];
        
        // Adiciona alertas se existirem
        if (!empty($alertas)) {
            $resposta['alertas'] = $alertas;
        }

        return response()->json($resposta, 201);
    }

    public function atualizarStatus(int $pedidoId, string $novoStatus)
    {
        $pedido = Pedido::findOrFail($pedidoId);
        $statusAntigo = $pedido->status;
        $pedido->status = $novoStatus;
        
        if ($novoStatus === 'entregue' && !$pedido->pedido_fechado) {
            $pedido->pedido_fechado = now();
        }
        
        $pedido->save();

        // Dispara evento de atualização de status
        event(new StatusPedidoEvent($pedido, $novoStatus));

        return response()->json([
            'pedido' => $pedido->load('produtos'),
            'message' => 'Status do pedido atualizado com sucesso'
        ]);
    }
    
    public function editarPedido(array $dados, int $pedidoId)
    {
        $pedido = Pedido::with('produtos')->findOrFail($pedidoId);
        $comanda = $pedido->comanda;
        
        // Verifica se o pedido pode ser editado
        if ($pedido->status === 'entregue') {
            return response()->json([
                'message' => 'Não é possível editar um pedido já entregue'
            ], 422);
        }
        
        // Salva os produtos atuais para devolver ao estoque
        $produtosAtuais = $pedido->produtos;
        
        // Verifica estoque para os novos produtos
        foreach ($dados['produtos'] as $item) {
            $prod = Produto::findOrFail($item['id']);
            
            // Verifica se o produto já existe no pedido
            $existeProduto = $produtosAtuais->where('id', $item['id'])->first();
            $quantidadeAtual = $existeProduto ? $existeProduto->pivot->quantidade : 0;
            
            // Só verifica estoque se a nova quantidade for maior que a atual
            if ($item['quantidade'] > $quantidadeAtual) {
                $quantidadeAdicional = $item['quantidade'] - $quantidadeAtual;
                
                if ($prod->estoque_atual < $quantidadeAdicional) {
                    return response()->json([
                        'message' => "Estoque insuficiente para o produto {$prod->nome}. Disponível: {$prod->estoque_atual}"
                    ], 422);
                }
            }
        }
        
        // Salva o total antigo para atualizar a comanda
        $totalAntigo = $pedido->total;
        
        // Calcula o novo total do pedido
        $novoTotal = 0;
        foreach ($dados['produtos'] as $item) {
            $prod = Produto::findOrFail($item['id']);
            $novoTotal += $prod->preco * $item['quantidade'];
        }
        
        // Atualiza dados do pedido
        $pedido->total = $novoTotal;
        $pedido->prioridade = $dados['prioridade'] ?? $pedido->prioridade;
        $pedido->save();
        
        // Devolve os produtos atuais ao estoque
        foreach ($produtosAtuais as $produtoAtual) {
            try {
                $this->estoqueService->adicionarEstoque(
                    $produtoAtual,
                    $produtoAtual->pivot->quantidade,
                    "Estorno de Pedido #{$pedido->id} (edição)"
                );
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Erro ao estornar estoque: " . $e->getMessage());
            }
        }
        
        // Remove todos os produtos atuais e adiciona os novos
        $pedido->produtos()->detach();
        
        foreach ($dados['produtos'] as $produto) {
            $pedido->produtos()->attach($produto['id'], [
                'quantidade' => $produto['quantidade']
            ]);
            
            // Baixa o estoque dos novos produtos
            $prod = Produto::findOrFail($produto['id']);
            try {
                $this->estoqueService->removerEstoque(
                    $prod,
                    $produto['quantidade'],
                    "Saída para Pedido #{$pedido->id} (editado)"
                );
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Erro ao baixar estoque: " . $e->getMessage());
            }
        }
        
        // Atualiza o total da comanda
        $comanda->total = $comanda->total - $totalAntigo + $novoTotal;
        $comanda->save();
        
        return response()->json([
            'pedido' => $pedido->load('produtos'),
            'message' => 'Pedido atualizado com sucesso'
        ]);
    }
    
    public function cancelarPedido(int $pedidoId)
    {
        $pedido = Pedido::with('produtos')->findOrFail($pedidoId);
        $comanda = $pedido->comanda;
        
        // Verifica se o pedido pode ser cancelado
        if ($pedido->status === 'entregue') {
            return response()->json([
                'message' => 'Não é possível cancelar um pedido já entregue'
            ], 422);
        }
        
        // Devolve os produtos ao estoque
        foreach ($pedido->produtos as $produto) {
            try {
                $this->estoqueService->adicionarEstoque(
                    $produto,
                    $produto->pivot->quantidade,
                    "Estorno de Pedido #{$pedido->id} (cancelamento)"
                );
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Erro ao estornar estoque: " . $e->getMessage());
            }
        }
        
        // Atualiza o total da comanda
        $comanda->total -= $pedido->total;
        $comanda->save();
        
        // Armazena o status como cancelado
        $pedido->status = 'cancelado';
        $pedido->pedido_fechado = now();
        $pedido->save();
        
        // Dispara evento de atualização de status
        event(new StatusPedidoEvent($pedido, 'cancelado'));
        
        return response()->json([
            'message' => 'Pedido cancelado com sucesso'
        ]);
    }
    
    public function buscarPorComanda(int $comandaId)
    {
        $comanda = Comanda::findOrFail($comandaId);
        $pedidos = $comanda->pedidos()->with('produtos')->get();
        
        return response()->json([
            'comanda' => $comanda,
            'pedidos' => $pedidos
        ]);
    }
    
    public function removerProduto(int $pedidoId, int $produtoId)
    {
        $pedido = Pedido::findOrFail($pedidoId);
        $comanda = $pedido->comanda;
        
        // Verifica se o pedido pode ser editado
        if ($pedido->status === 'entregue' || $pedido->status === 'cancelado') {
            return response()->json([
                'message' => 'Não é possível editar um pedido já finalizado'
            ], 422);
        }
        
        // Verifica se o produto está no pedido
        $produtoPedido = $pedido->produtos()->where('produto_id', $produtoId)->first();
        
        if (!$produtoPedido) {
            return response()->json([
                'message' => 'Este produto não existe no pedido'
            ], 404);
        }
        
        // Devolve o produto ao estoque
        $quantidade = $produtoPedido->pivot->quantidade;
        try {
            $this->estoqueService->adicionarEstoque(
                $produtoPedido,
                $quantidade,
                "Estorno de Pedido #{$pedido->id} (remoção de produto)"
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Erro ao estornar estoque: " . $e->getMessage());
        }
        
        // Calcula o valor a ser subtraído do total do pedido
        $valorProduto = $produtoPedido->preco * $quantidade;
        
        // Atualiza o total do pedido
        $pedido->total -= $valorProduto;
        $pedido->save();
        
        // Atualiza o total da comanda
        $comanda->total -= $valorProduto;
        $comanda->save();
        
        // Remove o produto do pedido
        $pedido->produtos()->detach($produtoId);
        
        return response()->json([
            'pedido' => $pedido->load('produtos'),
            'message' => 'Produto removido do pedido com sucesso'
        ]);
    }
    
    public function atualizarQuantidadeProduto(int $pedidoId, int $produtoId, int $novaQuantidade)
    {
        $pedido = Pedido::findOrFail($pedidoId);
        $comanda = $pedido->comanda;
        
        // Verifica se o pedido pode ser editado
        if ($pedido->status === 'entregue' || $pedido->status === 'cancelado') {
            return response()->json([
                'message' => 'Não é possível editar um pedido já finalizado'
            ], 422);
        }
        
        // Verifica se a quantidade é válida
        if ($novaQuantidade <= 0) {
            return response()->json([
                'message' => 'A quantidade deve ser maior que zero'
            ], 422);
        }
        
        // Verifica se o produto está no pedido
        $produtoPedido = $pedido->produtos()->where('produto_id', $produtoId)->first();
        
        if (!$produtoPedido) {
            return response()->json([
                'message' => 'Este produto não existe no pedido'
            ], 404);
        }
        
        // Calcula a diferença de quantidade
        $quantidadeAtual = $produtoPedido->pivot->quantidade;
        $diferencaQuantidade = $novaQuantidade - $quantidadeAtual;
        
        // Se a nova quantidade for maior, verifica estoque
        if ($diferencaQuantidade > 0) {
            // Verifica se há estoque suficiente
            if ($produtoPedido->estoque_atual < $diferencaQuantidade) {
                return response()->json([
                    'message' => "Estoque insuficiente para o produto {$produtoPedido->nome}. Disponível: {$produtoPedido->estoque_atual}"
                ], 422);
            }
            
            // Baixa a diferença adicional do estoque
            try {
                $this->estoqueService->removerEstoque(
                    $produtoPedido,
                    $diferencaQuantidade,
                    "Saída para Pedido #{$pedido->id} (atualização de quantidade)"
                );
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Erro ao baixar estoque: " . $e->getMessage());
            }
        } elseif ($diferencaQuantidade < 0) {
            // Se a nova quantidade for menor, devolve ao estoque
            try {
                $this->estoqueService->adicionarEstoque(
                    $produtoPedido,
                    abs($diferencaQuantidade),
                    "Estorno para Pedido #{$pedido->id} (redução de quantidade)"
                );
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Erro ao estornar estoque: " . $e->getMessage());
            }
        }
        
        // Calcula a diferença de valor
        $diferencaValor = $produtoPedido->preco * $diferencaQuantidade;
        
        // Atualiza a quantidade do produto no pedido
        $pedido->produtos()->updateExistingPivot($produtoId, [
            'quantidade' => $novaQuantidade
        ]);
        
        // Atualiza o total do pedido
        $pedido->total += $diferencaValor;
        $pedido->save();
        
        // Atualiza o total da comanda
        $comanda->total += $diferencaValor;
        $comanda->save();
        
        return response()->json([
            'pedido' => $pedido->load('produtos'),
            'message' => 'Quantidade atualizada com sucesso'
        ]);
    }
}
