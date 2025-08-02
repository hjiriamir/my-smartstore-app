"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Trophy, X, Search, User, RefreshCw } from "lucide-react"
import type { Challenge, Client, GamificationParticipation, LeaderboardEntry } from "@/lib/gamification"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/hooks/use-toast"

interface ChallengeParticipationManagerProps {
  onNewClientClick: () => void
  entrepriseId: string | null
}

interface Magasin {
  id: number
  magasin_id: string
  nom_magasin: string
}

export function ChallengeParticipationManager({ onNewClientClick, entrepriseId }: ChallengeParticipationManagerProps) {
  const { toast } = useToast()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [participations, setParticipations] = useState<GamificationParticipation[]>([])
  const [pointsProgram, setPointsProgram] = useState<{ clientId: number; total_points: number }[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null)
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([])
  const [participationProgression, setParticipationProgression] = useState<string>("")
  const [pointsGained, setPointsGained] = useState<number>(0)
  const [selectedParticipationId, setSelectedParticipationId] = useState<string | null>(null)
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [isLoadingParticipations, setIsLoadingParticipations] = useState(true)
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedMagasinId, setSelectedMagasinId] = useState<number | null>(null)
  const [magasins, setMagasins] = useState<Magasin[]>([])
  const [isLoadingMagasins, setIsLoadingMagasins] = useState(true)
  const [magasinSelectionne, setMagasinSelectionne] = useState<Magasin | null>(null)

  // Nouveaux états pour la recherche de clients
  const [clientSearchTerm, setClientSearchTerm] = useState<string>("")
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState<boolean>(false)
  const [selectedLeaderboardChallengeId, setSelectedLeaderboardChallengeId] = useState<string | null>(null)
  const [challengeParticipants, setChallengeParticipants] = useState<any[]>([])
  const [isLoadingChallengeParticipants, setIsLoadingChallengeParticipants] = useState(false)

  // Nouvel état pour le bouton d'actualisation du classement
  const [isRefreshingLeaderboard, setIsRefreshingLeaderboard] = useState(false)

  useEffect(() => {
    const fetchMagasins = async () => {
      if (!entrepriseId) {
        setMagasins([])
        setIsLoadingMagasins(false)
        return
      }

      setIsLoadingMagasins(true)
      try {
        const response = await fetch(`http://localhost:8081/api/magasins/getMagasinsByEntrepriseId/${entrepriseId}`)
        if (!response.ok) throw new Error("Erreur lors du chargement des magasins")
        const data: Magasin[] = await response.json()
        setMagasins(data)
        console.log("data recuperer", data)
      } catch (error) {
        console.error("Error fetching stores:", error)
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger les magasins",
        })
      } finally {
        setIsLoadingMagasins(false)
      }
    }

    fetchMagasins()
  }, [entrepriseId, toast])

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!selectedMagasinId || isNaN(selectedMagasinId)) {
        console.log("Aucun magasin sélectionné ou ID invalide:", selectedMagasinId)
        setChallenges([])
        setIsLoadingChallenges(false)
        return
      }

      console.log("Récupération des challenges pour le magasin ID:", selectedMagasinId)
      setIsLoadingChallenges(true)
      setError(null)

      try {
        const apiUrl = `http://localhost:8081/api/gamification/getChallengeByStore/${selectedMagasinId}`
        console.log("URL API appelée:", apiUrl)
        const response = await fetch(apiUrl)

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const data: Challenge[] = await response.json()
        console.log("Données reçues de l'API:", data)

        if (!Array.isArray(data)) {
          throw new Error("Format de données invalide")
        }

        const filteredChallenges = data.filter((challenge) => challenge.magasin_id === selectedMagasinId)
        console.log("Challenges filtrés:", filteredChallenges)
        setChallenges(filteredChallenges)
      } catch (error) {
        console.error("Erreur de chargement:", error)
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger les challenges",
        })
        setChallenges([])
      } finally {
        setIsLoadingChallenges(false)
      }
    }

    fetchChallenges()
  }, [selectedMagasinId, toast])

  useEffect(() => {
    if (selectedMagasinId) {
      const magasinTrouve = magasins.find((m) => m.id === selectedMagasinId)
      if (magasinTrouve) {
        setMagasinSelectionne(magasinTrouve)
        console.log("Magasin sélectionné:", magasinTrouve)
        console.log("ID:", magasinTrouve.id)
        console.log("Magasin ID (string):", magasinTrouve.magasin_id)
        console.log("Nom:", magasinTrouve.nom_magasin)
      } else {
        setMagasinSelectionne(null)
        console.log("Aucun magasin trouvé avec l'ID:", selectedMagasinId)
      }
    } else {
      setMagasinSelectionne(null)
      console.log("Aucun magasin sélectionné")
    }
  }, [selectedMagasinId, magasins])

  useEffect(() => {
    const fetchClients = async () => {
      if (!entrepriseId) {
        setClients([])
        setIsLoadingClients(false)
        return
      }

      setIsLoadingClients(true)
      setError(null)

      try {
        const entrepriseIdNum = Number(entrepriseId)
        if (isNaN(entrepriseIdNum)) {
          console.error("Invalid entrepriseId for fetching clients:", entrepriseId)
          setClients([])
          setIsLoadingClients(false)
          return
        }

        const response = await fetch(`http://localhost:8081/api/client/getClientByEntreprise/${entrepriseIdNum}`)
        if (!response.ok) {
          throw new Error(`HTTP error fetching clients! status: ${response.status}`)
        }

        const data: Client[] = await response.json()
        setClients(data)
      } catch (err: any) {
        console.error("Error fetching clients:", err)
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger les clients",
        })
        setClients([])
      } finally {
        setIsLoadingClients(false)
      }
    }

    fetchClients()
  }, [entrepriseId, toast])

  // Fonction pour charger les participants d'un challenge
  const fetchChallengeParticipants = async (challengeId: string) => {
    setIsLoadingChallengeParticipants(true)
    try {
      const response = await fetch(`http://localhost:8081/api/gamification/getJoueursChallenge/${challengeId}`)
      if (!response.ok) {
        throw new Error(`HTTP error fetching challenge participants! status: ${response.status}`)
      }

      const data = await response.json()
      // Group by client_id and keep the best progression for each client
      const clientMap = new Map()
      data.forEach((participant: any) => {
        const clientId = participant.client_id
        const progression = Number.parseFloat(participant.progression.replace("%", "")) || 0

        if (!clientMap.has(clientId) || progression > clientMap.get(clientId).progressionValue) {
          clientMap.set(clientId, {
            ...participant,
            progressionValue: progression,
          })
        }
      })

      // Convert to array and sort by progression descending
      const sortedParticipants = Array.from(clientMap.values()).sort((a, b) => b.progressionValue - a.progressionValue)

      setChallengeParticipants(sortedParticipants)
      console.log("Challenge participants chargés:", sortedParticipants)
    } catch (err: any) {
      console.error("Error fetching challenge participants:", err)
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Impossible de charger les participants du challenge",
      })
      setChallengeParticipants([])
    } finally {
      setIsLoadingChallengeParticipants(false)
    }
  }

  // Fetch challenge participants from new API
  useEffect(() => {
    if (!selectedLeaderboardChallengeId) {
      setChallengeParticipants([])
      setIsLoadingChallengeParticipants(false)
      return
    }

    fetchChallengeParticipants(selectedLeaderboardChallengeId)
  }, [selectedLeaderboardChallengeId, toast])

  // Fonction pour actualiser le classement
  const handleRefreshLeaderboard = async () => {
    if (!selectedLeaderboardChallengeId) return

    setIsRefreshingLeaderboard(true)
    try {
      await fetchChallengeParticipants(selectedLeaderboardChallengeId)
      toast({
        variant: "success",
        title: "✅ Classement actualisé !",
        description: "Les données du classement ont été mises à jour.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'actualisation",
        description: "Impossible d'actualiser le classement.",
      })
    } finally {
      setIsRefreshingLeaderboard(false)
    }
  }

  useEffect(() => {
    setIsLoadingParticipations(true)
    const mockParticipations: GamificationParticipation[] = [
      {
        id: "part1",
        clientId: 1,
        challengeId: 1,
        progression: "50%",
        points_gagnes: 50,
        date_participation: "2025-03-05",
      },
      {
        id: "part2",
        clientId: 2,
        challengeId: 1,
        progression: "0%",
        points_gagnes: 0,
        date_participation: "2025-03-10",
      },
    ]

    const mockPointsProgram: { clientId: number; total_points: number }[] = [
      { clientId: 1, total_points: 150 },
      { clientId: 2, total_points: 80 },
    ]

    setTimeout(() => {
      setParticipations(mockParticipations)
      setPointsProgram(mockPointsProgram)
      setIsLoadingParticipations(false)
    }, 500)
  }, [])

  const activeChallenges = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    console.log("Tous les challenges:", challenges)
    console.log("Date d'aujourd'hui:", today)

    const filtered = challenges.filter((challenge) => {
      const startDate = new Date(challenge.date_debut)
      const endDate = new Date(challenge.date_fin)

      console.log(`Challenge "${challenge.nom}":`)
      console.log("  Date début:", startDate)
      console.log("  Date fin:", endDate)

      const isActive = startDate <= today && endDate >= today
      console.log("  Est actif:", isActive)

      return isActive
    })

    console.log("Challenges actifs filtrés:", filtered)
    return filtered
  }, [challenges])

  // Filtrer les clients selon le terme de recherche
  const filteredClients = useMemo(() => {
    if (!clientSearchTerm.trim()) return clients

    const searchTerm = clientSearchTerm.toLowerCase().trim()
    return clients.filter((client) => {
      const nom = client.nom?.toLowerCase() || ""
      const prenom = client.prenom?.toLowerCase() || ""
      const codeClient = client.code_client?.toLowerCase() || ""

      return (
        nom.includes(searchTerm) ||
        prenom.includes(searchTerm) ||
        codeClient.includes(searchTerm) ||
        `${prenom} ${nom}`.toLowerCase().includes(searchTerm) ||
        `${nom} ${prenom}`.toLowerCase().includes(searchTerm)
      )
    })
  }, [clients, clientSearchTerm])

  // Obtenir les clients sélectionnés
  const selectedClients = useMemo(() => {
    return clients.filter((client) => selectedClientIds.includes(String(client.id)))
  }, [clients, selectedClientIds])

  // Gérer la sélection d'un client
  const handleSelectClient = (clientId: string) => {
    if (!selectedClientIds.includes(clientId)) {
      setSelectedClientIds((prev) => [...prev, clientId])
    }
    setClientSearchTerm("")
    setIsClientDropdownOpen(false)
  }

  // Supprimer un client sélectionné
  const handleRemoveSelectedClient = (clientId: string) => {
    setSelectedClientIds((prev) => prev.filter((id) => id !== clientId))
  }

  // Handle multiple client participation in a challenge
  const handleParticipate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!selectedChallengeId || selectedClientIds.length === 0) {
      toast({
        variant: "destructive",
        title: "Sélection incomplète",
        description: "Veuillez sélectionner un challenge et au moins un client.",
      })
      return
    }

    // Filter clients who are not already participating
    const availableClientIds = selectedClientIds.filter((clientId) => {
      return !participations.some(
        (p) => p.clientId === Number(clientId) && p.challengeId === Number(selectedChallengeId),
      )
    })

    if (availableClientIds.length === 0) {
      toast({
        variant: "destructive",
        title: "Clients déjà inscrits",
        description: "Tous les clients sélectionnés participent déjà à ce challenge.",
      })
      return
    }

    setIsLoadingParticipations(true)

    try {
      const requestBody = {
        challenge_id: Number(selectedChallengeId),
        clients: availableClientIds.map((id) => Number(id)),
      }

      console.log("Envoi de la requête:", requestBody)

      const response = await fetch("http://localhost:8081/api/gamification/addMultipleParticipations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add Authorization header if needed
          // Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de l'enregistrement des participations.")
      }

      const result = await response.json()
      console.log("Réponse de l'API:", result)

      // Create new participations for local state (simulation)
      const newParticipations: GamificationParticipation[] = availableClientIds.map((clientId) => ({
        id: uuidv4(),
        clientId: Number(clientId),
        challengeId: Number(selectedChallengeId),
        progression: "0%",
        points_gagnes: 0,
        date_participation: new Date().toISOString().split("T")[0],
      }))

      setParticipations((prev) => [...prev, ...newParticipations])

      // Show success toast
      toast({
        variant: "success",
        title: "🎉 Participations enregistrées !",
        description: `${availableClientIds.length} client(s) inscrit(s) avec succès au challenge.`,
      })

      setSelectedChallengeId(null)
      setSelectedClientIds([])
    } catch (err: any) {
      console.error("Erreur lors de l'enregistrement:", err)
      toast({
        variant: "destructive",
        title: "Erreur d'enregistrement",
        description: err.message || "Impossible d'enregistrer les participations.",
      })
    } finally {
      setIsLoadingParticipations(false)
    }
  }

  const handleSelectParticipationToUpdate = (participationId: string) => {
    const participant = challengeParticipants.find((p) => String(p.id) === participationId)
    if (participant) {
      setSelectedParticipationId(participationId)
      setParticipationProgression(participant.progression)
      setPointsGained(participant.points_gagnes)
    }
  }

  const handleUpdateParticipation = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!selectedParticipationId || !participationProgression || pointsGained < 0) {
      toast({
        variant: "destructive",
        title: "Données incomplètes",
        description: "Veuillez sélectionner une participation et entrer des données valides.",
      })
      return
    }

    setIsLoadingChallengeParticipants(true)

    try {
      const requestBody = {
        progression: participationProgression,
        points_gagnes: pointsGained,
      }

      // Utilisation de la nouvelle API avec l'ID de la participation
      const response = await fetch(`http://localhost:8081/api/gamification/participations/${selectedParticipationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de la mise à jour de la participation.")
      }

      // Recharger les données du challenge pour voir les changements
      if (selectedLeaderboardChallengeId) {
        await fetchChallengeParticipants(selectedLeaderboardChallengeId)
      }

      toast({
        variant: "success",
        title: "✅ Progression mise à jour !",
        description: "Les points et la progression ont été mis à jour avec succès.",
      })

      setParticipationProgression("")
      setPointsGained(0)
      setSelectedParticipationId(null)
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour:", err)
      toast({
        variant: "destructive",
        title: "Erreur de mise à jour",
        description: err.message || "Impossible de mettre à jour la participation.",
      })
    } finally {
      setIsLoadingChallengeParticipants(false)
    }
  }

  const overallLoading = isLoadingChallenges || isLoadingClients || isLoadingParticipations

  if (overallLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        <p className="text-slate-500 mt-2">Chargement des données de gamification...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sélectionner un Magasin</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedMagasinId ? String(selectedMagasinId) : ""}
            onValueChange={(value) => setSelectedMagasinId(value ? Number(value) : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un magasin" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingMagasins ? (
                <SelectItem value="" disabled>
                  Chargement des magasins...
                </SelectItem>
              ) : magasins.length === 0 ? (
                <SelectItem value="" disabled>
                  Aucun magasin disponible
                </SelectItem>
              ) : (
                magasins.map((magasin) => (
                  <SelectItem key={magasin.id} value={String(magasin.id)}>
                    {magasin.nom_magasin}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Section: Enregistrer une Participation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Enregistrer des Participations</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Inscrivez un ou plusieurs clients à un challenge actif.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleParticipate} className="space-y-4">
            <div>
              <Label htmlFor="select-challenge">Sélectionner un Challenge Actif</Label>
              <Select value={selectedChallengeId || ""} onValueChange={setSelectedChallengeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un challenge" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    console.log("Rendu du Select - activeChallenges:", activeChallenges)
                    console.log("Longueur activeChallenges:", activeChallenges.length)
                    return null
                  })()}
                  {activeChallenges.length === 0 ? (
                    <SelectItem value="no-challenges" disabled>
                      Aucun challenge actif disponible pour le magasin sélectionné
                    </SelectItem>
                  ) : (
                    activeChallenges.map((challenge) => (
                      <SelectItem key={challenge.id} value={String(challenge.id)}>
                        {challenge.nom} ({challenge.type})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="select-clients">Sélectionner des Clients</Label>
              {/* Clients sélectionnés */}
              {selectedClients.length > 0 && (
                <div className="mb-3 p-3 border rounded-md bg-gray-50">
                  <div className="flex flex-wrap gap-2">
                    {selectedClients.map((client) => {
                      const alreadyParticipating = participations.some(
                        (p) => p.clientId === client.id && p.challengeId === Number(selectedChallengeId),
                      )

                      return (
                        <Badge
                          key={client.id}
                          variant={alreadyParticipating ? "secondary" : "default"}
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          <User className="w-3 h-3" />
                          <span className="text-xs">
                            {client.prenom} {client.nom} ({client.code_client})
                          </span>
                          {alreadyParticipating && <span className="text-xs text-orange-600 ml-1">Déjà inscrit</span>}
                          <button
                            type="button"
                            onClick={() => handleRemoveSelectedClient(String(client.id))}
                            className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Champ de recherche et liste déroulante */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Rechercher un client (nom, prénom, code)..."
                    value={clientSearchTerm}
                    onChange={(e) => {
                      setClientSearchTerm(e.target.value)
                      setIsClientDropdownOpen(true)
                    }}
                    onFocus={() => setIsClientDropdownOpen(true)}
                    className="pl-10"
                  />
                </div>

                {/* Liste déroulante des clients */}
                {isClientDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoadingClients ? (
                      <div className="p-3 text-center text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                        Chargement des clients...
                      </div>
                    ) : filteredClients.length === 0 ? (
                      <div className="p-3 text-center text-gray-500">
                        {clientSearchTerm.trim() ? "Aucun client trouvé" : "Aucun client disponible"}
                      </div>
                    ) : (
                      filteredClients.map((client) => {
                        const isSelected = selectedClientIds.includes(String(client.id))
                        const alreadyParticipating = participations.some(
                          (p) => p.clientId === client.id && p.challengeId === Number(selectedChallengeId),
                        )

                        return (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => handleSelectClient(String(client.id))}
                            disabled={isSelected}
                            className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                              isSelected ? "bg-blue-50 text-blue-700" : ""
                            } ${alreadyParticipating ? "opacity-60" : ""}`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-sm">
                                  {client.prenom} {client.nom}
                                </div>
                                <div className="text-xs text-gray-500">Code: {client.code_client}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isSelected && (
                                  <Badge variant="secondary" className="text-xs">
                                    Sélectionné
                                  </Badge>
                                )}
                                {alreadyParticipating && (
                                  <Badge variant="outline" className="text-xs text-orange-600">
                                    Déjà inscrit
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Bouton pour fermer la liste déroulante */}
              {isClientDropdownOpen && (
                <div className="fixed inset-0 z-5" onClick={() => setIsClientDropdownOpen(false)} />
              )}

              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">
                  {selectedClientIds.length} client(s) sélectionné(s)
                </span>
                <Button type="button" variant="outline" onClick={onNewClientClick}>
                  Nouveau Client
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={
                overallLoading ||
                activeChallenges.length === 0 ||
                clients.length === 0 ||
                selectedClientIds.length === 0
              }
            >
              {overallLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enregistrer les Participations"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Section: Mettre à jour la Progression */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Mettre à jour la Progression</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Mettez à jour la progression et les points d'une participation existante.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateParticipation} className="space-y-4">
            <div>
              <Label htmlFor="select-challenge-for-update">Sélectionner un Challenge</Label>
              <Select value={selectedLeaderboardChallengeId || ""} onValueChange={setSelectedLeaderboardChallengeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un challenge" />
                </SelectTrigger>
                <SelectContent>
                  {challenges.length === 0 ? (
                    <SelectItem value="no-challenges" disabled>
                      Aucun challenge disponible
                    </SelectItem>
                  ) : (
                    challenges.map((challenge) => (
                      <SelectItem key={challenge.id} value={String(challenge.id)}>
                        {challenge.nom} ({challenge.type})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedLeaderboardChallengeId && (
              <div>
                <Label htmlFor="select-participation-update">Sélectionner une Participation</Label>
                <Select value={selectedParticipationId || ""} onValueChange={handleSelectParticipationToUpdate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une participation à modifier" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingChallengeParticipants ? (
                      <SelectItem value="loading" disabled>
                        Chargement des participations...
                      </SelectItem>
                    ) : challengeParticipants.length === 0 ? (
                      <SelectItem value="no-participations" disabled>
                        Aucune participation trouvée pour ce challenge
                      </SelectItem>
                    ) : (
                      challengeParticipants.map((participant) => (
                        <SelectItem key={participant.id} value={String(participant.id)}>
                          {participant.client.prenom} {participant.client.nom} - {participant.progression} (
                          {participant.points_gagnes} pts)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedParticipationId && (
              <>
                <div>
                  <Label htmlFor="progression">Progression (%)</Label>
                  <Input
                    id="progression"
                    type="number"
                    value={participationProgression.replace("%", "")}
                    onChange={(e) => setParticipationProgression(e.target.value + "%")}
                    placeholder="Ex: 75"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <Label htmlFor="points-gained">Points Gagnés</Label>
                  <Input
                    type="number"
                    id="points-gained"
                    value={pointsGained}
                    onChange={(e) => setPointsGained(Number(e.target.value))}
                    min="0"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoadingChallengeParticipants}>
                  {isLoadingChallengeParticipants ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Mettre à jour la Progression"
                  )}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Section: Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Trophy className="w-5 h-5" />
            Classement des Joueurs par Challenge
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Sélectionnez un challenge pour voir le classement des participants par progression.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sélecteur de challenge pour le classement */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="select-leaderboard-challenge">Sélectionner un Challenge</Label>
                <Select value={selectedLeaderboardChallengeId || ""} onValueChange={setSelectedLeaderboardChallengeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un challenge pour voir le classement" />
                  </SelectTrigger>
                  <SelectContent>
                    {challenges.length === 0 ? (
                      <SelectItem value="no-challenges" disabled>
                        Aucun challenge disponible
                      </SelectItem>
                    ) : (
                      challenges.map((challenge) => (
                        <SelectItem key={challenge.id} value={String(challenge.id)}>
                          {challenge.nom} ({challenge.type})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Bouton d'actualisation */}
              {selectedLeaderboardChallengeId && (
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshLeaderboard}
                    disabled={isRefreshingLeaderboard}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshingLeaderboard ? "animate-spin" : ""}`} />
                    {isRefreshingLeaderboard ? "Actualisation..." : "Actualiser"}
                  </Button>
                </div>
              )}
            </div>

            {/* Affichage du classement */}
            {!selectedLeaderboardChallengeId ? (
              <p className="text-center text-muted-foreground py-8">
                Sélectionnez un challenge pour voir le classement des participants.
              </p>
            ) : isLoadingChallengeParticipants ? (
              <div className="flex flex-col items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                <p className="text-slate-500 mt-2">Chargement du classement...</p>
              </div>
            ) : challengeParticipants.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Aucun participant trouvé pour ce challenge.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-2">
                <div className="flex justify-between items-center mb-2 sticky top-0 bg-white z-10 pb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {challengeParticipants.length} participant(s)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const container = document.querySelector(".max-h-96.overflow-y-auto")
                        if (container) container.scrollTo({ top: 0, behavior: "smooth" })
                      }}
                    >
                      ↑ Haut
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const container = document.querySelector(".max-h-96.overflow-y-auto")
                        if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
                      }}
                    >
                      ↓ Bas
                    </Button>
                  </div>
                </div>

                {challengeParticipants.map((participant, index) => {
                  const rank = index + 1
                  const progressionValue = Number.parseFloat(participant.progression.replace("%", "")) || 0

                  return (
                    <div
                      key={`${participant.client_id}-${participant.id}`}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-2 hover:bg-gray-50 transition-colors bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl sm:text-2xl">
                          {rank === 1 ? "🏆" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "⭐"}
                        </span>
                        <div>
                          <h4 className="font-medium text-sm sm:text-base">
                            {participant.client.prenom} {participant.client.nom}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600">#{rank}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="font-semibold text-purple-600 text-sm sm:text-base">
                          {participant.progression}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600">{participant.points_gagnes} points</div>
                        <div className="text-xs text-slate-500">
                          {new Date(participant.date_participation).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
