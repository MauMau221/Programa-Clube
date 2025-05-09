import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DashboardSummary {
  comandasAtivas: number;
  faturamentoHoje: number;
  pedidosHoje: number;
  produtosBaixoEstoque: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  /**
   * Obtém dados resumidos para o dashboard
   */
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/summary`).pipe(
      catchError(error => {
        console.error('Erro ao buscar resumo do dashboard', error);
        // Retornar dados mockados em caso de erro
        return of(this.getMockSummary());
      })
    );
  }

  /**
   * Formata o valor monetário para exibição
   * @param value Valor a ser formatado
   * @returns String formatada
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  }

  /**
   * Retorna dados mockados para desenvolvimento e em caso de falhas na API
   */
  private getMockSummary(): DashboardSummary {
    return {
      comandasAtivas: 12,
      faturamentoHoje: 2560.0,
      pedidosHoje: 36,
      produtosBaixoEstoque: 8
    };
  }
} 