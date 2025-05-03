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
        $comanda = Comanda::findOrFail($id);
        return response()->json($comanda, 200);
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
}
