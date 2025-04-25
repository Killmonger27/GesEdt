export interface Cours {
  id: string;
  date: Date;
  creneau: "MATIN" | "SOIR";
  statutCours: "PLANIFIE" | "FAIT" | "NON_FAIT" | "ANNULE";
  disponibiliteProf: "DISPONIBLE" | "INDISPONIBLE";
  idSalle: string;
  idMatiere: string;
  idEmploiDuTemps: string;
}

export interface Edt {
  id: string;
  datePublication: Date;
  dateDebut: Date;
  dateFin: Date;
  statuEdt: "BROUILLON" | "CLOS" | "PUBLIE";
  idFiliere: string;
}
