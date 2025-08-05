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
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"

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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  // Classes RTL optimisées
  const rtlClasses = {
    container: isRTL ? "rtl" : "ltr",
    textAlign: isRTL ? "text-right" : "text-left",
    textAlignOpposite: isRTL ? "text-left" : "text-right",
    flexRow: isRTL ? "flex-row-reverse" : "flex-row",
    flexRowReverse: isRTL ? "flex-row" : "flex-row-reverse",
    marginLeft: isRTL ? "mr-2" : "ml-2",
    marginRight: isRTL ? "ml-2" : "mr-2",
    paddingLeft: isRTL ? "pr-3" : "pl-3",
    paddingRight: isRTL ? "pl-3" : "pr-3",
    borderLeft: isRTL ? "border-r" : "border-l",
    borderRight: isRTL ? "border-l" : "border-r",
    roundedLeft: isRTL ? "rounded-r" : "rounded-l",
    roundedRight: isRTL ? "rounded-l" : "rounded-r",
    spaceX: isRTL ? "space-x-reverse space-x-4" : "space-x-4",
    directionClass: isRTL ? "flex-row-reverse" : "flex-row",
    inputPadding: isRTL ? "pr-4 pl-10" : "pl-4 pr-10",
    buttonSpacing: isRTL ? "space-x-reverse space-x-2" : "space-x-2",
    gridFlow: isRTL ? "grid-flow-col-dense" : "",
    justifyBetween: "justify-between",
    itemsCenter: "items-center",
    formSpacing: "space-y-6",
    cardPadding: "p-4",
    labelSpacing: "mb-2",
    selectTrigger: isRTL ? "text-right" : "text-left",
    textareaAlign: isRTL ? "text-right" : "text-left",
    buttonContent: isRTL ? "flex-row-reverse" : "flex-row",
    badgeSpacing: isRTL ? "gap-2 flex-row-reverse" : "gap-2",
    searchIcon: isRTL ? "right-3" : "left-3",
    searchPadding: isRTL ? "pr-10 pl-4" : "pl-10 pr-4",
    dropdownAlign: isRTL ? "text-right" : "text-left",
    leaderboardItem: isRTL ? "flex-row-reverse" : "flex-row",
    leaderboardContent: isRTL ? "text-right" : "text-left",
    participantCard: isRTL ? "flex-col sm:flex-row-reverse" : "flex-col sm:flex-row",
    participantInfo: isRTL ? "flex-row-reverse" : "flex-row",
    participantStats: isRTL ? "text-right" : "text-left",
  }

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
        const response = await fetch(`${API_BASE_URL}/magasins/getMagasinsByEntrepriseId/${entrepriseId}`)
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
        const apiUrl = `${API_BASE_URL}/gamification/getChallengeByStore/${selectedMagasinId}`
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

        const response = await fetch(`${API_BASE_URL}/client/getClientByEntreprise/${entrepriseIdNum}`)
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
      const response = await fetch(`${API_BASE_URL}/gamification/getJoueursChallenge/${challengeId}`)
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

      const response = await fetch(`${API_BASE_URL}/gamification/addMultipleParticipations`, {
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
      const response = await fetch(`${API_BASE_URL}/gamification/participations/${selectedParticipationId}`, {
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
      <div className={`flex flex-col items-center justify-center h-64 ${rtlClasses.container}`} dir={textDirection}>
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        <p className={`text-slate-500 mt-2 ${rtlClasses.textAlign}`}>Chargement des données de gamification...</p>
      </div>
    )
  }

  return (
    <div className={`${rtlClasses.formSpacing} ${rtlClasses.container}`} dir={textDirection}>
      <Card>
        <CardHeader className={`${rtlClasses.textAlign} ${rtlClasses.cardPadding}`}>
          <CardTitle className={rtlClasses.textAlign}>
            {t("marketing.pilliersMagasins.gamification.gestion.selectMagasin")}
          </CardTitle>
        </CardHeader>
        <CardContent className={rtlClasses.cardPadding}>
          <Select
            value={selectedMagasinId ? String(selectedMagasinId) : ""}
            onValueChange={(value) => setSelectedMagasinId(value ? Number(value) : null)}
          >
            <SelectTrigger className={rtlClasses.selectTrigger}>
              <SelectValue placeholder={t("marketing.pilliersMagasins.gamification.gestion.choisirMag")} />
            </SelectTrigger>
            <SelectContent>
              {isLoadingMagasins ? (
                <SelectItem value="" disabled>
                  {t("marketing.pilliersMagasins.gamification.gestion.chargementMagasin")}
                </SelectItem>
              ) : magasins.length === 0 ? (
                <SelectItem value="" disabled>
                  {t("marketing.pilliersMagasins.gamification.gestion.aucunMagasin")}
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
        <CardHeader className={`${rtlClasses.textAlign} ${rtlClasses.cardPadding}`}>
          <CardTitle className={`text-lg sm:text-xl ${rtlClasses.textAlign}`}>
            {t("marketing.pilliersMagasins.gamification.gestion.enregistrerParticipants")}
          </CardTitle>
          <CardDescription className={`text-xs sm:text-sm ${rtlClasses.textAlign}`}>
            {t("marketing.pilliersMagasins.gamification.gestion.enregistrerParticipantsDescr")}
          </CardDescription>
        </CardHeader>
        <CardContent className={rtlClasses.cardPadding}>
          <form onSubmit={handleParticipate} className={rtlClasses.formSpacing}>
            <div>
              <Label htmlFor="select-challenge" className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}>
                {t("marketing.pilliersMagasins.gamification.gestion.selectChallengeActif")}
              </Label>
              <Select value={selectedChallengeId || ""} onValueChange={setSelectedChallengeId}>
                <SelectTrigger className={rtlClasses.selectTrigger}>
                  <SelectValue
                    placeholder={t("marketing.pilliersMagasins.gamification.gestion.selectionnerChallengePlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    console.log("Rendu du Select - activeChallenges:", activeChallenges)
                    console.log("Longueur activeChallenges:", activeChallenges.length)
                    return null
                  })()}
                  {activeChallenges.length === 0 ? (
                    <SelectItem value="no-challenges" disabled>
                      {t("marketing.pilliersMagasins.gamification.gestion.aucunChallengeDispo")}
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
              <Label htmlFor="select-clients" className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}>
                {t("marketing.pilliersMagasins.gamification.gestion.selectionnerClients")}
              </Label>

              {/* Clients sélectionnés */}
              {selectedClients.length > 0 && (
                <div className={`mb-3 p-3 border rounded-md bg-gray-50 ${rtlClasses.textAlign}`}>
                  <div className={`flex flex-wrap ${rtlClasses.badgeSpacing}`}>
                    {selectedClients.map((client) => {
                      const alreadyParticipating = participations.some(
                        (p) => p.clientId === client.id && p.challengeId === Number(selectedChallengeId),
                      )

                      return (
                        <Badge
                          key={client.id}
                          variant={alreadyParticipating ? "secondary" : "default"}
                          className={`flex ${rtlClasses.directionClass} ${rtlClasses.itemsCenter} gap-1 px-2 py-1`}
                        >
                          <User className="w-3 h-3" />
                          <span className="text-xs">
                            {client.prenom} {client.nom} ({client.code_client})
                          </span>
                          {alreadyParticipating && (
                            <span className="text-xs text-orange-600 ml-1">
                              {t("marketing.pilliersMagasins.gamification.gestion.dejaInscrit")}
                            </span>
                          )}
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
                  <Search
                    className={`absolute ${rtlClasses.searchIcon} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`}
                  />
                  <Input
                    type="text"
                    placeholder={t("marketing.pilliersMagasins.gamification.gestion.champRecherchePlaceholder")}
                    value={clientSearchTerm}
                    onChange={(e) => {
                      setClientSearchTerm(e.target.value)
                      setIsClientDropdownOpen(true)
                    }}
                    onFocus={() => setIsClientDropdownOpen(true)}
                    className={`${rtlClasses.searchPadding} ${rtlClasses.textAlign}`}
                    dir={textDirection}
                  />
                </div>

                {/* Liste déroulante des clients */}
                {isClientDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoadingClients ? (
                      <div className={`p-3 text-center text-gray-500 ${rtlClasses.textAlign}`}>
                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                        {t("marketing.pilliersMagasins.gamification.gestion.chargementClients")}
                      </div>
                    ) : filteredClients.length === 0 ? (
                      <div className={`p-3 text-center text-gray-500 ${rtlClasses.textAlign}`}>
                        {clientSearchTerm.trim()
                          ? t("marketing.pilliersMagasins.gamification.gestion.aucunClientTrouve")
                          : t("marketing.pilliersMagasins.gamification.gestion.aucunClientDispo")}
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
                            className={`w-full ${rtlClasses.dropdownAlign} p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                              isSelected ? "bg-blue-50 text-blue-700" : ""
                            } ${alreadyParticipating ? "opacity-60" : ""}`}
                          >
                            <div
                              className={`flex ${rtlClasses.directionClass} ${rtlClasses.itemsCenter} ${rtlClasses.justifyBetween}`}
                            >
                              <div className={rtlClasses.textAlign}>
                                <div className="font-medium text-sm">
                                  {client.prenom} {client.nom}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {t("marketing.pilliersMagasins.gamification.gestion.code")} {client.code_client}
                                </div>
                              </div>
                              <div className={`flex ${rtlClasses.directionClass} ${rtlClasses.itemsCenter} gap-2`}>
                                {isSelected && (
                                  <Badge variant="secondary" className="text-xs">
                                    {t("marketing.pilliersMagasins.gamification.gestion.selectionne")}
                                  </Badge>
                                )}
                                {alreadyParticipating && (
                                  <Badge variant="outline" className="text-xs text-orange-600">
                                    {t("marketing.pilliersMagasins.gamification.gestion.dejaInscrit")}
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

              <div
                className={`flex ${rtlClasses.directionClass} ${rtlClasses.justifyBetween} ${rtlClasses.itemsCenter} mt-2`}
              >
                <span className={`text-sm text-muted-foreground ${rtlClasses.textAlign}`}>
                  {selectedClientIds.length} {t("marketing.pilliersMagasins.gamification.gestion.clientsSelectionnes")}
                </span>
                <Button type="button" variant="outline" onClick={onNewClientClick}>
                  {t("marketing.pilliersMagasins.gamification.gestion.nouvClient")}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full flex ${rtlClasses.buttonContent} ${rtlClasses.itemsCenter} ${rtlClasses.justifyBetween}`}
              disabled={
                overallLoading ||
                activeChallenges.length === 0 ||
                clients.length === 0 ||
                selectedClientIds.length === 0
              }
            >
              {overallLoading ? (
                <div className={`flex ${rtlClasses.buttonContent} ${rtlClasses.itemsCenter} gap-2`}>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("marketing.pilliersMagasins.gamification.gestion.enregistrerLesParticipants")}</span>
                </div>
              ) : (
                t("marketing.pilliersMagasins.gamification.gestion.enregistrerLesParticipants")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Section: Mettre à jour la Progression */}
      <Card>
        <CardHeader className={`${rtlClasses.textAlign} ${rtlClasses.cardPadding}`}>
          <CardTitle className={`text-lg sm:text-xl ${rtlClasses.textAlign}`}>
            {t("marketing.pilliersMagasins.gamification.gestion.mettreAjourProgression")}
          </CardTitle>
          <CardDescription className={`text-xs sm:text-sm ${rtlClasses.textAlign}`}>
            {t("marketing.pilliersMagasins.gamification.gestion.mettreAjourProgressionDescr")}
          </CardDescription>
        </CardHeader>
        <CardContent className={rtlClasses.cardPadding}>
          <form onSubmit={handleUpdateParticipation} className={rtlClasses.formSpacing}>
            <div>
              <Label
                htmlFor="select-challenge-for-update"
                className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}
              >
                {t("marketing.pilliersMagasins.gamification.gestion.selectionnerChallenge")}
              </Label>
              <Select value={selectedLeaderboardChallengeId || ""} onValueChange={setSelectedLeaderboardChallengeId}>
                <SelectTrigger className={rtlClasses.selectTrigger}>
                  <SelectValue
                    placeholder={t("marketing.pilliersMagasins.gamification.gestion.selectionnerChallengePlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {challenges.length === 0 ? (
                    <SelectItem value="no-challenges" disabled>
                      {t("marketing.pilliersMagasins.gamification.gestion.aucunChallengeDispo")}
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
                <Label
                  htmlFor="select-participation-update"
                  className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}
                >
                  {t("marketing.pilliersMagasins.gamification.gestion.selectUneParticipation")}
                </Label>
                <Select value={selectedParticipationId || ""} onValueChange={handleSelectParticipationToUpdate}>
                  <SelectTrigger className={rtlClasses.selectTrigger}>
                    <SelectValue
                      placeholder={t(
                        "marketing.pilliersMagasins.gamification.gestion.selectUneParticipationPlaceholder",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingChallengeParticipants ? (
                      <SelectItem value="loading" disabled>
                        {t("marketing.pilliersMagasins.gamification.gestion.chargementDesParticipants")}
                      </SelectItem>
                    ) : challengeParticipants.length === 0 ? (
                      <SelectItem value="no-participations" disabled>
                        {t("marketing.pilliersMagasins.gamification.gestion.aucuParticpationTrouve")}
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
                  <Label htmlFor="progression" className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}>
                    {t("marketing.pilliersMagasins.gamification.gestion.progressoin")} (%)
                  </Label>
                  <Input
                    id="progression"
                    type="number"
                    value={participationProgression.replace("%", "")}
                    onChange={(e) => setParticipationProgression(e.target.value + "%")}
                    placeholder={t("marketing.pilliersMagasins.gamification.gestion.progressoinPlaceholder")}
                    min="0"
                    max="100"
                    className={rtlClasses.textAlign}
                    dir={textDirection}
                  />
                </div>

                <div>
                  <Label htmlFor="points-gained" className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}>
                    {t("marketing.pilliersMagasins.gamification.gestion.poinstGagnes")}
                  </Label>
                  <Input
                    type="number"
                    id="points-gained"
                    value={pointsGained}
                    onChange={(e) => setPointsGained(Number(e.target.value))}
                    min="0"
                    className={rtlClasses.textAlign}
                    dir={textDirection}
                  />
                </div>

                <Button
                  type="submit"
                  className={`w-full flex ${rtlClasses.buttonContent} ${rtlClasses.itemsCenter} ${rtlClasses.justifyBetween}`}
                  disabled={isLoadingChallengeParticipants}
                >
                  {isLoadingChallengeParticipants ? (
                    <div className={`flex ${rtlClasses.buttonContent} ${rtlClasses.itemsCenter} gap-2`}>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("marketing.pilliersMagasins.gamification.gestion.mettreAjourProgressoin")}</span>
                    </div>
                  ) : (
                    t("marketing.pilliersMagasins.gamification.gestion.mettreAjourProgressoin")
                  )}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Section: Leaderboard */}
      <Card>
        <CardHeader className={`${rtlClasses.textAlign} ${rtlClasses.cardPadding}`}>
          <CardTitle
            className={`flex ${rtlClasses.directionClass} ${rtlClasses.itemsCenter} gap-2 text-lg sm:text-xl ${rtlClasses.textAlign}`}
          >
            <Trophy className="w-5 h-5" />
            {t("marketing.pilliersMagasins.gamification.gestion.classementJoueurs")}
          </CardTitle>
          <CardDescription className={`text-xs sm:text-sm ${rtlClasses.textAlign}`}>
            {t("marketing.pilliersMagasins.gamification.gestion.classementJoueursDescr")}
          </CardDescription>
        </CardHeader>
        <CardContent className={rtlClasses.cardPadding}>
          <div className={rtlClasses.formSpacing}>
            {/* Sélecteur de challenge pour le classement */}
            <div className={`flex ${rtlClasses.directionClass} gap-2`}>
              <div className="flex-1">
                <Label
                  htmlFor="select-leaderboard-challenge"
                  className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}
                >
                  {t("marketing.pilliersMagasins.gamification.gestion.selectionnerChallenge")}
                </Label>
                <Select value={selectedLeaderboardChallengeId || ""} onValueChange={setSelectedLeaderboardChallengeId}>
                  <SelectTrigger className={rtlClasses.selectTrigger}>
                    <SelectValue
                      placeholder={t("marketing.pilliersMagasins.gamification.gestion.selectChallengeParticipant")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {challenges.length === 0 ? (
                      <SelectItem value="no-challenges" disabled>
                        {t("marketing.pilliersMagasins.gamification.gestion.aucunChallengeDispo")}
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
                    className={`flex ${rtlClasses.directionClass} ${rtlClasses.itemsCenter} gap-2 bg-transparent`}
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshingLeaderboard ? "animate-spin" : ""}`} />
                    {isRefreshingLeaderboard
                      ? t("marketing.pilliersMagasins.gamification.gestion.actualisation")
                      : t("marketing.pilliersMagasins.gamification.gestion.actualiser")}
                  </Button>
                </div>
              )}
            </div>

            {/* Affichage du classement */}
            {!selectedLeaderboardChallengeId ? (
              <p className={`text-center text-muted-foreground py-8 ${rtlClasses.textAlign}`}>
                {t("marketing.pilliersMagasins.gamification.gestion.selectChallengeParticipant")}
              </p>
            ) : isLoadingChallengeParticipants ? (
              <div className="flex flex-col items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                <p className={`text-slate-500 mt-2 ${rtlClasses.textAlign}`}>
                  {t("marketing.pilliersMagasins.gamification.gestion.chargementClassement")}
                </p>
              </div>
            ) : challengeParticipants.length === 0 ? (
              <p className={`text-center text-muted-foreground py-4 ${rtlClasses.textAlign}`}>
                {t("marketing.pilliersMagasins.gamification.gestion.aucunParticipantChallenge")}
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-2">
                <div
                  className={`flex ${rtlClasses.directionClass} ${rtlClasses.justifyBetween} ${rtlClasses.itemsCenter} mb-2 sticky top-0 bg-white z-10 pb-2`}
                >
                  <span className={`text-sm font-medium text-gray-600 ${rtlClasses.textAlign}`}>
                    {challengeParticipants.length} {t("marketing.pilliersMagasins.gamification.gestion.participants")}
                  </span>
                  <div className={`flex ${rtlClasses.directionClass} gap-2`}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const container = document.querySelector(".max-h-96.overflow-y-auto")
                        if (container) container.scrollTo({ top: 0, behavior: "smooth" })
                      }}
                    >
                      ↑ {t("marketing.pilliersMagasins.gamification.gestion.haut")}
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
                      ↓ {t("marketing.pilliersMagasins.gamification.gestion.bas")}
                    </Button>
                  </div>
                </div>

                {challengeParticipants.map((participant, index) => {
                  const rank = index + 1
                  const progressionValue = Number.parseFloat(participant.progression.replace("%", "")) || 0

                  return (
                    <div
                      key={`${participant.client_id}-${participant.id}`}
                      className={`flex ${rtlClasses.participantCard} sm:${rtlClasses.itemsCenter} sm:${rtlClasses.justifyBetween} p-3 border rounded-lg gap-2 hover:bg-gray-50 transition-colors bg-white`}
                    >
                      <div className={`flex ${rtlClasses.participantInfo} ${rtlClasses.itemsCenter} gap-3`}>
                        <span className="text-xl sm:text-2xl">
                          {rank === 1 ? "🏆" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "⭐"}
                        </span>
                        <div className={rtlClasses.textAlign}>
                          <h4 className="font-medium text-sm sm:text-base">
                            {participant.client.prenom} {participant.client.nom}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600">#{rank}</p>
                        </div>
                      </div>
                      <div className={`${rtlClasses.participantStats} sm:${rtlClasses.textAlignOpposite}`}>
                        <div className="font-semibold text-purple-600 text-sm sm:text-base">
                          {participant.progression}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600">
                          {participant.points_gagnes} {t("marketing.pilliersMagasins.gamification.gestion.points")}
                        </div>
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
