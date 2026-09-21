import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ArticleAttributeDto,
  ArticleContextDto,
  ArticleVariantDto,
  ArticleVariantPriceUpdateRequestDto,
  ArticleVariantRequestDto,
  DeclinaisonDto,
  DeclinaisonRequestDto,
  ModeleArticleDto,
  ModeleArticleRequestDto,
} from '../../models/article.model';
import { DependencyService } from '../../../shared/utils/dependency';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { resolveImageUrl } from '../../../shared/utils/image-url.util';
import { ModeleArticleFormComponent } from '../../components/modele-article-form/modele-article-form';
import { DeclinaisonFormComponent, DeclinaisonSubmission } from '../../components/declinaison-form/declinaison-form';
import { VariantFormComponent } from '../../components/variant-form/variant-form';
import { VariantPriceEditComponent, VariantPriceUpdate } from '../../components/variant-price-edit/variant-price-edit';

@Component({
  selector: 'app-article-variants',
  standalone: true,
  imports: [CommonModule, FloatingBackButton, ConfirmModalComponent, ModeleArticleFormComponent, DeclinaisonFormComponent, VariantFormComponent, VariantPriceEditComponent],
  templateUrl: './article-variants.html',
  styleUrl: './article-variants.css',
})
export class ArticleVariants implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly dependency = inject(DependencyService);

  readonly user = getUserFromSessionStorage();
  readonly context = signal<ArticleContextDto | null>(null);
  readonly modeles = signal<ModeleArticleDto[]>([]);
  readonly selectedModele = signal<ModeleArticleDto | null>(null);
  readonly declinaisons = signal<DeclinaisonDto[]>([]);
  readonly selectedDeclinaison = signal<DeclinaisonDto | null>(null);
  readonly editingDeclinaisonId = signal<number | null>(null);
  readonly editingDeclinaison = computed(() => {
    const id = this.editingDeclinaisonId();
    return id === null ? null : this.declinaisons().find(item => item.id === id) ?? null;
  });
  readonly variantes = signal<ArticleVariantDto[]>([]);
  readonly declinaisonAttributes = computed(() =>
    (this.context()?.attributes ?? []).filter(attribute => attribute.niveau === 'DECLINAISON')
  );
  readonly variantAttributes = computed(() =>
    (this.context()?.attributes ?? []).filter(attribute => attribute.niveau === 'VARIANTE')
  );
  readonly variantReferenceParts = computed(() => {
    const context = this.context();
    const modele = this.selectedModele();
    const declinaison = this.selectedDeclinaison();
    if (!context || !modele || !declinaison) return [];

    const values = declinaison.attributs ?? {};
    return [
      context.categoryNom,
      context.typeNom,
      modele.marque,
      modele.nom,
      modele.matiere,
      ...this.declinaisonAttributes().map(attribute => values[attribute.id]),
    ].filter((value): value is string => typeof value === 'string' && value.length > 0);
  });

  readonly loading = signal(true);
  readonly loadingModeles = signal(false);
  readonly modelesError = signal<string | null>(null);
  readonly loadingDeclinaisons = signal(false);
  readonly declinaisonsError = signal<string | null>(null);
  readonly loadingVariantes = signal(false);
  readonly variantesError = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly savingDeclinaison = signal(false);
  readonly savingVariante = signal(false);
  readonly editingVariantId = signal<number | null>(null);
  readonly updatingVariantId = signal<number | null>(null);
  readonly deletingVariantId = signal<number | null>(null);
  readonly pendingVariantDeletion = signal<ArticleVariantDto | null>(null);
  readonly processingDeclinaisonImage = signal(false);
  readonly modeleFormResetKey = signal(0);
  readonly declinaisonFormResetKey = signal(0);
  readonly varianteFormResetKey = signal(0);
  readonly failedImages = signal<Set<string>>(new Set());

  private articleId = 0;
  private declinaisonsRequestId = 0;
  private variantesRequestId = 0;

  ngOnInit(): void {
    this.articleId = Number(this.route.snapshot.paramMap.get('articleId'));
    if (!this.articleId || !this.user?.id) {
      this.loading.set(false);
      this.dependency.responseService.showErrorToast('Article ou administrateur introuvable.');
      return;
    }
    this.loadContext();
  }

  saveModele(request: ModeleArticleRequestDto): void {
    if (this.submitting() || this.savingVariante() || this.deletingVariantId() !== null || !this.user?.id || !this.articleId) return;
    this.submitting.set(true);
    this.dependency.articleService.addModeleArticle(this.articleId, request, this.user.id).subscribe({
      next: result => {
        this.dependency.responseService.showSuccessToast('Modèle ajouté avec succès.');
        this.modeleFormResetKey.update(value => value + 1);
        this.loadModeles(result.id);
      },
      error: error => {
        this.dependency.responseService.showErrorToast(
          error?.error?.message ?? 'Impossible d’ajouter le modèle.'
        );
        this.submitting.set(false);
      },
      complete: () => this.submitting.set(false),
    });
  }

  saveDeclinaison(submission: DeclinaisonSubmission): void {
    const modele = this.selectedModele();
    const editing = this.editingDeclinaison();
    if (
      this.savingDeclinaison() || this.savingVariante() || this.deletingVariantId() !== null
      || (!editing && !modele) || !this.user?.id
    ) return;

    this.savingDeclinaison.set(true);
    const request = editing && !editing.caracteristiquesModifiables ? null : submission.request;
    const operation = editing
      ? this.dependency.articleService.updateDeclinaison(
          editing.id,
          request,
          this.user!.id,
          submission.image
        )
      : this.dependency.articleService.addDeclinaison(
          modele!.id,
          submission.request,
          this.user!.id,
          submission.image
        );

    operation.subscribe({
      next: declinaison => {
        this.declinaisons.update(current => editing
          ? current.map(item => item.id === declinaison.id ? declinaison : item)
          : [...current.filter(item => item.id !== declinaison.id), declinaison]
        );
        if (editing) this.selectedDeclinaison.set(declinaison);
        this.editingDeclinaisonId.set(null);
        this.declinaisonFormResetKey.update(value => value + 1);
        this.dependency.responseService.showSuccessToast(
          editing ? 'D\\u00e9clinaison modifi\\u00e9e avec succ\\u00e8s.' : 'D\\u00e9clinaison ajout\\u00e9e avec succ\\u00e8s.'
        );
        if (!editing) this.selectDeclinaison(declinaison);
      },
      error: error => {
        this.dependency.responseService.showErrorToast(
          error?.error?.message ?? (
            editing
              ? 'Impossible de modifier la d\\u00e9clinaison.'
              : 'Impossible d\\u00e9ajouter la d\\u00e9clinaison.'
          )
        );
        this.savingDeclinaison.set(false);
      },
      complete: () => this.savingDeclinaison.set(false),
    });
  }

  editDeclinaison(declinaison: DeclinaisonDto): void {
    if (this.savingDeclinaison() || this.savingVariante() || this.deletingVariantId() !== null) return;
    this.selectDeclinaison(declinaison);
    this.editingDeclinaisonId.set(declinaison.id);
  }

  cancelDeclinaisonEdit(): void {
    if (this.savingDeclinaison()) return;
    this.editingDeclinaisonId.set(null);
    this.declinaisonFormResetKey.update(value => value + 1);
  }

  saveVariante(request: ArticleVariantRequestDto): void {
    const declinaison = this.selectedDeclinaison();
    if (this.savingVariante() || this.deletingVariantId() !== null || !declinaison || !this.user?.id) return;
    this.savingVariante.set(true);
    this.dependency.articleService.addArticleVariant(declinaison.id, request, this.user.id).subscribe({
      next: result => {
        this.dependency.responseService.showSuccessToast(
          result?.message ?? 'Variante ajoutée avec succès.'
        );
        this.varianteFormResetKey.update(value => value + 1);
        this.loadVariantes(declinaison.id);
      },
      error: error => {
        this.dependency.responseService.showErrorToast(
          error?.error?.message ?? 'Impossible d’ajouter la variante.'
        );
        this.savingVariante.set(false);
      },
      complete: () => this.savingVariante.set(false),
    });
  }

  editVariantPrice(variantId: number): void {
    if (this.savingVariante() || this.deletingVariantId() !== null) return;
    this.editingVariantId.set(variantId);
  }

  cancelVariantPriceEdit(): void {
    if (this.savingVariante()) return;
    this.editingVariantId.set(null);
  }

  updateVariantPrice(update: VariantPriceUpdate): void {
    if (this.savingVariante() || this.deletingVariantId() !== null || !this.user?.id) return;
    const request: ArticleVariantPriceUpdateRequestDto = { prixVente: update.prixVente };
    this.savingVariante.set(true);
    this.updatingVariantId.set(update.variantId);

    this.dependency.articleService.updateArticleVariantPrice(
      update.variantId,
      this.user.id,
      request
    ).subscribe({
      next: response => {
        this.variantes.update(variantes => variantes.map(variant =>
          variant.id === update.variantId
            ? { ...variant, prixVente: update.prixVente }
            : variant
        ));
        this.editingVariantId.set(null);
        this.dependency.responseService.showSuccessToast(
          response?.message ?? 'Prix de la variante modifié avec succès.'
        );
      },
      error: error => {
        this.dependency.responseService.showErrorToast(
          error?.error?.message ?? 'Impossible de modifier le prix de la variante.'
        );
        this.savingVariante.set(false);
        this.updatingVariantId.set(null);
      },
      complete: () => {
        this.savingVariante.set(false);
        this.updatingVariantId.set(null);
      },
    });
  }

  deleteVariant(variant: ArticleVariantDto): void {
    if (this.savingVariante() || this.deletingVariantId() !== null || !this.user?.id) return;
    this.pendingVariantDeletion.set(variant);
  }

  cancelVariantDeletion(): void {
    if (this.deletingVariantId() !== null) return;
    this.pendingVariantDeletion.set(null);
  }

  confirmVariantDeletion(): void {
    const variant = this.pendingVariantDeletion();
    const adminId = this.user?.id;
    if (!variant || this.savingVariante() || this.deletingVariantId() !== null || !adminId) return;

    this.editingVariantId.set(null);
    this.deletingVariantId.set(variant.id);
    this.dependency.articleService.deleteArticleVariant(variant.id, adminId).subscribe({
      next: response => {
        this.variantes.update(variants => variants.filter(item => item.id !== variant.id));
        this.pendingVariantDeletion.set(null);
        this.dependency.responseService.showSuccessToast(
          response?.message ?? 'Variante supprimée avec succès.'
        );
      },
      error: error => {
        this.dependency.responseService.showErrorToast(
          error?.error?.message ?? 'Impossible de supprimer cette variante.'
        );
        this.pendingVariantDeletion.set(null);
        this.deletingVariantId.set(null);
      },
      complete: () => this.deletingVariantId.set(null),
    });
  }

  selectModele(modele: ModeleArticleDto): void {
    if (this.savingDeclinaison() || this.processingDeclinaisonImage() || this.savingVariante() || this.deletingVariantId() !== null) return;
    if (this.selectedModele()?.id === modele.id && this.loadingDeclinaisons()) return;
    if (this.selectedModele()?.id !== modele.id) {
      this.editingDeclinaisonId.set(null);
      this.declinaisonFormResetKey.update(value => value + 1);
      this.varianteFormResetKey.update(value => value + 1);
    }
    this.selectedModele.set(modele);
    this.loadDeclinaisons(modele);
  }

  selectDeclinaison(declinaison: DeclinaisonDto): void {
    if (this.savingVariante() || this.deletingVariantId() !== null) return;
    if (this.selectedDeclinaison()?.id === declinaison.id) {
      if (this.loadingVariantes() || !this.variantesError()) return;
    } else {
      this.editingDeclinaisonId.set(null);
      this.varianteFormResetKey.update(value => value + 1);
    }
    this.selectedDeclinaison.set(declinaison);
    this.loadVariantes(declinaison.id);
  }

  retryLoadModeles(): void {
    this.loadModeles();
  }

  retryLoadDeclinaisons(): void {
    const modele = this.selectedModele();
    if (modele) this.loadDeclinaisons(modele);
  }

  retryLoadVariantes(): void {
    const declinaison = this.selectedDeclinaison();
    if (declinaison) this.loadVariantes(declinaison.id);
  }

  declinaisonAttributeEntries(declinaison: DeclinaisonDto): Array<{ id: number; label: string; value: string }> {
    const values = declinaison.attributs ?? {};
    return this.declinaisonAttributes()
      .map(attribute => ({ id: attribute.id, label: attribute.label, value: values[attribute.id] ?? '' }))
      .filter(attribute => attribute.value.trim().length > 0);
  }

  variantAttributeEntries(variant: ArticleVariantDto): Array<{ id: number; label: string; value: string }> {
    const values = variant.attributs ?? {};
    return this.variantAttributes()
      .map(attribute => ({ id: attribute.id, label: attribute.label, value: values[attribute.id] ?? '' }))
      .filter(attribute => attribute.value.trim().length > 0);
  }

  displayImageUrl(path?: string | null): string | null {
    return resolveImageUrl(path, 'article-variants');
  }

  onImageError(imageUrl: string): void {
    this.failedImages.update(images => new Set(images).add(imageUrl));
  }

  onDeclinaisonImageProcessingChange(processing: boolean): void {
    this.processingDeclinaisonImage.set(processing);
  }

  private loadContext(): void {
    this.dependency.articleService.loadArticleContext(this.articleId, this.user!.id).subscribe({
      next: context => {
        this.context.set(context);
        this.loading.set(false);
        this.loadModeles();
      },
      error: error => {
        this.loading.set(false);
        this.dependency.responseService.showErrorToast(
          error?.error?.message ?? 'Impossible de charger l’article.'
        );
      },
    });
  }

  private loadModeles(preferredModeleId?: number): void {
    if (!this.user?.id || !this.articleId) return;
    this.modelesError.set(null);
    this.loadingModeles.set(true);
    this.dependency.articleService.loadModelesArticle(this.articleId, this.user.id).subscribe({
      next: modeles => {
        const loadedModeles = modeles ?? [];
        this.modeles.set(loadedModeles);
        const selectedId = preferredModeleId ?? this.selectedModele()?.id;
        const selection = loadedModeles.find(modele => modele.id === selectedId) ?? null;
        this.selectedModele.set(selection);
        if (selection) this.loadDeclinaisons(selection);
        else this.clearDeclinaisons();
      },
      error: error => {
        const message = error?.error?.message ?? 'Impossible de charger les modèles.';
        this.modelesError.set(message);
        this.dependency.responseService.showErrorToast(message);
        this.loadingModeles.set(false);
      },
      complete: () => this.loadingModeles.set(false),
    });
  }

  private loadDeclinaisons(modele: ModeleArticleDto): void {
    if (!this.user?.id) return;
    const requestId = ++this.declinaisonsRequestId;
    this.declinaisons.set([]);
    this.declinaisonsError.set(null);
    this.selectedDeclinaison.set(null);
    this.varianteFormResetKey.update(value => value + 1);
    this.clearVariantes();
    this.loadingDeclinaisons.set(true);
    this.dependency.articleService.loadDeclinaisonsModele(modele.id, this.user.id).subscribe({
      next: declinaisons => {
        if (requestId !== this.declinaisonsRequestId) return;
        this.declinaisons.set(declinaisons ?? []);
      },
      error: error => {
        if (requestId !== this.declinaisonsRequestId) return;
        const message = error?.error?.message ?? 'Impossible de charger les déclinaisons.';
        this.declinaisonsError.set(message);
        this.dependency.responseService.showErrorToast(message);
        this.loadingDeclinaisons.set(false);
      },
      complete: () => {
        if (requestId === this.declinaisonsRequestId) this.loadingDeclinaisons.set(false);
      },
    });
  }

  private clearDeclinaisons(): void {
    this.declinaisonsRequestId++;
    this.declinaisons.set([]);
    this.declinaisonsError.set(null);
    this.loadingDeclinaisons.set(false);
    this.selectedDeclinaison.set(null);
    this.editingDeclinaisonId.set(null);
    this.declinaisonFormResetKey.update(value => value + 1);
    this.varianteFormResetKey.update(value => value + 1);
    this.clearVariantes();
  }

  private loadVariantes(declinaisonId: number): void {
    if (!this.user?.id) return;
    const requestId = ++this.variantesRequestId;
    this.variantes.set([]);
    this.variantesError.set(null);
    this.loadingVariantes.set(true);
    this.dependency.articleService.loadDeclinaisonVariants(declinaisonId, this.user.id).subscribe({
      next: variantes => {
        if (requestId !== this.variantesRequestId) return;
        this.variantes.set(variantes ?? []);
      },
      error: error => {
        if (requestId !== this.variantesRequestId) return;
        this.variantesError.set(error?.error?.message ?? 'Impossible de charger les variantes.');
        this.dependency.responseService.showErrorToast(this.variantesError()!);
        this.loadingVariantes.set(false);
      },
      complete: () => {
        if (requestId === this.variantesRequestId) this.loadingVariantes.set(false);
      },
    });
  }

  private clearVariantes(): void {
    this.variantesRequestId++;
    this.variantes.set([]);
    this.variantesError.set(null);
    this.loadingVariantes.set(false);
  }
}
