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
        'categoria_id'
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
}
