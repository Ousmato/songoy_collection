import { CategoryMesure } from "./categorie.enum";

export interface Categorie {
  id?: number;
  nom: string;
  mesure: CategoryMesure;
  description: string;
}

