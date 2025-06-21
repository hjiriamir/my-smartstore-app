"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bell, CheckCircle, Clock, TrendingUp, Package, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PlanogramLibrary from "../../components/front-office/planogram-library"
import Visualization2D3D from "../../components/front-office/visualization-2d-3d"
import ImplementationTracking from "../../components/front-office/implementation-tracking"
import Communication from "../../components/front-office/communication"
import ProductSearch from "../../components/front-office/product-search"
import TrainingSupport from "../../components/front-office/training-support"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import './page.css'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [magasin, setMagasin] = useState("Chargement...") // État pour stocker le nom du magasin
  const [userId, setUserId] = useState(null) // État pour stocker l'ID de l'utilisateur
  const { toast } = useToast()
    
const [magasinId, setMagasinId] = useState<number | null>(null);
const [dashboardStats, setDashboardStats] = useState({
  pendingTasks: 0,
  completedToday: 0,
  totalPlanograms: 0,
  implementationRate: 0,
});

 /* const recentPlanograms = [
    {
      id: 1,
      name: "Rayon Épicerie Salée",
      category: "Épicerie",
      status: "À implémenter",
      priority: "Haute",
      dueDate: "2024-01-20",
    },
    {
      id: 2,
      name: "Produits Laitiers",
      category: "Frais",
      status: "En cours",
      priority: "Moyenne",
      dueDate: "2024-01-22",
    },
    {
      id: 3,
      name: "Boissons Chaudes",
      category: "Épicerie",
      status: "Terminé",
      priority: "Basse",
      dueDate: "2024-01-18",
    },
  ]*/
  interface MagasinResponse {
    magasin_id: number;
    nom_magasin: string;
    
  }
  interface Planogram {
    id: number;
    planogram_id: number;
    name: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
  }
  const [recentPlanograms, setRecentPlanograms] = useState<Planogram[]>([]);

  interface Notification {
    id: number;
    Utilisateur_id: number;
    type: string;
    contenu: string;
    date_envoi: string;
    lu: boolean;
  }
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token non trouvé");
  
      const response = await axios.get(
        `http://localhost:8081/api/notification/getNotificationsByUser/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive",
      });
    }
  };
  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token non trouvé");
  
      await axios.patch(
        `http://localhost:8081/api/notification/markAsRead/${notificationId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // Mettre à jour l'état local
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? {...notif, lu: true} : notif
      ));
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue",
        variant: "destructive",
      });
    }
  };
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Si c'est aujourd'hui, on affiche seulement l'heure
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    // Si c'est hier
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Hier à ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
    
    // Sinon, on affiche la date complète
    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  

  const fetchRecentPlanograms = async (magasinId: string, userId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token non trouvé");
  
      const response = await axios.get(
        `http://localhost:8081/api/planogram/planogramsRecent/${magasinId}/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // Prendre seulement les 3 premiers éléments
      const recentData = response.data.slice(0, 3);
      
      const formattedPlanograms: Planogram[] = recentData.map((item: any) => ({
        id: item.id,
        planogram_id: item.planogram.planogram_id,
        name: item.planogram.nom,
        description: item.planogram.description,
        status: item.statut === "à faire" ? "À implémenter" : 
                item.statut === "en cours" ? "En cours" : "Terminé",
        priority: item.priorite,
        dueDate: item.date_fin_prevue,
      }));
  
      setRecentPlanograms(formattedPlanograms);
    } catch (error) {
      console.error("Erreur lors de la récupération des planogrammes récents:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les planogrammes récents",
        variant: "destructive",
      });
    }
  };

 // Récupérer l'utilisateur connecté
 useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      // 1. Vérifiez d'abord si le token existe
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Aucun token d'authentification trouvé");
      }

      // 2. Faites la requête avec les headers appropriés
      const response = await fetch("http://localhost:8081/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include"
      });

      // 3. Vérifiez le statut de la réponse
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la récupération des données");
      }

      // 4. Analysez la réponse
      const data = await response.json();
      console.log("Réponse complète de /api/auth/me:", data);

      // 5. Récupérez l'ID selon différentes structures possibles
      const userId = data.user?.idUtilisateur; 
      
      if (!userId) {
        throw new Error("ID utilisateur non trouvé dans la réponse");
      }

      setUserId(userId);
      console.log("ID utilisateur confirmé:", userId);
      return userId;

    } catch (error) {
      console.error("Erreur détaillée:", error);
      toast({
        title: "Erreur d'authentification",
        //description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  fetchCurrentUser();
}, [toast]);


const fetchMagasinData = async (userId: number): Promise<string | null> => {
  console.log("Début de fetchMagasinData - userId:", userId);
  
  if (!userId) {
    console.warn("Aucun userId fourni à fetchMagasinData");
    return null;
  }
  
  try {
    console.log("Tentative de récupération du magasin pour userId:", userId);
    
    const response = await axios.get<MagasinResponse>(
      `http://localhost:8081/api/magasins/getMagasinByUser/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    
    console.log("Réponse de l'API magasin:", response.data);
    
    if (response.data?.nom_magasin && response.data?.magasin_id) {
      console.log("Nom du magasin trouvé:", response.data.nom_magasin);
      setMagasin(response.data.nom_magasin);
      setMagasinId(response.data.magasin_id);
      return response.data.magasin_id.toString(); // Retourne l'ID comme string
    } else {
      const errorMsg = "Données du magasin incomplètes dans la réponse";
      console.warn(errorMsg, response.data);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error("Erreur dans fetchMagasinData:", error);
    setMagasin("Non disponible");
    toast({
      title: "Erreur",
      description: "Impossible de récupérer les informations du magasin",
      variant: "destructive",
    });
    return null;
  }
};

const fetchDashboardStats = async (magasinId: string, userId: number) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token non trouvé");

    const headers = { Authorization: `Bearer ${token}` };

    const [pendingRes, completedRes, planogramsRes, implementationRes] = await Promise.all([
      axios.get(`http://localhost:8081/api/taches/tachesEnAttente/${magasinId}/${userId}`, { headers }),
      axios.get(`http://localhost:8081/api/taches/tachesTermine/${magasinId}/${userId}`, { headers }),
      axios.get(`http://localhost:8081/api/planogram/getPlanogramsByMagasin/${magasinId}/${userId}`, { headers }),
      axios.get(`http://localhost:8081/api/planogram/tauxImplementation/${magasinId}/${userId}`, { headers })
    ]);

    console.log("Réponses API:", {
      pending: pendingRes.data,
      completed: completedRes.data,
      planograms: planogramsRes.data,
      implementation: implementationRes.data
    });

    // Extraction des données
    const pendingTasks = pendingRes.data.count || pendingRes.data.rows?.length || 0;
    const completedToday = completedRes.data.count || completedRes.data.rows?.length || 0;
    const totalPlanograms = planogramsRes.data.count || planogramsRes.data.rows?.length || 0;
    
    let implementationRate = 0;
    if (typeof implementationRes.data.taux_implementation === 'string') {
      implementationRate = parseFloat(implementationRes.data.taux_implementation);
    } else if (typeof implementationRes.data.taux === 'number') {
      implementationRate = implementationRes.data.taux;
    } else if (implementationRes.data.planograms_implementes && implementationRes.data.total_planograms) {
      implementationRate = (implementationRes.data.planograms_implementes / implementationRes.data.total_planograms) * 100;
    }

    console.log("Statistiques calculées:", {
      pendingTasks,
      completedToday,
      totalPlanograms,
      implementationRate
    });

    setDashboardStats({
      pendingTasks,
      completedToday,
      totalPlanograms,
      implementationRate
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    toast({
      title: "Erreur",
      description: "Impossible de charger les statistiques du tableau de bord",
      variant: "destructive",
    });
  }
};

  // Effet pour charger les données au montage du composant
  useEffect(() => {
    console.log("useEffect déclenché - userId actuel:", userId);
    
    const loadData = async () => {
      console.log("Début de loadData - userId:", userId);
      if (userId) {
        console.log("Appel à fetchMagasinData avec userId:", userId);
        const magasinId = await fetchMagasinData(userId);
        if (magasinId && userId) {
          await fetchDashboardStats(magasinId.toString(), userId);
          await fetchRecentPlanograms(magasinId.toString(), userId);
          await fetchNotifications(userId); // Ajout de cette ligne
        }
      } else {
        console.log("userId non disponible - pas d'appel à fetchMagasinData");
      }
    };
    
    loadData().catch(error => {
      console.error("Erreur dans loadData:", error);
    });
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-50 mt-14">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Smart Store</h1>
            </div>
            <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                {notifications.filter(n => !n.lu).length}
              </Badge>
            </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">Magasin : {magasin}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="library">Bibliothèque</TabsTrigger>
            <TabsTrigger value="visualization">Visualisation</TabsTrigger>
            <TabsTrigger value="tracking">Suivi</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="search">Recherche</TabsTrigger>
            <TabsTrigger value="support">Support / Gestion Compte</TabsTrigger>
          </TabsList>

          {/* Tableau de bord d'accueil */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tâches en attente</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.pendingTasks}</div>
                  <p className="text-xs text-muted-foreground">À traiter</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Terminées aujourd'hui</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{dashboardStats.completedToday}</div>
                  <p className="text-xs text-muted-foreground">+12% par rapport à hier</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total planogrammes</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalPlanograms}</div>
                  <p className="text-xs text-muted-foreground">Actifs ce mois</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taux d'implémentation</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold text-blue-600">
  {Math.round(dashboardStats.implementationRate)}%
</div>
<Progress value={dashboardStats.implementationRate} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Planogrammes récents */}
              <Card>
              <CardHeader>
                <CardTitle>Planogrammes récents</CardTitle>
                <CardDescription>Dernières publications pour votre magasin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto"> {/* Ajout de max-h-96 et overflow-y-auto */}
                  {recentPlanograms.map((planogram) => (
                    <div key={planogram.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{planogram.name}</h4>
                        <p className="text-sm text-muted-foreground">{planogram.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            planogram.status === "Terminé"
                              ? "default"
                              : planogram.status === "En cours"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {planogram.status}
                        </Badge>
                        <Badge variant="outline">{planogram.priority}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
              {/* Notifications */}
              <Card>
  <CardHeader>
    <CardTitle>Notifications</CardTitle>
    <CardDescription>Alertes et mises à jour importantes</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              !notification.lu ? "bg-blue-50 border-blue-200" : ""
            }`}
            onClick={() => markAsRead(notification.id)}
          >
            <div
              className={`w-2 h-2 rounded-full mt-2 ${
                !notification.lu 
                  ? "bg-blue-500 animate-pulse" 
                  : "bg-gray-300"
              }`}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {notification.type === "nouveau planogramme" && "Nouveau planogramme"}
                {notification.type === "confirmation requise" && "Confirmation requise"}
                {notification.type === "retard" && "Retard détecté"}
              </p>
              <p className="text-sm">{notification.contenu}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatNotificationDate(notification.date_envoi)}
              </p>
            </div>
            {!notification.lu && (
              <span className="text-xs text-blue-500">Nouveau</span>
            )}
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucune notification pour le moment
        </p>
      )}
    </div>
  </CardContent>
</Card>
            </div>

            
          </TabsContent>

          <TabsContent value="library">
            <PlanogramLibrary />
          </TabsContent>

          <TabsContent value="visualization">
            <Visualization2D3D />
          </TabsContent>

          <TabsContent value="tracking">
            <ImplementationTracking />
          </TabsContent>

          <TabsContent value="communication">
            <Communication />
          </TabsContent>

          <TabsContent value="search">
            <ProductSearch />
          </TabsContent>

          <TabsContent value="support">
            <TrainingSupport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
