import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comanda, ComandaItem } from '../models/comanda.model';

@Injectable({
  providedIn: 'root'
})
export class ComandaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getComandas(): Observable<Comanda[]> {
    return this.http.get<Comanda[]>(`${this.apiUrl}/comanda`);
  }

  getComanda(id: number): Observable<Comanda> {
    return this.http.get<Comanda>(`${this.apiUrl}/comanda/${id}`);
  }

  criarComanda(comanda: Partial<Comanda>): Observable<Comanda> {
    return this.http.post<Comanda>(`${this.apiUrl}/comanda`, comanda);
  }

  atualizarComanda(id: number, comanda: Partial<Comanda>): Observable<Comanda> {
    return this.http.put<Comanda>(`${this.apiUrl}/comanda/${id}`, comanda);
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
} 