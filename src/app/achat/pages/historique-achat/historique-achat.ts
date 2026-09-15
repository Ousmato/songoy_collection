import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { AchatHistoriqueDto } from '../../models/achat.dto';
import { StatutAchat, StatutPaiement } from '../../models/achat.enum';
import { ReceptionService } from '../../services/reception.service';

@Component({
  selector: 'app-historique-achat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FloatingBackButton],
  templateUrl: './historique-achat.html',
  styleUrl: './historique-achat.css',
})
export class HistoriqueAchat implements OnInit {
  private readonly receptionService = inject(ReceptionService);
  private readonly user = getUserFromSessionStorage();

  readonly search = signal('');
  readonly paymentFilter = signal<'TOUS' | StatutPaiement>('TOUS');
  readonly achats = signal<AchatHistoriqueDto[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly filteredAchats = computed(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.paymentFilter();

    return this.achats().filter(achat => {
      const matchesStatus = status === 'TOUS'
        || achat.statutPaiement === status;
      const matchesQuery = !query || [
        achat.reference,
        achat.fournisseur,
        achat.numeroFacture,
      ].some(value => value?.toLowerCase().includes(query));

      return matchesStatus && matchesQuery;
    });
  });

  readonly totalAchats = computed(() => this.achats().length);
  readonly totalDepense = computed(() => this.achats().reduce(
    (total, achat) => total + (achat.montantPaye || 0),
    0,
  ));
  readonly totalCredit = computed(() => this.achats().reduce(
    (total, achat) => total + (achat.resteAPayer || 0),
    0,
  ));

  readonly paymentOptions = [
    { key: 'TOUS' as const, label: 'Tous' },
    { key: StatutPaiement.PAYE, label: 'Payés' },
    { key: StatutPaiement.PARTIEL, label: 'Partiels' },
    { key: StatutPaiement.CREDIT, label: 'À crédit' },
  ];

  ngOnInit(): void {
    this.loadHistorique();
  }

  loadHistorique(): void {
    const adminId = this.user?.id;

    if (!adminId) {
      this.error.set('Votre session a expiré. Reconnectez-vous.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.receptionService.loadHistorique(adminId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: achats => this.achats.set(achats.map(achat => this.normalize(achat))),
        error: () => this.error.set(
          'Impossible de charger l’historique des achats.',
        ),
      });
  }

  statusClass(status: StatutPaiement): string {
    switch (status) {
      case StatutPaiement.PAYE:
        return 'paye';
      case StatutPaiement.PARTIEL:
        return 'partiel';
      default:
        return 'credit';
    }
  }

  formatSupplier(value: string): string {
    return value || 'Fournisseur non renseigné';
  }

  private normalize(achat: AchatHistoriqueDto): AchatHistoriqueDto {
    return {
      ...achat,
      statut: this.normalizePurchaseStatus(achat.statut),
      statutPaiement: this.normalizePaymentStatus(achat.statutPaiement),
    };
  }

  private normalizePurchaseStatus(value: unknown): StatutAchat {
    return String(value).toUpperCase() === 'VALIDE'
      ? StatutAchat.VALIDE
      : StatutAchat.BROUILLON;
  }

  private normalizePaymentStatus(value: unknown): StatutPaiement {
    switch (String(value).toUpperCase()) {
      case 'PAYE':
      case 'PAYER':
        return StatutPaiement.PAYE;
      case 'PARTIEL':
        return StatutPaiement.PARTIEL;
      default:
        return StatutPaiement.CREDIT;
    }
  }
}
