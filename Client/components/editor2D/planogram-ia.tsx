"use client"

import type React from "react"
import { useState, useRef, Suspense, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import clsx from "clsx"
import { useFurnitureStore } from "@/lib/furniture-store"
import { StreamlitCommunicator, type StreamlitPlanogramData } from "@/lib/streamlit-communication"
import {
  FileJson,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Wand2,
  Save,
  Download,
  LayoutGrid,
  Upload,
  Edit,
  Info,
  Package,
  Eye,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
  Grid3X3,
  Box,
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

// Import realistic 3D components
import {
  PlanogramDisplay,
  ShelvesDisplay,
  GondolaDisplay,
  ClothingRack,
  WallDisplay,
  AccessoryDisplay,
  ModularCube,
  TableDisplay,
  RefrigeratorDisplay,
  RefrigeratedShowcase,
  ClothingDisplay,
  ClothingWallDisplay,
} from "@/components/editor2D/furniture-3d-components"

export function PlanogramIA() {
  const router = useRouter()
  const { toast } = useToast()
  const { products, addProducts, addPlanogram } = useProductStore()
  const { addPlanogramFurniture } = useFurnitureStore()

  // State
  const [step, setStep] = useState<number>(0)
  const [streamlitData, setStreamlitData] = useState<StreamlitPlanogramData | null>(null)
  const [planogramParams, setPlanogramParams] = useState<any | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [importProgress, setImportProgress] = useState<number>(0)
  const [generationProgress, setGenerationProgress] = useState<number>(0)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [jsonInputMethod, setJsonInputMethod] = useState<string>("upload")
  const [jsonText, setJsonText] = useState<string>("")
  const [generatedFurniture, setGeneratedFurniture] = useState<any[]>([])
  const [generatedDisplayItems, setGeneratedDisplayItems] = useState<any[]>([])
  const [productInstances, setProductInstances] = useState<any[]>([])
  const [planogramId, setPlanogramId] = useState<string>("")
  const [iaGeneratorUrl] = useState<string>("http://localhost:8501/")
  const [communicationLogs, setCommunicationLogs] = useState<string[]>([])
  const [isRequestingData, setIsRequestingData] = useState<boolean>(false)
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // New states for visualization
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d")
  const [webglError, setWebglError] = useState<boolean>(false)
  const [canvasKey, setCanvasKey] = useState<number>(0)
  const [webglSupported, setWebglSupported] = useState<boolean>(true)

  const jsonInputRef = useRef<HTMLInputElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const communicatorRef = useRef<StreamlitCommunicator | null>(null)

  // Check WebGL support
  useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement("canvas")
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
        if (!gl) {
          setWebglSupported(false)
          setWebglError(true)
          return false
        }
        return true
      } catch (e) {
        setWebglSupported(false)
        setWebglError(true)
        return false
      }
    }

    checkWebGLSupport()
  }, [])

  // Reset WebGL context with better error handling
  const resetWebGLContext = useCallback(() => {
    try {
      setWebglError(false)
      setCanvasKey((prev) => prev + 1)

      // Force garbage collection if available
      if (window.gc) {
        window.gc()
      }

      toast({
        title: "Contexte 3D réinitialisé",
        description: "La visualisation 3D a été redémarrée.",
      })
    } catch (error) {
      console.error("Failed to reset WebGL context:", error)
      setWebglError(true)
      toast({
        title: "Erreur de réinitialisation",
        description: "Impossible de réinitialiser le contexte 3D. Utilisez la vue 2D.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Initialiser le communicateur
  useEffect(() => {
    communicatorRef.current = new StreamlitCommunicator()
    communicatorRef.current.onPlanogramData((data: StreamlitPlanogramData) => {
      addCommunicationLog("✅ Données reçues avec succès!")
      processStreamlitData(data)
      setConnectionStatus("connected")
      setIsRequestingData(false)
    })

    return () => {
      communicatorRef.current?.cleanup()
    }
  }, [])

  // Configurer l'iframe quand elle est prête
  useEffect(() => {
    if (iframeRef.current && communicatorRef.current) {
      communicatorRef.current.setIframe(iframeRef.current)
      setConnectionStatus("connecting")
      setTimeout(() => {
        if (connectionStatus === "connecting") {
          setConnectionStatus("connected")
        }
      }, 3000)
    }
  }, [iframeRef.current])

  // Add communication log
  const addCommunicationLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setCommunicationLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)])
  }

  // Process Streamlit data
  const processStreamlitData = (data: StreamlitPlanogramData) => {
    try {
      addCommunicationLog("🔄 Traitement des données Streamlit...")
      if (!data.planogram_info || !data.furniture || !data.product_positions) {
        throw new Error("Structure de données Streamlit invalide")
      }

      setStreamlitData(data)
      const convertedData = convertStreamlitToInternalFormat(data)
      setPlanogramParams(convertedData)
      setJsonText(JSON.stringify(data, null, 2))
      addCommunicationLog(`✅ Données traitées: ${data.planogram_info.nom_planogram}`)

      toast({
        title: "Configuration Streamlit reçue",
        description: `Planogramme "${data.planogram_info.nom_planogram}" chargé avec succès.`,
      })

      setTimeout(() => setStep(1), 1000)
    } catch (error) {
      console.error("Erreur de traitement Streamlit:", error)
      addCommunicationLog(`❌ Erreur: ${error.message}`)
      toast({
        title: "Erreur de configuration",
        description: "Les données Streamlit reçues sont invalides.",
        variant: "destructive",
      })
    }
  }

  // Améliorer la fonction de mapping des types de meubles
  const mapFurnitureTypeIdToName = (typeId: number): string => {
    const typeMap: { [key: number]: string } = {
      1: "planogram",
      2: "gondola",
      3: "shelves",
      4: "clothing_rack",
      5: "wall_display",
      6: "accessory_display",
      7: "modular_cube",
      8: "table",
      9: "refrigerator",
      10: "refrigerated_showcase",
      11: "clothing_display",
      12: "clothing_wall",
    }
    return typeMap[typeId] || "planogram"
  }

  // Améliorer la fonction de détection du type de meuble
  const detectFurnitureType = (furniture: any): string => {
    // Priorité 1: Utiliser le type mappé depuis l'ID
    if (furniture.furniture_type_id) {
      const mappedType = mapFurnitureTypeIdToName(furniture.furniture_type_id)
      if (mappedType !== "planogram") {
        return mappedType
      }
    }

    // Priorité 2: Analyser le nom du type de meuble
    const typeName = (furniture.furniture_type_name || "").toLowerCase()

    if (typeName.includes("gondola") || typeName.includes("gondole")) {
      return "gondola"
    }
    if (typeName.includes("shelves") || typeName.includes("étagère") || typeName.includes("etagere")) {
      return "shelves"
    }
    if (typeName.includes("clothing") || typeName.includes("vêtement") || typeName.includes("vetement")) {
      if (typeName.includes("wall") || typeName.includes("mur")) {
        return "clothing_wall"
      }
      if (typeName.includes("rack") || typeName.includes("portant")) {
        return "clothing_rack"
      }
      return "clothing_display"
    }
    if (typeName.includes("refrigerator") || typeName.includes("réfrigérateur") || typeName.includes("refrigerateur")) {
      if (typeName.includes("showcase") || typeName.includes("vitrine")) {
        return "refrigerated_showcase"
      }
      return "refrigerator"
    }
    if (typeName.includes("wall") || typeName.includes("mur")) {
      return "wall_display"
    }
    if (typeName.includes("accessory") || typeName.includes("accessoire")) {
      return "accessory_display"
    }
    if (typeName.includes("cube") || typeName.includes("modulaire")) {
      return "modular_cube"
    }
    if (typeName.includes("table")) {
      return "table"
    }

    // Priorité 3: Analyser les dimensions pour deviner le type
    const { largeur = 0, hauteur = 0, profondeur = 0 } = furniture
    const width = largeur / 100
    const height = hauteur / 100
    const depth = profondeur / 100

    // Meuble très haut et étroit = clothing_rack
    if (height > 1.8 && width < 1.5 && depth < 0.8) {
      return "clothing_rack"
    }

    // Meuble large et profond = gondola
    if (width > 2 && depth > 1) {
      return "gondola"
    }

    // Meuble haut avec peu de profondeur = wall_display
    if (height > 1.5 && depth < 0.5) {
      return "wall_display"
    }

    // Meuble carré = modular_cube
    if (Math.abs(width - height) < 0.3 && Math.abs(width - depth) < 0.3) {
      return "modular_cube"
    }

    // Meuble bas = table
    if (height < 1) {
      return "table"
    }

    // Par défaut = shelves (plus générique que planogram)
    return "shelves"
  }

  // Convert Streamlit format to internal format
  const convertStreamlitToInternalFormat = (data: StreamlitPlanogramData) => {
    const furniture = data.furniture[0]
    return {
      planogram_id: data.planogram_info.planogram_id,
      nom_planogram: data.planogram_info.nom_planogram,
      magasin_id: data.planogram_info.magasin_id,
      categorie_id: data.planogram_info.categorie_id,
      furniture_type: detectFurnitureType(furniture),
      type_meuble: furniture.furniture_type_name,
      largeur: furniture.largeur / 100,
      hauteur: furniture.hauteur / 100,
      profondeur: furniture.profondeur / 100,
      nb_etageres: furniture.nb_etageres_unique_face,
      nb_colonnes: furniture.nb_colonnes_unique_face,
      sections: furniture.nb_etageres_unique_face,
      slots: furniture.nb_colonnes_unique_face,
      product_placements: data.product_positions.map((pos) => ({
        produit_id: pos.produit_id,
        etage: pos.etagere,
        colonne: pos.colonne,
        section: pos.etagere,
        position: pos.colonne,
        quantite: pos.quantite,
        quantity: pos.quantite,
        face: pos.face,
      })),
      faces: furniture.faces,
      available_faces: furniture.available_faces,
      imageUrl: furniture.imageUrl,
      date_creation: data.planogram_info.date_creation,
      statut: data.planogram_info.statut,
    }
  }

  // Map furniture type ID to name

  // Request data from Streamlit
  const requestStreamlitData = async () => {
    if (!communicatorRef.current) {
      toast({
        title: "Erreur de communication",
        description: "Le communicateur n'est pas initialisé.",
        variant: "destructive",
      })
      return
    }

    setIsRequestingData(true)
    setConnectionStatus("connecting")
    addCommunicationLog("📤 Demande de données à Streamlit...")

    try {
      const data = await communicatorRef.current.requestPlanogramData()
      if (data) {
        addCommunicationLog("✅ Données reçues avec succès!")
        processStreamlitData(data)
        setConnectionStatus("connected")
      } else {
        addCommunicationLog("⚠️ Aucune donnée reçue")
        toast({
          title: "Aucune donnée",
          description: "Streamlit n'a pas retourné de données. Vérifiez qu'un planogramme est généré.",
          variant: "destructive",
        })
        setConnectionStatus("disconnected")
      }
    } catch (error) {
      addCommunicationLog(`❌ Erreur: ${error.message}`)
      toast({
        title: "Erreur de communication",
        description: error.message,
        variant: "destructive",
      })
      setConnectionStatus("disconnected")
    } finally {
      setIsRequestingData(false)
    }
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
        if (jsonData.planogram_info && jsonData.furniture && jsonData.product_positions) {
          processStreamlitData(jsonData)
        } else {
          toast({
            title: "Format non supporté",
            description: "Le fichier ne contient pas de données Streamlit valides.",
            variant: "destructive",
          })
        }
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
      if (jsonData.planogram_info && jsonData.furniture && jsonData.product_positions) {
        processStreamlitData(jsonData)
      } else {
        toast({
          title: "Format non supporté",
          description: "Les données ne correspondent pas au format Streamlit attendu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error parsing JSON text:", error)
      toast({
        title: "Format JSON invalide",
        description: "Le texte saisi ne contient pas un JSON valide. Vérifiez le format.",
        variant: "destructive",
      })
    }
  }

  // Generate furniture based on parameters
  const generateFurniture = () => {
    if (!planogramParams) {
      toast({
        title: "Paramètres manquants",
        description: "Veuillez d'abord charger les paramètres JSON.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)
    const newPlanogramId =
      streamlitData?.planogram_info.planogram_id || `furniture-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    setPlanogramId(newPlanogramId)

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + 5
      })
    }, 100)

    // Process product placements to create product data
    const productData = (planogramParams.product_placements || []).map((placement: any) => ({
      primary_Id: placement.produit_id,
      name: `Produit ${placement.produit_id}`,
      supplier: "Non spécifié",
      color: "#3b82f6",
    }))

    if (productData.length > 0) {
      const newProducts = productData.filter((product) => !products.some((p) => p.primary_Id === product.primary_Id))
      if (newProducts.length > 0) {
        addProducts(newProducts)
      }
    }

    if (streamlitData) {
      const furnitureItems = streamlitData.furniture.map((furniture, index) => ({
        id: furniture.furniture_id,
        type: detectFurnitureType(furniture),
        name: `${furniture.furniture_type_name} ${index + 1}`,
        width: furniture.largeur / 100,
        height: furniture.hauteur / 100,
        depth: furniture.profondeur / 100,
        sections: furniture.nb_etageres_unique_face,
        slots: furniture.nb_colonnes_unique_face,
        color: "#8B4513",
        x: index * 2,
        y: furniture.hauteur / 200, // Position Y correctly - half the height above ground
        z: 0,
        rotation: 0,
        faces: furniture.faces,
        available_faces: furniture.available_faces,
      }))

      setGeneratedFurniture(furnitureItems)

      // Convert product positions to display items format
      const displayItems = streamlitData.product_positions.map((position) => ({
        id: position.position_id,
        productId: position.produit_id,
        furnitureId: position.furniture_id,
        section: position.etagere - 1, // Convert to 0-based index
        position: position.colonne - 1, // Convert to 0-based index
        quantity: position.quantite,
        face: position.face,
        // Add the raw position data for easier access
        ...position,
      }))

      setGeneratedDisplayItems(displayItems)
    }

    setTimeout(() => {
      clearInterval(interval)
      setGenerationProgress(100)
      toast({
        title: "Génération réussie",
        description: streamlitData
          ? `Planogramme "${streamlitData.planogram_info.nom_planogram}" généré avec succès`
          : "Le meuble a été généré avec succès",
      })

      setTimeout(() => {
        setIsGenerating(false)
        setStep(4)
      }, 500)
    }, 1500)
  }

  // Améliorer le composant RealisticFurniture pour plus de variété
  const RealisticFurniture = ({ furniture, displayItems, products }: any) => {
    const handleRemove = (item: any) => {
      console.log("Remove item:", item)
    }

    // Ajouter des logs pour debug
    console.log("Rendering furniture type:", furniture.type, "for furniture:", furniture.name)

    // Choose the right component based on furniture type
    const renderFurnitureComponent = () => {
      switch (furniture.type) {
        case "gondola":
          return (
            <GondolaDisplay
              furniture={{ ...furniture, color: "#2c3e50" }}
              displayItems={displayItems}
              products={products}
              onRemove={handleRemove}
            />
          )
        case "shelves":
          return (
            <ShelvesDisplay
              furniture={{ ...furniture, color: "#ecf0f1" }}
              displayItems={displayItems}
              products={products}
              onRemove={handleRemove}
            />
          )
        case "clothing_rack":
          return (
            <ClothingRack
              furniture={{ ...furniture, color: "#34495e" }}
              displayItems={displayItems}
              products={products}
              onRemove={handleRemove}
            />
          )
        case "wall_display":
          return (
            <WallDisplay
              furniture={{ ...furniture, color: "#95a5a6" }}
              displayItems={displayItems}
              products={products}
              onRemove={handleRemove}
            />
          )
        case "accessory_display":
          return (
            <AccessoryDisplay
              furniture={{ ...furniture, color: "#e74c3c" }}
              displayItems={displayItems}
              products={products}
              onRemove={handleRemove}
            />
          )
        case "modular_cube":
          return (
            <ModularCube
              furniture={{ ...furniture, color: "#9b59b6" }}
              displayItems={displayItems}
              products={products}
              onRemove={handleRemove}
            />
          )
        case "table":
          return (
            <TableDisplay
              furniture={{ ...furniture, color: "#d35400" }}
              displayItems={displayItems}
              products={products}
              onRemove={handleRemove}
            />
          )
        case "refrigerator":
          return (
            <RefrigeratorDisplay
              furniture={{ ...furniture, color: "#1abc9c" }}
              displayItems={displayItems}
              products={products}
              onRemove={handleRemove}
            />
          )
        case "refrigerated_showcase":
          return (
            <RefrigeratedShowcase
              furniture={{ ...furniture, color: "#16a085" }}
              displayItems={displayItems}
              products={products}
              onRemove={handleRemove}
            />
          )
        case "clothing_display":
          return (
            <ClothingDisplay
              furniture={{ ...furniture, color: "#8e44ad" }}
              displayItems={displayItems}
              products={products}
              onRemove={handleRemove}
            />
          )
        case "clothing_wall":
          return (
            <ClothingWallDisplay
              furniture={{ ...furniture, color: "#2980b9" }}
              displayItems={displayItems}
              products={products}
              onRemove={handleRemove}
            />
          )
        case "planogram":
          return (
            <PlanogramDisplay
              furniture={{ ...furniture, color: "#27ae60" }}
              displayItems={displayItems}
              products={products}
              onRemove={handleRemove}
            />
          )
        default:
          // Log pour debug les types non reconnus
          console.warn("Unknown furniture type:", furniture.type, "using ShelvesDisplay as fallback")
          return (
            <ShelvesDisplay
              furniture={{ ...furniture, color: "#7f8c8d" }}
              displayItems={displayItems}
              products={products}
              onRemove={handleRemove}
            />
          )
      }
    }

    return <>{renderFurnitureComponent()}</>
  }

  // Realistic 3D Furniture Component

  // Enhanced 3D Scene component with realistic furniture
  const Scene3D = () => {
    if (!webglSupported || webglError) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
            <h3 className="text-lg font-medium">WebGL non disponible</h3>
            <p className="text-muted-foreground">Votre navigateur ne supporte pas WebGL ou le contexte a été perdu.</p>
            <Button variant="outline" onClick={() => setViewMode("2d")}>
              <Grid3X3 className="h-4 w-4 mr-2" />
              Passer en vue 2D
            </Button>
          </div>
        </div>
      )
    }

    return (
      <Canvas
        key={canvasKey}
        camera={{ position: [5, 3, 5], fov: 60 }}
        shadows
        style={{ background: "linear-gradient(to bottom, #87CEEB, #f0f8ff)" }}
        onCreated={({ gl }) => {
          // Add context lost handler
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault()
            console.warn("WebGL context lost")
            setWebglError(true)
          })

          gl.domElement.addEventListener("webglcontextrestored", () => {
            console.log("WebGL context restored")
            setWebglError(false)
          })
        }}
        gl={{
          preserveDrawingBuffer: false,
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {/* Use realistic furniture components */}
        {generatedFurniture.map((furniture) => (
          <RealisticFurniture
            key={furniture.id}
            furniture={furniture}
            displayItems={generatedDisplayItems.filter((item) => item.furnitureId === furniture.id)}
            products={products}
          />
        ))}

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} maxDistance={20} minDistance={2} />
        <Environment preset="warehouse" />

        {/* Ground plane positioned correctly */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
      </Canvas>
    )
  }

  // 2D Visualization component (unchanged)
  const Scene2D = () => {
    if (!streamlitData) return null

    const furniture = streamlitData.furniture[0]
    const positions = streamlitData.product_positions

    const cellWidth = 60
    const cellHeight = 40
    const gridWidth = furniture.nb_colonnes_unique_face * cellWidth
    const gridHeight = furniture.nb_etageres_unique_face * cellHeight

    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="relative border-2 border-gray-300 bg-white">
          <svg width={gridWidth + 40} height={gridHeight + 40} className="overflow-visible">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width={cellWidth} height={cellHeight} patternUnits="userSpaceOnUse">
                <path d={`M ${cellWidth} 0 L 0 0 0 ${cellHeight}`} fill="none" stroke="#e5e7eb" strokeWidth="1" />
              </pattern>
            </defs>
            <rect
              x="20"
              y="20"
              width={gridWidth}
              height={gridHeight}
              fill="url(#grid)"
              stroke="#d1d5db"
              strokeWidth="2"
            />

            {/* Section labels */}
            {Array.from({ length: furniture.nb_etageres_unique_face }, (_, i) => (
              <text
                key={`section-${i}`}
                x="10"
                y={20 + (i + 0.5) * cellHeight + 5}
                fontSize="12"
                fill="#6b7280"
                textAnchor="middle"
              >
                {furniture.nb_etageres_unique_face - i}
              </text>
            ))}

            {/* Position labels */}
            {Array.from({ length: furniture.nb_colonnes_unique_face }, (_, i) => (
              <text
                key={`position-${i}`}
                x={20 + (i + 0.5) * cellWidth}
                y={gridHeight + 35}
                fontSize="12"
                fill="#6b7280"
                textAnchor="middle"
              >
                {i + 1}
              </text>
            ))}

            {/* Product positions */}
            {positions.map((pos, index) => {
              const x = 20 + (pos.colonne - 1) * cellWidth
              const y = 20 + (furniture.nb_etageres_unique_face - pos.etagere) * cellHeight

              return (
                <g key={`product-${index}`}>
                  <rect
                    x={x + 2}
                    y={y + 2}
                    width={cellWidth - 4}
                    height={cellHeight - 4}
                    fill="#3b82f6"
                    fillOpacity="0.7"
                    stroke="#1d4ed8"
                    strokeWidth="1"
                    rx="4"
                  />
                  <text
                    x={x + cellWidth / 2}
                    y={y + cellHeight / 2 - 5}
                    fontSize="10"
                    fill="white"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    P{pos.produit_id}
                  </text>
                  <text x={x + cellWidth / 2} y={y + cellHeight / 2 + 8} fontSize="9" fill="white" textAnchor="middle">
                    Qty: {pos.quantite}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Legend */}
          <div className="absolute top-2 right-2 bg-white p-2 border rounded shadow-sm">
            <div className="text-xs font-medium mb-1">Légende</div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Produit placé</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="container max-w-6xl mx-auto py-6 mt-12">
        <Button variant="outline" onClick={() => router.push("/Editor")} className="flex items-center gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'éditeur
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Package className="h-6 w-6" />
              Générateur de Meubles IA - Streamlit
              <Badge
                variant={
                  connectionStatus === "connected"
                    ? "default"
                    : connectionStatus === "connecting"
                      ? "secondary"
                      : "destructive"
                }
              >
                {connectionStatus === "connected" && <Wifi className="h-3 w-3 mr-1" />}
                {connectionStatus === "connecting" && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                {connectionStatus === "disconnected" && <WifiOff className="h-3 w-3 mr-1" />}
                {connectionStatus}
              </Badge>
            </CardTitle>
            <CardDescription>Générez automatiquement des meubles 3D à partir de données Streamlit</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Communication Debug Panel */}
            {communicationLogs.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Logs de Communication
                    {isRequestingData && (
                      <Badge variant="outline" className="animate-pulse">
                        Requête en cours
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[120px]">
                    <div className="space-y-1">
                      {communicationLogs.map((log, index) => (
                        <div key={index} className="text-xs font-mono text-muted-foreground">
                          {log}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex w-full overflow-x-auto">
                {[
                  { step: 0, label: "Configuration Streamlit", icon: Wand2 },
                  { step: 1, label: "Validation JSON", icon: FileJson },
                  { step: 2, label: "Aperçu", icon: CheckCircle2 },
                  { step: 3, label: "Génération", icon: Settings },
                  { step: 4, label: "Visualisation", icon: Eye },
                ].map((item, index) => (
                  <div key={item.step} className="flex items-center">
                    <div className="flex items-center">
                      <Badge
                        variant={step >= item.step ? "default" : "outline"}
                        className="w-8 h-8 flex items-center justify-center"
                      >
                        <item.icon className="h-4 w-4" />
                      </Badge>
                      <span
                        className={`${step >= item.step ? "font-medium" : "text-muted-foreground"} mx-2 whitespace-nowrap`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {index < 4 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Steps 0-3 remain the same as before */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Configuration Streamlit</h3>
                  <p className="text-sm text-muted-foreground">
                    Utilisez l'interface Streamlit pour générer votre planogramme, puis récupérez les données
                  </p>
                </div>

                <div className="border rounded-md bg-muted/10 overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 border-b flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push("/planogram-editor")}
                        className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors group"
                        title="Fermer"
                      >
                        <span className="text-white text-xs opacity-70 group-hover:opacity-100">✕</span>
                      </button>
                      <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="w-3 h-3 rounded-full bg-yellow-500 flex items-center justify-center hover:bg-yellow-600 transition-colors group"
                        title="Minimiser"
                      >
                        <span className="text-white text-xs opacity-70 group-hover:opacity-100">⎚</span>
                      </button>
                      <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors group"
                        title={isFullscreen ? "Réduire" : "Agrandir"}
                      >
                        <span className="text-white text-xs opacity-70 group-hover:opacity-100">⬜</span>
                      </button>
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      Interface Streamlit - Planogramme IA
                      <Badge variant={connectionStatus === "connected" ? "default" : "secondary"} className="text-xs">
                        {connectionStatus}
                      </Badge>
                    </div>

                    <div className="w-12"></div>
                  </div>

                  {!isMinimized && (
                    <div
                      className={clsx(
                        "w-full transition-all duration-300 overflow-hidden",
                        isFullscreen ? "h-[80vh]" : "h-[600px]",
                      )}
                    >
                      <iframe
                        ref={iframeRef}
                        src={iaGeneratorUrl}
                        className="w-full h-full border-0"
                        title="Interface Streamlit - Planogramme IA"
                        allow="camera; microphone"
                      />
                    </div>
                  )}
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Instructions</AlertTitle>
                  <AlertDescription>
                    <ol className="list-decimal list-inside space-y-1 mt-2">
                      <li>Utilisez l'interface Streamlit ci-dessus pour configurer et générer votre planogramme</li>
                      <li>Une fois généré, cliquez sur "Envoyer vers React" dans l'onglet "Résultats"</li>
                      <li>Les données seront automatiquement récupérées ici</li>
                      <li>Ou utilisez le bouton ci-dessous pour demander les données</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                {streamlitData && (
                  <Alert className="w-full">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Données Streamlit reçues</AlertTitle>
                    <AlertDescription>
                      Planogramme "{streamlitData.planogram_info.nom_planogram}" reçu avec succès.
                      <br />
                      <strong>ID:</strong> {streamlitData.planogram_info.planogram_id}
                      <br />
                      <strong>Meubles:</strong> {streamlitData.furniture.length}
                      <br />
                      <strong>Positions:</strong> {streamlitData.product_positions.length}
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 ml-1 text-primary"
                        onClick={() => setStep(1)}
                      >
                        (Passer à l'étape suivante)
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Ignorer cette étape
                  </Button>
                  <Button
                    onClick={() => {
                      if (streamlitData) {
                        setStep(1)
                        return
                      }
                      requestStreamlitData()
                    }}
                    disabled={isMinimized || isRequestingData}
                    className="flex items-center gap-2"
                  >
                    {streamlitData ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Continuer
                      </>
                    ) : isRequestingData ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Recherche en cours...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Récupérer les données
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 1: JSON Validation */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Validation des Données</h3>
                  <p className="text-sm text-muted-foreground">
                    Vérification et validation des données reçues de Streamlit
                  </p>
                </div>

                {streamlitData ? (
                  <div className="space-y-4">
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Données Streamlit validées</AlertTitle>
                      <AlertDescription>Les données ont été reçues et converties avec succès.</AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Informations du Planogramme</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <p>
                            <strong>ID:</strong> {streamlitData.planogram_info.planogram_id}
                          </p>
                          <p>
                            <strong>Nom:</strong> {streamlitData.planogram_info.nom_planogram}
                          </p>
                          <p>
                            <strong>Magasin:</strong> {streamlitData.planogram_info.magasin_id}
                          </p>
                          <p>
                            <strong>Catégorie:</strong> {streamlitData.planogram_info.categorie_id}
                          </p>
                          <p>
                            <strong>Statut:</strong> {streamlitData.planogram_info.statut}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Meubles et Positions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <p>
                            <strong>Nombre de meubles:</strong> {streamlitData.furniture.length}
                          </p>
                          <p>
                            <strong>Positions produits:</strong> {streamlitData.product_positions.length}
                          </p>
                          <p>
                            <strong>Types de meubles:</strong>{" "}
                            {[...new Set(streamlitData.furniture.map((f) => f.furniture_type_name))].join(", ")}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Aucune donnée Streamlit</AlertTitle>
                      <AlertDescription>
                        Retournez à l'étape précédente pour récupérer les données de Streamlit.
                      </AlertDescription>
                    </Alert>

                    <Tabs value={jsonInputMethod} onValueChange={setJsonInputMethod}>
                      <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="upload">
                          <Upload className="h-4 w-4 mr-2" />
                          Importer fichier
                        </TabsTrigger>
                        <TabsTrigger value="editor">
                          <Edit className="h-4 w-4 mr-2" />
                          Éditeur JSON
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="upload">
                        <div
                          className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => jsonInputRef.current?.click()}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-center">
                              <FileJson className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <p className="text-lg font-medium">Sélectionner un fichier JSON Streamlit</p>
                            <p className="text-sm text-muted-foreground">
                              Glissez-déposez ou cliquez pour sélectionner votre fichier JSON exporté de Streamlit
                            </p>
                          </div>
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
                          <Textarea
                            placeholder="Collez ici le JSON exporté de Streamlit..."
                            className="font-mono text-sm min-h-[200px]"
                            value={jsonText}
                            onChange={(e) => setJsonText(e.target.value)}
                          />
                          <Button onClick={handleJsonTextInput} className="w-full">
                            Valider le JSON Streamlit
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    Retour
                  </Button>
                  {(streamlitData || planogramParams) && <Button onClick={() => setStep(2)}>Continuer</Button>}
                </div>
              </div>
            )}

            {/* Step 2: Preview */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Aperçu de la Configuration</h3>
                  <p className="text-sm text-muted-foreground">Vérification finale avant la génération 3D</p>
                </div>

                {streamlitData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Meubles
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{streamlitData.furniture.length}</div>
                          <p className="text-sm text-muted-foreground">
                            {[...new Set(streamlitData.furniture.map((f) => f.furniture_type_name))].length} types
                            différents
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4" />
                            Positions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{streamlitData.product_positions.length}</div>
                          <p className="text-sm text-muted-foreground">Produits à placer</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Quantité totale
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {streamlitData.product_positions.reduce((sum, pos) => sum + pos.quantite, 0)}
                          </div>
                          <p className="text-sm text-muted-foreground">Produits au total</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Configuration prête</AlertTitle>
                      <AlertDescription>
                        Tous les éléments sont configurés et prêts pour la génération 3D.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Retour
                  </Button>
                  <Button onClick={() => setStep(3)}>Générer en 3D</Button>
                </div>
              </div>
            )}

            {/* Step 3: Generation */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Génération 3D</h3>
                  <p className="text-sm text-muted-foreground">
                    Création des meubles 3D basés sur les données Streamlit
                  </p>
                </div>

                <div className="border rounded-md p-6 bg-muted/10">
                  <div className="flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Settings className={`h-16 w-16 mx-auto text-primary ${isGenerating ? "animate-spin" : ""}`} />
                      <h3 className="text-xl font-medium">
                        {isGenerating ? "Génération en cours..." : "Prêt à générer"}
                      </h3>
                      <p className="text-muted-foreground max-w-md">
                        {isGenerating
                          ? "Création des meubles 3D avec tous les éléments configurés..."
                          : "Cliquez pour démarrer la génération des meubles 3D"}
                      </p>
                      <Button size="lg" onClick={generateFurniture} disabled={isGenerating} className="mt-4">
                        {isGenerating ? "Génération en cours..." : "Démarrer la génération"}
                      </Button>
                    </div>
                  </div>
                </div>

                {isGenerating && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Progression</h4>
                    <Progress value={generationProgress} className="h-2" />
                    <p className="text-center text-sm text-muted-foreground">
                      {generationProgress < 100 ? "Création des meubles en cours..." : "Génération terminée !"}
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

            {/* Step 4: Enhanced Visualization with realistic furniture */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-center p-8">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-medium">Meubles générés avec succès !</h3>
                    <p className="text-muted-foreground">
                      {streamlitData
                        ? `Planogramme "${streamlitData.planogram_info.nom_planogram}" créé en 3D`
                        : "Vos meubles 3D ont été créés selon vos spécifications"}
                    </p>
                  </div>
                </div>

                {/* Enhanced Visualization with 2D/3D toggle */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Visualisation Interactive Réaliste</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{generatedFurniture.length} meuble(s)</Badge>
                      <Badge variant="outline">{generatedDisplayItems.length} position(s)</Badge>

                      {/* View Mode Toggle */}
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant={viewMode === "3d" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("3d")}
                          className="rounded-r-none"
                          disabled={!webglSupported}
                        >
                          <Box className="h-4 w-4 mr-1" />
                          3D Réaliste
                        </Button>
                        <Button
                          variant={viewMode === "2d" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("2d")}
                          className="rounded-l-none"
                        >
                          <Grid3X3 className="h-4 w-4 mr-1" />
                          2D
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* WebGL Support Warning */}
                  {!webglSupported && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>WebGL non supporté</AlertTitle>
                      <AlertDescription>
                        Votre navigateur ne supporte pas WebGL. Seule la visualisation 2D est disponible.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* WebGL Error Alert */}
                  {webglError && webglSupported && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Erreur de rendu 3D</AlertTitle>
                      <AlertDescription className="flex items-center justify-between">
                        <span>Le contexte WebGL a été perdu. La visualisation 3D n'est pas disponible.</span>
                        <Button variant="outline" size="sm" onClick={resetWebGLContext}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Réinitialiser
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="h-[600px] border rounded-md overflow-hidden">
                    {viewMode === "3d" ? (
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <Settings className="h-8 w-8 animate-spin mx-auto mb-2" />
                              <p>Chargement de la vue 3D réaliste...</p>
                            </div>
                          </div>
                        }
                      >
                        <Scene3D />
                      </Suspense>
                    ) : (
                      <Scene2D />
                    )}
                  </div>
                </div>

                {/* Debug Information */}
                {streamlitData && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-sm">Informations de Debug</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      <p>
                        <strong>WebGL Support:</strong> {webglSupported ? "✅ Oui" : "❌ Non"}
                      </p>
                      <p>
                        <strong>WebGL Error:</strong> {webglError ? "❌ Erreur" : "✅ OK"}
                      </p>
                      <p>
                        <strong>Produits générés:</strong> {products.length}
                      </p>
                      <p>
                        <strong>Positions produits:</strong> {streamlitData.product_positions.length}
                      </p>
                      <p>
                        <strong>Meubles générés:</strong> {generatedFurniture.length}
                      </p>
                      <p>
                        <strong>Type de meuble:</strong> {generatedFurniture[0]?.type || "N/A"}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Action buttons */}
                <div className="flex gap-4 justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          if (streamlitData) {
                            const jsonStr = JSON.stringify(streamlitData, null, 2)
                            const blob = new Blob([jsonStr], { type: "application/json" })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement("a")
                            a.href = url
                            a.download = `${streamlitData.planogram_info.planogram_id}.json`
                            a.click()
                            URL.revokeObjectURL(url)
                          }
                        }}
                      >
                        <FileJson className="h-4 w-4 mr-2" />
                        Exporter JSON original
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    onClick={() => {
                      router.push("/planogram-editor")
                    }}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Ouvrir dans l'éditeur
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
