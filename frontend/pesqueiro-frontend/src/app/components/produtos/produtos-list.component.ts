import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProdutoService } from '../../services/produto.service';
import { Produto } from '../../models/comanda.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-produtos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './produtos-list.component.html',
  styleUrls: ['./produtos-list.component.scss']
})
export class ProdutosListComponent implements OnInit {
  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  isLoading = false;
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | '' = '';
  termoBusca = '';
  filtroDisponibilidade = 'todos';

  constructor(private produtoService: ProdutoService, private router: Router) { }

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.isLoading = true;
    this.produtoService.getProdutos().subscribe({
      next: (produtos) => {
        console.log('Produtos recebidos na listagem:', produtos);
        
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
        
        this.aplicarFiltros();
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
    
    this.produtoService.atualizarDisponibilidade(produto.id, novoStatus).subscribe({
      next: (produtoAtualizado) => {
        produto.status = novoStatus;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao alterar disponibilidade:', err);
        this.isLoading = false;
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