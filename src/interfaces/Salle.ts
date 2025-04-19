// Type pour une salle
export interface Salle {
  id: string;
  numeroSalle: string;
  disponibiliteSalle: "LIBRE" | "OCCUPEE"; // Type plus strict
}

// Type pour l'envoi de données a l'API
export type SalleCreationPayload = Omit<Salle, "id">;

// Type pour la mise à jour d'une salle
export type SalleUpdatePayload = Partial<SalleCreationPayload>;
