"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Clock, BookOpen, X, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function TrainingContent() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  const [currentUserEntrepriseId, setCurrentUserEntrepriseId] = useState<number | null>(null)
  const [trainings, setTrainings] = useState<any[]>([])
  const [filteredTrainings, setFilteredTrainings] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState({
    trainings: false,
    create: false,
    activeUsers: false, // Ajout du statut de chargement pour les utilisateurs actifs
  })
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const [newTraining, setNewTraining] = useState({
    titre: "",
    description: "",
    url_video: "",
    url_pdf: "",
  })

  const [currentMedia, setCurrentMedia] = useState<{
    type: "video" | "pdf" | null
    url: string | null
    title: string | null
  }>({ type: null, url: null, title: null })

  const [activeUsers, setActiveUsers] = useState<{
    count: number
    rows: any[]
  }>({ count: 0, rows: [] }) // État pour stocker les utilisateurs actifs

  // Récupérer l'utilisateur connecté et son entreprise
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
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
          throw new Error("Erreur lors de la récupération de l'utilisateur")
        }

        const data = await response.json()
        const entrepriseId = data.user?.entreprises_id || data.entreprises_id

        setCurrentUserEntrepriseId(entrepriseId)
      } catch (error) {
        console.error("Error fetching current user:", error)
        setError("Erreur lors de la récupération de l'utilisateur")
      }
    }

    fetchCurrentUser()
  }, [])

  // Récupérer les formations de l'entreprise
  useEffect(() => {
    if (!currentUserEntrepriseId) return

    const fetchTrainings = async () => {
      try {
        setLoading((prev) => ({ ...prev, trainings: true }))
        const token = localStorage.getItem("token")

        const response = await fetch(
          `${API_BASE_URL}/formations/getFormationsByEntreprise/${currentUserEntrepriseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des formations")
        }

        const data = await response.json()
        setTrainings(data.rows)
        setFilteredTrainings(data.rows)
      } catch (error) {
        console.error("Error fetching trainings:", error)
        setError("Erreur lors de la récupération des formations")
      } finally {
        setLoading((prev) => ({ ...prev, trainings: false }))
      }
    }

    fetchTrainings()
  }, [currentUserEntrepriseId])

  // Récupérer les utilisateurs actifs de l'entreprise
  useEffect(() => {
    if (!currentUserEntrepriseId) return

    const fetchActiveUsers = async () => {
      try {
        setLoading((prev) => ({ ...prev, activeUsers: true }))
        const token = localStorage.getItem("token")

        const response = await fetch(`${API_BASE_URL}/auth1/getActifUsersByEntreprise/${currentUserEntrepriseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des utilisateurs actifs")
        }

        const data = await response.json()
        setActiveUsers(data)
      } catch (error) {
        console.error("Error fetching active users:", error)
        setError("Erreur lors de la récupération des utilisateurs actifs")
      } finally {
        setLoading((prev) => ({ ...prev, activeUsers: false }))
      }
    }

    fetchActiveUsers()
  }, [currentUserEntrepriseId])

  // Filtrer les formations en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredTrainings(trainings)
    } else {
      const filtered = trainings.filter(
        (training) =>
          training.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          training.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredTrainings(filtered)
    }
  }, [searchTerm, trainings])

  const handleCreateTraining = async () => {
    try {
      setLoading((prev) => ({ ...prev, create: true }))
      const token = localStorage.getItem("token")

      const response = await fetch(`${API_BASE_URL}/formations/createFormation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newTraining,
          entreprise_id: currentUserEntrepriseId,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la formation")
      }

      const data = await response.json()

      // Rafraîchir la liste des formations
      if (currentUserEntrepriseId) {
        const refreshResponse = await fetch(
          `${API_BASE_URL}/formations/getFormationsByEntreprise/${currentUserEntrepriseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          setTrainings(refreshData.rows)
          setFilteredTrainings(refreshData.rows)
        }
      }

      setIsDialogOpen(false)
      setNewTraining({
        titre: "",
        description: "",
        url_video: "",
        url_pdf: "",
      })
    } catch (error) {
      console.error("Error creating training:", error)
      setError("Erreur lors de la création de la formation")
    } finally {
      setLoading((prev) => ({ ...prev, create: false }))
    }
  }

  const getStatusBadge = (url_video: string | null, url_pdf: string | null) => {
    if (url_video && url_pdf) {
      return (
        <Badge variant="default" className="text-xs">
          Vidéo & PDF
        </Badge>
      )
    } else if (url_video) {
      return (
        <Badge variant="default" className="text-xs">
          Vidéo
        </Badge>
      )
    } else if (url_pdf) {
      return (
        <Badge variant="default" className="text-xs">
          PDF
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-xs">
        Aucun média
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR")
  }

  // Fonction pour afficher le média dans la plateforme
  const handleAccessTraining = (training: any) => {
    if (training.url_video) {
      setCurrentMedia({
        type: "video",
        url: training.url_video,
        title: training.titre,
      })
    } else if (training.url_pdf) {
      setCurrentMedia({
        type: "pdf",
        url: training.url_pdf,
        title: training.titre,
      })
    }
  }

  // Fonction pour fermer le média affiché
  const closeMediaViewer = () => {
    setCurrentMedia({ type: null, url: null, title: null })
  }

  return (
    <div className="space-y-4 sm:space-y-6" dir={textDirection}>
      {/* Viewer de média */}
      {currentMedia.type && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] flex flex-col">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b">
              <h3 className="text-base sm:text-lg font-semibold truncate mr-4">{currentMedia.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeMediaViewer}
                className="text-gray-500 hover:text-gray-700 flex-shrink-0"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-2 sm:p-4">
              {currentMedia.type === "video" && (
                <div className="aspect-video w-full">
                  <iframe
                    src={currentMedia.url || ""}
                    className="w-full h-full rounded"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              {currentMedia.type === "pdf" && (
                <iframe
                  src={currentMedia.url || ""}
                  className="w-full h-full min-h-[70vh] rounded"
                  frameBorder="0"
                ></iframe>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-2 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("back.gestionFormation.gestionForm")}</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">{t("back.gestionFormation.gestionFormDescr")}</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {t("back.gestionFormation.nouvForm")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">{t("back.gestionFormation.creerForm")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="titre" className="sm:text-right text-sm font-medium">
                  {t("back.gestionFormation.titre")}
                </Label>
                <Input
                  id="titre"
                  value={newTraining.titre}
                  onChange={(e) => setNewTraining({ ...newTraining, titre: e.target.value })}
                  className="sm:col-span-3 text-sm sm:text-base"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                <Label htmlFor="description" className="sm:text-right text-sm font-medium sm:mt-2">
                  {t("back.gestionFormation.description")}
                </Label>
                <Textarea
                  id="description"
                  value={newTraining.description}
                  onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
                  className="sm:col-span-3 text-sm sm:text-base resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="url_video" className="sm:text-right text-sm font-medium">
                  {t("back.gestionFormation.urlVideo")}
                </Label>
                <Input
                  id="url_video"
                  value={newTraining.url_video}
                  onChange={(e) => setNewTraining({ ...newTraining, url_video: e.target.value })}
                  className="sm:col-span-3 text-sm sm:text-base"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="url_pdf" className="sm:text-right text-sm font-medium">
                  {t("back.gestionFormation.urlPDF")}
                </Label>
                <Input
                  id="url_pdf"
                  value={newTraining.url_pdf}
                  onChange={(e) => setNewTraining({ ...newTraining, url_pdf: e.target.value })}
                  className="sm:col-span-3 text-sm sm:text-base"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="text-sm sm:text-base">
                {t("back.gestionFormation.annuler")}
              </Button>
              <Button
                onClick={handleCreateTraining}
                disabled={loading.create || !newTraining.titre || !newTraining.description}
                className="text-sm sm:text-base"
              >
                {loading.create ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 px-2 sm:px-0">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("back.gestionFormation.totalForm")}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{trainings.length}</div>
            <p className="text-xs text-muted-foreground">{t("back.gestionFormation.ceMois")}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("back.gestionFormation.participantsActif")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {loading.activeUsers ? <Loader2 className="h-6 w-6 animate-spin" /> : activeUsers.count}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading.activeUsers ? "" : `+${activeUsers.count} ${t("back.gestionFormation.ceMois1")}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Formations List */}
      <Card className="shadow-sm px-2 sm:px-0">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">{t("back.gestionFormation.listeForm")}</CardTitle>
          <CardDescription className="text-sm sm:text-base">{t("back.gestionFormation.gererForm")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder={t("back.gestionFormation.rechercherForm")}
              className="max-w-full sm:max-w-sm text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading.trainings ? (
            <div className="flex justify-center items-center h-32 flex-col gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm sm:text-base">{t("back.gestionFormation.chargementForm")}</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-red-500 text-sm sm:text-base">{error}</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredTrainings.map((training) => (
                <div key={training.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">
                          {training.titre}
                        </h3>
                        {getStatusBadge(training.url_video, training.url_pdf)}
                      </div>
                      <p className="text-gray-600 mb-3 text-xs sm:text-sm leading-relaxed">{training.description}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          {t("back.gestionFormation.creeLe")} {formatDate(training.date_creation)}
                        </div>
                        {training.duree && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            {t("back.gestionFormation.duree")} {training.duree} min
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAccessTraining(training)}
                        disabled={!training.url_video && !training.url_pdf}
                        className="text-xs sm:text-sm"
                      >
                        {t("back.gestionFormation.acceder")}
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                        {t("back.gestionFormation.statistiques")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
