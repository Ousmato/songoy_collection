import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

type PersonnelQuickAction = {
  label: string;
  route: string;
  icon: string;
  tone: 'gold' | 'info' | 'success';
};

type PersonnelStat = {
  label: string;
  value: string;
  icon: string;
  tone: 'gold' | 'info' | 'success';
};

type PersonnelMenuItem = {
  title: string;
  route: string;
  icon: string;
  tone: 'gold' | 'info' | 'success';
};

@Component({
  selector: 'app-personnel-menue',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './personnel-menue.html',
  styleUrl: './personnel-menue.css',
})
export class PersonnelMenue {
  today = new Date().toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  quickActions: PersonnelQuickAction[] = [
    {
      label: 'Client',
      route: '/admin/add-client',
      icon: 'fa-solid fa-plus',
      tone: 'gold',
    },
    {
      label: 'Fournisseur',
      route: '/admin/add-fournisseur',
      icon: 'fa-solid fa-plus',
      tone: 'info',
    },
    {
      label: 'Personnel',
      route: '/admin/add-personnel',
      icon: 'fa-solid fa-plus',
      tone: 'success',
    },
  ];

  stats: PersonnelStat[] = [
    {
      label: 'Nombre de clients',
      value: '248',
      icon: 'fa-solid fa-user-group',
      tone: 'gold',
    },
    {
      label: 'Nombre fournisseurs',
      value: '32',
      icon: 'fa-solid fa-truck-fast',
      tone: 'info',
    },
    {
      label: 'Nombre personnel',
      value: '18',
      icon: 'fa-solid fa-users-gear',
      tone: 'success',
    },
  ];

  menuItems: PersonnelMenuItem[] = [
    {
      title: 'Liste personnel',
      route: '/admin/personnel-list',
      icon: 'fa-solid fa-users-gear',
      tone: 'success',
    },
    {
      title: 'Liste client',
      route: '/admin/list-users',
      icon: 'fa-solid fa-user-group',
      tone: 'gold',
    },
    {
      title: 'Liste fournisseur',
      route: '/admin/fournisseurs',
      icon: 'fa-solid fa-truck-fast',
      tone: 'info',
    },
  ];
}
