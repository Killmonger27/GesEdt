import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, FileText } from "lucide-react";

// Interfaces TypeScript
export interface Filiere {
  id: number;
  nom: string;
}

export interface Cours {
  id: number;
  titre: string;
  filiere: number;
  module: string;
  enseignant: string;
  salle: string;
  debut: string;
  fin: string;
  couleur: string;
}

export interface Devoir {
  id: number;
  titre: string;
  filiere: number;
  module: string;
  echeance: string;
  description: string;
}

type FormulaireCours = Cours;

type FormulaireDevoir = Devoir;

interface CalendrierEDTProps {
  cours: Cours[];
  devoirs: Devoir[];
  modeAffichage: "jour" | "semaine" | "mois";
  dateActuelle: Date;
  onAjouterCours: (cours?: Partial<Cours>) => void;
  onEditerCours: (cours: Cours) => void;
}

interface ModalEditionProps {
  type: "cours" | "devoir";
  element: Cours | Devoir | null;
  filieres: Filiere[];
  filiereSelectionnee: number | null;
  onClose: () => void;
  onSave: (element: FormulaireCours | FormulaireDevoir) => void;
}

// Données fictives pour la démonstration
const filieres: Filiere[] = [
  { id: 1, nom: "Informatique" },
  { id: 2, nom: "Mathématiques" },
  { id: 3, nom: "Physique" },
  { id: 4, nom: "Chimie" },
];

const coursExemple: Cours[] = [
  {
    id: 1,
    titre: "Algorithmes avancés",
    filiere: 1,
    module: "ALG202",
    enseignant: "Dr. Martin",
    salle: "A204",
    debut: "2025-04-28T07:30",
    fin: "2025-04-28T09:30",
    couleur: "var(--color-chart-1)",
  },
  {
    id: 2,
    titre: "Base de données",
    filiere: 1,
    module: "BDD101",
    enseignant: "Dr. Chen",
    salle: "B102",
    debut: "2025-04-28T10:00",
    fin: "2025-04-28T12:00",
    couleur: "var(--color-chart-2)",
  },
  {
    id: 3,
    titre: "Statistiques",
    filiere: 2,
    module: "STAT301",
    enseignant: "Dr. Dupont",
    salle: "C303",
    debut: "2025-04-28T14:00",
    fin: "2025-04-28T16:00",
    couleur: "var(--color-chart-3)",
  },
];

const devoirsExemple: Devoir[] = [
  {
    id: 1,
    titre: "Projet Algorithmes",
    filiere: 1,
    module: "ALG202",
    echeance: "2025-05-10T23:59",
    description: "Implémenter l'algorithme de Dijkstra",
  },
  {
    id: 2,
    titre: "TP SQL",
    filiere: 1,
    module: "BDD101",
    echeance: "2025-05-05T23:59",
    description: "Réaliser les requêtes demandées",
  },
  {
    id: 3,
    titre: "Devoir Probabilités",
    filiere: 2,
    module: "STAT301",
    echeance: "2025-05-12T12:00",
    description: "Exercices 1 à 10 du chapitre 4",
  },
];

const EmploiDuTemps: React.FC = () => {
  const [filiereSelectionnee, setFiliereSelectionnee] = useState<number | null>(
    null
  );
  const vue = "combinee";
  const [modeAffichage, setModeAffichage] = useState<
    "jour" | "semaine" | "mois"
  >("semaine");
  const [dateActuelle, setDateActuelle] = useState<Date>(new Date());
  const [coursFiltre, setCoursFiltre] = useState<Cours[]>(coursExemple);
  const [devoirsFiltre, setDevoirsFiltre] = useState<Devoir[]>(devoirsExemple);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [typeModal, setTypeModal] = useState<"cours" | "devoir" | null>(null);
  const [elementsEdition, setElementsEdition] = useState<Cours | Devoir | null>(
    null
  );

  // Effet pour filtrer les cours et devoirs selon la filière sélectionnée
  useEffect(() => {
    if (filiereSelectionnee) {
      setCoursFiltre(
        coursExemple.filter((cours) => cours.filiere === filiereSelectionnee)
      );
      setDevoirsFiltre(
        devoirsExemple.filter(
          (devoir) => devoir.filiere === filiereSelectionnee
        )
      );
    } else {
      setCoursFiltre(coursExemple);
      setDevoirsFiltre(devoirsExemple);
    }
  }, [filiereSelectionnee]);

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

  // Ouvrir le modal de création/édition
  const ouvrirModal = (
    type: "cours" | "devoir",
    element: Cours | Devoir | null = null
  ): void => {
    setTypeModal(type);
    setElementsEdition(element);
    setModalVisible(true);
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

  return (
    <div className="flex flex-col h-screen max-w-full bg-background">
      {/* Barre supérieure */}
      <div className="bg-card shadow-md p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-card-foreground">
            Gestion de l'emploi du temps
          </h1>
          {filiereSelectionnee && (
            <div className="text-muted-foreground">
              {filieres.find((f) => f.id === filiereSelectionnee)?.nom}
            </div>
          )}
        </div>
      </div>

      {/* Barre d'outils et filtres */}
      <div className="flex justify-between items-center bg-card p-4 border-b border-border">
        <div className="flex space-x-2">
          <select
            className="border rounded p-2 bg-input text-foreground"
            value={filiereSelectionnee || ""}
            onChange={(e) =>
              setFiliereSelectionnee(
                e.target.value ? parseInt(e.target.value) : null
              )
            }
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
            className="px-4 py-2 rounded flex items-center bg-sidebar-primary text-sidebar-primary-foreground "
            onClick={() => ouvrirModal("cours")}
          >
            <Plus size={16} className="mr-1" /> Cours
          </button>
          <button
            className="px-4 py-2 rounded flex items-center bg-sidebar-primary text-sidebar-primary-foreground"
            onClick={() => ouvrirModal("devoir")}
          >
            <Plus size={16} className="mr-1" /> Devoir
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Zone principale */}
        <div className="flex-1 p-4 overflow-auto">
          <CalendrierEDT
            cours={coursFiltre}
            devoirs={vue === "combinee" ? devoirsFiltre : []}
            modeAffichage={modeAffichage}
            dateActuelle={dateActuelle}
            onAjouterCours={() => ouvrirModal("cours")}
            onEditerCours={(cours) => ouvrirModal("cours", cours)}
          />
        </div>
      </div>

      {/* Modal pour création/édition */}
      {modalVisible && typeModal && (
        <ModalEdition
          type={typeModal}
          element={elementsEdition}
          filieres={filieres}
          filiereSelectionnee={filiereSelectionnee}
          onClose={() => setModalVisible(false)}
          onSave={(element) => {
            console.log("Élément sauvegardé:", element);
            setModalVisible(false);
          }}
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
}) => {
  // Logique pour générer les jours en fonction du mode d'affichage
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

  // Heures de la journée (7h à 18h avec pause déjeuner)
  const periodesMatin = Array.from({ length: 6 }, (_, i) => 7 + i); // 7h à 12h
  const periodesAprem = Array.from({ length: 5 }, (_, i) => 14 + i); // 14h à 18h
  const heures = [...periodesMatin, ...periodesAprem];

  return (
    <div className="bg-card rounded-lg shadow">
      {/* En-tête du calendrier */}
      <div className="flex border-b border-border">
        <div className="w-16 bg-muted"></div>
        {jours.map((jour, index) => (
          <div
            key={index}
            className="flex-1 p-2 text-center border-l border-border"
          >
            <div className="font-medium text-card-foreground">
              {jour.toLocaleDateString("fr-FR", { weekday: "short" })}
            </div>
            <div className="text-sm text-muted-foreground">
              {jour.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Corps du calendrier */}
      <div className="relative">
        {/* Lignes des heures */}
        {heures.map((heure) => (
          <div key={heure} className="flex border-b border-border">
            <div className="w-16 p-1 text-right text-xs text-muted-foreground bg-muted">
              {heure}:00
            </div>
            {jours.map((jour, jIndex) => (
              <div
                key={jIndex}
                className="flex-1 h-16 border-l border-border relative group"
                onClick={() => {
                  const dateDebut = new Date(jour);
                  dateDebut.setHours(heure, 0, 0);
                  onAjouterCours({ debut: dateDebut.toISOString() });
                }}
              >
                {/* Pause déjeuner */}
                {heure === 12 && (
                  <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      Pause déjeuner
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-primary transition-opacity"></div>
              </div>
            ))}
          </div>
        ))}

        {/* Affichage des cours */}
        {cours.map((cours) => {
          const debut = new Date(cours.debut);
          const fin = new Date(cours.fin);

          // Vérifier si le cours est dans la période affichée
          const jourCours = jours.findIndex(
            (jour) =>
              jour.getDate() === debut.getDate() &&
              jour.getMonth() === debut.getMonth() &&
              jour.getFullYear() === debut.getFullYear()
          );

          if (jourCours === -1) return null;

          const heureDebut = debut.getHours();
          const minuteDebut = debut.getMinutes();
          const heureFin = fin.getHours();
          const minuteFin = fin.getMinutes();

          // Déterminer l'index dans le tableau des heures
          const getHeureIndex = (h: number): number => {
            if (h >= 7 && h <= 12) {
              return h - 7;
            } else if (h >= 14 && h <= 18) {
              return h - 14 + 6; // 6 est la longueur de periodesMatin
            }
            return 0;
          };

          // Calculer la position et la hauteur
          const heureDebutIndex = getHeureIndex(heureDebut);
          const heureFinIndex = getHeureIndex(heureFin);

          // Position verticale relative aux heures affichées
          const top = heureDebutIndex * 64 + (minuteDebut / 60) * 64;
          const height =
            (heureFinIndex - heureDebutIndex) * 64 +
            ((minuteFin - minuteDebut) / 60) * 64;

          return (
            <div
              key={cours.id}
              className="absolute rounded p-2 text-white overflow-hidden"
              style={{
                left: `calc(${(jourCours / jours.length) * 100}% + 64px)`,
                top: `${top}px`,
                height: `${height}px`,
                width: `calc(${100 / jours.length}% - 2px)`,
                backgroundColor: cours.couleur,
              }}
              onClick={() => onEditerCours(cours)}
            >
              <div className="font-medium">{cours.titre}</div>
              <div className="text-xs">
                {cours.salle} • {cours.enseignant}
              </div>
              <div className="text-xs">
                {debut.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -
                {fin.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}

        {/* Marqueurs de devoirs */}
        {devoirs.map((devoir) => {
          const dateEcheance = new Date(devoir.echeance);

          const jourDevoir = jours.findIndex(
            (jour) =>
              jour.getDate() === dateEcheance.getDate() &&
              jour.getMonth() === dateEcheance.getMonth() &&
              jour.getFullYear() === dateEcheance.getFullYear()
          );

          if (jourDevoir === -1) return null;

          const heureEcheance = dateEcheance.getHours();
          const minuteEcheance = dateEcheance.getMinutes();

          // Calculer la position
          const getHeureIndex = (h: number): number => {
            if (h >= 7 && h <= 12) {
              return h - 7;
            } else if (h >= 14 && h <= 18) {
              return h - 14 + 6; // 6 est la longueur de periodesMatin
            }
            return 0;
          };

          const heureEcheanceIndex = getHeureIndex(heureEcheance);
          const top = heureEcheanceIndex * 64 + (minuteEcheance / 60) * 64;

          return (
            <div
              key={`devoir-${devoir.id}`}
              className="absolute flex items-center rounded-full bg-destructive text-white px-2 py-1 text-xs shadow-lg z-10"
              style={{
                left: `calc(${(jourDevoir / jours.length) * 100}% + 64px)`,
                top: `${top}px`,
              }}
            >
              <FileText size={12} className="mr-1" />
              {devoir.titre} •{" "}
              {dateEcheance.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Composant Modal d'édition
const ModalEdition: React.FC<ModalEditionProps> = ({
  type,
  element,
  filieres,
  filiereSelectionnee,
  onClose,
  onSave,
}) => {
  const [formulaire, setFormulaire] = useState(
    type === "cours"
      ? {
          id: element?.id || Date.now(),
          titre: (element as Cours | null)?.titre || "",
          filiere:
            (element as Cours | null)?.filiere || filiereSelectionnee || "",
          module: (element as Cours | null)?.module || "",
          enseignant: (element as Cours | null)?.enseignant || "",
          salle: (element as Cours | null)?.salle || "",
          debut:
            (element as Cours | null)?.debut ||
            new Date().toISOString().slice(0, 16),
          fin:
            (element as Cours | null)?.fin ||
            new Date(Date.now() + 7200000).toISOString().slice(0, 16),
          couleur: (element as Cours | null)?.couleur || "var(--color-chart-1)",
        }
      : {
          id: element?.id || Date.now(),
          titre: (element as Devoir | null)?.titre || "",
          filiere:
            (element as Devoir | null)?.filiere || filiereSelectionnee || "",
          module: (element as Devoir | null)?.module || "",
          echeance:
            (element as Devoir | null)?.echeance ||
            new Date().toISOString().slice(0, 16),
          description: (element as Devoir | null)?.description || "",
        }
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormulaire((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formulaire as FormulaireCours | FormulaireDevoir);
  };

  const couleursDisponibles = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md overflow-hidden border border-border">
        <div className="p-4 border-b border-border flex justify-between items-center bg-card">
          <h2 className="text-xl font-semibold text-card-foreground">
            {element ? "Modifier" : "Ajouter"} un{" "}
            {type === "cours" ? "cours" : "devoir"}
          </h2>
          <button
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Titre
              </label>
              <input
                type="text"
                name="titre"
                value={formulaire.titre}
                onChange={handleChange}
                className="w-full p-2 border border-input rounded bg-background text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Filière
              </label>
              <select
                name="filiere"
                value={formulaire.filiere}
                onChange={handleChange}
                className="w-full p-2 border border-input rounded bg-background text-foreground"
                required
              >
                <option value="">Sélectionner une filière</option>
                {filieres.map((filiere) => (
                  <option key={filiere.id} value={filiere.id}>
                    {filiere.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Module
              </label>
              <input
                type="text"
                name="module"
                value={formulaire.module}
                onChange={handleChange}
                className="w-full p-2 border border-input rounded bg-background text-foreground"
                required
              />
            </div>

            {type === "cours" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Enseignant
                  </label>
                  <input
                    type="text"
                    name="enseignant"
                    value={(formulaire as FormulaireCours).enseignant}
                    onChange={handleChange}
                    className="w-full p-2 border border-input rounded bg-background text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Salle
                  </label>
                  <input
                    type="text"
                    name="salle"
                    value={(formulaire as FormulaireCours).salle}
                    onChange={handleChange}
                    className="w-full p-2 border border-input rounded bg-background text-foreground"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Début
                    </label>
                    <input
                      type="datetime-local"
                      name="debut"
                      value={(formulaire as FormulaireCours).debut}
                      onChange={handleChange}
                      className="w-full p-2 border border-input rounded bg-background text-foreground"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Fin
                    </label>
                    <input
                      type="datetime-local"
                      name="fin"
                      value={(formulaire as FormulaireCours).fin}
                      onChange={handleChange}
                      className="w-full p-2 border border-input rounded bg-background text-foreground"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Couleur
                  </label>
                  <div className="flex space-x-2">
                    {couleursDisponibles.map((couleur) => (
                      <button
                        key={couleur}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          (formulaire as FormulaireCours).couleur === couleur
                            ? "border-foreground"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: couleur }}
                        onClick={() =>
                          setFormulaire((prev) => ({
                            ...prev,
                            couleur,
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Échéance
                  </label>
                  <input
                    type="datetime-local"
                    name="echeance"
                    value={(formulaire as FormulaireDevoir).echeance}
                    onChange={handleChange}
                    className="w-full p-2 border border-input rounded bg-background text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={(formulaire as FormulaireDevoir).description}
                    onChange={handleChange}
                    className="w-full p-2 border border-input rounded bg-background text-foreground min-h-32"
                    required
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-border rounded bg-secondary text-secondary-foreground"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary text-primary-foreground"
            >
              {element ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmploiDuTemps;
