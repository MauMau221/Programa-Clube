import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ComandaService } from '../../services/comanda.service';
import { Comanda } from '../../models/comanda.model';

@Component({
  selector: 'app-comanda-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './comanda-form.component.html',
  styleUrls: ['./comanda-form.component.scss']
})
export class ComandaFormComponent implements OnInit {
  comandaForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  comandaId?: number;
  mensagem = '';
  tipoMensagem: 'success' | 'danger' | '' = '';

  constructor(
    private fb: FormBuilder,
    private comandaService: ComandaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.comandaForm = this.fb.group({
      mesa: ['', [Validators.required]],
      cliente: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.comandaId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.comandaId;

    if (this.isEditMode) {
      this.carregarComanda();
    }
  }

  carregarComanda(): void {
    if (!this.comandaId) return;

    this.isLoading = true;
    this.comandaService.getComanda(this.comandaId).subscribe({
      next: (comanda) => {
        this.comandaForm.patchValue({
          mesa: comanda.mesa,
          cliente: comanda.cliente,
          total: comanda.total,
          status: comanda.status
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar comanda:', error);
        this.mensagem = 'Erro ao carregar comanda. Tente novamente mais tarde.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.comandaForm.invalid) {
      this.comandaForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    if (this.isEditMode) {
      this.atualizarComanda();
    } else {
      this.criarComanda();
    }
  }

  criarComanda(): void {
    const formData = this.comandaForm.value;
    
    const comandaData = {
      mesa: String(formData.mesa),  // Garantir que a mesa seja uma string
      cliente: formData.cliente,
      total: 0  // Valor inicial zero para novas comandas
    };
    
    console.log('Enviando dados da comanda:', comandaData);
    
    this.comandaService.criarComanda(comandaData).subscribe({
      next: (comanda) => {
        console.log('Comanda criada com sucesso:', comanda);
        this.isLoading = false;
        this.router.navigate(['/comandas', comanda.id]);
      },
      error: (error) => {
        console.error('Erro detalhado ao criar comanda:', error);
        let mensagemErro = 'Erro ao criar comanda.';
        
        if (error.error && typeof error.error === 'object') {
          // Extrair mensagens de erro do objeto de resposta
          const mensagens = [];
          for (const campo in error.error.errors) {
            if (error.error.errors[campo]) {
              mensagens.push(error.error.errors[campo][0]);
            }
          }
          if (mensagens.length > 0) {
            mensagemErro = `${mensagemErro} ${mensagens.join(' ')}`;
          }
        } else if (error.message) {
          mensagemErro = `${mensagemErro} ${error.message}`;
        }
        
        this.mensagem = mensagemErro;
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  atualizarComanda(): void {
    if (!this.comandaId) return;

    const formData = this.comandaForm.value;
    
    const comandaData = {
      mesa: String(formData.mesa),  // Garantir que a mesa seja uma string
      cliente: formData.cliente,
      total: formData.total || 0
    };
    
    this.comandaService.atualizarComanda(this.comandaId, comandaData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/comandas']);
      },
      error: (error) => {
        console.error('Erro ao atualizar comanda:', error);
        this.mensagem = 'Erro ao atualizar comanda. Tente novamente.';
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