"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Gamepad2,
  Activity,
  Eye,
  Users,
  TrendingUp,
  ChevronDown,
  Menu,
  Loader2,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AddChallengeForm } from "@/components/back-office/Marketing/shop-pillars/gamification/add-challenge-form"
import { AddClientForm } from "@/components/back-office/Marketing/shop-pillars/gamification/add-client-form"
import { ChallengeParticipationManager } from "@/components/back-office/Marketing/shop-pillars/gamification/challenge-participation-manager"
import type { Challenge, Client, Magasin } from "@/lib/gamification"
import { Selecteurs } from "../selecteurs"
import { Leaderboard } from "@/components/back-office/Marketing/shop-pillars/gamification/leaderboard"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"

// --- Interfaces pour les données API ---
interface Zone {
  zone_id: string
  nom_zone: string
  description: string
}

interface ZoneProductDetail {
  produit_id: string
  nom_produit: string
  quantite: number
  montant: number
}

interface ZonePerformanceDetail {
  zone_id: string
  nom_zone: string
  ventes_zone: number
  performance: string // Ex: "53.30%"
  details: ZoneProductDetail[]
}

interface ZonePerformanceResponse {
  idMagasin: string
  date_debut: string
  date_fin: string
  total_ventes_magasin: number
  performances: ZonePerformanceDetail[]
}

interface ZoneTrafficData {
  zone_id: string
  periode: {
    date_debut: string
    date_fin: string
  }
  visitesActuelles: number
  moyennePast: number
  variation: number
  diffVariation: string
}

// Nouvelle interface pour les données de performance des produits
interface ProductDetail {
  produitId: string
  nom: string
  ventesActuelles: number
  moyennePast: number
  variation: number
  diffVariation: string
  recommendation: string
}

interface ProductPerformanceResponse {
  idMagasin: string
  periode: {
    date_debut: string
    date_fin: string
  }
  produits: ProductDetail[]
}

// Ajouter après les autres interfaces
interface HeatmapStats {
  magasin_id: string
  total_visiteurs: number
  duree_moyenne_globale: number
  intensite_moyenne: number
}

interface ZoneHeatmapStats {
  zone_id: string
  total_visiteurs: number
  duree_moyenne_globale: number
  intensite_moyenne: number
}

export default function ShopPillarsPage() {

  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  const [selectedZone, setSelectedZone] = useState("electronics") // Existing state for static zones data
  const [showNewPillar, setShowNewPillar] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [activeTab, setActiveTab] = useState("zoning")

  // Nouvel état pour la navigation dans la section Gamification
  const [activeGamificationTab, setActiveGamificationTab] = useState("management")

  // New states for user, stores, zones, and performance data
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [idEntreprise, setIdEntreprise] = useState<string | null>(null)
  const [stores, setStores] = useState<Magasin[]>([])
  const [availableZones, setAvailableZones] = useState<Zone[]>([])
  const [zonePerformanceData, setZonePerformanceData] = useState<ZonePerformanceResponse | null>(null)
  const [zoneTrafficDataMap, setZoneTrafficDataMap] = useState<Map<string, ZoneTrafficData>>(new Map()) // Map zone_id to its traffic data
  const [productPerformanceData, setProductPerformanceData] = useState<ProductPerformanceResponse | null>(null) // New state for product performance

  // Gamification specific states
  const [showAddClientForm, setShowAddClientForm] = useState(false)
  const [showAddChallengeForm, setShowAddChallengeForm] = useState(false)

  // Loading and error states
  const [isLoadingUserAndStores, setIsLoadingUserAndStores] = useState(true)
  const [isLoadingZones, setIsLoadingZones] = useState(false)
  const [isLoadingZonePerformance, setIsLoadingZonePerformance] = useState(false)
  const [isLoadingZoneTraffic, setIsLoadingZoneTraffic] = useState(false)
  const [isLoadingProductPerformance, setIsLoadingProductPerformance] = useState(false) // New loading state
  const [errorUserAndStores, setErrorUserAndStores] = useState<string | null>(null)
  const [errorZones, setErrorZones] = useState<string | null>(null)
  const [errorZonePerformance, setErrorZonePerformance] = useState<string | null>(null)
  const [errorZoneTraffic, setErrorZoneTraffic] = useState<string | null>(null)
  const [errorProductPerformance, setErrorProductPerformance] = useState<string | null>(null) // New error state

  // Separate states for store filters
  const [selectedMagasinFilterZoning, setSelectedMagasinFilterZoning] = useState("all")
  const [selectedMagasinFilterGamification, setSelectedMagasinFilterGamification] = useState("all")
  const [selectedZoneTypeFilter, setSelectedZoneTypeFilter] = useState("all")

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL


  // New states for date filters in Zonage Intelligent
  const [startDateZoning, setStartDateZoning] = useState("")
  const [endDateZoning, setEndDateZoning] = useState("")
  const [zoningDateError, setZoningDateError] = useState<string | null>(null)

  // Ajouter après les autres états
  const [heatmapStats, setHeatmapStats] = useState<HeatmapStats | null>(null)
  const [zoneHeatmapData, setZoneHeatmapData] = useState<ZoneHeatmapStats[]>([])
  const [selectedZoneForHeatmap, setSelectedZoneForHeatmap] = useState<string>("all")
  const [availableZonesForHeatmap, setAvailableZonesForHeatmap] = useState<Zone[]>([])
  const [isLoadingHeatmapStats, setIsLoadingHeatmapStats] = useState(false)
  const [isLoadingZoneHeatmap, setIsLoadingZoneHeatmap] = useState(false)
  const [errorHeatmapStats, setErrorHeatmapStats] = useState<string | null>(null)
  const [errorZoneHeatmap, setErrorZoneHeatmap] = useState<string | null>(null)

  // États pour les filtres Analytics
  const [selectedMagasinFilterAnalytics, setSelectedMagasinFilterAnalytics] = useState("all")
  const [startDateAnalytics, setStartDateAnalytics] = useState("")
  const [endDateAnalytics, setEndDateAnalytics] = useState("")
  const [analyticsDateError, setAnalyticsDateError] = useState<string | null>(null)

  // Données statiques pour le LeaderBoard
  const navigationItems = [
    { value: "zoning", label: "Zonage Intelligent", icon: MapPin },
    { value: "gamification", label: "Gamification", icon: Gamepad2 },
    { value: "analytics", label: "Analytics Physiques", icon: Activity },
  ]

  const gamificationNavigationItems = [
    { value: "management", label: "Gestion", icon: Gamepad2 },
    { value: "leaderboard", label: "Classements", icon: Trophy },
  ]

  const getCurrentNavLabel = () => {
    const current = navigationItems.find((item) => item.value === activeTab)
    return current ? current.label : "Navigation"
  }

  const getCurrentGamificationNavLabel = () => {
    const current = gamificationNavigationItems.find((item) => item.value === activeGamificationTab)
    return current ? current.label : "Gestion"
  }

  const zones = [
    { id: "electronics", name: "Électronique", traffic: 85, revenue: "€25,400", color: "bg-blue-500" },
    { id: "fashion", name: "Mode", traffic: 72, revenue: "€18,900", color: "bg-pink-500" },
    { id: "home", name: "Maison", traffic: 68, revenue: "€22,100", color: "bg-green-500" },
    { id: "beauty", name: "Beauté", traffic: 91, revenue: "€15,600", color: "bg-purple-500" },
    { id: "sports", name: "Sport", traffic: 54, revenue: "€12,800", color: "bg-orange-500" },
  ]

  const heatmapDataStatic = [
    { zone: "Entrée", intensity: 95, visitors: 1240 },
    { zone: "Caisse", intensity: 88, visitors: 980 },
    { zone: "Promo", intensity: 82, visitors: 750 },
    { zone: "Nouveautés", intensity: 76, visitors: 620 },
    { zone: "Fond magasin", intensity: 34, visitors: 280 },
  ]

  const interactiveElements = [
    { name: "Bornes tactiles", usage: 78, satisfaction: 4.2 },
    { name: "QR Codes produits", usage: 65, satisfaction: 4.0 },
    { name: "Réalité augmentée", usage: 42, satisfaction: 4.5 },
    { name: "App mobile magasin", usage: 89, satisfaction: 4.3 },
  ]

  // Effect to fetch current user data and stores
  useEffect(() => {
    const fetchCurrentUserDataAndStores = async () => {
      setIsLoadingUserAndStores(true)
      setErrorUserAndStores(null)

      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("Token d'authentification manquant")
          setErrorUserAndStores("Token d'authentification manquant. Veuillez vous connecter.")
          setIsLoadingUserAndStores(false)
          return
        }

        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
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

        console.log("entreprise recuperer", entrepriseId)
        setCurrentUserId(userId)
        setIdEntreprise(entrepriseId)

        if (entrepriseId) {
          const storesResponse = await fetch(
            `${API_BASE_URL}/magasins/getMagasinsByEntrepriseId/${entrepriseId}`,
          )

          if (!storesResponse.ok) {
            console.warn(`HTTP error fetching stores! status: ${storesResponse.status}`)
            setStores([])
            setErrorUserAndStores("Erreur lors de la récupération des magasins.")
            return
          }

          const storesData: Magasin[] = await storesResponse.json()
          setStores(storesData)

          // Initialize selectedMagasinFilter for both sections
          if (storesData.length > 0) {
            setSelectedMagasinFilterZoning(storesData[0].magasin_id)
            setSelectedMagasinFilterGamification(storesData[0].magasin_id)
            setSelectedMagasinFilterAnalytics(storesData[0].magasin_id) // Ajouter cette ligne
          } else {
            setSelectedMagasinFilterZoning("all")
            setSelectedMagasinFilterGamification("all")
            setSelectedMagasinFilterAnalytics("all") // Ajouter cette ligne
          }
        }
      } catch (error: any) {
        console.error("Error fetching current user data or stores:", error)
        setErrorUserAndStores(error.message || "Une erreur inattendue est survenue.")
      } finally {
        setIsLoadingUserAndStores(false)
      }
    }

    fetchCurrentUserDataAndStores()
  }, [])

  // Effect to fetch zones based on selected store for Zonage Intelligent
  useEffect(() => {
    const fetchZones = async () => {
      if (selectedMagasinFilterZoning === "all" || !selectedMagasinFilterZoning) {
        setAvailableZones([])
        return
      }

      setIsLoadingZones(true)
      setErrorZones(null)

      try {
        const response = await fetch(`${API_BASE_URL}/zones/getZonesMagasin/${selectedMagasinFilterZoning}`)

        if (!response.ok) {
          throw new Error(`HTTP error fetching zones! status: ${response.status}`)
        }

        const data: Zone[] = await response.json()
        setAvailableZones(data)

        // Reset zone type filter if the previously selected one is not in the new list
        if (selectedZoneTypeFilter !== "all" && !data.some((zone) => zone.zone_id === selectedZoneTypeFilter)) {
          setSelectedZoneTypeFilter("all")
        }
      } catch (error: any) {
        console.error("Error fetching zones:", error)
        setErrorZones(error.message || "Erreur lors de la récupération des zones.")
        setAvailableZones([])
      } finally {
        setIsLoadingZones(false)
      }
    }

    fetchZones()
  }, [selectedMagasinFilterZoning])

  // Effect for date validation
  useEffect(() => {
    if (startDateZoning && endDateZoning) {
      const start = new Date(startDateZoning)
      const end = new Date(endDateZoning)
      if (start > end) {
        setZoningDateError("La date de début ne peut pas être après la date de fin.")
      } else {
        setZoningDateError(null)
      }
    } else {
      setZoningDateError(null) // Clear error if dates are empty/not fully selected
    }
  }, [startDateZoning, endDateZoning])

  // Effect to fetch zone performance and traffic data
  useEffect(() => {
    const fetchZonePerformanceAndTraffic = async () => {
      if (selectedMagasinFilterZoning === "all" || !startDateZoning || !endDateZoning || zoningDateError) {
        setZonePerformanceData(null)
        setZoneTrafficDataMap(new Map())
        return
      }

      setIsLoadingZonePerformance(true)
      setErrorZonePerformance(null)
      setZoneTrafficDataMap(new Map()) // Clear previous traffic data

      try {
        const performanceResponse = await fetch(
          `${API_BASE_URL}/magasins/getPerformanceZones?idMagasin=${selectedMagasinFilterZoning}&date_debut=${startDateZoning}&date_fin=${endDateZoning}`,
        )

        if (!performanceResponse.ok) {
          throw new Error(`HTTP error fetching zone performance! status: ${performanceResponse.status}`)
        }

        const performanceData: ZonePerformanceResponse = await performanceResponse.json()
        setZonePerformanceData(performanceData)

        // Fetch traffic data for each zone in the performance data
        setIsLoadingZoneTraffic(true)
        setErrorZoneTraffic(null)

        const newTrafficMap = new Map<string, ZoneTrafficData>()

        const trafficPromises = performanceData.performances.map(async (zone) => {
          try {
            const trafficResponse = await fetch(
              `${API_BASE_URL}/zones/trafic-moyen?idZone=${zone.zone_id}&date_debut=${startDateZoning}&date_fin=${endDateZoning}`,
            )

            if (!trafficResponse.ok) {
              console.warn(`HTTP error fetching traffic for zone ${zone.zone_id}! status: ${trafficResponse.status}`)
              return null // Return null for failed traffic fetches
            }

            const trafficData: { success: boolean; data: ZoneTrafficData } = await trafficResponse.json()
            if (trafficData.success) {
              newTrafficMap.set(zone.zone_id, trafficData.data)
              console.log("trafic recuperer", trafficData)
            }
          } catch (trafficError: any) {
            console.error(`Error fetching traffic for zone ${zone.zone_id}:`, trafficError)
            return null
          }
        })

        await Promise.all(trafficPromises)
        setZoneTrafficDataMap(newTrafficMap)
      } catch (error: any) {
        console.error("Error fetching zone performance or traffic:", error)
        setErrorZonePerformance(error.message || "Erreur lors de la récupération des données de performance des zones.")
        setZonePerformanceData(null)
      } finally {
        setIsLoadingZonePerformance(false)
        setIsLoadingZoneTraffic(false)
      }
    }

    fetchZonePerformanceAndTraffic()
  }, [selectedMagasinFilterZoning, startDateZoning, endDateZoning, zoningDateError])

  // New Effect to fetch product performance data
  useEffect(() => {
    const fetchProductPerformance = async () => {
      if (selectedMagasinFilterZoning === "all" || !startDateZoning || !endDateZoning || zoningDateError) {
        setProductPerformanceData(null)
        return
      }

      setIsLoadingProductPerformance(true)
      setErrorProductPerformance(null)

      try {
        const response = await fetch(
         `${API_BASE_URL}/produits/performance/produits?idMagasin=${selectedMagasinFilterZoning}&date_debut=${startDateZoning}&date_fin=${endDateZoning}`,
        )

        if (!response.ok) {
          throw new Error(`HTTP error fetching product performance! status: ${response.status}`)
        }

        const data: ProductPerformanceResponse = await response.json()
        setProductPerformanceData(data)
      } catch (error: any) {
        console.error("Error fetching product performance:", error)
        setErrorProductPerformance(error.message || "Erreur lors de la récupération des recommandations de produits.")
        setProductPerformanceData(null)
      } finally {
        setIsLoadingProductPerformance(false)
      }
    }

    fetchProductPerformance()
  }, [selectedMagasinFilterZoning, startDateZoning, endDateZoning, zoningDateError])

  // Ajouter après les autres fonctions de fetch
  // Fonction pour récupérer les stats globales du magasin
  const fetchHeatmapStats = async () => {
    if (selectedMagasinFilterAnalytics === "all" || !startDateAnalytics || !endDateAnalytics || analyticsDateError) {
      setHeatmapStats(null)
      return
    }

    setIsLoadingHeatmapStats(true)
    setErrorHeatmapStats(null)

    try {
      const response = await fetch(
       `${API_BASE_URL}/heatmaps/stats?magasin_id=${selectedMagasinFilterAnalytics}&date_debut=${startDateAnalytics}&date_fin=${endDateAnalytics}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error fetching heatmap stats! status: ${response.status}`)
      }

      const data: HeatmapStats = await response.json()
      setHeatmapStats(data)
    } catch (error: any) {
      console.error("Error fetching heatmap stats:", error)
      setErrorHeatmapStats(error.message || "Erreur lors de la récupération des statistiques heatmap")
      setHeatmapStats(null)
    } finally {
      setIsLoadingHeatmapStats(false)
    }
  }

  // Fonction pour récupérer les zones disponibles pour le magasin sélectionné
  const fetchZonesForHeatmap = async () => {
    if (selectedMagasinFilterAnalytics === "all" || !selectedMagasinFilterAnalytics) {
      setAvailableZonesForHeatmap([])
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/zones/getZonesMagasin/${selectedMagasinFilterAnalytics}`
)

      if (!response.ok) {
        throw new Error(`HTTP error fetching zones for heatmap! status: ${response.status}`)
      }

      const data: Zone[] = await response.json()
      setAvailableZonesForHeatmap(data)

      // Reset zone selection if the previously selected one is not in the new list
      if (selectedZoneForHeatmap !== "all" && !data.some((zone) => zone.zone_id === selectedZoneForHeatmap)) {
        setSelectedZoneForHeatmap("all")
      }
    } catch (error: any) {
      console.error("Error fetching zones for heatmap:", error)
      setAvailableZonesForHeatmap([])
    }
  }

  // Fonction pour récupérer les données heatmap par zone
  const fetchZoneHeatmapData = async () => {
    if (selectedMagasinFilterAnalytics === "all" || !startDateAnalytics || !endDateAnalytics || analyticsDateError) {
      setZoneHeatmapData([])
      return
    }

    setIsLoadingZoneHeatmap(true)
    setErrorZoneHeatmap(null)

    try {
      let zonesToFetch: Zone[] = []

      if (selectedZoneForHeatmap === "all") {
        zonesToFetch = availableZonesForHeatmap
      } else {
        const selectedZone = availableZonesForHeatmap.find((zone) => zone.zone_id === selectedZoneForHeatmap)
        if (selectedZone) {
          zonesToFetch = [selectedZone]
        }
      }

      if (zonesToFetch.length === 0) {
        setZoneHeatmapData([])
        setIsLoadingZoneHeatmap(false)
        return
      }

      const promises = zonesToFetch.map(async (zone) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/heatmaps/stats/zone?zone_id=${zone.zone_id}&date_debut=${startDateAnalytics}&date_fin=${endDateAnalytics}`,
          )

          if (!response.ok) {
            console.warn(`HTTP error fetching zone heatmap for ${zone.zone_id}! status: ${response.status}`)
            return null
          }

          const data: ZoneHeatmapStats = await response.json()
          return { ...data, zone_name: zone.nom_zone }
        } catch (error: any) {
          console.error(`Error fetching zone heatmap for ${zone.zone_id}:`, error)
          return null
        }
      })

      const results = await Promise.all(promises)
      const validResults = results.filter(
        (result): result is ZoneHeatmapStats & { zone_name: string } => result !== null,
      )

      // Trier par intensité décroissante
      validResults.sort((a, b) => b.intensite_moyenne - a.intensite_moyenne)

      setZoneHeatmapData(validResults)
    } catch (error: any) {
      console.error("Error fetching zone heatmap data:", error)
      setErrorZoneHeatmap(error.message || "Erreur lors de la récupération des données heatmap par zone")
      setZoneHeatmapData([])
    } finally {
      setIsLoadingZoneHeatmap(false)
    }
  }

  // Effet pour récupérer les stats globales
  useEffect(() => {
    fetchHeatmapStats()
  }, [selectedMagasinFilterAnalytics, startDateAnalytics, endDateAnalytics, analyticsDateError])

  // Effet pour récupérer les zones disponibles
  useEffect(() => {
    fetchZonesForHeatmap()
  }, [selectedMagasinFilterAnalytics])

  // Effet pour récupérer les données heatmap par zone
  useEffect(() => {
    fetchZoneHeatmapData()
  }, [
    selectedMagasinFilterAnalytics,
    selectedZoneForHeatmap,
    startDateAnalytics,
    endDateAnalytics,
    analyticsDateError,
    availableZonesForHeatmap,
  ])

  const isZoningFiltersActive =
    selectedMagasinFilterZoning !== "all" &&
    selectedZoneTypeFilter !== "all" &&
    startDateZoning !== "" &&
    endDateZoning !== "" &&
    !zoningDateError

  // Helper function to format dates for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  // Function to calculate the previous period and determine period type
  const getPeriodDetails = (start: string, end: string) => {
    if (!start || !end)
      return { currentStart: null, currentEnd: null, prevStart: null, prevEnd: null, periodType: "custom" }

    const startDate = new Date(start)
    const endDate = new Date(end)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
      return { currentStart: null, currentEnd: null, prevStart: null, prevEnd: null, periodType: "custom" }
    }

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end day

    let periodType: "week" | "month" | "semester" | "year" | "custom" = "custom"

    const prevEndDate = new Date(startDate)
    prevEndDate.setDate(startDate.getDate() - 1) // Day before current start

    const prevStartDate = new Date(prevEndDate)
    prevStartDate.setDate(prevEndDate.getDate() - diffDays + 1) // Subtract duration

    if (diffDays === 7) {
      periodType = "week"
    } else if (diffDays >= 28 && diffDays <= 31) {
      // Approx a month
      periodType = "month"
    } else if (diffDays >= 180 && diffDays <= 184) {
      // Approx 6 months
      periodType = "semester"
    } else if (diffDays >= 365 && diffDays <= 366) {
      // Approx a year
      periodType = "year"
    }

    return {
      currentStart: startDate.toISOString().split("T")[0],
      currentEnd: endDate.toISOString().split("T")[0],
      prevStart: prevStartDate.toISOString().split("T")[0],
      prevEnd: prevEndDate.toISOString().split("T")[0],
      periodType,
    }
  }

  const { currentStart, currentEnd, prevStart, prevEnd, periodType } = getPeriodDetails(startDateZoning, endDateZoning)

  const displayCurrentPeriod = useCallback(() => {
    if (!currentStart || !currentEnd || zoningDateError) {
      return "pour la période sélectionnée"
    }

    switch (periodType) {
      case "week":
        return "cette semaine"
      case "month":
        return "ce mois-ci"
      case "semester":
        return "ce semestre"
      case "year":
        return "cette année"
      default:
        return `du ${formatDateForDisplay(currentStart)} au ${formatDateForDisplay(currentEnd)}`
    }
  }, [currentStart, currentEnd, zoningDateError, periodType])

  const displayPreviousPeriod = useCallback(() => {
    if (!prevStart || !prevEnd || zoningDateError) {
      return "la période précédente"
    }

    switch (periodType) {
      case "week":
        return "la semaine dernière"
      case "month":
        return "le mois dernier"
      case "semester":
        return "le semestre dernier"
      case "year":
        return "l'année dernière"
      default:
        return `du ${formatDateForDisplay(prevStart)} au ${formatDateForDisplay(prevEnd)}`
    }
  }, [prevStart, prevEnd, zoningDateError, periodType])

  // Calculate aggregated stats for cards
  const totalActiveZones = zonePerformanceData?.performances.length || 0
  const totalZoneRevenue = zonePerformanceData?.performances.reduce((sum, zone) => sum + zone.ventes_zone, 0) || 0

  const filteredZones =
    selectedZoneTypeFilter === "all"
      ? availableZones
      : availableZones.filter((zone) => zone.zone_id === selectedZoneTypeFilter)

  const relevantTrafficData = filteredZones
    .map((zone) => zoneTrafficDataMap.get(zone.zone_id))
    .filter((data): data is ZoneTrafficData => data !== undefined)

  const averageTrafficVariation =
    relevantTrafficData.length > 0
      ? relevantTrafficData.reduce((sum, data) => sum + data.variation, 0) / relevantTrafficData.length
      : 0

  const averageDiffVariation =
    relevantTrafficData.length > 0
      ? relevantTrafficData.reduce((sum, data) => {
          const diff = Number.parseFloat(data.diffVariation.replace("%", "").replace("+", ""))
          return sum + diff
        }, 0) / relevantTrafficData.length
      : 0

  const displayAverageTraffic = relevantTrafficData.length > 0 ? `${averageTrafficVariation.toFixed(2)}%` : "N/A"
  const displayAverageDiff =
    relevantTrafficData.length > 0 ? `${averageDiffVariation > 0 ? "+" : ""}${averageDiffVariation.toFixed(2)}%` : "N/A"

  const handleChallengeAdded = (newChallenge: Challenge) => {
    // This function is called when a challenge is successfully added via the form.
    // We don't need to update the state here directly, as ChallengeParticipationManager
    // will re-fetch its challenges based on `selectedMagasinFilterGamification` when its `useEffect` runs.
    console.log("Challenge added:", newChallenge)
    setShowAddChallengeForm(false) // Close form after adding
  }

  const handleClientAdded = (newClient: Client) => {
    // Similar to challenges, ChallengeParticipationManager will re-fetch clients.
    console.log("Client added:", newClient)
    setShowAddClientForm(false) // Close form after adding
  }

  // Déterminer le magasin initial pour le formulaire d'ajout de challenge
  const initialChallengeMagasinId =
    selectedMagasinFilterGamification !== "all" ? selectedMagasinFilterGamification : null

  return (
    <div className="min-h-screen bg-slate-50 mt-8 sm:mt-12">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link href="/marketing">
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">{t("marketing.pilliersMagasins.zonageIntelliget.pilliersTitle")}</h1>
            <p className="text-slate-600 text-xs sm:text-sm lg:text-base">
            {t("marketing.pilliersMagasins.zonageIntelliget.pilliersTitleDescr")}
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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 min-w-[600px] sm:min-w-0">
              <TabsTrigger value="zoning" className="text-xs sm:text-sm">
              {t("marketing.pilliersMagasins.zonageIntelliget.zonageIntel")}
              </TabsTrigger>
              <TabsTrigger value="gamification" className="text-xs sm:text-sm">
              {t("marketing.pilliersMagasins.gamification.gamificationAndPoints")}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm">
              {t("marketing.pilliersMagasins.analysePhysique.analysePhysiq")}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="zoning" className="space-y-4 sm:space-y-6">
            {/* Header with responsive buttons */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">{t("marketing.pilliersMagasins.zonageIntelliget.gestoinPilliers")}</h2>
              <div className="flex flex-col sm:flex-row gap-2"></div>
            </div>

            {/* Store, Zone Type, and Date Selectors for Zonage Intelligent */}
            <Selecteurs
              stores={stores}
              availableZones={availableZones}
              selectedMagasinFilter={selectedMagasinFilterZoning} // Using zoning specific filter
              setSelectedMagasinFilter={setSelectedMagasinFilterZoning} // Using zoning specific setter
              selectedZoneTypeFilter={selectedZoneTypeFilter}
              setSelectedZoneTypeFilter={setSelectedZoneTypeFilter}
              startDateZoning={startDateZoning}
              setStartDateZoning={setStartDateZoning}
              endDateZoning={endDateZoning}
              setEndDateZoning={setEndDateZoning}
              zoningDateError={zoningDateError}
              isLoadingUserAndStores={isLoadingUserAndStores}
              errorUserAndStores={errorUserAndStores}
              isLoadingZones={isLoadingZones}
              errorZones={errorZones}
            />

            {/* Conditional content based on selections */}
            {!isZoningFiltersActive ? (
              <div className="text-center text-muted-foreground py-8">
                {isLoadingUserAndStores || isLoadingZones || isLoadingZonePerformance ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                    <p>{t("marketing.pilliersMagasins.analysePhysique.chargementDonnees")}</p>
                  </div>
                ) : errorUserAndStores || errorZones || errorZonePerformance ? (
                  <p className="text-red-500">{errorUserAndStores || errorZones || errorZonePerformance}</p>
                ) : selectedMagasinFilterZoning === "all" &&
                  selectedZoneTypeFilter === "all" &&
                  (!startDateZoning || !endDateZoning) ? (
                    t("marketing.pilliersMagasins.zonageIntelliget.selectMagZonDat")
                ) : selectedMagasinFilterZoning === "all" ? (
                  t("marketing.pilliersMagasins.zonageIntelliget.selectMagActiveFiltre")
                ) : selectedZoneTypeFilter === "all" ? (
                  t("marketing.pilliersMagasins.zonageIntelliget.selectionnerZone")
                ) : !startDateZoning || !endDateZoning ? (
                  t("marketing.pilliersMagasins.zonageIntelliget.selectionnerPlageDate")
                ) : zoningDateError ? (
                  zoningDateError
                ) : (
                  t("marketing.pilliersMagasins.zonageIntelliget.selectMagZonDat")
                )}
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm sm:text-base font-semibold">{t("marketing.pilliersMagasins.zonageIntelliget.zonesActives")}</CardTitle>
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {isLoadingZonePerformance ? (
                        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                      ) : (
                        <div className="text-xl sm:text-3xl font-extrabold">{totalActiveZones}</div>
                      )}
                      <p className="text-xs text-muted-foreground">{t("marketing.pilliersMagasins.zonageIntelliget.optimise")} {displayCurrentPeriod()}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm sm:text-base font-semibold">{t("marketing.pilliersMagasins.zonageIntelliget.traficMoyen")}</CardTitle>
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {isLoadingZoneTraffic ? (
                        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                      ) : (
                        <div className="text-xl sm:text-3xl font-extrabold">
                          {relevantTrafficData.length > 0 ? `${relevantTrafficData[0].variation.toFixed(2)}%` : "N/A"}
                        </div>
                      )}
                      {prevStart && prevEnd && !zoningDateError && (
                        <p className="text-xs text-purple-600 mt-1">
                          {relevantTrafficData.length > 0 ? relevantTrafficData[0].diffVariation : "N/A"} {t("marketing.pilliersMagasins.zonageIntelliget.vs")}{" "}
                          {displayPreviousPeriod()}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm sm:text-base font-semibold">{t("marketing.pilliersMagasins.zonageIntelliget.revenuZoes")}</CardTitle>
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {isLoadingZonePerformance ? (
                        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                      ) : (
                        <div className="text-xl sm:text-3xl font-extrabold">€{totalZoneRevenue.toFixed(2)}</div>
                      )}
                      <p className="text-xs text-muted-foreground">{t("marketing.pilliersMagasins.zonageIntelliget.pourLaPeriode")} {displayCurrentPeriod()}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">{t("marketing.pilliersMagasins.zonageIntelliget.recommandation")}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                      {t("marketing.pilliersMagasins.zonageIntelliget.recommandationDescr")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingProductPerformance ? (
                        <div className="flex flex-col items-center justify-center h-32">
                          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                          <p className="text-slate-500 mt-2">{t("marketing.pilliersMagasins.zonageIntelliget.chargementRecommandation")}</p>
                        </div>
                      ) : errorProductPerformance ? (
                        <p className="text-red-500 text-center py-8">{errorProductPerformance}</p>
                      ) : (productPerformanceData?.produits.length || 0) === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                         {t("marketing.pilliersMagasins.zonageIntelliget.aucuneRecomTrouve")}
                        </p>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          {productPerformanceData?.produits.map((product) => {
                            let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline"
                            let badgeText = t("marketing.pilliersMagasins.zonageIntelliget.action")

                            if (
                              product.recommendation.toLowerCase().includes("explosion") ||
                              product.recommendation.toLowerCase().includes("capitaliser") ||
                              product.recommendation.toLowerCase().includes("ajouter")
                            ) {
                              badgeVariant = "default"
                              badgeText = t("marketing.pilliersMagasins.zonageIntelliget.ajouter")
                            } else if (
                              product.recommendation.toLowerCase().includes("baisse") ||
                              product.recommendation.toLowerCase().includes("revoir") ||
                              product.recommendation.toLowerCase().includes("retirer")
                            ) {
                              badgeVariant = "destructive"
                              badgeText = t("marketing.pilliersMagasins.zonageIntelliget.revoir")
                            } else if (product.recommendation.toLowerCase().includes("déplacer")) {
                              badgeVariant = "secondary"
                              badgeText = t("marketing.pilliersMagasins.zonageIntelliget.deplacer")
                            }

                            return (
                              <div key={product.produitId} className="p-3 border rounded-lg">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                                  <div className="min-w-0 flex-1">
                                    <Badge variant={badgeVariant} className="text-xs">
                                      {badgeText}
                                    </Badge>
                                    <h4 className="font-medium mt-1 text-sm sm:text-base truncate">{product.nom}</h4>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs w-full sm:w-auto bg-transparent"
                                  >
                                    {t("marketing.pilliersMagasins.zonageIntelliget.appliquer")}
                                  </Button>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-600 mb-1">
                                {t("marketing.pilliersMagasins.zonageIntelliget.variation")} {product.diffVariation}
                                </p>
                                <p className="text-xs sm:text-sm font-medium text-green-600">
                                {t("marketing.pilliersMagasins.zonageIntelliget.recommandation1")} {product.recommendation}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="gamification" className="space-y-4 sm:space-y-6">
            {/* Sous-navigation pour Gamification */}
            <div className="space-y-4">
              {/* Navigation mobile pour Gamification */}
              <div className="block sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-transparent">
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4" />
                        <span className="truncate">{getCurrentGamificationNavLabel()}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[280px]">
                    {gamificationNavigationItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <DropdownMenuItem
                          key={item.value}
                          onClick={() => setActiveGamificationTab(item.value)}
                          className={`flex items-center gap-2 cursor-pointer ${
                            activeGamificationTab === item.value ? "bg-slate-100" : ""
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

              {/* Navigation desktop pour Gamification */}
              <div className="hidden sm:block">
                <Tabs value={activeGamificationTab} onValueChange={setActiveGamificationTab} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="management" className="text-xs sm:text-sm">
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      {t("marketing.pilliersMagasins.gamification.gest")}
                    </TabsTrigger>
                    <TabsTrigger value="leaderboard" className="text-xs sm:text-sm">
                      <Trophy className="w-4 h-4 mr-2" />
                      {t("marketing.pilliersMagasins.gamification.class")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="management" className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                      <Button
                        onClick={() => setShowAddChallengeForm(!showAddChallengeForm)}
                        className="w-full sm:w-auto"
                      >
                        {showAddChallengeForm 
                          ? t("marketing.pilliersMagasins.gamification.gestion.masqueChallenge") 
                          : t("marketing.pilliersMagasins.gamification.gestion.ajouterChallenge")}

                      </Button>
                      <Button onClick={() => setShowAddClientForm(!showAddClientForm)} className="w-full sm:w-auto">
                      {showAddClientForm 
                        ? t("marketing.pilliersMagasins.gamification.gestion.masqueFormClient") 
                        : t("marketing.pilliersMagasins.gamification.gestion.ajouterUnClient")}

                      </Button>
                    </div>

                    {showAddChallengeForm && (
                      <AddChallengeForm
                        onChallengeAdded={handleChallengeAdded}
                        stores={stores}
                        initialSelectedMagasinId={initialChallengeMagasinId}
                      />
                    )}

                    {showAddClientForm && (
                      <AddClientForm onClientAdded={handleClientAdded} entrepriseId={idEntreprise} />
                    )}

                    <ChallengeParticipationManager
                      onNewClientClick={() => setShowAddClientForm(true)}
                      entrepriseId={idEntreprise}
                    />
                  </TabsContent>

                  <TabsContent value="leaderboard" className="space-y-4 sm:space-y-6">
                    <Leaderboard entrepriseId={idEntreprise} />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Version mobile pour les contenus de gamification */}
              <div className="block sm:hidden">
                {activeGamificationTab === "management" && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 mb-4">
                      <Button onClick={() => setShowAddChallengeForm(!showAddChallengeForm)} className="w-full">
                      {showAddChallengeForm 
                        ? t("marketing.pilliersMagasins.gamification.gestion.masqueChallenge") 
                        : t("marketing.pilliersMagasins.gamification.gestion.ajouterChallenge")}

                      </Button>
                      <Button onClick={() => setShowAddClientForm(!showAddClientForm)} className="w-full">
                      {showAddClientForm 
                        ? t("marketing.pilliersMagasins.gamification.gestion.masqueFormClient") 
                        : t("marketing.pilliersMagasins.gamification.gestion.ajouterUnClient")}

                      </Button>
                    </div>

                    {showAddChallengeForm && (
                      <AddChallengeForm
                        onChallengeAdded={handleChallengeAdded}
                        stores={stores}
                        initialSelectedMagasinId={initialChallengeMagasinId}
                      />
                    )}

                    {showAddClientForm && (
                      <AddClientForm onClientAdded={handleClientAdded} entrepriseId={idEntreprise} />
                    )}

                    <ChallengeParticipationManager
                      onNewClientClick={() => setShowAddClientForm(true)}
                      entrepriseId={idEntreprise}
                    />
                  </div>
                )}

                {activeGamificationTab === "leaderboard" && (
                  <div className="space-y-4">
                    <Leaderboard entrepriseId={idEntreprise} />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
            {/* Filtres pour Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>{t("marketing.pilliersMagasins.analysePhysique.filtreAnalysePhysiqe")} </CardTitle>
                <CardDescription>{t("marketing.pilliersMagasins.analysePhysique.filtreAnalysePhysiqeDescr")} </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Sélecteur de magasin */}
                  <div>
                    <Label htmlFor="magasin-analytics">{t("marketing.pilliersMagasins.analysePhysique.magasin")}</Label>
                    <Select value={selectedMagasinFilterAnalytics} onValueChange={setSelectedMagasinFilterAnalytics}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("marketing.pilliersMagasins.analysePhysique.tousMagasins")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("marketing.pilliersMagasins.analysePhysique.tousMagasins")}</SelectItem>
                        {stores.map((store) => (
                          <SelectItem key={store.id} value={store.magasin_id}>
                            {store.nom_magasin}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date de début */}
                  <div>
                    <Label htmlFor="start-date-analytics">{t("marketing.pilliersMagasins.analysePhysique.dateDebut")}</Label>
                    <Input
                      id="start-date-analytics"
                      type="date"
                      value={startDateAnalytics}
                      onChange={(e) => setStartDateAnalytics(e.target.value)}
                    />
                  </div>

                  {/* Date de fin */}
                  <div>
                    <Label htmlFor="end-date-analytics">{t("marketing.pilliersMagasins.analysePhysique.dateFin")}</Label>
                    <Input
                      id="end-date-analytics"
                      type="date"
                      value={endDateAnalytics}
                      onChange={(e) => setEndDateAnalytics(e.target.value)}
                    />
                  </div>
                </div>

                {analyticsDateError && <div className="mt-2 text-sm text-red-600">{analyticsDateError}</div>}
              </CardContent>
            </Card>

            {/* Contenu conditionnel */}
            {selectedMagasinFilterAnalytics === "all" ||
            !startDateAnalytics ||
            !endDateAnalytics ||
            analyticsDateError ? (
              <div className="text-center text-muted-foreground py-8">
                {isLoadingUserAndStores ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                    <p>{t("marketing.pilliersMagasins.analysePhysique.chargementDonnees")}</p>
                  </div>
                ) : selectedMagasinFilterAnalytics === "all" ? (
                  t("marketing.pilliersMagasins.analysePhysique.selectionnerMagasin")
                ) : !startDateAnalytics || !endDateAnalytics ? (
                  t("marketing.pilliersMagasins.analysePhysique.selectionnerPeriode")
                ) : analyticsDateError ? (
                  analyticsDateError
                ) : (
                  t("marketing.pilliersMagasins.analysePhysique.selectionnerMagasinAndPeriode")
                )}
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium">{t("marketing.pilliersMagasins.analysePhysique.visiteursUniques")}</CardTitle>
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {isLoadingHeatmapStats ? (
                        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                      ) : errorHeatmapStats ? (
                        <div className="text-red-500 text-xs">{t("marketing.pilliersMagasins.analysePhysique.pourLaPeriodeSelectionne")}</div>
                      ) : (
                        <div className="text-lg sm:text-2xl font-bold">
                          {heatmapStats?.total_visiteurs?.toLocaleString() || 0}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{t("marketing.pilliersMagasins.analysePhysique.pourLaPeriodeSelectionne")}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium">{t("marketing.pilliersMagasins.analysePhysique.tempsMoyenEnMagasin")}</CardTitle>
                      <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {isLoadingHeatmapStats ? (
                        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                      ) : errorHeatmapStats ? (
                        <div className="text-red-500 text-xs">{t("marketing.pilliersMagasins.analysePhysique.erreur")}</div>
                      ) : (
                        <div className="text-lg sm:text-2xl font-bold">
                          {heatmapStats?.duree_moyenne_globale
                            ? `${heatmapStats.duree_moyenne_globale.toFixed(1)}${t("marketing.pilliersMagasins.analysePhysique.min")}`
                            : "N/A"}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{t("marketing.pilliersMagasins.analysePhysique.dureeMoyenneVisite")}</p>
                    </CardContent>
                  </Card>

                  <Card className="sm:col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium">{t("marketing.pilliersMagasins.analysePhysique.intensiteMoyenne")}</CardTitle>
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {isLoadingHeatmapStats ? (
                        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                      ) : errorHeatmapStats ? (
                        <div className="text-red-500 text-xs">{t("marketing.pilliersMagasins.analysePhysique.erreur")}</div>
                      ) : (
                        <div className="text-lg sm:text-2xl font-bold">
                          {heatmapStats?.intensite_moyenne ? `${heatmapStats.intensite_moyenne.toFixed(1)}%` : "N/A"}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{t("marketing.pilliersMagasins.analysePhysique.intenisteGlobalMagasin")}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Heatmap du Magasin */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">{t("marketing.pilliersMagasins.analysePhysique.heatmapMagasin")}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                    {t("marketing.pilliersMagasins.analysePhysique.heatmapMagasinDescr")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Sélecteur de zone */}
                    <div className="mb-4">
                      <Label htmlFor="zone-heatmap">{t("marketing.pilliersMagasins.analysePhysique.filtrerParZone")}</Label>
                      <Select value={selectedZoneForHeatmap} onValueChange={setSelectedZoneForHeatmap}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("marketing.pilliersMagasins.analysePhysique.selectZonePlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("marketing.pilliersMagasins.analysePhysique.tousLesZones")}</SelectItem>
                          {availableZonesForHeatmap.map((zone) => (
                            <SelectItem key={zone.zone_id} value={zone.zone_id}>
                              {zone.nom_zone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {isLoadingZoneHeatmap ? (
                      <div className="flex flex-col items-center justify-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                        <p className="text-slate-500 mt-2">{t("marketing.pilliersMagasins.analysePhysique.chargementDonneesHeatmap")}</p>
                      </div>
                    ) : errorZoneHeatmap ? (
                      <p className="text-red-500 text-center py-8">{errorZoneHeatmap}</p>
                    ) : zoneHeatmapData.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                       {t("marketing.pilliersMagasins.analysePhysique.aucuneDonneesHeatmap")}
                      </p>
                    ) : (
                      <>
                        <div className="space-y-3 sm:space-y-4">
                          {zoneHeatmapData.map((item, index) => {
                            const intensite = item.intensite_moyenne || 0
                            const visiteurs = item.total_visiteurs || 0
                            const duree = item.duree_moyenne_globale || 0

                            return (
                              <div
                                key={`${item.zone_id}-${index}`}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-2"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0 ${
                                      intensite > 80
                                        ? "bg-red-500"
                                        : intensite > 60
                                          ? "bg-orange-500"
                                          : intensite > 40
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                    }`}
                                  ></div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-sm sm:text-base">
                                      {item.zone_name || `Zone ${item.zone_id}`}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-slate-600">
                                      {visiteurs} {t("marketing.pilliersMagasins.analysePhysique.visiteurs")} • {duree.toFixed(1)}{t("marketing.pilliersMagasins.analysePhysique.minMoyenne")}
                                    </p>
                                    <p className="text-xs text-slate-500">{t("marketing.pilliersMagasins.analysePhysique.zoneId")} {item.zone_id}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Progress value={intensite} className="w-16 sm:w-20" />
                                  <span className="text-xs sm:text-sm font-medium w-8 text-right">
                                    {intensite.toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Légende */}
                        <div className="mt-4 grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span>{t("marketing.pilliersMagasins.analysePhysique.tresForteIntensite")} (&gt;80%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded"></div>
                            <span>{t("marketing.pilliersMagasins.analysePhysique.forteIntensite")} (60-80%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                            <span>{t("marketing.pilliersMagasins.analysePhysique.inetnsiteModere")} (40-60%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>{t("marketing.pilliersMagasins.analysePhysique.faibleIntensite")}(&lt;40%)</span>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
