import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';

type DepenseAtelierVM = {
  id: number;
  date: string;
  motif: string;
  beneficiaire: string;
  modePaiement: string;
  montant: number;
  tone: 'gold' | 'info' | 'success' | 'warning';
  icon: string;
};

@Component({
  selector: 'app-list-depenses-atelier',
  standalone: true,
  imports: [CommonModule, FloatingBackButton],
  templateUrl: './list-depenses-atelier.html',
  styleUrl: './list-depenses-atelier.css',
})
export class ListDepensesAtelier {
  today = new Date().toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  depenses = signal<DepenseAtelierVM[]>([
    {
      id: 1,
      date: '2026-09-04',
      motif: 'Salaire',
      beneficiaire: 'Aminata Traore',
      modePaiement: 'Cash',
      montant: 75000,
      tone: 'success',
      icon: 'fa-solid fa-user-tie',
    },
    {
      id: 2,
      date: '2026-09-03',
      motif: 'Transport',
      beneficiaire: 'Moussa Diarra',
      modePaiement: 'Mobile',
      montant: 12500,
      tone: 'info',
      icon: 'fa-solid fa-truck',
    },
    {
      id: 3,
      date: '2026-09-02',
      motif: 'Reparation',
      beneficiaire: 'Atelier machine',
      modePaiement: 'Cash',
      montant: 28000,
      tone: 'warning',
      icon: 'fa-solid fa-screwdriver-wrench',
    },
    {
      id: 4,
      date: '2026-09-01',
      motif: 'Accessoire',
      beneficiaire: 'Fournisseur libre',
      modePaiement: 'Cheque',
      montant: 11000,
      tone: 'gold',
      icon: 'fa-solid fa-scissors',
    },
  ]).asReadonly();

  totalDepenses(): number {
    return this.depenses().reduce((total, depense) => total + depense.montant, 0);
  }
}
