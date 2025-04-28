<?php

namespace App\Services;

use App\Models\Comanda;

class ComandaService
{
    public function criarComanda(array $dados)
    {
        Comanda::create([
            "total" => $dados['total'],
            "mesa" => $dados['mesa'],
            "status" => $dados['status'],
            "observacao" => $dados['observacao'],
            "cliente" => $dados['cliente'],
        ]);
        return response()->json(["Comanda criada com sucesso"], 201);
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
        $comanda->status = $dados['status'];
        $comanda->observacao = $dados['observacao'];
        $comanda->cliente = $dados['cliente'];

        $comanda->save();

        return response()->json(["Tudo certo"], 200);
    
    }


    public function fecharComanda(int $comandaId)
    {
        $comanda = Comanda::findOrFail($comandaId);
        $comanda->status = 'paga';
        $comanda->save();

        return response()->json(["Comanda paga"], 200);
    }
}
