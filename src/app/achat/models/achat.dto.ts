import { PersonnelAchatDto } from "../../admin/model/admin.model";
import { CategoryMesure } from "../../categorie/models/categorie.enum";
import { FournisseurResponse } from "../../fournisseur/models/fournisseur.model";
import { Entite, ModePaiement, ModePaiementKey } from "../../shared/model/util.enum";
import { StatutAchat, StatutPaiement } from "./achat.enum";

export interface PaiementAchatDto {
  id: number;
  date: string; // LocalDateTime
  montant: number;
  modePaiement: ModePaiement;
}

export interface LigneAchatHistoriqueDto {
  id: number;
  variantId: number;
  referenceVariant: string;
  articleId: number;
  article: string;
  modele: string;
  marque: string | null;
  attributsDeclinaison: AchatAttributHistoriqueDto[];
  attributsVariante: AchatAttributHistoriqueDto[];
  unite: CategoryMesure;
  quantite: number;
  prixAchatUnitaire: number;
  totalLigne: number;
}

export interface AchatHistoriqueDto {
  id: number;
  reference: string;
  date: string; // LocalDateTime
  dateValidation: string; // LocalDateTime
  statut: StatutAchat;
  entite: Entite;
  fournisseur: string;
  numeroFacture: string;
  totalAchat: number;
  montantPaye: number;
  resteAPayer: number;
  statutPaiement: StatutPaiement;
  nombreLignes: number;
}

export interface AchatHistoriqueDetailDto extends AchatHistoriqueDto {
  fournisseurDetail: FournisseurResponse;
  responsable: PersonnelAchatDto;
  lignes: LigneAchatHistoriqueDto[];
  paiements: PaiementAchatDto[];
}

export interface AchatAttributHistoriqueDto {
  id: number;
  label: string;
  value: string;
}

export interface ReglementRequest {
  montant: number;
  modePaiement: ModePaiementKey;
  date: string;
}

export interface ReglementResponse {
  id: number;
  achatId: number | null;
  venteId: number | null;
  montant: number;
  modePaiement: ModePaiement;
  date: string;
  resteAPayer: number;
}
