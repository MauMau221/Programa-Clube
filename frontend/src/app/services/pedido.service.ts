import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PainelCliente, Pedido } from '../models/pedido.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Obter todos os pedidos
  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/pedido`).pipe(
      map(pedidos => {
        // Processar cada pedido para garantir que tenha todos os dados necessários
        return pedidos.map(pedido => {
          // Inicializar itens como array vazio se não existir
          if (!pedido.itens) {
            pedido.itens = [];
          }
          
          // Garantir que a propriedade mesa seja definida para exibição
          if (!pedido.mesa && pedido.comanda && pedido.comanda.mesa) {
            pedido.mesa = pedido.comanda.mesa;
          }
          
          // Garantir que a propriedade cliente seja definida se estiver na comanda
          if (!pedido.cliente && pedido.comanda && pedido.comanda.cliente) {
            pedido.cliente = pedido.comanda.cliente;
          }
          
          return pedido;
        });
      })
    );
  }

  // Listar pedidos formatados para o Kanban (com mais detalhes)
  listarPedidos(): Observable<Pedido[]> {
    // Usando a rota /pedido/detalhado que agora está funcionando
    return this.http.get<Pedido[]>(`${this.apiUrl}/pedido/detalhado`).pipe(
      map(pedidos => {
        // Processamento adicional de dados, se necessário
        return pedidos.map(pedido => {
          if (!pedido.produtos) {
            pedido.produtos = [];
          }
          // Garantir que a propriedade mesa seja definida para exibição
          if (!pedido.mesa && pedido.comanda && pedido.comanda.mesa) {
            pedido.mesa = pedido.comanda.mesa;
          }
          return pedido;
        });
      })
    );
  }

  // Obter um pedido específico
  getPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/pedido/${id}`);
  }

  // Iniciar preparo do pedido
  iniciarPreparo(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/pedido/${id}/iniciar-preparo`, {}).pipe(
      map(response => {
        // Verificar se a resposta tem a estrutura esperada
        if (response.pedido) {
          return response.pedido;
        }
        return response;
      })
    );
  }

  // Finalizar preparo do pedido (marcar como pronto)
  finalizarPreparo(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/pedido/${id}/finalizar-preparo`, {}).pipe(
      map(response => {
        // Verificar se a resposta tem a estrutura esperada
        if (response.pedido) {
          return response.pedido;
        }
        return response;
      })
    );
  }

  // Atualizar status do pedido (em preparo, pronto, entregue, etc.)
  atualizarStatus(id: number, status: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/pedido/${id}/status`, { status });
  }

  // Enviar pedido para a cozinha
  enviarParaCozinha(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/pedido/${id}/enviar-cozinha`, {});
  }
  
  // Obter dados para o painel de clientes (pedidos em preparo e prontos)
  getPainelCliente(): Observable<PainelCliente> {
    return this.http.get<PainelCliente>(`${this.apiUrl}/pedidos/painel-cliente`);
  }
}
