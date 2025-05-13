import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificacaoService } from './notificacao.service';

// Importações do Echo
import Echo from 'laravel-echo';
import io from 'socket.io-client';

// Adiciona io ao escopo global
declare global {
  interface Window {
    io: any;
    Echo: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class EchoService {
  private echoInstance: Echo<'socket.io'> | null = null;
  private conectadoSubject = new BehaviorSubject<boolean>(false);
  conectado$ = this.conectadoSubject.asObservable();

  constructor(
    private authService: AuthService,
    private notificacaoService: NotificacaoService
  ) {
    window.io = io;
    this.inicializar();
  }

  private inicializar(): void {
    // Obter o token do usuário autenticado
    const token = this.authService.getToken();
    if (!token) {
      console.warn('Token não encontrado. Não é possível conectar ao Echo Server.');
      return;
    }

    // Criar instância do Echo
    this.echoInstance = new Echo<'socket.io'>({
      broadcaster: 'socket.io' as const,
      host: environment.echoConfig.host,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    console.log('Echo Service inicializado com sucesso');
    this.conectadoSubject.next(true);
    this.ouvirCanais();
  }

  private ouvirCanais(): void {
    if (!this.echoInstance) return;

    // Ouvir canal privado de pedidos
    this.echoInstance.private('pedidos')
      .listen('NovoPedidoEvent', (event: any) => {
        console.log('NovoPedidoEvent recebido:', event);
        this.notificacaoService.adicionarNotificacao({
          tipo: 'pedido',
          titulo: 'Novo Pedido',
          mensagem: event.mensagem || 'Um novo pedido foi recebido!',
          dados: event.pedido
        });
      })
      .listen('StatusPedidoEvent', (event: any) => {
        console.log('StatusPedidoEvent recebido:', event);
        this.notificacaoService.adicionarNotificacao({
          tipo: 'pedido',
          titulo: 'Status de Pedido Atualizado',
          mensagem: event.mensagem || `Status do pedido ${event.pedido.id} atualizado para ${event.novoStatus}`,
          dados: {
            pedido: event.pedido,
            novoStatus: event.novoStatus
          }
        });
      });

    console.log('Canais configurados com sucesso');
  }

  reiniciarConexao(): void {
    if (this.echoInstance) {
      this.echoInstance.disconnect();
      this.echoInstance = null;
      this.conectadoSubject.next(false);
    }
    this.inicializar();
  }

  isConectado(): boolean {
    return !!this.echoInstance;
  }

  getEchoInstance(): Echo<'socket.io'> | null {
    return this.echoInstance;
  }
} 