import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Subscription } from 'rxjs';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import {
  ArticleVariantDto,
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
    return this.displayImageUrl(this.selectedVariant(article.id)?.urlImage);
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

  loadVariants(article: SimpleArticleResponse): void {
    if (!this.user?.id || this.selections()[article.id]?.loading) return;
    this.selections.update(selections => ({
      ...selections,
      [article.id]: {
        loading: true,
        error: '',
        variants: [],
        attributes: [],
        selectedId: null,
      },
    }));
    this.dependency.articleService.loadArticleVariants(article.id, this.user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: variants => this.updateSelection(article.id, {
          loading: false,
          variants: variants ?? [],
          selectedId: variants?.length === 1 ? variants[0].id : null,
        }),
        error: () => this.updateSelection(article.id, {
          loading: false,
          error: 'Variantes indisponibles.',
        }),
      });
    this.dependency.articleService.loadArticleContext(article.id, this.user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: context => this.updateSelection(article.id, { attributes: context.attributes ?? [] }),
        // Les références et valeurs restent lisibles si les libellés sont indisponibles.
        error: () => this.updateSelection(article.id, { attributes: [] }),
      });
  }

  selectVariant(articleId: number, value: number | null): void {
    this.updateSelection(articleId, { selectedId: Number(value) || null });
  }

  selectedVariant(articleId: number): ArticleVariantDto | undefined {
    const selection = this.selections()[articleId];
    return selection?.variants.find(variant => variant.id === selection.selectedId);
  }

  attributeLabel(articleId: number, key: string): string {
    return this.selections()[articleId]?.attributes.find(item => item.id === Number(key))?.label ?? '';
  }

  available(variant: ArticleVariantDto): number {
    const reserved = this.lines().find(line => line.variant.id === variant.id)?.quantite ?? 0;
    return Math.max(0, this.roundQuantity(Number(variant.quantity || 0) - reserved));
  }

  addToCart(article: SimpleArticleResponse): void {
    const variant = this.selectedVariant(article.id);
    const prixVente = variant ? this.salePriceValue(variant) : 0;
    if (!variant || this.available(variant) <= 0 || prixVente <= 0) return;

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
        : [...lines, { article, variant, prixVente, quantite: added }];
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
      [articleId]: { ...selections[articleId], ...patch },
    }));
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
