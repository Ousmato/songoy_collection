import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { getUserFromSessionStorage } from '../../shared/auth.util';
import { Entite, PersonnelRole } from '../../model/admin.enum';
import { SimplePersonnelResponse } from '../../model/admin.model';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { DependencyService } from '../../../shared/utils/dependency';
import { EnumMethodes } from '../../../shared/utils/util-methode';

type RoleFilter = 'TOUS' | PersonnelRole;
type EntiteFilter = 'TOUTES' | Entite;

@Component({
  selector: 'app-list-personnel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FloatingBackButton],
  templateUrl: './list-personnel.html',
  styleUrl: './list-personnel.css',
})
export class ListPersonnel implements OnInit {
  private readonly dependency = inject(DependencyService);
  readonly user = getUserFromSessionStorage();

  readonly personnel = signal<SimplePersonnelResponse[]>([]);
  readonly search = signal('');
  readonly roleFilter = signal<RoleFilter>('TOUS');
  readonly entiteFilter = signal<EntiteFilter>('TOUTES');
  readonly loading = signal(false);
  readonly error = signal('');

  readonly filteredPersonnel = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    const role = this.roleFilter();
    const entite = this.entiteFilter();

    return this.personnel().filter(person => {
      const matchesRole = role === 'TOUS' || person.role === role;
      const matchesEntite = entite === 'TOUTES' || person.entite === entite;
      const searchValues = [
        person.nom,
        person.prenom,
        person.telephone,
        person.adresse,
        person.accessCode,
        this.roleLabel(person.role),
        this.entiteLabel(person.entite),
      ];
      const matchesSearch = !query || searchValues.some(value =>
        String(value ?? '').toLocaleLowerCase().includes(query)
      );

      return matchesRole && matchesEntite && matchesSearch;
    });
  });

  readonly totalPersonnel = computed(() => this.personnel().length);
  readonly totalBoutique = computed(() =>
    this.personnel().filter(person => person.entite === Entite.BOUTIQUE).length
  );
  readonly totalAtelier = computed(() =>
    this.personnel().filter(person => person.entite === Entite.ATELIER).length
  );

  readonly roleOptions = computed(() => [...new Set(this.personnel().map(person => person.role))]);
  readonly entiteOptions = computed(() => [...new Set(this.personnel().map(person => person.entite))]);

  ngOnInit(): void {
    this.loadPersonnel();
  }

  loadPersonnel(): void {
    if (!this.user?.id) {
      this.error.set('Votre session a expiré. Reconnectez-vous pour consulter le personnel.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.dependency.adminService.loadPersonnel(this.user.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: personnel => this.personnel.set(personnel ?? []),
        error: error => this.error.set(
          error?.error?.message ?? 'Impossible de charger la liste du personnel.'
        ),
      });
  }

  roleLabel(role: PersonnelRole): string {
    return EnumMethodes.getEnumValueByKey(PersonnelRole, role)!
  }

  entiteLabel(entite: Entite): string {
   return EnumMethodes.getEnumValueByKey(Entite, entite)!
  }

  fullName(person: SimplePersonnelResponse): string {
    return [person.prenom, person.nom].filter(Boolean).join(' ');
  }
}
