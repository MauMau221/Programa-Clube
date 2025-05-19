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
    
    /**
     * Lista todos os funcionários (exceto o usuário logado)
     */
    public function funcionarios(Request $request)
    {
        $usuarioLogado = $request->user();
        $funcionarios = User::where('id', '!=', $usuarioLogado->id)->get();
        
        return response()->json([
            'funcionarios' => $funcionarios
        ]);
    }
    
    /**
     * Mostra os detalhes de um funcionário específico
     */
    public function show($id)
    {
        $funcionario = User::findOrFail($id);
        return response()->json($funcionario);
    }
    
    /**
     * Atualiza os dados de um funcionário
     */
    public function update(Request $request, $id)
    {
        // Validar os dados
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($id)
            ],
            'role' => 'required|in:gerente,garcom,cozinheiro'
        ]);
        
        $funcionario = User::findOrFail($id);
        
        // Atualizar os dados
        $funcionario->name = $validated['name'];
        $funcionario->email = $validated['email'];
        $funcionario->role = $validated['role'];
        $funcionario->save();
        
        return response()->json([
            'message' => 'Funcionário atualizado com sucesso',
            'user' => $funcionario
        ]);
    }
    
    /**
     * Remove um funcionário
     */
    public function destroy($id)
    {
        $funcionario = User::findOrFail($id);
        
        // Verificar se não está tentando excluir a si mesmo
        if (Auth::id() == $id) {
            return response()->json([
                'message' => 'Não é possível excluir seu próprio usuário'
            ], 403);
        }
        
        $funcionario->delete();
        
        return response()->json([
            'message' => 'Funcionário excluído com sucesso'
        ]);
    }
} 