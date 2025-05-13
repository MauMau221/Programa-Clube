<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PedidoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'produtos' => 'required|array|min:1',
            'produtos.*.id' => 'required|exists:produtos,id',
            'produtos.*.quantidade' => 'required|integer|min:1',
            'status' => 'required|in:pedido_iniciado,pendente,entregue',
            'prioridade' => 'required|in:normal,urgente',
        ];
    }

    public function messages(): array
    {
        return [
            'produtos.required' => 'É necessário informar pelo menos um produto',
            'produtos.array' => 'Os produtos devem ser informados em um array',
            'produtos.min' => 'É necessário informar pelo menos um produto',
            'produtos.*.id.required' => 'O ID do produto é obrigatório',
            'produtos.*.id.exists' => 'O produto informado não existe',
            'produtos.*.quantidade.required' => 'A quantidade é obrigatória',
            'produtos.*.quantidade.integer' => 'A quantidade deve ser um número inteiro',
            'produtos.*.quantidade.min' => 'A quantidade deve ser maior que zero',
            'status.required' => 'O status é obrigatório',
            'status.in' => 'O status deve ser pedido_iniciado, pendente ou entregue',
            'prioridade.required' => 'A prioridade é obrigatória',
            'prioridade.in' => 'A prioridade deve ser normal ou urgente',
        ];
    }
} 