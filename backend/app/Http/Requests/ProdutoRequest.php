<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProdutoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:255',
            'preco' => 'required|numeric|min:0',
            'status' => 'required|in:disponivel,indisponivel',
            'observacao' => 'nullable|string|max:500',
            'categoria_id' => 'required|exists:categorias,id',
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome é obrigatório',
            'nome.max' => 'O nome não pode ter mais de 255 caracteres',
            'preco.required' => 'O preço é obrigatório',
            'preco.numeric' => 'O preço deve ser um número',
            'preco.min' => 'O preço não pode ser negativo',
            'status.required' => 'O status é obrigatório',
            'status.in' => 'O status deve ser disponivel ou indisponivel',
            'observacao.max' => 'A observação não pode ter mais de 500 caracteres',
            'categoria_id.required' => 'A categoria é obrigatória',
            'categoria_id.exists' => 'A categoria informada não existe',
        ];
    }
} 