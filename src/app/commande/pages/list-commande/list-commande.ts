import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AdminRoutePath, AdminRoutePaths, RoutePath } from '../../../shared/routing/route-path';

type CommandeStat = {
  label: string;
  value: string;
  icon: string;
  tone: 'gold' | 'info' | 'success' | 'danger';
};

type CommandeMenuItem = {
  title: string;
  route: AdminRoutePath;
  icon: string;
  tone: 'gold' | 'info' | 'success' | 'danger';
  meta: string;
};

@Component({
  selector: 'app-list-commande',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-commande.html',
  styleUrl: './list-commande.css',
})
export class ListCommande {
  private readonly routePath = inject(RoutePath);

  today = new Date().toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  stats: CommandeStat[] = [
    {
      label: 'Acceptees',
      value: '12',
      icon: 'fa-solid fa-clipboard-check',
      tone: 'gold',
    },
    {
      label: 'Terminees',
      value: '5',
      icon: 'fa-solid fa-scissors',
      tone: 'success',
    },
    {
      label: 'Livrees',
      value: '18',
      icon: 'fa-solid fa-bag-shopping',
      tone: 'info',
    },
    {
      label: 'Credit atelier',
      value: '185 000 F',
      icon: 'fa-solid fa-hand-holding-dollar',
      tone: 'danger',
    },
  ];

  menuItems: CommandeMenuItem[] = [
    {
      title: 'Commandes acceptees',
      route: AdminRoutePaths.commandesAcceptees,
      icon: 'fa-solid fa-clipboard-check',
      tone: 'gold',
      meta: 'En cours',
    },
    {
      title: 'Commandes terminees',
      route: AdminRoutePaths.commandesTerminees,
      icon: 'fa-solid fa-circle-check',
      tone: 'success',
      meta: 'Pret',
    },
    {
      title: 'Commandes livrees',
      route: AdminRoutePaths.commandesLivrees,
      icon: 'fa-solid fa-bag-shopping',
      tone: 'info',
      meta: 'Historique',
    },
    {
      title: 'Credits commande',
      route: AdminRoutePaths.creditsCommandes,
      icon: 'fa-solid fa-credit-card',
      tone: 'danger',
      meta: 'Paiement',
    },
  ];

  goToAddCommande(): void {
    this.routePath.toPath(AdminRoutePaths.addCommande);
  }

  goToMenuItem(item: CommandeMenuItem): void {
    this.routePath.toPath(item.route);
  }
}
