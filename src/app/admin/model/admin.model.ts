import { LoginTypeKey, UserRole } from "./admin.enum";



  export interface ConfirmCodeRequest {
    email: string;
    code: string;
}


export interface LoginResponseDto {
    id: number;
    loginType: LoginTypeKey;
    role: UserRole;

    nom: string;
    prenom: string;

    email: string;

    telephone: string;
    accessToken: string
}

export interface SimpleAdminResponse {
  id: number;
  role: UserRole;
  nom: string;
  prenom: string;
}
