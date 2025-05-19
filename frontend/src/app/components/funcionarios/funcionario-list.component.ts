import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-funcionario-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
    <div class="container mt-4">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h4 class="mb-0">Lista de Funcionários</h4>
          <p class="mb-0 small">Gerenciamento de funcionários do sistema</p>
        </div>
        
        <div class="card-body">
          <div *ngIf="mensagem" class="alert alert-{{tipoMensagem}} alert-dismissible fade show" role="alert">
            {{mensagem}}
            <button type="button" class="btn-close" (click)="limparMensagem()" aria-label="Fechar"></button>
          </div>
          
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead class="table-light">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Nome</th>
                  <th scope="col">Email</th>
                  <th scope="col">Função</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let funcionario of funcionarios">
                  <td>{{funcionario.id}}</td>
                  <td>{{funcionario.name}}</td>
                  <td>{{funcionario.email}}</td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'bg-primary': funcionario.role === 'garcom',
                      'bg-success': funcionario.role === 'cozinheiro',
                      'bg-danger': funcionario.role === 'gerente'
                    }">
                      {{traduzirFuncao(funcionario.role)}}
                    </span>
                  </td>
                  <td>
                    <button type="button" class="btn btn-sm btn-outline-primary me-1" (click)="editarFuncionario(funcionario.id)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" (click)="confirmarExclusao(funcionario)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="funcionarios.length === 0">
                  <td colspan="5" class="text-center py-3">
                    <div *ngIf="isLoading">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                      </div>
                      <p class="mt-2 mb-0">Carregando funcionários...</p>
                    </div>
                    <div *ngIf="!isLoading">
                      <i class="bi bi-exclamation-circle text-muted fs-3"></i>
                      <p class="mt-2 mb-0">Nenhum funcionário encontrado.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="card-footer">
          <a [routerLink]="['/funcionarios/novo']" class="btn btn-primary">
            <i class="bi bi-plus-circle me-1"></i> Adicionar Funcionário
          </a>
        </div>
      </div>
    </div>

    <!-- Modal de confirmação de exclusão -->
    <div *ngIf="funcionarioParaExcluir" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Confirmar Exclusão</h5>
            <button type="button" class="btn-close btn-close-white" (click)="cancelarExclusao()" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Tem certeza que deseja excluir o funcionário <strong>{{funcionarioParaExcluir.name}}</strong>?</p>
            <p class="text-danger mb-0">Esta ação não pode ser desfeita!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cancelarExclusao()">Cancelar</button>
            <button type="button" class="btn btn-danger" [disabled]="isExcluindo" (click)="excluirFuncionario()">
              <span *ngIf="isExcluindo" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Excluir
            </button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop show"></div>
    </div>
  `,
  styles: [`
    .badge {
      padding: 5px 10px;
      border-radius: 4px;
      color: white;
    }
    
    .table td, .table th {
      vertical-align: middle;
    }
    
    .card-header {
      display: flex;
      flex-direction: column;
      padding: 1rem 1.25rem;
    }
    
    .modal-backdrop {
      opacity: 0.5;
    }
    
    .modal {
      background-color: rgba(0, 0, 0, 0.5);
    }
  `]
})
export class FuncionarioListComponent implements OnInit {
  funcionarios: User[] = [];
  isLoading = false;
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | '' = '';
  funcionarioParaExcluir: User | null = null;
  isExcluindo = false;
  
  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.carregarFuncionarios();
  }
  
  carregarFuncionarios(): void {
    this.isLoading = true;
    this.authService.getFuncionarios().subscribe({
      next: (response) => {
        this.funcionarios = response.funcionarios;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error('Ocorreu um erro ao carregar a lista de funcionários.');
        console.error('Erro ao carregar funcionários:', err);
        this.isLoading = false;
      }
    });
  }
  
  editarFuncionario(id: number): void {
    this.router.navigate(['/funcionarios/editar', id]);
  }
  
  confirmarExclusao(funcionario: User): void {
    this.funcionarioParaExcluir = funcionario;
  }
  
  cancelarExclusao(): void {
    this.funcionarioParaExcluir = null;
  }
  
  excluirFuncionario(): void {
    if (!this.funcionarioParaExcluir) return;
    
    this.isExcluindo = true;
    
    this.authService.deleteFuncionario(this.funcionarioParaExcluir.id).subscribe({
      next: (response) => {
        this.toastService.success(response.message || 'Funcionário excluído com sucesso!');
        this.mensagem = response.message || 'Funcionário excluído com sucesso!';
        this.tipoMensagem = 'success';
        this.funcionarioParaExcluir = null;
        this.isExcluindo = false;
        this.carregarFuncionarios();
      },
      error: (err) => {
        const mensagemErro = err.error?.message || 'Erro ao excluir funcionário. Tente novamente.';
        this.toastService.error(mensagemErro);
        this.mensagem = mensagemErro;
        this.tipoMensagem = 'danger';
        this.isExcluindo = false;
      }
    });
  }
  
  traduzirFuncao(role: string | undefined): string {
    if (!role) return 'Desconhecido';
    
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
  
  limparMensagem(): void {
    this.mensagem = '';
    this.tipoMensagem = '';
  }
} 