import { HabitTypeKey } from "../../shared/model/util.enum";

export type StatutCommande = 'ACCEPTER' | 'TERMINER' | 'LIVRER';

export type SourceHabitCommande = 'CLIENT' | 'BOUTIQUE';

export interface CommandeRequest {
  dateCommande: Date;
  dateLivraisonPrevue: Date;

  clientId?: number;
  clientNom?: string;

  statut: StatutCommande;

  montantTotal: number;
  avance: number;
  reste: number;

  lignes: LigneCommandeRequest[];
}

export interface LigneCommandeRequest {
  designation: string;
  quantite: number;
  prixUnitaire: number;
  prixMatiere?: number;
  sourceHabit: SourceHabitCommande;
  typeHabille: HabitTypeKey;
  imageHabitUrl?: string;
  idCouleur?: number;
  couleurNom?: string;
}

export interface CommandeResponse {
  id: number;

  dateCommande: Date;
  dateLivraisonPrevue: Date;
  dateLivraison: Date;

  clientId?: number;
  clientNom: string;

  statut: StatutCommande;

  montantTotal: number;
  avance: number;
  reste: number;

  lignes: LigneCommandeResponse[];
}

export interface LigneCommandeResponse {
  id: number;
  designation: string;
  quantite: number;
  prixUnitaire: number;
  prixMatiere?: number;
  total: number;
  sourceHabit: SourceHabitCommande;
  typeHabille?: HabitTypeKey;
  imageHabitUrl?: string;
  couleurNom?: string;
}
