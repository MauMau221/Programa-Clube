import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EstoqueService } from '../../services/estoque.service';
import { ProdutoService } from '../../services/produto.service';
import { Produto } from '../../models/comanda.model';

@Component({
  selector: 'app-estoque-baixo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './estoque-baixo.component.html',
  styleUrls: ['./estoque-baixo.component.scss']
})
export class EstoqueBaixoComponent implements OnInit {
  produtos: Produto[] = [];
  isLoading = false;
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | '' = '';

  constructor(
    private estoqueService: EstoqueService,
    private produtoService: ProdutoService
  ) {}

  ngOnInit(): void {
    this.carregarProdutosBaixoEstoque();
  }

  carregarProdutosBaixoEstoque(): void {
    this.isLoading = true;
    this.mensagem = '';
    
    this.estoqueService.getProdutosEstoqueBaixo().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.isLoading = false;
        
        if (produtos.length === 0) {
          this.mensagem = 'Não há produtos com estoque abaixo do mínimo.';
          this.tipoMensagem = 'success';
        }
      },
      error: (error) => {
        console.error('Erro ao carregar produtos com estoque baixo:', error);
        this.mensagem = 'Erro ao carregar produtos com estoque baixo. Tente novamente mais tarde.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  adicionarEstoque(produto: Produto): void {
    // Esta função será implementada na tela de movimentação de estoque
    // Por enquanto, apenas redireciona para a tela de adição de estoque
    // com o ID do produto pré-selecionado
  }

  limparMensagem(): void {
    this.mensagem = '';
    this.tipoMensagem = '';
  }
} 