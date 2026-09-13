import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HabitType, HabitTypeKey } from '../../../shared/model/util.enum';
import { CommandeRequest, LigneCommandeRequest } from '../../model/commande.model';

@Component({
  selector: 'app-add-commande-sommary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-commande-sommary.html',
  styleUrl: './add-commande-sommary.css',
})
export class AddCommandeSommary {
  @Input({ required: true }) commandeForm!: FormGroup;
  @Input() lignes: LigneCommandeRequest[] = [];

  @Output() removeLigne = new EventEmitter<number>();
  @Output() submitCommande = new EventEmitter<CommandeRequest>();

  submitted = signal(false);

  totalPieces(): number {
    return this.lignes.reduce((total, ligne) => total + Number(ligne.quantite || 0), 0);
  }

  totalCommande(): number {
    return this.lignes.reduce(
      (total, ligne) => total + this.totalLigne(ligne),
      0,
    );
  }

  avance(): number {
    return Math.max(0, Number(this.commandeForm?.value?.avance || 0));
  }

  reste(): number {
    return Math.max(0, this.totalCommande() - this.avance());
  }

  totalLigne(ligne: LigneCommandeRequest): number {
    return Number(ligne.quantite || 0) * (
      Number(ligne.prixUnitaire || 0) + Number(ligne.prixMatiere || 0)
    );
  }

  habitLabel(type: HabitTypeKey): string {
    return HabitType[type] ?? type;
  }

  hasClientInfo(): boolean {
    const formValue = this.commandeForm?.value;
    return Boolean(formValue?.clientId || formValue?.clientNom?.trim());
  }

  submit(): void {
    this.submitted.set(true);

    if (!this.commandeForm.valid || !this.hasClientInfo() || !this.lignes.length) {
      this.commandeForm.markAllAsTouched();
      return;
    }

    const formValue = this.commandeForm.value;
    const request: CommandeRequest = {
      dateCommande: new Date(formValue.dateCommande),
      dateLivraisonPrevue: new Date(formValue.dateLivraisonPrevue),
      clientId: formValue.clientId ? Number(formValue.clientId) : undefined,
      clientNom: formValue.clientId ? undefined : formValue.clientNom?.trim() || undefined,
      statut: 'ACCEPTER',
      montantTotal: this.totalCommande(),
      avance: this.avance(),
      reste: this.reste(),
      lignes: this.lignes,
    };

    this.submitCommande.emit(request);
  }

}
