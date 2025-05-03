import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Categoria } from '../models/comanda.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categoria`);
  }

  getCategoria(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/categoria/${id}`);
  }

  criarCategoria(categoria: Partial<Categoria>): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.apiUrl}/categoria`, categoria);
  }

  atualizarCategoria(id: number, categoria: Partial<Categoria>): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/categoria/${id}`, categoria);
  }

  excluirCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categoria/${id}`);
  }
} 