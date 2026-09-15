import { Location } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-floating-back-button',
  standalone: true,
  imports: [],
  templateUrl: './floating-back-button.html',
  styleUrl: './floating-back-button.css',
})
export class FloatingBackButton {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  @Input() fallbackUrl = '/admin/dashboard';
  @Input() ariaLabel = 'Retour';
  @Input() direct = false;
  @Input() useHistory = false;

  private readonly menuReturnRoutes = [
    {
      parent: '/admin/list-commandes',
      routes: [
        '/admin/add-commande',
        '/admin/commandes-acceptees',
        '/admin/commandes-terminees',
        '/admin/commandes-livrees',
        '/admin/credits-commandes',
      ],
    },
    {
      parent: '/admin/list-stock',
      routes: [
        '/admin/list-articles',
        '/admin/add-article',
        '/admin/article-variants',
        '/admin/historique-achat',
        '/admin/list-ventes',
        '/admin/add-vente',
        '/admin/add-reglement',
        '/admin/reglement-credit',
        '/admin/article-list',
        '/admin/stock-par-article',
        '/admin/mouvement-stock',
        '/admin/add-achat',
      ],
    },
    {
      parent: '/admin/list-personnel',
      routes: [
        '/admin/personnel-list',
        '/admin/list-users',
        '/admin/clients',
        '/admin/fournisseurs',
        '/admin/add-client',
        '/admin/add-fournisseur',
        '/admin/add-personnel',
      ],
    },
    {
      parent: '/admin/list-paramettre',
      routes: [
        '/admin/list-article-category',
        '/admin/list-article-type',
        '/admin/list-caracteristique',
        '/admin/add-attribute',
        '/admin/list-depenses-atelier',
        '/admin/configuration-boutique',
        '/admin/preferences',
      ],
    },
  ];

  goBack(): void {
    if (this.useHistory && this.hasBrowserHistory()) {
      this.location.back();
      return;
    }

    this.router.navigateByUrl(this.resolveReturnUrl());
  }

  private hasBrowserHistory(): boolean {
    return typeof window !== 'undefined' && window.history.length > 1;
  }

  private resolveReturnUrl(): string {
    if (this.direct) {
      return this.fallbackUrl;
    }

    const currentUrl = this.router.url.split('?')[0].split('#')[0];
    const match = this.menuReturnRoutes.find(group =>
      group.routes.some(route => currentUrl === route || currentUrl.startsWith(`${route}/`))
    );

    return match?.parent ?? this.fallbackUrl;
  }
}
