import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SimpleArticleResponse } from '../../../article/models/article.model';
import { CategoryMesure } from '../../../categorie/models/categorie.enum';
import { Client } from '../../../client/models/client.model';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import { SaleLine, SaleQuantityChange,  SaleQuantityStep, VenteRequest } from '../../models/vente.model';
import { ModePaiement } from '../../../shared/model/util.enum';
import { DependencyService } from '../../../shared/utils/dependency';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-add-vente-cart',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-vente-cart.html',
  styleUrl: './add-vente-cart.css',
})
export class AddVenteCart implements OnChanges, OnInit {
  @Input({ required: true }) lines: SaleLine[] = [];

  private readonly dependency = inject(DependencyService);
  private readonly destroyRef = inject(DestroyRef);
  readonly user = getUserFromSessionStorage();

  form!: FormGroup;
  readonly paymentOptions = EnumMethodes.getEnumeratedKeyValue(ModePaiement);
  readonly clients = signal<Client[]>([]);
  readonly clientError = signal('');
  readonly error = signal('');
  readonly submitting = signal(false);

  @Output() clear = new EventEmitter<void>();
  @Output() remove = new EventEmitter<number>();
  @Output() quantityChange = new EventEmitter<SaleQuantityChange>();
  @Output() quantityStep = new EventEmitter<SaleQuantityStep>();

  ngOnInit(): void {
    this.loadForm();
    this.loadClients();
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.error.set('');
    });

    this.form.controls['modePaiement'].valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(mode => {
        const amount = this.form.controls['montantPaye'];
        if (mode === 'CREDIT') {
          amount.setValue(0, { emitEvent: false });
        } else if (!amount.dirty || Number(amount.value) === 0) {
          amount.setValue(this.total, { emitEvent: false });
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['lines'] || !this.form) return;
    const amount = this.form.controls['montantPaye'];
    if (this.form.controls['modePaiement'].value === 'CREDIT') {
      amount.setValue(0, { emitEvent: false });
    } else if (!amount.dirty) {
      amount.setValue(this.total, { emitEvent: false });
    }
  }

  loadForm(): void {
    this.form = this.dependency.fb.nonNullable.group({
      clientMode: ['passage'],
      clientId: [null],
      clientNom: [''],
      modePaiement: ['CASH', Validators.required],
      montantPaye: [this.total],
    });
  }

  loadClients(): void {
    if (!this.user?.id) {
      this.clientError.set('Reconnectez-vous pour charger les clients.');
      return;
    }

    this.clientError.set('');
    this.dependency.clientService.loadClients(this.user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: clients => this.clients.set(clients ?? []),
        error: () => this.clientError.set('Impossible de charger les clients.'),
      });
  }

  get total(): number {
    return this.lines.reduce(
      (sum, line) => sum + this.lineTotal(line),
      0,
    );
  }

  attributeLabel(line: SaleLine, key: string): string {
    return line.attributes.find(attribute => attribute.id === Number(key))?.label ?? '';
  }

  remainingAmount(): number {
    const amount = Number(this.form?.controls['montantPaye']?.value ?? 0);
    if (!Number.isFinite(amount)) return this.total;
    return Math.max(0, this.total - amount);
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.error.set('');

    if (!this.lines.length) {
      this.error.set('Ajoutez au moins une variante au panier.');
      return;
    }

    if (!this.user?.id) {
      this.error.set('Reconnectez-vous pour enregistrer la vente.');
      return;
    }

    if (!this.validateClient() || this.form.invalid) {
      this.error.set('Complétez les informations de la vente.');
      return;
    }

    const value = this.form.getRawValue();
    const montantPaye = value.modePaiement === 'CREDIT'
      ? 0
      : Number(value.montantPaye);

    if (!Number.isFinite(montantPaye) || montantPaye < 0 || montantPaye > this.total) {
      this.error.set('Le montant payé doit être compris entre zéro et le total.');
      return;
    }

    this.submitting.set(true);
    const request: VenteRequest = {
      date: this.localDate(),
      modePaiement: value.modePaiement,
      montantPaye,
      clientId: value.clientMode === 'existant' ? Number(value.clientId) : undefined,
      clientNom: value.clientMode === 'passage'
        ? value.clientNom.trim() || undefined
        : undefined,
      lignes: this.lines.map(line => ({
        variantId: line.variant.id,
        quantite: line.quantite,
        prixVente: line.prixVente,
      })),
    };

    this.dependency.venteService.addVente(this.user.id, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.submitting.set(false);
          this.dependency.responseService.showSuccessToast(
            response?.message ?? 'Vente enregistrée avec succès.',
          );
          this.clear.emit();
        },
        error: error => {
          this.submitting.set(false);
          const message = error?.error?.message ?? 'Impossible d’enregistrer la vente.';
          this.error.set(message);
          this.dependency.responseService.showErrorToast(message);
        },
      });
  }

  private validateClient(): boolean {
    const clientMode = this.form.controls['clientMode'].value;
    const clientId = Number(this.form.controls['clientId'].value);

    if (clientMode !== 'existant') {
      this.form.controls['clientId'].setErrors(null);
      return true;
    }

    if (clientId > 0) {
      this.form.controls['clientId'].setErrors(null);
      return true;
    }

    this.form.controls['clientId'].setErrors({ required: true });
    return false;
  }

  private localDate(): string {
    const today = new Date();
    return [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
  }

  unit(article: SimpleArticleResponse): string {
    return EnumMethodes.getEnumValueByKey(CategoryMesure, article.categoryMesure)
      ?? article.categoryMesure
      ?? '';
  }

  articleLabel(article: SimpleArticleResponse): string {
    return [article.categoryNom || article.nom, article.typeNom]
      .filter(Boolean)
      .join(' — ');
  }

  lineTotal(line: SaleLine): number {
    return Math.round((line.quantite * line.prixVente + Number.EPSILON) * 100) / 100;
  }

  onQuantityChange(line: SaleLine, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.quantityChange.emit({ line, value: input.value });
  }

  increaseOrDecrease(line: SaleLine, delta: number): void {
    this.quantityStep.emit({ line, delta });
  }
}
