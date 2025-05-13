<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comanda extends Model
{

    use HasFactory;

    protected $fillable = [
        'total',
        'mesa',
        'status',
        'observacao',
        'cliente',
        'metodo_pagamento',
        'pessoas'
    ];

    public function pedidos()
    {
        return $this->hasMany(Pedido::class); //hasMany Uma comanda pertence a muitos pedidos
    }
    
    public function pagamentos()
    {
        return $this->hasMany(ComandaPagamento::class);
    }
}
