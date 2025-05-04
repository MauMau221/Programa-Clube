# Sistema de Logs da Aplicação

## LoggerService - Documentação

Este documento descreve como usar o serviço de logs centralizado na aplicação para evitar exposição de informações sensíveis e padronizar os logs de depuração.

### Configuração

Os logs de depuração podem ser ativados ou desativados no arquivo `environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  // ... outras configurações
  enableDebugLogs: true // Habilita logs de depuração (usar false em produção)
};
```

### Como usar o LoggerService

1. Primeiro, importe o serviço no seu componente ou serviço:

```typescript
import { LoggerService } from '../services/logger.service';

@Component({
  // ...
})
export class MeuComponente {
  constructor(private logger: LoggerService) {}
}
```

2. Use os métodos apropriados para cada tipo de log:

```typescript
// Logs informacionais (só aparecem quando enableDebugLogs=true)
this.logger.info('Mensagem informativa');

// Logs de requisições (sem exibir tokens)
this.logger.logRequest(`${this.apiUrl}/algum-endpoint`);

// Logs de resposta da API (sem dados sensíveis)
this.logger.logResponse('nome-da-operação', dadosRecebidos);

// Logs de erro (sempre visíveis para facilitar depuração)
this.logger.error('Erro na operação', error);

// Logs de alerta
this.logger.warn('Aviso importante');

// Logs detalhados de depuração
this.logger.debug('Informação detalhada', objeto);
```

### Regras para Uso Adequado

1. **NUNCA** use `console.log()` diretamente no código - use sempre o LoggerService
2. **NUNCA** exiba tokens, senhas ou dados sensíveis nos logs
3. **NUNCA** deixe logs verbosos em código que irá para produção

### Benefícios

- Controle centralizado de todos os logs da aplicação
- Fácil habilitação/desabilitação de logs
- Prevenção de vazamento de dados sensíveis
- Padronização de mensagens de log
- Facilidade para depuração

### Migração de Código Existente

Para migrar código que usa `console.log()` diretamente:

1. Adicione o LoggerService ao componente ou serviço
2. Substitua todas as ocorrências de `console.log()` pelo método apropriado do LoggerService
3. Remova qualquer exposição de tokens ou informações sensíveis

Exemplo:
```typescript
// Antes
console.log('Token:', localStorage.getItem('auth_token'));
console.log('Dados recebidos:', response);

// Depois
this.logger.logRequest(`${this.apiUrl}/endpoint`);
this.logger.logResponse('operação', response);
``` 