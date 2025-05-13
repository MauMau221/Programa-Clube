<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:255',
            'status' => 'required|in:disponivel,indisponivel',
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome é obrigatório',
            'nome.max' => 'O nome não pode ter mais de 255 caracteres',
            'status.required' => 'O status é obrigatório',
            'status.in' => 'O status deve ser disponivel ou indisponivel',
        ];
    }
} 