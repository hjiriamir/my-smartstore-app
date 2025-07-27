"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertTriangle, Camera, MessageSquare, Upload, Calendar, User, Menu, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import axios from "axios"
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"

interface PlanogramImplementation {
  id: number
  planogram_id: number
  magasin_id: string
  idUser: number
  statut: "terminé" | "en cours" | "à faire" | "en retard"
  date_debut: string | null
  date_fin_prevue: string
  date_fin_reelle: string | null
  type: string
  commentaire: string
  priorite: string | null
  planogram: {
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
  }
  user: {
    id: number
    name: string
    email: string
  }
}

interface UploadedPhoto {
  file: File
  previewUrl: string
  name: string
  size: number
  type: string
}

interface Task {
  id: number
  planogram_id: number
  magasin_id: string
  idUser: number
  statut: "terminé" | "en cours" | "à faire" | "en retard"
  date_debut: string | null
  date_fin_prevue: string
  date_fin_reelle: string | null
  type: string
  commentaire: string
  priorite: string | null
  completed: boolean
  user?: {
    id: number
    name: string
    email: string
  }
}

interface Comment {
  id: number
  contenu: string
  date_creation: string
  utilisateur_id: number
  tache_id: number | null
  planogram_id: number
  piece_jointe_url: string | null
  lu: boolean
  utilisateur?: {
    id: number
    name: string
    email: string
  }
}

interface Implementation {
  id: number
  planogramName: string
  status: "Terminé" | "En cours" | "À implémenter" | "En retard"
  progress: number
  assignedTo: string
  dueDate: string
  startDate: string | null
  estimatedTime: string
  actualTime: string | null
  tasks: Task[]
  comments: Comment[]
}

export default function ImplementationTracking() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  const [selectedImplementation, setSelectedImplementation] = useState<Implementation | null>(null)
  const [comment, setComment] = useState("")
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [implementations, setImplementations] = useState<Implementation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  // Mobile Filter Component
  const MobileFilters = () => (
    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden mb-4 bg-transparent">
          <Menu className="h-4 w-4 mr-2" />
          {t("mobileFront.tracking.filtres")}
        </Button>
      </SheetTrigger>
      <SheetContent side={isRTL ? "right" : "left"} className="w-80 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>{t("mobileFront.tracking.filtres")}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t("mobileFront.tracking.status")}</label>
                <div className="space-y-2">
                  {[
                    { value: "all", label: t("mobileFront.tracking.tous") },
                    { value: "en_cours", label: t("mobileFront.tracking.enCours") },
                    { value: "a_implementer", label: t("mobileFront.tracking.aImplementer") },
                    { value: "termine", label: t("mobileFront.tracking.termine") },
                    { value: "en_retard", label:t("mobileFront.tracking.enRetard")},
                  ].map((status) => (
                    <Button
                      key={status.value}
                      variant={statusFilter === status.value ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        setStatusFilter(status.value)
                        setIsFilterOpen(false)
                      }}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  const fetchComments = async (planogramId: number) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const response = await axios.get(`${API_BASE_URL}/commentaireRoutes/getCommentairesByPlanogram/${planogramId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data
    } catch (error) {
      console.error("Erreur lors de la récupération des commentaires:", error)
      throw error
    }
  }

  const handleSelectImplementation = async (implementation: Implementation) => {
    try {
      setSelectedImplementation(implementation)

      const comments = await fetchComments(implementation.id)

      const formattedComments = comments.map((comment: any) => ({
        id: comment.id,
        author: comment.utilisateur?.name || `Utilisateur ${comment.utilisateur_id}`,
        time: new Date(comment.date_creation).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        message: comment.contenu,
        piece_jointe_url: comment.piece_jointe_url,
      }))

      setSelectedImplementation((prev) => ({
        ...prev!,
        comments: formattedComments,
      }))
    } catch (error) {
      console.error("Erreur lors de la sélection du planogramme:", error)
      alert("Impossible de charger les commentaires")
    }
  }

  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl))
    }
  }, [photos])

  const getCurrentUserId = async (): Promise<number> => {
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
      throw new Error("Erreur lors de la récupération des données utilisateur")
    }

    const data = await response.json()
    return data.user?.idUtilisateur || data.idUtilisateur || data.id
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
        }

        let userId: number
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Erreur lors de la récupération des données utilisateur")
          }

          const data = await response.json()
          console.log("Réponse complète de /api/auth/me:", data)

          userId = data.user?.idUtilisateur || data.idUtilisateur || data.id

          if (!userId) {
            throw new Error("ID utilisateur non trouvé dans la réponse")
          }

          console.log("ID utilisateur confirmé:", userId)
        } catch (userError) {
          console.error("Erreur récupération utilisateur:", userError)
          throw new Error(`Impossible de récupérer les informations utilisateur: ${userError.message}`)
        }

        let magasinId: string
        try {
          const magasinResponse = await axios.get(`${API_BASE_URL}/magasins/getMagasinByUser/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          console.log("Réponse magasin:", magasinResponse.data)

          if (!magasinResponse.data?.magasin_id) {
            throw new Error("Aucun magasin trouvé pour cet utilisateur")
          }

          magasinId = magasinResponse.data.magasin_id
        } catch (magasinError: any) {
          console.error("Erreur magasin:", magasinError)

          if (magasinError.response?.status === 404 || magasinError.message.includes("Aucun magasin")) {
            setImplementations([])
            setError("Vous n'êtes associé à aucun magasin. Veuillez contacter votre administrateur.")
            setLoading(false)
            return
          }

          throw new Error(`Erreur lors de la récupération du magasin: ${magasinError.message}`)
        }

        const planogramsResponse = await axios.get(
          `${API_BASE_URL}/planogram/getPlanogramsByMagasin/${magasinId}/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        console.log("Réponse planogrammes:", planogramsResponse.data)

        if (!Array.isArray(planogramsResponse.data)) {
          throw new Error("Format de données inattendu pour les planogrammes")
        }

        const transformedData = planogramsResponse.data
          .map((item: any) => {
            try {
              if (!item?.planogram || typeof item.planogram !== "object") {
                console.warn("Élément invalide dans les planogrammes:", item)
                return null
              }

              const currentDate = new Date()
              const dueDate = new Date(item.planogram.taches?.[0]?.date_fin_prevue || item.date_fin_prevue)

              let status: "Terminé" | "En cours" | "À implémenter" | "En retard"

              if (currentDate > dueDate && item.progression < 100) {
                status = "En retard"
              } else if (item.progression === 0) {
                status = "À implémenter"
              } else if (item.progression === 100) {
                status = "Terminé"
              } else {
                status = "En cours"
              }

              const formatDate = (dateString: string | null): string | null => {
                if (!dateString) return null
                try {
                  return new Date(dateString).toISOString().split("T")[0]
                } catch {
                  return null
                }
              }

              const tasks: Task[] = (item.planogram.taches || []).map((task: any) => ({
                ...task,
                completed: task.statut === "terminé",
                name: `Tâche #${task.id}`,
              }))

              const comments: Comment[] = (item.planogram.taches || [])
                .filter((t: any) => t.commentaire)
                .map((t: any, index: number) => ({
                  id: index + 1,
                  author: t.user?.name || `Utilisateur ${t.idUser}`,
                  time: t.date_fin_reelle
                    ? new Date(t.date_fin_reelle).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  message: t.commentaire.substring(0, 200),
                }))

              const firstTask = item.planogram.taches?.[0] || {}

              return {
                id: item.planogram.planogram_id || Math.random().toString(36).substring(2, 9),
                planogramName: item.planogram.nom || "Planogramme sans nom",
                status,
                progress: item.progression || 0,
                assignedTo: firstTask.user?.name || `Utilisateur ${firstTask.idUser}` || "Non assigné",
                dueDate: formatDate(firstTask.date_fin_prevue) || "Non spécifié",
                startDate: formatDate(firstTask.date_debut),
                estimatedTime: firstTask.estimatedTime || "4h",
                actualTime: firstTask.date_fin_reelle ? "3h 30min" : null,
                tasks,
                comments,
                _raw: item,
              }
            } catch (error) {
              console.error("Erreur lors de la transformation des données:", error, item)
              return null
            }
          })
          .filter((item): item is Implementation => item !== null)

        setImplementations(transformedData)
        setLoading(false)
      } catch (err: any) {
        console.error("Erreur fetchData complète:", err)

        let errorMessage = "Erreur lors du chargement des données"

        if (err.message) {
          errorMessage = err.message
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message
        }

        setError(errorMessage)
        setLoading(false)
        setImplementations([])
      }
    }

    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Terminé":
        return "bg-green-100 text-green-800"
      case "En cours":
        return "bg-yellow-100 text-yellow-800"
      case "À implémenter":
        return "bg-gray-100 text-gray-800"
      case "En retard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Terminé":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "En cours":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "À implémenter":
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
      case "En retard":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const handleValidateImplementation = (implementationId: number) => {
    console.log(`Validation de l'implémentation ${implementationId}`)
  }

  const handleAddComment = async () => {
    if (!comment.trim() && photoUrls.length === 0) return

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Token manquant")

      const userId = await getCurrentUserId()

      const commentData = {
        contenu: comment,
        date_creation: new Date().toISOString(),
        utilisateur_id: userId,
        tache_id: selectedImplementation?.tasks[0]?.id || null,
        planogram_id: selectedImplementation?.id,
        piece_jointe_url: photoUrls.length > 0 ? photoUrls[0] : null,
        lu: false,
      }

      const response = await axios.post(`${API_BASE_URL}/commentaireRoutes/createCommentaire`, commentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (selectedImplementation) {
        const comments = await fetchComments(selectedImplementation.id)
        const formattedComments = comments.map((c: any) => ({
          id: c.id,
          author: c.utilisateur?.name || `Utilisateur ${c.utilisateur_id}`,
          time: new Date(c.date_creation).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          message: c.contenu,
          piece_jointe_url: c.piece_jointe_url,
        }))

        setSelectedImplementation((prev) => ({
          ...prev!,
          comments: formattedComments,
        }))
      }

      setComment("")
      setPhotos([])
      setPhotoUrls([])
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error)
      alert("Erreur lors de l'ajout du commentaire")
    }
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Token manquant")

      const files = Array.from(event.target.files || [])
      if (files.length === 0) return

      if (photos.length + files.length > 5) {
        alert("Maximum 5 photos autorisées")
        return
      }

      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData()
          formData.append("file", file)

          const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          })

          return response.data.url
        }),
      )

      setPhotoUrls([...photoUrls, ...uploadedUrls])

      const newPhotos = files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
      }))

      setPhotos([...photos, ...newPhotos])
      event.target.value = ""
    } catch (error) {
      console.error("Erreur lors de l'upload des photos:", error)
      alert("Erreur lors de l'upload des photos")
    }
  }

  // Filter implementations based on status
  const filteredImplementations = implementations.filter((impl) => {
    if (statusFilter === "all") return true
    if (statusFilter === "en_cours") return impl.status === "En cours"
    if (statusFilter === "a_implementer") return impl.status === "À implémenter"
    if (statusFilter === "termine") return impl.status === "Terminé"
    if (statusFilter === "en_retard") return impl.status === "En retard"
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Chargement en cours...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir={textDirection}>
      {/* Mobile Filters */}
      <MobileFilters />

      {/* Vue d'ensemble - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("front.library.enCours")}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {implementations?.filter((i) => i?.status === "En cours").length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("front.dashboard.aImplementer")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {implementations.filter((i) => i.status === "À implémenter").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("front.tracing.termines")}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {implementations.filter((i) => i.status === "Terminé").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des implémentations - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredImplementations.map((implementation) => (
          <Card key={implementation.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <CardTitle className="text-base sm:text-lg">{implementation.planogramName}</CardTitle>
                  <CardDescription className="flex items-center space-x-2 mt-1">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{implementation.assignedTo}</span>
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(implementation.status)}
                  <Badge className={getStatusColor(implementation.status)}>{implementation.status}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progression */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{t("front.tracing.progression")}</span>
                  <span className="text-sm text-muted-foreground">{implementation.progress}%</span>
                </div>
                <Progress value={implementation.progress} className="h-2" />
              </div>

              {/* Informations temporelles - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t("front.tracing.echeance")}:</span>
                  <div className="flex items-center space-x-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs sm:text-sm">{implementation.dueDate}</span>
                  </div>
                </div>
                <div>
                  <span className="font-medium">{t("front.tracing.tempsEstime")}:</span>
                  <div className="mt-1 text-xs sm:text-sm">{implementation.estimatedTime}</div>
                </div>
              </div>

              {/* Tâches */}
              <div>
                <h4 className="font-medium mb-2 text-sm">
                  {t("front.tracing.taches")} ({implementation.tasks.filter((t) => t.completed).length}/
                  {implementation.tasks.length})
                </h4>
                <div className="space-y-1">
                  {implementation.tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center space-x-2 text-xs sm:text-sm">
                      <CheckCircle className={`h-3 w-3 ${task.completed ? "text-green-600" : "text-gray-300"}`} />
                      <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                        {task.name || `Tâche #${task.id}`}
                        {task.commentaire && (
                          <span className="text-xs text-gray-500 ml-2">({task.commentaire.substring(0, 30)}...)</span>
                        )}
                      </span>
                    </div>
                  ))}
                  {implementation.tasks.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{implementation.tasks.length - 3} {t("front.tracing.autreTaches")}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions - Responsive */}
              <div className="flex flex-wrap gap-2 pt-2">
                {implementation.status === "En cours" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleValidateImplementation(implementation.id)}
                      className="flex-1 sm:flex-none"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{t("front.tracing.valider")}</span>
                      <span className="sm:hidden">Valider</span>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none bg-transparent">
                      <Camera className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{t("front.tracing.photo")}</span>
                      <span className="sm:hidden">Photo</span>
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSelectImplementation(implementation)}
                  className="flex-1 sm:flex-none"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t("front.tracing.details")}</span>
                  <span className="sm:hidden">Détails</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de détails - Responsive */}
      {selectedImplementation && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <CardTitle className="text-base sm:text-lg">
                {t("front.tracing.details")} - {selectedImplementation.planogramName}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedImplementation(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Commentaires - Responsive */}
            <div>
              <h4 className="font-medium mb-3">{t("front.tracing.commentHistorique")}</h4>
              <div className="space-y-3 max-h-60 sm:max-h-40 overflow-y-auto">
                {selectedImplementation.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">{comment.time}</span>
                      </div>
                      <p className="text-sm">{comment.message}</p>
                      {comment.piece_jointe_url && (
                        <div className="mt-2">
                          <a
                            href={comment.piece_jointe_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:underline"
                          >
                            <Camera className="h-4 w-4 mr-1" />
                            {t("front.tracing.photoJointe")}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ajouter un commentaire - Responsive */}
            <div>
              <h4 className="font-medium mb-2">{t("front.tracing.ajouterComment")}</h4>
              <div className="space-y-3">
                <Textarea
                  placeholder={t("front.tracing.votreComment")}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button size="sm" onClick={handleAddComment} className="flex-1 sm:flex-none">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t("front.tracing.ajouter")}
                  </Button>
                  <Button size="sm" variant="outline" asChild className="flex-1 sm:flex-none bg-transparent">
                    <label className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      {t("front.tracing.joindresPhotos")}
                      <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </Button>
                </div>
              </div>
            </div>

            {/* Photos jointes - Responsive */}
            {photos.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">{t("front.tracing.photoAjoindre")}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {photos.map((photo, index) => (
                    <div key={`${photo.name}-${index}`} className="relative group">
                      <div className="w-full aspect-square rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={photo.previewUrl || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="text-xs text-gray-500 mt-1 truncate">{photo.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
