"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Eye, Download, GitCompare, Calendar } from "lucide-react"

// Define the Meuble type
interface Meuble {
  id: number
  name: string
  category: string
  status: string
  publishDate: string
  implementationDate: string
  version: string
  previousVersion: string
  description: string
  products: number
  changes: number
}

// Placeholder function for getting user store ID (replace with actual implementation)
const getUserStoreId = async (): Promise<string> => {
  // Simulate fetching the store ID from an API or authentication context
  return Promise.resolve("Magasin Central")
}

export default function PlanogramLibrary() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Remplacer la section des données simulées par :
  const [meubles, setMeubles] = useState<Meuble[]>([])
  const [loading, setLoading] = useState(true)
  const [userStore, setUserStore] = useState<string>("")

  // Ajouter useEffect pour récupérer les meubles du magasin
  useEffect(() => {
    fetchMeublesForStore()
  }, [])

  const fetchMeublesForStore = async () => {
    try {
      setLoading(true)
      // Récupérer l'ID du magasin de l'utilisateur connecté
      const storeId = await getUserStoreId()
      setUserStore(storeId)

      // Récupérer les meubles spécifiques à ce magasin
      const response = await fetch(`/api/meubles?storeId=${storeId}`)
      const data = await response.json()
      setMeubles(data.meubles)
    } catch (error) {
      console.error("Erreur lors de la récupération des meubles:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPlanograms = meubles.filter((planogram) => {
    const matchesSearch =
      planogram.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      planogram.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || planogram.category === categoryFilter
    const matchesStatus = statusFilter === "all" || planogram.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Publié":
        return "bg-blue-100 text-blue-800"
      case "En cours":
        return "bg-yellow-100 text-yellow-800"
      case "Terminé":
        return "bg-green-100 text-green-800"
      case "À implémenter":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
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
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            <SelectItem value="Épicerie">Épicerie</SelectItem>
            <SelectItem value="Frais">Frais</SelectItem>
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
            <SelectItem value="À implémenter">À implémenter</SelectItem>
            <SelectItem value="En cours">En cours</SelectItem>
            <SelectItem value="Terminé">Terminé</SelectItem>
            <SelectItem value="Publié">Publié</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPlanograms.map((planogram) => (
            <Card key={planogram.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{planogram.name}</CardTitle>
                    <CardDescription className="mt-1">{planogram.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(planogram.status)}>{planogram.status}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Catégorie:</span> {planogram.category}
                  </div>
                  <div>
                    <span className="font-medium">Version:</span> {planogram.version}
                  </div>
                  <div>
                    <span className="font-medium">Produits:</span> {planogram.products}
                  </div>
                  <div>
                    <span className="font-medium">Modifications:</span> {planogram.changes}
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Publié le {planogram.publishDate}</span>
                  <span>•</span>
                  <span>À implémenter le {planogram.implementationDate}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="default">
                    <Eye className="h-4 w-4 mr-2" />
                    Visualiser
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                  {planogram.previousVersion && (
                    <Button size="sm" variant="outline">
                      <GitCompare className="h-4 w-4 mr-2" />
                      Comparer v{planogram.previousVersion}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredPlanograms.length === 0 && !loading && (
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
