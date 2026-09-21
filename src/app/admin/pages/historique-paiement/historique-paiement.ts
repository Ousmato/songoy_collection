import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { getUserFromSessionStorage } from '../../shared/auth.util';
import { Entite, PersonnelRole } from '../../model/admin.enum';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { DepenseService } from '../../../depense/services/depense.service';
import { SalaireHistoriqueDto, SalaireStatistiquesDto } from '../../../depense/model/depense.model';
import { ModePaiement } from '../../../shared/model/util.enum';
import { EnumMethodes } from '../../../shared/utils/util-methode';

type EntiteFilter = 'TOUTES' | keyof typeof Entite;

@Component({
  selector: 'app-historique-paiement',
  standalone: true,
  imports: [CommonModule, FloatingBackButton],
  templateUrl: './historique-paiement.html',
  styleUrl: './historique-paiement.css',
})
export class HistoriquePaiement implements OnInit {
  private readonly depenseService = inject(DepenseService);
  private readonly user = getUserFromSessionStorage();
  private readonly today = new Date();

  readonly periodeSalaire = signal(this.toSalaryPeriod(this.today));
  readonly entite = signal<EntiteFilter>('TOUTES');
  readonly search = signal('');


  readonly salaires = signal<SalaireHistoriqueDto[]>([]);
  readonly statistiques = signal<SalaireStatistiquesDto | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly filteredSalaires = computed(() => {
    const term = this.search().trim().toLocaleLowerCase();
    if (!term) return this.salaires();

    return this.salaires().filter(salaire => [
      salaire.personnelBeneficiaire,
      salaire.personnelResponsable,
      salaire.libelle,
      salaire.periodeSalaire,
      this.roleLabel(salaire.roleBeneficiaire),
      this.modePaiementLabel(salaire.modePaiement),
      this.entiteLabel(salaire.entite),
    ].some(value => String(value ?? '').toLocaleLowerCase().includes(term)));
  });

  ngOnInit(): void {
    this.loadHistorique();
  }

  loadHistorique(): void {
    const adminId = this.user?.id;
    if (!adminId) {
      this.statistiques.set(null);
      this.error.set('Votre session a expiré. Reconnectez-vous pour consulter les salaires.');
      return;
    }

    const periodeSalaire = this.periodeSalaire().trim();
    if (!periodeSalaire) {
      this.salaires.set([]);
      this.statistiques.set(null);
      this.error.set('Sélectionnez le mois rémunéré à consulter.');
      return;
    }

    const selectedEntite = this.entite();
    const filters = {
      entite: selectedEntite === 'TOUTES' ? undefined : selectedEntite,
      periodeSalaire,
    };

    this.loading.set(true);
    this.error.set('');
    forkJoin({
      salaires: this.depenseService.getHistoriqueSalaires(adminId, filters),
      statistiques: this.depenseService.getStatistiquesSalaires(adminId, filters),
    }).pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ salaires, statistiques }) => {
          this.salaires.set(salaires ?? []);
          this.statistiques.set(statistiques);
        },
        error: error => {
          this.statistiques.set(null);
          this.error.set(this.readError(error));
        },
      });
  }

  setSalaryPeriod(event: Event): void {
    const periodeSalaire = (event.target as HTMLInputElement).value;
    this.periodeSalaire.set(periodeSalaire);
    if (periodeSalaire) this.loadHistorique();
  }

  setEntite(entite: EntiteFilter): void {
    if (this.entite() === entite) return;
    this.entite.set(entite);
    this.loadHistorique();
  }

  entiteLabel(entite?: keyof typeof Entite): string {
    return entite ? EnumMethodes.getEnumValueByKey(Entite, entite) || entite : 'Non renseignée';
  }

  roleLabel(role?: keyof typeof PersonnelRole): string {
    return role ? EnumMethodes.getEnumValueByKey(PersonnelRole, role) || role : '';
  }

  modePaiementLabel(mode?: keyof typeof ModePaiement): string {
    return mode ? EnumMethodes.getEnumValueByKey(ModePaiement, mode) || mode : 'Non renseigné';
  }

  salaryPeriodLabel(period?: string): string {
    if (!period || !/^\d{4}-\d{2}$/.test(period)) return 'Période non renseignée';
    const [year, month] = period.split('-').map(Number);
    return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
      .format(new Date(year, month - 1, 1));
  }

  private readError(error: unknown): string {
    const message = (error as { error?: { message?: unknown } })?.error?.message;
    return typeof message === 'string' && message.trim()
      ? message
      : 'Impossible de charger l’historique des salaires.';
  }

  private toSalaryPeriod(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}
