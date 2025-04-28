<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\ComandaController;
use App\Http\Controllers\Api\PedidoController;
use App\Http\Controllers\Api\ProdutoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Rotas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rotas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Rotas para garçons e gerentes
    Route::middleware('role:garcom,gerente')->group(function () {
        //Comanda
        Route::get('/comanda', [ComandaController::class, "index"]);
        Route::post('/comanda', [ComandaController::class, "store"]);
        Route::put('/comanda/{id}', [ComandaController::class, "update"]);
        Route::put('/comanda/close/{id}', [ComandaController::class, "close"]);

        //Pedido
        Route::post('/pedido/{id}', [PedidoController::class, "commandorder"]);
    });

    // Rotas para cozinheiros e gerentes
    Route::middleware('role:cozinheiro,gerente')->group(function () {
//Produtos
Route::get('/produto', [ProdutoController::class, "index"]);
Route::post('/produto', [ProdutoController::class, "store"]);
Route::get('/produto/{id}', [ProdutoController::class, "show"]);
Route::put('/produto/{id}', [ProdutoController::class, "update"]);
Route::delete('/produto/{id}', [ProdutoController::class, "destroy"]);

//Categoria
Route::get('/categoria', [CategoriaController::class, "index"]);
Route::post('/categoria', [CategoriaController::class, "store"]);
Route::get('/categoria/{id}', [CategoriaController::class, "show"]);
Route::put('/categoria/{id}', [CategoriaController::class, "update"]);
Route::delete('/categoria/{id}', [CategoriaController::class, "destroy"]);

//Pedido
        Route::put('/pedido/{id}/status', [PedidoController::class, "updateStatus"]);
    });
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
