import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { CouleurResponse } from '../../../article/models/article-couleur.model';
import { LigneAchatRequest, RequestAchat } from '../../models/achat.model';

export type AchatLigneDraft = LigneAchatRequest & {
  couleur: string;
};

@Component({
  selector: 'app-achat-sommaire',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './achat-sommaire.html',
  styleUrl: './achat-sommaire.css',
})
export class AchatSommaire {
  @Input({ required: true }) achatForm!: FormGroup;
  @Input() selectedCouleurs: CouleurResponse[] = [];

  @Output() submitAchat = new EventEmitter<RequestAchat>();
  @Output() removeCouleur = new EventEmitter<number>();

  lignes = signal<AchatLigneDraft[]>([]);
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

  totalAchat(): number {
    return this.lignes().reduce((total, ligne) => total + (ligne.quantite * ligne.prix), 0);
  }

  frais(): number {
    return Number(this.achatForm?.value?.frais) || 0;
  }

  totalGeneral(): number {
    return this.totalAchat() + this.frais();
  }

  submit(): void {
    this.submitted.set(true);

    if (!this.achatForm.valid || !this.lignes().length || this.lignes().some(ligne => !ligne.quantite || !ligne.prix)) {
      this.achatForm.markAllAsTouched();
      return;
    }

    const formValue = this.achatForm.value;
    const request: RequestAchat = {
      date: formValue.date,
      frais: Number(formValue.frais),
      modePaiement: formValue.modePaiement,
      idFournisseur: formValue.idFournisseur ? Number(formValue.idFournisseur) : undefined,
      fournisseurNom: formValue.fournisseurNom || undefined,
      lignes: this.lignes().map(({ idCouleur, quantite, prix }) => ({
        idCouleur,
        quantite: Number(quantite),
        prix: Number(prix),
      })),
    };

    this.submitAchat.emit(request);
  }

  private updateLine(idCouleur: number, patch: Partial<AchatLigneDraft>): void {
    this.lignes.set(
      this.lignes().map(ligne => ligne.idCouleur === idCouleur ? { ...ligne, ...patch } : ligne)
    );
  }
}
