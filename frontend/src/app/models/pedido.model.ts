export interface PedidoItem {
  nome: string;
  quantidade: number;
  observacao?: string;
}

export interface PedidoProduto {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  observacao?: string;
  pivot?: {
    id: number;
    quantidade: number;
    observacao?: string;
  };
}

export interface Pedido {
  id: number;
  comanda_id: number;
  comanda?: {
    mesa: string;
    cliente?: string;
  };
  mesa?: string;
  status: string;
  total: number;
  produtos: PedidoProduto[];
  itens: any[];
  pedido_aberto?: string;
  pedido_fechado?: string;
  prioridade?: string;
  created_at: string;
  updated_at: string;
}

export interface PedidoPainel {
  id: number;
  mesa: string;
  status: 'em preparo' | 'pronto';
  tempo_espera: string;
  itens: PedidoItem[];
}

export interface PainelCliente {
  em_preparo: PedidoPainel[];
  prontos: PedidoPainel[];
} 