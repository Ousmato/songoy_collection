import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AdminRoutePath, AdminRoutePaths, RoutePath } from '../../../shared/routing/route-path';

type StockMenuItem = {
  title: string;
  route: AdminRoutePath;
  icon: string;
  tone: 'gold' | 'info' | 'success' | 'warning';
};

type StockQuickAction = {
  label: string;
  route: AdminRoutePath;
  icon: string;
  tone: 'gold' | 'info';
};

type StockStat = {
  label: string;
  value: string;
  icon: string;
  tone: 'gold' | 'info' | 'success';
};

@Component({
  selector: 'app-stock-menue',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-menue.html',
  styleUrl: './stock-menue.css',
})
export class StockMenue {
  private readonly routePath = inject(RoutePath);

  today = new Date().toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  quickActions: StockQuickAction[] = [
    {
      label: 'Article',
      route: AdminRoutePaths.addArticle,
      icon: 'fa-solid fa-plus',
      tone: 'gold',
    },
    {
      label: 'Achat',
      route: AdminRoutePaths.addAchat,
      icon: 'fa-solid fa-plus',
      tone: 'info',
    },
    {
      label: 'Couleur',
      route: AdminRoutePaths.addCouleur,
      icon: 'fa-solid fa-plus',
      tone: 'info',
    },
  ];

  stats: StockStat[] = [
    {
      label: 'Valeur en entree',
      value: '1 240 000 FCFA',
      icon: 'fa-solid fa-arrow-trend-up',
      tone: 'success',
    },
    {
      label: 'Valeur sortie',
      value: '780 000 FCFA',
      icon: 'fa-solid fa-arrow-trend-down',
      tone: 'info',
    },
    {
      label: 'Stock du mois',
      value: '3 620 000 FCFA',
      icon: 'fa-solid fa-boxes-stacked',
      tone: 'gold',
    },
  ];

  menuItems: StockMenuItem[] = [
    {
      title: 'Liste articles',
      route: AdminRoutePaths.articleList,
      icon: 'fa-solid fa-box-open',
      tone: 'warning',
    },
    {
      title: "Historique d'achat",
      route: AdminRoutePaths.historiqueAchat,
      icon: 'fa-solid fa-cart-arrow-down',
      tone: 'gold',
    },
    {
      title: 'Stock article',
      route: AdminRoutePaths.stockParArticle,
      icon: 'fa-solid fa-boxes-stacked',
      tone: 'success',
    },
    {
      title: 'Mouvement stock',
      route: AdminRoutePaths.mouvementStock,
      icon: 'fa-solid fa-arrow-right-arrow-left',
      tone: 'info',
    },
  ];

  goToQuickAction(item: StockQuickAction): void {
    if (item.route === AdminRoutePaths.addAchat) {
      this.routePath.toAddAchat();
      return;
    }

    this.routePath.toPath(item.route);
  }

  goToMenuItem(item: StockMenuItem): void {
    this.routePath.toPath(item.route);
  }
}
