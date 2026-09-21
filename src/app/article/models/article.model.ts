import { CategoryMesure } from "../../categorie/models/categorie.enum";

export interface SimpleArticleResponse {
  id: number;
  urlImage?: string | null;
  nom?: string
  prixVente?: number;
  idType: number;
  typeNom: string;
  categoryNom: string;
  categoryId: number
  quantity: number;
  categoryMesure: CategoryMesure
}

export interface ArticleRequestDto{
  categoryId: number
  articleTypeId: number
  files?: File[]
}

export interface ArticleAttributeDto {
  id: number;
  key: string;
  label: string;
  type: string;
  obligatoire: boolean;
  ordre: number | null;
  niveau: 'DECLINAISON' | 'VARIANTE';
}

export interface ArticleContextDto {
  id: number;
  categoryId: number;
  categoryNom: string;
  typeNom: string;
  attributes: ArticleAttributeDto[];
}

export interface ModeleArticleDto {
  id: number;
  articleId: number;
  nom: string;
  marque: string | null;
  matiere: string | null;
}

export interface ModeleArticleRequestDto {
  nom: string;
  marque: string | null;
  matiere: string | null;
}

export interface DeclinaisonDto {
  id: number;
  modeleArticleId: number;
  urlImage: string | null;
  referenceCommune: string;
  variants: ArticleVariantDto[];
  attributs: Record<number, string>;
  caracteristiquesModifiables: boolean;
}

export interface DeclinaisonRequestDto {
  attributs: Record<number, string>;
}

export interface ArticleVariantRequestDto {
  reference: string;
  prixVente: number;
  attributs: Record<number, string>;
}

export interface ArticleVariantPriceUpdateRequestDto {
  prixVente: number;
}

export interface ArticleVariantDto {
  id: number;
  reference: string;
  prixVente: number;
  quantity: number;
  attributs: Record<number, string>;
  urlImage?: string | null;
}
