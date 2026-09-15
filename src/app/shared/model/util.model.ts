import { LoginType, PersonnelRole } from "./util.enum";

export interface LoginResponseDto {
    id: number;
    loginType: keyof typeof LoginType;
    niveauName: string;
    niveauId: number;
    role: keyof typeof PersonnelRole;

    nom: string;
    prenom: string;

    email: string;

    telephone: string;
    countryCode: string;
    accessToken: string
}
