"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bell, CheckCircle, Clock, TrendingUp, Package, Users, User, LogOut ,Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PlanogramLibrary from "../../components/front-office/planogram-library"
import Visualization2D3D from "../../components/front-office/visualization-2d-3d"
import ImplementationTracking from "../../components/front-office/implementation-tracking"
import Communication from "../../components/front-office/communication"
import ProductSearch from "../../components/front-office/product-search"
import TrainingSupport from "../../components/front-office/training-support"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"
import dynamic from 'next/dynamic';

import './page.css'

export default function Dashboard() {
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const API_FRONT_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

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
  interface UserData {
    idUtilisateur: number;
    nom: string;
    email: string;
    role: string;
  }
  
  // Dans le composant Dashboard, ajoutez cet état :
  const [userData, setUserData] = useState<UserData | null>(null);


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

// handle logout
const handleLogout = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Erreur",
        description: "Aucun token trouvé",
        variant: "destructive",
      });
      return;
    }

    const response = await axios.get(`${API_BASE_URL}/auth/logout`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });

    if (response.data.Status === "Success") {
      // Supprimer le token du localStorage
      localStorage.removeItem("token");
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });

      // Rediriger vers la page d'accueil (http://localhost:3000/)
      setTimeout(() => {
        window.location.href = `${API_FRONT_URL}/`;
      }, 1500);
    }
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    toast({
      title: "Erreur",
      description: "Une erreur est survenue lors de la déconnexion",
      variant: "destructive",
    });
  }
};



  const fetchNotifications = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token non trouvé");
  
      const response = await axios.get(
        `${API_BASE_URL}/notification/getNotificationsByUser/${userId}`,
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
        `${API_BASE_URL}/notification/markAsRead/${notificationId}`,
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
        `${API_BASE_URL}/planogram/planogramsRecent/${magasinId}/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // Gardez tous les résultats sans .slice(0, 3)
      const formattedPlanograms: Planogram[] = response.data.map((item: any) => ({
        id: item.id,
        planogram_id: item.planogram.planogram_id,
        name: item.planogram.nom,
        description: item.planogram.description,
        status: item.statut === "à faire" ? t("front.dashboard.aImplementer") : 
                item.statut === "en cours" ? "En cours" : "Terminé",
        priority: item.priorite || t("front.dashboard.nonDefinie") ,
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
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Aucun token d'authentification trouvé");
      }
  
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include"
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la récupération des données");
      }
  
      const data = await response.json();
      console.log("Réponse complète de /api/auth/me:", data);
  
      const userData = {
        idUtilisateur: data.user.idUtilisateur,
        nom: data.user.name,
       // prenom: data.user.prenom,
        email: data.user.email,
        role: data.user.role
      };
  
      setUserId(userData.idUtilisateur);
      setUserData(userData);
      console.log("Données utilisateur:", userData);
      return userData.idUtilisateur;
  
    } catch (error) {
      console.error("Erreur détaillée:", error);
      toast({
        title: "Erreur d'authentification",
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
      `${API_BASE_URL}/magasins/getMagasinByUser/${userId}`,
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
      axios.get(`${API_BASE_URL}/taches/tachesEnAttente/${magasinId}/${userId}`, { headers }),
      axios.get(`${API_BASE_URL}/taches/tachesTermine/${magasinId}/${userId}`, { headers }),
      axios.get(`${API_BASE_URL}/planogram/getPlanogramsByMagasin/${magasinId}/${userId}`, { headers }),
      axios.get(`${API_BASE_URL}/planogram/tauxImplementation/${magasinId}/${userId}`, { headers })
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
    const totalPlanograms = planogramsRes.data.length || 0;
    
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
          await fetchNotifications(userId);
        }
      } else {
        console.log("userId non disponible - pas d'appel à fetchMagasinData");
      }
    };
    
    loadData().catch(error => {
      console.error("Erreur dans loadData:", error);
    });
  }, [userId, i18n.language]); // Ajoutez i18n.language comme dépendance

  return (
    <div className="min-h-screen bg-gray-50 mt-14" dir={textDirection}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center h-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Package className={`h-8 w-8 text-blue-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
        <h1 className="text-xl font-semibold text-gray-900">Smart Store</h1>
      </div>
      
      <div className={`flex items-center space-x-6 ${isRTL ? 'space-x-reverse' : ''}`}>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.filter(n => !n.lu).length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
              {notifications.filter(n => !n.lu).length}
            </span>
          )}
        </Button>
        
        <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium">Magasin : {magasin}</span>
        </div>
        
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full w-8 h-8 bg-gray-100 hover:bg-gray-200"
        >
      <User className="h-4 w-4 text-gray-600" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent 
  className="w-56" 
  align={isRTL ? "start" : "end"} 
  forceMount
>
    <DropdownMenuLabel className="font-normal">
      <div className="flex flex-col space-y-1">
        <p className="text-sm font-medium leading-none">
          {userData?.nom}
        </p>
        <p className="text-xs leading-none text-muted-foreground">
          {userData?.email}
        </p>
      </div>
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={() => setActiveTab("support")}>
      <User className="mr-2 h-4 w-4" />
      <span>{t("front.navBar.profil")}</span>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem 
  className="text-red-600 focus:text-red-700 focus:bg-red-50"
  onClick={handleLogout} 
>
  <LogOut className="mr-2 h-4 w-4" />
  <span>{t("front.navBar.deconnexion")}</span>
</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
      </div>
    </div>
  </div>
</header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full grid-cols-7 mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <TabsTrigger value="dashboard">{t("front.navBar.tabledDeBoard")}</TabsTrigger>
            <TabsTrigger value="library">{t("front.navBar.bibliotheque")}</TabsTrigger>
            <TabsTrigger value="visualization">{t("front.navBar.visualisation")}</TabsTrigger>
            <TabsTrigger value="tracking">{t("front.navBar.suivi")}</TabsTrigger>
            <TabsTrigger value="communication">{t("front.navBar.communication")}</TabsTrigger>
            <TabsTrigger value="search">{t("front.navBar.recherche")}</TabsTrigger>
            <TabsTrigger value="support">{t("front.navBar.support")}</TabsTrigger>
          </TabsList>

          {/* Tableau de bord d'accueil */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
              <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{t("front.dashboard.tacheEnAttent")}</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.pendingTasks}</div>
                  <p className="text-xs text-muted-foreground">{t("front.dashboard.aTraiter")}</p>
                </CardContent>
              </Card>

              <Card>
              <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <CardTitle className="text-sm font-medium">{t("front.dashboard.termineAujourd")}</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{dashboardStats.completedToday}</div>
                </CardContent>
              </Card>

              <Card>
              <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <CardTitle className="text-sm font-medium">{t("front.dashboard.totalPlanogram")}</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalPlanograms}</div>
                  <p className="text-xs text-muted-foreground">{t("front.dashboard.actifMois")}</p>
                </CardContent>
              </Card>

              <Card>
              <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <CardTitle className="text-sm font-medium">{t("front.dashboard.tauxImpl")}</CardTitle>
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
    <CardTitle className={isRTL ? 'text-right' : 'text-left'}>{t("front.dashboard.recentPlanogram")}</CardTitle>
    <CardDescription className={isRTL ? 'text-right' : 'text-left'}>{t("front.dashboard.recentPlanogramDesr")}</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="h-[400px] overflow-y-auto"> {/* Conteneur avec hauteur fixe et scroll */}
      <div className="space-y-4 min-h-[300px]"> {/* Conteneur interne pour l'espacement */}
        {recentPlanograms.map((planogram) => (
          <div 
          key={planogram.id} 
          className={`flex items-center justify-between p-3 border rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}
          style={{ minHeight: '80px' }}
        >
            <div className="flex-1">
            <h4 className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
              {planogram.name}
            </h4>
            <p className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
              {planogram.description}
            </p>

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
    </div>
  </CardContent>
</Card>
              {/* Notifications */}
              <Card>
  <CardHeader>
    <CardTitle className={isRTL ? 'text-right' : 'text-left'}>{t("front.dashboard.notif")}</CardTitle>
    <CardDescription className={isRTL ? 'text-right' : 'text-left'}>{t("front.dashboard.notifDescr")}</CardDescription>
  </CardHeader>
  <CardContent>
  <div className="h-[400px] overflow-y-auto">
  <div className="space-y-4 min-h-[300px]"> 

      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              !notification.lu ? "bg-blue-50 border-blue-200" : ""
            } ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}
            onClick={() => markAsRead(notification.id)}
            style={{ minHeight: '80px' }}
          >
            <div
              className={`w-2 h-2 rounded-full mt-2 ${
                !notification.lu 
                  ? "bg-blue-500 animate-pulse" 
                  : "bg-gray-300"
              }`}
            />
            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="text-sm font-medium">
                {notification.type === "nouveau planogramme" && t("front.dashboard.nouvPlanogram")}
                {notification.type === "confirmation requise" && t("front.dashboard.confirmationRequise")}
                {notification.type === "retard" && t("front.dashboard.retardDetecte")}
              </p>
              <p className="text-sm">{notification.contenu}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatNotificationDate(notification.date_envoi)}
              </p>
            </div>

            {!notification.lu && (
              <span className="text-xs text-blue-500">{t("front.dashboard.nouveau")}</span>
            )}
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          {t("front.dashboard.nonNotif")}
        </p>
      )}
    </div>
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
