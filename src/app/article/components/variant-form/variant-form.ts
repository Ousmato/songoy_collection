import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ArticleAttributeDto, ArticleVariantDto, ArticleVariantRequestDto } from '../../models/article.model';

@Component({
  selector: 'app-variant-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './variant-form.html',
  styleUrl: './variant-form.css',
})
export class VariantFormComponent implements OnChanges, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private attributeValueSubscription?: Subscription;

  @Input() attributes: ArticleAttributeDto[] = [];
  @Input() referenceParts: string[] = [];
  @Input() variant: ArticleVariantDto | null = null;
  @Input() saving = false;
  @Input() blocked = false;
  @Input() resetKey = 0;
  @Output() save = new EventEmitter<ArticleVariantRequestDto>();
  @Output() cancel = new EventEmitter<void>();

  readonly form: FormGroup = this.fb.group({
    reference: ['', [Validators.required, Validators.maxLength(255)]],
    prixVente: [null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
    attributs: this.fb.group({}),
  });

  ngOnDestroy(): void {
    this.attributeValueSubscription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['attributes']) this.buildAttributeControls();
    if (changes['variant'] || changes['attributes'] || (changes['resetKey'] && !changes['resetKey'].firstChange)) {
      this.populateForm();
    } else if (changes['referenceParts']) this.refreshGeneratedReference();
  }

  control(attributeId: number) {
    return this.form.get(`attributs.${attributeId}`);
  }

  inputType(type: string): 'text' | 'number' | 'date' {
    if (type === 'NUMBER') return 'number';
    if (type === 'DATE') return 'date';
    return 'text';
  }

  refreshGeneratedReference(): string {
    const rawValues = this.form.get('attributs')?.getRawValue() as Record<string, unknown> | undefined;
    const parts = [
      ...(this.referenceParts ?? []),
      ...(this.attributes ?? []).map(attribute => rawValues?.[attribute.id]),
    ].map(value => this.referencePart(value)).filter(Boolean);
    const reference = parts.join('-').replace(/-+/g, '-').slice(0, 255);
    this.form.controls['reference'].setValue(reference, { emitEvent: false });
    return reference;
  }

  submit(): void {
    this.refreshGeneratedReference();
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving || this.blocked) return;

    const value = this.form.getRawValue();
    const prixVente = Number(value.prixVente);
    const reference = String(value.reference ?? '').trim();
    if (!reference || !Number.isInteger(prixVente) || prixVente <= 0) return;

    const rawValues = this.form.get('attributs')?.getRawValue() as Record<string, unknown>;
    const attributs: Record<number, string> = {};
    Object.entries(rawValues ?? {}).forEach(([attributeId, attributeValue]) => {
      const normalized = String(attributeValue ?? '').trim();
      if (normalized) attributs[Number(attributeId)] = normalized;
    });

    this.save.emit({ reference, prixVente, attributs });
  }

  private buildAttributeControls(): void {
    const controls: Record<string, FormControl<string | null>> = {};
    for (const attribute of this.attributes ?? []) {
      controls[String(attribute.id)] = new FormControl(
        '', attribute.obligatoire ? Validators.required : []
      );
    }
    const attributs = new FormGroup(controls);
    this.form.setControl('attributs', attributs);
    this.attributeValueSubscription?.unsubscribe();
    this.attributeValueSubscription = attributs.valueChanges.subscribe(() => this.refreshGeneratedReference());
  }

  private populateForm(): void {
    const variant = this.variant;
    this.form.controls['prixVente'].setValue(variant?.prixVente ?? null, { emitEvent: false });

    const attributs = this.form.get('attributs') as FormGroup;
    for (const attribute of this.attributes ?? []) {
      attributs.get(String(attribute.id))?.setValue(variant?.attributs?.[attribute.id] ?? '', { emitEvent: false });
    }
    this.refreshGeneratedReference();
  }

  private referencePart(value: unknown): string {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
