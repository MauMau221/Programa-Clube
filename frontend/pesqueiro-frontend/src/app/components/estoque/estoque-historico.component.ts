import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { EstoqueService } from '../../services/estoque.service';
import { ProdutoService } from '../../services/produto.service';
import { EstoqueHistorico, Produto } from '../../models/comanda.model';

@Component({
  selector: 'app-estoque-historico',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './estoque-historico.component.html',
  styleUrls: ['./estoque-historico.component.scss']
})
export class EstoqueHistoricoComponent implements OnInit {
  produtoId!: number;
  produto: Produto | null = null;
  historico: EstoqueHistorico[] = [];
  isLoading = false;
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | 'info' | '' = '';

  constructor(
    private estoqueService: EstoqueService,
    private produtoService: ProdutoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.produtoId = Number(this.route.snapshot.params['id']);
    if (this.produtoId) {
      this.carregarProduto();
      this.carregarHistorico();
    } else {
      this.mensagem = 'ID do produto não informado.';
      this.tipoMensagem = 'danger';
    }
  }

  carregarProduto(): void {
    this.isLoading = true;
    this.produtoService.getProduto(this.produtoId).subscribe({
      next: (produto) => {
        this.produto = produto;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produto:', error);
        this.mensagem = 'Erro ao carregar produto. Tente novamente mais tarde.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  carregarHistorico(): void {
    this.isLoading = true;
    this.estoqueService.getHistoricoEstoque(this.produtoId).subscribe({
      next: (historico) => {
        this.historico = historico;
        this.isLoading = false;
        
        if (historico.length === 0) {
          this.mensagem = 'Não há registros de movimentação de estoque para este produto.';
          this.tipoMensagem = 'info';
        }
      },
      error: (error) => {
        console.error('Erro ao carregar histórico de estoque:', error);
        this.mensagem = 'Erro ao carregar histórico de estoque. Tente novamente mais tarde.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  formatarData(dataString: string): string {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  }

  limparMensagem(): void {
    this.mensagem = '';
    this.tipoMensagem = '';
  }
} 