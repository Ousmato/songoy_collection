import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AddTypeArticle } from '../../../article/components/add-type-article/add-type-article';
import { AddCategorieComponent } from '../../../categorie/components/add-categorie/add-categorie.component';

type SettingQuickAction = {
  key: 'categorie' | 'typeArticle' | 'attribute' | 'paiement' | 'depense';
  label: string;
  route: string;
  icon: string;
  tone: 'gold' | 'info' | 'success' | 'warning';
};

type SettingStat = {
  label: string;
  value: string;
  icon: string;
  tone: 'gold' | 'info' | 'success' | 'warning';
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
export class SettingMenue {
  showAddCategorieModal = signal(false);
  showAddTypeArticleModal = signal(false);
  showAddPaiementModal = signal(false);

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

  stats: SettingStat[] = [
    {
      label: 'Categories',
      value: '15',
      icon: 'fa-solid fa-layer-group',
      tone: 'gold',
    },
    {
      label: 'Types articles',
      value: '9',
      icon: 'fa-solid fa-tags',
      tone: 'info',
    },
    {
      label: 'Salaire du mois',
      value: '485 000 F',
      icon: 'fa-solid fa-money-bill-wave',
      tone: 'success',
    },
    {
      label: 'Depense du mois',
      value: '126 500 F',
      icon: 'fa-solid fa-receipt',
      tone: 'warning',
    },
  ];

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
