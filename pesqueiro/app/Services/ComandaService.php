<?php

namespace App\Services;

use App\Models\Comanda;
use App\Models\ComandaPagamento;
use Illuminate\Support\Facades\DB;

class ComandaService
{
    public function criarComanda(array $dados)
    {
        // Definir valores padrão para campos opcionais
        $dados['status'] = $dados['status'] ?? 'aberta';
        $dados['observacao'] = $dados['observacao'] ?? null;
        
        $comanda = Comanda::create([
            "total" => $dados['total'],
            "mesa" => $dados['mesa'],
            "status" => $dados['status'],
            "observacao" => $dados['observacao'] ?? null,
            "cliente" => $dados['cliente'],
        ]);
        
        return $comanda;
    }


    public function editarComanda(array $dados, int $comandaId)
    {

        $comanda = Comanda::find($comandaId);

        if (!$comanda) 
        {
            return response()->json(['error' => 'Comanda não encontrada'], 404);
        }

        $comanda->total = $dados['total'];
        $comanda->mesa = $dados['mesa'];
        $comanda->status = $dados['status'] ?? $comanda->status;
        $comanda->observacao = $dados['observacao'] ?? $comanda->observacao;
        $comanda->cliente = $dados['cliente'];

        $comanda->save();

        return $comanda;
    
    }


    public function fecharComanda(int $comandaId, array $dados = [])
    {
        try {
            // Buscar a comanda usando query builder para evitar problemas com Eloquent
            DB::beginTransaction();
            
            $comanda = Comanda::findOrFail($comandaId);
            
            // Atualizar usando arrays em vez de propriedades do objeto
            $dadosAtualizacao = [
                'status' => 'fechada'
            ];
            
            // Adicionar informações de pagamento, se fornecidas
            if (isset($dados['metodo_pagamento'])) {
                $dadosAtualizacao['metodo_pagamento'] = $dados['metodo_pagamento'];
            }
            
            if (isset($dados['pessoas']) && is_numeric($dados['pessoas']) && $dados['pessoas'] > 0) {
                $dadosAtualizacao['pessoas'] = (int) $dados['pessoas'];
            }
            
            // Atualizar usando update em vez de save
            Comanda::where('id', $comandaId)->update($dadosAtualizacao);
            
            // Processar pagamentos individuais, se fornecidos
            if (isset($dados['pagamentos']) && is_array($dados['pagamentos']) && count($dados['pagamentos']) > 0) {
                foreach ($dados['pagamentos'] as $pagamento) {
                    // Verificar se o pagamento já tem um ID (já existe no banco)
                    if (isset($pagamento['id']) && $pagamento['id']) {
                        // Atualizar status para 'pago' se ainda não estiver
                        ComandaPagamento::where('id', $pagamento['id'])
                            ->where('comanda_id', $comandaId)
                            ->where('status', 'pendente')
                            ->update(['status' => 'pago']);
                    }
                }
            }
            
            DB::commit();
            
            // Buscar a comanda atualizada com seus pagamentos
            return Comanda::with('pagamentos')->findOrFail($comandaId);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function cancelarComanda(int $comandaId)
    {
        $comanda = Comanda::findOrFail($comandaId);
        
        // Verificar se a comanda pode ser cancelada (apenas comandas abertas)
        if ($comanda->status !== 'aberta') {
            return response()->json([
                'message' => 'Apenas comandas abertas podem ser canceladas'
            ], 422);
        }
        
        $comanda->status = 'cancelada';
        $comanda->save();

        return $comanda;
    }
}
