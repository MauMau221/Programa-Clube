<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Comanda;
use App\Models\Pedido;
use App\Models\Produto;
use App\Models\EstoqueSaldo;
use App\Services\EstoqueService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    protected $estoqueService;

    public function __construct(EstoqueService $estoqueService)
    {
        $this->estoqueService = $estoqueService;
    }

    /**
     * Obtém um resumo dos dados para o dashboard
     * 
     * @return \Illuminate\Http\Response
     */
    public function summary()
    {
        try {
            // Obter a data atual
            $hoje = Carbon::today();
            
            // 1. Comandas Ativas - comandas com status 'aberta'
            $comandasAtivas = Comanda::where('status', 'aberta')->count();
            
            // 2. Faturamento Hoje - soma dos totais das comandas fechadas hoje
            $faturamentoHoje = Comanda::whereIn('status', ['fechada', 'paga'])
                ->whereDate('updated_at', $hoje)
                ->sum('total');
                
            // 3. Pedidos Hoje - total de pedidos feitos hoje
            $pedidosHoje = Pedido::whereDate('created_at', $hoje)->count();
            
            // 4. Produtos em Baixa Estoque - produtos com estoque abaixo do mínimo
            $produtosBaixoEstoque = 0;
            $produtos = Produto::all();
            
            foreach ($produtos as $produto) {
                if ($this->estoqueService->verificarEstoqueBaixo($produto)) {
                    $produtosBaixoEstoque++;
                }
            }
            
            return response()->json([
                'comandasAtivas' => $comandasAtivas,
                'faturamentoHoje' => $faturamentoHoje,
                'pedidosHoje' => $pedidosHoje, 
                'produtosBaixoEstoque' => $produtosBaixoEstoque
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao obter dados do dashboard: ' . $e->getMessage()
            ], 500);
        }
    }
} 