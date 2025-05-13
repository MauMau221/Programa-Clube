<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComandaPagamento extends Model
{
    use HasFactory;
    
    protected $table = 'comanda_pagamentos';

    protected $fillable = [
        'comanda_id',
        'metodo_pagamento',
        'valor',
        'status',
        'observacao'
    ];

    // Definição do relacionamento com Comanda
    public function comanda()
    {
        return $this->belongsTo(Comanda::class);
    }
}
