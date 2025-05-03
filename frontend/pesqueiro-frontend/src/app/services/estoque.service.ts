import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Produto, EstoqueHistorico, EstoqueMovimento } from '../models/comanda.model';

@Injectable({
  providedIn: 'root'
})
export class EstoqueService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Buscar produtos com estoque baixo
  getProdutosEstoqueBaixo(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/estoque/produtos/baixo`);
  }

  // Adicionar quantidade ao estoque de um produto
  adicionarEstoque(produtoId: number, quantidade: number, motivo?: string): Observable<EstoqueMovimento> {
    return this.http.post<EstoqueMovimento>(`${this.apiUrl}/estoque/produtos/${produtoId}/adicionar`, {
      quantidade,
      motivo
    });
  }

  // Remover quantidade do estoque de um produto
  removerEstoque(produtoId: number, quantidade: number, motivo?: string): Observable<EstoqueMovimento> {
    return this.http.post<EstoqueMovimento>(`${this.apiUrl}/estoque/produtos/${produtoId}/remover`, {
      quantidade,
      motivo
    });
  }

  // Obter histórico de movimentação de estoque de um produto
  getHistoricoEstoque(produtoId: number): Observable<EstoqueHistorico[]> {
    return this.http.get<EstoqueHistorico[]>(`${this.apiUrl}/estoque/produtos/${produtoId}/historico`);
  }
} 