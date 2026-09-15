import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ArticleAttributeDto, ArticleContextDto, ArticleVariantDto } from '../../models/article.model';
import { DependencyService } from '../../../shared/utils/dependency';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';

@Component({
  selector: 'app-article-variants',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FloatingBackButton],
  templateUrl: './article-variants.html',
  styleUrl: './article-variants.css'
})
export class ArticleVariants implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly dependency = inject(DependencyService);
  private readonly fb = inject(FormBuilder);

  readonly user = getUserFromSessionStorage();
  readonly context = signal<ArticleContextDto | null>(null);
  readonly variants = signal<ArticleVariantDto[]>([]);
  readonly attributes = signal<ArticleAttributeDto[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly editingVariantId = signal<number | null>(null);
  variantForm = this.fb.group({
    reference: ['', [Validators.required, Validators.maxLength(60)]],
    prixVente: [null as number | null, [Validators.required, Validators.min(1)]],
    attributs: this.fb.group({})
  });
  private articleId = 0;

  ngOnInit(): void {
    this.articleId = Number(this.route.snapshot.paramMap.get('articleId'));
    this.variantForm.valueChanges.subscribe(() => this.generateReference());
    this.loadContext();
  }

  saveVariant(): void {
    this.variantForm.markAllAsTouched();
    if (this.variantForm.invalid || !this.user?.id || !this.articleId) return;
    this.submitting.set(true);
    const value = this.variantForm.getRawValue();
    const attributs: Record<number, string> = {};
    Object.entries(value.attributs ?? {}).forEach(([id, item]) => {
      if (item !== null && String(item).trim()) attributs[Number(id)] = String(item).trim();
    });
    const request = {
      reference: value.reference ?? '', prixVente: Number(value.prixVente), attributs
    };
    const request$ = this.editingVariantId()
      ? this.dependency.articleService.updateArticleVariant(this.editingVariantId()!, request, this.user.id)
      : this.dependency.articleService.addArticleVariant(this.articleId, request, this.user.id);
    request$.subscribe({
      next: result => {
        this.dependency.responseService.showSuccessToast(result?.message ?? 'Variante enregistrée avec succès.');
        this.editingVariantId.set(null);
        this.resetForm();
        this.loadVariants();
      },
      error: error => this.dependency.responseService.showErrorToast(error?.error?.message ?? 'Impossible d’ajouter la variante.'),
      complete: () => this.submitting.set(false)
    });
  }

  editVariant(variant: ArticleVariantDto): void {
    this.editingVariantId.set(variant.id);
    this.variantForm.patchValue({
      reference: variant.reference,
      prixVente: variant.prixVente,
      attributs: Object.fromEntries(
        Object.entries(variant.attributs ?? {}).map(([id, value]) => [id, value])
      )
    });
  }

  cancelEdit(): void {
    this.editingVariantId.set(null);
    this.resetForm();
  }

  private loadContext(): void {
    if (!this.user?.id || !this.articleId) { this.loading.set(false); return; }
    this.dependency.articleService.loadArticleContext(this.articleId, this.user.id).subscribe({
      next: context => {
        this.context.set(context);
        this.attributes.set(context.attributes ?? []);
        const controls: Record<string, any> = {};
        for (const attribute of context.attributes ?? []) controls[attribute.id] = [''];
        this.variantForm.setControl('attributs', this.fb.group(controls));
        this.generateReference();
        this.loadVariants();
      },
      error: error => {
        this.loading.set(false);
        this.dependency.responseService.showErrorToast(error?.error?.message ?? 'Impossible de charger l’article.');
      }
    });
  }

  private loadVariants(): void {
    if (!this.user?.id) return;
    this.dependency.articleService.loadArticleVariants(this.articleId, this.user.id).subscribe({
      next: variants => { this.variants.set(variants ?? []); this.loading.set(false); },
      error: error => { this.loading.set(false); this.dependency.responseService.showErrorToast(error?.error?.message ?? 'Impossible de charger les variantes.'); }
    });
  }

  private generateReference(): void {
    const article = this.context();
    if (!article) return;
    const values = Object.values(this.variantForm.controls.attributs.getRawValue() ?? {})
      .filter(value => value !== null && String(value).trim())
      .map(value => String(value).trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-'));
    const base = `${article.categoryNom}-${article.typeNom}`.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
    this.variantForm.controls.reference.setValue(
      [base, ...values].join('-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
      { emitEvent: false }
    );
  }

  private resetForm(): void {
    this.variantForm.controls.prixVente.reset();
    this.variantForm.controls.attributs.reset();
    this.generateReference();
  }

  typeLabel(type: string): string {
    return ({ TEXT: 'Texte', NUMBER: 'Nombre', SELECT: 'Liste', DATE: 'Date' } as Record<string, string>)[type] ?? type;
  }
}

