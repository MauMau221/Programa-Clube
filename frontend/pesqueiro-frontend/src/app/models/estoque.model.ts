import { Produto } from './comanda.model';

// Interface para a resposta da API de estoque
export interface EstoqueResponse {
  estoque_atual?: number;
  data?: {
    estoque_atual?: number;
  };
  quantidade_atual?: number;
  saldo?: number;
  alerta?: {
    mensagem: string;
  };
}

// Interface para a notificação de estoque
export interface EstoqueNotificacao {
  produtoId: number;
  quantidade: number;
}

// Interface para o filtro de busca de estoque
export interface EstoqueFiltro {
  categoriaId?: number;
  termoBusca?: string;
  apenasEstoqueBaixo?: boolean;
} 