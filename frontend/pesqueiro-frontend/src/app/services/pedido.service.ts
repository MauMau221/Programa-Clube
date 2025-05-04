import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PainelCliente } from '../models/pedido.model';
import { map } from 'rxjs/operators';

interface Pedido {
  id: number;
  comanda_id: number;
  mesa: string;
  status: string;
  itens: any[];
  created_at: string;
  updated_at: string;
}

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
        // Garantir que todos os pedidos tenham a propriedade itens inicializada
        return pedidos.map(pedido => {
          // Inicializar itens como array vazio se não existir
          if (!pedido.itens) {
            pedido.itens = [];
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
