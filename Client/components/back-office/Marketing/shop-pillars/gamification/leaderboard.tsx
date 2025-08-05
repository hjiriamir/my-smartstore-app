"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Trophy, Medal, Star, Crown, Users, TrendingUp, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"

// Interfaces pour les données API
interface Client {
  id: number
  code_client: string
  nom: string
  prenom: string
  email: string
  telephone: string
  adresse: string
  ville: string
  entreprise_id: number
  pays: string
  date_naissance: string | null
  genre: string
  date_creation: string
}

interface PointsTotauxResponse {
  totalPoints: number
  details: {
    client_id: number
    points_total: number
  }[]
}

interface ChallengeActif {
  id: number
  nom: string
  description: string
  type: string
  date_debut: string
  date_fin: string
  recompense: string
  magasin_id: number
}

interface ChallengesActifsResponse {
  totalChallenges: number
  details: ChallengeActif[]
}

interface TauxParticipationResponse {
  totalClients: number
  totalParticipants: number
  tauxParticipation: string
}

interface ClientOrderedResponse {
  id: number
  client_id: number
  points_total: number
  rang: number
  client: {
    id: number
    code_client: string
    nom: string
    prenom: string
    email: string
  }
}

interface JoueurChallenge {
  id: number
  challenge_id: number
  client_id: number
  progression: string
  points_gagnes: number
  date_participation: string
  client: {
    id: number
    nom: string
    prenom: string
    email: string
  }
}

interface LeaderboardProps {
  entrepriseId: string | null
}

export function Leaderboard({ entrepriseId }: LeaderboardProps) {
  const { toast } = useToast()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  // États pour les données
  const [clients, setClients] = useState<Client[]>([])
  const [pointsTotaux, setPointsTotaux] = useState<PointsTotauxResponse | null>(null)
  const [challengesActifs, setChallengesActifs] = useState<ChallengesActifsResponse | null>(null)
  const [tauxParticipation, setTauxParticipation] = useState<TauxParticipationResponse | null>(null)
  const [clientsOrdered, setClientsOrdered] = useState<ClientOrderedResponse[]>([])
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null)
  const [challengeParticipants, setChallengeParticipants] = useState<JoueurChallenge[]>([])

  // États de chargement
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [isLoadingPointsTotaux, setIsLoadingPointsTotaux] = useState(false)
  const [isLoadingChallengesActifs, setIsLoadingChallengesActifs] = useState(false)
  const [isLoadingTauxParticipation, setIsLoadingTauxParticipation] = useState(false)
  const [isLoadingClientsOrdered, setIsLoadingClientsOrdered] = useState(false)
  const [isLoadingChallengeParticipants, setIsLoadingChallengeParticipants] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // États d'erreur
  const [errorClients, setErrorClients] = useState<string | null>(null)
  const [errorPointsTotaux, setErrorPointsTotaux] = useState<string | null>(null)
  const [errorChallengesActifs, setErrorChallengesActifs] = useState<string | null>(null)
  const [errorTauxParticipation, setErrorTauxParticipation] = useState<string | null>(null)
  const [errorClientsOrdered, setErrorClientsOrdered] = useState<string | null>(null)
  const [errorChallengeParticipants, setErrorChallengeParticipants] = useState<string | null>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  // Fonction pour récupérer les clients
  const fetchClients = async () => {
    if (!entrepriseId) return

    setIsLoadingClients(true)
    setErrorClients(null)

    try {
      const response = await fetch(`${API_BASE_URL}/client/getClientByEntreprise/${entrepriseId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: Client[] = await response.json()
      setClients(data)
    } catch (error: any) {
      console.error("Error fetching clients:", error)
      setErrorClients(error.message || "Erreur lors de la récupération des clients")
      setClients([])
    } finally {
      setIsLoadingClients(false)
    }
  }

  // Fonction pour récupérer les points totaux
  const fetchPointsTotaux = async () => {
    if (!entrepriseId) return

    setIsLoadingPointsTotaux(true)
    setErrorPointsTotaux(null)

    try {
      const response = await fetch(`${API_BASE_URL}/gamification/getPointsTotaux/${entrepriseId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: PointsTotauxResponse = await response.json()
      setPointsTotaux(data)
    } catch (error: any) {
      console.error("Error fetching points totaux:", error)
      setErrorPointsTotaux(error.message || "Erreur lors de la récupération des points totaux")
      setPointsTotaux(null)
    } finally {
      setIsLoadingPointsTotaux(false)
    }
  }

  // Fonction pour récupérer les challenges actifs
  const fetchChallengesActifs = async () => {
    if (!entrepriseId) return

    setIsLoadingChallengesActifs(true)
    setErrorChallengesActifs(null)

    try {
      const response = await fetch(`${API_BASE_URL}/gamification/getChallengeActifs/${entrepriseId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: ChallengesActifsResponse = await response.json()
      setChallengesActifs(data)
    } catch (error: any) {
      console.error("Error fetching challenges actifs:", error)
      setErrorChallengesActifs(error.message || "Erreur lors de la récupération des challenges actifs")
      setChallengesActifs(null)
    } finally {
      setIsLoadingChallengesActifs(false)
    }
  }

  // Fonction pour récupérer le taux de participation
  const fetchTauxParticipation = async () => {
    if (!entrepriseId) return

    setIsLoadingTauxParticipation(true)
    setErrorTauxParticipation(null)

    try {
      const response = await fetch(`${API_BASE_URL}/gamification/getTauxParticipationClients/${entrepriseId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: TauxParticipationResponse = await response.json()
      setTauxParticipation(data)
    } catch (error: any) {
      console.error("Error fetching taux participation:", error)
      setErrorTauxParticipation(error.message || "Erreur lors de la récupération du taux de participation")
      setTauxParticipation(null)
    } finally {
      setIsLoadingTauxParticipation(false)
    }
  }

  // Fonction pour récupérer le classement des clients
  const fetchClientsOrdered = async () => {
    if (!entrepriseId) return

    setIsLoadingClientsOrdered(true)
    setErrorClientsOrdered(null)

    try {
      const response = await fetch(`${API_BASE_URL}/gamification/getClientOrderer/${entrepriseId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: ClientOrderedResponse[] = await response.json()
      setClientsOrdered(data)
    } catch (error: any) {
      console.error("Error fetching clients ordered:", error)
      setErrorClientsOrdered(error.message || "Erreur lors de la récupération du classement des clients")
      setClientsOrdered([])
    } finally {
      setIsLoadingClientsOrdered(false)
    }
  }

  // Fonction pour récupérer les participants d'un challenge
  const fetchChallengeParticipants = async (challengeId: string) => {
    setIsLoadingChallengeParticipants(true)
    setErrorChallengeParticipants(null)

    try {
      const response = await fetch(`${API_BASE_URL}/gamification/getJoueursChallenge/${challengeId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: JoueurChallenge[] = await response.json()

      // Trier par progression décroissante puis par points décroissants
      const sortedData = data.sort((a, b) => {
        const progressionA = Number.parseFloat(a.progression.replace("%", "")) || 0
        const progressionB = Number.parseFloat(b.progression.replace("%", "")) || 0

        if (progressionB !== progressionA) {
          return progressionB - progressionA
        }
        return b.points_gagnes - a.points_gagnes
      })

      setChallengeParticipants(sortedData)
    } catch (error: any) {
      console.error("Error fetching challenge participants:", error)
      setErrorChallengeParticipants(error.message || "Erreur lors de la récupération des participants du challenge")
      setChallengeParticipants([])
    } finally {
      setIsLoadingChallengeParticipants(false)
    }
  }

  // Fonction pour actualiser toutes les données
  const refreshAllData = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        fetchClients(),
        fetchPointsTotaux(),
        fetchChallengesActifs(),
        fetchTauxParticipation(),
        fetchClientsOrdered(),
      ])

      if (selectedChallengeId) {
        await fetchChallengeParticipants(selectedChallengeId)
      }

      toast({
        title: "✅ Données actualisées !",
        description: "Toutes les données du leaderboard ont été mises à jour.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'actualisation",
        description: "Impossible d'actualiser certaines données.",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Effet pour charger les données initiales
  useEffect(() => {
    if (entrepriseId) {
      fetchClients()
      fetchPointsTotaux()
      fetchChallengesActifs()
      fetchTauxParticipation()
      fetchClientsOrdered()
    }
  }, [entrepriseId])

  // Effet pour charger les participants du challenge sélectionné
  useEffect(() => {
    if (selectedChallengeId) {
      fetchChallengeParticipants(selectedChallengeId)
    } else {
      setChallengeParticipants([])
    }
  }, [selectedChallengeId])

  // Fonction pour obtenir l'icône de rang
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return <Star className="w-5 h-5 text-blue-500" />
    }
  }

  // Fonction pour obtenir la couleur du badge selon le rang
  const getRankBadgeVariant = (rank: number): "default" | "secondary" | "destructive" | "outline" => {
    switch (rank) {
      case 1:
        return "default"
      case 2:
        return "secondary"
      case 3:
        return "outline"
      default:
        return "outline"
    }
  }

  if (!entrepriseId) {
    return (
      <div
        className={`text-center text-muted-foreground py-8 ${isRTL ? "text-right" : "text-left"}`}
        dir={textDirection}
      >
        <p>{t("marketing.pilliersMagasins.gamification.classement.aucuneEntrepriseSelectionnee")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6" dir={textDirection}>
      {/* Bouton d'actualisation */}
      <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
        <Button
          onClick={refreshAllData}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 bg-transparent ${isRTL ? "flex-row-reverse" : "flex-row"}`}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing
            ? t("marketing.pilliersMagasins.gamification.gestion.actualisation")
            : t("marketing.pilliersMagasins.gamification.gestion.actualiser")}
        </Button>
      </div>

      {/* Stats Cards pour LeaderBoard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader
            className={`flex ${isRTL ? "flex-row-reverse" : "flex-row"} items-center justify-between space-y-0 pb-2`}
          >
            <CardTitle className={`text-sm font-semibold ${isRTL ? "text-right" : "text-left"}`}>
              {t("marketing.pilliersMagasins.gamification.classement.totalClients")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className={isRTL ? "text-right" : "text-left"}>
            {isLoadingClients ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            ) : errorClients ? (
              <div className="text-red-500 text-xs">
                {t("marketing.pilliersMagasins.gamification.classement.erreur")}
              </div>
            ) : (
              <div className="text-2xl font-bold">{clients.length}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {t("marketing.pilliersMagasins.gamification.classement.clientsActifs")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            className={`flex ${isRTL ? "flex-row-reverse" : "flex-row"} items-center justify-between space-y-0 pb-2`}
          >
            <CardTitle className={`text-sm font-semibold ${isRTL ? "text-right" : "text-left"}`}>
              {t("marketing.pilliersMagasins.gamification.classement.pointsTotaux")}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className={isRTL ? "text-right" : "text-left"}>
            {isLoadingPointsTotaux ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            ) : errorPointsTotaux ? (
              <div className="text-red-500 text-xs">
                {t("marketing.pilliersMagasins.gamification.classement.erreur")}
              </div>
            ) : (
              <div className="text-2xl font-bold">{pointsTotaux?.totalPoints?.toLocaleString() || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {t("marketing.pilliersMagasins.gamification.classement.pointsDistribuer")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            className={`flex ${isRTL ? "flex-row-reverse" : "flex-row"} items-center justify-between space-y-0 pb-2`}
          >
            <CardTitle className={`text-sm font-semibold ${isRTL ? "text-right" : "text-left"}`}>
              {t("marketing.pilliersMagasins.gamification.classement.challengeActifs")}
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className={isRTL ? "text-right" : "text-left"}>
            {isLoadingChallengesActifs ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            ) : errorChallengesActifs ? (
              <div className="text-red-500 text-xs">
                {t("marketing.pilliersMagasins.gamification.classement.erreur")}
              </div>
            ) : (
              <div className="text-2xl font-bold">{challengesActifs?.totalChallenges || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {t("marketing.pilliersMagasins.gamification.classement.enCours")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            className={`flex ${isRTL ? "flex-row-reverse" : "flex-row"} items-center justify-between space-y-0 pb-2`}
          >
            <CardTitle className={`text-sm font-semibold ${isRTL ? "text-right" : "text-left"}`}>
              {t("marketing.pilliersMagasins.gamification.classement.tauxParticipatoin")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className={isRTL ? "text-right" : "text-left"}>
            {isLoadingTauxParticipation ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            ) : errorTauxParticipation ? (
              <div className="text-red-500 text-xs">
                {t("marketing.pilliersMagasins.gamification.classement.erreur")}
              </div>
            ) : (
              <div className="text-2xl font-bold">
                {tauxParticipation?.tauxParticipation
                  ? `${Number.parseFloat(tauxParticipation.tauxParticipation).toFixed(1)}%`
                  : "0%"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {t("marketing.pilliersMagasins.gamification.classement.clientsEngages")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Classement Général des Clients */}
      <Card>
        <CardHeader className={isRTL ? "text-right" : "text-left"}>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
            <Crown className="w-5 h-5 text-yellow-500" />
            {t("marketing.pilliersMagasins.gamification.classement.classementGeneralClients")}
          </CardTitle>
          <CardDescription>
            {t("marketing.pilliersMagasins.gamification.classement.classementGeneralClientsDescr")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingClientsOrdered ? (
            <div className="flex flex-col items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              <p className="text-slate-500 mt-2">
                {t("marketing.pilliersMagasins.gamification.classement.chargementClassement")}
              </p>
            </div>
          ) : errorClientsOrdered ? (
            <p className={`text-red-500 text-center py-8 ${isRTL ? "text-right" : "text-left"}`}>
              {errorClientsOrdered}
            </p>
          ) : clientsOrdered.length === 0 ? (
            <p className={`text-center text-muted-foreground py-8 ${isRTL ? "text-right" : "text-left"}`}>
              {t("marketing.pilliersMagasins.gamification.classement.aucunClassementDispo")}
            </p>
          ) : (
            <div className="space-y-4">
              {clientsOrdered.map((clientData) => (
                <div
                  key={clientData.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${isRTL ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                      {getRankIcon(clientData.rang)}
                      <Badge variant={getRankBadgeVariant(clientData.rang)} className="text-xs">
                        #{clientData.rang}
                      </Badge>
                    </div>
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <h4 className="font-semibold text-sm sm:text-base">
                        {clientData.client.prenom} {clientData.client.nom}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {t("marketing.pilliersMagasins.gamification.gestion.code")} {clientData.client.code_client}
                      </p>
                    </div>
                  </div>
                  <div className={isRTL ? "text-left" : "text-right"}>
                    <div className="text-lg font-bold text-purple-600">
                      {clientData.points_total.toLocaleString()}{" "}
                      {t("marketing.pilliersMagasins.gamification.classement.pts")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Classements par Challenge */}
      <Card>
        <CardHeader className={isRTL ? "text-right" : "text-left"}>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
            <Trophy className="w-5 h-5 text-blue-500" />
            {t("marketing.pilliersMagasins.gamification.classement.classementParChallenge")}
          </CardTitle>
          <CardDescription>
            {t("marketing.pilliersMagasins.gamification.classement.classementParChallengeDescr")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sélecteur de challenge */}
            <div>
              <Select value={selectedChallengeId || ""} onValueChange={setSelectedChallengeId}>
                <SelectTrigger className={isRTL ? "text-right" : "text-left"}>
                  <SelectValue
                    placeholder={t(
                      "marketing.pilliersMagasins.gamification.classement.classementParChallengePlaceholder",
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingChallengesActifs ? (
                    <SelectItem value="loading" disabled>
                      {t("marketing.pilliersMagasins.gamification.classement.chargementChallenge")}
                    </SelectItem>
                  ) : challengesActifs?.details.length === 0 ? (
                    <SelectItem value="no-challenges" disabled>
                      {t("marketing.pilliersMagasins.gamification.classement.aucChallenge")}
                    </SelectItem>
                  ) : (
                    challengesActifs?.details.map((challenge) => (
                      <SelectItem key={challenge.id} value={String(challenge.id)}>
                        {challenge.nom} ({challenge.type})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Affichage du classement du challenge sélectionné */}
            {!selectedChallengeId ? (
              <p className={`text-center text-muted-foreground py-8 ${isRTL ? "text-right" : "text-left"}`}>
                {t("marketing.pilliersMagasins.gamification.classement.selectChallengeClassement")}
              </p>
            ) : isLoadingChallengeParticipants ? (
              <div className="flex flex-col items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                <p className="text-slate-500 mt-2">
                  {t("marketing.pilliersMagasins.gamification.classement.chargementChallClassement")}
                </p>
              </div>
            ) : errorChallengeParticipants ? (
              <p className={`text-red-500 text-center py-8 ${isRTL ? "text-right" : "text-left"}`}>
                {errorChallengeParticipants}
              </p>
            ) : challengeParticipants.length === 0 ? (
              <p className={`text-center text-muted-foreground py-8 ${isRTL ? "text-right" : "text-left"}`}>
                {t("marketing.pilliersMagasins.gamification.classement.aucunParticipantParChallenge")}
              </p>
            ) : (
              <div className="space-y-3">
                {challengeParticipants.map((participant, index) => {
                  const rank = index + 1
                  return (
                    <div
                      key={participant.id}
                      className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${isRTL ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                          {getRankIcon(rank)}
                          <Badge variant={getRankBadgeVariant(rank)} className="text-xs">
                            #{rank}
                          </Badge>
                        </div>
                        <div className={isRTL ? "text-right" : "text-left"}>
                          <h4 className="font-medium text-sm">
                            {participant.client.prenom} {participant.client.nom}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {t("marketing.pilliersMagasins.gamification.classement.participerLe")}{" "}
                            {new Date(participant.date_participation).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <div className={isRTL ? "text-left" : "text-right"}>
                        <div className="font-semibold text-purple-600">{participant.progression}</div>
                        <div className="text-xs text-muted-foreground">
                          {participant.points_gagnes} {t("marketing.pilliersMagasins.gamification.gestion.points")}
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
