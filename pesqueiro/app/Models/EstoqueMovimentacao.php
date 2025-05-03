<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstoqueMovimentacao extends Model
{
    use HasFactory;

    protected $table = 'estoque_movimentacoes';

    protected $fillable = [
        'produto_id',
        'quantidade',
        'tipo',
        'motivo'
    ];

    public function produto()
    {
        return $this->belongsTo(Produto::class);
    }
} 