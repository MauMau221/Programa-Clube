<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ComandaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'total' => 'required|numeric|min:0',
            'mesa' => 'nullable|numeric|min:1',
            'status' => 'required|in:paga,aberta',
            'observacao' => 'nullable|string|max:500',
            'cliente' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'total.required' => 'O total é obrigatório',
            'total.numeric' => 'O total deve ser um número',
            'total.min' => 'O total não pode ser negativo',
            'mesa.numeric' => 'A mesa deve ser um número',
            'mesa.min' => 'O número da mesa deve ser maior que zero',
            'status.required' => 'O status é obrigatório',
            'status.in' => 'O status deve ser paga ou aberta',
            'observacao.max' => 'A observação não pode ter mais de 500 caracteres',
            'cliente.required' => 'O nome do cliente é obrigatório',
            'cliente.max' => 'O nome do cliente não pode ter mais de 255 caracteres',
        ];
    }
} 