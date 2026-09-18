import { ArticleAttributeDto, ArticleVariantDto, SimpleArticleResponse } from '../../article/models/article.model';

export interface VariantSelection {
  loading: boolean;
  error: string;
  variants: ArticleVariantDto[];
  attributes: ArticleAttributeDto[];
  selectedId: number | null;
}

export interface SaleLine {
  article: SimpleArticleResponse;
  variant: ArticleVariantDto;
  quantite: number;
  prixVente: number;
}

export interface SaleQuantityChange {
  line: SaleLine;
  value: number | string;
}

export interface SaleQuantityStep {
  line: SaleLine;
  delta: number;
}

export interface VenteRequest {
  date: string;
  clientId?: number;
  clientNom?: string;
  modePaiement: string;
  montantPaye: number;
  lignes: VenteLigneRequest[];
}

export interface VenteLigneRequest {
  variantId: number;
  quantite: number;
  prixVente: number;
}
