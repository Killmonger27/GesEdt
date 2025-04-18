export interface AuthState {
  id: string | null;
  nom: string | null;
  prenom: string | null;
  type: string | null;
  email: string | null;
  statutCompte: string | null;
  roles: string[] | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  sexe: string;
  telephone: string;
  email: string;
  password: string;
  role: "ETUDIANT" | "ADMIN" | "ENSEIGNANT" | "PARENT";

  // Informations parent
  typeParent?: "PERE" | "MERE" | "TUTEUR";
  lieuResidence?: string;

  // Informations etudiant
  ine?: string;
  titreEtudiant?: "ETUDIANT_SIMPLE" | "ETUDIANT_DELEGUE";
  parentID?: string;
  filiereID?: string;

  // Informations enseignant
  matricule?: string;
  typeEnseignant?: "VACATAIRE" | "PERMANENT";
  grade?: string;
  specialite?: string;

  typeAdmin: "COORDONNATEUR" | "SCOLARITE";
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  id: string;
  nom: string;
  prenom: string;
  type: string;
  email: string;
  statutCompte: string;
  roles: string[];
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}
