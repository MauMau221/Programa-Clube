import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ResumoFinanceiro {
  totalVendido: number;
  porMetodo: { metodo: string; valor: number }[];
}

export interface ProdutoPorMetodo {
  id: number;
  nome: string;
  quantidade: number;
  valor_total: number;
}

export interface ProdutosPorMetodoResponse {
  produtos: ProdutoPorMetodo[];
}

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getResumoFinanceiro(dataInicio?: string, dataFim?: string): Observable<ResumoFinanceiro> {
    let params = new HttpParams();
    if (dataInicio) params = params.set('dataInicio', dataInicio);
    if (dataFim) params = params.set('dataFim', dataFim);
    return this.http.get<ResumoFinanceiro>(`${this.apiUrl}/relatorios/financeiro`, { params });
  }
  
  getProdutosPorMetodo(metodoPagamento: string, dataInicio?: string, dataFim?: string): Observable<ProdutosPorMetodoResponse> {
    let params = new HttpParams()
      .set('metodo_pagamento', metodoPagamento);
      
    if (dataInicio) params = params.set('dataInicio', dataInicio);
    if (dataFim) params = params.set('dataFim', dataFim);
    
    return this.http.get<ProdutosPorMetodoResponse>(`${this.apiUrl}/relatorios/financeiro/por-produto`, { params });
  }
} 