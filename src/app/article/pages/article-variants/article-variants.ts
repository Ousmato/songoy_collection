import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ArticleAttributeDto, ArticleContextDto, ArticleVariantDto } from '../../models/article.model';
import { DependencyService } from '../../../shared/utils/dependency';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { HeicConvertService } from '../../../shared/service/heic-covert.service';
import { resolveImageUrl } from '../../../shared/utils/image-url.util';

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
  private readonly imageProcessor = inject(HeicConvertService);

  readonly user = getUserFromSessionStorage();
  readonly context = signal<ArticleContextDto | null>(null);
  readonly variants = signal<ArticleVariantDto[]>([]);
  readonly attributes = signal<ArticleAttributeDto[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly processingImage = signal(false);
  readonly imageFile = signal<File | null>(null);
  readonly imagePreviewUrl = signal<string | null>(null);
  readonly originalImageUrl = signal<string | null>(null);
  readonly imageError = signal<string | null>(null);
  readonly editingVariantId = signal<number | null>(null);
  variantForm = this.fb.group({
    reference: ['', [Validators.required, Validators.maxLength(60)]],
    prixVente: [null as number | null, [Validators.required, Validators.min(1)]],
    attributs: this.fb.group({})
  });
  private articleId = 0;

  ngOnInit(): void {
    this.articleId = Number(this.route.snapshot.paramMap.get('articleId'));
    this.log('Initialisation de la page', {
      articleId: this.articleId,
      adminId: this.user?.id,
    });
    this.variantForm.valueChanges.subscribe(value => {
      this.log('valueChanges du formulaire', value);
      this.generateReference();
    });
    this.loadContext();
  }

  saveVariant(): void {
    this.variantForm.markAllAsTouched();
    if (this.variantForm.invalid || this.processingImage() || !this.user?.id || !this.articleId) {
      this.log('Enregistrement bloqué', {
        formInvalid: this.variantForm.invalid,
        processingImage: this.processingImage(),
        adminId: this.user?.id,
        articleId: this.articleId,
        formValue: this.variantForm.getRawValue(),
      });
      return;
    }
    this.submitting.set(true);
    const value = this.variantForm.getRawValue();
    const attributs: Record<number, string> = {};
    Object.entries(value.attributs ?? {}).forEach(([id, item]) => {
      if (item !== null && String(item).trim()) attributs[Number(id)] = String(item).trim();
    });
    const request = {
      reference: value.reference ?? '',
      prixVente: Number(value.prixVente),
      attributs,
      image: this.imageFile(),
    };
    this.log('Envoi de la variante', {
      articleId: this.articleId,
      editingVariantId: this.editingVariantId(),
      formValue: value,
      request: {
        ...request,
        image: request.image
          ? { name: request.image.name, type: request.image.type, size: request.image.size }
          : null,
      },
    });
    const request$ = this.editingVariantId()
      ? this.dependency.articleService.updateArticleVariant(this.editingVariantId()!, request, this.user.id)
      : this.dependency.articleService.addArticleVariant(this.articleId, request, this.user.id);
    request$.subscribe({
      next: result => {
        this.log('Réponse API après enregistrement', result);
        this.dependency.responseService.showSuccessToast(result?.message ?? 'Variante enregistrée avec succès.');
        this.editingVariantId.set(null);
        this.resetForm();
        this.loadVariants();
      },
      error: error => {
        this.log('Erreur API lors de l’enregistrement', error);
        this.submitting.set(false);
        this.dependency.responseService.showErrorToast(error?.error?.message ?? 'Impossible d’enregistrer la variante.');
      },
      complete: () => this.submitting.set(false)
    });
  }

  editVariant(variant: ArticleVariantDto): void {
    this.log('Clic sur modifier', {
      variant,
      variantSnapshot: this.variantSnapshot(variant),
    });
    this.editingVariantId.set(variant.id);
    this.imageFile.set(null);
    const imageUrl = this.displayImageUrl(variant.urlImage);
    this.originalImageUrl.set(imageUrl);
    this.imagePreviewUrl.set(imageUrl);
    this.imageError.set(null);
    this.variantForm.patchValue({
      reference: variant.reference,
      prixVente: variant.prixVente,
      attributs: Object.fromEntries(
        Object.entries(variant.attributs ?? {}).map(([id, value]) => [id, value])
      )
    });
    this.log('Formulaire après patch de la variante', {
      editingVariantId: this.editingVariantId(),
      formValue: this.variantForm.getRawValue(),
    });
  }

  cancelEdit(): void {
    this.log('Annulation de la modification', {
      editingVariantId: this.editingVariantId(),
      formValue: this.variantForm.getRawValue(),
    });
    this.editingVariantId.set(null);
    this.resetForm();
  }

  async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.log('Image sélectionnée', {
      name: file.name,
      type: file.type,
      size: file.size,
      editingVariantId: this.editingVariantId(),
    });

    this.imageError.set(null);
    const isImage = file.type.startsWith('image/') || this.imageProcessor.isHeic(file);
    if (!isImage) {
      this.imageError.set('Sélectionnez un fichier image valide.');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.imageError.set('L’image ne doit pas dépasser 5 Mo.');
      input.value = '';
      return;
    }

    this.processingImage.set(true);
    try {
      const result = await this.imageProcessor.processFileForPreview(file, {
        toType: 'image/jpeg',
        quality: 0.82,
        maxWidth: 1600,
        maxHeight: 1600,
      });
      this.log('Image préparée', {
        name: result.file.name,
        type: result.file.type,
        size: result.file.size,
      });
      this.imageFile.set(result.file);
      this.imagePreviewUrl.set(result.url);
    } catch (error) {
      this.log('Erreur de préparation de l’image', error);
      this.imageError.set('Impossible de préparer cette image.');
      input.value = '';
    } finally {
      this.processingImage.set(false);
    }
  }

  removeImage(input?: HTMLInputElement): void {
    this.log('Suppression de la sélection image', {
      editingVariantId: this.editingVariantId(),
      originalImageUrl: this.originalImageUrl(),
    });
    this.imageFile.set(null);
    this.imagePreviewUrl.set(this.editingVariantId() ? this.originalImageUrl() : null);
    this.imageError.set(null);
    if (input) input.value = '';
  }

  private loadContext(): void {
    if (!this.user?.id || !this.articleId) { this.loading.set(false); return; }
    this.dependency.articleService.loadArticleContext(this.articleId, this.user.id).subscribe({
      next: context => {
        this.log('Contexte article reçu', context);
        this.context.set(context);
        this.attributes.set(context.attributes ?? []);
        const controls: Record<string, any> = {};
        for (const attribute of context.attributes ?? []) controls[attribute.id] = [''];
        this.variantForm.setControl('attributs', this.fb.group(controls));
        this.generateReference();
        this.loadVariants();
      },
      error: error => {
        this.log('Erreur API du contexte article', error);
        this.loading.set(false);
        this.dependency.responseService.showErrorToast(error?.error?.message ?? 'Impossible de charger l’article.');
      }
    });
  }

  private loadVariants(): void {
    if (!this.user?.id) return;
    this.dependency.articleService.loadArticleVariants(this.articleId, this.user.id).subscribe({
      next: variants => {
        this.log('Variantes reçues de l’API', {
          count: variants?.length ?? 0,
          variants: (variants ?? []).map(variant => this.variantSnapshot(variant)),
        });
        this.variants.set(variants ?? []);
        this.loading.set(false);
      },
      error: error => {
        this.log('Erreur API des variantes', error);
        this.loading.set(false);
        this.dependency.responseService.showErrorToast(error?.error?.message ?? 'Impossible de charger les variantes.');
      }
    });
  }

  private generateReference(): void {
    const article = this.context();
    if (!article) return;
    const values = Object.values(this.variantForm.controls.attributs.getRawValue() ?? {})
      .filter(value => value !== null && String(value).trim())
      .map(value => String(value).trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-'));
    const base = `${article.categoryNom}-${article.typeNom}`.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
    const generatedReference = [base, ...values].join('-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    this.log('Référence régénérée', {
      editingVariantId: this.editingVariantId(),
      currentReference: this.variantForm.controls.reference.value,
      attributeValues: this.variantForm.controls.attributs.getRawValue(),
      normalizedValues: values,
      generatedReference,
    });
    this.variantForm.controls.reference.setValue(
      generatedReference,
      { emitEvent: false }
    );
  }

  private variantSnapshot(variant: ArticleVariantDto): object {
    return {
      id: variant.id,
      reference: variant.reference,
      prixVente: variant.prixVente,
      attributs: { ...(variant.attributs ?? {}) },
      urlImage: variant.urlImage ?? null,
    };
  }

  private log(message: string, data?: unknown): void {
    console.log(`[ArticleVariants] ${message}`, data ?? '');
  }

  private resetForm(): void {
    this.variantForm.controls.prixVente.reset();
    this.variantForm.controls.attributs.reset();
    this.removeImage();
    this.originalImageUrl.set(null);
    this.generateReference();
  }

  typeLabel(type: string): string {
    return ({ TEXT: 'Texte', NUMBER: 'Nombre', SELECT: 'Liste', DATE: 'Date' } as Record<string, string>)[type] ?? type;
  }

  displayImageUrl(value?: string | null): string | null {
    return resolveImageUrl(value, 'article-variants');
  }
}
