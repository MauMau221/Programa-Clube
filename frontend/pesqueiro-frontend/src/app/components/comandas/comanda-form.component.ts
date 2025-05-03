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
      cliente: ['']
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
          cliente: comanda.cliente
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
    const comandaData = this.comandaForm.value;
    this.comandaService.criarComanda(comandaData).subscribe({
      next: (comanda) => {
        this.isLoading = false;
        this.router.navigate(['/comandas', comanda.id]);
      },
      error: (error) => {
        console.error('Erro ao criar comanda:', error);
        this.mensagem = 'Erro ao criar comanda. Tente novamente.';
        this.tipoMensagem = 'danger';
        this.isLoading = false;
      }
    });
  }

  atualizarComanda(): void {
    if (!this.comandaId) return;

    const comandaData = this.comandaForm.value;
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