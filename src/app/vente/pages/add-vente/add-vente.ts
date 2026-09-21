import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, forkJoin, of, Subscription } from 'rxjs';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import {
  ArticleVariantDto,
  DeclinaisonDto,
  ModeleArticleDto,
  SimpleArticleResponse,
} from '../../../article/models/article.model';
import { CategoryDto } from '../../../categorie/models/categorie.dto';
import { CategoryMesure } from '../../../categorie/models/categorie.enum';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { DependencyService } from '../../../shared/utils/dependency';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import { AddVenteCart } from '../../components/add-vente-cart/add-vente-cart';
import { SaleLine, VariantSelection } from '../../models/vente.model';
import { resolveImageUrl } from '../../../shared/utils/image-url.util';

@Component({
  selector: 'app-add-vente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FloatingBackButton,
    AddVenteCart,
  ],
  templateUrl: './add-vente.html',
  styleUrl: './add-vente.css',
})
export class AddVente implements OnInit {
  private readonly dependency = inject(DependencyService);
  private readonly destroyRef = inject(DestroyRef);
  private catalogueRequest?: Subscription;
  readonly user = getUserFromSessionStorage();

  readonly articles = signal<SimpleArticleResponse[]>([]);
  readonly categories = signal<CategoryDto[]>([]);

  readonly selections = signal<Record<number, VariantSelection>>({});
  readonly lines = signal<SaleLine[]>([]);
  readonly salePriceDrafts = signal<Record<number, string>>({});
  readonly search = signal('');
  readonly categoryId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly catalogueError = signal('');
  readonly categoryError = signal('');
  readonly error = signal('');
  readonly mobilePanel = signal<'catalogue' | 'cart'>('catalogue');
  readonly failedImages = signal<Set<string>>(new Set());
  private readonly selectionRequestIds = new Map<number, number>();

  readonly filteredArticles = computed(() => {
    const term = this.normalize(this.search());
    return this.articles().filter(article => this.normalize(this.articleLabel(article)).includes(term));
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  onImageError(url: string): void {
    this.failedImages.update(images => new Set(images).add(url));
  }

  displayImageUrl(value?: string | null): string | null {
    return resolveImageUrl(value, 'article-variants');
  }

  selectedVariantImageUrl(article: SimpleArticleResponse): string | null {
    const declinaisonImage = this.selectedDeclinaison(article.id)?.urlImage;
    return this.displayImageUrl(declinaisonImage ?? this.selectedVariant(article.id)?.urlImage);
  }

  loadCategories(): void {
    if (!this.user?.id) return;
    this.categoryError.set('');
    this.dependency.categoryService.loadCategories(this.user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: categories => {
          const availableCategories = categories ?? [];
          this.categories.set(availableCategories);

          const firstCategoryId = availableCategories[0]?.id ?? null;
          this.categoryId.set(firstCategoryId);

          if (firstCategoryId === null) {
            this.articles.set([]);
            this.catalogueError.set('Aucune catégorie disponible.');
            return;
          }

          this.loadArticles();
        },
        error: () => this.categoryError.set('Les catégories sont indisponibles.'),
      });
  }

  selectCategory(id: number): void {
    if (id === this.categoryId()) return;
    this.categoryId.set(id);
    this.loadArticles();
  }

  loadArticles(): void {
    if (!this.user?.id) {
      this.catalogueError.set('Reconnectez-vous pour accéder au catalogue.');
      return;
    }
    this.catalogueRequest?.unsubscribe();
    this.loading.set(true);
    this.catalogueError.set('');
    this.articles.set([]);
    const categoryId = this.categoryId();
    if (categoryId === null) {
      this.loading.set(false);
      this.catalogueError.set('Sélectionnez une catégorie pour afficher les articles.');
      return;
    }

    const request = this.dependency.articleService.loadArticlesByCategoryId(categoryId, this.user.id);

    this.catalogueRequest = request.pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: articles => this.articles.set(articles ?? []),
      error: () => this.catalogueError.set('Impossible de charger les articles.'),
    });
  }

  loadModeles(article: SimpleArticleResponse): void {
    if (!this.user?.id || this.hasSelectionLoading(article.id)) return;
    const requestId = this.nextSelectionRequestId(article.id);
    this.selections.update(selections => ({
      ...selections,
      [article.id]: {
        ...this.emptySelection(),
        loadingModeles: true,
      },
    }));

    forkJoin({
      modeles: this.dependency.articleService.loadModelesArticle(article.id, this.user.id),
      context: this.dependency.articleService.loadArticleContext(article.id, this.user.id)
        .pipe(catchError(() => of(null))),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ modeles, context }) => {
        if (!this.isCurrentSelectionRequest(article.id, requestId)) return;
        const availableModeles = modeles ?? [];
        const selectedModeleId = availableModeles.length === 1 ? availableModeles[0].id : null;
        this.updateSelection(article.id, {
          loadingModeles: false,
          modeles: availableModeles,
          attributes: context?.attributes ?? [],
          selectedModeleId,
        });
        if (selectedModeleId !== null) this.loadDeclinaisons(article.id, selectedModeleId);
      },
      error: () => {
        if (!this.isCurrentSelectionRequest(article.id, requestId)) return;
        this.updateSelection(article.id, {
          loadingModeles: false,
          error: 'Modèles indisponibles.',
        });
      },
    });
  }

  retrySelection(article: SimpleArticleResponse): void {
    const selection = this.selections()[article.id];
    if (selection?.selectedDeclinaisonId) {
      this.loadVariants(article.id, selection.selectedDeclinaisonId);
    } else if (selection?.selectedModeleId) {
      this.loadDeclinaisons(article.id, selection.selectedModeleId);
    } else {
      this.loadModeles(article);
    }
  }

  selectModele(articleId: number, value: number | null): void {
    const modeleId = Number(value) || null;
    this.nextSelectionRequestId(articleId);
    this.updateSelection(articleId, {
      loadingDeclinaisons: false,
      loadingVariants: false,
      selectedModeleId: modeleId,
      declinaisons: [],
      selectedDeclinaisonId: null,
      variants: [],
      selectedVariantId: null,
      error: '',
    });
    if (modeleId !== null) this.loadDeclinaisons(articleId, modeleId);
  }

  selectDeclinaison(articleId: number, value: number | null): void {
    const declinaisonId = Number(value) || null;
    this.nextSelectionRequestId(articleId);
    this.updateSelection(articleId, {
      loadingVariants: false,
      selectedDeclinaisonId: declinaisonId,
      variants: [],
      selectedVariantId: null,
      error: '',
    });
    if (declinaisonId !== null) this.loadVariants(articleId, declinaisonId);
  }

  private loadDeclinaisons(articleId: number, modeleId: number): void {
    if (!this.user?.id) return;
    const requestId = this.nextSelectionRequestId(articleId);
    this.updateSelection(articleId, {
      loadingDeclinaisons: true,
      loadingVariants: false,
      declinaisons: [],
      variants: [],
      selectedDeclinaisonId: null,
      selectedVariantId: null,
      error: '',
    });
    this.dependency.articleService.loadDeclinaisonsModele(modeleId, this.user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: declinaisons => {
          if (!this.isCurrentSelectionRequest(articleId, requestId)) return;
          const availableDeclinaisons = declinaisons ?? [];
          const selectedDeclinaisonId = availableDeclinaisons.length === 1
            ? availableDeclinaisons[0].id : null;
          this.updateSelection(articleId, {
            loadingDeclinaisons: false,
            declinaisons: availableDeclinaisons,
            selectedDeclinaisonId,
          });
          if (selectedDeclinaisonId !== null) this.loadVariants(articleId, selectedDeclinaisonId);
        },
        error: () => {
          if (!this.isCurrentSelectionRequest(articleId, requestId)) return;
          this.updateSelection(articleId, {
            loadingDeclinaisons: false,
            error: 'Déclinaisons indisponibles.',
          });
        },
      });
  }

  private loadVariants(articleId: number, declinaisonId: number): void {
    if (!this.user?.id) return;
    const requestId = this.nextSelectionRequestId(articleId);
    this.updateSelection(articleId, {
      loadingVariants: true,
      variants: [],
      selectedVariantId: null,
      error: '',
    });
    this.dependency.articleService.loadDeclinaisonVariants(declinaisonId, this.user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: variants => {
          if (!this.isCurrentSelectionRequest(articleId, requestId)) return;
          const availableVariants = variants ?? [];
          this.updateSelection(articleId, {
            loadingVariants: false,
            variants: availableVariants,
            selectedVariantId: availableVariants.length === 1 ? availableVariants[0].id : null,
          });
        },
        error: () => {
          if (!this.isCurrentSelectionRequest(articleId, requestId)) return;
          this.updateSelection(articleId, {
            loadingVariants: false,
            error: 'Variantes indisponibles.',
          });
        },
      });
  }

  selectVariant(articleId: number, value: number | null): void {
    this.updateSelection(articleId, { selectedVariantId: Number(value) || null });
  }

  selectedVariant(articleId: number): ArticleVariantDto | undefined {
    const selection = this.selections()[articleId];
    return selection?.variants.find(variant => variant.id === selection.selectedVariantId);
  }

  selectedDeclinaison(articleId: number): DeclinaisonDto | undefined {
    const selection = this.selections()[articleId];
    return selection?.declinaisons.find(item => item.id === selection.selectedDeclinaisonId);
  }

  modeleLabel(modele: ModeleArticleDto): string {
    return [modele.nom, modele.marque, modele.matiere].filter(Boolean).join(' · ');
  }

  declinaisonLabel(articleId: number, declinaison: DeclinaisonDto): string {
    const summary = this.attributeSummary(articleId, declinaison.attributs);
    return summary || `Déclinaison ${declinaison.id}`;
  }

  attributeLabel(articleId: number, key: string): string {
    return this.selections()[articleId]?.attributes.find(item => item.id === Number(key))?.label ?? '';
  }

  private attributeSummary(articleId: number, values: Record<number, string> | null | undefined): string {
    return Object.entries(values ?? {}).map(([key, value]) => {
      const label = this.attributeLabel(articleId, key);
      return [label, value].filter(Boolean).join(' : ');
    }).join(', ');
  }

  available(variant: ArticleVariantDto): number {
    const reserved = this.lines().find(line => line.variant.id === variant.id)?.quantite ?? 0;
    return Math.max(0, this.roundQuantity(Number(variant.quantity || 0) - reserved));
  }

  addToCart(article: SimpleArticleResponse): void {
    const selection = this.selections()[article.id];
    const modele = selection?.modeles.find(item => item.id === selection.selectedModeleId);
    const declinaison = this.selectedDeclinaison(article.id);
    const variant = this.selectedVariant(article.id);
    const prixVente = variant ? this.salePriceValue(variant) : 0;
    if (!modele || !declinaison || !variant || this.available(variant) <= 0 || prixVente <= 0) return;

    const added = Math.min(1, this.available(variant));
    this.lines.update(lines => {
      const existing = lines.find(line => line.variant.id === variant.id);
      return existing
        ? lines.map(line => line.variant.id === variant.id
          ? {
              ...line,
              prixVente,
              quantite: this.roundQuantity(line.quantite + added),
            }
          : line)
        : [...lines, {
            article,
            modele,
            declinaison,
            attributes: selection?.attributes ?? [],
            variant,
            prixVente,
            quantite: added,
          }];
    });
    this.clearFeedback();
  }

  updateQuantity(line: SaleLine, value: number | string): void {
    const quantity = Number(value);
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > line.variant.quantity) {
      this.error.set('La quantité doit être positive et ne pas dépasser le stock disponible.');
      return;
    }
    this.lines.update(lines => lines.map(item => item.variant.id === line.variant.id
      ? { ...item, quantite: this.roundQuantity(quantity) } : item));
    this.clearFeedback();
  }

  changeQuantity(line: SaleLine, delta: number): void {
    this.updateQuantity(line, Math.min(line.variant.quantity, this.roundQuantity(line.quantite + delta)));
  }

  removeLine(id: number): void {
    this.lines.update(lines => lines.filter(line => line.variant.id !== id));
    this.clearFeedback();
  }

  clearCart(): void {
    this.lines.set([]);
    this.clearFeedback();
  }

  salePrice(variant: ArticleVariantDto): string {
    return this.salePriceDrafts()[variant.id] ?? String(variant.prixVente ?? '');
  }

  isSalePriceValid(variant: ArticleVariantDto): boolean {
    return this.salePriceValue(variant) > 0;
  }

  updateSalePrice(variant: ArticleVariantDto, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.salePriceDrafts.update(prices => ({ ...prices, [variant.id]: value }));

    const prixVente = Number(value);
    if (!Number.isFinite(prixVente) || prixVente <= 0) return;

    this.lines.update(lines => lines.map(line => line.variant.id === variant.id
      ? { ...line, prixVente: this.round(prixVente) }
      : line));
  }

  private salePriceValue(variant: ArticleVariantDto): number {
    const value = Number(this.salePrice(variant));
    return Number.isFinite(value) && value > 0 ? this.round(value) : 0;
  }

  articleLabel(article: SimpleArticleResponse): string {
    return [article.categoryNom || article.nom, article.typeNom].filter(Boolean).join(' — ');
  }

  unit(article: SimpleArticleResponse): string {
    return EnumMethodes.getEnumValueByKey(CategoryMesure, article.categoryMesure)
      ?? article.categoryMesure ?? '';
  }

  private clearFeedback(): void {
    this.error.set('');
  }

  private updateSelection(articleId: number, patch: Partial<VariantSelection>): void {
    this.selections.update(selections => ({
      ...selections,
      [articleId]: { ...this.emptySelection(), ...selections[articleId], ...patch },
    }));
  }

  private emptySelection(): VariantSelection {
    return {
      loadingModeles: false,
      loadingDeclinaisons: false,
      loadingVariants: false,
      error: '',
      modeles: [],
      declinaisons: [],
      variants: [],
      attributes: [],
      selectedModeleId: null,
      selectedDeclinaisonId: null,
      selectedVariantId: null,
    };
  }

  hasSelectionLoading(articleId: number): boolean {
    const selection = this.selections()[articleId];
    return !!selection && (selection.loadingModeles || selection.loadingDeclinaisons || selection.loadingVariants);
  }

  private nextSelectionRequestId(articleId: number): number {
    const requestId = (this.selectionRequestIds.get(articleId) ?? 0) + 1;
    this.selectionRequestIds.set(articleId, requestId);
    return requestId;
  }

  private isCurrentSelectionRequest(articleId: number, requestId: number): boolean {
    return this.selectionRequestIds.get(articleId) === requestId;
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private roundQuantity(value: number): number {
    return Math.round(value * 1e6) / 1e6;
  }
}
