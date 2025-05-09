import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardSummary } from '../../services/dashboard.service';
import { HttpClientModule } from '@angular/common/http';

interface SummaryItem {
  value: string | number;
  label: string;
  icon: string;
  route: string;
  bgClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Dados para os cartões de resumo
  summaryItems: SummaryItem[] = [
    { 
      value: '—', 
      label: 'Comandas Ativas', 
      icon: 'bi-receipt', 
      route: '/comandas',
      bgClass: 'bg-primary-light'
    },
    { 
      value: '—', 
      label: 'Faturamento Hoje', 
      icon: 'bi-currency-dollar', 
      route: '/caixa',
      bgClass: 'bg-success-light'
    },
    { 
      value: '—', 
      label: 'Pedidos Hoje', 
      icon: 'bi-bag-check', 
      route: '/pedidos',
      bgClass: 'bg-info-light'
    },
    { 
      value: '—', 
      label: 'Produtos em Baixa', 
      icon: 'bi-box-seam', 
      route: '/estoque',
      bgClass: 'bg-warning-light'
    }
  ];
  
  // Dados para os cards de recursos
  featureCards = [
    {
      title: 'Comandas',
      description: 'Gerencie suas comandas ativas e crie novas comandas para atender os clientes.',
      icon: 'bi-journal-text',
      route: '/comandas',
      iconClass: 'comandas'
    },
    {
      title: 'Pedidos',
      description: 'Visualize e gerencie todos os pedidos realizados no estabelecimento.',
      icon: 'bi-cart-check',
      route: '/pedidos',
      iconClass: 'pedidos'
    },
    {
      title: 'Produtos',
      description: 'Cadastre e edite os produtos disponíveis para venda.',
      icon: 'bi-box',
      route: '/produtos',
      iconClass: 'produtos'
    }
  ];

  isLoading: boolean = true;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Carrega os dados do dashboard da API
   */
  private loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardSummary().subscribe({
      next: (data) => {
        this.updateSummaryItems(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados do dashboard', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Atualiza os itens de resumo com os dados da API
   */
  private updateSummaryItems(data: DashboardSummary): void {
    // Atualiza os valores dos cartões de resumo
    this.summaryItems[0].value = data.comandasAtivas;
    this.summaryItems[1].value = this.dashboardService.formatCurrency(data.faturamentoHoje);
    this.summaryItems[2].value = data.pedidosHoje;
    this.summaryItems[3].value = data.produtosBaixoEstoque;
  }
} 