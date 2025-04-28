import { useState, useEffect } from "react";
import { Edt as EmploiDuTemps } from "../interfaces/EDT";
import { Button } from "../components/ui/button";
import {
  AlertCircle,
  Edit,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Send,
  StopCircle,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Dialog,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../components/ui/table";
import { toast } from "sonner";
import { Tabs, TabsContent } from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import {
  closeEdt,
  createEdt,
  deleteEdt,
  getEdt,
  publishEdt,
} from "../services/EdtService";
import { ApiError } from "../lib/handleApiError";
import { useNavigate } from "react-router";
import { Filiere } from "../interfaces/Filiere";
import { getFilieres } from "../services/FiliereService";
import { Badge } from "../components/ui/badge";

const Edt = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [edt, setEdt] = useState<EmploiDuTemps[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [edtToDelete, setEdtToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<
    Record<string, string>
  >({});

  const navigate = useNavigate();
  // Chargement des filières depuis le backend
  const fetchEdt = async () => {
    try {
      setIsLoading(true);
      const data = await getEdt();
      setEdt(data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des EDT");
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
    fetchEdt();
    fetchFilieres();
  }, []);

  // Fonction de rafraîchissement
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchEdt();
  };

  const publierEdt = async (edtId: string) => {
    try {
      await publishEdt(edtId);
      handleRefresh();
      toast.success("Emploi du temps publié avec succès", {
        duration: 5000,
        style: {
          backgroundColor: "#dcfce7",
          color: "#166534",
        },
      });
    } catch (err) {
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
    }
  };

  const cloturerEdt = async (edtId: string) => {
    try {
      await closeEdt(edtId);
      handleRefresh();
      toast.success("Emploi du temps cloturé avec succès", {
        duration: 5000,
        style: {
          backgroundColor: "#dcfce7",
          color: "#166534",
        },
      });
    } catch (err) {
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
    }
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

      const edtData: Partial<EmploiDuTemps> = {
        idFiliere: formData.get("idFiliere") as string,
        dateDebut: formData.get("dateDebut") as string,
        dateFin: formData.get("dateFin") as string,
        statutEdt: "BROUILLON",
      };

      const newEdt = await createEdt(edtData);
      setEdt([...edt, newEdt]);
      toast.success("Emploi du temps ajouté avec succès", {
        duration: 5000,
        style: {
          backgroundColor: "#dcfce7",
          color: "#166534",
        },
      });
      setIsDialogOpen(false);
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
    setEdtToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirmation de la suppression
  const confirmDelete = async () => {
    if (!edtToDelete) return;

    try {
      await deleteEdt(edtToDelete);
      setEdt(edt.filter((edt) => edt.id !== edtToDelete));
      toast.success("EDT supprimée avec succès", {
        duration: 5000,
        style: {
          backgroundColor: "#dcfce7",
          color: "#166534",
        },
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Impossible de supprimer l'EDT",
        {
          duration: 5000,
          style: {
            backgroundColor: "#fee2e2",
            color: "#991b1b",
          },
        }
      );
    } finally {
      setIsDeleteDialogOpen(false);
      setEdtToDelete(null);
    }
  };

  // Couleurs des badges de statut
  const statutColor: Record<string, string> = {
    PUBLIE: "bg-green-100 text-green-800 hover:bg-green-200",
    BROUILLON: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    CLOS: "bg-red-100 text-red-800 hover:bg-red-200",
  };

  const openEdtForm = () => {
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
            <Button onClick={fetchEdt} className="flex items-center gap-2">
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
          <h1 className="text-2xl font-bold">Gestion des Emplois Du Temps</h1>

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
              onClick={() => openEdtForm()}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter un EDT
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
            </div>
          </CardContent>
        </Card>

        {/* Liste des filières */}
        <Card>
          <Tabs defaultValue="table" className="w-full">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Liste des Emploi du temps</CardTitle>
              </div>
            </CardHeader>

            <CardContent>
              <TabsContent value="table" className="mt-0 pt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Filière concernée</TableHead>
                        <TableHead>Date de debut</TableHead>
                        <TableHead>Date de fin</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date de publication</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {edt.length > 0 ? (
                        edt.map((edt) => (
                          <TableRow key={edt.id}>
                            <TableCell className="font-mono text-xs">
                              {edt.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell className="font-medium">
                              {filieres.map((filiere) =>
                                filiere.id == edt.idFiliere
                                  ? filiere.nomFiliere + ` ` + filiere.niveau
                                  : ""
                              )}
                            </TableCell>
                            <TableCell>{edt.dateDebut}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {edt.dateFin}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              <Badge
                                className={`${
                                  statutColor[
                                    edt.statutEdt as keyof typeof statutColor
                                  ]
                                }`}
                              >
                                {edt.statutEdt === "BROUILLON"
                                  ? "Au brouillon"
                                  : edt.statutEdt === "PUBLIE"
                                  ? "Publié"
                                  : "Clos"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {edt.datePublication
                                ? edt.datePublication
                                : "Pas encore publie"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end items-center gap-2">
                                {edt.statutEdt === "BROUILLON" ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => publierEdt(edt.id)}
                                  >
                                    <Send className="h-4 w-4" />
                                  </Button>
                                ) : edt.statutEdt === "PUBLIE" ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => cloturerEdt(edt.id)}
                                  >
                                    <StopCircle className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  ""
                                )}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    navigate("/editEdt", {
                                      state: {
                                        id: edt.id,
                                        idFiliere: edt.idFiliere,
                                        dateDebut: edt.dateDebut,
                                        dateFin: edt.dateFin,
                                      },
                                    });
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => prepareDelete(edt.id)}
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
                            {searchTerm
                              ? "Aucun emploi du temps ne correspond à votre recherche"
                              : "Aucun emploi du temps disponible"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
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
            setFormError(null);
            setFormFieldErrors({});
          }
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel Emploi du temps</DialogTitle>
            <DialogDescription>
              Remplissez les informations du nouvel EDT
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
              <Label className="flex items-center gap-1">
                Filiere concernee
                {formFieldErrors.idFiliere && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>
              <Select name="idFiliere" required>
                <SelectTrigger
                  className={formFieldErrors.idFiliere ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Sélectionner la filiere" />
                </SelectTrigger>
                <SelectContent>
                  {filieres.map((filiere) => (
                    <SelectItem value={filiere.id}>
                      {filiere.nomFiliere} {filiere.niveau}
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

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Date de debut
                {formFieldErrors.dateDebut && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>
              <Input type="date" name="dateDebut" />
              {formFieldErrors.dateDebut && (
                <p className="text-red-500 text-xs mt-1">
                  {formFieldErrors.dateDebut}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Date de fin
                {formFieldErrors.dateDebut && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>
              <Input type="date" className="justify-between" name="dateFin" />
              {formFieldErrors.dateFin && (
                <p className="text-red-500 text-xs mt-1">
                  {formFieldErrors.dateFin}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsDialogOpen(false);
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
              Êtes-vous sûr de vouloir supprimer ce EDT ? Cette action est
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

export default Edt;
