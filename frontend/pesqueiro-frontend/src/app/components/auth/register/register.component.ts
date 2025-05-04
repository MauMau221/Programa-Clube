import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  validationErrors: { [key: string]: string[] } = {};
  roleOptions = ['gerente', 'garcom', 'cozinheiro'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]],
      role: ['gerente', [Validators.required]]
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
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.validationErrors = {};

    this.authService.register(this.registerForm.value).subscribe({
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