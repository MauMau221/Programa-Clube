import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../services/pedido.service';
import { PainelCliente, PedidoPainel } from '../../models/pedido.model';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-painel-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './painel-cliente.component.html',
  styleUrl: './painel-cliente.component.scss'
})
export class PainelClienteComponent implements OnInit, OnDestroy {
  dadosPainel: PainelCliente = { em_preparo: [], prontos: [] };
  isLoading = false;
  error = '';
  refreshSubscription?: Subscription;

  constructor(private pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.carregarDados();
    
    // Atualizar dados automaticamente a cada 30 segundos
    this.refreshSubscription = interval(30000)
      .pipe(
        switchMap(() => this.pedidoService.getPainelCliente())
      )
      .subscribe({
        next: (dados) => {
          this.dadosPainel = dados;
          console.log('Dados do painel atualizados:', dados);
        },
        error: (erro) => {
          console.error('Erro ao atualizar dados do painel:', erro);
        }
      });
  }

  ngOnDestroy(): void {
    // Cancelar a assinatura quando o componente for destruído
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  carregarDados(): void {
    this.isLoading = true;
    this.error = '';
    
    this.pedidoService.getPainelCliente().subscribe({
      next: (dados) => {
        this.dadosPainel = dados;
        this.isLoading = false;
        console.log('Dados do painel carregados:', dados);
      },
      error: (erro) => {
        console.error('Erro ao carregar dados do painel:', erro);
        this.error = 'Não foi possível carregar os pedidos. Tente novamente mais tarde.';
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return status === 'em preparo' ? 'bg-info text-white' : 'bg-success text-white';
  }
} 