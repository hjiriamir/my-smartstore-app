"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"

interface FAQ {
  id: number
  question: string
  reponse: string
  vues: number
  personnes_aidees: number
  categorie: string
  entreprise_id: number
  date_creation: string
}

interface Entreprise {
  id: number
  // Ajoutez d'autres propriétés de l'entreprise si nécessaire
}

export function FAQContent() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  // État pour la nouvelle FAQ
  const [newFaq, setNewFaq] = useState({
    question: "",
    reponse: "",
    categorie: "Divers",
    vues: 0,
    personnes_aidees: 0,
    entreprise_id: 0,
  })

  const categories = [
    "Visualisation",
    "Technique",
    "Validation",
    "Export",
    "Formation",
    "Connexion",
    "Notifications",
    "Parametrage",
    "Support",
    "Divers",
  ]

  // Fonction pour gérer les erreurs de fetch
  const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Fetch error:", error)
      throw error
    }
  }

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
        }

        const data = await fetchWithErrorHandling(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })

        const userId = data.user?.idUtilisateur || data.idUtilisateur || data.id
        setCurrentUserId(userId)
      } catch (error) {
        console.error("Error fetching current user ID:", error)
        setError("Erreur lors de la récupération de l'utilisateur")
      }
    }

    fetchCurrentUserId()
  }, [])

  // Récupérer l'entreprise de l'utilisateur
  useEffect(() => {
    if (!currentUserId) return

    const fetchEntreprise = async () => {
      try {
        const data = await fetchWithErrorHandling(`${API_BASE_URL}/auth1/getEntrepriseByUser/${currentUserId}`)
        setEntreprise(data.entreprise)
        setNewFaq((prev) => ({ ...prev, entreprise_id: data.entreprise.id }))
      } catch (error) {
        console.error("Error fetching entreprise:", error)
        setError("Erreur lors de la récupération de l'entreprise")
      }
    }

    fetchEntreprise()
  }, [currentUserId])

  // Récupérer les FAQs de l'entreprise
  useEffect(() => {
    if (!entreprise?.id) return

    const fetchFaqs = async () => {
      try {
        setLoading(true)
        const data = await fetchWithErrorHandling(`${API_BASE_URL}/faq/getFaqByEntreprise/${entreprise.id}`)
        setFaqs(data.faqs?.rows || [])
        setLoading(false)
      } catch (error) {
        console.error("Error fetching FAQs:", error)
        setError("Erreur lors de la récupération des FAQs")
        setLoading(false)
      }
    }

    fetchFaqs()
  }, [entreprise])

  // Créer une nouvelle FAQ
  const handleCreateFaq = async () => {
    if (!newFaq.question || !newFaq.reponse || !newFaq.entreprise_id) {
      setError("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetchWithErrorHandling(`${API_BASE_URL}/faq/createFaq`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: newFaq.question,
          reponse: newFaq.reponse,
          vues: 0, // Ajouté
          personnes_aidees: 0, // Ajouté
          categorie: newFaq.categorie,
          entreprise_id: newFaq.entreprise_id,
        }),
      })

      // La réponse est directement l'objet FAQ, pas besoin de response.faq
      const createdFaq: FAQ = {
        id: response.id,
        question: response.question,
        reponse: response.reponse,
        categorie: response.categorie,
        vues: response.vues || 0,
        personnes_aidees: response.personnes_aidees || 0,
        entreprise_id: response.entreprise_id,
        date_creation: response.date_creation || new Date().toISOString(),
      }

      // Ajouter la nouvelle FAQ à la liste
      setFaqs([createdFaq, ...faqs])

      // Réinitialiser le formulaire
      setNewFaq({
        question: "",
        reponse: "",
        categorie: "Divers",
        vues: 0,
        personnes_aidees: 0,
        entreprise_id: entreprise?.id || 0,
      })
    } catch (error) {
      console.error("Error creating FAQ:", error)
      setError("Erreur lors de la création de la FAQ")
    }
  }

  // Filtrer les FAQs selon la recherche
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq &&
      typeof faq === "object" &&
      faq.question &&
      faq.reponse &&
      faq.categorie &&
      (faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.reponse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.categorie.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (loading && !faqs.length) {
    return (
      <div className="flex justify-center items-center h-64 flex-col gap-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm sm:text-base">Chargement en cours...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg mx-2 sm:mx-0">
        <p className="font-medium text-sm sm:text-base">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6" dir={textDirection}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-2 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("back.gestionFaq.gestion")}</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">{t("back.gestionFaq.gestionDescr")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0">
        {/* Liste des FAQs */}
        <div className="xl:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">{t("back.gestionFaq.listeFaq")}</CardTitle>
              <CardDescription className="text-sm sm:text-base">{t("back.gestionFaq.gererQuestion")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder={t("back.gestionFaq.rechercherFaq")}
                  className="flex-1 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline" size="sm" className="sm:w-auto bg-transparent">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => (
                    <div key={faq.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base leading-tight">
                              {faq.question}
                            </h3>
                            <div className="flex gap-2">
                              <Badge variant="default" className="text-xs">
                                {t("back.gestionFaq.publier")}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {faq.categorie}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                            {faq.reponse}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                            <span>
                              {faq.vues} {t("back.gestionFaq.vues")}
                            </span>
                            <span>
                              {faq.personnes_aidees} {t("back.gestionFaq.voteUtiles")}
                            </span>
                            <span>
                              {t("back.gestionFaq.creeLe")} {new Date(faq.date_creation).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 sm:ml-4">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm sm:text-base">
                      {searchTerm ? t("back.gestionFaq.pasCorrespondanceRech") : t("back.gestionFaq.pasDisponible")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulaire d'ajout */}
        <div className="xl:col-span-1">
          <Card className="shadow-sm sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">{t("back.gestionFaq.ajouterFaq")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">{t("back.gestionFaq.question")}</label>
                <Input
                  placeholder={t("back.gestionFaq.entrezQuestion")}
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  className="text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">{t("back.gestionFaq.reponse")}</label>
                <Textarea
                  placeholder={t("back.gestionFaq.entrezReponse")}
                  rows={4}
                  value={newFaq.reponse}
                  onChange={(e) => setNewFaq({ ...newFaq, reponse: e.target.value })}
                  className="text-sm sm:text-base resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">{t("back.gestionFaq.categorie")}</label>
                <select
                  className="w-full p-2 border rounded-md text-sm sm:text-base bg-white"
                  value={newFaq.categorie}
                  onChange={(e) => setNewFaq({ ...newFaq, categorie: e.target.value })}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                className="w-full text-sm sm:text-base"
                onClick={handleCreateFaq}
                disabled={!newFaq.question.trim() || !newFaq.reponse.trim()}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("back.gestionFaq.ajouterLaFaq")}
              </Button>
              {error && <div className="text-red-500 text-xs sm:text-sm bg-red-50 p-2 rounded">{error}</div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
