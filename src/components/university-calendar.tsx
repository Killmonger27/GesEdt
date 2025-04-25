import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core";
import {
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Calendar as CalendarIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";

// Types
interface Resource {
  id: string;
  title: string;
  capacity: number;
  building: string;
}

interface Teacher {
  id: string;
  name: string;
  department: string;
}

interface CalendarEvent extends EventInput {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  resourceId: string;
  enseignantId: string;
  filiere: string;
  typeCours: string;
  color?: string;
}

type CourseType = "CM" | "TD" | "TP" | "Exam";
type TimeSlot = "morning" | "afternoon";

// Mock data pour les ressources (salles)
const mockResources: Resource[] = [
  { id: "A101", title: "Amphi 101", capacity: 120, building: "Bâtiment A" },
  { id: "B201", title: "Salle B201", capacity: 30, building: "Bâtiment B" },
  { id: "C301", title: "Salle TP C301", capacity: 20, building: "Bâtiment C" },
  { id: "D102", title: "Salle D102", capacity: 40, building: "Bâtiment D" },
];

// Mock data pour les enseignants
const mockTeachers: Teacher[] = [
  { id: "prof1", name: "Pr. Martin", department: "Informatique" },
  { id: "prof2", name: "Dr. Leroy", department: "Mathématiques" },
  { id: "prof3", name: "Mme. Dubois", department: "Physique" },
];

// Mock data pour les filières (au lieu des groupes)
const mockFilieres: string[] = [
  "L1 Informatique",
  "L2 Informatique",
  "L3 Informatique",
  "M1 Informatique",
  "M2 Informatique",
  "L1 Mathématiques",
  "L2 Mathématiques",
  "L3 Mathématiques",
  "M1 Mathématiques",
  "M2 Mathématiques",
  "L1 Physique",
  "L2 Physique",
  "L3 Physique",
  "M1 Physique",
  "M2 Physique",
];

// Mock data pour les types de cours
const courseTypes: CourseType[] = ["CM", "TD", "TP", "Exam"];

// Couleurs par type de cours
const courseTypeColors: Record<CourseType, string> = {
  CM: "#3b82f6", // blue-500
  TD: "#10b981", // emerald-500
  TP: "#6366f1", // indigo-500
  Exam: "#ef4444", // red-500
};

// Créneaux horaires fixes
const timeSlots: Record<TimeSlot, { start: string; end: string }> = {
  morning: { start: "07:00:00", end: "12:00:00" },
  afternoon: { start: "14:00:00", end: "18:00:00" },
};

// Mock data pour les événements
const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Algorithmique",
    start: "2023-09-04T07:00:00",
    end: "2023-09-04T12:00:00",
    resourceId: "A101",
    enseignantId: "prof1",
    filiere: "L3 Informatique",
    typeCours: "CM",
    color: courseTypeColors.CM,
  },
  {
    id: "2",
    title: "Mathématiques Discrètes",
    start: "2023-09-04T14:00:00",
    end: "2023-09-04T18:00:00",
    resourceId: "B201",
    enseignantId: "prof2",
    filiere: "L2 Mathématiques",
    typeCours: "TD",
    color: courseTypeColors.TD,
  },
  {
    id: "3",
    title: "Physique Quantique",
    start: "2023-09-05T07:00:00",
    end: "2023-09-05T12:00:00",
    resourceId: "C301",
    enseignantId: "prof3",
    filiere: "M1 Physique",
    typeCours: "TP",
    color: courseTypeColors.TP,
  },
];

const UniversityCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [resources] = useState<Resource[]>(mockResources);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [currentEvent, setCurrentEvent] =
    useState<Partial<CalendarEvent> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedFiliere, setSelectedFiliere] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | "">("");

  // Filtrer les événements par filière
  const filteredEvents = selectedFiliere
    ? events.filter((event) => event.filiere === selectedFiliere)
    : events;

  const handleEventClick = (info: EventClickArg) => {
    setCurrentEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      resourceId: info.event.getResources()[0]?.id,
      enseignantId: info.event.extendedProps.enseignantId,
      filiere: info.event.extendedProps.filiere,
      typeCours: info.event.extendedProps.typeCours,
    });
    setOpenDialog(true);
  };

  const handleSelect = (info: DateSelectArg) => {
    // Déterminer le créneau horaire en fonction de l'heure sélectionnée
    const selectedDate = new Date(info.start);
    const selectedHour = selectedDate.getHours();

    const startTime: Date = new Date(selectedDate);
    const endTime: Date = new Date(selectedDate);

    // Ajuster à l'un des deux créneaux fixes
    if (selectedHour < 12) {
      // Créneau du matin
      startTime.setHours(7, 0, 0, 0);
      endTime.setHours(12, 0, 0, 0);
      setSelectedTimeSlot("morning");
    } else {
      // Créneau de l'après-midi
      startTime.setHours(14, 0, 0, 0);
      endTime.setHours(18, 0, 0, 0);
      setSelectedTimeSlot("afternoon");
    }

    setCurrentEvent({
      start: startTime,
      end: endTime,
      resourceId: info.resource?.id || "",
      title: "",
      enseignantId: "",
      filiere: "",
      typeCours: "CM" as CourseType,
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!currentEvent?.title?.trim()) {
      errors.title = "Le titre du cours est requis";
      isValid = false;
    }

    if (!currentEvent?.resourceId) {
      errors.resourceId = "Veuillez sélectionner une salle";
      isValid = false;
    }

    if (!currentEvent?.enseignantId) {
      errors.enseignantId = "Veuillez sélectionner un enseignant";
      isValid = false;
    }

    if (!currentEvent?.filiere) {
      errors.filiere = "Veuillez sélectionner une filière";
      isValid = false;
    }

    if (!currentEvent?.typeCours) {
      errors.typeCours = "Veuillez sélectionner un type de cours";
      isValid = false;
    }

    // Vérifier qu'un créneau horaire est sélectionné
    if (!selectedTimeSlot) {
      errors.timeSlot = "Veuillez sélectionner un créneau horaire";
      isValid = false;
    }

    // Vérification de la disponibilité (pas de chevauchement pour la même filière et le même jour)
    if (currentEvent?.start && currentEvent?.filiere) {
      const startDate = new Date(currentEvent.start);
      const conflictingEvent = events.find((event) => {
        // Ignorer l'événement actuel lors de la modification
        if (event.id === currentEvent.id) return false;

        const eventDate = new Date(event.start);
        return (
          event.filiere === currentEvent.filiere &&
          eventDate.getDate() === startDate.getDate() &&
          eventDate.getMonth() === startDate.getMonth() &&
          eventDate.getFullYear() === startDate.getFullYear() &&
          ((selectedTimeSlot === "morning" &&
            event.start.toString().includes("07:00:00")) ||
            (selectedTimeSlot === "afternoon" &&
              event.start.toString().includes("14:00:00")))
        );
      });

      if (conflictingEvent) {
        errors.conflict = `Cette filière a déjà un cours programmé sur ce créneau: ${conflictingEvent.title}`;
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSaveEvent = () => {
    if (!validateForm() || !currentEvent) return;

    try {
      // Ajuster les heures de début et fin selon le créneau sélectionné
      const startDate = new Date(currentEvent.start as Date);
      const endDate = new Date(currentEvent.end as Date);

      if (selectedTimeSlot === "morning") {
        startDate.setHours(7, 0, 0, 0);
        endDate.setHours(12, 0, 0, 0);
      } else {
        startDate.setHours(14, 0, 0, 0);
        endDate.setHours(18, 0, 0, 0);
      }

      const updatedEvent = {
        ...currentEvent,
        start: startDate,
        end: endDate,
        color: courseTypeColors[currentEvent.typeCours as CourseType],
      };

      if (currentEvent.id) {
        // Mise à jour d'un événement existant
        setEvents(
          events.map((e) =>
            e.id === currentEvent.id ? (updatedEvent as CalendarEvent) : e
          )
        );
        toast.success("Cours mis à jour avec succès", {
          duration: 3000,
        });
      } else {
        // Création d'un nouvel événement
        const newEvent: CalendarEvent = {
          ...(updatedEvent as CalendarEvent),
          id: `event-${Date.now()}`,
        };
        setEvents([...events, newEvent]);
        toast.success("Nouveau cours ajouté avec succès", {
          duration: 3000,
        });
      }
      setOpenDialog(false);
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'enregistrement:" + error, {
        duration: 3000,
      });
    }
  };

  const handleDeleteClick = () => {
    setOpenDialog(false);
    setOpenDeleteDialog(true);
  };

  const handleDeleteEvent = () => {
    if (!currentEvent?.id) return;

    setEvents(events.filter((e) => e.id !== currentEvent.id));
    setOpenDeleteDialog(false);
    toast.success("Cours supprimé avec succès", {
      duration: 3000,
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simuler une actualisation depuis un serveur
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Emploi du temps actualisé", {
        duration: 3000,
      });
    }, 1000);
  };

  const formatDateForInput = (date: Date | string): string => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  const handleTimeSlotChange = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    if (!currentEvent) return;

    const startDate = new Date(currentEvent.start || new Date());
    const endDate = new Date(startDate);

    if (slot === "morning") {
      startDate.setHours(7, 0, 0, 0);
      endDate.setHours(12, 0, 0, 0);
    } else {
      startDate.setHours(14, 0, 0, 0);
      endDate.setHours(18, 0, 0, 0);
    }

    setCurrentEvent({
      ...currentEvent,
      start: startDate,
      end: endDate,
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* En-tête et boutons d'action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Emploi du temps par filière</h1>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              {isRefreshing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Actualiser
            </Button>

            <Button
              onClick={() => {
                const now = new Date();
                // Déterminer si nous sommes dans le créneau du matin ou de l'après-midi
                const hour = now.getHours();
                const startTime = new Date(now);
                const endTime = new Date(now);
                let timeSlot: TimeSlot = "morning";

                if (hour >= 12) {
                  timeSlot = "afternoon";
                  startTime.setHours(14, 0, 0, 0);
                  endTime.setHours(18, 0, 0, 0);
                } else {
                  startTime.setHours(7, 0, 0, 0);
                  endTime.setHours(12, 0, 0, 0);
                }

                setSelectedTimeSlot(timeSlot);
                setCurrentEvent({
                  title: "",
                  resourceId: "",
                  enseignantId: "",
                  filiere: "",
                  typeCours: "CM",
                  start: startTime,
                  end: endTime,
                });
                setFormErrors({});
                setOpenDialog(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter un cours
            </Button>
          </div>
        </div>

        {/* Sélecteur de filière */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="filiere-filter" className="min-w-fit">
                Filtrer par filière:
              </Label>
              <Select
                value={selectedFiliere}
                onValueChange={setSelectedFiliere}
              >
                <SelectTrigger id="filiere-filter" className="w-full">
                  <SelectValue placeholder="Toutes les filières" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les filières</SelectItem>
                  {mockFilieres.map((filiere) => (
                    <SelectItem key={filiere} value={filiere}>
                      {filiere}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Informations sur les créneaux */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-blue-700">
              <CalendarIcon className="h-5 w-5" />
              <span className="font-medium">Créneaux de cours : </span>
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-800 border-blue-300"
              >
                Matin: 7h-12h
              </Badge>
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-800 border-blue-300"
              >
                Après-midi: 14h-18h
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Composant FullCalendar */}
        <Card>
          <CardContent className="pt-6">
            <FullCalendar
              plugins={[
                resourceTimelinePlugin,
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
              ]}
              initialView="resourceTimelineWeek"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right:
                  "dayGridMonth,timeGridWeek,resourceTimelineWeek,timeGridDay",
              }}
              locale={frLocale}
              nowIndicator={true}
              editable={false} // Désactivé pour empêcher le redimensionnement qui casserait les créneaux fixes
              selectable={true}
              resources={resources}
              events={filteredEvents}
              eventClick={handleEventClick}
              select={handleSelect}
              resourceAreaHeaderContent="Salles"
              resourceAreaWidth="200px"
              resourceGroupField="building"
              slotMinTime="07:00:00"
              slotMaxTime="18:00:00"
              slotDuration="01:00:00"
              height="auto"
              // Ajout de la pause déjeuner
              businessHours={[
                {
                  daysOfWeek: [1, 2, 3, 4, 5],
                  startTime: "07:00",
                  endTime: "12:00",
                },
                {
                  daysOfWeek: [1, 2, 3, 4, 5],
                  startTime: "14:00",
                  endTime: "18:00",
                },
              ]}
              // Grisage des créneaux hors plage
              selectConstraint="businessHours"
              eventConstraint="businessHours"
              eventContent={(eventInfo) => {
                return (
                  <div className="p-1">
                    <div className="font-bold">{eventInfo.event.title}</div>
                    <div className="text-xs">
                      {eventInfo.event.extendedProps.filiere}
                    </div>
                    <div className="text-xs">
                      {
                        mockTeachers.find(
                          (t) =>
                            t.id === eventInfo.event.extendedProps.enseignantId
                        )?.name
                      }
                    </div>
                  </div>
                );
              }}
            />
          </CardContent>
        </Card>

        {/* Légende des types de cours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Légende des types de cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(courseTypeColors).map(([type, color]) => (
                  <Badge
                    key={type}
                    style={{ backgroundColor: color, color: "#fff" }}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Statistiques des cours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">Total des cours :</p>
                  <p className="text-lg font-bold">{filteredEvents.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Filières :</p>
                  <p className="text-lg font-bold">
                    {selectedFiliere
                      ? 1
                      : [...new Set(events.map((e) => e.filiere))].length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogue d'ajout/modification */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentEvent?.id
                ? "Modifier le cours"
                : "Ajouter un nouveau cours"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-1">
                Titre du cours
                {formErrors.title && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>
              <Input
                id="title"
                value={currentEvent?.title || ""}
                onChange={(e) =>
                  setCurrentEvent({ ...currentEvent, title: e.target.value })
                }
                className={formErrors.title ? "border-red-500" : ""}
              />
              {formErrors.title && (
                <p className="text-red-500 text-xs">{formErrors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date du cours</Label>
              <Input
                id="date"
                type="date"
                value={
                  currentEvent?.start
                    ? new Date(currentEvent.start).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  const currentStartDate = new Date(
                    currentEvent?.start || new Date()
                  );
                  const currentEndDate = new Date(
                    currentEvent?.end || new Date()
                  );

                  // Préserver les heures mais changer la date
                  const newStartDate = new Date(date);
                  newStartDate.setHours(
                    currentStartDate.getHours(),
                    currentStartDate.getMinutes(),
                    0,
                    0
                  );

                  const newEndDate = new Date(date);
                  newEndDate.setHours(
                    currentEndDate.getHours(),
                    currentEndDate.getMinutes(),
                    0,
                    0
                  );

                  setCurrentEvent({
                    ...currentEvent,
                    start: newStartDate,
                    end: newEndDate,
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeSlot" className="flex items-center gap-1">
                Créneau horaire
                {formErrors.timeSlot && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={
                    selectedTimeSlot === "morning" ? "default" : "outline"
                  }
                  onClick={() => handleTimeSlotChange("morning")}
                  className={`text-center ${
                    formErrors.timeSlot ? "border-red-500" : ""
                  }`}
                >
                  Matin (7h-12h)
                </Button>
                <Button
                  type="button"
                  variant={
                    selectedTimeSlot === "afternoon" ? "default" : "outline"
                  }
                  onClick={() => handleTimeSlotChange("afternoon")}
                  className={`text-center ${
                    formErrors.timeSlot ? "border-red-500" : ""
                  }`}
                >
                  Après-midi (14h-18h)
                </Button>
              </div>
              {formErrors.timeSlot && (
                <p className="text-red-500 text-xs">{formErrors.timeSlot}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salle" className="flex items-center gap-1">
                Salle
                {formErrors.resourceId && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>
              <Select
                value={currentEvent?.resourceId || ""}
                onValueChange={(value) =>
                  setCurrentEvent({ ...currentEvent, resourceId: value })
                }
              >
                <SelectTrigger
                  className={formErrors.resourceId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Sélectionner une salle" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.title} ({resource.building})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.resourceId && (
                <p className="text-red-500 text-xs">{formErrors.resourceId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="enseignant" className="flex items-center gap-1">
                Enseignant
                {formErrors.enseignantId && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>
              <Select
                value={currentEvent?.enseignantId || ""}
                onValueChange={(value) =>
                  setCurrentEvent({ ...currentEvent, enseignantId: value })
                }
              >
                <SelectTrigger
                  className={formErrors.enseignantId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Sélectionner un enseignant" />
                </SelectTrigger>
                <SelectContent>
                  {mockTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.enseignantId && (
                <p className="text-red-500 text-xs">
                  {formErrors.enseignantId}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="filiere" className="flex items-center gap-1">
                Filière
                {formErrors.filiere && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>
              <Select
                value={currentEvent?.filiere || ""}
                onValueChange={(value) =>
                  setCurrentEvent({ ...currentEvent, filiere: value })
                }
              >
                <SelectTrigger
                  className={formErrors.filiere ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Sélectionner une filière" />
                </SelectTrigger>
                <SelectContent>
                  {mockFilieres.map((filiere) => (
                    <SelectItem key={filiere} value={filiere}>
                      {filiere}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.filiere && (
                <p className="text-red-500 text-xs">{formErrors.filiere}</p>
              )}
              {formErrors.conflict && (
                <p className="text-red-500 text-xs">{formErrors.conflict}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeCours" className="flex items-center gap-1">
                Type de cours
                {formErrors.typeCours && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>
              <Select
                value={currentEvent?.typeCours || ""}
                onValueChange={(value) =>
                  setCurrentEvent({ ...currentEvent, typeCours: value })
                }
              >
                <SelectTrigger
                  className={formErrors.typeCours ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Sélectionner un type de cours" />
                </SelectTrigger>
                <SelectContent>
                  {courseTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.typeCours && (
                <p className="text-red-500 text-xs">{formErrors.typeCours}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <div>
              {currentEvent?.id && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenDialog(false)}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEvent}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation de suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce cours ? Cette action ne peut
              pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Statistiques détaillées et rapports */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Statistiques et rapports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Distribution par type de cours */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Distribution par type de cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {courseTypes.map((type) => {
                  const count = filteredEvents.filter(
                    (e) => e.typeCours === type
                  ).length;
                  const percentage =
                    filteredEvents.length > 0
                      ? Math.round((count / filteredEvents.length) * 100)
                      : 0;

                  return (
                    <div key={type} className="flex items-center gap-2">
                      <Badge
                        style={{
                          backgroundColor: courseTypeColors[type],
                          color: "#fff",
                          minWidth: "40px",
                        }}
                      >
                        {type}
                      </Badge>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: courseTypeColors[type],
                          }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">
                        {count} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Distribution par salle */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Utilisation des salles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {resources.map((resource) => {
                  const count = filteredEvents.filter(
                    (e) => e.resourceId === resource.id
                  ).length;
                  const maxCapacity =
                    mockResources.find((r) => r.id === resource.id)?.capacity ||
                    0;

                  return (
                    <div key={resource.id} className="flex flex-col">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{resource.title}</span>
                        <span className="font-medium">{count} cours</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{
                            width: `${Math.min(100, (count / 10) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Charge des enseignants */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Charge des enseignants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTeachers.map((teacher) => {
                  const courses = filteredEvents.filter(
                    (e) => e.enseignantId === teacher.id
                  );
                  const count = courses.length;
                  const hoursTotal = count * 5; // Chaque cours fait 5 heures (soit matin soit après-midi)

                  return (
                    <div key={teacher.id} className="flex flex-col">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{teacher.name}</span>
                        <span className="font-medium">{hoursTotal}h</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-green-600"
                          style={{
                            width: `${Math.min(100, (hoursTotal / 20) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calendrier hebdomadaire compact */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Vue hebdomadaire compacte</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-5 gap-2">
              {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"].map(
                (day, index) => (
                  <div key={day} className="flex flex-col">
                    <h3 className="text-center font-medium mb-2 bg-gray-100 py-1 rounded">
                      {day}
                    </h3>
                    <div className="flex flex-col gap-1">
                      <div className="border rounded p-2 bg-gray-50">
                        <p className="text-xs font-medium text-center mb-1">
                          Matin
                        </p>
                        <div className="min-h-24 flex flex-col gap-1">
                          {filteredEvents
                            .filter((event) => {
                              const eventDate = new Date(event.start);
                              return (
                                eventDate.getDay() === index + 1 &&
                                eventDate.getHours() === 7
                              );
                            })
                            .map((event) => (
                              <div
                                key={event.id}
                                className="text-xs p-1 rounded truncate"
                                style={{
                                  backgroundColor: event.color,
                                  color: "white",
                                }}
                              >
                                <p className="font-bold truncate">
                                  {event.title}
                                </p>
                                <p className="truncate">{event.filiere}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div className="border rounded p-2 bg-gray-50">
                        <p className="text-xs font-medium text-center mb-1">
                          Après-midi
                        </p>
                        <div className="min-h-24 flex flex-col gap-1">
                          {filteredEvents
                            .filter((event) => {
                              const eventDate = new Date(event.start);
                              return (
                                eventDate.getDay() === index + 1 &&
                                eventDate.getHours() === 14
                              );
                            })
                            .map((event) => (
                              <div
                                key={event.id}
                                className="text-xs p-1 rounded truncate"
                                style={{
                                  backgroundColor: event.color,
                                  color: "white",
                                }}
                              >
                                <p className="font-bold truncate">
                                  {event.title}
                                </p>
                                <p className="truncate">{event.filiere}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UniversityCalendar;
