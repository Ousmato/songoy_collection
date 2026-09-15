import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import {
  AchatHistoriqueDetailDto,
  ReglementRequest,
} from '../../models/achat.dto';
import { ReceptionService } from '../../services/reception.service';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import { CategoryMesure } from '../../../categorie/models/categorie.enum';
import { Entite } from '../../../admin/model/admin.enum';
import {
  ModePaiement,
  ModePaiementKey,
} from '../../../shared/model/util.enum';

@Component({
  selector: 'app-detail-achat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FloatingBackButton],
  templateUrl: './detail-achat.html',
  styleUrl: './detail-achat.css',
})
export class DetailAchat implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly receptionService = inject(ReceptionService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly user = getUserFromSessionStorage();

  readonly achat = signal<AchatHistoriqueDetailDto | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly paying = signal(false);
  readonly paymentError = signal('');
  readonly paymentSuccess = signal('');

  readonly paymentModes = EnumMethodes.getEnumeratedKeyValue(ModePaiement);

  readonly paymentForm = this.formBuilder.nonNullable.group({
    montant: [0, [Validators.required, Validators.min(0.01)]],
    modePaiement: ['CASH' as ModePaiementKey, Validators.required],
    date: [this.localDateTime(), Validators.required],
  });

  ngOnInit(): void {
    this.loadDetail();
  }

  loadDetail(): void {
    const achatId = Number(this.route.snapshot.paramMap.get('achatId'));
    const adminId = this.user?.id;

    if (!adminId || !Number.isInteger(achatId) || achatId <= 0) {
      this.error.set('La réception demandée est introuvable.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.receptionService.loadHistoriqueDetail(achatId, adminId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: detail => this.achat.set(detail),
        error: () => this.error.set(
          'Impossible de charger le détail de cette réception.',
        ),
      });
  }

  submitPayment(reception: AchatHistoriqueDetailDto): void {
    this.paymentForm.markAllAsTouched();
    this.paymentError.set('');
    this.paymentSuccess.set('');

    if (this.paymentForm.invalid || reception.resteAPayer <= 0) {
      return;
    }

    const value = this.paymentForm.getRawValue();
    if (value.montant > reception.resteAPayer) {
      this.paymentError.set('Le montant dépasse le reste à payer.');
      return;
    }

    const adminId = this.user?.id;
    if (!adminId) {
      this.paymentError.set('Votre session a expiré. Reconnectez-vous.');
      return;
    }

    const request: ReglementRequest = {
      montant: value.montant,
      modePaiement: value.modePaiement,
      date: value.date.length === 16 ? `${value.date}:00` : value.date,
    };

    this.paying.set(true);
    this.receptionService.createReglementAchat(
      reception.id,
      adminId,
      request,
    )
      .pipe(finalize(() => this.paying.set(false)))
      .subscribe({
        next: response => {
          this.paymentSuccess.set(
            `Règlement de ${response.montant.toLocaleString('fr-FR')} FCFA enregistré.`,
          );
          this.paymentForm.reset({
            montant: 0,
            modePaiement: 'CASH',
            date: this.localDateTime(),
          });
          this.loadDetail();
        },
        error: error => this.paymentError.set(
          error?.error?.message || 'Le règlement n’a pas pu être enregistré.',
        ),
      });
  }

  formatPaymentMode(value: unknown): string {
   return EnumMethodes.getEnumValueByKey(ModePaiement, value as any)!
  }

  formatUnit(value: unknown): string {
    return EnumMethodes.getEnumValueByKey(CategoryMesure, value as any) as string
  }

  formatEntity(value: unknown): string {
   return EnumMethodes.getEnumValueByKey(Entite, value as any)!
  }

  private localDateTime(): string {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
      + `T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
}
