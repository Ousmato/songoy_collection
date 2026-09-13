import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, signal } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { CouleurResponse } from '../../../article/models/article-couleur.model';
import { LigneVenteRequest, VenteRequest } from '../../models/vente.model';

export type VenteLigneDraft = LigneVenteRequest & {
  couleur: string;
};

@Component({
  selector: 'app-add-vente-sommary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-vente-sommary.html',
  styleUrl: './add-vente-sommary.css',
})
export class AddVenteSommary implements OnChanges {
  @Input({ required: true }) venteForm!: FormGroup;
  @Input() selectedCouleurs: CouleurResponse[] = [];

  @Output() submitVente = new EventEmitter<VenteRequest>();
  @Output() removeCouleur = new EventEmitter<number>();

  lignes = signal<VenteLigneDraft[]>([]);
  submitted = signal(false);

  ngOnChanges(): void {
    const current = this.lignes();
    const next = this.selectedCouleurs.map(couleur => {
      const existing = current.find(ligne => ligne.idCouleur === couleur.id);
      return existing ?? {
        idCouleur: couleur.id,
        couleur: couleur.nom,
        quantite: 1,
        prix: 0,
      };
    });

    this.lignes.set(next);
  }

  updateQuantite(idCouleur: number, value: string): void {
    this.updateLine(idCouleur, { quantite: Math.max(1, Number(value) || 1) });
  }

  updatePrix(idCouleur: number, value: string): void {
    this.updateLine(idCouleur, { prix: Math.max(0, Number(value) || 0) });
  }

  removeLine(idCouleur: number): void {
    this.lignes.set(this.lignes().filter(ligne => ligne.idCouleur !== idCouleur));
    this.removeCouleur.emit(idCouleur);
  }

  totalArticles(): number {
    return this.lignes().reduce((total, ligne) => total + ligne.quantite, 0);
  }

  totalVente(): number {
    return this.lignes().reduce((total, ligne) => total + (ligne.quantite * ligne.prix), 0);
  }

  hasClientInfo(): boolean {
    const formValue = this.venteForm?.value;
    return Boolean(formValue?.clientId || formValue?.clientNom?.trim());
  }

  submit(): void {
    this.submitted.set(true);

    if (
      !this.venteForm.valid ||
      !this.hasClientInfo() ||
      !this.lignes().length ||
      this.lignes().some(ligne => !ligne.quantite || !ligne.prix)
    ) {
      this.venteForm.markAllAsTouched();
      return;
    }

    const formValue = this.venteForm.value;
    const request: VenteRequest = {
      date: new Date(formValue.date),
      modePaiement: formValue.modePaiement,
      clientId: formValue.clientId ? Number(formValue.clientId) : undefined,
      clientNom: formValue.clientId ? undefined : formValue.clientNom?.trim() || undefined,
      lignes: this.lignes().map(({ idCouleur, quantite, prix }) => ({
        idCouleur,
        quantite: Number(quantite),
        prix: Number(prix),
      })),
    };

    this.submitVente.emit(request);
  }

  private updateLine(idCouleur: number, patch: Partial<VenteLigneDraft>): void {
    this.lignes.set(
      this.lignes().map(ligne => ligne.idCouleur === idCouleur ? { ...ligne, ...patch } : ligne)
    );
  }
}
