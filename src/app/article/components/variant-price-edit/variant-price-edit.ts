import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticleVariantDto } from '../../models/article.model';

export interface VariantPriceUpdate {
  variantId: number;
  prixVente: number;
}

@Component({
  selector: 'app-variant-price-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './variant-price-edit.html',
  styleUrl: './variant-price-edit.css',
})
export class VariantPriceEditComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input({ required: true }) variant!: ArticleVariantDto;
  @Input() saving = false;
  @Output() save = new EventEmitter<VariantPriceUpdate>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = this.fb.group({
    prixVente: [null as number | null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['variant'] && this.variant) {
      this.form.reset({ prixVente: this.variant.prixVente });
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving || !this.variant?.id) return;

    const prixVente = Number(this.form.getRawValue().prixVente);
    if (!Number.isInteger(prixVente) || prixVente <= 0) return;
    this.save.emit({ variantId: this.variant.id, prixVente });
  }
}
