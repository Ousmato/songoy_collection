import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { StatutPaiement } from '../../../achat/models/achat.enum';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { ModePaiement } from '../../../shared/model/util.enum';
import { VenteHistoriqueDto } from '../../models/vente.dto';
import { VenteService } from '../../services/vente.service';
import { EnumMethodes } from '../../../shared/utils/util-methode';

@Component({
  selector: 'app-list-vente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FloatingBackButton],
  templateUrl: './list-vente.html',
  styleUrl: './list-vente.css',
})
export class ListVente implements OnInit {
  private readonly venteService = inject(VenteService);
  private readonly user = getUserFromSessionStorage();

  readonly ventes = signal<VenteHistoriqueDto[]>([]);
  readonly search = signal('');
  readonly paymentFilter = signal<'TOUS' | StatutPaiement>('TOUS');
  readonly loading = signal(false);
  readonly error = signal('');

  readonly filteredVentes = computed(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.paymentFilter();

    return this.ventes().filter(vente => {
      const matchesStatus = status === 'TOUS'
        || vente.statutPaiement === status;
      const matchesQuery = !query || [
        vente.numeroFacture,
        vente.client,
      ].some(value => value?.toLowerCase().includes(query));

      return matchesStatus && matchesQuery;
    });
  });

  readonly totalVentes = computed(() => this.ventes().length);
  readonly totalVendu = computed(() => this.ventes().reduce(
    (total, vente) => total + (vente.totalVente || 0),
    0,
  ));
  readonly totalEncaisse = computed(() => this.ventes().reduce(
    (total, vente) => total + (vente.montantPaye || 0),
    0,
  ));
  readonly totalCredit = computed(() => this.ventes().reduce(
    (total, vente) => total + (vente.resteAPayer || 0),
    0,
  ));

  readonly paymentOptions = [
    { key: 'TOUS' as const, label: 'Toutes' },
    { key: StatutPaiement.PAYE, label: 'Payées' },
    { key: StatutPaiement.PARTIEL, label: 'Partielles' },
    { key: StatutPaiement.CREDIT, label: 'À crédit' },
  ];

  ngOnInit(): void {
    this.loadVentes();
  }

  loadVentes(): void {
    const adminId = this.user?.id;

    if (!adminId) {
      this.error.set('Votre session a expiré. Reconnectez-vous.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.venteService.loadVenteHistorique(adminId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ventes => this.ventes.set(ventes.map(vente => this.normalize(vente))),
        error: () => this.error.set('Impossible de charger l’historique des ventes.'),
      });
  }

  statusClass(status: StatutPaiement): string {
    return EnumMethodes.getEnumValueByKey(StatutPaiement, status)!
  }

  paymentLabel(mode: ModePaiement | null): string {
    if (!mode) {
      return 'Non renseigné';
    }
    return EnumMethodes.getEnumValueByKey(ModePaiement, mode)!
  }

  clientLabel(client: string | null): string {
    return client?.trim() || 'Client de passage';
  }

  private normalize(vente: VenteHistoriqueDto): VenteHistoriqueDto {
    return {
      ...vente,
      statutPaiement: this.normalizePaymentStatus(vente.statutPaiement),
    };
  }

  private normalizePaymentStatus(value: unknown): StatutPaiement {
    switch (String(value).toUpperCase()) {
      case 'PAYE':
      case 'PAYER':
      case 'PAYÉ':
        return StatutPaiement.PAYE;
      case 'PARTIEL':
      case 'PARTIELLE':
        return StatutPaiement.PARTIEL;
      default:
        return StatutPaiement.CREDIT;
    }
  }
}
