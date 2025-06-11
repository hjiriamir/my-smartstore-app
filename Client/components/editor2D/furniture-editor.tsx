"use client"

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
import type { FurnitureType, FurnitureItem, FurnitureProduct } from "@/lib/furniture-store"
import {
  WallDisplay,
  ClothingRack,
  AccessoryDisplay,
  ModularCube,
  GondolaDisplay,
  TableDisplay,
  RefrigeratorDisplay,
  RefrigeratedShowcase,
  ClothingDisplay,
  ClothingWallDisplay,
  Fridge3D,
  SupermarketFridge,
} from "@/components/editor2D/furniture-3d-components"




// Drag item types
const ItemTypes = {
  PRODUCT: "product",
  FURNITURE_PRODUCT: "furniture_product",
}

// Product Item Component (draggable from product list)
const ProductItem = ({ product }: { product: Product }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PRODUCT,
    item: { id: product.primary_Id, type: ItemTypes.PRODUCT },
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
        <div className="text-[10px] text-muted-foreground truncate w-20">{product.primary_Id}</div>
      </div>
    </div>
  )
}

// Ajouter un indicateur de quantité dans la vue 2D

// Modifier le composant FurnitureCell pour afficher la quantité
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
  const product = cell.productId ? products.find((p) => p.primary_Id === cell.productId) : null

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.PRODUCT, ItemTypes.FURNITURE_PRODUCT],
    drop: (item: { id: string; type: string }) => {
      onDrop(cell.id, item.id)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  // For products that are already in the furniture
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

            {/* Indicateur de quantité */}
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

  const handleSave = () => {
    // Get products from cells
    const furnitureProducts: FurnitureProduct[] = cells
      .filter((cell) => cell.productId !== null)
      .map((cell) => ({
        productId: cell.productId!,
        section: cell.y,
        position: cell.x,
      }))

    // Create furniture item to save
    const furnitureToSave: FurnitureItem = {
      ...furniture,
      id: `furniture-${Date.now()}`,
      name,
    }

    // Add to furniture store
    addFurniture(furnitureToSave, furnitureProducts, description)

    toast({
      title: "Meuble enregistré",
      description: `Le meuble "${name}" a été enregistré dans votre bibliothèque.`,
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          {t("save")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("furnitureEditor.enregistrerMeuble")}</DialogTitle>
          <DialogDescription>{t("furnitureEditor.enregistrerDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium">{t("productImport.floorPlan.nomMeuble")}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>

          <div>
            <label className="text-sm font-medium">{t("furnitureEditor.description")}</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("savePlanogramDialog.previewLabel")}</label>
            <div className="border rounded-md p-4 bg-muted/20">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-muted/30 rounded-md flex items-center justify-center">
                  {getFurnitureIcon(furniture.type)}
                </div>
                <div>
                  <h4 className="font-medium">{name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {furniture.sections} {t("furnitureEditor.sections")}, {furniture.slots}{" "}
                    {t("furnitureEditor.emplacement")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {cells.filter((cell) => cell.productId !== null).length} {t("productImport.produitPlacerIA")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("cancel")}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleSave}>{t("save")}</Button>
          </DialogClose>
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

// Ajouter une fonction de débogage pour aider à résoudre les problèmes de chargement d'images

// Ajouter cette fonction dans le composant FurnitureEditor
// Fonction pour vérifier et corriger les quantités de produits
// Améliorer la fonction de synchronisation pour garantir que les produits apparaissent correctement dans les deux vues

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
  // Ajouter un état pour forcer la mise à jour des produits affichés
  const [productsForDisplay, setProductsForDisplay] = useState([])

  // Calculate cell dimensions for 2D view
  const cellWidth = 100
  const cellHeight = 80

  // Get unique suppliers
  const suppliers = [...new Set(products.map((product) => product.supplier))].filter(Boolean).sort()
  const categories = [...new Set(products.map((product) => product.category_id))].filter(Boolean).sort()
  // Filter products
  const filteredProducts = products.filter((product) => {
    // Vérifie que product.primary_Id existe avant d'utiliser toLowerCase()
    const primaryId = product.primary_Id ? product.primary_Id.toLowerCase() : '';
    const supplier = product.supplier ? product.supplier.toLowerCase() : '';
    
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      primaryId.includes(searchTerm.toLowerCase()) ||
      supplier.includes(searchTerm.toLowerCase());
  
    // Category filter
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
  
    // Supplier filter
    const matchesSupplier = !selectedSupplier || product.supplier === selectedSupplier;
  
    return matchesSearch && matchesCategory && matchesSupplier;
  });
  useEffect(() => {
    setCurrentFurniture((prev) => ({
      ...prev,
      name: t(`furnitureEditor.${prev.name}`), // Utilisez la clé correspondante
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

  // Modifier la fonction handleDrop pour mieux gérer les produits
  const handleDrop = (cellId: string, productId: string) => {
    // Vérifier si ce produit existe déjà dans la même section
    const targetCell = cells.find((cell) => cell.id === cellId)
    if (!targetCell) return

    const sameProductInSection = cells.find(
      (cell) => cell.productId === productId && cell.y === targetCell.y && cell.id !== cellId,
    )

    if (sameProductInSection) {
      // Si le produit existe déjà dans cette section, mettre à jour la quantité
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
      // Sinon, ajouter normalement
      setCells((prev) => prev.map((cell) => (cell.id === cellId ? { ...cell, productId, quantity: 1 } : cell)))

      // Mettre à jour immédiatement les produits pour l'affichage 3D
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
    // Placeholder function for checking and fixing product quantities
    console.log("Checking and fixing product quantities...")
  }

  const synchronizeProductQuantities = () => {
    // Placeholder function for synchronizing product quantities
    console.log("Synchronizing product quantities...")
  }

  const debugImageLoading = (productId: string) => {
    // Placeholder function for debugging image loading
    console.log(`Debugging image loading for product ID: ${productId}`)
  }

  // Save furniture to library
  const { addFurniture } = useFurnitureStore()
  const saveFurnitureToLibrary = (name: string, description: string) => {
    // Get products from cells
    const furnitureProducts: FurnitureProduct[] = cells
      .filter((cell) => cell.productId !== null)
      .map((cell) => ({
        productId: cell.productId!,
        section: cell.y,
        position: cell.x,
      }))

    // Create furniture item to save
    const furnitureToSave: FurnitureItem = {
      ...currentFurniture,
      id: `furniture-${Date.now()}`,
      name,
    }

    // Add to furniture store
    addFurniture(furnitureToSave, furnitureProducts, description)

    toast({
      title: "Meuble enregistré",
      description: `Le meuble "${name}" a été enregistré dans votre bibliothèque.`,
    })
  }

  // Ajouter le nouveau type de meuble dans la fonction changeFurnitureType
  const changeFurnitureType = (type: FurnitureType) => {
    // Default values based on type
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

    // Clear cells when changing type
    setCells([])
  }

  // Ajouter un effet pour synchroniser automatiquement les vues
  useEffect(() => {
    if (viewMode === "3D") {
      // Mettre à jour les produits pour l'affichage 3D à chaque changement de vue
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

      // Forcer une mise à jour des produits affichés
      setProductsForDisplay(updatedProductsForDisplay)
    }
  }, [viewMode, cells])

  // Modifier la fonction render3DFurniture pour ajouter des logs de débogage
  const render3DFurniture = () => {
    // Log pour déboguer les produits affichés
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
            {/* Ajouter un éclairage supplémentaire pour le frigo-présentoir */}
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

  // Mettre à jour la définition initiale des produits pour l'affichage
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
  }, [cells])

  // Ajouter cette fonction d'aide pour ajuster les couleurs
  function adjustColor(color, amount) {
    // Convertir la couleur hex en RGB
    let r = Number.parseInt(color.substring(1, 3), 16)
    let g = Number.parseInt(color.substring(3, 5), 16)
    let b = Number.parseInt(color.substring(5, 7), 16)

    // Ajuster les valeurs
    r = Math.max(0, Math.min(255, r + amount))
    g = Math.max(0, Math.min(255, g + amount))
    b = Math.max(0, Math.min(255, b + amount))

    // Convertir en hex
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  }

  const renderRefrigerator2D = () => {
    return (
      <div className="relative">
        {/* Section labels */}
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

        {/* Column numbers */}
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

        {/* Refrigerator outline */}
        <div className="border-2 border-gray-800 rounded-md overflow-hidden">
          {/* Grid for products */}
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

        {/* Base/cooling unit */}
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
        {/* Section labels */}
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

        {/* Column numbers */}
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

        {/* Refrigerated showcase outline */}
        <div className="border-2 border-gray-600 rounded-md overflow-hidden bg-gray-100">
          {/* Glass top */}
          <div className="w-full h-6 bg-blue-100 opacity-30 border-b border-gray-400"></div>

          {/* Grid for products */}
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

        {/* Base */}
        <div className="w-full h-8 bg-gray-600 rounded-b-md mt-1"></div>
      </div>
    )
  }

  // Ajouter un bouton pour forcer le rafraîchissement de la vue 3D
  const refreshView = () => {
    // Forcer une mise à jour de la vue 3D
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
              {/* Ajouter le bouton dans la barre d'outils */}
              <div className="flex items-center space-x-2">
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

                <Button variant="outline" size="sm" onClick={checkAndFixProductQuantities} className="mr-2">
                  <Settings className="h-4 w-4 mr-2" />
                  {t("furnitureEditor.optimisation")}
                </Button>

                <Button variant="outline" size="sm" onClick={synchronizeProductQuantities} className="mr-2">
                  <Grid className="h-4 w-4 mr-2" />
                  {t("furnitureEditor.synchronisation")}
                </Button>

                <Button variant="outline" size="sm" onClick={refreshView} className="mr-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("furnitureEditor.refresher")}
                </Button>

                <FurnitureSettingsDialog furniture={currentFurniture} updateFurniture={updateFurniture} />

                <SaveFurnitureDialog
                  furniture={currentFurniture}
                  products={productsForDisplay}
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
                          <h3 className="text-lg font-medium"> {t("furnitureEditor.TitleConfiguration")}</h3>
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
                                    {t("productImport.height")} (m)
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
                            <ProductItem key={`${product.primary_Id}-${index}`} product={product} />
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
                            // Interface spécifique pour portant à vêtements
                            <div className="relative">
                              {/* Barre du portant */}
                              <div
                                className="w-full h-4 bg-gray-400 rounded-t-md"
                                style={{ backgroundColor: currentFurniture.color }}
                              ></div>

                              {/* Zone de dépôt pour les vêtements */}
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
                            // Interface spécifique pour table
                            <div className="relative">
                              {/* Surface de la table */}
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
                            // Interface spécifique pour réfrigérateur
                            renderRefrigerator2D()
                          ) : currentFurniture.type === "refrigerated-showcase" ? (
                            // Interface spécifique pour frigo-présentoir
                            renderRefrigeratedShowcase2D()
                          ) : currentFurniture.type === "clothing-display" ? (
                            // Interface spécifique pour présentoir de vêtements
                            <div className="relative">
                              {/* Structure du présentoir */}
                              <div className="border-2 border-gray-300 rounded-md p-2 bg-gray-50">
                                {/* Section labels */}
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

                                {/* Column numbers */}
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

                                {/* Barre horizontale supérieure */}
                                <div className="w-full h-4 bg-gray-300 mb-2 rounded-t-sm"></div>

                                {/* Grille pour les produits */}
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

                                {/* Base du présentoir */}
                                <div className="w-full h-6 bg-gray-300 mt-2 rounded-b-sm flex items-center justify-between px-4">
                                  <div className="w-1/3 h-4 bg-gray-400 rounded-sm"></div>
                                  <div className="w-1/3 h-4 bg-gray-400 rounded-sm"></div>
                                  <div className="w-1/3 h-4 bg-gray-400 rounded-sm"></div>
                                </div>
                              </div>
                            </div>
                          ) : currentFurniture.type === "clothing-wall" ? (
                            // Interface spécifique pour mur d'exposition vêtements
                            <div className="relative">
                              {/* Structure du mur d'exposition */}
                              <div className="border-2 border-amber-900 rounded-md p-2 bg-amber-50">
                                {/* Section labels */}
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

                                {/* Column numbers */}
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

                                {/* Accent wall on left side */}
                                <div
                                  className="absolute left-0 top-0 bottom-0 w-1/4 bg-blue-900 opacity-30 z-0"
                                  style={{ height: `${cellHeight * currentFurniture.sections}px` }}
                                ></div>

                                {/* Grille pour les produits */}
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

                                {/* Étagères horizontales */}
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

                                {/* Supports verticaux */}
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

                                {/* Base du meuble */}
                                <div
                                  className="w-full h-8 bg-amber-900 mt-2 rounded-b-sm"
                                  style={{ marginTop: `${cellHeight * currentFurniture.sections + 2}px` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            // Interface par défaut pour les autres types de meubles (étagères, gondoles, etc.)
                            <>
                              {/* Section labels */}
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

                              {/* Column numbers */}
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

                              {/* Grid */}
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
