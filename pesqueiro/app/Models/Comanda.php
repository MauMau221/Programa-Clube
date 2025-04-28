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
        'cliente'
    ];

    public function pedidos()
    {
        return $this->hasMany(Pedido::class); //hasMany Uma comanda pertence a muitos pedidos
    }
}
