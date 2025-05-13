<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstoqueSaldo extends Model
{
    use HasFactory;

    protected $table = 'estoque_saldos';
    
    // Definir explicitamente a chave primária
    protected $primaryKey = 'produto_id';

    protected $fillable = [
        'produto_id',
        'quantidade'
    ];

    protected $casts = [
        'quantidade' => 'integer'
    ];

    public function produto()
    {
        return $this->belongsTo(Produto::class);
    }

    public static function atualizarOuCriarSaldo(int $produtoId, int $novaQuantidade): self
    {
        $saldo = self::firstOrNew(['produto_id' => $produtoId]);
        $saldo->quantidade = $novaQuantidade;
        $saldo->save();
        
        return $saldo;
    }
} 