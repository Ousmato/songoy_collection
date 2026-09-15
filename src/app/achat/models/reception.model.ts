import { Entite, ModePaiementKey } from "../../shared/model/util.enum";

/** Donn?es pr?par?es c?t? front, sans enregistrement ? ce stade. */
export interface ReceptionRequest {
  date: string;
  entite: Entite
  fournisseurId: number | null;
  nomFournisseur: string | null;
  numeroFacture: string | null;
  lignes: { variantId: number; quantite: number; prixAchat: number }[];
  paiement: { montant: number; modePaiement: ModePaiementKey } | null;
}

