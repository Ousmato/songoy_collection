import { CategoryMesure } from "../../categorie/models/categorie.enum";
import { ModePaiement } from "../../shared/model/util.enum";
import { Entite, PersonnelRole } from "./admin.enum";

/** Représentation minimale d'un administrateur dans les réponses d'achat. */
export interface SimpleAdminResponse {
  id: number;
  nom: string;
  prenom: string;
  role: PersonnelRole
}

export interface SimplePersonnelResponse {
  id: number;
  nom: string;
  prenom: string;
  adresse: string;
  accessCode: string
  telephone: string;
  dateNaissance?: string;
  role: PersonnelRole;
  entite: Entite;

}

/** Compteurs renvoyés par l'API du menu personnel. */
export interface PersonnelMenuStatsDto {
  nombreClients: number;
  nombreFournisseurs: number;
  nombrePersonnel: number;
}

export interface LoginRequestDto{
  accessCode: string
  password: string
}

export interface PersonnelRequestDto {
  nom: string;
  prenom: string;
  adresse: string;
  telephone: string;
  dateNaissance?: string;
  role: PersonnelRole;
  entite: Entite;
}

export interface LoginResponseDto {
  id: number;
  nom: string;
  prenom: string;
  accessCode: string;
  role: PersonnelRole;
  entite: Entite;
  /** Ancienne propriété conservée temporairement pour les menus non migrés. */
  loginType?: string;
}

export interface Personnel{
  
}


export interface PersonnelAchatDto {
  id: number;
  nom: string;
  prenom: string;
}

