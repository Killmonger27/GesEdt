import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Edt, Cours, Devoir } from "../interfaces/EDT";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Calendar, ChevronLeft, Loader2, Plus } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { Skeleton } from "../components/ui/skeleton";
import { Filiere } from "../interfaces/Filiere";
import { Module } from "../interfaces/Module";
import { Salle } from "../interfaces/Salle";
import { ApiError } from "../lib/handleApiError";

// Supposons ces imports pour les services
import { getFilieres } from "../services/FiliereService";
import { getModules } from "../services/ModuleService";
import { getSalles } from "../services/SalleService";
import {
  getCoursByEdt,
  createCours,
  updateCours,
  deleteCours,
} from "../services/CoursService";
import {
  getDevoirsByEdt,
  createDevoir,
  updateDevoir,
  deleteDevoir,
} from "../services/DevoirService";

const EditEdt = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // État pour les données principales
  const [edt, setEdt] = useState<Edt | null>(null);
  const [cours, setCours] = useState<Cours[]>([]);
  const [devoirs, setDevoirs] = useState<Devoir[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [matieres, setMatieres] = useState<Module[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);

  // Dialogues et états de UI
  const [activeTab, setActiveTab] = useState("cours");
  const [isCoursDialogOpen, setIsCoursDialogOpen] = useState(false);
  const [isDevoirDialogOpen, setIsDevoirDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<
    Record<string, string>
  >({});

  // Gestion des éléments sélectionnés
  const [selectedCours, setSelectedCours] = useState<Cours | null>(null);
  const [selectedDevoir, setSelectedDevoir] = useState<Devoir | null>(null);

  // États pour le filtrage
  const [dateFilter, setDateFilter] = useState<string>("");
  const [matiereFilter, setMatiereFilter] = useState<string>("");

  // Récupérer l'identifiant d'EDT à partir de l'URL ou de l'état location
  const edtId = location.state?.id;
  const edtIdFiliere = location.state?.idFiliere;
  const edtDateDebut = location.state?.dateDebut;
  const edtDateFin = location.state?.dateFin;

  // Charger toutes les données nécessaires
  useEffect(() => {
    if (!edtId) {
      navigate("/edt");
      return;
    }

    // Initialiser l'EDT à partir des informations de location
    setEdt({
      id: edtId,
      idFiliere: edtIdFiliere,
      dateDebut: edtDateDebut,
      dateFin: edtDateFin,
      statutEdt: "BROUILLON", // valeur par défaut, à remplacer par la valeur réelle
    });

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Charger les cours et devoirs pour cet EDT
        // const coursData = await getCoursByEdt(edtId);
        // const devoirsData = await getDevoirsByEdt(edtId);

        // Charger les données de référence
        const filieresData = await getFilieres();
        const matieresData = await getModules();
        const sallesData = await getSalles();

        // setCours(coursData);
        // setDevoirs(devoirsData);
        setFilieres(filieresData);
        setMatieres(matieresData);
        setSalles(sallesData);
      } catch (err) {
        toast.error("Erreur lors du chargement des données: " + err, {
          duration: 5000,
          style: {
            backgroundColor: "#fee2e2",
            color: "#991b1b",
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [edtId, navigate, edtIdFiliere, edtDateDebut, edtDateFin]);

  // Gérer la soumission d'un cours
  const handleCoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormFieldErrors({});

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      const coursData: Partial<Cours> = {
        date: new Date(formData.get("date") as string),
        creneau: formData.get("creneau") as "MATIN" | "SOIR",
        statutCours: formData.get("statutCours") as
          | "PLANIFIE"
          | "FAIT"
          | "NON_FAIT"
          | "ANNULE",
        disponibiliteProf: formData.get("disponibiliteProf") as
          | "DISPONIBLE"
          | "INDISPONIBLE",
        idSalle: formData.get("idSalle") as string,
        idMatiere: formData.get("idMatiere") as string,
        idEmploiDuTemps: edtId,
      };

      let result: Cours;
      if (selectedCours) {
        // Mise à jour d'un cours existant
        result = await updateCours(selectedCours.id, coursData);
        setCours(
          cours.map((c) => (c.id === selectedCours.id ? { ...result } : c))
        );
        toast.success("Cours mis à jour avec succès");
      } else {
        // Création d'un nouveau cours
        result = await createCours(coursData);
        setCours([...cours, result]);
        toast.success("Cours ajouté avec succès");
      }

      setIsCoursDialogOpen(false);
      setSelectedCours(null);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFormFieldErrors(err.fieldErrors);
      }

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de l'opération";

      setFormError(errorMessage);

      toast.error(errorMessage, {
        duration: 5000,
        style: {
          backgroundColor: "#fee2e2",
          color: "#991b1b",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gérer la soumission d'un devoir
  const handleDevoirSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormFieldErrors({});

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      const devoirData: Partial<Devoir> = {
        date: new Date(formData.get("date") as string),
        creneau: formData.get("creneau") as "MATIN" | "SOIR",
        statutDevoir: formData.get("statutDevoir") as
          | "FAIT"
          | "NON_FAIT"
          | "ANNULE",
        idSalle: formData.get("idSalle") as string,
        idMatiere: formData.get("idMatiere") as string,
        idEmploiDuTemps: edtId,
      };

      let result: Devoir;
      if (selectedDevoir) {
        // Mise à jour d'un devoir existant
        result = await updateDevoir(selectedDevoir.id, devoirData);
        setDevoirs(
          devoirs.map((d) => (d.id === selectedDevoir.id ? { ...result } : d))
        );
        toast.success("Devoir mis à jour avec succès");
      } else {
        // Création d'un nouveau devoir
        result = await createDevoir(devoirData);
        setDevoirs([...devoirs, result]);
        toast.success("Devoir ajouté avec succès");
      }

      setIsDevoirDialogOpen(false);
      setSelectedDevoir(null);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFormFieldErrors(err.fieldErrors);
      }

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de l'opération";

      setFormError(errorMessage);

      toast.error(errorMessage, {
        duration: 5000,
        style: {
          backgroundColor: "#fee2e2",
          color: "#991b1b",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supprimer un cours
  const handleDeleteCours = async (coursToDelete: Cours) => {
    try {
      await deleteCours(coursToDelete.id);
      setCours(cours.filter((c) => c.id !== c.id));
      toast.success("Cours supprimé avec succès");
    } catch (err) {
      toast.error("Erreur lors de la suppression du cours: " + err);
    }
  };

  // Supprimer un devoir
  const handleDeleteDevoir = async (devoir: Devoir) => {
    try {
      await deleteDevoir(devoir.id);
      setDevoirs(devoirs.filter((d) => d.id !== devoir.id));
      toast.success("Devoir supprimé avec succès");
    } catch (err) {
      toast.error("Erreur lors de la suppression du devoir: " + err);
    }
  };

  // Modifier un cours existant
  const handleEditCours = (cours: Cours) => {
    setSelectedCours(cours);
    setIsCoursDialogOpen(true);
  };

  // Modifier un devoir existant
  const handleEditDevoir = (devoir: Devoir) => {
    setSelectedDevoir(devoir);
    setIsDevoirDialogOpen(true);
  };

  // Filtrer les cours en fonction des critères
  const filteredCours = cours.filter((cours) => {
    let dateMatch = true;
    let matiereMatch = true;

    if (dateFilter) {
      const coursDate = new Date(cours.date).toISOString().split("T")[0];
      dateMatch = coursDate === dateFilter;
    }

    if (matiereFilter) {
      matiereMatch = cours.idMatiere === matiereFilter;
    }

    return dateMatch && matiereMatch;
  });

  // Filtrer les devoirs en fonction des critères
  const filteredDevoirs = devoirs.filter((devoir) => {
    let dateMatch = true;
    let matiereMatch = true;

    if (dateFilter) {
      const devoirDate = new Date(devoir.date).toISOString().split("T")[0];
      dateMatch = devoirDate === dateFilter;
    }

    if (matiereFilter) {
      matiereMatch = devoir.idMatiere === matiereFilter;
    }

    return dateMatch && matiereMatch;
  });

  // Fonction pour formater la date
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  // Couleurs des badges de statut
  const coursStatusColor: Record<string, string> = {
    PLANIFIE: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    FAIT: "bg-green-100 text-green-800 hover:bg-green-200",
    NON_FAIT: "bg-red-100 text-red-800 hover:bg-red-200",
    ANNULE: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  const devoirStatusColor: Record<string, string> = {
    FAIT: "bg-green-100 text-green-800 hover:bg-green-200",
    NON_FAIT: "bg-red-100 text-red-800 hover:bg-red-200",
    ANNULE: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  const profStatusColor: Record<string, string> = {
    DISPONIBLE: "bg-green-100 text-green-800 hover:bg-green-200",
    INDISPONIBLE: "bg-red-100 text-red-800 hover:bg-red-200",
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Édition de l'emploi du temps</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Chargement des données</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-60 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* En-tête avec bouton de retour */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/edt")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Édition de l'emploi du temps</h1>
          </div>
        </div>

        {/* Informations sur l'EDT */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de l'emploi du temps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="font-medium">{edt?.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Filière</p>
                <p className="font-medium">
                  {filieres.find((f) => f.id === edt?.idFiliere)?.nomFiliere}{" "}
                  {filieres.find((f) => f.id === edt?.idFiliere)?.niveau}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date de début</p>
                <p className="font-medium">{edt?.dateDebut}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date de fin</p>
                <p className="font-medium">{edt?.dateFin}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtres */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label>Filtrer par date</Label>
                <div className="flex items-center mt-2">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label>Filtrer par module</Label>
                {/* <Select value={matiereFilter} onValueChange={setMatiereFilter}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Toutes les matières" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les modules</SelectItem>
                    {matieres.map((matiere) => (
                      <SelectItem key={matiere.id} value={matiere.id}>
                        {matiere.intitule}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={() => {
                    setDateFilter("");
                    setMatiereFilter("");
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Onglets pour les cours et les devoirs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cours">Cours</TabsTrigger>
            <TabsTrigger value="devoirs">Devoirs</TabsTrigger>
          </TabsList>

          {/* Contenu de l'onglet Cours */}
          <TabsContent value="cours">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Liste des cours</CardTitle>
                <Button
                  onClick={() => {
                    setSelectedCours(null);
                    setIsCoursDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un cours
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Créneau</TableHead>
                        <TableHead>Matière</TableHead>
                        <TableHead>Salle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Professeur</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCours.length > 0 ? (
                        filteredCours.map((cours) => (
                          <TableRow key={cours.id}>
                            <TableCell>{formatDate(cours.date)}</TableCell>
                            <TableCell>
                              {cours.creneau === "MATIN" ? "Matin" : "Soir"}
                            </TableCell>
                            <TableCell>
                              {matieres.find((m) => m.id === cours.idMatiere)
                                ?.intitule || "N/A"}
                            </TableCell>
                            <TableCell>
                              {salles.find((s) => s.id === cours.idSalle)
                                ?.numeroSalle || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={coursStatusColor[cours.statutCours]}
                              >
                                {cours.statutCours === "PLANIFIE"
                                  ? "Planifié"
                                  : cours.statutCours === "FAIT"
                                  ? "Fait"
                                  : cours.statutCours === "NON_FAIT"
                                  ? "Non fait"
                                  : "Annulé"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  profStatusColor[cours.disponibiliteProf]
                                }
                              >
                                {cours.disponibiliteProf === "DISPONIBLE"
                                  ? "Disponible"
                                  : "Indisponible"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditCours(cours)}
                                >
                                  Modifier
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteCours(cours)}
                                >
                                  Supprimer
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6">
                            Aucun cours trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contenu de l'onglet Devoirs */}
          <TabsContent value="devoirs">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Liste des devoirs</CardTitle>
                <Button
                  onClick={() => {
                    setSelectedDevoir(null);
                    setIsDevoirDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un devoir
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Créneau</TableHead>
                        <TableHead>Matière</TableHead>
                        <TableHead>Salle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDevoirs.length > 0 ? (
                        filteredDevoirs.map((devoir) => (
                          <TableRow key={devoir.id}>
                            <TableCell>{formatDate(devoir.date)}</TableCell>
                            <TableCell>
                              {devoir.creneau === "MATIN" ? "Matin" : "Soir"}
                            </TableCell>
                            <TableCell>
                              {matieres.find((m) => m.id === devoir.idMatiere)
                                ?.intitule || "N/A"}
                            </TableCell>
                            <TableCell>
                              {salles.find((s) => s.id === devoir.idSalle)
                                ?.numeroSalle || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  devoirStatusColor[devoir.statutDevoir]
                                }
                              >
                                {devoir.statutDevoir === "FAIT"
                                  ? "Fait"
                                  : devoir.statutDevoir === "NON_FAIT"
                                  ? "Non fait"
                                  : "Annulé"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditDevoir(devoir)}
                                >
                                  Modifier
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteDevoir(devoir)}
                                >
                                  Supprimer
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6">
                            Aucun devoir trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogue pour ajouter/modifier un cours */}
      <Dialog
        open={isCoursDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormError(null);
            setFormFieldErrors({});
            setSelectedCours(null);
          }
          setIsCoursDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedCours ? "Modifier le cours" : "Ajouter un cours"}
            </DialogTitle>
            <DialogDescription>
              {selectedCours
                ? "Modifiez les informations du cours"
                : "Entrez les informations du nouveau cours"}
            </DialogDescription>
          </DialogHeader>
          {formError && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{formError}</span>
            </div>
          )}
          <form onSubmit={handleCoursSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Date du cours</Label>
              <Input
                type="date"
                name="date"
                defaultValue={
                  selectedCours
                    ? new Date(selectedCours.date).toISOString().split("T")[0]
                    : ""
                }
                required
              />
              {formFieldErrors.date && (
                <p className="text-red-500 text-xs mt-1">
                  {formFieldErrors.date}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Créneau</Label>
              <Select
                name="creneau"
                defaultValue={selectedCours?.creneau || "MATIN"}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un créneau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MATIN">Matin</SelectItem>
                  <SelectItem value="SOIR">Soir</SelectItem>
                </SelectContent>
              </Select>
              {formFieldErrors.creneau && (
                <p className="text-red-500 text-xs mt-1">
                  {formFieldErrors.creneau}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Matière</Label>
              <Select
                name="idMatiere"
                defaultValue={selectedCours?.idMatiere}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une matière" />
                </SelectTrigger>
                <SelectContent>
                  {matieres.map((matiere) => (
                    <SelectItem key={matiere.id} value={matiere.id}>
                      {matiere.intitule}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formFieldErrors.idMatiere && (
                <p className="text-red-500 text-xs mt-1">
                  {formFieldErrors.idMatiere}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Salle</Label>
              <Select
                name="idSalle"
                defaultValue={selectedCours?.idSalle}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une salle" />
                </SelectTrigger>
                <SelectContent>
                  {salles.map((salle) => (
                    <SelectItem key={salle.id} value={salle.id}>
                      {salle.numeroSalle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formFieldErrors.idSalle && (
                <p className="text-red-500 text-xs mt-1">
                  {formFieldErrors.idSalle}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Statut du cours</Label>
              <Select
                name="statutCours"
                defaultValue={selectedCours?.statutCours || "PLANIFIE"}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANIFIE">Planifié</SelectItem>
                  <SelectItem value="FAIT">Fait</SelectItem>
                  <SelectItem value="NON_FAIT">Non fait</SelectItem>
                  <SelectItem value="ANNULE">Annulé</SelectItem>
                </SelectContent>
              </Select>
              {formFieldErrors.statutCours && (
                <p className="text-red-500 text-xs mt-1">
                  {formFieldErrors.statutCours}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Disponibilité du professeur</Label>
              <Select
                name="disponibiliteProf"
                defaultValue={selectedCours?.disponibiliteProf || "DISPONIBLE"}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la disponibilité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                  <SelectItem value="INDISPONIBLE">Indisponible</SelectItem>
                </SelectContent>
              </Select>
              {formFieldErrors.disponibiliteProf && (
                <p className="text-red-500 text-xs mt-1">
                  {formFieldErrors.disponibiliteProf}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsCoursDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {selectedCours ? "Mettre à jour" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue pour ajouter/modifier un devoir */}
      <Dialog
        open={isDevoirDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormError(null);
            setFormFieldErrors({});
            setSelectedDevoir(null);
          }
          setIsDevoirDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDevoir ? "Modifier le devoir" : "Ajouter un devoir"}
            </DialogTitle>
            <DialogDescription>
              {selectedDevoir
                ? "Modifiez les informations du devoir"
                : "Entrez les informations du nouveau devoir"}
            </DialogDescription>
          </DialogHeader>
          {formError && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{formError}</span>
            </div>
          )}
          <form onSubmit={handleDevoirSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Date du devoir</Label>
              <Input
                type="date"
                name="date"
                defaultValue={
                  selectedDevoir
                    ? new Date(selectedDevoir.date).toISOString().split("T")[0]
                    : ""
                }
                required
              />
              {formFieldErrors.date && (
                <p className="text-red-500 text-xs mt-1">
                  {formFieldErrors.date}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Créneau</Label>
              <Select
                name="creneau"
                defaultValue={selectedDevoir?.creneau || "MATIN"}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un créneau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MATIN">Matin</SelectItem>
                  <SelectItem value="SOIR">Soir</SelectItem>
                </SelectContent>
              </Select>
              {formFieldErrors.creneau && (
                <p className="text-red-500 text-xs mt-1">
                  {formFieldErrors.creneau}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Matière</Label>
              <Select
                name="idMatiere"
                defaultValue={selectedDevoir?.idMatiere}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une matière" />
                </SelectTrigger>
                <SelectContent>
                  {matieres.map((matiere) => (
                    <SelectItem key={matiere.id} value={matiere.id}>
                      {matiere.intitule}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formFieldErrors.idMatiere && (
                <p className="text-red-500 text-xs mt-1">
                  {formFieldErrors.idMatiere}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Salle</Label>
              <Select
                name="idSalle"
                defaultValue={selectedDevoir?.idSalle}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une salle" />
                </SelectTrigger>
                <SelectContent>
                  {salles.map((salle) => (
                    <SelectItem key={salle.id} value={salle.id}>
                      {salle.numeroSalle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formFieldErrors.idSalle && (
                <p className="text-red-500 text-xs mt-1">
                  {formFieldErrors.idSalle}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Statut du devoir</Label>
              <Select
                name="statutDevoir"
                defaultValue={selectedDevoir?.statutDevoir || "FAIT"}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FAIT">Fait</SelectItem>
                  <SelectItem value="NON_FAIT">Non fait</SelectItem>
                  <SelectItem value="ANNULE">Annulé</SelectItem>
                </SelectContent>
              </Select>
              {formFieldErrors.statutDevoir && (
                <p className="text-red-500 text-xs mt-1">
                  {formFieldErrors.statutDevoir}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsDevoirDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {selectedDevoir ? "Mettre à jour" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditEdt;
