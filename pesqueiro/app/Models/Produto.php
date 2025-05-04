<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produto extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'quantidade',
        'preco',
        'status',
        'observacao',
        'categoria_id',
        'estoque_minimo'
    ];


    public function pedidos()
    {
        return $this->belongsToMany(Pedido::class, 'pedido_produto')
            ->using(PedidoProduto::class)
            ->withPivot('quantidade')
            ->withTimestamps();
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class); //Um produto pertence a para muitas categorias
    }

    public function movimentacoes()
    {
        return $this->hasMany(EstoqueMovimentacao::class);
    }

    public function saldoEstoque()
    {
        return $this->hasOne(EstoqueSaldo::class);
    }

    public function getEstoqueAtualAttribute()
    {
        // Primeiro tenta buscar da tabela de saldos para melhor desempenho
        $saldo = $this->saldoEstoque;
        
        if ($saldo) {
            return $saldo->quantidade;
        }
        
        // Se não encontrar saldo, calcula a partir das movimentações
        $entradas = $this->movimentacoes()->where('tipo', 'entrada')->sum('quantidade');
        $saidas = $this->movimentacoes()->where('tipo', 'saida')->sum('quantidade');
        return $entradas - $saidas;
    }

    public function adicionarEstoque($quantidade, $motivo)
    {
        $this->movimentacoes()->create([
            'quantidade' => $quantidade,
            'tipo' => 'entrada',
            'motivo' => $motivo
        ]);
    }
}
