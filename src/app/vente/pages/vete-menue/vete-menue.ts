import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AdminRoutePath, AdminRoutePaths, RoutePath } from '../../../shared/routing/route-path';

type VenteStat = {
  label: string;
  value: string;
  helper: string;
  icon: string;
  tone: 'gold' | 'danger';
};

type VenteMenuItem = {
  title: string;
  description: string;
  route: AdminRoutePath;
  icon: string;
  tone: 'gold' | 'info' | 'warning';
  meta: string;
};

type VenteQuickAction = {
  label: string;
  route: AdminRoutePath;
  icon: string;
  tone: 'gold' | 'info' | 'warning';
};

@Component({
  selector: 'app-vete-menue',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vete-menue.html',
  styleUrl: './vete-menue.css',
})
export class VeteMenue {
  private readonly routePath = inject(RoutePath);

  today = new Date().toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  stats: VenteStat[] = [
    {
      label: 'Vente total du mois',
      value: '2 845 000 FCFA',
      helper: 'Simulation mensuelle',
      icon: 'fa-solid fa-chart-line',
      tone: 'gold',
    },
    {
      label: 'Credit non paye du mois',
      value: '385 000 FCFA',
      helper: 'A suivre en priorite',
      icon: 'fa-solid fa-hand-holding-dollar',
      tone: 'danger',
    },
  ];

  quickActions: VenteQuickAction[] = [
    {
      label: 'Vente',
      route: AdminRoutePaths.addVente,
      icon: 'fa-solid fa-plus',
      tone: 'gold',
    },
    {
      label: 'Reglement',
      route: AdminRoutePaths.addReglement,
      icon: 'fa-solid fa-plus',
      tone: 'warning',
    },
  ];

  menuItems: VenteMenuItem[] = [
    {
      title: 'Liste de ventes',
      description: 'Consulter les ventes, les montants encaisses et les moyens de paiement.',
      route: AdminRoutePaths.listVentes,
      icon: 'fa-solid fa-receipt',
      tone: 'gold',
      meta: 'Historique',
    },
    {
      title: 'Credit et reglement',
      description: 'Suivre les credits clients, les avances et les paiements restants.',
      route: AdminRoutePaths.reglementCredit,
      icon: 'fa-solid fa-credit-card',
      tone: 'warning',
      meta: 'Paiements',
    },
  ];

  goToQuickAction(item: VenteQuickAction): void {
    if (item.route === AdminRoutePaths.addVente) {
      this.routePath.toAddVente();
      return;
    }

    this.routePath.toPath(item.route);
  }

  goToMenuItem(item: VenteMenuItem): void {
    this.routePath.toPath(item.route);
  }
}
