<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\ComandaController;
use App\Http\Controllers\Api\EstoqueController;
use App\Http\Controllers\Api\PedidoController;
use App\Http\Controllers\Api\ProdutoController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ComandaItemController;
use App\Http\Controllers\Api\ComandaPagamentoController;
use App\Http\Controllers\Api\VendaController;
use App\Http\Controllers\Api\RelatorioController;
use App\Http\Controllers\Api\DashboardController;
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

    // Rota do dashboard
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

    // Rotas de usuário
    Route::prefix('user')->group(function () {
        Route::get('/profile', [UserController::class, 'showProfile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::put('/password', [UserController::class, 'changePassword']);
        Route::get('/list', [UserController::class, 'index'])->middleware('role:gerente');
        Route::get('/funcionarios', [UserController::class, 'funcionarios'])->middleware('role:gerente');
        Route::get('/funcionario/{id}', [UserController::class, 'show'])->middleware('role:gerente');
        Route::put('/funcionario/{id}', [UserController::class, 'update'])->middleware('role:gerente');
        Route::delete('/funcionario/{id}', [UserController::class, 'destroy'])->middleware('role:gerente');
    });

    // Rotas para garçons e gerentes
    Route::middleware('role:garcom,gerente')->group(function () {
        //Comanda
        Route::prefix('comanda')->group(function () {
            Route::get('/', [ComandaController::class, 'index']);
            Route::post('/', [ComandaController::class, 'store']);
            Route::get('/{id}', [ComandaController::class, 'show']);
            Route::put('/{id}', [ComandaController::class, 'update']);
            Route::delete('/{id}', [ComandaController::class, 'destroy']);
            Route::put('/close/{id}', [ComandaController::class, 'close']);
            Route::put('/cancel/{id}', [ComandaController::class, 'cancel']);
            
            // Rotas para itens da comanda
            Route::post('/{id}/item', [ComandaItemController::class, 'store']);
            Route::delete('/{comandaId}/item/{itemId}', [ComandaItemController::class, 'destroy']);
            Route::put('/{comandaId}/item/{itemId}', [ComandaItemController::class, 'update']);
            
            // Verificar pedidos pendentes de envio para a cozinha
            Route::get('/{comandaId}/pedidos-pendentes', [ComandaController::class, 'verificarPedidosPendentes']);
            
            // Rotas para pagamentos individuais
            Route::post('/{id}/pagamento', [ComandaPagamentoController::class, 'store']);
            Route::put('/{comandaId}/pagamento/{pagamentoId}', [ComandaPagamentoController::class, 'update']);
            Route::delete('/{comandaId}/pagamento/{pagamentoId}', [ComandaPagamentoController::class, 'destroy']);
        });

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

    // Rota para vendas diretas
    Route::post('/venda-direta', [VendaController::class, 'vendaDireta']);

    // Relatórios financeiros
    Route::middleware('role:gerente,caixa')->group(function() {
        Route::get('/relatorios/financeiro', [RelatorioController::class, 'financeiro']);
        Route::get('/relatorios/financeiro/por-produto', [RelatorioController::class, 'produtosPorMetodo']);
    });
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rotas para pedidos
Route::get('/pedido', [PedidoController::class, 'index']);
Route::get('/pedido/detalhado', [PedidoController::class, 'listarDetalhados']);
Route::get('/pedido/contar', [PedidoController::class, 'contarPorStatus']);
Route::get('/pedido/{id}', [PedidoController::class, 'show'])->where('id', '[0-9]+');
Route::put('/pedido/{id}/status', [PedidoController::class, 'atualizarStatus'])->where('id', '[0-9]+');
Route::put('/pedido/{id}/enviar-cozinha', [PedidoController::class, 'enviarParaCozinha'])->where('id', '[0-9]+');
Route::put('/pedido/{id}/iniciar-preparo', [PedidoController::class, 'iniciarPreparo'])->where('id', '[0-9]+');
Route::put('/pedido/{id}/finalizar-preparo', [PedidoController::class, 'finalizarPreparo'])->where('id', '[0-9]+');
