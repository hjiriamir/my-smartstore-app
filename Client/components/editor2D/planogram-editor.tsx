"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useThree, Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import "@/components/multilingue/i18n.js"
import { useTranslation } from "react-i18next"
import { Trash2, Package, ChevronLeft, ChevronRight, Download, CuboidIcon as Cube, Grid, ImageIcon, FileText, Layers, Save, Settings, Minus, MoveHorizontal, MoveVertical } from 'lucide-react'
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import * as THREE from "three"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useProductStore } from "@/lib/product-store"
import type { Product, ProductInstance } from "@/lib/product-store"
//import { initializeExampleProducts } from "@/lib/product-store"
import { useFurnitureStore } from "@/lib/furniture-store"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { SavePlanogramDialog } from "@/components/save-planogram-dialog"
import { SaveFurnitureDialog } from "@/components/editor2D/FurnitureEditor/save-furniture-dialog"

// Types
interface PlanogramCell {
  id: string
  productId: string | null
  instanceId: string | null
  x: number
  y: number
  furnitureType: string
  quantity?: number // Nombre de produits à afficher dans cette cellule
  side?: string
  // Ajouter ces propriétés
  etagere?: number
  colonne?: number
  face?: 'front' | 'back' | 'left' | 'right'
}

interface SceneCaptureRef {
  current: ((callback: (dataUrl: string) => void) => void) | null;
}

// Modifier l'interface PlanogramConfig pour inclure le type de meuble et ses dimensions
interface PlanogramConfig {
  id?: string
  name: string
  rows: number
  columns: number
  cellWidth: number
  cellHeight: number
  furnitureType: string
  displayMode: "compact" | "spaced" // Mode d'affichage: compact ou espacé
  furnitureDimensions: {
    width: number
    height: number
    depth: number
    baseHeight: number
    shelfThickness: number
  }
  // Ajouter ces nouvelles propriétés
  planogramDetails?: {
    nbre_colonnes: number
    nbre_etageres: number
  }
  gondolaDetails?: {
    nbre_colonnes_back: number
    nbre_colonnes_front: number
    nbre_etageres_back: number
    nbre_etageres_front: number
  }
  shelvesDisplayDetails?: {
    nbre_colonnes_back: number
    nbre_colonnes_front: number
    nbre_etageres_back: number
    nbre_etageres_front: number
    nb_colonnes_left_right: number
    nb_etageres_left_right: number
  }
  // Add these new properties for separate side controls
  shelvesConfig: {
    rows: number // Nombre d'étagères global pour toutes les faces
    frontBackColumns: number // Nombre de colonnes pour les faces avant/arrière
    leftRightColumns: number // Nombre de colonnes pour les faces gauche/droite
  }
}




const generateFileName = (baseName: string, suffix: string, extension: string) => {
  const cleanBase = (baseName || 'planogram').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${cleanBase}_${suffix}.${extension}`;
}



const uploadFile = async (file: File, fileName: string, filesBaseName: string): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file, generateFileName(filesBaseName, fileName.split('-')[0], fileName.split('.')[1]));
  
  try {
    const response = await fetch("http://localhost:8081/api/furniture/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data.filePath;
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    toast({
      title: "Erreur d'upload",
      description: "Échec du téléchargement du fichier",
      variant: "destructive",
    });
    throw error;
  }
};

// Drag item type
const ItemTypes = {
  PRODUCT: "product",
  PLANOGRAM_ITEM: "planogram_item",
}

// Types de meubles
const FurnitureTypes = {
  PLANOGRAM: "planogram",
  GONDOLA: "gondola",
  SHELVES_DISPLAY: "shelves-display", // Add this new type
}

// Product Item Component (draggable)
const ProductItem = ({ product }: { product: Product }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PRODUCT,
    item: { id: product.primary_id, type: ItemTypes.PRODUCT, isNewInstance: true },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

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
      <div className="mt-2 text-center">
        <div className="text-xs font-medium truncate w-20">{product.name}</div>
        <div className="text-[10px] text-muted-foreground truncate w-20">{product.primary_id}</div>
      </div>
    </div>
  )
}

// Planogram Cell Component (droppable)
const PlanogramCell = ({
  cell,
  products,
  productInstances,
  onDrop,
  onRemove,
  onUpdateQuantity,
  cellWidth,
  cellHeight,
  planogramConfig,
}: {
  cell: PlanogramCell
  products: Product[]
  productInstances: ProductInstance[]
  onDrop: (cellId: string, productId: string, instanceId: string | null, isNewInstance: boolean) => void
  onRemove: (cellId: string) => void
  onUpdateQuantity: (cellId: string, quantity: number) => void
  cellWidth: number
  cellHeight: number
  planogramConfig: PlanogramConfig
}) => {
  const { t } = useTranslation()
  // Filtrer les instances de produits pour ce type de meuble
  const filteredProductInstances = productInstances.filter((pi) => pi.furnitureType === planogramConfig.furnitureType)

  const productInstance = cell.instanceId
    ? filteredProductInstances.find((pi) => pi.instanceId === cell.instanceId)
    : null

  const product = productInstance ? products.find((p) => p.primary_id === productInstance.productId) : null

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.PRODUCT, ItemTypes.PLANOGRAM_ITEM],
    drop: (item: { id: string; type: string; instanceId?: string; isNewInstance?: boolean }) => {
      onDrop(cell.id, item.id, item.instanceId || null, !!item.isNewInstance)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  // For products that are already in the planogram
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PLANOGRAM_ITEM,
    item: {
      id: productInstance?.productId,
      type: ItemTypes.PLANOGRAM_ITEM,
      instanceId: cell.instanceId,
      isNewInstance: false,
    },
    canDrag: !!cell.instanceId,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  // Gérer le changement de quantité
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = Number.parseInt(e.target.value, 10) || 1
    onUpdateQuantity(cell.id, quantity)
  }

  // Fonction pour générer une grille de produits en 2D
  const renderCompactProductGrid = () => {
    if (!product || !product.image) return null

    const quantity = cell.quantity || 1
    const maxPerRow = Math.ceil(Math.sqrt(quantity))
    const rows = Math.ceil(quantity / maxPerRow)

    // Calculer la taille de chaque produit en fonction du nombre
    const itemWidth = 100 / maxPerRow
    const itemHeight = 100 / rows

    return (
      <div
        className="absolute inset-1 grid"
        style={{
          gridTemplateColumns: `repeat(${maxPerRow}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: "1px",
        }}
      >
        {Array.from({ length: quantity }).map((_, index) => (
          <div key={index} className="flex items-center justify-center overflow-hidden">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="object-contain max-h-full max-w-full"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ))}
      </div>
    )
  }

  // Fonction pour traduire les côtés
  const getSideLabel = (side: string | undefined, cellX: number) => {
    if (side) {
      if (side === "left") return t("productImport.leftSide")
      if (side === "front") return t("productImport.frontSide")
      if (side === "back") return t("productImport.backSide")
      if (side === "right") return t("productImport.rightSide")
      return t(side)
    }

    if (planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY) {
      const leftRightColumns = planogramConfig.shelvesConfig?.leftRightColumns || 1
      const frontBackColumns = planogramConfig.shelvesConfig?.frontBackColumns || 3

      // Calculer les limites de chaque section
      const leftLimit = leftRightColumns
      const frontLimit = leftLimit + frontBackColumns
      const backLimit = frontLimit + frontBackColumns

      if (cellX < leftLimit) {
        return t("productImport.leftSide")
      } else if (cellX >= leftLimit && cellX < frontLimit) {
        return t("productImport.frontSide")
      } else if (cellX >= frontLimit && cellX < backLimit) {
        return t("productImport.backSide")
      } else {
        return t("productImport.rightSide")
      }
    }

    return ""
  }

  return (
    <div
      ref={drop}
      className={`
        relative border border-dashed flex items-center justify-center
        ${isOver ? "bg-primary/10 border-primary" : "border-gray-300"}
        ${product ? "border-solid" : ""}
        ${
          planogramConfig.furnitureType === FurnitureTypes.GONDOLA
            ? cell.x < planogramConfig.columns / 2
              ? "bg-blue-50/30"
              : "bg-red-50/30"
            : ""
        }
        ${
          planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY
            ? cell.x < planogramConfig.columns / 4
              ? "bg-blue-100/30 border-blue-300" // Left side - plus visible
              : cell.x >= planogramConfig.columns / 4 && cell.x < planogramConfig.columns / 2
                ? "bg-gray-700/10"
                : cell.x >= planogramConfig.columns / 2 && cell.x < (planogramConfig.columns * 3) / 4
                  ? "bg-gray-700/20"
                  : "bg-gray-800/10"
            : ""
        }
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
          {planogramConfig.displayMode === "compact" ? (
            renderCompactProductGrid()
          ) : (
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
            </div>
          )}

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

          {/* Contrôle de quantité */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center bg-white/80 text-xs p-1">
            <span className="mr-1">{t("productImport.qty")}:</span>
            <input
              type="number"
              min="1"
              max="20"
              value={cell.quantity || 1}
              onChange={handleQuantityChange}
              className="w-10 h-5 text-center text-xs border rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Indicateur de face pour la gondole */}
      {planogramConfig.furnitureType === FurnitureTypes.GONDOLA && !product && (
        <span className="text-[10px] text-muted-foreground opacity-50">
          {cell.x < planogramConfig.columns / 2 ? t("productImport.faceA") : t("productImport.faceB")}
        </span>
      )}
      {planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY && !product && (
        <span className="text-[10px] text-muted-foreground opacity-50">{getSideLabel(cell.side, cell.x)}</span>
      )}
    </div>
  )
}

// Debug component to log scene information
const DebugInfo = () => {
  const { scene } = useThree()

  useEffect(() => {
    console.log("Scene children:", scene.children)
  }, [scene])

  return null
}

// 3D Shelf Component
const Shelf = ({ position, size, color = "#FFFFFF" }) => {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

// Composant Gondola amélioré avec dimensions personnalisables
const Gondola = ({ position, dimensions, rows, columns }) => {
  const { width, height, depth, baseHeight, shelfThickness } = dimensions
  const shelfSpacing = height / rows

  // More realistic gondola colors
  const baseColor = "#9e9e9e"
  const structureColor = "#757575"
  const shelfColor = "#bdbdbd"
  const metalColor = "#b0b0b0"
  const edgeColor = "#d0d0d0"

  return (
    <group position={position}>
      {/* Base of the gondola */}
      <mesh position={[0, baseHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, baseHeight, depth]} />
        <meshStandardMaterial color={baseColor} roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Back panel */}
      <mesh position={[0, height / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color={structureColor} roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Vertical supports on sides */}
      <mesh position={[-width / 2 + 0.05, height / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.1, height, depth]} />
        <meshStandardMaterial color={structureColor} roughness={0.6} metalness={0.3} />
      </mesh>

      <mesh position={[width / 2 - 0.05, height / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.1, height, depth]} />
        <meshStandardMaterial color={structureColor} roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Shelves for both sides */}
      {Array.from({ length: rows }).map((_, rowIndex) => {
        const shelfY = (rowIndex + 1) * shelfSpacing
        const shelfWidth = width - 0.1

        return (
          <group key={`shelf-group-${rowIndex}`}>
            {/* Side A shelf */}
            <mesh
              position={[0, shelfY, -depth / 4]}
              rotation={[0.03, 0, 0]} // Slight tilt for better product visibility
              receiveShadow
              castShadow
            >
              <boxGeometry args={[shelfWidth, shelfThickness, depth / 2 - 0.05]} />
              <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.2} />
            </mesh>

            {/* Side A edge trim */}
            <mesh position={[0, shelfY + 0.02, -depth / 2 + 0.05]} receiveShadow castShadow>
              <boxGeometry args={[shelfWidth, shelfThickness + 0.04, 0.05]} />
              <meshStandardMaterial color={edgeColor} metalness={0.4} roughness={0.3} />
            </mesh>

            {/* Side B shelf */}
            <mesh
              position={[0, shelfY, depth / 4]}
              rotation={[0.03, Math.PI, 0]} // Slight tilt for better product visibility
              receiveShadow
              castShadow
            >
              <boxGeometry args={[shelfWidth, shelfThickness, depth / 2 - 0.05]} />
              <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.2} />
            </mesh>

            {/* Side B edge trim */}
            <mesh position={[0, shelfY + 0.02, depth / 2 - 0.05]} receiveShadow castShadow>
              <boxGeometry args={[shelfWidth, shelfThickness + 0.04, 0.05]} />
              <meshStandardMaterial color={edgeColor} metalness={0.4} roughness={0.3} />
            </mesh>

            {/* Price tag holders */}
            <mesh position={[0, shelfY + 0.04, -depth / 2 + 0.03]} receiveShadow>
              <boxGeometry args={[shelfWidth, 0.02, 0.01]} />
              <meshStandardMaterial color={metalColor} metalness={0.6} roughness={0.2} />
            </mesh>

            <mesh position={[0, shelfY + 0.04, depth / 2 - 0.03]} receiveShadow>
              <boxGeometry args={[shelfWidth, 0.02, 0.01]} />
              <meshStandardMaterial color={metalColor} metalness={0.6} roughness={0.2} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// Composant ShelvesDisplay amélioré
const ShelvesDisplay = ({ position, dimensions, rows, columns, planogramConfig }) => {
  const { width, height, depth, baseHeight, shelfThickness } = dimensions

  // Récupérer les configurations spécifiques
  const shelvesRows = planogramConfig?.shelvesConfig?.rows || rows
  const frontBackColumns = planogramConfig?.shelvesConfig?.frontBackColumns || 3
  const leftRightColumns = planogramConfig?.shelvesConfig?.leftRightColumns || 1

  const shelfSpacing = height / shelvesRows

  // Colors for the shelves display - matching the image
  const baseColor = "#f5f5f5"
  const shelfColor = "#ffffff"
  const metalColor = "#e0e0e0"
  const structureColor = "#f0f0f0"
  const backPanelColor = "#f8f8f8"
  const leftSideColor = "#f0f0f0"
  const rightSideColor = "#e8e8e8"

  return (
    <group position={position}>
      {/* Base of the furniture */}
      <mesh position={[0, baseHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, baseHeight, depth]} />
        <meshStandardMaterial color={baseColor} roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Main structure - a single long piece of furniture with shelves on both sides */}
      <group>
        {/* Central back panel */}
        <mesh position={[0, height / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[width, height, 0.05]} />
          <meshStandardMaterial color={backPanelColor} roughness={0.6} metalness={0.1} />
        </mesh>

        {/* Side panels */}
        <mesh position={[-width / 2 + 0.025, height / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.05, height, depth]} />
          <meshStandardMaterial color={leftSideColor} roughness={0.6} metalness={0.1} />
        </mesh>

        <mesh position={[width / 2 - 0.025, height / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.05, height, depth]} />
          <meshStandardMaterial color={rightSideColor} roughness={0.6} metalness={0.1} />
        </mesh>

        {/* Shelves - for all four sides with unified row configuration */}
        {Array.from({ length: shelvesRows }).map((_, rowIndex) => {
          const shelfY = (rowIndex + 1) * shelfSpacing

          return (
            <group key={`shelf-group-${rowIndex}`}>
              {/* Front side */}
              <mesh position={[0, shelfY, depth / 2 - 0.05]} receiveShadow castShadow>
                <boxGeometry args={[width - 0.1, shelfThickness, 0.6]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              {/* Back side */}
              <mesh position={[0, shelfY, -depth / 2 + 0.05]} receiveShadow castShadow>
                <boxGeometry args={[width - 0.1, shelfThickness, 0.6]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              {/* Côté gauche - Étagère plus visible orientée vers l'extérieur */}
              <mesh position={[-width / 2 - 0.1, shelfY, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
                <boxGeometry args={[depth - 0.1, shelfThickness, 0.8]} /> {/* Réduire la profondeur */}
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              {/* Côté droit - Étagère plus visible orientée vers l'extérieur */}
              <mesh position={[width / 2, shelfY, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
                <boxGeometry args={[depth - 0.1, shelfThickness, 1.2]} />
                <meshStandardMaterial color={shelfColor} roughness={0.5} metalness={0.1} />
              </mesh>

              {/* Metal edge pour le côté gauche */}
              <mesh
                position={[-width / 2 - 0.1, shelfY + 0.02, 0]}
                rotation={[0, Math.PI / 2, 0]}
                receiveShadow
                castShadow
              >
                <boxGeometry args={[depth - 0.1, shelfThickness + 0.04, 0.05]} />
                <meshStandardMaterial color={metalColor} metalness={0.3} roughness={0.3} />
              </mesh>

              {/* Metal edges for shelves */}
              <mesh position={[0, shelfY + 0.02, depth / 2]} receiveShadow castShadow>
                <boxGeometry args={[width - 0.1, shelfThickness + 0.04, 0.05]} />
                <meshStandardMaterial color={metalColor} metalness={0.3} roughness={0.3} />
              </mesh>

              <mesh position={[0, shelfY + 0.02, -depth / 2]} receiveShadow castShadow>
                <boxGeometry args={[width - 0.1, shelfThickness + 0.04, 0.05]} />
                <meshStandardMaterial color={metalColor} metalness={0.3} roughness={0.3} />
              </mesh>

              {/* Metal edges for sides */}
              <mesh position={[-width / 2, shelfY + 0.02, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
                <boxGeometry args={[depth - 0.1, shelfThickness + 0.04, 0.05]} />
                <meshStandardMaterial color={metalColor} metalness={0.3} roughness={0.3} />
              </mesh>

              <mesh position={[width / 2, shelfY + 0.02, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
                <boxGeometry args={[depth - 0.1, shelfThickness + 0.04, 0.05]} />
                <meshStandardMaterial color={metalColor} metalness={0.3} roughness={0.3} />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* Ceiling lighting */}
      <group position={[0, height + 0.5, 0]}>
        {/* Light fixtures */}
        {Array.from({ length: 3 }).map((_, i) => (
          <group key={`light-${i}`} position={[((i - 1) * width) / 3, 0, 0]}>
            <pointLight position={[0, -0.5, 0]} intensity={0.3} distance={5} decay={2} />
          </group>
        ))}
      </group>
    </group>
  )
}

//  la fonction createTransparentTexture
const createTransparentTexture = (imageUrl) => {
  return new Promise((resolve, reject) => {
    // Créer un canvas temporaire
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    // Charger l'image
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // Définir les dimensions du canvas
      canvas.width = img.width
      canvas.height = img.height

      // Dessiner l'image sur le canvas
      ctx.drawImage(img, 0, 0)

      // Obtenir les données de l'image
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Rendre le fond blanc transparent avec une meilleure détection
      for (let i = 0; i < data.length; i += 4) {
        // Détection plus précise des pixels blancs ou presque blancs
        // Utiliser une tolérance plus élevée et vérifier la luminosité
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        // Calculer la luminosité (0-255)
        const brightness = r * 0.299 + g * 0.587 + b * 0.114

        // Si le pixel est très lumineux (blanc ou presque blanc)
        if (brightness > 230 && r > 220 && g > 220 && b > 220) {
          // Rendre transparent
          data[i + 3] = 0
        }
      }

      // Remettre les données modifiées sur le canvas
      ctx.putImageData(imageData, 0, 0)

      // Créer une texture Three.js à partir du canvas
      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true

      resolve(texture)
    }

    img.onerror = (err) => {
      console.error("Erreur lors du chargement de l'image:", err)
      reject(err)
    }

    img.src = imageUrl
  })
}

// Composant Product3D complètement revu pour résoudre le problème de chevauchement
const Product3D = ({
  position,
  size,
  product,
  quantity = 1,
  displayMode = "compact",
  cellIndex,
  rotation = [0, 0, 0],
}) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!product || !product.image) {
      setIsLoading(false)
      return
    }

    // Charger la texture de l'image du produit
    const loadTexture = async () => {
      try {
        // Créer un texture loader
        const textureLoader = new THREE.TextureLoader()
        textureLoader.crossOrigin = "anonymous"

        // Charger la texture normale
        const texturePromise = new Promise<THREE.Texture>((resolve, reject) => {
          textureLoader.load(
            product.image,
            (loadedTexture) => {
              // Configurer la texture pour une meilleure apparence
              loadedTexture.encoding = THREE.sRGBEncoding
              loadedTexture.needsUpdate = true
              resolve(loadedTexture)
            },
            undefined,
            reject,
          )
        })

        const loadedTexture = await texturePromise
        setTexture(loadedTexture)
        setIsLoading(false)
      } catch (err) {
        console.error("Error loading texture:", err)
        setError(true)
        setIsLoading(false)
      }
    }

    loadTexture()

    return () => {
      if (texture) {
        texture.dispose()
      }
    }
  }, [product])

  if (isLoading || !product) {
    return null
  }

  // Extraire les coordonnées de position
  const [baseX, baseY, baseZ] = position
  const [totalWidth, height, depth] = size

  // Déterminer si c'est une rotation latérale (pour les côtés gauche/droit)
  const isLateralRotation = Math.abs(rotation[1]) === Math.PI / 2

  // Dans le composant Product3D, modifions la logique de distribution des produits pour réduire l'espacement

  // Remplacer la section de calcul de l'espacement et de positionnement des produits dans le composant Product3D par:
  // Réduire la largeur individuelle pour éviter les chevauchements
  // Utiliser un facteur de réduction plus important quand la quantité augmente
  const scaleFactor = quantity > 1 ? 0.8 : 0.9
const productWidth = isLateralRotation ? (depth / quantity) * scaleFactor : (totalWidth / quantity) * scaleFactor
const spacing = isLateralRotation 
  ? ((depth - productWidth * quantity) / (quantity + 1)) * 0.15
  : ((totalWidth - productWidth * quantity) / (quantity + 1)) * 0.15

  const productInstances = []

  for (let i = 0; i < quantity; i++) {
    // Positionner différemment selon l'orientation
    let x = baseX
    let z = baseZ

    if (isLateralRotation) {
      const effectiveDepth = depth * 0.8
      const startZ = baseZ - effectiveDepth / 2 + spacing
      z = startZ + i * (productWidth + spacing)
    } else {
      // Pour les faces avant/arrière
      const effectiveWidth = totalWidth * 0.9
      const startX = baseX - effectiveWidth / 2 + spacing
      x = startX + i * (productWidth + spacing)
    }

    // Ajouter une légère variation aléatoire pour plus de réalisme (réduite)
    const jitterX = (Math.random() - 0.5) * 0.0005
    const jitterY = (Math.random() - 0.5) * 0.0005
    const jitterZ = (Math.random() - 0.5) * 0.0005

    // Ajuster la taille pour les produits selon leur orientation
    const adjustedWidth = isLateralRotation ? height * 0.7 : productWidth
    const adjustedHeight = isLateralRotation ? productWidth * 1.1 : height * 0.8
    const standardProductHeight = 0.5 // Réduire légèrement la hauteur

    productInstances.push(
      <group
        key={`product-${cellIndex}-${i}`}
        position={[x + jitterX, baseY + jitterY, z + jitterZ]}
        rotation={rotation}
        castShadow
        receiveShadow
      >
        {texture ? (
          // Utiliser un plan avec la texture du produit
          <mesh castShadow receiveShadow position={[0, standardProductHeight / 2, 0]}>
            <planeGeometry args={[adjustedWidth, adjustedHeight]} />
            <meshBasicMaterial map={texture} transparent={true} side={THREE.DoubleSide} />
          </mesh>
        ) : (
          // Fallback si pas de texture
          <mesh castShadow receiveShadow position={[0, standardProductHeight / 2, 0]}>
            <planeGeometry args={[adjustedWidth, adjustedHeight]} />
            <meshBasicMaterial color={product.color || "#f3f4f6"} />
          </mesh>
        )}
      </group>,
    )
  }

  return <>{productInstances}</>
}

// Scene capture component for 3D export
const SceneCapture = ({ onCapture }) => {
  const { gl, scene, camera } = useThree();
  
  useEffect(() => {
    const handleCapture = () => {
      try {
        // Forcer un rendu avant la capture
        gl.render(scene, camera);
        
        // Créer un canvas temporaire
        const canvas = gl.domElement;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) {
          throw new Error("Impossible d'obtenir le contexte 2D");
        }
        
        // Dessiner un fond blanc
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Copier le contenu du canvas WebGL
        ctx.drawImage(canvas, 0, 0);
        
        // Convertir en URL de données
        const dataUrl = tempCanvas.toDataURL('image/png');
        onCapture(dataUrl);
      } catch (error) {
        console.error("Error capturing scene:", error);
        onCapture(null);
      }
    };

    // Attendre que la scène soit complètement rendue
    const timeoutId = setTimeout(handleCapture, 500);
    
    return () => clearTimeout(timeoutId);
  }, [gl, scene, camera, onCapture]);

  return null;
};




// 3D Planogram Scene
const PlanogramScene = ({
  planogramConfig,
  cells,
  products,
  productInstances,
  captureRef,
  productSizeScale = 100,
}: {
  planogramConfig: PlanogramConfig
  cells: PlanogramCell[]
  products: Product[]
  productInstances: ProductInstance[]
  captureRef?: React.MutableRefObject<((callback: (dataUrl: string) => void) => void) | null>
  productSizeScale?: number
}) => {
  const [capturing, setCapturing] = useState(false)
  const [captureCallback, setCaptureCallback] = useState<((dataUrl: string) => void) | null>(null)
  const { scene, gl, camera } = useThree()

  const [isSceneReady, setIsSceneReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSceneReady(true);
    }, 1000); // Délai pour s'assurer que tout est chargé

    return () => clearTimeout(timer);
  }, []);

  // Force un rendu explicite
  const forceRender = useCallback(() => {
    gl.render(scene, camera)
  }, [gl, scene, camera])

  // Set background color
  useEffect(() => {
    scene.background = new THREE.Color("#f0f8ff")
  }, [scene])

  // Expose capture function through ref
  useEffect(() => {
    if (captureRef && isSceneReady) {
      captureRef.current = (callback) => {
        setCapturing(true);
        setCaptureCallback(() => callback);
        // Force un rendu explicite
        gl.render(scene, camera);
      };
    }
  }, [captureRef, isSceneReady, gl, scene, camera]);

  // Handle capture completion
  const handleCapture = useCallback(
    (dataUrl: string) => {
      if (captureCallback) {
        captureCallback(dataUrl)
        setCapturing(false)
        setCaptureCallback(null)
      }
    },
    [captureCallback]
  )

  // Récupérer les dimensions du meuble
  const { width, height, depth, shelfThickness } = planogramConfig.furnitureDimensions
  const shelfSpacing = height / planogramConfig.rows

  // Calculer la taille standard des produits basée sur les dimensions des étagères
  const cellWidth = width / planogramConfig.columns
  const standardProductWidth = cellWidth * 0.9 * (productSizeScale / 100)
  const standardProductHeight = shelfSpacing * 0.5 * (productSizeScale / 100)
  const standardProductDepth = depth * 0.3 * (productSizeScale / 100)

  // Filtrer les instances de produits pour ce type de meuble
  const filteredProductInstances = productInstances.filter(
    (pi) => pi.furnitureType === planogramConfig.furnitureType
  )

  return (
    <>
      {/* Debug info */}
      <DebugInfo />
  
      {/* Camera setup */}
      <PerspectiveCamera
        makeDefault
        position={[
          planogramConfig.furnitureType === FurnitureTypes.GONDOLA
            ? 4
            : planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY
            ? 0
            : 0,
          planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY
            ? planogramConfig.rows * 0.5
            : planogramConfig.rows * 0.2,
          planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY
            ? planogramConfig.rows * 2
            : planogramConfig.rows * 1.5,
        ]}
        fov={
          planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY
            ? 30
            : 35
        }
      />
  
      {/* Lighting */}
      <>
        {/* Ambient light for overall illumination */}
        <ambientLight intensity={0.8} />
  
        {/* Main directional light (simulates sun) */}
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        >
          <orthographicCamera
            attach="shadow-camera"
            args={[-10, 10, 10, -10, 0.1, 50]}
          />  
        </directionalLight>

        {/* Fill lights for better product visibility */}
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <directionalLight position={[0, 5, 10]} intensity={0.5} />

        {/* Ceiling lights for shelves display */}
        {planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY && (
          <>
            <pointLight position={[-width / 3, height, 0]} intensity={0.5} distance={5} decay={2} />
            <pointLight position={[0, height, 0]} intensity={0.5} distance={5} decay={2} />
            <pointLight position={[width / 3, height, 0]} intensity={0.5} distance={5} decay={2} />
          </>
        )}

        {/* Éclairage supplémentaire pour les côtés */}
        {planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY && (
          <>
            {/* Lumières latérales plus intenses et mieux positionnées */}
            <spotLight
              position={[-width / 2 - 1.5, height / 2, 0]}
              intensity={1.2}
              angle={0.6}
              penumbra={0.5}
              distance={5}
              decay={1.5}
              target-position={[-width / 2 - 0.1, height / 2, 0]}
              castShadow
            />
            <spotLight
              position={[width / 2 + 1.5, height / 2, 0]}
              intensity={1.2}
              angle={0.6}
              penumbra={0.5}
              distance={5}
              decay={1.5}
              target-position={[width / 2 + 0.1, height / 2, 0]}
              castShadow
            />

            {/* Lumières d'appoint pour éviter les zones d'ombre */}
            <pointLight position={[-width / 2 - 0.5, height / 4, 0]} intensity={0.8} distance={2} decay={1} />
            <pointLight position={[width / 2 + 0.5, height / 4, 0]} intensity={0.8} distance={2} decay={1} />
            <pointLight position={[-width / 2 - 0.5, (height * 3) / 4, 0]} intensity={0.8} distance={2} decay={1} />
            <pointLight position={[width / 2 + 0.5, (height * 3) / 4, 0]} intensity={0.8} distance={2} decay={1} />
          </>
        )}

        {/* Spotlight to highlight products */}
        <spotLight position={[0, 8, 3]} angle={0.4} penumbra={0.5} intensity={0.6} castShadow shadow-bias={-0.0001} />

        {/* Additional front light to ensure product faces are well-lit */}
        <spotLight position={[0, 3, 8]} angle={0.6} penumbra={0.5} intensity={0.5} castShadow={false} />

        {/* Ground plane with subtle shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.8} metalness={0.1} />
        </mesh>
      </>

      {/* Grid helper */}
      <gridHelper args={[30, 30, "#888888", "#AAAAAA"]} position={[0, 0.01, 0]} />

      {/* Furniture based on type */}
      {planogramConfig.furnitureType === FurnitureTypes.PLANOGRAM ? (
        <group>
          {/* Back panel */}
          <Shelf position={[0, height / 2, -depth]} size={[width + 0.2, height, 0.05]} color="#EEEEEE" />

          {/* Side panels */}
          <Shelf position={[-width / 2 - 0.1, height / 2, -depth / 2]} size={[0.1, height, depth]} color="#EEEEEE" />
          <Shelf position={[width / 2 + 0.1, height / 2, -depth / 2]} size={[0.1, height, depth]} color="#EEEEEE" />

          {/* Shelves */}
          {Array.from({ length: planogramConfig.rows + 1 }).map((_, rowIndex) => (
            <Shelf
              key={`shelf-${rowIndex}`}
              position={[0, rowIndex * shelfSpacing, -depth / 2]}
              size={[width, shelfThickness, depth]}
              color="#FFFFFF"
            />
          ))}
        </group>
      ) : planogramConfig.furnitureType === FurnitureTypes.GONDOLA ? (
        <Gondola
          position={[0, 0, 0]}
          dimensions={planogramConfig.furnitureDimensions}
          rows={planogramConfig.rows}
          columns={planogramConfig.columns}
        />
      ) : planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY ? (
        <ShelvesDisplay
          position={[0, 0, 0]}
          dimensions={planogramConfig.furnitureDimensions}
          rows={planogramConfig.rows}
          columns={planogramConfig.columns}
          planogramConfig={planogramConfig}
        />
      ) : null}

      {/* Products - Filtrer les cellules pour ce type de meuble */}
      {cells
        .filter((cell) => cell.furnitureType === planogramConfig.furnitureType && cell.instanceId !== null)
        .map((cell, cellIndex) => {
          const productInstance = filteredProductInstances.find((pi) => pi.instanceId === cell.instanceId)
          if (!productInstance) return null

          const product = products.find((p) => p.primary_id === productInstance.productId)
          if (!product) return null

          // Calculate position based on furniture type
          let x = -width / 2 + cellWidth / 2 + cell.x * cellWidth

          // Calcul précis de la position Y pour que le produit soit exactement sur l'étagère
          const shelfY = (planogramConfig.rows -1 - cell.y) * shelfSpacing
          // Positionner le produit exactement sur l'étagère
          let y = shelfY + shelfThickness / 2

          let z = -depth / 2 + standardProductDepth / 2 // Positionner près du bord avant

          // For gondola, adjust z position based on which side
          if (planogramConfig.furnitureType === FurnitureTypes.GONDOLA) {
            const midColumn = planogramConfig.columns / 2
            if (cell.x < midColumn) {
              z = -depth / 4 // Face A (front)
            } else {
              z = depth / 4 // Face B (back)
            }
          }
          // la partie du code qui gère le positionnement des produits pour le ShelvesDisplay
          // la partie du code qui gère le positionnement des produits pour le ShelvesDisplay
else if (planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY) {
  const leftRightColumns = planogramConfig.shelvesConfig?.leftRightColumns || 1
  const frontBackColumns = planogramConfig.shelvesConfig?.frontBackColumns || 3

  // Calculer les limites de chaque section
  const leftLimit = leftRightColumns
  const frontLimit = leftLimit + frontBackColumns
  const backLimit = frontLimit + frontBackColumns

  // MODIFICATION ICI: Inverser la position Y pour que l'étagère 1 soit en bas
  // Ancien calcul: (planogramConfig.rows - cell.etagere + 1) * shelfSpacing
  const shelfY = (cell.etagere - 1) * shelfSpacing

  if (cell.x < leftLimit) {
    // Left side
    z = -depth / 2 + 0.7
    x = -width / 2 - 0.1
    // Position horizontale précise basée sur la colonne
    if (leftRightColumns > 1) {
      const positionRatio = (cell.colonne - 0.5) / leftRightColumns
      z = -depth / 2 + 0.2 + (depth - 0.4) * positionRatio
    }
    productInstance.rotation = [0, Math.PI / 2, 0]
  } else if (cell.x >= leftLimit && cell.x < frontLimit) {
    // Front side
    z = depth / 2 - 0.2
    // Position horizontale précise basée sur la colonne
    const relativeCol = cell.colonne - 1
    const columnWidth = width / frontBackColumns
    x = -width / 2 + columnWidth * (relativeCol + 0.5)
    productInstance.rotation = [0, 0, 0]
  } else if (cell.x >= frontLimit && cell.x < backLimit) {
    // Back side
    z = -depth / 2 + 0.2
    // Position horizontale précise basée sur la colonne
    const relativeCol = cell.colonne - 1
    const columnWidth = width / frontBackColumns
    x = -width / 2 + columnWidth * (relativeCol + 0.5)
    productInstance.rotation = [0, Math.PI, 0]
  } else {
    // Right side
    z = 0
    x = width / 2 - 0.15
    // Position horizontale précise basée sur la colonne
    if (leftRightColumns > 1) {
      const positionRatio = (cell.colonne - 0.5) / leftRightColumns
      z = depth / 2 - 0.2 - (depth - 0.4) * positionRatio
    }
    productInstance.rotation = [0, Math.PI / 2, 0]
  }
  
  // Ajuster la position Y pour être exactement sur l'étagère
  y = shelfY + shelfThickness / 2
}

          // Utiliser la quantité spécifiée ou 1 par défaut
          const quantity = cell.quantity || 1

          return (
            <Product3D
              key={cell.instanceId}
              position={[x, y, z]}
              size={[standardProductWidth, standardProductHeight, standardProductDepth]}
              product={product}
              quantity={quantity}
              displayMode={planogramConfig.displayMode}
              cellIndex={cellIndex}
              rotation={productInstance.rotation || [0, 0, 0]} // Utiliser la rotation définie plus haut
            />
          )
        })}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={20}
        target={[0, planogramConfig.rows / 2, 0]}
        minPolarAngle={Math.PI / 6} // Limit how low the camera can go
        maxPolarAngle={Math.PI / 2} // Limit how high the camera can go
      />

      {capturing && <SceneCapture onCapture={handleCapture} />}
    </>
  )
}



// Main Planogram Editor Component
export function PlanogramEditor() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const router = useRouter()
  const { toast } = useToast()
  const { products, addProduct, addProductInstance, deleteProductInstance } = useProductStore()
  const { addPlanogramFurniture } = useFurnitureStore()

 // const captureSceneRef = useRef<((callback: (dataUrl: string) => void) => void)>(null);

  const planogram2DRef = useRef<HTMLDivElement>(null)
  const planogram3DRef = useRef<HTMLDivElement>(null)
  const captureSceneRef = useRef<((callback: (dataUrl: string) => void) => void) | null>(null)

  // Planogram state
  // Initialiser avec des dimensions par défaut
  const [planogramConfig, setPlanogramConfig] = useState<PlanogramConfig>({
    name: t("productImport.Newplanogramme"),
    rows: 4,
    columns: 6,
    cellWidth: 120,
    cellHeight: 100,
    furnitureType: FurnitureTypes.GONDOLA,
    displayMode: "compact",
    furnitureDimensions: {
      width: 4,
      height: 4,
      depth: 1.2,
      baseHeight: 0.3,
      shelfThickness: 0.05,
    },
    // Ajouter les configurations par défaut
    planogramDetails: {
      nbre_colonnes: 6,
      nbre_etageres: 4,
    },
    gondolaDetails: {
      nbre_colonnes_back: 3,
      nbre_colonnes_front: 3,
      nbre_etageres_back: 4,
      nbre_etageres_front: 4,
    },
    shelvesDisplayDetails: {
      nbre_colonnes_back: 3,
      nbre_colonnes_front: 3,
      nbre_etageres_back: 4,
      nbre_etageres_front: 4,
      nb_colonnes_left_right: 1,
      nb_etageres_left_right: 4,
    },
    shelvesConfig: {
      rows: 4,
      frontBackColumns: 3,
      leftRightColumns: 1,
    },
  })

  const [cells, setCells] = useState<PlanogramCell[]>([])
  const [productInstances, setProductInstances] = useState<ProductInstance[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const [filesBaseName, setFilesBaseName] = useState(planogramConfig.name || 'planogram');
  const [image2DUrl, setImage2DUrl] = useState("");
  const [image3DUrl, setImage3DUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [isGeneratingFiles, setIsGeneratingFiles] = useState(false);
  
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("products")
  const [zoom, setZoom] = useState(100)
  const [viewMode, setViewMode] = useState<"2D" | "3D">("2D")
  const [isExporting, setIsExporting] = useState(false)
  const [forceRender, setForceRender] = useState(0)
  
  const [productSizeScale, setProductSizeScale] = useState(180) // Augmenter la taille par défaut pour un rendu plus compact
  const [defaultQuantity, setDefaultQuantity] = useState(3)

  // Get unique suppliers
  const suppliers = [...new Set(products.map((product) => product.supplier))].filter(Boolean).sort()
  //const categories = [ ...new Set( products.flatMap((product) => [product.category1_id, product.category2_id,product.category3_id])) ].filter(Boolean).sort()
  const { categories: allCategories } = useProductStore()
  const categoryIds = [...new Set(products.flatMap((product) => product.category_id))].filter(Boolean)
  //const categories = allCategories.filter(cat => categoryIds.includes(cat.id)).sort((a, b) => a.name.localeCompare(b.name))
  const categories = [...new Set(products.map((product) => product.category_id))].filter(Boolean).sort()
  
  
  // Initialize planogram cells
  useEffect(() => {
    const newCells: PlanogramCell[] = []

    if (planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY) {
      // Utiliser la configuration unifiée pour les étagères et séparée pour les colonnes
      const rows = planogramConfig.shelvesConfig?.rows || planogramConfig.rows
      const frontBackColumns = planogramConfig.shelvesConfig?.frontBackColumns || 3
      const leftRightColumns = planogramConfig.shelvesConfig?.leftRightColumns || 1

      // Calculer le nombre total de colonnes nécessaires
      const totalColumns = leftRightColumns * 2 + frontBackColumns * 2

      // Côté gauche
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < leftRightColumns; x++) {
          newCells.push({
            id: `cell-${x}-${y}-${planogramConfig.furnitureType}-left`,
            productId: null,
            instanceId: null,
            x,
            y,
            furnitureType: planogramConfig.furnitureType,
            quantity: defaultQuantity,
            side: "left",
            // Ajouter ces propriétés
            etagere: rows - y,
            colonne: x + 1,
            face: 'left'
          })
        }
      }

      // Face avant
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < frontBackColumns; x++) {
          newCells.push({
            id: `cell-${x + leftRightColumns}-${y}-${planogramConfig.furnitureType}-front`,
            productId: null,
            instanceId: null,
            x: x + leftRightColumns,
            y,
            furnitureType: planogramConfig.furnitureType,
            quantity: defaultQuantity,
            side: "front",
            // Ajouter ces propriétés
            etagere: rows - y,
            colonne: x + 1,
            face: 'front'
          })
        }
      }

      // Face arrière
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < frontBackColumns; x++) {
          newCells.push({
            id: `cell-${x + leftRightColumns + frontBackColumns}-${y}-${planogramConfig.furnitureType}-back`,
            productId: null,
            instanceId: null,
            x: x + leftRightColumns + frontBackColumns,
            y,
            furnitureType: planogramConfig.furnitureType,
            quantity: defaultQuantity,
            side: "back",
            // Ajouter ces propriétés
            etagere: planogramConfig.rows - y,
            colonne: x + 1,
            face: 'back'
          })
        }
      }

      // Côté droit
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < leftRightColumns; x++) {
          newCells.push({
            id: `cell-${x + leftRightColumns + frontBackColumns * 2}-${y}-${planogramConfig.furnitureType}-right`,
            productId: null,
            instanceId: null,
            x: x + leftRightColumns + frontBackColumns * 2,
            y,
            furnitureType: planogramConfig.furnitureType,
            quantity: defaultQuantity,
            side: "right",
            // Ajouter ces propriétés
            etagere: planogramConfig.rows - y,
            colonne: x + 1,
            face: 'right'
          })
        }
      }

      // Mettre à jour le nombre total de colonnes dans la configuration
      if (totalColumns !== planogramConfig.columns) {
        setPlanogramConfig((prev) => ({ ...prev, columns: totalColumns }))
      }
    } else {
      // Original logic for other furniture types
      for (let y = 0; y < planogramConfig.rows; y++) {
        for (let x = 0; x < planogramConfig.columns; x++) {
          newCells.push({
            id: `cell-${x}-${y}-${planogramConfig.furnitureType}`,
            productId: null,
            instanceId: null,
            x,
            y,
            furnitureType: planogramConfig.furnitureType,
            quantity: defaultQuantity,
            // Ajouter ces propriétés
            etagere: planogramConfig.rows - y,
            colonne: x + 1,
            face: planogramConfig.furnitureType === FurnitureTypes.GONDOLA 
              ? (x < planogramConfig.columns / 2 ? 'front' : 'back')
              : 'front'
          })
        }
      }
    }

    setCells((prevCells) => {
      // Filter existing cells to keep only those of another furniture type
      const otherTypeCells = prevCells.filter((cell) => cell.furnitureType !== planogramConfig.furnitureType)
      // Combine with new cells
      return [...otherTypeCells, ...newCells]
    })
  }, [
    planogramConfig.rows,
    planogramConfig.columns,
    planogramConfig.furnitureType,
    defaultQuantity,
    planogramConfig.shelvesConfig,
  ])

  // Log when cells or product instances change
  useEffect(() => {
    const filledCells = cells.filter((cell) => cell.instanceId !== null).length
    console.log(`Cells updated: ${filledCells} cells have products out of ${cells.length} total cells`)
    console.log("Product instances:", productInstances)
  }, [cells, productInstances])

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Vérifie que product.primary_Id existe avant d'utiliser toLowerCase()
    const primaryId = product.primary_id ? product.primary_id.toLowerCase() : '';
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

  // Generate a unique instance ID
  const generateInstanceId = () => {
    return `instance-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }

  // Initialiser les produits d'exemple
  useEffect(() => {
    //const exampleProducts = initializeExampleProducts()
    // Vérifier si les produits existent déjà pour éviter les doublons
    const existingIds = products.map((p) => p.primary_id)
    //const newProducts = exampleProducts.filter((p) => !existingIds.includes(p.primary_Id))

    /* if (newProducts.length > 0) {
      newProducts.forEach((product) => {
        addProduct(product)
      })
      toast({
        title: t("productImport.exampleProductsAdded"),
        description: t("productImport.exampleProductsAddedDesc", { count: newProducts.length }),
      })
    }*/
  }, [])

  // Handle drop on cell
  const handleDrop = (cellId: string, productId: string, draggedInstanceId: string | null, isNewInstance: boolean) => {
    console.log("handleDrop called:", { cellId, productId, draggedInstanceId, isNewInstance })

    // Trouver la cellule cible
    const targetCell = cells.find((c) => c.id === cellId)
    if (!targetCell) return

    // If it's a new instance from the product library
    if (isNewInstance) {
      const newInstanceId = generateInstanceId()
      console.log("Creating new instance:", newInstanceId, "for product:", productId)

      // Add the new product instance with the furniture type
      const newInstance = {
        instanceId: newInstanceId,
        productId,
        furnitureType: planogramConfig.furnitureType,
      }

      setProductInstances((prev) => {
        const newInstances = [...prev, newInstance]
        console.log("Updated product instances:", newInstances)
        return newInstances
      })

      // Ajouter l'instance au store global
      addProductInstance(newInstance)

      // Update the cell to reference this instance
      setCells((prev) => {
        const newCells = prev.map((cell) =>
          cell.id === cellId ? { ...cell, instanceId: newInstanceId, quantity: defaultQuantity } : cell,
        )
        console.log(
          "Updated cells:",
          newCells.filter((c) => c.instanceId !== null),
        )
        return newCells
      })

      // Force a re-render of the 3D view
      setForceRender((prev) => prev + 1)
    }
    // If it's moving an existing instance
    else if (draggedInstanceId) {
      console.log("Moving existing instance:", draggedInstanceId, "to cell:", cellId)

      // Find the source cell to get its quantity
      const sourceCell = cells.find((c) => c.instanceId === draggedInstanceId)
      const quantity = sourceCell?.quantity || defaultQuantity

      // Just update the cell to reference the existing instance
      setCells((prev) => {
        const newCells = prev.map((cell) => {
          // If this is the target cell, update it with the instance
          if (cell.id === cellId) {
            return { ...cell, instanceId: draggedInstanceId, quantity }
          }
          // If this is the source cell (where the instance was), clear it
          else if (cell.instanceId === draggedInstanceId) {
            return { ...cell, instanceId: null, quantity: defaultQuantity }
          }
          // Otherwise leave the cell unchanged
          return cell
        })
        console.log(
          "Updated cells after move:",
          newCells.filter((c) => c.instanceId !== null),
        )
        return newCells
      })

      // Force a re-render of the 3D view
      setForceRender((prev) => prev + 1)
    }
  }

  // Handle remove product from cell
  const handleRemoveProduct = (cellId: string) => {
    // Get the instance ID from the cell
    const cell = cells.find((c) => c.id === cellId)
    if (!cell || !cell.instanceId) return

    console.log("Removing product from cell:", cellId, "instance:", cell.instanceId)

    // Remove the instance ID from the cell
    setCells((prev) => {
      const newCells = prev.map((c) => (c.id === cellId ? { ...c, instanceId: null, quantity: defaultQuantity } : c))
      console.log(
        "Updated cells after removal:",
        newCells.filter((c) => c.instanceId !== null),
      )
      return newCells
    })

    // Check if this instance is used in any other cells
    const isInstanceUsedElsewhere = cells.some((c) => c.id !== cellId && c.instanceId === cell.instanceId)

    // If not used elsewhere, remove the instance from productInstances
    if (!isInstanceUsedElsewhere) {
      setProductInstances((prev) => {
        const newInstances = prev.filter((pi) => pi.instanceId !== cell.instanceId)
        console.log("Updated product instances after removal:", newInstances)
        return newInstances
      })

      // Supprimer l'instance du store global
      deleteProductInstance(cell.instanceId)
    }

    // Force a re-render of the 3D view
    setForceRender((prev) => prev + 1)
  }

  // Handle update quantity
  const handleUpdateQuantity = (cellId: string, quantity: number) => {
    setCells((prev) => {
      return prev.map((cell) => (cell.id === cellId ? { ...cell, quantity } : cell))
    })

    // Force a re-render of the 3D view
    setForceRender((prev) => prev + 1)
  }

  // Toggle display mode
  const toggleDisplayMode = () => {
    setPlanogramConfig((prev) => ({
      ...prev,
      displayMode: prev.displayMode === "compact" ? "spaced" : "compact",
    }))

    // Force a re-render
    setForceRender((prev) => prev + 1)
  }

  // Update planogram config
  const updatePlanogramConfig = (key: keyof PlanogramConfig, value: any) => {
    setPlanogramConfig((prev) => ({ ...prev, [key]: value }))
  }

  // Update furniture dimensions
  const updateFurnitureDimensions = (key: keyof PlanogramConfig["furnitureDimensions"], value: number) => {
    setPlanogramConfig((prev) => ({
      ...prev,
      furnitureDimensions: {
        ...prev.furnitureDimensions,
        [key]: value,
      },
    }))
  }

  // Save planogram to library for use in store display
  const savePlanogramToLibrary = (name: string, description: string, data: {
    products: any[],
    image2DUrl?: string,
    image3DUrl?: string,
    pdfUrl?: string
  }) => {
    // Create furniture item from planogram config
    const furnitureToSave = {
      id: `${planogramConfig.furnitureType}-${Date.now()}`,
      type: planogramConfig.furnitureType,
      name,
      sections: planogramConfig.rows,
      slots: planogramConfig.columns,
      width: planogramConfig.furnitureDimensions.width,
      height: planogramConfig.furnitureDimensions.height,
      depth: planogramConfig.furnitureDimensions.depth,
      color: "#f0f0f0",
      x: 0,
      y: 0,
      z: 0,
      rotation: 0,
      imageUrl_2D: data.image2DUrl,
      imageUrl_3D: data.image3DUrl,
      pdfUrl: data.pdfUrl,
      shelvesConfig: planogramConfig.furnitureType === "shelves-display"
        ? {
            rows: planogramConfig.shelvesConfig.rows,
            frontBackColumns: planogramConfig.shelvesConfig.frontBackColumns,
            leftRightColumns: planogramConfig.shelvesConfig.leftRightColumns,
          }
        : undefined,
    };
  
    console.log(`Saving ${planogramConfig.furnitureType} to library with ${data.products.length} products`);
  
    // Add to furniture store
    addPlanogramFurniture(furnitureToSave, data.products, description);
  
    toast({
      title: t("productImport.planogramSaved"),
      description: t("productImport.planogramSavedDesc", { name }),
    });
  };

  // Save planogram
  const savePlanogram = () => {
    // Here you would save the planogram to your backend or local storage
    toast({
      title: t("productImport.planogramSaved"),
      description: t("productImport.planogramSavedSuccess", { name: planogramConfig.name }),
    })
  }

  // Export planogram as image
  const exportAsImage = async () => {
    setIsExporting(true)

    try {
      if (viewMode === "2D") {
        const element = planogram2DRef.current
        if (!element) {
          throw new Error("Element not found")
        }

        const canvas = await html2canvas(element, {
          backgroundColor: "#ffffff",
          scale: 2, // Higher quality
        })

        // Create a download link
        const link = document.createElement("a")
        link.download = `${planogramConfig.name.replace(/\s+/g, "_")}_2D.png`
        link.href = canvas.toDataURL("image/png")
        link.click()

        toast({
          title: t("productImport.exportSuccess"),
          description: t("productImport.exportSuccessDesc2D"),
        })
      } else {
        // For 3D view, use the Three.js renderer to capture
        if (!captureSceneRef.current) {
          throw new Error("3D capture not available")
        }

        captureSceneRef.current((dataUrl) => {
          if (!dataUrl) {
            toast({
              title: t("productImport.exportError"),
              description: t("productImport.exportErrorDesc3D"),
              variant: "destructive",
            })
            setIsExporting(false)
            return
          }

          // Create a download link
          const link = document.createElement("a")
          link.download = `${planogramConfig.name.replace(/\s+/g, "_")}_3D.png`
          link.href = dataUrl
          link.click()

          toast({
            title: t("productImport.exportSuccess"),
            description: t("productImport.exportSuccessDesc3D"),
          })

          setIsExporting(false)
        })

        return // Early return as we'll set isExporting to false in the callback
      }
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: t("productImport.exportError"),
        description: t("productImport.exportErrorDesc"),
        variant: "destructive",
      })
    } finally {
      if (viewMode === "2D") {
        setIsExporting(false)
      }
    }
  }

  // Export planogram as PDF
  const exportAsPDF = async () => {
    setIsExporting(true)

    try {
      if (viewMode === "2D") {
        const element = planogram2DRef.current
        if (!element) {
          throw new Error("Element not found")
        }

        const canvas = await html2canvas(element, {
          backgroundColor: "#ffffff",
          scale: 2, // Higher quality
        })

        const imgData = canvas.toDataURL("image/png")

        // Calculate PDF dimensions based on the canvas aspect ratio
        const imgWidth = 210 // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        const pdf = new jsPDF("p", "mm", "a4")
        pdf.text(`${t("productImport.planogram")}: ${planogramConfig.name}`, 10, 10)
        pdf.text(`${t("productImport.view")}: 2D`, 10, 20)
        pdf.text(`${t("productImport.date")}: ${new Date().toLocaleDateString()}`, 10, 30)
        pdf.addImage(imgData, "PNG", 0, 40, imgWidth, imgHeight)
        pdf.save(`${planogramConfig.name.replace(/\s+/g, "_")}_2D.pdf`)

        toast({
          title: t("productImport.exportSuccess"),
          description: t("productImport.exportSuccessPDFDesc2D"),
        })
      } else {
        // For 3D view, use the Three.js renderer to capture
        if (!captureSceneRef.current) {
          throw new Error("3D capture not available")
        }

        captureSceneRef.current((dataUrl) => {
          // Create PDF from the captured image
          const pdf = new jsPDF("p", "mm", "a4")
          pdf.text(`${t("productImport.planogram")}: ${planogramConfig.name}`, 10, 10)
          pdf.text(`${t("productImport.view")}: 3D`, 10, 20)
          pdf.text(`${t("productImport.date")}: ${new Date().toLocaleDateString()}`, 10, 30)

          // Create an image element to get dimensions
          const img = new Image()
          img.src = dataUrl

          img.onload = () => {
            // Calculate PDF dimensions based on the image aspect ratio
            const imgWidth = 210 // A4 width in mm
            const imgHeight = (img.height * imgWidth) / img.width

            pdf.addImage(dataUrl, "PNG", 0, 40, imgWidth, imgHeight)
            pdf.save(`${planogramConfig.name.replace(/\s+/g, "_")}_3D.pdf`)

            toast({
              title: t("productImport.exportSuccess"),
              description: t("productImport.exportSuccessPDFDesc3D"),
            })

            setIsExporting(false)
          }
        })

        return // Early return as we'll set isExporting to false in the callback
      }
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: t("productImport.exportError"),
        description: t("productImport.exportErrorDesc"),
        variant: "destructive",
      })
    } finally {
      if (viewMode === "2D") {
        setIsExporting(false)
      }
    }
  }

  // Calculate effective cell dimensions based on zoom
  const effectiveCellWidth = (planogramConfig.cellWidth * zoom) / 100
  const effectiveCellHeight = (planogramConfig.cellHeight * zoom) / 100

  // Log when switching view modes
  useEffect(() => {
    console.log("View mode changed to:", viewMode)
    if (viewMode === "3D") {
      console.log("3D view activated with", cells.filter((c) => c.instanceId !== null).length, "products")
    }
  }, [viewMode, cells])

  // Filtrer les cellules pour le type de meuble actuel
  const currentCells = cells.filter((cell) => cell.furnitureType === planogramConfig.furnitureType)

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="w-full">
      <div className="mt-12">
        <DndProvider backend={HTML5Backend}>
          <div className="container mx-auto py-6 max-w-full">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-4" : "space-x-4"}`}>
                  <Button variant="outline" size="icon" onClick={() => router.back()}>
                    {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                  <h1 className="text-2xl font-bold">{t("planogramEditor")}</h1>
                </div>
                <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"}`}>
                  <div className={`flex border rounded-md ${isRTL ? "ml-2" : "mr-2"}`}>
                    <Button
                      variant={viewMode === "2D" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("2D")}
                      className={isRTL ? "rounded-r-none" : "rounded-l-none"}
                    >
                      <Grid className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                      {t("productImport.TwoD")}
                    </Button>
                    <Button
                      variant={viewMode === "3D" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("3D")}
                      className={isRTL ? "rounded-l-none" : "rounded-r-none"}
                    >
                      <Cube className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                      {t("productImport.ThreeD")}
                    </Button>
                  </div>

                  <Button variant="outline" size="sm" onClick={toggleDisplayMode} className={isRTL ? "ml-2" : "mr-2"}>
                    <Layers className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {planogramConfig.displayMode === "compact"
                      ? t("productImport.compactMode")
                      : t("productImport.spacedMode")}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Download className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                        {t("productImport.export")}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRTL ? "end" : "start"} className={isRTL ? "text-right" : "text-left"}>
                      <DropdownMenuItem onClick={exportAsImage} disabled={isExporting}>
                        <ImageIcon className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                        {t("productImport.exportAsImage")} ({viewMode})
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportAsPDF} disabled={isExporting}>
                        <FileText className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                        {t("productImport.exportAsPDF")} ({viewMode})
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button variant="outline" onClick={() => router.push("/product-library")}>
                    {t("productLibrary")}
                  </Button>
                  <Button onClick={savePlanogram}>
                    <Save className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("productImport.save")}
                  </Button>
                  <SavePlanogramDialog
  planogramConfig={planogramConfig}
  cells={cells}
  products={products}
  productInstances={productInstances}
  onSave={savePlanogramToLibrary}
  filesBaseName={filesBaseName}
  setFilesBaseName={setFilesBaseName}
  uploadFile={uploadFile}
  generateFileName={generateFileName}
  viewMode={viewMode}
  setViewMode={setViewMode}
  image2DUrl={image2DUrl}
  setImage2DUrl={setImage2DUrl}
  image3DUrl={image3DUrl}
  setImage3DUrl={setImage3DUrl}
  pdfUrl={pdfUrl}
  setPdfUrl={setPdfUrl}
  isGeneratingFiles={isGeneratingFiles}
  setIsGeneratingFiles={setIsGeneratingFiles}
>
  <Button variant="outline">
    <Package className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
    {t("productImport.saveForShop")}
  </Button>
</SavePlanogramDialog>

                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - will be on right in RTL mode */}
                <div className={`lg:col-span-1 ${isRTL ? "order-last" : "order-first"}`}>
                  <Card>
                    <CardContent className="p-4">
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid grid-cols-3 mb-4">
                          <TabsTrigger value="products">
                            <Package className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                            {t("productImport.produits")}
                          </TabsTrigger>
                          <TabsTrigger value="settings">
                            <Settings className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                            {t("productImport.parametres")}
                          </TabsTrigger>
                          <TabsTrigger value="furniture">
                            <Cube className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                            {t("productImport.meubles")}
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="products" className="space-y-4">
                          <div className="space-y-2">
                            <Input
                              placeholder={t("productImport.rechercheProduct")}
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
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
                            {filteredProducts.length} {t("productImport.produittrouve")}
                          </div>

                          <ScrollArea className="h-[calc(100vh-300px)]">
                            <div className="grid grid-cols-2 gap-2 p-1">
                            {filteredProducts.map((product, index) => (
                              <ProductItem key={`${product.primary_id}-${index}`} product={product} />
                            ))}
                              {filteredProducts.length === 0 && (
                                <div className="col-span-2 text-center py-8 text-muted-foreground">
                                  {t("productImport.noProductsFound")}
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="settings" className="space-y-4">
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">{t("productImport.planogramName")}</label>
                              <Input
                                value={planogramConfig.name}
                                onChange={(e) => updatePlanogramConfig("name", e.target.value)}
                                className="mt-1"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">{t("productImport.Nombrerange")}</label>
                              <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"}`}>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => updatePlanogramConfig("rows", Math.max(1, planogramConfig.rows - 1))}
                                  disabled={planogramConfig.rows <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                  type="number"
                                  min="1"
                                  value={planogramConfig.rows}
                                  onChange={(e) =>
                                    updatePlanogramConfig("rows", Math.max(1, Number.parseInt(e.target.value) || 1))
                                  }
                                  className="text-center"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => updatePlanogramConfig("rows", planogramConfig.rows + 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">{t("productImport.Nombrecolone")}</label>
                              <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"}`}>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    updatePlanogramConfig("columns", Math.max(1, planogramConfig.columns - 1))
                                  }
                                  disabled={planogramConfig.columns <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                  type="number"
                                  min="1"
                                  value={planogramConfig.columns}
                                  onChange={(e) =>
                                    updatePlanogramConfig("columns", Math.max(1, Number.parseInt(e.target.value) || 1))
                                  }
                                  className="text-center"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => updatePlanogramConfig("columns", planogramConfig.columns + 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">{t("productImport.defaultQuantity")}</label>
                              <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"}`}>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setDefaultQuantity(Math.max(1, defaultQuantity - 1))}
                                  disabled={defaultQuantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={defaultQuantity}
                                  onChange={(e) =>
                                    setDefaultQuantity(Math.max(1, Math.min(20, Number.parseInt(e.target.value) || 1)))
                                  }
                                  className="text-center"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setDefaultQuantity(Math.min(20, defaultQuantity + 1))}
                                  disabled={defaultQuantity >= 20}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">{t("productImport.celluleLargeur")}</label>
                              <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"}`}>
                                <MoveHorizontal className="h-4 w-4 text-muted-foreground" />
                                <Slider
                                  value={[planogramConfig.cellWidth]}
                                  min={80}
                                  max={200}
                                  step={10}
                                  onValueChange={(value) => updatePlanogramConfig("cellWidth", value[0])}
                                />
                                <span className="text-sm w-8">{planogramConfig.cellWidth}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">{t("productImport.celluleHauteur")}</label>
                              <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"}`}>
                                <MoveVertical className="h-4 w-4 text-muted-foreground" />
                                <Slider
                                  value={[planogramConfig.cellHeight]}
                                  min={60}
                                  max={180}
                                  step={10}
                                  onValueChange={(value) => updatePlanogramConfig("cellHeight", value[0])}
                                />
                                <span className="text-sm w-8">{planogramConfig.cellHeight}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                {t("productImport.zoom")} ({zoom}%)
                              </label>
                              <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"}`}>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                                  disabled={zoom <= 50}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Slider
                                  value={[zoom]}
                                  min={50}
                                  max={150}
                                  step={10}
                                  onValueChange={(value) => setZoom(value[0])}
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setZoom(Math.min(150, zoom + 10))}
                                  disabled={zoom >= 150}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Mode d'affichage */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">{t("productImport.affichageMode")}</label>
                              <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"}`}>
                                <select
                                  className="p-2 border rounded-md text-sm w-full"
                                  value={planogramConfig.displayMode}
                                  onChange={(e) => updatePlanogramConfig("displayMode", e.target.value)}
                                >
                                  <option value="compact">{t("productImport.displaychoise")}</option>
                                  <option value="spaced">{t("productImport.displaychoise1")}</option>
                                </select>
                              </div>
                            </div>

                            {/* Sélecteur de type de meuble */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">{t("productImport.meubleType")}</label>
                              <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"}`}>
                                <select
                                  className="p-2 border rounded-md text-sm w-full"
                                  value={planogramConfig.furnitureType}
                                  onChange={(e) => updatePlanogramConfig("furnitureType", e.target.value)}
                                >
                                  <option value={FurnitureTypes.PLANOGRAM}>{t("productImport.meubletypes")}</option>
                                  <option value={FurnitureTypes.GONDOLA}>{t("productImport.meubletypes1")}</option>
                                  <option value={FurnitureTypes.SHELVES_DISPLAY}>
                                    {t("productImport.meubletypes2")}
                                  </option>
                                </select>
                              </div>
                            </div>

                            {/* Dimensions du meuble */}
                            <div className="space-y-4 mt-4 p-4 border rounded-md bg-muted/10">
                              <h3 className="font-medium">{t("productImport.meubleDimensions")}</h3>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">{t("productImport.width")} (m)</label>
                                <div
                                  className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"}`}
                                >
                                  <Slider
                                    value={[planogramConfig.furnitureDimensions.width]}
                                    min={1}
                                    max={10}
                                    step={0.5}
                                    onValueChange={(value) => updateFurnitureDimensions("width", value[0])}
                                  />
                                  <span className="text-sm w-12">{planogramConfig.furnitureDimensions.width}m</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">{t("productImport.height")} (m)</label>
                                <div
                                  className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"}`}
                                >
                                  <Slider
                                    value={[planogramConfig.furnitureDimensions.height]}
                                    min={1}
                                    max={10}
                                    step={0.5}
                                    onValueChange={(value) => updateFurnitureDimensions("height", value[0])}
                                  />
                                  <span className="text-sm w-12">{planogramConfig.furnitureDimensions.height}m</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">{t("productImport.depth")} (m)</label>
                                <div
                                  className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"}`}
                                >
                                  <Slider
                                    value={[planogramConfig.furnitureDimensions.depth]}
                                    min={0.3}
                                    max={2}
                                    step={0.1}
                                    onValueChange={(value) => updateFurnitureDimensions("depth", value[0])}
                                  />
                                  <span className="text-sm w-12">{planogramConfig.furnitureDimensions.depth}m</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">{t("productImport.baseHeight")} (m)</label>
                                <div
                                  className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"}`}
                                >
                                  <Slider
                                    value={[planogramConfig.furnitureDimensions.baseHeight]}
                                    min={0.05}
                                    max={0.5}
                                    step={0.05}
                                    onValueChange={(value) => updateFurnitureDimensions("baseHeight", value[0])}
                                  />
                                  <span className="text-sm w-12">
                                    {planogramConfig.furnitureDimensions.baseHeight}m
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">{t("productImport.shelfThickness")} (m)</label>
                                <div
                                  className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"}`}
                                >
                                  <Slider
                                    value={[planogramConfig.furnitureDimensions.shelfThickness]}
                                    min={0.01}
                                    max={0.1}
                                    step={0.01}
                                    onValueChange={(value) => updateFurnitureDimensions("shelfThickness", value[0])}
                                  />
                                  <span className="text-sm w-12">
                                    {planogramConfig.furnitureDimensions.shelfThickness}m
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">{t("productImport.productSize")} (%)</label>
                                <div
                                  className={`flex items-center ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"}`}
                                >
                                  <Slider
                                    value={[productSizeScale]}
                                    min={50}
                                    max={300}
                                    step={10}
                                    onValueChange={(value) => setProductSizeScale(value[0])}
                                  />
                                  <span className="text-sm w-12">{productSizeScale}%</span>
                                </div>
                              </div>
                            </div>
                            {/* Contrôles spécifiques par type de meuble */}
                            {planogramConfig.furnitureType === FurnitureTypes.PLANOGRAM && (
                              <div className="space-y-4 mt-4 p-4 border rounded-md bg-blue-50/20">
                                <h3 className="font-medium">{t("productImport.planogramConfiguration")}</h3>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Nombre de colonnes</label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={planogramConfig.planogramDetails?.nbre_colonnes || planogramConfig.columns}
                                    onChange={(e) => {
                                      const newConfig = { ...planogramConfig }
                                      if (!newConfig.planogramDetails) newConfig.planogramDetails = { nbre_colonnes: 6, nbre_etageres: 4 }
                                      newConfig.planogramDetails.nbre_colonnes = Math.max(1, parseInt(e.target.value) || 1)
                                      setPlanogramConfig(newConfig)
                                    }}
                                    className="text-center"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Nombre d'étagères</label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={planogramConfig.planogramDetails?.nbre_etageres || planogramConfig.rows}
                                    onChange={(e) => {
                                      const newConfig = { ...planogramConfig }
                                      if (!newConfig.planogramDetails) newConfig.planogramDetails = { nbre_colonnes: 6, nbre_etageres: 4 }
                                      newConfig.planogramDetails.nbre_etageres = Math.max(1, parseInt(e.target.value) || 1)
                                      setPlanogramConfig(newConfig)
                                    }}
                                    className="text-center"
                                  />
                                </div>
                              </div>
                            )}

                            {planogramConfig.furnitureType === FurnitureTypes.GONDOLA && (
                              <div className="space-y-4 mt-4 p-4 border rounded-md bg-green-50/20">
                                <h3 className="font-medium">{t("productImport.gondolaConfiguration")}</h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Colonnes face avant</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={planogramConfig.gondolaDetails?.nbre_colonnes_front || Math.floor(planogramConfig.columns / 2)}
                                      onChange={(e) => {
                                        const newConfig = { ...planogramConfig }
                                        if (!newConfig.gondolaDetails) newConfig.gondolaDetails = { nbre_colonnes_back: 3, nbre_colonnes_front: 3, nbre_etageres_back: 4, nbre_etageres_front: 4 }
                                        newConfig.gondolaDetails.nbre_colonnes_front = Math.max(1, parseInt(e.target.value) || 1)
                                        setPlanogramConfig(newConfig)
                                      }}
                                      className="text-center"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Colonnes face arrière</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={planogramConfig.gondolaDetails?.nbre_colonnes_back || Math.floor(planogramConfig.columns / 2)}
                                      onChange={(e) => {
                                        const newConfig = { ...planogramConfig }
                                        if (!newConfig.gondolaDetails) newConfig.gondolaDetails = { nbre_colonnes_back: 3, nbre_colonnes_front: 3, nbre_etageres_back: 4, nbre_etageres_front: 4 }
                                        newConfig.gondolaDetails.nbre_colonnes_back = Math.max(1, parseInt(e.target.value) || 1)
                                        setPlanogramConfig(newConfig)
                                      }}
                                      className="text-center"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Étagères face avant</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={planogramConfig.gondolaDetails?.nbre_etageres_front || planogramConfig.rows}
                                      onChange={(e) => {
                                        const newConfig = { ...planogramConfig }
                                        if (!newConfig.gondolaDetails) newConfig.gondolaDetails = { nbre_colonnes_back: 3, nbre_colonnes_front: 3, nbre_etageres_back: 4, nbre_etageres_front: 4 }
                                        newConfig.gondolaDetails.nbre_etageres_front = Math.max(1, parseInt(e.target.value) || 1)
                                        setPlanogramConfig(newConfig)
                                      }}
                                      className="text-center"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Étagères face arrière</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={planogramConfig.gondolaDetails?.nbre_etageres_back || planogramConfig.rows}
                                      onChange={(e) => {
                                        const newConfig = { ...planogramConfig }
                                        if (!newConfig.gondolaDetails) newConfig.gondolaDetails = { nbre_colonnes_back: 3, nbre_colonnes_front: 3, nbre_etageres_back: 4, nbre_etageres_front: 4 }
                                        newConfig.gondolaDetails.nbre_etageres_back = Math.max(1, parseInt(e.target.value) || 1)
                                        setPlanogramConfig(newConfig)
                                      }}
                                      className="text-center"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY && (
                              <div className="space-y-4 mt-4 p-4 border rounded-md bg-purple-50/20">
                                <h3 className="font-medium">{t("productImport.shelvesDisplayConfiguration")}</h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Colonnes face avant</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={planogramConfig.shelvesDisplayDetails?.nbre_colonnes_front || planogramConfig.shelvesConfig?.frontBackColumns || 3}
                                      onChange={(e) => {
                                        const newConfig = { ...planogramConfig }
                                        if (!newConfig.shelvesDisplayDetails) newConfig.shelvesDisplayDetails = { nbre_colonnes_back: 3, nbre_colonnes_front: 3, nbre_etageres_back: 4, nbre_etageres_front: 4, nb_colonnes_left_right: 1, nb_etageres_left_right: 4 }
                                        newConfig.shelvesDisplayDetails.nbre_colonnes_front = Math.max(1, parseInt(e.target.value) || 1)
                                        setPlanogramConfig(newConfig)
                                      }}
                                      className="text-center"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Colonnes face arrière</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={planogramConfig.shelvesDisplayDetails?.nbre_colonnes_back || planogramConfig.shelvesConfig?.frontBackColumns || 3}
                                      onChange={(e) => {
                                        const newConfig = { ...planogramConfig }
                                        if (!newConfig.shelvesDisplayDetails) newConfig.shelvesDisplayDetails = { nbre_colonnes_back: 3, nbre_colonnes_front: 3, nbre_etageres_back: 4, nbre_etageres_front: 4, nb_colonnes_left_right: 1, nb_etageres_left_right: 4 }
                                        newConfig.shelvesDisplayDetails.nbre_colonnes_back = Math.max(1, parseInt(e.target.value) || 1)
                                        setPlanogramConfig(newConfig)
                                      }}
                                      className="text-center"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Étagères face avant</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={planogramConfig.shelvesDisplayDetails?.nbre_etageres_front || planogramConfig.shelvesConfig?.rows || 4}
                                      onChange={(e) => {
                                        const newConfig = { ...planogramConfig }
                                        if (!newConfig.shelvesDisplayDetails) newConfig.shelvesDisplayDetails = { nbre_colonnes_back: 3, nbre_colonnes_front: 3, nbre_etageres_back: 4, nbre_etageres_front: 4, nb_colonnes_left_right: 1, nb_etageres_left_right: 4 }
                                        newConfig.shelvesDisplayDetails.nbre_etageres_front = Math.max(1, parseInt(e.target.value) || 1)
                                        setPlanogramConfig(newConfig)
                                      }}
                                      className="text-center"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Étagères face arrière</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={planogramConfig.shelvesDisplayDetails?.nbre_etageres_back || planogramConfig.shelvesConfig?.rows || 4}
                                      onChange={(e) => {
                                        const newConfig = { ...planogramConfig }
                                        if (!newConfig.shelvesDisplayDetails) newConfig.shelvesDisplayDetails = { nbre_colonnes_back: 3, nbre_colonnes_front: 3, nbre_etageres_back: 4, nbre_etageres_front: 4, nb_colonnes_left_right: 1, nb_etageres_left_right: 4 }
                                        newConfig.shelvesDisplayDetails.nbre_etageres_back = Math.max(1, parseInt(e.target.value) || 1)
                                        setPlanogramConfig(newConfig)
                                      }}
                                      className="text-center"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Colonnes gauche/droite</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={planogramConfig.shelvesDisplayDetails?.nb_colonnes_left_right || planogramConfig.shelvesConfig?.leftRightColumns || 1}
                                      onChange={(e) => {
                                        const newConfig = { ...planogramConfig }
                                        if (!newConfig.shelvesDisplayDetails) newConfig.shelvesDisplayDetails = { nbre_colonnes_back: 3, nbre_colonnes_front: 3, nbre_etageres_back: 4, nbre_etageres_front: 4, nb_colonnes_left_right: 1, nb_etageres_left_right: 4 }
                                        newConfig.shelvesDisplayDetails.nb_colonnes_left_right = Math.max(1, parseInt(e.target.value) || 1)
                                        setPlanogramConfig(newConfig)
                                      }}
                                      className="text-center"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Étagères gauche/droite</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={planogramConfig.shelvesDisplayDetails?.nb_etageres_left_right || planogramConfig.shelvesConfig?.rows || 4}
                                      onChange={(e) => {
                                        const newConfig = { ...planogramConfig }
                                        if (!newConfig.shelvesDisplayDetails) newConfig.shelvesDisplayDetails = { nbre_colonnes_back: 3, nbre_colonnes_front: 3, nbre_etageres_back: 4, nbre_etageres_front: 4, nb_colonnes_left_right: 1, nb_etageres_left_right: 4 }
                                        newConfig.shelvesDisplayDetails.nb_etageres_left_right = Math.max(1, parseInt(e.target.value) || 1)
                                        setPlanogramConfig(newConfig)
                                      }}
                                      className="text-center"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        {/* Onglet pour les types de meubles */}
                        <TabsContent value="furniture" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Card
                              className={`cursor-pointer border-2 ${
                                planogramConfig.furnitureType === FurnitureTypes.PLANOGRAM
                                  ? "border-primary"
                                  : "border-muted"
                              }`}
                              onClick={() => updatePlanogramConfig("furnitureType", FurnitureTypes.PLANOGRAM)}
                            >
                              <CardContent className="p-4 flex flex-col items-center">
                                <div className="h-32 w-32 bg-muted/20 rounded-md flex items-center justify-center mb-2">
                                  <Grid className="h-16 w-16 text-muted-foreground" />
                                </div>
                                <span className="font-medium">{t("productImport.meubleTitle")} </span>
                                <span className="text-xs text-muted-foreground">
                                  {t("productImport.meubleDescription")}
                                </span>
                              </CardContent>
                            </Card>

                            <Card
                              className={`cursor-pointer border-2 ${
                                planogramConfig.furnitureType === FurnitureTypes.GONDOLA
                                  ? "border-primary"
                                  : "border-muted"
                              }`}
                              onClick={() => updatePlanogramConfig("furnitureType", FurnitureTypes.GONDOLA)}
                            >
                              <CardContent className="p-4 flex flex-col items-center">
                                <div className="h-32 w-32 bg-muted/20 rounded-md flex items-center justify-center mb-2">
                                  <Cube className="h-16 w-16 text-muted-foreground" />
                                </div>
                                <span className="font-medium">{t("productImport.meubleTitle1")} </span>
                                <span className="text-xs text-muted-foreground">
                                  {t("productImport.meubleDescription1")}
                                </span>
                              </CardContent>
                            </Card>
                            <Card
                              className={`cursor-pointer border-2 ${
                                planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY
                                  ? "border-primary"
                                  : "border-muted"
                              }`}
                              onClick={() => updatePlanogramConfig("furnitureType", FurnitureTypes.SHELVES_DISPLAY)}
                            >
                              <CardContent className="p-4 flex flex-col items-center">
                                <div className="h-32 w-32 bg-muted/20 rounded-md flex items-center justify-center mb-2">
                                  <Layers className="h-16 w-16 text-muted-foreground" />
                                </div>
                                <span className="font-medium">{t("productImport.meubleTitle2")}</span>
                                <span className="text-xs text-muted-foreground">
                                  {t("productImport.meubleDescription2")}
                                </span>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="p-4 bg-muted/20 rounded-md">
                            <h3 className="font-medium mb-2">{t("productImport.selectedmeubleinfo")}</h3>
                            {planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY ? (
                              <p className="text-sm text-muted-foreground">
                                {t("productImport.selectedmeubledescription2")}
                              </p>
                            ) : planogramConfig.furnitureType === FurnitureTypes.PLANOGRAM ? (
                              <p className="text-sm text-muted-foreground">
                                {t("productImport.selectedmeubledescription")}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {t("productImport.selectedmeubledescription1")}
                              </p>
                            )}
                          </div>

                          {/* Prévisualisation des dimensions */}
                          <div className="p-4 border rounded-md">
                            <h3 className="font-medium mb-2">{t("productImport.currentDimensions")}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p>
                                  <strong>{t("productImport.width")}:</strong>{" "}
                                  {planogramConfig.furnitureDimensions.width}m
                                </p>
                                <p>
                                  <strong>{t("productImport.height")}:</strong>{" "}
                                  {planogramConfig.furnitureDimensions.height}m
                                </p>
                                <p>
                                  <strong>{t("productImport.depth")}:</strong>{" "}
                                  {planogramConfig.furnitureDimensions.depth}m
                                </p>
                              </div>
                              <div>
                                <p>
                                  <strong>{t("productImport.baseHeight")}:</strong>{" "}
                                  {planogramConfig.furnitureDimensions.baseHeight}m
                                </p>
                                <p>
                                  <strong>{t("productImport.shelfThickness")}:</strong>{" "}
                                  {planogramConfig.furnitureDimensions.shelfThickness}m
                                </p>
                                <p>
                                  <strong>{t("productImport.spacing")}:</strong>{" "}
                                  {(planogramConfig.furnitureDimensions.height / planogramConfig.rows).toFixed(2)}m
                                </p>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>

                {/* Main planogram area */}
                <div className={`lg:col-span-3 ${isRTL ? "order-first" : "order-last"}`}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium">{planogramConfig.name}</h2>
                        <div className="text-sm text-muted-foreground">
                          {planogramConfig.rows} {t("ranger")} × {planogramConfig.columns} {t("colone")}
                        </div>
                      </div>

                      {viewMode === "2D" ? (
                     <div className="planogram-2d-container overflow-auto border rounded-md p-4 bg-muted/20">
                     <div
                       ref={planogram2DRef}
                       className="relative bg-white"
                       style={{
                         width: `${effectiveCellWidth * planogramConfig.columns + 2}px`,
                         minHeight: `${effectiveCellHeight * planogramConfig.rows + 2}px`,
                         direction: "ltr", // Force LTR direction for the planogram container
                       }}
                     >
                       {/* Row numbers */}
                       <div className={`absolute ${isRTL ? "left-full pl-2" : "right-full pr-2"} top-0 bottom-0`}>
                         {Array.from({ length: planogramConfig.rows }).map((_, rowIndex) => (
                           <div
                             key={`row-${rowIndex}`}
                             className={`flex items-center font-medium text-sm text-muted-foreground ${
                               isRTL ? "justify-start" : "justify-end"
                             }`}
                             style={{
                               height: `${effectiveCellHeight}px`,
                               width: "20px",
                             }}
                           >
                             {planogramConfig.rows - rowIndex}
                           </div>
                         ))}
                       </div>
                   
                       {/* Column numbers */}
                       <div className="absolute bottom-full left-0 right-0 pb-2">
                         <div className={`flex ${isRTL ? "flex-row-reverse" : ""}`}>
                           {Array.from({ length: planogramConfig.columns }).map((_, colIndex) => (
                             <div
                               key={`col-${colIndex}`}
                               className="flex items-center justify-center font-medium text-sm text-muted-foreground"
                               style={{
                                 width: `${effectiveCellWidth}px`,
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
                           gridTemplateColumns: `repeat(${planogramConfig.columns}, ${effectiveCellWidth}px)`,
                           gridTemplateRows: `repeat(${planogramConfig.rows}, ${effectiveCellHeight}px)`,
                           direction: "ltr", // Force LTR direction for grid regardless of page language
                         }}
                       >
                         {/* Filter cells for current furniture type */}
                         {cells
                           .filter((cell) => cell.furnitureType === planogramConfig.furnitureType)
                           .map((cell) => (
                             <PlanogramCell
                               key={cell.id}
                               cell={cell}
                               products={products}
                               productInstances={productInstances}
                               onDrop={handleDrop}
                               onRemove={handleRemoveProduct}
                               onUpdateQuantity={handleUpdateQuantity}
                               cellWidth={effectiveCellWidth}
                               cellHeight={effectiveCellHeight}
                               planogramConfig={planogramConfig}
                             />
                           ))}
                       </div>
                       {/* Gondola separator indicator in 2D mode */}
                       {viewMode === "2D" && planogramConfig.furnitureType === FurnitureTypes.GONDOLA && (
                         <div
                           className="absolute top-0 bottom-0 border-r-2 border-dashed border-primary/50 z-10 pointer-events-none"
                           style={{
                             left: `${(planogramConfig.columns / 2) * effectiveCellWidth}px`,
                           }}
                         >
                           <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-md text-xs font-medium text-primary border border-primary/50">
                             {t("productImport.faceA")} | {t("productImport.faceB")}
                           </div>
                         </div>
                       )}
                       {viewMode === "2D" && planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY && (
                         <>
                           {/* Vertical dividers with dynamic positioning based on configuration */}
                           {(() => {
                             const leftRightColumns = planogramConfig.shelvesConfig?.leftRightColumns || 1
                             const frontBackColumns = planogramConfig.shelvesConfig?.frontBackColumns || 3
                   
                             // Calculate separator positions
                             const leftFrontPosition = leftRightColumns * effectiveCellWidth
                             const frontBackPosition = (leftRightColumns + frontBackColumns) * effectiveCellWidth
                             const backRightPosition = (leftRightColumns + frontBackColumns * 2) * effectiveCellWidth
                   
                             return (
                               <>
                                 <div
                                   className="absolute top-0 bottom-0 border-r-2 border-dashed border-primary/50 z-10 pointer-events-none"
                                   style={{
                                     left: `${leftFrontPosition}px`,
                                   }}
                                 >
                                   <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-md text-xs font-medium text-primary border border-primary/50">
                                     {t("productImport.leftFront")}
                                   </div>
                                 </div>
                                 <div
                                   className="absolute top-0 bottom-0 border-r-2 border-dashed border-primary/50 z-10 pointer-events-none"
                                   style={{
                                     left: `${frontBackPosition}px`,
                                   }}
                                 >
                                   <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-md text-xs font-medium text-primary border border-primary/50">
                                     {t("productImport.frontBack")}
                                   </div>
                                 </div>
                                 <div
                                   className="absolute top-0 bottom-0 border-r-2 border-dashed border-primary/50 z-10 pointer-events-none"
                                   style={{
                                     left: `${backRightPosition}px`,
                                   }}
                                 >
                                   <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-md text-xs font-medium text-primary border border-primary/50">
                                     {t("productImport.backRight")}
                                   </div>
                                 </div>
                               </>
                             )
                           })()}
                         </>
                       )}
                     </div>
                   </div>
                      ) : (
                        <div className="planogram-3d-container border rounded-md overflow-hidden" style={{ height: "600px" }}>
                          <Canvas
                              shadows
                              key={`3d-canvas-${forceRender}`}
                              gl={{
                                preserveDrawingBuffer: true, // Important pour la capture
                                antialias: true,
                              }}
                              style={{
                                background: '#f0f8ff', // Couleur de fond cohérente
                              }}
                            >
                            <PlanogramScene
                              planogramConfig={planogramConfig}
                              cells={cells}
                              products={products}
                              productInstances={productInstances}
                              captureRef={captureSceneRef}
                              productSizeScale={productSizeScale}
                            />
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
    </div>
  )
}