import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { catchError, EMPTY, finalize } from 'rxjs';
import { AddTypeArticle } from '../../../article/components/add-type-article/add-type-article';
import { AddCategorieComponent } from '../../../categorie/components/add-categorie/add-categorie.component';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { SettingMenuStats } from '../../model/setting.dto';
import { SettingService } from '../../service/setting.service';

type SettingQuickAction = {
  key: 'categorie' | 'typeArticle' | 'attribute' | 'paiement' | 'depense';
  label: string;
  route: string;
  icon: string;
  tone: 'gold' | 'info' | 'success' | 'warning';
};

type SettingStat = {
  key: 'nombreCategoriesActives' | 'nombreTypesArticlesUtilises' | 'montantSalairesMois' | 'montantAutresDepensesMois';
  label: string;
  icon: string;
  tone: 'gold' | 'info' | 'success' | 'warning';
  format: 'count' | 'currency';
};

type SettingMenuItem = {
  title: string;
  route: string;
  icon: string;
  tone: 'gold' | 'info' | 'success' | 'warning';
};

@Component({
  selector: 'app-setting-menue',
  standalone: true,
  imports: [CommonModule, RouterModule, AddCategorieComponent, AddTypeArticle],
  templateUrl: './setting-menue.html',
  styleUrl: './setting-menue.css',
})
export class SettingMenue implements OnInit {
  private readonly settingService = inject(SettingService);
  readonly user = getUserFromSessionStorage();

  showAddCategorieModal = signal(false);
  showAddTypeArticleModal = signal(false);
  showAddPaiementModal = signal(false);
  readonly stats = signal<SettingMenuStats | null>(null);
  readonly statsLoading = signal(false);
  readonly statsError = signal('');

  private readonly countFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
  private readonly currencyFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

  today = new Date().toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  quickActions: SettingQuickAction[] = [
    {
      key: 'categorie',
      label: 'Categorie',
      route: '/admin/add-categorie',
      icon: 'fa-solid fa-plus',
      tone: 'gold',
    },
    {
      key: 'typeArticle',
      label: 'Type article',
      route: '/admin/add-type-article',
      icon: 'fa-solid fa-plus',
      tone: 'info',
    },
    {
      key: 'attribute',
      label: 'Attribut catégorie',
      route: '/admin/add-attribute',
      icon: 'fa-solid fa-sliders',
      tone: 'success',
    },
  
    {
      key: 'depense',
      label: 'Depense',
      route: '/admin/add-depense',
      icon: 'fa-solid fa-plus',
      tone: 'warning',
    },
  ];

  statCards: SettingStat[] = [
    {
      key: 'nombreCategoriesActives',
      label: 'Catégories actives',
      icon: 'fa-solid fa-layer-group',
      tone: 'gold',
      format: 'count',
    },
    {
      key: 'nombreTypesArticlesUtilises',
      label: 'Types utilisés',
      icon: 'fa-solid fa-tags',
      tone: 'info',
      format: 'count',
    },
    {
      key: 'montantSalairesMois',
      label: 'Salaire du mois',
      icon: 'fa-solid fa-money-bill-wave',
      tone: 'success',
      format: 'currency',
    },
    {
      key: 'montantAutresDepensesMois',
      label: 'Autres dépenses du mois',
      icon: 'fa-solid fa-receipt',
      tone: 'warning',
      format: 'currency',
    },
  ];

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    if (!this.user?.id) {
      this.statsError.set('Votre session ne permet pas de charger les statistiques.');
      return;
    }

    this.statsLoading.set(true);
    this.statsError.set('');
    this.settingService.getMenuStats(this.user.id).pipe(
      catchError(error => {
        const message = error?.error?.message;
        this.statsError.set(
          typeof message === 'string' ? message : 'Impossible de charger les statistiques du menu.',
        );
        return EMPTY;
      }),
      finalize(() => this.statsLoading.set(false)),
    ).subscribe(stats => this.stats.set(stats));
  }

  statValue(card: SettingStat): string {
    const value = this.stats()?.[card.key];
    if (value == null) return this.statsLoading() ? '…' : '—';
    return card.format === 'currency'
      ? `${this.currencyFormatter.format(value)} FCFA`
      : this.countFormatter.format(value);
  }

  menuItems: SettingMenuItem[] = [
    {
      title: 'Categories',
      route: '/admin/list-article-category',
      icon: 'fa-solid fa-layer-group',
      tone: 'gold',
    },
    {
      title: 'Types article',
      route: '/admin/list-article-type',
      icon: 'fa-solid fa-tags',
      tone: 'info',
    },
    {
      title: 'Caractéristiques',
      route: '/admin/list-caracteristique',
      icon: 'fa-solid fa-sliders',
      tone: 'success',
    },
    {
      title: 'Historique paiement',
      route: '/admin/historique-paiement',
      icon: 'fa-solid fa-receipt',
      tone: 'success',
    },
    {
      title: 'Historique des dépenses',
      route: '/admin/list-depenses-atelier',
      icon: 'fa-solid fa-file-invoice-dollar',
      tone: 'warning',
    },
  ];

  openAddCategorieModal(): void {
    this.showAddCategorieModal.set(true);
  }

  closeAddCategorieModal(): void {
    this.showAddCategorieModal.set(false);
  }

  openAddTypeArticleModal(): void {
    this.showAddTypeArticleModal.set(true);
  }

  closeAddTypeArticleModal(): void {
    this.showAddTypeArticleModal.set(false);
  }

  openAddPaiementModal(): void {
    this.showAddPaiementModal.set(true);
  }

  closeAddPaiementModal(): void {
    this.showAddPaiementModal.set(false);
  }

}
