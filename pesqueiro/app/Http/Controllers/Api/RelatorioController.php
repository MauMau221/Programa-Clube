<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Comanda;
use App\Models\PedidoProduto;
use App\Models\Pedido;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RelatorioController extends Controller
{
    public function financeiro(Request $request)
    {
        $dataInicio = $request->query('dataInicio');
        $dataFim = $request->query('dataFim');

        $query = Comanda::query()
            ->where('status', 'fechada');

        if ($dataInicio) {
            // Convertendo para Carbon e definindo hora inicial
            $dataInicioCarbon = Carbon::parse($dataInicio)->startOfDay();
            $query->where('updated_at', '>=', $dataInicioCarbon);
        }
        if ($dataFim) {
            // Convertendo para Carbon e definindo hora final
            $dataFimCarbon = Carbon::parse($dataFim)->endOfDay();
            $query->where('updated_at', '<=', $dataFimCarbon);
        }

        $comandas = $query->get();

        $totalVendido = $comandas->sum('total');
        $porMetodo = $comandas->groupBy('metodo_pagamento')->map(function ($group, $metodo) {
            return [
                'metodo' => $metodo ? $metodo : 'Não especificado',
                'valor' => $group->sum('total')
            ];
        })->values();

        return response()->json([
            'totalVendido' => $totalVendido,
            'porMetodo' => $porMetodo
        ]);
    }
    
    public function produtosPorMetodo(Request $request)
    {
        $metodoPagamento = $request->query('metodo_pagamento');
        $dataInicio = $request->query('dataInicio');
        $dataFim = $request->query('dataFim');
        
        if (!$metodoPagamento) {
            return response()->json(['error' => 'Método de pagamento é obrigatório'], 400);
        }
        
        // Buscar comandas do método de pagamento especificado
        $query = Comanda::query()
            ->where('status', 'fechada');
            
        // Se o método for 'Não especificado', buscar comandas sem método definido
        if ($metodoPagamento === 'Não especificado') {
            $query->whereNull('metodo_pagamento');
        } else {
            $query->where('metodo_pagamento', $metodoPagamento);
        }
            
        if ($dataInicio) {
            // Convertendo para Carbon e definindo hora inicial
            $dataInicioCarbon = Carbon::parse($dataInicio)->startOfDay();
            $query->where('updated_at', '>=', $dataInicioCarbon);
        }
        if ($dataFim) {
            // Convertendo para Carbon e definindo hora final
            $dataFimCarbon = Carbon::parse($dataFim)->endOfDay();
            $query->where('updated_at', '<=', $dataFimCarbon);
        }
        
        // IDs das comandas encontradas
        $comandaIds = $query->pluck('id')->toArray();
        
        if (empty($comandaIds)) {
            return response()->json(['produtos' => []]);
        }
        
        // Buscar os pedidos dessas comandas
        $pedidoIds = Pedido::whereIn('comanda_id', $comandaIds)->pluck('id')->toArray();
        
        if (empty($pedidoIds)) {
            return response()->json(['produtos' => []]);
        }
        
        // Buscar os produtos vendidos, agrupando por produto
        $produtos = DB::table('pedido_produto')
            ->join('produtos', 'pedido_produto.produto_id', '=', 'produtos.id')
            ->whereIn('pedido_produto.pedido_id', $pedidoIds)
            ->select(
                'produtos.id',
                'produtos.nome',
                DB::raw('SUM(pedido_produto.quantidade) as quantidade'),
                DB::raw('SUM(pedido_produto.valor_total) as valor_total')
            )
            ->groupBy('produtos.id', 'produtos.nome')
            ->orderBy('valor_total', 'desc')
            ->get();
            
        return response()->json([
            'produtos' => $produtos
        ]);
    }
} 