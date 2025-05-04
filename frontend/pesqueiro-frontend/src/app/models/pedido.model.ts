export interface PedidoItem {
  nome: string;
  quantidade: number;
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