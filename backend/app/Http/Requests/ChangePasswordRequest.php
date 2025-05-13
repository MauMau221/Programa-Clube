<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string'
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required' => 'A senha atual é obrigatória',
            'password.required' => 'A nova senha é obrigatória',
            'password.min' => 'A nova senha deve ter no mínimo 8 caracteres',
            'password.confirmed' => 'A confirmação da nova senha não corresponde',
            'password_confirmation.required' => 'A confirmação da nova senha é obrigatória'
        ];
    }
} 