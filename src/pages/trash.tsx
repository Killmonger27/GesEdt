import React, { useState, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  BookOpen,
  FileText,
  Circle,
  Check,
  X,
  AlertTriangle,
  CalendarIcon,
  Clock,
  UserCheck,
  UserX,
} from "lucide-react";

// Interfaces fournies
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

export interface Devoir {
  id: string;
  date: Date;
  creneau: "MATIN" | "SOIR";
  statutDevoir: "FAIT" | "NON_FAIT" | "ANNULE";
  idSalle: string;
  idMatiere: string;
  idEmploiDuTemps: string;
}

// Interfaces supplémentaires pour le composant
interface Filiere {
  id: string;
  nom: string;
}

interface Matiere {
  id: string;
  nom: string;
  code: string;
  couleur: string;
}

interface Salle {
  id: string;
  nom: string;
  batiment: string;
}

interface CoursAffichage extends Cours {
  matiere: Matiere;
  salle: Salle;
}

interface DevoirAffichage extends Devoir {
  matiere: Matiere;
  salle: Salle;
}

interface EdtAffichage extends Edt {
  filiere: Filiere;
}

interface CalendrierEDTProps {
  cours: CoursAffichage[];
  devoirs: DevoirAffichage[];
  modeAffichage: "jour" | "semaine" | "mois";
  dateActuelle: Date;
  onAjouterCours: (coursPartiel?: Partial<Cours>) => void;
  onEditerCours: (cours: CoursAffichage) => void;
  onAjouterDevoir: (devoirPartiel?: Partial<Devoir>) => void;
  onEditerDevoir: (devoir: DevoirAffichage) => void;
}

interface ListeDevoirsProps {
  devoirs: DevoirAffichage[];
  onAjouterDevoir: () => void;
  onEditerDevoir: (devoir: DevoirAffichage) => void;
}

interface ModalCoursProps {
  cours: Partial<Cours> | null;
  salles: Salle[];
  matieres: Matiere[];
  edts: EdtAffichage[];
  onClose: () => void;
  onSave: (cours: Cours) => void;
}

interface ModalDevoirProps {
  devoir: Partial<Devoir> | null;
  salles: Salle[];
  matieres: Matiere[];
  edts: EdtAffichage[];
  onClose: () => void;
  onSave: (devoir: Devoir) => void;
}

// Données fictives pour la démonstration
const filieres: Filiere[] = [
  { id: "filiere-1", nom: "Informatique" },
  { id: "filiere-2", nom: "Mathématiques" },
  { id: "filiere-3", nom: "Physique" },
];

const matieres: Matiere[] = [
  { id: "mat-1", nom: "Algorithmes", code: "ALG202", couleur: "#4C51BF" },
  { id: "mat-2", nom: "Bases de données", code: "BDD101", couleur: "#38A169" },
  { id: "mat-3", nom: "Statistiques", code: "STAT301", couleur: "#D69E2E" },
  { id: "mat-4", nom: "Programmation Web", code: "WEB102", couleur: "#E53E3E" },
];

const salles: Salle[] = [
  { id: "salle-1", nom: "A204", batiment: "A" },
  { id: "salle-2", nom: "B102", batiment: "B" },
  { id: "salle-3", nom: "C303", batiment: "C" },
];

const edtsExemple: EdtAffichage[] = [
  {
    id: "edt-1",
    datePublication: new Date("2025-04-01"),
    dateDebut: new Date("2025-04-15"),
    dateFin: new Date("2025-05-15"),
    statuEdt: "PUBLIE",
    idFiliere: "filiere-1",
    filiere: filieres[0],
  },
  {
    id: "edt-2",
    datePublication: new Date("2025-04-05"),
    dateDebut: new Date("2025-04-20"),
    dateFin: new Date("2025-05-20"),
    statuEdt: "PUBLIE",
    idFiliere: "filiere-2",
    filiere: filieres[1],
  },
];

// Création de données de test
const coursExemple: CoursAffichage[] = [
  {
    id: "cours-1",
    date: new Date("2025-04-28T07:30:00"),
    creneau: "MATIN",
    statutCours: "PLANIFIE",
    disponibiliteProf: "DISPONIBLE",
    idSalle: "salle-1",
    idMatiere: "mat-1",
    idEmploiDuTemps: "edt-1",
    matiere: matieres[0],
    salle: salles[0],
  },
  {
    id: "cours-2",
    date: new Date("2025-04-28T14:00:00"),
    creneau: "SOIR",
    statutCours: "FAIT",
    disponibiliteProf: "DISPONIBLE",
    idSalle: "salle-2",
    idMatiere: "mat-2",
    idEmploiDuTemps: "edt-1",
    matiere: matieres[1],
    salle: salles[1],
  },
  {
    id: "cours-3",
    date: new Date("2025-04-29T09:00:00"),
    creneau: "MATIN",
    statutCours: "NON_FAIT",
    disponibiliteProf: "INDISPONIBLE",
    idSalle: "salle-3",
    idMatiere: "mat-3",
    idEmploiDuTemps: "edt-1",
    matiere: matieres[2],
    salle: salles[2],
  },
];

const devoirsExemple: DevoirAffichage[] = [
  {
    id: "devoir-1",
    date: new Date("2025-05-05T12:00:00"),
    creneau: "MATIN",
    statutDevoir: "FAIT",
    idSalle: "salle-1",
    idMatiere: "mat-1",
    idEmploiDuTemps: "edt-1",
    matiere: matieres[0],
    salle: salles[0],
  },
  {
    id: "devoir-2",
    date: new Date("2025-05-08T16:00:00"),
    creneau: "SOIR",
    statutDevoir: "NON_FAIT",
    idSalle: "salle-2",
    idMatiere: "mat-2",
    idEmploiDuTemps: "edt-1",
    matiere: matieres[1],
    salle: salles[1],
  },
];

export const EmploiDuTemps: React.FC = () => {
  const [edtSelectionne, setEdtSelectionne] = useState<string | null>(null);
  const [filiereSelectionnee, setFiliereSelectionnee] = useState<string | null>(
    null
  );
  const [matiereSelectionnee, setMatiereSelectionnee] = useState<string | null>(
    null
  );
  const [salleSelectionnee, setSalleSelectionnee] = useState<string | null>(
    null
  );
  const [vue, setVue] = useState<"combinee" | "cours" | "devoirs">("combinee");
  const [modeAffichage, setModeAffichage] = useState<
    "jour" | "semaine" | "mois"
  >("semaine");
  const [dateActuelle, setDateActuelle] = useState<Date>(new Date());
  const [coursFiltre, setCoursFiltre] =
    useState<CoursAffichage[]>(coursExemple);
  const [devoirsFiltre, setDevoirsFiltre] =
    useState<DevoirAffichage[]>(devoirsExemple);
  const [modalCoursVisible, setModalCoursVisible] = useState<boolean>(false);
  const [modalDevoirVisible, setModalDevoirVisible] = useState<boolean>(false);
  const [coursEdition, setCoursEdition] = useState<Partial<Cours> | null>(null);
  const [devoirEdition, setDevoirEdition] = useState<Partial<Devoir> | null>(
    null
  );
  const [statutFiltre, setStatutFiltre] = useState<string | null>(null);
  const [disponibiliteFiltre, setDisponibiliteFiltre] = useState<string | null>(
    null
  );

  // Effet pour filtrer les cours et devoirs selon les critères sélectionnés
  useEffect(() => {
    let coursFiltres = coursExemple;
    let devoirsFiltres = devoirsExemple;

    // Filtrage par EDT
    if (edtSelectionne) {
      coursFiltres = coursFiltres.filter(
        (cours) => cours.idEmploiDuTemps === edtSelectionne
      );
      devoirsFiltres = devoirsFiltres.filter(
        (devoir) => devoir.idEmploiDuTemps === edtSelectionne
      );
    }

    // Filtrage par filière
    if (filiereSelectionnee) {
      const edtsFiliere = edtsExemple.filter(
        (edt) => edt.idFiliere === filiereSelectionnee
      );
      const idsEdts = edtsFiliere.map((edt) => edt.id);

      coursFiltres = coursFiltres.filter((cours) =>
        idsEdts.includes(cours.idEmploiDuTemps)
      );
      devoirsFiltres = devoirsFiltres.filter((devoir) =>
        idsEdts.includes(devoir.idEmploiDuTemps)
      );
    }

    // Filtrage par matière
    if (matiereSelectionnee) {
      coursFiltres = coursFiltres.filter(
        (cours) => cours.idMatiere === matiereSelectionnee
      );
      devoirsFiltres = devoirsFiltres.filter(
        (devoir) => devoir.idMatiere === matiereSelectionnee
      );
    }

    // Filtrage par salle
    if (salleSelectionnee) {
      coursFiltres = coursFiltres.filter(
        (cours) => cours.idSalle === salleSelectionnee
      );
      devoirsFiltres = devoirsFiltres.filter(
        (devoir) => devoir.idSalle === salleSelectionnee
      );
    }

    // Filtrage par statut
    if (statutFiltre) {
      coursFiltres = coursFiltres.filter(
        (cours) => cours.statutCours === statutFiltre
      );
      devoirsFiltres = devoirsFiltres.filter(
        (devoir) => devoir.statutDevoir === statutFiltre
      );
    }

    // Filtrage par disponibilité du professeur
    if (disponibiliteFiltre) {
      coursFiltres = coursFiltres.filter(
        (cours) => cours.disponibiliteProf === disponibiliteFiltre
      );
    }

    setCoursFiltre(coursFiltres);
    setDevoirsFiltre(devoirsFiltres);
  }, [
    edtSelectionne,
    filiereSelectionnee,
    matiereSelectionnee,
    salleSelectionnee,
    statutFiltre,
    disponibiliteFiltre,
  ]);

  // Navigation dans le calendrier
  const naviguerCalendrier = (direction: number): void => {
    const nouvelleDate = new Date(dateActuelle);
    if (modeAffichage === "jour") {
      nouvelleDate.setDate(dateActuelle.getDate() + direction);
    } else if (modeAffichage === "semaine") {
      nouvelleDate.setDate(dateActuelle.getDate() + direction * 7);
    } else if (modeAffichage === "mois") {
      nouvelleDate.setMonth(dateActuelle.getMonth() + direction);
    }
    setDateActuelle(nouvelleDate);
  };

  // Ouvrir le modal d'ajout/édition de cours
  const ouvrirModalCours = (cours: Partial<Cours> | null = null): void => {
    setCoursEdition(cours);
    setModalCoursVisible(true);
  };

  // Ouvrir le modal d'ajout/édition de devoir
  const ouvrirModalDevoir = (devoir: Partial<Devoir> | null = null): void => {
    setDevoirEdition(devoir);
    setModalDevoirVisible(true);
  };

  // Formatter la date pour l'affichage
  const formatterDate = (date: Date): string => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Sauvegarde d'un cours
  const sauvegarderCours = (cours: Cours): void => {
    console.log("Cours sauvegardé:", cours);
    setModalCoursVisible(false);
    // Ici, vous ajouteriez la logique pour sauvegarder le cours dans votre backend
  };

  // Sauvegarde d'un devoir
  const sauvegarderDevoir = (devoir: Devoir): void => {
    console.log("Devoir sauvegardé:", devoir);
    setModalDevoirVisible(false);
    // Ici, vous ajouteriez la logique pour sauvegarder le devoir dans votre backend
  };

  // Récupérer les statuts d'EDT pour affichage dans les badges
  const getStatutEdtBadge = (statut: "BROUILLON" | "CLOS" | "PUBLIE") => {
    switch (statut) {
      case "BROUILLON":
        return (
          <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
            Brouillon
          </span>
        );
      case "CLOS":
        return (
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
            Clos
          </span>
        );
      case "PUBLIE":
        return (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            Publié
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Barre supérieure */}
      <div className="bg-card shadow-md p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-card-foreground">
            Gestion de l'emploi du temps
          </h1>
          {edtSelectionne && (
            <div className="text-muted-foreground flex items-center space-x-2">
              <span>
                {
                  edtsExemple.find((edt) => edt.id === edtSelectionne)?.filiere
                    .nom
                }
              </span>
              {getStatutEdtBadge(
                edtsExemple.find((edt) => edt.id === edtSelectionne)
                  ?.statuEdt || "BROUILLON"
              )}
            </div>
          )}
        </div>
      </div>

      {/* Barre d'outils et filtres */}
      <div className="flex justify-between items-center bg-card p-4 border-b border-border">
        <div className="flex space-x-2">
          <select
            className="border rounded p-2 bg-input text-foreground"
            value={edtSelectionne || ""}
            onChange={(e) => setEdtSelectionne(e.target.value || null)}
          >
            <option value="">Tous les emplois du temps</option>
            {edtsExemple.map((edt) => (
              <option key={edt.id} value={edt.id}>
                {edt.filiere.nom} (
                {new Date(edt.dateDebut).toLocaleDateString()} -{" "}
                {new Date(edt.dateFin).toLocaleDateString()})
              </option>
            ))}
          </select>

          <select
            className="border rounded p-2 bg-input text-foreground"
            value={filiereSelectionnee || ""}
            onChange={(e) => setFiliereSelectionnee(e.target.value || null)}
          >
            <option value="">Toutes les filières</option>
            {filieres.map((filiere) => (
              <option key={filiere.id} value={filiere.id}>
                {filiere.nom}
              </option>
            ))}
          </select>

          <select
            className="border rounded p-2 bg-input text-foreground"
            value={modeAffichage}
            onChange={(e) =>
              setModeAffichage(e.target.value as "jour" | "semaine" | "mois")
            }
          >
            <option value="jour">Jour</option>
            <option value="semaine">Semaine</option>
            <option value="mois">Mois</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => naviguerCalendrier(-1)}
            className="p-2 rounded hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-medium text-foreground">
            {formatterDate(dateActuelle)}
          </span>
          <button
            onClick={() => naviguerCalendrier(1)}
            className="p-2 rounded hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded flex items-center ${
              vue === "combinee"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
            onClick={() => setVue("combinee")}
          >
            <Calendar size={16} className="mr-1" /> Tout
          </button>
          <button
            className={`px-4 py-2 rounded flex items-center ${
              vue === "cours"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
            onClick={() => setVue("cours")}
          >
            <BookOpen size={16} className="mr-1" /> Cours
          </button>
          <button
            className={`px-4 py-2 rounded flex items-center ${
              vue === "devoirs"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
            onClick={() => setVue("devoirs")}
          >
            <FileText size={16} className="mr-1" /> Devoirs
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Zone principale */}
        <div className="flex-1 p-4 overflow-auto">
          {vue !== "devoirs" ? (
            <CalendrierEDT
              cours={coursFiltre}
              devoirs={vue === "combinee" ? devoirsFiltre : []}
              modeAffichage={modeAffichage}
              dateActuelle={dateActuelle}
              onAjouterCours={(coursPartiel) =>
                ouvrirModalCours(coursPartiel || {})
              }
              onEditerCours={(cours) => ouvrirModalCours(cours)}
              onAjouterDevoir={(devoirPartiel) =>
                ouvrirModalDevoir(devoirPartiel || {})
              }
              onEditerDevoir={(devoir) => ouvrirModalDevoir(devoir)}
            />
          ) : (
            <ListeDevoirs
              devoirs={devoirsFiltre}
              onAjouterDevoir={() => ouvrirModalDevoir({})}
              onEditerDevoir={(devoir) => ouvrirModalDevoir(devoir)}
            />
          )}
        </div>

        {/* Barre latérale */}
        <div className="w-64 bg-sidebar shadow-lg p-4 border-l border-sidebar-border">
          <div className="mb-6">
            <h3 className="font-medium text-sidebar-foreground mb-3 flex items-center">
              <Filter size={16} className="mr-2" /> Filtres
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-sidebar-foreground mb-1">
                  Matière
                </label>
                <select
                  className="w-full border rounded p-1 text-sm bg-input text-foreground"
                  value={matiereSelectionnee || ""}
                  onChange={(e) =>
                    setMatiereSelectionnee(e.target.value || null)
                  }
                >
                  <option value="">Toutes les matières</option>
                  {matieres.map((matiere) => (
                    <option key={matiere.id} value={matiere.id}>
                      {matiere.code} - {matiere.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-sidebar-foreground mb-1">
                  Salle
                </label>
                <select
                  className="w-full border rounded p-1 text-sm bg-input text-foreground"
                  value={salleSelectionnee || ""}
                  onChange={(e) => setSalleSelectionnee(e.target.value || null)}
                >
                  <option value="">Toutes les salles</option>
                  {salles.map((salle) => (
                    <option key={salle.id} value={salle.id}>
                      {salle.nom} ({salle.batiment})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-sidebar-foreground mb-1">
                  Statut
                </label>
                <select
                  className="w-full border rounded p-1 text-sm bg-input text-foreground"
                  value={statutFiltre || ""}
                  onChange={(e) => setStatutFiltre(e.target.value || null)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="PLANIFIE">Planifié</option>
                  <option value="FAIT">Fait</option>
                  <option value="NON_FAIT">Non fait</option>
                  <option value="ANNULE">Annulé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-sidebar-foreground mb-1">
                  Disponibilité Prof
                </label>
                <select
                  className="w-full border rounded p-1 text-sm bg-input text-foreground"
                  value={disponibiliteFiltre || ""}
                  onChange={(e) =>
                    setDisponibiliteFiltre(e.target.value || null)
                  }
                >
                  <option value="">Toutes</option>
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="INDISPONIBLE">Indisponible</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-sidebar-foreground mb-3">
              Actions rapides
            </h3>
            <div className="space-y-2">
              <button
                className="w-full bg-sidebar-primary text-sidebar-primary-foreground py-2 px-4 rounded flex items-center justify-center"
                onClick={() => ouvrirModalCours({})}
              >
                <Plus size={16} className="mr-2" /> Ajouter un cours
              </button>
              <button
                className="w-full bg-sidebar-accent text-sidebar-accent-foreground py-2 px-4 rounded flex items-center justify-center"
                onClick={() => ouvrirModalDevoir({})}
              >
                <Plus size={16} className="mr-2" /> Ajouter un devoir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour création/édition de cours */}
      {modalCoursVisible && (
        <ModalCours
          cours={coursEdition}
          salles={salles}
          matieres={matieres}
          edts={edtsExemple}
          onClose={() => setModalCoursVisible(false)}
          onSave={sauvegarderCours}
        />
      )}

      {/* Modal pour création/édition de devoir */}
      {modalDevoirVisible && (
        <ModalDevoir
          devoir={devoirEdition}
          salles={salles}
          matieres={matieres}
          edts={edtsExemple}
          onClose={() => setModalDevoirVisible(false)}
          onSave={sauvegarderDevoir}
        />
      )}
    </div>
  );
};

// Composant Calendrier
const CalendrierEDT: React.FC<CalendrierEDTProps> = ({
  cours,
  devoirs,
  modeAffichage,
  dateActuelle,
  onAjouterCours,
  onEditerCours,
  onAjouterDevoir,
  onEditerDevoir,
}) => {
  // Générer les jours en fonction du mode d'affichage
  const genererJours = (): Date[] => {
    const jours: Date[] = [];
    const debutPeriode = new Date(dateActuelle);

    // Ajuster au début de la période (jour, semaine, mois)
    if (modeAffichage === "semaine") {
      const jour = debutPeriode.getDay();
      debutPeriode.setDate(
        debutPeriode.getDate() - (jour === 0 ? 6 : jour - 1)
      ); // Commencer par lundi
    } else if (modeAffichage === "mois") {
      debutPeriode.setDate(1);
    }

    // Nombre de jours à afficher
    let nombreJours = 1;
    if (modeAffichage === "semaine") nombreJours = 7;
    else if (modeAffichage === "mois") {
      const dernierJour = new Date(
        debutPeriode.getFullYear(),
        debutPeriode.getMonth() + 1,
        0
      );
      nombreJours = dernierJour.getDate();
    }

    for (let i = 0; i < nombreJours; i++) {
      const jour = new Date(debutPeriode);
      jour.setDate(debutPeriode.getDate() + i);
      jours.push(jour);
    }

    return jours;
  };

  const jours = genererJours();

  // Fonction pour récupérer l'icône en fonction du statut
  const getStatutIcon = (
    statut: "PLANIFIE" | "FAIT" | "NON_FAIT" | "ANNULE",
    disponibilite?: "DISPONIBLE" | "INDISPONIBLE"
  ) => {
    switch (statut) {
      case "PLANIFIE":
        return <Circle size={14} className="text-blue-600" />;
      case "FAIT":
        return <Check size={14} className="text-green-600" />;
      case "NON_FAIT":
        return <X size={14} className="text-red-600" />;
      case "ANNULE":
        return <AlertTriangle size={14} className="text-yellow-600" />;
      default:
        return null;
    }
  };

  // Fonction pour obtenir la classe de couleur en fonction du statut
  const getStatutClass = (
    statut: "PLANIFIE" | "FAIT" | "NON_FAIT" | "ANNULE",
    disponibilite?: "DISPONIBLE" | "INDISPONIBLE"
  ) => {
    if (disponibilite === "INDISPONIBLE") {
      return "opacity-50";
    }

    switch (statut) {
      case "PLANIFIE":
        return "";
      case "FAIT":
        return "border-l-4 border-green-500";
      case "NON_FAIT":
        return "border-l-4 border-red-500";
      case "ANNULE":
        return "border-l-4 border-yellow-500 opacity-70";
      default:
        return "";
    }
  };
  // Fonction pour vérifier si un jour donné a un cours
  const joursAvecCours = (jour: Date): CoursAffichage[] => {
    return cours.filter((c) => {
      const coursDate = new Date(c.date);
      return (
        coursDate.getDate() === jour.getDate() &&
        coursDate.getMonth() === jour.getMonth() &&
        coursDate.getFullYear() === jour.getFullYear()
      );
    });
  };

  // Fonction pour vérifier si un jour donné a un devoir
  const joursAvecDevoirs = (jour: Date): DevoirAffichage[] => {
    return devoirs.filter((d) => {
      const devoirDate = new Date(d.date);
      return (
        devoirDate.getDate() === jour.getDate() &&
        devoirDate.getMonth() === jour.getMonth() &&
        devoirDate.getFullYear() === jour.getFullYear()
      );
    });
  };

  // Fonction pour formater l'heure
  const formaterHeure = (date: Date): string => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fonction pour vérifier si c'est le jour actuel
  const estJourActuel = (jour: Date): boolean => {
    const aujourdhui = new Date();
    return (
      jour.getDate() === aujourdhui.getDate() &&
      jour.getMonth() === aujourdhui.getMonth() &&
      jour.getFullYear() === aujourdhui.getFullYear()
    );
  };

  // Afficher le calendrier en fonction du mode
  if (modeAffichage === "jour") {
    const coursJour = joursAvecCours(dateActuelle);
    const devoirsJour = joursAvecDevoirs(dateActuelle);

    return (
      <div className="bg-card rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">
          {dateActuelle.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </h2>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-lg mb-3 flex items-center">
                <BookOpen size={18} className="mr-2" /> Cours
                <button
                  className="ml-2 p-1 rounded-full hover:bg-accent"
                  onClick={() => onAjouterCours({ date: dateActuelle })}
                >
                  <Plus size={16} />
                </button>
              </h3>

              {coursJour.length === 0 ? (
                <p className="text-muted-foreground italic">
                  Aucun cours prévu
                </p>
              ) : (
                <div className="space-y-2">
                  {coursJour.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-md cursor-pointer hover:shadow-md transition-all flex items-start
                        ${getStatutClass(c.statutCours, c.disponibiliteProf)}`}
                      style={{ backgroundColor: `${c.matiere.couleur}15` }}
                      onClick={() => onEditerCours(c)}
                    >
                      <div className="mr-2 mt-1">
                        {getStatutIcon(c.statutCours, c.disponibiliteProf)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span
                            className="font-medium"
                            style={{ color: c.matiere.couleur }}
                          >
                            {c.matiere.code} - {c.matiere.nom}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formaterHeure(new Date(c.date))}
                          </span>
                        </div>
                        <div className="text-sm mt-1 flex items-center">
                          <span className="text-muted-foreground flex items-center">
                            <CalendarIcon size={12} className="mr-1" />{" "}
                            {c.creneau === "MATIN" ? "Matin" : "Après-midi"}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="text-muted-foreground flex items-center">
                            {c.salle.nom} ({c.salle.batiment})
                          </span>
                        </div>
                        <div className="text-xs mt-1">
                          {c.disponibiliteProf === "INDISPONIBLE" && (
                            <span className="inline-flex items-center text-red-600">
                              <UserX size={12} className="mr-1" /> Professeur
                              indisponible
                            </span>
                          )}
                          {c.disponibiliteProf === "DISPONIBLE" && (
                            <span className="inline-flex items-center text-green-600">
                              <UserCheck size={12} className="mr-1" />{" "}
                              Professeur disponible
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium text-lg mb-3 flex items-center">
                <FileText size={18} className="mr-2" /> Devoirs
                <button
                  className="ml-2 p-1 rounded-full hover:bg-accent"
                  onClick={() => onAjouterDevoir({ date: dateActuelle })}
                >
                  <Plus size={16} />
                </button>
              </h3>

              {devoirsJour.length === 0 ? (
                <p className="text-muted-foreground italic">
                  Aucun devoir prévu
                </p>
              ) : (
                <div className="space-y-2">
                  {devoirsJour.map((d) => (
                    <div
                      key={d.id}
                      className={`p-3 rounded-md cursor-pointer hover:shadow-md transition-all flex items-start
                        ${getStatutClass(d.statutDevoir)}`}
                      style={{ backgroundColor: `${d.matiere.couleur}15` }}
                      onClick={() => onEditerDevoir(d)}
                    >
                      <div className="mr-2 mt-1">
                        {getStatutIcon(d.statutDevoir)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span
                            className="font-medium"
                            style={{ color: d.matiere.couleur }}
                          >
                            {d.matiere.code} - {d.matiere.nom}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formaterHeure(new Date(d.date))}
                          </span>
                        </div>
                        <div className="text-sm mt-1 flex items-center">
                          <span className="text-muted-foreground flex items-center">
                            <FileText size={12} className="mr-1" /> Devoir{" "}
                            {d.creneau === "MATIN" ? "matin" : "soir"}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="text-muted-foreground flex items-center">
                            {d.salle.nom} ({d.salle.batiment})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Affichage semaine et mois
  return (
    <div className="bg-card rounded-lg shadow">
      <div className="grid grid-cols-7 border-b border-border">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
          (jour, index) => (
            <div
              key={jour}
              className="p-2 text-center font-medium text-sm border-r last:border-r-0 border-border"
            >
              {jour}
            </div>
          )
        )}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr">
        {jours.map((jour, index) => {
          const coursJour = joursAvecCours(jour);
          const devoirsJour = joursAvecDevoirs(jour);
          const isToday = estJourActuel(jour);

          return (
            <div
              key={index}
              className={`min-h-28 border-r border-b last:border-r-0 p-2 relative
                ${isToday ? "bg-blue-50" : ""}`}
            >
              <div className="flex justify-between mb-1">
                <span
                  className={`text-sm font-medium ${
                    isToday ? "text-blue-600" : ""
                  }`}
                >
                  {jour.getDate()}
                </span>

                {/* Boutons d'ajout rapide */}
                <div className="flex space-x-1">
                  <button
                    className="p-1 rounded-full text-primary hover:bg-primary-light"
                    onClick={() => onAjouterCours({ date: jour })}
                  >
                    <BookOpen size={12} />
                  </button>
                  <button
                    className="p-1 rounded-full text-accent hover:bg-accent-light"
                    onClick={() => onAjouterDevoir({ date: jour })}
                  >
                    <FileText size={12} />
                  </button>
                </div>
              </div>

              {/* Cours du jour */}
              <div className="space-y-1 overflow-y-auto max-h-28">
                {coursJour.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onEditerCours(c)}
                    className={`px-2 py-1 text-xs rounded cursor-pointer truncate flex items-center
                      ${getStatutClass(c.statutCours, c.disponibiliteProf)}`}
                    style={{ backgroundColor: `${c.matiere.couleur}20` }}
                  >
                    <div className="mr-1 flex-shrink-0">
                      {getStatutIcon(c.statutCours, c.disponibiliteProf)}
                    </div>
                    <div className="truncate">
                      <span style={{ color: c.matiere.couleur }}>
                        {c.matiere.code}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {" "}
                        {c.creneau === "MATIN" ? "M" : "S"}
                      </span>
                    </div>
                  </div>
                ))}

                {coursJour.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{coursJour.length - 3} cours
                  </div>
                )}

                {/* Devoirs du jour */}
                {devoirsJour.slice(0, 2).map((d) => (
                  <div
                    key={d.id}
                    onClick={() => onEditerDevoir(d)}
                    className={`px-2 py-1 text-xs rounded cursor-pointer truncate flex items-center
                      ${getStatutClass(d.statutDevoir)}`}
                    style={{
                      backgroundColor: `${d.matiere.couleur}15`,
                      borderStyle: "dashed",
                      borderWidth: "1px",
                      borderColor: d.matiere.couleur,
                    }}
                  >
                    <div className="mr-1 flex-shrink-0">
                      {getStatutIcon(d.statutDevoir)}
                    </div>
                    <div className="truncate">
                      <span style={{ color: d.matiere.couleur }}>
                        {d.matiere.code}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {" "}
                        {d.creneau === "MATIN" ? "M" : "S"}
                      </span>
                    </div>
                  </div>
                ))}

                {devoirsJour.length > 2 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{devoirsJour.length - 2} devoirs
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Composant Liste des devoirs
const ListeDevoirs: React.FC<ListeDevoirsProps> = ({
  devoirs,
  onAjouterDevoir,
  onEditerDevoir,
}) => {
  // Regrouper les devoirs par date
  const devoirsParDate = devoirs.reduce((acc, devoir) => {
    const dateKey = new Date(devoir.date).toLocaleDateString("fr-FR");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(devoir);
    return acc;
  }, {} as Record<string, DevoirAffichage[]>);

  // Trier les dates
  const datesSorted = Object.keys(devoirsParDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  // Récupérer l'icône en fonction du statut
  const getStatutIcon = (statut: "FAIT" | "NON_FAIT" | "ANNULE") => {
    switch (statut) {
      case "FAIT":
        return <Check size={16} className="text-green-600" />;
      case "NON_FAIT":
        return <X size={16} className="text-red-600" />;
      case "ANNULE":
        return <AlertTriangle size={16} className="text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-card rounded-lg shadow">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="text-xl font-semibold">Liste des devoirs</h2>
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded flex items-center"
          onClick={() => onAjouterDevoir()}
        >
          <Plus size={16} className="mr-2" /> Ajouter un devoir
        </button>
      </div>

      <div className="p-4">
        {datesSorted.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <FileText size={48} className="mx-auto mb-3 opacity-30" />
            <p>Aucun devoir trouvé</p>
          </div>
        ) : (
          <div className="space-y-6">
            {datesSorted.map((dateKey) => (
              <div
                key={dateKey}
                className="border-b border-border pb-4 last:border-0"
              >
                <h3 className="text-lg font-medium mb-3">
                  {new Date(dateKey).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h3>

                <div className="space-y-2">
                  {devoirsParDate[dateKey].map((devoir) => (
                    <div
                      key={devoir.id}
                      className="p-4 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-all flex items-start border border-border"
                      onClick={() => onEditerDevoir(devoir)}
                    >
                      <div className="mr-3 mt-1">
                        {getStatutIcon(devoir.statutDevoir)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <span
                              className="font-medium text-lg"
                              style={{ color: devoir.matiere.couleur }}
                            >
                              {devoir.matiere.nom}
                            </span>
                            <span className="ml-2 text-sm text-muted-foreground">
                              ({devoir.matiere.code})
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center text-sm text-muted-foreground">
                              <Clock size={14} className="mr-1" />
                              {new Date(devoir.date).toLocaleTimeString(
                                "fr-FR",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </span>
                            <span className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded">
                              {devoir.creneau === "MATIN" ? "Matin" : "Soir"}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm mt-2 flex items-center">
                          <span className="text-muted-foreground flex items-center">
                            {devoir.salle.nom} ({devoir.salle.batiment})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Modal pour création/édition de cours
const ModalCours: React.FC<ModalCoursProps> = ({
  cours,
  salles,
  matieres,
  edts,
  onClose,
  onSave,
}) => {
  const estNouveauCours = !cours?.id;
  const [formData, setFormData] = useState<Partial<Cours>>({
    id: cours?.id || `cours-${Date.now()}`,
    date: cours?.date || new Date(),
    creneau: cours?.creneau || "MATIN",
    statutCours: cours?.statutCours || "PLANIFIE",
    disponibiliteProf: cours?.disponibiliteProf || "DISPONIBLE",
    idSalle: cours?.idSalle || "",
    idMatiere: cours?.idMatiere || "",
    idEmploiDuTemps: cours?.idEmploiDuTemps || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    const [year, month, day] = dateValue.split("-").map(Number);
    const newDate = new Date(formData.date as Date);
    newDate.setFullYear(year, month - 1, day);
    setFormData({ ...formData, date: newDate });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    const [hours, minutes] = timeValue.split(":").map(Number);
    const newDate = new Date(formData.date as Date);
    newDate.setHours(hours, minutes);
    setFormData({ ...formData, date: newDate });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Cours);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {estNouveauCours ? "Ajouter un cours" : "Modifier le cours"}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  className="w-full p-2 border rounded"
                  value={
                    formData.date
                      ? new Date(formData.date).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={handleDateChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Heure</label>
                <input
                  type="time"
                  name="time"
                  className="w-full p-2 border rounded"
                  value={
                    formData.date
                      ? `${String(new Date(formData.date).getHours()).padStart(
                          2,
                          "0"
                        )}:${String(
                          new Date(formData.date).getMinutes()
                        ).padStart(2, "0")}`
                      : ""
                  }
                  onChange={handleTimeChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Créneau</label>
              <select
                name="creneau"
                className="w-full p-2 border rounded"
                value={formData.creneau || "MATIN"}
                onChange={handleChange}
                required
              >
                <option value="MATIN">Matin</option>
                <option value="SOIR">Après-midi/Soir</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Matière</label>
              <select
                name="idMatiere"
                className="w-full p-2 border rounded"
                value={formData.idMatiere || ""}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner une matière</option>
                {matieres.map((matiere) => (
                  <option key={matiere.id} value={matiere.id}>
                    {matiere.code} - {matiere.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Salle</label>
              <select
                name="idSalle"
                className="w-full p-2 border rounded"
                value={formData.idSalle || ""}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner une salle</option>
                {salles.map((salle) => (
                  <option key={salle.id} value={salle.id}>
                    {salle.nom} ({salle.batiment})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Emploi du temps
              </label>
              <select
                name="idEmploiDuTemps"
                className="w-full p-2 border rounded"
                value={formData.idEmploiDuTemps || ""}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un emploi du temps</option>
                {edts.map((edt) => (
                  <option key={edt.id} value={edt.id}>
                    {edt.filiere.nom} (
                    {new Date(edt.dateDebut).toLocaleDateString()} -{" "}
                    {new Date(edt.dateFin).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Statut du cours
              </label>
              <select
                name="statutCours"
                className="w-full p-2 border rounded"
                value={formData.statutCours || "PLANIFIE"}
                onChange={handleChange}
              >
                <option value="PLANIFIE">Planifié</option>
                <option value="FAIT">Fait</option>
                <option value="NON_FAIT">Non fait</option>
                <option value="ANNULE">Annulé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Disponibilité du professeur
              </label>
              <select
                name="disponibiliteProf"
                className="w-full p-2 border rounded"
                value={formData.disponibiliteProf || "DISPONIBLE"}
                onChange={handleChange}
              >
                <option value="DISPONIBLE">Disponible</option>
                <option value="INDISPONIBLE">Indisponible</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 border rounded text-foreground hover:bg-accent"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              {estNouveauCours ? "Créer" : "Mettre à jour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal pour création/édition de devoir
const ModalDevoir: React.FC<ModalDevoirProps> = ({
  devoir,
  salles,
  matieres,
  edts,
  onClose,
  onSave,
}) => {
  const estNouveauDevoir = !devoir?.id;
  const [formData, setFormData] = useState<Partial<Devoir>>({
    id: devoir?.id || `devoir-${Date.now()}`,
    date: devoir?.date || new Date(),
    creneau: devoir?.creneau || "MATIN",
    statutDevoir: devoir?.statutDevoir || "FAIT",
    idSalle: devoir?.idSalle || "",
    idMatiere: devoir?.idMatiere || "",
    idEmploiDuTemps: devoir?.idEmploiDuTemps || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    const [year, month, day] = dateValue.split("-").map(Number);
    const newDate = new Date(formData.date as Date);
    newDate.setFullYear(year, month - 1, day);
    setFormData({ ...formData, date: newDate });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    const [hours, minutes] = timeValue.split(":").map(Number);
    const newDate = new Date(formData.date as Date);
    newDate.setHours(hours, minutes);
    setFormData({ ...formData, date: newDate });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Devoir);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {estNouveauDevoir ? "Ajouter un devoir" : "Modifier le devoir"}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  className="w-full p-2 border rounded"
                  value={
                    formData.date
                      ? new Date(formData.date).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={handleDateChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Heure</label>
                <input
                  type="time"
                  name="time"
                  className="w-full p-2 border rounded"
                  value={
                    formData.date
                      ? `${String(new Date(formData.date).getHours()).padStart(
                          2,
                          "0"
                        )}:${String(
                          new Date(formData.date).getMinutes()
                        ).padStart(2, "0")}`
                      : ""
                  }
                  onChange={handleTimeChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Créneau</label>
              <select
                name="creneau"
                className="w-full p-2 border rounded"
                value={formData.creneau || "MATIN"}
                onChange={handleChange}
                required
              >
                <option value="MATIN">Matin</option>
                <option value="SOIR">Après-midi/Soir</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Matière</label>
              <select
                name="idMatiere"
                className="w-full p-2 border rounded"
                value={formData.idMatiere || ""}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner une matière</option>
                {matieres.map((matiere) => (
                  <option key={matiere.id} value={matiere.id}>
                    {matiere.code} - {matiere.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Salle</label>
              <select
                name="idSalle"
                className="w-full p-2 border rounded"
                value={formData.idSalle || ""}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner une salle</option>
                {salles.map((salle) => (
                  <option key={salle.id} value={salle.id}>
                    {salle.nom} ({salle.batiment})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Emploi du temps
              </label>
              <select
                name="idEmploiDuTemps"
                className="w-full p-2 border rounded"
                value={formData.idEmploiDuTemps || ""}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un emploi du temps</option>
                {edts.map((edt) => (
                  <option key={edt.id} value={edt.id}>
                    {edt.filiere.nom} (
                    {new Date(edt.dateDebut).toLocaleDateString()} -{" "}
                    {new Date(edt.dateFin).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Statut du devoir
              </label>
              <select
                name="statutDevoir"
                className="w-full p-2 border rounded"
                value={formData.statutDevoir || "FAIT"}
                onChange={handleChange}
              >
                <option value="FAIT">Fait</option>
                <option value="NON_FAIT">Non fait</option>
                <option value="ANNULE">Annulé</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 border rounded text-foreground hover:bg-accent"
                onClick={onClose}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                {estNouveauDevoir ? "Créer" : "Mettre à jour"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
