import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../../services/pedido.service';
import { interval, Subscription, lastValueFrom } from 'rxjs';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Pedido } from '../../../models/pedido.model';

@Component({
  selector: 'app-pedidos-kanban',
  standalone: true,
  imports: [CommonModule, RouterModule, DragDropModule],
  template: `
    <div class="container-fluid mt-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <h1 class="h2 mb-3 mb-md-0">Central do Cozinheiro</h1>
        
        <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center">
          <div class="form-check form-switch me-3 mb-2 mb-sm-0">
            <input class="form-check-input" type="checkbox" id="modoVisualizacao" 
                  [checked]="modoVisualizacao === 'agrupado'"
                  (change)="toggleModoVisualizacao()">
            <label class="form-check-label" for="modoVisualizacao">
              Modo Agrupado por Mesa
            </label>
          </div>
          
          <button class="btn btn-sm btn-outline-secondary" (click)="carregarPedidos()">
            <i class="bi bi-arrow-clockwise me-1"></i> Atualizar
          </button>
        </div>
      </div>

      <div class="alert alert-info" *ngIf="isLoading">
        <div class="d-flex align-items-center">
          <div class="spinner-border spinner-border-sm me-2" role="status"></div>
          <span>Carregando pedidos...</span>
        </div>
      </div>

      <div class="alert alert-success" *ngIf="successMessage" role="alert">
        {{ successMessage }}
        <button type="button" class="btn-close float-end" (click)="successMessage = ''"></button>
      </div>

      <div class="alert alert-danger" *ngIf="errorMessage" role="alert">
        {{ errorMessage }}
        <button type="button" class="btn-close float-end" (click)="errorMessage = ''"></button>
      </div>

      <!-- Instruções -->
      <div class="alert alert-info mb-3">
        <i class="bi bi-info-circle-fill me-2"></i>
        <strong>Dica:</strong> 
        <span *ngIf="modoVisualizacao === 'individual'">Arraste os cartões entre as colunas ou clique no cartão para mover para a próxima etapa.</span>
        <span *ngIf="modoVisualizacao === 'agrupado'">Clique no botão para mover todos os pedidos da mesa para a próxima etapa.</span>
      </div>

      <!-- Visualização Individual -->
      <div class="row" *ngIf="modoVisualizacao === 'individual'">
        <!-- Coluna de Pedidos Pendentes -->
        <div class="col-lg-4 col-md-6 col-12 mb-4 mb-lg-0">
          <div class="card border-warning kanban-column">
            <div class="card-header bg-warning text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Pendentes</h5>
              <span class="badge bg-light text-dark">{{ pedidosPendentes.length }}</span>
            </div>
            <div class="card-body" cdkDropList #pendentesLista="cdkDropList" 
                [cdkDropListData]="pedidosPendentes"
                [cdkDropListConnectedTo]="[emPreparoLista]"
                id="listaPendentes"
                (cdkDropListDropped)="drop($event)">
              <div *ngIf="pedidosPendentes.length === 0" class="text-center py-5">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <p class="mt-2">Não há pedidos pendentes</p>
              </div>
              
              <div *ngFor="let pedido of pedidosPendentes" class="card mb-3 shadow-sm"
                   cdkDrag
                   (click)="iniciarPreparo(pedido.id)">
                <div class="card-header d-flex justify-content-between">
                  <span>Mesa {{ pedido.comanda?.mesa || 'N/A' }}</span>
                  <span class="badge bg-warning">{{ formatarTempo(pedido.created_at) }}</span>
                </div>
                <div class="card-body">
                  <ul class="list-group list-group-flush">
                    <li *ngFor="let item of pedido.produtos" class="list-group-item d-flex justify-content-between">
                      <div>
                        <span class="fw-bold">{{ item.quantidade }}x</span> {{ item.nome }}
                        <small *ngIf="item.observacao" class="d-block text-muted">{{ item.observacao }}</small>
                      </div>
                    </li>
                  </ul>
                </div>
                <div class="card-footer d-flex text-center justify-content-center">
                  <div class="swipe-indicator">
                    <i class="bi bi-arrow-right me-1"></i> Clique ou arraste para iniciar preparo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Coluna de Pedidos Em Preparo -->
        <div class="col-lg-4 col-md-6 col-12 mb-4 mb-lg-0">
          <div class="card border-primary kanban-column">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Em Preparo</h5>
              <span class="badge bg-light text-dark">{{ pedidosEmPreparo.length }}</span>
            </div>
            <div class="card-body" cdkDropList #emPreparoLista="cdkDropList"
                [cdkDropListData]="pedidosEmPreparo"
                [cdkDropListConnectedTo]="[pendentesLista, prontosLista]"
                id="listaEmPreparo"
                (cdkDropListDropped)="drop($event)">
              <div *ngIf="pedidosEmPreparo.length === 0" class="text-center py-5">
                <i class="bi bi-cup-hot fs-1 text-muted"></i>
                <p class="mt-2">Não há pedidos em preparo</p>
              </div>
              
              <div *ngFor="let pedido of pedidosEmPreparo" class="card mb-3 shadow-sm"
                   cdkDrag
                   (click)="finalizarPreparo(pedido.id)">
                <div class="card-header d-flex justify-content-between">
                  <span>Mesa {{ pedido.comanda?.mesa || 'N/A' }}</span>
                  <span class="badge bg-primary">{{ formatarTempo(pedido.pedido_aberto) }}</span>
                </div>
                <div class="card-body">
                  <ul class="list-group list-group-flush">
                    <li *ngFor="let item of pedido.produtos" class="list-group-item d-flex justify-content-between">
                      <div>
                        <span class="fw-bold">{{ item.quantidade }}x</span> {{ item.nome }}
                        <small *ngIf="item.observacao" class="d-block text-muted">{{ item.observacao }}</small>
                      </div>
                    </li>
                  </ul>
                </div>
                <div class="card-footer d-flex text-center justify-content-center">
                  <div class="swipe-indicator">
                    <i class="bi bi-arrow-right me-1"></i> Clique ou arraste para finalizar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Coluna de Pedidos Prontos -->
        <div class="col-lg-4 col-md-6 col-12">
          <div class="card border-success kanban-column">
            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Prontos</h5>
              <span class="badge bg-light text-dark">{{ pedidosProntos.length }}</span>
            </div>
            <div class="card-body" cdkDropList #prontosLista="cdkDropList"
                [cdkDropListData]="pedidosProntos"
                [cdkDropListConnectedTo]="[emPreparoLista]"
                id="listaProntos"
                (cdkDropListDropped)="drop($event)">
              <div *ngIf="pedidosProntos.length === 0" class="text-center py-5">
                <i class="bi bi-check-circle fs-1 text-muted"></i>
                <p class="mt-2">Não há pedidos prontos</p>
              </div>
              
              <div *ngFor="let pedido of pedidosProntos" class="card mb-3 shadow-sm" cdkDrag>
                <div class="card-header d-flex justify-content-between">
                  <span>Mesa {{ pedido.comanda?.mesa || 'N/A' }}</span>
                  <span class="badge bg-success">{{ formatarTempo(pedido.pedido_fechado) }}</span>
                </div>
                <div class="card-body">
                  <ul class="list-group list-group-flush">
                    <li *ngFor="let item of pedido.produtos" class="list-group-item d-flex justify-content-between">
                      <div>
                        <span class="fw-bold">{{ item.quantidade }}x</span> {{ item.nome }}
                        <small *ngIf="item.observacao" class="d-block text-muted">{{ item.observacao }}</small>
                      </div>
                    </li>
                  </ul>
                </div>
                <div class="card-footer d-flex justify-content-center">
                  <button class="btn btn-outline-secondary btn-sm w-100" (click)="marcarComoEntregue(pedido.id); $event.stopPropagation();">
                    <i class="bi bi-check2-all me-1"></i> Marcar como Entregue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Visualização Agrupada -->
      <div class="row" *ngIf="modoVisualizacao === 'agrupado'">
        <!-- Lista de Mesas com Pedidos Pendentes -->
        <div class="col-12">
          <div class="card border-primary mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Pedidos Agrupados por Mesa</h5>
            </div>
            <div class="card-body">
              <div *ngIf="getMesasComPedidos().length === 0" class="text-center py-5">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <p class="mt-2">Não há pedidos pendentes</p>
              </div>
              
              <div *ngFor="let mesa of getMesasComPedidos()" class="card mb-4 shadow-sm">
                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">Mesa {{ mesa }}</h5>
                  <div>
                    <span class="badge bg-warning me-2">
                      {{ getPedidosPendentesPorMesa(mesa).length }} Pendentes
                    </span>
                    <span class="badge bg-primary me-2">
                      {{ getPedidosEmPreparoPorMesa(mesa).length }} Em Preparo
                    </span>
                    <span class="badge bg-success me-2">
                      {{ getPedidosProntosPorMesa(mesa).length }} Prontos
                    </span>
                  </div>
                </div>
                <div class="card-body">
                  <!-- Pedidos Pendentes dessa Mesa -->
                  <div *ngIf="getPedidosPendentesPorMesa(mesa).length > 0">
                    <h6 class="border-bottom pb-2 mb-2">Pedidos Pendentes</h6>
                    <div class="row">
                      <div class="col-sm-9 mb-3 mb-sm-0">
                        <ul class="list-group">
                          <li *ngFor="let pedido of getPedidosPendentesPorMesa(mesa)" 
                              class="list-group-item d-flex flex-column">
                            <div class="d-flex justify-content-between w-100">
                              <small class="text-muted">Pedido #{{ pedido.id }}</small>
                              <small class="badge bg-warning">{{ formatarTempo(pedido.created_at) }}</small>
                            </div>
                            <ul class="list-unstyled ms-3 mt-2 mb-0">
                              <li *ngFor="let item of pedido.produtos" class="mb-1">
                                <span class="fw-bold">{{ item.quantidade }}x</span> {{ item.nome }}
                                <small *ngIf="item.observacao" class="d-block text-muted">{{ item.observacao }}</small>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </div>
                      <div class="col-sm-3 d-flex align-items-center">
                        <button class="btn btn-primary w-100 py-2" 
                                (click)="iniciarPreparoEmMassa(getPedidosPendentesPorMesa(mesa))">
                          <i class="bi bi-play-fill me-1"></i> Iniciar Todos
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Pedidos Em Preparo dessa Mesa -->
                  <div *ngIf="getPedidosEmPreparoPorMesa(mesa).length > 0" 
                       class="mt-4">
                    <h6 class="border-bottom pb-2 mb-2">Pedidos Em Preparo</h6>
                    <div class="row">
                      <div class="col-sm-9 mb-3 mb-sm-0">
                        <ul class="list-group">
                          <li *ngFor="let pedido of getPedidosEmPreparoPorMesa(mesa)" 
                              class="list-group-item d-flex flex-column">
                            <div class="d-flex justify-content-between w-100">
                              <small class="text-muted">Pedido #{{ pedido.id }}</small>
                              <small class="badge bg-primary">{{ formatarTempo(pedido.pedido_aberto) }}</small>
                            </div>
                            <ul class="list-unstyled ms-3 mt-2 mb-0">
                              <li *ngFor="let item of pedido.produtos" class="mb-1">
                                <span class="fw-bold">{{ item.quantidade }}x</span> {{ item.nome }}
                                <small *ngIf="item.observacao" class="d-block text-muted">{{ item.observacao }}</small>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </div>
                      <div class="col-sm-3 d-flex align-items-center">
                        <button class="btn btn-success w-100 py-2" 
                                (click)="finalizarPreparoEmMassa(getPedidosEmPreparoPorMesa(mesa))">
                          <i class="bi bi-check2 me-1"></i> Finalizar Todos
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Pedidos Prontos dessa Mesa -->
                  <div *ngIf="getPedidosProntosPorMesa(mesa).length > 0" 
                       class="mt-4">
                    <h6 class="border-bottom pb-2 mb-2">Pedidos Prontos</h6>
                    <div class="row">
                      <div class="col-sm-9 mb-3 mb-sm-0">
                        <ul class="list-group">
                          <li *ngFor="let pedido of getPedidosProntosPorMesa(mesa)" 
                              class="list-group-item d-flex flex-column">
                            <div class="d-flex justify-content-between w-100">
                              <small class="text-muted">Pedido #{{ pedido.id }}</small>
                              <small class="badge bg-success">{{ formatarTempo(pedido.pedido_fechado) }}</small>
                            </div>
                            <ul class="list-unstyled ms-3 mt-2 mb-0">
                              <li *ngFor="let item of pedido.produtos" class="mb-1">
                                <span class="fw-bold">{{ item.quantidade }}x</span> {{ item.nome }}
                                <small *ngIf="item.observacao" class="d-block text-muted">{{ item.observacao }}</small>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </div>
                      <div class="col-sm-3 d-flex align-items-center">
                        <button class="btn btn-outline-secondary w-100 py-2" 
                                (click)="marcarComoEntregueEmMassa(getPedidosProntosPorMesa(mesa))">
                          <i class="bi bi-check2-all me-1"></i> Entregar Todos
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kanban-column {
      height: calc(100vh - 220px);
      overflow-y: auto;
    }
    .card-header {
      font-weight: bold;
    }
    .card .card {
      transition: all 0.2s;
      cursor: pointer;
    }
    .card .card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
    }
    .swipe-indicator {
      color: #777;
      font-size: 0.85rem;
    }
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    .cdk-drag-placeholder {
      opacity: 0.3;
    }
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .cdk-drop-list-dragging .card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    /* Ajustes de responsividade */
    @media (max-width: 768px) {
      .kanban-column {
        height: auto;
        max-height: 70vh;
        margin-bottom: 20px;
      }
      
      .card-footer button {
        padding: 10px;  /* Botões maiores para touch */
      }
      
      .swipe-indicator {
        font-size: 1rem;
      }
      
      /* Aumenta o tamanho dos badges para melhor visualização */
      .badge {
        font-size: 0.9rem;
        padding: 6px 10px;
      }
      
      /* Melhorar touch para drag-and-drop */
      [cdkDrag] {
        touch-action: none;
        -webkit-user-drag: none;
        user-select: none;
        cursor: move;
      }
      
      /* Botões mais touch-friendly */
      .btn {
        min-height: 44px; /* Tamanho mínimo para área de toque */
      }
    }
  `]
})
export class PedidosKanbanComponent implements OnInit, OnDestroy {
  pedidosPendentes: Pedido[] = [];
  pedidosEmPreparo: Pedido[] = [];
  pedidosProntos: Pedido[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Opções para visualização
  modoVisualizacao: 'individual' | 'agrupado' = 'individual';
  pedidosAgrupadosPorMesa: { [mesa: string]: Pedido[] } = {};
  
  // Suporte a gestos touch
  private touchStartX = 0;
  private touchEndX = 0;
  private touchStartY = 0;
  private touchEndY = 0;
  private minSwipeDistance = 50; // pixels mínimos para considerar um swipe
  
  private refreshSubscription?: Subscription;
  
  constructor(private pedidoService: PedidoService) {}
  
  ngOnInit(): void {
    this.carregarPedidos();
    
    // Atualizar automaticamente a cada 30 segundos
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.carregarPedidos(false);
    });
  }
  
  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  // Métodos para filtrar pedidos por mesa
  getMesasComPedidos(): string[] {
    return Object.keys(this.pedidosAgrupadosPorMesa);
  }

  getPedidosPendentesPorMesa(mesa: string): Pedido[] {
    if (!this.pedidosAgrupadosPorMesa[mesa]) return [];
    return this.pedidosAgrupadosPorMesa[mesa].filter(p => p.status === 'pendente');
  }

  getPedidosEmPreparoPorMesa(mesa: string): Pedido[] {
    if (!this.pedidosAgrupadosPorMesa[mesa]) return [];
    return this.pedidosAgrupadosPorMesa[mesa].filter(p => p.status === 'em preparo');
  }

  getPedidosProntosPorMesa(mesa: string): Pedido[] {
    if (!this.pedidosAgrupadosPorMesa[mesa]) return [];
    return this.pedidosAgrupadosPorMesa[mesa].filter(p => p.status === 'pronto');
  }

  toggleModoVisualizacao(): void {
    this.modoVisualizacao = this.modoVisualizacao === 'individual' ? 'agrupado' : 'individual';
    if (this.modoVisualizacao === 'agrupado') {
      this.agruparPedidosPorMesa();
    }
  }

  agruparPedidosPorMesa(): void {
    // Reiniciar objeto de agrupamento
    this.pedidosAgrupadosPorMesa = {};
    
    // Listar todos os pedidos pendentes, em preparo e prontos
    const todosPedidos = [...this.pedidosPendentes, ...this.pedidosEmPreparo, ...this.pedidosProntos];
    
    // Agrupar por mesa
    todosPedidos.forEach(pedido => {
      const mesa = pedido.comanda?.mesa || 'Sem Mesa';
      if (!this.pedidosAgrupadosPorMesa[mesa]) {
        this.pedidosAgrupadosPorMesa[mesa] = [];
      }
      this.pedidosAgrupadosPorMesa[mesa].push(pedido);
    });
  }

  async iniciarPreparoEmMassa(pedidos: Pedido[]): Promise<void> {
    if (!pedidos || pedidos.length === 0) return;
    
    this.isLoading = true;
    
    try {
      // Criar um array de promessas para todas as operações
      const operacoes = pedidos.map(pedido => 
        lastValueFrom(this.pedidoService.iniciarPreparo(pedido.id))
      );
      
      // Executar todas as operações
      await Promise.all(operacoes);
      
      this.successMessage = `${pedidos.length} pedidos enviados para preparo com sucesso!`;
      this.carregarPedidos(false);
    } catch (error) {
      console.error('Erro ao iniciar preparo em massa:', error);
      this.errorMessage = 'Erro ao iniciar preparo em massa. Tente novamente.';
      this.isLoading = false;
    }
  }

  async finalizarPreparoEmMassa(pedidos: Pedido[]): Promise<void> {
    if (!pedidos || pedidos.length === 0) return;
    
    this.isLoading = true;
    
    try {
      // Criar um array de promessas para todas as operações
      const operacoes = pedidos.map(pedido => 
        lastValueFrom(this.pedidoService.finalizarPreparo(pedido.id))
      );
      
      // Executar todas as operações
      await Promise.all(operacoes);
      
      this.successMessage = `${pedidos.length} pedidos finalizados com sucesso!`;
      this.carregarPedidos(false);
    } catch (error) {
      console.error('Erro ao finalizar pedidos em massa:', error);
      this.errorMessage = 'Erro ao finalizar pedidos em massa. Tente novamente.';
      this.isLoading = false;
    }
  }
  
  async marcarComoEntregueEmMassa(pedidos: Pedido[]): Promise<void> {
    if (!pedidos || pedidos.length === 0) return;
    
    this.isLoading = true;
    
    try {
      // Criar um array de promessas para todas as operações
      const operacoes = pedidos.map(pedido => 
        lastValueFrom(this.pedidoService.atualizarStatus(pedido.id, 'entregue'))
      );
      
      // Executar todas as operações
      await Promise.all(operacoes);
      
      this.successMessage = `${pedidos.length} pedidos marcados como entregues com sucesso!`;
      this.carregarPedidos(false);
    } catch (error) {
      console.error('Erro ao marcar pedidos como entregues em massa:', error);
      this.errorMessage = 'Erro ao marcar pedidos como entregues. Tente novamente.';
      this.isLoading = false;
    }
  }
  
  carregarPedidos(showLoading = true): void {
    if (showLoading) {
      this.isLoading = true;
    }
    
    console.log('Carregando pedidos...');
    
    this.pedidoService.listarPedidos().subscribe({
      next: (pedidos) => {
        console.log('Pedidos carregados do servidor:', pedidos);
        
        this.pedidosPendentes = pedidos
          .filter(p => p.status === 'pendente')
          .map(this.processarPedido);
        
        this.pedidosEmPreparo = pedidos
          .filter(p => p.status === 'em preparo')
          .map(this.processarPedido);
        
        this.pedidosProntos = pedidos
          .filter(p => p.status === 'pronto')
          .slice(0, 20) // Limitar a 20 pedidos prontos
          .map(this.processarPedido);
        
        console.log('Pedidos pendentes:', this.pedidosPendentes.length);
        console.log('Pedidos em preparo:', this.pedidosEmPreparo.length);
        console.log('Pedidos prontos:', this.pedidosProntos.length);
        
        // Se estiver no modo agrupado, atualizar os agrupamentos
        if (this.modoVisualizacao === 'agrupado') {
          this.agruparPedidosPorMesa();
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pedidos:', error);
        this.errorMessage = 'Erro ao carregar pedidos. Tente novamente mais tarde.';
        this.isLoading = false;
      }
    });
  }
  
  // Garante que todos os pedidos tenham as propriedades necessárias
  private processarPedido = (pedido: Pedido): Pedido => {
    // Garantir que produtos esteja inicializado
    if (!pedido.produtos) {
      pedido.produtos = [];
    }
    
    // Garantir que a propriedade mesa seja definida
    if (!pedido.mesa && pedido.comanda && pedido.comanda.mesa) {
      pedido.mesa = pedido.comanda.mesa;
    }
    
    return pedido;
  }
  
  iniciarPreparo(pedidoId: number): void {
    this.isLoading = true;
    console.log(`Iniciando preparo do pedido ${pedidoId}`);
    
    this.pedidoService.iniciarPreparo(pedidoId).subscribe({
      next: (resposta) => {
        console.log('Resposta do iniciar preparo:', resposta);
        this.successMessage = 'Pedido enviado para preparo com sucesso!';
        this.carregarPedidos(false);
      },
      error: (error) => {
        console.error('Erro ao iniciar preparo:', error);
        this.errorMessage = 'Erro ao iniciar preparo. Tente novamente.';
        this.isLoading = false;
      }
    });
  }
  
  finalizarPreparo(pedidoId: number): void {
    this.isLoading = true;
    console.log(`Finalizando preparo do pedido ${pedidoId}`);
    
    this.pedidoService.finalizarPreparo(pedidoId).subscribe({
      next: (resposta) => {
        console.log('Resposta do finalizar preparo:', resposta);
        this.successMessage = 'Pedido finalizado com sucesso!';
        this.carregarPedidos(false);
      },
      error: (error) => {
        console.error('Erro ao finalizar pedido:', error);
        this.errorMessage = 'Erro ao finalizar pedido. Tente novamente.';
        this.isLoading = false;
      }
    });
  }
  
  drop(event: CdkDragDrop<Pedido[]>): void {
    console.log(`[NOVO] Detectado drag-drop de ${event.previousContainer.id} para ${event.container.id}`);
    
    // Se for na mesma lista, apenas reordenar
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }
    
    // Obter o pedido que está sendo movido
    const pedido = event.previousContainer.data[event.previousIndex];
    console.log(`[NOVO] Pedido ${pedido.id} com status ${pedido.status} sendo movido`);
    
    // Determinar a operação baseada nos IDs dos containers e no status do pedido
    
    // PENDENTE → EM PREPARO
    if (
      (event.previousContainer.id === 'listaPendentes' || event.previousContainer.id.includes('cdk-drop-list-0')) && 
      (event.container.id === 'listaEmPreparo' || event.container.id.includes('cdk-drop-list-1'))
    ) {
      console.log(`[NOVO] Iniciando preparo do pedido ${pedido.id}`);
      
      // Mostrar loading
      this.isLoading = true;
      
      // Chamar o serviço diretamente
      this.pedidoService.iniciarPreparo(pedido.id).subscribe({
        next: (resposta) => {
          console.log(`[NOVO] Resposta do iniciar preparo:`, resposta);
          this.successMessage = 'Pedido enviado para preparo com sucesso!';
          this.carregarPedidos(false);
        },
        error: (erro) => {
          console.error(`[NOVO] Erro ao iniciar preparo:`, erro);
          this.errorMessage = 'Erro ao iniciar preparo. Tente novamente.';
          this.isLoading = false;
          this.carregarPedidos(false);
        }
      });
      
      return;
    }
    
    // EM PREPARO → PRONTO
    if (
      (event.previousContainer.id === 'listaEmPreparo' || event.previousContainer.id.includes('cdk-drop-list-1')) && 
      (event.container.id === 'listaProntos' || event.container.id.includes('cdk-drop-list-2'))
    ) {
      console.log(`[NOVO] Finalizando preparo do pedido ${pedido.id}`);
      
      // Mostrar loading
      this.isLoading = true;
      
      // Chamar o serviço diretamente
      this.pedidoService.finalizarPreparo(pedido.id).subscribe({
        next: (resposta) => {
          console.log(`[NOVO] Resposta do finalizar preparo:`, resposta);
          this.successMessage = 'Pedido finalizado com sucesso!';
          this.carregarPedidos(false);
        },
        error: (erro) => {
          console.error(`[NOVO] Erro ao finalizar preparo:`, erro);
          this.errorMessage = 'Erro ao finalizar preparo. Tente novamente.';
          this.isLoading = false;
          this.carregarPedidos(false);
        }
      });
      
      return;
    }
    
    // Caso não identificado (improvável, mas por segurança)
    console.warn(`[NOVO] Operação não identificada: ${event.previousContainer.id} -> ${event.container.id}`);
    
    // Recarregar para garantir consistência
    this.carregarPedidos(false);
  }
  
  formatarTempo(dataString?: string): string {
    if (!dataString) return 'N/A';
    
    const data = new Date(dataString);
    const agora = new Date();
    const diff = Math.floor((agora.getTime() - data.getTime()) / 1000 / 60); // Diferença em minutos
    
    if (diff < 60) {
      return `${diff} min`;
    } else {
      const horas = Math.floor(diff / 60);
      const minutos = diff % 60;
      return `${horas}h ${minutos}m`;
    }
  }
  
  marcarComoEntregue(pedidoId: number): void {
    this.isLoading = true;
    console.log(`Marcando pedido ${pedidoId} como entregue`);
    
    this.pedidoService.atualizarStatus(pedidoId, 'entregue').subscribe({
      next: (resposta) => {
        console.log('Resposta da atualização de status:', resposta);
        this.successMessage = 'Pedido marcado como entregue com sucesso!';
        this.carregarPedidos(false);
      },
      error: (error) => {
        console.error('Erro ao marcar pedido como entregue:', error);
        this.errorMessage = 'Erro ao marcar pedido como entregue. Tente novamente.';
        this.isLoading = false;
      }
    });
  }
  
  // Métodos para suporte a gestos touch
  
  // Capturar posição inicial do toque
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }
  
  // Capturar posição final do toque
  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].clientX;
    this.touchEndY = event.changedTouches[0].clientY;
    this.handleSwipe();
  }
  
  // Processar o swipe
  private handleSwipe() {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    
    // Verificar se é um swipe horizontal (mais horizontal que vertical)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.minSwipeDistance) {
      // Determinar a direção do swipe
      if (deltaX > 0) {
        // Swipe para direita - se estiver em modo individual, alternar para agrupado
        if (this.modoVisualizacao === 'individual') {
          this.toggleModoVisualizacao();
        }
      } else {
        // Swipe para esquerda - se estiver em modo agrupado, alternar para individual
        if (this.modoVisualizacao === 'agrupado') {
          this.toggleModoVisualizacao();
        }
      }
    }
  }
} 