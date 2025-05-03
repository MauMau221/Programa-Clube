import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/comanda.model';

@Component({
  selector: 'app-categorias-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './categorias-list.component.html',
  styleUrls: ['./categorias-list.component.scss']
})
export class CategoriasListComponent implements OnInit {
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  isLoading = false;
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | '' = '';
  termoBusca = '';

  constructor(private categoriaService: CategoriaService) { }

  ngOnInit(): void {
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.isLoading = true;
    this.categoriaService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.aplicarFiltros();
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

  aplicarFiltros(): void {
    if (!this.termoBusca) {
      this.categoriasFiltradas = [...this.categorias];
      return;
    }
    
    const termo = this.termoBusca.toLowerCase();
    this.categoriasFiltradas = this.categorias.filter(
      c => c.nome.toLowerCase().includes(termo) || 
           c.status.toLowerCase().includes(termo)
    );
  }

  excluirCategoria(id: number): void {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
      return;
    }
    
    this.isLoading = true;
    this.categoriaService.excluirCategoria(id).subscribe({
      next: () => {
        this.categorias = this.categorias.filter(c => c.id !== id);
        this.aplicarFiltros();
        this.mensagem = 'Categoria excluída com sucesso!';
        this.tipoMensagem = 'success';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao excluir categoria:', error);
        this.mensagem = 'Erro ao excluir categoria. Verifique se não existem produtos vinculados a ela.';
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