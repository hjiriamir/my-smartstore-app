"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Eye, Download, Calendar, Share2 } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Planogram {
  planogram_id: number
  magasin_id: string
  zone_id: string
  nom: string
  description: string
  date_creation: string
  update_date: string | null
  created_by: number
  statut: string
  pdfUrl: string | null
  imageUrl: string | null
  taches: {
    id: number
    statut: string
    date_fin_reelle: string | null
  }[]
  zone: {
    nom_zone: string
  }
  furnitures: {
    furniture_id: number
  }[]
}

const API_BASE_URL = "http://localhost:8081/api"

export default function PlanogramLibrary() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [planograms, setPlanograms] = useState<Planogram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [selectedPlanogram, setSelectedPlanogram] = useState<Planogram | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
        }

        // 1. Récupérer l'ID de l'utilisateur connecté
        const userResponse = await fetch("http://localhost:8081/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include"
        });
  
        if (!userResponse.ok) {
          const errorData = await userResponse.json()
          throw new Error(errorData.message || "Erreur lors de la récupération de l'utilisateur")
        }
        
        const userData = await userResponse.json()
        const userId = userData.user?.idUtilisateur || userData.id

        // 2. Récupérer le magasin de l'utilisateur
        const magasinResponse = await fetch(`${API_BASE_URL}/magasins/getMagasinByUser/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        
        if (!magasinResponse.ok) {
          throw new Error("Erreur lors de la récupération du magasin")
        }
        
        const magasinData = await magasinResponse.json()

        // 3. Récupérer les planogrammes du magasin
        const planogramsResponse = await fetch(`${API_BASE_URL}/planogram/getPlanogramDetails/${magasinData.magasin_id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        
        if (!planogramsResponse.ok) {
          throw new Error("Erreur lors de la récupération des planogrammes")
        }
        
        const planogramsData = await planogramsResponse.json()
        setPlanograms(Array.isArray(planogramsData) ? planogramsData : [])
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Une erreur inconnue est survenue"
        setError(errorMessage)
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Fonction pour ouvrir l'image en grand
  const handleViewImage = (planogram: Planogram) => {
    if (!planogram.imageUrl) {
      toast({
        title: "Aucune image disponible",
        description: "Ce planogramme ne possède pas d'image",
        variant: "destructive",
      })
      return
    }
    setSelectedPlanogram(planogram)
    setIsDialogOpen(true)
  }

// Fonction pour télécharger l'image
const handleDownloadImage = async (planogram: Planogram) => {
  if (!planogram.imageUrl) {
    toast({
      title: "Aucune image disponible",
      description: "Ce planogramme ne possède pas d'image à télécharger",
      variant: "destructive",
    });
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token d'authentification manquant");
    }

    // Construire l'URL complète si elle est relative
    let imageUrl = planogram.imageUrl;
    if (!imageUrl.startsWith('http')) {
      imageUrl = `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }

    // Utiliser le constructeur natif HTMLImageElement
    const img = new window.Image();
    img.crossOrigin = 'Anonymous'; // Important pour les requêtes CORS
    img.src = imageUrl;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error("L'image n'a pas pu être chargée"));
    });

    // Créer un canvas pour convertir l'image en blob
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Impossible de créer le contexte canvas");
    
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error("La conversion en blob a échoué");
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileExtension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      link.download = `planogramme_${planogram.planogram_id}.${fileExtension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Libérer la mémoire
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }, 'image/jpeg', 0.95);

    toast({
      title: "Téléchargement lancé",
      description: "Le téléchargement de l'image devrait commencer",
    });
  } catch (err) {
    console.error("Erreur de téléchargement:", err);
    toast({
      title: "Erreur",
      description: err instanceof Error ? err.message : "Échec du téléchargement",
      variant: "destructive",
    });
  }
};


  // Fonction pour télécharger le PDF
  const handleDownloadPdf = async (planogram: Planogram) => {
    if (!planogram.pdfUrl) {
      toast({
        title: "Aucun PDF disponible",
        description: "Ce planogramme ne possède pas de fichier PDF",
        variant: "destructive",
      })
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const response = await fetch(planogram.pdfUrl, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `planogramme_${planogram.planogram_id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Téléchargement réussi",
        description: "Le planogramme a été téléchargé",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du téléchargement"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const filteredPlanograms = planograms.filter((planogram) => {
    const matchesSearch =
      planogram.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      planogram.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = 
      categoryFilter === "all" || 
      planogram.zone.nom_zone.toLowerCase().includes(categoryFilter.toLowerCase())
    
    const matchesStatus = 
      statusFilter === "all" || 
      planogram.statut.toLowerCase().includes(statusFilter.toLowerCase())

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "validé":
      case "publié":
      case "actif":
        return "bg-blue-100 text-blue-800"
      case "en cours":
      case "en_cours":
        return "bg-yellow-100 text-yellow-800"
      case "terminé":
        return "bg-green-100 text-green-800"
      case "à mettre en place":
      case "à implémenter":
      case "mise_en_place":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR')
  }

  const getLastUpdateDate = (planogram: Planogram) => {
    return planogram.update_date || 
           (planogram.taches.length > 0 ? planogram.taches[0].date_fin_reelle : null) || 
           planogram.date_creation
  }

  return (
    <div className="space-y-6">
      {/* Dialog pour afficher l'image en grand */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPlanogram?.nom}</DialogTitle>
          </DialogHeader>
          {selectedPlanogram?.imageUrl && (
            <div className="relative h-[70vh] w-full">
              <Image
                src={selectedPlanogram.imageUrl}
                alt={`Planogramme ${selectedPlanogram.nom}`}
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contenu principal */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un planogramme..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Zone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les zones</SelectItem>
            <SelectItem value="Frais">Frais</SelectItem>
            <SelectItem value="Épicerie">Épicerie</SelectItem>
            <SelectItem value="Textile">Textile</SelectItem>
            <SelectItem value="Électronique">Électronique</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="mise_en_place">À mettre en place</SelectItem>
            <SelectItem value="en_cours">En cours</SelectItem>
            <SelectItem value="terminé">Terminé</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlanograms.map((planogram) => (
            <Card key={planogram.planogram_id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
              {/* Miniature du planogramme */}
              <div className="relative h-48 w-full bg-gray-100">
                {planogram.imageUrl ? (
                  <Image
                    src={planogram.imageUrl}
                    alt={`Aperçu du planogramme ${planogram.nom}`}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <span>Aucune image disponible</span>
                  </div>
                )}
              </div>

              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{planogram.nom}</CardTitle>
                    <CardDescription className="mt-1">
                      {planogram.zone.nom_zone} • Magasin: {planogram.magasin_id}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(planogram.statut)}>
                    {planogram.statut.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{planogram.description}</p>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Mis à jour le {formatDate(getLastUpdateDate(planogram))}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div>
                      <span className="font-medium">
                        {planogram.furnitures?.length || 0}
                      </span> meubles
                    </div>
                    <div>
                      <span className="font-medium">
                        {planogram.taches?.length || 0}
                      </span> tâches
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="default" 
                    className="flex-1"
                    onClick={() => handleViewImage(planogram)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleDownloadImage(planogram)}
                    disabled={!planogram.imageUrl}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredPlanograms.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="text-center py-12">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun planogramme trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche ou filtres.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}