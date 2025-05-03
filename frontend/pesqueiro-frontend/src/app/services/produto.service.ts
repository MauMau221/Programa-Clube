import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Produto } from '../models/comanda.model';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getProdutos(): Observable<Produto[]> {
    console.log('Fazendo requisição para:', `${this.apiUrl}/produto`);
    console.log('Token de autenticação:', localStorage.getItem('auth_token'));
    
    // Vamos tentar com a URL correta da API
    return this.http.get<Produto[]>(`${this.apiUrl}/produto`).pipe(
      tap(response => {
        console.log('Resposta completa da API (produtos):', response);
        if (Array.isArray(response) && response.length > 0) {
          console.log('Primeiro item da resposta:', response[0]);
        }
      }),
      catchError(error => {
        console.error('Erro ao obter produtos:', error);
        
        // Se falhar, vamos tentar com uma URL alternativa
        if (error.status === 401) {
          console.log('Tentando rota alternativa...');
          return this.http.get<Produto[]>(`${this.apiUrl}/produtos`).pipe(
            tap(response => {
              console.log('Resposta da rota alternativa:', response);
            })
          );
        }
        
        return throwError(() => error);
      })
    );
  }

  getProdutosDisponiveis(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/produto/disponiveis`);
  }

  getProduto(id: number): Observable<Produto> {
    console.log('Fazendo requisição para:', `${this.apiUrl}/produto/${id}`);
    
    return this.http.get<Produto>(`${this.apiUrl}/produto/${id}`).pipe(
      tap(response => {
        console.log('Resposta do produto:', response);
      }),
      catchError(error => {
        console.error('Erro ao obter produto:', error);
        
        // Se falhar, vamos tentar com uma URL alternativa
        if (error.status === 401) {
          console.log('Tentando rota alternativa para produto único...');
          return this.http.get<Produto>(`${this.apiUrl}/produtos/${id}`).pipe(
            tap(response => {
              console.log('Resposta da rota alternativa de produto único:', response);
            })
          );
        }
        
        return throwError(() => error);
      })
    );
  }

  criarProduto(produto: Partial<Produto>): Observable<Produto> {
    return this.http.post<Produto>(`${this.apiUrl}/produto`, produto);
  }

  atualizarProduto(id: number, produto: Partial<Produto>): Observable<Produto> {
    return this.http.put<Produto>(`${this.apiUrl}/produto/${id}`, produto);
  }

  excluirProduto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/produto/${id}`);
  }

  atualizarDisponibilidade(id: number, status: 'disponivel' | 'indisponivel'): Observable<Produto> {
    return this.http.put<Produto>(`${this.apiUrl}/produto/${id}/disponibilidade`, { status });
  }
} 