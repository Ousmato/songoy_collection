import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { CategoryMesure } from '../../../categorie/models/categorie.enum';
import { ModePaiement } from '../../../shared/model/util.enum';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import {
  PaiementVenteHistorique,
  VenteHistoriqueDetailDto,
} from '../../models/vente.dto';
import { VenteService } from '../../services/vente.service';
import { ReglementVente } from '../../components/reglement-vente/reglement-vente';

@Component({
  selector: 'app-detail-vente',
  standalone: true,
  imports: [CommonModule, FloatingBackButton, ReglementVente],
  templateUrl: './detail-vente.html',
  styleUrl: './detail-vente.css',
})
export class DetailVente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly venteService = inject(VenteService);
  private readonly user = getUserFromSessionStorage();

  readonly detailVente = signal<VenteHistoriqueDetailDto | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    this.loadDetail();
  }

  loadDetail(): void {
    const venteId = Number(this.route.snapshot.paramMap.get('venteId'));
    const adminId = this.user?.id;

    if (!adminId || !Number.isInteger(venteId) || venteId <= 0) {
      this.error.set('La vente demandée est introuvable.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.venteService.loadVenteHistoriqueDetail(adminId, venteId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: detail => this.detailVente.set(detail),
        error: () => this.error.set('Impossible de charger le détail de cette vente.'),
      });
  }

  statusClass(status: unknown): string {
    switch (String(status).toUpperCase()) {
      case 'PAYE':
      case 'PAYÉ':
        return 'paye';
      case 'PARTIEL':
        return 'partiel';
      default:
        return 'credit';
    }
  }

  paymentLabel(mode: ModePaiement | null): string {
    if (!mode) {
      return 'Non renseigné';
    }

   return EnumMethodes.getEnumValueByKey(ModePaiement, mode)!
  }

  unitLabel(unit: CategoryMesure | null): string {
    if (!unit) {
      return '';
    }
    return EnumMethodes.getEnumValueByKey(
      CategoryMesure,
      String(unit) as keyof typeof CategoryMesure,
    ) || String(unit);
  }

  clientLabel(client: string | null): string {
    return client?.trim() || 'Client de passage';
  }

  paymentCount(paiements: PaiementVenteHistorique[]): string {
    return `${paiements.length} paiement${paiements.length === 1 ? '' : 's'}`;
  }
}
