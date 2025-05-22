"use client"
import { useState, useEffect, useRef, useCallback, Suspense } from "react"
import { useDrag, useDrop } from "react-dnd"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Html, useTexture, Environment, ContactShadows } from "@react-three/drei"
import {
  Plus,
  Package,
  RotateCw,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  PanelLeftClose,
  PanelLeft,
  ZoomIn,
  ZoomOut,
  Maximize,
  ArrowLeft,
  Map,
  AlertCircle,
  Info,
  Save,
  Download,
  ImageIcon,
  FileText,
  Settings,
  CheckCircle2,
} from "lucide-react"
import { Trash2 } from "lucide-react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { jsPDF } from "jspdf"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useProductStore } from "@/lib/product-store"
import { useFurnitureStore } from "@/lib/furniture-store"
import {
  ClothingRack,
  WallDisplay,
  AccessoryDisplay,
  ModularCube,
  GondolaDisplay,
  TableDisplay,
  PlanogramDisplay,
  RefrigeratorDisplay,
  RefrigeratedShowcase,
  CashierDisplay,
  ShelvesDisplay,
  ClothingWallDisplay,
  ClothingDisplay,
} from "@/components/editor2D/furniture-3d-components"
import { Wall, Window } from "@/components/editor2D/structural-3d-components"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import * as THREE from "three"
import "@/components/multilingue/i18n.js"
import { useTranslation } from "react-i18next"

// Room configuration
const ROOM_CONFIG = {
  width: 20,
  depth: 20,
  height: 4,
  wallColor: "#f5f5f5",
  floorColor: "#f0f0f0",
  floorTextureScale: 4,
}

// Drag item types
const ItemTypes = {
  FURNITURE: "furniture",
  WALL: "wall",
  WINDOW: "window",
}

// Composant pour précharger les textures des produits
const TexturePreloader = ({ products }) => {
  // Précharger toutes les textures des produits
  const productImages = products.map((product) => product.image).filter(Boolean)
  useTexture(productImages)
  return null
}

// Composant pour capturer la scène Three.js
const SceneCapture = ({ triggerCapture, onCaptureComplete, products }) => {
  const { gl, scene, camera } = useThree()
  const [texturesLoaded, setTexturesLoaded] = useState(false)

  // Précharger les textures
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader()
    const texturePromises = products
      .map((product) => product.image)
      .filter(Boolean)
      .map(
        (url) =>
          new Promise((resolve) => {
            textureLoader.load(url, resolve, undefined, resolve)
          }),
      )

    Promise.all(texturePromises)
      .then(() => {
        setTexturesLoaded(true)
        console.log("Toutes les textures sont chargées")
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des textures:", error)
        setTexturesLoaded(true) // Continuer même en cas d'erreur
      })
  }, [products])

  useEffect(() => {
    if (triggerCapture && texturesLoaded) {
      // Attendre un peu pour s'assurer que tout est rendu
      setTimeout(() => {
        try {
          // Forcer un rendu
          gl.render(scene, camera)

          // Obtenir l'image du canvas avec une qualité maximale
          const dataURL = gl.domElement.toDataURL("image/png", 1.0)

          // Passer l'image au callback
          onCaptureComplete(dataURL)
        } catch (error) {
          console.error("Erreur lors de la capture:", error)
          onCaptureComplete(null)
        }
      }, 500) // Attendre 500ms pour s'assurer que tout est rendu
    }
  }, [triggerCapture, texturesLoaded, gl, scene, camera, onCaptureComplete])

  return null
}

// Helper function to get element color
const getElementColor = (type: string): string => {
  switch (type) {
    case "wall":
      return "#555555"
    case "door":
      return "#8B4513"
    case "window":
      return "#87CEEB"
    case "shelf":
      return "#A0522D"
    case "rack":
      return "#708090"
    case "display":
      return "#4682B4"
    case "table":
      return "#CD853F"
    case "fridge":
      return "#B0C4DE"
    case "planogram":
      return "#6A5ACD"
    case "gondola":
      return "#20B2AA"
    case "line":
      return "#333333"
    case "rectangle":
      return "#5D8AA8"
    case "circle":
      return "#6495ED"
    case "chair":
      return "#8B8970"
    case "sofa":
      return "#9370DB"
    case "bed":
      return "#8B008B"
    case "plant":
      return "#228B22"
    case "counter":
      return "#D2691E"
    case "cashier":
      return "#FF7F50"
    case "mannequin":
      return "#E6E6FA"
    case "cube":
      return "#5D4037"
    default:
      return "#CCCCCC"
  }
}

// Floor Plan Selector Component
const FloorPlanSelector = ({ open, onOpenChange, onSelectPlan, floorPlans }) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir={textDirection}>
        <DialogHeader>
          <DialogTitle>Sélectionner un plan d'étage</DialogTitle>
          <DialogDescription>
            Choisissez un plan d'étage pour votre magasin. Seuls les meubles correspondant aux éléments du plan pourront
            être placés.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {floorPlans.length > 0 ? (
            <div className="grid gap-2">
              {floorPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => onSelectPlan(plan)}
                  className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted"
                >
                  <div>
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Mis à jour: {new Date(plan.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {plan.elements.length} éléments • {plan.elements.filter((e) => e.name).length} nommés
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Sélectionner
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucun plan d'étage trouvé. Créez d'abord un plan d'étage dans l'éditeur.
            </div>
          )}
        </div>
        <DialogFooter>
          <Link href="/floor-plan-editor">
            <Button variant="outline">
              <Map className="h-4 w-4 mr-2" />
              Créer un plan
            </Button>
          </Link>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Composant de dialogue pour le matching manuel
const ManualMatchDialog = ({ open, onOpenChange, furnitureId, furnitureName, floorPlan, onSelectElement }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  // Filtrer les éléments du plan qui peuvent être des meubles
  const furnitureElements =
    floorPlan?.elements.filter((element) =>
      [
        "shelf",
        "display",
        "table",
        "fridge",
        "planogram",
        "gondola",
        "counter",
        "cashier",
        "rack",
        "mannequin",
        "cube",
      ].includes(element.type),
    ) || []

  // Filtrer les éléments en fonction du terme de recherche
  const filteredElements = furnitureElements.filter(
    (element) =>
      element.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      element.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir={textDirection}>
        <DialogHeader>
          <DialogTitle>
            {t("productImport.floorPlan.associerFenetre")} "{furnitureName}"{" "}
            {t("productImport.floorPlan.associerFenetre1")}
          </DialogTitle>
          <DialogDescription>{t("productImport.floorPlan.associerFenetre2")}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4">
            <Label htmlFor="search-element" className="text-sm font-medium">
              {t("productImport.floorPlan.associerFenetre3")}
            </Label>
            <Input
              id="search-element"
              placeholder={t("productImport.floorPlan.elementNameOrType")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto border rounded-md">
            {filteredElements.length > 0 ? (
              <div className="grid gap-1 p-1">
                {filteredElements.map((element) => (
                  <div
                    key={element.id}
                    className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted"
                    onClick={() => onSelectElement(element, furnitureId)}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: getElementColor(element.type) }}
                      />
                      <div>
                        <div className="font-medium">{element.name || `${element.type} sans nom`}</div>
                        <div className="text-xs text-muted-foreground">
                          {t("productImport.type")} : {element.type} • {t("position")}: {element.x.toFixed(0)},{" "}
                          {element.y.toFixed(0)}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {t("selectionner")}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {t("productImport.floorPlan.aucunAssocier")} "{searchTerm}"
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Fonction pour créer des murs et des fenêtres après la fonction handleManualElementSelection
// Ajouter cette fonction après handleManualElementSelection


// Realistic Room Components
const RealisticFloor = () => {
  const floorTextures = useTexture({
    map: "/placeholder.svg?height=1024&width=1024",
    normalMap: "/placeholder.svg?height=1024&width=1024",
    roughnessMap: "/placeholder.svg?height=1024&width=1024",
    aoMap: "/placeholder.svg?height=1024&width=1024",
  })

  // Répéter la texture
  Object.keys(floorTextures).forEach((key) => {
    floorTextures[key].wrapS = floorTextures[key].wrapT = THREE.RepeatWrapping
    floorTextures[key].repeat.set(ROOM_CONFIG.floorTextureScale, ROOM_CONFIG.floorTextureScale)
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[ROOM_CONFIG.width, ROOM_CONFIG.depth]} />
      <meshStandardMaterial {...floorTextures} color={ROOM_CONFIG.floorColor} roughness={0.8} metalness={0.2} />
    </mesh>
  )
}

const RealisticWalls = () => {
  const wallTextures = useTexture({
    map: "/placeholder.svg?height=1024&width=1024",
    normalMap: "/placeholder.svg?height=1024&width=1024",
    roughnessMap: "/placeholder.svg?height=1024&width=1024",
  })

  // Répéter la texture
  Object.keys(wallTextures).forEach((key) => {
    wallTextures[key].wrapS = wallTextures[key].wrapT = THREE.RepeatWrapping
    wallTextures[key].repeat.set(4, 2)
  })

  return (
    <>
      {/* Back Wall */}
      <mesh position={[0, ROOM_CONFIG.height / 2, -ROOM_CONFIG.depth / 2]} receiveShadow>
        <planeGeometry args={[ROOM_CONFIG.width, ROOM_CONFIG.height]} />
        <meshStandardMaterial {...wallTextures} color={ROOM_CONFIG.wallColor} roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-ROOM_CONFIG.width / 2, ROOM_CONFIG.height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_CONFIG.depth, ROOM_CONFIG.height]} />
        <meshStandardMaterial {...wallTextures} color={ROOM_CONFIG.wallColor} roughness={0.9} metalness={0.1} />
      </mesh>
    </>
  )
}

// Furniture Item Component (draggable)
const DraggableFurnitureItem = ({
  furniture,
  onRename,
  isMatchingPlan,
  disabled = false,
  onManualPlacement,
  floorPlan,
  toast,
  matchedPlanElements = {},
  placedFurniture = [],
}) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  // Vérifier si ce meuble est déjà placé dans la scène
  const isPlaced = placedFurniture.some((item) => item.savedFurniture.furniture.id === furniture.furniture.id)

  // Check if this furniture is matched with a plan element
  const isMatched = Object.values(matchedPlanElements).some((match) => match.furnitureId === furniture.furniture.id)

  // Get the matched element name if it exists
  const matchedElementName = isMatched
    ? Object.values(matchedPlanElements).find((match) => match.furnitureId === furniture.furniture.id)?.elementName
    : null

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.FURNITURE,
      item: { id: furniture.furniture.id, type: ItemTypes.FURNITURE, name: furniture.furniture.name },
      canDrag: !disabled,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {
        if (!monitor.didDrop()) {
          console.log("Drag ended without drop")
        }
      },
    }),
    [furniture.furniture.id, disabled, furniture.furniture.name],
  )

  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(furniture.furniture.name)

  // Mettre à jour le nom lorsque le meuble change
  useEffect(() => {
    setNewName(furniture.furniture.name)
  }, [furniture.furniture.name])

  const handleRename = () => {
    if (newName.trim() && newName !== furniture.furniture.name) {
      onRename(furniture.furniture.id, newName.trim())
      // Update the local state to reflect the change
      furniture.furniture.name = newName.trim()
    }
    setIsEditing(false)
  }

  // Ajouter un bouton de placement manuel pour les meubles qui correspondent au plan
  const handleManualPlacement = (furnitureId) => {
    if (!floorPlan) {
      toast({
        title: "Aucun plan chargé",
        description: "Veuillez d'abord charger un plan d'étage.",
        variant: "destructive",
      })
      return
    }

    // Appeler la fonction passée en prop au lieu d'utiliser des variables globales
    onManualPlacement(furnitureId)
  }

  return (
    <div
      className={`
        flex flex-col p-4 border-2 rounded-lg group relative w-full
        transition-all duration-300 ease-in-out
        ${isDragging ? "opacity-50 scale-95 shadow-inner" : "opacity-100 scale-100"}
        ${isMatchingPlan ? "border-green-500 bg-green-50 animate-pulse" : ""}
        ${
          isMatched
            ? `
          border-cyan-400 bg-gradient-to-r from-cyan-50 to-cyan-100
          shadow-lg shadow-cyan-500/40
          ring-1 ring-cyan-300/70
          hover:shadow-cyan-600/60
          hover:scale-[1.02]
          ${!isPlaced ? "animate-[pulse_2s_ease-in-out_infinite]" : ""}
        `
            : ""
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        hover:border-primary hover:bg-primary/10
      `}
      dir={textDirection}
    >
      <div className="flex items-center w-full">
        <div
          ref={drag}
          className={`w-10 h-10 bg-muted/30 rounded-md flex items-center justify-center mr-3 flex-shrink-0 ${!disabled ? "cursor-move" : ""}`}
        >
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          {isEditing ? (
            <div className="flex items-center space-x-1">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-7 text-sm"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
              />
              <Button size="sm" variant="ghost" className="h-7 px-2 flex-shrink-0" onClick={handleRename}>
                {t("productImport.floorPlan.ok")}
              </Button>
            </div>
          ) : (
            <div>
              <div className="font-medium truncate flex items-center">
                {furniture.furniture.name}
                {isMatched && <CheckCircle2 className="h-4 w-4 ml-2 text-blue-500" />}
              </div>

              <div className="text-xs text-muted-foreground">
                {furniture.products.length} {t("productImport.produits")}
              </div>

              {matchedElementName && <div className="text-xs text-blue-600 mt-1">{matchedElementName}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-between mt-2 w-full">
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setIsEditing(true)}>
          {t("productImport.floorPlan.renommer")}
        </Button>

        {floorPlan && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() => onManualPlacement(furniture.furniture.id, true)}
          >
            {t("productImport.floorPlan.matchFurniture")}
          </Button>
        )}

        {isMatched && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() => handleManualPlacement(furniture.furniture.id)}
          >
            {t("productImport.floorPlan.placer")}
          </Button>
        )}
      </div>

      {isMatched && (
        <Badge variant="outline" className="absolute -top-2 -right-2 bg-blue-100 text-blue-800 border-blue-500 text-xs">
          {t("productImport.floorPlan.associer1")}
        </Badge>
      )}

      {isMatchingPlan && (
        <Badge
          variant="outline"
          className="absolute -top-2 -right-2 bg-green-100 text-green-800 border-green-500 text-xs"
        >
          {t("productImport.floorPlan.dansPlan")}
        </Badge>
      )}
    </div>
  )
}

// Furniture Controls Component
const FurnitureControls = ({ selectedFurniture, onUpdate, onDelete }) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  if (!selectedFurniture) return null

  // Fonction pour mettre à jour la position
  const handlePositionChange = (axis, value) => {
    console.log(`Changing ${axis} to ${value}`)
    onUpdate({
      ...selectedFurniture,
      [axis]: Number.parseFloat(value),
    })
  }

  // Fonction pour mettre à jour la rotation
  const handleRotationChange = (value) => {
    console.log(`Changing rotation to ${value}`)
    onUpdate({
      ...selectedFurniture,
      rotation: Number.parseInt(value),
    })
  }

  // Fonction pour mettre à jour les dimensions
  const handleDimensionChange = (dimension, value) => {
    console.log(`Changing ${dimension} to ${value}`)
    
    // Handle walls and windows (direct properties)
    if (selectedFurniture.type === 'wall' || selectedFurniture.type === 'window') {
      onUpdate({
        ...selectedFurniture,
        [dimension]: Number.parseFloat(value),
      })
      return
    }

    // Handle furniture (nested structure)
    onUpdate({
      ...selectedFurniture,
      savedFurniture: {
        ...selectedFurniture.savedFurniture,
        furniture: {
          ...selectedFurniture.savedFurniture.furniture,
          [dimension]: Number.parseFloat(value),
        },
      },
    })
  }

  // Fonction pour mettre à jour le nom
  const handleNameChange = (value) => {
    onUpdate({
      ...selectedFurniture,
      savedFurniture: {
        ...selectedFurniture.savedFurniture,
        furniture: {
          ...selectedFurniture.savedFurniture.furniture,
          name: value,
        },
      },
    })
  }

  const moveStep = 0.2
  const rotateStep = 15

  // Fonction pour déplacer le meuble avec les boutons
  const handleMoveButton = (axis, direction) => {
    const step = direction * moveStep
    console.log(`Moving ${axis} by ${step}`)
    onUpdate({
      ...selectedFurniture,
      [axis]: selectedFurniture[axis] + step,
    })
  }

  // Fonction pour faire pivoter le meuble avec les boutons
  const handleRotateButton = (direction) => {
    const newRotation = (selectedFurniture.rotation + direction * rotateStep) % 360
    console.log(`Rotating to ${newRotation}`)
    onUpdate({
      ...selectedFurniture,
      rotation: newRotation < 0 ? newRotation + 360 : newRotation,
    })
  }

  return (
    <div className="space-y-4 p-4 border rounded-md mt-4" dir={textDirection}>
      <h3 className="font-medium">{t("productImport.furnitureControls")}</h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="furniture-name">{t("productImport.floorPlan.nomMeuble")}</Label>
          <Input
            id="furniture-name"
            value={selectedFurniture?.savedFurniture?.furniture?.name || ""} 
            onChange={(e) => handleNameChange(e.target.value)}
          />

        </div>

        {/* Position Controls */}
        <div>
          <h4 className="text-sm font-medium mb-2">{t("position")}</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="position-x">{t("productImport.positionX")}</Label>
              <Input
                id="position-x"
                type="number"
                step="0.1"
                value={selectedFurniture.x}
                onChange={(e) => handlePositionChange("x", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="position-z">{t("productImport.positionZ")}</Label>
              <Input
                id="position-z"
                type="number"
                step="0.1"
                value={selectedFurniture.z}
                onChange={(e) => handlePositionChange("z", e.target.value)}
              />
            </div>
          </div>

          {/* Movement Controls */}
          <div className="mt-2">
            <Label className="text-sm mb-1 block">{t("productImport.deplacer")}</Label>
            <div className="grid grid-cols-3 gap-1 w-full">
              <div className="col-span-3 flex justify-center">
                <Button size="sm" variant="outline" onClick={() => handleMoveButton("z", -1)}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleMoveButton("x", isRTL ? 1 : -1)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-center">
                <Button size="sm" variant="outline" onClick={() => handleMoveButton("z", 1)}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-start">
                <Button size="sm" variant="outline" onClick={() => handleMoveButton("x", isRTL ? -1 : 1)}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Rotation Controls */}
        <div>
          <h4 className="text-sm font-medium mb-2">{t("productImport.rotation")}</h4>
          <div className="flex items-center space-x-2">
            <Input
              id="rotation"
              type="number"
              step="15"
              value={selectedFurniture.rotation}
              onChange={(e) => handleRotationChange(e.target.value)}
              className="flex-1"
            />
            <div className="flex space-x-1">
              <Button size="sm" variant="outline" onClick={() => handleRotateButton(-1)} title="Rotation gauche">
                <RotateCw className="h-4 w-4 transform -scale-x-100" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleRotateButton(1)} title="Rotation droite">
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dimension Controls */}
        <div>
        <h4 className="text-sm font-medium mb-2">{t("productImport.dimensions")}</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="width">{t("productImport.width")}</Label>
            <Input
              id="width"
              type="number"
              step="0.1"
              min="0.1"
              value={
                selectedFurniture.type === 'wall' || selectedFurniture.type === 'window'
                  ? selectedFurniture.width
                  : selectedFurniture?.savedFurniture?.furniture?.width || 0.1
              }
              onChange={(e) => handleDimensionChange("width", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="height">{t("productImport.height")}</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              min="0.1"
              value={
                selectedFurniture.type === 'wall' || selectedFurniture.type === 'window'
                  ? selectedFurniture.height
                  : selectedFurniture?.savedFurniture?.furniture?.height || 0.1
              }
              onChange={(e) => handleDimensionChange("height", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="depth">{t("productImport.depth")}</Label>
            <Input
              id="depth"
              type="number"
              step="0.1"
              min="0.1"
              value={
                selectedFurniture.type === 'wall' || selectedFurniture.type === 'window'
                  ? selectedFurniture.depth
                  : selectedFurniture?.savedFurniture?.furniture?.depth || 0.1
              }
              onChange={(e) => handleDimensionChange("depth", e.target.value)}
            />
          </div>
        </div>
      </div>
        <div className="pt-2">
          <Button variant="destructive" size="sm" className="w-full" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            {t("productImport.delete")}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Zoom Controls Component
const ZoomControls = ({ sceneScale, setSceneScale }) => {
  const minScale = 0.5
  const maxScale = 2.0
  const stepScale = 0.1

  const handleZoomIn = () => {
    setSceneScale((prev) => Math.min(prev + stepScale, maxScale))
  }

  const handleZoomOut = () => {
    setSceneScale((prev) => Math.max(prev - stepScale, minScale))
  }

  const handleReset = () => {
    setSceneScale(1.0)
  }

  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-md shadow-md p-1 flex space-x-1">
      <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom out">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={handleReset} className="px-2">
        {Math.round(sceneScale * 100)}%
      </Button>
      <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom in">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={handleReset} title="Reset zoom">
        <Maximize className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Store Display Area Component (droppable)
const StoreDisplayArea = ({
  onDrop,
  placedFurniture,
  products,
  onSelectFurniture,
  selectedFurnitureId,
  triggerCapture,
  onCaptureComplete,
  sceneScale = 1,
  floorPlan,
  showFloorPlan,
  floorPlanOpacity,
  disabled = false,
  lightIntensity,
  environmentPreset,
  showShadows,
  setShowFloorPlanSelector,
}) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.FURNITURE,
    drop: (item: { id: string }, monitor) => {
      const offset = monitor.getClientOffset()
      const initialClientOffset = monitor.getClientOffset()
      const initialSourceClientOffset = monitor.getInitialSourceClientOffset()

      if (offset && initialClientOffset && initialSourceClientOffset) {
        const dropAreaRect = document.getElementById("store-display-area")?.getBoundingClientRect()

        if (dropAreaRect) {
          // Calculate position relative to the drop area, using the new room dimensions
          const x = ((offset.x - dropAreaRect.left) / dropAreaRect.width) * ROOM_CONFIG.width - ROOM_CONFIG.width / 2
          const z = ((offset.y - dropAreaRect.top) / dropAreaRect.height) * ROOM_CONFIG.depth - ROOM_CONFIG.depth / 2

          onDrop(item.id, x, 0, z)
        }
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  // Adjust camera position based on scale and room size
  const CameraScaler = ({ scale }) => {
    const { camera } = useThree()

    useEffect(() => {
      // Adjust camera position based on scale and room size
      camera.position.set(ROOM_CONFIG.width / 2, ROOM_CONFIG.width / 2, ROOM_CONFIG.width / 2)
      camera.zoom = scale
      camera.updateProjectionMatrix()
    }, [camera, scale])

    return null
  }

  // Floor Plan Visualization
  const FloorPlanVisualization = () => {
    if (!showFloorPlan || !floorPlan) return null

    return (
      <group>
        {floorPlan.elements.map((element) => {
          // Convert pixel coordinates to meters (assuming 100 pixels = 1 meter)
          const xPos = element.x / 100 - ROOM_CONFIG.width / 4
          const zPos = element.y / 100 - ROOM_CONFIG.depth / 4
          const width = element.width / 100
          const depth = element.height / 100

          return (
            <mesh
              key={element.id}
              position={[xPos + width / 2, 0.05, zPos + depth / 2]}
              rotation={[-Math.PI / 2, 0, (element.rotation * Math.PI) / 180]}
            >
              <planeGeometry args={[width, depth]} />
              <meshStandardMaterial
                color={getElementColor(element.type)}
                transparent={true}
                opacity={floorPlanOpacity}
              />

              {/* Element label */}
              <group position={[0, 0, 0.01]}>
                <Html position={[0, 0, 0.1]} center distanceFactor={15}>
                  <div className="bg-white bg-opacity-50 px-1 py-0.5 rounded text-[8px] font-medium whitespace-nowrap">
                    {element.name || element.type}
                  </div>
                </Html>
              </group>
            </mesh>
          )
        })}
      </group>
    )
  }

  return (
    <div
      id="store-display-area"
      ref={drop}
      className={`
        relative border rounded-md overflow-hidden
        ${isOver ? "border-primary" : "border-muted"}
        ${disabled ? "cursor-not-allowed" : ""}
      `}
      style={{ height: "600px" }}
      dir={textDirection}
    >
      {disabled && (
        <div className="absolute inset-0 bg-gray-200 bg-opacity-50 z-10 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md shadow-lg max-w-md text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
            <h3 className="text-lg font-medium mb-2">{t("productImport.floorPlan.required")}</h3>
            <p className="text-muted-foreground mb-4">{t("productImport.floorPlan.loadPrompt")}</p>
            <Button variant="outline" className="mx-auto" onClick={() => setShowFloorPlanSelector(true)}>
              <Map className="h-4 w-4 mr-2" />
              {t("productImport.load")}
            </Button>
          </div>
        </div>
      )}

      <Canvas
        shadows={showShadows}
        camera={{ position: [ROOM_CONFIG.width / 2, ROOM_CONFIG.width / 2, ROOM_CONFIG.width / 2], fov: 50 }}
      >
        <TexturePreloader products={products} />
        <CameraScaler scale={sceneScale} />

        {/* Environment and lighting */}
        <Environment preset={environmentPreset} background={false} />
        <ambientLight intensity={lightIntensity * 0.5} />
        <directionalLight
          position={[ROOM_CONFIG.width / 2, ROOM_CONFIG.width / 2, ROOM_CONFIG.width / 2]}
          intensity={lightIntensity}
          castShadow={showShadows}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        {/* Room */}
        <Suspense fallback={null}>
          <RealisticFloor />
          <RealisticWalls />
        </Suspense>

        {/* Floor plan */}
        <FloorPlanVisualization />

        {/* Placed furniture, walls and windows */}
        <Suspense fallback={null}>
          {placedFurniture.map((item) => {
            // Handle walls and windows
            if (item.type === "wall") {
              return (
                <group 
                    key={`wall-${item.id}`} 
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectFurniture(item.id)
                    }}
                    userData-selected={item.id === selectedFurnitureId}
                    position={[item.x, item.y, item.z]}
                    rotation={[0, (item.rotation * Math.PI) / 180, 0]}
                  >
                    <Wall 
                      width={item.width} 
                      height={item.height} 
                      depth={item.depth} 
                    />
                  </group>

                                )
                              }

                              if (item.type === "window") {
                                return (
                                  <group 
                    key={`window-${item.id}`} 
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectFurniture(item.id)
                    }}
                    userData-selected={item.id === selectedFurnitureId}
                    position={[item.x, item.y, item.z]}
                    rotation={[0, (item.rotation * Math.PI) / 180, 0]}
                  >
                    <Window 
                      width={item.width} 
                      height={item.height} 
                      depth={item.depth} 
                    />
                  </group>

              )
            }

            // Original furniture rendering code
            const savedFurniture = item.savedFurniture
            if (!savedFurniture) return null

            const furnitureProps = {
              furniture: {
                ...savedFurniture.furniture,
                x: item.x,
                y: item.y,
                z: item.z,
                rotation: item.rotation,
              },
              displayItems: savedFurniture.products.map((p) => ({
                id: `display-${p.productId}-${item.id}-${p.section}-${p.position}`,
                productId: p.productId,
                section: p.section,
                position: p.position,
                quantity: p.quantity || 1, // Ajout de la quantité avec valeur par défaut 1
                furnitureId: savedFurniture.furniture.id,
              })),
              products,
              onRemove: () => {},
            }

            const groupProps = {
              onClick: (e) => {
                e.stopPropagation()
                onSelectFurniture(item.id)
              },
              "userData-selected": item.id === selectedFurnitureId,
              position: [item.x, item.y, item.z],
              rotation: [0, (item.rotation * Math.PI) / 180, 0],
            }

            switch (savedFurniture.furniture.type) {
              case "clothing-rack":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <ClothingRack {...furnitureProps} />
                  </group>
                )
              case "wall-display":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <WallDisplay {...furnitureProps} />
                  </group>
                )
              case "accessory-display":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <AccessoryDisplay {...furnitureProps} />
                  </group>
                )
              case "modular-cube":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <ModularCube {...furnitureProps} />
                  </group>
                )
              case "gondola":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <GondolaDisplay {...furnitureProps} />
                  </group>
                )
              case "table":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <TableDisplay {...furnitureProps} />
                  </group>
                )
              case "planogram":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <PlanogramDisplay
                      {...furnitureProps}
                      // Props supplémentaires spécifiques au planogramme
                      cellWidth={savedFurniture.furniture.width / savedFurniture.furniture.slots}
                      cellHeight={savedFurniture.furniture.height / savedFurniture.furniture.sections}
                    />
                  </group>
                )
              case "shelves-display":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <ShelvesDisplay
                      {...furnitureProps}
                      // Pass additional props needed for proper rendering
                      cellWidth={savedFurniture.furniture.width / savedFurniture.furniture.slots}
                      cellHeight={savedFurniture.furniture.height / savedFurniture.furniture.sections}
                    />
                  </group>
                )
              case "refrigerator":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <RefrigeratorDisplay {...furnitureProps} />
                  </group>
                )
              case "refrigerated-showcase":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <RefrigeratedShowcase {...furnitureProps} />
                  </group>
                )
              case "clothing-display":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <ClothingDisplay {...furnitureProps} />
                  </group>
                )
              case "clothing-wall":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <ClothingWallDisplay {...furnitureProps} />
                  </group>
                )
              case "cashier":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <CashierDisplay {...furnitureProps} />
                  </group>
                )
              default:
                return null
            }
          })}
        </Suspense>

        {/* Contact shadows for realistic look */}
        {showShadows && (
          <ContactShadows
            position={[0, 0.01, 0]}
            opacity={0.4}
            scale={40}
            blur={2}
            far={10}
            resolution={256}
            color="#000000"
          />
        )}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={ROOM_CONFIG.width * 1.5} // Limit max zoom out
          minDistance={2} // Limit max zoom in
        />

        <SceneCapture triggerCapture={triggerCapture} onCaptureComplete={onCaptureComplete} products={products} />
      </Canvas>
    </div>
  )
}

// Visualization Settings Component
const VisualizationSettings = ({
  lightIntensity,
  setLightIntensity,
  environmentPreset,
  setEnvironmentPreset,
  showShadows,
  setShowShadows,
}) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const environmentPresets = [
    { value: "warehouse", label: t("productImport.floorPlan.labels.warehouse") },
    { value: "apartment", label: t("productImport.floorPlan.labels.apartment") },
    { value: "studio", label: t("productImport.floorPlan.labels.studio") },
    { value: "city", label: t("productImport.floorPlan.labels.city") },
    { value: "park", label: t("productImport.floorPlan.labels.park") },
    { value: "sunset", label: t("productImport.floorPlan.labels.sunset") },
  ]

  return (
    <div className="space-y-4 p-4 border rounded-md mt-4" dir={textDirection}>
      <h3 className="font-medium">{t("productImport.floorPlan.visualSettings")}</h3>

      <div className="space-y-3">
        <div>
          <Label htmlFor="light-intensity" className="text-sm">
            {t("productImport.floorPlan.intensite")} {Math.round(lightIntensity * 100)}%
          </Label>
          <Slider
            id="light-intensity"
            min={0.2}
            max={1.5}
            step={0.1}
            value={[lightIntensity]}
            onValueChange={(value) => setLightIntensity(value[0])}
          />
        </div>

        <div>
          <Label htmlFor="environment-preset" className="text-sm">
            {t("productImport.floorPlan.environnement")}
          </Label>
          <select
            id="environment-preset"
            value={environmentPreset}
            onChange={(e) => setEnvironmentPreset(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
          >
            {environmentPresets.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="show-shadows"
            checked={showShadows}
            onChange={(e) => setShowShadows(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="show-shadows" className="text-sm">
            {t("productImport.floorPlan.ombre")}
          </Label>
        </div>
      </div>
    </div>
  )
}

// Main Store Display Editor Component
export function StoreDisplayEditor() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const { toast } = useToast()
  const { products } = useProductStore()
  const { savedFurniture } = useFurnitureStore()

  const [placedFurniture, setPlacedFurniture] = useState([])
  const [selectedFurnitureId, setSelectedFurnitureId] = useState(null)
  const [isExporting, setIsExporting] = useState(false)
  const [triggerCapture, setTriggerCapture] = useState(false)
  const [exportType, setExportType] = useState(null)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // New state variables for sidebar toggle and scene scaling
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [sceneScale, setSceneScale] = useState(1.0)

  // New state for sidebar width
  const [sidebarWidth, setSidebarWidth] = useState(300) // Default width in pixels
  const sidebarRef = useRef(null)
  const resizingRef = useRef(false)

  // Floor plan related state
  const [floorPlans, setFloorPlans] = useState([])
  const [floorPlan, setFloorPlan] = useState(null)
  const [showFloorPlanSelector, setShowFloorPlanSelector] = useState(false)
  const [showFloorPlan, setShowFloorPlan] = useState(true)
  const [floorPlanOpacity, setFloorPlanOpacity] = useState(0.5)
  const [showNameMatchDialog, setShowNameMatchDialog] = useState(false)
  const [matchingElements, setMatchingElements] = useState([])
  const [pendingFurnitureId, setPendingFurnitureId] = useState(null)

  // Ajouter ces états après les états existants dans StoreDisplayEditor
  const [showManualMatchDialog, setShowManualMatchDialog] = useState(false)
  const [currentFurnitureToMatch, setCurrentFurnitureToMatch] = useState(null)

  // Lighting and environment settings
  const [lightIntensity, setLightIntensity] = useState(0.7)
  const [environmentPreset, setEnvironmentPreset] = useState("warehouse")
  const [showShadows, setShowShadows] = useState(true)

  // Référence pour suivre si les textures sont préchargées
  const texturesPreloaded = useRef(false)

  // Obtenir le meuble sélectionné
  const selectedFurniture = placedFurniture.find((item) => item.id === selectedFurnitureId)

  // Fonction pour obtenir les détails d'un produit à partir de son ID
  const getProductDetails = useCallback(
    (productId) => {
      return products.find((p) => p.primary_Id === productId)
    },
    [products],
  )
  const handleAddWall = (x, z, width = 5, height = 3, depth = 0.2, rotation = 0) => {
    const newWall = {
      id: `wall-${Date.now()}`,
      type: "wall",
      x: x,
      y: 0,
      z: z,
      width: width,
      height: height,
      depth: depth,
      rotation: rotation,
    }
  
    setPlacedFurniture((prev) => [...prev, newWall])
    setSelectedFurnitureId(newWall.id)
  
    toast({
      title: "Mur ajouté",
      description: "Un nouveau mur a été ajouté à la scène.",
    })
  }
  
  const handleAddWindow = (x, z, width = 2, height = 1.5, depth = 0.1, rotation = 0) => {
    const newWindow = {
      id: `window-${Date.now()}`,
      type: "window",
      x: x,
      y: 1.5, // Position en hauteur par défaut
      z: z,
      width: width,
      height: height,
      depth: depth,
      rotation: rotation,
    }
  
    setPlacedFurniture((prev) => [...prev, newWindow])
    setSelectedFurnitureId(newWindow.id)
  
    toast({
      title: "Fenêtre ajoutée",
      description: "Une nouvelle fenêtre a été ajoutée à la scène.",
    })
  }

  // Load floor plans from local storage
  useEffect(() => {
    try {
      const plansJSON = localStorage.getItem("store-floor-plans")
      if (plansJSON) {
        const plans = JSON.parse(plansJSON)
        setFloorPlans(plans)

        // Load active floor plan if exists
        const activeId = localStorage.getItem("active-floor-plan")
        if (activeId) {
          const activePlan = plans.find((plan) => plan.id === activeId)
          if (activePlan) {
            setFloorPlan(activePlan)
          }
        }
      }
    } catch (error) {
      console.error("Error loading floor plans:", error)
    }
  }, [])

  // Précharger les textures des produits
  useEffect(() => {
    if (products.length > 0 && !texturesPreloaded.current) {
      const textureLoader = new THREE.TextureLoader()

      // Configurer le chargeur pour permettre le CORS
      textureLoader.crossOrigin = "anonymous"

      // Précharger toutes les textures
      products.forEach((product) => {
        if (product.image) {
          textureLoader.load(
            product.image,
            () => {
              console.log(`Texture chargée: ${product.image}`)
            },
            undefined,
            (error) => {
              console.error(`Erreur lors du chargement de la texture ${product.image}:`, error)
            },
          )
        }
      })

      texturesPreloaded.current = true
    }
  }, [products])

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev)
  }

  // Handle sidebar resizing
  // Handle sidebar resizing
  // const handleSidebarResize = (e) => {
  //   if (!resizingRef.current) return

  //   const newWidth = isRTL ? window.innerWidth - e.clientX : e.clientX

  //   // Limit minimum and maximum width
  //   if (newWidth > 200 && newWidth < 600) {
  //     setSidebarWidth(newWidth)
  //   }
  // }

  // Setup event listeners for resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (resizingRef.current) {
        const newWidth = isRTL ? window.innerWidth - e.clientX : e.clientX

        // Limit minimum and maximum width
        if (newWidth > 200 && newWidth < 600) {
          setSidebarWidth(newWidth)
        }
      }
    }

    const handleMouseUp = () => {
      if (resizingRef.current) {
        resizingRef.current = false
        document.body.style.cursor = "default"
        document.body.style.userSelect = "auto"
      }
    }

    // Attach the event listeners globally
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    // Clean up
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isRTL]) // Only re-attach when RTL changes

  // Check if a furniture matches any element in the floor plan
  const isFurnitureInPlan = (furniture) => {
    if (!floorPlan) return false

    return floorPlan.elements.some(
      (element) =>
        (element.name && element.name.toLowerCase() === furniture.furniture.name.toLowerCase()) ||
        (!element.name && element.type === furniture.furniture.type),
    )
  }

  // Get all furniture names from the floor plan
  const getFloorPlanFurnitureNames = () => {
    if (!floorPlan) return []

    return floorPlan.elements.filter((element) => element.name).map((element) => element.name.toLowerCase())
  }

  // Handle rename furniture in library
  const handleRenameFurniture = (id, newName) => {
    // Cas spécial pour la caisse fixe
    if (id === "fixed-cashier") {
      // Mettre à jour le nom dans cashierFurniture
      cashierFurniture.furniture.name = newName.trim()

      // Mettre à jour les meubles placés qui sont des caisses fixes
      setPlacedFurniture((prev) =>
        prev.map((item) => {
          if (item.savedFurnitureId === "fixed-cashier") {
            return {
              ...item,
              savedFurniture: {
                ...item.savedFurniture,
                furniture: {
                  ...item.savedFurniture.furniture,
                  name: newName.trim(),
                },
              },
            }
          }
          return item
        }),
      )

      toast({
        title: "Caisse renommée",
        description: `La caisse a été renommée en "${newName}".`,
      })

      return
    }

    // Pour les autres meubles, comportement normal
    // Update the furniture in the savedFurniture array
    const updatedFurniture = savedFurniture.map((item) => {
      if (item.furniture.id === id) {
        return {
          ...item,
          furniture: {
            ...item.furniture,
            name: newName.trim(),
          },
        }
      }
      return item
    })

    // Update placed furniture with this ID
    setPlacedFurniture((prev) =>
      prev.map((item) => {
        if (item.savedFurnitureId === id) {
          return {
            ...item,
            savedFurniture: {
              ...item.savedFurniture,
              furniture: {
                ...item.savedFurniture.furniture,
                name: newName.trim(),
              },
            },
          }
        }
        return item
      }),
    )

    toast({
      title: "Meuble renommé",
      description: `Le meuble a été renommée en "${newName}".`,
    })
  }

  // Définition du meuble "Caisse" fixe
  const cashierFurniture = {
    furniture: {
      id: "fixed-cashier",
      name: "Caisse",
      type: "cashier",
      width: 1.2,
      height: 1.0,
      depth: 0.8,
    },
    products: [],
  }

  // Add a new state to track which plan elements are already matched with furniture
  // Add this after the other state declarations in the StoreDisplayEditor component
  const [matchedPlanElements, setMatchedPlanElements] = useState({})

  // Modify the handleManualElementSelection function to track matched elements
  // Replace the entire function with this updated version
  const handleManualElementSelection = (element, furnitureId) => {
    if (!element || !furnitureId) return

    // Check if this element is already matched
    if (matchedPlanElements[element.id]) {
      toast({
        title: "Objet déjà associé",
        description: `Cet élément du plan est déjà associé à un autre meuble.`,
        variant: "destructive",
      })
      return
    }

    // Update the matched elements tracking
    setMatchedPlanElements((prev) => ({
      ...prev,
      [element.id]: {
        furnitureId,
        elementName: element.name || element.type,
      },
    }))

    // Cas spécial pour la caisse
    if (furnitureId === "fixed-cashier") {
      // No need to place immediately - just track the match
      toast({
        title: "Caisse associée",
        description: `La caisse a été associée à l'élément "${element.name || element.type}" du plan.`,
      })
    } else {
      // Pour les autres meubles
      const furniture = savedFurniture.find((f) => f.furniture.id === furnitureId)
      if (!furniture) return

      // Just track the match, don't place
      toast({
        title: "Meuble associé",
        description: `Le meuble "${furniture.furniture.name}" a été associé à l'élément "${element.name || element.type}" du plan.`,
      })
    }

    // Fermer le dialogue
    setShowManualMatchDialog(false)
    setCurrentFurnitureToMatch(null)
  }

  // Modify the handleDropFurniture function to respect matched elements
  // We need to prevent placing furniture that hasn't been matched
  // Add this check at the beginning of the function
  const handleDropFurniture = (furnitureId, x, y, z) => {
    // Si aucun plan n'est chargé, ne rien faire
    if (!floorPlan) {
      toast({
        title: "Aucun plan chargé",
        description: "Veuillez d'abord charger un plan d'étage.",
        variant: "destructive",
      })
      return
    }

    // Check if this furniture has been matched with a plan element
    const matchedElement = Object.values(matchedPlanElements).find((match) => match.furnitureId === furnitureId)
    if (!matchedElement) {
      toast({
        title: "Association requise",
        description: "Veuillez d'abord associer ce meuble à un élément du plan avec le bouton 'Matcher'.",
        variant: "destructive",
      })
      return
    }

    // Vérifier si c'est le meuble fixe "Caisse"
    if (furnitureId === "fixed-cashier") {
      const newPlacedFurniture = {
        id: `placed-${Date.now()}`,
        savedFurnitureId: furnitureId,
        savedFurniture: cashierFurniture,
        x: x,
        y: y,
        z: z,
        rotation: 0,
      }

      setPlacedFurniture((prev) => [...prev, newPlacedFurniture])
      setSelectedFurnitureId(newPlacedFurniture.id)

      toast({
        title: "Caisse placée",
        description: "La caisse a été placée dans le magasin.",
      })
      return
    }

    const furniture = savedFurniture.find((f) => f.furniture.id === furnitureId)

    if (furniture) {
      // Vérifier si ce meuble correspond à un élément du plan
      if (floorPlan && showFloorPlan) {
        // Chercher des éléments du plan avec le même nom ou type
        const matchingElements = floorPlan.elements.filter(
          (element) =>
            (element.name && element.name.toLowerCase() === furniture.furniture.name.toLowerCase()) ||
            (!element.name && element.type === furniture.furniture.type),
        )

        if (matchingElements.length === 0) {
          toast({
            title: "Meuble non autorisé",
            description: `Le meuble "${furniture.furniture.name}" ne correspond à aucun élément du plan.`,
            variant: "destructive",
          })
          return
        }

        if (matchingElements.length === 1) {
          // Si un seul élément correspond, placer automatiquement
          const matchingElement = matchingElements[0]
          const coords = getAutoPlacementCoordinates(matchingElement, ROOM_CONFIG.width, ROOM_CONFIG.depth)

          // Ajuster les coordonnées pour centrer le meuble sur son étiquette
          // Convertir les coordonnées du plan en coordonnées 3D
          const newPlacedFurniture = {
            id: `placed-${Date.now()}`,
            savedFurnitureId: furnitureId,
            savedFurniture: furniture,
            x: coords.x,
            y: coords.y,
            z: coords.z,
            rotation: coords.rotation,
          }

          setPlacedFurniture((prev) => [...prev, newPlacedFurniture])
          setSelectedFurnitureId(newPlacedFurniture.id) // Sélectionner automatiquement le nouveau meuble

          toast({
            title: "Meuble placé automatiquement",
            description: `Le meuble "${furniture.furniture.name}" a été placé automatiquement selon le plan.`,
          })
          return
        } else if (matchingElements.length > 1) {
          // Si plusieurs éléments correspondent, afficher un dialogue de sélection
          setMatchingElements(matchingElements)
          setPendingFurnitureId(furnitureId)
          setShowNameMatchDialog(true)
          return
        }
      }
    }
  }

  // Handle element selection from dialog
  const handleElementSelection = (element) => {
    const furniture = savedFurniture.find((f) => f.furniture.id === pendingFurnitureId)
    if (furniture && element) {
      const coords = getAutoPlacementCoordinates(element, ROOM_CONFIG.width, ROOM_CONFIG.depth)

      const newPlacedFurniture = {
        id: `placed-${Date.now()}`,
        savedFurnitureId: pendingFurnitureId,
        savedFurniture: furniture,
        x: coords.x,
        y: coords.y,
        z: coords.z,
        rotation: coords.rotation,
      }

      setPlacedFurniture((prev) => [...prev, newPlacedFurniture])
      setSelectedFurnitureId(newPlacedFurniture.id)

      setShowNameMatchDialog(false)
      setPendingFurnitureId(null)

      toast({
        title: "Meuble placé",
        description: `Le meuble "${furniture.furniture.name}" a ét placé à l'emplacement sélectionné.`,
      })
    }
  }

  // Handle remove furniture
  const handleRemoveFurniture = (id) => {
    setPlacedFurniture((prev) => prev.filter((item) => item.id !== id))
    if (selectedFurnitureId === id) {
      setSelectedFurnitureId(null)
    }
  }

  // Handle update furniture
  const handleUpdateFurniture = (updatedFurniture) => {
    console.log("Updating furniture:", updatedFurniture)
    setPlacedFurniture((prev) =>
      prev.map((item) => (item.id === updatedFurniture.id ? { ...item, ...updatedFurniture } : item)),
    )
  }

  // Handle floor plan selection
  const handleSelectFloorPlan = (plan) => {
    setFloorPlan(plan)
    setShowFloorPlanSelector(false)

    // Vider les meubles placés lors du changement de plan
    setPlacedFurniture([])
    setSelectedFurnitureId(null)

    toast({
      title: "Plan d'étage chargé",
      description: `Le plan "${plan.name}" a été chargé. Vous pouvez maintenant placer les meubles correspondants.`,
    })
  }

  // Fonction pour placer automatiquement tous les meubles correspondants
  const handleAutoPlacement = () => {
    if (!floorPlan) {
      toast({
        title: "Aucun plan chargé",
        description: "Veuillez d'abord charger un plan d'étage.",
        variant: "destructive",
      })
      return
    }

    // Filtrer les éléments du plan qui ont un nom et qui sont des meubles
    const furnitureElements = floorPlan.elements.filter((element) =>
      [
        "shelf",
        "display",
        "table",
        "fridge",
        "planogram",
        "gondola",
        "counter",
        "cashier",
        "rack",
        "mannequin",
      ].includes(element.type),
    )

    if (furnitureElements.length === 0) {
      toast({
        title: "Aucun meuble trouvé",
        description: "Le plan ne contient aucun meuble pour le placement automatique.",
        variant: "destructive",
      })
      return
    }

    // Nombre de meubles placés
    let placedCount = 0

    // Créer un tableau pour les nouveaux meubles placés
    const newPlacedFurniture = [...placedFurniture]

    // Pour chaque élément du plan, chercher un meuble correspondant
    furnitureElements.forEach((element) => {
      // Vérifier si un meuble avec ce nom existe déjà dans la scène
      const alreadyPlaced = placedFurniture.some(
        (item) =>
          (element.name && item.savedFurniture.furniture.name.toLowerCase() === element.name.toLowerCase()) ||
          (!element.name && item.savedFurniture.furniture.type === element.type),
      )

      if (alreadyPlaced) return

      // Chercher un meuble correspondant dans la bibliothèque
      const matchingFurniture = savedFurniture.find(
        (f) =>
          (element.name && f.furniture.name.toLowerCase() === element.name.toLowerCase()) ||
          (!element.name && f.furniture.type === element.type),
      )

      if (matchingFurniture) {
        // Calculer les coordonnées
        const coords = getAutoPlacementCoordinates(element, ROOM_CONFIG.width, ROOM_CONFIG.depth)

        // Créer le nouveau meuble
        const newFurniture = {
          id: `placed-${Date.now()}-${placedCount}`,
          savedFurnitureId: matchingFurniture.furniture.id,
          savedFurniture: matchingFurniture,
          x: coords.x,
          y: coords.y,
          z: coords.z,
          rotation: coords.rotation,
        }

        newPlacedFurniture.push(newFurniture)
        placedCount++
      }
    })

    // Mettre à jour l'état avec tous les nouveaux meubles
    setPlacedFurniture(newPlacedFurniture)

    // Afficher un message de confirmation
    if (placedCount > 0) {
      toast({
        title: "Placement automatique terminé",
        description: `${placedCount} meubles ont été placés automatiquement selon le plan.`,
      })
    } else {
      toast({
        title: "Aucun meuble placé",
        description: "Aucun meuble correspondant n'a été trouvé dans la bibliothèque.",
        variant: "destructive",
      })
    }
  }

  // Fonction pour gérer la capture complétée
  const handleCaptureComplete = (dataURL) => {
    if (!dataURL) {
      toast({
        title: "Erreur d'exportation",
        description: "Impossible de capturer la scène. Veuillez réessayer.",
        variant: "destructive",
      })
      setIsExporting(false)
      setTriggerCapture(false)
      setExportType(null)
      return
    }

    if (exportType === "image") {
      // Créer un lien de téléchargement pour l'image
      const link = document.createElement("a")
      link.download = `boutique-${new Date().toISOString().slice(0, 10)}.png`
      link.href = dataURL
      link.click()

      toast({
        title: "Exportation réussie",
        description: "L'image a été téléchargée avec succès.",
      })
    } else if (exportType === "pdf") {
      // Créer un PDF avec l'image
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
      })

      // Calculer les dimensions pour ajuster l'image au PDF
      const imgWidth = 280
      const imgHeight = 160 // Approximation basée sur le ratio d'aspect

      // Ajouter l'image au PDF
      pdf.addImage(dataURL, "PNG", 10, 10, imgWidth, imgHeight)

      // Ajouter des métadonnées
      pdf.setFontSize(12)
      pdf.text(`Agencement de boutique - Exporté le ${new Date().toLocaleDateString()}`, 10, imgHeight + 20)

      // Ajouter les détails des meubles placés
      pdf.setFontSize(14)
      pdf.text("Détails des meubles placés:", 10, imgHeight + 30)

      // Ajouter chaque meuble avec ses détails
      let yPosition = imgHeight + 40
      placedFurniture.forEach((item, index) => {
        pdf.setFontSize(11)
        pdf.text(`${index + 1}. ${item.savedFurniture.furniture.name}`, 15, yPosition)

        pdf.setFontSize(9)
        pdf.text(`Type: ${item.savedFurniture.furniture.type}`, 20, yPosition + 5)
        pdf.text(`Position: X=${item.x.toFixed(2)}, Z=${item.z.toFixed(2)}`, 20, yPosition + 10)
        pdf.text(`Rotation: ${item.rotation}°`, 20, yPosition + 15)
        pdf.text(`Produits: ${item.savedFurniture.products.length}`, 20, yPosition + 20)

        // Liste des produits si disponible
        if (item.savedFurniture.products.length > 0) {
          pdf.text("Produits associés:", 20, yPosition + 25)
          item.savedFurniture.products.forEach((product, prodIndex) => {
            const productDetails = products.find((p) => p.primary_Id === product.productId)
            const productName = productDetails ? productDetails.name : `Produit #${product.productId}`
            pdf.text(`- ${productName} (Section: ${product.section})`, 25, yPosition + 30 + prodIndex * 5)
          })
        }

        // Ajuster la position Y pour le prochain meuble
        yPosition += 35 + item.savedFurniture.products.length * 5

        // Si on atteint le bas de la page, ajouter une nouvelle page
        if (yPosition > 270) {
          pdf.addPage()
          yPosition = 20
        }
      })

      // Télécharger le PDF
      pdf.save(`boutique-${new Date().toISOString().slice(0, 10)}.pdf`)

      toast({
        title: "Exportation réussie",
        description: "Le PDF a été téléchargé avec succès avec les détails des meubles.",
      })
    }

    // Réinitialiser les états
    setTriggerCapture(false)
    setExportType(null)
    setIsExporting(false)
  }

  // Save store layout
  const saveStoreLayout = () => {
    // Implementation would go here
    toast({
      title: "Agencement sauvegardé",
      description: "L'agencement de la boutique a été sauvegardé avec succès.",
    })
  }

  // Fermer le menu d'exportation lorsqu'on clique ailleurs
  useEffect(() => {
    if (showExportMenu) {
      const handleClickOutside = (event) => {
        if (event.target.closest("[data-export-menu]") === null) {
          setShowExportMenu(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [showExportMenu])

  // Réinitialiser l'état d'exportation si une erreur se produit
  useEffect(() => {
    if (isExporting) {
      const timer = setTimeout(() => {
        if (isExporting) {
          setIsExporting(false)
          setTriggerCapture(false)
          setExportType(null)
          console.log("Réinitialisation de l'état d'exportation après délai")
        }
      }, 10000) // 10 secondes de timeout
      return () => clearTimeout(timer)
    }
  }, [isExporting])

  // Fonction pour exporter en image
  const exportAsImage = () => {
    if (placedFurniture.length === 0) {
      toast({
        title: "Erreur d'exportation",
        description: "Aucun meuble n'est placé dans la boutique.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsExporting(true)
      toast({
        title: "Exportation en cours",
        description: "Génération de l'image en cours...",
      })

      setExportType("image")

      // Attendre un peu pour s'assurer que les textures sont chargées
      setTimeout(() => {
        setTriggerCapture(true)
      }, 500)
    } catch (error) {
      console.error("Erreur lors de l'exportation de l'image:", error)
      toast({
        title: "Erreur d'exportation",
        description: "Une erreur est survenue lors de l'exportation de l'image.",
        variant: "destructive",
      })
      setIsExporting(false)
      setTriggerCapture(false)
      setExportType(null)
    }
  }

  // Fonction pour exporter en PDF
  const exportAsPDF = () => {
    if (placedFurniture.length === 0) {
      toast({
        title: "Erreur d'exportation",
        description: "Aucun meuble n'est placé dans la boutique.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsExporting(true)
      toast({
        title: "Exportation en cours",
        description: "Génération du PDF en cours...",
      })

      setExportType("pdf")

      // Attendre un peu pour s'assurer que les textures sont chargées
      setTimeout(() => {
        setTriggerCapture(true)
      }, 500)
    } catch (error) {
      console.error("Erreur lors de l'exportation du PDF:", error)
      toast({
        title: "Erreur d'exportation",
        description: "Une erreur est survenue lors de l'exportation du PDF.",
        variant: "destructive",
      })
      setIsExporting(false)
      setTriggerCapture(false)
      setExportType(null)
    }
  }

  // Remplacer la fonction handleManualPlacement par celle-ci:
  const handleManualPlacement = (furnitureId, showMatchDialog = false) => {
    // Si on veut afficher le dialogue de matching manuel
    if (showMatchDialog) {
      const furniture =
        furnitureId === "fixed-cashier" ? cashierFurniture : savedFurniture.find((f) => f.furniture.id === furnitureId)

      if (furniture) {
        setCurrentFurnitureToMatch({
          id: furnitureId,
          name: furniture.furniture.name,
        })
        setShowManualMatchDialog(true)
      }
      return
    }

    // For the "Place" button - check if this furniture has been matched
    const matchedElement = Object.values(matchedPlanElements).find((match) => match.furnitureId === furnitureId)
    if (!matchedElement) {
      toast({
        title: "Association requise",
        description: "Veuillez d'abord associer ce meuble à un élément du plan avec le bouton 'Matcher'.",
        variant: "destructive",
      })
      return
    }

    // Find the element in the floor plan
    const element = floorPlan.elements.find(
      (el) =>
        el.id === Object.keys(matchedPlanElements).find((key) => matchedPlanElements[key].furnitureId === furnitureId),
    )

    if (!element) {
      toast({
        title: "Erreur",
        description: "L'élément associé n'a pas été trouvé dans le plan.",
        variant: "destructive",
      })
      return
    }

    // Get coordinates for placement
    const coords = getAutoPlacementCoordinates(element, ROOM_CONFIG.width, ROOM_CONFIG.depth)

    // Cas spécial pour la caisse fixe
    if (furnitureId === "fixed-cashier") {
      const newPlacedFurniture = {
        id: `placed-${Date.now()}`,
        savedFurnitureId: furnitureId,
        savedFurniture: cashierFurniture,
        x: coords.x,
        y: coords.y,
        z: coords.z,
        rotation: coords.rotation,
        matchedElementName: matchedElement.elementName,
      }

      setPlacedFurniture((prev) => [...prev, newPlacedFurniture])
      setSelectedFurnitureId(newPlacedFurniture.id)

      toast({
        title: "Caisse placée",
        description: "La caisse a été placée selon l'élément associé du plan.",
      })
      return
    }

    // Pour les autres meubles
    const furniture = savedFurniture.find((f) => f.furniture.id === furnitureId)
    if (!furniture) return

    const newPlacedFurniture = {
      id: `placed-${Date.now()}`,
      savedFurnitureId: furnitureId,
      savedFurniture: furniture,
      x: coords.x,
      y: coords.y,
      z: coords.z,
      rotation: coords.rotation,
      matchedElementName: matchedElement.elementName,
    }

    setPlacedFurniture((prev) => [...prev, newPlacedFurniture])
    setSelectedFurnitureId(newPlacedFurniture.id)

    toast({
      title: "Meuble placé",
      description: `Le meuble "${furniture.furniture.name}" a été placé selon l'élément associé du plan.`,
    })
  }

  return (
    <div className="mt-12" dir={textDirection}>
      <DndProvider backend={HTML5Backend}>
        <div className="container mx-auto py-6 max-w-full">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="mr-2"
                  title={isSidebarVisible ? "Masquer le panneau latéral" : "Afficher le panneau latéral"}
                >
                  {isSidebarVisible ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
                </Button>
                <h1 className="text-2xl font-bold">{t("productImport.storeLayoutEditor")}</h1>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => (window.location.href = "/Editor")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("productImport.backToEditor")}
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  {t("productImport.parametres")}
                </Button>
                <Button variant="outline" onClick={() => setShowFloorPlanSelector(true)}>
                  <Map className="h-4 w-4 mr-2" />
                  {floorPlan ? t("productImport.change") : t("productImport.load")}
                </Button>

                {floorPlan && (
                  <Button variant="outline" onClick={handleAutoPlacement}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("productImport.placementAuto")}
                  </Button>
                )}

                <div className="relative" data-export-menu>
                  <Button variant="outline" disabled={isExporting} onClick={() => setShowExportMenu(!showExportMenu)}>
                    <Download className="h-4 w-4 mr-2" />
                    {t("productImport.export")}
                  </Button>

                  {showExportMenu && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[9999]"
                      style={{ zIndex: 9999 }}
                      data-export-menu
                    >
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setShowExportMenu(false)
                            exportAsImage()
                          }}
                          disabled={isExporting}
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          {t("productImport.exportAsImage")}
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setShowExportMenu(false)
                            exportAsPDF()
                          }}
                          disabled={isExporting}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {t("productImport.exportAsPDF")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <Button onClick={saveStoreLayout}>
                  <Save className="h-4 w-4 mr-2" />
                  {t("productImport.save")}
                </Button>
              </div>
            </div>

            {!floorPlan && (
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("productImport.floorPlan.required")}</AlertTitle>
                <AlertDescription>{t("productImport.floorPlan.loadPrompt")}</AlertDescription>
              </Alert>
            )}

            {floorPlan && (
              <Alert variant="info" className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>
                  {t("productImport.floorPlan.loadedLabel")} {floorPlan.name}
                </AlertTitle>
                <AlertDescription>
                  {t("productImport.floorPlan.validFurnitureOnly")}
                  {getFloorPlanFurnitureNames().length > 0 ? (
                    <span>
                      {" "}
                      {t("productImport.floorPlan.availableFurniture")} {getFloorPlanFurnitureNames().join(", ")}
                    </span>
                  ) : (
                    <span> {t("productImport.floorPlan.noNamedFurniture")}</span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {showFloorPlan && floorPlan && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="floor-plan-opacity" className="text-sm">
                  {t("productImport.floorPlan.opacity")}
                </Label>
                <Slider
                  id="floor-plan-opacity"
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={[floorPlanOpacity]}
                  onValueChange={(value) => setFloorPlanOpacity(value[0])}
                  className="w-32"
                />
                <span className="text-sm">{Math.round(floorPlanOpacity * 100)}%</span>
              </div>
            )}
            <div className="flex gap-6">
              {isSidebarVisible && (
                <div
                  ref={sidebarRef}
                  className="relative"
                  style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
                >
                  <Card className="h-[calc(100vh-200px)]">
                    <CardContent className="p-0 h-full">
                      <Tabs defaultValue="library" className="h-full flex flex-col">
                        <div className="px-4 pt-4">
                          <TabsList className="w-full grid grid-cols-3 gap-1 mb-4">
                            <TabsTrigger value="library" className="flex-1">
                              {t("productImport.library")}
                            </TabsTrigger>
                            <TabsTrigger value="placed" className="flex-1">
                              {t("productImport.floorPlan.placed")}
                            </TabsTrigger>
                            <TabsTrigger value="structural" className="flex-1">
                              {t("productImport.floorPlan.structural")}
                            </TabsTrigger>
                            {selectedFurniture && (
                              <TabsTrigger value="edit" className="flex-1">
                                {t("productImport.edit")}
                              </TabsTrigger>
                            )}
                            <TabsTrigger value="visual" className="flex-1">
                              {t("productImport.floorPlan.visuel")}
                            </TabsTrigger>
                          </TabsList>
                        </div>

                        <div className="flex-1 overflow-hidden">
                          <TabsContent
                            value="library"
                            className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col"
                          >
                            <div className="px-4 pb-4">
                              <Button asChild className="w-full mb-4 mt-4">
                                <a href="/furniture-editor">
                                  <Plus className="h-4 w-4 mr-2 " />
                                  {t("productImport.floorPlan.creerMeuble")}
                                </a>
                              </Button>

                              {floorPlan && (
                                <div className="text-sm text-muted-foreground mb-4 p-2 bg-muted rounded-md">
                                  <Info className="h-4 w-4 inline-block mr-1" />
                                  {t("productImport.floorPlan.notice")}
                                </div>
                              )}
                            </div>

                            <div className="flex-1 overflow-hidden px-4">
                              <ScrollArea className="h-full pr-2" type="always">
                                <div className="flex flex-col gap-3 pb-6">
                                  {/* Caisse fixe toujours disponible */}
                                  <DraggableFurnitureItem
                                    key="fixed-cashier"
                                    furniture={cashierFurniture}
                                    onRename={handleRenameFurniture}
                                    isMatchingPlan={
                                      !floorPlan ||
                                      floorPlan.elements.some(
                                        (element) =>
                                          element.type === "cashier" ||
                                          (element.name && element.name.toLowerCase() === "caisse"),
                                      )
                                    }
                                    disabled={
                                      floorPlan &&
                                      !floorPlan.elements.some(
                                        (element) =>
                                          element.type === "cashier" ||
                                          (element.name && element.name.toLowerCase() === "caisse"),
                                      )
                                    }
                                    onManualPlacement={handleManualPlacement}
                                    floorPlan={floorPlan}
                                    toast={toast}
                                    matchedPlanElements={matchedPlanElements}
                                    placedFurniture={placedFurniture}
                                  />

                                  {/* Séparateur visuel */}
                                  <div className="border-t my-2"></div>

                                  {/* Meubles existants de la bibliothèque */}
                                  {savedFurniture.length > 0 ? (
                                    savedFurniture.map((furniture) => {
                                      const isInPlan = isFurnitureInPlan(furniture)
                                      return (
                                        <DraggableFurnitureItem
                                          key={`${furniture.furniture.id}-${furniture.furniture.name}`}
                                          furniture={furniture}
                                          onRename={handleRenameFurniture}
                                          isMatchingPlan={isInPlan}
                                          disabled={floorPlan && !isInPlan}
                                          onManualPlacement={handleManualPlacement}
                                          floorPlan={floorPlan}
                                          toast={toast}
                                          matchedPlanElements={matchedPlanElements}
                                          placedFurniture={placedFurniture}
                                        />
                                      )
                                    })
                                  ) : (
                                    <div className="col-span-2 text-center py-4 text-muted-foreground">
                                      {t("productImport.floorPlan.noMeuble")}
                                    </div>
                                  )}
                                </div>
                              </ScrollArea>
                            </div>
                          </TabsContent>

                          <TabsContent
                            value="placed"
                            className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col mt-4"
                          >
                            <div className="flex-1 overflow-hidden px-4">
                              <ScrollArea className="h-full pr-2" type="always">
                                <div className="space-y-2 pb-6">
                                  {placedFurniture.length > 0 ? (
                                    placedFurniture.map((item) => (
                                      <div
                                        key={item.id}
                                        className={`flex items-center justify-between p-2 border rounded-md ${
                                          selectedFurnitureId === item.id ? "border-primary bg-primary/5" : ""
                                        }`}
                                        onClick={() => setSelectedFurnitureId(item.id)}
                                        dir={textDirection}
                                      >
                                       <div className="flex-1 truncate">
                                          {item.savedFurniture?.furniture?.name || t("furniture.unknown")}
                                        </div>

                                        <div className="flex space-x-1">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleUpdateFurniture({
                                                ...item,
                                                rotation: (item.rotation + 90) % 360,
                                              })
                                            }}
                                          >
                                            <RotateCw className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleRemoveFurniture(item.id)
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                      {floorPlan
                                        ? t("productImport.floorPlan.dragFromLibrary")
                                        : t("productImport.floorPlan.loadFirst")}
                                    </div>
                                  )}
                                </div>
                              </ScrollArea>
                            </div>

                            {floorPlan && (
                              <div className="px-4 pb-4 pt-2">
                                <Button variant="outline" className="w-full" onClick={handleAutoPlacement}>
                                  <ArrowLeft className="h-4 w-4 mr-2" />
                                  {t("productImport.placementAuto")}
                                </Button>
                              </div>
                            )}
                          </TabsContent>

                          {selectedFurniture && (
                            <TabsContent
                              value="edit"
                              className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col"
                            >
                              <div className="flex-1 overflow-hidden px-4">
                                <ScrollArea className="h-full pr-2" type="always">
                                  <div className="pb-6">
                                    <FurnitureControls
                                      selectedFurniture={selectedFurniture}
                                      onUpdate={handleUpdateFurniture}
                                      onDelete={() => handleRemoveFurniture(selectedFurniture.id)}
                                    />
                                  </div>
                                </ScrollArea>
                              </div>
                            </TabsContent>
                          )}

                          <TabsContent
                            value="visual"
                            className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col"
                          >
                            <div className="flex-1 overflow-hidden px-4">
                              <ScrollArea className="h-full pr-2" type="always">
                                <div className="pb-6">
                                  <VisualizationSettings
                                    lightIntensity={lightIntensity}
                                    setLightIntensity={setLightIntensity}
                                    environmentPreset={environmentPreset}
                                    setEnvironmentPreset={setEnvironmentPreset}
                                    showShadows={showShadows}
                                    setShowShadows={setShowShadows}
                                  />
                                </div>
                              </ScrollArea>
                            </div>
                          </TabsContent>
                          <TabsContent
                            value="structural"
                            className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col"
                          >
                            <div className="flex-1 overflow-hidden px-4">
                              <ScrollArea className="h-full pr-2" type="always">
                                <div className="space-y-4 pb-6">
                                  <h3 className="font-medium mt-4">
                                    {t("productImport.floorPlan.structuralElements")}
                                  </h3>

                                  <div className="grid grid-cols-2 gap-2">
                                  <Button
                                      variant="outline"
                                      className="h-20 flex flex-col items-center justify-center"
                                      onClick={() => handleAddWall(0, 0)}
                                    >
                                      <div className="w-12 h-6 bg-gray-400 rounded-sm mb-2"></div>
                                      <span className="text-xs">{t("productImport.floorPlan.wall")}</span>
                                    </Button>

                                    <Button
                                      variant="outline"
                                      className="h-20 flex flex-col items-center justify-center"
                                      onClick={() => handleAddWindow(0, 0)}
                                    >
                                      <div className="w-12 h-6 bg-blue-200 border-2 border-gray-400 rounded-sm mb-2"></div>
                                      <span className="text-xs">{t("productImport.floorPlan.window")}</span>
                                    </Button>
                                  </div>

                                  <div className="text-sm text-muted-foreground mt-4">
                                    <p>
                                    {t("productImport.floorPlan.conseil")}
                                    </p>
                                  </div>
                                </div>
                              </ScrollArea>
                            </div>
                          </TabsContent>
                        </div>
                      </Tabs>
                    </CardContent>
                  </Card>

                  {/* Ajout de la poignée de redimensionnement */}
                  <div
                    className={`absolute top-0 ${isRTL ? "left-0" : "right-0"} h-full w-4 cursor-ew-resize flex items-center justify-center`}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      resizingRef.current = true
                      document.body.style.cursor = "ew-resize"
                      document.body.style.userSelect = "none"
                    }}
                  >
                    <div className="h-16 w-1 bg-gray-300 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              )}

              <div className="flex-1">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium">{t("productImport.floorPlan.monMagasin")}</h2>
                      <div className="text-sm text-muted-foreground">
                        {placedFurniture.length} {t("productImport.placedFurniture")}
                      </div>
                    </div>

                    <div className="relative">
                      <StoreDisplayArea
                        onDrop={handleDropFurniture}
                        placedFurniture={placedFurniture}
                        products={products}
                        onSelectFurniture={setSelectedFurnitureId}
                        selectedFurnitureId={selectedFurnitureId}
                        triggerCapture={triggerCapture}
                        onCaptureComplete={handleCaptureComplete}
                        sceneScale={sceneScale}
                        floorPlan={floorPlan}
                        showFloorPlan={showFloorPlan}
                        floorPlanOpacity={floorPlanOpacity}
                        disabled={!floorPlan}
                        lightIntensity={lightIntensity}
                        environmentPreset={environmentPreset}
                        showShadows={showShadows}
                        setShowFloorPlanSelector={setShowFloorPlanSelector}
                      />

                      <ZoomControls sceneScale={sceneScale} setSceneScale={setSceneScale} />

                      <div className="absolute top-4 right-4 bg-white/80 rounded-md px-2 py-1 text-sm flex items-center">
                        <ArrowLeft className="h-3 w-3 mr-1" />
                        {t("productImport.zoom")} {Math.round(sceneScale * 100)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <FloorPlanSelector
          open={showFloorPlanSelector}
          onOpenChange={setShowFloorPlanSelector}
          onSelectPlan={handleSelectFloorPlan}
          floorPlans={floorPlans}
        />

        {/* Dialog for selecting which matching element to use */}
        <Dialog open={showNameMatchDialog} onOpenChange={setShowNameMatchDialog}>
          <DialogContent className="sm:max-w-[500px]" dir={textDirection}>
            <DialogHeader>
              <DialogTitle>{t("productImport.floorPlan.correspendance")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p className="text-sm text-muted-foreground">{t("productImport.floorPlan.multipleMatches")}</p>
              <div className="grid gap-2">
                {matchingElements.map((element) => (
                  <div
                    key={element.id}
                    className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted"
                    onClick={() => handleElementSelection(element)}
                  >
                    <div>
                      <div className="font-medium">{element.name || element.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {t("position")}: {element.x.toFixed(0)}, {element.y.toFixed(0)}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {t("selectionner")}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialogue de matching manuel */}
        {currentFurnitureToMatch && (
          <ManualMatchDialog
            open={showManualMatchDialog}
            onOpenChange={setShowManualMatchDialog}
            furnitureId={currentFurnitureToMatch.id}
            furnitureName={currentFurnitureToMatch.name}
            floorPlan={floorPlan}
            onSelectElement={handleManualElementSelection}
          />
        )}
      </DndProvider>
    </div>
  )
}

// Function to calculate auto-placement coordinates
const getAutoPlacementCoordinates = (element, roomWidth, roomDepth) => {
  // Convert pixel coordinates to meters (assuming 100 pixels = 1 meter)
  const xPos = element.x / 100 - roomWidth / 4
  const zPos = element.y / 100 - roomDepth / 4
  const width = element.width / 100
  const depth = element.height / 100

  // Calculate the center position of the element
  const x = xPos + width / 2
  const z = zPos + depth / 2

  // Determine rotation based on element rotation
  const rotation = element.rotation || 0

  return { x, y: 0, z, rotation }
}
