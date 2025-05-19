import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-funcionario-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <div class="card shadow">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">Editar Funcionário</h4>
            </div>
            <div class="card-body">
              <div *ngIf="isLoading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Carregando...</span>
                </div>
                <p class="mt-2">Carregando dados do funcionário...</p>
              </div>
              
              <form *ngIf="!isLoading" [formGroup]="funcionarioForm" (ngSubmit)="onSubmit()">
                <div class="alert alert-danger" *ngIf="errorMessage">
                  {{ errorMessage }}
                </div>
                
                <div class="mb-3">
                  <label for="name" class="form-label">Nome</label>
                  <input 
                    type="text" 
                    id="name" 
                    formControlName="name" 
                    class="form-control" 
                    [ngClass]="{'is-invalid': (funcionarioForm.get('name')?.invalid && funcionarioForm.get('name')?.touched) || validationErrors['name']}"
                  />
                  <div class="invalid-feedback" *ngIf="funcionarioForm.get('name')?.errors?.['required'] && funcionarioForm.get('name')?.touched">
                    Nome é obrigatório
                  </div>
                  <div class="invalid-feedback" *ngIf="validationErrors['name']">
                    {{ validationErrors['name'][0] }}
                  </div>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    formControlName="email" 
                    class="form-control" 
                    [ngClass]="{'is-invalid': (funcionarioForm.get('email')?.invalid && funcionarioForm.get('email')?.touched) || validationErrors['email']}"
                  />
                  <div class="invalid-feedback" *ngIf="funcionarioForm.get('email')?.errors?.['required'] && funcionarioForm.get('email')?.touched">
                    Email é obrigatório
                  </div>
                  <div class="invalid-feedback" *ngIf="funcionarioForm.get('email')?.errors?.['email'] && funcionarioForm.get('email')?.touched">
                    Insira um email válido
                  </div>
                  <div class="invalid-feedback" *ngIf="validationErrors['email']">
                    {{ validationErrors['email'][0] }}
                  </div>
                </div>

                <div class="mb-3">
                  <label for="role" class="form-label">Função</label>
                  <select 
                    id="role" 
                    formControlName="role" 
                    class="form-select" 
                    [ngClass]="{'is-invalid': (funcionarioForm.get('role')?.invalid && funcionarioForm.get('role')?.touched) || validationErrors['role']}"
                  >
                    <option *ngFor="let role of roleOptions" [value]="role">
                      {{ traduzirFuncao(role) }}
                    </option>
                  </select>
                  <div class="invalid-feedback" *ngIf="funcionarioForm.get('role')?.errors?.['required'] && funcionarioForm.get('role')?.touched">
                    Função é obrigatória
                  </div>
                  <div class="invalid-feedback" *ngIf="validationErrors['role']">
                    {{ validationErrors['role'][0] }}
                  </div>
                </div>

                <div class="d-flex justify-content-between">
                  <button type="button" class="btn btn-secondary" routerLink="/funcionarios">Cancelar</button>
                  <button 
                    type="submit" 
                    class="btn btn-primary" 
                    [disabled]="funcionarioForm.invalid || isSaving"
                  >
                    <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border-radius: 8px;
      border: none;
    }
    .card-header {
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
  `]
})
export class FuncionarioEditComponent implements OnInit {
  funcionarioId: number = 0;
  funcionarioForm: FormGroup;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  validationErrors: { [key: string]: string[] } = {};
  roleOptions = ['gerente', 'garcom', 'cozinheiro'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {
    this.funcionarioForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Obter o ID do funcionário da URL
    this.route.params.subscribe(params => {
      this.funcionarioId = +params['id'];
      this.carregarFuncionario();
    });
  }

  carregarFuncionario(): void {
    this.isLoading = true;
    this.authService.getFuncionario(this.funcionarioId).subscribe({
      next: (funcionario) => {
        // Preencher o formulário com os dados do funcionário
        this.funcionarioForm.patchValue({
          name: funcionario.name,
          email: funcionario.email,
          role: funcionario.role
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.toastService.error('Erro ao carregar dados do funcionário.');
        console.error('Erro ao carregar funcionário:', error);
        this.isLoading = false;
        this.router.navigate(['/funcionarios']);
      }
    });
  }

  onSubmit(): void {
    if (this.funcionarioForm.invalid) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.validationErrors = {};

    this.authService.updateFuncionario(this.funcionarioId, this.funcionarioForm.value).subscribe({
      next: (response) => {
        this.toastService.success(response.message || 'Funcionário atualizado com sucesso!');
        this.router.navigate(['/funcionarios']);
      },
      error: (error) => {
        this.isSaving = false;
        
        if (error.status === 422 && error.error?.errors) {
          // Processar erros de validação
          this.validationErrors = error.error.errors;
          // Extrair a primeira mensagem de erro para exibir como mensagem principal
          const firstErrorKey = Object.keys(this.validationErrors)[0];
          if (firstErrorKey && this.validationErrors[firstErrorKey].length > 0) {
            this.errorMessage = this.validationErrors[firstErrorKey][0];
          } else {
            this.errorMessage = 'Erro de validação. Verifique os campos.';
          }
        } else {
          this.errorMessage = error.error?.message || 'Erro ao atualizar. Tente novamente.';
        }
        
        console.error('Erro na atualização:', error);
      }
    });
  }

  traduzirFuncao(role: string): string {
    switch (role) {
      case 'garcom':
        return 'Garçom';
      case 'cozinheiro':
        return 'Cozinheiro';
      case 'gerente':
        return 'Gerente';
      default:
        return role;
    }
  }
} 