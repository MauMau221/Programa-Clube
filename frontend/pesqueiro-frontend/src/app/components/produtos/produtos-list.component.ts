import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProdutoService } from '../../services/produto.service';
import { EstoqueService } from '../../services/estoque.service';
import { Produto } from '../../models/comanda.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-produtos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './produtos-list.component.html',
  styleUrls: ['./produtos-list.component.scss']
})
export class ProdutosListComponent implements OnInit, OnDestroy {
  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  isLoading = false;
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | '' = '';
  termoBusca = '';
  filtroDisponibilidade = 'todos';
  
  private produtoAtualizadoSubscription: Subscription | null = null;
  private estoqueAtualizadoSubscription: Subscription | null = null;

  constructor(
    private produtoService: ProdutoService, 
    private estoqueService: EstoqueService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carregarProdutos();
    
    // Inscrever-se para atualizações de produtos (especialmente estoque)
    this.produtoAtualizadoSubscription = this.produtoService.produtoAtualizado$.subscribe(
      produtoId => {
        if (produtoId) {
          console.log(`Recebida notificação de produto atualizado: ${produtoId}`);
          this.atualizarEstoqueProduto(produtoId);
        }
      }
    );
    
    // Inscrever-se para atualizações específicas de estoque
    this.estoqueAtualizadoSubscription = this.estoqueService.estoqueAtualizado$.subscribe(
      data => {
        if (data && data.produtoId) {
          console.log(`Recebida notificação de estoque atualizado: Produto ${data.produtoId}, Qtd: ${data.quantidade}`);
          
          // Atualizar o produto diretamente sem fazer nova requisição
          const produto = this.produtos.find(p => p.id === data.produtoId);
          if (produto) {
            console.log(`Atualizando estoque do produto ${produto.nome} de ${produto.quantidade_estoque} para ${data.quantidade}`);
            produto.quantidade_estoque = data.quantidade;
          }
          
          // Atualizar também na lista filtrada
          const produtoFiltrado = this.produtosFiltrados.find(p => p.id === data.produtoId);
          if (produtoFiltrado) {
            produtoFiltrado.quantidade_estoque = data.quantidade;
          }
          
          // Forçar detecção de mudanças criando nova referência dos arrays
          this.produtosFiltrados = [...this.produtosFiltrados];
          this.produtos = [...this.produtos];
        }
      }
    );
  }
  
  ngOnDestroy(): void {
    if (this.produtoAtualizadoSubscription) {
      this.produtoAtualizadoSubscription.unsubscribe();
    }
    
    if (this.estoqueAtualizadoSubscription) {
      this.estoqueAtualizadoSubscription.unsubscribe();
    }
  }
  
  atualizarEstoqueProduto(produtoId: number): void {
    console.log(`Iniciando atualização do estoque para produto ID: ${produtoId}`);
    
    // Primeiro encontrar o produto na lista
    const produto = this.produtos.find(p => p.id === produtoId);
    if (!produto) {
      console.warn(`Produto ${produtoId} não encontrado na lista de produtos.`);
      return;
    }
    
    // Buscar o estoque atualizado do produto
    this.produtoService.atualizarEstoqueProduto(produtoId).subscribe({
      next: (estoqueAtual) => {
        console.log(`Estoque atualizado do produto ${produtoId} (${produto.nome}): ${estoqueAtual}`);
        
        // Atualizar o produto na lista
        if (estoqueAtual !== null && estoqueAtual !== undefined) {
          produto.quantidade_estoque = estoqueAtual;
          console.log(`Quantidade atualizada no objeto do produto: ${produto.quantidade_estoque}`);
        } else {
          console.warn(`Recebido valor inválido para estoque: ${estoqueAtual}`);
        }
        
        // Atualizar a lista filtrada também
        const produtoFiltrado = this.produtosFiltrados.find(p => p.id === produtoId);
        if (produtoFiltrado && estoqueAtual !== null && estoqueAtual !== undefined) {
          produtoFiltrado.quantidade_estoque = estoqueAtual;
          console.log(`Quantidade atualizada no objeto filtrado: ${produtoFiltrado.quantidade_estoque}`);
        }
        
        // Forçar detecção de mudanças criando nova referência dos arrays
        this.produtosFiltrados = [...this.produtosFiltrados];
        this.produtos = [...this.produtos];
        
        // Recarregar detalhes completos do produto
        this.produtoService.getProduto(produtoId).subscribe({
          next: (produtoAtualizado) => {
            console.log(`Detalhes completos do produto ${produtoId} recebidos:`, produtoAtualizado);
            
            // Encontrar índice do produto nas listas
            const indexProdutos = this.produtos.findIndex(p => p.id === produtoId);
            const indexFiltrados = this.produtosFiltrados.findIndex(p => p.id === produtoId);
            
            // Preservar o valor de quantidade_estoque se vier como null
            if (produtoAtualizado.quantidade_estoque === null && indexProdutos >= 0) {
              produtoAtualizado.quantidade_estoque = this.produtos[indexProdutos].quantidade_estoque;
            }
            
            // Substituir o objeto completamente
            if (indexProdutos >= 0) {
              this.produtos[indexProdutos] = produtoAtualizado;
              console.log(`Produto atualizado na lista principal. Novo estoque: ${produtoAtualizado.quantidade_estoque}`);
            }
            
            if (indexFiltrados >= 0) {
              this.produtosFiltrados[indexFiltrados] = produtoAtualizado;
              console.log(`Produto atualizado na lista filtrada. Novo estoque: ${produtoAtualizado.quantidade_estoque}`);
            }
            
            // Forçar detecção de mudanças atualizando as referências dos arrays
            this.produtosFiltrados = [...this.produtosFiltrados];
            this.produtos = [...this.produtos];
          },
          error: (erro) => {
            console.error(`Erro ao buscar detalhes atualizados do produto ${produtoId}:`, erro);
          }
        });
      },
      error: (error) => {
        console.error(`Erro ao atualizar estoque do produto ${produtoId}:`, error);
      }
    });
  }

  carregarProdutos(): void {
    this.isLoading = true;
    this.produtoService.getProdutos().subscribe({
      next: (produtos) => {
        console.log('Resposta original produtos:', JSON.stringify(produtos));
        console.log('Produtos recebidos na listagem:', produtos);
        
        if (produtos.length > 0) {
          const primeiroProduto = produtos[0];
          console.log('Detalhes do primeiro produto:');
          console.log('ID:', primeiroProduto.id);
          console.log('Nome:', primeiroProduto.nome);
          console.log('Preço:', primeiroProduto.preco, typeof primeiroProduto.preco);
          console.log('Categoria ID:', primeiroProduto.categoria_id, typeof primeiroProduto.categoria_id);
          console.log('Status:', primeiroProduto.status, typeof primeiroProduto.status);
          console.log('Estoque mínimo:', primeiroProduto.estoque_minimo, typeof primeiroProduto.estoque_minimo);
          console.log('Observação:', primeiroProduto.observacao, typeof primeiroProduto.observacao);
          console.log('Todos os campos do produto:', Object.keys(primeiroProduto));
        }
        
        // Garantir que todos os produtos tenham os campos necessários
        this.produtos = produtos.map(produto => {
          // Se não tiver preço, definimos um valor padrão
          if (produto.preco === undefined || produto.preco === null) {
            console.log(`Produto ${produto.id} sem preço definido`);
            produto.preco = 0;
          }
          
          // Se não tiver status, definimos como indisponível
          if (produto.status === undefined || produto.status === null) {
            console.log(`Produto ${produto.id} sem status definido`);
            produto.status = 'indisponivel';
          }
          
          return produto;
        });
        
        // Aplicar filtros
        this.aplicarFiltros();
        
        // Buscar saldo de estoque atualizado para todos os produtos
        console.log('Buscando saldo de estoque atualizado para todos os produtos');
        this.produtoService.atualizarEstoqueTodosProdutos(this.produtos);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.mensagem = 'Erro ao carregar produtos. Tente novamente mais tarde.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.produtos];
    
    // Filtro por nome ou observacao
    if (this.termoBusca) {
      const termo = this.termoBusca.toLowerCase();
      resultado = resultado.filter(p => 
        p.nome.toLowerCase().includes(termo) || 
        (p.observacao && p.observacao.toLowerCase().includes(termo))
      );
    }
    
    // Filtro por disponibilidade
    if (this.filtroDisponibilidade !== 'todos') {
      const disponivel = this.filtroDisponibilidade === 'disponiveis';
      resultado = resultado.filter(p => p.status === (disponivel ? 'disponivel' : 'indisponivel'));
    }
    
    this.produtosFiltrados = resultado;
  }

  toggleDisponibilidade(evento: Event, produto: Produto): void {
    evento.stopPropagation();
    
    this.isLoading = true;
    const novoStatus = produto.status === 'disponivel' ? 'indisponivel' : 'disponivel';
    
    console.log(`Alterando disponibilidade do produto ${produto.id} (${produto.nome}) para: ${novoStatus}`);
    
    this.produtoService.atualizarDisponibilidade(produto.id, novoStatus).subscribe({
      next: (produtoAtualizado) => {
        console.log(`Disponibilidade atualizada com sucesso:`, produtoAtualizado);
        produto.status = novoStatus;
        this.isLoading = false;
        this.mensagem = `Produto ${produto.nome} marcado como ${novoStatus === 'disponivel' ? 'disponível' : 'indisponível'}.`;
        this.tipoMensagem = 'success';
      },
      error: (err) => {
        console.error('Erro ao alterar disponibilidade:', err);
        this.isLoading = false;
        this.mensagem = `Erro ao alterar disponibilidade do produto ${produto.nome}.`;
        this.tipoMensagem = 'danger';
      }
    });
  }

  editarProduto(id: number): void {
    this.router.navigate(['/produtos/editar', id]);
  }

  excluirProduto(evento: Event, produto: Produto): void {
    evento.stopPropagation();
    
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }
    
    this.isLoading = true;
    this.produtoService.excluirProduto(produto.id).subscribe({
      next: () => {
        this.produtos = this.produtos.filter(p => p.id !== produto.id);
        this.aplicarFiltros();
        this.mensagem = 'Produto excluído com sucesso!';
        this.tipoMensagem = 'success';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao excluir produto:', error);
        this.mensagem = 'Erro ao excluir produto. Tente novamente.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  limparMensagem(): void {
    this.mensagem = '';
    this.tipoMensagem = '';
  }
} 