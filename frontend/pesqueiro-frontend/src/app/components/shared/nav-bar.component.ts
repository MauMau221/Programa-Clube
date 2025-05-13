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
        <a class="navbar-brand me-2" routerLink="/dashboard">Pesqueiro</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto align-items-center nav-container" *ngIf="isLoggedIn">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active" 
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-house-door me-2"></i> Dashboard
              </a>
            </li>
            <!-- Link para o Caixa Direto -->
            <li class="nav-item" *ngIf="isGarcom || isGerente || isCaixa">
              <a class="nav-link" routerLink="/caixa" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-cash-register me-2"></i> Caixa Direto
              </a>
            </li>
            <!-- Links para Garçom e Gerente -->
            <li class="nav-item" *ngIf="isGarcom || isGerente || isCaixa">
              <a class="nav-link" routerLink="/comandas" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-receipt me-2"></i> Comandas
              </a>
            </li>
            <!-- Links para Cozinheiro e Gerente -->
            <li class="nav-item" *ngIf="isCozinheiro || isGerente">
              <a class="nav-link" routerLink="/pedidos" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-list-check me-2"></i> Pedidos
              </a>
            </li>
            <li class="nav-item" *ngIf="isCozinheiro || isGerente">
              <a class="nav-link" routerLink="/cozinha" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-kanban me-2"></i> Central da Cozinha
              </a>
            </li>
            <li class="nav-item" *ngIf="isCozinheiro || isGerente">
              <a class="nav-link" routerLink="/produtos" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-box me-2"></i> Produtos
              </a>
            </li>
            <!-- Categorias apenas em mobile -->
            <li class="nav-item d-lg-none" *ngIf="isCozinheiro || isGerente">
              <a class="nav-link" routerLink="/categorias" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-tags me-2"></i> Categorias
              </a>
            </li>
            <!-- Links apenas para Gerente -->
            <li class="nav-item" *ngIf="isGerente">
              <a class="nav-link" routerLink="/estoque" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-box-seam me-2"></i> Estoque
              </a>
            </li>
            <!-- Cadastrar Funcionário apenas em mobile -->
            <li class="nav-item d-lg-none" *ngIf="isGerente">
              <a class="nav-link" routerLink="/funcionarios/novo" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-person-plus me-2"></i> Cadastrar Funcionário
              </a>
            </li>
            <!-- Relatórios apenas em mobile -->
            <li class="nav-item d-lg-none" *ngIf="isGerente">
              <a class="nav-link" routerLink="/relatorios" routerLinkActive="active"
                 (click)="closeMenuOnMobile()">
                <i class="bi bi-graph-up me-2"></i> Relatórios
              </a>
            </li>
          </ul>
          <div class="d-flex align-items-center user-section" *ngIf="isLoggedIn">
            <app-notificacoes class="me-2"></app-notificacoes>
            <span class="navbar-text me-2 d-none d-sm-inline user-info">
              Olá, {{ currentUser?.name || 'Usuário' }} 
              <span class="badge bg-light text-primary ms-1">{{ currentUser?.role }}</span>
            </span>
            <button class="btn btn-outline-light logout-btn" (click)="logout()">
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
      padding: 0.25rem 1rem;
    }
    
    .navbar-brand {
      padding-right: 0;
      margin-right: 0.5rem;
    }
    
    .nav-container {
      margin-left: -0.5rem;
    }
    
    .nav-link.active {
      font-weight: bold;
      background-color: rgba(255,255,255,0.1);
      border-radius: 0.25rem;
    }
    
    /* Seção do usuário e botões no final do menu */
    .user-section {
      margin-left: auto;
      white-space: nowrap;
    }
    
    .user-info {
      font-size: 0.9rem;
      margin-right: 0.75rem !important;
    }
    
    .logout-btn {
      padding: 0.35rem 0.75rem;
      font-size: 0.9rem;
    }
    
    /* Estilização global para links de navegação */
    .nav-link {
      display: flex;
      align-items: center;
      padding: 0.5rem 0.75rem;
      transition: all 0.2s ease;
      height: 100%;
      white-space: nowrap;
      font-size: 0.95rem;
    }
    
    /* Ícones sempre visíveis e com tamanho consistente */
    .nav-link i.bi {
      font-size: 1.1rem;
      opacity: 0.9;
    }
    
    /* Espaçamento uniforme em todos os tamanhos de tela */
    .navbar-nav .nav-item {
      margin: 0 0.1rem;
    }
    
    /* Estilos para telas médias e grandes (desktop) */
    @media (min-width: 992px) {
      .navbar-nav {
        height: 52px; /* Altura fixa para a barra de navegação */
      }
      
      .nav-item {
        height: 100%;
        display: flex;
        align-items: center;
      }
      
      .navbar-nav .nav-item {
        margin: 0 0.05rem;
      }
      
      .nav-link {
        height: 38px; /* Altura fixa para todos os links */
        padding: 0 0.65rem;
        border-radius: 0.25rem;
        display: flex;
        align-items: center;
      }
      
      .nav-link.active {
        background-color: rgba(255,255,255,0.15);
      }
    }
    
    /* Estilos para telas médias */
    @media (min-width: 992px) and (max-width: 1200px) {
      .nav-link {
        padding: 0 0.5rem;
        font-size: 0.9rem;
      }
      
      .nav-link i.bi {
        font-size: 1rem;
      }
      
      .navbar-brand {
        font-size: 1.1rem;
      }
    }
    
    /* Estilos para telas pequenas (mobile) */
    @media (max-width: 991px) {
      .nav-link {
        padding: 0.75rem 1rem;
        border-radius: 0.25rem;
        margin-bottom: 0.25rem;
        justify-content: flex-start;
        text-align: left;
      }
      
      .navbar-nav {
        margin-top: 1rem;
        margin-bottom: 1rem;
        align-items: flex-start !important;
      }
      
      .nav-item {
        width: 100%;
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