<?php

namespace App\Services;

use App\Models\Comanda;

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


    public function fecharComanda(int $comandaId)
    {
        $comanda = Comanda::findOrFail($comandaId);
        $comanda->status = 'paga';
        $comanda->save();

        return $comanda;
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
