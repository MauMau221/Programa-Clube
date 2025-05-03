import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProdutoService } from '../../services/produto.service';
import { Produto } from '../../models/comanda.model';

@Component({
  selector: 'app-estoque-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './estoque-list.component.html',
  styleUrls: ['./estoque-list.component.scss']
})
export class EstoqueListComponent implements OnInit {
  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  isLoading = false;
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | '' = '';
  termoBusca = '';
  filtroDisponibilidade = 'todos';
  filtroEstoque = 'todos';

  constructor(private produtoService: ProdutoService) { }

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.isLoading = true;
    this.produtoService.getProdutos().subscribe({
      next: (produtos) => {
        console.log('Produtos retornados para o estoque:', produtos);
        
        // Garantir que todos os produtos tenham os campos necessários
        this.produtos = produtos.map(produto => {
          // Se não tiver preço, definimos um valor padrão
          if (produto.preco === undefined || produto.preco === null) {
            console.log(`Produto ${produto.id} sem preço definido no estoque`);
            produto.preco = 0;
          }
          
          // Se não tiver status, definimos como indisponível
          if (produto.status === undefined || produto.status === null) {
            console.log(`Produto ${produto.id} sem status definido no estoque`);
            produto.status = 'indisponivel';
          }
          
          // Se não tiver quantidade em estoque, definimos como 0
          if (produto.quantidade_estoque === undefined || produto.quantidade_estoque === null) {
            console.log(`Produto ${produto.id} sem quantidade de estoque definida`);
            produto.quantidade_estoque = 0;
          }
          
          // Se não tiver estoque mínimo, definimos o padrão como 5
          if (produto.estoque_minimo === undefined || produto.estoque_minimo === null) {
            console.log(`Produto ${produto.id} sem estoque mínimo definido`);
            produto.estoque_minimo = 5;
          }
          
          return produto;
        });
        
        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos para estoque:', error);
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