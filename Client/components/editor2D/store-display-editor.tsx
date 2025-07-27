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
  ImageIcon,
  FileText,
  Settings,
  CheckCircle2,
  Menu,
  X,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react"
import { Trash2 } from "lucide-react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
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
  RefrigeratedShowcase,
  CashierDisplay,
  ShelvesDisplay,
  ClothingWallDisplay,
  ClothingDisplay,
  SupermarketFridge,
} from "@/components/editor2D/furniture-3d-components"
import { Wall, Window, Door } from "@/components/editor2D/structural-3d-components"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import * as THREE from "three"
import "@/components/multilingue/i18n.js"
import { useTranslation } from "react-i18next"

interface Magasin {
  magasin_id: string
  nom_magasin: string
}

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
  DOOR: "door",
}

// Hook pour détecter la taille d'écran
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
    isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false,
    isTablet: typeof window !== "undefined" ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setScreenSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      })
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return screenSize
}

// Composant Toolbar Responsive
const ResponsiveToolbar = ({
  floorPlan,
  onShowFloorPlanSelector,
  onAutoPlacement,
  onExportImage,
  onExportPDF,
  onSave,
  isExporting,
}) => {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useScreenSize()
  const [showMobileActions, setShowMobileActions] = useState(false)

  // Actions principales (toujours visibles)
  const primaryActions = [
    {
      key: "back",
      label: t("productImport.backToEditor"),
      icon: ArrowLeft,
      onClick: () => (window.location.href = "/Editor"),
      variant: "outline" as const,
    },
  ]

  // Actions secondaires (dans le dropdown sur mobile)
  const secondaryActions = [
    {
      key: "settings",
      label: t("productImport.parametres"),
      icon: Settings,
      onClick: () => {},
      variant: "outline" as const,
    },
    {
      key: "floorplan",
      label: floorPlan ? t("productImport.change") : t("productImport.load"),
      icon: Map,
      onClick: onShowFloorPlanSelector,
      variant: "outline" as const,
    },
    ...(floorPlan
      ? [
          {
            key: "auto",
            label: t("productImport.placementAuto"),
            icon: ArrowLeft,
            onClick: onAutoPlacement,
            variant: "outline" as const,
          },
        ]
      : []),
    {
      key: "export-image",
      label: t("productImport.exportAsImage"),
      icon: ImageIcon,
      onClick: onExportImage,
      disabled: isExporting,
      variant: "outline" as const,
    },
    {
      key: "export-pdf",
      label: t("productImport.exportAsPDF"),
      icon: FileText,
      onClick: onExportPDF,
      disabled: isExporting,
      variant: "outline" as const,
    },
    {
      key: "save",
      label: t("productImport.save"),
      icon: Save,
      onClick: onSave,
      variant: "default" as const,
    },
  ]

  // Sur desktop, afficher tous les boutons
  if (!isMobile && !isTablet) {
    return (
      <div className="flex items-center space-x-2">
        {[...primaryActions, ...secondaryActions].map((action) => (
          <Button key={action.key} variant={action.variant} onClick={action.onClick} disabled={action.disabled}>
            <action.icon className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </div>
    )
  }

  // Sur tablet, afficher quelques boutons + dropdown
  if (isTablet) {
    const visibleActions = [...primaryActions, secondaryActions[1]] // Back + Floor Plan
    const dropdownActions = secondaryActions.slice(1) // Le reste dans le dropdown

    return (
      <div className="flex items-center space-x-2">
        {visibleActions.map((action) => (
          <Button
            key={action.key}
            variant={action.variant}
            onClick={action.onClick}
            disabled={action.disabled}
            size="sm"
          >
            <action.icon className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Plus
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {dropdownActions.map((action, index) => (
              <div key={action.key}>
                {index > 0 && action.key === "export-image" && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={action.onClick} disabled={action.disabled} className="flex items-center">
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

 // Sur mobile, bouton principal + dropdown pour tout le reste
return (
  <div className="flex items-center space-x-2 w-full">
   
    <Button
    variant="outline"
    onClick={primaryActions[0].onClick}
    size="sm"
    className="flex-shrink-0 bg-transparent"
  >
    {primaryActions[0].icon && (() => {
      const Icon = primaryActions[0].icon
      return <Icon className="h-4 w-4 mr-2" />
    })()}
    {primaryActions[0].label}
  </Button>


    {/* Dropdown avec toutes les autres actions */}
    <DropdownMenu open={showMobileActions} onOpenChange={setShowMobileActions}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
          <MoreHorizontal className="h-4 w-4 mr-2" />
          Actions
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {secondaryActions.map((action, index) => (
          <div key={action.key}>
            {/* Séparateur avant les actions d'export */}
            {index > 0 && action.key === "export-image" && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() => {
                action.onClick()
                setShowMobileActions(false)
              }}
              disabled={action.disabled}
              className="flex items-center py-3"
            >
              <action.icon className="h-4 w-4 mr-3" />
              <span className="flex-1">{action.label}</span>
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)
}

// Composant pour précharger les textures des produits
const TexturePreloader = ({ products }) => {
  const productImages = products.map((product) => product.image).filter(Boolean)
  useTexture(productImages)
  return null
}

// Composant pour capturer la scène Three.js
const SceneCapture = ({ triggerCapture, onCaptureComplete, products }) => {
  const { gl, scene, camera } = useThree()
  const [texturesLoaded, setTexturesLoaded] = useState(false)

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
        setTexturesLoaded(true)
      })
  }, [products])

  useEffect(() => {
    if (triggerCapture && texturesLoaded) {
      setTimeout(() => {
        try {
          gl.render(scene, camera)
          const dataURL = gl.domElement.toDataURL("image/png", 1.0)
          onCaptureComplete(dataURL)
        } catch (error) {
          console.error("Erreur lors de la capture:", error)
          onCaptureComplete(null)
        }
      }, 500)
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

// Floor Plan Selector Component - Responsive
const FloorPlanSelector = ({ open, onOpenChange, onSelectPlan, floorPlans }) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const { isMobile } = useScreenSize()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${isMobile ? "w-[95vw] max-w-[95vw] h-[90vh] max-h-[90vh]" : "sm:max-w-[500px]"} overflow-y-auto`}
        dir={textDirection}
      >
        <DialogHeader>
          <DialogTitle className={isMobile ? "text-lg" : ""}>Sélectionner un plan d'étage</DialogTitle>
          <DialogDescription className={isMobile ? "text-sm" : ""}>
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
                  className={`flex ${isMobile ? "flex-col" : "items-center justify-between"} p-3 border rounded-md cursor-pointer hover:bg-muted`}
                >
                  <div className={isMobile ? "mb-2" : ""}>
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Mis à jour: {new Date(plan.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {plan.elements.length} éléments • {plan.elements.filter((e) => e.name).length} nommés
                    </div>
                  </div>
                  <Button variant="outline" size={isMobile ? "default" : "sm"} className={isMobile ? "w-full" : ""}>
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
        <DialogFooter className={isMobile ? "flex-col gap-2" : ""}>
          <Link href="/floor-plan-editor" className={isMobile ? "w-full" : ""}>
            <Button variant="outline" className={isMobile ? "w-full" : ""}>
              <Map className="h-4 w-4 mr-2" />
              Créer un plan
            </Button>
          </Link>
          <Button variant="outline" onClick={() => onOpenChange(false)} className={isMobile ? "w-full" : ""}>
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Composant de dialogue pour le matching manuel - Responsive
const ManualMatchDialog = ({ open, onOpenChange, furnitureId, furnitureName, floorPlan, onSelectElement }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const { isMobile } = useScreenSize()

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

  const filteredElements = furnitureElements.filter(
    (element) =>
      element.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      element.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${isMobile ? "w-[95vw] max-w-[95vw] h-[90vh] max-h-[90vh]" : "sm:max-w-[600px]"} overflow-y-auto`}
        dir={textDirection}
      >
        <DialogHeader>
          <DialogTitle className={isMobile ? "text-lg" : ""}>
            {t("productImport.floorPlan.associerFenetre")} "{furnitureName}"{" "}
            {t("productImport.floorPlan.associerFenetre1")}
          </DialogTitle>
          <DialogDescription className={isMobile ? "text-sm" : ""}>
            {t("productImport.floorPlan.associerFenetre2")}
          </DialogDescription>
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
          <div className={`${isMobile ? "max-h-[40vh]" : "max-h-[300px]"} overflow-y-auto border rounded-md`}>
            {filteredElements.length > 0 ? (
              <div className="grid gap-1 p-1">
                {filteredElements.map((element) => (
                  <div
                    key={element.id}
                    className={`flex ${isMobile ? "flex-col" : "items-center justify-between"} p-3 border rounded-md cursor-pointer hover:bg-muted`}
                    onClick={() => onSelectElement(element, furnitureId)}
                  >
                    <div className={`flex items-center ${isMobile ? "mb-2" : ""}`}>
                      <div
                        className="w-4 h-4 rounded-full mr-2 flex-shrink-0"
                        style={{ backgroundColor: getElementColor(element.type) }}
                      />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{element.name || `${element.type} sans nom`}</div>
                        <div className="text-xs text-muted-foreground">
                          {t("productImport.type")} : {element.type} • {t("position")}: {element.x.toFixed(0)},{" "}
                          {element.y.toFixed(0)}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className={isMobile ? "w-full" : ""}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} className={isMobile ? "w-full" : ""}>
            {t("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Realistic Room Components
const RealisticFloor = () => {
  const floorTextures = useTexture({
    map: "/placeholder.svg?height=1024&width=1024",
    normalMap: "/placeholder.svg?height=1024&width=1024",
    roughnessMap: "/placeholder.svg?height=1024&width=1024",
    aoMap: "/placeholder.svg?height=1024&width=1024",
  })

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

  Object.keys(wallTextures).forEach((key) => {
    wallTextures[key].wrapS = wallTextures[key].wrapT = THREE.RepeatWrapping
    wallTextures[key].repeat.set(4, 2)
  })

  return (
    <>
      <mesh position={[0, ROOM_CONFIG.height / 2, -ROOM_CONFIG.depth / 2]} receiveShadow>
        <planeGeometry args={[ROOM_CONFIG.width, ROOM_CONFIG.height]} />
        <meshStandardMaterial {...wallTextures} color={ROOM_CONFIG.wallColor} roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[-ROOM_CONFIG.width / 2, ROOM_CONFIG.height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_CONFIG.depth, ROOM_CONFIG.height]} />
        <meshStandardMaterial {...wallTextures} color={ROOM_CONFIG.wallColor} roughness={0.9} metalness={0.1} />
      </mesh>
    </>
  )
}

// Furniture Item Component (draggable) - Responsive
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
  const { isMobile } = useScreenSize()

  const isPlaced = placedFurniture.some((item) => item.savedFurniture.furniture.id === furniture.furniture.id)
  const isMatched = Object.values(matchedPlanElements).some((match) => match.furnitureId === furniture.furniture.id)
  const matchedElementName = isMatched
    ? Object.values(matchedPlanElements).find((match) => match.furnitureId === furniture.furniture.id)?.elementName
    : null

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.FURNITURE,
      item: { id: furniture.furniture.id, type: ItemTypes.FURNITURE, name: furniture.furniture.name },
      canDrag: !disabled && !isMobile,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [furniture.furniture.id, disabled, furniture.furniture.name, isMobile],
  )

  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(furniture.furniture.name)

  useEffect(() => {
    setNewName(furniture.furniture.name)
  }, [furniture.furniture.name])

  const handleRename = () => {
    if (newName.trim() && newName !== furniture.furniture.name) {
      onRename(furniture.furniture.id, newName.trim())
      furniture.furniture.name = newName.trim()
    }
    setIsEditing(false)
  }

  const handleManualPlacement = (furnitureId) => {
    if (!floorPlan) {
      toast({
        title: "Aucun plan chargé",
        description: "Veuillez d'abord charger un plan d'étage.",
        variant: "destructive",
      })
      return
    }
    onManualPlacement(furnitureId)
  }

  return (
    <div
      className={`
        flex flex-col p-3 border-2 rounded-lg group relative w-full
        transition-all duration-300 ease-in-out
        ${isDragging ? "opacity-50 scale-95 shadow-inner" : "opacity-100 scale-100"}
        ${isMatchingPlan ? "border-green-500 bg-green-50 animate-pulse" : ""}
        ${
          isMatched
            ? `border-cyan-400 bg-gradient-to-r from-cyan-50 to-cyan-100 shadow-lg shadow-cyan-500/40 ring-1 ring-cyan-300/70 hover:shadow-cyan-600/60 hover:scale-[1.02] ${!isPlaced ? "animate-[pulse_2s_ease-in-out_infinite]" : ""}`
            : ""
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        hover:border-primary hover:bg-primary/10
        ${isMobile ? "touch-manipulation" : ""}
      `}
      dir={textDirection}
    >
      <div className="flex items-center w-full">
        <div
          ref={!isMobile ? drag : null}
          className={`w-8 h-8 sm:w-10 sm:h-10 bg-muted/30 rounded-md flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 ${!disabled && !isMobile ? "cursor-move" : ""}`}
        >
          <Package className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          {isEditing ? (
            <div className="flex items-center space-x-1">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-6 sm:h-7 text-xs sm:text-sm"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-6 sm:h-7 px-1 sm:px-2 flex-shrink-0 text-xs"
                onClick={handleRename}
              >
                {t("productImport.floorPlan.ok")}
              </Button>
            </div>
          ) : (
            <div>
              <div className="font-medium truncate flex items-center text-sm sm:text-base">
                {furniture.furniture.name}
                {isMatched && (
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {furniture.products.length} {t("productImport.produits")}
              </div>
              {matchedElementName && <div className="text-xs text-blue-600 mt-1 truncate">{matchedElementName}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Boutons d'action - Responsive */}
      <div className={`flex ${isMobile ? "flex-col gap-1" : "justify-between"} mt-2 w-full`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={`${isMobile ? "h-8 w-full justify-start" : "h-6 sm:h-7 px-1 sm:px-2"} text-xs`}
                onClick={() => setIsEditing(true)}
              >
                {t("productImport.floorPlan.renommer")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("productImport.floorPlan.renameFurniture")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {floorPlan && (
          <div className={`flex ${isMobile ? "flex-col gap-1" : "gap-1"}`}>
            {isMatched ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`${isMobile ? "h-8 w-full justify-start" : "h-6 sm:h-7 px-1 sm:px-2"} text-xs text-red-500 border-red-200 hover:bg-red-50`}
                      onClick={() => onManualPlacement(furniture.furniture.id, false, true)}
                    >
                      {t("cancel")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("productImport.floorPlan.cancelMatching")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`${isMobile ? "h-8 w-full justify-start" : "h-6 sm:h-7 px-1 sm:px-2"} text-xs`}
                      onClick={() => onManualPlacement(furniture.furniture.id, true)}
                    >
                      {t("productImport.floorPlan.matchFurniture")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("productImport.floorPlan.associateWithElement")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {isMatched && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`${isMobile ? "h-8 w-full justify-start" : "h-6 sm:h-7 px-1 sm:px-2"} text-xs`}
                      onClick={() => handleManualPlacement(furniture.furniture.id)}
                    >
                      {t("productImport.floorPlan.placer")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("productImport.floorPlan.placeInStore")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </div>

      {isMatched && (
        <Badge
          variant="outline"
          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-blue-100 text-blue-800 border-blue-500 text-xs"
        >
          {t("productImport.floorPlan.associer1")}
        </Badge>
      )}
      {isMatchingPlan && (
        <Badge
          variant="outline"
          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-green-100 text-green-800 border-green-500 text-xs"
        >
          {t("productImport.floorPlan.dansPlan")}
        </Badge>
      )}
    </div>
  )
}

// Furniture Controls Component - Responsive
const FurnitureControls = ({ selectedFurniture, onUpdate, onDelete }) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const { isMobile } = useScreenSize()

  if (!selectedFurniture) return null

  const handlePositionChange = (axis, value) => {
    onUpdate({
      ...selectedFurniture,
      [axis]: Number.parseFloat(value),
    })
  }

  const handleRotationChange = (value) => {
    onUpdate({
      ...selectedFurniture,
      rotation: Number.parseInt(value),
    })
  }

  const handleDimensionChange = (dimension, value) => {
    if (["wall", "window", "door"].includes(selectedFurniture.type)) {
      onUpdate({
        ...selectedFurniture,
        [dimension]: Number.parseFloat(value),
      })
      return
    }

    if (selectedFurniture.savedFurniture && selectedFurniture.savedFurniture.furniture) {
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
  }

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

  const handleMoveButton = (axis, direction) => {
    const step = direction * moveStep
    onUpdate({
      ...selectedFurniture,
      [axis]: selectedFurniture[axis] + step,
    })
  }

  const handleRotateButton = (direction) => {
    const newRotation = (selectedFurniture.rotation + direction * rotateStep) % 360
    onUpdate({
      ...selectedFurniture,
      rotation: newRotation < 0 ? newRotation + 360 : newRotation,
    })
  }

  return (
    <div className="space-y-4 p-3 sm:p-4 border rounded-md mt-4" dir={textDirection}>
      <h3 className="font-medium text-sm sm:text-base">{t("productImport.furnitureControls")}</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="furniture-name" className="text-sm">
            {t("productImport.floorPlan.nomMeuble")}
          </Label>
          <Input
            id="furniture-name"
            value={selectedFurniture?.savedFurniture?.furniture?.name || ""}
            onChange={(e) => handleNameChange(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Position Controls - Responsive */}
        <div>
          <h4 className="text-sm font-medium mb-2">{t("position")}</h4>
          <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-3 gap-2"}`}>
            <div>
              <Label htmlFor="position-x" className="text-xs sm:text-sm">
                {t("productImport.positionX")}
              </Label>
              <Input
                id="position-x"
                type="number"
                step="0.1"
                value={selectedFurniture.x}
                onChange={(e) => handlePositionChange("x", e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="position-y" className="text-xs sm:text-sm">
                {t("productImport.positionY")}
              </Label>
              <Input
                id="position-y"
                type="number"
                step="0.1"
                value={selectedFurniture.y}
                onChange={(e) => handlePositionChange("y", e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="position-z" className="text-xs sm:text-sm">
                {t("productImport.positionZ")}
              </Label>
              <Input
                id="position-z"
                type="number"
                step="0.1"
                value={selectedFurniture.z}
                onChange={(e) => handlePositionChange("z", e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Movement Controls - Responsive */}
          <div className="mt-3">
            <Label className="text-sm mb-2 block">{t("productImport.deplacer")}</Label>
            <div className={`grid grid-cols-3 gap-1 ${isMobile ? "max-w-[200px] mx-auto" : "w-full"}`}>
              <div className="col-span-3 flex justify-center">
                <Button size={isMobile ? "default" : "sm"} variant="outline" onClick={() => handleMoveButton("y", 1)}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-end">
                <Button
                  size={isMobile ? "default" : "sm"}
                  variant="outline"
                  onClick={() => handleMoveButton("x", isRTL ? 1 : -1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-center">
                <Button size={isMobile ? "default" : "sm"} variant="outline" onClick={() => handleMoveButton("y", -1)}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-start">
                <Button
                  size={isMobile ? "default" : "sm"}
                  variant="outline"
                  onClick={() => handleMoveButton("x", isRTL ? -1 : 1)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Rotation Controls - Responsive */}
        <div>
          <h4 className="text-sm font-medium mb-2">{t("productImport.rotation")}</h4>
          <div className={`flex items-center ${isMobile ? "flex-col gap-2" : "space-x-2"}`}>
            <Input
              id="rotation"
              type="number"
              step="15"
              value={selectedFurniture.rotation}
              onChange={(e) => handleRotationChange(e.target.value)}
              className={`${isMobile ? "w-full" : "flex-1"} text-sm`}
            />
            <div className={`flex ${isMobile ? "w-full justify-center" : ""} space-x-1`}>
              <Button
                size={isMobile ? "default" : "sm"}
                variant="outline"
                onClick={() => handleRotateButton(-1)}
                title="Rotation gauche"
                className={isMobile ? "flex-1" : ""}
              >
                <RotateCw className="h-4 w-4 transform -scale-x-100" />
              </Button>
              <Button
                size={isMobile ? "default" : "sm"}
                variant="outline"
                onClick={() => handleRotateButton(1)}
                title="Rotation droite"
                className={isMobile ? "flex-1" : ""}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dimension Controls - Responsive */}
        <div>
          <h4 className="text-sm font-medium mb-2">{t("productImport.dimensions")}</h4>
          <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 gap-2"}`}>
            <div>
              <Label htmlFor="width" className="text-xs sm:text-sm">
                {t("productImport.width")}
              </Label>
              <Input
                id="width"
                type="number"
                step="0.1"
                min="0.1"
                value={
                  selectedFurniture.type === "wall" ||
                  selectedFurniture.type === "window" ||
                  selectedFurniture.type === "door"
                    ? selectedFurniture.width
                    : selectedFurniture?.savedFurniture?.furniture?.width || 0.1
                }
                onChange={(e) => handleDimensionChange("width", e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-xs sm:text-sm">
                {t("productImport.height")}
              </Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                min="0.1"
                value={
                  selectedFurniture.type === "wall" ||
                  selectedFurniture.type === "window" ||
                  selectedFurniture.type === "door"
                    ? selectedFurniture.height
                    : selectedFurniture?.savedFurniture?.furniture?.height || 0.1
                }
                onChange={(e) => handleDimensionChange("height", e.target.value)}
                className="text-sm"
              />
            </div>
            <div className={isMobile ? "" : "col-span-2"}>
              <Label htmlFor="depth" className="text-xs sm:text-sm">
                {t("productImport.depth")}
              </Label>
              <Input
                id="depth"
                type="number"
                step="0.1"
                min="0.1"
                value={
                  selectedFurniture.type === "wall" ||
                  selectedFurniture.type === "window" ||
                  selectedFurniture.type === "door"
                    ? selectedFurniture.depth
                    : selectedFurniture?.savedFurniture?.furniture?.depth || 0.1
                }
                onChange={(e) => handleDimensionChange("depth", e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="destructive" size={isMobile ? "default" : "sm"} className="w-full" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            {t("productImport.delete")}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Zoom Controls Component - Responsive
const ZoomControls = ({ sceneScale, setSceneScale }) => {
  const { isMobile } = useScreenSize()
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
    <div
      className={`absolute ${isMobile ? "bottom-2 right-2" : "bottom-4 right-4"} bg-white rounded-md shadow-md p-1 flex ${isMobile ? "flex-col" : ""} space-x-1`}
    >
      <Button
        variant="outline"
        size={isMobile ? "sm" : "icon"}
        onClick={handleZoomOut}
        title="Zoom out"
        className={isMobile ? "mb-1" : ""}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={handleReset} className={`${isMobile ? "mb-1 text-xs" : "px-2"}`}>
        {Math.round(sceneScale * 100)}%
      </Button>
      <Button
        variant="outline"
        size={isMobile ? "sm" : "icon"}
        onClick={handleZoomIn}
        title="Zoom in"
        className={isMobile ? "mb-1" : ""}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="outline" size={isMobile ? "sm" : "icon"} onClick={handleReset} title="Reset zoom">
        <Maximize className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Store Display Area Component (droppable) - Responsive
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
  const { isMobile, isTablet, height } = useScreenSize()

  const EnhancedControls = () => {
    const { camera } = useThree()
    useEffect(() => {
      camera.position.set(ROOM_CONFIG.width / 2, ROOM_CONFIG.height * 1.5, ROOM_CONFIG.depth / 2)
      camera.lookAt(ROOM_CONFIG.width / 2, 0, ROOM_CONFIG.depth / 2)
      camera.updateProjectionMatrix()
    }, [camera])

    return (
      <OrbitControls
        makeDefault
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={ROOM_CONFIG.width * 2}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        screenSpacePanning={false}
        target={[ROOM_CONFIG.width / 2, 0, ROOM_CONFIG.depth / 2]}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={isMobile ? 0.5 : 1}
        zoomSpeed={isMobile ? 0.5 : 1}
        panSpeed={isMobile ? 0.5 : 1}
      />
    )
  }

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.FURNITURE,
    drop: (item: { id: string }, monitor) => {
      const offset = monitor.getClientOffset()
      if (offset) {
        const dropAreaRect = document.getElementById("store-display-area")?.getBoundingClientRect()
        if (dropAreaRect) {
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

  const CameraScaler = ({ scale }) => {
    const { camera } = useThree()
    useEffect(() => {
      camera.position.set(ROOM_CONFIG.width / 2, ROOM_CONFIG.width / 2, ROOM_CONFIG.width / 2)
      camera.zoom = scale
      camera.updateProjectionMatrix()
    }, [camera, scale])
    return null
  }

  const FloorPlanVisualization = () => {
    if (!showFloorPlan || !floorPlan) return null

    return (
      <group>
        {floorPlan.elements.map((element) => {
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
              <group position={[0, 0, 0.01]}>
                <Html position={[0, 0, 0.1]} center distanceFactor={isMobile ? 20 : 15}>
                  <div
                    className={`bg-white bg-opacity-50 px-1 py-0.5 rounded ${isMobile ? "text-[6px]" : "text-[8px]"} font-medium whitespace-nowrap`}
                  >
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

  const canvasHeight = isMobile ? Math.min(height * 0.5, 400) : isTablet ? Math.min(height * 0.6, 500) : 600

  return (
    <div
      id="store-display-area"
      ref={drop}
      className={`
        relative border rounded-md overflow-hidden
        ${isOver ? "border-primary" : "border-muted"}
        ${disabled ? "cursor-not-allowed" : ""}
        ${isMobile ? "touch-manipulation" : ""}
      `}
      style={{ height: `${canvasHeight}px` }}
      dir={textDirection}
    >
      {disabled && (
        <div className="absolute inset-0 bg-gray-200 bg-opacity-50 z-10 flex items-center justify-center p-4">
          <div className={`bg-white p-4 rounded-md shadow-lg ${isMobile ? "w-full max-w-sm" : "max-w-md"} text-center`}>
            <AlertCircle className={`${isMobile ? "h-8 w-8" : "h-12 w-12"} text-amber-500 mx-auto mb-2`} />
            <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium mb-2`}>
              {t("productImport.floorPlan.required")}
            </h3>
            <p className={`text-muted-foreground mb-4 ${isMobile ? "text-sm" : ""}`}>
              {t("productImport.floorPlan.loadPrompt")}
            </p>
            <Button
              variant="outline"
              className={`mx-auto ${isMobile ? "w-full" : ""}`}
              onClick={() => setShowFloorPlanSelector(true)}
            >
              <Map className="h-4 w-4 mr-2" />
              {t("productImport.load")}
            </Button>
          </div>
        </div>
      )}

      <Canvas
        shadows={showShadows}
        camera={{
          position: [ROOM_CONFIG.width / 2, ROOM_CONFIG.width / 2, ROOM_CONFIG.width / 2],
          fov: isMobile ? 60 : 50,
        }}
        gl={{
          antialias: !isMobile,
          powerPreference: isMobile ? "low-power" : "high-performance",
        }}
      >
        <TexturePreloader products={products} />
        <CameraScaler scale={sceneScale} />

        <Environment preset={environmentPreset} background={false} />
        <ambientLight intensity={lightIntensity * 0.5} />
        <directionalLight
          position={[ROOM_CONFIG.width / 2, ROOM_CONFIG.width / 2, ROOM_CONFIG.width / 2]}
          intensity={lightIntensity}
          castShadow={showShadows && !isMobile}
          shadow-mapSize-width={isMobile ? 512 : 1024}
          shadow-mapSize-height={isMobile ? 512 : 1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        <Suspense fallback={null}>
          <RealisticFloor />
          <RealisticWalls />
        </Suspense>

        <FloorPlanVisualization />

        <Suspense fallback={null}>
          {placedFurniture.map((item) => {
            if (item.type === "door") {
              return (
                <group
                  key={`door-${item.id}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectFurniture(item.id)
                  }}
                  userData-selected={item.id === selectedFurnitureId}
                  position={[item.x, item.y, item.z]}
                  rotation={[0, (item.rotation * Math.PI) / 180, 0]}
                >
                  <Door width={item.width} height={item.height} depth={item.depth} />
                </group>
              )
            }

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
                  <Wall width={item.width} height={item.height} depth={item.depth} />
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
                  <Window width={item.width} height={item.height} depth={item.depth} />
                </group>
              )
            }

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
                quantity: p.quantity || 1,
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
                      cellWidth={savedFurniture.furniture.width / savedFurniture.furniture.slots}
                      cellHeight={savedFurniture.furniture.height / savedFurniture.furniture.sections}
                    />
                  </group>
                )
              case "refrigerator":
                return (
                  <group key={`furniture-${item.id}`} {...groupProps}>
                    <SupermarketFridge {...furnitureProps} />
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

        {showShadows && !isMobile && (
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

        <EnhancedControls />
        <SceneCapture triggerCapture={triggerCapture} onCaptureComplete={onCaptureComplete} products={products} />
      </Canvas>
    </div>
  )
}

// Visualization Settings Component - Responsive
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
  const { isMobile } = useScreenSize()

  const environmentPresets = [
    { value: "warehouse", label: t("productImport.floorPlan.labels.warehouse") },
    { value: "apartment", label: t("productImport.floorPlan.labels.apartment") },
    { value: "studio", label: t("productImport.floorPlan.labels.studio") },
    { value: "city", label: t("productImport.floorPlan.labels.city") },
    { value: "park", label: t("productImport.floorPlan.labels.park") },
    { value: "sunset", label: t("productImport.floorPlan.labels.sunset") },
  ]

  return (
    <div className="space-y-4 p-3 sm:p-4 border rounded-md mt-4" dir={textDirection}>
      <h3 className="font-medium text-sm sm:text-base">{t("productImport.floorPlan.visualSettings")}</h3>
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
            className="mt-2"
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
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors mt-1"
          >
            {environmentPresets.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>
        {!isMobile && (
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
        )}
      </div>
    </div>
  )
}

// Mobile Sidebar Component
const MobileSidebar = ({ children, isOpen, onClose, title }) => {
  const { t } = useTranslation()

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[90vw] sm:w-[400px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            {title}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100vh-80px)] overflow-hidden">{children}</div>
      </SheetContent>
    </Sheet>
  )
}

// Main Store Display Editor Component - Fully Responsive
export function StoreDisplayEditor() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const { toast } = useToast()
  const { products } = useProductStore()
  const { savedFurniture } = useFurnitureStore()
  const { isMobile, isTablet, isDesktop } = useScreenSize()

  // Detect touch device
  const isTouchDevice = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)
  const dndBackend = isTouchDevice ? TouchBackend : HTML5Backend

  const [magasins, setMagasins] = useState<Magasin[]>([])
  const [selectedMagasin, setSelectedMagasin] = useState<string>("all")
  const [placedFurniture, setPlacedFurniture] = useState([])
  const [selectedFurnitureId, setSelectedFurnitureId] = useState(null)
  const [isExporting, setIsExporting] = useState(false)
  const [triggerCapture, setTriggerCapture] = useState(false)
  const [exportType, setExportType] = useState(null)

  // Responsive sidebar states
  const [isSidebarVisible, setIsSidebarVisible] = useState(!isMobile)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [sceneScale, setSceneScale] = useState(1.0)
  const [sidebarWidth, setSidebarWidth] = useState(isMobile ? 300 : 350)
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
  const [showManualMatchDialog, setShowManualMatchDialog] = useState(false)
  const [currentFurnitureToMatch, setCurrentFurnitureToMatch] = useState(null)

  // Lighting and environment settings
  const [lightIntensity, setLightIntensity] = useState(0.7)
  const [environmentPreset, setEnvironmentPreset] = useState("warehouse")
  const [showShadows, setShowShadows] = useState(!isMobile)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const texturesPreloaded = useRef(false)
  const selectedFurniture = placedFurniture.find((item) => item.id === selectedFurnitureId)
  const [matchedPlanElements, setMatchedPlanElements] = useState({})

  // Update sidebar visibility based on screen size
  useEffect(() => {
    if (isMobile) {
      setIsSidebarVisible(false)
    } else if (isDesktop) {
      setIsSidebarVisible(true)
      setShowMobileSidebar(false)
    }
  }, [isMobile, isDesktop])

  // Fetch magasins
  const fetchMagasins = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/magasins/getAllMagasins`)
      if (!response.ok) throw new Error("Erreur lors de la récupération des magasins")
      const data: Magasin[] = await response.json()
      setMagasins(data)
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des magasins",
        variant: "destructive",
      })
    }
  }, [toast, API_BASE_URL])

  useEffect(() => {
    fetchMagasins()
  }, [fetchMagasins])

  const getProductDetails = useCallback(
    (productId) => {
      return products.find((p) => p.primary_Id === productId)
    },
    [products],
  )

  // Load floor plans from local storage
  useEffect(() => {
    try {
      const plansJSON = localStorage.getItem("store-floor-plans")
      if (plansJSON) {
        const plans = JSON.parse(plansJSON)
        setFloorPlans(plans)
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

  // Preload textures
  useEffect(() => {
    if (products.length > 0 && !texturesPreloaded.current) {
      const textureLoader = new THREE.TextureLoader()
      textureLoader.crossOrigin = "anonymous"
  
      products.forEach((product) => {
        if (product.image) {
          textureLoader.load(
            product.image,
            () => console.log(`Texture chargée: ${product.image}`),
            undefined,
            (error) => console.error(`Erreur lors du chargement de la texture ${product.image}:`, error),
          )
        }
      })
      texturesPreloaded.current = true
    }
  }, [products])

  // Toggle sidebar functions
  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar)
    } else {
      setIsSidebarVisible((prev) => !prev)
    }
  }

  // Handle sidebar resizing for desktop
  useEffect(() => {
    if (isMobile) return

    const handleMouseMove = (e) => {
      if (resizingRef.current) {
        const newWidth = isRTL ? window.innerWidth - e.clientX : e.clientX
        if (newWidth > 250 && newWidth < 600) {
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

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isRTL, isMobile])

  // Furniture matching and placement functions
  const isFurnitureInPlan = (furniture) => {
    if (!floorPlan || !furniture?.furniture?.name) return false
    const furnitureName =
      typeof furniture.furniture.name === "string"
        ? furniture.furniture.name.toLowerCase()
        : String(furniture.furniture.name).toLowerCase()

    return floorPlan.elements.some(
      (element) =>
        (element.name && element.name.toLowerCase() === furnitureName) ||
        (!element.name && element.type === furniture.furniture.type),
    )
  }

  const getFloorPlanFurnitureNames = () => {
    if (!floorPlan) return []
    return floorPlan.elements.filter((element) => element.name).map((element) => element.name.toLowerCase())
  }

  const handleRenameFurniture = (id, newName) => {
    if (id === "fixed-cashier") {
      cashierFurniture.furniture.name = newName.trim()
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

  // Fixed cashier furniture
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

  const handleManualElementSelection = (element, furnitureId) => {
    if (!element || !furnitureId) return

    if (matchedPlanElements[element.id]) {
      toast({
        title: "Objet déjà associé",
        description: `Cet élément du plan est déjà associé à un autre meuble.`,
        variant: "destructive",
      })
      return
    }

    setMatchedPlanElements((prev) => ({
      ...prev,
      [element.id]: {
        furnitureId,
        elementName: element.name || element.type,
      },
    }))

    if (furnitureId === "fixed-cashier") {
      toast({
        title: "Caisse associée",
        description: `La caisse a été associée à l'élément "${element.name || element.type}" du plan.`,
      })
    } else {
      const furniture = savedFurniture.find((f) => f.furniture.id === furnitureId)
      if (!furniture) return

      toast({
        title: "Meuble associé",
        description: `Le meuble "${furniture.furniture.name}" a été associé à l'élément "${element.name || element.type}" du plan.`,
      })
    }

    setShowManualMatchDialog(false)
    setCurrentFurnitureToMatch(null)
  }

  const handleDropFurniture = (furnitureId, x, y, z) => {
    if (!floorPlan) {
      toast({
        title: "Aucun plan chargé",
        description: "Veuillez d'abord charger un plan d'étage.",
        variant: "destructive",
      })
      return
    }

    const matchedElement = Object.values(matchedPlanElements).find((match) => match.furnitureId === furnitureId)
    if (!matchedElement) {
      toast({
        title: "Association requise",
        description: "Veuillez d'abord associer ce meuble à un élément du plan avec le bouton 'Matcher'.",
        variant: "destructive",
      })
      return
    }

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
      if (floorPlan && showFloorPlan) {
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
          const matchingElement = matchingElements[0]
          const coords = getAutoPlacementCoordinates(matchingElement, ROOM_CONFIG.width, ROOM_CONFIG.depth)

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
          setSelectedFurnitureId(newPlacedFurniture.id)
          toast({
            title: "Meuble placé automatiquement",
            description: `Le meuble "${furniture.furniture.name}" a été placé automatiquement selon le plan.`,
          })
          return
        } else if (matchingElements.length > 1) {
          setMatchingElements(matchingElements)
          setPendingFurnitureId(furnitureId)
          setShowNameMatchDialog(true)
          return
        }
      }
    }
  }

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
        description: `Le meuble "${furniture.furniture.name}" a été placé à l'emplacement sélectionné.`,
      })
    }
  }

  const handleRemoveFurniture = (id) => {
    setPlacedFurniture((prev) => prev.filter((item) => item.id !== id))
    if (selectedFurnitureId === id) {
      setSelectedFurnitureId(null)
    }
  }

  const handleUpdateFurniture = (updatedFurniture) => {
    setPlacedFurniture((prev) =>
      prev.map((item) => (item.id === updatedFurniture.id ? { ...item, ...updatedFurniture } : item)),
    )
  }

  const handleSelectFloorPlan = (plan) => {
    setFloorPlan(plan)
    setShowFloorPlanSelector(false)
    setPlacedFurniture([])
    setSelectedFurnitureId(null)
    toast({
      title: "Plan d'étage chargé",
      description: `Le plan "${plan.name}" a été chargé. Vous pouvez maintenant placer les meubles correspondants.`,
    })
  }

  const handleAutoPlacement = () => {
    if (!floorPlan) {
      toast({
        title: "Aucun plan chargé",
        description: "Veuillez d'abord charger un plan d'étage.",
        variant: "destructive",
      })
      return
    }

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

    let placedCount = 0
    const newPlacedFurniture = [...placedFurniture]

    furnitureElements.forEach((element) => {
      const alreadyPlaced = placedFurniture.some(
        (item) =>
          (element.name && item.savedFurniture.furniture.name.toLowerCase() === element.name.toLowerCase()) ||
          (!element.name && item.savedFurniture.furniture.type === element.type),
      )

      if (alreadyPlaced) return

      const matchingFurniture = savedFurniture.find(
        (f) =>
          (element.name && f.furniture.name.toLowerCase() === element.name.toLowerCase()) ||
          (!element.name && f.furniture.type === element.type),
      )

      if (matchingFurniture) {
        const coords = getAutoPlacementCoordinates(element, ROOM_CONFIG.width, ROOM_CONFIG.depth)
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

    setPlacedFurniture(newPlacedFurniture)

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

  // Export functions
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
      const link = document.createElement("a")
      link.download = `boutique-${new Date().toISOString().slice(0, 10)}.png`
      link.href = dataURL
      link.click()
      toast({
        title: "Exportation réussie",
        description: "L'image a été téléchargée avec succès.",
      })
    } else if (exportType === "pdf") {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
      })

      const imgWidth = 280
      const imgHeight = 160
      pdf.addImage(dataURL, "PNG", 10, 10, imgWidth, imgHeight)
      pdf.setFontSize(12)
      pdf.text(`Agencement de boutique - Exporté le ${new Date().toLocaleDateString()}`, 10, imgHeight + 20)
      pdf.setFontSize(14)
      pdf.text("Détails des meubles placés:", 10, imgHeight + 30)

      let yPosition = imgHeight + 40
      placedFurniture.forEach((item, index) => {
        pdf.setFontSize(11)
        pdf.text(`${index + 1}. ${item.savedFurniture.furniture.name}`, 15, yPosition)
        pdf.setFontSize(9)
        pdf.text(`Type: ${item.savedFurniture.furniture.type}`, 20, yPosition + 5)
        pdf.text(`Position: X=${item.x.toFixed(2)}, Z=${item.z.toFixed(2)}`, 20, yPosition + 10)
        pdf.text(`Rotation: ${item.rotation}°`, 20, yPosition + 15)
        pdf.text(`Produits: ${item.savedFurniture.products.length}`, 20, yPosition + 20)

        if (item.savedFurniture.products.length > 0) {
          pdf.text("Produits associés:", 20, yPosition + 25)
          item.savedFurniture.products.forEach((product, prodIndex) => {
            const productDetails = products.find((p) => p.primary_Id === product.productId)
            const productName = productDetails ? productDetails.name : `Produit #${product.productId}`
            pdf.text(`- ${productName} (Section: ${product.section})`, 25, yPosition + 30 + prodIndex * 5)
          })
        }

        yPosition += 35 + item.savedFurniture.products.length * 5
        if (yPosition > 270) {
          pdf.addPage()
          yPosition = 20
        }
      })

      pdf.save(`boutique-${new Date().toISOString().slice(0, 10)}.pdf`)
      toast({
        title: "Exportation réussie",
        description: "Le PDF a été téléchargé avec succès avec les détails des meubles.",
      })
    }

    setTriggerCapture(false)
    setExportType(null)
    setIsExporting(false)
  }

  const saveStoreLayout = () => {
    toast({
      title: "Agencement sauvegardé",
      description: "L'agencement de la boutique a été sauvegardé avec succès.",
    })
  }

  useEffect(() => {
    if (isExporting) {
      const timer = setTimeout(() => {
        if (isExporting) {
          setIsExporting(false)
          setTriggerCapture(false)
          setExportType(null)
        }
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [isExporting])

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

  const handleManualPlacement = (furnitureId, showMatchDialog = false, cancelMatch = false) => {
    if (cancelMatch) {
      const elementId = Object.keys(matchedPlanElements).find(
        (key) => matchedPlanElements[key].furnitureId === furnitureId,
      )
      if (elementId) {
        const newMatchedElements = { ...matchedPlanElements }
        delete newMatchedElements[elementId]
        setMatchedPlanElements(newMatchedElements)

        const furnitureToRemove = placedFurniture.filter((item) => item.savedFurnitureId === furnitureId)
        if (furnitureToRemove.length > 0) {
          setPlacedFurniture((prev) => prev.filter((item) => item.savedFurnitureId !== furnitureId))
          if (furnitureToRemove.some((item) => item.id === selectedFurnitureId)) {
            setSelectedFurnitureId(null)
          }
          toast({
            title: "Association et meubles supprimés",
            description: `L'association a été annulée et ${furnitureToRemove.length} meuble(s) ont été supprimés de la scène.`,
          })
        } else {
          toast({
            title: "Association annulée",
            description: "L'association entre le meuble et l'élément du plan a été annulée.",
          })
        }
      }
      return
    }

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

    const matchedElement = Object.values(matchedPlanElements).find((match) => match.furnitureId === furnitureId)
    if (!matchedElement) {
      toast({
        title: "Association requise",
        description: "Veuillez d'abord associer ce meuble à un élément du plan avec le bouton 'Matcher'.",
        variant: "destructive",
      })
      return
    }

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

    const coords = getAutoPlacementCoordinates(element, ROOM_CONFIG.width, ROOM_CONFIG.depth)

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

  // Add structural elements
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

  const handleAddDoor = (x, z, width = 1, height = 2, depth = 0.1, rotation = 0) => {
    const newDoor = {
      id: `door-${Date.now()}`,
      type: "door",
      x: x,
      y: 0,
      z: z,
      width: width,
      height: height,
      depth: depth,
      rotation: rotation,
    }
    setPlacedFurniture((prev) => [...prev, newDoor])
    setSelectedFurnitureId(newDoor.id)
    toast({
      title: "Porte ajoutée",
      description: "Une nouvelle porte a été ajoutée à la scène.",
    })
  }

  const handleAddWindow = (x, z, width = 2, height = 1.5, depth = 0.1, rotation = 0) => {
    const newWindow = {
      id: `window-${Date.now()}`,
      type: "window",
      x: x,
      y: 1.5,
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

  // Sidebar content component
  const SidebarContent = () => (
    <Tabs defaultValue="library" className="h-full flex flex-col">
      <div className="px-3 sm:px-4 pt-3 sm:pt-4">
        <TabsList
          className={`w-full grid ${selectedFurniture ? "grid-cols-5" : "grid-cols-4"} gap-1 mb-4 ${isMobile ? "text-xs" : ""}`}
        >
          <TabsTrigger value="library" className="flex-1 text-xs sm:text-sm">
            {t("productImport.library")}
          </TabsTrigger>
          <TabsTrigger value="placed" className="flex-1 text-xs sm:text-sm">
            {t("productImport.floorPlan.placed")}
          </TabsTrigger>
          <TabsTrigger value="structural" className="flex-1 text-xs sm:text-sm">
            {t("productImport.floorPlan.structural")}
          </TabsTrigger>
          {selectedFurniture && (
            <TabsTrigger value="edit" className="flex-1 text-xs sm:text-sm">
              {t("productImport.edit")}
            </TabsTrigger>
          )}
          <TabsTrigger value="visual" className="flex-1 text-xs sm:text-sm">
            {t("productImport.floorPlan.visuel")}
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-hidden">
        <TabsContent value="library" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="mb-4">
              <Label htmlFor="magasin-filter" className="block mb-2 text-sm font-medium">
                {t("productImport.filterByStore")}
              </Label>
              <select
                id="magasin-filter"
                value={selectedMagasin}
                onChange={(e) => setSelectedMagasin(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              >
                <option value="all">{t("productImport.allStores")}</option>
                {magasins.map((magasin) => (
                  <option key={magasin.magasin_id} value={magasin.magasin_id}>
                    {magasin.nom_magasin}
                  </option>
                ))}
              </select>
            </div>

            <Button asChild className="w-full mb-4">
              <a href="/furniture-editor">
                <Plus className="h-4 w-4 mr-2" />
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

          <div className="flex-1 overflow-hidden px-3 sm:px-4">
            <ScrollArea className="h-full pr-2" type="always">
              <div className="flex flex-col gap-3 pb-6">
                <DraggableFurnitureItem
                  key="fixed-cashier"
                  furniture={cashierFurniture}
                  onRename={handleRenameFurniture}
                  isMatchingPlan={
                    !floorPlan ||
                    floorPlan.elements.some(
                      (element) =>
                        element.type === "cashier" || (element.name && element.name.toLowerCase() === "caisse"),
                    )
                  }
                  disabled={
                    floorPlan &&
                    !floorPlan.elements.some(
                      (element) =>
                        element.type === "cashier" || (element.name && element.name.toLowerCase() === "caisse"),
                    )
                  }
                  onManualPlacement={handleManualPlacement}
                  floorPlan={floorPlan}
                  toast={toast}
                  matchedPlanElements={matchedPlanElements}
                  placedFurniture={placedFurniture}
                />

                <div className="border-t my-2"></div>

                {savedFurniture
                  .filter((furniture) => selectedMagasin === "all" || furniture.storeId === selectedMagasin)
                  .filter((furniture) => furniture.furniture && furniture.furniture.name)
                  .map((furniture) => {
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
                  })}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="placed" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
          <div className="flex-1 overflow-hidden px-3 sm:px-4">
            <ScrollArea className="h-full pr-2" type="always">
              <div className="space-y-2 pb-6 mt-4">
                {placedFurniture.length > 0 ? (
                  placedFurniture.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2 border rounded-md cursor-pointer transition-colors ${
                        selectedFurnitureId === item.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedFurnitureId(item.id)}
                    >
                      <div className="flex-1 truncate text-sm">
                        {item.savedFurniture?.furniture?.name || t("furniture.unknown")}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUpdateFurniture({
                              ...item,
                              rotation: (item.rotation + 90) % 360,
                            })
                          }}
                        >
                          <RotateCw className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveFurniture(item.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    {floorPlan ? t("productImport.floorPlan.dragFromLibrary") : t("productImport.floorPlan.loadFirst")}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {floorPlan && (
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2">
              <Button variant="outline" className="w-full bg-transparent" onClick={handleAutoPlacement}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("productImport.placementAuto")}
              </Button>
            </div>
          )}
        </TabsContent>

        {selectedFurniture && (
          <TabsContent value="edit" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <div className="flex-1 overflow-hidden px-3 sm:px-4">
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

        <TabsContent value="visual" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
          <div className="flex-1 overflow-hidden px-3 sm:px-4">
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

        <TabsContent value="structural" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
          <div className="flex-1 overflow-hidden px-3 sm:px-4">
            <ScrollArea className="h-full pr-2" type="always">
              <div className="space-y-4 pb-6 mt-4">
                <h3 className="font-medium text-sm sm:text-base">{t("productImport.floorPlan.structuralElements")}</h3>
                <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-3 gap-2"}`}>
                  <Button
                    variant="outline"
                    className={`${isMobile ? "h-16 flex-row justify-start" : "h-20 flex-col"} flex items-center justify-center`}
                    onClick={() => handleAddWall(0, 0)}
                  >
                    <div className={`${isMobile ? "w-8 h-4 mr-3" : "w-12 h-6 mb-2"} bg-gray-400 rounded-sm`}></div>
                    <span className="text-xs">{t("productImport.floorPlan.wall")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className={`${isMobile ? "h-16 flex-row justify-start" : "h-20 flex-col"} flex items-center justify-center`}
                    onClick={() => handleAddWindow(0, 0)}
                  >
                    <div
                      className={`${isMobile ? "w-8 h-4 mr-3" : "w-12 h-6 mb-2"} bg-blue-200 border-2 border-gray-400 rounded-sm`}
                    ></div>
                    <span className="text-xs">{t("productImport.floorPlan.window")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className={`${isMobile ? "h-16 flex-row justify-start" : "h-20 flex-col"} flex items-center justify-center`}
                    onClick={() => handleAddDoor(0, 0)}
                  >
                    <div
                      className={`${isMobile ? "w-8 h-4 mr-3" : "w-12 h-6 mb-2"} bg-amber-600 border-2 border-gray-400 rounded-sm`}
                    ></div>
                    <span className="text-xs">{t("productImport.floorPlan.door")}</span>
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground mt-4">
                  <p>{t("productImport.floorPlan.conseil")}</p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )

  return (
    <div className="mt-8 sm:mt-12" dir={textDirection}>
      <DndProvider backend={dndBackend}>
        <div className="container mx-auto py-4 sm:py-6 max-w-full px-2 sm:px-4">
          <div className="flex flex-col space-y-4 sm:space-y-6">
            {/* Header avec Toolbar Responsive */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="mr-2"
                    title={
                      isMobile
                        ? "Ouvrir le menu"
                        : isSidebarVisible
                          ? "Masquer le panneau latéral"
                          : "Afficher le panneau latéral"
                    }
                  >
                    {isMobile ? (
                      <Menu className="h-5 w-5" />
                    ) : isSidebarVisible ? (
                      <PanelLeftClose className="h-5 w-5" />
                    ) : (
                      <PanelLeft className="h-5 w-5" />
                    )}
                  </Button>
                  <h1 className={`${isMobile ? "text-lg" : "text-2xl"} font-bold truncate`}>
                    {t("productImport.storeLayoutEditor")}
                  </h1>
                </div>
              </div>

              {/* Toolbar Responsive */}
              <ResponsiveToolbar
                floorPlan={floorPlan}
                onShowFloorPlanSelector={() => setShowFloorPlanSelector(true)}
                onAutoPlacement={handleAutoPlacement}
                onExportImage={exportAsImage}
                onExportPDF={exportAsPDF}
                onSave={saveStoreLayout}
                isExporting={isExporting}
              />
            </div>

            {/* Alerts - Responsive */}
            {!floorPlan && (
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className={isMobile ? "text-sm" : ""}>{t("productImport.floorPlan.required")}</AlertTitle>
                <AlertDescription className={isMobile ? "text-sm" : ""}>
                  {t("productImport.floorPlan.loadPrompt")}
                </AlertDescription>
              </Alert>
            )}

            {floorPlan && (
              <Alert variant="info" className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle className={isMobile ? "text-sm" : ""}>
                  {t("productImport.floorPlan.loadedLabel")} {floorPlan.name}
                </AlertTitle>
                <AlertDescription className={isMobile ? "text-sm" : ""}>
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

            {/* Floor plan opacity control - Responsive */}
            {showFloorPlan && floorPlan && (
              <div className={`flex ${isMobile ? "flex-col gap-2" : "items-center space-x-2"}`}>
                <Label htmlFor="floor-plan-opacity" className="text-sm whitespace-nowrap">
                  {t("productImport.floorPlan.opacity")}
                </Label>
                <div className={`flex items-center ${isMobile ? "w-full" : ""} space-x-2`}>
                  <Slider
                    id="floor-plan-opacity"
                    min={0.1}
                    max={1}
                    step={0.1}
                    value={[floorPlanOpacity]}
                    onValueChange={(value) => setFloorPlanOpacity(value[0])}
                    className={isMobile ? "flex-1" : "w-32"}
                  />
                  <span className="text-sm whitespace-nowrap">{Math.round(floorPlanOpacity * 100)}%</span>
                </div>
              </div>
            )}

            {/* Main content area - Responsive */}
            <div className={`flex ${isMobile ? "flex-col" : "gap-6"}`}>
              {/* Desktop Sidebar */}
              {!isMobile && isSidebarVisible && (
                <div
                  ref={sidebarRef}
                  className="relative"
                  style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
                >
                  <Card className="h-[calc(100vh-200px)]">
                    <CardContent className="p-0 h-full">
                      <SidebarContent />
                    </CardContent>
                  </Card>

                  {/* Resize handle */}
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

              {/* Mobile Sidebar */}
              {isMobile && (
                <MobileSidebar
                  isOpen={showMobileSidebar}
                  onClose={() => setShowMobileSidebar(false)}
                  title={t("productImport.storeLayoutEditor")}
                >
                  <SidebarContent />
                </MobileSidebar>
              )}

              {/* Main display area */}
              <div className="flex-1">
                <Card>
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className={`${isMobile ? "text-base" : "text-lg"} font-medium`}>
                        {t("productImport.floorPlan.monMagasin")}
                      </h2>
                      <div className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
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

                      <div
                        className={`absolute ${isMobile ? "top-2 right-2" : "top-4 right-4"} bg-white/80 rounded-md px-2 py-1 text-xs sm:text-sm flex items-center`}
                      >
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

        {/* Dialogs */}
        <FloorPlanSelector
          open={showFloorPlanSelector}
          onOpenChange={setShowFloorPlanSelector}
          onSelectPlan={handleSelectFloorPlan}
          floorPlans={floorPlans}
        />

        <Dialog open={showNameMatchDialog} onOpenChange={setShowNameMatchDialog}>
          <DialogContent
            className={`${isMobile ? "w-[95vw] max-w-[95vw] h-[90vh] max-h-[90vh]" : "sm:max-w-[500px]"} overflow-y-auto`}
            dir={textDirection}
          >
            <DialogHeader>
              <DialogTitle className={isMobile ? "text-lg" : ""}>
                {t("productImport.floorPlan.correspendance")}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p className={`${isMobile ? "text-sm" : ""} text-muted-foreground`}>
                {t("productImport.floorPlan.multipleMatches")}
              </p>
              <div className="grid gap-2">
                {matchingElements.map((element) => (
                  <div
                    key={element.id}
                    className={`flex ${isMobile ? "flex-col" : "items-center justify-between"} p-3 border rounded-md cursor-pointer hover:bg-muted`}
                    onClick={() => handleElementSelection(element)}
                  >
                    <div className={isMobile ? "mb-2" : ""}>
                      <div className="font-medium">{element.name || element.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {t("position")}: {element.x.toFixed(0)}, {element.y.toFixed(0)}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className={isMobile ? "w-full" : ""}>
                      {t("selectionner")}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
  const xPos = element.x / 100 - roomWidth / 4
  const zPos = element.y / 100 - roomDepth / 4
  const width = element.width / 100
  const depth = element.height / 100

  const x = xPos + width / 2
  const z = zPos + depth / 2
  const rotation = element.rotation || 0

  return { x, y: 0, z, rotation }
}

export default StoreDisplayEditor
