import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DependencyService } from '../../../shared/utils/dependency';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { articleTypes } from '../../models/article-type';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';

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
  articleTypes = articleTypes;
  dependencyService = inject(DependencyService);

  accents = ['gold', 'purple', 'teal', 'orange', 'success', 'info'];

  ngOnInit(): void {}
}
