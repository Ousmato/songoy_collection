
import { Entite, PersonnelRole, TypeEntiteKey } from "../../admin/model/admin.enum";
import { EnumMethodes } from "../utils/util-methode";

export { Entite, PersonnelRole } from "../../admin/model/admin.enum";

/** Compatibilité avec l'ancien menu ; les permissions utilisent PersonnelRole. */
export enum LoginType {
    PERSONAL = 'Personnel',
    ADMIN = 'Admin',
    CAISSIER = 'Caissier',
    USERS_ROLE = 'Client',
}
export type LoginTypeKey = keyof typeof LoginType;



export interface ConfirmCodeRequest {
    email: string;
    code: string;
}



export function getRoleKey(value: PersonnelRole): keyof typeof PersonnelRole {

    const key = EnumMethodes.getEnumKeyByValue(
        PersonnelRole,
        value
    );

    if (!key) {
        throw new Error(
            `UserRole introuvable pour la valeur : ${value}`
        );
    }

    return key as keyof typeof PersonnelRole;
}

export enum ModePaiement {
    CASH = 'Cash',
    CREDIT = 'A credit',
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

export function getTypeEntiteKey(value: Entite): TypeEntiteKey {

    const key = EnumMethodes.getEnumKeyByValue(
        Entite,
        value
    );

    if (!key) {
        throw new Error(
            `TypeEntite introuvable pour la valeur : ${value}`
        );
    }

    return key as TypeEntiteKey;
}


export enum MotifDepense {
  SALAIRE = 'Salaire',
  TRANSPORT = 'Transport',
  REPARATION = 'Reparation',
  ACCESSOIRE = 'Accessoire',
  ELECTRICITER = 'Electricité',
  EAUX = 'Eaux',
  AUTRE = 'Autre',
}
export type MotifDepenseAtelierKey = keyof typeof MotifDepense;

export function getMotifDepenseAtelierKey(value: MotifDepense): MotifDepenseAtelierKey {
    const key = EnumMethodes.getEnumKeyByValue(
        MotifDepense,
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
