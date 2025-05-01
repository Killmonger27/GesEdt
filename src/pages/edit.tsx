import { useState, useEffect, useMemo } from "react";
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
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  Loader2,
  Plus,
  ChevronRight,
  CalendarFold,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
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

// Interface pour les événements du calendrier
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "cours" | "devoir";
  creneau: "MATIN" | "SOIR";
  statut: string;
  matiereId: string;
  salle?: string;
  disponibiliteProf?: "DISPONIBLE" | "INDISPONIBLE";
  originalData: Cours | Devoir;
  color: string;
}

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
  const [activeTab, setActiveTab] = useState("calendar");
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

  // États pour le calendrier
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">(
    "week"
  );
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [, setVisibleEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

    // Définir la date actuelle entre la date de début et fin de l'EDT
    const startDate = new Date(edtDateDebut);
    const endDate = new Date(edtDateFin);
    const today = new Date();
    if (today < startDate) {
      setCurrentDate(startDate);
    } else if (today > endDate) {
      setCurrentDate(endDate);
    } else {
      setCurrentDate(today);
    }

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Charger les cours et devoirs pour cet EDT
        const coursData = await getCoursByEdt(edtId, edtIdFiliere);
        const devoirsData = await getDevoirsByEdt(edtId, edtIdFiliere);

        // Charger les données de référence
        const filieresData = await getFilieres();
        const matieresData = await getModules();
        const sallesData = await getSalles();

        setCours(coursData);
        setDevoirs(devoirsData);
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

  // Convertir les cours et devoirs en événements du calendrier
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Ajouter les cours
    cours.forEach((c) => {
      const matiere = matieres.find((m) => m.id === c.idMatiere);
      const salle = salles.find((s) => s.id === c.idSalle);

      // Définir la couleur en fonction du statut
      let color = "";
      switch (c.statutCours) {
        case "PLANIFIE":
          color = "bg-blue-100 border-blue-300 text-blue-800";
          break;
        case "FAIT":
          color = "bg-green-100 border-green-300 text-green-800";
          break;
        case "NON_FAIT":
          color = "bg-red-100 border-red-300 text-red-800";
          break;
        case "ANNULE":
          color = "bg-gray-100 border-gray-300 text-gray-800";
          break;
      }

      // Ajouter en fonction de la disponibilité du prof
      if (c.disponibiliteProf === "INDISPONIBLE") {
        color = "bg-yellow-100 border-yellow-300 text-yellow-800";
      }

      events.push({
        id: c.id,
        title: matiere?.intitule || "Cours sans nom",
        date: new Date(c.date),
        type: "cours",
        creneau: c.crenau,
        statut: c.statutCours,
        matiereId: c.idMatiere,
        salle: salle?.numeroSalle,
        disponibiliteProf: c.disponibiliteProf,
        originalData: c,
        color: color,
      });
    });

    // Ajouter les devoirs
    devoirs.forEach((d) => {
      const matiere = matieres.find((m) => m.id === d.idMatiere);
      const salle = salles.find((s) => s.id === d.idSalle);

      // Définir la couleur en fonction du statut
      let color = "";
      switch (d.statutDevoir) {
        case "FAIT":
          color = "bg-green-100 border-green-300 text-green-800";
          break;
        case "NON_FAIT":
          color = "bg-red-100 border-red-300 text-red-800";
          break;
        case "ANNULE":
          color = "bg-gray-100 border-gray-300 text-gray-800";
          break;
      }

      events.push({
        id: d.id,
        title: `Devoir: ${matiere?.intitule || "Sans nom"}`,
        date: new Date(d.date),
        type: "devoir",
        creneau: d.crenau,
        statut: d.statutDevoir,
        matiereId: d.idMatiere,
        salle: salle?.numeroSalle,
        originalData: d,
        color: color,
      });
    });

    return events;
  }, [cours, devoirs, matieres, salles]);

  // Fonction pour filtrer les événements selon la vue du calendrier
  useEffect(() => {
    const filterEventsByView = () => {
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      switch (calendarView) {
        case "day":
          return calendarEvents.filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate >= startOfDay && eventDate <= endOfDay;
          });

        case "week": {
          const startOfWeek = new Date(currentDate);
          startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);

          return calendarEvents.filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate >= startOfWeek && eventDate <= endOfWeek;
          });
        }

        case "month": {
          const startOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );
          const endOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          );

          return calendarEvents.filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate >= startOfMonth && eventDate <= endOfMonth;
          });
        }
      }
    };

    setVisibleEvents(filterEventsByView());
  }, [calendarEvents, calendarView, currentDate]);

  // Fonction pour naviguer dans le calendrier
  const navigateCalendar = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);

    switch (calendarView) {
      case "day":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
      case "week":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
    }

    // Vérifier que la nouvelle date est dans la période de l'EDT
    const startDate = new Date(edt?.dateDebut || "");
    const endDate = new Date(edt?.dateFin || "");

    if (newDate >= startDate && newDate <= endDate) {
      setCurrentDate(newDate);
    } else {
      toast.error(
        "La date sélectionnée est en dehors de la période de l'emploi du temps",
        {
          duration: 3000,
        }
      );
    }
  };

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
        crenau: formData.get("creneau") as "MATIN" | "SOIR",
        // statutCours: formData.get("statutCours") as
        //   | "PLANIFIE"
        //   | "FAIT"
        //   | "NON_FAIT"
        //   | "ANNULE",
        // disponibiliteProf: formData.get("disponibiliteProf") as
        //   | "DISPONIBLE"
        //   | "INDISPONIBLE",
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
        crenau: formData.get("creneau") as "MATIN" | "SOIR",
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
      setCours(cours.filter((c) => c.id !== coursToDelete.id));
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

  // Gérer le clic sur un événement du calendrier
  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === "cours") {
      setSelectedCours(event.originalData as Cours);
      setIsCoursDialogOpen(true);
    } else {
      setSelectedDevoir(event.originalData as Devoir);
      setIsDevoirDialogOpen(true);
    }
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

  // Fonction pour générer les jours de la semaine (pour l'affichage hebdomadaire)
  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    // Reculer jusqu'au dimanche (début de semaine)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Fonction pour générer les jours du mois (pour l'affichage mensuel)
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    // Remplir avec les jours précédents pour commencer le calendrier par un dimanche
    const startOffset = firstDay.getDay();
    for (let i = 0; i < startOffset; i++) {
      const prevDay = new Date(firstDay);
      prevDay.setDate(prevDay.getDate() - (startOffset - i));
      days.push({ date: prevDay, isCurrentMonth: false });
    }

    // Ajouter tous les jours du mois
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    // Ajouter les jours suivants pour finir la dernière semaine
    const endOffset = 6 - lastDay.getDay();
    for (let i = 1; i <= endOffset; i++) {
      const nextDay = new Date(lastDay);
      nextDay.setDate(lastDay.getDate() + i);
      days.push({ date: nextDay, isCurrentMonth: false });
    }

    return days;
  };

  // Fonction pour vérifier si un jour a des événements
  const hasEvents = (date: Date) => {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return calendarEvents.some((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= day && eventDate <= dayEnd;
    });
  };

  // Fonction pour obtenir les événements d'un jour spécifique
  const getEventsForDay = (date: Date) => {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return calendarEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= day && eventDate <= dayEnd;
    });
  };

  // Obtenir les événements par créneau pour l'affichage quotidien
  const getEventsBySlot = (date: Date, creneau: "MATIN" | "SOIR") => {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return calendarEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate >= day && eventDate <= dayEnd && event.creneau === creneau
      );
    });
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

  // Fonction pour créer rapidement un cours ou un devoir en cliquant sur un jour
  const handleAddEventOnDay = (date: Date, type: "cours" | "devoir") => {
    setSelectedDate(date);
    if (type === "cours") {
      setSelectedCours(null);
      setIsCoursDialogOpen(true);
    } else {
      setSelectedDevoir(null);
      setIsDevoirDialogOpen(true);
    }
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

        {/* Onglets principaux */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendrier
            </TabsTrigger>
            <TabsTrigger value="cours">Cours</TabsTrigger>
            <TabsTrigger value="devoirs">Devoirs</TabsTrigger>
          </TabsList>

          {/* Contenu de l'onglet Calendrier */}
          <TabsContent value="calendar">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Calendrier des activités</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCalendarView("day")}
                    className={calendarView === "day" ? "bg-gray-100" : ""}
                  >
                    <CalendarFold className="h-4 w-4 mr-1" />
                    Jour
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCalendarView("week")}
                    className={calendarView === "week" ? "bg-gray-100" : ""}
                  >
                    <CalendarDays className="h-4 w-4 mr-1" />
                    Semaine
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCalendarView("month")}
                    className={calendarView === "month" ? "bg-gray-100" : ""}
                  >
                    <CalendarRange className="h-4 w-4 mr-1" />
                    Mois
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Navigation du calendrier */}
                <div className="flex justify-between items-center mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateCalendar("prev")}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <div className="font-medium">
                    {calendarView === "day" && formatDate(currentDate)}
                    {calendarView === "week" &&
                      `Semaine du ${formatDate(
                        getWeekDays()[0]
                      )} au ${formatDate(getWeekDays()[6])}`}
                    {calendarView === "month" &&
                      currentDate.toLocaleDateString("fr-FR", {
                        month: "long",
                        year: "numeric",
                      })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateCalendar("next")}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                {/* Vue Jour */}
                {calendarView === "day" && (
                  <div className="border rounded-md">
                    <div className="p-4 border-b bg-gray-50">
                      <h3 className="font-medium">{formatDate(currentDate)}</h3>
                    </div>

                    {/* Créneaux */}
                    <div className="divide-y">
                      {/* Créneau du matin */}
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Matin</h4>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleAddEventOnDay(currentDate, "cours")
                              }
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Cours
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleAddEventOnDay(currentDate, "devoir")
                              }
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Devoir
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {getEventsBySlot(currentDate, "MATIN").length > 0 ? (
                            getEventsBySlot(currentDate, "MATIN").map(
                              (event) => (
                                <div
                                  key={`${event.type}-${event.id}`}
                                  className={`p-2 border rounded-md cursor-pointer ${event.color}`}
                                  onClick={() => handleEventClick(event)}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">
                                      {event.title}
                                    </span>
                                    <Badge variant="outline">
                                      {event.type === "cours"
                                        ? "Cours"
                                        : "Devoir"}
                                    </Badge>
                                  </div>
                                  <div className="text-sm mt-1">
                                    {event.salle && (
                                      <span>Salle: {event.salle}</span>
                                    )}
                                    {event.disponibiliteProf && (
                                      <Badge
                                        className={
                                          profStatusColor[
                                            event.disponibiliteProf
                                          ]
                                        }
                                      >
                                        Prof{" "}
                                        {event.disponibiliteProf.toLowerCase()}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )
                            )
                          ) : (
                            <div className="text-sm text-gray-500 italic">
                              Aucun événement
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Créneau du soir */}
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Soir</h4>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleAddEventOnDay(currentDate, "cours")
                              }
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Cours
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleAddEventOnDay(currentDate, "devoir")
                              }
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Devoir
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {getEventsBySlot(currentDate, "SOIR").length > 0 ? (
                            getEventsBySlot(currentDate, "SOIR").map(
                              (event) => (
                                <div
                                  key={`${event.type}-${event.id}`}
                                  className={`p-2 border rounded-md cursor-pointer ${event.color}`}
                                  onClick={() => handleEventClick(event)}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">
                                      {event.title}
                                    </span>
                                    <Badge variant="outline">
                                      {event.type === "cours"
                                        ? "Cours"
                                        : "Devoir"}
                                    </Badge>
                                  </div>
                                  <div className="text-sm mt-1">
                                    {event.salle && (
                                      <span>Salle: {event.salle}</span>
                                    )}
                                    {event.disponibiliteProf && (
                                      <Badge
                                        className={
                                          profStatusColor[
                                            event.disponibiliteProf
                                          ]
                                        }
                                      >
                                        Prof{" "}
                                        {event.disponibiliteProf.toLowerCase()}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )
                            )
                          ) : (
                            <div className="text-sm text-gray-500 italic">
                              Aucun événement
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vue Semaine */}
                {calendarView === "week" && (
                  <div className="border rounded-md">
                    <div className="grid grid-cols-7 divide-x">
                      {getWeekDays().map((day, index) => (
                        <div key={index} className="p-2 text-center bg-gray-50">
                          <div className="font-medium">
                            {day.toLocaleDateString("fr-FR", {
                              weekday: "short",
                            })}
                          </div>
                          <div className="text-sm">{formatDate(day)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 divide-x">
                      {getWeekDays().map((day, index) => (
                        <div
                          key={index}
                          className={`min-h-[150px] p-2 ${
                            day.toDateString() === new Date().toDateString()
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <div className="flex justify-end mb-2">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  handleAddEventOnDay(day, "cours")
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            {getEventsForDay(day).map((event) => (
                              <div
                                key={`${event.type}-${event.id}`}
                                className={`px-2 py-1 text-xs rounded cursor-pointer truncate ${event.color}`}
                                onClick={() => handleEventClick(event)}
                              >
                                <div className="font-medium">{event.title}</div>
                                <div>
                                  {event.creneau === "MATIN" ? "Matin" : "Soir"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vue Mois */}
                {calendarView === "month" && (
                  <div className="border rounded-md">
                    <div className="grid grid-cols-7 divide-x">
                      {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map(
                        (day) => (
                          <div
                            key={day}
                            className="p-2 text-center bg-gray-50 font-medium"
                          >
                            {day}
                          </div>
                        )
                      )}
                    </div>
                    <div className="grid grid-cols-7 divide-x divide-y">
                      {getMonthDays().map((dayInfo, index) => {
                        const isToday =
                          dayInfo.date.toDateString() ===
                          new Date().toDateString();
                        return (
                          <div
                            key={index}
                            className={`min-h-[100px] p-2 ${
                              !dayInfo.isCurrentMonth
                                ? "bg-gray-50 text-gray-400"
                                : ""
                            } ${isToday ? "bg-blue-50" : ""}`}
                          >
                            <div className="flex justify-between">
                              <span
                                className={`text-sm ${
                                  isToday ? "font-bold" : ""
                                }`}
                              >
                                {dayInfo.date.getDate()}
                              </span>
                              {dayInfo.isCurrentMonth && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 p-0"
                                  onClick={() =>
                                    handleAddEventOnDay(dayInfo.date, "cours")
                                  }
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              )}
                            </div>

                            <div className="mt-1 space-y-1">
                              {hasEvents(dayInfo.date) && (
                                <div className="space-y-1">
                                  {getEventsForDay(dayInfo.date)
                                    .slice(0, 2)
                                    .map((event, idx) => (
                                      <div
                                        key={`${event.type}-${event.id}-${idx}`}
                                        className={`px-1 py-0.5 text-xs rounded cursor-pointer truncate ${event.color}`}
                                        onClick={() => handleEventClick(event)}
                                      >
                                        {event.title.length > 10
                                          ? event.title.substring(0, 10) + "..."
                                          : event.title}
                                      </div>
                                    ))}
                                  {getEventsForDay(dayInfo.date).length > 2 && (
                                    <div className="text-xs text-gray-500">
                                      +
                                      {getEventsForDay(dayInfo.date).length - 2}{" "}
                                      plus
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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
                <div className="mb-4 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="dateFilter">Filtrer par date</Label>
                    <Input
                      id="dateFilter"
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="matiereFilter">Filtrer par matière</Label>
                    <Select
                      value={matiereFilter}
                      onValueChange={setMatiereFilter}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Toutes les matières" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les matières</SelectItem>
                        {matieres.map((matiere) => (
                          <SelectItem key={matiere.id} value={matiere.id}>
                            {matiere.intitule}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Créneau</TableHead>
                        <TableHead>Matière</TableHead>
                        <TableHead>Salle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Prof</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCours.length > 0 ? (
                        filteredCours.map((cours) => (
                          <TableRow key={cours.id}>
                            <TableCell>{formatDate(cours.date)}</TableCell>
                            <TableCell>
                              {cours.crenau === "MATIN" ? "Matin" : "Soir"}
                            </TableCell>
                            <TableCell>
                              {matieres.find((m) => m.id === cours.idMatiere)
                                ?.intitule || "-"}
                            </TableCell>
                            <TableCell>
                              {salles.find((s) => s.id === cours.idSalle)
                                ?.numeroSalle || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={coursStatusColor[cours.statutCours]}
                              >
                                {cours.statutCours}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  profStatusColor[cours.disponibiliteProf]
                                }
                              >
                                {cours.disponibiliteProf}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditCours(cours)}
                                >
                                  Éditer
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
                          <TableCell colSpan={7} className="text-center py-4">
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
                <div className="mb-4 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="dateFilterDevoir">Filtrer par date</Label>
                    <Input
                      id="dateFilterDevoir"
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="matiereFilterDevoir">
                      Filtrer par matière
                    </Label>
                    <Select
                      value={matiereFilter}
                      onValueChange={setMatiereFilter}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Toutes les matières" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les matières</SelectItem>
                        {matieres.map((matiere) => (
                          <SelectItem key={matiere.id} value={matiere.id}>
                            {matiere.intitule}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border rounded-md">
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
                              {devoir.crenau === "MATIN" ? "Matin" : "Soir"}
                            </TableCell>
                            <TableCell>
                              {matieres.find((m) => m.id === devoir.idMatiere)
                                ?.intitule || "-"}
                            </TableCell>
                            <TableCell>
                              {salles.find((s) => s.id === devoir.idSalle)
                                ?.numeroSalle || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  devoirStatusColor[devoir.statutDevoir]
                                }
                              >
                                {devoir.statutDevoir}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditDevoir(devoir)}
                                >
                                  Éditer
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
                          <TableCell colSpan={6} className="text-center py-4">
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
      {/* Dialog pour ajouter/éditer un cours */}
      <Dialog open={isCoursDialogOpen} onOpenChange={setIsCoursDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCours ? "Modifier un cours" : "Ajouter un cours"}
            </DialogTitle>
            <DialogDescription>
              {selectedCours
                ? "Modifiez les détails du cours sélectionné."
                : "Remplissez le formulaire pour ajouter un nouveau cours à l'emploi du temps."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCoursSubmit}>
            {formError && (
              <div className="bg-red-50 text-red-900 p-3 rounded-md mb-4">
                {formError}
              </div>
            )}
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  name="date"
                  defaultValue={
                    selectedCours
                      ? new Date(selectedCours.date).toISOString().split("T")[0]
                      : selectedDate
                      ? new Date(selectedDate).toISOString().split("T")[0]
                      : ""
                  }
                  required
                />
                {formFieldErrors.date && (
                  <p className="text-red-500 text-sm">{formFieldErrors.date}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="creneau">Créneau</Label>
                <Select
                  name="creneau"
                  defaultValue={selectedCours?.crenau || "MATIN"}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un créneau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MATIN">Matin</SelectItem>
                    <SelectItem value="SOIR">Soir</SelectItem>
                  </SelectContent>
                </Select>
                {formFieldErrors.creneau && (
                  <p className="text-red-500 text-sm">
                    {formFieldErrors.creneau}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="idMatiere">Matière</Label>
                <Select
                  name="idMatiere"
                  defaultValue={selectedCours?.idMatiere || ""}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une matière" />
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
                  <p className="text-red-500 text-sm">
                    {formFieldErrors.idMatiere}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="idSalle">Salle</Label>
                <Select
                  name="idSalle"
                  defaultValue={selectedCours?.idSalle || ""}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une salle" />
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
                  <p className="text-red-500 text-sm">
                    {formFieldErrors.idSalle}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCoursDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : selectedCours ? (
                  "Mettre à jour"
                ) : (
                  "Ajouter"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter/éditer un devoir */}
      <Dialog open={isDevoirDialogOpen} onOpenChange={setIsDevoirDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDevoir ? "Modifier un devoir" : "Ajouter un devoir"}
            </DialogTitle>
            <DialogDescription>
              {selectedDevoir
                ? "Modifiez les détails du devoir sélectionné."
                : "Remplissez le formulaire pour ajouter un nouveau devoir à l'emploi du temps."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDevoirSubmit}>
            {formError && (
              <div className="bg-red-50 text-red-900 p-3 rounded-md mb-4">
                {formError}
              </div>
            )}
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  name="date"
                  defaultValue={
                    selectedDevoir
                      ? new Date(selectedDevoir.date)
                          .toISOString()
                          .split("T")[0]
                      : selectedDate
                      ? new Date(selectedDate).toISOString().split("T")[0]
                      : ""
                  }
                  required
                />
                {formFieldErrors.date && (
                  <p className="text-red-500 text-sm">{formFieldErrors.date}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="creneau">Créneau</Label>
                <Select
                  name="creneau"
                  defaultValue={selectedDevoir?.crenau || "MATIN"}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un créneau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MATIN">Matin</SelectItem>
                    <SelectItem value="SOIR">Soir</SelectItem>
                  </SelectContent>
                </Select>
                {formFieldErrors.creneau && (
                  <p className="text-red-500 text-sm">
                    {formFieldErrors.creneau}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="idMatiere">Matière</Label>
                <Select
                  name="idMatiere"
                  defaultValue={selectedDevoir?.idMatiere || ""}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une matière" />
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
                  <p className="text-red-500 text-sm">
                    {formFieldErrors.idMatiere}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="idSalle">Salle</Label>
                <Select
                  name="idSalle"
                  defaultValue={selectedDevoir?.idSalle || ""}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une salle" />
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
                  <p className="text-red-500 text-sm">
                    {formFieldErrors.idSalle}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="statutDevoir">Statut du devoir</Label>
                <Select
                  name="statutDevoir"
                  defaultValue={selectedDevoir?.statutDevoir || "A_FAIRE"}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NON_FAIT">À faire</SelectItem>
                    <SelectItem value="FAIT">Fait</SelectItem>
                    <SelectItem value="ANNULE">Annulé</SelectItem>
                  </SelectContent>
                </Select>
                {formFieldErrors.statutDevoir && (
                  <p className="text-red-500 text-sm">
                    {formFieldErrors.statutDevoir}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDevoirDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : selectedDevoir ? (
                  "Mettre à jour"
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

export default EditEdt;
