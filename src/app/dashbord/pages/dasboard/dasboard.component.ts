import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { DependencyService } from '../../../shared/utils/dependency';
import { DashboardAlerteStockDto, DashboardIndicateurs, DashboardTopProduitDto, DashboardVenteJour, DashboardVenteLigne } from '../../model/dashboard';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import { CategoryMesure } from '../../../categorie/models/categorie.enum';
import { ModePaiement } from '../../../shared/model/util.enum';

type KpiCard = {
  label: string;
  value: string;
  icon: string;
  trend: string;
  trendUp: boolean;
  tone: 'gold' | 'success' | 'info' | 'danger' | 'purple' | 'teal' | 'orange';
};

type Shortcut = {
  label: string;
  sub: string;
  icon: string;
  tone: 'gold' | 'success' | 'danger' | 'info' | 'purple';
  route?: string;
};

@Component({
  selector: 'app-dasboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dasboard.component.html',
  styleUrl: './dasboard.component.css',
})
export class DasboardComponent  implements OnInit{

  readonly user = getUserFromSessionStorage();
  readonly dependency = inject(DependencyService);
  readonly paymentModes = ModePaiement;
  readonly today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  readonly dashbordIndicateur = signal<DashboardIndicateurs | null>(null);
  readonly topProduits = signal<DashboardTopProduitDto[]>([]);
  readonly alertesStock = signal<DashboardAlerteStockDto[]>([]);
  readonly loadingIndicateurs = signal(false);
  readonly dateDebut = signal(this.localDate());
  readonly dateFin = signal(this.localDate());
  readonly totalQtyTopProducts = computed(() =>
    this.topProduits().reduce((total, produit) => total + (produit.quantiteVendue ?? 0), 0),
  );
  readonly dailySales = signal<DashboardVenteJour[]>([]);
  readonly dailySalesTotal = computed(() =>
    this.formatMoney(this.dailySales().reduce((total, vente) => total + (vente.total ?? 0), 0)),
  );

  readonly kpis = computed<KpiCard[]>(() => {
    const indicateurs = this.dashbordIndicateur();
    if (!indicateurs) return [];

    const periode = this.dateDebut() === this.dateFin() ? 'du jour' : 'de la période';
    return [
      { label: `CA ${periode}`, value: this.formatMoney(indicateurs.caJour), icon: 'fa-sack-dollar', trend: '', trendUp: true, tone: 'gold' },
      { label: `Ventes ${periode}`, value: String(indicateurs.ventesJour), icon: 'fa-receipt', trend: '', trendUp: true, tone: 'info' },
      { label: `Bénéfice estimé ${periode}`, value: this.formatMoney(indicateurs.beneficeEstime), icon: 'fa-coins', trend: '', trendUp: true, tone: 'teal' },
      { label: 'Valeur du stock', value: this.formatMoney(indicateurs.valeurStock), icon: 'fa-warehouse', trend: '', trendUp: true, tone: 'orange' },
    ];
  });

  ngOnInit(): void {
    this.loadIndicateurs();
    this.loadVentesDuJour();
    this.loadTopProduits();
    this.loadAlertesStock();
  }

  loadVentesDuJour(): void {
    if (!this.user?.id) return;

    this.dependency.dashboardService.getVentesDuJour(this.user.id).subscribe({
      next: ventes => this.dailySales.set(ventes),
      error: err => this.dependency.responseService.showErrorToast(
        err?.error?.message ?? 'Impossible de charger les ventes du jour.'
      ),
    });
  }
  loadIndicateurs(): void {
    if (!this.user?.id || !this.dateDebut() || !this.dateFin()) return;
    if (this.dateDebut() > this.dateFin()) {
      this.dependency.responseService.showErrorToast('La date de début doit être antérieure ou égale à la date de fin.');
      return;
    }

    this.loadingIndicateurs.set(true);
    this.dependency.dashboardService.getIndicateurs(
      this.user.id,
      this.dateDebut(),
      this.dateFin(),
    ).subscribe({
      next: result => this.dashbordIndicateur.set(result),
      error: err => {
        this.loadingIndicateurs.set(false);
        this.dependency.responseService.showErrorToast(
          err?.error?.message ?? 'Impossible de charger les indicateurs.'
        );
      },
      complete: () => this.loadingIndicateurs.set(false),
    });
  }

  loadTopProduits(): void {
    if (!this.user?.id || !this.dateDebut() || !this.dateFin()) return;
    if (this.dateDebut() > this.dateFin()) return;

    this.dependency.dashboardService.getTopProduits(
      this.user.id,
      this.dateDebut(),
      this.dateFin(),
    ).subscribe({
      next: result => this.topProduits.set(result),
      error: err => this.dependency.responseService.showErrorToast(
        err?.error?.message ?? 'Impossible de charger les produits les plus vendus.'
      ),
    });
  }

  loadAlertesStock(): void {
    if (!this.user?.id) return;

    this.dependency.dashboardService.getAlertesStock(this.user.id).subscribe({
      next: result => this.alertesStock.set(result),
      error: err => this.dependency.responseService.showErrorToast(
        err?.error?.message ?? 'Impossible de charger les alertes stock.'
      ),
    });
  }

  resetPeriod(): void {
    const today = this.localDate();
    this.dateDebut.set(today);
    this.dateFin.set(today);
    this.loadIndicateurs();
    this.loadTopProduits();
  }

  onDateChange(target: 'debut' | 'fin', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (target === 'debut') this.dateDebut.set(value);
    else this.dateFin.set(value);
    this.loadIndicateurs();
    this.loadTopProduits();
  }

  private localDate(): string {
    const today = new Date();
    return [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  }

  formatMoney(value: number | null | undefined): string {
    return `${new Intl.NumberFormat('fr-FR').format(value ?? 0)} FCFA`;
  }

  formatHour(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '--:--'
      : date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatQuantity(value: number | null | undefined): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 3 }).format(value ?? 0);
  }

  unitLabel(unite: DashboardVenteLigne['unite']): string {
    return EnumMethodes.getEnumValueByKey(CategoryMesure, unite)!;
  }

  pluralizeUnit(unit: string, quantity: number): string {
    return Math.abs(quantity ?? 0) === 1 ? unit : `${unit}s`;
  }

  paymentLabel(value: DashboardVenteJour['modePaiement']): string {
    return EnumMethodes.getEnumValueByKey(ModePaiement, value)!;
  }

  shortcuts: Shortcut[] = [
    { label: "Nouvelle Vente",    sub: "Encaisser une transaction",   icon: "fa-cart-plus",   tone: "gold",   route: "/admin/add-vente" },
    { label: "Nouvel Achat",     sub: "Enregistrer un r\u00E9assort",   icon: "fa-truck",       tone: "info",   route: "/admin/add-achat" },
    { label: "Nouveau Article",  sub: "Ajouter un article au stock",  icon: "fa-shirt",       tone: "purple", route: "/admin/add-article" },
  ];

}
