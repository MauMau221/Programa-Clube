import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-funcionario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <div class="card shadow">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">Registrar Novo Funcionário</h4>
            </div>
            <div class="card-body">
              <form [formGroup]="funcionarioForm" (ngSubmit)="onSubmit()">
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
                      {{ role.charAt(0).toUpperCase() + role.slice(1) }}
                    </option>
                  </select>
                  <div class="invalid-feedback" *ngIf="funcionarioForm.get('role')?.errors?.['required'] && funcionarioForm.get('role')?.touched">
                    Função é obrigatória
                  </div>
                  <div class="invalid-feedback" *ngIf="validationErrors['role']">
                    {{ validationErrors['role'][0] }}
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Senha</label>
                  <input 
                    type="password" 
                    id="password" 
                    formControlName="password" 
                    class="form-control" 
                    [ngClass]="{'is-invalid': (funcionarioForm.get('password')?.invalid && funcionarioForm.get('password')?.touched) || validationErrors['password']}"
                  />
                  <div class="invalid-feedback" *ngIf="funcionarioForm.get('password')?.errors?.['required'] && funcionarioForm.get('password')?.touched">
                    Senha é obrigatória
                  </div>
                  <div class="invalid-feedback" *ngIf="funcionarioForm.get('password')?.errors?.['minlength'] && funcionarioForm.get('password')?.touched">
                    A senha deve ter pelo menos 6 caracteres
                  </div>
                  <div class="invalid-feedback" *ngIf="validationErrors['password']">
                    {{ validationErrors['password'][0] }}
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password_confirmation" class="form-label">Confirme a Senha</label>
                  <input 
                    type="password" 
                    id="password_confirmation" 
                    formControlName="password_confirmation" 
                    class="form-control" 
                    [ngClass]="{'is-invalid': (funcionarioForm.get('password_confirmation')?.invalid && funcionarioForm.get('password_confirmation')?.touched) || funcionarioForm.errors?.['passwordMismatch'] || validationErrors['password_confirmation']}"
                  />
                  <div class="invalid-feedback" *ngIf="funcionarioForm.get('password_confirmation')?.errors?.['required'] && funcionarioForm.get('password_confirmation')?.touched">
                    Confirmação de senha é obrigatória
                  </div>
                  <div class="invalid-feedback" *ngIf="funcionarioForm.errors?.['passwordMismatch'] && funcionarioForm.get('password_confirmation')?.touched">
                    As senhas não coincidem
                  </div>
                  <div class="invalid-feedback" *ngIf="validationErrors['password_confirmation']">
                    {{ validationErrors['password_confirmation'][0] }}
                  </div>
                </div>

                <div class="d-flex justify-content-between">
                  <button type="button" class="btn btn-secondary" routerLink="/dashboard">Cancelar</button>
                  <button 
                    type="submit" 
                    class="btn btn-primary" 
                    [disabled]="funcionarioForm.invalid || isLoading"
                  >
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Registrar Funcionário
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
export class FuncionarioFormComponent {
  funcionarioForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  validationErrors: { [key: string]: string[] } = {};
  roleOptions = ['gerente', 'garcom', 'cozinheiro'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.funcionarioForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]],
      role: ['garcom', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: FormGroup): {[key: string]: boolean} | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('password_confirmation')?.value;
    
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.funcionarioForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.validationErrors = {};

    this.authService.register(this.funcionarioForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        
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
          this.errorMessage = error.error?.message || 'Erro ao registrar. Tente novamente.';
        }
        
        console.error('Erro no registro:', error);
      }
    });
  }
} 