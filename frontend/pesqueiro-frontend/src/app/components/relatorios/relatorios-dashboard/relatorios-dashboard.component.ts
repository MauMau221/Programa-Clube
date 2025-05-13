import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RelatorioService, ResumoFinanceiro, ProdutoPorMetodo } from '../../../services/relatorio.service';

@Component({
  selector: 'app-relatorios-dashboard',
  templateUrl: './relatorios-dashboard.component.html',
  styleUrl: './relatorios-dashboard.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class RelatoriosDashboardComponent implements OnInit {
  filtroForm: FormGroup;
  resumo: ResumoFinanceiro | null = null;
  isLoading = false;
  erro: string | null = null;
  
  // Para produtos por método
  metodoPagamentoSelecionado: string | null = null;
  produtosPorMetodo: ProdutoPorMetodo[] = [];
  loadingProdutos = false;

  constructor(
    private fb: FormBuilder, 
    private relatorioService: RelatorioService,
    private route: ActivatedRoute
  ) {
    this.filtroForm = this.fb.group({
      dataInicio: [''],
      dataFim: ['']
    });
  }

  ngOnInit() {
    // Valor padrão: data de hoje
    const hoje = this.formatarDataParaInput(new Date());
    
    // Obter parâmetros da URL
    this.route.queryParams.subscribe(params => {
      const dataInicio = params['dataInicio'] || hoje;
      const dataFim = params['dataFim'] || hoje;
      
      // Preencher o formulário com os valores da URL ou os valores padrão
      this.filtroForm.patchValue({
        dataInicio: dataInicio,
        dataFim: dataFim
      });
      
      // Buscar relatório automaticamente
      this.buscarRelatorio();
    });
  }
  
  formatarDataParaInput(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  buscarRelatorio() {
    this.isLoading = true;
    this.erro = null;
    this.metodoPagamentoSelecionado = null;
    this.produtosPorMetodo = [];
    
    const { dataInicio, dataFim } = this.filtroForm.value;
    this.relatorioService.getResumoFinanceiro(dataInicio, dataFim).subscribe({
      next: (res) => {
        this.resumo = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.erro = 'Erro ao buscar relatório financeiro.';
        this.isLoading = false;
      }
    });
  }
  
  mostrarProdutosPorMetodo(metodo: string) {
    if (this.metodoPagamentoSelecionado === metodo) {
      this.metodoPagamentoSelecionado = null;
      this.produtosPorMetodo = [];
      return;
    }
    
    this.loadingProdutos = true;
    this.metodoPagamentoSelecionado = metodo;
    const { dataInicio, dataFim } = this.filtroForm.value;
    
    this.relatorioService.getProdutosPorMetodo(metodo, dataInicio, dataFim).subscribe({
      next: (response) => {
        this.produtosPorMetodo = response.produtos;
        this.loadingProdutos = false;
      },
      error: (err) => {
        this.erro = `Erro ao buscar produtos vendidos com ${metodo}.`;
        this.loadingProdutos = false;
      }
    });
  }
  
  calcularTotalQuantidade(): number {
    return this.produtosPorMetodo.reduce((total, produto) => {
      return total + Number(produto.quantidade);
    }, 0);
  }
  
  calcularTotalValor(): number {
    return this.produtosPorMetodo.reduce((total, produto) => {
      return total + Number(produto.valor_total);
    }, 0);
  }
  
  formatarMoeda(valor: number): string {
    return valor.toFixed(2);
  }
}
