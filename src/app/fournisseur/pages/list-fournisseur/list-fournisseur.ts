import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { DependencyService } from '../../../shared/utils/dependency';
import { AddFournisseur } from '../../components/add-fournisseur/add-fournisseur';
import { FournisseurResponse } from '../../models/fournisseur.model';

@Component({
  selector: 'app-list-fournisseur',
  standalone: true,
  imports: [CommonModule, FormsModule, FloatingBackButton, AddFournisseur],
  templateUrl: './list-fournisseur.html',
  styleUrl: './list-fournisseur.css',
})
export class ListFournisseur implements OnInit {
  private readonly dependency = inject(DependencyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly user = getUserFromSessionStorage();

  readonly fournisseurs = signal<FournisseurResponse[]>([]);
  readonly search = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly addModalOpen = signal(false);
  private readonly openedFromAddRoute: boolean;

  readonly filteredFournisseurs = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    if (!query) return this.fournisseurs();

    return this.fournisseurs().filter(fournisseur => [
      fournisseur.nom,
      fournisseur.prenom,
      fournisseur.telephone,
      fournisseur.adresse,
      fournisseur.adminResponsable?.nom,
      fournisseur.adminResponsable?.prenom,
    ].some(value => String(value ?? '').toLocaleLowerCase().includes(query)));
  });

  constructor() {
    this.openedFromAddRoute = this.route.snapshot.data['openAddModal'] === true;
    this.addModalOpen.set(this.openedFromAddRoute);
  }

  ngOnInit(): void {
    this.loadFournisseurs();
  }

  loadFournisseurs(): void {
    if (!this.user?.id) {
      this.error.set('Votre session a expiré. Reconnectez-vous pour consulter les fournisseurs.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.dependency.fournisseurService.loadFournisseurs(this.user.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: fournisseurs => this.fournisseurs.set(fournisseurs ?? []),
        error: error => this.error.set(
          error?.error?.message ?? 'Impossible de charger la liste des fournisseurs.'
        ),
      });
  }

  openAddModal(): void {
    this.addModalOpen.set(true);
  }

  closeAddModal(): void {
    this.addModalOpen.set(false);
    if (this.openedFromAddRoute) {
      this.router.navigate(['/admin/fournisseurs'], { replaceUrl: true });
    }
  }

  onFournisseurSaved(): void {
    this.loadFournisseurs();
  }

  fullName(fournisseur: FournisseurResponse): string {
    return [fournisseur.prenom, fournisseur.nom].filter(Boolean).join(' ');
  }

  adminName(fournisseur: FournisseurResponse): string {
    const responsable = fournisseur.adminResponsable;
    return responsable ? [responsable.prenom, responsable.nom].filter(Boolean).join(' ') : '—';
  }

}
