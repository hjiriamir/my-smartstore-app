"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Trophy, Medal, Star, Crown, Users, TrendingUp, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

  // Fonction pour récupérer les clients
  const fetchClients = async () => {
    if (!entrepriseId) return

    setIsLoadingClients(true)
    setErrorClients(null)

    try {
      const response = await fetch(`http://localhost:8081/api/client/getClientByEntreprise/${entrepriseId}`)
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
      const response = await fetch(`http://localhost:8081/api/gamification/getPointsTotaux/${entrepriseId}`)
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
      const response = await fetch(`http://localhost:8081/api/gamification/getChallengeActifs/${entrepriseId}`)
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
      const response = await fetch(`http://localhost:8081/api/gamification/getTauxParticipationClients/${entrepriseId}`)
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
      const response = await fetch(`http://localhost:8081/api/gamification/getClientOrderer/${entrepriseId}`)
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
      const response = await fetch(`http://localhost:8081/api/gamification/getJoueursChallenge/${challengeId}`)
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
      <div className="text-center text-muted-foreground py-8">
        <p>Aucune entreprise sélectionnée pour afficher les classements.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Bouton d'actualisation */}
      <div className="flex justify-end">
        <Button
          onClick={refreshAllData}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-transparent"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Actualisation..." : "Actualiser"}
        </Button>
      </div>

      {/* Stats Cards pour LeaderBoard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingClients ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            ) : errorClients ? (
              <div className="text-red-500 text-xs">Erreur</div>
            ) : (
              <div className="text-2xl font-bold">{clients.length}</div>
            )}
            <p className="text-xs text-muted-foreground">Clients actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Points Totaux</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingPointsTotaux ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            ) : errorPointsTotaux ? (
              <div className="text-red-500 text-xs">Erreur</div>
            ) : (
              <div className="text-2xl font-bold">{pointsTotaux?.totalPoints?.toLocaleString() || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Points distribués</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Challenges Actifs</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingChallengesActifs ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            ) : errorChallengesActifs ? (
              <div className="text-red-500 text-xs">Erreur</div>
            ) : (
              <div className="text-2xl font-bold">{challengesActifs?.totalChallenges || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">En cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Taux Participation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingTauxParticipation ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            ) : errorTauxParticipation ? (
              <div className="text-red-500 text-xs">Erreur</div>
            ) : (
              <div className="text-2xl font-bold">
                {tauxParticipation?.tauxParticipation
                  ? `${Number.parseFloat(tauxParticipation.tauxParticipation).toFixed(1)}%`
                  : "0%"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Clients engagés</p>
          </CardContent>
        </Card>
      </div>

      {/* Classement Général des Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Classement Général des Clients
          </CardTitle>
          <CardDescription>Classement basé sur les points totaux cumulés</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingClientsOrdered ? (
            <div className="flex flex-col items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              <p className="text-slate-500 mt-2">Chargement du classement...</p>
            </div>
          ) : errorClientsOrdered ? (
            <p className="text-red-500 text-center py-8">{errorClientsOrdered}</p>
          ) : clientsOrdered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun classement disponible pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {clientsOrdered.map((clientData) => (
                <div
                  key={clientData.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getRankIcon(clientData.rang)}
                      <Badge variant={getRankBadgeVariant(clientData.rang)} className="text-xs">
                        #{clientData.rang}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base">
                        {clientData.client.prenom} {clientData.client.nom}
                      </h4>
                      <p className="text-xs text-muted-foreground">Code: {clientData.client.code_client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">
                      {clientData.points_total.toLocaleString()} pts
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blue-500" />
            Classements par Challenge
          </CardTitle>
          <CardDescription>Performance des participants dans chaque challenge</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sélecteur de challenge */}
            <div>
              <Select value={selectedChallengeId || ""} onValueChange={setSelectedChallengeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un challenge pour voir le classement" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingChallengesActifs ? (
                    <SelectItem value="loading" disabled>
                      Chargement des challenges...
                    </SelectItem>
                  ) : challengesActifs?.details.length === 0 ? (
                    <SelectItem value="no-challenges" disabled>
                      Aucun challenge actif disponible
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
              <p className="text-center text-muted-foreground py-8">
                Sélectionnez un challenge pour voir le classement des participants.
              </p>
            ) : isLoadingChallengeParticipants ? (
              <div className="flex flex-col items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                <p className="text-slate-500 mt-2">Chargement du classement du challenge...</p>
              </div>
            ) : errorChallengeParticipants ? (
              <p className="text-red-500 text-center py-8">{errorChallengeParticipants}</p>
            ) : challengeParticipants.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucun participant trouvé pour ce challenge.</p>
            ) : (
              <div className="space-y-3">
                {challengeParticipants.map((participant, index) => {
                  const rank = index + 1
                  return (
                    <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getRankIcon(rank)}
                          <Badge variant={getRankBadgeVariant(rank)} className="text-xs">
                            #{rank}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">
                            {participant.client.prenom} {participant.client.nom}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Participé le {new Date(participant.date_participation).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-purple-600">{participant.progression}</div>
                        <div className="text-xs text-muted-foreground">{participant.points_gagnes} points</div>
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
