import { LoginType, UserRole } from "./util.enum";

export interface LoginResponseDto {
    id: number;
    loginType: keyof typeof LoginType;
    niveauName: string;
    niveauId: number;
    role: keyof typeof UserRole;

    nom: string;
    prenom: string;

    email: string;

    telephone: string;
    countryCode: string;
    accessToken: string
}