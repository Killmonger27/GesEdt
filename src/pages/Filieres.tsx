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
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { ApiError } from "../lib/handleApiError";
import { Filiere } from "../interfaces/Filiere";
import {
  getFilieres,
  createFiliere,
  updateFiliere,
  deleteFiliere,
} from "../services/FiliereService";
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

const Filieres = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNiveau, setFilterNiveau] = useState<string>("all");
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [currentFiliere, setCurrentFiliere] = useState<Filiere | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filiereToDelete, setFiliereToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<
    Record<string, string>
  >({});

  // Chargement des filières depuis le backend
  const fetchFilieres = async () => {
    try {
      setIsLoading(true);
      const data = await getFilieres();
      setFilieres(data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des filières");
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
    fetchFilieres();
  }, []);

  // Fonction de rafraîchissement
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchFilieres();
  };

  // Filtrage des filières
  const filteredFilieres = filieres.filter((filiere) => {
    const matchesSearch = filiere.nomFiliere
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterNiveau === "all" || filiere.niveau === filterNiveau;
    return matchesSearch && matchesFilter;
  });

  // Couleurs des badges de niveau
  const niveauColors = {
    L1: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    L2: "bg-green-100 text-green-800 hover:bg-green-200",
    L3: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    M1: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    M2: "bg-pink-100 text-pink-800 hover:bg-pink-200",
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

      const filiereData = {
        nomFiliere: formData.get("nomFiliere") as string,
        description: formData.get("description") as string,
        niveau: formData.get("niveau") as "L1" | "L2" | "L3" | "M1" | "M2",
      };

      if (currentFiliere) {
        // Modification
        const updatedFiliere = await updateFiliere(
          currentFiliere.id,
          filiereData
        );
        setFilieres(
          filieres.map((f) => (f.id === currentFiliere.id ? updatedFiliere : f))
        );
        toast.success("Filière mise à jour avec succès", {
          duration: 5000,
          style: {
            backgroundColor: "#dcfce7",
            color: "#166534",
          },
        });
      } else {
        // Ajout
        const newFiliere = await createFiliere(filiereData);
        setFilieres([...filieres, newFiliere]);
        toast.success("Filière ajoutée avec succès", {
          duration: 5000,
          style: {
            backgroundColor: "#dcfce7",
            color: "#166534",
          },
        });
      }

      setIsDialogOpen(false);
      setCurrentFiliere(null);
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
    setFiliereToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirmation de la suppression
  const confirmDelete = async () => {
    if (!filiereToDelete) return;

    try {
      await deleteFiliere(filiereToDelete);
      setFilieres(filieres.filter((filiere) => filiere.id !== filiereToDelete));
      toast.success("Filière supprimée avec succès", {
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
          : "Impossible de supprimer la filière",
        {
          duration: 5000,
        }
      );
    } finally {
      setIsDeleteDialogOpen(false);
      setFiliereToDelete(null);
    }
  };

  // Ouverture du formulaire de création/modification
  const openFiliereForm = (filiere: Filiere | null = null) => {
    setCurrentFiliere(filiere);
    setFormError(null);
    setFormFieldErrors({});
    setIsDialogOpen(true);
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Filières</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chargement des filières</CardTitle>
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
            <Button onClick={fetchFilieres} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* En-tête et boutons d'action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Gestion des Filières</h1>

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
              onClick={() => openFiliereForm()}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter une filière
            </Button>
          </div>
        </div>

        {/* Recherche et filtres */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une filière..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterNiveau} onValueChange={setFilterNiveau}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    <SelectItem value="L1">Licence 1</SelectItem>
                    <SelectItem value="L2">Licence 2</SelectItem>
                    <SelectItem value="L3">Licence 3</SelectItem>
                    <SelectItem value="M1">Master 1</SelectItem>
                    <SelectItem value="M2">Master 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des filières */}
        <Card>
          <Tabs defaultValue="table" className="w-full">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Liste des filières</CardTitle>
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
                        <TableHead>Nom de la filière</TableHead>
                        <TableHead>Niveau</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFilieres.length > 0 ? (
                        filteredFilieres.map((filiere) => (
                          <TableRow key={filiere.id}>
                            <TableCell className="font-mono text-xs">
                              {filiere.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell className="font-medium">
                              {filiere.nomFiliere}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${
                                  niveauColors[
                                    filiere.niveau as keyof typeof niveauColors
                                  ]
                                }`}
                              >
                                {filiere.niveau}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {filiere.description}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openFiliereForm(filiere)}
                                  title="Modifier"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => prepareDelete(filiere.id)}
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
                          <TableCell colSpan={5} className="text-center h-24">
                            {searchTerm || filterNiveau !== "all"
                              ? "Aucune filière ne correspond à votre recherche"
                              : "Aucune filière disponible"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="grid" className="mt-0 pt-4">
                {filteredFilieres.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredFilieres.map((filiere) => (
                      <Card key={filiere.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex justify-between items-center">
                            <span>{filiere.nomFiliere}</span>
                            <Badge
                              className={`${
                                niveauColors[
                                  filiere.niveau as keyof typeof niveauColors
                                ]
                              }`}
                            >
                              {filiere.niveau}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {filiere.description}
                          </p>
                          <p className="text-xs text-gray-500 mb-3">
                            ID: {filiere.id.substring(0, 8)}...
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openFiliereForm(filiere)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => prepareDelete(filiere.id)}
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
                    {searchTerm || filterNiveau !== "all"
                      ? "Aucune filière ne correspond à votre recherche"
                      : "Aucune filière disponible"}
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
            setCurrentFiliere(null);
            setFormError(null);
            setFormFieldErrors({});
          }
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentFiliere
                ? "Modifier la filière"
                : "Ajouter une nouvelle filière"}
            </DialogTitle>
            <DialogDescription>
              {currentFiliere
                ? "Modifiez les informations de la filière et cliquez sur Enregistrer."
                : "Remplissez les informations de la nouvelle filière."}
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
              <Label htmlFor="nomFiliere" className="flex items-center gap-1">
                Nom de la filière
                {formFieldErrors.nomFiliere && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>
              <Input
                id="nomFiliere"
                name="nomFiliere"
                defaultValue={currentFiliere?.nomFiliere || ""}
                className={formFieldErrors.nomFiliere ? "border-red-500" : ""}
                aria-invalid={!!formFieldErrors.nomFiliere}
                aria-describedby={
                  formFieldErrors.nomFiliere ? "nomFiliere-error" : undefined
                }
                required
              />
              {formFieldErrors.nomFiliere ? (
                <p id="nomFiliere-error" className="text-red-500 text-xs mt-1">
                  {formFieldErrors.nomFiliere}
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  Exemple: Informatique, Génie Civil, Économie...
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-1">
                Description
                {formFieldErrors.description && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={currentFiliere?.description || ""}
                className={formFieldErrors.description ? "border-red-500" : ""}
                aria-invalid={!!formFieldErrors.description}
                aria-describedby={
                  formFieldErrors.description ? "description-error" : undefined
                }
                rows={3}
                required
              />
              {formFieldErrors.description && (
                <p id="description-error" className="text-red-500 text-xs mt-1">
                  {formFieldErrors.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="niveau" className="flex items-center gap-1">
                Niveau
                {formFieldErrors.niveau && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>
              <Select
                name="niveau"
                defaultValue={currentFiliere?.niveau || ""}
                required
              >
                <SelectTrigger
                  className={formFieldErrors.niveau ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L1">Licence 1</SelectItem>
                  <SelectItem value="L2">Licence 2</SelectItem>
                  <SelectItem value="L3">Licence 3</SelectItem>
                  <SelectItem value="M1">Master 1</SelectItem>
                  <SelectItem value="M2">Master 2</SelectItem>
                </SelectContent>
              </Select>
              {formFieldErrors.niveau && (
                <p className="text-red-500 text-xs mt-1">
                  {formFieldErrors.niveau}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsDialogOpen(false);
                  setCurrentFiliere(null);
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
                ) : currentFiliere ? (
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
              Êtes-vous sûr de vouloir supprimer cette filière ? Cette action
              est irréversible.
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

export default Filieres;
