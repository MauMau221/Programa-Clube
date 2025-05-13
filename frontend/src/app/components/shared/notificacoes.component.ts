import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificacaoService, Notificacao } from '../../services/notificacao.service';

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="notificacoes-container">
      <div class="notificacoes-icone" (click)="toggleNotificacoes()">
        <i class="bi bi-bell-fill"></i>
        <span class="badge" *ngIf="notificacoesNaoLidas.length > 0">
          {{ notificacoesNaoLidas.length }}
        </span>
      </div>

      <div class="notificacoes-dropdown" [class.ativo]="mostrarNotificacoes">
        <div class="notificacoes-header">
          <h5>Notificações</h5>
          <button *ngIf="notificacoes.length > 0" 
                  (click)="limparNotificacoes()" 
                  class="btn btn-sm btn-outline-secondary">
            Limpar todas
          </button>
        </div>

        <div class="notificacoes-lista" *ngIf="notificacoes.length > 0">
          <div *ngFor="let notificacao of notificacoes" 
               class="notificacao-item" 
               [class.nao-lida]="!notificacao.lida"
               (click)="marcarComoLida(notificacao.id)">
            <div class="notificacao-icone" [ngClass]="getIconeClasse(notificacao)">
              <i [class]="getIcone(notificacao.tipo)"></i>
            </div>
            <div class="notificacao-conteudo">
              <div class="notificacao-titulo">{{ notificacao.titulo }}</div>
              <div class="notificacao-mensagem">{{ notificacao.mensagem }}</div>
              <div class="notificacao-hora">{{ notificacao.data | date:'short' }}</div>
            </div>
            <a *ngIf="notificacao.link" 
               [routerLink]="notificacao.link" 
               class="stretched-link"></a>
          </div>
        </div>

        <div class="notificacoes-vazio" *ngIf="notificacoes.length === 0">
          <i class="bi bi-inbox"></i>
          <p>Nenhuma notificação</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notificacoes-container {
      position: relative;
    }

    .notificacoes-icone {
      cursor: pointer;
      position: relative;
      padding: 0.5rem;
    }

    .notificacoes-icone i {
      font-size: 1.25rem;
    }

    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background-color: #dc3545;
      color: white;
      border-radius: 50%;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }

    .notificacoes-dropdown {
      position: absolute;
      right: 0;
      top: 100%;
      width: 320px;
      background-color: white;
      border-radius: 0.25rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      z-index: 1000;
      display: none;
      overflow: hidden;
    }

    .notificacoes-dropdown.ativo {
      display: block;
    }

    .notificacoes-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #dee2e6;
    }

    .notificacoes-header h5 {
      margin: 0;
    }

    .notificacoes-lista {
      max-height: 300px;
      overflow-y: auto;
    }

    .notificacao-item {
      display: flex;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #dee2e6;
      position: relative;
      cursor: pointer;
    }

    .notificacao-item:hover {
      background-color: #f8f9fa;
    }

    .notificacao-item.nao-lida {
      background-color: #e9f5ff;
    }

    .notificacao-icone {
      flex: 0 0 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      margin-right: 0.75rem;
    }

    .notificacao-icone.pedido {
      background-color: #ffecd2;
      color: #fd7e14;
    }

    .notificacao-icone.estoque-entrada {
      background-color: #d2f4ea;
      color: #20c997;
    }

    .notificacao-icone.estoque-saida {
      background-color: #f8d7da;
      color: #dc3545;
    }

    .notificacao-icone.estoque-baixo {
      background-color: #fff3cd;
      color: #ffc107;
    }

    .notificacao-icone.sistema {
      background-color: #d5e5ff;
      color: #0d6efd;
    }

    .notificacao-conteudo {
      flex: 1;
    }

    .notificacao-titulo {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .notificacao-mensagem {
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
      color: #6c757d;
    }

    .notificacao-hora {
      font-size: 0.75rem;
      color: #adb5bd;
    }

    .notificacoes-vazio {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: #adb5bd;
    }

    .notificacoes-vazio i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
  `]
})
export class NotificacoesComponent implements OnInit, OnDestroy {
  notificacoes: Notificacao[] = [];
  notificacoesNaoLidas: Notificacao[] = [];
  mostrarNotificacoes = false;
  private subscription: Subscription | null = null;

  constructor(private notificacaoService: NotificacaoService) {}

  ngOnInit(): void {
    this.subscription = this.notificacaoService.notificacoes$.subscribe(notificacoes => {
      this.notificacoes = notificacoes;
      this.notificacoesNaoLidas = notificacoes.filter(n => !n.lida);
    });

    // Fechar menu de notificações ao clicar fora dele
    document.addEventListener('click', this.fecharNotificacoes.bind(this));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    document.removeEventListener('click', this.fecharNotificacoes.bind(this));
  }

  toggleNotificacoes(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.mostrarNotificacoes = !this.mostrarNotificacoes;
  }

  fecharNotificacoes(event: Event): void {
    const container = document.querySelector('.notificacoes-container');
    if (container && !container.contains(event.target as Node)) {
      this.mostrarNotificacoes = false;
    }
  }

  marcarComoLida(id: number): void {
    this.notificacaoService.marcarComoLida(id);
  }

  limparNotificacoes(): void {
    this.notificacaoService.limparNotificacoes();
    this.mostrarNotificacoes = false;
  }

  getIcone(tipo: string): string {
    switch (tipo) {
      case 'pedido':
        return 'bi bi-basket';
      case 'estoque':
        return 'bi bi-box';
      case 'sistema':
      default:
        return 'bi bi-bell';
    }
  }

  getIconeClasse(notificacao: Notificacao): string {
    if (notificacao.tipo === 'estoque') {
      // Se tem subtipo, usar uma classe específica
      if (notificacao.subtipo === 'entrada') {
        return 'estoque-entrada';
      } else if (notificacao.subtipo === 'saida') {
        return 'estoque-saida';
      } else if (notificacao.subtipo === 'estoque_baixo' || notificacao.subtipo === 'alerta') {
        return 'estoque-baixo';
      }
    }
    
    // Caso contrário, usar apenas o tipo
    return notificacao.tipo;
  }
} 