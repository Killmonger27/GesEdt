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
import { ApiError } from "../services/SalleService";
import { Salle } from "../interfaces/Salle";
import {
  getSalles,
  createSalle,
  updateSalle,
  deleteSalle,
} from "../services/SalleService";
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

const Salles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [salles, setSalles] = useState<Salle[]>([]);
  const [currentSalle, setCurrentSalle] = useState<Salle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [salleToDelete, setSalleToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<
    Record<string, string>
  >({});

  // Chargement des salles depuis le backend
  const fetchSalles = async () => {
    try {
      setIsLoading(true);
      const data = await getSalles();
      setSalles(data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des salles");
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
    fetchSalles();
  }, []);

  // Fonction de rafraîchissement
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSalles();
  };

  // Filtrage des salles
  const filteredSalles = salles.filter((salle) => {
    const matchesSearch = salle.numeroSalle
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || salle.disponibiliteSalle === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Couleurs des badges de disponibilité
  const disponibiliteColors = {
    LIBRE: "bg-green-100 text-green-800 hover:bg-green-200",
    OCCUPEE: "bg-red-100 text-red-800 hover:bg-red-200",
  };

  // Traduction des statuts pour l'affichage
  const disponibiliteLabels = {
    LIBRE: "Disponible",
    OCCUPEE: "Occupée",
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

      const salleData = {
        numeroSalle: formData.get("numeroSalle") as string,
        disponibiliteSalle: formData.get("disponibiliteSalle") as
          | "LIBRE"
          | "OCCUPEE",
      };

      if (currentSalle) {
        // Modification
        const updatedSalle = await updateSalle(currentSalle.id, salleData);
        setSalles(
          salles.map((s) => (s.id === currentSalle.id ? updatedSalle : s))
        );
        toast.success("Salle mise à jour avec succès", {
          duration: 5000,
          style: {
            backgroundColor: "#dcfce7",
            color: "#166534",
          },
        });
      } else {
        // Ajout
        const newSalle = await createSalle(salleData);
        setSalles([...salles, newSalle]);
        toast.success("Salle ajoutée avec succès", {
          duration: 5000,
          style: {
            backgroundColor: "#dcfce7",
            color: "#166534",
          },
        });
      }

      setIsDialogOpen(false);
      setCurrentSalle(null);
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
    setSalleToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirmation de la suppression
  const confirmDelete = async () => {
    if (!salleToDelete) return;

    try {
      await deleteSalle(salleToDelete);
      setSalles(salles.filter((salle) => salle.id !== salleToDelete));
      toast.success("Salle supprimée avec succès", {
        duration: 5000,
        style: {
          backgroundColor: "#dcfce7",
          color: "#166534",
        },
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Impossible de supprimer la salle",
        {
          duration: 5000,
        }
      );
    } finally {
      setIsDeleteDialogOpen(false);
      setSalleToDelete(null);
    }
  };

  // Ouverture du formulaire de création/modification
  const openSalleForm = (salle: Salle | null = null) => {
    setCurrentSalle(salle);
    setFormError(null);
    setFormFieldErrors({});
    setIsDialogOpen(true);
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Salles</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chargement des salles</CardTitle>
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
            <Button onClick={fetchSalles} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // // Création de statistiques
  // const stats = {
  //   total: salles.length,
  //   disponibles: salles.filter((s) => s.disponibiliteSalle === "LIBRE").length,
  //   occupees: salles.filter((s) => s.disponibiliteSalle === "OCCUPEE").length,
  // };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* En-tête et boutons d'action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Gestion des Salles</h1>

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
              onClick={() => openSalleForm()}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter une salle
            </Button>
          </div>
        </div>

        {/* Statistiques en cartes
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-500">
                Total des salles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-600">
                Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {stats.disponibles}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-red-600">Occupées</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {stats.occupees}
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
                  placeholder="Rechercher une salle..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="LIBRE">Disponibles</SelectItem>
                    <SelectItem value="OCCUPEE">Occupées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des salles */}
        <Card>
          <Tabs defaultValue="table" className="w-full">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Liste des salles</CardTitle>
                <TabsList>
                  <TabsTrigger value="table">Tableau</TabsTrigger>
                  <TabsTrigger value="grid">Grille</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>

            <CardContent>
              <TabsContent value="table" className="mt-0 pt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Numéro de salle</TableHead>
                        <TableHead>Disponibilité</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSalles.length > 0 ? (
                        filteredSalles.map((salle) => (
                          <TableRow key={salle.id}>
                            <TableCell className="font-mono text-xs">
                              {salle.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell className="font-medium">
                              {salle.numeroSalle}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${
                                  disponibiliteColors[
                                    salle.disponibiliteSalle as keyof typeof disponibiliteColors
                                  ]
                                }`}
                              >
                                {
                                  disponibiliteLabels[
                                    salle.disponibiliteSalle as keyof typeof disponibiliteLabels
                                  ]
                                }
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openSalleForm(salle)}
                                  title="Modifier"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => prepareDelete(salle.id)}
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
                          <TableCell colSpan={4} className="text-center h-24">
                            {searchTerm || filterStatus !== "all"
                              ? "Aucune salle ne correspond à votre recherche"
                              : "Aucune salle disponible"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="grid" className="mt-0 pt-4">
                {filteredSalles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredSalles.map((salle) => (
                      <Card key={salle.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex justify-between items-center">
                            <span>{salle.numeroSalle}</span>
                            <Badge
                              className={`${
                                disponibiliteColors[
                                  salle.disponibiliteSalle as keyof typeof disponibiliteColors
                                ]
                              }`}
                            >
                              {
                                disponibiliteLabels[
                                  salle.disponibiliteSalle as keyof typeof disponibiliteLabels
                                ]
                              }
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                          <p className="text-xs text-gray-500 mb-3">
                            ID: {salle.id.substring(0, 8)}...
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openSalleForm(salle)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => prepareDelete(salle.id)}
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
                    {searchTerm || filterStatus !== "all"
                      ? "Aucune salle ne correspond à votre recherche"
                      : "Aucune salle disponible"}
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
            setCurrentSalle(null);
            setFormError(null);
            setFormFieldErrors({});
          }
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentSalle
                ? "Modifier la salle"
                : "Ajouter une nouvelle salle"}
            </DialogTitle>
            <DialogDescription>
              {currentSalle
                ? "Modifiez les informations de la salle et cliquez sur Enregistrer."
                : "Remplissez les informations de la nouvelle salle."}
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
              <Label htmlFor="numeroSalle" className="flex items-center gap-1">
                Numéro de salle
                {formFieldErrors.numeroSalle && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>
              <Input
                id="numeroSalle"
                name="numeroSalle"
                defaultValue={currentSalle?.numeroSalle || ""}
                className={formFieldErrors.numeroSalle ? "border-red-500" : ""}
                aria-invalid={!!formFieldErrors.numeroSalle}
                aria-describedby={
                  formFieldErrors.numeroSalle ? "numeroSalle-error" : undefined
                }
                required
              />
              {formFieldErrors.numeroSalle ? (
                <p id="numeroSalle-error" className="text-red-500 text-xs mt-1">
                  {formFieldErrors.numeroSalle}
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  Format requis: A01, B23, C45, D99...
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="disponibiliteSalle"
                className="flex items-center gap-1"
              >
                Disponibilité
                {formFieldErrors.disponibiliteSalle && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>
              <Select
                name="disponibiliteSalle"
                defaultValue={currentSalle?.disponibiliteSalle || ""}
                required
              >
                <SelectTrigger
                  className={
                    formFieldErrors.disponibiliteSalle ? "border-red-500" : ""
                  }
                >
                  <SelectValue placeholder="Sélectionner une disponibilité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LIBRE">Disponible</SelectItem>
                  <SelectItem value="OCCUPEE">Occupée</SelectItem>
                </SelectContent>
              </Select>
              {formFieldErrors.disponibiliteSalle && (
                <p className="text-red-500 text-xs mt-1">
                  {formFieldErrors.disponibiliteSalle}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsDialogOpen(false);
                  setCurrentSalle(null);
                  setFormError(null);
                  setFormFieldErrors({});
                }}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Traitement...
                  </>
                ) : currentSalle ? (
                  "Enregistrer"
                ) : (
                  "Ajouter"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette salle ? Cette action est
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

export default Salles;
