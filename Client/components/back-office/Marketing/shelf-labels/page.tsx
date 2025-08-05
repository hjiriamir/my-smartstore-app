"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Tag,
  Package,
  AlertTriangle,
  CheckCircle,
  Edit,
  Printer,
  Camera,
  ChevronDown,
  Menu,
  DollarSign,
  Settings,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"

// Types pour les données API
interface GeneratedLabel {
  id: number
  template_id: number
  produit_id: string
  label_data: string
  quantity: number
  status: string
  date_creation: string
}

interface PriceChange {
  id: number
  product_id: string
  old_price: string
  new_price: string
  change_type: string
  change_value: string
  reason: string
  changed_by: string
  changed_at: string
}

interface LastPriceChange {
  id: number
  product_id: string
  old_price: string
  new_price: string
  change_type: string
  change_value: string
  reason: string
  changed_by: string
  changed_at: string
}

// Interface pour les alertes stock
interface StockAlert {
  id: number
  product_id: string
  alert_type: "out_of_stock" | "low_stock"
  threshold: number
  is_active: boolean
  notified_at: string
  Produit: {
    produit_id: string
    nom: string
    stock: number
  }
}

interface Product {
  id: string
  nom: string
  prix: number
  ancienPrix: number
  stockStatus: string
  ticketStatus: string
  zone: string
  imageUrl?: string
  poids?: string
  marque?: string
  historyPrice: PriceChange[]
  tickets: GeneratedLabel[]
  lastPriceChange?: LastPriceChange
}

interface Magasin {
  id: number
  nom: string
  adresse: string
  entreprises_id: number
}

// Types pour les templates d'étiquettes
interface LabelTemplateField {
  id: number
  template_id: number
  field_name: string
  is_active: boolean
  display_order: number
}

interface LabelTemplate {
  id: number
  name: string
  size: string
  is_default: boolean
  created_at: string
  updated_at: string
  fields: LabelTemplateField[]
}

// Interface pour la génération d'étiquettes
interface GenerateLabelRequest {
  template_id: number
  produits: {
    produit_id: string
    label_data: {
      prix: number
      stock?: number
      [key: string]: any
    }
    quantity: number
  }[]
}

export default function OptimizedShelfLabelsPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  // RTL utility classes
  const rtlClasses = {
    textAlign: isRTL ? "text-right" : "text-left",
    flexDirection: isRTL ? "flex-row-reverse" : "flex-row",
    marginLeft: isRTL ? "mr-auto" : "ml-auto",
    marginRight: isRTL ? "ml-auto" : "mr-auto",
    paddingLeft: isRTL ? "pr-3" : "pl-3",
    paddingRight: isRTL ? "pl-3" : "pr-3",
    borderRadius: isRTL ? "rounded-r-lg" : "rounded-l-lg",
    justifyContent: isRTL ? "justify-end" : "justify-start",
    itemsStart: isRTL ? "items-end" : "items-start",
    spaceReverse: isRTL ? "space-x-reverse" : "",
  }

  const DirectionalArrow = ({ className }: { className?: string }) => {
    return isRTL ? <ArrowRight className={className} /> : <ArrowLeft className={className} />
  }

  // États existants
  const [showNewLabel, setShowNewLabel] = useState(false)
  const [showBulkPricing, setShowBulkPricing] = useState(false)
  const [showLabelTemplate, setShowLabelTemplate] = useState(false)
  const [showPriceUpdate, setShowPriceUpdate] = useState(false)
  const [showEditTemplate, setShowEditTemplate] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [activeTab, setActiveTab] = useState("labels-pricing")
  const [showNewTemplate, setShowNewTemplate] = useState(false)

  // Nouveaux états pour les données API
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [idEntreprise, setIdEntreprise] = useState<number | null>(null)
  const [stores, setStores] = useState<Magasin[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [generatedLabelsCount, setGeneratedLabelsCount] = useState(0)
  const [priceChangesCount, setPriceChangesCount] = useState(0)
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [labelTemplates, setLabelTemplates] = useState<LabelTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [selectedProductsForLabels, setSelectedProductsForLabels] = useState<string[]>([])
  const [labelQuantities, setLabelQuantities] = useState<{ [key: string]: number }>({})
  const [isGeneratingLabels, setIsGeneratingLabels] = useState(false)

  // Ajouter après les autres états
  const [selectedProductForPriceUpdate, setSelectedProductForPriceUpdate] = useState<Product | null>(null)
  const [newPrice, setNewPrice] = useState("")
  const [changeReason, setChangeReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false)
  const [showLabelPreview, setShowLabelPreview] = useState(false)
  const [selectedProductForPreview, setSelectedProductForPreview] = useState<Product | null>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const API_URL = process.env.NEXT_PUBLIC_BASE_URL

  // États pour les recherches multicritères
  const [labelSearchFilters, setLabelSearchFilters] = useState({
    name: "",
    category: "all",
    location: "all",
    status: "all",
    priceMin: "",
    priceMax: "",
  })

  const [priceSearchFilters, setPriceSearchFilters] = useState({
    name: "",
    category: "all",
    location: "all",
    status: "all",
    priceMin: "",
    priceMax: "",
  })

  const [productSearchFilters, setProductSearchFilters] = useState({
    name: "",
    category: "all",
    location: "all",
    status: "all",
    priceMin: "",
    priceMax: "",
  })

  const [stockSearchFilters, setStockSearchFilters] = useState({
    name: "",
    category: "all",
    location: "all",
    status: "all",
    priceMin: "",
    priceMax: "",
  })

  // Fonction pour récupérer les données utilisateur et magasins
  useEffect(() => {
    const fetchCurrentUserDataAndStores = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("Token d'authentification manquant")
          setError("Token d'authentification manquant")
          setLoading(false)
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

        setCurrentUserId(userId)
        setIdEntreprise(entrepriseId)

        if (entrepriseId) {
          // Récupérer les magasins
          const storesResponse = await fetch(`${API_BASE_URL}/magasins/getMagasinsByEntrepriseId/${entrepriseId}`)
          if (storesResponse.ok) {
            const storesData: Magasin[] = await storesResponse.json()
            setStores(storesData)
          }

          // Récupérer les données en parallèle
          await Promise.all([
            fetchGeneratedLabels(entrepriseId),
            fetchPriceChanges(entrepriseId),
            fetchProducts(entrepriseId),
            fetchLabelTemplates(),
            fetchStockAlerts(entrepriseId), // Ajouter cette ligne
          ])
        }
      } catch (error) {
        console.error("Error fetching current user data or stores:", error)
        setError("Erreur lors du chargement des données")
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUserDataAndStores()
  }, [])

  // Fonction pour récupérer les étiquettes générées
  const fetchGeneratedLabels = async (entrepriseId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/generated-labels/getDailyGeneratedTicket/${entrepriseId}`)
      if (response.ok) {
        const data = await response.json()
        setGeneratedLabelsCount(data.count || 0)
      }
    } catch (error) {
      console.error("Error fetching generated labels:", error)
    }
  }

  // Fonction pour récupérer les changements de prix
  const fetchPriceChanges = async (entrepriseId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/price-history/getPricesChangement/${entrepriseId}`)
      if (response.ok) {
        const data = await response.json()
        setPriceChangesCount(data.count || 0)
      }
    } catch (error) {
      console.error("Error fetching price changes:", error)
    }
  }

  // Nouvelle fonction pour récupérer les alertes stock
  const fetchStockAlerts = async (entrepriseId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stock-alerts/getAllStockAlerts/${entrepriseId}`)
      if (response.ok) {
        const data: StockAlert[] = await response.json()
        console.log("Stock alerts fetched:", data)
        setStockAlerts(data)
      }
    } catch (error) {
      console.error("Error fetching stock alerts:", error)
    }
  }

  const fetchLastPriceChange = async (productId: string): Promise<LastPriceChange | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/price-history/getLastPrice/${productId}`)
      if (response.ok) {
        const data: LastPriceChange = await response.json()
        return data
      }
      return null
    } catch (error) {
      console.error(`Error fetching last price change for ${productId}:`, error)
      return null
    }
  }

  // Fonction pour construire l'URL complète de l'image avec gestion du path upload
  const getImageUrl = (imageUrl: string | null | undefined): string => {
    console.log("🖼️ Processing image URL:", imageUrl)
    if (!imageUrl) {
      console.log("❌ No image URL provided, using placeholder")
      return "/placeholder.svg?height=100&width=100&text=No+Image"
    }

    // Si l'URL commence déjà par http, la retourner telle quelle
    if (imageUrl.startsWith("http")) {
      console.log("✅ Full URL detected:", imageUrl)
      return imageUrl
    }

    // Construire l'URL complète avec le serveur backend
    const baseUrl = "http://localhost:8081"
    // Si le path commence par "upload/", construire l'URL directement
    if (imageUrl.startsWith("upload/")) {
      const fullUrl = `${API_URL}/${imageUrl}`
      console.log("🔧 Constructed URL for upload path:", fullUrl)
      return fullUrl
    }

    // Si le path ne commence pas par "/", l'ajouter
    const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`
    const fullUrl = `${API_URL}${cleanPath}`
    console.log("🔧 Constructed URL:", fullUrl)
    return fullUrl
  }

  // Fonction pour mapper les statuts de stock français vers les clés de traduction
  const getTranslatedStockStatus = (frenchStatus: string) => {
    const statusMap: { [key: string]: string } = {
      "En stock": t("marketing.etiquetage.integrationStock.enStock"),
      "en stock": t("marketing.etiquetage.integrationStock.enStock"),
      "Stock faible": t("marketing.etiquetage.integrationStock.stockFaible"),
      "stock faible": t("marketing.etiquetage.integrationStock.stockFaible"),
      Rupture: t("marketing.etiquetage.integrationStock.ruptureStock"),
      rupture: t("marketing.etiquetage.integrationStock.ruptureStock"),
      "Rupture de stock": t("marketing.etiquetage.integrationStock.ruptureDeStock"),
      "rupture de stock": t("marketing.etiquetage.integrationStock.ruptureDeStock"),
      "Out of stock": t("marketing.etiquetage.integrationStock.ruptureStock"),
      "Low stock": t("marketing.etiquetage.integrationStock.stockFaible"),
      "In stock": t("marketing.etiquetage.integrationStock.enStock"),
    }

    return statusMap[frenchStatus] || frenchStatus
  }

  // Remplacer la fonction fetchProducts existante
  const fetchProducts = async (entrepriseId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/produits/getEntrepriseProduitsDetails/${entrepriseId}`)
      if (response.ok) {
        const data: Product[] = await response.json()
        // Récupérer les derniers changements de prix pour chaque produit
        const productsWithPriceChanges = await Promise.all(
          data.map(async (product) => {
            const lastPriceChange = await fetchLastPriceChange(product.id)
            const fullImageUrl = getImageUrl(product.imageUrl)
            console.log(`Product ${product.nom}:`, {
              originalImageUrl: product.imageUrl,
              fullImageUrl: fullImageUrl,
            })
            return {
              ...product,
              lastPriceChange,
              imageUrl: fullImageUrl,
            }
          }),
        )
        setProducts(productsWithPriceChanges)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  // Fonction pour récupérer les templates d'étiquettes
  const fetchLabelTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/label-templates/getAllLabelTemplates`)
      if (response.ok) {
        const data: LabelTemplate[] = await response.json()
        setLabelTemplates(data)
        // Sélectionner le template par défaut
        const defaultTemplate = data.find((t) => t.is_default)
        if (defaultTemplate) {
          setSelectedTemplate(defaultTemplate.id)
        }
      }
    } catch (error) {
      console.error("Error fetching label templates:", error)
    }
  }

  // Fonction pour générer les étiquettes
  const generateLabels = async () => {
    if (!selectedTemplate || selectedProductsForLabels.length === 0) {
      alert("Veuillez sélectionner un modèle et au moins un produit")
      return
    }

    setIsGeneratingLabels(true)
    try {
      const selectedProducts = products.filter((p) => selectedProductsForLabels.includes(p.id))
      const requestBody: GenerateLabelRequest = {
        template_id: selectedTemplate,
        produits: selectedProducts.map((product) => ({
          produit_id: product.id,
          label_data: {
            prix: product.prix,
            stock: 100, // Valeur par défaut, peut être dynamique
            nom: product.nom,
            zone: product.zone,
          },
          quantity: labelQuantities[product.id] || 1,
        })),
      }

      const response = await fetch(`${API_BASE_URL}/generated-labels/generate-tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        alert("Étiquettes générées avec succès!")
        setShowNewLabel(false)
        setSelectedProductsForLabels([])
        setLabelQuantities({})
        // Rafraîchir les données
        if (idEntreprise) {
          await fetchGeneratedLabels(idEntreprise)
        }
      } else {
        throw new Error("Erreur lors de la génération des étiquettes")
      }
    } catch (error) {
      console.error("Error generating labels:", error)
      alert("Erreur lors de la génération des étiquettes")
    } finally {
      setIsGeneratingLabels(false)
    }
  }

  // Fonction pour mettre à jour le prix d'un produit
  const updateProductPrice = async () => {
    if (!selectedProductForPriceUpdate || !newPrice || !changeReason) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    setIsUpdatingPrice(true)
    try {
      const requestBody = {
        produit_id: selectedProductForPriceUpdate.id,
        new_price: Number.parseFloat(newPrice),
        change_type: getChangeTypeFromReason(changeReason),
        reason: changeReason === "custom" ? customReason : changeReason,
        changed_by: currentUserId ? "admin" : "user", // Utiliser le rôle de l'utilisateur connecté
      }

      const response = await fetch(`${API_BASE_URL}/produits/updateProductPrice`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        alert("Prix mis à jour avec succès!")
        setShowPriceUpdate(false)
        setSelectedProductForPriceUpdate(null)
        setNewPrice("")
        setChangeReason("")
        setCustomReason("")
        // Rafraîchir les données
        if (idEntreprise) {
          await Promise.all([fetchProducts(idEntreprise), fetchPriceChanges(idEntreprise)])
        }
      } else {
        throw new Error("Erreur lors de la mise à jour du prix")
      }
    } catch (error) {
      console.error("Error updating price:", error)
      alert("Erreur lors de la mise à jour du prix")
    } finally {
      setIsUpdatingPrice(false)
    }
  }

  // Fonction helper pour déterminer le type de changement
  const getChangeTypeFromReason = (reason: string) => {
    switch (reason) {
      case "Promotion":
      case "Déstockage":
        return "percentage"
      case "Concurrence":
      case "Coût fournisseur":
        return "fixed"
      default:
        return "fixed"
    }
  }

  // Fonction améliorée pour l'export d'étiquette avec gestion d'erreur robuste
  const exportLabelAsImage = () => {
    if (!selectedProductForPreview) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Dimensions de l'étiquette
    canvas.width = 350
    canvas.height = 200

    // Fonction pour dessiner l'étiquette
    const drawLabel = (productImage = null) => {
      // Fond blanc
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Bordure
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 1
      ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4)

      // Nom du produit en haut
      ctx.fillStyle = "#000000"
      ctx.font = "bold 16px Arial"
      ctx.textAlign = isRTL ? "right" : "left"
      const nameX = isRTL ? canvas.width - 10 : 10
      ctx.fillText(selectedProductForPreview.nom.toUpperCase(), nameX, 25)

      // Section prix (partie droite ou gauche selon RTL)
      const priceX = isRTL ? 120 : canvas.width - 120

      // Logique d'affichage des prix selon les conditions
      if (selectedProductForPreview.lastPriceChange) {
        const oldPrice = Number.parseFloat(selectedProductForPreview.lastPriceChange.old_price)
        const newPrice = Number.parseFloat(selectedProductForPreview.lastPriceChange.new_price)

        // Afficher ancien prix barré seulement si old_price > new_price (promotion)
        if (oldPrice > newPrice) {
          ctx.font = "14px Arial"
          ctx.fillStyle = "#999999"
          ctx.textAlign = isRTL ? "left" : "right"
          const oldPriceX = isRTL ? priceX : priceX
          ctx.fillText(`${oldPrice}€`, oldPriceX, 60)

          // Ligne barrée
          const textWidth = ctx.measureText(`${oldPrice}€`).width
          ctx.strokeStyle = "#999999"
          ctx.lineWidth = 2
          ctx.beginPath()
          if (isRTL) {
            ctx.moveTo(priceX, 55)
            ctx.lineTo(priceX + textWidth, 55)
          } else {
            ctx.moveTo(priceX - textWidth, 55)
            ctx.lineTo(priceX, 55)
          }
          ctx.stroke()
        }

        // Prix actuel
        ctx.font = "bold 36px Arial"
        ctx.fillStyle = "#e74c3c"
        ctx.textAlign = isRTL ? "left" : "right"
        const currentPriceX = isRTL ? priceX - 50 : priceX + 50
        ctx.fillText(`${newPrice}€`, currentPriceX, 100)
      } else {
        // Prix normal sans changement
        ctx.font = "bold 36px Arial"
        ctx.fillStyle = "#e74c3c"
        ctx.textAlign = isRTL ? "left" : "right"
        const normalPriceX = isRTL ? priceX - 50 : priceX + 50
        ctx.fillText(`${selectedProductForPreview.prix}€`, normalPriceX, 100)
      }

      // Zone
      ctx.font = "10px Arial"
      ctx.fillStyle = "#666666"
      ctx.textAlign = isRTL ? "left" : "right"
      const zoneX = isRTL ? 10 : canvas.width - 10
      ctx.fillText(selectedProductForPreview.zone, zoneX, 120)

      // Dessiner l'image du produit ou un placeholder
      const imageRect = isRTL
        ? { x: canvas.width - 90, y: 45, width: 80, height: 60 }
        : { x: 10, y: 45, width: 80, height: 60 }

      if (productImage) {
        // Dessiner l'image réelle du produit
        ctx.save()
        ctx.beginPath()
        ctx.rect(imageRect.x, imageRect.y, imageRect.width, imageRect.height)
        ctx.clip()

        // Calculer les dimensions pour maintenir le ratio
        const imgRatio = productImage.width / productImage.height
        const rectRatio = imageRect.width / imageRect.height
        let drawWidth, drawHeight, drawX, drawY

        if (imgRatio > rectRatio) {
          // Image plus large que le rectangle
          drawHeight = imageRect.height
          drawWidth = drawHeight * imgRatio
          drawX = imageRect.x - (drawWidth - imageRect.width) / 2
          drawY = imageRect.y
        } else {
          // Image plus haute que le rectangle
          drawWidth = imageRect.width
          drawHeight = drawWidth / imgRatio
          drawX = imageRect.x
          drawY = imageRect.y - (drawHeight - imageRect.height) / 2
        }

        ctx.drawImage(productImage, drawX, drawY, drawWidth, drawHeight)
        ctx.restore()

        // Bordure autour de l'image
        ctx.strokeStyle = "#cccccc"
        ctx.lineWidth = 1
        ctx.strokeRect(imageRect.x, imageRect.y, imageRect.width, imageRect.height)
      } else {
        // Placeholder si pas d'image
        ctx.strokeStyle = "#cccccc"
        ctx.lineWidth = 1
        ctx.strokeRect(imageRect.x, imageRect.y, imageRect.width, imageRect.height)
        ctx.fillStyle = "#f0f0f0"
        ctx.fillRect(imageRect.x + 1, imageRect.y + 1, imageRect.width - 2, imageRect.height - 2)

        // Texte "IMAGE" au centre du rectangle
        ctx.fillStyle = "#999999"
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.fillText("IMAGE", imageRect.x + imageRect.width / 2, imageRect.y + imageRect.height / 2 + 3)
      }

      // Code-barres simulé (en bas)
      ctx.fillStyle = "#000000"
      const barStartY = 130
      for (let i = 0; i < 60; i++) {
        const x = 20 + i * 4
        const height = Math.random() > 0.3 ? 25 : 15
        const width = Math.random() > 0.5 ? 2 : 1
        ctx.fillRect(x, barStartY, width, height)
      }

      // Code produit sous le code-barres
      ctx.font = "8px Arial"
      ctx.fillStyle = "#000000"
      ctx.textAlign = "center"
      ctx.fillText(selectedProductForPreview.id, canvas.width / 2, barStartY + 35)

      // Date
      ctx.font = "8px Arial"
      ctx.fillStyle = "#666666"
      ctx.textAlign = isRTL ? "left" : "right"
      const dateX = isRTL ? 10 : canvas.width - 10
      ctx.fillText(new Date().toLocaleDateString(), dateX, canvas.height - 10)

      // Télécharger l'image
      const link = document.createElement("a")
      link.download = `etiquette-${selectedProductForPreview.id}-${selectedProductForPreview.nom.replace(/\s+/g, "-")}.png`
      link.href = canvas.toDataURL()
      link.click()
    }

    // Fonction pour essayer de charger l'image avec plusieurs URLs alternatives
    const tryLoadImage = async (urls: string[]): Promise<HTMLImageElement | null> => {
      for (const url of urls) {
        try {
          console.log(`🔄 Trying to load image from: ${url}`)
          const img = new Image()
          img.crossOrigin = "anonymous"
          const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error(`Timeout loading image from ${url}`))
            }, 5000) // 5 secondes de timeout

            img.onload = () => {
              clearTimeout(timeout)
              console.log(`✅ Image loaded successfully from: ${url}`)
              resolve(img)
            }

            img.onerror = (error) => {
              clearTimeout(timeout)
              console.error(`❌ Failed to load image from: ${url}`, error)
              reject(new Error(`Failed to load image from ${url}`))
            }

            img.src = url
          })

          const loadedImage = await loadPromise
          return loadedImage
        } catch (error) {
          console.warn(`⚠️ Failed to load from ${url}, trying next URL...`)
          continue
        }
      }
      return null
    }

    // Dans la fonction exportLabelAsImage, remplacer la partie qui crée les URLs alternatives :
    if (
      selectedProductForPreview.imageUrl &&
      selectedProductForPreview.imageUrl !== "/placeholder.svg" &&
      !selectedProductForPreview.imageUrl.includes("placeholder.svg")
    ) {
      // Créer une liste d'URLs alternatives à essayer basée sur le path original
      const originalPath = selectedProductForPreview.imageUrl
      const alternativeUrls = []

      // URL construite par getImageUrl (déjà formatée)
      alternativeUrls.push(originalPath)

      // Si le path original contient "upload/", essayer différentes variantes
      if (originalPath.includes("upload/")) {
        const fileName = originalPath.split("/").pop() // Récupérer juste le nom du fichier
        // URLs alternatives pour les fichiers upload
        alternativeUrls.push(`http://localhost:8081/upload/${fileName}`)
        alternativeUrls.push(`http://localhost:8081/api/files/upload/${fileName}`)
        alternativeUrls.push(`http://localhost:8081/static/upload/${fileName}`)
        alternativeUrls.push(`http://localhost:8081/uploads/${fileName}`) // Au cas où le dossier s'appelle "uploads"
        alternativeUrls.push(`http://localhost:8081/api/uploads/${fileName}`)
      } else {
        // URLs alternatives pour les autres paths
        alternativeUrls.push(originalPath.replace("http://localhost:8081/", "http://localhost:8081/api/files/"))
        alternativeUrls.push(originalPath.replace("http://localhost:8081/", "http://localhost:8081/static/"))
        alternativeUrls.push(`http://localhost:8081/api/files/${originalPath.split("/").pop()}`)
      }

      console.log("🔍 Attempting to load image with alternative URLs:", alternativeUrls)

      tryLoadImage(alternativeUrls)
        .then((img) => {
          if (img) {
            console.log("✅ Image loaded successfully for export")
            drawLabel(img)
          } else {
            console.log("❌ All image loading attempts failed, using placeholder")
            drawLabel(null)
          }
        })
        .catch((error) => {
          console.error("❌ Error in image loading process:", error)
          drawLabel(null)
        })
    } else {
      console.log("⚠️ No valid image URL available, using placeholder")
      drawLabel(null)
    }
  }

  // Fonction de filtrage des produits adaptée aux nouvelles données
  const filterProducts = (products: Product[], filters: any) => {
    return products.filter((product) => {
      const matchesName = !filters.name || product.nom.toLowerCase().includes(filters.name.toLowerCase())
      const matchesLocation =
        filters.location === "all" ||
        !filters.location ||
        product.zone.toLowerCase().includes(filters.location.toLowerCase())
      const matchesStatus =
        filters.status === "all" ||
        !filters.status ||
        product.stockStatus.toLowerCase().includes(filters.status.toLowerCase())
      const matchesPriceMin = !filters.priceMin || product.prix >= Number.parseFloat(filters.priceMin)
      const matchesPriceMax = !filters.priceMax || product.prix <= Number.parseFloat(filters.priceMax)

      return matchesName && matchesLocation && matchesStatus && matchesPriceMin && matchesPriceMax
    })
  }

  // Obtenir les produits filtrés
  const filteredProductsForLabels = filterProducts(products, labelSearchFilters)
  const filteredProductsForPricing = filterProducts(products, priceSearchFilters)
  const filteredProductsForManagement = filterProducts(products, productSearchFilters)
  const filteredProductsForStock = filterProducts(products, stockSearchFilters)

  // Obtenir les zones uniques
  const locations = [...new Set(products.map((p) => p.zone).filter((zone) => zone))]

  // Fonction pour obtenir le statut du badge
  const getStatusBadge = (stockStatus: string) => {
    const status = stockStatus.toLowerCase()
    if (status.includes("en stock")) return "default"
    if (status.includes("faible") || status.includes("low")) return "secondary"
    if (status.includes("rupture") || status.includes("out")) return "destructive"
    return "default"
  }

  // Fonction pour obtenir le statut des étiquettes
  const getLabelStatusBadge = (ticketStatus: string) => {
    const status = ticketStatus.toLowerCase()
    if (status.includes("disponible") || status.includes("printed")) return "default"
    if (status.includes("attente") || status.includes("pending")) return "secondary"
    if (status.includes("erreur") || status.includes("error")) return "destructive"
    return "secondary"
  }

  // Fonction pour obtenir le texte et style d'une alerte
  const getAlertInfo = (alert: StockAlert) => {
    switch (alert.alert_type) {
      case "out_of_stock":
        return {
          title: t("marketing.etiquetage.integrationStock.ruptureDeStock"),
          message: `${alert.Produit.nom}`,
          productId: alert.product_id,
          stock: alert.Produit.stock,
          threshold: alert.threshold,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-600",
          titleColor: "text-red-800",
          icon: AlertTriangle,
          iconColor: "text-red-600",
          priority: t("marketing.etiquetage.integrationStock.urgent"),
        }
      case "low_stock":
        return {
          title: t("marketing.etiquetage.integrationStock.stockFaible"),
          message: `${alert.Produit.nom}`,
          productId: alert.product_id,
          stock: alert.Produit.stock,
          threshold: alert.threshold,
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          textColor: "text-orange-600",
          titleColor: "text-orange-800",
          icon: AlertTriangle,
          iconColor: "text-orange-600",
          priority: t("marketing.etiquetage.integrationStock.attention"),
        }
      default:
        return {
          title: t("marketing.etiquetage.integrationStock.alertStocke"),
          message: `${alert.Produit.nom}`,
          productId: alert.product_id,
          stock: alert.Produit.stock,
          threshold: alert.threshold,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-600",
          titleColor: "text-gray-800",
          icon: AlertTriangle,
          iconColor: "text-gray-600",
          priority: t("marketing.etiquetage.integrationStock.info"),
        }
    }
  }

  const navigationItems = [
    { value: "labels-pricing", label: "Étiquettes & Prix", icon: Tag },
    { value: "stock-integration", label: "Intégration Stocks", icon: Package },
  ]

  const getCurrentNavLabel = () => {
    const activeItem = navigationItems.find((item) => item.value === activeTab)
    return activeItem ? activeItem.label : "Étiquettes & Prix"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir={textDirection}>
        <div className={`text-center ${rtlClasses.textAlign}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">{t("marketing.pilliersMagasins.analysePhysique.chargementDonnees")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir={textDirection}>
        <div className={`text-center ${rtlClasses.textAlign}`}>
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 mt-8 sm:mt-12" dir={textDirection}>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className={`flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 ${rtlClasses.flexDirection}`}>
          <Link href="/marketing">
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent">
              <DirectionalArrow className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </Link>
          <div className={`min-w-0 flex-1 ${rtlClasses.textAlign}`}>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">
              {t("marketing.etiquetage.etiquettesAndPrix.etiquetageTitle")}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm lg:text-base">
              {t("marketing.etiquetage.etiquettesAndPrix.etiquetageTitleDescr")}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Navigation - Dropdown on mobile, tabs on desktop */}
          <div className="block sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-between bg-transparent ${rtlClasses.flexDirection}`}
                >
                  <div className={`flex items-center gap-2 ${rtlClasses.flexDirection}`}>
                    <Menu className="w-4 h-4" />
                    <span className="truncate">{getCurrentNavLabel()}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 ${isRTL ? "mr-2" : "ml-2"}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "end" : "start"} className="w-[280px]">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem
                      key={item.value}
                      onClick={() => setActiveTab(item.value)}
                      className={`flex items-center gap-2 cursor-pointer ${rtlClasses.flexDirection} ${
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
            <TabsList className={`grid w-full grid-cols-2 min-w-[600px] sm:min-w-0 ${rtlClasses.spaceReverse}`}>
              <TabsTrigger value="labels-pricing" className="text-xs sm:text-sm">
                {t("marketing.etiquetage.etiquettesAndPrix.etiquetAndPrix")}
              </TabsTrigger>
              <TabsTrigger value="stock-integration" className="text-xs sm:text-sm">
                {t("marketing.etiquetage.etiquettesAndPrix.integrationStock")}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="labels-pricing" className="space-y-4 sm:space-y-6">
            {/* Action Buttons */}
            <div className={`flex flex-col sm:flex-row gap-2 sm:gap-3 ${isRTL ? "sm:flex-row-reverse" : ""}`}>
              <Dialog open={showNewLabel} onOpenChange={setShowNewLabel}>
                <DialogTrigger asChild>
                  <Button className={`text-sm w-full sm:w-auto flex items-center gap-2 ${rtlClasses.flexDirection}`}>
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                    {t("marketing.etiquetage.etiquettesAndPrix.creerEtiquette")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto" dir={textDirection}>
                  <DialogHeader className={rtlClasses.textAlign}>
                    <DialogTitle className="text-lg sm:text-xl">
                      {t("marketing.etiquetage.etiquettesAndPrix.creerEtiquetteTitle")}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                      {t("marketing.etiquetage.etiquettesAndPrix.creerEtiquetteTitleDescr")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={rtlClasses.textAlign}>
                        <Label className="text-sm">{t("marketing.etiquetage.etiquettesAndPrix.modelEtiquette")}</Label>
                        <Select
                          value={selectedTemplate?.toString()}
                          onValueChange={(value) => setSelectedTemplate(Number(value))}
                        >
                          <SelectTrigger className={`text-sm ${rtlClasses.textAlign}`}>
                            <SelectValue placeholder={t("marketing.etiquetage.etiquettesAndPrix.modelPlaceholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            {labelTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id.toString()}>
                                {template.name} ({template.size}){template.is_default && " - Par défaut"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className={rtlClasses.textAlign}>
                        <Label className="text-sm">{t("marketing.etiquetage.etiquettesAndPrix.quantite")}</Label>
                        <Input
                          placeholder={t("marketing.etiquetage.etiquettesAndPrix.quantitePlaceholder")}
                          className={`text-sm ${rtlClasses.textAlign}`}
                        />
                      </div>
                    </div>

                    {/* Recherche multicritères pour étiquettes */}
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className={`font-medium mb-3 text-sm sm:text-base ${rtlClasses.textAlign}`}>
                        {t("marketing.etiquetage.etiquettesAndPrix.rechercheAvancer")}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className={rtlClasses.textAlign}>
                          <Label className="text-xs">{t("marketing.etiquetage.etiquettesAndPrix.nomProduit")}</Label>
                          <Input
                            placeholder={t("marketing.etiquetage.etiquettesAndPrix.nomProduitPlaceholder")}
                            value={labelSearchFilters.name}
                            onChange={(e) => setLabelSearchFilters({ ...labelSearchFilters, name: e.target.value })}
                            className={`text-sm ${rtlClasses.textAlign}`}
                          />
                        </div>
                        <div className={rtlClasses.textAlign}>
                          <Label className="text-xs">{t("marketing.etiquetage.etiquettesAndPrix.zone")}</Label>
                          <Select
                            value={labelSearchFilters.location}
                            onValueChange={(value) => setLabelSearchFilters({ ...labelSearchFilters, location: value })}
                          >
                            <SelectTrigger className={`text-sm ${rtlClasses.textAlign}`}>
                              <SelectValue placeholder={t("marketing.etiquetage.etiquettesAndPrix.zonePlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                {t("marketing.etiquetage.etiquettesAndPrix.zonePlaceholder")}
                              </SelectItem>
                              {locations.map((loc) => (
                                <SelectItem key={loc} value={loc}>
                                  {loc}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className={rtlClasses.textAlign}>
                          <Label className="text-xs">{t("marketing.etiquetage.etiquettesAndPrix.statut")}</Label>
                          <Select
                            value={labelSearchFilters.status}
                            onValueChange={(value) => setLabelSearchFilters({ ...labelSearchFilters, status: value })}
                          >
                            <SelectTrigger className={`text-sm ${rtlClasses.textAlign}`}>
                              <SelectValue
                                placeholder={t("marketing.etiquetage.etiquettesAndPrix.statutPlaceholder")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                {t("marketing.etiquetage.etiquettesAndPrix.statutPlaceholder")}
                              </SelectItem>
                              <SelectItem value="en stock">
                                {t("marketing.etiquetage.integrationStock.enStock")}
                              </SelectItem>
                              <SelectItem value="stock faible">
                                {t("marketing.etiquetage.integrationStock.stockFaible")}
                              </SelectItem>
                              <SelectItem value="rupture">
                                {t("marketing.etiquetage.integrationStock.ruptureStock")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className={rtlClasses.textAlign}>
                          <Label className="text-xs">{t("marketing.etiquetage.etiquettesAndPrix.prixMin")}</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={labelSearchFilters.priceMin}
                            onChange={(e) => setLabelSearchFilters({ ...labelSearchFilters, priceMin: e.target.value })}
                            className={`text-sm ${rtlClasses.textAlign}`}
                          />
                        </div>
                        <div className={rtlClasses.textAlign}>
                          <Label className="text-xs">{t("marketing.etiquetage.etiquettesAndPrix.prixMax")}</Label>
                          <Input
                            type="number"
                            placeholder="999"
                            value={labelSearchFilters.priceMax}
                            onChange={(e) => setLabelSearchFilters({ ...labelSearchFilters, priceMax: e.target.value })}
                            className={`text-sm ${rtlClasses.textAlign}`}
                          />
                        </div>
                      </div>
                      <div className={`flex gap-2 mt-3 ${rtlClasses.flexDirection}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setLabelSearchFilters({
                              name: "",
                              category: "all",
                              location: "all",
                              status: "all",
                              priceMin: "",
                              priceMax: "",
                            })
                          }
                          className="text-xs bg-transparent"
                        >
                          {t("marketing.etiquetage.etiquettesAndPrix.reinitialiser")}
                        </Button>
                        <Badge variant="secondary" className="text-xs">
                          {filteredProductsForLabels.length}{" "}
                          {t("marketing.etiquetage.etiquettesAndPrix.produitsTrouve")}
                        </Badge>
                      </div>
                    </div>

                    <div className={rtlClasses.textAlign}>
                      <Label className="text-sm">
                        {t("marketing.etiquetage.etiquettesAndPrix.selectProduits")}({filteredProductsForLabels.length})
                      </Label>
                      <div className="grid grid-cols-1 gap-2 mt-2 max-h-60 overflow-y-auto border rounded p-2">
                        {filteredProductsForLabels.map((product) => (
                          <div
                            key={product.id}
                            className={`flex items-center space-x-2 p-2 hover:bg-slate-50 rounded ${rtlClasses.flexDirection} ${rtlClasses.spaceReverse}`}
                          >
                            <Checkbox
                              id={`label-${product.id}`}
                              checked={selectedProductsForLabels.includes(product.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedProductsForLabels([...selectedProductsForLabels, product.id])
                                  setLabelQuantities({ ...labelQuantities, [product.id]: 1 })
                                } else {
                                  setSelectedProductsForLabels(
                                    selectedProductsForLabels.filter((id) => id !== product.id),
                                  )
                                  const newQuantities = { ...labelQuantities }
                                  delete newQuantities[product.id]
                                  setLabelQuantities(newQuantities)
                                }
                              }}
                            />
                            <div className={`min-w-0 flex-1 ${rtlClasses.textAlign}`}>
                              <Label
                                htmlFor={`label-${product.id}`}
                                className="text-xs sm:text-sm truncate block font-medium"
                              >
                                {product.nom}
                              </Label>
                              <div className={`flex gap-2 text-xs text-slate-500 ${rtlClasses.flexDirection}`}>
                                <span>{product.zone}</span>
                                <span>•</span>
                                <span>€{product.prix}</span>
                              </div>
                            </div>
                            {selectedProductsForLabels.includes(product.id) && (
                              <div className={`flex items-center gap-1 ${rtlClasses.flexDirection}`}>
                                <Label className="text-xs">{t("marketing.etiquetage.etiquettesAndPrix.qte")}</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={labelQuantities[product.id] || 1}
                                  onChange={(e) =>
                                    setLabelQuantities({
                                      ...labelQuantities,
                                      [product.id]: Number(e.target.value),
                                    })
                                  }
                                  className={`w-16 h-6 text-xs ${rtlClasses.textAlign}`}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                        {filteredProductsForLabels.length === 0 && (
                          <div className={`text-center py-4 text-slate-500 text-sm ${rtlClasses.textAlign}`}>
                            {t("marketing.etiquetage.etiquettesAndPrix.aucunProd")}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className={`font-medium text-blue-800 mb-3 text-sm sm:text-base ${rtlClasses.textAlign}`}>
                        {t("marketing.etiquetage.etiquettesAndPrix.optionImpression")}
                      </h4>
                      <div className="space-y-3">
                        <div className={`flex items-center justify-between ${rtlClasses.flexDirection}`}>
                          <Label htmlFor="auto-print" className="text-xs sm:text-sm">
                            {t("marketing.etiquetage.etiquettesAndPrix.impressionAuto")}
                          </Label>
                          <Switch id="auto-print" defaultChecked />
                        </div>
                        <div className={`flex items-center justify-between ${rtlClasses.flexDirection}`}>
                          <Label htmlFor="include-qr" className="text-xs sm:text-sm">
                            {t("marketing.etiquetage.etiquettesAndPrix.inclureCodeQR")}
                          </Label>
                          <Switch id="include-qr" />
                        </div>
                        <div className={`flex items-center justify-between ${rtlClasses.flexDirection}`}>
                          <Label htmlFor="color-coding" className="text-xs sm:text-sm">
                            {t("marketing.etiquetage.etiquettesAndPrix.codageCouleur")}
                          </Label>
                          <Switch id="color-coding" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`flex flex-col sm:flex-row justify-end gap-2 ${isRTL ? "sm:flex-row-reverse" : ""}`}>
                    <Button variant="outline" onClick={() => setShowNewLabel(false)} className="text-sm">
                      {t("marketing.etiquetage.etiquettesAndPrix.annuler")}
                    </Button>
                    <Button
                      onClick={generateLabels}
                      disabled={isGeneratingLabels || selectedProductsForLabels.length === 0}
                      className={`text-sm flex items-center gap-2 ${rtlClasses.flexDirection}`}
                    >
                      <Printer className="w-4 h-4" />
                      {isGeneratingLabels
                        ? t("marketing.etiquetage.etiquettesAndPrix.generation")
                        : t("marketing.etiquetage.etiquettesAndPrix.fenererEtiquette")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showLabelTemplate} onOpenChange={setShowLabelTemplate}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={`text-sm w-full sm:w-auto bg-transparent flex items-center gap-2 ${rtlClasses.flexDirection}`}
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                    {t("marketing.etiquetage.etiquettesAndPrix.models")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto" dir={textDirection}>
                  <DialogHeader className={rtlClasses.textAlign}>
                    <DialogTitle className="text-lg sm:text-xl">
                      {t("marketing.etiquetage.etiquettesAndPrix.displayModels")}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                      {t("marketing.etiquetage.etiquettesAndPrix.displayModelsDescr")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {labelTemplates.map((template) => (
                      <div key={template.id} className="p-4 border rounded-lg">
                        <div className={`flex justify-between items-start mb-2 ${rtlClasses.flexDirection}`}>
                          <div className={rtlClasses.textAlign}>
                            <h4 className="font-medium text-sm sm:text-base">
                              {template.name}
                              {template.is_default && (
                                <Badge variant="secondary" className={`text-xs ${isRTL ? "mr-2" : "ml-2"}`}>
                                  {t("marketing.etiquetage.etiquettesAndPrix.parDefaut")}
                                </Badge>
                              )}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {t("marketing.etiquetage.etiquettesAndPrix.taille")}
                              {template.size}
                            </p>
                          </div>
                        </div>
                        <div className={`flex flex-wrap gap-1 ${isRTL ? "justify-end" : "justify-start"}`}>
                          {template.fields
                            .sort((a, b) => a.display_order - b.display_order)
                            .filter((field) => field.is_active)
                            .map((field) => (
                              <Badge key={field.id} variant="secondary" className="text-xs">
                                {field.field_name}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards - Dynamiques */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
              <Card>
                <CardHeader className={`flex ${rtlClasses.flexDirection} items-center justify-between space-y-0 pb-2`}>
                  <CardTitle className={`text-xs sm:text-sm font-medium ${rtlClasses.textAlign}`}>
                    {t("marketing.etiquetage.etiquettesAndPrix.etiquettesGenerer")}
                  </CardTitle>
                  <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-lg sm:text-2xl font-bold ${rtlClasses.textAlign}`}>{generatedLabelsCount}</div>
                  <p className={`text-xs text-muted-foreground ${rtlClasses.textAlign}`}>
                    {t("marketing.etiquetage.etiquettesAndPrix.aujourdHui")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className={`flex ${rtlClasses.flexDirection} items-center justify-between space-y-0 pb-2`}>
                  <CardTitle className={`text-xs sm:text-sm font-medium ${rtlClasses.textAlign}`}>
                    {t("marketing.etiquetage.etiquettesAndPrix.prixModifier")}
                  </CardTitle>
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className={`text-lg sm:text-2xl font-bold text-green-600 ${rtlClasses.textAlign}`}>
                    {priceChangesCount}
                  </div>
                  <p className={`text-xs text-muted-foreground ${rtlClasses.textAlign}`}>
                    {t("marketing.etiquetage.etiquettesAndPrix.cetSemaine")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Products Management - Dynamique */}
            <Card>
              <CardHeader>
                <div
                  className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 ${isRTL ? "sm:flex-row-reverse" : ""}`}
                >
                  <div className={rtlClasses.textAlign}>
                    <CardTitle className="text-lg sm:text-xl">
                      {t("marketing.etiquetage.etiquettesAndPrix.gestionProduit")}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      {t("marketing.etiquetage.etiquettesAndPrix.gestionProduitDescr")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Recherche multicritères pour la gestion des produits */}
                <div className="p-4 bg-slate-50 rounded-lg mb-4">
                  <h4 className={`font-medium mb-3 text-sm sm:text-base ${rtlClasses.textAlign}`}>
                    {t("marketing.etiquetage.integrationStock.recherFiltre")}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className={rtlClasses.textAlign}>
                      <Label className="text-xs">{t("marketing.etiquetage.etiquettesAndPrix.nomProduit")}</Label>
                      <Input
                        placeholder={t("marketing.etiquetage.etiquettesAndPrix.recherchePlaceholder")}
                        value={productSearchFilters.name}
                        onChange={(e) => setProductSearchFilters({ ...productSearchFilters, name: e.target.value })}
                        className={`text-sm ${rtlClasses.textAlign}`}
                      />
                    </div>
                    <div className={rtlClasses.textAlign}>
                      <Label className="text-xs">{t("marketing.etiquetage.etiquettesAndPrix.zone")}</Label>
                      <Select
                        value={productSearchFilters.location}
                        onValueChange={(value) => setProductSearchFilters({ ...productSearchFilters, location: value })}
                      >
                        <SelectTrigger className={`text-sm ${rtlClasses.textAlign}`}>
                          <SelectValue placeholder={t("marketing.etiquetage.etiquettesAndPrix.zonePlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("marketing.etiquetage.etiquettesAndPrix.zonePlaceholder")}
                          </SelectItem>
                          {locations.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className={rtlClasses.textAlign}>
                      <Label className="text-xs">{t("marketing.etiquetage.etiquettesAndPrix.statut")}</Label>
                      <Select
                        value={productSearchFilters.status}
                        onValueChange={(value) => setProductSearchFilters({ ...productSearchFilters, status: value })}
                      >
                        <SelectTrigger className={`text-sm ${rtlClasses.textAlign}`}>
                          <SelectValue placeholder={t("marketing.etiquetage.etiquettesAndPrix.statutPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("marketing.etiquetage.etiquettesAndPrix.statutPlaceholder")}
                          </SelectItem>
                          <SelectItem value="en stock">{t("marketing.etiquetage.integrationStock.enStock")}</SelectItem>
                          <SelectItem value="stock faible">
                            {t("marketing.etiquetage.integrationStock.stockFaible")}
                          </SelectItem>
                          <SelectItem value="rupture">
                            {t("marketing.etiquetage.integrationStock.ruptureStock")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className={rtlClasses.textAlign}>
                      <Label className="text-xs">{t("marketing.etiquetage.etiquettesAndPrix.prixMin")}</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={productSearchFilters.priceMin}
                        onChange={(e) => setProductSearchFilters({ ...productSearchFilters, priceMin: e.target.value })}
                        className={`text-sm ${rtlClasses.textAlign}`}
                      />
                    </div>
                    <div className={rtlClasses.textAlign}>
                      <Label className="text-xs">{t("marketing.etiquetage.etiquettesAndPrix.prixMax")}</Label>
                      <Input
                        type="number"
                        placeholder="999"
                        value={productSearchFilters.priceMax}
                        onChange={(e) => setProductSearchFilters({ ...productSearchFilters, priceMax: e.target.value })}
                        className={`text-sm ${rtlClasses.textAlign}`}
                      />
                    </div>
                  </div>
                  <div className={`flex gap-2 mt-3 ${rtlClasses.flexDirection}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setProductSearchFilters({
                          name: "",
                          category: "all",
                          location: "all",
                          status: "all",
                          priceMin: "",
                          priceMax: "",
                        })
                      }
                      className="text-xs bg-transparent"
                    >
                      {t("marketing.etiquetage.etiquettesAndPrix.reinitialiser")}
                    </Button>
                    <Badge variant="secondary" className="text-xs">
                      {filteredProductsForManagement.length}{" "}
                      {t("marketing.etiquetage.etiquettesAndPrix.produitsTrouve")}
                    </Badge>
                  </div>
                </div>

                {/* Liste des produits filtrés - Dynamique */}
                <div className="space-y-3 sm:space-y-4">
                  {filteredProductsForManagement.map((product) => (
                    <div
                      key={product.id}
                      className={`flex flex-col lg:flex-row lg:items-center lg:justify-between p-3 sm:p-4 border rounded-lg gap-3 ${isRTL ? "lg:flex-row-reverse" : ""}`}
                    >
                      <div className={`flex items-start gap-3 sm:gap-4 min-w-0 flex-1 ${rtlClasses.flexDirection}`}>
                        {/* Image du produit avec gestion d'erreur améliorée */}
                        <div className="flex-shrink-0 relative">
                          <img
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.nom}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded border"
                            onLoad={(e) => {
                              console.log(`✅ Image loaded successfully for ${product.nom}:`, product.imageUrl)
                            }}
                            onError={(e) => {
                              console.error(`❌ Image failed to load for ${product.nom}:`, product.imageUrl)
                              console.error("Error details:", e)
                              // Cacher l'image qui a échoué
                              e.currentTarget.style.display = "none"
                              // Afficher le fallback
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement
                              if (fallback) {
                                fallback.style.display = "flex"
                              }
                            }}
                          />
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 border rounded hidden items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        </div>
                        <div className={`min-w-0 flex-1 ${rtlClasses.textAlign}`}>
                          <h3 className="font-semibold text-sm sm:text-base truncate">{product.nom}</h3>
                          <div
                            className={`flex flex-wrap items-center gap-2 mt-1 ${isRTL ? "justify-end" : "justify-start"}`}
                          >
                            <Badge variant={getStatusBadge(product.stockStatus)} className="text-xs">
                              {getTranslatedStockStatus(product.stockStatus)}
                            </Badge>
                            <Badge variant={getLabelStatusBadge(product.ticketStatus)} className="text-xs">
                              {t("marketing.etiquetage.etiquettesAndPrix.etiquette")} {product.ticketStatus}
                            </Badge>
                            <span className="text-xs sm:text-sm text-slate-600">{product.zone}</span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 ${isRTL ? "sm:flex-row-reverse" : ""}`}
                      >
                        <div className={`${isRTL ? "text-left sm:text-left" : "text-left sm:text-right"}`}>
                          <div
                            className={`flex flex-col ${isRTL ? "items-start sm:items-start" : "items-start sm:items-end"}`}
                          >
                            {product.lastPriceChange ? (
                              <>
                                <div className="text-xs text-gray-500 line-through">
                                  €{product.lastPriceChange.old_price}
                                </div>
                                <div className="font-bold text-green-600 text-lg">
                                  €{product.lastPriceChange.new_price}
                                </div>
                              </>
                            ) : (
                              <div className="font-semibold text-green-600 text-sm sm:text-base">€{product.prix}</div>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-600">
                            {product.lastPriceChange
                              ? new Date(product.lastPriceChange.changed_at).toLocaleDateString()
                              : t("marketing.etiquetage.etiquettesAndPrix.aucunChangement")}
                          </div>
                        </div>
                        <div className={`flex gap-1 sm:gap-2 ${rtlClasses.flexDirection}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Modifier prix"
                            className="h-8 w-8 p-0 bg-transparent"
                            onClick={() => {
                              setSelectedProductForPriceUpdate(product)
                              setNewPrice(product.prix.toString())
                              setShowPriceUpdate(true)
                            }}
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Vérifier en magasin"
                            className="h-8 w-8 p-0 bg-transparent"
                            onClick={() => {
                              setSelectedProductForPreview(product)
                              setShowLabelPreview(true)
                            }}
                          >
                            <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Imprimer étiquette"
                            className="h-8 w-8 p-0 bg-transparent"
                          >
                            <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredProductsForManagement.length === 0 && (
                    <div className={`text-center py-8 text-slate-500 ${rtlClasses.textAlign}`}>
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        {t("marketing.etiquetage.etiquettesAndPrix.aucunProdTrouve")}
                      </p>
                      <p className="text-sm">{t("marketing.etiquetage.etiquettesAndPrix.aucunProdTrouveDescr")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section Intégration Stocks - Dynamique */}
          <TabsContent value="stock-integration" className="space-y-4 sm:space-y-6">
            {/* Recherche multicritères pour intégration stocks */}
            <div className="p-4 bg-slate-50 rounded-lg mb-4">
              <h4 className={`font-medium mb-3 text-sm sm:text-base ${rtlClasses.textAlign}`}>
                {t("marketing.etiquetage.integrationStock.recherFiltre")}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className={rtlClasses.textAlign}>
                  <Label className="text-xs">{t("marketing.etiquetage.etiquettesAndPrix.nomProduit")}</Label>
                  <Input
                    placeholder={t("marketing.etiquetage.etiquettesAndPrix.recherchePlaceholder")}
                    value={stockSearchFilters.name}
                    onChange={(e) => setStockSearchFilters({ ...stockSearchFilters, name: e.target.value })}
                    className={`text-sm ${rtlClasses.textAlign}`}
                  />
                </div>
                <div className={rtlClasses.textAlign}>
                  <Label className="text-xs">{t("marketing.etiquetage.etiquettesAndPrix.zone")}</Label>
                  <Select
                    value={stockSearchFilters.location}
                    onValueChange={(value) => setStockSearchFilters({ ...stockSearchFilters, location: value })}
                  >
                    <SelectTrigger className={`text-sm ${rtlClasses.textAlign}`}>
                      <SelectValue placeholder={t("marketing.etiquetage.etiquettesAndPrix.zonePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("marketing.etiquetage.etiquettesAndPrix.zonePlaceholder")}</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className={rtlClasses.textAlign}>
                  <Label className="text-xs">{t("marketing.etiquetage.etiquettesAndPrix.statut")}</Label>
                  <Select
                    value={stockSearchFilters.status}
                    onValueChange={(value) => setStockSearchFilters({ ...stockSearchFilters, status: value })}
                  >
                    <SelectTrigger className={`text-sm ${rtlClasses.textAlign}`}>
                      <SelectValue placeholder={t("marketing.etiquetage.etiquettesAndPrix.statutPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("marketing.etiquetage.etiquettesAndPrix.statutPlaceholder")}
                      </SelectItem>
                      <SelectItem value="en stock">{t("marketing.etiquetage.integrationStock.enStock")}</SelectItem>
                      <SelectItem value="stock faible">
                        {t("marketing.etiquetage.integrationStock.stockFaible")}
                      </SelectItem>
                      <SelectItem value="rupture">{t("marketing.etiquetage.integrationStock.ruptureStock")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className={rtlClasses.textAlign}>
                  <Label className="text-xs">{t("marketing.etiquetage.etiquettesAndPrix.prixMin")}</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={stockSearchFilters.priceMin}
                    onChange={(e) => setStockSearchFilters({ ...stockSearchFilters, priceMin: e.target.value })}
                    className={`text-sm ${rtlClasses.textAlign}`}
                  />
                </div>
                <div className={rtlClasses.textAlign}>
                  <Label className="text-xs">{t("marketing.etiquetage.etiquettesAndPrix.prixMax")}</Label>
                  <Input
                    type="number"
                    placeholder="999"
                    value={stockSearchFilters.priceMax}
                    onChange={(e) => setStockSearchFilters({ ...stockSearchFilters, priceMax: e.target.value })}
                    className={`text-sm ${rtlClasses.textAlign}`}
                  />
                </div>
              </div>
              <div className={`flex gap-2 mt-3 ${rtlClasses.flexDirection}`}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setStockSearchFilters({
                      name: "",
                      category: "all",
                      location: "all",
                      status: "all",
                      priceMin: "",
                      priceMax: "",
                    })
                  }
                  className="text-xs bg-transparent"
                >
                  {t("marketing.etiquetage.etiquettesAndPrix.reinitialiser")}
                </Button>
                <Badge variant="secondary" className="text-xs">
                  {filteredProductsForStock.length} {t("marketing.etiquetage.etiquettesAndPrix.produitsAffichers")}
                </Badge>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className={`text-lg sm:text-xl ${rtlClasses.textAlign}`}>
                  {t("marketing.etiquetage.integrationStock.integrationStockMagasin")}
                </CardTitle>
                <CardDescription className={`text-xs sm:text-sm ${rtlClasses.textAlign}`}>
                  {t("marketing.etiquetage.integrationStock.integrationStockMagasinDescr")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {filteredProductsForStock.map((product) => (
                    <div key={product.id} className="p-3 sm:p-4 border rounded-lg">
                      <div
                        className={`flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2 ${isRTL ? "sm:flex-row-reverse" : ""}`}
                      >
                        <div className={`min-w-0 flex-1 ${rtlClasses.textAlign}`}>
                          <h4 className="font-medium text-sm sm:text-base truncate">{product.nom}</h4>
                          <p className="text-xs sm:text-sm text-slate-600">
                            {product.zone} • {t("marketing.etiquetage.integrationStock.id")} {product.id}
                          </p>
                        </div>
                        <Badge variant={getStatusBadge(product.stockStatus)} className="text-xs w-fit">
                          {getTranslatedStockStatus(product.stockStatus)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div className={rtlClasses.textAlign}>
                          <h5 className="text-xs sm:text-sm font-medium text-slate-700 mb-1">
                            {t("marketing.etiquetage.integrationStock.prixMagasin")}
                          </h5>
                          {product.lastPriceChange ? (
                            <div className="flex flex-col">
                              <div className="text-xs text-gray-500 line-through">
                                €{product.lastPriceChange.old_price}
                              </div>
                              <div className="text-lg sm:text-xl font-bold text-green-600">
                                €{product.lastPriceChange.new_price}
                              </div>
                            </div>
                          ) : (
                            <div className="text-lg sm:text-xl font-bold text-green-600">€{product.prix}</div>
                          )}
                        </div>
                        <div className={rtlClasses.textAlign}>
                          <h5 className="text-xs sm:text-sm font-medium text-slate-700 mb-1">
                            {t("marketing.etiquetage.integrationStock.statutStock")}
                          </h5>
                          <div className="text-lg sm:text-xl font-bold">
                            {getTranslatedStockStatus(product.stockStatus)}
                          </div>
                          {product.stockStatus.toLowerCase().includes("faible") && (
                            <div
                              className={`text-xs sm:text-sm text-orange-600 flex items-center gap-1 ${rtlClasses.flexDirection}`}
                            >
                              <AlertTriangle className="w-3 h-3" />
                              {t("marketing.etiquetage.integrationStock.reapproNecessaire")}
                            </div>
                          )}
                          {product.stockStatus.toLowerCase().includes("rupture") && (
                            <div
                              className={`text-xs sm:text-sm text-red-600 flex items-center gap-1 ${rtlClasses.flexDirection}`}
                            >
                              <AlertTriangle className="w-3 h-3" />
                              {t("marketing.etiquetage.integrationStock.ruptureDeStock")}
                            </div>
                          )}
                        </div>
                        <div className={rtlClasses.textAlign}>
                          <h5 className="text-xs sm:text-sm font-medium text-slate-700 mb-1">
                            {t("marketing.etiquetage.integrationStock.dernierMaj")}
                          </h5>
                          <div className="text-xs sm:text-sm">
                            {product.historyPrice.length > 0
                              ? new Date(product.historyPrice[0].changed_at).toLocaleDateString()
                              : t("marketing.etiquetage.integrationStock.aucunChangement")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className={`text-lg sm:text-xl ${rtlClasses.textAlign}`}>
                    {t("marketing.etiquetage.integrationStock.alertStock")}
                  </CardTitle>
                  <CardDescription className={`text-xs sm:text-sm ${rtlClasses.textAlign}`}>
                    {t("marketing.etiquetage.integrationStock.alertStockDescr")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stockAlerts.length > 0 ? (
                      stockAlerts
                        .filter((alert) => alert.is_active)
                        .sort((a, b) => {
                          // Trier par priorité : out_of_stock en premier, puis low_stock
                          if (a.alert_type === "out_of_stock" && b.alert_type !== "out_of_stock") return -1
                          if (b.alert_type === "out_of_stock" && a.alert_type !== "out_of_stock") return 1
                          return new Date(b.notified_at).getTime() - new Date(a.notified_at).getTime()
                        })
                        .map((alert) => {
                          const alertInfo = getAlertInfo(alert)
                          const Icon = alertInfo.icon
                          return (
                            <div
                              key={alert.id}
                              className={`${alertInfo.bgColor} border ${alertInfo.borderColor} rounded-lg p-4 transition-all hover:shadow-md`}
                            >
                              {/* Header de l'alerte */}
                              <div className={`flex items-start justify-between mb-3 ${rtlClasses.flexDirection}`}>
                                <div className={`flex items-center gap-3 ${rtlClasses.flexDirection}`}>
                                  <Icon className={`w-5 h-5 ${alertInfo.iconColor} flex-shrink-0`} />
                                  <div className={rtlClasses.textAlign}>
                                    <div className={`flex items-center gap-2 ${rtlClasses.flexDirection}`}>
                                      <h4 className={`font-semibold ${alertInfo.titleColor} text-base`}>
                                        {alertInfo.title}
                                      </h4>
                                      <Badge
                                        variant={alert.alert_type === "out_of_stock" ? "destructive" : "secondary"}
                                        className="text-xs"
                                      >
                                        {alertInfo.priority}
                                      </Badge>
                                    </div>
                                    <p className={`text-sm ${alertInfo.textColor} font-medium mt-1`}>
                                      {alertInfo.message}
                                    </p>
                                  </div>
                                </div>
                                <div className={`${isRTL ? "text-left" : "text-right"}`}>
                                  <div className="text-xs text-gray-500">
                                    {new Date(alert.notified_at).toLocaleDateString("fr-FR")}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(alert.notified_at).toLocaleTimeString("fr-FR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* Détails du produit */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200">
                                <div className={rtlClasses.textAlign}>
                                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                    {t("marketing.etiquetage.integrationStock.idProduit")}
                                  </label>
                                  <div className={`text-sm font-mono ${alertInfo.textColor} mt-1`}>
                                    {alertInfo.productId}
                                  </div>
                                </div>
                                <div className={rtlClasses.textAlign}>
                                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                    {t("marketing.etiquetage.integrationStock.stockActuel")}
                                  </label>
                                  <div className={`text-sm font-semibold ${alertInfo.textColor} mt-1`}>
                                    {alertInfo.stock} {t("marketing.etiquetage.integrationStock.unites")}
                                  </div>
                                </div>
                                <div className={rtlClasses.textAlign}>
                                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                    {t("marketing.etiquetage.integrationStock.seuilAlerte")}
                                  </label>
                                  <div className={`text-sm ${alertInfo.textColor} mt-1`}>
                                    {alertInfo.threshold} {t("marketing.etiquetage.integrationStock.unites")}
                                  </div>
                                </div>
                              </div>

                              {/* Actions recommandées */}
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className={`flex items-center justify-between ${rtlClasses.flexDirection}`}>
                                  <div className="text-xs text-gray-600">
                                    {alert.alert_type === "out_of_stock"
                                      ? t("marketing.etiquetage.integrationStock.actionRequis")
                                      : t("marketing.etiquetage.integrationStock.surveillance")}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })
                    ) : (
                      <div
                        className={`flex items-center gap-3 p-6 bg-green-50 border border-green-200 rounded-lg ${rtlClasses.flexDirection}`}
                      >
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div className={`min-w-0 flex-1 ${rtlClasses.textAlign}`}>
                          <h4 className="font-semibold text-green-800 text-base">
                            ✅ {t("marketing.etiquetage.integrationStock.aucuneAlerte")}
                          </h4>
                          <p className="text-sm text-green-600 mt-1">
                            {t("marketing.etiquetage.integrationStock.seuilNormaux")}
                          </p>
                          <div className="text-xs text-green-500 mt-2">
                            {t("marketing.etiquetage.integrationStock.dernierVerification")}{" "}
                            {new Date().toLocaleString("fr-FR")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Statistiques des alertes */}
                  {stockAlerts.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h5 className={`text-sm font-medium text-gray-700 mb-3 ${rtlClasses.textAlign}`}>
                        {t("marketing.etiquetage.integrationStock.resumeAlertes")}
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className={`text-center p-3 bg-red-50 rounded-lg ${rtlClasses.textAlign}`}>
                          <div className="text-lg font-bold text-red-600">
                            {stockAlerts.filter((a) => a.alert_type === "out_of_stock" && a.is_active).length}
                          </div>
                          <div className="text-xs text-red-600">
                            {t("marketing.etiquetage.integrationStock.ruptureStock")}
                          </div>
                        </div>
                        <div className={`text-center p-3 bg-orange-50 rounded-lg ${rtlClasses.textAlign}`}>
                          <div className="text-lg font-bold text-orange-600">
                            {stockAlerts.filter((a) => a.alert_type === "low_stock" && a.is_active).length}
                          </div>
                          <div className="text-xs text-orange-600">
                            {t("marketing.etiquetage.integrationStock.stockFaible")}
                          </div>
                        </div>
                        <div className={`text-center p-3 bg-blue-50 rounded-lg ${rtlClasses.textAlign}`}>
                          <div className="text-lg font-bold text-blue-600">
                            {stockAlerts.filter((a) => a.is_active).length}
                          </div>
                          <div className="text-xs text-blue-600">
                            {t("marketing.etiquetage.integrationStock.totalActive")}
                          </div>
                        </div>
                        <div className={`text-center p-3 bg-gray-50 rounded-lg ${rtlClasses.textAlign}`}>
                          <div className="text-lg font-bold text-gray-600">
                            {new Set(stockAlerts.filter((a) => a.is_active).map((a) => a.product_id)).size}
                          </div>
                          <div className="text-xs text-gray-600">
                            {t("marketing.etiquetage.integrationStock.produitsConcerne")}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog de modification de prix */}
        <Dialog open={showPriceUpdate} onOpenChange={setShowPriceUpdate}>
          <DialogContent className="w-[95vw] max-w-md" dir={textDirection}>
            <DialogHeader className={rtlClasses.textAlign}>
            <DialogTitle className={`text-lg ${rtlClasses.textAlign}`}>
              {t("marketing.etiquetage.etiquettesAndPrix.modifierPrix")}
            </DialogTitle>
            <DialogDescription className={`text-sm ${rtlClasses.textAlign}`}>
              {selectedProductForPriceUpdate?.nom}
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className={rtlClasses.textAlign}>
                <Label className="text-sm">{t("marketing.etiquetage.etiquettesAndPrix.prixActuel")}</Label>
                <Input
                  value={`€${selectedProductForPriceUpdate?.prix || 0}`}
                  disabled
                  className={`text-sm ${rtlClasses.textAlign}`}
                />
              </div>
              <div className={rtlClasses.textAlign}>
                <Label className="text-sm">{t("marketing.etiquetage.etiquettesAndPrix.nouvPrix")} *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className={`text-sm ${rtlClasses.textAlign}`}
                />
              </div>
              <div className={rtlClasses.textAlign}>
              <Label className={`text-sm ${rtlClasses.textAlign}`}>
                {t("marketing.etiquetage.etiquettesAndPrix.raisonChangement")} *
              </Label>
              <Select value={changeReason} onValueChange={setChangeReason}>
                <SelectTrigger className={`text-sm ${rtlClasses.textAlign}`}>
                  <SelectValue placeholder={t("marketing.etiquetage.etiquettesAndPrix.selectionnerRaisPlaceholder")} />
                </SelectTrigger>
                <SelectContent className={rtlClasses.textAlign}>
                  <SelectItem value="Promotion" className={rtlClasses.textAlign}>
                    {t("marketing.etiquetage.etiquettesAndPrix.promo")}
                  </SelectItem>
                  <SelectItem value="Concurrence" className={rtlClasses.textAlign}>
                    {t("marketing.etiquetage.etiquettesAndPrix.concurrence")}
                  </SelectItem>
                  <SelectItem value="Coût fournisseur" className={rtlClasses.textAlign}>
                    {t("marketing.etiquetage.etiquettesAndPrix.coutFournisseur")}
                  </SelectItem>
                  <SelectItem value="Déstockage" className={rtlClasses.textAlign}>
                    {t("marketing.etiquetage.etiquettesAndPrix.destockage")}
                  </SelectItem>
                  <SelectItem value="Augmentation des coûts matières premières" className={rtlClasses.textAlign}>
                    {t("marketing.etiquetage.etiquettesAndPrix.augmentationCout")}
                  </SelectItem>
                  <SelectItem value="Réajustement marché" className={rtlClasses.textAlign}>
                    {t("marketing.etiquetage.etiquettesAndPrix.reajustementMarche")}
                  </SelectItem>
                  <SelectItem value="custom" className={rtlClasses.textAlign}>
                    {t("marketing.etiquetage.etiquettesAndPrix.autre")}
                  </SelectItem>
                </SelectContent>
              </Select>
              </div>
              {changeReason === "custom" && (
                <div className={rtlClasses.textAlign}>
                  <Label className="text-sm">{t("marketing.etiquetage.etiquettesAndPrix.raisonPerso")} *</Label>
                  <Input
                    placeholder="Saisir la raison..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className={`text-sm ${rtlClasses.textAlign}`}
                  />
                </div>
              )}
              <div className={`flex items-center space-x-2 ${rtlClasses.flexDirection} ${rtlClasses.spaceReverse}`}>
                <Checkbox id="update-label" defaultChecked />
                <Label htmlFor="update-label" className={`text-sm ${rtlClasses.textAlign}`}>
                  {t("marketing.etiquetage.etiquettesAndPrix.remplirEtiquetteAuto")}
                </Label>
              </div>
              {newPrice && selectedProductForPriceUpdate && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className={`text-sm font-medium text-blue-800 ${rtlClasses.textAlign}`}>
                  {t("marketing.etiquetage.etiquettesAndPrix.appercuChangement")}
                  </div>
                  <div className={`text-xs text-blue-600 mt-1 ${rtlClasses.textAlign}`}>
                    {selectedProductForPriceUpdate.prix} € → {newPrice} €
                    <span className={isRTL ? "mr-2" : "ml-2"}>
                      ({Number.parseFloat(newPrice) > selectedProductForPriceUpdate.prix ? "+" : ""}
                      {(
                        ((Number.parseFloat(newPrice) - selectedProductForPriceUpdate.prix) /
                          selectedProductForPriceUpdate.prix) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className={`flex justify-end gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPriceUpdate(false)
                  setSelectedProductForPriceUpdate(null)
                  setNewPrice("")
                  setChangeReason("")
                  setCustomReason("")
                }}
                className="text-sm"
              >
                {t("marketing.etiquetage.etiquettesAndPrix.annuler") }
              </Button>
              <Button
                onClick={updateProductPrice}
                disabled={isUpdatingPrice || !newPrice || !changeReason || (changeReason === "custom" && !customReason)}
                className="text-sm"
              >
                {isUpdatingPrice 
                  ? t("marketing.etiquetage.etiquettesAndPrix.misAjour") 
                  : t("marketing.etiquetage.etiquettesAndPrix.confirmer")}

              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de prévisualisation d'étiquette */}
        <Dialog open={showLabelPreview} onOpenChange={setShowLabelPreview}>
          <DialogContent className="w-[95vw] max-w-lg" dir={textDirection}>
            <DialogHeader className={rtlClasses.textAlign}>
            <DialogTitle className={`text-lg ${rtlClasses.textAlign}`}>
              {t("marketing.etiquetage.etiquettesAndPrix.apercuEtiquette")}
            </DialogTitle>
            <DialogDescription className={`text-sm ${rtlClasses.textAlign}`}>
              {selectedProductForPreview?.nom}
            </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedProductForPreview && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white text-center">
                  <div className="border border-black rounded p-4 bg-white inline-block min-w-[320px] max-w-[350px]">
                    {/* Nom du produit */}
                    <div className={`mb-3 ${rtlClasses.textAlign}`}>
                      <h3 className="font-bold text-sm text-black uppercase">{selectedProductForPreview.nom}</h3>
                    </div>

                    {/* Image du produit et prix */}
                    <div className={`flex justify-between items-start mb-3 ${rtlClasses.flexDirection}`}>
                      <div className="w-20 h-16 border border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden rounded relative">
                        <img
                          src={selectedProductForPreview.imageUrl || "/placeholder.svg"}
                          alt={selectedProductForPreview.nom}
                          className="w-full h-full object-cover"
                          onLoad={(e) => {
                            console.log(`✅ Label preview image loaded for ${selectedProductForPreview.nom}`)
                          }}
                          onError={(e) => {
                            console.error(
                              `❌ Label preview image failed for ${selectedProductForPreview.nom}:`,
                              selectedProductForPreview.imageUrl,
                            )
                            // Cacher l'image qui a échoué
                            e.currentTarget.style.display = "none"
                            // Afficher le texte de fallback
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement
                            if (fallback) {
                              fallback.style.display = "block"
                            }
                          }}
                        />
                        <span className="text-xs text-gray-500 hidden absolute inset-0 flex items-center justify-center">
                          IMG
                        </span>
                      </div>

                      {/* Section prix */}
                      <div className={isRTL ? "text-left" : "text-right"}>
                        {selectedProductForPreview.lastPriceChange ? (
                          <>
                            {Number.parseFloat(selectedProductForPreview.lastPriceChange.old_price) >
                              Number.parseFloat(selectedProductForPreview.lastPriceChange.new_price) && (
                              <div className="text-sm text-gray-500 line-through mb-1">
                                {selectedProductForPreview.lastPriceChange.old_price}€
                              </div>
                            )}
                            <div className="text-3xl font-bold text-red-600">
                              {selectedProductForPreview.lastPriceChange.new_price}€
                            </div>
                          </>
                        ) : (
                          <div className="text-3xl font-bold text-red-600">{selectedProductForPreview.prix}€</div>
                        )}
                      </div>
                    </div>

                    {/* Zone */}
                    <div className={`text-xs text-gray-500 mb-3 ${isRTL ? "text-left" : "text-right"}`}>
                      {selectedProductForPreview.zone}
                    </div>

                    {/* Code-barres simulé */}
                    <div className="flex justify-center mb-2">
                      <div className="flex space-x-px">
                        {Array.from({ length: 50 }, (_, i) => (
                          <div
                            key={i}
                            className="bg-black"
                            style={{
                              width: Math.random() > 0.5 ? "2px" : "1px",
                              height: Math.random() > 0.3 ? "20px" : "12px",
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Code produit et date */}
                    <div className={`flex justify-between text-xs text-gray-500 ${rtlClasses.flexDirection}`}>
                      <span>{selectedProductForPreview.id}</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className={`flex justify-end gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Button variant="outline" onClick={() => setShowLabelPreview(false)} className="text-sm">
              {t("marketing.etiquetage.etiquettesAndPrix.fermer")}
              </Button>
              <Button
                onClick={exportLabelAsImage}
                className={`text-sm flex items-center gap-2 ${rtlClasses.flexDirection}`}
              >
                <Camera className="w-4 h-4" />
                {t("marketing.etiquetage.etiquettesAndPrix.exportImage")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
