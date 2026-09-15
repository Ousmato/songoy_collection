import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DependencyService } from '../../../shared/utils/dependency';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { ArticleTypeResponse } from '../../models/article-type';

@Component({
  selector: 'app-list-type-article',
  standalone: true,
  imports: [CommonModule, FloatingBackButton],
  templateUrl: './list-type-article.html',
  styleUrl: './list-type-article.css',
})
export class ListTypeArticle implements OnInit {
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  user = getUserFromSessionStorage();
  articleTypes = signal<(ArticleTypeResponse[])>([]);
  dependencyService = inject(DependencyService);
  readonly accents = ['gold', 'purple', 'orange', 'teal'];

  search = signal('');
  filterArticleType = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.articleTypes();
    return this.articleTypes().filter(artype =>
        `${artype.nom} ${artype.description}`
        .toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadArticleType()
  }

  loadArticleType(){
    if(this.user){
      this.dependencyService.articleService.loadArticleType(this.user.id).subscribe({
        next: (result) => {
          this.articleTypes.set(result)
        },
        error: (err) => this.dependencyService.responseService.showErrorToast(err.error.message)
      })
    }
  }
}
