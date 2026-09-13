import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { getUserFromSessionStorage } from '../../admin/shared/auth.util';

export type ActivitySpace = 'BOUTIQUE' | 'ATELIER';

@Injectable({ providedIn: 'root' })
export class ActivitySpaceService {
  private readonly selectedSpace = signal<ActivitySpace>('BOUTIQUE');
  readonly space = this.selectedSpace.asReadonly();

  constructor() {
    const router = inject(Router);
    const sync = (url: string) => {
      const path = url.split(/[?#]/)[0];
      if (/^\/admin\/(list-commandes|add-commande|commandes-[^/]+|credits-commandes|list-depenses-atelier)$/.test(path)) {
        this.selectedSpace.set('ATELIER');
      } else if (/^\/admin\/(dashboard|list-ventes|add-vente|list-stock|add-achat|historique-achat|article-list)$/.test(path)) {
        this.selectedSpace.set('BOUTIQUE');
      }
    };
    sync(router.url);
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) sync(event.urlAfterRedirects);
    });
  }

  // The current static shell represents the administrator when no session exists.
  get canSwitch(): boolean {
    const user = getUserFromSessionStorage();
    return !user || user.loginType === 'ADMIN';
  }

  select(space: ActivitySpace): void {
    if (this.canSwitch) this.selectedSpace.set(space);
  }
}
