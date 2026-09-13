import { ModePaiementKey, MotifDepenseAtelierKey } from "../../shared/model/util.enum";

export interface RequestDepenseAtelier {
  date: string;
  motif: MotifDepenseAtelierKey;
  montant: number;
  modePaiement: ModePaiementKey;
  idPersonnel?: number;
  fournisseurNom?: string;
}