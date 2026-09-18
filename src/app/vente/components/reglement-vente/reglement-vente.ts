import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, Output, inject, signal} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { ReglementRequest } from '../../../achat/models/achat.dto';
import { ModePaiement, ModePaiementKey } from '../../../shared/model/util.enum';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import { VenteService } from '../../services/vente.service';

@Component({
  selector: 'app-reglement-vente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reglement-vente.html',
  styleUrl: './reglement-vente.css',
})
export class ReglementVente {
  @Input({ required: true }) venteId!: number;
  @Input({ required: true }) resteAPayer = 0;

  @Output() saved = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder);
  private readonly venteService = inject(VenteService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly user = getUserFromSessionStorage();

  readonly paymentModes = EnumMethodes
    .getEnumeratedKeyValue(ModePaiement)
    .filter(mode => mode.key !== 'CREDIT');
  readonly form = this.formBuilder.nonNullable.group({
    montant: [1000, [Validators.required, Validators.min(0.01)]],
    modePaiement: ['CASH' as ModePaiementKey, Validators.required],
    date: [this.localDateTime(), Validators.required],
  });
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly modalOpen = signal(false);

  openModal(): void {
    this.error.set('');
    this.success.set('');
    this.modalOpen.set(true);
  }

  closeModal(): void {
    if (!this.submitting()) {
      this.modalOpen.set(false);
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.error.set('');
    this.success.set('');

    const montant = Number(this.form.controls.montant.value);
    if (this.form.invalid || !Number.isFinite(montant)) {
      return;
    }

    if (this.resteAPayer <= 0) {
      this.error.set('Cette vente est déjà entièrement réglée.');
      return;
    }

    if (montant > this.resteAPayer) {
      this.error.set('Le montant dépasse le reste à payer.');
      return;
    }

    if (!this.user?.id) {
      this.error.set('Votre session a expiré. Reconnectez-vous.');
      return;
    }

    const value = this.form.getRawValue();
    const request: ReglementRequest = {
      montant,
      modePaiement: value.modePaiement,
      date: value.date.length === 16 ? `${value.date}` : value.date,
    };

    this.submitting.set(true);
    this.venteService
      .createReglementVente(this.venteId, this.user.id, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: response => {
          this.success.set(
            `Règlement de ${Number(response.montant).toLocaleString('fr-FR')} FCFA enregistré.`,
          );
          this.form.reset({
            montant: 0,
            modePaiement: 'CASH',
            date: this.localDateTime(),
          });
          this.modalOpen.set(false);
          this.saved.emit();
        },
        error: response => {
          this.error.set(
            response?.error?.message || 'Le règlement n’a pas pu être enregistré.',
          );
        },
    });
  }

  amountExceedsRemaining(): boolean {
    const amount = Number(this.form.controls.montant.value);
    return this.form.controls.montant.touched
      && Number.isFinite(amount)
      && amount > this.resteAPayer;
  }

  private localDateTime(): string {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
      + `T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

}
