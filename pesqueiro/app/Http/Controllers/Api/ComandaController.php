<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ComandaRequest;
use App\Models\Comanda;
use App\Services\ComandaService;
use Illuminate\Http\Request;

class ComandaController extends Controller
{
    protected $comandaService;

    public function __construct(ComandaService $comandaService)
    {
        $this->comandaService = $comandaService;
    }

    public function index()
    {
        $comandas = Comanda::all();
        return response()->json($comandas, 200);
    }

    public function store(ComandaRequest $request)
    {
        $dados = $request->validated();
        $comanda = $this->comandaService->criarComanda($dados);
        return response()->json($comanda, 201);
    }

    public function show(string $id)
    {
        $comanda = Comanda::with('pedidos.produtos')->findOrFail($id);
        
        // Transformar dados dos pedidos para itens da comanda
        $itens = [];
        foreach ($comanda->pedidos as $pedido) {
            foreach ($pedido->produtos as $produto) {
                $itens[] = [
                    'id' => $produto->pivot->id,
                    'comanda_id' => $comanda->id,
                    'produto_id' => $produto->id,
                    'produto' => $produto,
                    'quantidade' => $produto->pivot->quantidade,
                    'valor_unitario' => $produto->preco,
                    'valor_total' => $produto->preco * $produto->pivot->quantidade,
                    'observacao' => $produto->pivot->observacao ?? null,
                    'created_at' => $produto->pivot->created_at,
                    'updated_at' => $produto->pivot->updated_at
                ];
            }
        }
        
        // Adicionar os itens à resposta
        $resposta = $comanda->toArray();
        $resposta['itens'] = $itens;
        
        return response()->json($resposta, 200);
    }

    public function update(ComandaRequest $request, string $comandaId)
    {
        $dados = $request->validated();
        $comanda = $this->comandaService->editarComanda($dados, $comandaId);
        return response()->json($comanda, 200);
    }

    public function close(string $comandaId)
    {
        $comanda = $this->comandaService->fecharComanda($comandaId);
        return response()->json($comanda, 200);
    }

    public function cancel(string $comandaId)
    {
        $comanda = $this->comandaService->cancelarComanda($comandaId);
        return response()->json($comanda, 200);
    }
}
