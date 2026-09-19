import { Entite } from "../../admin/model/admin.enum";

export interface SettingMenuStats {
  entite: Entite;
  debutMois: string;
  finMois: string;  

  nombreCategoriesActives: number;
  nombreTypesArticlesUtilises: number;

  montantSalairesMois: number;
  montantAutresDepensesMois: number;
}