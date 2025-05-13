<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Support\Facades\Log;

class PedidoProduto extends Pivot
{
    use HasFactory;

    protected $table = 'pedido_produto';

    // Habilitar incrementing ID e timestamps para o modelo Pivot
    public $incrementing = true;

    // Definir os atributos que podem ser preenchidos em massa
    protected $fillable = [
        'pedido_id',
        'produto_id',
        'quantidade',
        'observacao',
        'valor_unitario',
        'valor_total'
    ];

    /**
     * Definir explicitamente os tipos de colunas
     */
    protected $casts = [
        'quantidade' => 'integer',
        'valor_unitario' => 'decimal:2',
        'valor_total' => 'decimal:2',
    ];

    /**
     * Interceptar a criação do modelo para garantir que valores sejam numéricos
     */
    protected static function booted()
    {
        static::creating(function ($model) {
            // Garantir valores numéricos
            if (isset($model->quantidade)) {
                $model->quantidade = intval($model->quantidade);
            }
            
            if (isset($model->valor_unitario)) {
                $model->valor_unitario = floatval($model->valor_unitario);
            } else if ($model->produto) {
                $model->valor_unitario = floatval($model->produto->preco);
            }
            
            // Calcular valor total
            if (isset($model->quantidade) && isset($model->valor_unitario)) {
                $model->valor_total = $model->quantidade * $model->valor_unitario;
            }
            
            Log::info('Criando PedidoProduto com valores', [
                'pedido_id' => $model->pedido_id, 
                'produto_id' => $model->produto_id,
                'quantidade' => $model->quantidade,
                'valor_unitario' => $model->valor_unitario,
                'valor_total' => $model->valor_total
            ]);
        });
    }

    /**
     * Relação com o produto
     */
    public function produto()
    {
        return $this->belongsTo(Produto::class);
    }

    /**
     * Relação com o pedido
     */
    public function pedido()
    {
        return $this->belongsTo(Pedido::class);
    }

    /**
     * Accessors para compatibilidade com o novo sistema
     */
    public function getValorUnitarioAttribute($value)
    {
        if ($value !== null) {
            return floatval($value);
        }
        
        // Se não existir no modelo, busca do produto associado
        if ($this->produto) {
            return floatval($this->produto->preco);
        }
        
        return 0;
    }
    
    public function getValorTotalAttribute($value)
    {
        if ($value !== null) {
            return floatval($value);
        }
        
        // Calcular com base na quantidade e valor unitário
        $quantidade = isset($this->attributes['quantidade']) ? intval($this->attributes['quantidade']) : 0;
        $valorUnitario = $this->valor_unitario;
        
        return $valorUnitario * $quantidade;
    }
    
    /**
     * Mutators para garantir valores numéricos
     */
    public function setQuantidadeAttribute($value)
    {
        $this->attributes['quantidade'] = intval($value);
    }
    
    public function setValorUnitarioAttribute($value)
    {
        $this->attributes['valor_unitario'] = floatval($value);
    }
    
    public function setValorTotalAttribute($value)
    {
        $this->attributes['valor_total'] = floatval($value);
    }
}
