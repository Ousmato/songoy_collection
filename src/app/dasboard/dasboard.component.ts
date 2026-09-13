import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

type DailySale = {
  id: number;
  ref: string;
  client: string;
  items: number;
  total: string;
  hour: string;
  type: 'espèces' | 'mobile' | 'carte';
};

type TopProduct = {
  id: number;
  rank: number;
  name: string;
  category: string;
  qty: number;
  revenue: string;
  revenueRaw: number;
  avgPrice: string;
  progress: number;
};

type StockAlert = {
  id: number;
  name: string;
  sku: string;
  remaining: number;
  status: 'rupture' | 'critique' | 'alerte';
};

@Component({
  selector: 'app-dasboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dasboard.component.html',
  styleUrl: './dasboard.component.css',
})
export class DasboardComponent {
  today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  kpis: KpiCard[] = [
    { label: "CA du jour",         value: "1 285 500 FCFA", icon: "fa-sack-dollar",    trend: "+18,2%", trendUp: true,  tone: "gold" },
    { label: "CA du mois",         value: "24,3 M FCFA",    icon: "fa-chart-line",    trend: "+11,4%", trendUp: true,  tone: "success" },
    { label: "Ventes du jour",     value: "47",             icon: "fa-receipt",       trend: "+6",      trendUp: true,  tone: "info" },
    { label: "Bénéfice estimé",    value: "385 650 FCFA",   icon: "fa-coins",         trend: "+12,8%", trendUp: true,  tone: "teal" },
    { label: "Valeur du stock",    value: "48,7 M FCFA",    icon: "fa-warehouse",     trend: "+5,9%",  trendUp: true,  tone: "orange" },
    { label: "Alertes rupture",    value: "12 articles",    icon: "fa-triangle-exclamation", trend: "-2", trendUp: false, tone: "danger" },
  ];

  shortcuts: Shortcut[] = [
    { label: "Nouvelle Vente",    sub: "Encaisser une transaction",   icon: "fa-cart-plus",   tone: "gold",   route: "/ventes" },
    { label: "Nouvel Achat",     sub: "Enregistrer un r\u00E9assort",   icon: "fa-truck",       tone: "info",   route: "/achats" },
    { label: "Nouveau Produit",  sub: "Ajouter un article au stock",  icon: "fa-shirt",       tone: "purple", route: "/stock" },
    { label: "Nouveau Client",   sub: "Cr\u00E9er une fiche client",     icon: "fa-user-plus",   tone: "danger", route: "/clients" },
  ];

  dailySales: DailySale[] = [
    { id: 1, ref: "FA-2026-0903-0047", client: "Awa Diallo",         items: 3, total: "85 000 FCFA",   hour: "17:42", type: "mobile" },
    { id: 2, ref: "FA-2026-0903-0046", client: "Mamadou Koné",        items: 1, total: "185 000 FCFA",  hour: "17:15", type: "espèces" },
    { id: 3, ref: "FA-2026-0903-0045", client: "Fatou Ndiaye",        items: 2, total: "42 500 FCFA",   hour: "16:58", type: "carte" },
    { id: 4, ref: "FA-2026-0903-0044", client: "Boubacar Traoré",     items: 5, total: "248 000 FCFA",  hour: "16:20", type: "mobile" },
    { id: 5, ref: "FA-2026-0903-0043", client: "Mariam Sidibé",       items: 2, total: "72 000 FCFA",   hour: "15:44", type: "espèces" },
    { id: 6, ref: "FA-2026-0903-0042", client: "Client passager",     items: 1, total: "12 500 FCFA",   hour: "15:07", type: "espèces" },
    { id: 7, ref: "FA-2026-0903-0041", client: "Ousmane Camara",      items: 3, total: "158 000 FCFA",  hour: "14:32", type: "carte" },
  ];
  dailySalesTotal = "1 003 000 FCFA";

  topProducts: TopProduct[] = [
    { id: 1, rank: 1, name: "Grand boubou riche",   category: "Bazin brod\u00E9",    qty: 18, revenue: "3 330 000 FCFA", revenueRaw: 3_330_000, avgPrice: "185 000 FCFA", progress: 92 },
    { id: 2, rank: 2, name: "Ensemble tradition",   category: "Wax premium",    qty: 32, revenue: "3 040 000 FCFA", revenueRaw: 3_040_000, avgPrice: "95 000 FCFA",  progress: 85 },
    { id: 3, rank: 3, name: "Robe de soir\u00E9e",       category: "Soie & dorure",  qty: 19, revenue: "2 945 000 FCFA", revenueRaw: 2_945_000, avgPrice: "155 000 FCFA", progress: 78 },
    { id: 4, rank: 4, name: "Chemise homme",        category: "Lin \u00E9cru",       qty: 44, revenue: "1 848 000 FCFA", revenueRaw: 1_848_000, avgPrice: "42 000 FCFA",  progress: 61 },
    { id: 5, rank: 5, name: "Kaftan luxe",          category: "Velours dor\u00E9",   qty: 12, revenue: "1 740 000 FCFA", revenueRaw: 1_740_000, avgPrice: "145 000 FCFA", progress: 48 },
  ];
  totalQtyTopProducts = this.topProducts.reduce((s, p) => s + p.qty, 0);

  stockAlerts: StockAlert[] = [
    { id: 1, name: "Robe de soirée — Soie",       sku: "RS-SOIE-034", remaining: 2,  status: "critique" },
    { id: 2, name: "Bazin brodé 5x5 — Or",        sku: "BZ-OR-088",   remaining: 0,  status: "rupture" },
    { id: 3, name: "Chemise lin — Bleu ciel",     sku: "CH-BL-210",   remaining: 4,  status: "alerte" },
    { id: 4, name: "Wax premium — Bogolan",       sku: "WX-BG-144",   remaining: 1,  status: "critique" },
    { id: 5, name: "Kaftan velours — Marine",     sku: "KT-MR-056",   remaining: 3,  status: "alerte" },
  ];
}
