<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Atualiza o perfil do usuário
     */
    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();
        
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->save();
        
        return response()->json([
            'message' => 'Perfil atualizado com sucesso',
            'user' => $user
        ]);
    }
    
    /**
     * Altera a senha do usuário
     */
    public function changePassword(ChangePasswordRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();
        
        // Verifica se a senha atual está correta
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'A senha atual está incorreta'
            ], 422);
        }
        
        $user->password = Hash::make($validated['password']);
        $user->save();
        
        return response()->json([
            'message' => 'Senha alterada com sucesso'
        ]);
    }
    
    /**
     * Mostra o perfil do usuário
     */
    public function showProfile(Request $request)
    {
        return response()->json($request->user());
    }
    
    /**
     * Lista todos os usuários (apenas para gerentes)
     */
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }
} 