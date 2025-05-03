import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
    return this.http.get<Pedido[]>(`${this.apiUrl}/pedido`);
  }

  // Obter um pedido específico
  getPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/pedido/${id}`);
  }

  // Atualizar status do pedido (em preparo, pronto, entregue, etc.)
  atualizarStatus(id: number, status: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/pedido/${id}/status`, { status });
  }
}
