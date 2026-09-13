
export enum LoginType {
  PERSONAL = 'Personnel', 
  ADMIN = 'Admin', 
  CAISSIER = 'Caissier', 
  USERS_ROLE = 'Client'
}


export enum UserRole {
    ADMIN = 'Admin', 
    CAISSIER = 'Caissier', 
    USERS_ROLE = 'User'
  }

  
export type LoginTypeKey = keyof typeof LoginType;