import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComandaService } from '../../services/comanda.service';
import { ProdutoService } from '../../services/produto.service';
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
  tipoMensagem: 'success' | 'danger' | '' = '';
  itemForm: FormGroup;
  produtoSelecionado: Produto | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private comandaService: ComandaService,
    private produtoService: ProdutoService,
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
        this.comanda = comanda;
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

  carregarProdutos(): void {
    this.produtoService.getProdutosDisponiveis().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
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