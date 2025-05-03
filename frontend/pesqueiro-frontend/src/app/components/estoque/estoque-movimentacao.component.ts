import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EstoqueService } from '../../services/estoque.service';
import { ProdutoService } from '../../services/produto.service';
import { Produto } from '../../models/comanda.model';

@Component({
  selector: 'app-estoque-movimentacao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './estoque-movimentacao.component.html',
  styleUrls: ['./estoque-movimentacao.component.scss']
})
export class EstoqueMovimentacaoComponent implements OnInit {
  movimentacaoForm: FormGroup;
  produtos: Produto[] = [];
  produtoSelecionado: Produto | null = null;
  isLoading = false;
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | '' = '';
  tipoMovimentacao: 'entrada' | 'saida' = 'entrada';

  constructor(
    private fb: FormBuilder,
    private estoqueService: EstoqueService,
    private produtoService: ProdutoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.movimentacaoForm = this.fb.group({
      produto_id: ['', Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      motivo: ['']
    });
  }

  ngOnInit(): void {
    this.carregarProdutos();
    
    // Verifica se foi passado um ID de produto na rota
    const produtoId = this.route.snapshot.params['id'];
    if (produtoId) {
      this.movimentacaoForm.patchValue({ produto_id: produtoId });
      this.carregarDetalhesProduto(produtoId);
    }
  }

  carregarProdutos(): void {
    this.isLoading = true;
    this.produtoService.getProdutos().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
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

  carregarDetalhesProduto(produtoId: number): void {
    this.isLoading = true;
    this.produtoService.getProduto(produtoId).subscribe({
      next: (produto) => {
        this.produtoSelecionado = produto;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes do produto:', error);
        this.mensagem = 'Erro ao carregar detalhes do produto. Tente novamente mais tarde.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  onChangeProduto(): void {
    const produtoId = this.movimentacaoForm.get('produto_id')?.value;
    if (produtoId) {
      this.carregarDetalhesProduto(produtoId);
    } else {
      this.produtoSelecionado = null;
    }
  }

  setTipoMovimentacao(tipo: 'entrada' | 'saida'): void {
    this.tipoMovimentacao = tipo;
  }

  onSubmit(): void {
    if (this.movimentacaoForm.invalid) {
      this.movimentacaoForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const produtoId = Number(this.movimentacaoForm.get('produto_id')?.value);
    const quantidade = Number(this.movimentacaoForm.get('quantidade')?.value);
    const motivo = this.movimentacaoForm.get('motivo')?.value;

    if (this.tipoMovimentacao === 'entrada') {
      this.adicionarEstoque(produtoId, quantidade, motivo);
    } else {
      this.removerEstoque(produtoId, quantidade, motivo);
    }
  }

  adicionarEstoque(produtoId: number, quantidade: number, motivo?: string): void {
    this.estoqueService.adicionarEstoque(produtoId, quantidade, motivo).subscribe({
      next: () => {
        this.isLoading = false;
        this.mensagem = `${quantidade} unidades adicionadas ao estoque com sucesso!`;
        this.tipoMensagem = 'success';
        this.resetForm();
        
        // Recarrega o produto para exibir o estoque atualizado
        if (produtoId) {
          this.carregarDetalhesProduto(produtoId);
        }
      },
      error: (error) => {
        console.error('Erro ao adicionar estoque:', error);
        this.mensagem = 'Erro ao adicionar estoque. Tente novamente.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  removerEstoque(produtoId: number, quantidade: number, motivo?: string): void {
    this.estoqueService.removerEstoque(produtoId, quantidade, motivo).subscribe({
      next: () => {
        this.isLoading = false;
        this.mensagem = `${quantidade} unidades removidas do estoque com sucesso!`;
        this.tipoMensagem = 'success';
        this.resetForm();
        
        // Recarrega o produto para exibir o estoque atualizado
        if (produtoId) {
          this.carregarDetalhesProduto(produtoId);
        }
      },
      error: (error) => {
        console.error('Erro ao remover estoque:', error);
        this.mensagem = 'Erro ao remover estoque. Tente novamente.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  resetForm(): void {
    // Mantém o produto selecionado, mas reseta a quantidade e motivo
    const produtoId = this.movimentacaoForm.get('produto_id')?.value;
    this.movimentacaoForm.reset({
      produto_id: produtoId,
      quantidade: 1,
      motivo: ''
    });
  }

  limparMensagem(): void {
    this.mensagem = '';
    this.tipoMensagem = '';
  }
} 