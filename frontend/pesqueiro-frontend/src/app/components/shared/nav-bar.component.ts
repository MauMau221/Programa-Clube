import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { NotificacoesComponent } from './notificacoes/notificacoes.component';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificacoesComponent],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" routerLink="/dashboard">Pesqueiro</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto" *ngIf="isLoggedIn">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/comandas" routerLinkActive="active">Comandas</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/pedidos" routerLinkActive="active">Pedidos</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/produtos" routerLinkActive="active">Produtos</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/categorias" routerLinkActive="active">Categorias</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/estoque" routerLinkActive="active">Estoque</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/relatorios" routerLinkActive="active">Relatórios</a>
            </li>
          </ul>
          <div class="d-flex align-items-center" *ngIf="isLoggedIn">
            <app-notificacoes class="me-3"></app-notificacoes>
            <span class="navbar-text me-3">
              Olá, {{ currentUser?.name || 'Usuário' }}
            </span>
            <button class="btn btn-outline-light" (click)="logout()">Sair</button>
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
  `]
})
export class NavBarComponent implements OnInit {
  isLoggedIn = false;
  currentUser: User | null = null;

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
} 