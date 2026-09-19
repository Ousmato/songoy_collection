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
      if (/^\/admin\/(list-commandes|add-commande|commandes-[^/]+|credits-commandes)$/.test(path)) {
        this.selectedSpace.set('ATELIER');
      } else if (/^\/admin\/(dashboard|list-ventes|add-vente|list-stock|add-achat|historique-achat|article-list|mouvement-stock)$/.test(path)) {
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
    // Les administrateurs (y compris le super administrateur) ont accès aux
    // deux espaces. Les autres personnels restent dans leur entité.
    return !user || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.loginType === 'ADMIN';
  }

  select(space: ActivitySpace): void {
    if (this.canSwitch) this.selectedSpace.set(space);
  }
}
