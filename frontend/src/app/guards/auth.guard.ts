import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function authGuard() {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  if (authService.isLoggedIn) {
    return true;
  }
  
  // Se não estiver logado, redireciona para login
  router.navigate(['/login']);
  return false;
} 