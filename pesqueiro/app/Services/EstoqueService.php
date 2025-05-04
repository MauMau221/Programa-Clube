<?php

namespace App\Services;

use App\Models\Produto;
use App\Models\EstoqueMovimentacao;
use App\Models\EstoqueSaldo;
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
            // Obter saldo atual
            $estoqueAtual = $this->getSaldoAtual($produto);
            $novoSaldo = $estoqueAtual + $quantidade;
            
            // Registrar movimentação
            $movimentacao = $produto->movimentacoes()->create([
                'quantidade' => $quantidade,
                'quantidade_anterior' => $estoqueAtual,
                'quantidade_atual' => $novoSaldo,
                'tipo' => 'entrada',
                'motivo' => $motivo,
                'usuario_id' => auth()->id()
            ]);
            
            // Atualizar saldo consolidado usando o método estático que já trata a chave primária corretamente
            EstoqueSaldo::atualizarOuCriarSaldo($produto->id, $novoSaldo);
            
            return $movimentacao;
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

        $estoqueAtual = $this->getSaldoAtual($produto);
        if ($estoqueAtual < $quantidade) {
            throw new Exception('Quantidade insuficiente em estoque');
        }

        return DB::transaction(function () use ($produto, $quantidade, $motivo, $estoqueAtual) {
            $novoSaldo = $estoqueAtual - $quantidade;
            
            // Registrar movimentação
            $movimentacao = $produto->movimentacoes()->create([
                'quantidade' => $quantidade,
                'quantidade_anterior' => $estoqueAtual,
                'quantidade_atual' => $novoSaldo,
                'tipo' => 'saida',
                'motivo' => $motivo,
                'usuario_id' => auth()->id()
            ]);
            
            // Atualizar saldo consolidado
            EstoqueSaldo::atualizarOuCriarSaldo($produto->id, $novoSaldo);
            
            return $movimentacao;
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
        // Buscar da tabela de saldos primeiro (mais eficiente)
        $saldo = EstoqueSaldo::where('produto_id', $produto->id)->first();
        
        if ($saldo) {
            return $saldo->quantidade;
        }
        
        // Se não encontrar, calcular o saldo a partir das movimentações
        $entradas = $produto->movimentacoes()->where('tipo', 'entrada')->sum('quantidade');
        $saidas = $produto->movimentacoes()->where('tipo', 'saida')->sum('quantidade');
        
        return $entradas - $saidas;
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