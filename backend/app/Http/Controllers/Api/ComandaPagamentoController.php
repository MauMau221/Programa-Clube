<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comanda;
use App\Models\ComandaPagamento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ComandaPagamentoController extends Controller
{
    /**
     * Adicionar um novo pagamento à comanda
     */
    public function store(Request $request, $id)
    {
        // Validar dados
        $validator = Validator::make($request->all(), [
            'metodo_pagamento' => 'required|string',
            'valor' => 'required|numeric|min:0.01',
            'status' => 'sometimes|required|in:pendente,pago',
            'observacao' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verificar se a comanda existe
        $comanda = Comanda::findOrFail($id);
        
        // Verificar se a comanda está aberta
        if ($comanda->status !== 'aberta') {
            return response()->json(['message' => 'Só é possível adicionar pagamentos a comandas abertas'], 422);
        }
        
        // Criar o pagamento
        $pagamento = new ComandaPagamento($request->all());
        $pagamento->comanda_id = $id;
        $pagamento->save();
        
        return response()->json($pagamento, 201);
    }

    /**
     * Atualizar o status do pagamento
     */
    public function update(Request $request, $comandaId, $pagamentoId)
    {
        // Validar dados
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pendente,pago'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Buscar o pagamento
        $pagamento = ComandaPagamento::where('comanda_id', $comandaId)
            ->where('id', $pagamentoId)
            ->firstOrFail();
        
        // Atualizar o status
        $pagamento->status = $request->status;
        $pagamento->save();
        
        return response()->json($pagamento, 200);
    }

    /**
     * Remover um pagamento
     */
    public function destroy($comandaId, $pagamentoId)
    {
        // Buscar o pagamento
        $pagamento = ComandaPagamento::where('comanda_id', $comandaId)
            ->where('id', $pagamentoId)
            ->firstOrFail();
        
        // Excluir o pagamento
        $pagamento->delete();
        
        return response()->json(null, 204);
    }
}
