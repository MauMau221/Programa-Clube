import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { EchoService } from './services/echo.service';

// Providers para serviços
import { AuthService } from './services/auth.service';
import { NotificacaoService } from './services/notificacao.service';
import { PedidoService } from './services/pedido.service';
import { ComandaService } from './services/comanda.service';
import { ProdutoService } from './services/produto.service';
import { CategoriaService } from './services/categoria.service';
import { EstoqueService } from './services/estoque.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor
      ])
    ),
    // Providers dos serviços
    AuthService,
    NotificacaoService,
    PedidoService,
    ComandaService,
    ProdutoService,
    CategoriaService,
    EstoqueService,
    EchoService
  ]
};
