import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { NotificacoesComponent } from './notificacoes.component';

declare var bootstrap: any;

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificacoesComponent],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" routerLink="/dashboard">Pesqueiro</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto" *ngIf="isLoggedIn">
            <li class="nav-item">
              <a class="nav-link d-flex align-items-center py-3 py-lg-2" routerLink="/dashboard" routerLinkActive="active" 
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-house-door me-2 d-inline d-lg-none"></i> Dashboard
              </a>
            </li>
            <!-- Link para o Caixa Direto -->
            <li class="nav-item" *ngIf="isGarcom || isGerente || isCaixa">
              <a class="nav-link d-flex align-items-center py-3 py-lg-2" routerLink="/caixa" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-cash-register me-2"></i> Caixa Direto
              </a>
            </li>
            <!-- Links para Garçom e Gerente -->
            <li class="nav-item" *ngIf="isGarcom || isGerente || isCaixa">
              <a class="nav-link d-flex align-items-center py-3 py-lg-2" routerLink="/comandas" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-receipt me-2 d-inline d-lg-none"></i> Comandas
              </a>
            </li>
            <!-- Links para Cozinheiro e Gerente -->
            <li class="nav-item" *ngIf="isCozinheiro || isGerente">
              <a class="nav-link d-flex align-items-center py-3 py-lg-2" routerLink="/pedidos" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-list-check me-2 d-inline d-lg-none"></i> Pedidos
              </a>
            </li>
            <li class="nav-item" *ngIf="isCozinheiro || isGerente">
              <a class="nav-link d-flex align-items-center py-3 py-lg-2" routerLink="/cozinha" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-kanban me-2"></i> Central da Cozinha
              </a>
            </li>
            <li class="nav-item" *ngIf="isCozinheiro || isGerente">
              <a class="nav-link d-flex align-items-center py-3 py-lg-2" routerLink="/produtos" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-box me-2 d-inline d-lg-none"></i> Produtos
              </a>
            </li>
            <li class="nav-item" *ngIf="isCozinheiro || isGerente">
              <a class="nav-link d-flex align-items-center py-3 py-lg-2" routerLink="/categorias" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-tags me-2 d-inline d-lg-none"></i> Categorias
              </a>
            </li>
            <!-- Links apenas para Gerente -->
            <li class="nav-item" *ngIf="isGerente">
              <a class="nav-link d-flex align-items-center py-3 py-lg-2" routerLink="/estoque" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-box-seam me-2 d-inline d-lg-none"></i> Estoque
              </a>
            </li>
            <li class="nav-item" *ngIf="isGerente">
              <a class="nav-link d-flex align-items-center py-3 py-lg-2" routerLink="/funcionarios/novo" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-person-plus me-2 d-inline d-lg-none"></i> Cadastrar Funcionário
              </a>
            </li>
            <li class="nav-item" *ngIf="isGerente">
              <a class="nav-link d-flex align-items-center py-3 py-lg-2" routerLink="/relatorios" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-graph-up me-2 d-inline d-lg-none"></i> Relatórios
              </a>
            </li>
          </ul>
          <div class="d-flex align-items-center" *ngIf="isLoggedIn">
            <app-notificacoes class="me-3"></app-notificacoes>
            <span class="navbar-text me-3 d-none d-sm-inline">
              Olá, {{ currentUser?.name || 'Usuário' }} 
              <span class="badge bg-light text-primary ms-1">{{ currentUser?.role }}</span>
            </span>
            <button class="btn btn-outline-light px-3 py-2" (click)="logout()">
              <i class="bi bi-box-arrow-right d-sm-none"></i>
              <span class="d-none d-sm-inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      box-shadow: 0 2px 4px rgba(0,0,0,.1);
    }
    .nav-link.active {
      font-weight: bold;
      background-color: rgba(255,255,255,0.1);
      border-radius: 0.25rem;
    }
    
    @media (max-width: 992px) {
      .nav-link {
        padding: 0.75rem 1rem;
        border-radius: 0.25rem;
        margin-bottom: 0.25rem;
      }
      .navbar-nav {
        margin-top: 1rem;
        margin-bottom: 1rem;
      }
      /* Aumentar a área de toque */
      .nav-item {
        margin-bottom: 0.5rem;
      }
      
      /* Melhorar área de toque para botão toggler */
      .navbar-toggler {
        padding: 0.75rem;
        border-color: rgba(255,255,255,0.1);
        font-size: 1.2rem;
      }
      
      /* Melhorar espaçamento do conteúdo colapsado */
      .navbar-collapse {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }
    }
  `]
})
export class NavBarComponent implements OnInit {
  isLoggedIn = false;
  currentUser: User | null = null;
  
  // Propriedades para verificar o papel do usuário
  get isGarcom(): boolean {
    return this.currentUser?.role === 'garcom';
  }
  
  get isCozinheiro(): boolean {
    return this.currentUser?.role === 'cozinheiro';
  }
  
  get isGerente(): boolean {
    return this.currentUser?.role === 'gerente';
  }

  get isCaixa(): boolean {
    return this.currentUser?.role === 'caixa';
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erro ao fazer logout:', error);
        // Mesmo com erro, limpa o token e redireciona
        this.authService['clearAuthData']();
        this.router.navigate(['/login']);
      }
    });
  }

  closeMenuOnMobile(): void {
    // Verifica se estamos em viewport mobile (onde o dropdown está visível)
    if (window.innerWidth < 992) {
      // Fecha o menu colapsável pegando o elemento por ID
      const navbarCollapse = document.getElementById('navbarNav');
      
      // Pegando o elemento pelo Bootstrap
      if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        // Usando o Bootstrap para fechar o menu
        const bsCollapse = new bootstrap.Collapse(navbarCollapse);
        bsCollapse.hide();
      }
    }
  }
} 