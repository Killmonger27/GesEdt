import { useState, useEffect } from "react";
import {
  Calendar,
  BarChart3,
  Users,
  BookOpen,
  Clock,
  School,
  HomeIcon,
  GraduationCap,
  Bell,
  DoorClosed,
  MessageSquare,
  Settings,
  Plus,
  Activity,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  Loader2,
  Eye,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("semaine");
  const [stats, setStats] = useState({
    utilisateurs: 0,
    salles: 0,
    modules: 0,
    filieres: 0,
    coursAujourdhui: 0,
    tauxOccupation: 0,
  });
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Simuler le chargement des données
  useEffect(() => {
    // Simulation d'un appel API
    setTimeout(() => {
      setStats({
        utilisateurs: 248,
        salles: 24,
        modules: 56,
        filieres: 12,
        coursAujourdhui: 18,
        tauxOccupation: 78,
      });

      setEvents([
        {
          id: "evt1",
          title: "Cours Mathématiques",
          module: "Analyse Numérique",
          enseignant: "Dr. Samba Diop",
          salle: "Salle 102",
          filiere: "Informatique L2",
          debut: "08:00",
          fin: "10:00",
          statut: "en_cours",
        },
        {
          id: "evt2",
          title: "TD Programmation",
          module: "Algorithmique",
          enseignant: "Prof. Marie Faye",
          salle: "Labo Info 3",
          filiere: "Informatique L1",
          debut: "10:15",
          fin: "12:15",
          statut: "a_venir",
        },
        {
          id: "evt3",
          title: "Examen Bases de données",
          module: "SGBD",
          enseignant: "Dr. Ahmed Ndiaye",
          salle: "Amphi A",
          filiere: "Informatique L3",
          debut: "14:00",
          fin: "16:00",
          statut: "a_venir",
        },
        {
          id: "evt4",
          title: "Cours Réseaux",
          module: "Architecture réseau",
          enseignant: "Prof. David Sarr",
          salle: "Salle 205",
          filiere: "Télécom M1",
          debut: "16:15",
          fin: "18:15",
          statut: "a_venir",
        },
      ]);

      setNotifications([
        {
          id: "notif1",
          type: "info",
          message: "3 nouveaux enseignants ont été ajoutés",
          time: "Il y a 10 minutes",
        },
        {
          id: "notif2",
          type: "warning",
          message: "Conflit d'emploi du temps détecté pour la salle 104",
          time: "Il y a 30 minutes",
        },
        {
          id: "notif3",
          type: "success",
          message: "Emploi du temps Informatique L3 publié",
          time: "Il y a 1 heure",
        },
        {
          id: "notif4",
          type: "error",
          message: "Échec de l'attribution automatique - salles insuffisantes",
          time: "Il y a 2 heures",
        },
      ]);

      setIsLoading(false);
    }, 1500);
  }, []);

  const getStatusIcon = (type) => {
    switch (type) {
      case "info":
        return <Bell className="h-4 w-4 text-blue-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "success":
        return <Check className="h-4 w-4 text-green-500" />;
      case "error":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "en_cours":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            En cours
          </Badge>
        );
      case "a_venir":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            À venir
          </Badge>
        );
      case "termine":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            Terminé
          </Badge>
        );
      case "annule":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Annulé
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            Non défini
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Chargement du tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue dans votre système de gestion d'emploi du temps
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau cours
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.utilisateurs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.utilisateurs > 200
                ? "Grande institution"
                : "Institution moyenne"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Salles</CardTitle>
            <DoorClosed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.salles}</div>
            <div className="flex items-center pt-1">
              <p className="text-xs text-muted-foreground">
                Taux d'occupation: {stats.tauxOccupation}%
              </p>
            </div>
            <Progress className="mt-2" value={stats.tauxOccupation} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.modules}</div>
            <p className="text-xs text-muted-foreground">
              Répartis sur {stats.filieres} filières
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Cours aujourd'hui
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursAujourdhui}</div>
            <p className="text-xs text-muted-foreground">
              {stats.coursAujourdhui > 15
                ? "Journée chargée"
                : "Journée normale"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emploi du temps et statistiques */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Emploi du temps</CardTitle>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sélectionner période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aujourdhui">Aujourd'hui</SelectItem>
                    <SelectItem value="semaine">Cette semaine</SelectItem>
                    <SelectItem value="mois">Ce mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>
                Vue des cours et activités programmés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cours</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Enseignant
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Salle
                    </TableHead>
                    <TableHead>Horaire</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {event.filiere}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {event.enseignant}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {event.salle}
                      </TableCell>
                      <TableCell>
                        {event.debut} - {event.fin}
                      </TableCell>
                      <TableCell>{getStatusBadge(event.statut)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Voir calendrier complet
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques d'occupation</CardTitle>
              <CardDescription>
                Utilisation des ressources par jour de la semaine
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[200px] w-full flex items-end justify-between gap-2">
                <div className="w-full space-y-1">
                  <div
                    className="bg-primary h-32 rounded-t-md"
                    style={{ opacity: 0.9 }}
                  ></div>
                  <p className="text-xs text-center">Lun</p>
                </div>
                <div className="w-full space-y-1">
                  <div
                    className="bg-primary h-48 rounded-t-md"
                    style={{ opacity: 0.8 }}
                  ></div>
                  <p className="text-xs text-center">Mar</p>
                </div>
                <div className="w-full space-y-1">
                  <div
                    className="bg-primary h-40 rounded-t-md"
                    style={{ opacity: 0.7 }}
                  ></div>
                  <p className="text-xs text-center">Mer</p>
                </div>
                <div className="w-full space-y-1">
                  <div
                    className="bg-primary h-52 rounded-t-md"
                    style={{ opacity: 0.6 }}
                  ></div>
                  <p className="text-xs text-center">Jeu</p>
                </div>
                <div className="w-full space-y-1">
                  <div
                    className="bg-primary h-36 rounded-t-md"
                    style={{ opacity: 0.5 }}
                  ></div>
                  <p className="text-xs text-center">Ven</p>
                </div>
                <div className="w-full space-y-1">
                  <div
                    className="bg-primary h-16 rounded-t-md"
                    style={{ opacity: 0.4 }}
                  ></div>
                  <p className="text-xs text-center">Sam</p>
                </div>
                <div className="w-full space-y-1">
                  <div
                    className="bg-primary h-8 rounded-t-md"
                    style={{ opacity: 0.3 }}
                  ></div>
                  <p className="text-xs text-center">Dim</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications et accès rapides */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications récentes</CardTitle>
              <CardDescription>
                Dernières alertes et informations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-4 rounded-lg border p-3"
                  >
                    <div className="mt-1">
                      {getStatusIcon(notification.type)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.message}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="ghost" className="w-full text-blue-600">
                Voir toutes les notifications
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accès rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  <span>Utilisateurs</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <DoorClosed className="h-6 w-6 mb-2" />
                  <span>Salles</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <BookOpen className="h-6 w-6 mb-2" />
                  <span>Modules</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <School className="h-6 w-6 mb-2" />
                  <span>Filières</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col col-span-2"
                >
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Générer EDT</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Administrateurs en ligne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/api/placeholder/32/32" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">
                      Amadou Diallo
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Admin principal
                    </p>
                  </div>
                  <div className="flex h-2 w-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/api/placeholder/32/32" />
                    <AvatarFallback>MF</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">
                      Marie Faye
                    </p>
                    <p className="text-sm text-muted-foreground">Scolarité</p>
                  </div>
                  <div className="flex h-2 w-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
