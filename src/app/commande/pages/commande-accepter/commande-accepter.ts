import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { CommandeResponse, LigneCommandeResponse } from '../../model/commande.model';
import { DependencyService } from '../../../shared/utils/dependency';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { HabitType, HabitTypeKey } from '../../../shared/model/util.enum';

@Component({
  selector: 'app-commande-accepter',
  standalone: true,
  imports: [CommonModule, FloatingBackButton],
  templateUrl: './commande-accepter.html',
  styleUrl: './commande-accepter.css',
})
export class CommandeAccepter implements OnInit {
  user = getUserFromSessionStorage();
  commandesAcceptees: CommandeResponse[] = [];
  dependencyService = inject(DependencyService);
  expandedCommandeIds = signal<number[]>([]);
  lastFinishedCommande = signal<CommandeResponse | null>(null);

  today = new Date().toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  ngOnInit(): void {
    this.loadCommandesAcceptees();
  }

  loadCommandesAcceptees() {
    if (!this.user) {
      return;
    }
    this.dependencyService.commandeService.loadCommandesByStatut(this.user.id, 'ACCEPTER').subscribe({
      next: (response) => {
        this.commandesAcceptees = response;
      },
      error: (err) => {
        this.dependencyService.responseService.showErrorToast(err.error.message);
      },
    });
  }

  toggleDetails(idCommande: number): void {
    const ids = this.expandedCommandeIds();

    if (ids.includes(idCommande)) {
      this.expandedCommandeIds.set(ids.filter(id => id !== idCommande));
      return;
    }

    this.expandedCommandeIds.set([...ids, idCommande]);
  }

  isExpanded(idCommande: number): boolean {
    return this.expandedCommandeIds().includes(idCommande);
  }

  terminerCommande(commande: CommandeResponse): void {
    this.lastFinishedCommande.set({ ...commande, statut: 'TERMINER' });
    this.commandesAcceptees = this.commandesAcceptees.filter(item => item.id !== commande.id);
    this.expandedCommandeIds.set(this.expandedCommandeIds().filter(id => id !== commande.id));
    console.log('Terminer commande simulation', commande);
  }

  totalPieces(commande: CommandeResponse): number {
    return commande.lignes?.reduce((total, ligne) => total + Number(ligne.quantite || 0), 0) ?? 0;
  }

  totalAcceptedPieces(): number {
    return this.commandesAcceptees.reduce((total, commande) => total + this.totalPieces(commande), 0);
  }

  totalAcceptedReste(): number {
    return this.commandesAcceptees.reduce((total, commande) => total + Number(commande.reste || 0), 0);
  }

  totalMatiere(commande: CommandeResponse): number {
    return commande.lignes?.reduce(
      (total, ligne) => total + (Number(ligne.quantite || 0) * Number(ligne.prixMatiere || 0)),
      0,
    ) ?? 0;
  }

  totalCouture(commande: CommandeResponse): number {
    return commande.lignes?.reduce(
      (total, ligne) => total + (Number(ligne.quantite || 0) * Number(ligne.prixUnitaire || 0)),
      0,
    ) ?? 0;
  }

  ligneTotal(ligne: LigneCommandeResponse): number {
    return ligne.total || Number(ligne.quantite || 0) * (
      Number(ligne.prixUnitaire || 0) + Number(ligne.prixMatiere || 0)
    );
  }

  habitLabel(type?: HabitTypeKey): string {
    return type ? HabitType[type] ?? type : 'Habit';
  }

  clientName(commande?: CommandeResponse | null): string {
    return commande?.clientNom?.trim() || 'Client atelier';
  }

  clientInitial(commande: CommandeResponse): string {
    return this.clientName(commande).slice(0, 1);
  }

  formatDate(date?: Date): string {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
