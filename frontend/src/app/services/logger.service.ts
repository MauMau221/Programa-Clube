import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private isDebugEnabled = environment.enableDebugLogs;

  constructor() {
    // Verificar se estamos em desenvolvimento
    this.isDebugEnabled = environment.enableDebugLogs && !environment.production;
  }

  // Log informacional (sem informações sensíveis)
  info(message: string, ...data: any[]): void {
    if (this.isDebugEnabled) {
      console.log(message, ...data);
    }
  }

  // Log de requisições (sem token)
  logRequest(url: string): void {
    if (this.isDebugEnabled) {
      console.log(`Fazendo requisição para: ${url}`);
    }
  }

  // Log de resposta de API (sem dados sensíveis)
  logResponse(source: string, data: any): void {
    if (this.isDebugEnabled) {
      if (Array.isArray(data)) {
        console.log(`Resposta da API (${source}): ${data.length} itens`);
      } else {
        console.log(`Resposta da API (${source}): dados recebidos`);
      }
    }
  }

  // Log para erros (deve mostrar sempre para facilitar depuração)
  error(message: string, error: any): void {
    console.error(message, error);
  }

  // Log para avisos (warnings)
  warn(message: string, ...data: any[]): void {
    if (this.isDebugEnabled) {
      console.warn(message, ...data);
    }
  }

  // Log de depuração detalhado
  debug(message: string, ...data: any[]): void {
    if (this.isDebugEnabled) {
      console.debug(message, ...data);
    }
  }
} 