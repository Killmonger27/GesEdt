import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Filter,
  AlertCircle,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { ApiError } from "../lib/handleApiError";
import { Module, ModuleCreationPayload } from "../interfaces/Module";
import {
  getModules,
  createModule,
  updateModule,
  deleteModule,
} from "../services/ModuleService.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

const Modules = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSemestre, setFilterSemestre] = useState<string>("all");
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<
    Record<string, string>
  >({});

  // Données fictives pour les enseignants et filières
  const enseignants = [
    { id: "ens-001", nom: "Dr. Martin Dubois" },
    { id: "ens-002", nom: "Prof. Sophie Leclerc" },
    { id: "ens-003", nom: "Dr. Ahmed Benali" },
    { id: "ens-004", nom: "Prof. Emma Johnson" },
  ];

  const filieres = [
    { id: "fil-001", nom: "Informatique" },
    { id: "fil-002", nom: "Réseaux et Télécommunications" },
    { id: "fil-003", nom: "Génie Civil" },
    { id: "fil-004", nom: "Commerce International" },
  ];

  // Fonction pour obtenir le nom de l'enseignant à partir de son ID
  const getEnseignantNom = (id: string) => {
    const enseignant = enseignants.find((e) => e.id === id);
    return enseignant ? enseignant.nom : "Non assigné";
  };

  // Fonction pour obtenir le nom de la filière à partir de son ID
  const getFiliereNom = (id: string) => {
    const filiere = filieres.find((f) => f.id === id);
    return filiere ? filiere.nom : "Non assignée";
  };

  // Chargement des modules depuis le backend
  const fetchModules = async () => {
    try {
      setIsLoading(true);
      const data = await getModules();
      setModules(data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des modules");
      toast.error(err instanceof Error ? err.message : "Erreur inconnue", {
        duration: 5000,
        style: {
          backgroundColor: "#fee2e2",
          color: "#991b1b",
        },
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Effet initial
  useEffect(() => {
    fetchModules();
  }, []);

  // Fonction de rafraîchissement
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchModules();
  };

  // Filtrage des modules
  const filteredModules = modules.filter((module) => {
    const matchesSearch = module.intitule
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || module.statutMatiere === filterStatus;
    const matchesSemestre =
      filterSemestre === "all" || module.semestre === filterSemestre;
    return matchesSearch && matchesStatus && matchesSemestre;
  });

  // Couleurs des badges de statut
  const statutColors = {
    NON_DEBUTE: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    EN_COURS: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    TERMINE: "bg-green-100 text-green-800 hover:bg-green-200",
  };

  // Traduction des statuts pour l'affichage
  const statutLabels = {
    NON_DEBUTE: "Non débuté",
    EN_COURS: "En cours",
    TERMINE: "Terminé",
  };

  // Traduction des semestres pour l'affichage
  const semestreLabels = {
    S1: "Semestre 1",
    S2: "Semestre 2",
    S3: "Semestre 3",
    S4: "Semestre 4",
    S5: "Semestre 5",
    S6: "Semestre 6",
  };

  // Gestion du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormFieldErrors({});

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      const moduleData: ModuleCreationPayload = {
        intitule: formData.get("intitule") as string,
        volumeHoraire: Number(formData.get("volumeHoraire")),
        semestre: formData.get("semestre") as
          | "S1"
          | "S2"
          | "S3"
          | "S4"
          | "S5"
          | "S6",
        statutMatiere: formData.get("statutMatiere") as
          | "NON_DEBUTE"
          | "EN_COURS"
          | "TERMINE",
        idEnseignant: formData.get("idEnseignant") as string,
        idFiliere: formData.get("idFiliere") as string,
      };

      if (currentModule) {
        // Modification
        const updatedModule = await updateModule(currentModule.id, moduleData);
        setModules(
          modules.map((m) => (m.id === currentModule.id ? updatedModule : m))
        );
        toast.success("Module mis à jour avec succès", {
          duration: 5000,
          style: {
            backgroundColor: "#dcfce7",
            color: "#166534",
          },
        });
      } else {
        // Ajout
        const newModule = await createModule(moduleData);
        setModules([...modules, newModule]);
        toast.success("Module ajouté avec succès", {
          duration: 5000,
          style: {
            backgroundColor: "#dcfce7",
            color: "#166534",
          },
        });
      }

      setIsDialogOpen(false);
      setCurrentModule(null);
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

  // Préparation de la suppression
  const prepareDelete = (id: string) => {
    setModuleToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirmation de la suppression
  const confirmDelete = async () => {
    if (!moduleToDelete) return;

    try {
      await deleteModule(moduleToDelete);
      setModules(modules.filter((module) => module.id !== moduleToDelete));
      toast.success("Module supprimé avec succès", {
        duration: 5000,
        style: {
          backgroundColor: "#dcfce7",
          color: "#166534",
        },
      });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer le module",
        {
          duration: 5000,
        }
      );
    } finally {
      setIsDeleteDialogOpen(false);
      setModuleToDelete(null);
    }
  };

  // Ouverture du formulaire de création/modification
  const openModuleForm = (module: Module | null = null) => {
    setCurrentModule(module);
    setFormError(null);
    setFormFieldErrors({});
    setIsDialogOpen(true);
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Modules</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chargement des modules</CardTitle>
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

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Erreur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchModules} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // // Statistiques des modules
  // const stats = {
  //   total: modules.length,
  //   nonDebutes: modules.filter((m) => m.statutMatiere === "NON_DEBUTE").length,
  //   enCours: modules.filter((m) => m.statutMatiere === "EN_COURS").length,
  //   termines: modules.filter((m) => m.statutMatiere === "TERMINE").length,
  // };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* En-tête et boutons d'action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Gestion des Modules</h1>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Actualiser
            </Button>

            <Button
              onClick={() => openModuleForm()}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter un module
            </Button>
          </div>
        </div>

        {/* Statistiques en cartes */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-500">
                Total des modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-600">
                Non débutés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-600">
                {stats.nonDebutes}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-600">En cours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {stats.enCours}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-600">Terminés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {stats.termines}
              </p>
            </CardContent>
          </Card>
        </div> */}

        {/* Recherche et filtres */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un module..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="NON_DEBUTE">Non débutés</SelectItem>
                      <SelectItem value="EN_COURS">En cours</SelectItem>
                      <SelectItem value="TERMINE">Terminés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={filterSemestre}
                    onValueChange={setFilterSemestre}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrer par semestre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les semestres</SelectItem>
                      <SelectItem value="S1">Semestre 1</SelectItem>
                      <SelectItem value="S2">Semestre 2</SelectItem>
                      <SelectItem value="S3">Semestre 3</SelectItem>
                      <SelectItem value="S4">Semestre 4</SelectItem>
                      <SelectItem value="S5">Semestre 5</SelectItem>
                      <SelectItem value="S6">Semestre 6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des modules */}
        <Card>
          <Tabs defaultValue="table" className="w-full">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Liste des modules</CardTitle>
                <TabsList>
                  <TabsTrigger value="table">Tableau</TabsTrigger>
                  <TabsTrigger value="grid">Grille</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>

            <CardContent>
              <TabsContent value="table" className="mt-0 pt-4">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Intitulé</TableHead>
                        <TableHead>Volume Horaire</TableHead>
                        <TableHead>Semestre</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Enseignant</TableHead>
                        <TableHead>Filière</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredModules.length > 0 ? (
                        filteredModules.map((module) => (
                          <TableRow key={module.id}>
                            <TableCell className="font-mono text-xs">
                              {module.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell className="font-medium">
                              {module.intitule}
                            </TableCell>
                            <TableCell>{module.volumeHoraire}h</TableCell>
                            <TableCell>
                              {
                                semestreLabels[
                                  module.semestre as keyof typeof semestreLabels
                                ]
                              }
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${
                                  statutColors[
                                    module.statutMatiere as keyof typeof statutColors
                                  ]
                                }`}
                              >
                                {
                                  statutLabels[
                                    module.statutMatiere as keyof typeof statutLabels
                                  ]
                                }
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getEnseignantNom(module.idEnseignant)}
                            </TableCell>
                            <TableCell>
                              {getFiliereNom(module.idFiliere)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openModuleForm(module)}
                                  title="Modifier"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => prepareDelete(module.id)}
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center h-24">
                            {searchTerm ||
                            filterStatus !== "all" ||
                            filterSemestre !== "all"
                              ? "Aucun module ne correspond à votre recherche"
                              : "Aucun module disponible"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="grid" className="mt-0 pt-4">
                {filteredModules.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredModules.map((module) => (
                      <Card key={module.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex justify-between items-center text-lg">
                            <span className="truncate">{module.intitule}</span>
                            <Badge
                              className={`${
                                statutColors[
                                  module.statutMatiere as keyof typeof statutColors
                                ]
                              }`}
                            >
                              {
                                statutLabels[
                                  module.statutMatiere as keyof typeof statutLabels
                                ]
                              }
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                            <div>
                              <p className="text-gray-500">Volume Horaire</p>
                              <p className="font-medium">
                                {module.volumeHoraire}h
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Semestre</p>
                              <p className="font-medium">
                                {
                                  semestreLabels[
                                    module.semestre as keyof typeof semestreLabels
                                  ]
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Enseignant</p>
                              <p
                                className="font-medium truncate"
                                title={getEnseignantNom(module.idEnseignant)}
                              >
                                {getEnseignantNom(module.idEnseignant)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Filière</p>
                              <p
                                className="font-medium truncate"
                                title={getFiliereNom(module.idFiliere)}
                              >
                                {getFiliereNom(module.idFiliere)}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">
                            ID: {module.id.substring(0, 8)}...
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModuleForm(module)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => prepareDelete(module.id)}
                              className="flex-1"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    {searchTerm ||
                    filterStatus !== "all" ||
                    filterSemestre !== "all"
                      ? "Aucun module ne correspond à votre recherche"
                      : "Aucun module disponible"}
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Modal de formulaire */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCurrentModule(null);
            setFormError(null);
            setFormFieldErrors({});
          }
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {currentModule
                ? "Modifier le module"
                : "Ajouter un nouveau module"}
            </DialogTitle>
            <DialogDescription>
              {currentModule
                ? "Modifiez les informations du module et cliquez sur Enregistrer."
                : "Remplissez les informations du nouveau module."}
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

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="intitule" className="flex items-center gap-1">
                Intitulé du module
                {formFieldErrors.intitule && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>
              <Input
                id="intitule"
                name="intitule"
                defaultValue={currentModule?.intitule || ""}
                className={formFieldErrors.intitule ? "border-red-500" : ""}
                aria-invalid={!!formFieldErrors.intitule}
                aria-describedby={
                  formFieldErrors.intitule ? "intitule-error" : undefined
                }
                required
              />
              {formFieldErrors.intitule && (
                <p id="intitule-error" className="text-red-500 text-xs mt-1">
                  {formFieldErrors.intitule}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="volumeHoraire"
                  className="flex items-center gap-1"
                >
                  Volume horaire (heures)
                  {formFieldErrors.volumeHoraire && (
                    <span className="text-red-500 text-xs">*</span>
                  )}
                </Label>
                <Input
                  id="volumeHoraire"
                  name="volumeHoraire"
                  type="number"
                  min="1"
                  defaultValue={currentModule?.volumeHoraire || "30"}
                  className={
                    formFieldErrors.volumeHoraire ? "border-red-500" : ""
                  }
                  aria-invalid={!!formFieldErrors.volumeHoraire}
                  required
                />
                {formFieldErrors.volumeHoraire && (
                  <p className="text-red-500 text-xs mt-1">
                    {formFieldErrors.volumeHoraire}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="semestre" className="flex items-center gap-1">
                  Semestre
                  {formFieldErrors.semestre && (
                    <span className="text-red-500 text-xs">*</span>
                  )}
                </Label>
                <Select
                  name="semestre"
                  defaultValue={currentModule?.semestre || ""}
                  required
                >
                  <SelectTrigger
                    className={formFieldErrors.semestre ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Sélectionner un semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S1">Semestre 1</SelectItem>
                    <SelectItem value="S2">Semestre 2</SelectItem>
                    <SelectItem value="S3">Semestre 3</SelectItem>
                    <SelectItem value="S4">Semestre 4</SelectItem>
                    <SelectItem value="S5">Semestre 5</SelectItem>
                    <SelectItem value="S6">Semestre 6</SelectItem>
                  </SelectContent>
                </Select>
                {formFieldErrors.semestre && (
                  <p className="text-red-500 text-xs mt-1">
                    {formFieldErrors.semestre}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="statutMatiere"
                className="flex items-center gap-1"
              >
                Statut du module
                {formFieldErrors.statutMatiere && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>
              <Select
                name="statutMatiere"
                defaultValue={currentModule?.statutMatiere || ""}
                required
              >
                <SelectTrigger
                  className={
                    formFieldErrors.statutMatiere ? "border-red-500" : ""
                  }
                >
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NON_DEBUTE">Non débuté</SelectItem>
                  <SelectItem value="EN_COURS">En cours</SelectItem>
                  <SelectItem value="TERMINE">Terminé</SelectItem>
                </SelectContent>
              </Select>
              {formFieldErrors.statutMatiere && (
                <p className="text-red-500 text-xs mt-1">
                  {formFieldErrors.statutMatiere}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="idEnseignant"
                  className="flex items-center gap-1"
                >
                  Enseignant responsable
                  {formFieldErrors.idEnseignant && (
                    <span className="text-red-500 text-xs">*</span>
                  )}
                </Label>
                <Select
                  name="idEnseignant"
                  defaultValue={currentModule?.idEnseignant || ""}
                  required
                >
                  <SelectTrigger
                    className={
                      formFieldErrors.idEnseignant ? "border-red-500" : ""
                    }
                  >
                    <SelectValue placeholder="Sélectionner un enseignant" />
                  </SelectTrigger>
                  <SelectContent>
                    {enseignants.map((enseignant) => (
                      <SelectItem key={enseignant.id} value={enseignant.id}>
                        {enseignant.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formFieldErrors.idEnseignant && (
                  <p className="text-red-500 text-xs mt-1">
                    {formFieldErrors.idEnseignant}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idFiliere" className="flex items-center gap-1">
                  Filière associée
                  {formFieldErrors.idFiliere && (
                    <span className="text-red-500 text-xs">*</span>
                  )}
                </Label>
                <Select
                  name="idFiliere"
                  defaultValue={currentModule?.idFiliere || ""}
                  required
                >
                  <SelectTrigger
                    className={
                      formFieldErrors.idFiliere ? "border-red-500" : ""
                    }
                  >
                    <SelectValue placeholder="Sélectionner une filière" />
                  </SelectTrigger>
                  <SelectContent>
                    {filieres.map((filiere) => (
                      <SelectItem key={filiere.id} value={filiere.id}>
                        {filiere.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formFieldErrors.idFiliere && (
                  <p className="text-red-500 text-xs mt-1">
                    {formFieldErrors.idFiliere}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {currentModule ? "Enregistrer" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce module ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Modules;
