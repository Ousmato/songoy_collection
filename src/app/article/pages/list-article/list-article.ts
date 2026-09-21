import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { DependencyService } from '../../../shared/utils/dependency';
import { SimpleArticleResponse } from '../../models/article.model';
import { CategoryDto } from '../../../categorie/models/categorie.dto';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import { CategoryMesure } from '../../../categorie/models/categorie.enum';


@Component({
  selector: 'app-list-article',
  standalone: true,
  imports: [CommonModule, RouterModule, FloatingBackButton],
  templateUrl: './list-article.html',
  styleUrl: './list-article.css'
})
export class ListArticle implements OnInit {

  readonly user = getUserFromSessionStorage();
  readonly dependency = inject(DependencyService);
  readonly articles = signal<SimpleArticleResponse[]>([]);
  readonly categoryList = signal<CategoryDto[]>([]);
  readonly search = signal('');
  readonly categoryFilter = signal<number | null>(null);

  readonly categories = computed(() => this.categoryList());

  readonly filteredArticles = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.articles().filter(article => {
      const matchesSearch = `${article.nom} ${article.typeNom}`.toLowerCase().includes(term);
      return matchesSearch;
    });
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadArticles();
  }

  selectCategory(categoryId: number | null): void {
    this.categoryFilter.set(categoryId);

    if (categoryId === null) {
      this.loadArticles();
      return;
    }

    if (!this.user?.id) {
      return;
    }

    this.dependency.articleService.loadArticlesByCategoryId(categoryId, this.user.id).subscribe({
      next: result => this.articles.set(result ?? []),
      error: error => this.dependency.responseService.showErrorToast(
        error?.error?.message ?? 'Impossible de charger les articles de cette catégorie.'
      )
    });
  }

  private loadCategories(): void {
    if (!this.user?.id) {
      return;
    }

    this.dependency.categoryService.loadCategories(this.user.id).subscribe({
      next: result => this.categoryList.set(result ?? []),
      error: error => this.dependency.responseService.showErrorToast(
        error?.error?.message ?? 'Impossible de charger les catégories.'
      )
    });
  }

  loadArticles(): void {
    if (!this.user?.id) {
      return;
    }

    this.dependency.articleService.loadArticles(this.user.id).subscribe({
      next: result => this.articles.set(result ?? []),
      error: error => this.dependency.responseService.showErrorToast(
        error?.error?.message ?? 'Impossible de charger les articles.'
      )
    });
  }

  getStockLabel(article: SimpleArticleResponse): string {
    const unite = EnumMethodes.getEnumValueByKey(CategoryMesure, article.categoryMesure) ?? '';
    return article.quantity > 0 ?  `${article.quantity } ${unite}s` : `${article.quantity} ${unite}`;
  }
}
