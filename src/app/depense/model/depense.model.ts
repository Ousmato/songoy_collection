import { Entite, PersonnelRole } from '../../admin/model/admin.enum';
import { ModePaiement, ModePaiementKey, MotifDepense, MotifDepenseAtelierKey } from '../../shared/model/util.enum';

/** Contrat envoyé par le formulaire de création d'une dépense. */
export interface DepenseRequest {
  date: string;
  motif: MotifDepenseAtelierKey;
  entite: Entite;
  libelle: string;
  montant: number;
  modePaiement: ModePaiementKey;
  periodeSalaire?: string;
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

export interface SalaireHistoriqueDto {
  id: number;
  datePaiement: string;
  periodeSalaire?: string;
  entite: keyof typeof Entite;
  montant: number;
  modePaiement: ModePaiementKey;
  personnelBeneficiaireId?: number;
  personnelBeneficiaire?: string;
  roleBeneficiaire?: keyof typeof PersonnelRole;
  personnelResponsableId?: number;
  personnelResponsable?: string;
  libelle?: string;
}

/** Indicateurs de paie calculés pour le mois rémunéré sélectionné. */
export interface SalaireStatistiquesDto {
  periodeSalaire: string;
  entite?: keyof typeof Entite;
  montantVerse: number;
  nombrePersonnesPayees: number;
  nombrePersonnesNonPayees: number;
}

export interface HistoriqueSalaireFilters {
  entite?: keyof typeof Entite;
  periodeSalaire?: string;
}
