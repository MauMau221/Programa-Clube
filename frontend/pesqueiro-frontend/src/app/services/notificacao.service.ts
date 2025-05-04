import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PedidoService } from './pedido.service';

export interface Notificacao {
  id: number;
  tipo: 'pedido' | 'estoque' | 'sistema';
  subtipo?: 'entrada' | 'saida' | 'estoque_baixo' | 'alerta' | 'info';
  titulo: string;
  mensagem: string;
  lida: boolean;
  data: Date;
  link?: string;
  dados?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {
  private apiUrl = environment.apiUrl;
  private notificacoesSubject = new BehaviorSubject<Notificacao[]>([]);
  private pedidosPendentesSubject = new BehaviorSubject<number>(0);
  private notificacaoSomSubject = new BehaviorSubject<boolean>(false);
  
  notificacoes$ = this.notificacoesSubject.asObservable();
  pedidosPendentes$ = this.pedidosPendentesSubject.asObservable();
  notificacaoSom$ = this.notificacaoSomSubject.asObservable();
  
  private polling: any;
  private audio: HTMLAudioElement;

  constructor(
    private http: HttpClient,
    private pedidoService: PedidoService
  ) {
    // Inicializa o áudio de notificação
    this.audio = new Audio();
    this.audio.src = 'assets/sounds/notification.mp3';
    this.audio.load();
    
    // Inicia o polling quando o serviço for criado - será mantido como backup
    this.iniciarPolling();
  }

  private iniciarPolling(): void {
    // Verifica a cada 60 segundos por novos pedidos pendentes (como backup)
    this.polling = interval(60000).pipe(
      switchMap(() => this.verificarPedidosPendentes())
    ).subscribe();

    // Faz uma verificação inicial
    this.verificarPedidosPendentes().subscribe();
  }

  private verificarPedidosPendentes(): Observable<any> {
    return this.pedidoService.getPedidos().pipe(
      tap(pedidos => {
        const pendentes = pedidos.filter(p => p.status.toLowerCase() === 'pendente').length;
        this.pedidosPendentesSubject.next(pendentes);
        
        // Se houver pedidos pendentes, cria notificações
        if (pendentes > 0) {
          const notificacoesAtuais = this.notificacoesSubject.value;
          const novaNotificacao: Notificacao = {
            id: new Date().getTime(),
            tipo: 'pedido',
            titulo: 'Pedidos Pendentes',
            mensagem: `Há ${pendentes} pedido(s) aguardando preparo`,
            lida: false,
            data: new Date(),
            link: '/pedidos'
          };
          
          // Adiciona apenas se não houver uma notificação similar nos últimos 5 minutos
          const cincoMinutosAtras = new Date(Date.now() - 5 * 60 * 1000);
          const existeNotificacao = notificacoesAtuais.some(
            n => n.tipo === 'pedido' && 
                 n.titulo === 'Pedidos Pendentes' && 
                 new Date(n.data) > cincoMinutosAtras
          );
          
          if (!existeNotificacao) {
            this.adicionarNotificacao(novaNotificacao);
          }
        }
      })
    );
  }

  adicionarNotificacao(notificacao: Partial<Notificacao>): void {
    const notificacoesAtuais = this.notificacoesSubject.value;
    const novaNotificacao: Notificacao = {
      ...notificacao as any,
      id: notificacao.id || new Date().getTime(),
      data: notificacao.data || new Date(),
      lida: notificacao.lida || false,
      tipo: notificacao.tipo || 'sistema',
      titulo: notificacao.titulo || 'Notificação',
      mensagem: notificacao.mensagem || ''
    };
    
    this.notificacoesSubject.next([novaNotificacao, ...notificacoesAtuais]);
    
    // Toca o som de notificação
    this.tocarSomNotificacao();
    
    // Mostra notificação no navegador se suportado
    this.mostrarNotificacaoNavegador(novaNotificacao);
  }

  private tocarSomNotificacao(): void {
    // Reproduz o som e emite um evento de som tocado
    if (this.audio) {
      this.audio.play().then(() => {
        this.notificacaoSomSubject.next(true);
        setTimeout(() => this.notificacaoSomSubject.next(false), 1000);
      }).catch(error => console.error('Erro ao tocar som de notificação:', error));
    }
  }

  private mostrarNotificacaoNavegador(notificacao: Notificacao): void {
    // Verifica se as notificações são suportadas e permitidas
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notificacao.titulo, {
        body: notificacao.mensagem,
        icon: 'assets/icons/logo.png'
      });
    } 
    // Solicita permissão se ainda não foi concedida
    else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }

  marcarComoLida(id: number): void {
    const notificacoesAtuais = this.notificacoesSubject.value;
    const notificacoesAtualizadas = notificacoesAtuais.map(n => 
      n.id === id ? { ...n, lida: true } : n
    );
    
    this.notificacoesSubject.next(notificacoesAtualizadas);
  }

  limparNotificacoes(): void {
    this.notificacoesSubject.next([]);
  }

  limparNotificacoesLidas(): void {
    const notificacoesAtuais = this.notificacoesSubject.value;
    const notificacoesNaoLidas = notificacoesAtuais.filter(n => !n.lida);
    
    this.notificacoesSubject.next(notificacoesNaoLidas);
  }

  pararPolling(): void {
    if (this.polling) {
      this.polling.unsubscribe();
    }
  }
}
