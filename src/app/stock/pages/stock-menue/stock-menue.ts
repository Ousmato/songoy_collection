import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { DashboardIndicateurs } from '../../../dashbord/model/dashboard';
import { DependencyService } from '../../../shared/utils/dependency';
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
  key: 'valeurEntree' | 'valeurSortie' | 'valeurStock';
  label: string;
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
export class StockMenue implements OnInit {
  private readonly routePath = inject(RoutePath);
  private readonly dependency = inject(DependencyService);
  private readonly user = getUserFromSessionStorage();

  readonly indicateurs = signal<DashboardIndicateurs | null>(null);
  readonly statsLoading = signal(false);
  readonly statsError = signal(false);

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
      label: 'Vente',
      route: AdminRoutePaths.addVente,
      icon: 'fa-solid fa-cash-register',
      tone: 'info',
    },
  ];

  readonly stats: StockStat[] = [
    {
      key: 'valeurEntree',
      label: 'Valeur des entrées du mois',
      icon: 'fa-solid fa-arrow-trend-up',
      tone: 'success',
    },
    {
      key: 'valeurSortie',
      label: 'Valeur des sorties du mois',
      icon: 'fa-solid fa-arrow-trend-down',
      tone: 'info',
    },
    {
      key: 'valeurStock',
      label: 'Valeur actuelle du stock',
      icon: 'fa-solid fa-boxes-stacked',
      tone: 'gold',
    },
  ];

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    if (!this.user?.id) {
      this.statsError.set(true);
      return;
    }

    const aujourdHui = new Date();
    const dateFin = this.toDateParam(aujourdHui);
    const dateDebut = `${dateFin.slice(0, 7)}-01`;

    this.statsLoading.set(true);
    this.statsError.set(false);

    this.dependency.dashboardService.getIndicateurs(this.user.id, dateDebut, dateFin).pipe(
      catchError(() => {
        this.statsError.set(true);
        return EMPTY;
      }),
      finalize(() => this.statsLoading.set(false)),
    ).subscribe(result => this.indicateurs.set(result));
  }

  formatMoney(value: number): string {
    return `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`;
  }

  private toDateParam(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

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
      title: 'Historique des ventes',
      route: AdminRoutePaths.listVentes,
      icon: 'fa-solid fa-receipt',
      tone: 'info',
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

    if (item.route === AdminRoutePaths.addVente) {
      this.routePath.toAddVente();
      return;
    }

    this.routePath.toPath(item.route);
  }

  goToMenuItem(item: StockMenuItem): void {
    this.routePath.toPath(item.route);
  }
}
