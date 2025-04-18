export interface Profile {
  id: string;
  nom: string;
  prenom: string;
  sexe: string;
  telephone: string;
  email: string;
  password: string;
  statutCompte: "ACTIF" | "INACTIF" | "SUSPENDU" | "BLOQUE";
}

export interface UserData {
  id: string;
  nom: string;
  prenom: string;
  sexe: string;
  telephone: string;
  email: string;
  password: string;
  statutCompte: "ACTIF" | "INACTIF" | "SUSPENDU" | "BLOQUE";
  role: string;
  matricule: string;
  typeAdmin: string;
  enabled: boolean;
  authorities: Map<string, string>[];
  username: string;
  accountNonExpired: boolean;
  credentialsNonExpired: boolean;
  accountNonLocked: boolean;
}

export interface UserDetailsUpdate {
  nom: string;
  prenom: string;
  telephone: string;
}

export interface UserPasswordUpdate {
  oldPassword: string;
  newPassword: string;
}

export interface UserPasswordUpdateResponse {
  message: string;
  success: boolean;
  emailUtilisateur: string;
}

export interface FormErrors {
  nom?: string;
  prenom?: string;
  sexe?: string;
  telephone?: string;
  email?: string;
}

export interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}
