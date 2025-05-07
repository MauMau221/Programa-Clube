<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ComandaItemController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// Rota de teste para verificar a funcionalidade de agrupamento de itens
Route::get('/teste-agrupamento-itens', function () {
    // Esta rota é apenas para fins de teste
    return "Para testar a funcionalidade, adicione itens através da API REST conforme documentado na implementação.";
});
