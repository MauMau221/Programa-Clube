import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/comanda.model';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './categoria-form.component.html',
  styleUrls: ['./categoria-form.component.scss']
})
export class CategoriaFormComponent implements OnInit {
  categoriaForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  categoriaId?: number;
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | '' = '';

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.categoriaForm = this.fb.group({
      nome: ['', [Validators.required]],
      status: ['disponivel', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.categoriaId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.categoriaId;

    if (this.isEditMode) {
      this.carregarCategoria();
    }
  }

  carregarCategoria(): void {
    if (!this.categoriaId) return;

    this.isLoading = true;
    this.categoriaService.getCategoria(this.categoriaId).subscribe({
      next: (categoria) => {
        this.categoriaForm.patchValue({
          nome: categoria.nome,
          status: categoria.status
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar categoria:', error);
        this.mensagem = 'Erro ao carregar categoria. Tente novamente mais tarde.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    if (this.isEditMode) {
      this.atualizarCategoria();
    } else {
      this.criarCategoria();
    }
  }

  criarCategoria(): void {
    const categoriaData = this.categoriaForm.value;
    this.categoriaService.criarCategoria(categoriaData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/categorias']);
      },
      error: (error) => {
        console.error('Erro ao criar categoria:', error);
        this.mensagem = 'Erro ao criar categoria. Tente novamente.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  atualizarCategoria(): void {
    if (!this.categoriaId) return;

    const categoriaData = this.categoriaForm.value;
    this.categoriaService.atualizarCategoria(this.categoriaId, categoriaData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/categorias']);
      },
      error: (error) => {
        console.error('Erro ao atualizar categoria:', error);
        this.mensagem = 'Erro ao atualizar categoria. Tente novamente.';
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