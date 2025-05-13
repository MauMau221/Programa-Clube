import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EstoqueService } from '../../services/estoque.service';
import { ProdutoService } from '../../services/produto.service';
import { Produto } from '../../models/comanda.model';
import { EstoqueResponse } from '../../models/estoque.model';
import { NotificacaoService } from '../../services/notificacao.service';

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
    private route: ActivatedRoute,
    private notificacaoService: NotificacaoService
  ) {
    this.movimentacaoForm = this.fb.group({
      produto_id: ['', Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      motivo: ['', Validators.required]
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
    console.log(`Recarregando detalhes do produto ID: ${produtoId}`);
    this.produtoService.getProduto(produtoId).subscribe({
      next: (produto) => {
        console.log(`Detalhes do produto ID ${produtoId} recebidos:`, produto);
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
      next: (response) => {
        this.isLoading = false;
        this.mensagem = `${quantidade} unidades adicionadas ao estoque com sucesso!`;
        this.tipoMensagem = 'success';
        
        console.log(`Estoque adicionado com sucesso. Resposta:`, response);
        
        // Atualizar a quantidade de estoque do produto selecionado
        if (this.produtoSelecionado) {
          console.log(`Atualizando estoque do produto selecionado de ${this.produtoSelecionado.quantidade_estoque} para ${response.estoque_atual}`);
          this.produtoSelecionado.quantidade_estoque = response.estoque_atual || 0;
          
          // Notificar outros componentes sobre a atualização
          this.produtoService.notificarProdutoAtualizado(produtoId);
          
          // Adicionar notificação sobre atualização de estoque
          this.notificacaoService.adicionarNotificacao({
            tipo: 'estoque',
            subtipo: 'entrada',
            titulo: 'Estoque Atualizado',
            mensagem: `${quantidade} unidades adicionadas ao estoque de ${this.produtoSelecionado.nome}. Estoque atual: ${response.estoque_atual}`
          });
          
          // Se tiver alerta de estoque baixo, mostrar também
          if (response.alerta) {
            this.notificacaoService.adicionarNotificacao({
              tipo: 'estoque',
              subtipo: 'estoque_baixo',
              titulo: 'Alerta de Estoque Baixo',
              mensagem: response.alerta.mensagem,
              link: '/estoque/baixo'
            });
          }
          
          // Recarregar detalhes do produto após a atualização
          this.carregarDetalhesProduto(produtoId);
        }
        
        this.resetForm();
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
      next: (response) => {
        this.isLoading = false;
        this.mensagem = `${quantidade} unidades removidas do estoque com sucesso!`;
        this.tipoMensagem = 'success';
        
        console.log(`Estoque removido com sucesso. Resposta:`, response);
        
        // Atualizar a quantidade de estoque do produto selecionado
        if (this.produtoSelecionado) {
          console.log(`Atualizando estoque do produto selecionado de ${this.produtoSelecionado.quantidade_estoque} para ${response.estoque_atual}`);
          this.produtoSelecionado.quantidade_estoque = response.estoque_atual || 0;
          
          // Notificar outros componentes sobre a atualização
          this.produtoService.notificarProdutoAtualizado(produtoId);
          
          // Adicionar notificação sobre atualização de estoque
          this.notificacaoService.adicionarNotificacao({
            tipo: 'estoque',
            subtipo: 'saida',
            titulo: 'Estoque Atualizado',
            mensagem: `${quantidade} unidades removidas do estoque de ${this.produtoSelecionado.nome}. Estoque atual: ${response.estoque_atual}`
          });
          
          // Se tiver alerta de estoque baixo, mostrar também
          if (response.alerta) {
            this.notificacaoService.adicionarNotificacao({
              tipo: 'estoque',
              subtipo: 'estoque_baixo',
              titulo: 'Alerta de Estoque Baixo',
              mensagem: response.alerta.mensagem,
              link: '/estoque/baixo'
            });
          }
          
          // Recarregar detalhes do produto após a atualização
          this.carregarDetalhesProduto(produtoId);
        }
        
        this.resetForm();
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