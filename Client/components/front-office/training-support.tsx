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
import {
  Play,
  Book,
  HelpCircle,
  Search,
  Star,
  Clock,
  CheckCircle,
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
  Loader2 
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
  const [userData, setUserData] = useState({
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@example.com",
    phone: "+33 6 12 34 56 78"
  });
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Ici vous ajouteriez la logique pour sauvegarder les données
      // Par exemple, un appel API à votre backend
      // await updateUserProfile(userData);
      
      // Simuler un délai de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
      // Ajouter une notification de succès si vous en avez
    } catch (error) {
      console.error("Erreur lors de la sauvegarde", error);
      // Ajouter une notification d'erreur
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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium flex items-center">
            <User className="h-5 w-5 mr-2" />
            Informations personnelles
          </h3>
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Prénom */}
          <div>
            <Label>Prénom</Label>
            {isEditing ? (
              <Input 
                value={userData.firstName} 
                onChange={(e) => setUserData({...userData, firstName: e.target.value})}
              />
            ) : (
              <div className="p-2 border border-transparent rounded-md text-sm">
                {userData.firstName || 'Non renseigné'}
              </div>
            )}
          </div>
          
          {/* Nom */}
          <div>
            <Label>Nom</Label>
            {isEditing ? (
              <Input 
                value={userData.lastName} 
                onChange={(e) => setUserData({...userData, lastName: e.target.value})}
              />
            ) : (
              <div className="p-2 border border-transparent rounded-md text-sm">
                {userData.lastName || 'Non renseigné'}
              </div>
            )}
          </div>
          
          {/* Email */}
          <div>
            <Label>Email</Label>
            {isEditing ? (
              <Input 
                type="email"
                value={userData.email} 
                onChange={(e) => setUserData({...userData, email: e.target.value})}
              />
            ) : (
              <div className="p-2 border border-transparent rounded-md text-sm">
                {userData.email || 'Non renseigné'}
              </div>
            )}
          </div>
          
          {/* Téléphone */}
          <div>
            <Label>Téléphone</Label>
            {isEditing ? (
              <Input 
                type="tel"
                value={userData.phone} 
                onChange={(e) => setUserData({...userData, phone: e.target.value})}
              />
            ) : (
              <div className="p-2 border border-transparent rounded-md text-sm">
                {userData.phone || 'Non renseigné'}
              </div>
            )}
          </div>
        </div>
        
        {isEditing && (
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : 'Enregistrer les modifications'}
            </Button>
          </div>
        )}
      </div>

      {/* Section Sécurité */}
      <div className="space-y-4 pt-6 border-t">
        <h3 className="font-medium flex items-center">
          <Lock className="h-5 w-5 mr-2" />
          Sécurité du compte
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Mot de passe</Label>
              <p className="text-sm text-muted-foreground">
                Dernière modification il y a 3 mois
              </p>
            </div>
            <Button variant="outline">Changer le mot de passe</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Authentification à deux facteurs</Label>
              <p className="text-sm text-muted-foreground">
                Ajoutez une couche de sécurité supplémentaire
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Appareils connectés</Label>
              <p className="text-sm text-muted-foreground">
                2 appareils actifs
              </p>
            </div>
            <Button variant="outline">Gérer</Button>
          </div>
        </div>
      </div>

      {/* Section Préférences */}
      <div className="space-y-4 pt-6 border-t">
        <h3 className="font-medium flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Préférences
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Langue</Label>
              <p className="text-sm text-muted-foreground">
                Définissez votre langue préférée
              </p>
            </div>
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
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Contrôlez comment vous recevez les notifications
              </p>
            </div>
            <Button variant="outline">Configurer</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Thème</Label>
              <p className="text-sm text-muted-foreground">
                Personnalisez l'apparence de l'interface
              </p>
            </div>
            <Select defaultValue="system">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sélectionnez un thème" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Clair</SelectItem>
                <SelectItem value="dark">Sombre</SelectItem>
                <SelectItem value="system">Système</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Section Actions */}
      <div className="space-y-4 pt-6 border-t">
        <h3 className="font-medium flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Actions
        </h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Download className="h-4 w-4 mr-2" />
            Exporter mes données
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer mon compte
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
