<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comanda;
use App\Models\Produto;
use App\Models\PedidoProduto;
use App\Models\Pedido;
use App\Services\EstoqueService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * Controlador para gerenciar itens de comandas
 * 
 * Este controlador implementa a lógica para adicionar e remover itens das comandas.
 * Inclui uma funcionalidade de agrupamento automático de itens:
 * - Quando um mesmo produto é adicionado várias vezes à mesma comanda, em vez de
 *   criar múltiplos registros, o sistema atualiza a quantidade do item existente.
 * - Isso melhora a visualização na tela do cozinheiro, que vê apenas um item com
 *   a quantidade total, em vez de múltiplos itens separados.
 * - As observações dos itens são concatenadas se forem adicionadas separadamente.
 */
class ComandaItemController extends Controller
{
    protected $estoqueService;

    public function __construct(EstoqueService $estoqueService)
    {
        $this->estoqueService = $estoqueService;
    }

    /**
     * Adicionar um novo item à comanda
     * 
     * Quando o mesmo produto é adicionado mais de uma vez:
     * - Se já existir o produto no pedido pendente, atualiza a quantidade e concatena observações
     * - Se não existir, cria um novo registro
     * 
     * Isso garante que na tela do cozinheiro os itens iguais serão exibidos agrupados
     * com a quantidade total, em vez de aparecerem como itens separados.
     */
    public function store(Request $request, $id)
    {
        // Validar dados
        $validator = Validator::make($request->all(), [
            'produto_id' => 'required|exists:produtos,id',
            'quantidade' => 'required|integer|min:1',
            'observacao' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Buscar a comanda
        $comanda = Comanda::findOrFail($id);
        
        // Verificar se a comanda está aberta
        if ($comanda->status !== 'aberta') {
            return response()->json(['message' => 'Só é possível adicionar itens a comandas abertas'], 422);
        }
        
        // Buscar o produto
        $produto = Produto::findOrFail($request->produto_id);
        
        // A quantidade a ser baixada do estoque
        $quantidadeParaEstoque = (int)$request->quantidade;
        
        // Verificar se há estoque disponível
        if (!$this->estoqueService->verificarDisponibilidadeEstoque($produto, $quantidadeParaEstoque)) {
            Log::warning('Tentativa de adicionar produto sem estoque suficiente', [
                'produto_id' => $produto->id,
                'produto_nome' => $produto->nome,
                'estoque_atual' => $produto->estoque,
                'quantidade_solicitada' => $quantidadeParaEstoque
            ]);
            
            return response()->json([
                'message' => "Produto {$produto->nome} está esgotado ou com estoque insuficiente!",
                'estoque_atual' => $produto->estoque,
                'quantidade_solicitada' => $quantidadeParaEstoque
            ], 422);
        }
        
        // Verificar se existe um pedido pendente para a comanda, ou criar um novo
        $pedido = Pedido::where('comanda_id', $id)
            ->where('status', 'pendente')
            ->first();
            
        if (!$pedido) {
            $pedido = new Pedido();
            $pedido->comanda_id = $id;
            $pedido->status = 'pendente';
            $pedido->save();
        }
        
        // Verificar se o produto já existe no pedido pendente
        $itemExistente = PedidoProduto::where('pedido_id', $pedido->id)
            ->where('produto_id', $produto->id)
            ->first();
            
        if ($itemExistente) {
            // Atualizar a quantidade e o valor total do item existente
            $itemExistente->quantidade += $request->quantidade;
            $itemExistente->valor_total = $itemExistente->valor_unitario * $itemExistente->quantidade;
            $itemExistente->save();
            
            // Se houver nova observação, atualizar ou concatenar
            if (!empty($request->observacao)) {
                if (!empty($itemExistente->observacao)) {
                    $itemExistente->observacao .= '; ' . $request->observacao;
                } else {
                    $itemExistente->observacao = $request->observacao;
                }
                $itemExistente->save();
            }
            
            $item = $itemExistente;
        } else {
            // Criar um novo item se não existir
            $item = new PedidoProduto();
            $item->pedido_id = $pedido->id;
            $item->produto_id = $produto->id;
            $item->quantidade = $request->quantidade;
            $item->valor_unitario = $produto->preco;
            $item->valor_total = $produto->preco * $request->quantidade;
            $item->observacao = $request->observacao;
            $item->save();
        }
        
        // Atualizar o estoque (registrar saída)
        try {
            $this->estoqueService->removerEstoque(
                $produto, 
                $quantidadeParaEstoque, 
                "Comanda #{$id} - Adição de item"
            );
            
            Log::info('Estoque atualizado para item adicionado na comanda', [
                'comanda_id' => $id,
                'produto_id' => $produto->id,
                'quantidade_removida' => $quantidadeParaEstoque
            ]);
        } catch (\Exception $estoqueException) {
            Log::warning('Não foi possível atualizar o estoque, mas o item foi adicionado à comanda', [
                'erro' => $estoqueException->getMessage(),
                'produto' => $produto->nome,
                'comanda_id' => $id
            ]);
            // Não interrompemos a adição do item se houver problema no estoque
        }
        
        // Atualizar o total da comanda
        $this->atualizarTotalComanda($id);
        
        // Carregar o produto associado para incluir na resposta
        $item->load('produto');
        
        return response()->json($item, 201);
    }

    /**
     * Remover um item da comanda
     */
    public function destroy($comandaId, $itemId)
    {
        // Buscar a comanda
        $comanda = Comanda::findOrFail($comandaId);
        
        // Verificar se a comanda está aberta
        if ($comanda->status !== 'aberta') {
            return response()->json(['message' => 'Só é possível remover itens de comandas abertas'], 422);
        }
        
        // Buscar o item dentro dos pedidos da comanda
        $item = PedidoProduto::whereHas('pedido', function ($query) use ($comandaId) {
            $query->where('comanda_id', $comandaId);
        })->where('id', $itemId)->firstOrFail();
        
        // Armazenar o ID do pedido antes de excluir o item
        $pedidoId = $item->pedido_id;
        $produtoId = $item->produto_id;
        $quantidade = $item->quantidade;
        
        // Tentar adicionar o produto de volta ao estoque
        try {
            $produto = Produto::findOrFail($produtoId);
            $this->estoqueService->adicionarEstoque(
                $produto,
                $quantidade,
                "Comanda #{$comandaId} - Remoção de item"
            );
            
            Log::info('Estoque restaurado para item removido da comanda', [
                'comanda_id' => $comandaId,
                'produto_id' => $produtoId,
                'quantidade_adicionada' => $quantidade
            ]);
        } catch (\Exception $estoqueException) {
            Log::warning('Não foi possível restaurar o estoque, mas o item foi removido da comanda', [
                'erro' => $estoqueException->getMessage(),
                'produto_id' => $produtoId,
                'comanda_id' => $comandaId
            ]);
            // Não interrompemos a remoção do item se houver problema no estoque
        }
        
        // Excluir o item
        $item->delete();
        
        // Verificar se o pedido ainda tem itens
        $itemsCount = PedidoProduto::where('pedido_id', $pedidoId)->count();
        
        // Se não tiver mais itens, remover o pedido
        if ($itemsCount === 0) {
            Pedido::where('id', $pedidoId)->delete();
        }
        
        // Atualizar o total da comanda
        $this->atualizarTotalComanda($comandaId);
        
        return response()->json(null, 204);
    }
    
    /**
     * Atualizar o valor total da comanda
     */
    private function atualizarTotalComanda($comandaId)
    {
        // Calcular o total da comanda com base nos itens de todos os pedidos
        $total = DB::table('pedidos')
            ->join('pedido_produto', 'pedidos.id', '=', 'pedido_produto.pedido_id')
            ->where('pedidos.comanda_id', $comandaId)
            ->sum(DB::raw('pedido_produto.valor_unitario * pedido_produto.quantidade'));
            
        // Atualizar a comanda
        $comanda = Comanda::findOrFail($comandaId);
        $comanda->total = $total;
        $comanda->save();
    }
}
