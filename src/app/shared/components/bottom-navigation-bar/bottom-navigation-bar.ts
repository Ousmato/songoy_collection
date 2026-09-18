import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { BottomMenue, Menues } from '../../utils/bottom-menue';
import { ActivitySpaceService } from '../../service/activity-space.service';

@Component({
  selector: 'app-bottom-navigation-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-navigation-bar.html',
  styleUrl: './bottom-navigation-bar.css',
})
export class BottomNavigationBar {
  private readonly router = inject(Router);
  private readonly activity = inject(ActivitySpaceService);
  private readonly activeRouteGroups: Record<string, string[]> = {
    Dashboard: ['/admin/dashboard'],
    Commande: [
      '/admin/list-commandes',
      '/admin/add-commande',
      '/admin/commandes-acceptees',
      '/admin/commandes-terminees',
      '/admin/commandes-livrees',
      '/admin/credits-commandes',
    ],
    Stock: [
      '/admin/list-stock',
      '/admin/stock',
      '/admin/list-articles',
      '/admin/add-article',
      '/admin/article-variants',
      '/admin/add-achat',
      '/admin/historique-achat',
      '/admin/list-ventes',
      '/admin/add-vente',
      '/admin/add-reglement',
      '/admin/reglement-credit',
      '/admin/article-list',
      '/admin/stock-par-article',
      '/admin/mouvement-stock',
    ],
    Personnel: [
      '/admin/list-personnel',
      '/admin/personnel-list',
      '/admin/list-users',
      '/admin/clients',
      '/admin/fournisseurs',
      '/admin/add-client',
      '/admin/add-fournisseur',
      '/admin/add-personnel',
    ],
    Settings: [
      '/admin/list-paramettre',
      '/admin/list-article-category',
      '/admin/list-article-type',
      '/admin/list-caracteristique',
      '/admin/list-depenses-atelier',
      '/admin/add-categorie',
      '/admin/add-type-article',
      '/admin/add-depense',
      '/admin/configuration-boutique',
      '/admin/preferences',
    ],
  };

  protected readonly currentUrl = signal(this.router.url);
  protected readonly menuItems = computed<Menues[]>(() => {
    if (!this.activity.canSwitch) return this.resolveMenuItems();
    const shared = BottomMenue.getAdminMenu();
    if (this.activity.space() === 'BOUTIQUE') {
      return shared.filter(item => item.label !== 'Commande');
    }
    return [
      shared.find(item => item.label === 'Commande')!,
      { label: 'Dépenses', icon: 'fa-solid fa-wallet', path: '/admin/list-depenses-atelier' },
      shared.find(item => item.label === 'Personnel')!,
      shared.find(item => item.label === 'Settings')!,
    ];
  });

  protected readonly visibleItems = computed(() =>
    this.menuItems().filter((item) => item.icon && item.label && item.path)
  );

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));
  }

  protected isActive(item: Menues): boolean {
    const url = this.currentUrl();
    const activePaths = this.activeRouteGroups[item.label] ?? [item.path];

    return activePaths.some((path) => url === path || url.startsWith(`${path}/`));
  }

  protected ariaLabel(item: Menues): string {
    return item.label;
  }

  private resolveMenuItems(): Menues[] {
    const items = BottomMenue.getMenueItem();
    const hasUsableItems = items.some((item) => item.icon && item.label && item.path);

    return hasUsableItems ? items : BottomMenue.getAdminMenu();
  }
}
