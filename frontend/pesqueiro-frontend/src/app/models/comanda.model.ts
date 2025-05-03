export interface Comanda {
  id: number;
  mesa: string;
  cliente?: string;
  status: 'aberta' | 'fechada' | 'cancelada';
  valor_total: number;
  created_at: string;
  updated_at: string;
  itens?: ComandaItem[];
}

export interface ComandaItem {
  id: number;
  comanda_id: number;
  produto_id: number;
  produto?: Produto;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  observacao?: string;
  created_at: string;
  updated_at: string;
}

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria_id: number;
  categoria?: Categoria;
  status: 'disponivel' | 'indisponivel';
  observacao?: string;
  estoque_minimo: number;
  quantidade_estoque?: number;
  created_at: string;
  updated_at: string;
}

export interface Categoria {
  id: number;
  nome: string;
  status: 'disponivel' | 'indisponivel';
  created_at: string;
  updated_at: string;
}

// Interfaces para o estoque
export interface EstoqueMovimento {
  id: number;
  produto_id: number;
  produto?: Produto;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  quantidade_anterior: number;
  quantidade_atual: number;
  motivo?: string;
  usuario_id: number;
  usuario_nome?: string;
  created_at: string;
}

export interface EstoqueHistorico {
  id: number;
  produto_id: number;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  quantidade_anterior: number;
  quantidade_atual: number;
  motivo?: string;
  usuario_nome: string;
  created_at: string;
} 