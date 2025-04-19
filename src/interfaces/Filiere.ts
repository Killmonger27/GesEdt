// Interface donnant le chemin d'une filiere
export interface Filiere {
  id: string;
  nomFiliere: string;
  description: string;
  niveau: "L1" | "L2" | "L3" | "M1" | "M2"; // Type plus strict pour respecter les enums sur le backend
}

// Type pour l'envoi de données a l'API
export type FiliereCreationPayload = Omit<Filiere, "id">;

// Type pour la mise à jour d'une filiere
export type FiliereUpdatePayload = Partial<FiliereCreationPayload>;
