
export enum LoginType {
  PERSONAL = 'Personnel', 
  ADMIN = 'Admin', 
  CAISSIER = 'Caissier', 
  USERS_ROLE = 'Client'
}


export enum PersonnelRole {
   ADMIN = 'ADMIN',
    CAISSIER = 'CAISSIER',
    APPRENANT = 'APPRENANT',
    JUNIOR = 'JUNIOR',
    MENTOR = 'MENTOR',
    CLIENT = 'CLIENT',
    RESPONSABLE = 'RESPONSABLE',
    COUTURIER = 'COUTURIER',
    SUPER_ADMIN = 'SUPER_ADMIN',
    LIVREUR = 'Livreur',
  }

export enum Entite {
  GLOBAL = 'GLOBAL',
  BOUTIQUE = 'BOUTIQUE',
  ATELIER = 'ATELIER',
}


export type TypeEntiteKey = keyof typeof Entite;

  
export type LoginTypeKey = keyof typeof LoginType;
