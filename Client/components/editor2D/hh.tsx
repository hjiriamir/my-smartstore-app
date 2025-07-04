"use client"

import type React from "react"

import Link from "next/link"
import { useEffect } from "react"
import { useState } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"
import {
  Plus,
  Minus,
  Save,
  Package,
  Settings,
  Grid,
  CuboidIcon as Cube,
  ArrowLeft,
  Search,
  Trash2,
  Snowflake,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Bot,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useProductStore } from "@/lib/product-store"
import { useFurnitureStore } from "@/lib/furniture-store"
import type { Product } from "@/lib/product-store"
import type { FurnitureType } from "@/lib/furniture-store"
import {
  WallDisplay,
  ClothingRack,
  AccessoryDisplay,
  ModularCube,
  GondolaDisplay,
  TableDisplay,
  RefrigeratedShowcase,
  ClothingDisplay,
  ClothingWallDisplay,
  SupermarketFridge,
} from "@/components/editor2D/furniture-3d-components"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Drag item types
const ItemTypes = {
  PRODUCT: "product",
  FURNITURE_PRODUCT: "furniture_product",
}

// Interface pour les magasins
interface Magasin {
  magasin_id: string
  nom_magasin: string
  adresse?: string
}

// FurnitureItem Interface
type FurnitureItem = {
  id: string
  type: FurnitureType
  name: string
  sections: number
  slots: number
  width: number
  height: number
  depth: number
  color?: string
  x: number
  y: number
  z: number
  rotation: number
  storeId?: string
  storeName?: string
}

// FurnitureProduct Interface
type FurnitureProduct = {
  productId: string
  section: number
  position: number
  storeId?: string
}

// Interfaces pour l'importation JSON
interface PlanogramInfo {
  planogram_id: string
  nom_planogram: string
  statut: string
  date_creation: string
  magasin_id: string
  categorie_id: string
}

interface ImportedFurniture {
  furniture_id: string
  furniture_type_id: number
  furniture_type_name: string
  faces: number
  available_faces: string[]
  largeur: number
  hauteur: number
  profondeur: number
  imageUrl?: string
  nb_etageres_unique_face: number
  nb_colonnes_unique_face: number
  nb_etageres_front_back: number
  nb_colonnes_front_back: number
  nb_etageres_left_right: number
  nb_colonnes_left_right: number
}

interface ProductPosition {
  position_id: string
  furniture_id: string
  produit_id: string
  face: string
  etagere: number
  colonne: number
  quantite: number
}

interface ImportedPlanogram {
  planogram_info: PlanogramInfo
  furniture: ImportedFurniture[]
  product_positions: ProductPosition[]
}

// Mapping des types de meubles
const FURNITURE_TYPE_MAPPING: Record<string, FurnitureType> = {
  "wall-display": "wall-display",
  "clothing-rack": "clothing-rack",
  "accessory-display": "accessory-display",
  "modular-cube": "modular-cube",
  gondola: "gondola",
  table: "table",
  refrigerator: "refrigerator",
  "refrigerated-showcase": "refrigerated-showcase",
  "clothing-display": "clothing-display",
  "clothing-wall": "clothing-wall",
}

// AI Generation Dialog Component
const AIGenerationDialog = ({ onImport }: { onImport: (data: ImportedPlanogram) => void }) => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"ai" | "import">("ai")
  const [showDetectedFurnitures, setShowDetectedFurnitures] = useState(false);
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);
  const [generatedFurnitureIds, setGeneratedFurnitureIds] = useState<string[]>([]); 

  // États pour l'importation JSON
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewData, setPreviewData] = useState<ImportedPlanogram | null>(null)
  const [validationResults, setValidationResults] = useState<{
    furniture: { found: boolean; type: string }[]
    products: { found: boolean; id: string }[]
  } | null>(null)
  const [selectedFurnitures, setSelectedFurnitures] = useState<string[]>([])

  const { products } = useProductStore()

  // Fonction pour ouvrir l'interface IA dans une nouvelle fenêtre
  const openAIInterface = () => {
    const aiWindow = window.open(
      "http://localhost:8501",
      "ai-furniture-generator",
      "width=1400,height=900,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no",
    )

    if (!aiWindow) {
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir l'interface IA. Vérifiez que les popups sont autorisés.",
        variant: "destructive",
      })
      return
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "http://localhost:8501") return

      if (event.data.type === "planogram_generated") {
        try {
          onImport(event.data.planogram)
          aiWindow.close()
          setIsOpen(false)
          toast({
            title: "Succès",
            description: "Planogramme généré par IA importé avec succès!",
            variant: "default",
          })
        } catch (error) {
          console.error("Erreur lors de l'importation depuis l'IA:", error)
          toast({
            title: "Erreur",
            description: "Erreur lors de l'importation du planogramme généré par IA",
            variant: "destructive",
          })
        }
      }
    }

    window.addEventListener("message", handleMessage)

    const checkClosed = setInterval(() => {
      if (aiWindow.closed) {
        window.removeEventListener("message", handleMessage)
        clearInterval(checkClosed)
      }
    }, 1000)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/json") {
      setSelectedFile(file)
      parseAndValidateFile(file)
    } else {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier JSON valide",
        variant: "destructive",
      })
    }
  }

  const parseAndValidateFile = async (file: File) => {
    setIsLoading(true)
    try {
      const text = await file.text()
      const data: ImportedPlanogram = JSON.parse(text)

      if (!data.planogram_info || !data.furniture || !data.product_positions) {
        throw new Error("Structure JSON invalide")
      }

      setPreviewData(data)

      const furnitureValidation = data.furniture.map((furniture) => ({
        found: !!FURNITURE_TYPE_MAPPING[furniture.furniture_type_name],
        type: furniture.furniture_type_name,
      }))

      const productValidation = data.product_positions.map((position) => ({
        found: products.some((p) => p.primary_id === position.produit_id),
        id: position.produit_id,
      }))

      setValidationResults({
        furniture: furnitureValidation,
        products: productValidation,
      })

      // Sélectionner automatiquement tous les meubles valides
      const validFurnitureIds = data.furniture
        .filter((_, index) => furnitureValidation[index].found)
        .map(f => f.furniture_id)
      setSelectedFurnitures(validFurnitureIds)
    } catch (error) {
      console.error("Erreur lors du parsing:", error)
      toast({
        title: "Erreur",
        description: "Fichier JSON invalide ou structure incorrecte",
        variant: "destructive",
      })
      setSelectedFile(null)
      setPreviewData(null)
      setValidationResults(null)
      setSelectedFurnitures([])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFurnitureSelection = (furnitureId: string) => {
    setSelectedFurniture(prev => 
      prev === furnitureId ? null : furnitureId
    );
  };

  const handleImportFromFile = () => {
    if (previewData && selectedFurnitures.length > 0) {
      // Filtrer les données pour ne garder que les meubles sélectionnés
      const filteredData = {
        ...previewData,
        furniture: previewData.furniture.filter(f => 
          selectedFurnitures.includes(f.furniture_id)
        ),
        product_positions: previewData.product_positions.filter(pos =>
          selectedFurnitures.includes(pos.furniture_id)
        )
      }

      onImport(filteredData)
      setIsOpen(false)
      setSelectedFile(null)
      setPreviewData(null)
      setValidationResults(null)
      setSelectedFurnitures([])
      setActiveTab("ai")
    }
  }

  const canImport =
    previewData &&
    validationResults &&
    selectedFurnitures.length > 0 &&
    validationResults.products.some((p) => p.found)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Bot className="h-4 w-4 mr-2" />
          Générer furniture par IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Génération de meuble par IA</DialogTitle>
          <DialogDescription>
            Utilisez l'intelligence artificielle pour générer automatiquement des configurations de meubles ou importez
            un fichier JSON existant
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "ai" | "import")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Génération IA
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="text-center space-y-4">
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <Bot className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Interface de génération IA</h3>
                <p className="text-gray-600 mb-4">
                  Cliquez sur le bouton ci-dessous pour ouvrir l'interface de génération de meubles par intelligence
                  artificielle. L'IA vous aidera à créer des configurations optimales basées sur vos critères.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">• Génération automatique de planogrammes</p>
                  <p className="text-sm text-gray-500">• Optimisation basée sur les données de vente</p>
                  <p className="text-sm text-gray-500">• Suggestions de placement intelligent</p>
                </div>
              </div>

              <Button onClick={openAIInterface} size="lg" className="w-full">
                <ExternalLink className="h-5 w-5 mr-2" />
                Ouvrir l'interface IA
              </Button>

              <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">Note:</span>
                </div>
                <p className="mt-1">
                  L'interface IA s'ouvrira dans une nouvelle fenêtre. Assurez-vous que les popups sont autorisés dans
                  votre navigateur. Une fois la génération terminée, les données seront automatiquement importées dans
                  l'éditeur.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* File selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Fichier JSON</label>
                <div className="flex items-center space-x-2">
                  <Input type="file" accept=".json" onChange={handleFileSelect} className="flex-1" />
                  {selectedFile && (
                    <div className="flex items-center text-sm text-green-600">
                      <FileText className="h-4 w-4 mr-1" />
                      {selectedFile.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">Analyse du fichier...</div>
                </div>
              )}

              {/* Preview and validation */}
              {previewData && validationResults && (
                <div className="space-y-4">
                  {/* Planogram info */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Informations du planogramme</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>ID: {previewData.planogram_info.planogram_id}</div>
                        <div>Nom: {previewData.planogram_info.nom_planogram}</div>
                        <div>Magasin: {previewData.planogram_info.magasin_id}</div>
                        <div>Catégorie: {previewData.planogram_info.categorie_id}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Furniture selection */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Sélection des meubles ({selectedFurnitures.length}/{previewData.furniture.length})</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                      {previewData.furniture.map((furniture, index) => {
  const isValid = validationResults.furniture[index].found;
  return (
    <div 
      key={furniture.furniture_id} 
      className={`flex items-center justify-between p-2 rounded-md cursor-pointer 
        ${selectedFurniture === furniture.furniture_id ? 'bg-primary/10 border border-primary' : 'hover:bg-muted/50'}
        ${!isValid ? 'opacity-50' : ''}
      `}
      onClick={() => isValid && toggleFurnitureSelection(furniture.furniture_id)}
    >
      <div className="flex items-center gap-2">
        <input
          type="radio"
          checked={selectedFurniture === furniture.furniture_id}
          disabled={!isValid}
          onChange={() => isValid && toggleFurnitureSelection(furniture.furniture_id)}
          className="h-4 w-4"
        />
        <span className={!isValid ? 'line-through' : ''}>
          {furniture.furniture_type_name} (ID: {furniture.furniture_id})
        </span>
      </div>
      <div className="flex items-center">
        {isValid ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )}
      </div>
    </div>
  )
})}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Products validation */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Produits ({previewData.product_positions.length})</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {validationResults.products.map((result, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="truncate">{result.id}</span>
                            <div className="flex items-center">
                              {result.found ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className={`ml-1 ${result.found ? "text-green-600" : "text-red-600"}`}>
                                {result.found ? "Trouvé" : "Non trouvé"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {validationResults.products.filter((p) => p.found).length} / {validationResults.products.length}{" "}
                        produits trouvés
                      </div>
                    </CardContent>
                  </Card>

                  {/* Warnings */}
                  {!canImport && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                        <span className="text-sm text-yellow-800">
                          {selectedFurnitures.length === 0 
                            ? "Aucun meuble sélectionné. Veuillez sélectionner au moins un meuble valide."
                            : "Aucun produit compatible trouvé. Vérifiez votre bibliothèque."}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <DialogClose asChild>
            <Button variant="outline">Fermer</Button>
          </DialogClose>
          {activeTab === "import" && (
            <Button onClick={handleImportFromFile} disabled={!canImport || isLoading}>
              Importer les meubles sélectionnés
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Product Item Component (draggable from product list)
const ProductItem = ({ product }: { product: Product }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PRODUCT,
    item: { id: product.primary_id, type: ItemTypes.PRODUCT },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  return (
    <div
      ref={drag}
      className={`
        flex flex-col items-center p-2 border rounded-md cursor-move
        ${isDragging ? "opacity-50" : ""}
        hover:border-primary hover:bg-primary/5 transition-colors
      `}
    >
      <div className="relative w-16 h-16 bg-white rounded-md flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="object-contain w-full h-full p-1"
          />
        ) : (
          <Package className="h-8 w-8 text-muted-foreground/30" />
        )}
      </div>
      <div className="mt-2 text-center" dir={textDirection}>
        <div className="text-xs font-medium truncate w-20">{product.name}</div>
        <div className="text-[10px] text-muted-foreground truncate w-20">{product.primary_id}</div>
      </div>
    </div>
  )
}

// Furniture Cell Component
const FurnitureCell = ({
  cell,
  products,
  onDrop,
  onRemove,
  cellWidth,
  cellHeight,
}: {
  cell: { id: string; x: number; y: number; productId: string | null; quantity?: number }
  products: Product[]
  onDrop: (cellId: string, productId: string) => void
  onRemove: (cellId: string) => void
  cellWidth: number
  cellHeight: number
}) => {
  const product = cell.productId ? products.find((p) => p.primary_id === cell.productId) : null

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.PRODUCT, ItemTypes.FURNITURE_PRODUCT],
    drop: (item: { id: string; type: string }) => {
      onDrop(cell.id, item.id)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FURNITURE_PRODUCT,
    item: {
      id: cell.productId,
      type: ItemTypes.FURNITURE_PRODUCT,
    },
    canDrag: !!cell.productId,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drop}
      className={`
        relative border border-dashed flex items-center justify-center
        ${isOver ? "bg-primary/10 border-primary" : "border-gray-300"}
        ${product ? "border-solid" : ""}
      `}
      style={{
        width: `${cellWidth}px`,
        height: `${cellHeight}px`,
        borderColor: product ? "#22c55e" : undefined,
      }}
    >
      {product && (
        <div
          ref={drag}
          className={`
            absolute inset-1 flex flex-col items-center justify-center bg-white rounded-sm
            ${isDragging ? "opacity-50" : ""}
            cursor-move
          `}
        >
          <div className="relative flex-1 w-full flex items-center justify-center p-1">
            {product.image ? (
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="object-contain max-h-full max-w-full"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center bg-muted/20 rounded-sm"
                style={{ backgroundColor: product.color || "#f3f4f6" }}
              >
                <span className="text-xs text-center px-1">{product.name}</span>
              </div>
            )}
            {cell.quantity && cell.quantity > 1 && (
              <div className="absolute bottom-0 right-0 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cell.quantity}
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 flex">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 bg-white rounded-full shadow-sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(cell.id)
              }}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Furniture Settings Dialog Component
const FurnitureSettingsDialog = ({ furniture, updateFurniture }) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const [localFurniture, setLocalFurniture] = useState<FurnitureItem>({ ...furniture })

  const handleChange = (key: keyof FurnitureItem, value: any) => {
    setLocalFurniture((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    updateFurniture(localFurniture)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          {t("productImport.settings")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("furnitureEditor.settings")}</DialogTitle>
          <DialogDescription>{t("furnitureEditor.configuration")}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">{t("general")}</TabsTrigger>
            <TabsTrigger value="appearance">{t("furnitureEditor.apparence")}</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">{t("productImport.floorPlan.nomMeuble")}</label>
              <Input
                value={localFurniture.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("furnitureEditor.sections")}</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleChange("sections", Math.max(1, localFurniture.sections - 1))}
                    disabled={localFurniture.sections <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={localFurniture.sections}
                    onChange={(e) => handleChange("sections", Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleChange("sections", localFurniture.sections + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("furnitureEditor.emplacement")}</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleChange("slots", Math.max(1, localFurniture.slots - 1))}
                    disabled={localFurniture.slots <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={localFurniture.slots}
                    onChange={(e) => handleChange("slots", Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="text-center"
                  />
                  <Button variant="outline" size="icon" onClick={() => handleChange("slots", localFurniture.slots + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("productImport.width")} (m)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={localFurniture.width}
                  onChange={(e) => handleChange("width", Number.parseFloat(e.target.value))}
                  className="text-center"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("productImport.height")} (m)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={localFurniture.height}
                  onChange={(e) => handleChange("height", Number.parseFloat(e.target.value))}
                  className="text-center"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("productImport.depth")} (m)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={localFurniture.depth}
                  onChange={(e) => handleChange("depth", Number.parseFloat(e.target.value))}
                  className="text-center"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("furnitureEditor.couleur")}</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={localFurniture.color || "#333333"}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={localFurniture.color || "#333333"}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("cancel")}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleSave}>{t("appliquer")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Save Furniture Dialog Component
const SaveFurnitureDialog = ({ furniture, products, cells, onSave }) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const [name, setName] = useState(furniture.name)
  const [description, setDescription] = useState("")
  const { toast } = useToast()
  const { addFurniture } = useFurnitureStore()

  // États pour tous les champs requis
  const [magasins, setMagasins] = useState<Magasin[]>([])
  const [selectedMagasinId, setSelectedMagasinId] = useState<string>("")
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZoneId, setSelectedZoneId] = useState<string>("")
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [furnitureTypes, setFurnitureTypes] = useState<FurnitureType[]>([])
  const [selectedFurnitureTypeId, setSelectedFurnitureTypeId] = useState<string>("")
  const [selectedPlanogramStatus, setSelectedPlanogramStatus] = useState<string>("brouillon")
  const [selectedTaskType, setSelectedTaskType] = useState<string>("mise_en_place")

  // Définition des interfaces manquantes
  interface Zone {
    zone_id: string
    nom_zone: string
  }

  interface User {
    id: number
    idUtilisateur: number
    username: string
    email: string
    role: string
  }

  // États de chargement
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingZones, setIsLoadingZones] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingFurnitureTypes, setIsLoadingFurnitureTypes] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const taskTypes = [
    { value: "mise_en_place", label: "Mise en place" },
    { value: "controle", label: "Contrôle" },
    { value: "audit", label: "Audit" },
    { value: "reapprovisionnement", label: "Réapprovisionnement" },
    { value: "nettoyage", label: "Nettoyage" },
    { value: "formation", label: "Formation" },
    { value: "promotion", label: "Promotion" },
    { value: "maintenance", label: "Maintenance" },
    { value: "remplacement_produit", label: "Remplacement produit" },
    { value: "inspection", label: "Inspection" },
    { value: "autre", label: "Autre" },
  ]

  const planogramStatusOptions = [
    { value: "brouillon", label: "Brouillon" },
    { value: "actif", label: "Actif" },
    { value: "inactif", label: "Inactif" },
    { value: "en cours", label: "En cours" },
  ]

  // R��cupérer l'utilisateur connecté
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/auth/me", {
          credentials: "include",
        })
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        const responseData = await response.json()
        const userData = responseData.user || responseData
        setCurrentUser(userData)
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error)
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les informations de l'utilisateur",
          variant: "destructive",
        })
      }
    }

    fetchCurrentUser()
  }, [toast])

  // Charger les magasins
  useEffect(() => {
    const fetchMagasins = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("http://localhost:8081/api/magasins/getAllMagasins")
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        const data = await response.json()
        setMagasins(data)
        if (data.length > 0) {
          setSelectedMagasinId(data[0].magasin_id)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des magasins:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des magasins",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMagasins()
  }, [toast])

  // Charger les zones selon le magasin
  useEffect(() => {
    if (selectedMagasinId) {
      const fetchZones = async () => {
        setIsLoadingZones(true)
        try {
          const response = await fetch(`http://localhost:8081/api/zones/getZonesMagasin/${selectedMagasinId}`)
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`)
          }
          const data = await response.json()
          setZones(data)
          setSelectedZoneId("")
        } catch (error) {
          console.error("Erreur lors du chargement des zones:", error)
          toast({
            title: "Erreur",
            description: "Impossible de charger la liste des zones pour ce magasin",
            variant: "destructive",
          })
        } finally {
          setIsLoadingZones(false)
        }
      }

      fetchZones()
    } else {
      setZones([])
      setSelectedZoneId("")
    }
  }, [selectedMagasinId, toast])

  // Charger les utilisateurs selon le magasin
  useEffect(() => {
    if (selectedMagasinId) {
      const fetchUsers = async () => {
        setIsLoadingUsers(true)
        try {
          const response = await fetch(`http://localhost:8081/api/auth1/users/store/${selectedMagasinId}`)
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`)
          }
          const data = await response.json()
          setUsers(data)
          setSelectedUserId(null)
        } catch (error) {
          console.error("Erreur lors du chargement des utilisateurs:", error)
          toast({
            title: "Erreur",
            description: "Impossible de charger la liste des utilisateurs pour ce magasin",
            variant: "destructive",
          })
        } finally {
          setIsLoadingUsers(false)
        }
      }

      fetchUsers()
    } else {
      setUsers([])
      setSelectedUserId(null)
    }
  }, [selectedMagasinId, toast])

  // Charger les types de meubles
  useEffect(() => {
    const fetchFurnitureTypes = async () => {
      setIsLoadingFurnitureTypes(true)
      try {
        const response = await fetch("http://localhost:8081/api/furnitureType/getAllFurnitureTypes")
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        const data = await response.json()
        setFurnitureTypes(data)
        if (data.length > 0) {
          setSelectedFurnitureTypeId(data[0].furniture_type_id)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des types de meubles:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des types de meubles",
          variant: "destructive",
        })
      } finally {
        setIsLoadingFurnitureTypes(false)
      }
    }

    fetchFurnitureTypes()
  }, [toast])

  const placedProductsCount = cells.filter((cell) => cell.productId !== null).length

  const handleSave = async () => {
    console.log("=== DEBUT handleSave ===")
    console.log("selectedMagasinId:", selectedMagasinId)
    console.log("selectedZoneId:", selectedZoneId)
    console.log("name:", name)
    console.log("currentUser:", currentUser)
    console.log(
      "cells with products:",
      cells.filter((cell) => cell.productId !== null),
    )
    console.log("placedProductsCount:", placedProductsCount)

    // Validation des champs obligatoires
    if (!selectedMagasinId || !selectedZoneId || !name || !currentUser) {
      console.log("❌ Validation échouée - champs manquants:")
      console.log("- selectedMagasinId:", !!selectedMagasinId)
      console.log("- selectedZoneId:", !!selectedZoneId)
      console.log("- name:", !!name)
      console.log("- currentUser:", !!currentUser)
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    console.log("✅ Validation des champs obligatoires réussie")

    setIsLoading(true)

    try {
      // Construire les positions de produits
      const productPositions = cells
        .filter((cell) => cell.productId !== null)
        .map((cell) => {
          const product = products.find((p) => p.primary_id === cell.productId)
          console.log("Processing cell:", cell, "found product:", product)

          if (!product) return null

          let face = "front"
          if (furniture.type === "gondola") {
            face = cell.x < furniture.slots / 2 ? "front" : "back"
          } else if (furniture.type === "shelves-display") {
            const quarterWidth = furniture.slots / 4
            if (cell.x < quarterWidth) {
              face = "left"
            } else if (cell.x < quarterWidth * 2) {
              face = "front"
            } else if (cell.x < quarterWidth * 3) {
              face = "back"
            } else {
              face = "right"
            }
          }

          return {
            product_id: product.primary_id,
            face: face,
            etagere: cell.y + 1,
            colonne: cell.x + 1,
            quantite: cell.quantity || 1,
          }
        })
        .filter(Boolean)

      console.log("productPositions construites:", productPositions)

      // Ajouter cette validation avant la construction de requestBody :
      if (productPositions.length === 0) {
        console.log("❌ Aucun produit placé")
        toast({
          title: "Attention",
          description: "Veuillez placer au moins un produit avant de sauvegarder le meuble",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      console.log("✅ Produits trouvés, construction de la requête...")

      // Construire l'objet furniture
      const furnitureData = {
        furniture_type_id: Number.parseInt(selectedFurnitureTypeId),
        largeur: furniture.width,
        hauteur: furniture.height,
        profondeur: furniture.depth,
        // Tous les meubles dans furniture-editor sont à une seule face
        nb_colonnes_unique_face: furniture.slots,
        nb_etageres_unique_face: furniture.sections,
        productPositions: productPositions,
      }

      console.log("furnitureData construite:", furnitureData)

      // Construire la requête complète
      const requestBody = {
        magasin_id: selectedMagasinId,
        zone_id: selectedZoneId,
        nom: name,
        description: description || `Meuble créé le ${new Date().toLocaleDateString()}`,
        created_by: currentUser.id || currentUser.idUtilisateur,
        statut: selectedPlanogramStatus,
        furnitures: [furnitureData],
        tache: selectedUserId
          ? {
              idUser: selectedUserId,
              statut: "à faire",
              date_debut: new Date().toISOString(),
              date_fin_prevue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              type: selectedTaskType,
              commentaire: `Tâche liée au meuble ${name}`,
            }
          : null,
      }

      console.log("RequestBody à envoyer:", JSON.stringify(requestBody, null, 2))

      const response = await fetch("http://localhost:8081/api/planogram/createFullPlanogram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || "Erreur inconnue")
      }

      toast({
        title: "Succès",
        description: `Meuble créé avec succès (ID: ${data.planogram_id})`,
        variant: "default",
      })

      if (onSave) onSave(data.planogram_id)
    } catch (error) {
      console.error("Erreur lors de la création du meuble:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création du meuble",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          {t("save")}
        </Button>
      </DialogTrigger>
      <DialogContent className={`sm:max-w-[500px] max-h-[90vh] overflow-hidden ${isRTL ? "text-right rtl" : ""}`}>
        <DialogHeader>
          <DialogTitle>Save furniture</DialogTitle>
          <DialogDescription>Save this furniture to your library to reuse it in your layouts.</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-150px)] pr-2">
          <div className="space-y-4 mt-4">
            {/* Nom du meuble */}
            <div>
              <label className="text-sm font-medium">name of the furniture</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                placeholder="Enter furniture name"
                dir={textDirection}
              />
            </div>
            {/* Description */}
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                placeholder="Enter description"
                dir={textDirection}
              />
            </div>
            {/* Magasin */}
            <div>
              <label className="text-sm font-medium">Magasin</label>
              <Select
                value={selectedMagasinId}
                onValueChange={setSelectedMagasinId}
                disabled={isLoading || magasins.length === 0}
              >
                <SelectTrigger className="mt-1" dir={textDirection}>
                  <SelectValue placeholder="Sélectionner un magasin" />
                </SelectTrigger>
                <SelectContent>
                  {magasins.map((magasin) => (
                    <SelectItem key={magasin.magasin_id} value={magasin.magasin_id}>
                      {magasin.magasin_id} - {magasin.nom_magasin}
                    </SelectItem>
                  ))}
                  {magasins.length === 0 && !isLoading && (
                    <SelectItem value="no-stores" disabled>
                      Aucun magasin disponible
                    </SelectItem>
                  )}
                  {isLoading && (
                    <SelectItem value="loading" disabled>
                      Chargement...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {/* Zone */}
            <div>
              <label className="text-sm font-medium">Zone</label>
              <Select
                value={selectedZoneId}
                onValueChange={setSelectedZoneId}
                disabled={isLoadingZones || !selectedMagasinId || zones.length === 0}
              >
                <SelectTrigger className="mt-1" dir={textDirection}>
                  <SelectValue
                    placeholder={selectedMagasinId ? "Sélectionner une zone" : "Sélectionnez d'abord un magasin"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.zone_id} value={zone.zone_id}>
                      {zone.nom_zone}
                    </SelectItem>
                  ))}
                  {zones.length === 0 && !isLoadingZones && selectedMagasinId && (
                    <SelectItem value="no-zones" disabled>
                      Aucune zone disponible pour ce magasin
                    </SelectItem>
                  )}
                  {isLoadingZones && (
                    <SelectItem value="loading-zones" disabled>
                      Chargement des zones...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {/* Utilisateur */}
            <div>
              <label className="text-sm font-medium">Utilisateur</label>
              <Select
                value={selectedUserId?.toString() || ""}
                onValueChange={(value) => setSelectedUserId(value ? Number.parseInt(value) : null)}
                disabled={isLoadingUsers || !selectedMagasinId || users.length === 0}
              >
                <SelectTrigger className="mt-1" dir={textDirection}>
                  <SelectValue
                    placeholder={selectedMagasinId ? "Sélectionner un utilisateur" : "Sélectionnez d'abord un magasin"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username} ({user.email}) - {user.role}
                    </SelectItem>
                  ))}
                  {users.length === 0 && !isLoadingUsers && selectedMagasinId && (
                    <SelectItem value="no-users" disabled>
                      Aucun utilisateur disponible pour ce magasin
                    </SelectItem>
                  )}
                  {isLoadingUsers && (
                    <SelectItem value="loading-users" disabled>
                      Chargement des utilisateurs...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {/* Type de meuble */}
            <div>
              <label className="text-sm font-medium">Type de meuble</label>
              <Select
                value={selectedFurnitureTypeId}
                onValueChange={setSelectedFurnitureTypeId}
                disabled={isLoadingFurnitureTypes || furnitureTypes.length === 0}
              >
                <SelectTrigger className="mt-1" dir={textDirection}>
                  <SelectValue placeholder="Sélectionner un type de meuble" />
                </SelectTrigger>
                <SelectContent>
                  {furnitureTypes.map((type) => (
                    <SelectItem key={type.furniture_type_id} value={type.furniture_type_id}>
                      {type.nomType} - Nb_Faces : {type.nombreFaces}
                    </SelectItem>
                  ))}
                  {furnitureTypes.length === 0 && !isLoadingFurnitureTypes && (
                    <SelectItem value="no-types" disabled>
                      Aucun type de meuble disponible
                    </SelectItem>
                  )}
                  {isLoadingFurnitureTypes && (
                    <SelectItem value="loading-types" disabled>
                      Chargement des types...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {/* Sélection du statut du planogramme */}
            <div>
              <label className="text-sm font-medium">Statut du planogramme</label>
              <Select value={selectedPlanogramStatus} onValueChange={setSelectedPlanogramStatus}>
                <SelectTrigger className="mt-1" dir={textDirection}>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {planogramStatusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Sélection du type de tâche */}
            <div>
              <label className="text-sm font-medium">Type de tâche</label>
              <Select value={selectedTaskType} onValueChange={setSelectedTaskType}>
                <SelectTrigger className="mt-1" dir={textDirection}>
                  <SelectValue placeholder="Sélectionner un type de tâche" />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Preview détaillé */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Preview</label>
              <Card className="p-4 bg-muted/20">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-muted/30 rounded-md flex items-center justify-center flex-shrink-0">
                    {getFurnitureIcon(furniture.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    {/* Nom du meuble (dynamique) */}
                    <div className="text-sm font-medium" dir={textDirection}>
                      {name || "Meuble sans nom"}
                    </div>
                    {/* Informations de base */}
                    <div className="text-sm text-muted-foreground" dir={textDirection}>
                      <div>
                        ({furniture.sections}) rows, ({furniture.slots}) columns
                      </div>
                      <div>({placedProductsCount}) products placed</div>
                      <div>savePlanogramDialog.multipleQuantityProducts</div>
                      {selectedMagasinId && (
                        <div>
                          Magasin: {magasins.find((m) => m.magasin_id === selectedMagasinId)?.nom_magasin || ""}
                        </div>
                      )}
                    </div>
                    {/* Type de meuble avec détails */}
                    {selectedFurnitureTypeId && (
                      <div className="text-xs text-blue-600">
                        <div>
                          Type de meuble:{" "}
                          {furnitureTypes.find((ft) => ft.furniture_type_id === selectedFurnitureTypeId)?.nomType || ""}{" "}
                          | Nombre des faces:{" "}
                          {furnitureTypes.find((ft) => ft.furniture_type_id === selectedFurnitureTypeId)?.nombreFaces ||
                            ""}
                        </div>
                        {furniture.type === "gondola" && (
                          <>
                            <div className="text-green-600">
                              Gondola - Avant: {Math.floor(furniture.slots / 2)} col × {furniture.sections} étag
                            </div>
                            <div className="text-green-600">
                              Gondola - Arrière: {Math.floor(furniture.slots / 2)} col × {furniture.sections} étag
                            </div>
                          </>
                        )}
                        {furniture.type === "shelves-display" && (
                          <>
                            <div className="text-purple-600">
                              Avant/Arrière: {Math.floor(furniture.slots / 2)} col × {furniture.sections} étag
                            </div>
                            <div className="text-purple-600">Gauche/Droite: 1 col × {furniture.sections} étag</div>
                          </>
                        )}
                      </div>
                    )}
                    {/* Dimensions du meuble */}
                    <div className="text-xs text-gray-600 p-2 bg-gray-100 rounded">
                      <div className="font-semibold mb-1">Dimensions du meuble :</div>
                      <div className="grid grid-cols-2 gap-2">
                        <span>Largeur: {furniture.width}m</span>
                        <span>Hauteur: {furniture.height}m</span>
                        <span>Profondeur: {furniture.depth}m</span>
                        <span>Base: 0.3m</span>
                        <span>Épaisseur étagère: 0.05m</span>
                      </div>
                    </div>
                    {/* Produits placés - Format détaillé comme save-planogram-dialog */}
                    {placedProductsCount > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                        <h5 className="text-xs font-semibold text-gray-700 mb-2">Produits placés :</h5>
                        <div className="space-y-1">
                          {cells
                            .filter((cell) => cell.productId !== null)
                            .map((cell, index) => {
                              const product = products.find((p) => p.primary_id === cell.productId)
                              if (!product) return null

                              let face = "front"
                              if (furniture.type === "gondola") {
                                face = cell.x < furniture.slots / 2 ? "front" : "back"
                              } else if (furniture.type === "shelves-display") {
                                const quarterWidth = furniture.slots / 4
                                if (cell.x < quarterWidth) {
                                  face = "left"
                                } else if (cell.x < quarterWidth * 2) {
                                  face = "front"
                                } else if (cell.x < quarterWidth * 3) {
                                  face = "back"
                                } else {
                                  face = "right"
                                }
                              }

                              return (
                                <div key={index} className="text-xs text-gray-600 border-b border-gray-200 pb-1">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <span className="font-medium text-gray-800">{product.name}</span>
                                      <span className="text-gray-500 ml-1">({product.primary_id})</span>
                                    </div>
                                    <div className="text-right text-xs">
                                      <div>Qty: {cell.quantity || 1}</div>
                                    </div>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Étagère: {cell.y + 1}</span>
                                    <span>Colonne: {cell.x + 1}</span>
                                    <span>Face: {face}</span>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
        <DialogFooter className={isRTL ? "justify-start" : "justify-end"}>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={() => {
              console.log("🔘 Bouton Save cliqué!")
              console.log(
                "Button disabled?",
                !selectedMagasinId || !selectedZoneId || !selectedFurnitureTypeId || isLoading,
              )
              console.log("selectedMagasinId:", selectedMagasinId)
              console.log("selectedZoneId:", selectedZoneId)
              console.log("selectedFurnitureTypeId:", selectedFurnitureTypeId)
              console.log("isLoading:", isLoading)
              handleSave()
            }}
            disabled={!selectedMagasinId || !selectedZoneId || !selectedFurnitureTypeId || isLoading}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to get furniture icon
const getFurnitureIcon = (type: FurnitureType) => {
  switch (type) {
    case "clothing-rack":
      return <Package className="h-8 w-8 text-muted-foreground" />
    case "wall-display":
      return <Grid className="h-8 w-8 text-muted-foreground" />
    case "accessory-display":
      return <Package className="h-8 w-8 text-muted-foreground" />
    case "modular-cube":
      return <Cube className="h-8 w-8 text-muted-foreground" />
    case "gondola":
      return <Grid className="h-8 w-8 text-muted-foreground" />
    case "table":
      return <Package className="h-8 w-8 text-muted-foreground" />
    case "refrigerator":
      return <Snowflake className="h-8 w-8 text-muted-foreground" />
    case "refrigerated-showcase":
      return <Snowflake className="h-8 w-8 text-muted-foreground" />
    default:
      return <Package className="h-8 w-8 text-muted-foreground" />
  }
}

// Main Furniture Editor Component
export function FurnitureEditor() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const { toast } = useToast()
  const { products } = useProductStore()

  const [currentFurniture, setCurrentFurniture] = useState<FurnitureItem>({
    id: `furniture-${Date.now()}`,
    type: "wall-display",
    name: "",
    sections: 3,
    slots: 6,
    width: 3,
    height: 2,
    depth: 0.5,
    color: "#f0f0f0",
    x: 0,
    y: 0,
    z: 0,
    rotation: 0,
  })

  // Cells for 2D view
  const [cells, setCells] = useState<
    { id: string; x: number; y: number; productId: string | null; quantity?: number }[]
  >([])
  const [viewMode, setViewMode] = useState<"2D" | "3D">("2D")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)
  const [productsForDisplay, setProductsForDisplay] = useState([])

  // Calculate cell dimensions for 2D view
  const cellWidth = 100
  const cellHeight = 80

  // Get unique suppliers
  const suppliers = [...new Set(products.map((product) => product.supplier))].filter(Boolean).sort()
  const categories = [...new Set(products.map((product) => product.category_id))].filter(Boolean).sort()

  // Filter products
  const filteredProducts = products.filter((product) => {
    const primaryId = product.primary_id ? product.primary_id.toLowerCase() : ""
    const supplier = product.supplier ? product.supplier.toLowerCase() : ""
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      primaryId.includes(searchTerm.toLowerCase()) ||
      supplier.includes(searchTerm.toLowerCase())

    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    const matchesSupplier = !selectedSupplier || product.supplier === selectedSupplier

    return matchesSearch && matchesCategory && matchesSupplier
  })

  // Fonction d'importation de planogramme
  const [generatedFurnitures, setGeneratedFurnitures] = useState<FurnitureItem[]>([]);

  const handleImportPlanogram = (importedData: ImportedPlanogram) => {
    try {
      console.log("Importation des données:", importedData);
  
      if (!importedData.furniture || importedData.furniture.length === 0) {
        toast({
          title: "Erreur",
          description: "Aucun meuble trouvé dans le fichier",
          variant: "destructive",
        });
        return;
      }
  
      // Créer tous les meubles importés
      const importedFurnitures = importedData.furniture.map(furniture => {
        const mappedType = FURNITURE_TYPE_MAPPING[furniture.furniture_type_name];
        
        if (!mappedType) {
          toast({
            title: "Attention",
            description: `Type de meuble "${furniture.furniture_type_name}" non supporté, utilisation du type par défaut`,
            variant: "destructive",
          });
        }
  
        // Filtrer les positions de produits pour ce meuble
        const furnitureProductPositions = importedData.product_positions
          .filter(pos => pos.furniture_id === furniture.furniture_id)
          .map(pos => ({
            ...pos,
            // Convertir les coordonnées selon le type de meuble
            x: getXPosition(pos, furniture),
            y: getYPosition(pos, furniture)
          }));
  
        return {
          id: `imported-${furniture.furniture_id}`,
          type: mappedType || "wall-display",
          name: `${importedData.planogram_info.nom_planogram} - ${furniture.furniture_type_name}`,
          sections: furniture.nb_etageres_unique_face,
          slots: furniture.nb_colonnes_unique_face,
          width: furniture.largeur / 100, // Convertir cm en m
          height: furniture.hauteur / 100,
          depth: furniture.profondeur / 100,
          color: "#f0f0f0",
          x: 0,
          y: 0,
          z: 0,
          rotation: 0,
          importedId: furniture.furniture_id,
          productPositions: furnitureProductPositions
        };
      });
  
      setGeneratedFurnitures(importedFurnitures);
  
      // Afficher le premier meuble par défaut
      if (importedFurnitures.length > 0) {
        displayFurniture(importedFurnitures[0]);
      }
  
      toast({
        title: "Importation réussie",
        description: `${importedFurnitures.length} meuble(s) importé(s) avec succès.`,
        variant: "default",
      });
  
    } catch (error) {
      console.error("Erreur lors de l'importation:", error);
      toast({
        title: "Erreur d'importation",
        description: "Une erreur est survenue lors de l'importation du planogramme",
        variant: "destructive",
      });
    }
  };
  
  // Helper functions pour convertir les positions
  const getXPosition = (position: ProductPosition, furniture: ImportedFurniture) => {
    if (position.face === "front") return position.colonne - 1;
    if (position.face === "back") return furniture.nb_colonnes_unique_face / 2 + position.colonne - 1;
    if (position.face === "left") return 0;
    if (position.face === "right") return furniture.nb_colonnes_unique_face - 1;
    return position.colonne - 1;
  };
  
  const getYPosition = (position: ProductPosition) => {
    return position.etagere - 1;
  };
  
  // Nouvelle fonction pour afficher un meuble spécifique
  const displayFurniture = (furniture: FurnitureItem) => {
    // Mettre à jour le meuble courant et le marquer comme généré
    setCurrentFurniture(furniture);
    if (!generatedFurnitureIds.includes(furniture.id)) {
      setGeneratedFurnitureIds([...generatedFurnitureIds, furniture.id]);
    }
  
    // Créer les cellules vides avec une meilleure gestion des IDs
    const newCells = Array.from({ length: furniture.sections * furniture.slots }, (_, index) => {
      const section = Math.floor(index / furniture.slots);
      const slot = index % furniture.slots;
      return {
        id: `cell-${furniture.id}-${section}-${slot}`, // ID unique incluant l'ID du meuble
        x: slot,
        y: section,
        productId: null,
        quantity: 1,
      };
    });
  
    // Placer les produits correspondants avec gestion améliorée des positions
    let placedProductsCount = 0;
    let skippedProductsCount = 0;
    const missingProducts: string[] = [];
  
    if (furniture.productPositions && furniture.productPositions.length > 0) {
      furniture.productPositions.forEach(position => {
        const product = products.find(p => p.primary_id === position.produit_id);
        
        if (product) {
          // Convertir les coordonnées selon le type de meuble
          let targetX = position.colonne - 1;
          let targetY = position.etagere - 1;
  
          // Ajustement spécial pour les meubles avec faces multiples
          if (furniture.type === 'gondola' && position.face === 'back') {
            targetX += Math.floor(furniture.slots / 2);
          }
  
          if (targetX >= 0 && targetX < furniture.slots && targetY >= 0 && targetY < furniture.sections) {
            const cellIndex = newCells.findIndex(cell => cell.x === targetX && cell.y === targetY);
            
            if (cellIndex !== -1) {
              newCells[cellIndex] = {
                ...newCells[cellIndex],
                productId: position.produit_id,
                quantity: position.quantite || 1,
                // Ajout des informations de face pour le debug
                face: position.face || 'front',
                originalPosition: `${position.face}-${position.etagere}-${position.colonne}`
              };
              placedProductsCount++;
            } else {
              skippedProductsCount++;
              console.warn(`Position invalide pour ${product.name}: x=${targetX}, y=${targetY}`);
            }
          } else {
            skippedProductsCount++;
            console.warn(`Position hors limites pour ${product.name}: x=${targetX}, y=${targetY}`);
          }
        } else {
          skippedProductsCount++;
          missingProducts.push(position.produit_id);
        }
      });
    }
  
    setCells(newCells);
  
    // Mettre à jour l'affichage 3D avec vérification des produits
    const updatedProductsForDisplay = newCells
      .filter(cell => {
        if (cell.productId) {
          const productExists = products.some(p => p.primary_id === cell.productId);
          if (!productExists) {
            console.warn(`Produit non trouvé: ${cell.productId} dans la cellule ${cell.id}`);
            return false;
          }
          return true;
        }
        return false;
      })
      .map(cell => ({
        id: `product-${cell.id}`,
        productId: cell.productId!,
        section: cell.y,
        position: cell.x,
        furnitureId: furniture.id,
        quantity: cell.quantity || 1,
        // Ajout des métadonnées pour le debug
        debugInfo: {
          face: cell.face,
          originalPosition: cell.originalPosition
        }
      }));
  
    setProductsForDisplay(updatedProductsForDisplay);
  
    // Notification avec plus de détails
    const toastMessage = [
      `Le meuble "${furniture.name}" a été chargé avec ${placedProductsCount} produits.`,
      skippedProductsCount > 0 && `${skippedProductsCount} positions ignorées.`,
      missingProducts.length > 0 && `${missingProducts.length} produits non trouvés dans la bibliothèque.`
    ].filter(Boolean).join(' ');
  
    toast({
      title: "Meuble chargé",
      description: toastMessage,
      variant: skippedProductsCount > 0 || missingProducts.length > 0 ? "destructive" : "default",
    });
  
    // Journalisation détaillée
    console.groupCollapsed(`=== CHARGEMENT MEUBLE ${furniture.name} ===`);
    console.log('Type:', furniture.type);
    console.log('Dimensions:', `${furniture.sections} sections × ${furniture.slots} emplacements`);
    console.log('Produits placés:', placedProductsCount);
    
    if (skippedProductsCount > 0) {
      console.warn('Positions ignorées:', skippedProductsCount);
    }
    
    if (missingProducts.length > 0) {
      console.warn('Produits manquants:', missingProducts);
    }
    
    console.log('Cellules:', newCells);
    console.log('Produits pour affichage 3D:', updatedProductsForDisplay);
    console.groupEnd();
  
    // Retourner les stats pour un éventuel suivi
    return {
      success: placedProductsCount > 0,
      placedProductsCount,
      skippedProductsCount,
      missingProducts
    };
  };
  
  // Ajouter dans le composant principal pour permettre la sélection des meubles
  {generatedFurnitures.length > 1 && (
    <div className="mb-4">
      <Label>Sélection du meuble à afficher</Label>
      <Select
        value={currentFurniture.id}
        onValueChange={(id) => {
          const selected = generatedFurnitures.find(f => f.id === id);
          if (selected) displayFurniture(selected);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionner un meuble" />
        </SelectTrigger>
        <SelectContent>
          {generatedFurnitures.map(furniture => (
            <SelectItem key={furniture.id} value={furniture.id}>
              {furniture.name} ({furniture.type})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )}

  // Fonction pour forcer la synchronisation des vues après importation
  const forceSynchronization = () => {
    const updatedProductsForDisplay = cells
      .filter((cell) => cell.productId !== null)
      .map((cell) => ({
        id: `product-${cell.id}`,
        productId: cell.productId,
        section: cell.y,
        position: cell.x,
        furnitureId: currentFurniture.id,
        quantity: cell.quantity || 1,
      }))

    setProductsForDisplay(updatedProductsForDisplay)
    console.log("Synchronisation forcée - Produits affichés:", updatedProductsForDisplay)
  }

  useEffect(() => {
    setCurrentFurniture((prev) => ({
      ...prev,
      name: t(`furnitureEditor.${prev.name}`),
    }))
  }, [t, i18n.language, currentFurniture.type])

  // Update furniture name when language changes
  useEffect(() => {
    if (currentFurniture.type) {
      const translatedName = t(`furnitureEditor.${currentFurniture.type.replace("-", "_")}`)
      if (translatedName !== currentFurniture.name) {
        setCurrentFurniture((prev) => ({
          ...prev,
          name: translatedName,
        }))
      }
    }
  }, [t, i18n.language, currentFurniture.type, currentFurniture.name])

  // Initialize cells when furniture changes
  useEffect(() => {
    const newCells = []
    for (let section = 0; section < currentFurniture.sections; section++) {
      for (let slot = 0; slot < currentFurniture.slots; slot++) {
        newCells.push({
          id: `cell-${section}-${slot}`,
          x: slot,
          y: section,
          productId: null,
        })
      }
    }
    setCells(newCells)
  }, [currentFurniture.sections, currentFurniture.slots])

  // Handle drop function
  const handleDrop = (cellId: string, productId: string) => {
    const targetCell = cells.find((cell) => cell.id === cellId)
    if (!targetCell) return

    const sameProductInSection = cells.find(
      (cell) => cell.productId === productId && cell.y === targetCell.y && cell.id !== cellId,
    )

    if (sameProductInSection) {
      const existingQuantity = sameProductInSection.quantity || 1
      setCells((prev) =>
        prev.map((cell) => {
          if (cell.id === sameProductInSection.id) {
            return { ...cell, quantity: existingQuantity + 1 }
          } else if (cell.id === cellId) {
            return { ...cell, productId: null }
          }
          return cell
        }),
      )

      toast({
        title: "Quantité mise à jour",
        description: `La quantité du produit a été augmentée à ${existingQuantity + 1}.`,
      })
    } else {
      setCells((prev) => prev.map((cell) => (cell.id === cellId ? { ...cell, productId, quantity: 1 } : cell)))

      setTimeout(() => {
        const updatedProductsForDisplay = cells
          .filter((cell) => cell.productId !== null)
          .map((cell) => {
            return {
              id: `product-${cell.id}`,
              productId: cell.productId,
              section: cell.y,
              position: cell.x,
              furnitureId: currentFurniture.id,
              quantity: cell.quantity || 1,
            }
          })
      }, 100)
    }
  }

  // Handle remove product from cell
  const handleRemoveProduct = (cellId: string) => {
    setCells((prev) => prev.map((cell) => (cell.id === cellId ? { ...cell, productId: null } : cell)))
  }

  // Update furniture settings
  const updateFurniture = (updatedFurniture: FurnitureItem) => {
    setCurrentFurniture(updatedFurniture)
    toast({
      title: "Paramètres mis à jour",
      description: "Les paramètres du meuble ont été mis à jour.",
    })
  }

  const checkAndFixProductQuantities = () => {
    console.log("Checking and fixing product quantities...")
  }

  const synchronizeProductQuantities = () => {
    console.log("Synchronizing product quantities...")
  }

  const debugImageLoading = (productId: string) => {
    console.log(`Debugging image loading for product ID: ${productId}`)
  }

  // Save furniture to library
  const { addFurniture } = useFurnitureStore()

  const saveFurnitureToLibrary = (name: string, description: string) => {
    const furnitureProducts: FurnitureProduct[] = cells
      .filter((cell) => cell.productId !== null)
      .map((cell) => ({
        productId: cell.productId!,
        section: cell.y,
        position: cell.x,
      }))

    const furnitureToSave: FurnitureItem = {
      ...currentFurniture,
      id: `furniture-${Date.now()}`,
      name,
    }

    addFurniture(furnitureToSave, furnitureProducts, description)

    toast({
      title: "Meuble enregistré",
      description: `Le meuble "${name}" a été enregistré dans votre bibliothèque.`,
    })
  }

  const changeFurnitureType = (type: FurnitureType) => {
    const defaults = {
      "clothing-rack": {
        name: t("furnitureEditor.clothing_rack"),
        sections: 2,
        slots: 5,
        width: 2,
        height: 1.8,
        depth: 0.6,
        color: "#666666",
      },
      "wall-display": {
        name: t("furnitureEditor.wall_display"),
        sections: 3,
        slots: 6,
        width: 3,
        height: 2,
        depth: 0.5,
        color: "#f0f0f0",
      },
      "accessory-display": {
        name: t("furnitureEditor.accessory_display"),
        sections: 3,
        slots: 4,
        width: 1,
        height: 1.5,
        depth: 0.5,
        color: "#666666",
      },
      "modular-cube": {
        name: t("furnitureEditor.modular_cube"),
        sections: 3,
        slots: 9,
        width: 1.5,
        height: 1.5,
        depth: 0.5,
        color: "#8B4513",
      },
      gondola: {
        name: t("furnitureEditor.gondola"),
        sections: 3,
        slots: 6,
        width: 2,
        height: 1.5,
        depth: 0.8,
        color: "#e0e0e0",
      },
      table: {
        name: t("furnitureEditor.table"),
        sections: 1,
        slots: 9,
        width: 1.5,
        height: 0.8,
        depth: 0.8,
        color: "#8B4513",
      },
      refrigerator: {
        name: t("furnitureEditor.refrigerator"),
        sections: 3,
        slots: 6,
        width: 1.5,
        height: 2,
        depth: 0.8,
        color: "#333333",
      },
      "refrigerated-showcase": {
        name: t("furnitureEditor.refrigerated_showcase"),
        sections: 2,
        slots: 6,
        width: 2.5,
        height: 1.2,
        depth: 0.8,
        color: "#444444",
      },
      "clothing-display": {
        name: t("furnitureEditor.clothing_display"),
        sections: 2,
        slots: 8,
        width: 2.5,
        height: 1.8,
        depth: 0.6,
        color: "#f5f5f5",
      },
      "clothing-wall": {
        name: t("furnitureEditor.clothing_wall"),
        sections: 4,
        slots: 6,
        width: 4,
        height: 2.2,
        depth: 0.8,
        color: "#5D4037",
      },
    }

    setCurrentFurniture({
      ...currentFurniture,
      type,
      ...defaults[type],
    })

    setCells([])
  }

  useEffect(() => {
    if (viewMode === "3D") {
      const updatedProductsForDisplay = cells
        .filter((cell) => cell.productId !== null)
        .map((cell) => {
          return {
            id: `product-${cell.id}`,
            productId: cell.productId,
            section: cell.y,
            position: cell.x,
            furnitureId: currentFurniture.id,
            quantity: cell.quantity || 1,
          }
        })

      setProductsForDisplay(updatedProductsForDisplay)
    }
  }, [viewMode, cells])

  const render3DFurniture = () => {
    console.log("Rendering 3D furniture with products:", productsForDisplay)

    const props = {
      furniture: currentFurniture,
      displayItems: productsForDisplay,
      products,
      onRemove: () => {},
    }

    switch (currentFurniture.type) {
      case "clothing-rack":
        return <ClothingRack {...props} />
      case "wall-display":
        return <WallDisplay {...props} />
      case "accessory-display":
        return <AccessoryDisplay {...props} />
      case "modular-cube":
        return <ModularCube {...props} />
      case "gondola":
        return <GondolaDisplay {...props} />
      case "table":
        return <TableDisplay {...props} />
      case "refrigerator":
        return <SupermarketFridge {...props} />
      case "refrigerated-showcase":
        return (
          <>
            <RefrigeratedShowcase {...props} />
            <ambientLight intensity={0.7} />
            <spotLight position={[0, 3, 3]} angle={0.5} penumbra={0.5} intensity={0.8} castShadow />
          </>
        )
      case "clothing-display":
        return <ClothingDisplay {...props} />
      case "clothing-wall":
        return <ClothingWallDisplay {...props} />
      default:
        return null
    }
  }

  useEffect(() => {
    const updatedProductsForDisplay = cells
      .filter((cell) => cell.productId !== null)
      .map((cell) => {
        return {
          id: `product-${cell.id}`,
          productId: cell.productId,
          section: cell.y,
          position: cell.x,
          furnitureId: currentFurniture.id,
          quantity: cell.quantity || 1,
        }
      })

    setProductsForDisplay(updatedProductsForDisplay)
    console.log("useEffect cells - Produits mis à jour:", updatedProductsForDisplay)
  }, [cells, currentFurniture.id])

  function adjustColor(color, amount) {
    let r = Number.parseInt(color.substring(1, 3), 16)
    let g = Number.parseInt(color.substring(3, 5), 16)
    let b = Number.parseInt(color.substring(5, 7), 16)

    r = Math.max(0, Math.min(255, r + amount))
    g = Math.max(0, Math.min(255, g + amount))
    b = Math.max(0, Math.min(255, b + amount))

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  }

  const renderRefrigerator2D = () => {
    return (
      <div className="relative">
        <div className={`absolute ${isRTL ? "left-full" : "right-full"} top-0 bottom-0 ${isRTL ? "pl-2" : "pr-2"}`}>
          {Array.from({ length: currentFurniture.sections }).map((_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className={`flex items-center ${isRTL ? "justify-start" : "justify-end"} font-medium text-sm text-muted-foreground`}
              style={{
                height: `${cellHeight}px`,
                width: "20px",
              }}
            >
              {rowIndex + 1}
            </div>
          ))}
        </div>

        <div className="absolute bottom-full left-0 right-0 pb-2">
          <div className="flex">
            {Array.from({ length: currentFurniture.slots }).map((_, colIndex) => (
              <div
                key={`col-${colIndex}`}
                className="flex items-center justify-center font-medium text-sm text-muted-foreground"
                style={{
                  width: `${cellWidth}px`,
                  height: "20px",
                }}
              >
                {colIndex + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="border-2 border-gray-800 rounded-md overflow-hidden">
          <div
            className="grid gap-0"
            style={{
              gridTemplateColumns: `repeat(${currentFurniture.slots}, ${cellWidth}px)`,
              gridTemplateRows: `repeat(${currentFurniture.sections}, ${cellHeight}px)`,
            }}
          >
            {cells.map((cell) => (
              <div key={cell.id} className="border border-dashed border-gray-300">
                <FurnitureCell
                  key={cell.id}
                  cell={cell}
                  products={products}
                  onDrop={handleDrop}
                  onRemove={handleRemoveProduct}
                  cellWidth={cellWidth}
                  cellHeight={cellHeight}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full h-16 bg-gray-800 rounded-b-md flex items-center justify-between px-4 mt-1">
          <div className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
          <div className="w-3/4 h-10 bg-gray-900 rounded-md"></div>
          <div className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center">
            <Snowflake className="h-5 w-5 text-blue-300" />
          </div>
        </div>
      </div>
    )
  }

  const renderRefrigeratedShowcase2D = () => {
    return (
      <div className="relative">
        <div className={`absolute ${isRTL ? "left-full" : "right-full"} top-0 bottom-0 ${isRTL ? "pl-2" : "pr-2"}`}>
          {Array.from({ length: currentFurniture.sections }).map((_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className={`flex items-center ${isRTL ? "justify-start" : "justify-end"} font-medium text-sm text-muted-foreground`}
              style={{
                height: `${cellHeight}px`,
                width: "20px",
              }}
            >
              {rowIndex + 1}
            </div>
          ))}
        </div>

        <div className="absolute bottom-full left-0 right-0 pb-2">
          <div className="flex">
            {Array.from({ length: currentFurniture.slots }).map((_, colIndex) => (
              <div
                key={`col-${colIndex}`}
                className="flex items-center justify-center font-medium text-sm text-muted-foreground"
                style={{
                  width: `${cellWidth}px`,
                  height: "20px",
                }}
              >
                {colIndex + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="border-2 border-gray-600 rounded-md overflow-hidden bg-gray-100">
          <div className="w-full h-6 bg-blue-100 opacity-30 border-b border-gray-400"></div>

          <div
            className="grid gap-0"
            style={{
              gridTemplateColumns: `repeat(${currentFurniture.slots}, ${cellWidth}px)`,
              gridTemplateRows: `repeat(${currentFurniture.sections}, ${cellHeight}px)`,
            }}
          >
            {cells.map((cell) => (
              <div key={cell.id} className="border border-dashed border-gray-300">
                <FurnitureCell
                  key={cell.id}
                  cell={cell}
                  products={products}
                  onDrop={handleDrop}
                  onRemove={handleRemoveProduct}
                  cellWidth={cellWidth}
                  cellHeight={cellHeight}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full h-8 bg-gray-600 rounded-b-md mt-1"></div>
      </div>
    )
  }

  const refreshView = () => {
    if (viewMode === "3D") {
      setViewMode("2D")
      setTimeout(() => {
        setViewMode("3D")
      }, 100)
    } else {
      setViewMode("3D")
      setTimeout(() => {
        setViewMode("2D")
      }, 100)
    }

    toast({
      title: "Vue rafraîchie",
      description: "La vue a été rafraîchie.",
    })
  }

  return (
    <div className="mt-12" dir={textDirection}>
      <DndProvider backend={HTML5Backend}>
        <div className="container mx-auto py-6 max-w-full">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" asChild>
                  <Link href="/furniture-library">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold">{t("furnitureEditor.editeur")}</h1>
              </div>

              <div className="flex items-center space-x-2">
                {/* le sélecteur de meubles générés */}
                {generatedFurnitures.length > 0 && (
                     <Dialog open={showDetectedFurnitures} onOpenChange={setShowDetectedFurnitures}>
                     <DialogTrigger asChild>
                       <Button variant="outline" onClick={() => setShowDetectedFurnitures(true)}>
                         <Package className="h-4 w-4 mr-2" />
                         Voir les meubles détectés ({generatedFurnitures.length})
                       </Button>
                     </DialogTrigger>
                     <DialogContent className="sm:max-w-[800px]">
                       <DialogHeader>
                         <DialogTitle>Meubles détectés</DialogTitle>
                         <DialogDescription>
                           Liste des meubles importés depuis le fichier JSON
                         </DialogDescription>
                       </DialogHeader>
                       <div className="grid grid-cols-2 gap-4">
                         {generatedFurnitures.map(furniture => (
                           <Card 
                             key={furniture.id} 
                             className={`cursor-pointer ${currentFurniture.id === furniture.id ? 'border-primary' : ''}`}
                             onClick={() => {
                               displayFurniture(furniture);
                               setShowDetectedFurnitures(false);
                             }}
                           >
                             <CardContent className="p-4">
                               <div className="flex items-center gap-3">
                                 {getFurnitureIcon(furniture.type)}
                                 <div>
                                   <h4 className="font-medium">{furniture.name}</h4>
                                   <p className="text-sm text-muted-foreground">
                                     {furniture.sections} sections × {furniture.slots} emplacements
                                   </p>
                                   <p className="text-xs text-muted-foreground">
                                     {furniture.productPositions?.length || 0} produits placés
                                   </p>
                                 </div>
                               </div>
                             </CardContent>
                           </Card>
                         ))}
                       </div>
                     </DialogContent>
                   </Dialog>
                  <Select
                    value={currentFurniture.id}
                    onValueChange={(id) => {
                      const selected = generatedFurnitures.find(f => f.id === id);
                      if (selected) displayFurniture(selected);
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Sélectionner un meuble" />
                    </SelectTrigger>
                    <SelectContent>
                      {generatedFurnitures.map(furniture => (
                        <SelectItem key={furniture.id} value={furniture.id}>
                          {furniture.name} ({furniture.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="flex border rounded-md mr-2">
                  <Button
                    variant={viewMode === "2D" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("2D")}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    {t("productImport.TwoD")}
                  </Button>
                  <Button
                    variant={viewMode === "3D" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("3D")}
                    className="rounded-l-none"
                  >
                    <Cube className="h-4 w-4 mr-2" />
                    {t("productImport.ThreeD")}
                  </Button>
                </div>

                <AIGenerationDialog onImport={handleImportPlanogram} />

                <Button variant="outline" size="sm" onClick={forceSynchronization} className="mr-2 bg-transparent">
                  <Grid className="h-4 w-4 mr-2" />
                  Synchroniser
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkAndFixProductQuantities}
                  className="mr-2 bg-transparent"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {t("furnitureEditor.optimisation")}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={synchronizeProductQuantities}
                  className="mr-2 bg-transparent"
                >
                  <Grid className="h-4 w-4 mr-2" />
                  {t("furnitureEditor.synchronisation")}
                </Button>

                <Button variant="outline" size="sm" onClick={refreshView} className="mr-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("furnitureEditor.refresher")}
                </Button>

                <FurnitureSettingsDialog furniture={currentFurniture} updateFurniture={updateFurniture} />

                <SaveFurnitureDialog
                  furniture={currentFurniture}
                  products={products}
                  cells={cells}
                  onSave={saveFurnitureToLibrary}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-4">
                    <Tabs defaultValue="type">
                      <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="type">
                          <Package className="h-4 w-4 mr-2" />
                          {t("productImport.type")}
                        </TabsTrigger>
                        <TabsTrigger value="products">
                          <Package className="h-4 w-4 mr-2" />
                          {t("productImport.produits")}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="type" className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">{t("productImport.furnitureType")}</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant={currentFurniture.type === "clothing-rack" ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => changeFurnitureType("clothing-rack")}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              {t("productImport.portant")}
                            </Button>
                            <Button
                              variant={currentFurniture.type === "wall-display" ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => changeFurnitureType("wall-display")}
                            >
                              <Grid className="h-4 w-4 mr-2" />
                              {t("furnitureEditor.mural")}
                            </Button>
                            <Button
                              variant={currentFurniture.type === "accessory-display" ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => changeFurnitureType("accessory-display")}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              {t("furnitureEditor.accessoires")}
                            </Button>
                            <Button
                              variant={currentFurniture.type === "modular-cube" ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => changeFurnitureType("modular-cube")}
                            >
                              <Cube className="h-4 w-4 mr-2" />
                              {t("productImport.cube")}
                            </Button>
                            <Button
                              variant={currentFurniture.type === "gondola" ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => changeFurnitureType("gondola")}
                            >
                              <Grid className="h-4 w-4 mr-2" />
                              {t("productImport.furnitureTypes.gondola")}
                            </Button>
                            <Button
                              variant={currentFurniture.type === "table" ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => changeFurnitureType("table")}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              {t("productImport.table")}
                            </Button>
                            <Button
                              variant={currentFurniture.type === "refrigerator" ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => changeFurnitureType("refrigerator")}
                            >
                              <Snowflake className="h-4 w-4 mr-2" />
                              {t("productImport.frigo")}
                            </Button>
                            <Button
                              variant={currentFurniture.type === "refrigerated-showcase" ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => changeFurnitureType("refrigerated-showcase")}
                            >
                              <Snowflake className="h-4 w-4 mr-2" />
                              {t("furnitureEditor.frigo_presentoir")}
                            </Button>
                            <Button
                              variant={currentFurniture.type === "clothing-display" ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => changeFurnitureType("clothing-display")}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              {t("furnitureEditor.presentoir_vetements")}
                            </Button>
                            <Button
                              variant={currentFurniture.type === "clothing-wall" ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => changeFurnitureType("clothing-wall")}
                            >
                              <Grid className="h-4 w-4 mr-2" />
                              {t("furnitureEditor.mur_exposition")}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">{t("furnitureEditor.TitleConfiguration")}</h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">{t("furnitureEditor.sections")}</label>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    updateFurniture({
                                      ...currentFurniture,
                                      sections: Math.max(1, currentFurniture.sections - 1),
                                    })
                                  }
                                  disabled={currentFurniture.sections <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                  type="number"
                                  min="1"
                                  value={currentFurniture.sections}
                                  onChange={(e) =>
                                    updateFurniture({
                                      ...currentFurniture,
                                      sections: Math.max(1, Number.parseInt(e.target.value) || 1),
                                    })
                                  }
                                  className="text-center"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    updateFurniture({ ...currentFurniture, sections: currentFurniture.sections + 1 })
                                  }
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">{t("furnitureEditor.emplacement")}</label>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    updateFurniture({
                                      ...currentFurniture,
                                      slots: Math.max(1, currentFurniture.slots - 1),
                                    })
                                  }
                                  disabled={currentFurniture.slots <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                  type="number"
                                  min="1"
                                  value={currentFurniture.slots}
                                  onChange={(e) =>
                                    updateFurniture({
                                      ...currentFurniture,
                                      slots: Math.max(1, Number.parseInt(e.target.value) || 1),
                                    })
                                  }
                                  className="text-center"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    updateFurniture({ ...currentFurniture, slots: currentFurniture.slots + 1 })
                                  }
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">{t("productImport.dimensions")}</label>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-xs text-muted-foreground">
                                    {t("productImport.width")} (m)
                                  </label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={currentFurniture.width}
                                    onChange={(e) =>
                                      updateFurniture({ ...currentFurniture, width: Number.parseFloat(e.target.value) })
                                    }
                                    className="text-center"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-muted-foreground">
                                    {t("productImport.height")} (m)
                                  </label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={currentFurniture.height}
                                    onChange={(e) =>
                                      updateFurniture({
                                        ...currentFurniture,
                                        height: Number.parseFloat(e.target.value),
                                      })
                                    }
                                    className="text-center"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-muted-foreground">
                                    {t("productImport.depth")} (m)
                                  </label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={currentFurniture.depth}
                                    onChange={(e) =>
                                      updateFurniture({ ...currentFurniture, depth: Number.parseFloat(e.target.value) })
                                    }
                                    className="text-center"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">{t("furnitureEditor.couleur")}</label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={currentFurniture.color || "#333333"}
                                  onChange={(e) => updateFurniture({ ...currentFurniture, color: e.target.value })}
                                  className="w-10 h-10 rounded cursor-pointer"
                                />
                                <Input
                                  value={currentFurniture.color || "#333333"}
                                  onChange={(e) => updateFurniture({ ...currentFurniture, color: e.target.value })}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="products" className="space-y-4">
                        <div className="space-y-2">
                          <Input
                            placeholder={t("productImport.searchProduct")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={<Search className="h-4 w-4 text-muted-foreground" />}
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <select
                              className="p-2 border rounded-md text-sm"
                              value={selectedCategory || ""}
                              onChange={(e) => setSelectedCategory(e.target.value || null)}
                            >
                              <option value="">{t("productImport.allCategories")}</option>
                              {categories.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>

                            <select
                              className="p-2 border rounded-md text-sm"
                              value={selectedSupplier || ""}
                              onChange={(e) => setSelectedSupplier(e.target.value || null)}
                            >
                              <option value="">{t("productImport.allSuppliers")}</option>
                              {suppliers.map((supplier) => (
                                <option key={supplier} value={supplier}>
                                  {supplier}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {filteredProducts.length} {t("productImport.produits")}
                        </div>

                        <ScrollArea className="h-[calc(100vh-300px)]">
                          <div className="grid grid-cols-2 gap-2 p-1" style={{ direction: textDirection }}>
                            {filteredProducts.map((product, index) => (
                              <ProductItem key={`${product.primary_id}-${index}`} product={product} />
                            ))}
                            {filteredProducts.length === 0 && (
                              <div className="col-span-2 text-center py-8 text-muted-foreground">
                                {t("furnitureEditor.noProducts")}
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>

                    {cells.some((cell) => cell.productId) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const productCell = cells.find((cell) => cell.productId)
                          if (productCell) {
                            debugImageLoading(productCell.productId)
                          }
                        }}
                        className="mt-2"
                      >
                        {t("furnitureEditor.debogage")}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Main display area */}
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium">
                        {t(`furnitureEditor.${currentFurniture.type.replace("-", "_")}`)}
                      </h2>
                      <div className="text-sm text-muted-foreground">
                        {currentFurniture.sections} {t("furnitureEditor.sections")} × {currentFurniture.slots}{" "}
                        {t("furnitureEditor.emplacement")}
                      </div>
                    </div>

                    {viewMode === "2D" ? (
                      <div className="overflow-auto border rounded-md p-4 bg-muted/20">
                        <div
                          className="relative bg-white"
                          style={{
                            width: `${currentFurniture.type === "clothing-rack" ? cellWidth * currentFurniture.slots : cellWidth * currentFurniture.slots + 2}px`,
                            minHeight: `${currentFurniture.type === "clothing-rack" ? cellHeight * 2 : cellHeight * currentFurniture.sections + 2}px`,
                          }}
                        >
                          {currentFurniture.type === "clothing-rack" ? (
                            <div className="relative">
                              <div
                                className="w-full h-4 bg-gray-400 rounded-t-md"
                                style={{ backgroundColor: currentFurniture.color }}
                              ></div>
                              <div className="flex justify-center mt-2">
                                {Array.from({ length: currentFurniture.slots }).map((_, slotIndex) => {
                                  const cell = cells.find((c) => c.x === slotIndex && c.y === 0)
                                  return (
                                    <FurnitureCell
                                      key={`rack-${slotIndex}`}
                                      cell={cell || { id: `cell-0-${slotIndex}`, x: slotIndex, y: 0, productId: null }}
                                      products={products}
                                      onDrop={handleDrop}
                                      onRemove={handleRemoveProduct}
                                      cellWidth={cellWidth}
                                      cellHeight={cellHeight * 2 - 10}
                                    />
                                  )
                                })}
                              </div>
                            </div>
                          ) : currentFurniture.type === "table" ? (
                            <div className="relative">
                              <div
                                className="w-full h-full border-2 rounded-md"
                                style={{
                                  backgroundColor: currentFurniture.color,
                                  borderColor: adjustColor(currentFurniture.color, -30),
                                  padding: "8px",
                                }}
                              >
                                <div
                                  className="grid gap-2"
                                  style={{
                                    gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(currentFurniture.slots))}, 1fr)`,
                                    gridTemplateRows: `repeat(${Math.ceil(Math.sqrt(currentFurniture.slots))}, 1fr)`,
                                  }}
                                >
                                  {cells.map((cell) => (
                                    <FurnitureCell
                                      key={cell.id}
                                      cell={cell}
                                      products={products}
                                      onDrop={handleDrop}
                                      onRemove={handleRemoveProduct}
                                      cellWidth={(cellWidth / Math.ceil(Math.sqrt(currentFurniture.slots))) * 0.9}
                                      cellHeight={(cellHeight / Math.ceil(Math.sqrt(currentFurniture.slots))) * 0.9}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : currentFurniture.type === "refrigerator" ? (
                            renderRefrigerator2D()
                          ) : currentFurniture.type === "refrigerated-showcase" ? (
                            renderRefrigeratedShowcase2D()
                          ) : currentFurniture.type === "clothing-display" ? (
                            <div className="relative">
                              <div className="border-2 border-gray-300 rounded-md p-2 bg-gray-50">
                                <div className="absolute right-full top-0 bottom-0 pr-2">
                                  {Array.from({ length: currentFurniture.sections }).map((_, rowIndex) => (
                                    <div
                                      key={`row-${rowIndex}`}
                                      className="flex items-center justify-end font-medium text-sm text-muted-foreground"
                                      style={{
                                        height: `${cellHeight}px`,
                                        width: "20px",
                                      }}
                                    >
                                      {rowIndex + 1}
                                    </div>
                                  ))}
                                </div>

                                <div className="absolute bottom-full left-0 right-0 pb-2">
                                  <div className="flex">
                                    {Array.from({ length: currentFurniture.slots }).map((_, colIndex) => (
                                      <div
                                        key={`col-${colIndex}`}
                                        className="flex items-center justify-center font-medium text-sm text-muted-foreground"
                                        style={{
                                          width: `${cellWidth}px`,
                                          height: "20px",
                                        }}
                                      >
                                        {colIndex + 1}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="w-full h-4 bg-gray-300 mb-2 rounded-t-sm"></div>

                                <div
                                  className="grid gap-2"
                                  style={{
                                    gridTemplateColumns: `repeat(${currentFurniture.slots}, ${cellWidth}px)`,
                                    gridTemplateRows: `repeat(${currentFurniture.sections}, ${cellHeight}px)`,
                                  }}
                                >
                                  {cells.map((cell) => (
                                    <FurnitureCell
                                      key={cell.id}
                                      cell={cell}
                                      products={products}
                                      onDrop={handleDrop}
                                      onRemove={handleRemoveProduct}
                                      cellWidth={cellWidth}
                                      cellHeight={cellHeight}
                                    />
                                  ))}
                                </div>

                                <div className="w-full h-6 bg-gray-300 mt-2 rounded-b-sm flex items-center justify-between px-4">
                                  <div className="w-1/3 h-4 bg-gray-400 rounded-sm"></div>
                                  <div className="w-1/3 h-4 bg-gray-400 rounded-sm"></div>
                                  <div className="w-1/3 h-4 bg-gray-400 rounded-sm"></div>
                                </div>
                              </div>
                            </div>
                          ) : currentFurniture.type === "clothing-wall" ? (
                            <div className="relative">
                              <div className="border-2 border-amber-900 rounded-md p-2 bg-amber-50">
                                <div className="absolute right-full top-0 bottom-0 pr-2">
                                  {Array.from({ length: currentFurniture.sections }).map((_, rowIndex) => (
                                    <div
                                      key={`row-${rowIndex}`}
                                      className="flex items-center justify-end font-medium text-sm text-muted-foreground"
                                      style={{
                                        height: `${cellHeight}px`,
                                        width: "20px",
                                      }}
                                    >
                                      {rowIndex + 1}
                                    </div>
                                  ))}
                                </div>

                                <div className="absolute bottom-full left-0 right-0 pb-2">
                                  <div className="flex">
                                    {Array.from({ length: currentFurniture.slots }).map((_, colIndex) => (
                                      <div
                                        key={`col-${colIndex}`}
                                        className="flex items-center justify-center font-medium text-sm text-muted-foreground"
                                        style={{
                                          width: `${cellWidth}px`,
                                          height: "20px",
                                        }}
                                      >
                                        {colIndex + 1}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div
                                  className="absolute left-0 top-0 bottom-0 w-1/4 bg-blue-900 opacity-30 z-0"
                                  style={{ height: `${cellHeight * currentFurniture.sections}px` }}
                                ></div>

                                <div
                                  className="grid gap-0 relative z-10"
                                  style={{
                                    gridTemplateColumns: `repeat(${currentFurniture.slots}, ${cellWidth}px)`,
                                    gridTemplateRows: `repeat(${currentFurniture.sections}, ${cellHeight}px)`,
                                  }}
                                >
                                  {cells.map((cell) => (
                                    <div key={cell.id} className="border border-dashed border-gray-300">
                                      <FurnitureCell
                                        key={cell.id}
                                        cell={cell}
                                        products={products}
                                        onDrop={handleDrop}
                                        onRemove={handleRemoveProduct}
                                        cellWidth={cellWidth}
                                        cellHeight={cellHeight}
                                      />
                                    </div>
                                  ))}
                                </div>

                                {Array.from({ length: currentFurniture.sections + 1 }).map((_, i) => (
                                  <div
                                    key={`shelf-${i}`}
                                    className="absolute left-0 right-0 h-1 bg-amber-900"
                                    style={{
                                      top: `${i * cellHeight}px`,
                                      zIndex: 20,
                                    }}
                                  ></div>
                                ))}

                                {[-1, 1 / 3, 2 / 3, 1].map((pos, i) => (
                                  <div
                                    key={`support-${i}`}
                                    className="absolute top-0 bottom-0 w-1 bg-amber-900"
                                    style={{
                                      left: `${(pos + 0.5) * (cellWidth * currentFurniture.slots)}px`,
                                      height: `${cellHeight * currentFurniture.sections}px`,
                                      zIndex: 20,
                                    }}
                                  ></div>
                                ))}

                                <div
                                  className="w-full h-8 bg-amber-900 mt-2 rounded-b-sm"
                                  style={{ marginTop: `${cellHeight * currentFurniture.sections + 2}px` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="absolute right-full top-0 bottom-0 pr-2">
                                {Array.from({ length: currentFurniture.sections }).map((_, rowIndex) => (
                                  <div
                                    key={`row-${rowIndex}`}
                                    className="flex items-center justify-end font-medium text-sm text-muted-foreground"
                                    style={{
                                      height: `${cellHeight}px`,
                                      width: "20px",
                                    }}
                                  >
                                    {rowIndex + 1}
                                  </div>
                                ))}
                              </div>

                              <div className="absolute bottom-full left-0 right-0 pb-2">
                                <div className="flex">
                                  {Array.from({ length: currentFurniture.slots }).map((_, colIndex) => (
                                    <div
                                      key={`col-${colIndex}`}
                                      className="flex items-center justify-center font-medium text-sm text-muted-foreground"
                                      style={{
                                        width: `${cellWidth}px`,
                                        height: "20px",
                                      }}
                                    >
                                      {colIndex + 1}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div
                                className="grid"
                                style={{
                                  gridTemplateColumns: `repeat(${currentFurniture.slots}, ${cellWidth}px)`,
                                  gridTemplateRows: `repeat(${currentFurniture.sections}, ${cellHeight}px)`,
                                }}
                              >
                                {cells.map((cell) => (
                                  <FurnitureCell
                                    key={cell.id}
                                    cell={cell}
                                    products={products}
                                    onDrop={handleDrop}
                                    onRemove={handleRemoveProduct}
                                    cellWidth={cellWidth}
                                    cellHeight={cellHeight}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-md overflow-hidden" style={{ height: "600px" }}>
                        <Canvas shadows>
                          {render3DFurniture()}
                          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                          <ambientLight intensity={0.5} />
                          <directionalLight position={[5, 5, 5]} intensity={0.6} castShadow />
                          <directionalLight position={[-5, 5, -5]} intensity={0.4} />
                        </Canvas>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DndProvider>
    </div>
  )
}
