import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { ModeleArticleFormComponent } from '../../components/modele-article-form/modele-article-form';
import {
  ArticleContextDto,
  ModeleArticleDto,
  ModeleArticleRequestDto,
} from '../../models/article.model';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { DependencyService } from '../../../shared/utils/dependency';

@Component({
  selector: 'app-article-modeles',
  standalone: true,
  imports: [CommonModule, FloatingBackButton, ModeleArticleFormComponent],
  templateUrl: './article-modeles.html',
  styleUrl: './article-modeles.css',
})
export class ArticleModeles implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly dependency = inject(DependencyService);
  private readonly user = getUserFromSessionStorage();

  readonly context = signal<ArticleContextDto | null>(null);
  readonly modeles = signal<ModeleArticleDto[]>([]);
  readonly loading = signal(true);
  readonly loadingModeles = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly formResetKey = signal(0);

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

  loadPage(): void {
    if (!this.user?.id || !this.articleId) return;

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

  loadModeles(): void {
    if (!this.user?.id || !this.articleId) return;

    this.loadingModeles.set(true);
    this.error.set(null);
    this.dependency.articleService.loadModelesArticle(this.articleId, this.user.id)
      .pipe(finalize(() => this.loadingModeles.set(false)))
      .subscribe({
        next: modeles => this.modeles.set(modeles ?? []),
        error: error => this.error.set(this.readError(error, 'Impossible de charger les modèles.')),
      });
  }

  saveModele(request: ModeleArticleRequestDto): void {
    if (!this.user?.id || !this.articleId || this.saving()) return;

    this.saving.set(true);
    this.dependency.articleService.addModeleArticle(this.articleId, request, this.user.id)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: modele => {
          this.modeles.update(current => [...current, modele]);
          this.formResetKey.update(value => value + 1);
          this.dependency.responseService.showSuccessToast('Modèle ajouté avec succès.');
        },
        error: error => this.dependency.responseService.showErrorToast(
          this.readError(error, 'Impossible d’ajouter le modèle.'),
        ),
      });
  }

  private readError(error: unknown, fallback: string): string {
    const message = (error as { error?: { message?: unknown } })?.error?.message;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }
}
