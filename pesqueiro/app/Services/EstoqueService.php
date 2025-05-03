<?php

namespace App\Services;

use App\Models\Produto;
use App\Models\EstoqueMovimentacao;
use Illuminate\Support\Facades\DB;
use Exception;

class EstoqueService
{
    /**
     * Adiciona quantidade ao estoque do produto
     *
     * @param Produto $produto
     * @param int $quantidade
     * @param string $motivo
     * @return EstoqueMovimentacao
     * @throws Exception
     */
    public function adicionarEstoque(Produto $produto, int $quantidade, string $motivo): EstoqueMovimentacao
    {
        if ($quantidade <= 0) {
            throw new Exception('A quantidade deve ser maior que zero');
        }

        return DB::transaction(function () use ($produto, $quantidade, $motivo) {
            return $produto->movimentacoes()->create([
                'quantidade' => $quantidade,
                'tipo' => 'entrada',
                'motivo' => $motivo
            ]);
        });
    }

    /**
     * Remove quantidade do estoque do produto
     *
     * @param Produto $produto
     * @param int $quantidade
     * @param string $motivo
     * @return EstoqueMovimentacao
     * @throws Exception
     */
    public function removerEstoque(Produto $produto, int $quantidade, string $motivo): EstoqueMovimentacao
    {
        if ($quantidade <= 0) {
            throw new Exception('A quantidade deve ser maior que zero');
        }

        $estoqueAtual = $produto->estoque_atual;
        if ($estoqueAtual < $quantidade) {
            throw new Exception('Quantidade insuficiente em estoque');
        }

        return DB::transaction(function () use ($produto, $quantidade, $motivo) {
            return $produto->movimentacoes()->create([
                'quantidade' => $quantidade,
                'tipo' => 'saida',
                'motivo' => $motivo
            ]);
        });
    }

    /**
     * Obtém o histórico de movimentações do produto
     *
     * @param Produto $produto
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getHistorico(Produto $produto, int $limit = 10)
    {
        return $produto->movimentacoes()
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Obtém o saldo atual do estoque
     *
     * @param Produto $produto
     * @return int
     */
    public function getSaldoAtual(Produto $produto): int
    {
        return $produto->estoque_atual;
    }

    /**
     * Verifica se o estoque está abaixo do mínimo definido
     * 
     * @param Produto $produto
     * @return bool
     */
    public function verificarEstoqueBaixo(Produto $produto): bool
    {
        return $produto->estoque_atual <= $produto->estoque_minimo;
    }
    
    /**
     * Gera alerta de estoque baixo se estiver abaixo do mínimo
     *
     * @param Produto $produto
     * @return array|null
     */
    public function gerarAlertaEstoqueBaixo(Produto $produto): ?array
    {
        if ($this->verificarEstoqueBaixo($produto)) {
            // Registrar o alerta no log
            \Illuminate\Support\Facades\Log::warning("ALERTA: Estoque baixo para o produto {$produto->nome}. Atual: {$produto->estoque_atual}, Mínimo: {$produto->estoque_minimo}");
            
            // Retornar informações do alerta
            return [
                'tipo' => 'estoque_baixo',
                'produto_id' => $produto->id,
                'produto_nome' => $produto->nome,
                'estoque_atual' => $produto->estoque_atual,
                'estoque_minimo' => $produto->estoque_minimo,
                'mensagem' => "Estoque baixo para o produto {$produto->nome}. Atual: {$produto->estoque_atual}, Mínimo: {$produto->estoque_minimo}"
            ];
        }
        
        return null;
    }
    
    /**
     * Remove quantidade do estoque e verifica alertas
     *
     * @param Produto $produto
     * @param int $quantidade
     * @param string $motivo
     * @return array
     * @throws Exception
     */
    public function removerEstoqueComAlerta(Produto $produto, int $quantidade, string $motivo): array
    {
        $movimentacao = $this->removerEstoque($produto, $quantidade, $motivo);
        
        // Recarrega o produto após a atualização
        $produto->refresh();
        
        $resultado = [
            'movimentacao' => $movimentacao,
            'estoque_atual' => $produto->estoque_atual
        ];
        
        // Verifica se precisa gerar alerta
        $alerta = $this->gerarAlertaEstoqueBaixo($produto);
        if ($alerta) {
            $resultado['alerta'] = $alerta;
        }
        
        return $resultado;
    }
} 