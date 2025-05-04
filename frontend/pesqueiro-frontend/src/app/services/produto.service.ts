import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Produto } from '../models/comanda.model';
import { EstoqueResponse } from '../models/estoque.model';
import { tap, catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private apiUrl = environment.apiUrl;
  
  // BehaviorSubject para emitir atualizações quando o estoque é modificado
  private produtoAtualizadoSource = new BehaviorSubject<number | null>(null);
  produtoAtualizado$ = this.produtoAtualizadoSource.asObservable();

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) { }

  // Método para notificar outros componentes que um produto foi atualizado
  notificarProdutoAtualizado(produtoId: number): void {
    this.logger.debug(`Notificando atualização para produto ID: ${produtoId}`);
    this.produtoAtualizadoSource.next(null); // Limpa o valor atual
    setTimeout(() => {
      // Emite após um curto atraso para garantir que os componentes detectem a mudança
      this.produtoAtualizadoSource.next(produtoId);
    }, 10);
  }

  // Método para obter quantidade_estoque atualizada
  atualizarEstoqueProduto(produtoId: number): Observable<number> {
    // Garantir que o ID seja um número
    const id = typeof produtoId === 'string' ? parseInt(produtoId, 10) : produtoId;
    
    this.logger.debug(`Solicitando saldo de estoque para produto ID: ${id}`);
    return this.http.get<EstoqueResponse>(`${this.apiUrl}/estoque/produtos/${id}/saldo`).pipe(
      tap(response => {
        this.logger.debug(`Resposta da API para saldo do produto ${id}`, response);
      }),
      map(response => {
        // Se a resposta for um objeto com propriedade estoque_atual, use-a
        if (response && typeof response.estoque_atual === 'number') {
          this.logger.debug(`Usando valor de estoque_atual: ${response.estoque_atual}`);
          return response.estoque_atual;
        }
        // Se response.data contém estoque_atual
        if (response && response.data && typeof response.data.estoque_atual === 'number') {
          this.logger.debug(`Usando valor de data.estoque_atual: ${response.data.estoque_atual}`);
          return response.data.estoque_atual;
        }
        // Se for quantidade_atual
        if (response && typeof response.quantidade_atual === 'number') {
          this.logger.debug(`Usando valor de quantidade_atual: ${response.quantidade_atual}`);
          return response.quantidade_atual;
        }
        // Se for saldo
        if (response && typeof response.saldo === 'number') {
          this.logger.debug(`Usando valor de saldo: ${response.saldo}`);
          return response.saldo;
        }
        // Se for apenas um número
        if (typeof response === 'number') {
          this.logger.debug(`Usando valor direto: ${response}`);
          return response;
        }
        this.logger.warn(`Não foi possível encontrar informação de estoque válida na resposta:`, response);
        return 0;
      }),
      catchError(error => {
        this.logger.error('Erro ao obter saldo do estoque:', error);
        return throwError(() => error);
      })
    );
  }

  getProdutos(): Observable<Produto[]> {
    this.logger.logRequest(`${this.apiUrl}/produto`);
    
    // Vamos tentar com a URL correta da API
    return this.http.get<any>(`${this.apiUrl}/produto`).pipe(
      tap(response => {
        this.logger.logResponse('produtos', response);
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
                              (typeof produto.quantidade_estoque === 'number' ? 
                               produto.quantidade_estoque : 
                               Number(produto.quantidade_estoque)) : 0,
            created_at: produto.created_at || '',
            updated_at: produto.updated_at || '',
            ativo: produto.ativo !== undefined ? produto.ativo : (produto.status === 'disponivel')
          } as Produto;
        });
      }),
      catchError(error => {
        this.logger.error('Erro ao obter produtos:', error);
        
        // Se falhar, vamos tentar com uma URL alternativa
        if (error.status === 401) {
          this.logger.info('Tentando rota alternativa...');
          return this.http.get<any>(`${this.apiUrl}/produtos`).pipe(
            tap(response => {
              this.logger.logResponse('rota alternativa', response);
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
                  updated_at: produto.updated_at || '',
                  ativo: produto.ativo !== undefined ? produto.ativo : (produto.status === 'disponivel')
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
    // Garantir que o ID seja um número
    const produtoId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    console.log('Fazendo requisição para:', `${this.apiUrl}/produto/${produtoId}`);
    
    return this.http.get<any>(`${this.apiUrl}/produto/${produtoId}`).pipe(
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
                            (typeof produtoData.quantidade_estoque === 'number' ? 
                             produtoData.quantidade_estoque : 
                             Number(produtoData.quantidade_estoque)) : null,
          created_at: produtoData.created_at || '',
          updated_at: produtoData.updated_at || '',
          ativo: produtoData.ativo !== undefined ? produtoData.ativo : (produtoData.status === 'disponivel')
        } as Produto;
        
        console.log('Produto normalizado para o frontend:', produtoNormalizado);
        return produtoNormalizado;
      }),
      catchError(error => {
        console.error('Erro ao obter produto:', error);
        
        // Se falhar, vamos tentar com uma URL alternativa
        if (error.status === 401 || error.status === 404) {
          console.log('Tentando rota alternativa para produto único...');
          return this.http.get<any>(`${this.apiUrl}/produtos/${produtoId}`).pipe(
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
                                  (typeof produtoData.quantidade_estoque === 'number' ? produtoData.quantidade_estoque : parseInt(String(produtoData.quantidade_estoque))) : null,
                created_at: produtoData.created_at || '',
                updated_at: produtoData.updated_at || '',
                ativo: produtoData.ativo !== undefined ? produtoData.ativo : (produtoData.status === 'disponivel')
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

  // Método para obter quantidade_estoque atualizada de todos os produtos
  atualizarEstoqueTodosProdutos(produtos: Produto[]): void {
    console.log(`Atualizando estoque de ${produtos.length} produtos`);
    
    produtos.forEach(produto => {
      // Garantir que o ID seja um número
      const produtoId = typeof produto.id === 'string' ? parseInt(produto.id as string, 10) : produto.id;
      
      console.log(`Solicitando saldo atualizado para produto ID: ${produtoId}`);
      
      this.http.get<EstoqueResponse>(`${this.apiUrl}/estoque/produtos/${produtoId}/saldo`).subscribe({
        next: (response) => {
          console.log(`Resposta da API para saldo do produto ${produtoId}:`, JSON.stringify(response));
          
          let estoqueAtual = 0;
          
          // Verificar os diferentes formatos possíveis de resposta
          if (response && typeof response.estoque_atual === 'number') {
            estoqueAtual = response.estoque_atual;
          } else if (response && response.data && typeof response.data.estoque_atual === 'number') {
            estoqueAtual = response.data.estoque_atual;
          } else if (response && typeof response.quantidade_atual === 'number') {
            estoqueAtual = response.quantidade_atual;
          } else if (response && typeof response.saldo === 'number') {
            estoqueAtual = response.saldo;
          } else if (typeof response === 'number') {
            estoqueAtual = response;
          }
          
          console.log(`Estoque atual do produto ${produtoId} (${produto.nome}): ${estoqueAtual}`);
          
          // Atualizar o valor do produto
          produto.quantidade_estoque = estoqueAtual;
          
          // Notificar outros componentes da atualização
          this.notificarProdutoAtualizado(produto.id);
        },
        error: (error) => {
          console.error(`Erro ao obter saldo do produto ${produtoId}:`, error);
        }
      });
    });
  }
} 