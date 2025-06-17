"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"

export default function TrainingSupport() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [completedModules, setCompletedModules] = useState<number[]>([1, 3])

  const trainingModules = [
    {
      id: 1,
      title: "Introduction aux planogrammes",
      description: "Comprendre les bases des planogrammes et leur importance",
      duration: "15 min",
      type: "video",
      difficulty: "Débutant",
      completed: true,
      progress: 100,
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 2,
      title: "Navigation dans l'interface",
      description: "Apprendre à utiliser efficacement la plateforme",
      duration: "20 min",
      type: "interactive",
      difficulty: "Débutant",
      completed: false,
      progress: 45,
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 3,
      title: "Visualisation 2D et 3D",
      description: "Maîtriser les outils de visualisation avancés",
      duration: "25 min",
      type: "video",
      difficulty: "Intermédiaire",
      completed: true,
      progress: 100,
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 4,
      title: "Suivi et validation des implémentations",
      description: "Processus de confirmation et de suivi des planogrammes",
      duration: "18 min",
      type: "tutorial",
      difficulty: "Intermédiaire",
      completed: false,
      progress: 0,
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 5,
      title: "Communication et support",
      description: "Utiliser les outils de communication intégrés",
      duration: "12 min",
      type: "video",
      difficulty: "Débutant",
      completed: false,
      progress: 0,
      thumbnail: "/placeholder.svg?height=120&width=200",
    },
  ]

  const faqItems = [
    {
      id: 1,
      question: "Comment puis-je visualiser un planogramme en 3D ?",
      answer:
        'Cliquez sur l\'onglet "Visualisation" puis sélectionnez le mode 3D. Vous pouvez ensuite utiliser les contrôles de rotation et de zoom pour explorer le planogramme.',
      category: "Visualisation",
      helpful: 15,
      views: 234,
    },
    {
      id: 2,
      question: "Que faire si un produit n'apparaît pas dans le planogramme ?",
      answer:
        "Vérifiez d'abord que le planogramme est à jour. Si le problème persiste, contactez le support technique via le chat intégré.",
      category: "Problèmes techniques",
      helpful: 23,
      views: 189,
    },
    {
      id: 3,
      question: "Comment confirmer la mise en place d'un planogramme ?",
      answer:
        'Allez dans l\'onglet "Suivi", sélectionnez le planogramme concerné, puis cliquez sur "Valider". Vous pouvez ajouter des photos et commentaires.',
      category: "Implémentation",
      helpful: 31,
      views: 456,
    },
    {
      id: 4,
      question: "Puis-je exporter un planogramme en PDF ?",
      answer:
        'Oui, dans la vue de visualisation, cliquez sur "Export PDF" dans la barre d\'outils. Le PDF sera généré avec la vue actuelle.',
      category: "Export",
      helpful: 18,
      views: 167,
    },
  ]

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
    }
  }

  const overallProgress = (completedModules.length / trainingModules.length) * 100

  return (
    <div className="space-y-6">
      {/* Statistiques de formation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression globale</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{Math.round(overallProgress)}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modules terminés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedModules.length}/{trainingModules.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps total</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">90 min</div>
            <p className="text-xs text-muted-foreground">Formation complète</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certification</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{overallProgress === 100 ? "Obtenue" : "En cours"}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="training" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="training">Formation</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tutorials">Tutoriels</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        {/* Modules de formation */}
        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modules de formation</CardTitle>
              <CardDescription>Parcours d'apprentissage personnalisé</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainingModules.map((module) => (
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
                        {getTypeIcon(module.type)}
                        <span className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                          {module.duration}
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">{module.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{module.description}</p>

                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getDifficultyColor(module.difficulty)}>{module.difficulty}</Badge>
                        <span className="text-xs text-muted-foreground">{module.progress}%</span>
                      </div>

                      <Progress value={module.progress} className="mb-3" />

                      <Button
                        size="sm"
                        className="w-full"
                        variant={module.completed ? "outline" : "default"}
                        onClick={() => handleModuleComplete(module.id)}
                      >
                        {module.completed ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Revoir
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            {module.progress > 0 ? "Continuer" : "Commencer"}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
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
                {filteredFAQ.map((item) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tutoriels */}
        <TabsContent value="tutorials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Guides et tutoriels</CardTitle>
              <CardDescription>Documentation détaillée et guides pratiques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.map((tutorial) => (
                  <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <FileText className="h-8 w-8 text-red-600" />
                        <div className="flex-1">
                          <h3 className="font-medium">{tutorial.title}</h3>
                          <p className="text-sm text-muted-foreground">{tutorial.size}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{tutorial.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{tutorial.downloads} téléchargements</span>
                        <Button size="sm">Télécharger</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support */}
        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contacter le support</CardTitle>
                <CardDescription>Besoin d'aide ? Notre équipe est là pour vous</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat en direct
                  <Badge variant="secondary" className="ml-auto">
                    En ligne
                  </Badge>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Créer un ticket
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Headphones className="h-4 w-4 mr-2" />
                  Support téléphonique
                  <span className="ml-auto text-xs text-muted-foreground">9h-18h</span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ressources utiles</CardTitle>
                <CardDescription>Liens et ressources complémentaires</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Communauté utilisateurs</span>
                  </div>
                  <Button size="sm" variant="ghost">
                    Rejoindre
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Video className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Webinaires</span>
                  </div>
                  <Button size="sm" variant="ghost">
                    Voir
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Book className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Documentation API</span>
                  </div>
                  <Button size="sm" variant="ghost">
                    Consulter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
