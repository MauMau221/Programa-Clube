import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(allowedRoles: string[]) {
  return () => {
    const router = inject(Router);
    const authService = inject(AuthService);
    
    if (!authService.isLoggedIn) {
      router.navigate(['/login']);
      return false;
    }
    
    const currentUser = authService.getCurrentUser();
    
    if (currentUser && currentUser.role && allowedRoles.includes(currentUser.role)) {
      return true;
    }
    
    // Se o usuário não tem o papel necessário, redireciona para dashboard
    router.navigate(['/dashboard']);
    return false;
  };
} 