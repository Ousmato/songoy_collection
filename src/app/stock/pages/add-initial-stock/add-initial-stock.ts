import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { InitialStockService } from '../../services/initial-stock.service';
import { DependencyService } from '../../../shared/utils/dependency';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { ArticleContextDto, ArticleVariantDto } from '../../../article/models/article.model';
import { CategoryMesure } from '../../../categorie/models/categorie.enum';

@Component({
  selector: 'app-add-initial-stock',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FloatingBackButton],
  templateUrl: './add-initial-stock.html',
  styleUrl: './add-initial-stock.css'
})
export class AddInitialStock implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly dependency = inject(DependencyService);
  private readonly fb = inject(FormBuilder);
  private readonly stock = inject(InitialStockService);
  readonly saving = signal(false);
  readonly available = signal(false);
  readonly saved = signal(false);
  readonly articleId = Number(this.route.snapshot.paramMap.get('articleId'));
  readonly variantId = Number(this.route.snapshot.paramMap.get('variantId'));
  readonly returnUrl = `/admin/article-variants/${this.articleId}`;
  readonly article = signal<ArticleContextDto | null>(null);
  readonly variant = signal<ArticleVariantDto | null>(null);
  readonly unit = signal('');
  readonly decimal = signal(false);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly prepared = signal(false);
  private readonly today = new Date();
  readonly form = this.fb.group({
    quantity: [null as number | null, [Validators.required, Validators.min(0.001)]],
    date: [this.localDate(), Validators.required],
    observation: ['', Validators.maxLength(500)]
  });

  ngOnInit(): void {
    const user = getUserFromSessionStorage();
    if (!user?.id || !Number.isInteger(this.articleId) || this.articleId <= 0
        || !Number.isInteger(this.variantId) || this.variantId <= 0) {
      this.error.set('Impossible d’identifier la variante ou le personnel connecté.');
      this.loading.set(false);
      return;
    }

    forkJoin({
      article: this.dependency.articleService.loadArticleContext(this.articleId, user.id),
      variants: this.dependency.articleService.loadArticleVariants(this.articleId, user.id),
      categories: this.dependency.categoryService.loadCategories(user.id),
      stock: this.stock.availability(this.variantId, user.id)
    }).subscribe({
      next: ({ article, variants, categories, stock }) => {
        this.available.set(stock.available);
        const variant = variants.find(item => item.id === this.variantId);
        const category = categories.find(item => item.id === article.categoryId);
        if (!variant || !category) {
          this.error.set('La variante ou sa catégorie est introuvable.');
        } else {
          const measure = String(category.mesureCategory);
          this.article.set(article);
          this.variant.set(variant);
          this.unit.set(CategoryMesure[measure as keyof typeof CategoryMesure] ?? measure);
          this.decimal.set(measure === 'METRE' || measure === CategoryMesure.METRE);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger la variante. Revenez à la liste puis réessayez.');
        this.loading.set(false);
      }
    });
  }

  prepare(): void {
    if (!this.available() || this.saving()) {
      return;
    }
    this.form.markAllAsTouched();
    const quantity = Number(this.form.controls.quantity.value);
    if (!Number.isFinite(quantity) || (!this.decimal() && !Number.isInteger(quantity))) {
      this.form.controls.quantity.setErrors({ quantity: true });
    }
    if (this.form.invalid || !this.variant() || !this.unit()) {
      return;
    }
    this.prepared.set(true);
  }

  save(): void {
    const user = getUserFromSessionStorage();
    if (!user?.id || !this.available() || this.saving() || !this.prepared() || this.form.invalid) {
      return;
    }
    const value = this.form.getRawValue();
    this.saving.set(true);
    this.stock.create(this.variantId, user.id, {
      quantity: Number(value.quantity),
      date: value.date ?? '',
      observation: value.observation?.trim() ?? ''
    }).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.available.set(false);
        this.saved.set(true);
        this.prepared.set(false);
      },
      error: error => {
        this.dependency.responseService.showErrorToast(
          error?.error?.message ?? 'Impossible d’enregistrer le stock initial.'
        );
        this.stock.availability(this.variantId, user.id).subscribe({
          next: result => this.available.set(result.available),
          error: () => this.error.set('Impossible de vérifier le stock. Rechargez la page.')
        });
      }
    });
  }

  private localDate(): string {
    return [
      this.today.getFullYear(),
      String(this.today.getMonth() + 1).padStart(2, '0'),
      String(this.today.getDate()).padStart(2, '0')
    ].join('-');
  }
}
