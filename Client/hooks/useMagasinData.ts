"use client"

import { useState, useEffect } from "react"
import { MagasinService } from "@/src/services/magasin-service"
import { generateZoneId } from "../utils/magasin-utils"
import type { User, EntrepriseStats, MagasinDetails, NewZone, NewStructure, Structure } from "../types/magasin-types"

export function useMagasinData() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [entrepriseStats, setEntrepriseStats] = useState<EntrepriseStats | null>(null)
  const [magasinSelectionne, setMagasinSelectionne] = useState<MagasinDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authError, setAuthError] = useState(false)

  // Zone management
  const [showAddZoneForm, setShowAddZoneForm] = useState(false)
  const [newZone, setNewZone] = useState<NewZone>({
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
  const [zoneToDelete, setZoneToDelete] = useState<string | null>(null)
  const [isCreatingZone, setIsCreatingZone] = useState(false)
  const [isDeletingZone, setIsDeletingZone] = useState(false)

  // Structure management
  const [structures, setStructures] = useState<Structure[]>([])
  const [showAddStructure, setShowAddStructure] = useState(false)
  const [placementMode, setPlacementMode] = useState(false)
  const [previewStructure, setPreviewStructure] = useState<Structure | null>(null)
  const [newStructure, setNewStructure] = useState<NewStructure>({
    type: "door",
    position_x: 0,
    position_y: 0,
    width: 2,
    height: 1,
    orientation: "Nord",
  })

  // Initialize user data
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

        const data = await MagasinService.getCurrentUser()
        const userId = data.user?.idUtilisateur || data.idUtilisateur || data.id
        setCurrentUserId(userId)
        setUser(data.user || data)
        setAuthError(false)
        return userId
      } catch (error: any) {
        console.error("Error fetching current user ID:", error)
        if (error.message.includes("401")) {
          setAuthError(true)
          setError("Session expirée. Veuillez vous reconnecter.")
        } else {
          setError("Erreur de connexion au serveur")
        }
        setLoading(false)
      }
    }
    fetchCurrentUserId()
  }, [])

  // Fetch enterprise stats
  useEffect(() => {
    const fetchEntrepriseStats = async () => {
      if (!user?.entreprises_id || authError) return

      try {
        setLoading(true)
        const data = await MagasinService.getEntrepriseStats(user.entreprises_id)
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
      const magasinDetails = await MagasinService.getMagasinDetails(magasinId)
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

  const handleRetry = () => {
    setError(null)
    setAuthError(false)
    setLoading(true)
    window.location.reload()
  }

  return {
    // State
    currentUserId,
    user,
    entrepriseStats,
    magasinSelectionne,
    loading,
    loadingDetails,
    error,
    authError,
    showAddZoneForm,
    newZone,
    conflictZones,
    zoneToDelete,
    isCreatingZone,
    isDeletingZone,
    structures,
    showAddStructure,
    placementMode,
    previewStructure,
    newStructure,

    // Actions
    setMagasinSelectionne,
    setShowAddZoneForm,
    setNewZone,
    setConflictZones,
    setZoneToDelete,
    setIsCreatingZone,
    setIsDeletingZone,
    setStructures,
    setShowAddStructure,
    setPlacementMode,
    setPreviewStructure,
    setNewStructure,
    fetchMagasinDetails,
    handleRetry,
  }
}
