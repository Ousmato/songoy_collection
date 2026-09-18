import { Entite } from '../../admin/model/admin.enum';
import { ModePaiement, ModePaiementKey, MotifDepense, MotifDepenseAtelierKey } from '../../shared/model/util.enum';

/** Contrat envoyé par le formulaire de création d'une dépense. */
export interface DepenseRequest {
  date: string;
  motif: MotifDepenseAtelierKey;
  entite: Entite;
  libelle: string;
  montant: number;
  modePaiement: ModePaiementKey;
  personnelBeneficiaireId?: number;
  fournisseurId?: number;
  nomFournisseur?: string;
}

/** Alias conservé pour les écrans qui utilisent encore l'ancien nom. */
export type RequestDepenseAtelier = DepenseRequest;

export interface DepenseHistoriqueDto {
  id: number;
  date: string;
  motif: MotifDepense;
  entite: Entite;
  montant: number;
  modePaiement: ModePaiement;

  personnelResponsableId?: number;
  personnelResponsable?: string;

  personnelBeneficiaireId?: number;
  personnelBeneficiaire?: string;

  fournisseurId?: number;
  fournisseur?: string;

  libelle?: string;
}