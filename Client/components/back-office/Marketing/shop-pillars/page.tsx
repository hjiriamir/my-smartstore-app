"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Palette,
  Smartphone,
  Gamepad2,
  Activity,
  Eye,
  Users,
  TrendingUp,
  ChevronDown,
  Menu,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Selecteurs } from "../selecteurs" // Import the new Selecteurs component

// --- Interfaces pour les données API ---
interface Magasin {
  magasin_id: string
  nom_magasin: string
}

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

export default function ShopPillarsPage() {
  const [selectedZone, setSelectedZone] = useState("electronics") // Existing state for static zones data
  const [showNewPillar, setShowNewPillar] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [activeTab, setActiveTab] = useState("zoning")

  // New states for user, stores, zones, and performance data
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [idEntreprise, setIdEntreprise] = useState<string | null>(null)
  const [stores, setStores] = useState<Magasin[]>([])
  const [availableZones, setAvailableZones] = useState<Zone[]>([])
  const [zonePerformanceData, setZonePerformanceData] = useState<ZonePerformanceResponse | null>(null)
  const [zoneTrafficDataMap, setZoneTrafficDataMap] = useState<Map<string, ZoneTrafficData>>(new Map()) // Map zone_id to its traffic data
  const [productPerformanceData, setProductPerformanceData] = useState<ProductPerformanceResponse | null>(null) // New state for product performance

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

  // New states for store and zone filters
  const [selectedMagasinFilter, setSelectedMagasinFilter] = useState("all")
  const [selectedZoneTypeFilter, setSelectedZoneTypeFilter] = useState("all")

  // New states for date filters in Zonage Intelligent
  const [startDateZoning, setStartDateZoning] = useState("")
  const [endDateZoning, setEndDateZoning] = useState("")
  const [zoningDateError, setZoningDateError] = useState<string | null>(null)

  const navigationItems = [
    { value: "zoning", label: "Zonage Intelligent", icon: MapPin },
    { value: "branding", label: "Branding Visuel", icon: Palette },
    { value: "interactive", label: "Interactivité", icon: Smartphone },
    { value: "gamification", label: "Gamification", icon: Gamepad2 },
    { value: "analytics", label: "Analytics Physiques", icon: Activity },
  ]
  const getCurrentNavLabel = () => {
    const current = navigationItems.find((item) => item.value === activeTab)
    return current ? current.label : "Navigation"
  }
  const zones = [
    { id: "electronics", name: "Électronique", traffic: 85, revenue: "€25,400", color: "bg-blue-500" },
    { id: "fashion", name: "Mode", traffic: 72, revenue: "€18,900", color: "bg-pink-500" },
    { id: "home", name: "Maison", traffic: 68, revenue: "€22,100", color: "bg-green-500" },
    { id: "beauty", name: "Beauté", traffic: 91, revenue: "€15,600", color: "bg-purple-500" },
    { id: "sports", name: "Sport", traffic: 54, revenue: "€12,800", color: "bg-orange-500" },
  ]
  const heatmapData = [
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
        console.log("entreprise recuperer", entrepriseId)
        setCurrentUserId(userId)
        setIdEntreprise(entrepriseId)

        if (entrepriseId) {
          const storesResponse = await fetch(
            `http://localhost:8081/api/magasins/getMagasinsByEntrepriseId/${entrepriseId}`,
          )
          if (!storesResponse.ok) {
            console.warn(`HTTP error fetching stores! status: ${storesResponse.status}`)
            setStores([])
            setErrorUserAndStores("Erreur lors de la récupération des magasins.")
            return
          }
          const storesData: Magasin[] = await storesResponse.json()
          setStores(storesData)
          // Initialize selectedMagasinFilter to the first store if available, otherwise "all"
          if (storesData.length > 0) {
            setSelectedMagasinFilter(storesData[0].magasin_id) // Use magasin_id for filter
          } else {
            setSelectedMagasinFilter("all")
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

  // Effect to fetch zones based on selected store
  useEffect(() => {
    const fetchZones = async () => {
      if (selectedMagasinFilter === "all" || !selectedMagasinFilter) {
        setAvailableZones([])
        return
      }
      setIsLoadingZones(true)
      setErrorZones(null)
      try {
        const response = await fetch(`http://localhost:8081/api/zones/getZonesMagasin/${selectedMagasinFilter}`)
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
  }, [selectedMagasinFilter])

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
      if (selectedMagasinFilter === "all" || !startDateZoning || !endDateZoning || zoningDateError) {
        setZonePerformanceData(null)
        setZoneTrafficDataMap(new Map())
        return
      }

      setIsLoadingZonePerformance(true)
      setErrorZonePerformance(null)
      setZoneTrafficDataMap(new Map()) // Clear previous traffic data

      try {
        const performanceResponse = await fetch(
          `http://localhost:8081/api/magasins/getPerformanceZones?idMagasin=${selectedMagasinFilter}&date_debut=${startDateZoning}&date_fin=${endDateZoning}`,
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
              `http://localhost:8081/api/zones/trafic-moyen?idZone=${zone.zone_id}&date_debut=${startDateZoning}&date_fin=${endDateZoning}`,
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
  }, [selectedMagasinFilter, startDateZoning, endDateZoning, zoningDateError])

  // New Effect to fetch product performance data
  useEffect(() => {
    const fetchProductPerformance = async () => {
      if (selectedMagasinFilter === "all" || !startDateZoning || !endDateZoning || zoningDateError) {
        setProductPerformanceData(null)
        return
      }

      setIsLoadingProductPerformance(true)
      setErrorProductPerformance(null)

      try {
        const response = await fetch(
          `http://localhost:8081/api/produits/performance/produits?idMagasin=${selectedMagasinFilter}&date_debut=${startDateZoning}&date_fin=${endDateZoning}`,
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
  }, [selectedMagasinFilter, startDateZoning, endDateZoning, zoningDateError])

  const isZoningFiltersActive =
    selectedMagasinFilter !== "all" &&
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">Shop Pillars</h1>
            <p className="text-slate-600 text-xs sm:text-sm lg:text-base">
              Piliers structurants de l'expérience magasin
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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 min-w-[600px] sm:min-w-0">
              <TabsTrigger value="zoning" className="text-xs sm:text-sm">
                Zonage Intelligent
              </TabsTrigger>
              <TabsTrigger value="branding" className="text-xs sm:text-sm">
                Branding Visuel
              </TabsTrigger>
              <TabsTrigger value="interactive" className="text-xs sm:text-sm">
                Interactivité
              </TabsTrigger>
              <TabsTrigger value="gamification" className="text-xs sm:text-sm">
                Gamification
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm">
                Analytics Physiques
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="zoning" className="space-y-4 sm:space-y-6">
            {/* Header with responsive buttons */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Gestion des Piliers</h2>
              <div className="flex flex-col sm:flex-row gap-2"></div>
            </div>

            {/* Store, Zone Type, and Date Selectors */}
            <Selecteurs
              stores={stores}
              availableZones={availableZones}
              selectedMagasinFilter={selectedMagasinFilter}
              setSelectedMagasinFilter={setSelectedMagasinFilter}
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
                    <p>Chargement des données...</p>
                  </div>
                ) : errorUserAndStores || errorZones || errorZonePerformance ? (
                  <p className="text-red-500">{errorUserAndStores || errorZones || errorZonePerformance}</p>
                ) : selectedMagasinFilter === "all" &&
                  selectedZoneTypeFilter === "all" &&
                  (!startDateZoning || !endDateZoning) ? (
                  "Veuillez sélectionner un magasin, un type de zone et une plage de dates pour afficher les données de zonage."
                ) : selectedMagasinFilter === "all" ? (
                  "Veuillez sélectionner un magasin pour activer les filtres de zone et de date."
                ) : selectedZoneTypeFilter === "all" ? (
                  "Veuillez sélectionner un type de zone pour afficher les données de zonage."
                ) : !startDateZoning || !endDateZoning ? (
                  "Veuillez sélectionner une plage de dates pour afficher les données de zonage."
                ) : zoningDateError ? (
                  zoningDateError
                ) : (
                  "Veuillez sélectionner un magasin, un type de zone et une plage de dates pour afficher les données de zonage."
                )}
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm sm:text-base font-semibold">Zones Actives</CardTitle>
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {isLoadingZonePerformance ? (
                        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                      ) : (
                        <div className="text-xl sm:text-3xl font-extrabold">{totalActiveZones}</div>
                      )}
                      <p className="text-xs text-muted-foreground">Optimisées {displayCurrentPeriod()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm sm:text-base font-semibold">Trafic Moyen</CardTitle>
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
                          {relevantTrafficData.length > 0 ? relevantTrafficData[0].diffVariation : "N/A"} vs{" "}
                          {displayPreviousPeriod()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm sm:text-base font-semibold">Revenus Zones</CardTitle>
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {isLoadingZonePerformance ? (
                        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                      ) : (
                        <div className="text-xl sm:text-3xl font-extrabold">€{totalZoneRevenue.toFixed(2)}</div>
                      )}
                      <p className="text-xs text-muted-foreground">Pour la période {displayCurrentPeriod()}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">Recommandations d'Assortiment</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Suggestions personnalisées basées sur les données
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingProductPerformance ? (
                        <div className="flex flex-col items-center justify-center h-32">
                          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                          <p className="text-slate-500 mt-2">Chargement des recommandations de produits...</p>
                        </div>
                      ) : errorProductPerformance ? (
                        <p className="text-red-500 text-center py-8">{errorProductPerformance}</p>
                      ) : (productPerformanceData?.produits.length || 0) === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          Aucune recommandation de produit disponible pour la sélection actuelle.
                        </p>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          {productPerformanceData?.produits.map((product) => {
                            let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline"
                            let badgeText = "Action"

                            if (
                              product.recommendation.toLowerCase().includes("explosion") ||
                              product.recommendation.toLowerCase().includes("capitaliser") ||
                              product.recommendation.toLowerCase().includes("ajouter")
                            ) {
                              badgeVariant = "default"
                              badgeText = "Ajouter"
                            } else if (
                              product.recommendation.toLowerCase().includes("baisse") ||
                              product.recommendation.toLowerCase().includes("revoir") ||
                              product.recommendation.toLowerCase().includes("retirer")
                            ) {
                              badgeVariant = "destructive"
                              badgeText = "Revoir"
                            } else if (product.recommendation.toLowerCase().includes("déplacer")) {
                              badgeVariant = "secondary"
                              badgeText = "Déplacer"
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
                                    Appliquer
                                  </Button>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-600 mb-1">
                                  Variation: {product.diffVariation}
                                </p>
                                <p className="text-xs sm:text-sm font-medium text-green-600">
                                  Recommandation: {product.recommendation}
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
          <TabsContent value="branding" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                    Identité Visuelle
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Cohérence des éléments de branding</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-3 sm:p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Palette de Couleurs</h4>
                      <div className="flex gap-2 mb-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded"></div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-400 rounded"></div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-800 rounded"></div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-200 rounded"></div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600">Appliquée sur 95% des supports</p>
                    </div>
                    <div className="p-3 sm:p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Typographie</h4>
                      <div className="space-y-1">
                        <p className="font-bold text-base sm:text-lg">Titre Principal - Bold</p>
                        <p className="font-medium text-sm sm:text-base">Sous-titre - Medium</p>
                        <p className="text-xs sm:text-sm">Corps de texte - Regular</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Supports de Communication</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Présentoirs et affichages digitaux</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-green-50 rounded-lg gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-green-800 text-sm sm:text-base">Écrans Digitaux</h4>
                        <p className="text-xs sm:text-sm text-green-600">12 écrans actifs</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 text-xs w-fit">100% Opérationnels</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-blue-50 rounded-lg gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-blue-800 text-sm sm:text-base">Présentoirs</h4>
                        <p className="text-xs sm:text-sm text-blue-600">45 supports physiques</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 text-xs w-fit">Conformes</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-purple-50 rounded-lg gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-purple-800 text-sm sm:text-base">Vitrines</h4>
                        <p className="text-xs sm:text-sm text-purple-600">6 vitrines thématiques</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800 text-xs w-fit">Mise à jour</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="interactive" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                  Outils d'Engagement Client
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Technologies interactives et leur performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    {interactiveElements.map((element, index) => (
                      <div key={element.name} className="p-3 sm:p-4 border rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                          <h4 className="font-medium text-sm sm:text-base truncate">{element.name}</h4>
                          <Badge variant="outline" className="text-xs w-fit">
                            {element.satisfaction}/5 ⭐
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-slate-600">Utilisation:</span>
                          <Progress value={element.usage} className="flex-1" />
                          <span className="text-xs sm:text-sm font-medium">{element.usage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg">QR Codes Produits</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center mb-4">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black mx-auto mb-2 flex items-center justify-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white grid grid-cols-8 gap-px p-1">
                              {Array.from({ length: 64 }, (_, i) => (
                                <div key={i} className={`${Math.random() > 0.5 ? "bg-black" : "bg-white"}`}></div>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600">Scannez pour plus d'infos</p>
                        </div>
                        <div className="text-xs sm:text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Scans aujourd'hui:</span>
                            <span className="font-medium">247</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Conversions:</span>
                            <span className="font-medium">18%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="gamification" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    Éléments Ludiques
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Engagement par le jeu et les défis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-3 sm:p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Chasse au Trésor Mensuelle</h4>
                      <p className="text-xs sm:text-sm text-slate-600 mb-3">
                        Trouvez 5 produits cachés dans le magasin via l'app mobile
                      </p>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-800 text-xs w-fit">342 participants</Badge>
                        <span className="text-xs sm:text-sm font-medium">Récompense: 20% de remise</span>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Programme de Points</h4>
                      <p className="text-xs sm:text-sm text-slate-600 mb-3">
                        Gagnez des points à chaque achat et débloquez des récompenses
                      </p>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800 text-xs w-fit">1,240 membres actifs</Badge>
                        <span className="text-xs sm:text-sm font-medium">Taux engagement: 78%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Classement des Joueurs</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Top participants du mois</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { rank: 1, name: "Marie L.", points: 2450, badge: "🏆" },
                      { rank: 2, name: "Pierre M.", points: 2180, badge: "🥈" },
                      { rank: 3, name: "Sophie D.", points: 1920, badge: "🥉" },
                      { rank: 4, name: "Jean R.", points: 1750, badge: "⭐" },
                      { rank: 5, name: "Emma B.", points: 1680, badge: "⭐" },
                    ].map((player) => (
                      <div
                        key={player.rank}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl sm:text-2xl">{player.badge}</span>
                          <div>
                            <h4 className="font-medium text-sm sm:text-base">{player.name}</h4>
                            <p className="text-xs sm:text-sm text-slate-600">#{player.rank}</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="font-semibold text-purple-600 text-sm sm:text-base">{player.points}</div>
                          <div className="text-xs sm:text-sm text-slate-600">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Visiteurs Uniques</CardTitle>
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">3,247</div>
                  <p className="text-xs text-muted-foreground">+8% vs semaine dernière</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Temps Moyen</CardTitle>
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">18min</div>
                  <p className="text-xs text-muted-foreground">vs moyenne sur la période</p>
                </CardContent>
              </Card>
              <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Taux Conversion</CardTitle>
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">24.5%</div>
                  <p className="text-xs text-muted-foreground">+3.2% vs mois dernier</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Heatmap du Magasin</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Analyse des zones de forte affluence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {heatmapData.map((zone, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0 ${
                            zone.intensity > 80
                              ? "bg-red-500"
                              : zone.intensity > 60
                                ? "bg-orange-500"
                                : zone.intensity > 40
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                          }`}
                        ></div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm sm:text-base">{zone.zone}</h4>
                          <p className="text-xs sm:text-sm text-slate-600">{zone.visitors} visiteurs/jour</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={zone.intensity} className="w-16 sm:w-20" />
                        <span className="text-xs sm:text-sm font-medium w-8 text-right">{zone.intensity}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Très forte affluence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span>Forte affluence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Affluence modérée</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Faible affluence</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
