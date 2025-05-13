import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Redirecionar para login se não estiver autorizado
        localStorage.removeItem('auth_token');
        router.navigate(['/login']);
      }
      
      // Mensagem de erro personalizada
      const errorMessage = error.error?.message || 'Ocorreu um erro. Tente novamente mais tarde.';
      
      // Registrar no console para depuração
      console.error('Erro HTTP:', error);
      
      return throwError(() => new Error(errorMessage));
    })
  );
}; 