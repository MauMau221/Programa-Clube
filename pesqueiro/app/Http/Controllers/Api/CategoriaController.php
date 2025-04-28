<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoriaRequest;
use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index()
    {
        return Categoria::with('produtos')->get();
    }
  
    public function store(CategoriaRequest $request)
    {
        $categoria = Categoria::create($request->validated());
        return response()->json($categoria, 201);
    }
   
    public function show(string $id)
    {
        $categoria = Categoria::with('produtos')->findOrFail($id);
        return response()->json($categoria, 200);
    }

    public function update(CategoriaRequest $request, string $id)
    {
        $categoria = Categoria::findOrFail($id);
        $categoria->update($request->validated());
        return response()->json($categoria, 200);
    }
   
    public function destroy(string $id)
    {
        $categoria = Categoria::findOrFail($id);
        $categoria->delete();
        return response()->json(null, 204);
    }
}
