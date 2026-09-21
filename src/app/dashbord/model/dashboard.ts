import { CategoryMesure } from "../../categorie/models/categorie.enum";
import { ModePaiement } from "../../shared/model/util.enum";

export interface DashboardIndicateurs {
  caJour: number;
  ventesJour: number;
  valeurEntree: number;
  valeurSortie: number;
  beneficeEstime: number;
  valeurStock: number;
}

export interface DashboardVenteJour {
  id: number;
  lignes: DashboardVenteLigne[];
  client: string | null;
  quantiteArticles: number;
  total: number;
  date: string;
  modePaiement: ModePaiement
}

export interface DashboardVenteLigne {
  reference: string;
  quantite: number;
  unite: CategoryMesure
}


export interface DashboardTopProduitDto {
  articleId: number;
  article: string;
  categorie: string;
  unite: CategoryMesure;
  quantiteVendue: number;
  chiffreAffaires: number;
  prixMoyen: number;
  rang: number;
  partChiffreAffaires: number;
}


export interface DashboardAlerteStockDto {
  variantId: number;
  articleId: number;
  article: string;
  categorie: string;
  modele: string;
  marque: string | null;
  reference: string;
  attributsDeclinaison: DashboardAlerteStockAttributDto[];
  attributsVariante: DashboardAlerteStockAttributDto[];
  unite: CategoryMesure;
  quantiteRestante: number;
  statut: string;
}

export interface DashboardAlerteStockAttributDto {
  id: number;
  label: string;
  value: string;
}
