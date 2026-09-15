import { CategoryMesure, CategoryType } from "./categorie.enum";
import { Entite } from "../../admin/model/admin.enum";

export interface Categorie {
  id?: number;
  nom: string;
  mesureCategory?: CategoryMesure;
  categoryType?: CategoryType;
  entite?: Entite;
  /** Ancien nom conservé pour les écrans qui consomment encore ce modèle. */
  mesure?: CategoryMesure;
  description: string;
}

