import { CategoryMesure } from "../../categorie/models/categorie.enum";

export interface SimpleArticleResponse {
  id: number;
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
}

export interface ArticleContextDto {
  id: number;
  categoryId: number;
  categoryNom: string;
  typeNom: string;
  attributes: ArticleAttributeDto[];
}

export interface ArticleVariantRequestDto {
  reference: string;
  prixVente: number;
  attributs: Record<number, string>;
}

export interface ArticleVariantDto extends ArticleVariantRequestDto {
  id: number;
  quantity: number;
}
