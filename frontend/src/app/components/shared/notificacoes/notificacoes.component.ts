import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificacaoService, Notificacao } from '../../../services/notificacao.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notificacoes.component.html',
  styleUrls: ['./notificacoes.component.scss']
})
export class NotificacoesComponent implements OnInit, OnDestroy {
  notificacoes: Notificacao[] = [];
  pedidosPendentes = 0;
  mostraDropdown = false;
  
  private notificacoesSubscription!: Subscription;
  private pedidosPendentesSubscription!: Subscription;

  constructor(private notificacaoService: NotificacaoService) { }

  ngOnInit(): void {
    this.notificacoesSubscription = this.notificacaoService.notificacoes$.subscribe(
      notificacoes => {
        this.notificacoes = notificacoes;
      }
    );
    
    this.pedidosPendentesSubscription = this.notificacaoService.pedidosPendentes$.subscribe(
      pendentes => {
        this.pedidosPendentes = pendentes;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.notificacoesSubscription) {
      this.notificacoesSubscription.unsubscribe();
    }
    
    if (this.pedidosPendentesSubscription) {
      this.pedidosPendentesSubscription.unsubscribe();
    }
  }

  toggleDropdown(): void {
    this.mostraDropdown = !this.mostraDropdown;
  }

  marcarComoLida(id: number, event: Event): void {
    event.stopPropagation();
    this.notificacaoService.marcarComoLida(id);
  }

  limparNotificacoesLidas(event: Event): void {
    event.stopPropagation();
    this.notificacaoService.limparNotificacoesLidas();
  }

  getIconeNotificacao(tipo: 'pedido' | 'estoque' | 'sistema'): string {
    switch (tipo) {
      case 'pedido': return 'bi bi-receipt';
      case 'estoque': return 'bi bi-box';
      case 'sistema': return 'bi bi-gear';
      default: return 'bi bi-bell';
    }
  }

  getCorNotificacao(tipo: 'pedido' | 'estoque' | 'sistema'): string {
    switch (tipo) {
      case 'pedido': return 'text-primary';
      case 'estoque': return 'text-warning';
      case 'sistema': return 'text-info';
      default: return 'text-dark';
    }
  }

  fecharDropdown(): void {
    this.mostraDropdown = false;
  }

  contarNotificacoesNaoLidas(): number {
    return this.notificacoes.filter(n => !n.lida).length;
  }

  formatarData(data: Date): string {
    const agora = new Date();
    const dataNotificacao = new Date(data);
    
    // Diferença em minutos
    const diffMinutos = Math.floor((agora.getTime() - dataNotificacao.getTime()) / (1000 * 60));
    
    if (diffMinutos < 1) {
      return 'Agora mesmo';
    } else if (diffMinutos < 60) {
      return `Há ${diffMinutos} minuto${diffMinutos > 1 ? 's' : ''}`;
    } else if (diffMinutos < 1440) { // Menos de 24 horas
      const horas = Math.floor(diffMinutos / 60);
      return `Há ${horas} hora${horas > 1 ? 's' : ''}`;
    } else {
      const dias = Math.floor(diffMinutos / 1440);
      return `Há ${dias} dia${dias > 1 ? 's' : ''}`;
    }
  }
}
