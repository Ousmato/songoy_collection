import { CategoryMesure } from "../../categorie/models/categorie.enum";

export interface StockMouvementHistoriqueDto {
  idMouvement: number;
  date: string; // LocalDateTime ISO 8601

  type: TypeMouvementKey;

  lotId: number;
  articleId: number;
  article: string; // catégorie + type

  variantId: number;
  referenceVariante: string;

  unite: CategoryMesureKey | null;

  quantite: number;
  coutAchatUnitaire: number;
  valeurMouvement: number; // quantité × coût d'achat du lot

  referenceMouvement: string;
  numeroFacture: string;
  tiers: string;
  responsable: string;
}

export enum TypeMouvement {
  VENTE = 'Vente',
  ACHAT = 'Achat',
  AJUSTEMENT = 'Ajustement',
  INVENTAIRE = 'Inventaire',
  ANNULATION_VENTE = 'Vente annulée'
}

export type TypeMouvementKey = keyof typeof TypeMouvement;
export type CategoryMesureKey = keyof typeof CategoryMesure;

export interface StockMouvementFilters {
  debut?: string;
  fin?: string;
  type?: TypeMouvementKey;
  recherche?: string;
}
