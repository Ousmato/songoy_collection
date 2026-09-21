import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { Select2, Select2Data, Select2Option } from 'ng-select2-component';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { DeclinaisonFormComponent, DeclinaisonSubmission } from '../../components/declinaison-form/declinaison-form';
import { VariantFormComponent } from '../../components/variant-form/variant-form';
import {
  ArticleContextDto,
  ArticleVariantDto,
  ArticleVariantRequestDto,
  DeclinaisonDto,
  ModeleArticleDto,
} from '../../models/article.model';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal';
import { DependencyService } from '../../../shared/utils/dependency';
import { resolveImageUrl } from '../../../shared/utils/image-url.util';

@Component({
  selector: 'app-article-versions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Select2,
    FloatingBackButton,
    ConfirmModalComponent,
    DeclinaisonFormComponent,
    VariantFormComponent,
  ],
  templateUrl: './article-versions.html',
  styleUrl: './article-versions.css',
})
export class ArticleVersions implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly dependency = inject(DependencyService);
  private readonly user = getUserFromSessionStorage();

  readonly context = signal<ArticleContextDto | null>(null);
  readonly modeles = signal<ModeleArticleDto[]>([]);
  readonly versions = signal<DeclinaisonDto[]>([]);
  readonly selectedModeleId = signal<number | null>(null);
  readonly editingVersionId = signal<number | null>(null);
  readonly loading = signal(true);
  readonly loadingModeles = signal(false);
  readonly loadingVersions = signal(false);
  readonly saving = signal(false);
  readonly processingImage = signal(false);
  readonly error = signal<string | null>(null);
  readonly formResetKey = signal(0);
  readonly failedImages = signal(new Set<string>());
  readonly search = signal('');
  readonly versionModalOpen = signal(false);
  readonly variantModalVersion = signal<DeclinaisonDto | null>(null);
  readonly savingVariant = signal(false);
  readonly variantFormResetKey = signal(0);
  readonly editingVariantId = signal<number | null>(null);
  readonly updatingVariantId = signal<number | null>(null);
  readonly deletingVariantId = signal<number | null>(null);
  readonly pendingVariantDeletion = signal<ArticleVariantDto | null>(null);

  readonly selectedModele = computed(() =>
    this.modeles().find(modele => modele.id === this.selectedModeleId()) ?? null,
  );
  readonly versionAttributes = computed(() =>
    (this.context()?.attributes ?? []).filter(attribute => attribute.niveau === 'DECLINAISON'),
  );
  readonly editingVersion = computed(() =>
    this.versions().find(version => version.id === this.editingVersionId()) ?? null,
  );
  readonly filteredVersions = computed(() => {
    const term = this.normalizeSearch(this.search());
    if (!term) return this.versions();
    return this.versions().filter(version => this.versionSearchText(version).includes(term));
  });
  readonly variantAttributes = computed(() =>
    (this.context()?.attributes ?? []).filter(attribute => attribute.niveau === 'VARIANTE'),
  );
  readonly variantReferenceParts = computed(() => {
    return this.referencePartsFor(this.variantModalVersion());
  });
  readonly editingVariant = computed(() => {
    const id = this.editingVariantId();
    if (id === null) return null;
    return this.versions().flatMap(version => version.variants ?? []).find(variant => variant.id === id) ?? null;
  });
  readonly editingVariantVersion = computed(() => {
    const id = this.editingVariantId();
    if (id === null) return null;
    return this.versions().find(version => (version.variants ?? []).some(variant => variant.id === id)) ?? null;
  });
  readonly editingVariantReferenceParts = computed(() =>
    this.referencePartsFor(this.editingVariantVersion()),
  );
  readonly modeleOptions = computed<Select2Data>(() =>
    this.modeles().map<Select2Option>((modele, index) => ({
      id: `modele-${modele.id}-${index}`,
      value: modele.id,
      label: [modele.nom, modele.marque, modele.matiere].filter(Boolean).join(' · '),
    })),
  );

  private articleId = 0;

  ngOnInit(): void {
    this.articleId = Number(this.route.snapshot.paramMap.get('articleId'));
    if (!this.articleId || !this.user?.id) {
      this.loading.set(false);
      this.error.set('Article ou session administrateur introuvable.');
      return;
    }
    this.loadPage();
  }

  @HostListener('document:keydown.escape')
  closeWithEscape(): void {
    this.cancelVersionEdit();
    this.closeVariantModal();
    this.cancelVariantEdit();
    this.cancelVariantDeletion();
  }

  loadPage(): void {
    if (!this.articleId || !this.user?.id) return;
    this.loading.set(true);
    this.error.set(null);
    this.dependency.articleService.loadArticleContext(this.articleId, this.user.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: context => {
          this.context.set(context);
          this.loadModeles();
        },
        error: error => this.error.set(this.readError(error, 'Impossible de charger cet article.')),
      });
  }

  selectModele(value: number | string | null): void {
    const modeleId = value === null || value === '' ? null : Number(value);
    if (!modeleId || modeleId === this.selectedModeleId()) return;
    this.selectedModeleId.set(modeleId);
    this.cancelVersionEdit();
    this.loadVersions();
  }

  editVersion(version: DeclinaisonDto): void {
    if (this.saving() || this.processingImage()) return;
    this.editingVersionId.set(version.id);
    this.versionModalOpen.set(true);
    this.formResetKey.update(value => value + 1);
  }

  cancelVersionEdit(): void {
    if (this.saving() || this.processingImage()) return;
    this.editingVersionId.set(null);
    this.versionModalOpen.set(false);
    this.formResetKey.update(value => value + 1);
  }

  saveVersion(submission: DeclinaisonSubmission): void {
    const modele = this.selectedModele();
    if (!modele || !this.user?.id || this.saving() || this.processingImage()) return;

    const editing = this.editingVersion();
    this.saving.set(true);
    const request = editing && !editing.caracteristiquesModifiables ? null : submission.request;
    const operation = editing
      ? this.dependency.articleService.updateDeclinaison(editing.id, request, this.user.id, submission.image)
      : this.dependency.articleService.addDeclinaison(modele.id, submission.request, this.user.id, submission.image);

    operation.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: version => {
        const savedVersion = { ...version, variants: version.variants ?? [] };
        if (editing) {
          this.versions.update(current => current.map(item => item.id === savedVersion.id ? savedVersion : item));
          this.dependency.responseService.showSuccessToast('Déclinaison mise à jour avec succès.');
        } else {
          this.versions.update(current => [...current, savedVersion]);
          this.dependency.responseService.showSuccessToast('Déclinaison ajoutée avec succès.');
        }
        this.editingVersionId.set(null);
        this.versionModalOpen.set(false);
        this.formResetKey.update(value => value + 1);
      },
      error: error => this.dependency.responseService.showErrorToast(
        this.readError(error, 'Impossible d’enregistrer cette déclinaison.'),
      ),
    });
  }

  openVersionModal(): void { if (!this.saving() && !this.processingImage()) { this.editingVersionId.set(null); this.formResetKey.update(value => value + 1); this.versionModalOpen.set(true); } }
  openVariantModal(version: DeclinaisonDto): void { if (!this.savingVariant()) this.variantModalVersion.set(version); }
  closeVariantModal(): void { if (!this.savingVariant()) this.variantModalVersion.set(null); }
  saveVariant(request: { reference: string; prixVente: number; attributs: Record<number, string> }): void {
    const version = this.variantModalVersion();
    if (!version || !this.user?.id || this.savingVariant()) return;
    this.savingVariant.set(true);
    this.dependency.articleService.addArticleVariant(version.id, request, this.user.id)
      .pipe(finalize(() => this.savingVariant.set(false)))
      .subscribe({
        next: response => { this.variantFormResetKey.update(value => value + 1); this.variantModalVersion.set(null); this.dependency.responseService.showSuccessToast(response?.message ?? 'Variante ajoutée avec succès.'); this.loadVersions(); },
        error: error => this.dependency.responseService.showErrorToast(this.readError(error, 'Impossible d’ajouter la variante.')),
      });
  }

  editVariant(variant: ArticleVariantDto): void {
    if (this.savingVariant() || this.updatingVariantId() !== null || this.deletingVariantId() !== null) return;
    this.variantModalVersion.set(null);
    this.editingVariantId.set(variant.id);
  }

  cancelVariantEdit(): void {
    if (this.updatingVariantId() === null) this.editingVariantId.set(null);
  }

  updateVariant(request: ArticleVariantRequestDto): void {
    const variantId = this.editingVariantId();
    if (variantId === null || !this.user?.id || this.savingVariant() || this.updatingVariantId() !== null || this.deletingVariantId() !== null) return;

    this.updatingVariantId.set(variantId);
    this.dependency.articleService.updateArticleVariant(variantId, this.user.id, request)
      .pipe(finalize(() => this.updatingVariantId.set(null)))
      .subscribe({
        next: response => {
          this.versions.update(versions => versions.map(version => ({
            ...version,
            variants: (version.variants ?? []).map(variant =>
              variant.id === variantId ? { ...variant, ...request } : variant,
            ),
          })));
          this.editingVariantId.set(null);
          this.dependency.responseService.showSuccessToast(response?.message ?? 'Variante modifiée avec succès.');
        },
        error: error => this.dependency.responseService.showErrorToast(
          this.readError(error, 'Impossible de modifier la variante.'),
        ),
      });
  }

  deleteVariant(variant: ArticleVariantDto): void {
    if (this.savingVariant() || this.updatingVariantId() !== null || this.deletingVariantId() !== null) return;
    this.pendingVariantDeletion.set(variant);
  }

  cancelVariantDeletion(): void {
    if (this.deletingVariantId() === null) this.pendingVariantDeletion.set(null);
  }

  confirmVariantDeletion(): void {
    const variant = this.pendingVariantDeletion();
    if (!variant || !this.user?.id || this.savingVariant() || this.updatingVariantId() !== null || this.deletingVariantId() !== null) return;

    this.editingVariantId.set(null);
    this.deletingVariantId.set(variant.id);
    this.dependency.articleService.deleteArticleVariant(variant.id, this.user.id)
      .pipe(finalize(() => this.deletingVariantId.set(null)))
      .subscribe({
        next: response => {
          this.versions.update(versions => versions.map(version => ({
            ...version,
            variants: (version.variants ?? []).filter(item => item.id !== variant.id),
          })));
          this.pendingVariantDeletion.set(null);
          this.dependency.responseService.showSuccessToast(response?.message ?? 'Variante supprimée avec succès.');
        },
        error: error => this.dependency.responseService.showErrorToast(
          this.readError(error, 'Impossible de supprimer cette variante.'),
        ),
      });
  }

  versionAttributeEntries(version: DeclinaisonDto): Array<{ label: string; value: string }> {
    return this.versionAttributes()
      .map(attribute => ({ label: attribute.label, value: version.attributs[attribute.id] }))
      .filter((entry): entry is { label: string; value: string } => Boolean(entry.value));
  }

  versionTitle(version: DeclinaisonDto): string {
    const values = this.versionAttributeEntries(version)
      .map(entry => `${entry.label} : ${entry.value}`)
      .join(' · ');
    return values || 'Déclinaison sans caractéristique';
  }

  variantAttributeEntries(variant: ArticleVariantDto): Array<{ label: string; value: string }> {
    return this.variantAttributes()
      .map(attribute => ({ label: attribute.label, value: variant.attributs?.[attribute.id] ?? '' }))
      .filter((entry): entry is { label: string; value: string } => Boolean(entry.value));
  }

  private versionSearchText(version: DeclinaisonDto): string {
    return this.normalizeSearch([
      version.referenceCommune,
      ...Object.values(version.attributs ?? {}),
      ...(version.variants ?? []).flatMap(variant => [variant.reference, ...Object.values(variant.attributs ?? {})]),
    ].join(' '));
  }

  private referencePartsFor(version: DeclinaisonDto | null): string[] {
    const context = this.context();
    const modele = this.selectedModele();
    if (!context || !modele || !version) return [];
    return [
      context.categoryNom,
      context.typeNom,
      modele.marque,
      modele.nom,
      modele.matiere,
      ...Object.values(version.attributs ?? {}),
    ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
  }

  private normalizeSearch(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  displayImageUrl(path: string | null | undefined): string | null {
    return resolveImageUrl(path, 'article-variants');
  }

  onImageError(imageUrl: string): void {
    this.failedImages.update(images => new Set([...images, imageUrl]));
  }

  onImageProcessingChange(processing: boolean): void {
    this.processingImage.set(processing);
  }

  private loadModeles(): void {
    if (!this.articleId || !this.user?.id) return;
    this.loadingModeles.set(true);
    this.dependency.articleService.loadModelesArticle(this.articleId, this.user.id)
      .pipe(finalize(() => this.loadingModeles.set(false)))
      .subscribe({
        next: modeles => {
          this.modeles.set(modeles ?? []);
          if (modeles?.length) this.selectModele(modeles[0].id);
        },
        error: error => this.error.set(this.readError(error, 'Impossible de charger les modèles.')),
      });
  }

  private loadVersions(): void {
    const modele = this.selectedModele();
    if (!modele || !this.user?.id) return;
    this.loadingVersions.set(true);
    this.versions.set([]);
    this.dependency.articleService.loadDeclinaisonsModele(modele.id, this.user.id)
      .pipe(finalize(() => this.loadingVersions.set(false)))
      .subscribe({
        next: (versions )=>{ 
          console.log(versions, "--------")
          this.versions.set(     
          (versions ?? []).map(version => ({ ...version, variants: version.variants ?? [] })),
        )},
        error: error => this.error.set(this.readError(error, 'Impossible de charger les déclinaisons.')),
      });
  }

  private readError(error: unknown, fallback: string): string {
    const message = (error as { error?: { message?: unknown } })?.error?.message;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }
}
