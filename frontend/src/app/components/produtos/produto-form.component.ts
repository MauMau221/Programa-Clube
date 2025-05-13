import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProdutoService } from '../../services/produto.service';
import { CategoriaService } from '../../services/categoria.service';
import { Produto, Categoria } from '../../models/comanda.model';

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './produto-form.component.html',
  styleUrls: ['./produto-form.component.scss']
})
export class ProdutoFormComponent implements OnInit {
  produtoForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  produtoId?: number;
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | 'info' | '' = '';
  categorias: Categoria[] = [];

  constructor(
    private fb: FormBuilder,
    private produtoService: ProdutoService,
    private categoriaService: CategoriaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.produtoForm = this.fb.group({
      nome: ['', [Validators.required]],
      observacao: [''],
      preco: [0, [Validators.required, Validators.min(0.01)]],
      categoria_id: ['', [Validators.required]],
      status: ['disponivel', [Validators.required]],
      estoque_minimo: [5, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.carregarCategorias();
    
    const idParam = this.route.snapshot.params['id'];
    this.produtoId = idParam ? +idParam : undefined;
    this.isEditMode = !!this.produtoId;
    
    console.log('Modo de edição:', this.isEditMode ? 'Editar produto' : 'Novo produto');

    if (this.isEditMode) {
      this.carregarProduto();
    } else {
      // Se não estiver em modo de edição, defina valores padrão
      this.produtoForm.patchValue({
        status: 'disponivel',
        estoque_minimo: 5
      });
    }
  }

  carregarCategorias(): void {
    this.isLoading = true;
    this.categoriaService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        this.mensagem = 'Erro ao carregar categorias. Tente novamente mais tarde.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  carregarProduto(): void {
    if (!this.produtoId) return;

    console.log('Carregando produto com ID:', this.produtoId, 'tipo:', typeof this.produtoId);
    this.isLoading = true;
    this.mensagem = 'Carregando dados do produto...';
    this.tipoMensagem = '';

    this.produtoService.getProduto(this.produtoId).subscribe({
      next: (produto) => {
        console.log('Produto completo recebido da API:', JSON.stringify(produto));
        console.log('Produto recebido da API (objeto):', produto);
        
        if (!produto || typeof produto !== 'object') {
          console.error('Produto retornado pela API é nulo, vazio ou não é um objeto');
          this.mensagem = 'Erro: Produto não encontrado ou dados inválidos.';
          this.tipoMensagem = 'danger';
          this.isLoading = false;
          return;
        }
        
        if (Object.keys(produto).length === 0) {
          console.error('O objeto produto está vazio. Verificando se existem dados na resposta da API.');
          this.mensagem = 'Erro: Objeto produto vazio. Tente novamente.';
          this.tipoMensagem = 'danger';
          this.isLoading = false;
          return;
        }
        
        // Verificar se o produto tem um ID válido
        if (!produto.id) {
          console.error('Produto sem ID válido:', produto);
          this.mensagem = 'Erro: Produto sem identificador válido.';
          this.tipoMensagem = 'danger';
          this.isLoading = false;
          return;
        }
        
        console.log('ID do produto encontrado:', produto.id);
        console.log('Nome do produto:', produto.nome);
        console.log('Preço do produto:', produto.preco);
        
        // Garantir que todos os valores são do tipo correto e converter para os tipos esperados pelo formulário
        const formValues = {
          nome: produto.nome || '',
          observacao: produto.observacao || '',
          preco: typeof produto.preco === 'number' ? produto.preco : 
                (produto.preco ? parseFloat(String(produto.preco)) : 0),
          categoria_id: produto.categoria_id ? produto.categoria_id.toString() : '',
          status: produto.status || 'disponivel',
          estoque_minimo: typeof produto.estoque_minimo === 'number' ? produto.estoque_minimo : 
                         (produto.estoque_minimo ? parseInt(String(produto.estoque_minimo), 10) : 5)
        };
        
        console.log('Valores formatados para o formulário:', formValues);
        
        // Primeiramente, redefina o formulário
        this.produtoForm.reset();
        
        // Aplique os valores ao formulário
        setTimeout(() => {
          this.produtoForm.patchValue(formValues);
          console.log('Valores aplicados ao formulário:', this.produtoForm.value);
          
          // Verifique se os campos estão preenchidos corretamente
          console.log('Campo nome:', this.produtoForm.get('nome')?.value);
          console.log('Campo preço:', this.produtoForm.get('preco')?.value);
          console.log('Campo categoria:', this.produtoForm.get('categoria_id')?.value);
          console.log('Campo status:', this.produtoForm.get('status')?.value);
          console.log('Campo estoque mínimo:', this.produtoForm.get('estoque_minimo')?.value);
          
          this.isLoading = false;
          this.mensagem = 'Produto carregado com sucesso!';
          this.tipoMensagem = 'success';
          
          // Limpar a mensagem após alguns segundos
          setTimeout(() => this.limparMensagem(), 3000);
        }, 500);
      },
      error: (error) => {
        console.error('Erro ao carregar produto:', error);
        this.mensagem = 'Erro ao carregar produto. Tente novamente mais tarde.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    console.log('Form submit - valores atuais:', this.produtoForm.value);
    console.log('Form válido?', this.produtoForm.valid);
    
    if (this.produtoForm.invalid) {
      // Marcar todos os campos como tocados para exibir os erros
      this.produtoForm.markAllAsTouched();
      
      // Listar todos os erros para debugging
      Object.keys(this.produtoForm.controls).forEach(key => {
        const control = this.produtoForm.get(key);
        if (control?.invalid) {
          console.error(`Campo ${key} inválido:`, control.errors);
        }
      });
      
      this.mensagem = 'Por favor, corrija os erros no formulário antes de enviar.';
      this.tipoMensagem = 'danger';
      return;
    }

    this.isLoading = true;
    this.mensagem = this.isEditMode ? 'Atualizando produto...' : 'Criando produto...';
    this.tipoMensagem = 'info';

    // Garantir que os valores estão no formato correto antes de enviar
    const formValues = this.produtoForm.value;
    
    // Preço como número
    if (typeof formValues.preco === 'string') {
      formValues.preco = parseFloat(formValues.preco);
    }
    
    // Estoque mínimo como número
    if (typeof formValues.estoque_minimo === 'string') {
      formValues.estoque_minimo = parseInt(formValues.estoque_minimo, 10);
    }
    
    // Categoria ID como número
    if (typeof formValues.categoria_id === 'string') {
      formValues.categoria_id = parseInt(formValues.categoria_id, 10);
    }
    
    console.log('Valores formatados para envio:', formValues);

    if (this.isEditMode) {
      this.atualizarProduto();
    } else {
      this.criarProduto();
    }
  }

  criarProduto(): void {
    const produtoData = this.produtoForm.value;
    console.log('Dados para criação do produto:', produtoData);
    
    this.produtoService.criarProduto(produtoData).subscribe({
      next: (produtoCriado) => {
        console.log('Produto criado com sucesso:', produtoCriado);
        this.isLoading = false;
        this.mensagem = 'Produto criado com sucesso!';
        this.tipoMensagem = 'success';
        
        // Aguarda 1 segundo antes de redirecionar para que o usuário veja a mensagem de sucesso
        setTimeout(() => {
          this.router.navigate(['/produtos']);
        }, 1000);
      },
      error: (error) => {
        console.error('Erro ao criar produto:', error);
        this.mensagem = 'Erro ao criar produto. Tente novamente.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  atualizarProduto(): void {
    if (!this.produtoId) return;

    const produtoData = this.produtoForm.value;
    console.log('Dados para atualização do produto:', produtoData);
    
    this.produtoService.atualizarProduto(this.produtoId, produtoData).subscribe({
      next: (produtoAtualizado) => {
        console.log('Produto atualizado com sucesso:', produtoAtualizado);
        this.isLoading = false;
        this.mensagem = 'Produto atualizado com sucesso!';
        this.tipoMensagem = 'success';
        
        // Aguarda 1 segundo antes de redirecionar para que o usuário veja a mensagem de sucesso
        setTimeout(() => {
          this.router.navigate(['/produtos']);
        }, 1000);
      },
      error: (error) => {
        console.error('Erro ao atualizar produto:', error);
        this.mensagem = 'Erro ao atualizar produto. Tente novamente.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  limparMensagem(): void {
    this.mensagem = '';
    this.tipoMensagem = '';
  }
} 