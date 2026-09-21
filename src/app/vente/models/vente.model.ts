import {
  ArticleAttributeDto,
  ArticleVariantDto,
  DeclinaisonDto,
  ModeleArticleDto,
  SimpleArticleResponse,
} from '../../article/models/article.model';

export interface VariantSelection {
  loadingModeles: boolean;
  loadingDeclinaisons: boolean;
  loadingVariants: boolean;
  error: string;
  modeles: ModeleArticleDto[];
  declinaisons: DeclinaisonDto[];
  variants: ArticleVariantDto[];
  attributes: ArticleAttributeDto[];
  selectedModeleId: number | null;
  selectedDeclinaisonId: number | null;
  selectedVariantId: number | null;
}

export interface SaleLine {
  article: SimpleArticleResponse;
  modele: ModeleArticleDto;
  declinaison: DeclinaisonDto;
  attributes: ArticleAttributeDto[];
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
