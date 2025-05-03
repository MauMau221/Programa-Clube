import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProdutoService } from '../../services/produto.service';
import { CategoriaService } from '../../services/categoria.service';
import { Produto, Categoria } from '../../models/comanda.model';

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './produto-form.component.html',
  styleUrls: ['./produto-form.component.scss']
})
export class ProdutoFormComponent implements OnInit {
  produtoForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  produtoId?: number;
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | '' = '';
  categorias: Categoria[] = [];

  constructor(
    private fb: FormBuilder,
    private produtoService: ProdutoService,
    private categoriaService: CategoriaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.produtoForm = this.fb.group({
      nome: ['', [Validators.required]],
      observacao: [''],
      preco: [0, [Validators.required, Validators.min(0.01)]],
      categoria_id: ['', [Validators.required]],
      status: ['disponivel', [Validators.required]],
      estoque_minimo: [5, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.carregarCategorias();
    
    this.produtoId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.produtoId;

    if (this.isEditMode) {
      this.carregarProduto();
    }
  }

  carregarCategorias(): void {
    this.isLoading = true;
    this.categoriaService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        this.mensagem = 'Erro ao carregar categorias. Tente novamente mais tarde.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  carregarProduto(): void {
    if (!this.produtoId) return;

    this.isLoading = true;
    this.produtoService.getProduto(this.produtoId).subscribe({
      next: (produto) => {
        this.produtoForm.patchValue({
          nome: produto.nome,
          observacao: produto.observacao,
          preco: produto.preco,
          categoria_id: produto.categoria_id,
          status: produto.status,
          estoque_minimo: produto.estoque_minimo
        });
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

  onSubmit(): void {
    if (this.produtoForm.invalid) {
      this.produtoForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    if (this.isEditMode) {
      this.atualizarProduto();
    } else {
      this.criarProduto();
    }
  }

  criarProduto(): void {
    const produtoData = this.produtoForm.value;
    this.produtoService.criarProduto(produtoData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/produtos']);
      },
      error: (error) => {
        console.error('Erro ao criar produto:', error);
        this.mensagem = 'Erro ao criar produto. Tente novamente.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  atualizarProduto(): void {
    if (!this.produtoId) return;

    const produtoData = this.produtoForm.value;
    this.produtoService.atualizarProduto(this.produtoId, produtoData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/produtos']);
      },
      error: (error) => {
        console.error('Erro ao atualizar produto:', error);
        this.mensagem = 'Erro ao atualizar produto. Tente novamente.';
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