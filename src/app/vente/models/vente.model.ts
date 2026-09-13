import { ModePaiementKey } from "../../shared/model/util.enum";

export interface VenteRequest {
  date: Date;
  clientId?: number;
    clientNom?: string;
    modePaiement: ModePaiementKey;

  lignes: LigneVenteRequest[];
}

export interface LigneVenteRequest {
  idCouleur: number;
  quantite: number;
  prix: number;
}