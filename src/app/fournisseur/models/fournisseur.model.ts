export interface FournisseurResponsableResponse {
  id: number;
  nom: string;
  prenom: string;
}

export interface FournisseurResponse {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  adminResponsable?: FournisseurResponsableResponse | null;
}

export interface FournisseurRequestDto {
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
}
