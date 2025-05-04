import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComandaService } from '../../services/comanda.service';
import { ProdutoService } from '../../services/produto.service';
import { PedidoService } from '../../services/pedido.service';
import { Comanda, ComandaItem, Produto } from '../../models/comanda.model';

@Component({
  selector: 'app-comanda-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './comanda-detail.component.html',
  styleUrls: ['./comanda-detail.component.scss']
})
export class ComandaDetailComponent implements OnInit {
  comanda: Comanda | null = null;
  produtos: Produto[] = [];
  isLoading = false;
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | 'warning' | '' = '';
  itemForm: FormGroup;
  produtoSelecionado: Produto | null = null;
  temPedidoPendente = false;
  pedidoPendente: any = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private comandaService: ComandaService,
    private produtoService: ProdutoService,
    private pedidoService: PedidoService,
    private fb: FormBuilder
  ) {
    this.itemForm = this.fb.group({
      produto_id: ['', [Validators.required]],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      observacao: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.carregarComanda(id);
      this.carregarProdutos();
    }
  }

  carregarComanda(id: number): void {
    this.isLoading = true;
    this.comandaService.getComanda(id).subscribe({
      next: (comanda) => {
        // Garantir que valores numéricos de todos os itens sejam tratados como números
        if (comanda.itens && comanda.itens.length > 0) {
          comanda.itens = comanda.itens.map(item => ({
            ...item,
            valor_unitario: typeof item.valor_unitario === 'string' ? parseFloat(item.valor_unitario) : item.valor_unitario,
            valor_total: typeof item.valor_total === 'string' ? parseFloat(item.valor_total) : item.valor_total,
            quantidade: typeof item.quantidade === 'string' ? parseInt(item.quantidade) : item.quantidade
          }));
        }
        
        // Atualizar valor total
        comanda.total = typeof comanda.total === 'string' ? parseFloat(comanda.total) : comanda.total;
        
        this.comanda = comanda;
        console.log('Comanda carregada:', this.comanda);
        if (this.comanda.itens) {
          console.log('Itens da comanda:', this.comanda.itens.length);
          console.log('Primeiro item:', this.comanda.itens[0]);
        }
        
        // Verificar se há pedidos pendentes de envio para a cozinha
        this.verificarPedidosPendentes(id);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar comanda:', error);
        this.mensagem = 'Erro ao carregar comanda. Tente novamente mais tarde.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  verificarPedidosPendentes(comandaId: number): void {
    this.comandaService.verificarPedidosPendentes(comandaId).subscribe({
      next: (resposta) => {
        this.temPedidoPendente = resposta.tem_pedido_pendente;
        this.pedidoPendente = resposta.pedido || null;
        console.log('Pedidos pendentes:', this.temPedidoPendente, this.pedidoPendente);
      },
      error: (error) => {
        console.error('Erro ao verificar pedidos pendentes:', error);
      }
    });
  }

  enviarParaCozinha(): void {
    if (!this.pedidoPendente || !this.comanda) return;
    
    this.isLoading = true;
    this.pedidoService.enviarParaCozinha(this.pedidoPendente.id).subscribe({
      next: (resposta) => {
        this.mensagem = 'Pedido enviado para a cozinha com sucesso!';
        this.tipoMensagem = 'success';
        // Atualizar a comanda e verificar novamente os pedidos pendentes
        this.carregarComanda(this.comanda!.id);
      },
      error: (error) => {
        console.error('Erro ao enviar para a cozinha:', error);
        this.mensagem = 'Erro ao enviar pedido para a cozinha. Tente novamente.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  carregarProdutos(): void {
    this.produtoService.getProdutosDisponiveis().subscribe({
      next: (produtos) => {
        // Garantir que o campo preco é um número para todos os produtos
        this.produtos = produtos.map(produto => ({
          ...produto,
          preco: typeof produto.preco === 'string' ? parseFloat(produto.preco) : produto.preco
        }));
        console.log('Produtos carregados:', this.produtos);
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.mensagem = 'Erro ao carregar produtos. Tente novamente mais tarde.';
        this.tipoMensagem = 'danger';
      }
    });
  }

  onProdutoChange(): void {
    const produtoId = this.itemForm.get('produto_id')?.value;
    if (produtoId) {
      this.produtoSelecionado = this.produtos.find(p => p.id === +produtoId) || null;
    } else {
      this.produtoSelecionado = null;
    }
  }

  adicionarItem(): void {
    if (this.itemForm.invalid || !this.comanda) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const itemData = this.itemForm.value;
    
    this.comandaService.adicionarItem(this.comanda.id, itemData).subscribe({
      next: () => {
        this.mensagem = 'Item adicionado com sucesso!';
        this.tipoMensagem = 'success';
        this.itemForm.reset({ quantidade: 1 });
        this.carregarComanda(this.comanda!.id);
      },
      error: (error) => {
        console.error('Erro ao adicionar item:', error);
        this.mensagem = 'Erro ao adicionar item. Tente novamente.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  removerItem(itemId: number): void {
    if (!this.comanda) return;

    if (confirm('Tem certeza que deseja remover este item?')) {
      this.isLoading = true;
      this.comandaService.removerItem(this.comanda.id, itemId).subscribe({
        next: () => {
          this.mensagem = 'Item removido com sucesso!';
          this.tipoMensagem = 'success';
          this.carregarComanda(this.comanda!.id);
        },
        error: (error) => {
          console.error('Erro ao remover item:', error);
          this.mensagem = 'Erro ao remover item. Tente novamente.';
          this.tipoMensagem = 'danger';
          this.isLoading = false;
        }
      });
    }
  }

  fecharComanda(): void {
    if (!this.comanda) return;

    if (confirm('Tem certeza que deseja fechar esta comanda?')) {
      this.isLoading = true;
      this.comandaService.fecharComanda(this.comanda.id).subscribe({
        next: () => {
          this.mensagem = 'Comanda fechada com sucesso!';
          this.tipoMensagem = 'success';
          this.carregarComanda(this.comanda!.id);
        },
        error: (error) => {
          console.error('Erro ao fechar comanda:', error);
          this.mensagem = 'Erro ao fechar comanda. Tente novamente.';
          this.tipoMensagem = 'danger';
          this.isLoading = false;
        }
      });
    }
  }

  cancelarComanda(): void {
    if (!this.comanda) return;

    if (confirm('Tem certeza que deseja cancelar esta comanda?')) {
      this.isLoading = true;
      this.comandaService.cancelarComanda(this.comanda.id).subscribe({
        next: () => {
          this.mensagem = 'Comanda cancelada com sucesso!';
          this.tipoMensagem = 'success';
          this.carregarComanda(this.comanda!.id);
        },
        error: (error) => {
          console.error('Erro ao cancelar comanda:', error);
          this.mensagem = 'Erro ao cancelar comanda. Tente novamente.';
          this.tipoMensagem = 'danger';
          this.isLoading = false;
        }
      });
    }
  }

  limparMensagem(): void {
    this.mensagem = '';
    this.tipoMensagem = '';
  }
} 