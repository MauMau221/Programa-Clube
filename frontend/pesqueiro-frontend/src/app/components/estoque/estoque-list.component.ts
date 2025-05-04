import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProdutoService } from '../../services/produto.service';
import { Produto } from '../../models/comanda.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-estoque-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './estoque-list.component.html',
  styleUrls: ['./estoque-list.component.scss']
})
export class EstoqueListComponent implements OnInit, OnDestroy {
  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  isLoading = false;
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | '' = '';
  termoBusca = '';
  filtroDisponibilidade = 'todos';
  filtroEstoque = 'todos';
  
  private produtoAtualizadoSubscription: Subscription | null = null;

  constructor(private produtoService: ProdutoService) { }

  ngOnInit(): void {
    this.carregarProdutos();
    
    // Inscrever-se para atualizações de produtos
    this.produtoAtualizadoSubscription = this.produtoService.produtoAtualizado$.subscribe(
      produtoId => {
        if (produtoId) {
          console.log(`EstoqueListComponent: Notificação de atualização para produto ${produtoId}`);
          this.atualizarEstoqueProduto(produtoId);
        }
      }
    );
  }
  
  ngOnDestroy(): void {
    if (this.produtoAtualizadoSubscription) {
      this.produtoAtualizadoSubscription.unsubscribe();
    }
  }
  
  atualizarEstoqueProduto(produtoId: number): void {
    // Primeiro encontrar o produto na lista
    const produto = this.produtos.find(p => p.id === produtoId);
    if (!produto) {
      console.warn(`EstoqueList: Produto ${produtoId} não encontrado na lista de produtos.`);
      return;
    }
    
    console.log(`EstoqueList: Atualizando estoque do produto ${produtoId} (${produto.nome})`);
    
    // Buscar o estoque atualizado do produto
    this.produtoService.atualizarEstoqueProduto(produtoId).subscribe({
      next: (estoqueAtual) => {
        console.log(`EstoqueList: Estoque atualizado do produto ${produtoId}: ${estoqueAtual}`);
        
        // Atualizar o produto na lista
        if (estoqueAtual !== null && estoqueAtual !== undefined) {
          produto.quantidade_estoque = estoqueAtual;
          console.log(`EstoqueList: Quantidade atualizada no objeto: ${produto.quantidade_estoque}`);
        } else {
          console.warn(`EstoqueList: Recebido valor inválido para estoque: ${estoqueAtual}`);
        }
        
        // Atualizar a lista filtrada também
        const produtoFiltrado = this.produtosFiltrados.find(p => p.id === produtoId);
        if (produtoFiltrado && estoqueAtual !== null && estoqueAtual !== undefined) {
          produtoFiltrado.quantidade_estoque = estoqueAtual;
          console.log(`EstoqueList: Quantidade atualizada no objeto filtrado: ${produtoFiltrado.quantidade_estoque}`);
        }
        
        // Aplicar filtros para atualizar a visualização
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error(`EstoqueList: Erro ao atualizar estoque do produto ${produtoId}:`, error);
      }
    });
  }

  carregarProdutos(): void {
    this.isLoading = true;
    this.produtoService.getProdutos().subscribe({
      next: (produtos) => {
        console.log('EstoqueList: Produtos carregados:', produtos.length);
        if (produtos.length > 0) {
          console.log('EstoqueList: Amostra do primeiro produto:', 
            `ID=${produtos[0].id}, Nome=${produtos[0].nome}, Estoque=${produtos[0].quantidade_estoque}`);
        }
        
        this.produtos = produtos;
        this.aplicarFiltros();
        
        // Buscar saldo de estoque atualizado para todos os produtos
        console.log('EstoqueList: Buscando saldo de estoque atualizado para todos os produtos');
        this.produtoService.atualizarEstoqueTodosProdutos(this.produtos);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('EstoqueList: Erro ao carregar produtos:', error);
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
    
    // Filtro por estoque
    if (this.filtroEstoque !== 'todos') {
      switch (this.filtroEstoque) {
        case 'baixo':
          resultado = resultado.filter(p => 
            p.quantidade_estoque !== undefined && 
            p.estoque_minimo !== undefined && 
            p.quantidade_estoque < p.estoque_minimo && 
            p.quantidade_estoque > 0
          );
          break;
        case 'esgotado':
          resultado = resultado.filter(p => p.quantidade_estoque === 0);
          break;
        case 'adequado':
          resultado = resultado.filter(p => 
            p.quantidade_estoque !== undefined && 
            p.estoque_minimo !== undefined && 
            p.quantidade_estoque >= p.estoque_minimo
          );
          break;
      }
    }
    
    this.produtosFiltrados = resultado;
  }

  getClasseEstoque(produto: Produto): string {
    if (!produto.quantidade_estoque && produto.quantidade_estoque !== 0) {
      return 'text-secondary'; // Caso não tenha informação de estoque
    } else if (produto.quantidade_estoque === 0) {
      return 'text-danger';
    } else if (
      produto.quantidade_estoque && 
      produto.estoque_minimo && 
      produto.quantidade_estoque < produto.estoque_minimo
    ) {
      return 'text-warning';
    } else {
      return 'text-success';
    }
  }

  getStatusEstoque(produto: Produto): string {
    if (!produto.quantidade_estoque && produto.quantidade_estoque !== 0) {
      return 'Sem info';
    } else if (produto.quantidade_estoque === 0) {
      return 'Esgotado';
    } else if (
      produto.quantidade_estoque && 
      produto.estoque_minimo && 
      produto.quantidade_estoque < produto.estoque_minimo
    ) {
      return 'Baixo';
    } else {
      return 'Adequado';
    }
  }

  limparMensagem(): void {
    this.mensagem = '';
    this.tipoMensagem = '';
  }
} 