import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { EchoService } from './services/echo.service';
import { AuthService } from './services/auth.service';
import { NavBarComponent } from './components/shared/nav-bar.component';
import { ToastComponent } from './components/shared/toast/toast.component';

declare var bootstrap: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavBarComponent, ToastComponent],
  template: `
    <app-nav-bar></app-nav-bar>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-toast></app-toast>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Pesqueiro';

  constructor(
    private echoService: EchoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // O EchoService é iniciado automaticamente via injeção de dependência
    
    // Verifica se o usuário está autenticado e reinicia a conexão do Echo quando mudar
    this.authService.isLoggedIn$.subscribe((loggedIn: boolean) => {
      if (loggedIn) {
        // Se o usuário fizer login, reinicia a conexão do Echo
        this.echoService.reiniciarConexao();
      }
    });
  }
  
  ngAfterViewInit(): void {
    // Não vamos mais adicionar manipuladores de eventos manuais
    // O Bootstrap.js incluído no CDN já cuida disso
    
    // Podemos apenas verificar se o Bootstrap está disponível
    console.log('Bootstrap disponível:', typeof bootstrap !== 'undefined');
  }
}
