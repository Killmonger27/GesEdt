import { useState, useEffect } from "react";
import { Edit2, Save, X, Lock, AlertCircle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";

// Types pour TypeScript
interface UserData {
  id: string;
  nom: string;
  prenom: string;
  sexe: "HOMME" | "FEMME";
  telephone: string;
  email: string;
  password: string;
  statutCompte: "ACTIF" | "INACTIF" | "SUSPENDU" | "BLOQUE";
}

interface FormErrors {
  nom?: string;
  prenom?: string;
  sexe?: string;
  telephone?: string;
  email?: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Service fictif pour récupérer et mettre à jour les données utilisateur
const getUserProfile = async (): Promise<UserData> => {
  // Simulation d'appel API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: "usr-123456",
        nom: "Dupont",
        prenom: "Jean",
        sexe: "HOMME",
        telephone: "+212 12345678",
        email: "jean.dupont@example.com",
        password: "********",
        statutCompte: "ACTIF",
      });
    }, 1000);
  });
};

const updateUserProfile = async (userData: UserData): Promise<UserData> => {
  // Simulation d'appel API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...userData,
        password: "********",
      });
    }, 1500);
  });
};

const updatePassword = async (passwordData: PasswordForm): Promise<boolean> => {
  // Simulation d'appel API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1500);
  });
};

const ProfilePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<UserData | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});

  useEffect(() => {
    const loadUserData = async (): Promise<void> => {
      try {
        const data = await getUserProfile();
        setUserData(data);
        setFormData(data);
      } catch (error) {
        toast.error("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: value,
      };
    });

    // Clear the error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSelectChange = (name: string, value: string): void => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: value,
      };
    });

    // Clear the error when user selects
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the error when user types
    if (passwordErrors[name as keyof PasswordErrors]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData) return false;

    const newErrors: FormErrors = {};

    if (!formData.nom) newErrors.nom = "Le nom est obligatoire";
    if (!formData.prenom) newErrors.prenom = "Le prénom est obligatoire";
    if (!formData.sexe) newErrors.sexe = "Le sexe est obligatoire";

    const phoneRegex = /^(\+\d{1,3})?\s?(\d{8})$/;
    if (!formData.telephone) {
      newErrors.telephone = "Le numéro de téléphone est obligatoire";
    } else if (!phoneRegex.test(formData.telephone)) {
      newErrors.telephone = "Le format du numéro n'est pas valide";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "L'email est obligatoire";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: PasswordErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "Veuillez saisir votre mot de passe actuel";
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = "Le nouveau mot de passe est obligatoire";
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword =
        "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Veuillez confirmer votre mot de passe";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditToggle = (): void => {
    if (isEditing) {
      // Cancel editing
      setFormData(userData);
      setErrors({});
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm() || !formData) return;

    try {
      setIsSubmitting(true);
      const updatedData = await updateUserProfile(formData);
      setUserData(updatedData);
      setIsEditing(false);
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (): Promise<void> => {
    if (!validatePasswordForm()) return;

    try {
      setIsSubmitting(true);
      await updatePassword(passwordForm);
      setPasswordDialogOpen(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
      toast.success("Mot de passe modifié avec succès");
    } catch (error) {
      toast.error("Erreur lors de la modification du mot de passe");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!userData || !formData) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 mx-auto mb-4 text-destructive" />
          <p className="text-muted-foreground">
            Données utilisateur non disponibles
          </p>
        </div>
      </div>
    );
  }

  // Déterminer la couleur du badge de statut
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "ACTIF":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "INACTIF":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "SUSPENDU":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "BLOQUE":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Initialiser les initiales pour l'avatar
  const initials = `${userData.prenom[0]}${userData.nom[0]}`;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Détails du compte</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2">
              <div>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Consultez et modifiez vos informations personnelles
                </CardDescription>
              </div>
              <Button
                variant={isEditing ? "ghost" : "outline"}
                size="sm"
                onClick={handleEditToggle}
                className="mt-2 sm:mt-0"
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 mr-2" /> Annuler
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" /> Modifier
                  </>
                )}
              </Button>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage
                      src=""
                      alt={`${userData.prenom} ${userData.nom}`}
                    />
                    <AvatarFallback className="text-xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className={getStatusBadgeClass(userData.statutCompte)}>
                    {userData.statutCompte}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    ID: {userData.id}
                  </p>
                </div>

                <div className="flex-1 grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="nom"
                        className={`mb-1 ${
                          errors.nom ? "text-destructive" : ""
                        }`}
                      >
                        Nom {errors.nom && <span className="text-xs">*</span>}
                      </Label>
                      <Input
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        placeholder="Votre nom"
                        disabled={!isEditing}
                        className={errors.nom ? "border-destructive" : ""}
                      />
                      {errors.nom && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.nom}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="prenom"
                        className={`mb-1 ${
                          errors.prenom ? "text-destructive" : ""
                        }`}
                      >
                        Prénom{" "}
                        {errors.prenom && <span className="text-xs">*</span>}
                      </Label>
                      <Input
                        id="prenom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleInputChange}
                        placeholder="Votre prénom"
                        disabled={!isEditing}
                        className={errors.prenom ? "border-destructive" : ""}
                      />
                      {errors.prenom && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.prenom}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="sexe"
                        className={`mb-1 ${
                          errors.sexe ? "text-destructive" : ""
                        }`}
                      >
                        Sexe {errors.sexe && <span className="text-xs">*</span>}
                      </Label>
                      <Select
                        value={formData.sexe}
                        onValueChange={(value: string) =>
                          handleSelectChange("sexe", value)
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger
                          className={errors.sexe ? "border-destructive" : ""}
                        >
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HOMME">Homme</SelectItem>
                          <SelectItem value="FEMME">Femme</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.sexe && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.sexe}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="telephone"
                        className={`mb-1 ${
                          errors.telephone ? "text-destructive" : ""
                        }`}
                      >
                        Téléphone{" "}
                        {errors.telephone && <span className="text-xs">*</span>}
                      </Label>
                      <Input
                        id="telephone"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleInputChange}
                        placeholder="+212 12345678"
                        disabled={!isEditing}
                        className={errors.telephone ? "border-destructive" : ""}
                      />
                      {errors.telephone && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.telephone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="email"
                      className={`mb-1 ${
                        errors.email ? "text-destructive" : ""
                      }`}
                    >
                      Email {errors.email && <span className="text-xs">*</span>}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="votre.email@example.com"
                      disabled={!isEditing}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>

            {isEditing && (
              <CardFooter className="flex justify-end pt-0">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité du compte</CardTitle>
              <CardDescription>
                Gérez vos identifiants de connexion et la sécurité de votre
                compte
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-muted p-2 rounded-full">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Mot de passe</h3>
                    <p className="text-sm text-muted-foreground">
                      Dernière modification il y a 3 mois
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Modifier
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de changement de mot de passe */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier votre mot de passe</DialogTitle>
            <DialogDescription>
              Assurez-vous de choisir un mot de passe sécurisé que vous
              n'utilisez pas ailleurs.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label
                htmlFor="currentPassword"
                className={
                  passwordErrors.currentPassword ? "text-destructive" : ""
                }
              >
                Mot de passe actuel
              </Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className={
                  passwordErrors.currentPassword
                    ? "border-destructive mt-1"
                    : "mt-1"
                }
              />
              {passwordErrors.currentPassword && (
                <p className="text-xs text-destructive mt-1">
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="newPassword"
                className={passwordErrors.newPassword ? "text-destructive" : ""}
              >
                Nouveau mot de passe
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className={
                  passwordErrors.newPassword
                    ? "border-destructive mt-1"
                    : "mt-1"
                }
              />
              {passwordErrors.newPassword ? (
                <p className="text-xs text-destructive mt-1">
                  {passwordErrors.newPassword}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 8 caractères
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="confirmPassword"
                className={
                  passwordErrors.confirmPassword ? "text-destructive" : ""
                }
              >
                Confirmer le mot de passe
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className={
                  passwordErrors.confirmPassword
                    ? "border-destructive mt-1"
                    : "mt-1"
                }
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPasswordDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handlePasswordSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
