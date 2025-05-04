<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\ComandaController;
use App\Http\Controllers\Api\EstoqueController;
use App\Http\Controllers\Api\PedidoController;
use App\Http\Controllers\Api\ProdutoController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Rotas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rota pública para produtos disponíveis (sem necessidade de autenticação)
Route::get('/produto/disponiveis', [ProdutoController::class, "produtosDisponiveis"]);

// Rota pública para visualização de pedidos em preparo e prontos (tela para clientes)
Route::get('/pedidos/painel-cliente', [PedidoController::class, "painelCliente"]);

// Rotas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Rotas de usuário
    Route::prefix('user')->group(function () {
        Route::get('/profile', [UserController::class, 'showProfile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::put('/password', [UserController::class, 'changePassword']);
        Route::get('/list', [UserController::class, 'index'])->middleware('role:gerente');
    });

    // Rotas para garçons e gerentes
    Route::middleware('role:garcom,gerente')->group(function () {
        //Comanda
        Route::get('/comanda', [ComandaController::class, "index"]);
        Route::get('/comanda/{id}', [ComandaController::class, "show"]);
        Route::post('/comanda', [ComandaController::class, "store"]);
        Route::put('/comanda/{id}', [ComandaController::class, "update"]);
        Route::put('/comanda/close/{id}', [ComandaController::class, "close"]);
        Route::put('/comanda/{id}/cancelar', [ComandaController::class, "cancel"]);
        Route::get('/comanda/{id}/pedidos-pendentes', [ComandaController::class, "verificarPedidosPendentes"]);
        
        // Itens de Comanda
        Route::post('/comanda/{id}/itens', [PedidoController::class, "adicionarItem"]);
        Route::put('/comanda/{comandaId}/itens/{itemId}', [PedidoController::class, "atualizarItem"]);
        Route::delete('/comanda/{comandaId}/itens/{itemId}', [PedidoController::class, "removerItem"]);

        //Pedido
        Route::post('/pedido/{id}', [PedidoController::class, "commandorder"]);
        Route::put('/pedido/{id}', [PedidoController::class, "update"]);
        Route::put('/pedido/{id}/cancel', [PedidoController::class, "cancel"]);
        Route::put('/pedido/{id}/enviar-cozinha', [PedidoController::class, "enviarParaCozinha"]);
        Route::get('/comanda/{id}/pedidos', [PedidoController::class, "byComanda"]);
        Route::delete('/pedido/{pedidoId}/produto/{produtoId}', [PedidoController::class, "removeProduto"]);
        Route::put('/pedido/{pedidoId}/produto/{produtoId}', [PedidoController::class, "updateQuantidade"]);
    });

    // Rotas para cozinheiros e gerentes
    Route::middleware('role:cozinheiro,gerente')->group(function () {
        //Produtos
        Route::get('/produto', [ProdutoController::class, "index"]);
        Route::post('/produto', [ProdutoController::class, "store"]);
        Route::get('/produto/{id}', [ProdutoController::class, "show"]);
        Route::put('/produto/{id}', [ProdutoController::class, "update"]);
        Route::delete('/produto/{id}', [ProdutoController::class, "destroy"]);
        Route::put('/produto/{id}/disponibilidade', [ProdutoController::class, "atualizarDisponibilidade"]);
        Route::put('/produto/{id}/estoque', [ProdutoController::class, "atualizarEstoque"]);
        Route::put('/produto/{id}/estoque-minimo', [ProdutoController::class, "atualizarEstoqueMinimo"]);
        Route::get('/produto/categoria/{id}', [ProdutoController::class, "porCategoria"]);

        //Pedido
        Route::get('/pedido', [PedidoController::class, 'index']);
        Route::get('/pedido/{id}', [PedidoController::class, 'show']);
        Route::put('/pedido/{id}/status', [PedidoController::class, "updateStatus"]);

        //Categoria
        Route::get('/categoria', [CategoriaController::class, "index"]);
        Route::post('/categoria', [CategoriaController::class, "store"]);
        Route::get('/categoria/{id}', [CategoriaController::class, "show"]);
        Route::put('/categoria/{id}', [CategoriaController::class, "update"]);
        Route::delete('/categoria/{id}', [CategoriaController::class, "destroy"]);
    });

    // Rotas de estoque
    Route::prefix('estoque')->group(function () {
        Route::post('/produtos/{produto}/adicionar', [EstoqueController::class, 'adicionar']);
        Route::post('/produtos/{produto}/remover', [EstoqueController::class, 'remover']);
        Route::get('/produtos/{produto}/historico', [EstoqueController::class, 'historico']);
        Route::get('/produtos/baixo', [EstoqueController::class, 'produtosComEstoqueBaixo']);
    });

    // Rota para obter o saldo atual de estoque
    Route::get('/estoque/produtos/{produtoId}/saldo', [EstoqueController::class, 'getSaldo']);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
