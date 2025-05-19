import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../../services/pedido.service';
import { Pedido } from '../../../models/pedido.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pedidos-list.component.html',
  styleUrls: ['./pedidos-list.component.scss']
})
export class PedidosListComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  isLoading = false;
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | 'info' | '' = '';
  filtroStatus = 'pendente'; // Opções: 'todos', 'pendente', 'em preparo', 'pronto', 'entregue', 'cancelado'

  constructor(
    private pedidoService: PedidoService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Verificar parâmetros da URL
    this.route.queryParams.subscribe(params => {
      if (params['filtro']) {
        this.filtroStatus = params['filtro'];
      }
    });
    
    // Tentar obter a versão detalhada uma vez para depuração
    this.pedidoService.listarPedidos().subscribe(pedidosDetalhados => {
      console.log('Pedidos detalhados:', JSON.stringify(pedidosDetalhados[0], null, 2));
    });
    
    this.carregarPedidos();
    // Configurar atualização automática a cada 30 segundos
    setInterval(() => this.carregarPedidos(), 30000);
  }

  carregarPedidos(): void {
    this.isLoading = true;
    this.pedidoService.listarPedidos().subscribe({
      next: (pedidos) => {
        // Verificar a estrutura de dados do primeiro pedido (para depuração)
        if (pedidos.length > 0) {
          console.log('Estrutura de um pedido:', JSON.stringify(pedidos[0], null, 2));
        }
        
        // Processar os pedidos para garantir que tenham a propriedade cliente
        this.pedidos = pedidos.map(pedido => {
          // Verificar se o pedido tem cliente (para depuração)
          console.log(`Pedido #${pedido.id} - Mesa: ${pedido.mesa || (pedido.comanda?.mesa)} - Cliente direto: ${pedido.cliente || 'não'} - Cliente na comanda: ${pedido.comanda?.cliente || 'não'}`);
          
          // Se o pedido não tiver cliente direto, mas tiver na comanda, copie
          if (!pedido.cliente && pedido.comanda && pedido.comanda.cliente) {
            return {...pedido, cliente: pedido.comanda.cliente};
          }
          return pedido;
        });
        
        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pedidos:', error);
        this.mensagem = 'Erro ao carregar pedidos. Tente novamente mais tarde.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  aplicarFiltros(): void {
    if (this.filtroStatus === 'todos') {
      this.pedidosFiltrados = [...this.pedidos];
      return;
    }
    
    this.pedidosFiltrados = this.pedidos.filter(
      p => p.status.toLowerCase() === this.filtroStatus.toLowerCase()
    );
  }

  atualizarStatus(pedidoId: number, novoStatus: string): void {
    this.isLoading = true;
    this.pedidoService.atualizarStatus(pedidoId, novoStatus).subscribe({
      next: () => {
        this.mensagem = `Status do pedido atualizado para: ${novoStatus}`;
        this.tipoMensagem = 'success';
        this.carregarPedidos();
      },
      error: (error) => {
        console.error('Erro ao atualizar status do pedido:', error);
        this.mensagem = 'Erro ao atualizar status do pedido. Tente novamente.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pendente': return 'bg-warning text-dark';
      case 'em preparo': return 'bg-info text-white';
      case 'pronto': return 'bg-success';
      case 'entregue': return 'bg-secondary';
      case 'cancelado': return 'bg-danger';
      default: return 'bg-light text-dark';
    }
  }

  limparMensagem(): void {
    this.mensagem = '';
    this.tipoMensagem = '';
  }

  // Método para obter o nome do cliente com segurança
  getClienteName(pedido: Pedido): string {
    // Para depuração
    console.log(`Obtendo nome para pedido #${pedido.id}:`, 
                 pedido.cliente, 
                 pedido.comanda?.cliente);
    
    if (pedido.cliente) {
      return pedido.cliente;
    } else if (pedido.comanda && pedido.comanda.cliente) {
      return pedido.comanda.cliente;
    }
    
    // Se chegou aqui, verificar se o pedido está associado a alguma mesa com cliente
    return 'Cliente não identificado';
  }
}
