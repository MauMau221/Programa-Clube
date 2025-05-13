import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EstoqueService } from '../../services/estoque.service';
import { ProdutoService } from '../../services/produto.service';
import { Produto } from '../../models/comanda.model';

@Component({
  selector: 'app-estoque-baixo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './estoque-baixo.component.html',
  styleUrls: ['./estoque-baixo.component.scss']
})
export class EstoqueBaixoComponent implements OnInit {
  produtos: Produto[] = [];
  isLoading = false;
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | '' = '';

  constructor(
    private estoqueService: EstoqueService,
    private produtoService: ProdutoService
  ) {}

  ngOnInit(): void {
    this.carregarProdutosBaixoEstoque();
  }

  carregarProdutosBaixoEstoque(): void {
    this.isLoading = true;
    this.mensagem = '';
    console.log('Carregando produtos com estoque baixo...');
    
    this.estoqueService.getProdutosEstoqueBaixo().subscribe({
      next: (produtos) => {
        console.log('Resposta processada de produtos com estoque baixo:', produtos);
        
        // Ordenar produtos: primeiro os esgotados, depois os com estoque baixo
        this.produtos = produtos.sort((a, b) => {
          // Se a.status_estoque é 'esgotado', deve vir antes de b
          if (a.status_estoque === 'esgotado' && b.status_estoque !== 'esgotado') {
            return -1;
          }
          // Se b.status_estoque é 'esgotado', deve vir antes de a
          if (a.status_estoque !== 'esgotado' && b.status_estoque === 'esgotado') {
            return 1;
          }
          // Se ambos têm o mesmo status, ordenar por nome
          return a.nome.localeCompare(b.nome);
        });
        
        this.isLoading = false;
        
        if (produtos.length === 0) {
          console.log('Nenhum produto com estoque baixo encontrado');
          this.mensagem = 'Não há produtos com estoque abaixo do mínimo.';
          this.tipoMensagem = 'success';
        } else {
          const produtosEsgotados = produtos.filter(p => p.status_estoque === 'esgotado');
          const produtosBaixos = produtos.filter(p => p.status_estoque === 'baixo');
          console.log(`Encontrados ${produtosEsgotados.length} produtos esgotados e ${produtosBaixos.length} com estoque baixo`);
        }
        
        // Verificar se há produtos com estoque menor que o mínimo
        const produtosComEstoqueBaixo = this.verificarProdutosEstoqueBaixo();
        if (produtosComEstoqueBaixo.length > 0 && this.produtos.length === 0) {
          console.warn('Detectados produtos com estoque baixo mas não foram exibidos:', produtosComEstoqueBaixo);
          // Adicionar produtos manualmente se a API não retornou
          this.produtos = produtosComEstoqueBaixo;
        }
      },
      error: (error) => {
        console.error('Erro ao carregar produtos com estoque baixo:', error);
        this.mensagem = 'Erro ao carregar produtos com estoque baixo. Tente novamente mais tarde.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
        
        // Tentar carregar lista de produtos e filtrar manualmente
        this.carregarTodosProdutosEFiltrar();
      }
    });
  }
  
  // Método de fallback que busca todos os produtos e filtra os que têm estoque baixo
  carregarTodosProdutosEFiltrar(): void {
    console.log('Usando método alternativo para buscar produtos com estoque baixo...');
    this.produtoService.getProdutos().subscribe({
      next: (produtos) => {
        console.log('Produtos carregados para filtragem manual:', produtos.length);
        this.produtos = this.verificarProdutosEstoqueBaixo(produtos).sort((a, b) => {
          // Primeiro os esgotados, depois os com estoque baixo
          if (a.status_estoque === 'esgotado' && b.status_estoque !== 'esgotado') {
            return -1;
          }
          if (a.status_estoque !== 'esgotado' && b.status_estoque === 'esgotado') {
            return 1;
          }
          return a.nome.localeCompare(b.nome);
        });
        
        if (this.produtos.length === 0) {
          this.mensagem = 'Não há produtos com estoque abaixo do mínimo.';
          this.tipoMensagem = 'success';
        } else {
          console.log(`Encontrados ${this.produtos.length} produtos com estoque baixo via método alternativo`);
          this.mensagem = '';
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos para filtrar:', error);
        this.isLoading = false;
      }
    });
  }
  
  // Função para verificar produtos com estoque baixo
  verificarProdutosEstoqueBaixo(listaProdutos?: Produto[]): Produto[] {
    const produtos = listaProdutos || [];
    console.log(`Verificando ${produtos.length} produtos para filtrar por estoque baixo`);
    
    return produtos.filter((produto: Produto) => {
      // Garantir que quantidade_estoque tenha um valor padrão se for undefined
      const quantidadeEstoque = produto.quantidade_estoque ?? 0;
      
      // Considerar estoque baixo se estiver abaixo do mínimo ou se for zero
      const estoqueBaixo = 
        quantidadeEstoque <= 0 || 
        (produto.estoque_minimo && quantidadeEstoque < produto.estoque_minimo);
      
      if (estoqueBaixo) {
        // Adicionar status ao produto
        produto.status_estoque = quantidadeEstoque === 0 ? 'esgotado' : 'baixo';
        
        console.log(`Produto ${produto.id} (${produto.nome}) com estoque baixo: ${quantidadeEstoque}/${produto.estoque_minimo || 'não definido'}`);
      }
      
      return estoqueBaixo;
    });
  }

  adicionarEstoque(produto: Produto): void {
    // Redireciona para a tela de adição de estoque com o ID do produto pré-selecionado
  }

  limparMensagem(): void {
    this.mensagem = '';
    this.tipoMensagem = '';
  }
} 