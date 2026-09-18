import { EnumMethodes } from "../../shared/utils/util-methode";

export enum CategoryMesure {
  UNITE = "Unité",
  PAIRE = "Paire",
  METRE = "Mètre",
  PAGNE = "Pagne",
  CARTON = "Carton",
}

export enum CategoryType {
  TRANSFERT = "Transfert",
  SIMPLE = "Simple",
}

export function getCategoryMesureKey(value: CategoryMesure): keyof typeof CategoryMesure {

    const key = EnumMethodes.getEnumKeyByValue(
        CategoryMesure,
        value
    );

    if (!key) {
        throw new Error(
            `CategoryMesure introuvable pour la valeur : ${value}`
        );
    }

    return key as keyof typeof CategoryMesure;
}


