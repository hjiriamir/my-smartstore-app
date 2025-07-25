import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, MessageSquare, GraduationCap, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"

export function DashboardContent() {

  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [entreprise, setEntreprise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stats data
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [monthlyFormations, setMonthlyFormations] = useState<any[]>([]);
  const [monthlyUsers, setMonthlyUsers] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fonction générique pour fetch avec gestion d'erreur
  const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, options);
      
      // Vérifier si la réponse est du HTML (erreur)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        if (text.startsWith('<!DOCTYPE html>')) {
          throw new Error(`Le serveur a renvoyé une page HTML au lieu de JSON. URL: ${url}`);
        }
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la requête à ${url}:`, error);
      throw error;
    }
  };

  // Fetch current user ID
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token d'authentification manquant");
        }

        const data = await fetchWithErrorHandling(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include"
        });

        const userId = data.user?.idUtilisateur || data.idUtilisateur || data.id;
        setCurrentUserId(userId);
      } catch (error) {
        console.error("Error fetching current user ID:", error);
        setError("Erreur lors de la récupération de l'utilisateur");
      }
    };

    fetchCurrentUserId();
  }, []);

  // Fetch entreprise data when user ID is available
  useEffect(() => {
    if (!currentUserId) return;

    const fetchEntreprise = async () => {
      try {
        const data = await fetchWithErrorHandling(
          `${API_BASE_URL}/auth1/getEntrepriseByUser/${currentUserId}`
        );
        setEntreprise(data.entreprise);
      } catch (error) {
        console.error("Error fetching entreprise:", error);
        setError("Erreur lors de la récupération de l'entreprise");
      }
    };

    fetchEntreprise();
  }, [currentUserId]);

  // Fetch all other data when entreprise ID is available
  useEffect(() => {
    if (!entreprise?.id) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Utiliser Promise.all pour paralléliser les requêtes
        const [
          usersData,
          messagesData,
          formationsData,
          commentsData,
          monthlyFormationsData,
          monthlyUsersData,
          faqsData
        ] = await Promise.all([
          fetchWithErrorHandling(`${API_BASE_URL}/auth1/getActifUsersByEntreprise/${entreprise.id}`),
          fetchWithErrorHandling(`${API_BASE_URL}/chatMessageRoutes/getMessageByEntreprise/${entreprise.id}`),
          fetchWithErrorHandling(`${API_BASE_URL}/formations/getFormationsByEntreprise/${entreprise.id}`),
          fetchWithErrorHandling(`${API_BASE_URL}/commentaireRoutes/getCommentsByEntreprise/${entreprise.id}`),
          fetchWithErrorHandling(`${API_BASE_URL}/formations/getFormationsCeMoisParEntreprise/${entreprise.id}`),
          fetchWithErrorHandling(`${API_BASE_URL}/auth1/getUtilisateursCeMoisParEntreprise/${entreprise.id}`),
          fetchWithErrorHandling(`${API_BASE_URL}/faq/getFaqByEntreprise/${entreprise.id}`)
        ]);

        setActiveUsers(usersData.rows || usersData || []);
        setMessages(messagesData.utilisateurs || messagesData || []);
        setFormations(formationsData.rows || formationsData || []);
        setComments(commentsData.utilisateurs || commentsData || []);
        setMonthlyFormations(monthlyFormationsData.formations || monthlyFormationsData || []);
        setMonthlyUsers(monthlyUsersData.utilisateurs || monthlyUsersData || []);
        setFaqs(faqsData.faqs?.rows || faqsData.rows || faqsData || []);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Erreur lors du chargement des données. Vérifiez la console pour plus de détails.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [entreprise?.id]);

  // Calculate stats
  const stats = [
    {
      title:t("back.dashboard.utilisateurActifs"),
      value: activeUsers.length.toString(),
      description: monthlyUsers.length > 0
  ? `+${monthlyUsers.length} ${t("back.dashboard.ceMois")}`
  : t("back.dashboard.aucunCeMois")
,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: t("back.dashboard.messageEnvoyer"),
      value: messages.reduce((acc, user) => acc + (user.nombre_messages || 0), 0).toString(),
      description: `${t("back.dashboard.envoyerPar")} ${messages.length} ${t("back.dashboard.utilisateurs")}`
,
      icon: MessageSquare,
      color: "text-green-600",
    },
    {
      title:  t("back.dashboard.formationsDispo"),
      value: formations.length.toString(),
      description: monthlyFormations.length > 0
  ? `+${monthlyFormations.length} ${t("back.dashboard.ceMois")}`
  : t("back.dashboard.aucunFormCeMois")
,
      icon: GraduationCap,
      color: "text-purple-600",
    },
    {
      title: t("back.dashboard.faqDispo"),
      value: faqs.length.toString(),
      description: faqs.length > 0
  ? `${t("back.dashboard.dans")} ${new Set(faqs.map(faq => faq.categorie)).size} ${t("back.dashboard.categories")}`
  : t("back.dashboard.aucunFaq")
,
      icon: BarChart3,
      color: "text-orange-600",
    },
  ];

  // Prepare recent activities from comments
  const recentActivities = comments
    .flatMap(user => 
      (user.comments || []).map((comment: any) => ({
        user: user.utilisateur || { name: t("back.dashboard.utilisateurInconue") },
        comment,
        date: new Date(comment.date_creation || new Date())
      }))
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 4)
    .map(item => `${item.user.name}: "${item.comment.contenu}"`);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 flex-col gap-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>{t("back.dashboard.chargementDonnees")} </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-500 font-medium">{error}</p>
        <p className="text-sm text-red-400 mt-2">
          Vérifiez que:
          <ul className="list-disc pl-5 mt-1">
            <li>Vous êtes bien connecté</li>
            <li>Le serveur backend est en marche</li>
            <li>Les URLs des APIs sont correctes</li>
          </ul>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={textDirection}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("back.dashboard.tabBord")}</h1>
        <p className="text-gray-600 mt-2">
        {entreprise 
  ? `${t("back.dashboard.vueEnsemble")} ${entreprise.nomEntreprise}` 
  : t("back.dashboard.vueEnsemble1")
}

        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              <CardTitle className={`text-sm font-medium text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("back.dashboard.activiteRecent")}</CardTitle>
            <CardDescription>{t("back.dashboard.activiteRecentDescr")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">{activity}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">{t("back.dashboard.aucunActivite")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("back.dashboard.statistiques")}</CardTitle>
            <CardDescription>{t("back.dashboard.performance")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("back.dashboard.nouvUtilisateur")}</span>
                <span className="font-semibold">+{monthlyUsers.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("back.dashboard.nouvFormation")}</span> 
                <span className="font-semibold">{monthlyFormations.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("back.dashboard.faqMisJour")}</span>
                <span className="font-semibold">{faqs.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}