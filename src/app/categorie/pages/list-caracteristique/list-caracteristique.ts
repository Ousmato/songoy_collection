import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { DependencyService } from '../../../shared/utils/dependency';
import { CategoryAttributeDto } from '../../models/categorie.dto';

@Component({
  selector: 'app-list-caracteristique',
  standalone: true,
  imports: [FloatingBackButton],
  templateUrl: './list-caracteristique.html',
  styleUrl: './list-caracteristique.css'
})
export class ListCaracteristique implements OnInit {
  readonly user = getUserFromSessionStorage();
  readonly dependency = inject(DependencyService);

  readonly categories = signal<CategoryAttributeDto[]>([]);
  readonly search = signal('');

  readonly filteredCaracteristiques = computed(() => {
    const term = this.search().trim().toLowerCase();

    return this.categories().filter(category => {
      const categoryText = category.categoryNom ?? '';
      const attributesText = (category.attributes ?? [])
        .map(attribute => `${attribute.label} ${attribute.key} ${attribute.niveau}`)
        .join(' ');

      return `${categoryText} ${attributesText}`
        .toLowerCase()
        .includes(term);
    });
  });

  ngOnInit(): void {
    this.loadCaracteristiques();
  }

  loadCaracteristiques(): void {
    if (!this.user?.id) {
      return;
    }

    this.dependency.categoryService
      .loadAllCategoryAttributes(this.user.id)
      .subscribe({
        next: result => this.categories.set(result ?? []),
        error: error => this.dependency.responseService.showErrorToast(
          error?.error?.message ?? 'Impossible de charger les caractéristiques.'
        )
      });
  }

  typeLabel(type: string): string {
    return ({
      TEXT: 'Texte',
      NUMBER: 'Nombre',
      SELECT: 'Liste',
      DATE: 'Date'
    } as Record<string, string>)[type] ?? type;
  }

  niveauLabel(niveau: 'DECLINAISON' | 'VARIANTE'): string {
    return niveau === 'DECLINAISON' ? 'Déclinaison' : 'Variante';
  }
}
