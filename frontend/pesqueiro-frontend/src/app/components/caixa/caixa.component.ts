import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProdutoService } from '../../services/produto.service';
import { ComandaService } from '../../services/comanda.service';
import { Produto } from '../../models/comanda.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-caixa',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './caixa.component.html',
  styleUrls: ['./caixa.component.scss']
})
export class CaixaComponent implements OnInit {
  produtos: Produto[] = [];
  carrinhoItens: {produto: Produto, quantidade: number, observacao?: string}[] = [];
  isLoading = false;
  
  // Variáveis mantidas apenas para compatibilidade com o HTML atual
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | 'warning' | '' = '';
  
  // Formulário para adicionar produtos ao carrinho
  produtoForm: FormGroup;
  
  // Método de pagamento
  metodoPagamento: string = 'dinheiro';
  metodosPagamento = [
    { valor: 'dinheiro', nome: 'Dinheiro' },
    { valor: 'credito', nome: 'Cartão de Crédito' },
    { valor: 'debito', nome: 'Cartão de Débito' },
    { valor: 'pix', nome: 'PIX' },
    { valor: 'outro', nome: 'Outro' }
  ];
  
  // Para exibir detalhes do produto selecionado
  produtoSelecionado: Produto | null = null;
  
  // Informações do cliente (opcional)
  clienteNome: string = '';
  
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private produtoService: ProdutoService,
    private comandaService: ComandaService,
    private toastService: ToastService
  ) {
    this.produtoForm = this.fb.group({
      produto_id: ['', [Validators.required]],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      observacao: ['']
    });
  }

  ngOnInit(): void {
    this.carregarProdutos();
  }
  
  carregarProdutos(): void {
    this.isLoading = true;
    this.produtoService.getProdutosDisponiveis().subscribe({
      next: (produtos) => {
        // Garantir que o campo preco é um número para todos os produtos
        this.produtos = produtos.map(produto => ({
          ...produto,
          preco: typeof produto.preco === 'string' ? parseFloat(produto.preco) : produto.preco
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.toastService.error('Erro ao carregar produtos. Tente novamente mais tarde.');
        this.isLoading = false;
      }
    });
  }
  
  onProdutoChange(): void {
    const produtoId = this.produtoForm.get('produto_id')?.value;
    if (produtoId) {
      this.produtoSelecionado = this.produtos.find(p => p.id === +produtoId) || null;
    } else {
      this.produtoSelecionado = null;
    }
  }
  
  adicionarAoCarrinho(): void {
    if (this.produtoForm.invalid) {
      this.produtoForm.markAllAsTouched();
      return;
    }
    
    const produtoId = +this.produtoForm.get('produto_id')?.value;
    const quantidade = +this.produtoForm.get('quantidade')?.value;
    const observacao = this.produtoForm.get('observacao')?.value;
    
    const produto = this.produtos.find(p => p.id === produtoId);
    if (!produto) {
      this.toastService.error('Produto não encontrado.');
      return;
    }
    
    // Verificar estoque disponível
    const produtoNoCarrinho = this.carrinhoItens.find(item => item.produto.id === produtoId);
    const quantidadeNoCarrinho = produtoNoCarrinho ? produtoNoCarrinho.quantidade : 0;
    const quantidadeTotal = quantidadeNoCarrinho + quantidade;
    
    // Se o produto controla estoque e não tem quantidade suficiente
    if (produto.quantidade_estoque !== undefined && quantidadeTotal > produto.quantidade_estoque) {
      this.toastService.error(`Estoque insuficiente! Disponível: ${produto.quantidade_estoque}`);
      return;
    }
    
    // Verificar se o produto já está no carrinho
    const itemIndex = this.carrinhoItens.findIndex(item => item.produto.id === produtoId);
    if (itemIndex !== -1) {
      // Atualizar a quantidade do item existente
      this.carrinhoItens[itemIndex].quantidade += quantidade;
      
      // Concatenar observações se houver uma nova
      if (observacao) {
        const obsExistente = this.carrinhoItens[itemIndex].observacao || '';
        if (obsExistente) {
          this.carrinhoItens[itemIndex].observacao = `${obsExistente}; ${observacao}`;
        } else {
          this.carrinhoItens[itemIndex].observacao = observacao;
        }
      }
    } else {
      // Adicionar novo item ao carrinho
      this.carrinhoItens.push({
        produto,
        quantidade,
        observacao
      });
    }
    
    // Resetar o formulário mantendo a quantidade em 1
    this.produtoForm.reset({ quantidade: 1 });
    this.produtoSelecionado = null;
    
    this.toastService.success('Produto adicionado ao carrinho.');
  }
  
  // Novo método para aumentar a quantidade de um item no carrinho
  aumentarQuantidade(index: number): void {
    if (index >= 0 && index < this.carrinhoItens.length) {
      const item = this.carrinhoItens[index];
      
      // Verificar se há estoque disponível
      if (item.produto.quantidade_estoque !== undefined) {
        // Se a quantidade atual já é igual ou superior ao estoque disponível
        if (item.quantidade >= item.produto.quantidade_estoque) {
          this.toastService.error(`Estoque insuficiente! Disponível: ${item.produto.quantidade_estoque}`);
          return;
        }
      }
      
      this.carrinhoItens[index].quantidade += 1;
    }
  }
  
  // Novo método para diminuir a quantidade de um item no carrinho
  diminuirQuantidade(index: number): void {
    if (index >= 0 && index < this.carrinhoItens.length) {
      if (this.carrinhoItens[index].quantidade > 1) {
        this.carrinhoItens[index].quantidade -= 1;
      } else {
        // Se a quantidade for 1, perguntar se quer remover o item
        if (confirm('Remover este item do carrinho?')) {
          this.removerDoCarrinho(index);
        }
      }
    }
  }
  
  removerDoCarrinho(index: number): void {
    if (confirm('Tem certeza que deseja remover este item do carrinho?')) {
      this.carrinhoItens.splice(index, 1);
      this.toastService.success('Item removido do carrinho.');
    }
  }
  
  limparCarrinho(): void {
    if (this.carrinhoItens.length === 0) return;
    
    if (confirm('Tem certeza que deseja limpar todo o carrinho?')) {
      this.carrinhoItens = [];
      this.toastService.success('Carrinho limpo com sucesso.');
    }
  }
  
  // Calcular o valor total do carrinho
  calcularTotal(): number {
    return this.carrinhoItens.reduce((total, item) => {
      return total + (item.produto.preco * item.quantidade);
    }, 0);
  }
  
  // Formatar valores monetários
  formatarValorMonetario(valor: number | undefined | null): string {
    if (valor === undefined || valor === null) {
      return "0.00";
    }
    return this.arredondarValorMonetario(valor).toFixed(2);
  }
  
  // Arredondar valores monetários
  arredondarValorMonetario(valor: number): number {
    return Math.round(valor * 100) / 100;
  }
  
  // Limpar mensagens - método mantido para compatibilidade
  limparMensagem(): void {
    this.mensagem = '';
    this.tipoMensagem = '';
  }
  
  // Finalizar a venda direta
  finalizarVenda(): void {
    if (this.carrinhoItens.length === 0) {
      this.toastService.warning('Adicione pelo menos um produto ao carrinho.');
      return;
    }
    
    this.isLoading = true;
    
    // Preparar os dados da venda
    const venda = {
      tipo: 'venda_direta',
      cliente: this.clienteNome.trim() || null,
      metodo_pagamento: this.metodoPagamento,
      itens: this.carrinhoItens.map(item => ({
        produto_id: item.produto.id,
        quantidade: item.quantidade,
        observacao: item.observacao || null
      }))
    };
    
    // Chamar o serviço para registrar a venda
    this.comandaService.registrarVendaDireta(venda).subscribe({
      next: (resposta) => {
        this.toastService.success('Venda finalizada com sucesso!');
        this.isLoading = false;
        
        // Limpar o carrinho após a venda ser concluída
        this.carrinhoItens = [];
        this.clienteNome = '';
        this.metodoPagamento = 'dinheiro';
        
        // Opcionalmente, redirecionar para uma página de confirmação ou imprimir recibo
        // this.router.navigate(['/venda/confirmacao', resposta.id]);
      },
      error: (error) => {
        console.error('Erro ao finalizar venda:', error);
        this.toastService.error('Erro ao finalizar venda. Tente novamente.');
        this.isLoading = false;
      }
    });
  }
} 