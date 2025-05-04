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
import { authGuard } from './guards/auth.guard';

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
    path: 'comandas', 
    component: ComandasListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'comandas/nova',
    component: ComandaFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'comandas/:id',
    component: ComandaDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: 'comandas/editar/:id',
    component: ComandaFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'produtos',
    component: ProdutosListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'produtos/novo',
    component: ProdutoFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'produtos/editar/:id',
    component: ProdutoFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'categorias',
    component: CategoriasListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'categorias/nova',
    component: CategoriaFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'categorias/editar/:id',
    component: CategoriaFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'estoque',
    component: EstoqueListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'estoque/baixo',
    component: EstoqueBaixoComponent,
    canActivate: [authGuard]
  },
  {
    path: 'estoque/movimentacao',
    component: EstoqueMovimentacaoComponent,
    canActivate: [authGuard]
  },
  {
    path: 'estoque/movimentacao/:id',
    component: EstoqueMovimentacaoComponent,
    canActivate: [authGuard]
  },
  {
    path: 'estoque/historico/:id',
    component: EstoqueHistoricoComponent,
    canActivate: [authGuard]
  },
  {
    path: 'pedidos',
    component: PedidosListComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
]; 