import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Produto } from '../models/comanda.model';
import { tap, catchError, map } from 'rxjs/operators';
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
    return this.http.get<any>(`${this.apiUrl}/produto`).pipe(
      tap(response => {
        console.log('Resposta completa da API (produtos):', response);
        if (Array.isArray(response) && response.length > 0) {
          console.log('Primeiro item da resposta:', response[0]);
        } else if (response && response.data && Array.isArray(response.data)) {
          console.log('Resposta contém dados na propriedade data:', response.data.length, 'itens');
          if (response.data.length > 0) {
            console.log('Primeiro item da propriedade data:', response.data[0]);
          }
        }
      }),
      map((response: any) => {
        // Se a resposta tiver uma propriedade 'data', retorna essa propriedade
        let produtos: any[] = [];
        
        if (response && response.data && Array.isArray(response.data)) {
          produtos = response.data;
        } else if (Array.isArray(response)) {
          produtos = response;
        }
        
        // Normalizar cada produto para garantir que todos os campos necessários estão presentes
        return produtos.map(produto => {
          // Garantir que o objeto tenha todos os campos do modelo Produto
          return {
            id: produto.id ? +produto.id : 0,
            nome: produto.nome || '',
            preco: produto.preco !== undefined ? 
                  (typeof produto.preco === 'number' ? produto.preco : parseFloat(produto.preco)) : 0,
            categoria_id: produto.categoria_id !== undefined ? 
                         (typeof produto.categoria_id === 'number' ? produto.categoria_id : +produto.categoria_id) : 0,
            categoria: produto.categoria || null,
            status: produto.status || 'indisponivel',
            observacao: produto.observacao || '',
            estoque_minimo: produto.estoque_minimo !== undefined ? 
                           (typeof produto.estoque_minimo === 'number' ? produto.estoque_minimo : parseInt(produto.estoque_minimo)) : 5,
            quantidade_estoque: produto.quantidade_estoque !== undefined ? 
                              (typeof produto.quantidade_estoque === 'number' ? produto.quantidade_estoque : parseInt(produto.quantidade_estoque)) : 0,
            created_at: produto.created_at || '',
            updated_at: produto.updated_at || ''
          } as Produto;
        });
      }),
      catchError(error => {
        console.error('Erro ao obter produtos:', error);
        
        // Se falhar, vamos tentar com uma URL alternativa
        if (error.status === 401) {
          console.log('Tentando rota alternativa...');
          return this.http.get<any>(`${this.apiUrl}/produtos`).pipe(
            tap(response => {
              console.log('Resposta da rota alternativa:', response);
            }),
            map((response: any) => {
              let produtos: any[] = [];
              
              if (response && response.data && Array.isArray(response.data)) {
                produtos = response.data;
              } else if (Array.isArray(response)) {
                produtos = response;
              }
              
              // Normalizar cada produto para garantir que todos os campos necessários estão presentes
              return produtos.map(produto => {
                // Garantir que o objeto tenha todos os campos do modelo Produto
                return {
                  id: produto.id ? +produto.id : 0,
                  nome: produto.nome || '',
                  preco: produto.preco !== undefined ? 
                        (typeof produto.preco === 'number' ? produto.preco : parseFloat(produto.preco)) : 0,
                  categoria_id: produto.categoria_id !== undefined ? 
                               (typeof produto.categoria_id === 'number' ? produto.categoria_id : +produto.categoria_id) : 0,
                  categoria: produto.categoria || null,
                  status: produto.status || 'indisponivel',
                  observacao: produto.observacao || '',
                  estoque_minimo: produto.estoque_minimo !== undefined ? 
                                 (typeof produto.estoque_minimo === 'number' ? produto.estoque_minimo : parseInt(produto.estoque_minimo)) : 5,
                  quantidade_estoque: produto.quantidade_estoque !== undefined ? 
                                    (typeof produto.quantidade_estoque === 'number' ? produto.quantidade_estoque : parseInt(produto.quantidade_estoque)) : 0,
                  created_at: produto.created_at || '',
                  updated_at: produto.updated_at || ''
                } as Produto;
              });
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
    
    return this.http.get<any>(`${this.apiUrl}/produto/${id}`).pipe(
      tap(response => {
        console.log('Resposta do produto (raw):', JSON.stringify(response));
        
        // Verificar se a resposta contém a propriedade 'original'
        if (response && response.original && response.original.id) {
          console.log('Encontrado produto dentro da propriedade original:', response.original);
          console.log('Campos do produto recebido:',
            'id=' + response.original.id,
            'nome=' + response.original.nome,
            'preco=' + response.original.preco,
            'categoria_id=' + response.original.categoria_id,
            'status=' + response.original.status,
            'estoque_minimo=' + response.original.estoque_minimo
          );
        }
        // Verificar se todos os campos necessários estão presentes
        else if (response && response.id) {
          console.log('Campos do produto recebido:',
            'id=' + response.id,
            'nome=' + response.nome,
            'preco=' + response.preco,
            'categoria_id=' + response.categoria_id,
            'status=' + response.status,
            'estoque_minimo=' + response.estoque_minimo
          );
        } else if (response && response.data && response.data.id) {
          console.log('Resposta contém um produto válido na propriedade data:',
            'id=' + response.data.id,
            'nome=' + response.data.nome,
            'preco=' + response.data.preco,
            'categoria_id=' + response.data.categoria_id,
            'status=' + response.data.status,
            'estoque_minimo=' + response.data.estoque_minimo
          );
        } else {
          console.error('Resposta não contém um produto válido:', response);
        }
      }),
      // Transformar a resposta caso contenha uma propriedade 'data'
      map((response: any) => {
        // Obter o objeto produto da resposta
        let produtoData: any = null;
        
        // Verificar e extrair dados em diferentes formatos de resposta
        if (response && response.original && response.original.id) {
          produtoData = response.original;
        } else if (response && response.data) {
          produtoData = response.data;
        } else if (response && response.id) {
          produtoData = response;
        }
        
        // Se não encontramos dados válidos, retorna um objeto vazio
        if (!produtoData) {
          console.error('Não foi possível extrair dados válidos do produto');
          return {} as Produto;
        }
        
        console.log('Produto encontrado com ID:', produtoData.id);
        
        // Normaliza o objeto para garantir que todos os campos do modelo estão presentes
        const produtoNormalizado = {
          id: produtoData.id ? +produtoData.id : 0,
          nome: produtoData.nome || '',
          preco: produtoData.preco !== undefined && produtoData.preco !== null ? 
                (typeof produtoData.preco === 'number' ? produtoData.preco : parseFloat(String(produtoData.preco))) : 0,
          categoria_id: produtoData.categoria_id !== undefined && produtoData.categoria_id !== null ? 
                       (typeof produtoData.categoria_id === 'number' ? produtoData.categoria_id : +produtoData.categoria_id) : 0,
          categoria: produtoData.categoria || null,
          status: produtoData.status || 'indisponivel',
          observacao: produtoData.observacao || '',
          estoque_minimo: produtoData.estoque_minimo !== undefined && produtoData.estoque_minimo !== null ? 
                         (typeof produtoData.estoque_minimo === 'number' ? produtoData.estoque_minimo : parseInt(String(produtoData.estoque_minimo))) : 5,
          quantidade_estoque: produtoData.quantidade_estoque !== undefined && produtoData.quantidade_estoque !== null ? 
                            (typeof produtoData.quantidade_estoque === 'number' ? produtoData.quantidade_estoque : parseInt(String(produtoData.quantidade_estoque))) : 0,
          created_at: produtoData.created_at || '',
          updated_at: produtoData.updated_at || ''
        } as Produto;
        
        console.log('Produto normalizado para o frontend:', produtoNormalizado);
        return produtoNormalizado;
      }),
      catchError(error => {
        console.error('Erro ao obter produto:', error);
        
        // Se falhar, vamos tentar com uma URL alternativa
        if (error.status === 401 || error.status === 404) {
          console.log('Tentando rota alternativa para produto único...');
          return this.http.get<any>(`${this.apiUrl}/produtos/${id}`).pipe(
            tap(response => {
              console.log('Resposta da rota alternativa de produto único:', JSON.stringify(response));
              
              // Verificar se a resposta contém a propriedade 'original'
              if (response && response.original && response.original.id) {
                console.log('Encontrado produto na rota alternativa dentro da propriedade original:', response.original);
              }
            }),
            map((response: any) => {
              // Obter o objeto produto da resposta
              let produtoData: any = null;
              
              // Verificar e extrair dados em diferentes formatos de resposta
              if (response && response.original && response.original.id) {
                produtoData = response.original;
              } else if (response && response.data) {
                produtoData = response.data;
              } else if (response && response.id) {
                produtoData = response;
              }
              
              // Se não encontramos dados válidos, retorna um objeto vazio
              if (!produtoData) {
                console.error('Não foi possível extrair dados válidos do produto (rota alternativa)');
                return {} as Produto;
              }
              
              console.log('Produto encontrado (rota alternativa) com ID:', produtoData.id);
              
              // Normaliza o objeto para garantir que todos os campos do modelo estão presentes
              const produtoNormalizado = {
                id: produtoData.id ? +produtoData.id : 0,
                nome: produtoData.nome || '',
                preco: produtoData.preco !== undefined && produtoData.preco !== null ? 
                      (typeof produtoData.preco === 'number' ? produtoData.preco : parseFloat(String(produtoData.preco))) : 0,
                categoria_id: produtoData.categoria_id !== undefined && produtoData.categoria_id !== null ? 
                             (typeof produtoData.categoria_id === 'number' ? produtoData.categoria_id : +produtoData.categoria_id) : 0,
                categoria: produtoData.categoria || null,
                status: produtoData.status || 'indisponivel',
                observacao: produtoData.observacao || '',
                estoque_minimo: produtoData.estoque_minimo !== undefined && produtoData.estoque_minimo !== null ? 
                               (typeof produtoData.estoque_minimo === 'number' ? produtoData.estoque_minimo : parseInt(String(produtoData.estoque_minimo))) : 5,
                quantidade_estoque: produtoData.quantidade_estoque !== undefined && produtoData.quantidade_estoque !== null ? 
                                  (typeof produtoData.quantidade_estoque === 'number' ? produtoData.quantidade_estoque : parseInt(String(produtoData.quantidade_estoque))) : 0,
                created_at: produtoData.created_at || '',
                updated_at: produtoData.updated_at || ''
              } as Produto;
              
              console.log('Produto normalizado (rota alternativa) para o frontend:', produtoNormalizado);
              return produtoNormalizado;
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