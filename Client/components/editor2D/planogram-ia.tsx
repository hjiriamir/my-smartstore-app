"use client"

import type React from "react"
import { useState, useRef, Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"
import html2canvas from "html2canvas"
import clsx from "clsx"
import jsPDF from "jspdf"
import { SavePlanogramDialog } from "@/components/save-planogram-dialog"
import { useFurnitureStore } from "@/lib/furniture-store"
import "@/components/multilingue/i18n.js"
import {
  FileJson,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Wand2,
  Save,
  Download,
  FileText,
  ImageIcon,
  Bug,
  CuboidIcon as Cube,
  LayoutGrid,
  Upload,
  Edit,
  Info,
  Package,
  AlertTriangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useProductStore } from "@/lib/product-store"
import PlanogramViewer3D from "./planogram-viewer-3d"
import { PlanogramTypes, type PlanogramJsonData } from "../types/planogram_types"
import { useTranslation } from "react-i18next"

export function PlanogramIA() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  const { products, addProducts, updateProductImage, addProductInstance, setActiveTab, addPlanogram } =
    useProductStore()

  // State
  const [step, setStep] = useState<number>(0)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [parsedData, setParsedData] = useState<any[]>([])
  const [planogramParams, setPlanogramParams] = useState<PlanogramJsonData | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [importProgress, setImportProgress] = useState<number>(0)
  const [generationProgress, setGenerationProgress] = useState<number>(0)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [activeTab, setActiveImportTab] = useState<string>("import")
  const [jsonInputMethod, setJsonInputMethod] = useState<string>("upload")
  const [jsonText, setJsonText] = useState<string>("")
  const [generatedCells, setGeneratedCells] = useState<any[]>([])
  const [generatedConfig, setGeneratedConfig] = useState<any | null>(null)
  const [productInstances, setProductInstances] = useState<any[]>([])
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [planogramId, setPlanogramId] = useState<string>("")
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d")
  const [iaGeneratorUrl] = useState<string>("http://localhost:8501/")
  const [iaGeneratedJson, setIaGeneratedJson] = useState<string>("")
  const [placementResults, setPlacementResults] = useState<{
    success: { id: string; reason: string }[]
    failed: { id: string; reason: string }[]
    total: number
  }>({ success: [], failed: [], total: 0 })
  const jsonInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const planogramPreviewRef = useRef<HTMLDivElement>(null)
  const jsonEditorRef = useRef<HTMLTextAreaElement>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [windowPosition, setWindowPosition] = useState<"inline" | "fullscreen">("inline")
  const [windowStyle, setWindowStyle] = useState<React.CSSProperties>({})
  const { addPlanogramFurniture } = useFurnitureStore()
  // Temporaire - à enlever après résolution
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Filtrez explicitement par origine et type de message
      if (event.origin === "http://localhost:8501") {
        console.log("Message détaillé:", {
          origin: event.origin,
          data: event.data,
          source: event.source,
        })

        // Vérifiez deux types de messages possibles
        if (event.data?.type === "GENERATED_JSON") {
          console.log("Données IA reçues:", event.data.json)
          processIaData(event.data.json)
        }
        // Certaines versions de Streamlit peuvent encapsuler différemment
        else if (event.data?.json?.type === "GENERATED_JSON") {
          console.log("Données IA reçues (format alternatif):", event.data.json)
          processIaData(event.data.json.json)
        }
      }
    }

    const processIaData = (jsonData: any) => {
      try {
        // Validation minimale des données
        if (!jsonData || !jsonData.emplacement_magasin || !jsonData.nb_etageres) {
          throw new Error("Structure JSON invalide")
        }

        setIaGeneratedJson(JSON.stringify(jsonData, null, 2))
        setJsonText(JSON.stringify(jsonData, null, 2))
        validateAndProcessJson(jsonData)

        toast({
          title: "Configuration IA reçue",
          description: "Les paramètres ont été chargés avec succès.",
        })
      } catch (error) {
        console.error("Erreur de traitement:", error)
        toast({
          title: "Erreur de configuration",
          description: "Les données reçues sont invalides.",
          variant: "destructive",
        })
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [toast])
  // Save planogram to library for use in store display
  // Save planogram to library for use in store display
  const savePlanogramToLibrary = (name: string, description: string) => {
    if (!generatedConfig || !generatedCells) {
      toast({
        title: "Erreur",
        description: "Aucun planogramme à enregistrer",
        variant: "destructive",
      })
      return
    }

    // Create furniture item from planogram config with dimensions divided by 10
    const furnitureToSave = {
      id: `planogram-${Date.now()}`,
      type: "planogram",
      name,
      sections: generatedConfig.rows,
      slots: generatedConfig.columns,
      width: generatedConfig.furnitureDimensions.width / 20, // Divisé par 10 partout
      height: generatedConfig.furnitureDimensions.height / 20,
      depth: generatedConfig.furnitureDimensions.depth / 22,
      color: "#f0f0f0",
      x: 0,
      y: 0,
      z: 0,
      rotation: 0,
    }

    // Get products from cells
    const furnitureProducts = generatedCells
      .filter((cell) => cell.instanceId !== null)
      .map((cell) => {
        const productInstance = productInstances.find((pi) => pi.instanceId === cell.instanceId)
        return {
          productId: productInstance?.productId || "",
          section: cell.y,
          position: cell.x,
        }
      })

    // Add to furniture store
    addPlanogramFurniture(furnitureToSave, furnitureProducts, description)

    toast({
      title: "Planogramme enregistré",
      description: `Le planogramme "${name}" a été enregistré dans votre bibliothèque (dimensions divisées par 10).`,
    })
  }
  // Handle JSON file selection
  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      parseJsonFile(selectedFile)
    }
  }

  // Parse JSON file
  const parseJsonFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const jsonData = JSON.parse(content)
        validateAndProcessJson(jsonData)
      } catch (error) {
        console.error("Error parsing JSON file:", error)
        toast({
          title: "Format JSON invalide",
          description: "Le fichier ne contient pas un JSON valide. Vérifiez le format.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  // Handle direct JSON input
  const handleJsonTextInput = () => {
    if (!jsonText.trim()) {
      toast({
        title: "Entrée vide",
        description: "Veuillez saisir des données JSON valides.",
        variant: "destructive",
      })
      return
    }

    try {
      const jsonData = JSON.parse(jsonText)
      validateAndProcessJson(jsonData)
    } catch (error) {
      console.error("Error parsing JSON text:", error)
      toast({
        title: "Format JSON invalide",
        description: "Le texte saisi ne contient pas un JSON valide. Vérifiez le format.",
        variant: "destructive",
      })
    }
  }

  // Validate and process JSON data
  const validateAndProcessJson = (data: any) => {
    console.log("Données JSON reçues:", data)
    setDebugInfo(JSON.stringify(data, null, 2))

    const errors: string[] = []

    // Check required fields
    const requiredFields = [
      "emplacement_magasin",
      "dimension_longueur_planogramme",
      "dimension_largeur_planogramme",
      "nb_etageres",
      "nb_colonnes",
    ]

    for (const field of requiredFields) {
      if (data[field] === undefined) {
        errors.push(`Le champ '${field}' est requis`)
      }
    }

    // Validate numeric fields
    const numericFields = [
      "dimension_longueur_planogramme",
      "dimension_largeur_planogramme",
      "nb_etageres",
      "nb_colonnes",
    ]

    for (const field of numericFields) {
      if (data[field] !== undefined && (typeof data[field] !== "number" || data[field] <= 0)) {
        errors.push(`Le champ '${field}' doit être un nombre positif`)
      }
    }

    // Validate product_placements if present
    if (data.product_placements !== undefined) {
      if (!Array.isArray(data.product_placements)) {
        errors.push("Le champ 'product_placements' doit être un tableau")
      } else {
        // Validate each product placement
        data.product_placements.forEach((placement: any, index: number) => {
          if (!placement.produit_id) {
            errors.push(`Placement ${index + 1}: 'etage' doit être un nombre supérieur à zéro`)
          }
          if (typeof placement.colonne !== "number" || placement.colonne <= 0) {
            errors.push(`Placement ${index + 1}: 'colonne' doit être un nombre supérieur à zéro`)
          }
          if (typeof placement.colonne !== "number" || placement.colonne < 0) {
            errors.push(`Placement ${index + 1}: 'colonne' doit être un nombre positif ou zéro`)
          }
        })
      }
    }

    setValidationErrors(errors)

    if (errors.length > 0) {
      toast({
        title: "Erreurs de validation",
        description: `${errors.length} erreur(s) dans les données JSON`,
        variant: "destructive",
      })
      return
    }

    // Process valid JSON data
    const processedData: PlanogramJsonData = {
      emplacement_magasin: data.emplacement_magasin,
      dimension_longueur_planogramme: data.dimension_longueur_planogramme,
      dimension_largeur_planogramme: data.dimension_largeur_planogramme,
      nb_etageres: data.nb_etageres,
      nb_colonnes: data.nb_colonnes,
      product_placements: data.product_placements || [],
    }

    setPlanogramParams(processedData)
    toast({
      title: "Paramètres chargés",
      description: "Les paramètres du planogramme ont été chargés avec succès.",
    })
  }

  // Handle image files selection
  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setImageFiles(Array.from(files))
    }
  }

  // Import products from JSON data
  const importProducts = () => {
    if (!planogramParams) {
      toast({
        title: "Données manquantes",
        description: "Veuillez d'abord charger les paramètres du planogramme au format JSON.",
        variant: "destructive",
      })
      return
    }

    // Start progress
    setImportProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + 5
      })
    }, 100)

    // Process product placements to create product data
    const productData = planogramParams.product_placements.map((placement) => ({
      primary_Id: placement.produit_id,
      name: `Produit ${placement.produit_id}`,
      supplier: "Non spécifié",
    }))

    // Add products to store if they don't already exist
    if (productData.length > 0) {
      const newProducts = productData.filter((product) => !products.some((p) => p.primary_Id === product.primary_Id))

      if (newProducts.length > 0) {
        addProducts(newProducts)
      }
    }

    // Match images with products
    const imageMap = new Map<string, File>()
    let pendingImageLoads = 0

    imageFiles.forEach((file) => {
      // Extract primary_Id from filename (remove extension)
      const fileName = file.name.split(".")[0]
      imageMap.set(fileName, file)
    })

    // Update products with images
    productData.forEach((product) => {
      const imageFile = imageMap.get(product.primary_Id)

      if (imageFile) {
        pendingImageLoads++
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string
          updateProductImage(product.primary_Id, imageUrl)
          pendingImageLoads--

          // If all images are loaded and progress is at 100%, go to next step
          if (pendingImageLoads === 0 && importProgress >= 100) {
            setTimeout(() => {
              setStep(3)
            }, 500)
          }
        }
        reader.readAsDataURL(imageFile)
      }
    })

    // Complete progress
    setTimeout(() => {
      clearInterval(interval)
      setImportProgress(100)

      // Only proceed to next step if all images are loaded
      if (pendingImageLoads === 0) {
        setTimeout(() => {
          setStep(3)
        }, 500)
      }
    }, 1000)
  }

  // Generate a unique instance ID
  const generateInstanceId = () => {
    return `instance-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }

  // Generate a unique planogram ID
  const generatePlanogramId = () => {
    return `planogram-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }

  // Generate planogram based on JSON data
  const generatePlanogram = () => {
    if (!planogramParams) {
      toast({
        title: "Paramètres manquants",
        description: "Veuillez d'abord charger les paramètres du planogramme.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)

    // Generate a unique ID for the planogram
    const newPlanogramId = generatePlanogramId()
    setPlanogramId(newPlanogramId)

    // Create planogram config based on parameters
    const config = {
      id: newPlanogramId,
      name: `Planogramme - ${planogramParams.emplacement_magasin}`,
      rows: planogramParams.nb_etageres,
      columns: planogramParams.nb_colonnes,
      cellWidth: 120,
      cellHeight: 100,
      furnitureType: PlanogramTypes.PLANOGRAM,
      displayMode: "compact",
      furnitureDimensions: {
        width: planogramParams.dimension_longueur_planogramme,
        height: planogramParams.dimension_largeur_planogramme,
        depth: 0.6,
        baseHeight: 0.3,
        shelfThickness: 0.05,
      },
    }

    // Progress simulation
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + 5
      })
    }, 100)

    // Create cells
    const cells: any[] = []
    const instances: any[] = []

    // Create empty cells grid
    for (let y = 0; y < config.rows; y++) {
      for (let x = 0; x < config.columns; x++) {
        cells.push({
          id: `cell-${x}-${y}-${config.furnitureType}`,
          productId: null,
          instanceId: null,
          x,
          y,
          furnitureType: config.furnitureType,
          quantity: 1,
        })
      }
    }

    // Tracking placement results
    const successfulPlacements: { id: string; reason: string }[] = []
    const failedPlacements: { id: string; reason: string }[] = []

    // Check for occupied cells to avoid duplicates
    const occupiedCells = new Set<string>()

    // Check if there are duplicates in the placement data
    const placementsMap = new Map<string, string>()

    // Place products according to specified placements
    planogramParams.product_placements.forEach((placement) => {
      const { produit_id, etage, colonne } = placement
      const cellKey = `${etage}-${colonne}`

      // Find the product in the store
      const product = products.find((p) => p.primary_Id === produit_id)

      if (!product) {
        failedPlacements.push({
          id: produit_id,
          reason: `Produit ${produit_id} non trouvé dans la bibliothèque`,
        })
        console.warn(`Product ${produit_id} not found in the store. It might need to be imported.`)
        return
      }

      // Validate placement coordinates
      if (etage > config.rows || colonne > config.columns) {
        failedPlacements.push({
          id: produit_id,
          reason: `Coordonnées invalides: etage=${etage}, colonne=${colonne} (max ${config.rows} étagères, ${config.columns} colonnes)`,
        })
        console.warn(`Invalid placement for product ${produit_id}: etage=${etage}, colonne=${colonne}`)
        return
      }

      // Check if cell is already occupied
      if (occupiedCells.has(cellKey)) {
        failedPlacements.push({
          id: produit_id,
          reason: `Cellule déjà occupée: etage=${etage}, colonne=${colonne}`,
        })
        console.warn(`Cell already occupied: etage=${etage}, colonne=${colonne}, trying to place ${produit_id}`)
        return
      }

      // Find the cell
      const cellIndex = cells.findIndex(
        (c) => c.x === colonne - 1 && c.y === etage - 1 && c.furnitureType === config.furnitureType,
      )
      if (cellIndex === -1) {
        failedPlacements.push({
          id: produit_id,
          reason: `Cellule non trouvée: etage=${etage}, colonne=${colonne}`,
        })
        console.warn(`Cell not found for placement: etage=${etage}, colonne=${colonne}`)
        return
      }

      // Create a new instance
      const instanceId = generateInstanceId()
      instances.push({
        instanceId,
        productId: produit_id,
        furnitureType: config.furnitureType,
      })

      // Update the cell
      cells[cellIndex] = {
        ...cells[cellIndex],
        productId: produit_id,
        instanceId,
        quantity: 3, // Default quantity
      }

      // Mark cell as occupied
      occupiedCells.add(cellKey)

      // Add to successful placements
      successfulPlacements.push({
        id: produit_id,
        reason: `Placé avec succès à etage=${etage}, colonne=${colonne}`,
      })
    })

    // Set placement results for display
    setPlacementResults({
      success: successfulPlacements,
      failed: failedPlacements,
      total: planogramParams.product_placements.length,
    })

    // Add instances to the store
    instances.forEach((instance) => {
      addProductInstance(instance)
    })

    // Add the planogram to the store
    addPlanogram({
      id: newPlanogramId,
      name: config.name,
      cells,
      config,
    })

    // Complete generation
    setTimeout(() => {
      clearInterval(interval)
      setGenerationProgress(100)
      setGeneratedCells(cells)
      setGeneratedConfig(config)
      setProductInstances(instances)

      // Show toast with status info
      if (failedPlacements.length > 0) {
        toast({
          title: "Attention",
          description: `${successfulPlacements.length} produits placés, ${failedPlacements.length} produits non placés`,
          variant: "warning",
        })
      } else {
        toast({
          title: "Génération réussie",
          description: `Tous les produits (${successfulPlacements.length}) ont été placés avec succès`,
        })
      }

      setTimeout(() => {
        setIsGenerating(false)
        setStep(4)
      }, 500)
    }, 1500)
  }

  // Go to planogram editor with the generated planogram
  const goToPlanogramEditor = () => {
    if (generatedConfig && planogramId) {
      // Set the active tab in the product store
      setActiveTab("library")

      // Navigate to the planogram editor
      router.push("/planogram-editor")
    }
  }

  // Export planogram as image
  const exportAsImage = () => {
    if (!planogramPreviewRef.current) {
      toast({
        title: "Erreur d'exportation",
        description: "Impossible de générer l'image. Élément non trouvé.",
        variant: "destructive",
      })
      return
    }

    html2canvas(planogramPreviewRef.current)
      .then((canvas) => {
        // Create download link
        const link = document.createElement("a")
        link.download = `planogramme-${new Date().toISOString().slice(0, 10)}.png`
        link.href = canvas.toDataURL("image/png")
        link.click()

        toast({
          title: "Exportation réussie",
          description: "Le planogramme a été exporté en image avec succès.",
        })
      })
      .catch((err) => {
        console.error("Erreur lors de l'exportation en image:", err)
        toast({
          title: "Erreur d'exportation",
          description: "Une erreur s'est produite lors de l'exportation en image.",
          variant: "destructive",
        })
      })
  }

  // Export planogram as PDF
  const exportAsPDF = () => {
    if (!planogramPreviewRef.current) {
      toast({
        title: "Erreur d'exportation",
        description: "Impossible de générer le PDF. Élément non trouvé.",
        variant: "destructive",
      })
      return
    }

    html2canvas(planogramPreviewRef.current)
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
        })

        // Calculate dimensions to fit the image to the PDF
        const imgProps = pdf.getImageProperties(imgData)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = imgProps.width
        const imgHeight = imgProps.height

        // Calculate ratio to fit the image to the PDF
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
        const imgX = (pdfWidth - imgWidth * ratio) / 2
        const imgY = 20 // Top margin

        // Add title
        pdf.setFontSize(16)
        pdf.text("Planogramme Automatique", pdfWidth / 2, 10, { align: "center" })

        // Add image
        pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)

        // Add additional information
        pdf.setFontSize(10)
        const infoY = imgY + imgHeight * ratio + 10
        if (planogramParams) {
          pdf.text(`Emplacement: ${planogramParams.emplacement_magasin}`, 10, infoY)
          pdf.text(
            `Dimensions: ${planogramParams.dimension_longueur_planogramme}m x ${planogramParams.dimension_largeur_planogramme}m`,
            10,
            infoY + 5,
          )
          pdf.text(`Étagères: ${planogramParams.nb_etageres}`, 10, infoY + 10)
          pdf.text(`Colonnes: ${planogramParams.nb_colonnes}`, 10, infoY + 15)
        }

        // Add generation date
        pdf.text(`Généré le: ${new Date().toLocaleDateString()}`, pdfWidth - 60, pdfHeight - 10)

        // Download PDF
        pdf.save(`planogramme-${new Date().toISOString().slice(0, 10)}.pdf`)

        toast({
          title: "Exportation réussie",
          description: "Le planogramme a été exporté en PDF avec succès.",
        })
      })
      .catch((err) => {
        console.error("Erreur lors de l'exportation en PDF:", err)
        toast({
          title: "Erreur d'exportation",
          description: "Une erreur s'est produite lors de l'exportation en PDF.",
          variant: "destructive",
        })
      })
  }

  // Render planogram preview for preview and export
  const renderPlanogramPreview = () => {
    if (!generatedConfig || !generatedCells.length) return null

    const cellSize = 60 // Cell size in pixels
    const gridWidth = generatedConfig.columns * cellSize
    const gridHeight = generatedConfig.rows * cellSize

    return (
      <div
        ref={planogramPreviewRef}
        className="border rounded-md p-4 bg-white"
        style={{ width: gridWidth + 40, margin: "0 auto" }}
      >
        <h3 className="text-lg font-medium mb-4 text-center">{generatedConfig.name}</h3>
        <div
          className="grid gap-1 border rounded-md p-2 bg-gray-50"
          style={{
            gridTemplateColumns: `repeat(${generatedConfig.columns}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${generatedConfig.rows}, ${cellSize}px)`,
          }}
        >
          {generatedCells.map((cell) => {
            const product = products.find((p) => p.primary_Id === cell.productId)
            return (
              <div
                key={cell.id}
                className={`
                  border rounded-md flex items-center justify-center overflow-hidden
                  ${cell.productId ? "bg-primary/10 border-primary/30" : "bg-gray-100 border-gray-200"}
                `}
                style={{ width: cellSize, height: cellSize }}
              >
                {cell.productId && product ? (
                  <div className="flex flex-col items-center justify-center p-1 w-full h-full">
                    {product.image ? (
                      <div className="w-8 h-8 overflow-hidden rounded-md mb-1">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-8 h-8 rounded-md mb-1 flex items-center justify-center"
                        style={{ backgroundColor: product.color || "#f3f4f6" }}
                      >
                        <span className="text-xs font-bold text-white">
                          {product.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-xs truncate w-full text-center" title={product.name}>
                      {product.name.length > 10 ? `${product.name.substring(0, 10)}...` : product.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">
                    {cell.x + 1},{cell.y + 1}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Render JSON template example
  const renderJsonExample = () => {
    const exampleJson = {
      emplacement_magasin: "Store A",
      dimension_longueur_planogramme: 2.0,
      dimension_largeur_planogramme: 1.5,
      nb_etageres: 4,
      nb_colonnes: 3,
      product_placements: [
        {
          produit_id: "PROD001",
          etage: 0,
          colonne: 0,
        },
        {
          produit_id: "PROD002",
          etage: 0,
          colonne: 1,
        },
        {
          produit_id: "PROD003",
          etage: 1,
          colonne: 0,
        },
      ],
    }

    return JSON.stringify(exampleJson, null, 2)
  }

  // Render placement status component
  const renderPlacementStatus = () => {
    if (placementResults.total === 0) return null

    return (
      <div className="space-y-4 mt-6">
        <h4 className="font-medium">Statut du placement des produits</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h5 className="font-medium">
                Produits placés ({placementResults.success.length} sur {placementResults.total})
              </h5>
            </div>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {placementResults.success.map((item, index) => (
                  <div key={`success-${index}`} className="border rounded-md p-2 bg-green-50">
                    <div className="flex items-start gap-2">
                      <span className="font-medium">{item.id}</span>
                      <span className="text-sm text-muted-foreground flex-1">{item.reason}</span>
                    </div>
                  </div>
                ))}
                {placementResults.success.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">Aucun produit placé</p>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="border rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h5 className="font-medium">
                Produits non placés ({placementResults.failed.length} sur {placementResults.total})
              </h5>
            </div>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {placementResults.failed.map((item, index) => (
                  <div key={`failed-${index}`} className="border rounded-md p-2 bg-amber-50">
                    <div className="flex items-start gap-2">
                      <span className="font-medium">{item.id}</span>
                      <span className="text-sm text-muted-foreground flex-1">{item.reason}</span>
                    </div>
                  </div>
                ))}
                {placementResults.failed.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">Tous les produits ont été placés avec succès</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div dir={i18n.language === "ar" ? "rtl" : "ltr"} className="w-full">
      <div className="container max-w-4xl mx-auto py-6 mt-12">
        <Button
          variant="outline"
          onClick={() => router.push("/Editor")}
          className="flex items-center gap-2 mb-4"
        >
          {i18n.language === "ar" ? (
            <>
              {t("productImport.backToEditor")}
              <ArrowLeft className="h-4 w-4 mr-2" />
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4" />
              {t("productImport.backToEditor")}
            </>
          )}
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("productImport.generationAuto")}</CardTitle>
            <CardDescription>{t("productImport.generationAutoDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-8">
              {i18n.language === "ar" ? (
                // Arabic (RTL) version - steps from right to left (0 to 4)
                <div className="flex w-full justify-between">
                  <div className="flex items-center">
                    <Badge
                      variant={step >= 4 ? "default" : "outline"}
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      4
                    </Badge>
                    <span className={`${step >= 4 ? "font-medium" : "text-muted-foreground"} mx-2 whitespace-nowrap`}>
                      {t("productImport.generateurVisualisation")}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      variant={step >= 3 ? "default" : "outline"}
                      className="w-8 h-8 flex items-center justify-center mx-2"
                    >
                      3
                    </Badge>
                    <span className={`${step >= 3 ? "font-medium" : "text-muted-foreground"} mx-2 whitespace-nowrap`}>
                      {t("productImport.generateurAuto")}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      variant={step >= 2 ? "default" : "outline"}
                      className="w-8 h-8 flex items-center justify-center mx-2"
                    >
                      2
                    </Badge>
                    <span className={`${step >= 2 ? "font-medium" : "text-muted-foreground"} mx-2 whitespace-nowrap`}>
                      {t("productImport.generateurImages")}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      variant={step >= 1 ? "default" : "outline"}
                      className="w-8 h-8 flex items-center justify-center mx-2"
                    >
                      1
                    </Badge>
                    <span className={`${step >= 1 ? "font-medium" : "text-muted-foreground"} mx-2 whitespace-nowrap`}>
                      {t("productImport.parametreJSON")}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      variant={step >= 0 ? "default" : "outline"}
                      className="w-8 h-8 flex items-center justify-center mx-2"
                    >
                      0
                    </Badge>
                    <span className={`${step >= 0 ? "font-medium" : "text-muted-foreground"} mx-2 whitespace-nowrap`}>
                      {t("productImport.parametreJSON")}
                    </span>
                  </div>
                </div>
              ) : (
                // English/French (LTR) version - steps from left to right (0 to 4)
                <div className="flex w-full overflow-x-auto">
                  <div className="flex items-center">
                    <Badge
                      variant={step >= 0 ? "default" : "outline"}
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      0
                    </Badge>
                    <span className={`${step >= 0 ? "font-medium" : "text-muted-foreground"} mx-2 whitespace-nowrap`}>
                      {t("productImport.parametreJSON")}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="flex items-center">
                    <Badge
                      variant={step >= 1 ? "default" : "outline"}
                      className="w-8 h-8 flex items-center justify-center mx-2"
                    >
                      1
                    </Badge>
                    <span className={`${step >= 1 ? "font-medium" : "text-muted-foreground"} mx-2 whitespace-nowrap`}>
                      {t("productImport.parametreJSON")}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="flex items-center">
                    <Badge
                      variant={step >= 2 ? "default" : "outline"}
                      className="w-8 h-8 flex items-center justify-center mx-2"
                    >
                      2
                    </Badge>
                    <span className={`${step >= 2 ? "font-medium" : "text-muted-foreground"} mx-2 whitespace-nowrap`}>
                      {t("productImport.generateurImages")}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="flex items-center">
                    <Badge
                      variant={step >= 3 ? "default" : "outline"}
                      className="w-8 h-8 flex items-center justify-center mx-2"
                    >
                      3
                    </Badge>
                    <span className={`${step >= 3 ? "font-medium" : "text-muted-foreground"} mx-2 whitespace-nowrap`}>
                      {t("productImport.generateurAuto")}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="flex items-center">
                    <Badge
                      variant={step >= 4 ? "default" : "outline"}
                      className="w-8 h-8 flex items-center justify-center mx-2"
                    >
                      4
                    </Badge>
                    <span className={`${step >= 4 ? "font-medium" : "text-muted-foreground"} mx-2 whitespace-nowrap`}>
                      {t("productImport.generateurVisualisation")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {step === 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{t("productImport.generateurParamIA")}</h3>
                  <p className="text-sm text-muted-foreground">{t("productImport.generateurParamIADescription")}</p>
                </div>

                <div className="border rounded-md bg-muted/10 overflow-hidden">
                  {/* Barre de titre avec contrôles fonctionnels */}
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 border-b flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {/* Bouton Fermer */}
                      <button
                        onClick={() => router.push("/planogram-editor")}
                        className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors group"
                        title="Fermer"
                      >
                        <span className="text-white text-xs opacity-70 group-hover:opacity-100">✕</span>
                      </button>

                      {/* Bouton Minimiser */}
                      <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="w-3 h-3 rounded-full bg-yellow-500 flex items-center justify-center hover:bg-yellow-600 transition-colors group"
                        title="Minimiser"
                      >
                        <span className="text-white text-xs opacity-70 group-hover:opacity-100">⎚</span>
                      </button>

                      {/* Bouton Agrandir */}
                      <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors group"
                        title={isFullscreen ? "Réduire" : "Agrandir"}
                      >
                        <span className="text-white text-xs opacity-70 group-hover:opacity-100">⬜</span>
                      </button>
                    </div>

                    <div className="text-xs text-muted-foreground">{t("productImport.generateurPlanogramIA")}</div>

                    <div className="w-12"></div>
                  </div>

                  {/* Contenu conditionnel selon l'état */}
                  {isMinimized ? (
                    <div className="p-4 text-center text-muted-foreground bg-gray-50 dark:bg-gray-900">
                      {t("productImport.fenetreMinimiser")}{" "}
                      <button
                        onClick={() => setIsMinimized(false)}
                        className="text-primary underline hover:text-primary/80"
                      >
                        {t("productImport.generateurRestaurer")}
                      </button>
                    </div>
                  ) : (
                    <div
                      className={clsx(
                        "w-full transition-all duration-300 overflow-hidden",
                        isFullscreen ? "h-[80vh]" : "h-[500px]",
                      )}
                    >
                      <iframe
                        src={iaGeneratorUrl}
                        className="w-full h-full border-0"
                        title="Générateur IA de planogramme"
                        allow="camera; microphone"
                      />
                    </div>
                  )}
                </div>

                {iaGeneratedJson ? (
                  <Alert className="w-full">
                    <Info className="h-4 w-4" />
                    <AlertTitle>{t("productImport.configurationpret")}</AlertTitle>
                    <AlertDescription>
                      {t("productImport.configurationpretDescription")}
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 ml-1 text-primary"
                        onClick={() => {
                          setJsonText(iaGeneratedJson)
                          setStep(1)
                        }}
                      >
                        ({t("productImport.passerEtape")})
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span>{t("productImport.generateurConfigIA")}</span>
                  </div>
                )}

                <div
                  className={`flex gap-2 ${i18n.language === "ar" ? "justify-start flex-row-reverse" : "justify-end"}`}
                >
                  <Button variant="outline" onClick={() => setStep(1)}>
                    {t("productImport.skipEtap")}
                  </Button>
                  <Button
                    onClick={() => {
                      if (iaGeneratedJson) {
                        setStep(1)
                        return
                      }

                      const iframe = document.querySelector("iframe")
                      if (iframe?.contentWindow) {
                        iframe.contentWindow.postMessage(
                          {
                            type: "REQUEST_JSON",
                            requestId: Date.now(),
                          },
                          "http://localhost:8501",
                        )

                        toast({
                          title: "Demande envoyée",
                          description: "Requête des données envoyée à l'IA...",
                        })

                        setTimeout(() => {
                          if (!iaGeneratedJson) {
                            toast({
                              title: "Pas de réponse",
                              description: "L'IA n'a pas répondu. Essayez de regénérer.",
                              variant: "destructive",
                            })
                          }
                        }, 1000)
                      }
                    }}
                    disabled={isMinimized}
                  >
                    {iaGeneratedJson ? t('productImport.continue') : t('productImport.getConfig')}
                  </Button>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{t("productImport.planogramSettings")}</h3>
                  <p className="text-sm text-muted-foreground">{t("productImport.planogramSettingsDescription")}</p>
                </div>

                <Tabs value={jsonInputMethod} onValueChange={setJsonInputMethod}>
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="upload">
                      <Upload className="h-4 w-4 mr-2" />
                      {t("productImport.importFichier")}
                    </TabsTrigger>
                    <TabsTrigger value="editor">
                      <Edit className="h-4 w-4 mr-2" />
                      {t("productImport.editeurJSON")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload">
                    <div
                      className={`
            border-2 border-dashed rounded-lg p-12 text-center
            ${planogramParams ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25"}
            hover:border-primary/50 transition-colors cursor-pointer
          `}
                      onClick={() => jsonInputRef.current?.click()}
                    >
                      {planogramParams ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <FileJson className="h-8 w-8 text-primary" />
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </div>
                          <p className="font-medium">{t("productImport.chargerJSONvalide")}</p>
                          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-4 text-sm text-left">
                            <div>
                              <p>
                                <span className="font-medium">{t("productImport.generateurEtagere")}:</span>{" "}
                                {planogramParams.emplacement_magasin}
                              </p>
                              <p>
                                <span className="font-medium">{t("productImport.longeur")}:</span>{" "}
                                {planogramParams.dimension_longueur_planogramme} m
                              </p>
                              <p>
                                <span className="font-medium">{t("productImport.width")}:</span>{" "}
                                {planogramParams.dimension_largeur_planogramme} m
                              </p>
                            </div>
                            <div>
                              <p>
                                <span className="font-medium">{t("productImport.generateurEtagere")}:</span>{" "}
                                {planogramParams.nb_etageres}
                              </p>
                              <p>
                                <span className="font-medium">{t("productImport.generateurColones")}:</span>{" "}
                                {planogramParams.nb_colonnes}
                              </p>
                              <p>
                                <span className="font-medium">{t("productImport.generateurPlacement")}:</span>{" "}
                                {planogramParams.product_placements.length}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPlanogramParams(null)
                            }}
                          >
                            {t("productImport.changerFichier")}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-center">
                            <FileJson className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <p className="text-lg font-medium">{t("productImport.selectedFileJSON")}</p>
                          <p className="text-sm text-muted-foreground">{t("productImport.dragDropJSON")}</p>
                        </div>
                      )}
                      <Input
                        ref={jsonInputRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleJsonFileChange}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="editor">
                    <div className="space-y-4">
                      {/* Ajout de l'alerte pour la configuration IA */}
                      {iaGeneratedJson && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertTitle>{t("productImport.configresultIA")}</AlertTitle>
                          <AlertDescription>
                            {t("productImport.configParamIA")}
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 ml-1 text-primary"
                              onClick={() => {
                                setJsonText("")
                                setIaGeneratedJson("")
                                setPlanogramParams(null)
                              }}
                            >
                              ({t("productImport.generateurEffacer")})
                            </Button>
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="p-4 border rounded-md bg-muted/10">
                        <h4 className="font-medium mb-2">{t("productImport.JSONrequise")}</h4>
                        <ScrollArea className="h-[200px] mb-2">
                          <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto whitespace-pre">
                            {renderJsonExample()}
                          </pre>
                        </ScrollArea>
                        <p className="text-xs text-muted-foreground">{t("productImport.copierJSON")}</p>
                      </div>

                      <Textarea
                        ref={jsonEditorRef}
                        placeholder="Saisissez vos données JSON ici..."
                        className="font-mono text-sm min-h-[200px]"
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                      />

                      <Button onClick={handleJsonTextInput} className="w-full">
                        {t("productImport.ValiderJSON")}
                      </Button>

                      {validationErrors.length > 0 && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>{t("productImport.errorValidation")}</AlertTitle>
                          <AlertDescription>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                              {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {planogramParams && (
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        console.log("Paramètres actuels:", planogramParams)
                        toast({
                          title: "Informations de débogage",
                          description: "Les informations de débogage ont été affichées dans la console.",
                        })
                      }}
                      className="flex items-center gap-2"
                    >
                      <Bug className="h-4 w-4" />
                      {t("productImport.debogageParams")}
                    </Button>
                    <Button onClick={() => setStep(2)}>{t("productImport.generateurContinuer")}</Button>
                  </div>
                )}

                {/* Debug info display */}
                {debugInfo && (
                  <div className="mt-4">
                    <details className="border rounded-md p-2">
                      <summary className="font-medium cursor-pointer">{t("productImport.debogageInfo")}</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded-md text-xs overflow-auto max-h-[300px]">
                        {debugInfo}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{t("productImport.currentproduitsGen")}</h3>
                  <p className="text-sm text-muted-foreground">{t("productImport.currentproduitsGenDescr")}</p>
                </div>

                <div className="border rounded-md p-6 bg-muted/10">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {planogramParams?.product_placements.map((placement) => {
                      const product = products.find((p) => p.primary_Id === placement.produit_id)
                      return (
                        <div key={placement.produit_id} className="border rounded-md p-3 flex flex-col items-center">
                          {product?.image ? (
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="w-16 h-16 object-contain mb-2"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center mb-2">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="text-center">
                            <p className="text-sm font-medium truncate w-full">
                              {product?.name || placement.produit_id}
                            </p>
                            <p className="text-xs text-muted-foreground">ID: {placement.produit_id}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {planogramParams && planogramParams.product_placements.length > 0 && (
                    <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-amber-800">{t("productImport.productsInfoIA")}</p>
                          <p className="text-sm text-amber-700">
                            Le planogramme contient <strong>{planogramParams.product_placements.length}</strong>{" "}
                            produits à placer. Vérifiez que tous les produits peuvent être placés dans la grille (
                            {planogramParams.nb_etageres} étagères × {planogramParams.nb_colonnes} colonnes).
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    {t("productImport.retourGenerateur")}
                  </Button>
                  <Button onClick={() => setStep(3)}>{t("productImport.generateurContinuer")}</Button>
                </div>
              </div>
            )}
            {step === 2 && importProgress > 0 && (
              <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
                <Card className="w-[400px]">
                  <CardHeader>
                    <CardTitle>{t("productImport.importationEnCours")}</CardTitle>
                    <CardDescription>{t("productImport.importationEnCoursDescr")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={importProgress} className="h-2" />
                    <p className="text-center text-sm">
                      {importProgress < 100 ? "Traitement des données..." : "Importation terminée !"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{t("productImport.generatePlanogrammeIA")}</h3>
                  <p className="text-sm text-muted-foreground">{t("productImport.generatePlanogrammeIADescr")}</p>
                </div>

                <div className="border rounded-md p-6 bg-muted/10">
                  <div className="flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Wand2 className="h-16 w-16 mx-auto text-primary" />
                      <h3 className="text-xl font-medium">{t("productImport.generateurPret")}</h3>
                      <p className="text-muted-foreground max-w-md">{t("productImport.generateurPretDescr")}</p>
                      <Button size="lg" onClick={generatePlanogram} disabled={isGenerating} className="mt-4">
                        {isGenerating ? "Génération en cours..." : "Générer le planogramme"}
                      </Button>
                    </div>
                  </div>
                </div>

                {isGenerating && (
                  <div className="space-y-4">
                    <h4 className="font-medium">{t("productImport.progressionIA")}</h4>
                    <Progress value={generationProgress} className="h-2" />
                    <p className="text-center text-sm text-muted-foreground">
                      {generationProgress < 100 ? "Création du planogramme en cours..." : "Génération terminée !"}
                    </p>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Retour
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-center p-8">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-medium">{t("productImport.succesGenerateIA")}</h3>
                    <p className="text-muted-foreground">{t("productImport.succesGenerateIADescr")}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">{t("productImport.resumePlanogramme")}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-md p-4 space-y-2">
                      <p className="text-sm text-muted-foreground">{t("productImport.dimensionsGenIA")}</p>
                      <p className="text-lg font-medium">
                        {generatedConfig?.rows} étagères × {generatedConfig?.columns} {t("productImport.colone")}
                      </p>
                    </div>
                    <div className="border rounded-md p-4 space-y-2">
                      <p className="text-sm text-muted-foreground">{t("productImport.produitPlacerIA")}</p>
                      <p className="text-lg font-medium">
                        {generatedCells.filter((cell) => cell.instanceId !== null).length} {t("productImport.sur")}{" "}
                        {planogramParams?.product_placements.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Placement Results Section */}
                {renderPlacementStatus()}

                {/* Visualization mode selector */}
                <div className="mt-6">
                  <h4 className="font-medium mb-4">{t("productImport.visualisationPlanogramIA")}</h4>
                  <div className="flex justify-center mb-4">
                    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "2d" | "3d")}>
                      <TabsList>
                        <TabsTrigger value="2d">
                          <LayoutGrid className="h-4 w-4 mr-2" />
                          {t("productImport.TwoDview")}
                        </TabsTrigger>
                        <TabsTrigger value="3d">
                          <Cube className="h-4 w-4 mr-2" />
                          {t("productImport.ThreeDview")}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Visualization content */}
                  <div className="overflow-auto">
                    {viewMode === "2d" ? (
                      <div>{renderPlanogramPreview()}</div>
                    ) : (
                      <div className="h-[500px] border rounded-md">
                        <Suspense
                          fallback={
                            <div className="flex items-center justify-center h-full">
                              {t("productImport.chargementIA")}
                            </div>
                          }
                        >
                          <PlanogramViewer3D
                            config={generatedConfig}
                            cells={generatedCells}
                            products={products}
                            shelfHeight={30}
                          />
                        </Suspense>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`flex gap-4 ${i18n.language === "ar" ? "flex-row-reverse justify-center" : "justify-center"}`}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        {t("productImport.exporterIA")}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={i18n.language === "ar" ? "end" : "start"}>
                      <DropdownMenuItem onClick={exportAsImage}>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        {t("productImport.exporterImageIA")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportAsPDF}>
                        <FileText className="h-4 w-4 mr-2" />
                        {t("productImport.exporterPDFIA")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button onClick={goToPlanogramEditor}>
                    <Save className="h-4 w-4 mr-2" />
                    {t("productImport.openeditorIA")}
                  </Button>

                  <SavePlanogramDialog
                    planogramConfig={generatedConfig}
                    cells={generatedCells}
                    products={products}
                    productInstances={productInstances}
                    onSave={savePlanogramToLibrary}
                  >
                    <Button variant="outline">
                      <Package className="h-4 w-4 mr-2" />
                      {t("productImport.sauvegardeBoutiqueIA")}
                    </Button>
                  </SavePlanogramDialog>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
