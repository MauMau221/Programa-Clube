import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  duration?: number; // duração em ms (padrão será 5000ms)
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  constructor() { }

  // Mostrar um toast
  show(message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'info', duration: number = 5000): void {
    const toast: Toast = {
      id: new Date().getTime() + Math.floor(Math.random() * 1000),
      message,
      type,
      duration
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Configurar a remoção automática após a duração
    if (duration > 0) {
      setTimeout(() => this.remove(toast.id), duration);
    }
  }

  // Remover um toast específico pelo ID
  remove(id: number): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
  }

  // Remover todos os toasts
  clear(): void {
    this.toastsSubject.next([]);
  }

  // Helpers para diferentes tipos de toast
  success(message: string, duration: number = 5000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 5000): void {
    this.show(message, 'danger', duration);
  }

  warning(message: string, duration: number = 5000): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration: number = 5000): void {
    this.show(message, 'info', duration);
  }
} 