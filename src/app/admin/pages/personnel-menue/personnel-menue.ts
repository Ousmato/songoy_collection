import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { catchError, EMPTY, finalize } from 'rxjs';
import { PersonnelMenuStatsDto } from '../../model/admin.model';
import { getUserFromSessionStorage } from '../../shared/auth.util';
import { DependencyService } from '../../../shared/utils/dependency';

type PersonnelQuickAction = {
  label: string;
  route: string;
  icon: string;
  tone: 'gold' | 'info' | 'success';
};

type PersonnelStatCard = {
  key: keyof PersonnelMenuStatsDto;
  label: string;
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
export class PersonnelMenue implements OnInit {
  private readonly dependency = inject(DependencyService);
  readonly user = getUserFromSessionStorage();
  readonly statsLoading = signal(false);
  readonly statsError = signal(false);
  readonly stats = signal<PersonnelMenuStatsDto | null>(null);

  readonly statCards: PersonnelStatCard[] = [
    {
      key: 'nombreClients',
      label: 'Nombre de clients',
      icon: 'fa-solid fa-user-group',
      tone: 'gold',
    },
    {
      key: 'nombreFournisseurs',
      label: 'Nombre fournisseurs',
      icon: 'fa-solid fa-truck-fast',
      tone: 'info',
    },
    {
      key: 'nombrePersonnel',
      label: 'Nombre personnel',
      icon: 'fa-solid fa-users-gear',
      tone: 'success',
    },
  ];

  today = new Date().toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  ngOnInit(): void {
    this.loadStats();
  }

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

  loadStats(): void {
    if (!this.user?.id) {
      this.statsError.set(true);
      return;
    }

    const idAdmin = this.user.id;
    this.statsLoading.set(true);
    this.statsError.set(false);

    this.dependency.adminService.loadPersonnelMenuStats(idAdmin).pipe(
      catchError(() => {
        this.statsError.set(true);
        return EMPTY;
      }),
      finalize(() => this.statsLoading.set(false)),
    ).subscribe(stats => this.stats.set(stats));
  }

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
