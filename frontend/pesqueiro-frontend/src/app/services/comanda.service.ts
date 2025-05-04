import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comanda, ComandaItem } from '../models/comanda.model';
import { tap, map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComandaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getComandas(): Observable<Comanda[]> {
    return this.http.get<Comanda[]>(`${this.apiUrl}/comanda`).pipe(
      map(comandas => {
        // Garantir que todas as comandas tenham o total como número
        return comandas.map(comanda => ({
          ...comanda,
          total: typeof comanda.total === 'number' ? comanda.total : Number(comanda.total) || 0
        }));
      }),
      catchError(error => {
        console.error('Erro ao buscar comandas:', error);
        return throwError(() => error);
      })
    );
  }

  getComanda(id: number): Observable<Comanda> {
    return this.http.get<Comanda>(`${this.apiUrl}/comanda/${id}`).pipe(
      map(comanda => ({
        ...comanda,
        total: typeof comanda.total === 'number' ? comanda.total : Number(comanda.total) || 0
      })),
      catchError(error => {
        console.error(`Erro ao obter comanda com ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  criarComanda(comanda: Partial<Comanda>): Observable<Comanda> {
    // Garantir que os campos obrigatórios estejam presentes e que a mesa seja uma string
    const comandaCompleta = {
      ...comanda,
      mesa: comanda.mesa ? String(comanda.mesa) : '',  // Converter mesa para string
      total: comanda.total ?? 0,
      status: comanda.status ?? 'aberta'
    };
    
    console.log('Enviando dados completos para criar comanda:', comandaCompleta);
    
    return this.http.post<Comanda>(`${this.apiUrl}/comanda`, comandaCompleta).pipe(
      tap(response => console.log('Resposta do servidor ao criar comanda:', response)),
      map(comanda => ({
        ...comanda,
        total: typeof comanda.total === 'number' ? comanda.total : Number(comanda.total) || 0
      }))
    );
  }

  atualizarComanda(id: number, comanda: Partial<Comanda>): Observable<Comanda> {
    // Também garantir que a mesa seja uma string na atualização
    const comandaAtualizada = {
      ...comanda,
      mesa: comanda.mesa ? String(comanda.mesa) : ''
    };
    
    return this.http.put<Comanda>(`${this.apiUrl}/comanda/${id}`, comandaAtualizada);
  }

  fecharComanda(id: number): Observable<Comanda> {
    return this.http.put<Comanda>(`${this.apiUrl}/comanda/close/${id}`, {});
  }

  cancelarComanda(id: number): Observable<Comanda> {
    return this.http.put<Comanda>(`${this.apiUrl}/comanda/${id}/cancelar`, {});
  }

  // Métodos para gerenciar itens da comanda
  adicionarItem(comandaId: number, item: Partial<ComandaItem>): Observable<ComandaItem> {
    return this.http.post<ComandaItem>(`${this.apiUrl}/comanda/${comandaId}/itens`, item);
  }

  atualizarItem(comandaId: number, itemId: number, item: Partial<ComandaItem>): Observable<ComandaItem> {
    return this.http.put<ComandaItem>(`${this.apiUrl}/comanda/${comandaId}/itens/${itemId}`, item);
  }

  removerItem(comandaId: number, itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/comanda/${comandaId}/itens/${itemId}`);
  }

  // Verificar se a comanda tem pedidos pendentes de envio para a cozinha
  verificarPedidosPendentes(comandaId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/comanda/${comandaId}/pedidos-pendentes`);
  }
} 