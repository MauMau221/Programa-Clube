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
        'quantidade_anterior',
        'quantidade_atual',
        'tipo',
        'motivo',
        'usuario_id'
    ];

    protected $casts = [
        'quantidade' => 'integer',
        'quantidade_anterior' => 'integer',
        'quantidade_atual' => 'integer',
    ];

    public function produto()
    {
        return $this->belongsTo(Produto::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class);
    }
} 