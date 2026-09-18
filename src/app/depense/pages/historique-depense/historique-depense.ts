import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { DepenseHistoriqueDto } from '../../model/depense.model';
import { DepenseService } from '../../services/depense.service';

type EntiteFilter = 'TOUTES' | 'BOUTIQUE' | 'ATELIER';

@Component({
  selector: 'app-historique-depense',
  standalone: true,
  imports: [CommonModule, RouterLink, FloatingBackButton],
  templateUrl: './historique-depense.html',
  styleUrl: './historique-depense.css',
})
export class HistoriqueDepense implements OnInit {
  private readonly depenseService = inject(DepenseService);
  private readonly user = getUserFromSessionStorage();
  private readonly today = new Date();

  readonly startDate = signal(this.toIsoDate(new Date(this.today.getFullYear(), this.today.getMonth(), 1)));
  readonly endDate = signal(this.toIsoDate(this.today));
  readonly search = signal('');
  readonly entiteFilter = signal<EntiteFilter>('TOUTES');
  readonly depenses = signal<DepenseHistoriqueDto[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly filteredDepenses = computed(() => {
    const search = this.search().trim().toLowerCase();
    const entity = this.entiteFilter();

    return this.depenses().filter(depense => {
      const matchesEntity = entity === 'TOUTES' || String(depense.entite) === entity;
      const matchesSearch = !search || [
        depense.libelle,
        depense.motif,
        depense.fournisseur,
        depense.personnelBeneficiaire,
        depense.modePaiement,
        depense.entite,
      ].some(value => String(value ?? '').toLowerCase().includes(search));

      return matchesEntity && matchesSearch;
    });
  });

  readonly totalDepenses = computed(() =>
    this.filteredDepenses().reduce((total, depense) => total + depense.montant, 0),
  );

  readonly averageDepense = computed(() => {
    const count = this.filteredDepenses().length;
    return count ? this.totalDepenses() / count : 0;
  });

  ngOnInit(): void {
    this.loadHistorique();
  }

  loadHistorique(): void {
    const adminId = this.user?.id;
    if (!adminId) {
      this.error.set('Votre session a expiré. Reconnectez-vous.');
      return;
    }

    const debut = this.startDate();
    const fin = this.endDate();
    if (debut > fin) {
      this.error.set('La date de début doit être antérieure ou égale à la date de fin.');
      return;
    }
    if (fin > this.toIsoDate(this.today)) {
      this.error.set('La date de fin ne peut pas être future.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.depenseService.getHistoriqueDepenses(adminId, debut, fin)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: depenses => this.depenses.set(depenses),
        error: error => this.error.set(this.readError(error)),
      });
  }

  setDate(target: 'start' | 'end', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    target === 'start' ? this.startDate.set(value) : this.endDate.set(value);
  }

  resetFilters(): void {
    this.startDate.set(this.toIsoDate(new Date(this.today.getFullYear(), this.today.getMonth(), 1)));
    this.endDate.set(this.toIsoDate(this.today));
    this.search.set('');
    this.entiteFilter.set('TOUTES');
    this.loadHistorique();
  }

  private readError(error: any): string {
    const message = error?.error?.message;
    return typeof message === 'string' && message.trim()
      ? message
      : 'Impossible de charger l’historique des dépenses.';
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
