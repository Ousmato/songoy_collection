import { LoginType, PersonnelRole } from "../model/util.enum";


export class EnumMethodes{

    static getEnumeratedKeyValue<T extends object>(enumClass: T): { key: string, value: string }[] {
        return Object.keys(enumClass)
          .filter(key => isNaN(Number(key))) // Filtrer les clés numériques (si l'énumération est bidirectionnelle)
          .map(key => ({
            key,
            value: (enumClass as any)[key]
          }));
      }
    
       static getEnumKeyByValue<T extends Record<string, string>>(enumObj: T, value: string): keyof T | undefined {
        return (Object.keys(enumObj) as (keyof T)[]).find(key => enumObj[key] === value);
      }
      static getEnumValueByKey<T extends Record<string, string>>(enumObj: T, key: string): T[keyof T] | undefined {
        return enumObj[key as keyof T];
      }

      static getLoginTypeKey(value: LoginType): keyof typeof LoginType {

        const key = this.getEnumKeyByValue(
          LoginType,
          value
        );

        if (!key) {
          throw new Error(
            `LoginType introuvable pour la valeur : ${value}`
          );
        }

        return key as keyof typeof LoginType;
      }

      static getRoleKey(value: PersonnelRole): keyof typeof PersonnelRole {

        const key = this.getEnumKeyByValue(
          PersonnelRole,
          value
        );

        if (!key) {
          throw new Error(
            `PersonnelRole introuvable pour la valeur : ${value}`
          );
        }

        return key as keyof typeof PersonnelRole;
      }


      // Methode pour recuperer les key value
      static getEnumKeyVale(obj: Record<string, string>): {key: string, value: string}[] {
         return Object.keys(obj).map(key => ({
            key,
            value: obj[key]
        }));
}
      
}
