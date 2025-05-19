import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ComandaService } from '../../services/comanda.service';
import { Comanda } from '../../models/comanda.model';

@Component({
  selector: 'app-comandas-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './comandas-list.component.html',
  styleUrls: ['./comandas-list.component.scss']
})
export class ComandasListComponent implements OnInit {
  comandas: Comanda[] = [];
  filtroStatus: string = 'todas';
  isLoading: boolean = false;
  mensagem: string = '';
  tipoMensagem: 'success' | 'danger' | 'info' | '' = '';

  constructor(private comandaService: ComandaService) { }

  ngOnInit(): void {
    this.carregarComandas();
  }

  carregarComandas(): void {
    this.isLoading = true;
    this.comandaService.getComandas().subscribe({
      next: (comandas) => {
        this.comandas = comandas;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar comandas:', error);
        this.mensagem = 'Erro ao carregar comandas. Tente novamente mais tarde.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  fecharComanda(id: number): void {
    if (confirm('Tem certeza que deseja fechar esta comanda?')) {
      this.isLoading = true;
      this.comandaService.fecharComanda(id).subscribe({
        next: () => {
          this.mensagem = 'Comanda fechada com sucesso!';
          this.tipoMensagem = 'success';
          this.carregarComandas();
        },
        error: (error) => {
          console.error('Erro ao fechar comanda:', error);
          this.mensagem = 'Erro ao fechar comanda. Tente novamente.';
          this.tipoMensagem = 'danger';
          this.isLoading = false;
        }
      });
    }
  }

  cancelarComanda(id: number): void {
    if (confirm('Tem certeza que deseja cancelar esta comanda?')) {
      this.isLoading = true;
      this.comandaService.cancelarComanda(id).subscribe({
        next: () => {
          this.mensagem = 'Comanda cancelada com sucesso!';
          this.tipoMensagem = 'success';
          this.carregarComandas();
        },
        error: (error) => {
          console.error('Erro ao cancelar comanda:', error);
          this.mensagem = 'Erro ao cancelar comanda. Tente novamente.';
          this.tipoMensagem = 'danger';
          this.isLoading = false;
        }
      });
    }
  }

  get comandasFiltradas(): Comanda[] {
    if (this.filtroStatus === 'todas') {
      return this.comandas;
    }
    return this.comandas.filter(comanda => comanda.status === this.filtroStatus);
  }

  limparMensagem(): void {
    this.mensagem = '';
    this.tipoMensagem = '';
  }

  // Método para obter classes CSS baseadas no status da comanda
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'aberta': return 'status-aberta';
      case 'fechada': return 'status-fechada';
      case 'cancelada': return 'status-cancelada';
      case 'paga': return 'status-paga';
      default: return '';
    }
  }
} 