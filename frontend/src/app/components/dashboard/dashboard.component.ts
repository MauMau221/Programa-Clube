import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardSummary } from '../../services/dashboard.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface SummaryItem {
  value: string | number;
  label: string;
  icon: string;
  route: string;
  bgClass: string;
  queryParams?: any;
  onlyForRoles?: string[];
}

interface FeatureCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  iconClass: string;
  onlyForRoles?: string[];
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
      route: '/relatorios',
      queryParams: { 
        dataInicio: this.formatarDataParaInput(new Date()), 
        dataFim: this.formatarDataParaInput(new Date()) 
      },
      bgClass: 'bg-success-light',
      onlyForRoles: ['gerente', 'caixa']
    },
    { 
      value: '—', 
      label: 'Pedidos Hoje', 
      icon: 'bi-bag-check', 
      route: '/pedidos',
      queryParams: { 
        filtro: 'todos' 
      },
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
  featureCards: FeatureCard[] = [
    {
      title: 'Relatórios',
      description: 'Acesse relatórios detalhados de vendas, pedidos e faturamento.',
      icon: 'bi-graph-up',
      route: '/relatorios',
      iconClass: 'relatorios',
      onlyForRoles: ['gerente']
    },
    {
      title: 'Listar Funcionários',
      description: 'Visualize e gerencie a lista completa de funcionários do estabelecimento.',
      icon: 'bi-people',
      route: '/funcionarios',
      iconClass: 'funcionarios',
      onlyForRoles: ['gerente']
    },
    {
      title: 'Cadastrar Funcionário',
      description: 'Adicione novos funcionários ao sistema com diferentes permissões.',
      icon: 'bi-person-plus',
      route: '/funcionarios/novo',
      iconClass: 'funcionarios',
      onlyForRoles: ['gerente']
    },
    {
      title: 'Comandas',
      description: 'Gerencie suas comandas ativas e crie novas comandas para atender os clientes.',
      icon: 'bi-journal-text',
      route: '/comandas',
      iconClass: 'comandas',
      onlyForRoles: ['garcom', 'gerente', 'caixa']
    },
    {
      title: 'Pedidos',
      description: 'Visualize e gerencie todos os pedidos realizados no estabelecimento.',
      icon: 'bi-cart-check',
      route: '/pedidos',
      iconClass: 'pedidos',
      onlyForRoles: ['cozinheiro', 'gerente', 'garcom']
    },
    {
      title: 'Produtos',
      description: 'Cadastre e edite os produtos disponíveis para venda.',
      icon: 'bi-box',
      route: '/produtos',
      iconClass: 'produtos',
      onlyForRoles: ['cozinheiro', 'gerente']
    },
    {
      title: 'Caixa Direto',
      description: 'Realize vendas diretas sem a necessidade de criar uma comanda.',
      icon: 'bi-cash-register',
      route: '/caixa',
      iconClass: 'caixa',
      onlyForRoles: ['garcom', 'gerente', 'caixa']
    },
    {
      title: 'Categorias',
      description: 'Crie e edite categorias para organizar seus produtos.',
      icon: 'bi-tags',
      route: '/categorias',
      iconClass: 'categorias',
      onlyForRoles: ['cozinheiro', 'gerente']
    },
    {
      title: 'Estoque',
      description: 'Gerencie o estoque de produtos e acompanhe o histórico de movimentações.',
      icon: 'bi-box-seam',
      route: '/estoque',
      iconClass: 'estoque',
      onlyForRoles: ['gerente']
    }
  ];

  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';
  currentUserRole: string | undefined = '';

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.authService.user$.subscribe(user => {
      if (user && user.role) {
        this.currentUserRole = user.role;
      }
    });
  }

  /**
   * Verifica se um card deve ser mostrado baseado no papel do usuário
   */
  shouldShowCard(card: FeatureCard): boolean {
    // Se não tem restrição de papel, mostra para todos
    if (!card.onlyForRoles || card.onlyForRoles.length === 0) {
      return true;
    }
    
    // Se currentUserRole não estiver definido, não mostra cards com restrição
    if (!this.currentUserRole) {
      return false;
    }
    
    // Verifica se o papel do usuário está na lista de papéis permitidos
    return card.onlyForRoles.includes(this.currentUserRole);
  }

  /**
   * Verifica se um item de resumo deve ser mostrado baseado no papel do usuário
   */
  shouldShowSummaryItem(item: SummaryItem): boolean {
    // Se não tem restrição de papel, mostra para todos
    if (!item.onlyForRoles || item.onlyForRoles.length === 0) {
      return true;
    }
    
    // Se currentUserRole não estiver definido, não mostra itens com restrição
    if (!this.currentUserRole) {
      return false;
    }
    
    // Verifica se o papel do usuário está na lista de papéis permitidos
    return item.onlyForRoles.includes(this.currentUserRole);
  }

  /**
   * Formata uma data para o formato de input (YYYY-MM-DD)
   */
  private formatarDataParaInput(data: Date): string {
    return data.toISOString().split('T')[0];
  }

  /**
   * Carrega os dados do dashboard da API
   */
  loadDashboardData(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    
    this.dashboardService.getDashboardSummary().subscribe({
      next: (data) => {
        this.updateSummaryItems(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados do dashboard', error);
        this.hasError = true;
        this.errorMessage = 'Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.';
        this.isLoading = false;
        
        // Em caso de erro, atualizar os itens com valores zerados
        this.updateSummaryItems({
          comandasAtivas: 0,
          faturamentoHoje: 0,
          pedidosHoje: 0,
          produtosBaixoEstoque: 0
        });
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

  /**
   * Gera parâmetros de consulta com a data atual para relatórios
   */
  private getHojeQueryParams(): any {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const dataFormatada = `${ano}-${mes}-${dia}`;
    
    return {
      dataInicio: dataFormatada,
      dataFim: dataFormatada
    };
  }
} 