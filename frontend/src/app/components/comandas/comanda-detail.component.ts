import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ComandaService } from '../../services/comanda.service';
import { ProdutoService } from '../../services/produto.service';
import { PedidoService } from '../../services/pedido.service';
import { Comanda, ComandaItem, Produto, ComandaPagamento } from '../../models/comanda.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-comanda-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './comanda-detail.component.html',
  styleUrls: ['./comanda-detail.component.scss']
})
export class ComandaDetailComponent implements OnInit {
  comanda: Comanda | null = null;
  produtos: Produto[] = [];
  isLoading = false;
  
  // Variáveis mantidas apenas para compatibilidade com o HTML atual
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | 'warning' | '' = '';
  
  itemForm: FormGroup;
  produtoSelecionado: Produto | null = null;
  temPedidoPendente = false;
  pedidoPendente: any = null;
  
  // Novas propriedades para pagamento
  metodoPagamento: string = 'dinheiro';
  metodosPagamento = [
    { valor: 'dinheiro', nome: 'Dinheiro' },
    { valor: 'credito', nome: 'Cartão de Crédito' },
    { valor: 'debito', nome: 'Cartão de Débito' },
    { valor: 'pix', nome: 'PIX' },
    { valor: 'outro', nome: 'Outro' }
  ];
  
  // Propriedades para divisão da conta
  numeroPessoas: number = 1;
  valorPorPessoa: number = 0;
  
  showPagamentoDialog: boolean = false;
  
  // Propriedades para múltiplos pagamentos
  pagamentos: ComandaPagamento[] = [];
  valorRestante: number = 0;
  novoPagamento: Partial<ComandaPagamento> = {
    metodo_pagamento: 'dinheiro',
    valor: 0,
    status: 'pendente'
  };
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private comandaService: ComandaService,
    private produtoService: ProdutoService,
    private pedidoService: PedidoService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.itemForm = this.fb.group({
      produto_id: ['', [Validators.required]],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      observacao: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.carregarComanda(id);
      this.carregarProdutos();
    }
  }

  carregarComanda(id: number): void {
    this.isLoading = true;
    this.comandaService.getComanda(id).subscribe({
      next: (comanda) => {
        // Garantir que valores numéricos de todos os itens sejam tratados como números
        if (comanda.itens && comanda.itens.length > 0) {
          comanda.itens = comanda.itens.map(item => ({
            ...item,
            valor_unitario: typeof item.valor_unitario === 'string' ? parseFloat(item.valor_unitario) : item.valor_unitario,
            valor_total: typeof item.valor_total === 'string' ? parseFloat(item.valor_total) : item.valor_total,
            quantidade: typeof item.quantidade === 'string' ? parseInt(item.quantidade) : item.quantidade
          }));
        }
        
        // Atualizar valor total
        comanda.total = typeof comanda.total === 'string' ? parseFloat(comanda.total) : comanda.total;
        
        this.comanda = comanda;
        console.log('Comanda carregada:', this.comanda);
        if (this.comanda.itens) {
          console.log('Itens da comanda:', this.comanda.itens.length);
          console.log('Primeiro item:', this.comanda.itens[0]);
        }
        
        // Inicializar o número de pessoas se a comanda já tiver esse valor
        if (comanda.pessoas && comanda.pessoas > 0) {
          this.numeroPessoas = comanda.pessoas;
        }
        
        // Inicializar o método de pagamento se a comanda já tiver
        if (comanda.metodo_pagamento) {
          this.metodoPagamento = comanda.metodo_pagamento;
        }
        
        // Calcular valor por pessoa
        this.calcularValorPorPessoa();
        
        // Verificar se há pedidos pendentes de envio para a cozinha
        this.verificarPedidosPendentes(id);
        
        // Inicializar pagamentos se existirem
        this.pagamentos = comanda.pagamentos || [];
        
        // Calcular valor restante a ser pago
        this.calcularValorRestante();
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar comanda:', error);
        this.toastService.error('Erro ao carregar comanda. Tente novamente mais tarde.');
        this.isLoading = false;
      }
    });
  }

  verificarPedidosPendentes(comandaId: number): void {
    this.comandaService.verificarPedidosPendentes(comandaId).subscribe({
      next: (resposta) => {
        this.temPedidoPendente = resposta.tem_pedido_pendente;
        this.pedidoPendente = resposta.pedido || null;
        console.log('Pedidos pendentes:', this.temPedidoPendente, this.pedidoPendente);
      },
      error: (error) => {
        console.error('Erro ao verificar pedidos pendentes:', error);
      }
    });
  }

  enviarParaCozinha(): void {
    if (!this.pedidoPendente || !this.comanda) return;
    
    this.isLoading = true;
    this.pedidoService.enviarParaCozinha(this.pedidoPendente.id).subscribe({
      next: (resposta) => {
        this.toastService.success('Pedido enviado para a cozinha com sucesso!');
        // Atualizar a comanda e verificar novamente os pedidos pendentes
        this.carregarComanda(this.comanda!.id);
      },
      error: (error) => {
        console.error('Erro ao enviar para a cozinha:', error);
        this.toastService.error('Erro ao enviar pedido para a cozinha. Tente novamente.');
        this.isLoading = false;
      }
    });
  }

  carregarProdutos(): void {
    this.produtoService.getProdutosDisponiveis().subscribe({
      next: (produtos) => {
        // Garantir que o campo preco é um número para todos os produtos
        this.produtos = produtos.map(produto => ({
          ...produto,
          preco: typeof produto.preco === 'string' ? parseFloat(produto.preco) : produto.preco
        }));
        console.log('Produtos carregados:', this.produtos);
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.toastService.error('Erro ao carregar produtos. Tente novamente mais tarde.');
      }
    });
  }

  onProdutoChange(): void {
    const produtoId = this.itemForm.get('produto_id')?.value;
    if (produtoId) {
      this.produtoSelecionado = this.produtos.find(p => p.id === +produtoId) || null;
    } else {
      this.produtoSelecionado = null;
    }
  }

  adicionarItem(): void {
    if (this.itemForm.invalid || !this.comanda) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const produtoId = +this.itemForm.get('produto_id')?.value;
    const quantidade = +this.itemForm.get('quantidade')?.value;
    
    // Verificar estoque disponível
    if (this.produtoSelecionado && this.produtoSelecionado.quantidade_estoque !== undefined) {
      // Verificar se a quantidade solicitada está disponível
      if (quantidade > this.produtoSelecionado.quantidade_estoque) {
        this.toastService.error(`Estoque insuficiente! Disponível: ${this.produtoSelecionado.quantidade_estoque}`);
        return;
      }
    }

    this.isLoading = true;
    const itemData = this.itemForm.value;
    
    this.comandaService.adicionarItem(this.comanda.id, itemData).subscribe({
      next: (response) => {
        this.toastService.success('Item adicionado com sucesso!');
        this.itemForm.reset({ quantidade: 1 });
        this.produtoSelecionado = null;
        this.carregarComanda(this.comanda!.id);
      },
      error: (error) => {
        console.error('Erro ao adicionar item:', error);
        
        // Verificar se o erro é relacionado a estoque
        if (error.error && error.error.message && error.error.message.includes('estoque insuficiente')) {
          this.toastService.error(error.error.message);
        } else {
          this.toastService.error('Erro ao adicionar item. Tente novamente.');
        }
        
        this.isLoading = false;
      }
    });
  }

  removerItem(itemId: number): void {
    if (!this.comanda) return;

    if (confirm('Tem certeza que deseja remover este item?')) {
      this.isLoading = true;
      this.comandaService.removerItem(this.comanda.id, itemId).subscribe({
        next: () => {
          this.toastService.success('Item removido com sucesso!');
          this.carregarComanda(this.comanda!.id);
        },
        error: (error) => {
          console.error('Erro ao remover item:', error);
          this.toastService.error('Erro ao remover item. Tente novamente.');
          this.isLoading = false;
        }
      });
    }
  }

  // Aumentar quantidade de um item na comanda
  aumentarQuantidade(itemId: number, quantidadeAtual: number): void {
    if (!this.comanda) return;
    
    // Verificar se há estoque disponível para aumentar
    const item = this.comanda.itens?.find(i => i.id === itemId);
    if (item && item.produto) {
      // Verificar se o produto tem controle de estoque
      if (item.produto.quantidade_estoque !== undefined) {
        // Se a quantidade atual já é igual ou superior ao estoque disponível
        if (quantidadeAtual >= item.produto.quantidade_estoque) {
          this.toastService.error(`Estoque insuficiente! Disponível: ${item.produto.quantidade_estoque}`);
          return;
        }
      }
    }
    
    const novaQuantidade = quantidadeAtual + 1;
    const itemAtualizado = { quantidade: novaQuantidade };
    
    this.atualizarQuantidadeItem(itemId, itemAtualizado);
  }
  
  // Diminuir quantidade de um item na comanda
  diminuirQuantidade(itemId: number, quantidadeAtual: number): void {
    if (!this.comanda) return;
    
    if (quantidadeAtual <= 1) {
      if (confirm('Remover este item da comanda?')) {
        this.removerItem(itemId);
      }
      return;
    }
    
    const novaQuantidade = quantidadeAtual - 1;
    const itemAtualizado = { quantidade: novaQuantidade };
    
    this.atualizarQuantidadeItem(itemId, itemAtualizado);
  }
  
  // Atualizar quantidade de um item na comanda
  private atualizarQuantidadeItem(itemId: number, itemAtualizado: Partial<ComandaItem>): void {
    if (!this.comanda) return;
    
    this.isLoading = true;
    
    this.comandaService.atualizarItem(this.comanda.id, itemId, itemAtualizado).subscribe({
      next: (itemAtualizado) => {
        this.toastService.success('Quantidade atualizada com sucesso!');
        this.carregarComanda(this.comanda!.id);
      },
      error: (error) => {
        console.error('Erro ao atualizar quantidade:', error);
        this.toastService.error('Erro ao atualizar quantidade. Tente novamente.');
        this.isLoading = false;
      }
    });
  }

  // Calcular valor por pessoa
  calcularValorPorPessoa(): void {
    if (this.comanda && this.comanda.total && this.numeroPessoas > 0) {
      // Calcular e arredondar o valor por pessoa para evitar números com muitas casas decimais
      const valorBruto = this.comanda.total / this.numeroPessoas;
      this.valorPorPessoa = this.arredondarValorMonetario(valorBruto);
      
      // Se tivermos mais de uma pessoa, atualizar o valor do novo pagamento
      if (this.numeroPessoas > 1) {
        this.novoPagamento.valor = this.valorPorPessoa;
      }
    } else {
      this.valorPorPessoa = 0;
    }
  }

  // Aumentar número de pessoas para divisão
  aumentarPessoas(): void {
    this.numeroPessoas++;
    this.calcularValorPorPessoa();
    
    // Ao aumentar para mais de uma pessoa, limpar os pagamentos existentes
    if (this.numeroPessoas === 2) {
      this.pagamentos = [];
      this.calcularValorRestante();
      
      // Atualizar o valor do novo pagamento para o valor por pessoa
      if (this.comanda && this.comanda.total) {
        this.novoPagamento.valor = this.valorPorPessoa;
      }
    }
  }
  
  // Diminuir número de pessoas para divisão (mínimo 1)
  diminuirPessoas(): void {
    if (this.numeroPessoas > 1) {
      this.numeroPessoas--;
      this.calcularValorPorPessoa();
      
      // Se diminuir para uma pessoa, limpar os pagamentos individuais
      if (this.numeroPessoas === 1) {
        this.pagamentos = [];
        this.calcularValorRestante();
      } else {
        // Se ainda tivermos mais de uma pessoa, atualizar o valor do novo pagamento
        this.novoPagamento.valor = this.valorPorPessoa;
      }
    }
  }

  // Novo método para abrir diálogo de pagamento
  abrirDialogPagamento(): void {
    if (!this.comanda) return;
    this.showPagamentoDialog = true;
    this.numeroPessoas = this.comanda.pessoas || 1;
    this.metodoPagamento = this.comanda.metodo_pagamento || 'dinheiro';
    this.calcularValorPorPessoa();
    
    // Se tivermos mais de uma pessoa, inicializar o valor do pagamento
    if (this.numeroPessoas > 1) {
      this.novoPagamento.valor = this.valorPorPessoa;
    }
  }
  
  // Fechar diálogo de pagamento
  fecharDialogPagamento(): void {
    this.showPagamentoDialog = false;
  }
  
  // Método modificado para incluir dados de pagamento
  fecharComanda(): void {
    if (!this.comanda) return;
    
    // Se já temos o diálogo aberto, fechamos a comanda com os dados informados
    if (this.showPagamentoDialog) {
      this.confirmarFechamento();
    } else {
      // Caso contrário, abrimos o diálogo
      this.abrirDialogPagamento();
    }
  }
  
  // Método para confirmar o fechamento da comanda com os dados de pagamento
  confirmarFechamento(): void {
    if (!this.comanda) return;
    
    this.isLoading = true;
    this.showPagamentoDialog = false;
    
    const dadosPagamento: any = {
      metodo_pagamento: this.metodoPagamento,
      pessoas: this.numeroPessoas
    };
    
    // Adicionar pagamentos individuais apenas se tivermos mais de uma pessoa
    if (this.numeroPessoas > 1 && this.pagamentos.length > 0) {
      dadosPagamento.pagamentos = this.pagamentos;
    }
    
    this.comandaService.fecharComanda(this.comanda.id, dadosPagamento).subscribe({
      next: () => {
        this.toastService.success('Comanda fechada com sucesso!');
        this.carregarComanda(this.comanda!.id);
      },
      error: (error) => {
        console.error('Erro ao fechar comanda:', error);
        this.toastService.error('Erro ao fechar comanda. Tente novamente.');
        this.isLoading = false;
      }
    });
  }

  cancelarComanda(): void {
    if (!this.comanda) return;

    if (confirm('Tem certeza que deseja cancelar esta comanda?')) {
      this.isLoading = true;
      this.comandaService.cancelarComanda(this.comanda.id).subscribe({
        next: () => {
          this.toastService.success('Comanda cancelada com sucesso!');
          this.carregarComanda(this.comanda!.id);
        },
        error: (error) => {
          console.error('Erro ao cancelar comanda:', error);
          this.toastService.error('Erro ao cancelar comanda. Tente novamente.');
          this.isLoading = false;
        }
      });
    }
  }

  limparMensagem(): void {
    this.mensagem = '';
    this.tipoMensagem = '';
  }

  // Método para calcular o valor restante a ser pago
  calcularValorRestante(): void {
    if (!this.comanda || !this.comanda.total) {
      this.valorRestante = 0;
      this.novoPagamento.valor = 0;
      return;
    }
    
    // Total da comanda
    let totalComanda = this.comanda.total;
    
    // Somar valores já pagos ou em processamento
    let totalPago = this.pagamentos.reduce((total, pagamento) => {
      return total + pagamento.valor;
    }, 0);
    
    // Calcular valor restante
    this.valorRestante = this.arredondarValorMonetario(totalComanda - totalPago);
    
    // Se negativo (caso de sobra), zerar
    if (this.valorRestante < 0) {
      this.valorRestante = 0;
    }
    
    // Atualizar valor do novo pagamento
    // Se não tiver pagamentos, usar o valor por pessoa
    // Caso contrário, usar o valor restante se for menor que o valor por pessoa
    if (this.pagamentos.length === 0 && this.numeroPessoas > 1) {
      this.novoPagamento.valor = this.valorPorPessoa;
    } else if (this.numeroPessoas > 1) {
      // Determinar quantas pessoas ainda não pagaram
      const pessoasFaltantes = this.numeroPessoas - this.pagamentos.length;
      
      if (pessoasFaltantes > 0) {
        // Calcular valor por pessoa remanescente e arredondar
        const valorBruto = this.valorRestante / pessoasFaltantes;
        this.novoPagamento.valor = this.arredondarValorMonetario(valorBruto);
      } else {
        this.novoPagamento.valor = this.valorRestante;
      }
    } else {
      this.novoPagamento.valor = this.valorRestante;
    }
  }
  
  // Método para adicionar um novo pagamento
  adicionarPagamento(): void {
    if (!this.comanda || !this.novoPagamento.valor || this.novoPagamento.valor <= 0) {
      return;
    }
    
    // Verificar se o valor não excede o restante
    if (this.novoPagamento.valor > this.valorRestante) {
      this.novoPagamento.valor = this.valorRestante;
    }
    
    // Arredondar o valor para evitar problemas com casas decimais
    this.novoPagamento.valor = this.arredondarValorMonetario(this.novoPagamento.valor);
    
    const pagamento: Partial<ComandaPagamento> = {
      comanda_id: this.comanda.id,
      metodo_pagamento: this.novoPagamento.metodo_pagamento,
      valor: this.novoPagamento.valor,
      status: 'pendente'
    };
    
    this.isLoading = true;
    this.comandaService.adicionarPagamento(this.comanda.id, pagamento).subscribe({
      next: (novoPagamento) => {
        this.pagamentos.push(novoPagamento);
        
        // Recalcular valores após adicionar pagamento
        this.calcularValorRestante();
        
        // Mensagem de sucesso
        this.toastService.success('Pagamento adicionado com sucesso!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao adicionar pagamento:', error);
        this.toastService.error('Erro ao adicionar pagamento. Tente novamente.');
        this.isLoading = false;
      }
    });
  }
  
  // Marcar pagamento como pago ou pendente
  atualizarStatusPagamento(pagamento: ComandaPagamento): void {
    if (!this.comanda) return;
    
    const novoStatus = pagamento.status === 'pendente' ? 'pago' : 'pendente';
    
    this.isLoading = true;
    this.comandaService.atualizarStatusPagamento(this.comanda.id, pagamento.id!, novoStatus).subscribe({
      next: (pagamentoAtualizado) => {
        // Atualizar o pagamento na lista
        const index = this.pagamentos.findIndex(p => p.id === pagamento.id);
        if (index !== -1) {
          this.pagamentos[index] = pagamentoAtualizado;
        }
        this.toastService.success(`Pagamento marcado como ${novoStatus === 'pago' ? 'pago' : 'pendente'}!`);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao atualizar status do pagamento:', error);
        this.toastService.error('Erro ao atualizar status do pagamento. Tente novamente.');
        this.isLoading = false;
      }
    });
  }
  
  // Remover um pagamento
  removerPagamento(pagamentoId: number): void {
    if (!this.comanda) return;
    
    if (!confirm('Tem certeza que deseja remover este pagamento?')) {
      return;
    }
    
    this.isLoading = true;
    this.comandaService.removerPagamento(this.comanda.id, pagamentoId).subscribe({
      next: () => {
        // Remover o pagamento da lista
        this.pagamentos = this.pagamentos.filter(p => p.id !== pagamentoId);
        this.calcularValorRestante();
        this.toastService.success('Pagamento removido com sucesso!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao remover pagamento:', error);
        this.toastService.error('Erro ao remover pagamento. Tente novamente.');
        this.isLoading = false;
      }
    });
  }

  // Método para arredondar valores monetários para evitar casas decimais excessivas
  arredondarValorMonetario(valor: number): number {
    // Arredonda para 2 casas decimais
    return Math.round(valor * 100) / 100;
  }

  // Método para formatar valores monetários para exibição
  formatarValorMonetario(valor: number | undefined | null): string {
    // Se o valor for undefined ou null, retorna "0.00"
    if (valor === undefined || valor === null) {
      return "0.00";
    }
    
    // Garante que o valor seja arredondado e formatado com 2 casas decimais
    return this.arredondarValorMonetario(valor).toFixed(2);
  }
} 