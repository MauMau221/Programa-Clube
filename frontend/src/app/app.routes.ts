import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ComandasListComponent } from './components/comandas/comandas-list.component';
import { ComandaFormComponent } from './components/comandas/comanda-form.component';
import { ComandaDetailComponent } from './components/comandas/comanda-detail.component';
import { ProdutosListComponent } from './components/produtos/produtos-list.component';
import { ProdutoFormComponent } from './components/produtos/produto-form.component';
import { CategoriasListComponent } from './components/categorias/categorias-list.component';
import { CategoriaFormComponent } from './components/categorias/categoria-form.component';
import { EstoqueListComponent } from './components/estoque/estoque-list.component';
import { EstoqueBaixoComponent } from './components/estoque/estoque-baixo.component';
import { EstoqueMovimentacaoComponent } from './components/estoque/estoque-movimentacao.component';
import { EstoqueHistoricoComponent } from './components/estoque/estoque-historico.component';
import { PedidosListComponent } from './components/pedidos/pedidos-list/pedidos-list.component';
import { PainelClienteComponent } from './components/painel/painel-cliente.component';
import { FuncionarioFormComponent } from './components/funcionarios/funcionario-form.component';
import { FuncionarioListComponent } from './components/funcionarios/funcionario-list.component';
import { FuncionarioEditComponent } from './components/funcionarios/funcionario-edit.component';
import { PedidosKanbanComponent } from './components/pedidos/pedidos-kanban/pedidos-kanban.component';
import { CaixaComponent } from './components/caixa/caixa.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { RelatoriosDashboardComponent } from './components/relatorios/relatorios-dashboard/relatorios-dashboard.component';

// Definição de papéis
const ROLE_GARCOM = 'garcom';
const ROLE_COZINHEIRO = 'cozinheiro';
const ROLE_GERENTE = 'gerente';
const ROLE_CAIXA = 'caixa';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'painel', 
    component: PainelClienteComponent 
  },
  {
    path: 'funcionarios',
    component: FuncionarioListComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GERENTE])]
  },
  {
    path: 'funcionarios/novo',
    component: FuncionarioFormComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GERENTE])]
  },
  {
    path: 'funcionarios/editar/:id',
    component: FuncionarioEditComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GERENTE])]
  },
  { 
    path: 'comandas', 
    component: ComandasListComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GARCOM, ROLE_GERENTE, ROLE_CAIXA])]
  },
  {
    path: 'comandas/nova',
    component: ComandaFormComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GARCOM, ROLE_GERENTE, ROLE_CAIXA])]
  },
  {
    path: 'comandas/:id',
    component: ComandaDetailComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GARCOM, ROLE_GERENTE, ROLE_CAIXA])]
  },
  {
    path: 'comandas/editar/:id',
    component: ComandaFormComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GARCOM, ROLE_GERENTE, ROLE_CAIXA])]
  },
  {
    path: 'caixa',
    component: CaixaComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GARCOM, ROLE_GERENTE, ROLE_CAIXA])]
  },
  {
    path: 'pedidos',
    component: PedidosListComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_COZINHEIRO, ROLE_GERENTE, ROLE_GARCOM])]
  },
  {
    path: 'cozinha',
    component: PedidosKanbanComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_COZINHEIRO, ROLE_GERENTE])]
  },
  {
    path: 'produtos',
    component: ProdutosListComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_COZINHEIRO, ROLE_GERENTE])]
  },
  {
    path: 'produtos/novo',
    component: ProdutoFormComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GERENTE])]
  },
  {
    path: 'produtos/editar/:id',
    component: ProdutoFormComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GERENTE])]
  },
  {
    path: 'categorias',
    component: CategoriasListComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_COZINHEIRO, ROLE_GERENTE])]
  },
  {
    path: 'categorias/nova',
    component: CategoriaFormComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GERENTE])]
  },
  {
    path: 'categorias/editar/:id',
    component: CategoriaFormComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GERENTE])]
  },
  {
    path: 'estoque',
    component: EstoqueListComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GERENTE])]
  },
  {
    path: 'estoque/baixo',
    component: EstoqueBaixoComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GERENTE])]
  },
  {
    path: 'estoque/movimentacao',
    component: EstoqueMovimentacaoComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GERENTE])]
  },
  {
    path: 'estoque/movimentacao/:id',
    component: EstoqueMovimentacaoComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GERENTE])]
  },
  {
    path: 'estoque/historico/:id',
    component: EstoqueHistoricoComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GERENTE])]
  },
  {
    path: 'relatorios',
    component: RelatoriosDashboardComponent,
    canActivate: [authGuard],
    canMatch: [roleGuard([ROLE_GERENTE, ROLE_CAIXA])]
  },
  { path: '**', redirectTo: '/dashboard' }
]; 