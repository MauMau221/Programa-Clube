import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Produto, EstoqueHistorico, EstoqueMovimento } from '../models/comanda.model';
import { EstoqueResponse, EstoqueNotificacao } from '../models/estoque.model';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EstoqueService {
  private apiUrl = environment.apiUrl;

  // BehaviorSubject para emitir atualizações de estoque
  private estoqueAtualizadoSource = new BehaviorSubject<EstoqueNotificacao | null>(null);
  estoqueAtualizado$ = this.estoqueAtualizadoSource.asObservable();

  constructor(private http: HttpClient) { }

  // Método para notificar outros componentes que um estoque foi atualizado
  notificarEstoqueAtualizado(produtoId: number, quantidade: number): void {
    console.log(`Notificando atualização de estoque: Produto ID ${produtoId}, Quantidade: ${quantidade}`);
    this.estoqueAtualizadoSource.next({produtoId, quantidade});
  }

  // Buscar produtos com estoque baixo
  getProdutosEstoqueBaixo(): Observable<Produto[]> {
    return this.http.get<any>(`${this.apiUrl}/estoque/produtos/baixo`).pipe(
      map(response => {
        console.log('Resposta da API de estoque baixo:', response);
        
        // Verificar a estrutura da resposta
        if (response && response.produtos_estoque_baixo && Array.isArray(response.produtos_estoque_baixo)) {
          // Extrair os produtos do formato enviado pela API
          return response.produtos_estoque_baixo.map((item: any) => {
            if (item.produto) {
              // Garantir que o produto tenha estoque_atual e estoque_minimo preenchidos
              const produto = item.produto;
              produto.quantidade_estoque = item.estoque_atual || produto.quantidade_estoque || 0;
              produto.estoque_minimo = item.estoque_minimo || produto.estoque_minimo || 0;
              // Adicionar o status enviado pelo backend
              produto.status_estoque = item.status || (produto.quantidade_estoque === 0 ? 'esgotado' : 'baixo');
              return produto;
            }
            return item;
          });
        } else if (Array.isArray(response)) {
          // Se for um array simples
          return response;
        }
        
        // Caso não tenha dados
        console.warn('Formato de resposta não reconhecido para produtos com estoque baixo', response);
        return [];
      })
    );
  }

  // Adicionar quantidade ao estoque de um produto
  adicionarEstoque(produtoId: number, quantidade: number, motivo?: string): Observable<EstoqueResponse> {
    const data = { quantidade, motivo: motivo || 'Adição manual de estoque' };
    
    return this.http.post<EstoqueResponse>(`${this.apiUrl}/estoque/produtos/${produtoId}/adicionar`, data)
      .pipe(
        tap(response => {
          console.log('Resposta do servidor após adicionar estoque:', response);
          // Notificar sobre a atualização do estoque
          if (response && typeof response.estoque_atual === 'number') {
            this.notificarEstoqueAtualizado(produtoId, response.estoque_atual);
          }
        })
      );
  }

  // Remover quantidade do estoque de um produto
  removerEstoque(produtoId: number, quantidade: number, motivo?: string): Observable<EstoqueResponse> {
    const data = { quantidade, motivo: motivo || 'Remoção manual de estoque' };
    
    return this.http.post<EstoqueResponse>(`${this.apiUrl}/estoque/produtos/${produtoId}/remover`, data)
      .pipe(
        tap(response => {
          console.log('Resposta do servidor após remover estoque:', response);
          // Notificar sobre a atualização do estoque
          if (response && typeof response.estoque_atual === 'number') {
            this.notificarEstoqueAtualizado(produtoId, response.estoque_atual);
          }
        })
      );
  }

  // Obter histórico de movimentação de estoque de um produto
  getHistoricoEstoque(produtoId: number): Observable<EstoqueHistorico[]> {
    return this.http.get<EstoqueHistorico[]>(`${this.apiUrl}/estoque/produtos/${produtoId}/historico`);
  }
} 