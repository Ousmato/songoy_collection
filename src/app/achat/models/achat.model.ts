import { SimpleAdminResponse } from "../../admin/model/admin.model";
import { ModePaiementKey } from "../../shared/model/util.enum";

export interface RequestAchat {
  date: string;
  frais: number;
  idFournisseur?: number;
  fournisseurNom?: string;
  modePaiement: ModePaiementKey;
  lignes: LigneAchatRequest[];
}

export interface LigneAchatRequest {
  idCouleur: number;
  quantite: number;
  prix: number;
}

export interface AchatResponse {
  id: number;
  date: string;
  modePaiement: ModePaiementKey;
  admin: SimpleAdminResponse;
  frais: number;
  idFournisseur?: number;
  fournisseurNom?: string;
  lignes: LigneAchatResponse[];
}

export interface LigneAchatResponse {
  id: number;
  idCouleur: number;
  couleur: string;
  quantite: number;
  prix: number;
}
