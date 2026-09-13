import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

type MenuItem = {
  label: string;
  icon: string;
  route: string;
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  collapsed = signal(false);

  menuItems: MenuItem[] = [
    { label: 'Dashboard',   icon: 'fa-gauge-high',       route: '/app/dashboard' },
    { label: 'Achats',      icon: 'fa-cart-shopping',   route: '/app/achats' },
    { label: 'Ventes',      icon: 'fa-tag',             route: '/app/ventes' },
    { label: 'Articles',    icon: 'fa-shirt',           route: '/app/articles' },
    { label: 'Stock',       icon: 'fa-boxes-stacked',   route: '/app/stock' },
    { label: 'Catégories',  icon: 'fa-layer-group',     route: '/app/categories' },
    { label: 'Clients',     icon: 'fa-users',           route: '/app/clients' },
    { label: 'Fournisseurs',icon: 'fa-truck-fast',      route: '/app/fournisseurs' },
  ];

  activeItem = signal<string>('Dashboard');

  toggle() {
    this.collapsed.set(!this.collapsed());
  }

  selectItem(label: string) {
    this.activeItem.set(label);
  }
}
