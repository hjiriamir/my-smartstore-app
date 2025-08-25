"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Store,
  MapPin,
  Ruler,
  Plus,
  Info,
  AlertTriangle,
  CheckCircle,
  Trash2,
  DoorOpen,
  Square,
  MousePointer,
} from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface Zone {
  id: number
  zone_id: string
  nom_zone: string
  magasin_id: string
  description: string
  emplacement: string | null
  longueur: number | null
  largeur: number | null
  hauteur: number | null
  temperature: number | null
  eclairage: string | null
  position_x: number
  position_y: number
  orientation: string | null
  date_creation: string
  date_modification: string
  couleur?: string
  population?: number
  superficie?: number
}

interface Magasin {
  id: number
  magasin_id: string
  nom_magasin: string
  surface: string
  longueur: string
  largeur: string
  zones_configurees: number | null
  adresse: string
  entreprise_id: number
  date_creation: string
  date_modification: string
  ville?: string
  telephone?: string
  horaires?: string
  coordonnees?: { x: number; y: number }
}

interface MagasinDetails extends Magasin {
  zones: Zone[]
}

interface EntrepriseStats {
  totalMagasins: number
  magasins: Magasin[]
  totalZones: number
  surfaceTotal: number
}

interface User {
  idUtilisateur?: string
  id?: string
  entreprises_id: number
}

interface Structure {
  id: string
  type: "door" | "window"
  position_x: number
  position_y: number
  width: number
  height: number
  orientation: string
}

const orientations = [
  { value: "Nord", label: "Nord", degrees: 0 },
  { value: "Est", label: "Est", degrees: 90 },
  { value: "Sud", label: "Sud", degrees: 180 },
  { value: "Ouest", label: "Ouest", degrees: 270 },
]

const eclairageOptions = [
  { value: "LED", label: "LED" },
  { value: "Incandescence", label: "Incandescence" },
  { value: "Fluorescent", label: "Fluorescent" },
  { value: "Naturel", label: "Naturel" },
  { value: "Halogène", label: "Halogène" },
  { value: "Spot", label: "Spot" },
  { value: "Projecteur", label: "Projecteur" },
]

const getOrientationDegrees = (orientation: string): number => {
  const found = orientations.find((o) => o.value === orientation)
  return found ? found.degrees : 0
}

const generateZoneId = (existingZones: Zone[]): string => {
  const existingIds = existingZones.map((zone) => zone.zone_id)
  let counter = 1
  let newId = `Z${counter.toString().padStart(3, "0")}`

  while (existingIds.includes(newId)) {
    counter++
    newId = `Z${counter.toString().padStart(3, "0")}`
  }

  return newId
}

export default function CarteMagasinsZones() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [entrepriseStats, setEntrepriseStats] = useState<EntrepriseStats | null>(null)
  const [magasinSelectionne, setMagasinSelectionne] = useState<MagasinDetails | null>(null)
  const [showAddZoneForm, setShowAddZoneForm] = useState(false)
  const [newZone, setNewZone] = useState({
    zone_id: "",
    nom: "",
    couleur: "#3B82F6",
    description: "",
    emplacement: "",
    longueur: 0,
    largeur: 0,
    hauteur: 0,
    temperature: 20,
    eclairage: "LED",
    position_x: 0,
    position_y: 0,
    orientation: "Nord",
  })
  const [conflictZones, setConflictZones] = useState<string[]>([])
  const [showHelp, setShowHelp] = useState(false)
  const [zoneToDelete, setZoneToDelete] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authError, setAuthError] = useState(false)
  const [isCreatingZone, setIsCreatingZone] = useState(false)
  const [isDeletingZone, setIsDeletingZone] = useState(false)
  const [structures, setStructures] = useState<Structure[]>([])
  const [showAddStructure, setShowAddStructure] = useState(false)
  const [placementMode, setPlacementMode] = useState(false)
  const [previewStructure, setPreviewStructure] = useState<Structure | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [newStructure, setNewStructure] = useState({
    type: "door" as "door" | "window",
    position_x: 0,
    position_y: 0,
    width: 2,
    height: 1,
    orientation: "Nord",
  })

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setAuthError(true)
          setError("Token d'authentification manquant. Veuillez vous connecter.")
          setLoading(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })

        if (!response.ok) {
          if (response.status === 401) {
            setAuthError(true)
            setError("Session expirée. Veuillez vous reconnecter.")
          } else {
            setError("Erreur lors de la récupération des données utilisateur")
          }
          setLoading(false)
          return
        }

        const data = await response.json()
        const userId = data.user?.idUtilisateur || data.idUtilisateur || data.id
        setCurrentUserId(userId)
        setUser(data.user || data)
        setAuthError(false)
        return userId
      } catch (error) {
        console.error("Error fetching current user ID:", error)
        setError("Erreur de connexion au serveur")
        setLoading(false)
      }
    }
    fetchCurrentUserId()
  }, [])

  useEffect(() => {
    const fetchEntrepriseStats = async () => {
      if (!user?.entreprises_id || authError) return

      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const response = await fetch(`${API_BASE_URL}/magasins/getEntrepriseStats/${user.entreprises_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des statistiques")
        }

        const data = await response.json()
        setEntrepriseStats(data)
      } catch (error) {
        console.error("Error fetching entreprise stats:", error)
        setError("Erreur lors de la récupération des données de l'entreprise")
      } finally {
        setLoading(false)
      }
    }

    fetchEntrepriseStats()
  }, [user, authError])

  const fetchMagasinDetails = async (magasinId: string) => {
    try {
      setLoadingDetails(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/magasins/getMagasinDetails/${magasinId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des détails du magasin")
      }

      const data = await response.json()
      const magasinDetails = {
        ...data.magasin,
        ville: data.magasin.adresse || "Non spécifié",
        telephone: "Non spécifié",
        horaires: "Non spécifié",
        coordonnees: { x: 0, y: 0 },
        zones:
          data.magasin.zones?.map((zone: any) => ({
            ...zone,
            nom: zone.nom_zone,
            couleur: zone.couleur || "#3B82F6",
            population: 0,
            superficie: zone.longueur && zone.largeur ? (zone.longueur * zone.largeur) / 1000000 : 0,
          })) || [],
      }
      setMagasinSelectionne(magasinDetails)

      if (magasinDetails.zones) {
        const generatedId = generateZoneId(magasinDetails.zones)
        setNewZone((prev) => ({ ...prev, zone_id: generatedId }))
      }
    } catch (error) {
      console.error("Error fetching magasin details:", error)
      setError("Erreur lors de la récupération des détails du magasin")
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleMagasinChange = (magasinId: string) => {
    if (magasinId) {
      fetchMagasinDetails(magasinId)
    } else {
      setMagasinSelectionne(null)
    }
    setShowAddZoneForm(false)
    setConflictZones([])
    setZoneToDelete(null)
    setStructures([])
  }

  const checkZoneConflicts = (zone: typeof newZone) => {
    if (!magasinSelectionne) return []

    const conflicts: string[] = []
    const magasinLongueur = Number.parseInt(magasinSelectionne.longueur)
    const magasinLargeur = Number.parseInt(magasinSelectionne.largeur)

    if (zone.position_x + zone.longueur > magasinLongueur) {
      conflicts.push("La zone dépasse la longueur du magasin")
    }
    if (zone.position_y + zone.largeur > magasinLargeur) {
      conflicts.push("La zone dépasse la largeur du magasin")
    }
    if (zone.position_x < 0 || zone.position_y < 0) {
      conflicts.push("La position ne peut pas être négative")
    }

    magasinSelectionne.zones.forEach((existingZone) => {
      const overlap = !(
        zone.position_x >= existingZone.position_x + (existingZone.longueur || 0) ||
        zone.position_x + zone.longueur <= existingZone.position_x ||
        zone.position_y >= existingZone.position_y + (existingZone.largeur || 0) ||
        zone.position_y + zone.largeur <= existingZone.position_y
      )

      if (overlap) {
        conflicts.push(`Chevauchement avec la zone "${existingZone.nom_zone}"`)
      }
    })

    return conflicts
  }

  const handleZoneInputChange = (field: string, value: any) => {
    setNewZone((prev) => ({ ...prev, [field]: value }))
    if (field === "longueur" || field === "largeur" || field === "position_x" || field === "position_y") {
      const updatedZone = { ...newZone, [field]: value }
      const conflicts = checkZoneConflicts(updatedZone)
      setConflictZones(conflicts)
    }
  }

  const handleCreateZone = async () => {
    if (!magasinSelectionne || !newZone.nom.trim()) return

    setIsCreatingZone(true)
    try {
      const token = localStorage.getItem("token")
      const zoneData = {
        zone_id: newZone.zone_id,
        nom_zone: newZone.nom,
        magasin_id: magasinSelectionne.magasin_id,
        description: newZone.description,
        emplacement: newZone.emplacement,
        longueur: newZone.longueur,
        largeur: newZone.largeur,
        hauteur: newZone.hauteur,
        temperature: newZone.temperature,
        eclairage: newZone.eclairage,
        position_x: newZone.position_x,
        position_y: newZone.position_y,
        orientation: newZone.orientation,
      }

      const response = await fetch(`${API_BASE_URL}/zones/createZone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(zoneData),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la zone")
      }

      // Refresh magasin details to show new zone
      await fetchMagasinDetails(magasinSelectionne.magasin_id)

      // Reset form
      setShowAddZoneForm(false)
      const generatedId = generateZoneId(magasinSelectionne.zones)
      setNewZone({
        zone_id: generatedId,
        nom: "",
        couleur: "#3B82F6",
        description: "",
        emplacement: "",
        longueur: 0,
        largeur: 0,
        hauteur: 0,
        temperature: 20,
        eclairage: "LED",
        position_x: 0,
        position_y: 0,
        orientation: "Nord",
      })
      setConflictZones([])
    } catch (error) {
      console.error("Error creating zone:", error)
      setError("Erreur lors de la création de la zone")
    } finally {
      setIsCreatingZone(false)
    }
  }

  const handleDeleteZone = async (zoneId: number) => {
    setIsDeletingZone(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/zones/deleteZone/${zoneId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la zone")
      }

      // Refresh magasin details to remove deleted zone
      if (magasinSelectionne) {
        await fetchMagasinDetails(magasinSelectionne.magasin_id)
      }
      setZoneToDelete(null)
    } catch (error) {
      console.error("Error deleting zone:", error)
      setError("Erreur lors de la suppression de la zone")
    } finally {
      setIsDeletingZone(false)
    }
  }

  const handleStartPlacement = () => {
    if (!magasinSelectionne) return
    setPlacementMode(true)
    setShowAddStructure(false)
  }

  const handlePlanClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placementMode || !magasinSelectionne) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const magasinLongueur = Number.parseInt(magasinSelectionne.longueur)
    const magasinLargeur = Number.parseInt(magasinSelectionne.largeur)
    
    const position_x = (x / rect.width) * magasinLongueur
    const position_y = (y / rect.height) * magasinLargeur

    const newStructureObj: Structure = {
      id: `struct_${Date.now()}`,
      type: newStructure.type,
      position_x: Math.max(0, Math.min(magasinLongueur - newStructure.width, position_x)),
      position_y: Math.max(0, Math.min(magasinLargeur - newStructure.height, position_y)),
      width: newStructure.width,
      height: newStructure.height,
      orientation: newStructure.orientation,
    }

    setStructures((prev) => [...prev, newStructureObj])
    setPlacementMode(false)
    setPreviewStructure(null)
  }

  const handlePlanMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placementMode || !magasinSelectionne) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const magasinLongueur = Number.parseInt(magasinSelectionne.longueur)
    const magasinLargeur = Number.parseInt(magasinSelectionne.largeur)
    
    const position_x = (x / rect.width) * magasinLongueur
    const position_y = (y / rect.height) * magasinLargeur

    setPreviewStructure({
      id: 'preview',
      type: newStructure.type,
      position_x: Math.max(0, Math.min(magasinLongueur - newStructure.width, position_x)),
      position_y: Math.max(0, Math.min(magasinLargeur - newStructure.height, position_y)),
      width: newStructure.width,
      height: newStructure.height,
      orientation: newStructure.orientation,
    })
  }

  const handleAddStructure = () => {
    if (!magasinSelectionne) return

    const newStructureObj: Structure = {
      id: `struct_${Date.now()}`,
      type: newStructure.type,
      position_x: newStructure.position_x,
      position_y: newStructure.position_y,
      width: newStructure.width,
      height: newStructure.height,
      orientation: newStructure.orientation,
    }

    setStructures((prev) => [...prev, newStructureObj])
    setShowAddStructure(false)
    setNewStructure({
      type: "door",
      position_x: 0,
      position_y: 0,
      width: 2,
      height: 1,
      orientation: "Nord",
    })
  }

  const handleRemoveStructure = (structureId: string) => {
    setStructures((prev) => prev.filter(s => s.id !== structureId))
  }

  const handleCancelPlacement = () => {
    setPlacementMode(false)
    setPreviewStructure(null)
  }

  const getAvailableSpace = () => {
    if (!magasinSelectionne) return { maxX: 0, maxY: 0, suggestions: [] }

    const magasinLongueur = Number.parseInt(magasinSelectionne.longueur)
    const magasinLargeur = Number.parseInt(magasinSelectionne.largeur)

    return {
      maxX: magasinLongueur,
      maxY: magasinLargeur,
      suggestions: [
        { x: 0, y: 0, width: Math.min(20, magasinLongueur), height: Math.min(15, magasinLargeur) },
        { x: magasinLongueur - 20, y: 0, width: 20, height: Math.min(15, magasinLargeur) },
      ],
    }
  }

  const applySuggestion = (suggestion: any) => {
    setNewZone((prev) => ({
      ...prev,
      position_x: suggestion.x,
      position_y: suggestion.y,
      longueur: suggestion.width,
      largeur: suggestion.height,
    }))
  }

  const handleRetry = () => {
    setError(null)
    setAuthError(false)
    setLoading(true)
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  if (authError || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-8">
        <Card className="border-red-200 bg-red-50 max-w-md w-full shadow-lg">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              {authError ? "Authentification requise" : "Erreur"}
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            {authError ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Pour utiliser cette fonctionnalité, vous devez :</p>
                <ul className="text-sm text-gray-600 text-left list-disc list-inside space-y-1">
                  <li>Vous connecter à votre compte</li>
                  <li>Avoir un token d'authentification valide</li>
                  <li>Configurer la variable d'environnement NEXT_PUBLIC_API_BASE_URL</li>
                </ul>
              </div>
            ) : (
              <Button onClick={handleRetry} variant="outline">
                Réessayer
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-4 shadow-lg">
              <Store className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Carte des Magasins et Zones</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Gérez et visualisez les zones de vos magasins avec précision. Sélectionnez un magasin pour commencer.
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="bg-white/20 rounded-full p-2">
                <Store className="h-6 w-6" />
              </div>
              Sélectionner un magasin
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!magasinSelectionne ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Choisissez un magasin dans la liste ci-dessous pour visualiser ses zones et gérer son plan.
                  </p>
                </div>
                <Select onValueChange={handleMagasinChange}>
                  <SelectTrigger className="w-full h-12 text-lg">
                    <SelectValue placeholder="🏪 Choisissez un magasin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {entrepriseStats?.magasins.map((magasin) => (
                      <SelectItem key={magasin.magasin_id} value={magasin.magasin_id} className="text-lg py-3">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{magasin.nom_magasin}</div>
                            <div className="text-sm text-gray-500">{magasin.adresse}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-600 rounded-full p-2">
                        <Store className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-800">{entrepriseStats?.totalMagasins || 0}</p>
                        <p className="text-sm text-green-600">Magasins disponibles</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-600 rounded-full p-2">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-800">{entrepriseStats?.totalZones || 0}</p>
                        <p className="text-sm text-purple-600">Zones totales</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-600 rounded-full p-2">
                        <Ruler className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-800">{entrepriseStats?.surfaceTotal || 0}</p>
                        <p className="text-sm text-orange-600">m² de surface totale</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Magasin sélectionné: {magasinSelectionne.nom_magasin}</span>
                </div>
                <Button variant="outline" onClick={() => setMagasinSelectionne(null)} className="text-sm">
                  Changer de magasin
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {magasinSelectionne && (
          <>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="bg-white/20 rounded-full p-2">
                      <MapPin className="h-6 w-6" />
                    </div>
                    {magasinSelectionne.nom_magasin}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {loadingDetails ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Adresse</p>
                        <p className="font-medium">{magasinSelectionne.adresse}</p>
                        <p className="font-medium">{magasinSelectionne.ville}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Téléphone</p>
                        <p className="font-medium">{magasinSelectionne.telephone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{magasinSelectionne.horaires}</span>
                      </div>
                      <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                          <Ruler className="h-4 w-4" />
                          Dimensions du magasin
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Longueur:</span>
                            <p className="font-medium">{magasinSelectionne.longueur} m</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Largeur:</span>
                            <p className="font-medium">{magasinSelectionne.largeur} m</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Surface:</span>
                            <p className="font-medium">{magasinSelectionne.surface} m²</p>
                          </div>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground mb-2">Zones de couverture</p>
                        <div className="flex flex-wrap gap-2">
                          {magasinSelectionne.zones.map((zone) => (
                            <Badge
                              key={zone.id}
                              variant="secondary"
                              style={{
                                backgroundColor: (zone.couleur || "#3B82F6") + "20",
                                color: zone.couleur || "#3B82F6",
                              }}
                            >
                              {zone.nom_zone}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="border-t pt-4 space-y-2">
                        <Button
                          onClick={() => setShowAddZoneForm(!showAddZoneForm)}
                          className="w-full"
                          variant={showAddZoneForm ? "outline" : "default"}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {showAddZoneForm ? "Annuler" : "Ajouter une zone"}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Plan 2D du Magasin</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowAddStructure(!showAddStructure)}
                      variant="outline"
                      size="sm"
                      disabled={placementMode}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Structure
                    </Button>
                    {placementMode && (
                      <Button onClick={handleCancelPlacement} variant="outline" size="sm">
                        Annuler
                      </Button>
                    )}
                  </div>
                </div>

                {showAddStructure && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-medium mb-3">Configuration de la structure</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <Label htmlFor="structureType">Type</Label>
                        <Select
                          value={newStructure.type}
                          onValueChange={(value: "door" | "window") =>
                            setNewStructure((prev) => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="door">Porte</SelectItem>
                            <SelectItem value="window">Fenêtre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="structureWidth">Largeur (m)</Label>
                        <Input
                          id="structureWidth"
                          type="number"
                          step="0.1"
                          min="0.5"
                          max="5"
                          value={newStructure.width}
                          onChange={(e) =>
                            setNewStructure((prev) => ({ ...prev, width: Number.parseFloat(e.target.value) || 1 }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="structureHeight">Hauteur (m)</Label>
                        <Input
                          id="structureHeight"
                          type="number"
                          step="0.1"
                          min="0.5"
                          max="3"
                          value={newStructure.height}
                          onChange={(e) =>
                            setNewStructure((prev) => ({ ...prev, height: Number.parseFloat(e.target.value) || 1 }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="structureOrientation">Orientation</Label>
                        <Select
                          value={newStructure.orientation}
                          onValueChange={(value) => setNewStructure((prev) => ({ ...prev, orientation: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {orientations.map((orientation) => (
                              <SelectItem key={orientation.value} value={orientation.value}>
                                {orientation.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button onClick={handleStartPlacement} className="flex-1">
                        <MousePointer className="h-4 w-4 mr-2" />
                        Placer sur le plan
                      </Button>
                      <Button onClick={handleAddStructure} variant="outline">
                        Ajouter par coordonnées
                      </Button>
                    </div>
                  </div>
                )}

                {placementMode && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <MousePointer className="h-4 w-4 inline mr-1" />
                      Cliquez sur le plan pour placer la {newStructure.type === 'door' ? 'porte' : 'fenêtre'}
                    </p>
                  </div>
                )}

                <div
                  className={`relative bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden ${
                    placementMode ? 'cursor-crosshair' : ''
                  }`}
                  style={{
                    aspectRatio: `${magasinSelectionne.longueur}/${magasinSelectionne.largeur}`,
                    minHeight: "400px",
                  }}
                  onClick={handlePlanClick}
                  onMouseMove={handlePlanMouseMove}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100">
                    <svg className="absolute inset-0 w-full h-full opacity-30">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  <div className="absolute top-2 left-8 right-8 h-6 flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span>0m</span>
                    <span className="bg-blue-100 px-2 py-1 rounded">
                      Longueur: {magasinSelectionne.longueur}m (Axe X)
                    </span>
                    <span>{magasinSelectionne.longueur}m</span>
                  </div>

                  <div className="absolute left-2 top-8 bottom-8 w-6 flex flex-col items-center justify-between text-xs font-medium text-muted-foreground">
                    <span>0m</span>
                    <div className="bg-green-100 px-1 py-2 rounded -rotate-90 whitespace-nowrap">
                      Largeur: {magasinSelectionne.largeur}m (Axe Y)
                    </div>
                    <span>{magasinSelectionne.largeur}m</span>
                  </div>

                  <div
                    className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg z-10"
                    style={{
                      left: `50%`,
                      top: `50%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    title={`Point de référence central: (${Math.round(Number.parseInt(magasinSelectionne.longueur) / 2)}, ${Math.round(Number.parseInt(magasinSelectionne.largeur) / 2)})`}
                  />

                  <div className="absolute left-8 top-8 right-8 bottom-8 border-2 border-slate-400 bg-white/50">
                    {magasinSelectionne.zones.map((zone) => {
                      const magasinLongueur = Number.parseInt(magasinSelectionne.longueur)
                      const magasinLargeur = Number.parseInt(magasinSelectionne.largeur)
                      const posX = (zone.position_x / magasinLongueur) * 100
                      const posY = (zone.position_y / magasinLargeur) * 100
                      const tailleX = ((zone.longueur || 10) / magasinLongueur) * 100
                      const tailleY = ((zone.largeur || 10) / magasinLargeur) * 100

                      return (
                        <div
                          key={zone.id}
                          className="absolute border-2 border-white shadow-lg opacity-90 hover:opacity-100 transition-all cursor-pointer hover:scale-105 group"
                          style={{
                            backgroundColor: zone.couleur || "#3B82F6",
                            left: `${Math.max(0, Math.min(100 - tailleX, posX))}%`,
                            top: `${Math.max(0, Math.min(100 - tailleY, posY))}%`,
                            width: `${tailleX}%`,
                            height: `${tailleY}%`,
                            transform: `rotate(${getOrientationDegrees(zone.orientation || "Nord")}deg)`,
                            transformOrigin: "center",
                          }}
                        >
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                            <span className="text-white text-xs font-semibold text-center bg-black/40 rounded px-1">
                              {zone.nom_zone}
                            </span>
                            <span className="text-white text-xs bg-black/40 rounded px-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {zone.longueur}×{zone.largeur}×{zone.hauteur}m
                            </span>
                            <span className="text-white text-xs bg-black/40 rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              ({zone.position_x}, {zone.position_y})
                            </span>
                          </div>
                        </div>
                      )
                    })}

                    {showAddZoneForm && newZone.longueur > 0 && newZone.largeur > 0 && (
                      <div
                        className="absolute border-2 border-dashed border-red-500 bg-red-500/20 opacity-70 z-20"
                        style={{
                          left: `${(newZone.position_x / Number.parseInt(magasinSelectionne.longueur)) * 100}%`,
                          top: `${(newZone.position_y / Number.parseInt(magasinSelectionne.largeur)) * 100}%`,
                          width: `${(newZone.longueur / Number.parseInt(magasinSelectionne.longueur)) * 100}%`,
                          height: `${(newZone.largeur / Number.parseInt(magasinSelectionne.largeur)) * 100}%`,
                          transform: `rotate(${getOrientationDegrees(newZone.orientation)}deg)`,
                          transformOrigin: "center",
                        }}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-red-700 text-xs font-semibold bg-white/80 rounded px-1">
                            {newZone.nom || "Nouvelle zone"}
                          </span>
                          <span className="text-red-700 text-xs bg-white/80 rounded px-1 mt-1">
                            {newZone.longueur}×{newZone.largeur}×{newZone.hauteur}m
                          </span>
                        </div>
                      </div>
                    )}

                    {showAddZoneForm &&
                      (() => {
                        const { suggestions } = getAvailableSpace()
                        return suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="absolute border-2 border-dashed border-green-500 bg-green-500/15 opacity-60 hover:opacity-90 cursor-pointer transition-all hover:scale-105 group"
                            style={{
                              left: `${(suggestion.x / Number.parseInt(magasinSelectionne.longueur)) * 100}%`,
                              top: `${(suggestion.y / Number.parseInt(magasinSelectionne.largeur)) * 100}%`,
                              width: `${(suggestion.width / Number.parseInt(magasinSelectionne.longueur)) * 100}%`,
                              height: `${(suggestion.height / Number.parseInt(magasinSelectionne.largeur)) * 100}%`,
                            }}
                            onClick={() => applySuggestion(suggestion)}
                            title={`Emplacement suggéré: ${suggestion.width}×${suggestion.height}m à (${suggestion.x}, ${suggestion.y})`}
                          >
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-green-700 text-xs font-semibold bg-white/80 rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                Suggéré
                              </span>
                            </div>
                          </div>
                        ))
                      })()}

                    {structures.map((structure) => {
                      const magasinLongueur = Number.parseInt(magasinSelectionne.longueur)
                      const magasinLargeur = Number.parseInt(magasinSelectionne.largeur)
                      const posX = (structure.position_x / magasinLongueur) * 100
                      const posY = (structure.position_y / magasinLargeur) * 100
                      const tailleX = (structure.width / magasinLongueur) * 100
                      const tailleY = (structure.height / magasinLargeur) * 100

                      return (
                        <div
                          key={structure.id}
                          className={`absolute border-2 group ${
                            structure.type === "door" 
                              ? "border-amber-600 bg-amber-200 hover:bg-amber-300" 
                              : "border-blue-500 bg-blue-200 hover:bg-blue-300"
                          } opacity-90 hover:opacity-100 transition-all cursor-pointer`}
                          style={{
                            left: `${Math.max(0, Math.min(100 - tailleX, posX))}%`,
                            top: `${Math.max(0, Math.min(100 - tailleY, posY))}%`,
                            width: `${tailleX}%`,
                            height: `${tailleY}%`,
                            transform: `rotate(${getOrientationDegrees(structure.orientation)}deg)`,
                            transformOrigin: "center",
                            minWidth: "20px",
                            minHeight: "20px",
                          }}
                          title={`${structure.type === "door" ? "Porte" : "Fenêtre"}: ${structure.width}×${structure.height}m`}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            {structure.type === "door" ? (
                              <DoorOpen className="h-4 w-4 text-amber-700" />
                            ) : (
                              <Square className="h-4 w-4 text-blue-700" />
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveStructure(structure.id)
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}

                    {placementMode && previewStructure && (
                      <div
                        className={`absolute border-2 border-dashed opacity-60 ${
                          previewStructure.type === "door" 
                            ? "border-amber-400 bg-amber-100" 
                            : "border-blue-400 bg-blue-100"
                        }`}
                        style={{
                          left: `${(previewStructure.position_x / Number.parseInt(magasinSelectionne.longueur)) * 100}%`,
                          top: `${(previewStructure.position_y / Number.parseInt(magasinSelectionne.largeur)) * 100}%`,
                          width: `${(previewStructure.width / Number.parseInt(magasinSelectionne.longueur)) * 100}%`,
                          height: `${(previewStructure.height / Number.parseInt(magasinSelectionne.largeur)) * 100}%`,
                          transform: `rotate(${getOrientationDegrees(previewStructure.orientation)}deg)`,
                          transformOrigin: "center",
                          minWidth: "20px",
                          minHeight: "20px",
                          pointerEvents: "none",
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          {previewStructure.type === "door" ? (
                            <DoorOpen className="h-4 w-4 text-amber-600" />
                          ) : (
                            <Square className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {structures.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Structures ajoutées ({structures.length})</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {structures.map((structure) => (
                        <div key={structure.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <div className="flex items-center gap-2">
                            {structure.type === "door" ? (
                              <DoorOpen className="h-4 w-4 text-amber-600" />
                            ) : (
                              <Square className="h-4 w-4 text-blue-600" />
                            )}
                            <span>
                              {structure.type === "door" ? "Porte" : "Fenêtre"} - {structure.width}×{structure.height}m
                            </span>
                          </div>
                          <Button
                            onClick={() => handleRemoveStructure(structure.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {showAddZoneForm && magasinSelectionne && (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="bg-white/20 rounded-full p-2">
                      <Plus className="h-6 w-6" />
                    </div>
                    Ajouter une nouvelle zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {conflictZones.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-600">Conflits détectés :</span>
                      </div>
                      <ul className="text-sm text-red-700 space-y-1">
                        {conflictZones.map((conflict, index) => (
                          <li key={index}>• {conflict}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(() => {
                    const { maxX, maxY, suggestions } = getAvailableSpace()
                    return (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-600">Espace disponible :</span>
                        </div>
                        <div className="text-sm text-green-700 space-y-1">
                          <p>
                            • Dimensions maximales : {maxX}m × {maxY}m
                          </p>
                          <p>
                            • {suggestions.length} emplacement{suggestions.length > 1 ? "s" : ""} suggéré
                            {suggestions.length > 1 ? "s" : ""} (zones vertes sur la carte)
                          </p>
                          {suggestions.length > 0 && <p>• Cliquez sur une zone verte pour l'utiliser automatiquement</p>}
                        </div>
                      </div>
                    )
                  })()}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="zone_id" className="flex items-center gap-2">
                          ID Zone * <span className="text-xs text-muted-foreground">(généré automatiquement)</span>
                        </Label>
                        <Input
                          id="zone_id"
                          value={newZone.zone_id}
                          onChange={(e) => handleZoneInputChange("zone_id", e.target.value)}
                          placeholder="Z001"
                          className="bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nom" className="flex items-center gap-2">
                          Nom de la zone *<span className="text-xs text-muted-foreground">(ex: Rayon Électronique)</span>
                        </Label>
                        <Input
                          id="nom"
                          value={newZone.nom}
                          onChange={(e) => handleZoneInputChange("nom", e.target.value)}
                          placeholder="Ex: Zone Électronique"
                        />
                      </div>
                      <div>
                        <Label htmlFor="couleur">Couleur d'affichage</Label>
                        <Input
                          id="couleur"
                          type="color"
                          value={newZone.couleur}
                          onChange={(e) => handleZoneInputChange("couleur", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description (optionnelle)</Label>
                        <Textarea
                          id="description"
                          value={newZone.description}
                          onChange={(e) => handleZoneInputChange("description", e.target.value)}
                          placeholder="Description de la zone..."
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="longueur" className="text-xs">
                            Longueur (m) *
                          </Label>
                          <Input
                            id="longueur"
                            type="number"
                            min="0"
                            max={Number.parseInt(magasinSelectionne.longueur)}
                            value={newZone.longueur}
                            onChange={(e) => handleZoneInputChange("longueur", Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="largeur" className="text-xs">
                            Largeur (m) *
                          </Label>
                          <Input
                            id="largeur"
                            type="number"
                            min="0"
                            max={Number.parseInt(magasinSelectionne.largeur)}
                            value={newZone.largeur}
                            onChange={(e) => handleZoneInputChange("largeur", Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="hauteur" className="text-xs">
                            Hauteur (m)
                          </Label>
                          <Input
                            id="hauteur"
                            type="number"
                            min="0"
                            step="0.1"
                            value={newZone.hauteur}
                            onChange={(e) => handleZoneInputChange("hauteur", Number(e.target.value))}
                            placeholder="2.5"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="position_x" className="text-xs">
                            Position X (m)
                          </Label>
                          <Input
                            id="position_x"
                            type="number"
                            min="0"
                            max={Number.parseInt(magasinSelectionne.longueur)}
                            value={newZone.position_x}
                            onChange={(e) => handleZoneInputChange("position_x", Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="position_y" className="text-xs">
                            Position Y (m)
                          </Label>
                          <Input
                            id="position_y"
                            type="number"
                            min="0"
                            max={Number.parseInt(magasinSelectionne.largeur)}
                            value={newZone.position_y}
                            onChange={(e) => handleZoneInputChange("position_y", Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="temperature">Température (°C)</Label>
                        <Input
                          id="temperature"
                          type="number"
                          step="0.1"
                          value={newZone.temperature}
                          onChange={(e) => handleZoneInputChange("temperature", Number(e.target.value))}
                          placeholder="20.0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="eclairage">Éclairage</Label>
                        <Select
                          value={newZone.eclairage}
                          onValueChange={(value) => handleZoneInputChange("eclairage", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {eclairageOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="orientation">Orientation</Label>
                        <Select
                          value={newZone.orientation}
                          onValueChange={(value) => handleZoneInputChange("orientation", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {orientations.map((orientation) => (
                              <SelectItem key={orientation.value} value={orientation.value}>
                                {orientation.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowAddZoneForm(false)}>
                      Annuler
                    </Button>
                    <Button
                      onClick={handleCreateZone}
                      disabled={
                        !newZone.nom.trim() ||
                        !newZone.zone_id.trim() ||
                        conflictZones.length > 0 ||
                        newZone.longueur <= 0 ||
                        newZone.largeur <= 0 ||
                        isCreatingZone
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isCreatingZone ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {isCreatingZone ? "Création..." : "Ajouter la zone"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {magasinSelectionne.zones.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="bg-white/20 rounded-full p-2">
                      <MapPin className="h-6 w-6" />
                    </div>
                    Détails des Zones ({magasinSelectionne.zones.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {magasinSelectionne.zones.map((zone) => (
                      <div
                        key={zone.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        style={{ borderColor: zone.couleur || "#3B82F6" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: zone.couleur || "#3B82F6" }} />
                            <h4 className="font-semibold">{zone.nom_zone}</h4>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setZoneToDelete(zone.id.toString())}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{zone.description}</p>

                        <div className="space-y-2 text-sm">
                          <div className="border-b pb-2">
                            <p className="font-medium text-muted-foreground mb-1">Dimensions:</p>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <span className="text-xs text-muted-foreground">L:</span>
                                <span className="font-medium ml-1">{zone.longueur || 0}m</span>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">l:</span>
                                <span className="font-medium ml-1">{zone.largeur || 0}m</span>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">H:</span>
                                <span className="font-medium ml-1">{zone.hauteur || 0}m</span>
                              </div>
                            </div>
                          </div>

                          <div className="border-b pb-2">
                            <p className="font-medium text-muted-foreground mb-1">Position:</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-xs text-muted-foreground">X:</span>
                                <span className="font-medium ml-1">{zone.position_x}m</span>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Y:</span>
                                <span className="font-medium ml-1">{zone.position_y}m</span>
                              </div>
                            </div>
                            <div className="mt-1">
                              <span className="text-xs text-muted-foreground">Orientation:</span>
                              <span className="font-medium ml-1">{zone.orientation || "Nord"}</span>
                            </div>
                          </div>

                          <div className="border-b pb-2">
                            <p className="font-medium text-muted-foreground mb-1">Environnement:</p>
                            <div className="space-y-1">
                              {zone.temperature && (
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted-foreground">Température:</span>
                                  <span className="font-medium">{zone.temperature}°C</span>
                                </div>
                              )}
                              {zone.eclairage && (
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted-foreground">Éclairage:</span>
                                  <span className="font-medium">{zone.eclairage}</span>
                                </div>
                              )}
                              {zone.emplacement && (
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted-foreground">Emplacement:</span>
                                  <span className="font-medium text-xs">{zone.emplacement}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between">
                            <span>ID Zone:</span>
                            <span className="font-medium">{zone.zone_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Superficie:</span>
                            <span className="font-medium">{zone.superficie || 0} km²</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {zoneToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Confirmer la suppression
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Êtes-vous sûr de vouloir supprimer cette zone ? Cette action est irréversible.</p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setZoneToDelete(null)}>
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteZone(Number(zoneToDelete))}
                    disabled={isDeletingZone}
                  >
                    {isDeletingZone ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    {isDeletingZone ? "Suppression..." : "Supprimer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
  
}