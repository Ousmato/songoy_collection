import { EnumMethodes } from "../utils/util-methode";

export enum UserRole {
    ADMIN = 'Admin',
    CAISSIER = 'Caissier',
    USERS_ROLE = 'User'
}


export interface ConfirmCodeRequest {
    email: string;
    code: string;
}

export enum LoginType {
    PERSONAL = 'Personnel',
    ADMIN = 'Admin',
    CAISSIER = 'Caissier',
    USERS_ROLE = 'Client'
}

export type LoginTypeKey = keyof typeof LoginType;



export function getRoleKey(value: UserRole): keyof typeof UserRole {

    const key = EnumMethodes.getEnumKeyByValue(
        UserRole,
        value
    );

    if (!key) {
        throw new Error(
            `UserRole introuvable pour la valeur : ${value}`
        );
    }

    return key as keyof typeof UserRole;
}

export enum ModePaiement {
    CASH = 'Cash',
    CREDIT = 'Vente a credit',
    MOBILE = 'Mobile',
    CHECKING = 'Cheque',
}
export type ModePaiementKey = keyof typeof ModePaiement;

export function getModePaiementKey(value: ModePaiement): ModePaiementKey {

    const key = EnumMethodes.getEnumKeyByValue(
        ModePaiement,
        value
    );

    if (!key) {
        throw new Error(
            `ModePaiement introuvable pour la valeur : ${value}`
        );
    }

    return key as ModePaiementKey;
}

export enum TypeEntite {
    BOUTIQUE = 'Boutique',
    ATELIER_COUTURE = 'Atelier couture',
}

export type TypeEntiteKey = keyof typeof TypeEntite;

export function getTypeEntiteKey(value: TypeEntite): TypeEntiteKey {

    const key = EnumMethodes.getEnumKeyByValue(
        TypeEntite,
        value
    );

    if (!key) {
        throw new Error(
            `TypeEntite introuvable pour la valeur : ${value}`
        );
    }

    return key as TypeEntiteKey;
}


export enum MotifDepenseAtelier {
  SALAIRE = 'Salaire',
  TRANSPORT = 'Transport',
  REPARATION = 'Reparation',
  ACCESSOIRE = 'Accessoire',
  AUTRE = 'Autre',
}
export type MotifDepenseAtelierKey = keyof typeof MotifDepenseAtelier;

export function getMotifDepenseAtelierKey(value: MotifDepenseAtelier): MotifDepenseAtelierKey {
    const key = EnumMethodes.getEnumKeyByValue(
        MotifDepenseAtelier,
        value
    );

    if (!key) {
        throw new Error(
            `MotifDepenseAtelier introuvable pour la valeur : ${value}`
        );
    }

    return key as MotifDepenseAtelierKey;
}


export enum HabitType {
  BOUBOU = 'Boubou',
  GRAND_BOUBOU = 'Grand boubou',
  CHEMISE = 'Chemise',
  PANTALON = 'Pantalon',
  ROBE = 'Robe',
  JUPE = 'Jupe',
  TUNIQUE = 'Tunique',
  ENSEMBLE = 'Ensemble',
  VESTE = 'Veste',
  COSTUME = 'Costume',
  UNIFORME = 'Uniforme',
  RETOUCHE = 'Retouche',
  AUTRE = 'Autre',
}

export type HabitTypeKey = keyof typeof HabitType;
