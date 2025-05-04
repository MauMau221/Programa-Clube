<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;
    protected $table = 'pedidos';

    protected $fillable = [
        'comanda_id',
        'total',
        'status',
        'prioridade',
        'pedido_aberto',
        'pedido_fechado'
    ];

    public function produtos()
    {
        return $this->belongsToMany(Produto::class, 'pedido_produto')
            ->using(PedidoProduto::class)
            ->withPivot(['id', 'quantidade', 'observacao'])
            ->withTimestamps();
    }
    public function comanda()
    {
        return $this->belongsTo(Comanda::class); //belongsTo Muitos pedidos pertence a uma comanda
    }
}
