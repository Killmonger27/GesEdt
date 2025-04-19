// Type pour un module
export interface Module {
  id: string;
  intitule: string;
  volumeHoraire: number;
  semestre: "S1" | "S2" | "S3" | "S4" | "S5" | "S6";
  statutMatiere: "NON_DEBUTE" | "EN_COURS" | "TERMINE";
  idEnseignant: string;
  idFiliere: string;
}

// Type pour l'envoi de données a l'API
export type ModuleCreationPayload = Omit<Module, "id">;

// Type pour la mise à jour d'un module
export type ModuleUpdatePayload = Partial<ModuleCreationPayload>;
