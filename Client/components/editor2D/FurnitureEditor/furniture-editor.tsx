"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

import {
  Plus,
  Minus,
  Package,
  Settings,
  Grid,
  CuboidIcon as Cube,
  ArrowLeft,
  Snowflake,
  Menu,
  Eye,
  EyeOff,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { useProductStore } from "@/lib/product-store"
import { useFurnitureStore } from "@/lib/furniture-store"
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

// Import des composants modulaires
import { AIGenerationDialog } from "@/components/editor2D/FurnitureEditor/ai-generation-dialog"
import { ProductItem } from "@/components/editor2D/FurnitureEditor/product-item"
import { FurnitureCell } from "@/components/editor2D/FurnitureEditor/furniture-cell"
import { FurnitureSettingsDialog } from "@/components/editor2D/FurnitureEditor/furniture-settings-dialog"
import { SaveFurnitureDialog } from "@/components/editor2D/FurnitureEditor/save-furniture-dialog"

// Import des types et utilitaires
import type { FurnitureItem, FurnitureProduct, ImportedPlanogram } from "@/components/types/furniture-types"
import { FURNITURE_TYPE_MAPPING, adjustColor } from "@/lib/furniture-utils"

// Main Furniture Editor Component
export function FurnitureEditor() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const { toast } = useToast()
  const { products } = useProductStore()

  // États pour la responsivité
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileToolbarOpen, setIsMobileToolbarOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("desktop")

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

  // Calculate cell dimensions for 2D view - responsive
  const getCellDimensions = () => {
    if (screenSize === "mobile") return { width: 80, height: 64 }
    if (screenSize === "tablet") return { width: 90, height: 72 }
    return { width: 100, height: 80 }
  }

  const { width: cellWidth, height: cellHeight } = getCellDimensions()

  // Détecter la taille d'écran
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setScreenSize("mobile")
        setIsSidebarOpen(false) // Fermer la sidebar sur mobile par défaut
      } else if (width < 1024) {
        setScreenSize("tablet")
        setIsSidebarOpen(false) // Fermer la sidebar sur tablette par défaut
      } else {
        setScreenSize("desktop")
        setIsSidebarOpen(true) // Ouvrir la sidebar sur desktop par défaut
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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
  const handleImportPlanogram = (importedData: ImportedPlanogram) => {
    try {
      console.log("Importation des données:", importedData)

      // Prendre le premier meuble du fichier importé
      const firstFurniture = importedData.furniture[0]
      if (!firstFurniture) {
        toast({
          title: "Erreur",
          description: "Aucun meuble trouvé dans le fichier",
          variant: "destructive",
        })
        return
      }

      // Mapper le type de meuble
      const mappedType = FURNITURE_TYPE_MAPPING[firstFurniture.furniture_type_name]
      if (!mappedType) {
        toast({
          title: "Attention",
          description: `Type de meuble "${firstFurniture.furniture_type_name}" non supporté, utilisation du type par défaut`,
          variant: "destructive",
        })
      }

      // Déterminer les bonnes propriétés selon le type de meuble
      let sections, slots

      if (firstFurniture.furniture_type_name === "gondola") {
        // Pour gondola, utiliser les propriétés front_back
        sections = firstFurniture.nb_etageres_front_back
        slots = firstFurniture.nb_colonnes_front_back * 2 // Multiplier par 2 car gondola a 2 faces
      } else if (firstFurniture.furniture_type_name === "shelves-display") {
        // Pour shelves-display, utiliser les propriétés left_right + front_back
        sections = Math.max(firstFurniture.nb_etageres_front_back, firstFurniture.nb_etageres_left_right)
        slots = firstFurniture.nb_colonnes_front_back * 2 + firstFurniture.nb_colonnes_left_right * 2
      } else {
        // Pour les autres types, utiliser unique_face
        sections = firstFurniture.nb_etageres_unique_face
        slots = firstFurniture.nb_colonnes_unique_face
      }

      // Mettre à jour le meuble actuel
      const newFurniture: FurnitureItem = {
        id: `imported-${Date.now()}`,
        type: mappedType || "wall-display",
        name: importedData.planogram_info.nom_planogram || "Meuble importé",
        sections: sections,
        slots: slots,
        width: firstFurniture.largeur / 100, // Convertir cm en m
        height: firstFurniture.hauteur / 100,
        depth: firstFurniture.profondeur / 100,
        color: "#f0f0f0",
        x: 0,
        y: 0,
        z: 0,
        rotation: 0,
      }

      console.log("Nouveau meuble créé:", newFurniture)

      // Créer les nouvelles cellules vides d'abord
      const newCells = []
      for (let section = 0; section < newFurniture.sections; section++) {
        for (let slot = 0; slot < newFurniture.slots; slot++) {
          newCells.push({
            id: `cell-${section}-${slot}`,
            x: slot,
            y: section,
            productId: null,
            quantity: 1,
          })
        }
      }

      console.log("Cellules créées:", newCells.length)

      // Filtrer les positions pour ce meuble
      const positionsForFurniture = importedData.product_positions.filter(
        (pos) => pos.furniture_id === firstFurniture.furniture_id,
      )

      console.log("Positions à traiter:", positionsForFurniture)

      let placedProductsCount = 0
      let skippedProductsCount = 0

      // Placer les produits selon les positions importées
      positionsForFurniture.forEach((position, index) => {
        console.log(`Traitement position ${index + 1}:`, position)

        // Vérifier si le produit existe dans la bibliothèque
        const productExists = products.find((p) => p.primary_id === position.produit_id)

        if (productExists) {
          let targetX = position.colonne - 1
          const targetY = position.etagere - 1

          // Ajustement spécial pour gondola avec faces front/back
          if (newFurniture.type === "gondola" && position.face === "back") {
            // Pour la face arrière, décaler les colonnes
            targetX = targetX + newFurniture.slots / 2
          }

          console.log(
            `Produit ${position.produit_id} trouvé, placement à x:${targetX}, y:${targetY}, face:${position.face}`,
          )

          // Vérifier que les coordonnées sont valides
          if (targetX >= 0 && targetX < newFurniture.slots && targetY >= 0 && targetY < newFurniture.sections) {
            const cellIndex = newCells.findIndex((cell) => cell.x === targetX && cell.y === targetY)
            if (cellIndex !== -1) {
              newCells[cellIndex] = {
                ...newCells[cellIndex],
                productId: position.produit_id,
                quantity: position.quantite || 1,
              }
              placedProductsCount++
              console.log(`✅ Produit ${position.produit_id} placé avec succès à la position ${cellIndex}`)
            } else {
              console.log(`❌ Cellule non trouvée pour x:${targetX}, y:${targetY}`)
              skippedProductsCount++
            }
          } else {
            console.log(
              `❌ Coordonnées invalides pour ${position.produit_id}: x:${targetX}, y:${targetY} (limites: ${newFurniture.slots}x${newFurniture.sections})`,
            )
            skippedProductsCount++
          }
        } else {
          console.log(`❌ Produit ${position.produit_id} non trouvé dans la bibliothèque`)
          skippedProductsCount++
        }
      })

      // Mettre à jour l'état du meuble et des cellules
      setCurrentFurniture(newFurniture)

      // Attendre un peu pour que le meuble soit mis à jour, puis mettre à jour les cellules
      setTimeout(() => {
        setCells(newCells)
        console.log(
          "Cellules mises à jour:",
          newCells.filter((cell) => cell.productId !== null),
        )

        // Forcer la mise à jour des produits pour l'affichage 3D
        setTimeout(() => {
          const updatedProductsForDisplay = newCells
            .filter((cell) => cell.productId !== null)
            .map((cell) => ({
              id: `product-${cell.id}`,
              productId: cell.productId,
              section: cell.y,
              position: cell.x,
              furnitureId: newFurniture.id,
              quantity: cell.quantity || 1,
            }))

          setProductsForDisplay(updatedProductsForDisplay)
          console.log("Produits pour affichage 3D:", updatedProductsForDisplay)
        }, 100)
      }, 100)

      // Message de succès avec statistiques détaillées
      toast({
        title: "Importation réussie",
        description: `Planogramme "${importedData.planogram_info.nom_planogram}" importé avec succès. ${placedProductsCount} produits placés${skippedProductsCount > 0 ? `, ${skippedProductsCount} ignorés` : ""}.`,
        variant: "default",
      })

      console.log(`=== RÉSUMÉ IMPORTATION ===`)
      console.log(`Meuble: ${newFurniture.name} (${newFurniture.sections}x${newFurniture.slots})`)
      console.log(`Produits placés: ${placedProductsCount}`)
      console.log(`Produits ignorés: ${skippedProductsCount}`)
      console.log(`Total positions: ${positionsForFurniture.length}`)
    } catch (error) {
      console.error("Erreur lors de l'importation:", error)
      toast({
        title: "Erreur d'importation",
        description: "Une erreur est survenue lors de l'importation du planogramme",
        variant: "destructive",
      })
    }
  }

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

  const renderRefrigerator2D = () => {
    return (
      <div className="relative">
        <div className={`absolute ${isRTL ? "left-full" : "right-full"} top-0 bottom-0 ${isRTL ? "pl-2" : "pr-2"}`}>
          {Array.from({ length: currentFurniture.sections }).map((_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className={`flex items-center ${isRTL ? "justify-start" : "justify-end"} font-medium text-xs sm:text-sm text-muted-foreground`}
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
                className="flex items-center justify-center font-medium text-xs sm:text-sm text-muted-foreground"
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

        <div className="w-full h-12 sm:h-16 bg-gray-800 rounded-b-md flex items-center justify-between px-2 sm:px-4 mt-1">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-700 rounded-md flex items-center justify-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
          </div>
          <div className="w-3/4 h-6 sm:h-10 bg-gray-900 rounded-md"></div>
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-700 rounded-md flex items-center justify-center">
            <Snowflake className="h-3 w-3 sm:h-5 sm:w-5 text-blue-300" />
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
              className={`flex items-center ${isRTL ? "justify-start" : "justify-end"} font-medium text-xs sm:text-sm text-muted-foreground`}
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
                className="flex items-center justify-center font-medium text-xs sm:text-sm text-muted-foreground"
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
          <div className="w-full h-4 sm:h-6 bg-blue-100 opacity-30 border-b border-gray-400"></div>
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

        <div className="w-full h-6 sm:h-8 bg-gray-600 rounded-b-md mt-1"></div>
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

  // Composant Sidebar pour desktop
  const DesktopSidebar = () => (
    <div
      className={`
        ${isSidebarOpen ? "w-80" : "w-0"} 
        transition-all duration-300 ease-in-out
        border-r bg-muted/30 overflow-hidden
        hidden lg:block
      `}
    >
      <div className={`w-80 p-4 ${isSidebarOpen ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}>
        <SidebarContent />
      </div>
    </div>
  )

  // Composant Sidebar mobile
  const MobileSidebar = () => (
    <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>{t("furnitureEditor.editeur")}</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <SidebarContent />
        </div>
      </SheetContent>
    </Sheet>
  )

  // Contenu de la sidebar (réutilisable)
  const SidebarContent = () => (
    <div className="space-y-4">
      <Tabs defaultValue="type">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="type" className="text-xs sm:text-sm">
            <Package className="h-4 w-4 mr-1 sm:mr-2" />
            {t("productImport.type")}
          </TabsTrigger>
          <TabsTrigger value="products" className="text-xs sm:text-sm">
            <Package className="h-4 w-4 mr-1 sm:mr-2" />
            {t("productImport.produits")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="type" className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm sm:text-lg font-medium">{t("productImport.furnitureType")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant={currentFurniture.type === "clothing-rack" ? "default" : "outline"}
                className="justify-start text-xs sm:text-sm h-8 sm:h-10"
                onClick={() => changeFurnitureType("clothing-rack")}
              >
                <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t("productImport.portant")}
              </Button>
              <Button
                variant={currentFurniture.type === "wall-display" ? "default" : "outline"}
                className="justify-start text-xs sm:text-sm h-8 sm:h-10"
                onClick={() => changeFurnitureType("wall-display")}
              >
                <Grid className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t("furnitureEditor.mural")}
              </Button>
              <Button
                variant={currentFurniture.type === "accessory-display" ? "default" : "outline"}
                className="justify-start text-xs sm:text-sm h-8 sm:h-10"
                onClick={() => changeFurnitureType("accessory-display")}
              >
                <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t("furnitureEditor.accessoires")}
              </Button>
              <Button
                variant={currentFurniture.type === "modular-cube" ? "default" : "outline"}
                className="justify-start text-xs sm:text-sm h-8 sm:h-10"
                onClick={() => changeFurnitureType("modular-cube")}
              >
                <Cube className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t("productImport.cube")}
              </Button>
              <Button
                variant={currentFurniture.type === "gondola" ? "default" : "outline"}
                className="justify-start text-xs sm:text-sm h-8 sm:h-10"
                onClick={() => changeFurnitureType("gondola")}
              >
                <Grid className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t("productImport.furnitureTypes.gondola")}
              </Button>
              <Button
                variant={currentFurniture.type === "table" ? "default" : "outline"}
                className="justify-start text-xs sm:text-sm h-8 sm:h-10"
                onClick={() => changeFurnitureType("table")}
              >
                <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t("productImport.table")}
              </Button>
              <Button
                variant={currentFurniture.type === "refrigerator" ? "default" : "outline"}
                className="justify-start text-xs sm:text-sm h-8 sm:h-10"
                onClick={() => changeFurnitureType("refrigerator")}
              >
                <Snowflake className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t("productImport.frigo")}
              </Button>
              <Button
                variant={currentFurniture.type === "refrigerated-showcase" ? "default" : "outline"}
                className="justify-start text-xs sm:text-sm h-8 sm:h-10"
                onClick={() => changeFurnitureType("refrigerated-showcase")}
              >
                <Snowflake className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t("furnitureEditor.frigo_presentoir")}
              </Button>
              <Button
                variant={currentFurniture.type === "clothing-display" ? "default" : "outline"}
                className="justify-start text-xs sm:text-sm h-8 sm:h-10"
                onClick={() => changeFurnitureType("clothing-display")}
              >
                <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t("furnitureEditor.presentoir_vetements")}
              </Button>
              <Button
                variant={currentFurniture.type === "clothing-wall" ? "default" : "outline"}
                className="justify-start text-xs sm:text-sm h-8 sm:h-10"
                onClick={() => changeFurnitureType("clothing-wall")}
              >
                <Grid className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t("furnitureEditor.mur_exposition")}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm sm:text-lg font-medium">{t("furnitureEditor.TitleConfiguration")}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium">{t("furnitureEditor.sections")}</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent"
                    onClick={() =>
                      updateFurniture({
                        ...currentFurniture,
                        sections: Math.max(1, currentFurniture.sections - 1),
                      })
                    }
                    disabled={currentFurniture.sections <= 1}
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
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
                    className="text-center text-xs sm:text-sm h-8 sm:h-10"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent"
                    onClick={() => updateFurniture({ ...currentFurniture, sections: currentFurniture.sections + 1 })}
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium">{t("furnitureEditor.emplacement")}</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent"
                    onClick={() =>
                      updateFurniture({
                        ...currentFurniture,
                        slots: Math.max(1, currentFurniture.slots - 1),
                      })
                    }
                    disabled={currentFurniture.slots <= 1}
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
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
                    className="text-center text-xs sm:text-sm h-8 sm:h-10"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent"
                    onClick={() => updateFurniture({ ...currentFurniture, slots: currentFurniture.slots + 1 })}
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium">{t("productImport.dimensions")}</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">{t("productImport.width")} (m)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={currentFurniture.width}
                      onChange={(e) =>
                        updateFurniture({ ...currentFurniture, width: Number.parseFloat(e.target.value) })
                      }
                      className="text-center text-xs h-8"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t("productImport.height")} (m)</label>
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
                      className="text-center text-xs h-8"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t("productImport.depth")} (m)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={currentFurniture.depth}
                      onChange={(e) =>
                        updateFurniture({ ...currentFurniture, depth: Number.parseFloat(e.target.value) })
                      }
                      className="text-center text-xs h-8"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium">{t("furnitureEditor.couleur")}</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={currentFurniture.color || "#333333"}
                    onChange={(e) => updateFurniture({ ...currentFurniture, color: e.target.value })}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={currentFurniture.color || "#333333"}
                    onChange={(e) => updateFurniture({ ...currentFurniture, color: e.target.value })}
                    className="flex-1 text-xs h-8"
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
              className="text-xs sm:text-sm h-8 sm:h-10"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                className="p-2 border rounded-md text-xs sm:text-sm h-8 sm:h-10"
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
                className="p-2 border rounded-md text-xs sm:text-sm h-8 sm:h-10"
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

          <div className="text-xs sm:text-sm text-muted-foreground">
            {filteredProducts.length} {t("productImport.produits")}
          </div>

          <ScrollArea className="h-[calc(100vh-400px)] sm:h-[calc(100vh-300px)]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1" style={{ direction: textDirection }}>
              {filteredProducts.map((product, index) => (
                <ProductItem key={`${product.primary_id}-${index}`} product={product} />
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-2 sm:col-span-3 text-center py-8 text-muted-foreground text-xs sm:text-sm">
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
          className="mt-2 text-xs h-8"
        >
          {t("furnitureEditor.debogage")}
        </Button>
      )}
    </div>
  )

  // Toolbar mobile
  const MobileToolbar = () => (
    <Sheet open={isMobileToolbarOpen} onOpenChange={setIsMobileToolbarOpen}>
      <SheetContent side="top" className="h-auto max-h-[80vh]">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>Outils</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "2D" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("2D")}
              className="rounded-r-none flex-1 text-xs h-8"
            >
              <Grid className="h-3 w-3 mr-2" />
              {t("productImport.TwoD")}
            </Button>
            <Button
              variant={viewMode === "3D" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("3D")}
              className="rounded-l-none flex-1 text-xs h-8"
            >
              <Cube className="h-3 w-3 mr-2" />
              {t("productImport.ThreeD")}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <AIGenerationDialog onImport={handleImportPlanogram} />
            <Button
              variant="outline"
              size="sm"
              onClick={checkAndFixProductQuantities}
              className="text-xs h-8 bg-transparent"
            >
              <Settings className="h-3 w-3 mr-2" />
              {t("furnitureEditor.optimisation")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={synchronizeProductQuantities}
              className="text-xs h-8 bg-transparent"
            >
              <Grid className="h-3 w-3 mr-2" />
              {t("furnitureEditor.synchronisation")}
            </Button>
            <Button variant="outline" size="sm" onClick={refreshView} className="text-xs h-8 bg-transparent">
              <ArrowLeft className="h-3 w-3 mr-2" />
              {t("furnitureEditor.refresher")}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <FurnitureSettingsDialog furniture={currentFurniture} updateFurniture={updateFurniture} />
            <SaveFurnitureDialog
              furniture={currentFurniture}
              products={products}
              cells={cells}
              onSave={saveFurnitureToLibrary}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <div className="mt-16 sm:mt-20 lg:mt-24" dir={textDirection}>
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-2 sm:p-4 pt-4 sm:pt-6 border-b bg-background">
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-1 min-w-0">
              <Button
                variant="outline"
                size="icon"
                asChild
                className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent flex-shrink-0"
              >
                <Link href="/Editor">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </Button>

              {/* Bouton toggle sidebar desktop */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex h-8 w-8 sm:h-10 sm:w-10"
              >
                {isSidebarOpen ? (
                  <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>

              {/* Bouton sidebar mobile */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden h-8 w-8 sm:h-10 sm:w-10"
              >
                <Menu className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>

              <h1 className="text-sm sm:text-lg md:text-2xl font-bold truncate">{t("furnitureEditor.editeur")}</h1>
            </div>

            {/* Desktop toolbar */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "2D" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("2D")}
                  className="rounded-r-none text-xs h-8"
                >
                  <Grid className="h-3 w-3 mr-2" />
                  {t("productImport.TwoD")}
                </Button>
                <Button
                  variant={viewMode === "3D" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("3D")}
                  className="rounded-l-none text-xs h-8"
                >
                  <Cube className="h-3 w-3 mr-2" />
                  {t("productImport.ThreeD")}
                </Button>
              </div>

              <AIGenerationDialog onImport={handleImportPlanogram} />

              <Button
                variant="outline"
                size="sm"
                onClick={checkAndFixProductQuantities}
                className="text-xs h-8 bg-transparent"
              >
                <Settings className="h-3 w-3 mr-2" />
                {t("furnitureEditor.optimisation")}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={synchronizeProductQuantities}
                className="text-xs h-8 bg-transparent"
              >
                <Grid className="h-3 w-3 mr-2" />
                {t("furnitureEditor.synchronisation")}
              </Button>

              <Button variant="outline" size="sm" onClick={refreshView} className="text-xs h-8 bg-transparent">
                <ArrowLeft className="h-3 w-3 mr-2" />
                {t("furnitureEditor.refresher")}
              </Button>

              <FurnitureSettingsDialog furniture={currentFurniture} updateFurniture={updateFurniture} />
              <SaveFurnitureDialog
                furniture={currentFurniture}
                products={products}
                cells={cells}
                onSave={saveFurnitureToLibrary}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            </div>

            {/* Mobile toolbar button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMobileToolbarOpen(true)}
              className="md:hidden h-8 w-8 sm:h-10 sm:w-10"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>

          {/* Main content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Desktop Sidebar */}
            <DesktopSidebar />

            {/* Main canvas area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-2 sm:p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs sm:text-sm md:text-lg font-medium truncate">
                    {t(`furnitureEditor.${currentFurniture.type.replace("-", "_")}`)}
                  </h2>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {currentFurniture.sections} {t("furnitureEditor.sections")} × {currentFurniture.slots}{" "}
                    {t("furnitureEditor.emplacement")}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-2 sm:p-4">
                {viewMode === "2D" ? (
                  <div className="furniture-2d-container overflow-auto border rounded-md p-2 sm:p-4 bg-muted/20 min-h-full">
                    <div
                      className="relative bg-white mx-auto"
                      style={{
                        width: `${Math.min(
                          currentFurniture.type === "clothing-rack"
                            ? cellWidth * currentFurniture.slots
                            : cellWidth * currentFurniture.slots + 2,
                          typeof window !== "undefined" ? window.innerWidth - 100 : 800,
                        )}px`,
                        minHeight: `${
                          currentFurniture.type === "clothing-rack"
                            ? cellHeight * 2
                            : cellHeight * currentFurniture.sections + 2
                        }px`,
                      }}
                    >
                      {currentFurniture.type === "clothing-rack" ? (
                        <div className="relative">
                          <div
                            className="w-full h-3 sm:h-4 bg-gray-400 rounded-t-md"
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
                                  className="flex items-center justify-end font-medium text-xs sm:text-sm text-muted-foreground"
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
                                    className="flex items-center justify-center font-medium text-xs sm:text-sm text-muted-foreground"
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

                            <div className="w-full h-3 sm:h-4 bg-gray-300 mb-2 rounded-t-sm"></div>
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
                            <div className="w-full h-4 sm:h-6 bg-gray-300 mt-2 rounded-b-sm flex items-center justify-between px-2 sm:px-4">
                              <div className="w-1/3 h-2 sm:h-4 bg-gray-400 rounded-sm"></div>
                              <div className="w-1/3 h-2 sm:h-4 bg-gray-400 rounded-sm"></div>
                              <div className="w-1/3 h-2 sm:h-4 bg-gray-400 rounded-sm"></div>
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
                                  className="flex items-center justify-end font-medium text-xs sm:text-sm text-muted-foreground"
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
                                    className="flex items-center justify-center font-medium text-xs sm:text-sm text-muted-foreground"
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
                              className="w-full h-6 sm:h-8 bg-amber-900 mt-2 rounded-b-sm"
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
                                className="flex items-center justify-end font-medium text-xs sm:text-sm text-muted-foreground"
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
                                  className="flex items-center justify-center font-medium text-xs sm:text-sm text-muted-foreground"
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
                  <div className="furniture-3d-container border rounded-md overflow-hidden bg-white h-full min-h-[300px] sm:min-h-[400px] md:min-h-[600px]">
                    <Canvas
                      shadows
                      className="threejs-canvas"
                      style={{ background: "#ffffff" }}
                      gl={{ preserveDrawingBuffer: true }}
                    >
                      {render3DFurniture()}
                      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[5, 5, 5]} intensity={0.6} castShadow />
                      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
                    </Canvas>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Sidebar */}
          <MobileSidebar />

          {/* Mobile Toolbar */}
          <MobileToolbar />
        </div>
      </DndProvider>
    </div>
  )
}
