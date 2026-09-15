import { Entite } from "../../admin/model/admin.enum"
import { CategoryMesure, CategoryType } from "./categorie.enum"

export interface CategoryDto {
    id: number
    nom: string
    mesureCategory: CategoryMesure
    type: CategoryType
    nombreArticle: number
    entite: Entite
    description: string

}

export interface CategoryAttributeRequestDto {
  key: string;
  label: string;
  type: string;
  obligatoire: boolean;
  ordre: number;
  categoryIds: number[]
}

export interface CategoryAttributeDto {
  categoryId: number
  categoryNom: string
  attributes: CategoryAttributeItemDto[];
}

export interface CategoryAttributeItemDto {
  id: number;
  key: string;
  label: string;
  type: string;
  obligatoire: boolean;
  ordre: number | null;
}
