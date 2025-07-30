"use client"
import { useState, useEffect, useCallback } from "react"
import type React from "react"

import Link from "next/link"
import {
  ArrowLeft,
  BarChart3,
  Target,
  TrendingUp,
  Users,
  Zap,
  Plus,
  Calendar,
  Eye,
  Edit,
  ChevronDown,
  Menu,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea" // Import Textarea
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"

// Define types for API responses
interface Promotion {
  promotion_id: number
  nom_promotion: string
  description: string
  date_debut: string
  date_fin: string
  discount: number
  type_promotion: string
  produit_id: string | null
  categorie_id: string | null
  magasin_id: string
  etat: string // "active", "terminée", "planifiée"
  conditions: string
  date_creation: string
  date_modification: string
  taux_progression?: number // New field for completion rate
  magasin?: {
    id: number
    magasin_id: string
    nom_magasin: string
    surface: string
    longueur: string
    largeur: string
    zones_configurees: number
    adresse: string
    entreprise_id: number
    date_creation: string
    date_modification: string
  }
}

interface ActivePromotionsCountResponse {
  count: number
  rows: Promotion[]
}

interface CostTotalResponse {
  nombreVentes: number
  coutTotalVentes: number
  coutTotalReductions: number
  details: any[]
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
}

interface Category {
  id: number
  categorie_id: string
  nom: string
  parent_id: string | null
  niveau: string
  saisonnalite: string | null
  priorite: string | null
  zone_exposition_preferee: string | null
  temperature_exposition: string | null
  clientele_ciblee: string | null
  magasin_id: string
  date_creation: string
  date_modification: string
}

interface Product {
  id: number
  produit_id: string
  nom_produit: string
  description: string
  prix_unitaire: number
  unite_mesure: string
  categorie_id: string
  fournisseur_id: string
  date_creation: string
  date_modification: string
}

// New types for comments API
interface Comment {
  id: number
  contenu: string
  type_commentaire: string
  date_creation: string
  utilisateur_id: number
  tache_id: number | null
  planogram_id: number | null
  piece_jointe_url: string | null
  lu: boolean
}

interface UserInCommentsResponse {
  utilisateur: {
    id: number
    name: string
    email: string
  }
  nombre_comments: number
  comments: Comment[]
}

interface CommentsApiResponse {
  nombre_total_comments: number
  nombre_utilisateurs: number
  utilisateurs: UserInCommentsResponse[]
}

// Updated types for Planogram APIs
interface Planogram {
  planogram_id: number // Changed from 'id' to 'planogram_id' and type to number
  nom: string // Changed from 'nom_planogram' to 'nom'
  magasin_id: string
  zone_id: string
  description: string
  date_creation: string
  update_date: string | null
  created_by: number
  statut: string
  pdfUrl: string | null
  imageUrl: string | null
}

interface PlanogramListResponse {
  count: number
  rows: Planogram[]
}

interface PlanogramConversionResponse {
  idPlanogram: string
  zoneName: string
  date_debut: string
  date_fin: string
  nombreAchats: number
  nombreVisites: number
  tauxConversion: string
  details: string
  sommeTotale: number
}

// New types for Zone Performance APIs
interface Zone {
  zone_id: string
  nom_zone: string
  description: string | null
  magasin_id: string
  date_creation: string
  date_modification: string
}

interface ZonePerformanceDetail {
  produit_id: string
  nom_produit: string
  quantite: number
  montant: number
}

interface ZonePerformance {
  zone_id: string
  nom_zone: string
  ventes_zone: number
  performance: string // e.g., "53.30%"
  details: ZonePerformanceDetail[]
}

interface ZonePerformanceApiResponse {
  idMagasin: string
  date_debut: string
  date_fin: string
  total_ventes_magasin: number
  performances: ZonePerformance[]
}

export default function MarketingStrategyPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  const DirectionalArrow = ({ className }: { className?: string }) => {
    return isRTL ? <ArrowLeft className={className} /> : <ArrowRight className={className} />
  }

  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const [showStoreReports, setShowStoreReports] = useState(false)
  const [activeTab, setActiveTab] = useState("promotions")
  const [idEntreprise, setIdEntreprise] = useState<number | null>(null)

  // States for fetched data
  const [activePromotionsCount, setActivePromotionsCount] = useState(0)
  const [totalRevenuePromo, setTotalRevenuePromo] = useState(0)
  const [totalDiscountCost, setTotalDiscountCost] = useState<number | string>(0)
  const [allPromotionsList, setAllPromotionsList] = useState<Promotion[]>([])

  // States for store filtering (main page)
  const [stores, setStores] = useState<Magasin[]>([])
  const [selectedMagasinId, setSelectedMagasinId] = useState<string>("all")

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // New Campaign Form States
  const [campaignName, setCampaignName] = useState("")
  const [campaignDescription, setCampaignDescription] = useState("")
  const [campaignType, setCampaignType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [discount, setDiscount] = useState<number | string>("")
  const [selectedTargetStores, setSelectedTargetStores] = useState<string[]>([]) // For multi-select in dialog
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")

  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false)
  const [isProductsLoading, setIsProductsLoading] = useState(false)
  const [isSubmittingCampaign, setIsSubmittingCampaign] = useState(false)
  const [submitCampaignError, setSubmitCampaignError] = useState<string | null>(null)
  const [submitCampaignSuccess, setSubmitCampaignSuccess] = useState<boolean>(false)

  // States for Store Reports (Comments)
  const [storeReportsList, setStoreReportsList] = useState<(Comment & { userName: string; userEmail: string })[]>([])
  const [isStoreReportsLoading, setIsStoreReportsLoading] = useState(false)

  // States for Planograms tab
  const [planogramStartDate, setPlanogramStartDate] = useState("")
  const [planogramEndDate, setPlanogramEndDate] = useState("")
  const [selectedPlanogramMagasinId, setSelectedPlanogramMagasinId] = useState<string>("all")
  const [availablePlanograms, setAvailablePlanograms] = useState<Planogram[]>([])
  const [isPlanogramsLoading, setIsPlanogramsLoading] = useState(false)
  const [planogramConversionDataMap, setPlanogramConversionDataMap] = useState<
    Map<string, PlanogramConversionResponse>
  >(new Map())
  const [isFetchingAllPlanogramConversions, setIsFetchingAllPlanogramConversions] = useState(false)
  // New state for planogram date validation error
  const [planogramDateError, setPlanogramDateError] = useState<string | null>(null)

  // States for Zone Performance
  const [availableZones, setAvailableZones] = useState<Zone[]>([])
  const [zonePerformanceData, setZonePerformanceData] = useState<ZonePerformance[]>([])
  const [isZonesLoading, setIsZonesLoading] = useState(false)
  const [isZonePerformanceLoading, setIsZonePerformanceLoading] = useState(false)

  // Function to fetch marketing data (memoized with useCallback)
  const fetchMarketingData = useCallback(async () => {
    if (idEntreprise === null) {
      return // Don't fetch until idEntreprise is available
    }

    const magasinQueryParam = selectedMagasinId !== "all" ? `&idMagasin=${selectedMagasinId}` : ""

    // Fetch Promotions Actives count
    try {
      const response = await fetch(
        `http://localhost:8081/api/promotions/active?idEntreprise=${idEntreprise}${magasinQueryParam}`,
      )
      if (!response.ok) {
        if (response.status === 404) {
          console.warn("No active promotions found for the selected criteria (404).")
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }
      const data: ActivePromotionsCountResponse = response.ok ? await response.json() : { count: 0, rows: [] }
      setActivePromotionsCount(data.count)
    } catch (error) {
      console.error("Error fetching active promotions count:", error)
      setActivePromotionsCount(0) // Reset on error
    }

    // Fetch ALL Promotions for the list
    try {
      const response = await fetch(
        `http://localhost:8081/api/promotions/promos?idEntreprise=${idEntreprise}${magasinQueryParam}`,
      )
      if (!response.ok) {
        if (response.status === 404) {
          console.warn("No promotions found for the selected criteria (404).")
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }
      const data: Promotion[] = response.ok ? await response.json() : []
      setAllPromotionsList(data)
    } catch (error) {
      console.error("Error fetching all promotions:", error)
      setAllPromotionsList([]) // Reset on error
    }

    // Fetch Revenus Promo
    try {
      const response = await fetch(
        `http://localhost:8081/api/promotions/revenu-promo?idEntreprise=${idEntreprise}${magasinQueryParam}`,
      )
      if (!response.ok) {
        if (response.status === 404) {
          console.warn("No promotional revenue found for the selected criteria (404).")
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }
      const data: number = response.ok ? await response.json() : 0
      setTotalRevenuePromo(data)
    } catch (error) {
      console.error("Error fetching revenue promo:", error)
      setTotalRevenuePromo(0) // Reset on error
    }

    // Fetch Coût total des réductions
    if (selectedMagasinId !== "all") {
      try {
        const response = await fetch(
          `http://localhost:8081/api/promotions/cout-total?idEntreprise=${idEntreprise}&idMagasin=${selectedMagasinId}`,
        )
        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`No total discount cost found for store ${selectedMagasinId} (404).`)
          } else {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
        }
        const data: CostTotalResponse = response.ok ? await response.json() : { coutTotalReductions: 0 }
        setTotalDiscountCost(data.coutTotalReductions)
      } catch (error) {
        console.error("Error fetching total discount cost for single store:", error)
        setTotalDiscountCost(0) // Reset on error
      }
    } else {
      // Calculate total discount cost for all stores
      if (stores.length > 0) {
        try {
          const fetchPromises = stores.map(async (store) => {
            try {
              const response = await fetch(
                `http://localhost:8081/api/promotions/cout-total?idEntreprise=${idEntreprise}&idMagasin=${store.magasin_id}`,
              )
              if (!response.ok) {
                if (response.status === 404) {
                  console.warn(`No discount cost for store ${store.nom_magasin} (404).`)
                  return 0 // Return 0 if no data for this specific store
                } else {
                  throw new Error(`HTTP error! status: ${response.status} for store ${store.nom_magasin}`)
                }
              }
              const data: CostTotalResponse = await response.json()
              return data.coutTotalReductions
            } catch (innerError) {
              console.error(`Error fetching discount cost for store ${store.nom_magasin}:`, innerError)
              return 0 // Return 0 for failed individual store fetches
            }
          })

          const results = await Promise.allSettled(fetchPromises)
          let totalSum = 0
          results.forEach((result) => {
            if (result.status === "fulfilled") {
              totalSum += result.value
            }
          })
          setTotalDiscountCost(totalSum)
        } catch (error) {
          console.error("Error calculating total discount cost for all stores:", error)
          setTotalDiscountCost("N/A") // Fallback if the aggregation fails
        }
      } else {
        setTotalDiscountCost(0) // No stores to sum
      }
    }
  }, [idEntreprise, selectedMagasinId, stores])

  useEffect(() => {
    const fetchCurrentUserDataAndStores = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("Token d'authentification manquant")
          return
        }
        const userResponse = await fetch(`http://localhost:8081/api/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })
        if (!userResponse.ok) {
          throw new Error("Erreur lors de la récupération des données utilisateur")
        }
        const userData = await userResponse.json()
        const userId = userData.user?.idUtilisateur || userData.idUtilisateur || userData.id
        const entrepriseId = userData.user?.entreprises_id || userData.entreprises_id
        setCurrentUserId(userId)
        setIdEntreprise(entrepriseId)

        if (entrepriseId) {
          const storesResponse = await fetch(
            `http://localhost:8081/api/magasins/getMagasinsByEntrepriseId/${entrepriseId}`,
          )
          if (!storesResponse.ok) {
            console.warn(`HTTP error fetching stores! status: ${storesResponse.status}`)
            setStores([])
            return
          }
          const storesData: Magasin[] = await storesResponse.json()
          setStores(storesData)
          setSelectedMagasinId("all")
          setSelectedPlanogramMagasinId("all") // Initialize for Planograms tab
        }
      } catch (error) {
        console.error("Error fetching current user data or stores:", error)
      }
    }
    fetchCurrentUserDataAndStores()
  }, [])

  useEffect(() => {
    fetchMarketingData()
  }, [fetchMarketingData]) // Re-fetch marketing data when the memoized function changes (i.e., its dependencies change)

  // Fetch categories based on selected target stores in the new campaign dialog
  useEffect(() => {
    const fetchCategories = async () => {
      if (selectedTargetStores.length === 0) {
        setAvailableCategories([])
        setSelectedCategory("")
        return
      }
      setIsCategoriesLoading(true)
      try {
        const storeIds = selectedTargetStores.join(",")
        const response = await fetch(
          `http://localhost:8081/api/categories/getCategoriesByMagasins?idMagasin=${storeIds}`,
        )
        if (!response.ok) {
          if (response.status === 404) {
            console.warn("No categories found for selected stores (404).")
          } else {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
        }
        const data: Category[] = response.ok ? await response.json() : []
        setAvailableCategories(data)
        setSelectedCategory("") // Reset selected category when stores change
      } catch (error) {
        console.error("Error fetching categories:", error)
        setAvailableCategories([])
      } finally {
        setIsCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [selectedTargetStores])

  // Fetch products based on selected category in the new campaign dialog
  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedCategory || selectedCategory === "all") {
        setAvailableProducts([])
        setSelectedProduct("")
        return
      }
      setIsProductsLoading(true)
      try {
        const apiUrl = `http://localhost:8081/api/produits/getProduitsByCategorie/${selectedCategory}`
        console.log("Fetching products for category:", selectedCategory, "from URL:", apiUrl) // Added log
        const response = await fetch(apiUrl)
        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`No products found for category ${selectedCategory} (404).`)
          } else {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
        }
        const data: Product[] = response.ok ? await response.json() : []
        setAvailableProducts(data)
        setSelectedProduct("") // Reset selected product when category changes
      } catch (error) {
        console.error("Error fetching products:", error)
        setAvailableProducts([])
      } finally {
        setIsProductsLoading(false)
      }
    }
    fetchProducts()
  }, [selectedCategory])

  // Fetch comments for store reports
  const fetchStoreReports = useCallback(async () => {
    if (idEntreprise === null) {
      return
    }
    setIsStoreReportsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `http://localhost:8081/api/commentaireRoutes/getCommentsByEntreprise/${idEntreprise}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        },
      )
      if (!response.ok) {
        if (response.status === 404) {
          console.warn("No comments found for this enterprise (404).")
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }
      const data: CommentsApiResponse = response.ok ? await response.json() : { utilisateurs: [] }

      const filteredComments: (Comment & { userName: string; userEmail: string })[] = []
      data.utilisateurs.forEach((userEntry) => {
        userEntry.comments.forEach((comment) => {
          if (comment.type_commentaire === "retour_magasin" || comment.type_commentaire === "reclamation") {
            filteredComments.push({
              ...comment,
              userName: userEntry.utilisateur.name,
              userEmail: userEntry.utilisateur.email,
            })
          }
        })
      })
      setStoreReportsList(filteredComments)
    } catch (error) {
      console.error("Error fetching store reports:", error)
      setStoreReportsList([])
    } finally {
      setIsStoreReportsLoading(false)
    }
  }, [idEntreprise])

  // Call fetchStoreReports when dialog opens and idEntreprise is ready
  useEffect(() => {
    if (showStoreReports && idEntreprise !== null) {
      fetchStoreReports()
    }
  }, [showStoreReports, idEntreprise, fetchStoreReports])

  // Fetch Planograms based on selected store for Planograms tab
  useEffect(() => {
    const fetchPlanograms = async () => {
      if (selectedPlanogramMagasinId === "all" || idEntreprise === null) {
        setAvailablePlanograms([])
        setPlanogramConversionDataMap(new Map()) // Clear stats when store changes or no store selected
        return
      }
      setIsPlanogramsLoading(true)
      try {
        const response = await fetch(
          `http://localhost:8081/api/planogram/fetchPlanogramByStore/${selectedPlanogramMagasinId}`,
        )
        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`No planograms found for store ${selectedPlanogramMagasinId} (404).`)
          } else {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
        }
        // Correctly access the 'rows' array from the response
        const data: PlanogramListResponse = response.ok ? await response.json() : { count: 0, rows: [] }
        setAvailablePlanograms(data.rows)
        setPlanogramConversionDataMap(new Map()) // Clear previous conversion data
      } catch (error) {
        console.error("Error fetching planograms:", error)
        setAvailablePlanograms([])
      } finally {
        setIsPlanogramsLoading(false)
      }
    }
    fetchPlanograms()
  }, [selectedPlanogramMagasinId, idEntreprise]) // Depend on selected store and enterprise ID

  // Fetch Planogram Performance for all displayed planograms when planograms or dates change
  useEffect(() => {
    const fetchConversions = async () => {
      // Validate dates first
      if (planogramStartDate && planogramEndDate) {
        const start = new Date(planogramStartDate)
        const end = new Date(planogramEndDate)
        if (start > end) {
          setPlanogramDateError("La date de début ne peut pas être après la date de fin.")
          setPlanogramConversionDataMap(new Map()) // Clear stats if dates are invalid
          setIsFetchingAllPlanogramConversions(false) // Ensure loading state is off
          return
        } else {
          setPlanogramDateError(null) // Clear error if dates are valid
        }
      } else {
        setPlanogramDateError(null) // Clear error if dates are empty/not fully selected
      }

      if (availablePlanograms.length === 0 || !planogramStartDate || !planogramEndDate || planogramDateError) {
        setPlanogramConversionDataMap(new Map()) // Clear if no planograms or dates missing or dates are invalid
        return
      }

      setIsFetchingAllPlanogramConversions(true)
      const newConversionMap = new Map<string, PlanogramConversionResponse>()
      const fetchPromises = availablePlanograms.map(async (planogram) => {
        try {
          // Use planogram.planogram_id and convert to string if necessary for the API
          const apiUrl = `http://localhost:8081/api/planogram/conversion?idPlanogram=${planogram.planogram_id}&date_debut=${planogramStartDate}&date_fin=${planogramEndDate}`
          const response = await fetch(apiUrl)
          if (!response.ok) {
            if (response.status === 404) {
              console.warn(`No performance data found for planogram ${planogram.planogram_id} and dates (404).`)
            } else {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
          }
          const data: PlanogramConversionResponse = await response.json()
          newConversionMap.set(String(planogram.planogram_id), data) // Store by string ID
        } catch (error) {
          console.error(`Error fetching conversion for planogram ${planogram.planogram_id}:`, error)
          // Optionally, set an error state for this specific planogram or just skip it
        }
      })

      await Promise.allSettled(fetchPromises) // Wait for all fetches to complete
      setPlanogramConversionDataMap(newConversionMap)
      setIsFetchingAllPlanogramConversions(false)
    }

    fetchConversions()
  }, [availablePlanograms, planogramStartDate, planogramEndDate, planogramDateError]) // Depend on planograms list and dates, and error state

  // Fetch Zones for the selected store in Planograms tab
  useEffect(() => {
    const fetchZones = async () => {
      if (selectedPlanogramMagasinId === "all") {
        setAvailableZones([])
        setZonePerformanceData([]) // Clear performance data when store changes
        return
      }
      setIsZonesLoading(true)
      try {
        const response = await fetch(`http://localhost:8081/api/zones/getZonesMagasin/${selectedPlanogramMagasinId}`)
        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`No zones found for store ${selectedPlanogramMagasinId} (404).`)
          } else {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
        }
        const data: Zone[] = response.ok ? await response.json() : []
        setAvailableZones(data)
        setZonePerformanceData([]) // Clear previous performance data
      } catch (error) {
        console.error("Error fetching zones:", error)
        setAvailableZones([])
      } finally {
        setIsZonesLoading(false)
      }
    }
    fetchZones()
  }, [selectedPlanogramMagasinId])

  // Fetch Zone Performance data
  useEffect(() => {
    const fetchZonePerformance = async () => {
      if (selectedPlanogramMagasinId === "all" || !planogramStartDate || !planogramEndDate || planogramDateError) {
        setZonePerformanceData([]) // Clear if no store, dates missing, or dates are invalid
        return
      }

      setIsZonePerformanceLoading(true)
      try {
        const apiUrl = `http://localhost:8081/api/magasins/getPerformanceZones?idMagasin=${selectedPlanogramMagasinId}&date_debut=${planogramStartDate}&date_fin=${planogramEndDate}`
        const response = await fetch(apiUrl)
        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`No zone performance data found for store ${selectedPlanogramMagasinId} and dates (404).`)
          } else {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
        }
        const data: ZonePerformanceApiResponse = response.ok ? await response.json() : { performances: [] }
        setZonePerformanceData(data.performances)
      } catch (error) {
        console.error("Error fetching zone performance:", error)
        setZonePerformanceData([])
      } finally {
        setIsZonePerformanceLoading(false)
      }
    }

    fetchZonePerformance()
  }, [selectedPlanogramMagasinId, planogramStartDate, planogramEndDate, planogramDateError])

  const handleTargetStoreChange = (magasin_id: string, isChecked: boolean) => {
    setSelectedTargetStores((prev) => (isChecked ? [...prev, magasin_id] : prev.filter((id) => id !== magasin_id)))
  }

  const handleNewCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitCampaignError(null)
    setSubmitCampaignSuccess(false)
    setIsSubmittingCampaign(true)

    if (selectedTargetStores.length === 0) {
      setSubmitCampaignError("Veuillez sélectionner au moins un magasin ciblé.")
      setIsSubmittingCampaign(false)
      return
    }

    const payload = {
      nom_promotion: campaignName,
      description: campaignDescription,
      date_debut: startDate,
      date_fin: endDate,
      discount: Number(discount),
      type_promotion: campaignType,
      magasin_id: selectedTargetStores.length === 1 ? selectedTargetStores[0] : selectedTargetStores,
      etat: "active", // Default to active for new campaigns
      produit_id: selectedProduct === "all" ? null : selectedProduct,
      categorie_id: selectedCategory === "all" ? null : selectedCategory,
    }

    try {
      const response = await fetch(`http://localhost:8081/api/promotions/createPromotion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming token is needed
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      setSubmitCampaignSuccess(true)
      // Reset form fields
      setCampaignName("")
      setCampaignDescription("")
      setCampaignType("")
      setStartDate("")
      setEndDate("")
      setDiscount("")
      setSelectedTargetStores([])
      setSelectedCategory("")
      setSelectedProduct("")
      setAvailableCategories([])
      setAvailableProducts([])

      // Close dialog after a short delay or immediately
      setTimeout(() => {
        setShowNewCampaign(false)
        fetchMarketingData() // Re-fetch data on main page to show new promotion
      }, 1500)
    } catch (error: any) {
      console.error("Error creating new campaign:", error)
      setSubmitCampaignError(error.message || "Une erreur est survenue lors de la création de la campagne.")
    } finally {
      setIsSubmittingCampaign(false)
    }
  }

  const navigationItems = [
    { value: "promotions", label: "Promotions & Offres", icon: Zap },
    { value: "planograms", label: "Planogrammes & Zones", icon: BarChart3 },
  
  ]

  const getCurrentNavLabel = () => {
    const current = navigationItems.find((item) => item.value === activeTab)
    return current ? current.label : "Navigation"
  }

  const abTests = [
    {
      name: "Packaging Produit A vs B",
      variant_a: { name: "Design Classique", conversion: 3.2 },
      variant_b: { name: "Design Moderne", conversion: 4.7 },
      winner: "B",
      confidence: 95,
    },
    {
      name: "Position Promo Tête de Gondole",
      variant_a: { name: "Position Haute", conversion: 2.8 },
      variant_b: { name: "Position Œil", conversion: 5.1 },
      winner: "B",
      confidence: 98,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 mt-8 sm:mt-12 lg:mt-16" dir={textDirection}>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link href="/marketing">
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">
              Marketing Strategy Display
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm lg:text-base">
              Gestion avancée des stratégies marketing et promotions
            </p>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Navigation - Dropdown on mobile, tabs on desktop */}
          <div className="block sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-transparent">
                  <div className="flex items-center gap-2">
                    <Menu className="w-4 h-4" />
                    <span className="truncate">{getCurrentNavLabel()}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[280px]">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem
                      key={item.value}
                      onClick={() => setActiveTab(item.value)}
                      className={`flex items-center gap-2 cursor-pointer ${
                        activeTab === item.value ? "bg-slate-100" : ""
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Desktop Tabs */}
          <div className="hidden sm:block overflow-x-auto">
          <TabsList className="flex w-full space-x-2">
            <TabsTrigger value="promotions" className="flex-1 py-2 text-sm">
              Promotions & Offres
            </TabsTrigger>
            <TabsTrigger value="planograms" className="flex-1 py-2 text-sm">
              Planogrammes & Zones
            </TabsTrigger>
          </TabsList>
          </div>
          <TabsContent value="promotions" className="space-y-4 sm:space-y-6">
            {/* Header with responsive button */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Gestion des Promotions</h2>
              <Dialog open={showNewCampaign} onOpenChange={setShowNewCampaign}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 w-full sm:w-auto text-sm">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Nouvelle Campagne</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">Créer une Campagne Promotionnelle</DialogTitle>
                    <DialogDescription className="text-sm">
                      Configurez votre nouvelle campagne marketing avec tous les paramètres
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleNewCampaignSubmit}>
                    <div className="grid gap-4 py-4">
                      {/* Magasins ciblés - Multi-select Checkboxes */}
                      <div>
                        <Label htmlFor="target-stores" className="text-sm">
                          Magasins ciblés <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                          {stores.length > 0 ? (
                            stores.map((store) => (
                              <div key={store.magasin_id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`store-${store.magasin_id}`}
                                  checked={selectedTargetStores.includes(store.magasin_id)}
                                  onCheckedChange={(checked) =>
                                    handleTargetStoreChange(store.magasin_id, checked as boolean)
                                  }
                                />
                                <Label htmlFor={`store-${store.magasin_id}`} className="text-xs sm:text-sm">
                                  {store.nom_magasin}
                                </Label>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground col-span-full">Aucun magasin disponible.</p>
                          )}
                        </div>
                        {submitCampaignError && submitCampaignError.includes("magasin ciblé") && (
                          <p className="text-red-500 text-xs mt-1">{submitCampaignError}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="campaign-name" className="text-sm">
                            Nom de la campagne <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="campaign-name"
                            placeholder="Ex: Flash Sale Électronique"
                            className="text-sm"
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="campaign-type" className="text-sm">
                            Type de promotion <span className="text-red-500">*</span>
                          </Label>
                          <Select value={campaignType} onValueChange={setCampaignType} required>
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Sélectionner le type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="remise %">Remise %</SelectItem>
                              <SelectItem value="bundle">Bundle</SelectItem>
                              <SelectItem value="bogo">2 pour 1</SelectItem>
                              <SelectItem value="fixed">Prix fixe</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="campaign-description" className="text-sm">
                          Description de la campagne
                        </Label>
                        <Textarea
                          id="campaign-description"
                          placeholder="Décrivez les détails de la promotion..."
                          className="text-sm"
                          value={campaignDescription}
                          onChange={(e) => setCampaignDescription(e.target.value)}
                        />
                      </div>

                      {/* Catégorie concernée (Dynamique) */}
                      <div>
                        <Label htmlFor="affected-category" className="text-sm">
                          Catégorie concernée (Optionnel)
                        </Label>
                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                          disabled={selectedTargetStores.length === 0 || isCategoriesLoading}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                          <SelectContent className="w-full max-h-60 overflow-y-auto">
                            <SelectItem value="all" className="px-4 py-2 hover:bg-slate-50 cursor-pointer">
                              Toutes les catégories
                            </SelectItem>
                            {isCategoriesLoading ? (
                              <SelectItem value="loading" disabled>
                                Chargement des catégories...
                              </SelectItem>
                            ) : availableCategories.length > 0 ? (
                              availableCategories.map((category) => (
                                <SelectItem key={category.categorie_id} value={category.categorie_id}>
                                  {category.nom}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-categories" disabled>
                                Aucune catégorie disponible pour les magasins sélectionnés
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Produit concerné (Dynamique) */}
                      <div>
                        <Label htmlFor="affected-product" className="text-sm">
                          Produit concerné (Optionnel)
                        </Label>
                        <Select
                          value={selectedProduct}
                          onValueChange={setSelectedProduct}
                          disabled={!selectedCategory || selectedCategory === "all" || isProductsLoading}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Sélectionner un produit" />
                          </SelectTrigger>
                          <SelectContent className="w-full max-h-60 overflow-y-auto">
                            <SelectItem value="all" className="px-4 py-2 hover:bg-slate-50 cursor-pointer">
                              Tous les produits
                            </SelectItem>
                            {isProductsLoading ? (
                              <SelectItem value="loading" disabled>
                                Chargement des produits...
                              </SelectItem>
                            ) : availableProducts.length > 0 ? (
                              availableProducts.map((product) => (
                                <SelectItem key={product.produit_id} value={product.produit_id}>
                                  {product.nom_produit}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-products" disabled>
                                Aucun produit disponible pour cette catégorie
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start-date" className="text-sm">
                            Date de début <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              type="date"
                              id="start-date"
                              className="text-sm pr-10"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              required
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="end-date" className="text-sm">
                            Date de fin <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              type="date"
                              id="end-date"
                              className="text-sm pr-10"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              required
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                          </div>
                        </div>
                      </div>

                      {/* Discount field */}
                      <div>
                        <Label htmlFor="discount" className="text-sm">
                          Discount (%) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="discount"
                          type="number"
                          placeholder="10"
                          className="text-sm"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          required
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                      {submitCampaignError && (
                        <p className="text-red-500 text-sm mb-2 sm:mb-0 sm:mr-auto">{submitCampaignError}</p>
                      )}
                      {submitCampaignSuccess && (
                        <p className="text-green-500 text-sm mb-2 sm:mb-0 sm:mr-auto">Campagne créée avec succès !</p>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => setShowNewCampaign(false)}
                        className="text-sm"
                        type="button"
                      >
                        Annuler
                      </Button>
                      <Button type="submit" className="text-sm" disabled={isSubmittingCampaign}>
                        {isSubmittingCampaign ? "Création en cours..." : "Créer la Campagne"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {/* Store Filter - Version améliorée */}
            <div className="bg-white/50 backdrop-blur-sm p-3 sm:p-4 rounded-lg border shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                {/* Filtre principal */}
                <div className="flex-1">
                  <Label htmlFor="store-filter" className="block text-sm font-medium text-slate-700 mb-1">
                    Filtrer par magasin
                  </Label>
                  <div className="relative">
                    <Select value={selectedMagasinId || "all"} onValueChange={setSelectedMagasinId}>
                      <SelectTrigger className="w-full pl-3 pr-8 py-2 text-left bg-white border border-slate-300 rounded-lg shadow-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                        <SelectValue placeholder="Sélectionner un magasin" />
                      </SelectTrigger>
                      <SelectContent className="z-50 mt-1 w-full bg-white shadow-lg rounded-lg border border-slate-200 py-1 max-h-60 overflow-auto">
                        <SelectItem
                          value="all"
                          className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center"
                        >
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            <span>Tous les magasins</span>
                          </div>
                        </SelectItem>
                        {stores.map((store) => (
                          <SelectItem
                            key={store.magasin_id}
                            value={store.magasin_id}
                            className="px-4 py-2 hover:bg-slate-50 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                              <span className="truncate">{store.nom_magasin}</span>
                              <span className="ml-auto text-xs text-slate-500 hidden sm:inline">
                                {store.adresse.split(",")[0]}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Statistiques rapides */}
                {selectedMagasinId !== "all" && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-2 sm:p-3 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-blue-800">Promotions actives</p>
                      <p className="font-semibold text-blue-900">
                        {allPromotionsList.filter((p) => p.magasin_id === selectedMagasinId).length}
                      </p>
                    </div>
                  </div>
                )}

                {/* Bouton de réinitialisation conditionnel */}
                {selectedMagasinId !== "all" && (
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedMagasinId("all")}
                    className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Réinitialiser
                  </Button>
                )}
              </div>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Promotions Actives</CardTitle>
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{activePromotionsCount}</div>
                  <p className="text-xs text-muted-foreground">+2 depuis hier</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Revenus Promo</CardTitle>
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">€{totalRevenuePromo.toLocaleString("fr-FR")}</div>
                  <p className="text-xs text-muted-foreground">+18% vs semaine dernière</p>
                </CardContent>
              </Card>
              <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Coût total des réductions</CardTitle>
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {typeof totalDiscountCost === "number"
                      ? totalDiscountCost.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
                      : totalDiscountCost}
                  </div>
                  <p className="text-xs text-muted-foreground">-8% vs semaine dernière</p>
                </CardContent>
              </Card>
            </div>
            {/* Campaigns List */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Campagnes Actives</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Gestion et suivi des campagnes en cours
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowStoreReports(true)}
                    className="text-sm w-full sm:w-auto"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Retours Magasins
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto">
                  {allPromotionsList.map((promo) => (
                    <div
                      key={promo.promotion_id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{promo.nom_promotion}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge
                              variant={
                                promo.etat === "active"
                                  ? "default"
                                  : promo.etat === "terminée"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {promo.etat === "active" ? "Actif" : promo.etat === "terminée" ? "Terminée" : "Planifiée"}
                            </Badge>
                            <span className="text-xs sm:text-sm text-slate-600">
                              {promo.type_promotion} - {promo.discount}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="text-left sm:text-right">
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={promo.taux_progression || 0} className="w-16 sm:w-20" />
                            <span className="text-xs sm:text-sm text-slate-600">{promo.taux_progression || 0}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {promo.etat !== "terminée" && (
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent">
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {allPromotionsList.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">Aucune promotion trouvée.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="planograms" className="space-y-4 sm:space-y-6">
            {/* Store Filter for Planograms */}
            <div className="bg-white/50 backdrop-blur-sm p-3 sm:p-4 rounded-lg border shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="planogram-store-filter" className="block text-sm font-medium text-slate-700 mb-1">
                    Filtrer par magasin
                  </Label>
                  <div className="relative">
                    <Select value={selectedPlanogramMagasinId} onValueChange={setSelectedPlanogramMagasinId}>
                      <SelectTrigger className="w-full pl-3 pr-8 py-2 text-left bg-white border border-slate-300 rounded-lg shadow-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                        <SelectValue placeholder="Sélectionner un magasin" />
                      </SelectTrigger>
                      <SelectContent className="z-50 mt-1 w-full bg-white shadow-lg rounded-lg border border-slate-200 py-1 max-h-60 overflow-auto">
                        <SelectItem
                          value="all"
                          className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center"
                        >
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            <span>Tous les magasins</span>
                          </div>
                        </SelectItem>
                        {stores.map((store) => (
                          <SelectItem
                            key={store.magasin_id}
                            value={store.magasin_id}
                            className="px-4 py-2 hover:bg-slate-50 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                              <span className="truncate">{store.nom_magasin}</span>
                              <span className="ml-auto text-xs text-slate-500 hidden sm:inline">
                                {store.adresse.split(",")[0]}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                {selectedPlanogramMagasinId !== "all" && (
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedPlanogramMagasinId("all")}
                    className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Réinitialiser Magasin
                  </Button>
                )}
              </div>
            </div>

            {/* Date Range Selectors for Planograms */}
            <div className="bg-white/50 backdrop-blur-sm p-3 sm:p-4 rounded-lg border shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="planogram-start-date" className="text-sm">
                    Date de début
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      id="planogram-start-date"
                      className="text-sm pr-10"
                      value={planogramStartDate}
                      onChange={(e) => setPlanogramStartDate(e.target.value)}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="planogram-end-date" className="text-sm">
                    Date de fin
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      id="planogram-end-date"
                      className="text-sm pr-10"
                      value={planogramEndDate}
                      onChange={(e) => setPlanogramEndDate(e.target.value)}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>
              {planogramDateError && <p className="text-red-500 text-xs mt-2">{planogramDateError}</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Performance par Planogramme</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Analyse des performances de vos planogrammes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4 max-h-[300px] overflow-y-auto">
                    {isPlanogramsLoading ? (
                      <div className="text-center text-muted-foreground py-4">Chargement des planogrammes...</div>
                    ) : availablePlanograms.length === 0 ? (
                      <div className="text-center text-muted-foreground py-4">
                        Sélectionnez un magasin pour afficher les planogrammes.
                      </div>
                    ) : (
                      availablePlanograms.map((planogram) => {
                        const conversionData = planogramConversionDataMap.get(String(planogram.planogram_id)) // Use String(planogram.planogram_id) for map key
                        const showStats =
                          planogramStartDate && planogramEndDate && conversionData && !planogramDateError
                         return (
                            <div key={planogram.planogram_id} className="p-3 border rounded-lg bg-slate-50">
                              <h4 className="font-medium text-sm sm:text-base mb-1">
                                {planogram.nom} - Zone: {planogram.zone_id}
                              </h4>
                              {isFetchingAllPlanogramConversions ? (
                                <p className="text-xs text-muted-foreground">Chargement des statistiques...</p>
                              ) : showStats ? (
                                <>
                                  <div className="grid grid-cols-2 gap-2 mb-1">
                                    <div>
                                      <p className="text-xs text-muted-foreground">Taux de conversion</p>
                                      <p className="text-sm font-medium">{conversionData?.tauxConversion}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Chiffre d'affaires</p>
                                      <p className="text-sm font-medium text-green-600">
                                        {conversionData?.sommeTotale ? 
                                          `${parseFloat(conversionData.sommeTotale).toLocaleString('fr-FR', {
                                            style: 'currency',
                                            currency: 'EUR'
                                          })}` 
                                          : 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-xs text-muted-foreground">Achats</p>
                                      <p className="text-sm font-medium">{conversionData?.nombreAchats}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Visites</p>
                                      <p className="text-sm font-medium">{conversionData?.nombreVisites}</p>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  {planogramDateError
                                    ? planogramDateError
                                    : "Sélectionnez une plage de dates pour voir les performances."}
                                </p>
                              )}
                            </div>
                          )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Performance par Zone</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Analyse des ventes par emplacement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4 max-h-[300px] overflow-y-auto">
                    {isZonesLoading ? (
                      <div className="text-center text-muted-foreground py-4">Chargement des zones...</div>
                    ) : selectedPlanogramMagasinId === "all" ? (
                      <div className="text-center text-muted-foreground py-4">
                        Sélectionnez un magasin pour afficher les zones.
                      </div>
                    ) : availableZones.length === 0 ? (
                      <div className="text-center text-muted-foreground py-4">Aucune zone trouvée pour ce magasin.</div>
                    ) : isZonePerformanceLoading ? (
                      <div className="text-center text-muted-foreground py-4">Chargement des performances...</div>
                    ) : planogramDateError ? (
                      <div className="text-center text-red-500 py-4">{planogramDateError}</div>
                    ) : zonePerformanceData.length === 0 && planogramStartDate && planogramEndDate ? (
                      <div className="text-center text-muted-foreground py-4">
                        Aucune donnée de performance trouvée pour la période sélectionnée.
                      </div>
                    ) : (
                      availableZones.map((zone) => {
                        const performance = zonePerformanceData.find((p) => p.zone_id === zone.zone_id)
                        const performanceValue = performance
                          ? Number.parseFloat(performance.performance.replace("%", ""))
                          : 0
                        const showPerformance = planogramStartDate && planogramEndDate && performance

                        return (
                          <div key={zone.zone_id} className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm min-w-0 flex-1 truncate">{zone.nom_zone}</span>
                            <div className="flex items-center gap-2 ml-2">
                              {showPerformance ? (
                                <>
                                  <Progress value={performanceValue} className="w-16 sm:w-20" />
                                  <span className="text-xs sm:text-sm font-medium w-12 text-right">
                                    {performance?.performance}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground w-full text-right">
                                  {planogramStartDate && planogramEndDate ? "Pas de données" : "Sélectionnez les dates"}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        
        </Tabs>
        {/* Store Reports Dialog */}
        <Dialog open={showStoreReports} onOpenChange={setShowStoreReports}>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Retours Magasins - Mise en Place</DialogTitle>
              <DialogDescription className="text-sm">
                Commentaires des équipes terrain de votre entreprise
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:gap-4 py-4">
              {isStoreReportsLoading ? (
                <div className="text-center text-muted-foreground py-8">Chargement des retours magasins...</div>
              ) : storeReportsList.length > 0 ? (
                storeReportsList.map((report) => (
                  <div
                    key={report.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                        {report.piece_jointe_url ? "📷" : "💬"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm sm:text-base">{report.userName}</h4>
                        <p className="text-xs sm:text-sm text-slate-600 break-words">{report.contenu}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(report.date_creation).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={report.piece_jointe_url ? "default" : "secondary"} className="text-xs w-fit">
                      {report.piece_jointe_url ? "Validé (Photo)" : "Commentaire"}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Aucun retour magasin trouvé pour votre entreprise.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
