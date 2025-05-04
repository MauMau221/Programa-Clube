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
            'mesa' => 'required|string|max:20',
            'status' => 'nullable|string|in:paga,aberta',
            'observacao' => 'nullable|string|max:500',
            'cliente' => 'required|string|max:255',
        ];
    }

    protected function prepareForValidation()
    {
        if (!$this->has('status')) {
            $this->merge(['status' => 'aberta']);
        }
    }

    public function messages(): array
    {
        return [
            'total.required' => 'O total é obrigatório',
            'total.numeric' => 'O total deve ser um número',
            'total.min' => 'O total não pode ser negativo',
            'mesa.required' => 'A mesa é obrigatória',
            'mesa.string' => 'A mesa deve ser um texto',
            'mesa.max' => 'A mesa não pode ter mais de 20 caracteres',
            'status.in' => 'O status deve ser paga ou aberta',
            'observacao.max' => 'A observação não pode ter mais de 500 caracteres',
            'cliente.required' => 'O nome do cliente é obrigatório',
            'cliente.max' => 'O nome do cliente não pode ter mais de 255 caracteres',
        ];
    }
} 