"use client"

import { useState, useEffect  } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner";
import {
  Play,
  Book,
  HelpCircle,
  Search,
  Star,
  Clock,
  CheckCircle,
  Check,
  Video,
  FileText,
  Headphones,
  Award,
  Users,
  MessageSquare,
  Lock, Shield,
  User,
  Settings,
  AlertCircle,
  Download,
  Trash2,
  Loader2,
  Edit, X, Save,
  Smartphone, 
  Languages, 
  Bell, 
  Palette,
  Key
} from "lucide-react"

export default function TrainingSupport() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [completedModules, setCompletedModules] = useState<number[]>([1, 3])
  const [trainingModules, setTrainingModules] = useState<any[]>([])
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<{type: string, url: string} | null>(null);
  const [faqItems, setFaqItems] = useState<any[]>([])

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  
  // Règles de validation du mot de passe
  const passwordRules = [
    { id: 1, text: "8 caractères minimum", validator: (pwd:any) => pwd.length >= 8 },
    { id: 2, text: "1 majuscule minimum", validator: (pwd:any) => /[A-Z]/.test(pwd) },
    { id: 3, text: "1 minuscule minimum", validator: (pwd:any) => /[a-z]/.test(pwd) },
    { id: 4, text: "1 chiffre minimum", validator: (pwd:any) => /[0-9]/.test(pwd) },
    { id: 5, text: "1 caractère spécial", validator: (pwd:any) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ];

  // Vérifie si toutes les règles sont respectées
  const isPasswordValid = passwordRules.every(rule => rule.validator(newPassword));
  
  // Vérifie si la confirmation correspond
  const doPasswordsMatch = newPassword === confirmPassword;
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      toast.error("Le mot de passe ne respecte pas toutes les exigences de sécurité");
      return;
    }
    
    if (!doPasswordsMatch) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Aucun token d'authentification trouvé");
      }
  
      const response = await fetch("http://localhost:8081/api/auth1/updatePassword", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cookie": `token=${token}`
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword: newPassword
        }),
        credentials: "include"
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour du mot de passe");
      }
  
      // Réinitialiser les champs et masquer le formulaire
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      
      toast.success("Mot de passe mis à jour avec succès");
      
    } catch (error: any) {
      console.error("Erreur lors du changement de mot de passe:", error);
      toast.error(error.message || "Une erreur est survenue lors du changement de mot de passe");
    }
  };


  const [userData, setUserData] = useState({
    id:"",
    firstName: "",
    //lastName: "",
    email: "",
    role: "",
    magasin_id: ""
  });

  // fetch user
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Aucun token d'authentification trouvé");
      }
  
      const response = await fetch("http://localhost:8081/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include"
      });
  
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données utilisateur");
      }
  
      const data = await response.json();
      console.log("Données utilisateur reçues:", data);
      
      // Mettez à jour l'état avec les données de l'utilisateur
      setUserData({
        id: data.user?.idUtilisateur || "", // Ajout de l'ID
        firstName: data.user?.name || "",
        email: data.user?.email || "",
        role: data.user?.role || "",
        magasin_id: data.user?.magasin_id || ""
      });
  
    } catch (error) {
      console.error("Erreur:", error);
    }
  };
  useEffect(() => {
    fetchUserData();
  }, []);
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Aucun token d'authentification trouvé");
      }
  
      // Vérifier que l'ID utilisateur existe
      if (!userData.id) {
        throw new Error("ID utilisateur non trouvé");
      }
  
      // Appeler l'API pour mettre à jour le nom
      const updateNameResponse = await fetch(
        `http://localhost:8081/api/auth1/updateUserName/${userData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: userData.firstName,
          }),
          credentials: "include",
        }
      );
  
      if (!updateNameResponse.ok) {
        const errorData = await updateNameResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la mise à jour du nom"
        );
      }
  
      setIsEditing(false);
      await fetchUserData();
      
      toast.success("Nom mis à jour avec succès");
      
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error(error.message || "Une erreur est survenue lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };


// fetch FAQs
useEffect(() => {
  const fetchFaqs = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/faq/getAllFaqs")
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des FAQs")
      }
      const data = await response.json()
      // Transformez les données de l'API pour correspondre à votre structure existante
      const formattedData = data.map((faq: any) => ({
        id: Math.random().toString(36).substring(2, 9), // génère un ID aléatoire
        question: faq.question,
        answer: faq.reponse,
        category: faq.categorie,
        helpful: faq.personnes_aidees,
        views: faq.vues,
      }))
      setFaqItems(formattedData)
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  fetchFaqs()
}, [])



// fetch formations  
useEffect(() => {
  const fetchFormations = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/formations/getAllFormations")
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des formations")
      }
      const data = await response.json()
      // Transformez les données de l'API pour correspondre à votre structure
      const formattedData = data.map((formation: any) => ({
        id: formation.id,
        title: formation.titre,
        description: formation.description,
        duration: `${formation.duree} min`,
        type: "video", // Par défaut, puisque l'API indique une vidéo
        difficulty: "Débutant", // Vous pouvez adapter cela selon vos besoins
        completed: completedModules.includes(formation.id),
        progress: completedModules.includes(formation.id) ? 100 : 0,
        thumbnail: "/placeholder.svg?height=120&width=200",
        url_video: formation.url_video,
        url_pdf: formation.url_pdf
      }))
      setTrainingModules(formattedData)
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  fetchFormations()
}, [completedModules])

 

 

  const tutorials = [
    {
      id: 1,
      title: "Guide de démarrage rapide",
      description: "Tout ce qu'il faut savoir pour commencer",
      type: "pdf",
      size: "2.3 MB",
      downloads: 1234,
    },
    {
      id: 2,
      title: "Raccourcis clavier",
      description: "Liste complète des raccourcis pour gagner du temps",
      type: "pdf",
      size: "0.8 MB",
      downloads: 567,
    },
    {
      id: 3,
      title: "Bonnes pratiques d'implémentation",
      description: "Conseils pour une mise en place efficace",
      type: "pdf",
      size: "1.5 MB",
      downloads: 890,
    },
  ]

  const filteredFAQ = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-600" />
      case "interactive":
        return <Play className="h-4 w-4 text-green-600" />
      case "tutorial":
        return <Book className="h-4 w-4 text-purple-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }
  

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Débutant":
        return "bg-green-100 text-green-800"
      case "Intermédiaire":
        return "bg-yellow-100 text-yellow-800"
      case "Avancé":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleModuleComplete = (moduleId: number) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules([...completedModules, moduleId])
      // Mettez à jour l'état des modules pour refléter la complétion
      setTrainingModules(prevModules =>
        prevModules.map(module =>
          module.id === moduleId
            ? { ...module, completed: true, progress: 100 }
            : module
        )
      )
    }
  }

  const ResourceViewer = () => {
    if (!currentResource) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="text-lg font-medium">
              {currentResource.type === 'video' ? 'Visionnage vidéo' : 'Document PDF'}
            </h3>
            <button 
              onClick={() => {
                setIsViewerOpen(false);
                setCurrentResource(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <div className="p-4">
            {currentResource.type === 'video' ? (
              <div className="aspect-video w-full">
                <video 
                  controls 
                  autoPlay 
                  className="w-full h-full"
                  onEnded={handleVideoEnded}
                >
                  <source src={currentResource.url} type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              </div>
            ) : (
              <iframe 
                src={currentResource.url} 
                className="w-full min-h-[70vh]"
                frameBorder="0"
              >
                <p>Votre navigateur ne supporte pas les PDF. Vous pouvez le <a href={currentResource.url}>télécharger</a>.</p>
              </iframe>
            )}
          </div>
        </div>
      </div>
    );
  };
  const handleVideoEnded = () => {
    if (selectedVideo && !completedModules.includes(selectedVideo.id)) {
      setCompletedModules([...completedModules, selectedVideo.id]);
    }
  };
  const handleModuleClick = (module: any) => {
    setSelectedVideo(module);
    
    // Si le module a une URL vidéo, ouvrir directement la vidéo
    if (module.url_video) {
      setCurrentResource({ type: 'video', url: module.url_video });
      setIsViewerOpen(true);
    }
    // Sinon, si le module a un PDF, ouvrir le PDF
    else if (module.url_pdf) {
      setCurrentResource({ type: 'pdf', url: module.url_pdf });
      setIsViewerOpen(true);
    }
  };

  const overallProgress = trainingModules.length > 0 
  ? (completedModules.length / trainingModules.length) * 100 
  : 0
  return (
    <div className="space-y-6">
  
      <Tabs defaultValue="training" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="training">Formation</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="support"> Gestion Compte</TabsTrigger>
        </TabsList>
  
        {/* Modules de formation */}
        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modules de formation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainingModules.length > 0 ? (
                  trainingModules.map((module) => (
                    <Card
                      key={module.id}
                      className={`hover:shadow-lg transition-shadow cursor-pointer ${
                        module.completed ? "border-green-200 bg-green-50" : ""
                      }`}
                      onClick={() => setSelectedVideo(module)}
                    >
                      <div className="relative">
  <img
    src={module.thumbnail || "/placeholder.svg"}
    alt={module.title}
    className="w-full h-32 object-cover rounded-t-lg"
  />
  {module.completed && (
    <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1">
      <CheckCircle className="h-4 w-4" />
    </div>
  )}
  <div className="absolute bottom-2 left-2 flex items-center space-x-2">
    {/* Afficher l'icône seulement pour les vidéos */}
    {module.url_video && getTypeIcon('video')}
    {/* Afficher la durée seulement pour les vidéos */}
    {module.url_video && (
      <span className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
        {module.duration}
      </span>
    )}
  </div>
</div>
  
<CardContent className="p-4">
  <h3 className="font-medium mb-2">{module.title}</h3>
  <p className="text-sm text-muted-foreground mb-3">{module.description}</p>

  {/* Afficher le badge de type et la durée seulement pour les vidéos */}
  <div className="flex items-center space-x-2 mb-2">
    {module.url_video ? (
      <>
        <Badge variant="outline" className="flex items-center">
          <Video className="h-3 w-3 mr-1" />
          Vidéo
        </Badge>
        <Badge variant="outline" className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {module.duration}
        </Badge>
      </>
    ) : module.url_pdf ? (
      <Badge variant="outline" className="flex items-center">
        <FileText className="h-3 w-3 mr-1" />
        PDF
      </Badge>
    ) : null}
  </div>

  {(module.url_video || module.url_pdf) && (
    <div className="flex space-x-2 mt-2">
      {module.url_video && (
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentResource({ type: 'video', url: module.url_video });
            setIsViewerOpen(true);
          }}
        >
          <Video className="h-4 w-4 mr-2" />
          Vidéo
        </Button>
      )}
      {module.url_pdf && (
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentResource({ type: 'pdf', url: module.url_pdf });
            setIsViewerOpen(true);
          }}
        >
          <FileText className="h-4 w-4 mr-2" />
          PDF
        </Button>
      )}
    </div>
  )}
</CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full flex justify-center py-8">
                    <p className="text-muted-foreground">
                      Chargement des modules de formation...
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
  
        {/* FAQ */}
        <TabsContent value="faq" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>Questions fréquentes</CardTitle>
      <CardDescription>Trouvez rapidement des réponses à vos questions</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher dans la FAQ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {faqItems.length > 0 ? (
          filteredFAQ.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-lg">{item.question}</h3>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
                <p className="text-muted-foreground mb-3">{item.answer}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span>{item.views} vues</span>
                    <span>{item.helpful} personnes aidées</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost">
                      👍 Utile
                    </Button>
                    <Button size="sm" variant="ghost">
                      👎
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">
              Chargement des questions fréquentes...
            </p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
</TabsContent>
  
      
  
        
        {/* Support */}
<TabsContent value="support" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>Gestion du compte</CardTitle>
      <CardDescription>Configurez vos préférences et informations personnelles</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
     {/* Section Informations personnelles */}
     <div className="space-y-6 bg-white/50 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
  {/* En-tête avec icône et bouton */}
  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center space-x-3">
      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Informations personnelles
      </h3>
    </div>
    <Button 
      variant={isEditing ? "outline" : "default"}
      onClick={() => setIsEditing(!isEditing)}
      className="flex items-center gap-1"
    >
      {isEditing ? (
        <>
          <X className="h-4 w-4" />
          Annuler
        </>
      ) : (
        <>
          <Edit className="h-4 w-4" />
          Modifier
        </>
      )}
    </Button>
  </div>

  {/* Grille d'informations */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Carte pour chaque information */}
    {[
  { label: "Nom & Prénom", value: userData.firstName, key: "firstName", editable: true },
  { label: "Magasin", value: userData.magasin_id, key: "magasin_id", editable: false },
  { label: "Email", value: userData.email, key: "email", editable: false },
  { label: "Rôle", value: userData.role, key: "role", editable: false }
].map((item) => (
  <div 
    key={item.key}
    className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 transition-all hover:shadow-sm"
  >
    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
      {item.label}
    </Label>
    
    {isEditing && item.editable ? (
      <Input
        value={item.value}
        onChange={(e) => setUserData({...userData, [item.key]: e.target.value})}
        disabled={!item.editable}
        className="bg-white dark:bg-gray-800"
      />
    ) : (
      <div className="flex items-center">
        <span className="text-lg font-medium text-gray-900 dark:text-white">
          {item.value || (
            <span className="text-gray-400 dark:text-gray-500 italic">Non renseigné</span>
          )}
        </span>
        {!item.editable && (
          <Lock className="h-4 w-4 ml-2 text-gray-400 dark:text-gray-500" />
        )}
      </div>
    )}
  </div>
))}
  </div>

  {/* Boutons d'action */}
  {isEditing && (
    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
      <Button 
        variant="outline" 
        onClick={() => {
          setIsEditing(false);
          fetchUserData();
        }}
        className="gap-1"
      >
        <X className="h-4 w-4" />
        Annuler
      </Button>
      <Button 
        onClick={handleSave}
        disabled={isSaving}
        className="gap-1 bg-blue-600 hover:bg-blue-700"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Enregistrer
          </>
        )}
      </Button>
    </div>
  )}
</div>

     
      {/* Section Sécurité du compte */}
      <div className="space-y-6 bg-white/50 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mt-6">
      <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
            <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sécurité du compte
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        {showPasswordForm ? (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
            <form onSubmit={handlePasswordChange} className="space-y-4">
  <div>
    <Label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
      Ancien mot de passe
    </Label>
    <Input
      id="currentPassword"
      type="password"
      value={currentPassword}
      onChange={(e) => setCurrentPassword(e.target.value)}
      required
    />
  </div>
  
  <div>
    <Label htmlFor="newPassword" className="block text-sm font-medium mb-1">
      Nouveau mot de passe
    </Label>
    <Input
      id="newPassword"
      type="password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      required
    />
    
    {/* Affichage des règles de mot de passe */}
    <div className="mt-2 space-y-1">
      {passwordRules.map(rule => (
        <div key={rule.id} className="flex items-center">
          {rule.validator(newPassword) ? (
            <Check className="h-4 w-4 text-green-500 mr-2" />
          ) : (
            <X className="h-4 w-4 text-red-500 mr-2" />
          )}
          <span className={`text-sm ${rule.validator(newPassword) ? 'text-green-500' : 'text-gray-500'}`}>
            {rule.text}
          </span>
        </div>
      ))}
    </div>
  </div>
  
  <div>
    <Label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
      Confirmer le nouveau mot de passe
    </Label>
    <Input
      id="confirmPassword"
      type="password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      required
    />
    {confirmPassword && !doPasswordsMatch && (
      <p className="mt-1 text-sm text-red-500">Les mots de passe ne correspondent pas</p>
    )}
    {confirmPassword && doPasswordsMatch && (
      <p className="mt-1 text-sm text-green-500">Les mots de passe correspondent</p>
    )}
  </div>
  
  <div className="flex justify-end space-x-2">
    <Button
      variant="outline"
      type="button"
      onClick={() => setShowPasswordForm(false)}
    >
      Annuler
    </Button>
    <Button 
      type="submit"
      disabled={!isPasswordValid || !doPasswordsMatch || !currentPassword}
    >
      Enregistrer
    </Button>
  </div>
</form>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                <Key className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <Label className="block text-sm font-medium">Mot de passe</Label>
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
              Changer
            </Button>
          </div>
        )}

        {[
          
          {
            label: "Appareils connectés",
            description: "2 appareils actifs",
            action: <Button variant="outline">Gérer</Button>,
            icon: <Smartphone className="h-5 w-5 text-gray-500" />
          }
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                {item.icon}
              </div>
              <div>
                <Label className="block text-sm font-medium">{item.label}</Label>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
            {item.action}
          </div>
        ))}
      </div>
    </div>

{/* Section Préférences */}
<div className="space-y-6 bg-white/50 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mt-6">
  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center space-x-3">
      <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50">
        <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Préférences
      </h3>
    </div>
  </div>

  <div className="space-y-4">
    {[
      {
        label: "Langue",
        description: "Définissez votre langue préférée",
        component: (
          <Select defaultValue="fr">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Langue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        ),
        icon: <Languages className="h-5 w-5 text-gray-500" />
      },
      {
        label: "Notifications",
        description: "Contrôlez comment vous recevez les notifications",
        component: <Button variant="outline">Configurer</Button>,
        icon: <Bell className="h-5 w-5 text-gray-500" />
      },
     
    ].map((item, index) => (
      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
            {item.icon}
          </div>
          <div>
            <Label className="block text-sm font-medium">{item.label}</Label>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        </div>
        {item.component}
      </div>
    ))}
  </div>
</div>

{/* Section Actions */}
<div className="space-y-6 bg-white/50 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mt-6">
  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center space-x-3">
      <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Actions
      </h3>
    </div>
  </div>

  <div className="space-y-3">
    <Button 
      variant="outline" 
      className="w-full justify-start p-6 hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <div className="flex items-center space-x-4">
        <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <div className="text-left">
          <Label className="block font-medium">Exporter mes données</Label>
          <p className="text-sm text-muted-foreground">
            Téléchargez toutes vos données en format ZIP
          </p>
        </div>
      </div>
    </Button>
    
   
  </div>
</div>
    </CardContent>
  </Card>
</TabsContent>
      </Tabs>
      {isViewerOpen && <ResourceViewer />}
    </div>
  );
}