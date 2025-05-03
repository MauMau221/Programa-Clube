import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PedidoService } from './pedido.service';

export interface Notificacao {
  id: number;
  tipo: 'pedido' | 'estoque' | 'sistema';
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
  
  notificacoes$ = this.notificacoesSubject.asObservable();
  pedidosPendentes$ = this.pedidosPendentesSubject.asObservable();
  
  private polling: any;

  constructor(
    private http: HttpClient,
    private pedidoService: PedidoService
  ) {
    // Inicia o polling quando o serviço for criado
    this.iniciarPolling();
  }

  private iniciarPolling(): void {
    // Verifica a cada 30 segundos por novos pedidos pendentes
    this.polling = interval(30000).pipe(
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
          
          // Adiciona apenas se não houver uma notificação similar
          const existeNotificacao = notificacoesAtuais.some(
            n => n.tipo === 'pedido' && n.titulo === 'Pedidos Pendentes'
          );
          
          if (!existeNotificacao) {
            this.notificacoesSubject.next([novaNotificacao, ...notificacoesAtuais]);
          }
        }
      })
    );
  }

  adicionarNotificacao(notificacao: Omit<Notificacao, 'id' | 'data' | 'lida'>): void {
    const notificacoesAtuais = this.notificacoesSubject.value;
    const novaNotificacao: Notificacao = {
      ...notificacao,
      id: new Date().getTime(),
      data: new Date(),
      lida: false
    };
    
    this.notificacoesSubject.next([novaNotificacao, ...notificacoesAtuais]);
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
