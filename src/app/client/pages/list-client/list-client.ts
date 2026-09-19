import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { Entite } from '../../../admin/model/admin.enum';
import { Client } from '../../models/client.model';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { DependencyService } from '../../../shared/utils/dependency';
import { EnumMethodes } from '../../../shared/utils/util-methode';

type EntiteFilter = 'TOUTES' | Entite;

@Component({
  selector: 'app-list-client',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FloatingBackButton],
  templateUrl: './list-client.html',
  styleUrl: './list-client.css',
})
export class ListClient implements OnInit {
  private readonly dependency = inject(DependencyService);
  readonly user = getUserFromSessionStorage();

  readonly clients = signal<Client[]>([]);
  readonly search = signal('');
  readonly entiteFilter = signal<EntiteFilter>('TOUTES');
  readonly loading = signal(false);
  readonly error = signal('');

  readonly filteredClients = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    const entite = this.entiteFilter();

    return this.clients().filter(client => {
      const matchesEntite = entite === 'TOUTES' || client.entite === entite;
      const searchValues = [
        client.nom,
        client.prenom,
        client.telephone,
        client.adresse,
        this.entiteLabel(client.entite),
      ];
      const matchesSearch = !query || searchValues.some(value =>
        String(value ?? '').toLocaleLowerCase().includes(query)
      );

      return matchesEntite && matchesSearch;
    });
  });

  readonly totalClients = computed(() => this.clients().length);
  readonly totalBoutique = computed(() =>
    this.clients().filter(client => client.entite === Entite.BOUTIQUE).length
  );
  readonly totalAtelier = computed(() =>
    this.clients().filter(client => client.entite === Entite.ATELIER).length
  );
  readonly entiteOptions = computed(() =>
    [...new Set(this.clients().map(client => client.entite).filter((entite): entite is Entite => !!entite))]
  );

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    if (!this.user?.id) {
      this.error.set('Votre session a expiré. Reconnectez-vous pour consulter les clients.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.dependency.clientService.loadClients(this.user.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: clients => this.clients.set(clients ?? []),
        error: error => this.error.set(
          error?.error?.message ?? 'Impossible de charger la liste des clients.'
        ),
      });
  }

  entiteLabel(entite?: Entite | null): string {
    return entite ? EnumMethodes.getEnumValueByKey(Entite, entite) ?? entite : 'Non définie';
  }

  fullName(client: Client): string {
    return [client.prenom, client.nom].filter(Boolean).join(' ');
  }

  initials(client: Client): string {
    return `${client.prenom?.charAt(0) ?? ''}${client.nom?.charAt(0) ?? ''}`;
  }
}
