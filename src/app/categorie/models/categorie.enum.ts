import { EnumMethodes } from "../../shared/utils/util-methode";

export enum CategoryMesure {
  UNIT = "Unité",
  METER = "Mètre",
  PAGNE = "Pagne",
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

