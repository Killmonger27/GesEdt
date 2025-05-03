import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Loader2,
  Filter,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Lock,
  Unlock,
  RotateCw,
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
} from "../components/ui/dialog";
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
import { UserData } from "../interfaces/Profile";
import { RegisterRequest } from "../interfaces/Authentification";
import {
  getUtilisateurs,
  createUtilisateur,
  activateUtilisateur,
  blockUtilisateur,
  promoteStudent,
} from "../services/UsersService";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Filiere } from "../interfaces/Filiere";
import { getFilieres } from "../services/FiliereService";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatut, setFilterStatut] = useState<string>("all");
  const [utilisateurs, setUtilisateurs] = useState<UserData[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<
    Record<string, string>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [showAdditionalFields, setShowAdditionalFields] = useState(true);
  const [role, setRole] = useState<string>("ADMIN");
  const [filieres, setFilieres] = useState<Filiere[]>([]);

  // Chargement des utilisateurs depuis le backend
  const fetchUtilisateurs = async () => {
    try {
      setIsLoading(true);
      const data = await getUtilisateurs();
      setUtilisateurs(data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs");
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
    fetchUtilisateurs();
    fetchFilieres();
  }, []);

  // Fonction de rafraîchissement
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUtilisateurs();
  };

  // Filtrage des utilisateurs
  const filteredUtilisateurs = utilisateurs.filter((utilisateur) => {
    const matchesSearch =
      utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRoleFilter =
      filterRole === "all" || utilisateur.role === filterRole;
    const matchesStatutFilter =
      filterStatut === "all" || utilisateur.statutCompte === filterStatut;
    return matchesSearch && matchesRoleFilter && matchesStatutFilter;
  });

  // Couleurs des badges de rôle
  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-800 hover:bg-red-200",
    ENSEIGNANT: "bg-green-100 text-green-800 hover:bg-green-200",
    ETUDIANT: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    PARENT: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  };

  // Couleurs des badges de statut
  const statutColors: Record<string, string> = {
    ACTIF: "bg-green-100 text-green-800 hover:bg-green-200",
    INACTIF: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    BLOQUE: "bg-red-100 text-red-800 hover:bg-red-200",
    EN_ATTENTE: "bg-blue-100 text-blue-800 hover:bg-blue-200",
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

      const role = formData.get("role") as RegisterRequest["role"];

      const utilisateurData: Partial<RegisterRequest> = {
        nom: formData.get("nom") as string,
        prenom: formData.get("prenom") as string,
        sexe: formData.get("sexe") as string,
        telephone: formData.get("telephone") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        role: role,
      };

      // Ajouter des champs spécifiques selon le rôle
      if (role === "ADMIN") {
        utilisateurData.typeAdmin = formData.get(
          "typeAdmin"
        ) as RegisterRequest["typeAdmin"];
      } else if (role === "ENSEIGNANT") {
        utilisateurData.matricule = formData.get("matricule") as string;
        utilisateurData.typeEnseignant = formData.get(
          "typeEnseignant"
        ) as RegisterRequest["typeEnseignant"];
        utilisateurData.grade = formData.get("grade") as string;
        utilisateurData.specialite = formData.get("specialite") as string;
      } else if (role === "ETUDIANT") {
        utilisateurData.ine = formData.get("ine") as string;
        utilisateurData.filiereId = formData.get("filiereID") as string;
      } else if (role === "PARENT") {
        utilisateurData.typeParent = formData.get(
          "typeParent"
        ) as RegisterRequest["typeParent"];
        utilisateurData.lieuResidence = formData.get("lieuResidence") as string;
      }

      // Ajout
      await createUtilisateur(utilisateurData);
      // Rafraîchir la liste pour obtenir les données à jour
      await fetchUtilisateurs();
      toast.success("Utilisateur ajouté avec succès", {
        duration: 3000,
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

  // Gestion de l'activation/blocage des comptes
  const handleStatusChange = async (
    userId: string,
    action: "activate" | "block" | "promouvoir"
  ) => {
    setIsProcessing(userId);
    try {
      switch (action) {
        case "activate":
          await activateUtilisateur(userId);
          toast.success("Compte activé avec succès", {
            duration: 3000,
            style: {
              backgroundColor: "#dcfce7",
              color: "#166534",
            },
          });
          break;
        case "block":
          await blockUtilisateur(userId);
          toast.success("Compte bloqué avec succès", {
            duration: 3000,
            style: {
              backgroundColor: "#dcfce7",
              color: "#166534",
            },
          });
          break;
        case "promouvoir":
          await promoteStudent(userId);
          toast.success("Etudiant promu avec succès", {
            duration: 3000,
            style: {
              backgroundColor: "#dcfce7",
              color: "#166534",
            },
          });
          break;
      }

      // Mettre à jour la liste des utilisateurs
      await fetchUtilisateurs();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Erreur lors de l'action: ${action}`,
        {
          duration: 5000,
          style: {
            backgroundColor: "#fee2e2",
            color: "#991b1b",
          },
        }
      );
    } finally {
      setIsProcessing(null);
    }
  };

  // Ouverture du formulaire de création/modification
  const openUtilisateurForm = () => {
    setFormError(null);
    setFormFieldErrors({});
    setIsDialogOpen(true);
    setShowPassword(false);
    setShowAdditionalFields(false);
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chargement des utilisateurs</CardTitle>
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
            <Button
              onClick={fetchUtilisateurs}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Génération des champs additionnels basés sur le rôle sélectionné
  const renderAdditionalFields = (role: string) => {
    if (!showAdditionalFields) return null;

    switch (role) {
      case "ADMIN":
        return (
          <div className="space-y-2">
            <Label htmlFor="typeAdmin">Type Admin</Label>
            <Select name="typeAdmin" required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COORDONNATEUR">Coordonnateur</SelectItem>
                <SelectItem value="SCOLARITE">Scolarité</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case "ENSEIGNANT":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matricule">Matricule</Label>
              <Input id="matricule" name="matricule" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="typeEnseignant">Type Enseignant</Label>
              <Select name="typeEnseignant">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERMANENT">Permanent</SelectItem>
                  <SelectItem value="VACATAIRE">Vacataire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Input id="grade" name="grade" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialite">Spécialité</Label>
              <Input id="specialite" name="specialite" />
            </div>
          </div>
        );
      case "ETUDIANT":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ine">INE</Label>
              <Input id="ine" name="ine" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="filiereID">Filière </Label>
              <Select name="filiereID" required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la filière" />
                </SelectTrigger>
                <SelectContent>
                  {filieres.map((filiere) => (
                    <SelectItem key={filiere.id} value={filiere.id}>
                      {filiere.nomFiliere} {filiere.niveau}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "PARENT":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="typeParent">Type Parent</Label>
              <Select name="typeParent">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERE">Père</SelectItem>
                  <SelectItem value="MERE">Mère</SelectItem>
                  <SelectItem value="TUTEUR">Tuteur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lieuResidence">Lieu de résidence</Label>
              <Input id="lieuResidence" name="lieuResidence" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* En-tête et boutons d'action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>

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
              onClick={() => openUtilisateurForm()}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter un utilisateur
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
                  placeholder="Rechercher un utilisateur..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="ENSEIGNANT">Enseignant</SelectItem>
                    <SelectItem value="ETUDIANT">Étudiant</SelectItem>
                    <SelectItem value="PARENT">Parent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterStatut} onValueChange={setFilterStatut}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="ACTIF">Actif</SelectItem>
                    <SelectItem value="INACTIF">Inactif</SelectItem>
                    <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des utilisateurs */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="w-full justify-start rounded-b-none border-b">
                <TabsTrigger value="list">Liste des utilisateurs</TabsTrigger>
                <TabsTrigger value="stats">Statistiques</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="pt-2">
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom & Prénom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUtilisateurs.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            Aucun utilisateur trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUtilisateurs.map((utilisateur) => (
                          <TableRow key={utilisateur.id}>
                            <TableCell className="font-medium">
                              {`${utilisateur.prenom} ${utilisateur.nom}`}
                            </TableCell>
                            <TableCell>{utilisateur.email}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={roleColors[utilisateur.role] || ""}
                              >
                                {utilisateur.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  statutColors[utilisateur.statutCompte] || ""
                                }
                              >
                                {utilisateur.statutCompte}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end items-center gap-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <RotateCw className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                      Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    {utilisateur.statutCompte !== "ACTIF" && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleStatusChange(
                                            utilisateur.id,
                                            "activate"
                                          )
                                        }
                                        disabled={
                                          isProcessing === utilisateur.id
                                        }
                                        className="text-green-600 focus:text-green-600"
                                      >
                                        {isProcessing === utilisateur.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                          <Unlock className="h-4 w-4 mr-2" />
                                        )}
                                        Activer
                                      </DropdownMenuItem>
                                    )}

                                    {utilisateur.role === "ETUDIANT" && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleStatusChange(
                                            utilisateur.id,
                                            "promouvoir"
                                          )
                                        }
                                        disabled={
                                          isProcessing === utilisateur.id
                                        }
                                        className="text-yellow-600 focus:text-yellow-600"
                                      >
                                        {isProcessing === utilisateur.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                          <Lock className="h-4 w-4 mr-2" />
                                        )}
                                        Promouvoir délegué
                                      </DropdownMenuItem>
                                    )}

                                    {utilisateur.statutCompte !== "BLOQUE" && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleStatusChange(
                                            utilisateur.id,
                                            "block"
                                          )
                                        }
                                        disabled={
                                          isProcessing === utilisateur.id
                                        }
                                        className="text-red-600 focus:text-red-600"
                                      >
                                        {isProcessing === utilisateur.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                          <Shield className="h-4 w-4 mr-2" />
                                        )}
                                        Bloquer
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Nombre total d'utilisateurs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {utilisateurs.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Utilisateurs enregistrés dans le système
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Utilisateurs actifs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {
                          utilisateurs.filter((u) => u.statutCompte === "ACTIF")
                            .length
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Utilisateurs avec un compte actif
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Comptes bloqués
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {
                          utilisateurs.filter(
                            (u) => u.statutCompte === "BLOQUE"
                          ).length
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Utilisateurs avec un compte bloqué
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire de création/modification d'utilisateur */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mt-2 text-sm">
                {formError}
              </div>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" name="nom" required />
                {formFieldErrors.nom && (
                  <p className="text-red-500 text-xs">{formFieldErrors.nom}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input id="prenom" name="prenom" required />
                {formFieldErrors.prenom && (
                  <p className="text-red-500 text-xs">
                    {formFieldErrors.prenom}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sexe">Sexe</Label>
                <Select name="sexe" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le sexe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculin</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                  </SelectContent>
                </Select>
                {formFieldErrors.sexe && (
                  <p className="text-red-500 text-xs">{formFieldErrors.sexe}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" name="telephone" required />
                {formFieldErrors.telephone && (
                  <p className="text-red-500 text-xs">
                    {formFieldErrors.telephone}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
              {formFieldErrors.email && (
                <p className="text-red-500 text-xs">{formFieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required={true}
              />
              {formFieldErrors.password && (
                <p className="text-red-500 text-xs">
                  {formFieldErrors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label id="roleLabel">Rôle</Label>
              <Select
                name="role"
                onValueChange={(value) => {
                  setShowAdditionalFields(true);
                  setRole(value);
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="ENSEIGNANT">Enseignant</SelectItem>
                  <SelectItem value="ETUDIANT">Étudiant</SelectItem>
                  <SelectItem value="PARENT">Parent</SelectItem>
                </SelectContent>
              </Select>
              {formFieldErrors.role && (
                <p className="text-red-500 text-xs">{formFieldErrors.role}</p>
              )}
            </div>

            {/* Champs additionnels basés sur le rôle */}
            {renderAdditionalFields(role)}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
    </div>
  );
};

export default Users;
