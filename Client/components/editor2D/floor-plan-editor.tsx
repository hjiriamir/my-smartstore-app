"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { RotateCw } from "lucide-react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import {
  ArrowLeft,
  Columns,
  DoorOpen,
  Download,
  Grid3X3,
  LayoutGrid,
  Layers,
  Maximize,
  Move,
  PanelLeft,
  Save,
  Shirt,
  ShoppingBag,
  Square,
  SquareStack,
  Trash2,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Types pour les éléments du plan
type ElementType =
  | "wall"
  | "door"
  | "window"
  | "shelf"
  | "rack"
  | "display"
  | "table"
  | "fridge"
  | "planogram"
  | "gondola"
  | "line"
  | "rectangle"
  | "circle"
  | "chair"
  | "sofa"
  | "bed"
  | "plant"
  | "counter"
  | "cashier"
  | "mannequin"
  | "cube"
  | "dairy_fridge"
type Element = {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  depth: number
  rotation: number
  name?: string // Ajout du champ nom
  valid?: boolean // Optionnel pour la compatibilité avec les éléments existants
  // Add window-specific properties
  windowTopDistance?: number
  windowBottomDistance?: number
  parentWallId?: string // To track which wall the window belongs to
}

// Type for floor plan
export interface FloorPlan {
  id: string
  name: string
  elements: Element[]
  createdAt: string
  updatedAt: string
}

// Local storage keys
const FLOOR_PLANS_STORAGE_KEY = "store-floor-plans"
const ACTIVE_FLOOR_PLAN_KEY = "active-floor-plan"

// Save a floor plan to local storage
export const saveFloorPlan = (plan: FloorPlan): void => {
  try {
    // Get existing plans
    const existingPlansJSON = localStorage.getItem(FLOOR_PLANS_STORAGE_KEY)
    const existingPlans: FloorPlan[] = existingPlansJSON ? JSON.parse(existingPlansJSON) : []

    // Check if plan already exists
    const planIndex = existingPlans.findIndex((p) => p.id === plan.id)

    if (planIndex >= 0) {
      // Update existing plan
      existingPlans[planIndex] = {
        ...plan,
        updatedAt: new Date().toISOString(),
      }
    } else {
      // Add new plan
      existingPlans.push({
        ...plan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    // Save back to local storage
    localStorage.setItem(FLOOR_PLANS_STORAGE_KEY, JSON.stringify(existingPlans))

    // Set as active plan
    localStorage.setItem(ACTIVE_FLOOR_PLAN_KEY, plan.id)
  } catch (error) {
    console.error("Error saving floor plan:", error)
    throw new Error("Failed to save floor plan")
  }
}

// Constante pour la conversion pixels -> unités réelles
const PIXELS_PER_METER = 100 // 100 pixels = 1 mètre
const PIXELS_PER_CM = 1 // 1 pixel = 1 cm

export function FloorPlanEditor() {
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState<"structures" | "shapes" | "furniture">("structures")
  const [elements, setElements] = useState<Element[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [currentTool, setCurrentTool] = useState<ElementType | null>(null)
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d")
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingElement, setIsDraggingElement] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [isRotating, setIsRotating] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [gridSize, setGridSize] = useState(20)
  const [highQualityRendering, setHighQualityRendering] = useState(true)
  const [ghostElement, setGhostElement] = useState<Element | null>(null)
  const [unitSystem, setUnitSystem] = useState<"m" | "cm">("cm")
  const [showDimensions, setShowDimensions] = useState(true)
  const [planCenter, setPlanCenter] = useState({ x: 0, y: 0 })
  const [moveMode, setMoveMode] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)
  const threeContainerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const objectsRef = useRef<Map<string, THREE.Mesh | THREE.Group>>(new Map())

  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [planName, setPlanName] = useState("")

  // Get selected element data
  const selectedElementData = elements.find((el) => el.id === selectedElement) || null

  // Fonction pour convertir les pixels en unités réelles
  const pixelsToUnit = (pixels: number): number => {
    if (unitSystem === "m") {
      return pixels / PIXELS_PER_METER
    } else {
      return pixels / PIXELS_PER_CM
    }
  }

  // Fonction pour formater les dimensions
  const formatDimension = (pixels: number): string => {
    const value = pixelsToUnit(pixels)
    return `${value.toFixed(unitSystem === "m" ? 2 : 0)}${unitSystem}`
  }

  const canPlaceElement = (type: ElementType, x: number, y: number, width: number, height: number): boolean => {
    // Pour les portes, vérifier si elles sont à côté d'un mur
    if (type === "door") {
      return elements.some((el) => {
        if (el.type === "wall") {
          // Vérifier si la porte est adjacente à un mur
          const doorLeft = x
          const doorRight = x + width
          const doorTop = y
          const doorBottom = y + height

          const wallLeft = el.x
          const wallRight = el.x + el.width
          const wallTop = el.y
          const wallBottom = el.y + el.height

          // Vérifier si la porte touche le mur
          const touchesHorizontally = Math.abs(doorRight - wallLeft) < 5 || Math.abs(doorLeft - wallRight) < 5

          const touchesVertically = Math.abs(doorBottom - wallTop) < 5 || Math.abs(doorTop - wallBottom) < 5

          const overlapsHorizontally = doorLeft < wallRight && doorRight > wallLeft

          const overlapsVertically = doorTop < wallBottom && doorBottom > wallTop

          return (touchesHorizontally && overlapsVertically) || (touchesVertically && overlapsHorizontally)
        }
        return false
      })
    }

    // Pour les fenêtres, vérifier si elles sont sur un mur
    if (type === "window") {
      const wallMatch = elements.find((el) => {
        if (el.type === "wall") {
          // Vérifier si la fenêtre est sur un mur
          const windowLeft = x
          const windowRight = x + width
          const windowTop = y
          const windowBottom = y + height

          const wallLeft = el.x
          const wallRight = el.x + el.width
          const wallTop = el.y
          const wallBottom = el.y + el.height

          // Vérifier si la fenêtre est à l'intérieur du mur
          const isInside =
            windowLeft >= wallLeft && windowRight <= wallRight && windowTop >= wallTop && windowBottom <= windowBottom

          if (isInside) {
            // Store the parent wall ID for later use
            return true
          }
        }
        return false
      })

      return !!wallMatch
    }

    // Pour les autres types d'éléments, pas de restriction
    return true
  }

  // Fonction pour sélectionner un outil (type d'élément)
  const selectTool = (type: ElementType) => {
    setCurrentTool(type)
    setSelectedElement(null) // Désélectionner tout élément lors du choix d'un outil
    setGhostElement(null) // Reset ghost element when selecting a new tool
  }

  // Fonction pour calculer le centre du plan
  const calculatePlanCenter = () => {
    if (elements.length === 0) return { x: 0, y: 0 }

    let minX = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY

    elements.forEach((element) => {
      minX = Math.min(minX, element.x)
      maxX = Math.max(maxX, element.x + element.width)
      minY = Math.min(minY, element.y)
      maxY = Math.max(maxY, element.y + element.height)
    })

    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
    }
  }

  // Fonction pour centrer la vue sur le plan
  const centerView = () => {
    if (elements.length === 0) return

    const center = calculatePlanCenter()
    setPlanCenter(center)

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      setOffset({
        x: rect.width / 2 - center.x * zoom,
        y: rect.height / 2 - center.y * zoom,
      })
    }

    // Centrer la vue 3D
    if (viewMode === "3d" && cameraRef.current && controlsRef.current) {
      // Calculer la taille du plan pour déterminer la distance de la caméra
      let minX = Number.POSITIVE_INFINITY
      let maxX = Number.NEGATIVE_INFINITY
      let minY = Number.POSITIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY

      elements.forEach((element) => {
        minX = Math.min(minX, element.x)
        maxX = Math.max(maxX, element.x + element.width)
        minY = Math.min(minY, element.y)
        maxY = Math.max(maxY, element.y + element.height)
      })

      const width = maxX - minX
      const height = maxY - minY
      const size = Math.max(width, height)

      // Ajuster la position de la caméra en fonction de la taille du plan
      const distance = Math.max(size * 1.5, 300)

      // Positionner la caméra pour voir l'ensemble du plan
      cameraRef.current.position.set(center.x, distance / 2, center.y + distance)
      controlsRef.current.target.set(center.x, 0, center.y)
      controlsRef.current.update()
    }
  }

  // Fonction pour gérer le clic sur le canvas
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Si on est en mode déplacement, ne rien faire
    if (moveMode) return

    // Vérifier si on a cliqué directement sur le canvas (et non sur un élément)
    const isCanvasClick = e.target === canvasRef.current

    // Si on a cliqué sur le canvas (pas sur un élément) et qu'un élément est sélectionné, on le désélectionne
    if (isCanvasClick && selectedElement) {
      setSelectedElement(null)
      return
    }

    // Si on a un outil sélectionné, on place un nouvel élément
    if (currentTool && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      let x = (e.clientX - rect.left - offset.x) / zoom
      let y = (e.clientY - rect.top - offset.y) / zoom

      // Snap to grid si activé
      if (snapToGrid) {
        x = Math.round(x / gridSize) * gridSize
        y = Math.round(y / gridSize) * gridSize
      }

      // Dimensions par défaut selon le type d'élément
      let width = 100
      let height = 20
      let depth = 40

      if (currentTool === "wall") {
        width = 200
        height = 10
        depth = 100
      } else if (currentTool === "door") {
        width = 80
        height = 10
        depth = 10
      } else if (currentTool === "window") {
        width = 100
        height = 10
        depth = 10
      } else if (currentTool === "shelf" || currentTool === "display") {
        width = 120
        height = 40
        depth = 60
      } else if (currentTool === "rack") {
        width = 80
        height = 80
        depth = 40
      } else if (currentTool === "table") {
        width = 100
        height = 100
        depth = 30
      } else if (currentTool === "fridge") {
        width = 80
        height = 60
        depth = 80
      } else if (currentTool === "dairy_fridge") {
        width = 150
        height = 60
        depth = 100
      } else if (currentTool === "planogram") {
        width = 150
        height = 40
        depth = 80
      } else if (currentTool === "gondola") {
        width = 200
        height = 60
        depth = 100
      } else if (currentTool === "line") {
        width = 100
        height = 2
        depth = 2
      } else if (currentTool === "rectangle") {
        width = 80
        height = 60
        depth = 2
      } else if (currentTool === "circle") {
        width = 60
        height = 60
        depth = 2
      } else if (currentTool === "chair") {
        width = 40
        height = 40
        depth = 40
      } else if (currentTool === "sofa") {
        width = 120
        height = 60
        depth = 40
      } else if (currentTool === "bed") {
        width = 140
        height = 200
        depth = 40
      } else if (currentTool === "plant") {
        width = 40
        height = 40
        depth = 80
      } else if (currentTool === "counter") {
        width = 150
        height = 60
        depth = 40
      } else if (currentTool === "cashier") {
        width = 100
        height = 80
        depth = 60
      } else if (currentTool === "mannequin") {
        width = 40
        height = 40
        depth = 180
      } else if (currentTool === "cube") {
        width = 120
        height = 120
        depth = 120
      }

      if (currentTool === "door" || currentTool === "window") {
        if (!canPlaceElement(currentTool, x, y, width, height)) {
          // Afficher un message d'erreur ou une notification
          alert(
            currentTool === "door"
              ? "Les portes doivent être placées à côté d'un mur"
              : "Les fenêtres doivent être placées sur un mur",
          )
          return
        }
      }

      // Générer un nom par défaut basé sur le type et un compteur
      const elementsOfType = elements.filter((el) => el.type === currentTool).length + 1
      const defaultName = `${getElementLabel(currentTool)} ${elementsOfType}`

      const newElement: Element = {
        id: `element-${Date.now()}`,
        type: currentTool,
        x,
        y,
        width,
        height,
        depth,
        rotation: 0,
        name: defaultName, // Ajouter un nom par défaut
      }

      if (currentTool === "window") {
        // Find the wall this window is being placed on
        const parentWall = elements.find((el) => {
          if (el.type === "wall") {
            const windowLeft = x
            const windowRight = x + width
            const windowTop = y
            const windowBottom = y + height

            const wallLeft = el.x
            const wallRight = el.x + el.width
            const wallTop = el.y
            const wallBottom = el.y + el.height

            return (
              windowLeft >= wallLeft && windowRight <= wallRight && windowTop >= wallTop && windowBottom <= windowBottom
            )
          }
          return false
        })

        if (parentWall) {
          // Default distances - 20% from top and bottom
          const defaultDistance = Math.min(parentWall.depth * 0.2, 20)

          // Add window-specific properties
          newElement.parentWallId = parentWall.id
          newElement.windowTopDistance = defaultDistance
          newElement.windowBottomDistance = defaultDistance
        }
      }

      setElements((prevElements) => [...prevElements, newElement])
      setSelectedElement(newElement.id)
      setCurrentTool(null) // Désélectionner l'outil après placement
      setGhostElement(null)

      // Ajouter l'élément à la scène 3D si elle existe
      if (sceneRef.current) {
        add3DObject(newElement)
      }

      // Recalculer le centre du plan
      const newCenter = calculatePlanCenter()
      setPlanCenter(newCenter)
    }
  }

  // Fonction pour gérer le début du déplacement d'un élément
  const handleElementDragStart = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    setSelectedElement(elementId)
    setIsDraggingElement(true)

    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setDragStart({
        x: (e.clientX - rect.left - offset.x) / zoom,
        y: (e.clientY - rect.top - offset.y) / zoom,
      })
    }
  }

  // Fonction pour gérer le déplacement du canvas
  const handleCanvasDragStart = (e: React.MouseEvent) => {
    if (currentTool || isResizing || isRotating) return

    // Si on est en mode déplacement ou si on clique directement sur le canvas
    if (moveMode || e.target === canvasRef.current) {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  // Fonction pour gérer le mouvement de la souris
  const handleMouseMove = (e: React.MouseEvent) => {
    // Afficher l'aperçu de l'élément à placer
    if (currentTool && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      let x = (e.clientX - rect.left - offset.x) / zoom
      let y = (e.clientY - rect.top - offset.y) / zoom

      // Snap to grid si activé
      if (snapToGrid) {
        x = Math.round(x / gridSize) * gridSize
        y = Math.round(y / gridSize) * gridSize
      }

      // Dimensions par défaut selon le type d'élément
      let width = 100
      let height = 20
      let depth = 40

      if (currentTool === "wall") {
        width = 200
        height = 10
        depth = 100
      } else if (currentTool === "door") {
        width = 80
        height = 10
        depth = 10
      } else if (currentTool === "window") {
        width = 100
        height = 10
        depth = 10
      } else if (currentTool === "shelf" || currentTool === "display") {
        width = 120
        height = 40
        depth = 60
      } else if (currentTool === "rack") {
        width = 80
        height = 80
        depth = 40
      } else if (currentTool === "table") {
        width = 100
        height = 100
        depth = 30
      } else if (currentTool === "fridge") {
        width = 80
        height = 60
        depth = 80
      } else if (currentTool === "dairy_fridge") {
        width = 150
        height = 60
        depth = 100
      } else if (currentTool === "cube") {
        width = 120
        height = 120
        depth = 120
      }

      // Vérifier si l'élément peut être placé à cet endroit
      const canPlace =
        currentTool === "door" || currentTool === "window" ? canPlaceElement(currentTool, x, y, width, height) : true

      setGhostElement({
        id: "ghost",
        type: currentTool,
        x,
        y,
        width,
        height,
        depth,
        rotation: 0,
        valid: canPlace, // Ajouter cette propriété pour indiquer si le placement est valide
      })
    }

    // Déplacer le canvas
    if (isDragging) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y

      setOffset({
        x: offset.x + dx,
        y: offset.y + dy,
      })
      setDragStart({ x: e.clientX, y: e.clientY })
    }

    // Déplacer un élément
    else if (isDraggingElement && selectedElement) {
      const element = elements.find((el) => el.id === selectedElement)
      if (element && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - offset.x) / zoom
        const y = (e.clientY - rect.top - offset.y) / zoom

        const dx = x - dragStart.x
        const dy = y - dragStart.y

        let newX = element.x + dx
        let newY = element.y + dy

        // Snap to grid si activé
        if (snapToGrid) {
          newX = Math.round(newX / gridSize) * gridSize
          newY = Math.round(newY / gridSize) * gridSize
        }

        setElements((prevElements) =>
          prevElements.map((el) => (el.id === selectedElement ? { ...el, x: newX, y: newY } : el)),
        )

        // Mettre à jour la position 3D
        if (sceneRef.current) {
          update3DObjectPosition(selectedElement)
        }

        setDragStart({ x, y })

        // Recalculer le centre du plan
        const newCenter = calculatePlanCenter()
        setPlanCenter(newCenter)
      }
    }

    // Redimensionner un élément
    else if (isResizing && selectedElement && resizeDirection) {
      const element = elements.find((el) => el.id === selectedElement)
      if (element && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - offset.x) / zoom
        const y = (e.clientY - rect.top - offset.y) / zoom

        const dx = x - dragStart.x
        const dy = y - dragStart.y

        let newWidth = element.width
        let newHeight = element.height
        let newX = element.x
        let newY = element.y

        if (resizeDirection.includes("right")) {
          newWidth = element.width + dx
          if (snapToGrid) {
            newWidth = Math.round(newWidth / gridSize) * gridSize
          }
        } else if (resizeDirection.includes("left")) {
          newWidth = element.width - dx
          if (newWidth > 10) {
            newX = element.x + dx
            if (snapToGrid) {
              newX = Math.round(newX / gridSize) * gridSize
              newWidth = element.width + element.x - newX
            }
          }
        }

        if (resizeDirection.includes("bottom")) {
          newHeight = element.height + dy
          if (snapToGrid) {
            newHeight = Math.round(newHeight / gridSize) * gridSize
          }
        } else if (resizeDirection.includes("top")) {
          newHeight = element.height - dy
          if (newHeight > 10) {
            newY = element.y + dy
            if (snapToGrid) {
              newY = Math.round(newY / gridSize) * gridSize
              newHeight = element.height + element.y - newY
            }
          }
        }

        setElements((prevElements) =>
          prevElements.map((el) =>
            el.id === selectedElement
              ? {
                  ...el,
                  x: newX,
                  y: newY,
                  width: Math.max(10, newWidth),
                  height: Math.max(10, newHeight),
                }
              : el,
          ),
        )

        // Mettre à jour la taille 3D
        if (sceneRef.current) {
          update3DObjectSize(selectedElement)
        }

        setDragStart({ x, y })

        // Recalculer le centre du plan
        const newCenter = calculatePlanCenter()
        setPlanCenter(newCenter)
      }
    }

    // Faire pivoter un élément
    else if (isRotating && selectedElement) {
      const element = elements.find((el) => el.id === selectedElement)
      if (element && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const centerX = (element.x + element.width / 2) * zoom + offset.x
        const centerY = (element.y + element.height / 2) * zoom + offset.y

        // Calculer l'angle entre le centre de l'élément et la position de la souris
        const angle = Math.atan2(e.clientY - rect.top - centerY, e.clientX - rect.left - centerX) * (180 / Math.PI)

        // Snap à des angles de 15 degrés si snapToGrid est activé
        let newRotation = angle
        if (snapToGrid) {
          newRotation = Math.round(angle / 15) * 15
        }

        setElements((prevElements) =>
          prevElements.map((el) => (el.id === selectedElement ? { ...el, rotation: newRotation } : el)),
        )

        // Mettre à jour la rotation 3D
        if (sceneRef.current) {
          update3DObjectRotation(selectedElement)
        }
      }
    }
  }

  // Fonction pour gérer la fin du déplacement
  const handleMouseUp = () => {
    setIsDragging(false)
    setIsDraggingElement(false)
    setIsResizing(false)
    setIsRotating(false)
    setResizeDirection(null)
  }

  // Fonction pour commencer le redimensionnement
  const startResize = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)

    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setDragStart({
        x: (e.clientX - rect.left - offset.x) / zoom,
        y: (e.clientY - rect.top - offset.y) / zoom,
      })
    }
  }

  // Fonction pour commencer la rotation
  const startRotate = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRotating(true)
  }

  // Fonction pour zoomer
  const handleZoom = (direction: "in" | "out") => {
    if (direction === "in") {
      setZoom(Math.min(zoom + 0.1, 3))
    } else {
      setZoom(Math.max(zoom - 0.1, 0.5))
    }
  }

  // Fonction pour modifier la profondeur d'un élément
  const updateElementDepth = (depth: number) => {
    if (selectedElement) {
      setElements((prevElements) => prevElements.map((el) => (el.id === selectedElement ? { ...el, depth } : el)))

      // Mettre à jour la taille 3D
      if (sceneRef.current) {
        update3DObjectSize(selectedElement)
      }
    }
  }

  // Effet pour gérer les événements de souris globaux
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.x
        const dy = e.clientY - dragStart.y

        setOffset({
          x: offset.x + dx,
          y: offset.y + dy,
        })
        setDragStart({ x: e.clientX, y: e.clientY })
      }
    }

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
      setIsDraggingElement(false)
      setIsResizing(false)
      setIsRotating(false)
      setResizeDirection(null)
    }

    window.addEventListener("mousemove", handleGlobalMouseMove)
    window.addEventListener("mouseup", handleGlobalMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove)
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isDragging, dragStart, offset])

  // Effet pour initialiser la scène 3D
  useEffect(() => {
    if (viewMode === "3d" && threeContainerRef.current) {
      // Initialiser la scène Three.js
      const container = threeContainerRef.current
      const width = container.clientWidth
      const height = container.clientHeight

      // Créer la scène
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf0f0f0)
      sceneRef.current = scene

      // Créer la caméra
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000)

      // Positionner la caméra en fonction du centre du plan
      const center = calculatePlanCenter()
      camera.position.set(center.x, 200, center.y + 300)
      cameraRef.current = camera

      // Créer le renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(width, height)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      container.innerHTML = ""
      container.appendChild(renderer.domElement)
      rendererRef.current = renderer

      // Ajouter les contrôles
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.25
      controls.screenSpacePanning = false
      controls.maxPolarAngle = Math.PI / 2
      controls.target.set(center.x, 0, center.y) // Cibler le centre du plan
      controlsRef.current = controls

      controls.enableZoom = true
      controls.zoomSpeed = 1.0
      controls.minDistance = 50
      controls.maxDistance = 1000

      // Ajouter better lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      scene.add(ambientLight)

      // Main directional light (sun-like)
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(200, 400, 200)
      directionalLight.castShadow = true
      directionalLight.shadow.mapSize.width = 2048
      directionalLight.shadow.mapSize.height = 2048
      directionalLight.shadow.camera.near = 0.5
      directionalLight.shadow.camera.far = 1000
      directionalLight.shadow.camera.left = -500
      directionalLight.shadow.camera.right = 500
      directionalLight.shadow.camera.top = 500
      directionalLight.shadow.camera.bottom = -500
      scene.add(directionalLight)

      // Add a fill light from the opposite side
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
      fillLight.position.set(-200, 200, -200)
      scene.add(fillLight)

      // Add a subtle blue-ish rim light
      const rimLight = new THREE.DirectionalLight(0xadd8e6, 0.2)
      rimLight.position.set(0, 100, -300)
      scene.add(rimLight)

      // Calculer les dimensions nécessaires pour le sol
      let minX = Number.POSITIVE_INFINITY
      let maxX = Number.NEGATIVE_INFINITY
      let minZ = Number.POSITIVE_INFINITY
      let maxZ = Number.NEGATIVE_INFINITY

      elements.forEach((element) => {
        minX = Math.min(minX, element.x)
        maxX = Math.max(maxX, element.x + element.width)
        minZ = Math.min(minZ, element.y)
        maxZ = Math.max(maxZ, element.y + element.height)
      })

      // Ajouter une marge importante pour s'assurer que le sol couvre toute la zone
      const margin = 1000
      minX -= margin
      maxX += margin
      minZ -= margin
      maxZ += margin

      const groundWidth = Math.max(2000, maxX - minX)
      const groundDepth = Math.max(2000, maxZ - minZ)

      // Ajouter un sol beaucoup plus grand
      const groundGeometry = new THREE.PlaneGeometry(groundWidth, groundDepth)
      const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.8,
        metalness: 0.2,
      })
      const ground = new THREE.Mesh(groundGeometry, groundMaterial)
      ground.rotation.x = -Math.PI / 2
      ground.position.y = 0 // S'assurer que le sol est à y=0
      ground.position.x = center.x // Centrer le sol sur le plan
      ground.position.z = center.y // Centrer le sol sur le plan
      ground.receiveShadow = true
      scene.add(ground)

      // Ajouter une grille qui couvre toute la zone
      const gridHelper = new THREE.GridHelper(Math.max(groundWidth, groundDepth), 100)
      gridHelper.position.y = 0.1 // Légèrement au-dessus du sol pour éviter le z-fighting
      gridHelper.position.x = center.x // Centrer la grille sur le plan
      gridHelper.position.z = center.y // Centrer la grille sur le plan
      scene.add(gridHelper)

      // Ajouter les objets existants
      elements.forEach((element) => {
        add3DObject(element)
      })

      // Fonction d'animation
      const animate = () => {
        requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
      }
      animate()

      // Gérer le redimensionnement de la fenêtre
      const handleResize = () => {
        if (container && cameraRef.current && rendererRef.current) {
          const width = container.clientWidth
          const height = container.clientHeight
          cameraRef.current.aspect = width / height
          cameraRef.current.updateProjectionMatrix()
          rendererRef.current.setSize(width, height)
        }
      }
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        if (rendererRef.current) {
          container.removeChild(rendererRef.current.domElement)
        }
        // Nettoyer les objets 3D
        objectsRef.current.clear()
      }
    }
  }, [viewMode, elements])

  // Fonction pour ajouter un objet 3D à la scène
  const add3DObject = (element: Element) => {
    if (!sceneRef.current) return

    // Créer la géométrie en fonction du type d'élément
    let geometry: THREE.BufferGeometry
    let material: THREE.Material
    let color = 0xcccccc
    let object: THREE.Mesh | THREE.Group

    switch (element.type) {
      case "wall":
        geometry = new THREE.BoxGeometry(element.width, element.depth, element.height)
        color = 0xcccccc // Light gray for walls
        material = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.7,
          metalness: 0.3,
        })
        object = new THREE.Mesh(geometry, material)
        // Positionner le mur sur le sol (y = 0) et ajuster la hauteur
        object.position.set(element.x + element.width / 2, element.depth / 2, element.y + element.height / 2)
        break

      case "door":
        // Créer une porte plus réaliste
        const doorGroup = new THREE.Group()

        // Cadre de porte
        const frameGeometry = new THREE.BoxGeometry(element.width + 10, element.depth, element.height + 10)
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.7 })
        const frame = new THREE.Mesh(frameGeometry, frameMaterial)
        doorGroup.add(frame)

        // Porte elle-même (légèrement ouverte pour mieux visualiser)
        const doorGeometry = new THREE.BoxGeometry(element.width - 10, element.depth / 2, element.height - 10)
        const doorMaterial = new THREE.MeshStandardMaterial({
          color: 0x8d6e63,
          roughness: 0.5,
          metalness: 0.1,
        })
        const doorPanel = new THREE.Mesh(doorGeometry, doorMaterial)
        doorPanel.position.set(5, element.depth / 4, 5)
        // Pivoter légèrement la porte pour montrer qu'elle est ouverte
        doorPanel.rotation.y = Math.PI / 6
        doorGroup.add(doorPanel)

        // Poignée
        const doorHandleGeometry = new THREE.SphereGeometry(3, 16, 16)
        const handleMaterialDoor = new THREE.MeshStandardMaterial({
          color: 0xc0c0c0,
          roughness: 0.3,
          metalness: 0.8,
        })
        const handleDoor = new THREE.Mesh(doorHandleGeometry, handleMaterialDoor)
        handleDoor.position.set(element.width / 2 - 15, element.depth / 2, element.height / 2)
        doorGroup.add(handleDoor)

        doorGroup.position.set(element.x + element.width / 2, element.depth / 2, element.y + element.height / 2)
        object = doorGroup
        break

      case "window":
        // Create a window with blue glass as shown in the reference image
        const windowGroup = new THREE.Group()

        // Get parent wall if available
        const parentWall = element.parentWallId ? elements.find((el) => el.id === element.parentWallId) : null

        // Calculate window height based on wall height and distances
        let windowHeight = element.depth
        let windowVerticalPosition = element.depth / 2

        if (parentWall && element.windowTopDistance !== undefined && element.windowBottomDistance !== undefined) {
          windowHeight = parentWall.depth - element.windowTopDistance - element.windowBottomDistance
          windowVerticalPosition = element.windowBottomDistance + windowHeight / 2
        }

        // Window frame (outer frame)
        const windowFrameThickness = 4
        const windowFrameGeometry = new THREE.BoxGeometry(element.width, windowHeight, element.height)
        const windowFrameMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff, // White frame
          roughness: 0.7,
          metalness: 0.3,
        })
        const windowFrame = new THREE.Mesh(windowFrameGeometry, windowFrameMaterial)
        windowFrame.position.set(0, windowVerticalPosition, 0)
        windowGroup.add(windowFrame)

        // Window glass (blue transparent)
        const glassGeometry = new THREE.BoxGeometry(
          element.width - windowFrameThickness,
          windowHeight - windowFrameThickness,
          element.height - windowFrameThickness / 2,
        )
        const glassMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x7fdbff, // Light blue glass
          roughness: 0.1,
          metalness: 0.2,
          transparent: true,
          opacity: 0.6,
          transmission: 0.8,
        })
        const glass = new THREE.Mesh(glassGeometry, glassMaterial)
        glass.position.set(0, windowVerticalPosition, 0)
        windowGroup.add(glass)

        windowGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
        object = windowGroup
        break

      case "shelf":
        // Create a more realistic shelf
        const shelfGroup = new THREE.Group()

        // Top shelf
        const topShelfGeometry = new THREE.BoxGeometry(element.width, 5, element.height)
        const shelfMaterialForShelf = new THREE.MeshStandardMaterial({
          color: 0xa1887f,
          roughness: 0.7,
          metalness: 0.1,
        })
        const topShelf = new THREE.Mesh(topShelfGeometry, shelfMaterialForShelf)
        topShelf.position.set(0, element.depth, 0)
        shelfGroup.add(topShelf)

        // Intermediate shelves
        const numShelvesVal = 3
        for (let i = 1; i < numShelvesVal; i++) {
          const shelfGeometry = new THREE.BoxGeometry(element.width, 3, element.height)
          const shelf = new THREE.Mesh(shelfGeometry, shelfMaterialForShelf)
          shelf.position.set(0, (element.depth * i) / numShelvesVal, 0)
          shelfGroup.add(shelf)
        }

        // Vertical supports
        const pillarGeometry = new THREE.BoxGeometry(3, element.depth, 3)
        const pillarMaterial = new THREE.MeshStandardMaterial({
          color: 0x8d6e63,
          roughness: 0.7,
        })

        // Four pillars at the corners
        const pillar1 = new THREE.Mesh(pillarGeometry, pillarMaterial)
        pillar1.position.set(-element.width / 2 + 1.5, element.depth / 2, -element.height / 2 + 1.5)
        shelfGroup.add(pillar1)

        const pillar2 = new THREE.Mesh(pillarGeometry, pillarMaterial)
        pillar2.position.set(element.width / 2 - 1.5, element.depth / 2, -element.height / 2 + 1.5)
        shelfGroup.add(pillar2)

        const pillar3 = new THREE.Mesh(pillarGeometry, pillarMaterial)
        pillar3.position.set(-element.width / 2 + 1.5, element.depth / 2, element.height / 2 - 1.5)
        shelfGroup.add(pillar3)

        const pillar4 = new THREE.Mesh(pillarGeometry, pillarMaterial)
        pillar4.position.set(element.width / 2 - 1.5, element.depth / 2, element.height / 2 - 1.5)
        shelfGroup.add(pillar4)

        shelfGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
        object = shelfGroup
        break

      case "table":
        // Create a more realistic table
        const tableGroup = new THREE.Group()

        // Table top
        const tableTopGeometry = new THREE.BoxGeometry(element.width, 5, element.height)
        const tableTopMaterial = new THREE.MeshStandardMaterial({
          color: 0xc19a6b,
          roughness: 0.5,
          metalness: 0.1,
        })
        const tableTop = new THREE.Mesh(tableTopGeometry, tableTopMaterial)
        tableTop.position.set(0, element.depth - 2.5, 0)
        tableGroup.add(tableTop)

        // Table legs
        const tableLegGeometry = new THREE.CylinderGeometry(3, 3, element.depth - 5, 8)
        const legMaterial = new THREE.MeshStandardMaterial({
          color: 0x8d6e63,
          roughness: 0.7,
        })

        // Four legs at the corners
        const leg1 = new THREE.Mesh(tableLegGeometry, legMaterial)
        leg1.position.set(-element.width / 2 + 10, (element.depth - 5) / 2, -element.height / 2 + 10)
        tableGroup.add(leg1)

        const leg2 = new THREE.Mesh(tableLegGeometry, legMaterial)
        leg2.position.set(element.width / 2 - 10, (element.depth - 5) / 2, -element.height / 2 + 10)
        tableGroup.add(leg2)

        const leg3 = new THREE.Mesh(tableLegGeometry, legMaterial)
        leg3.position.set(-element.width / 2 + 10, (element.depth - 5) / 2, element.height / 2 - 10)
        tableGroup.add(leg3)

        const leg4 = new THREE.Mesh(tableLegGeometry, legMaterial)
        leg4.position.set(element.width / 2 - 10, (element.depth - 5) / 2, element.height / 2 - 10)
        tableGroup.add(leg4)

        tableGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
        object = tableGroup
        break

      case "chair":
        // Create a more realistic chair
        const chairGroup = new THREE.Group()

        // Chair seat
        const seatGeometry = new THREE.BoxGeometry(element.width, 5, element.height)
        const chairMaterial = new THREE.MeshStandardMaterial({
          color: 0x795548,
          roughness: 0.6,
          metalness: 0.1,
        })
        const seat = new THREE.Mesh(seatGeometry, chairMaterial)
        seat.position.set(0, element.depth / 2, 0)
        chairGroup.add(seat)

        // Chair backrest
        const backrestGeometry = new THREE.BoxGeometry(element.width, element.depth / 2, 5)
        const backrest = new THREE.Mesh(backrestGeometry, chairMaterial)
        backrest.position.set(0, element.depth * 0.75, -element.height / 2 + 2.5)
        backrest.rotation.x = Math.PI / 12 // Slight tilt
        chairGroup.add(backrest)

        // Chair legs
        const chairLegGeometry = new THREE.CylinderGeometry(1.5, 1.5, element.depth / 2, 8)
        const chairLegMaterial = new THREE.MeshStandardMaterial({
          color: 0x5d4037,
          roughness: 0.7,
        })

        // Four legs
        const chairLeg1 = new THREE.Mesh(chairLegGeometry, chairLegMaterial)
        chairLeg1.position.set(-element.width / 2 + 5, element.depth / 4, -element.height / 2 + 5)
        chairGroup.add(chairLeg1)

        const chairLeg2 = new THREE.Mesh(chairLegGeometry, chairLegMaterial)
        chairLeg2.position.set(element.width / 2 - 5, element.depth / 4, -element.height / 2 + 5)
        chairGroup.add(chairLeg2)

        const chairLeg3 = new THREE.Mesh(chairLegGeometry, chairLegMaterial)
        chairLeg3.position.set(-element.width / 2 + 5, element.depth / 4, element.height / 2 - 5)
        chairGroup.add(chairLeg3)

        const chairLeg4 = new THREE.Mesh(chairLegGeometry, chairLegMaterial)
        chairLeg4.position.set(element.width / 2 - 5, element.depth / 4, element.height / 2 - 5)
        chairGroup.add(chairLeg4)

        chairGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
        object = chairGroup
        break

      case "sofa":
        // Create a more realistic sofa
        const sofaGroup = new THREE.Group()

        // Sofa base
        const sofaBaseGeometry = new THREE.BoxGeometry(element.width, element.depth / 3, element.height)
        const sofaMaterial = new THREE.MeshStandardMaterial({
          color: 0x3f51b5, // Blue color for the sofa
          roughness: 0.8,
          metalness: 0.1,
        })
        const sofaBase = new THREE.Mesh(sofaBaseGeometry, sofaMaterial)
        sofaBase.position.set(0, element.depth / 6, 0)
        sofaGroup.add(sofaBase)

        // Sofa backrest
        const sofaBackrestGeometry = new THREE.BoxGeometry(element.width, element.depth / 2, 10)
        const backrestSofa = new THREE.Mesh(sofaBackrestGeometry, sofaMaterial)
        backrestSofa.position.set(0, element.depth / 3 + element.depth / 4, -element.height / 2 + 5)
        sofaGroup.add(backrestSofa)

        // Sofa armrests
        const armrestGeometry = new THREE.BoxGeometry(10, element.depth / 2, element.height - 20)

        const leftArmrest = new THREE.Mesh(armrestGeometry, sofaMaterial)
        leftArmrest.position.set(-element.width / 2 + 5, element.depth / 3 + element.depth / 4, 10)
        sofaGroup.add(leftArmrest)

        const rightArmrest = new THREE.Mesh(armrestGeometry, sofaMaterial)
        rightArmrest.position.set(element.width / 2 - 5, element.depth / 3 + element.depth / 4, 10)
        sofaGroup.add(rightArmrest)

        // Sofa cushions
        const cushionGeometry = new THREE.BoxGeometry(element.width / 3 - 5, 10, element.height - 20)
        const cushionMaterial = new THREE.MeshStandardMaterial({
          color: 0x303f9f, // Slightly darker blue for cushions
          roughness: 0.9,
          metalness: 0.05,
        })

        // Three cushions
        const leftCushion = new THREE.Mesh(cushionGeometry, cushionMaterial)
        leftCushion.position.set(-element.width / 3, element.depth / 3 + 5, 0)
        sofaGroup.add(leftCushion)

        const middleCushion = new THREE.Mesh(cushionGeometry, cushionMaterial)
        middleCushion.position.set(0, element.depth / 3 + 5, 0)
        sofaGroup.add(middleCushion)

        const rightCushion = new THREE.Mesh(cushionGeometry, cushionMaterial)
        rightCushion.position.set(element.width / 3, element.depth / 3 + 5, 0)
        sofaGroup.add(rightCushion)

        // Sofa legs
        const sofaLegGeometry = new THREE.CylinderGeometry(2, 2, element.depth / 6, 8)
        const sofaLegMaterial = new THREE.MeshStandardMaterial({
          color: 0x5d4037, // Brown for wooden legs
          roughness: 0.7,
        })

        // Four legs
        const sofaLeg1 = new THREE.Mesh(sofaLegGeometry, sofaLegMaterial)
        sofaLeg1.position.set(-element.width / 2 + 10, element.depth / 12, -element.height / 2 + 10)
        sofaGroup.add(sofaLeg1)

        const sofaLeg2 = new THREE.Mesh(sofaLegGeometry, sofaLegMaterial)
        sofaLeg2.position.set(element.width / 2 - 10, element.depth / 12, -element.height / 2 + 10)
        sofaGroup.add(sofaLeg2)

        const sofaLeg3 = new THREE.Mesh(sofaLegGeometry, sofaLegMaterial)
        sofaLeg3.position.set(-element.width / 2 + 10, element.depth / 12, element.height / 2 - 10)
        sofaGroup.add(sofaLeg3)

        const sofaLeg4 = new THREE.Mesh(sofaLegGeometry, sofaLegMaterial)
        sofaLeg4.position.set(element.width / 2 - 10, element.depth / 12, element.height / 2 - 10)
        sofaGroup.add(sofaLeg4)

        sofaGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
        object = sofaGroup
        break

      case "bed":
        // Create a more realistic bed
        const bedGroup = new THREE.Group()

        // Bed base
        const bedBaseGeometry = new THREE.BoxGeometry(element.width, element.depth / 4, element.height)
        const bedBaseMaterial = new THREE.MeshStandardMaterial({
          color: 0x8d6e63, // Brown for wooden frame
          roughness: 0.7,
          metalness: 0.1,
        })
        const bedBase = new THREE.Mesh(bedBaseGeometry, bedBaseMaterial)
        bedBase.position.set(0, element.depth / 8, 0)
        bedGroup.add(bedBase)

        // Mattress
        const mattressGeometry = new THREE.BoxGeometry(element.width - 10, element.depth / 4, element.height - 10)
        const mattressMaterial = new THREE.MeshStandardMaterial({
          color: 0xeceff1, // Off-white for mattress
          roughness: 0.9,
          metalness: 0.0,
        })
        const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial)
        mattress.position.set(0, element.depth / 4 + element.depth / 8, 0)
        bedGroup.add(mattress)

        // Pillow
        const pillowGeometry = new THREE.BoxGeometry(element.width / 3, element.depth / 8, element.height / 4)
        const pillowMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff, // White for pillow
          roughness: 0.95,
          metalness: 0.0,
        })
        const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial)
        pillow.position.set(
          0,
          element.depth / 4 + element.depth / 8 + element.depth / 16,
          -element.height / 2 + element.height / 8,
        )
        bedGroup.add(pillow)

        // Blanket
        const blanketGeometry = new THREE.BoxGeometry(element.width - 20, 3, element.height / 2)
        const blanketMaterial = new THREE.MeshStandardMaterial({
          color: 0x1976d2, // Blue for blanket
          roughness: 0.9,
          metalness: 0.0,
        })
        const blanket = new THREE.Mesh(blanketGeometry, blanketMaterial)
        blanket.position.set(0, element.depth / 4 + element.depth / 8 + 1.5, element.height / 4)
        bedGroup.add(blanket)

        // Headboard
        const headboardGeometry = new THREE.BoxGeometry(element.width, element.depth / 2, 10)
        const headboard = new THREE.Mesh(headboardGeometry, bedBaseMaterial)
        headboard.position.set(0, element.depth / 4 + element.depth / 4, -element.height / 2 - 5)
        bedGroup.add(headboard)

        // Bed legs
        const bedLegGeometry = new THREE.CylinderGeometry(3, 3, element.depth / 4, 8)

        // Four legs
        const bedLeg1 = new THREE.Mesh(bedLegGeometry, bedBaseMaterial)
        bedLeg1.position.set(-element.width / 2 + 15, element.depth / 8, -element.height / 2 + 15)
        bedGroup.add(bedLeg1)

        const bedLeg2 = new THREE.Mesh(bedLegGeometry, bedBaseMaterial)
        bedLeg2.position.set(element.width / 2 - 15, element.depth / 8, -element.height / 2 + 15)
        bedGroup.add(bedLeg2)

        const bedLeg3 = new THREE.Mesh(bedLegGeometry, bedBaseMaterial)
        bedLeg3.position.set(-element.width / 2 + 15, element.depth / 8, element.height / 2 - 15)
        bedGroup.add(bedLeg3)

        const bedLeg4 = new THREE.Mesh(bedLegGeometry, bedBaseMaterial)
        bedLeg4.position.set(element.width / 2 - 15, element.depth / 8, element.height / 2 - 15)
        bedGroup.add(bedLeg4)

        bedGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
        object = bedGroup
        break

      case "fridge":
        // Create a refrigerated display case like the image
        const fridgeGroup = new THREE.Group()

        // Base unit (stainless steel box)
        const baseHeight = element.depth * 0.3
        const baseGeometry = new THREE.BoxGeometry(element.width, baseHeight, element.height)
        const baseMaterial = new THREE.MeshStandardMaterial({
          color: 0xcccccc, // Silver/stainless steel color
          roughness: 0.3,
          metalness: 0.8,
        })
        const base = new THREE.Mesh(baseGeometry, baseMaterial)
        base.position.set(0, baseHeight / 2, 0)
        fridgeGroup.add(base)

        // Control panel on right side
        const controlPanelGeometry = new THREE.BoxGeometry(element.width * 0.1, baseHeight * 0.6, element.height * 0.15)
        const controlPanelMaterial = new THREE.MeshStandardMaterial({
          color: 0x111111,
          roughness: 0.5,
          metalness: 0.7,
        })
        const controlPanel = new THREE.Mesh(controlPanelGeometry, controlPanelMaterial)
        controlPanel.position.set(element.width * 0.4, baseHeight * 0.7, element.height * 0.4)
        fridgeGroup.add(controlPanel)

        // Display case (glass part)
        const caseHeight = element.depth - baseHeight
        const displayCaseWidth = element.width
        const displayCaseHeight = element.height

        // Glass top and sides (transparent)
        const glassMaterialForFridge = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 0.1,
          metalness: 0.2,
          transparent: true,
          opacity: 0.3,
          transmission: 0.95,
        })

        // Top glass
        const topGlassGeometry = new THREE.BoxGeometry(displayCaseWidth, 2, displayCaseHeight)
        const topGlass = new THREE.Mesh(topGlassGeometry, glassMaterialForFridge)
        topGlass.position.set(0, element.depth - 1, 0)
        fridgeGroup.add(topGlass)

        // Front glass
        const frontGlassGeometry = new THREE.BoxGeometry(displayCaseWidth, caseHeight, 2)
        const frontGlass = new THREE.Mesh(frontGlassGeometry, glassMaterialForFridge)
        frontGlass.position.set(0, baseHeight + caseHeight / 2, displayCaseHeight / 2)
        fridgeGroup.add(frontGlass)

        // Side glass panels
        const sideGlassGeometry = new THREE.BoxGeometry(2, caseHeight, displayCaseHeight)

        // Left glass
        const leftGlass = new THREE.Mesh(sideGlassGeometry, glassMaterialForFridge)
        leftGlass.position.set(-displayCaseWidth / 2, baseHeight + caseHeight / 2, 0)
        fridgeGroup.add(leftGlass)

        // Right glass
        const rightGlass = new THREE.Mesh(sideGlassGeometry, glassMaterialForFridge)
        rightGlass.position.set(displayCaseWidth / 2, baseHeight + caseHeight / 2, 0)
        fridgeGroup.add(rightGlass)

        // Food trays
        const numTrays = 5
        const trayWidth = displayCaseWidth * 0.9
        const trayHeight = displayCaseHeight * 0.8
        const trayDepth = 10
        const traySpacing = trayWidth / numTrays

        const trayMaterial = new THREE.MeshStandardMaterial({
          color: 0xdddddd, // Light gray for trays
          roughness: 0.5,
          metalness: 0.8,
        })

        for (let i = 0; i < numTrays; i++) {
          const trayGeometry = new THREE.BoxGeometry(traySpacing * 0.9, trayDepth, (trayHeight / numTrays) * 0.9)
          const tray = new THREE.Mesh(trayGeometry, trayMaterial)
          tray.position.set(-trayWidth / 2 + traySpacing / 2 + i * traySpacing, baseHeight + trayDepth / 2, 0)
          fridgeGroup.add(tray)

          // Add some random food items in the trays
          if (Math.random() > 0.3) {
            const foodColors = [0xffeb3b, 0x4caf50, 0xff9800, 0xf44336, 0x2196f3]
            const foodColor = foodColors[Math.floor(Math.random() * foodColors.length)]
            const foodMaterial = new THREE.MeshStandardMaterial({
              color: foodColor,
              roughness: 0.7,
              metalness: 0.1,
            })

            const foodGeometry = new THREE.BoxGeometry(
              traySpacing * 0.7,
              Math.random() * 5 + 2,
              (trayHeight / numTrays) * 0.7,
            )
            const food = new THREE.Mesh(foodGeometry, foodMaterial)
            food.position.set(0, trayDepth / 2 + foodGeometry.parameters.height / 2, 0)
            tray.add(food)
          }
        }

        // Brand logo (KHORIS)
        const logoGeometry = new THREE.PlaneGeometry(displayCaseWidth * 0.15, displayCaseHeight * 0.05)
        const logoMaterial = new THREE.MeshBasicMaterial({
          color: 0x000000, // Black for logo
        })
        const logo = new THREE.Mesh(logoGeometry, logoMaterial)
        logo.position.set(displayCaseWidth * 0.3, baseHeight * 0.7, displayCaseHeight * 0.45)
        fridgeGroup.add(logo)

        // Interior lighting (subtle glow)
        const lightIntensity = 0.5
        const light1 = new THREE.PointLight(0xffffff, lightIntensity)
        light1.position.set(0, element.depth - 10, 0)
        fridgeGroup.add(light1)

        fridgeGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
        object = fridgeGroup
        break

      case "dairy_fridge":
        // Create a dairy products refrigerator like the image
        const dairyFridgeGroup = new THREE.Group()

        // Main cabinet (black box)
        const cabinetWidth = element.width
        const cabinetHeight = element.depth
        const cabinetDepth = element.height

        const cabinetGeometry = new THREE.BoxGeometry(cabinetWidth, cabinetHeight, cabinetDepth)
        const cabinetMaterial = new THREE.MeshStandardMaterial({
          color: 0x111111, // Black cabinet
          roughness: 0.7,
          metalness: 0.3,
        })
        const cabinet = new THREE.Mesh(cabinetGeometry, cabinetMaterial)
        cabinet.position.set(0, cabinetHeight / 2, 0)
        dairyFridgeGroup.add(cabinet)

        // Glass front panel
        const glassWidth = cabinetWidth * 0.95
        const glassHeight = cabinetHeight * 0.8
        const glassThickness = 2

        const glassMaterialDairy = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 0.1,
          metalness: 0.2,
          transparent: true,
          opacity: 0.4,
          transmission: 0.9,
        })

        const glassGeometryDairy = new THREE.BoxGeometry(glassWidth, glassHeight, glassThickness)
        const glassFront = new THREE.Mesh(glassGeometryDairy, glassMaterialDairy)
        glassFront.position.set(0, cabinetHeight * 0.55, cabinetDepth / 2 - 1)
        dairyFridgeGroup.add(glassFront)

        // Shelves (5 shelves)
        const numShelvesDairy = 5
        const shelfWidth = cabinetWidth * 0.9
        const shelfDepth = cabinetDepth * 0.8
        const shelfThicknessDairy = 3
        const shelfSpacingDairy = (cabinetHeight * 0.7) / numShelvesDairy

        const shelfMaterialDairy = new THREE.MeshStandardMaterial({
          color: 0xaaaaaa, // Light gray for shelves
          roughness: 0.5,
          metalness: 0.7,
        })

        for (let i = 0; i < numShelvesDairy; i++) {
          const shelfY = cabinetHeight * 0.2 + i * shelfSpacingDairy

          // Main shelf
          const shelfGeometry = new THREE.BoxGeometry(shelfWidth, shelfThicknessDairy, shelfDepth)
          const shelf = new THREE.Mesh(shelfGeometry, shelfMaterialDairy)
          shelf.position.set(0, shelfY, 0)
          dairyFridgeGroup.add(shelf)

          // Shelf front edge (price tag holder)
          const edgeGeometry = new THREE.BoxGeometry(shelfWidth, 5, 2)
          const edgeMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.5,
            metalness: 0.5,
          })
          const edge = new THREE.Mesh(edgeGeometry, edgeMaterial)
          edge.position.set(0, shelfY + 2.5, shelfDepth / 2)
          dairyFridgeGroup.add(edge)

          // Add some dairy products on each shelf
          if (Math.random() > 0.3) {
            const numProducts = Math.floor(Math.random() * 5) + 3
            const productWidth = shelfWidth / numProducts

            for (let j = 0; j < numProducts; j++) {
              // Random product type (milk carton, yogurt, etc.)
              const productType = Math.floor(Math.random() * 3)
              let productGeometry, productHeight

              if (productType === 0) {
                // Milk carton
                productGeometry = new THREE.BoxGeometry(productWidth * 0.7, 20, productWidth * 0.7)
                productHeight = 20
              } else if (productType === 1) {
                // Yogurt cup
                productGeometry = new THREE.CylinderGeometry(productWidth * 0.3, productWidth * 0.25, 10, 8)
                productHeight = 10
              } else {
                // Cheese block
                productGeometry = new THREE.BoxGeometry(productWidth * 0.6, 8, productWidth * 0.8)
                productHeight = 8
              }

              // Random dairy product colors
              const productColors = [0xffffff, 0xf0f0f0, 0xfffacd, 0xffffe0]
              const productColor = productColors[Math.floor(Math.random() * productColors.length)]

              const productMaterial = new THREE.MeshStandardMaterial({
                color: productColor,
                roughness: 0.7,
                metalness: 0.1,
              })

              const product = new THREE.Mesh(productGeometry, productMaterial)

              // Position along the shelf
              const x = -shelfWidth / 2 + productWidth / 2 + j * productWidth
              const y = shelfY + shelfThicknessDairy / 2 + productHeight / 2
              const z = Math.random() * (shelfDepth * 0.8) - shelfDepth * 0.4

              product.position.set(x, y, z)
              dairyFridgeGroup.add(product)
            }
          }
        }

        // Bottom section (black)
        const bottomSectionGeometry = new THREE.BoxGeometry(cabinetWidth, cabinetHeight * 0.15, cabinetDepth)
        const bottomSection = new THREE.Mesh(bottomSectionGeometry, cabinetMaterial)
        bottomSection.position.set(0, cabinetHeight * 0.075, 0)
        dairyFridgeGroup.add(bottomSection)

        // Top light strip
        const lightStripGeometry = new THREE.BoxGeometry(cabinetWidth * 0.9, 2, 5)
        const lightStripMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.3,
          metalness: 0.8,
          emissive: 0xffffff,
          emissiveIntensity: 0.5,
        })
        const lightStrip = new THREE.Mesh(lightStripGeometry, lightStripMaterial)
        lightStrip.position.set(0, cabinetHeight * 0.95, cabinetDepth / 2 - 5)
        dairyFridgeGroup.add(lightStrip)

        // Interior lighting
        const lightIntensityDairy = 0.5
        const light = new THREE.PointLight(0xffffff, lightIntensityDairy)
        light.position.set(0, cabinetHeight * 0.7, 0)
        dairyFridgeGroup.add(light)

        dairyFridgeGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
        object = dairyFridgeGroup
        break

      case "counter":
        // Create a more realistic counter
        const counterGroup = new THREE.Group()

        // Counter base
        const counterBaseGeometry = new THREE.BoxGeometry(element.width, element.depth - 5, element.height)
        const counterBaseMaterial = new THREE.MeshStandardMaterial({
          color: 0x5d4037, // Dark brown for cabinet
          roughness: 0.7,
          metalness: 0.1,
        })
        const counterBase = new THREE.Mesh(counterBaseGeometry, counterBaseMaterial)
        counterBase.position.set(0, (element.depth - 5) / 2, 0)
        counterGroup.add(counterBase)

        // Counter top
        const counterTopGeometry = new THREE.BoxGeometry(element.width + 10, 5, element.height + 10)
        const counterTopMaterial = new THREE.MeshStandardMaterial({
          color: 0xeceff1, // Light gray for countertop
          roughness: 0.4,
          metalness: 0.6,
        })
        const counterTop = new THREE.Mesh(counterTopGeometry, counterTopMaterial)
        counterTop.position.set(0, element.depth - 2.5, 0)
        counterGroup.add(counterTop)

        // Drawer handles
        const drawerHandleGeometry = new THREE.BoxGeometry(20, 2, 2)
        const drawerHandleMaterial = new THREE.MeshStandardMaterial({
          color: 0x9e9e9e, // Silver for handles
          roughness: 0.3,
          metalness: 0.9,
        })

        // Add multiple drawer handles
        for (let i = 0; i < 3; i++) {
          const drawerHandle = new THREE.Mesh(drawerHandleGeometry, drawerHandleMaterial)
          drawerHandle.position.set(((i - 1) * element.width) / 3, element.depth / 2, element.height / 2 + 0.1)
          counterGroup.add(drawerHandle)
        }

        counterGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
        object = counterGroup
        break

      case "cashier":
        // Create a more realistic cashier counter
        const cashierGroup = new THREE.Group()

        // Counter base
        const cashierBaseGeometry = new THREE.BoxGeometry(element.width, element.depth - 10, element.height)
        const cashierBaseMaterial = new THREE.MeshStandardMaterial({
          color: 0x5d4037, // Dark brown for cabinet
          roughness: 0.7,
          metalness: 0.1,
        })
        const cashierBase = new THREE.Mesh(cashierBaseGeometry, cashierBaseMaterial)
        cashierBase.position.set(0, (element.depth - 10) / 2, 0)
        cashierGroup.add(cashierBase)

        // Counter top
        const cashierTopGeometry = new THREE.BoxGeometry(element.width + 10, 5, element.height + 10)
        const cashierTopMaterial = new THREE.MeshStandardMaterial({
          color: 0xeceff1, // Light gray for countertop
          roughness: 0.4,
          metalness: 0.6,
        })
        const cashierTop = new THREE.Mesh(cashierTopGeometry, cashierTopMaterial)
        cashierTop.position.set(0, element.depth - 7.5, 0)
        cashierGroup.add(cashierTop)

        // Cash register
        const registerGeometry = new THREE.BoxGeometry(element.width / 3, 15, element.height / 3)
        const registerMaterial = new THREE.MeshStandardMaterial({
          color: 0x212121, // Dark gray for register
          roughness: 0.5,
          metalness: 0.7,
        })
        const register = new THREE.Mesh(registerGeometry, registerMaterial)
        register.position.set(-element.width / 4, element.depth - 7.5 + 7.5, 0)
        cashierGroup.add(register)

        // Register screen
        const screenGeometry = new THREE.BoxGeometry(element.width / 4, 10, 2)
        const screenMaterial = new THREE.MeshStandardMaterial({
          color: 0x2196f3, // Blue for screen
          roughness: 0.2,
          metalness: 0.8,
          emissive: 0x2196f3,
          emissiveIntensity: 0.5,
        })
        const screen = new THREE.Mesh(screenGeometry, screenMaterial)
        screen.position.set(-element.width / 4, element.depth - 7.5 + 15, -element.height / 6 - 1)
        screen.rotation.x = -Math.PI / 6
        cashierGroup.add(screen)

        // Card reader
        const cardReaderGeometry = new THREE.BoxGeometry(10, 5, 15)
        const cardReaderMaterial = new THREE.MeshStandardMaterial({
          color: 0x424242, // Dark gray for card reader
          roughness: 0.5,
          metalness: 0.7,
        })
        const cardReader = new THREE.Mesh(cardReaderGeometry, cardReaderMaterial)
        cardReader.position.set(element.width / 4, element.depth - 7.5 + 2.5, -element.height / 4)
        cashierGroup.add(cardReader)

        cashierGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
        object = cashierGroup
        break

      case "rack":
        // Create a more realistic clothes rack
        const rackGroup = new THREE.Group()

        // Horizontal bar
        const barGeometry = new THREE.CylinderGeometry(2, 2, element.width, 8)
        barGeometry.rotateZ(Math.PI / 2) // Rotate to make it horizontal
        const barMaterial = new THREE.MeshStandardMaterial({
          color: 0x9e9e9e, // Silver for metal bar
          roughness: 0.3,
          metalness: 0.9,
        })
        const bar = new THREE.Mesh(barGeometry, barMaterial)
        bar.position.set(0, element.depth - 10, 0)
        rackGroup.add(bar)

        // Vertical supports
        const supportGeometry = new THREE.CylinderGeometry(2, 2, element.depth - 10, 8)

        const leftSupport = new THREE.Mesh(supportGeometry, barMaterial)
        leftSupport.position.set(-element.width / 2 + 2, (element.depth - 10) / 2, 0)
        rackGroup.add(leftSupport)

        const rightSupport = new THREE.Mesh(supportGeometry, barMaterial)
        rightSupport.position.set(element.width / 2 - 2, (element.depth - 10) / 2, 0)
        rackGroup.add(rightSupport)

        // Base
        const rackBaseGeometry = new THREE.BoxGeometry(element.width, 5, element.height / 2)
        const rackBaseMaterial = new THREE.MeshStandardMaterial({
          color: 0x424242, // Dark gray for base
          roughness: 0.5,
          metalness: 0.7,
        })
        const rackBase = new THREE.Mesh(rackBaseGeometry, rackBaseMaterial)
        rackBase.position.set(0, 2.5, 0)
        rackGroup.add(rackBase)

        // Add some clothes hangers
        const hangerCount = Math.floor(element.width / 15)
        const hangerGeometry = new THREE.TorusGeometry(5, 0.5, 8, 16, Math.PI)
        const hangerMaterial = new THREE.MeshStandardMaterial({
          color: 0xbdbdbd, // Light gray for hangers
          roughness: 0.5,
          metalness: 0.7,
        })

        for (let i = 0; i < hangerCount; i++) {
          const hanger = new THREE.Mesh(hangerGeometry, hangerMaterial)
          hanger.rotation.x = Math.PI / 2
          hanger.position.set(
            -element.width / 2 + 10 + (i * (element.width - 20)) / (hangerCount - 1),
            element.depth - 15,
            0,
          )
          rackGroup.add(hanger)

          // Add a simple shirt shape to some hangers
          if (i % 2 === 0) {
            const shirtGeometry = new THREE.BoxGeometry(25, 20, 15)
            const shirtMaterial = new THREE.MeshStandardMaterial({
              color: Math.random() > 0.5 ? 0x2196f3 : 0xe91e63, // Random blue or pink
              roughness: 0.9,
              metalness: 0.1,
            })
            const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial)
            shirt.position.set(0, -7.5, 0)
            hanger.add(shirt)
          }
        }

        rackGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
        object = rackGroup
        break

      case "mannequin":
        // Create a more realistic mannequin
        const mannequinGroup = new THREE.Group()

        // Mannequin body parts
        const headGeometry = new THREE.SphereGeometry(7, 16, 16)
        const bodyGeometry = new THREE.CylinderGeometry(10, 8, 40, 16)
        const armGeometry = new THREE.CylinderGeometry(3, 3, 30, 16)
        const legGeometry = new THREE.CylinderGeometry(4, 3, 50, 16)

        const mannequinMaterial = new THREE.MeshStandardMaterial({
          color: 0xf5f5f5, // White for mannequin
          roughness: 0.5,
          metalness: 0.1,
        })

        // Head
        const head = new THREE.Mesh(headGeometry, mannequinMaterial)
        head.position.set(0, element.depth - 20, 0)
        mannequinGroup.add(head)

        // Body
        const body = new THREE.Mesh(bodyGeometry, mannequinMaterial)
        body.position.set(0, element.depth - 45, 0)
        mannequinGroup.add(body)

        // Arms
        const leftArm = new THREE.Mesh(armGeometry, mannequinMaterial)
        leftArm.position.set(-15, element.depth - 45, 0)
        leftArm.rotation.z = -Math.PI / 16
        mannequinGroup.add(leftArm)

        const rightArm = new THREE.Mesh(armGeometry, mannequinMaterial)
        rightArm.position.set(15, element.depth - 45, 0)
        rightArm.rotation.z = Math.PI / 16
        mannequinGroup.add(rightArm)

        // Legs
        const leftLeg = new THREE.Mesh(legGeometry, mannequinMaterial)
        leftLeg.position.set(-6, element.depth - 90, 0)
        mannequinGroup.add(leftLeg)

        const rightLeg = new THREE.Mesh(legGeometry, mannequinMaterial)
        rightLeg.position.set(6, element.depth - 90, 0)
        mannequinGroup.add(rightLeg)

        // Add some clothing (simple shirt)
        const shirtGeometry = new THREE.BoxGeometry(25, 20, 15)
        const shirtMaterial = new THREE.MeshStandardMaterial({
          color: 0x2196f3, // Blue shirt
          roughness: 0.9,
          metalness: 0.1,
        })
        const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial)
        shirt.position.set(0, element.depth - 45, 0)
        mannequinGroup.add(shirt)

        // Base
        const mannequinBaseGeometry = new THREE.CylinderGeometry(15, 15, 5, 16)
        const mannequinBaseMaterial = new THREE.MeshStandardMaterial({
          color: 0x424242, // Dark gray for base
          roughness: 0.5,
          metalness: 0.7,
        })
        const mannequinBase = new THREE.Mesh(mannequinBaseGeometry, mannequinBaseMaterial)
        mannequinBase.position.set(0, 2.5, 0)
        mannequinGroup.add(mannequinBase)

        mannequinGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
        object = mannequinGroup
        break

      case "plant":
        // Create a more realistic plant
        const plantGroup = new THREE.Group()

        // Pot
        const potGeometry = new THREE.CylinderGeometry(element.width / 2, element.width / 3, element.depth / 3, 16)
        const potMaterial = new THREE.MeshStandardMaterial({
          color: 0x795548, // Brown for pot
          roughness: 0.8,
          metalness: 0.1,
        })
        const pot = new THREE.Mesh(potGeometry, potMaterial)
        pot.position.set(0, element.depth / 6, 0)
        plantGroup.add(pot)

        // Soil
        const soilGeometry = new THREE.CylinderGeometry(element.width / 2 - 2, element.width / 2 - 2, 3, 16)
        const soilMaterial = new THREE.MeshStandardMaterial({
          color: 0x3e2723, // Dark brown for soil
          roughness: 1.0,
          metalness: 0.0,
        })
        const soil = new THREE.Mesh(soilGeometry, soilMaterial)
        soil.position.set(0, element.depth / 3, 0)
        plantGroup.add(soil)

        // Plant stem
        const stemGeometry = new THREE.CylinderGeometry(1, 2, (element.depth * 2) / 3, 8)
        const stemMaterial = new THREE.MeshStandardMaterial({
          color: 0x33691e, // Dark green for stem
          roughness: 0.9,
          metalness: 0.1,
        })
        const stem = new THREE.Mesh(stemGeometry, stemMaterial)
        stem.position.set(0, (element.depth * 2) / 3, 0)
        plantGroup.add(stem)

        // Create leaves
        const leafGeometry = new THREE.SphereGeometry(element.width / 4, 8, 8)
        const leafMaterial = new THREE.MeshStandardMaterial({
          color: 0x4caf50, // Green for leaves
          roughness: 0.9,
          metalness: 0.1,
        })

        // Add multiple leaves at different positions
        for (let i = 0; i < 8; i++) {
          const leaf = new THREE.Mesh(leafGeometry, leafMaterial)
          const angle = (i / 8) * Math.PI * 2
          const radius = element.width / 3
          const height = element.depth / 2 + (Math.random() * element.depth) / 2

          leaf.position.set(Math.cos(angle) * radius, element.depth / 3 + height, Math.sin(angle) * radius)

          // Scale leaves randomly
          const scale = 0.7 + Math.random() * 0.6
          leaf.scale.set(scale, scale, scale)

          plantGroup.add(leaf)
        }

        plantGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
        object = plantGroup
        break

      case "display":
        // Create a more realistic display stand
        const displayGroup = new THREE.Group()

        // Base
        const displayBaseGeometry = new THREE.BoxGeometry(element.width, 5, element.height)
        const displayBaseMaterial = new THREE.MeshStandardMaterial({
          color: 0x5d4037, // Dark brown for base
          roughness: 0.7,
          metalness: 0.1,
        })
        const displayBase = new THREE.Mesh(displayBaseGeometry, displayBaseMaterial)
        displayBase.position.set(0, 2.5, 0)
        displayGroup.add(displayBase)

        // Display surface
        const surfaceGeometry = new THREE.BoxGeometry(element.width - 10, 2, element.height - 10)
        const surfaceMaterial = new THREE.MeshStandardMaterial({
          color: 0xeceff1, // Light gray for surface
          roughness: 0.4,
          metalness: 0.6,
        })
        const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial)
        surface.position.set(0, 6, 0)
        displayGroup.add(surface)

        // Display items (random products)
        const numProducts = Math.floor(Math.random() * 5) + 3
        const productColors = [0xe91e63, 0x2196f3, 0xffeb3b, 0x4caf50, 0xff9800]

        for (let i = 0; i < numProducts; i++) {
          // Random product type (box or cylinder)
          const isBox = Math.random() > 0.5
          let productGeometry

          if (isBox) {
            const width = 10 + Math.random() * 15
            const height = 10 + Math.random() * 15
            const depth = 10 + Math.random() * 15
            productGeometry = new THREE.BoxGeometry(width, height, depth)
          } else {
            const radius = 5 + Math.random() * 7
            const height = 10 + Math.random() * 15
            productGeometry = new THREE.CylinderGeometry(radius, radius, height, 16)
          }

          const productMaterial = new THREE.MeshStandardMaterial({
            color: productColors[Math.floor(Math.random() * productColors.length)],
            roughness: 0.7,
            metalness: 0.3,
          })

          const product = new THREE.Mesh(productGeometry, productMaterial)

          // Position randomly on the display
          const x = (Math.random() - 0.5) * (element.width - 30)
          const z = (Math.random() - 0.5) * (element.height - 30)
          const y = 7 + (isBox ? productGeometry.parameters.height / 2 : productGeometry.parameters.height / 2)

          product.position.set(x, y, z)
          displayGroup.add(product)
        }

        displayGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
        object = displayGroup
        break

      case "gondola":
        // Create a more realistic gondola shelf unit
        const gondolaGroup = new THREE.Group()

        // Base
        const gondolaBaseGeometry = new THREE.BoxGeometry(element.width, 5, element.height)
        const gondolaBaseMaterial = new THREE.MeshStandardMaterial({
          color: 0x424242, // Dark gray for base
          roughness: 0.5,
          metalness: 0.7,
        })
        const gondolaBase = new THREE.Mesh(gondolaBaseGeometry, gondolaBaseMaterial)
        gondolaBase.position.set(0, 2.5, 0)
        gondolaGroup.add(gondolaBase)

        // Back panel
        const backPanelGeometry = new THREE.BoxGeometry(element.width, element.depth, 2)
        const backPanelMaterial = new THREE.MeshStandardMaterial({
          color: 0x616161, // Gray for back panel
          roughness: 0.7,
          metalness: 0.3,
        })
        const backPanel = new THREE.Mesh(backPanelGeometry, backPanelMaterial)
        backPanel.position.set(0, element.depth / 2, -element.height / 2 + 1)
        gondolaGroup.add(backPanel)

        // Shelves
        const shelfGeometry = new THREE.BoxGeometry(element.width, 2, element.height)
        const shelfMaterial = new THREE.MeshStandardMaterial({
          color: 0x9e9e9e, // Light gray for shelves
          roughness: 0.5,
          metalness: 0.5,
        })

        const numShelvesForGondola = 4
        for (let i = 0; i < numShelvesForGondola; i++) {
          const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial)
          shelf.position.set(0, (i + 1) * (element.depth / numShelvesForGondola), 0)
          gondolaGroup.add(shelf)

          // Add products to each shelf
          const productsPerShelf = Math.floor(Math.random() * 4) + 2
          const productColors = [0xe91e63, 0x2196f3, 0xffeb3b, 0x4caf50, 0xff9800]

          for (let j = 0; j < productsPerShelf; j++) {
            const productWidth = 15
            const productHeight = 20
            const productDepth = 10

            const productGeometry = new THREE.BoxGeometry(productWidth, productHeight, productDepth)
            const productMaterial = new THREE.MeshStandardMaterial({
              color: productColors[Math.floor(Math.random() * productColors.length)],
              roughness: 0.7,
              metalness: 0.3,
            })

            const product = new THREE.Mesh(productGeometry, productMaterial)

            // Position along the shelf
            const x = (j - (productsPerShelf - 1) / 2) * (element.width / productsPerShelf)
            const y = (i + 1) * (element.depth / numShelvesForGondola) + productHeight / 2 + 1
            const z = 0

            product.position.set(x, y, z)
            gondolaGroup.add(product)
          }
        }

        gondolaGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
        object = gondolaGroup
        break

      case "planogram":
        // Create a more realistic planogram display
        const planogramGroup = new THREE.Group()

        // Base structure
        const planogramBaseGeometry = new THREE.BoxGeometry(element.width, 5, element.height)
        const planogramBaseMaterial = new THREE.MeshStandardMaterial({
          color: 0x424242, // Dark gray for base
          roughness: 0.5,
          metalness: 0.7,
        })
        const planogramBase = new THREE.Mesh(planogramBaseGeometry, planogramBaseMaterial)
        planogramBase.position.set(0, 2.5, 0)
        planogramGroup.add(planogramBase)

        // Back panel
        const planogramBackPanelGeometry = new THREE.BoxGeometry(element.width, element.depth, 2)
        const planogramBackPanelMaterial = new THREE.MeshStandardMaterial({
          color: 0x616161, // Gray for back panel
          roughness: 0.7,
          metalness: 0.3,
        })
        const planogramBackPanel = new THREE.Mesh(planogramBackPanelGeometry, planogramBackPanelMaterial)
        planogramBackPanel.position.set(0, element.depth / 2, -element.height / 2 + 1)
        planogramGroup.add(planogramBackPanel)

        // Shelves
        const planogramShelfGeometry = new THREE.BoxGeometry(element.width, 2, element.height - 4)
        const planogramShelfMaterial = new THREE.MeshStandardMaterial({
          color: 0x9e9e9e, // Light gray for shelves
          roughness: 0.5,
          metalness: 0.5,
        })

        // Add multiple shelves
        const numPlanogramShelves = 5
        for (let i = 0; i < numPlanogramShelves; i++) {
          const shelf = new THREE.Mesh(planogramShelfGeometry, planogramShelfMaterial)
          shelf.position.set(0, (i + 1) * (element.depth / (numPlanogramShelves + 1)), 0)
          planogramGroup.add(shelf)

          // Add products to each shelf in a more organized way (planogram style)
          const productsPerRow = 6
          const productRows = 2

          for (let row = 0; row < productRows; row++) {
            for (let j = 0; j < productsPerRow; j++) {
              // Create product with consistent size for planogram
              const productWidth = (element.width - 20) / productsPerRow
              const productHeight = 15
              const productDepth = (element.height - 10) / productRows / 2

              const productGeometry = new THREE.BoxGeometry(productWidth - 2, productHeight, productDepth - 2)

              // Use consistent colors for each product type (row)
              const productColor = row === 0 ? 0x2196f3 : 0xff9800 // Blue for first row, orange for second

              const productMaterial = new THREE.MeshStandardMaterial({
                color: productColor,
                roughness: 0.7,
                metalness: 0.3,
              })

              const product = new THREE.Mesh(productGeometry, productMaterial)

              // Position products in a grid pattern
              const x = (j - (productsPerRow - 1) / 2) * productWidth
              const y = (i + 1) * (element.depth / (numPlanogramShelves + 1)) + productHeight / 2 + 1
              const z = (row - (productRows - 1) / 2) * productDepth

              product.position.set(x, y, z)
              planogramGroup.add(product)

              // Add product label (small white rectangle on front)
              const labelGeometry = new THREE.PlaneGeometry(productWidth - 4, 5)
              const labelMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
              const label = new THREE.Mesh(labelGeometry, labelMaterial)
              label.position.set(0, -productHeight / 4, productDepth / 2 + 0.1)
              label.rotation.x = Math.PI / 2
              product.add(label)
            }
          }
        }

        planogramGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
        object = planogramGroup
        break

      case "cube":
        // Create a shelf unit like the image
        const cubeGroup = new THREE.Group()

        // Define materials
        const frameMaterialCube = new THREE.MeshStandardMaterial({
          color: 0x3e2723, // Dark brown for frame
          roughness: 0.7,
          metalness: 0.2,
        })

        const glassMaterialCube = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 0.1,
          metalness: 0.1,
          transparent: true,
          opacity: 0.2,
          transmission: 0.95,
        })

        // Dimensions
        const width = element.width
        const height = element.depth
        const depth = element.height
        const frameThickness = 5
        const shelfThickness = 5
        const numShelves = 4

        // Back panel (glass)
        const backPanelCube = new THREE.Mesh(new THREE.BoxGeometry(width, height, 1), glassMaterialCube)
        backPanelCube.position.set(0, height / 2, -depth / 2)
        cubeGroup.add(backPanelCube)

        // Left panel (glass)
        const leftPanelCube = new THREE.Mesh(new THREE.BoxGeometry(1, height, depth), glassMaterialCube)
        leftPanelCube.position.set(-width / 2, height / 2, 0)
        cubeGroup.add(leftPanelCube)

        // Right panel (glass)
        const rightPanelCube = new THREE.Mesh(new THREE.BoxGeometry(1, height, depth), glassMaterialCube)
        rightPanelCube.position.set(width / 2, height / 2, 0)
        cubeGroup.add(rightPanelCube)

        // Vertical frames
        // Left front
        const leftFrontFrame = new THREE.Mesh(
          new THREE.BoxGeometry(frameThickness, height, frameThickness),
          frameMaterialCube,
        )
        leftFrontFrame.position.set(-width / 2 + frameThickness / 2, height / 2, depth / 2 - frameThickness / 2)
        cubeGroup.add(leftFrontFrame)

        // Right front
        const rightFrontFrame = new THREE.Mesh(
          new THREE.BoxGeometry(frameThickness, height, frameThickness),
          frameMaterialCube,
        )
        rightFrontFrame.position.set(width / 2 - frameThickness / 2, height / 2, depth / 2 - frameThickness / 2)
        cubeGroup.add(rightFrontFrame)

        // Left back
        const leftBackFrame = new THREE.Mesh(
          new THREE.BoxGeometry(frameThickness, height, frameThickness),
          frameMaterialCube,
        )
        leftBackFrame.position.set(-width / 2 + frameThickness / 2, height / 2, -depth / 2 + frameThickness / 2)
        cubeGroup.add(leftBackFrame)

        // Right back
        const rightBackFrame = new THREE.Mesh(
          new THREE.BoxGeometry(frameThickness, height, frameThickness),
          frameMaterialCube,
        )
        rightBackFrame.position.set(width / 2 - frameThickness / 2, height / 2, -depth / 2 + frameThickness / 2)
        cubeGroup.add(rightBackFrame)

        // Horizontal shelves
        const shelfSpacing = height / numShelves

        for (let i = 0; i < numShelves; i++) {
          const shelfY = i * shelfSpacing

          const shelf = new THREE.Mesh(new THREE.BoxGeometry(width, shelfThickness, depth), frameMaterialCube)
          shelf.position.set(0, shelfY + shelfThickness / 2, 0)
          cubeGroup.add(shelf)

          // Add horizontal supports at the front and back if not the top shelf
          if (i < numShelves - 1) {
            // Front horizontal support
            const frontSupport = new THREE.Mesh(
              new THREE.BoxGeometry(width - frameThickness * 2, frameThickness, frameThickness),
              frameMaterialCube,
            )
            frontSupport.position.set(0, shelfY + shelfSpacing / 2 + shelfThickness, depth / 2 - frameThickness / 2)
            cubeGroup.add(frontSupport)

            // Back horizontal support
            const backSupport = new THREE.Mesh(
              new THREE.BoxGeometry(width - frameThickness * 2, frameThickness, frameThickness),
              frameMaterialCube,
            )
            backSupport.position.set(0, shelfY + shelfSpacing / 2 + shelfThickness, -depth / 2 + frameThickness / 2)
            cubeGroup.add(backSupport)
          }
        }

        cubeGroup.position.set(element.x + element.width / 2, 0, element.y + element.height / 2)
        object = cubeGroup
        break

      default:
        geometry = new THREE.BoxGeometry(element.width, element.depth, element.height)
        material = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.7,
          metalness: 0.3,
        })
        object = new THREE.Mesh(geometry, material)
        object.position.set(element.x + element.width / 2, element.depth / 2, element.y + element.height / 2)
    }

    // Appliquer la rotation
    object.rotation.y = (element.rotation * Math.PI) / 180

    // Ajouter les ombres
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    // Ajouter à la scène
    sceneRef.current.add(object)
    objectsRef.current.set(element.id, object)
  }

  // Fonction pour mettre à jour la position d'un objet 3D
  const update3DObjectPosition = (elementId: string) => {
    const element = elements.find((el) => el.id === elementId)
    const object = objectsRef.current.get(elementId)

    if (element && object && sceneRef.current) {
      // Conserver la hauteur y actuelle pour maintenir l'objet sur le sol
      const currentY = object.position.y
      object.position.set(element.x + element.width / 2, currentY, element.y + element.height / 2)
    }
  }

  // Fonction pour mettre à jour la taille d'un objet 3D
  const update3DObjectSize = (elementId: string) => {
    const element = elements.find((el) => el.id === elementId)
    const object = objectsRef.current.get(elementId)

    if (element && object && sceneRef.current) {
      // Pour tous les objets, il est plus simple de les recréer
      sceneRef.current.remove(object)
      objectsRef.current.delete(elementId)
      add3DObject(element)
    }
  }

  // Fonction pour mettre à jour la rotation d'un objet 3D
  const update3DObjectRotation = (elementId: string) => {
    const element = elements.find((el) => el.id === elementId)
    const object = objectsRef.current.get(elementId)

    if (element && object) {
      object.rotation.y = (element.rotation * Math.PI) / 180
    }
  }

  // Rendu des éléments sur le canvas
  const renderElements = () => {
    return elements.map((element) => {
      const isSelected = selectedElement === element.id
      const style = {
        position: "absolute" as const,
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation}deg)`,
        backgroundColor: getElementColor(element.type),
        border: isSelected ? "2px solid #3b82f6" : "1px solid #888",
        cursor: "move",
        zIndex: isSelected ? 10 : 1,
      }

      return (
        <div
          key={element.id}
          data-id={element.id}
          style={style}
          onClick={(e) => {
            e.stopPropagation()
            setSelectedElement(element.id)
          }}
          onMouseDown={(e) => handleElementDragStart(e, element.id)}
        >
          <div className="w-full h-full flex items-center justify-center text-xs text-white">
            {element.name || getElementLabel(element.type)}
          </div>

          {/* Afficher les dimensions si activé */}
          {showDimensions && (
            <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-800 font-medium">
              {formatDimension(element.width)} × {formatDimension(element.height)}
            </div>
          )}

          {element.type === "window" && showDimensions && (
            <>
              <div className="absolute -top-5 left-0 right-0 text-center text-xs text-gray-800 font-medium">
                {formatDimension(element.windowTopDistance || 0)}
              </div>
              <div className="absolute -bottom-10 left-0 right-0 text-center text-xs text-gray-800 font-medium">
                {formatDimension(element.windowBottomDistance || 0)}
              </div>
            </>
          )}

          {isSelected && (
            <>
              {/* Poignées de redimensionnement */}
              <div
                className="absolute top-0 left-0 w-3 h-3 bg-blue-500 cursor-nwse-resize"
                onMouseDown={(e) => startResize(e, "top-left")}
              />
              <div
                className="absolute top-0 right-0 w-3 h-3 bg-blue-500 cursor-nesw-resize"
                onMouseDown={(e) => startResize(e, "top-right")}
              />
              <div
                className="absolute bottom-0 left-0 w-3 h-3 bg-blue-500 cursor-nesw-resize"
                onMouseDown={(e) => startResize(e, "bottom-left")}
              />
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-nwse-resize"
                onMouseDown={(e) => startResize(e, "bottom-right")}
              />
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-ns-resize"
                onMouseDown={(e) => startResize(e, "top")}
              />
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-ns-resize"
                onMouseDown={(e) => startResize(e, "bottom")}
              />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 cursor-ew-resize"
                onMouseDown={(e) => startResize(e, "left")}
              />
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 cursor-ew-resize"
                onMouseDown={(e) => startResize(e, "right")}
              />

              {/* Poignée de rotation */}
              <div
                className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center cursor-pointer"
                onMouseDown={(e) => startRotate(e)}
              >
                <RotateCw className="w-4 h-4 text-white" />
              </div>
            </>
          )}
        </div>
      )
    })
  }

  // Rendu de l'élément fantôme (aperçu avant placement)
  const renderGhostElement = () => {
    if (!ghostElement) return null

    const style = {
      position: "absolute" as const,
      left: `${ghostElement.x}px`,
      top: `${ghostElement.y}px`,
      width: `${ghostElement.width}px`,
      height: `${ghostElement.height}px`,
      backgroundColor: getElementColor(ghostElement.type),
      border: ghostElement.valid === false ? "1px dashed #ef4444" : "1px dashed #3b82f6",
      opacity: 0.5,
      pointerEvents: "none" as const,
      zIndex: 5,
    }

    return (
      <div style={style}>
        <div className="w-full h-full flex items-center justify-center text-xs text-white">
          {getElementLabel(ghostElement.type)}
        </div>

        {/* Afficher les dimensions sur l'élément fantôme */}
        {showDimensions && (
          <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-800 font-medium">
            {formatDimension(ghostElement.width)} × {formatDimension(ghostElement.height)}
          </div>
        )}

        {/* Afficher un message d'erreur si le placement n'est pas valide */}
        {ghostElement.valid === false && (
          <div className="absolute -top-8 left-0 right-0 text-center text-xs text-red-600 font-medium bg-white px-1 py-0.5 rounded">
            {ghostElement.type === "door" ? "Doit être à côté d'un mur" : "Doit être sur un mur"}
          </div>
        )}
      </div>
    )
  }

  // Fonction pour obtenir la couleur d'un élément selon son type
  const getElementColor = (type: ElementType): string => {
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
      case "dairy_fridge":
        return "#000000"
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
        return "#5D4037" // Brun foncé pour le cube
      default:
        return "#CCCCCC"
    }
  }

  // Fonction pour obtenir le libellé d'un élément selon son type
  const getElementLabel = (type: ElementType): string => {
    switch (type) {
      case "wall":
        return "Mur"
      case "door":
        return "Porte"
      case "window":
        return "Fenêtre"
      case "shelf":
        return "Étagère"
      case "rack":
        return "Portant"
      case "display":
        return "Présentoir"
      case "table":
        return "Table"
      case "fridge":
        return "Frigo"
      case "dairy_fridge":
        return "Frigo Produits Laitiers"
      case "planogram":
        return "Planogramme"
      case "gondola":
        return "Gondole"
      case "line":
        return "Ligne"
      case "rectangle":
        return "Rectangle"
      case "circle":
        return "Cercle"
      case "chair":
        return "Chaise"
      case "sofa":
        return "Canapé"
      case "bed":
        return "Lit"
      case "plant":
        return "Plante"
      case "counter":
        return "Comptoir"
      case "cashier":
        return "Caisse"
      case "mannequin":
        return "Mannequin"
      case "cube":
        return "Cube"
      default:
        return ""
    }
  }

  // Fonction pour exporter le plan en JSON
  const exportToJSON = () => {
    const dataStr = JSON.stringify(elements, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `floor-plan-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Fonction pour importer un plan depuis un fichier JSON
  const importFromJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedElements = JSON.parse(event.target?.result as string) as Element[]
        setElements(importedElements)

        // Recréer les objets 3D si nécessaire
        if (viewMode === "3d" && sceneRef.current) {
          // Supprimer tous les objets existants
          objectsRef.current.forEach((object, id) => {
            if (sceneRef.current) {
              sceneRef.current.remove(object)
            }
          })
          objectsRef.current.clear()

          // Ajouter les nouveaux objets
          importedElements.forEach((element) => {
            add3DObject(element)
          })
        }

        // Centrer la vue sur le nouveau plan
        centerView()

        // Réinitialiser l'input file pour permettre de réimporter le même fichier
        e.target.value = ""
      } catch (error) {
        console.error("Erreur lors de l'importation du fichier JSON:", error)
        alert("Le fichier sélectionné n'est pas un fichier JSON valide pour un plan d'étage.")
      }
    }
    reader.readAsText(file)
  }

  // Fonction pour exporter le plan en image
  const exportToImage = () => {
    if (viewMode === "2d" && canvasRef.current) {
      // Créer un canvas temporaire pour l'export
      const tempCanvas = document.createElement("canvas")
      const ctx = tempCanvas.getContext("2d")
      if (!ctx) return

      // Calculer les dimensions du plan
      let minX = Number.POSITIVE_INFINITY
      let maxX = Number.NEGATIVE_INFINITY
      let minY = Number.POSITIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY

      elements.forEach((element) => {
        minX = Math.min(minX, element.x)
        maxX = Math.max(maxX, element.x + element.width)
        minY = Math.min(minY, element.y)
        maxY = Math.max(maxY, element.y + element.height)
      })

      // Ajouter une marge
      const margin = 50
      minX -= margin
      minY -= margin
      maxX += margin
      maxY += margin

      const width = maxX - minX
      const height = maxY - minY

      tempCanvas.width = width
      tempCanvas.height = height

      // Dessiner la grille
      ctx.fillStyle = "#f8f8f8"
      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = "#ddd"
      ctx.lineWidth = 1

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Dessiner les éléments
      elements.forEach((element) => {
        ctx.save()

        // Translater au centre de l'élément pour la rotation
        ctx.translate(element.x - minX + element.width / 2, element.y - minY + element.height / 2)
        ctx.rotate((element.rotation * Math.PI) / 180)

        // Dessiner l'élément
        ctx.fillStyle = getElementColor(element.type)
        ctx.fillRect(-element.width / 2, -element.height / 2, element.width, element.height)

        ctx.strokeStyle = "#000"
        ctx.lineWidth = 1
        ctx.strokeRect(-element.width / 2, -element.height / 2, element.width, element.height)

        // Ajouter le libellé
        ctx.fillStyle = "#fff"
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(getElementLabel(element.type), 0, 0)

        // Ajouter les dimensions
        ctx.fillStyle = "#000"
        ctx.font = "8px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        ctx.fillText(
          `${formatDimension(element.width)} × {formatDimension(element.height)} × ${formatDimension(element.depth)}`,
          0,
          element.height / 2 + 5,
        )

        ctx.restore()
      })

      // Exporter l'image
      const dataUrl = tempCanvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `floor-plan-2d-${new Date().toISOString().slice(0, 10)}.png`
      link.href = dataUrl
      link.click()
    } else if (viewMode === "3d" && rendererRef.current && sceneRef.current && cameraRef.current) {
      // Pour la vue 3D, on capture directement le rendu
      rendererRef.current.render(sceneRef.current, cameraRef.current)
      const dataUrl = rendererRef.current.domElement.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `floor-plan-3d-${new Date().toISOString().slice(0, 10)}.png`
      link.href = dataUrl
      link.click()
    }
  }

  // Fonction pour exporter le plan en PDF
  const exportToPDF = () => {
    if (viewMode === "2d" && canvasRef.current) {
      // Créer un canvas temporaire pour l'export
      const tempCanvas = document.createElement("canvas")
      const ctx = tempCanvas.getContext("2d")
      if (!ctx) return

      // Calculer les dimensions du plan
      let minX = Number.POSITIVE_INFINITY
      let maxX = Number.NEGATIVE_INFINITY
      let minY = Number.POSITIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY

      elements.forEach((element) => {
        minX = Math.min(minX, element.x)
        maxX = Math.max(maxX, element.x + element.width)
        minY = Math.min(minY, element.y)
        maxY = Math.max(maxY, element.y + element.height)
      })

      // Ajouter une marge
      const margin = 50
      minX -= margin
      minY -= margin
      maxX += margin
      maxY += margin

      const width = maxX - minX
      const height = maxY - minY

      tempCanvas.width = width
      tempCanvas.height = height

      // Dessiner la grille
      ctx.fillStyle = "#f8f8f8"
      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = "#ddd"
      ctx.lineWidth = 1

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Dessiner les éléments
      elements.forEach((element) => {
        ctx.save()

        // Translater au centre de l'élément pour la rotation
        ctx.translate(element.x - minX + element.width / 2, element.y - minY + element.height / 2)
        ctx.rotate((element.rotation * Math.PI) / 180)

        // Dessiner l'élément
        ctx.fillStyle = getElementColor(element.type)
        ctx.fillRect(-element.width / 2, -element.height / 2, element.width, element.height)

        ctx.strokeStyle = "#000"
        ctx.lineWidth = 1
        ctx.strokeRect(-element.width / 2, -element.height / 2, element.width, element.height)

        // Ajouter le libellé
        ctx.fillStyle = "#fff"
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(getElementLabel(element.type), 0, 0)

        // Ajouter les dimensions
        ctx.fillStyle = "#000"
        ctx.font = "8px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        ctx.fillText(
          `${formatDimension(element.width)} × ${formatDimension(element.height)} × ${formatDimension(element.depth)}`,
          0,
          element.height / 2 + 5,
        )

        ctx.restore()
      })

      // Créer le PDF
      const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [width, height],
      })

      // Ajouter l'image au PDF
      const imgData = tempCanvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", 0, 0, width, height)

      // Ajouter un titre et des informations
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text("Plan d'étage", 20, 20)

      pdf.setFontSize(10)
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35)
      pdf.text(`Nombre d'éléments: ${elements.length}`, 20, 45)

      // Ajouter une légende avec les dimensions de chaque élément
      pdf.setFontSize(12)
      pdf.text("Légende des éléments:", 20, 60)

      let yPos = 75
      elements.forEach((element, index) => {
        if (index < 15) {
          // Limiter le nombre d'éléments dans la légende pour éviter de surcharger le PDF
          pdf.setFontSize(8)
          pdf.text(
            `${getElementLabel(element.type)}: ${formatDimension(element.width)} × ${formatDimension(
              element.height,
            )} × ${formatDimension(element.depth)}`,
            20,
            yPos,
          )
          yPos += 10
        }
      })

      // Télécharger le PDF
      pdf.save(`floor-plan-${new Date().toISOString().slice(0, 10)}.pdf`)
    } else if (viewMode === "3d" && rendererRef.current && sceneRef.current && cameraRef.current) {
      // Pour la vue 3D, on capture d'abord une image
      rendererRef.current.render(sceneRef.current, cameraRef.current)
      const imgData = rendererRef.current.domElement.toDataURL("image/png")

      // Obtenir les dimensions du conteneur
      const width = rendererRef.current.domElement.width
      const height = rendererRef.current.domElement.height

      // Créer le PDF
      const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [width, height],
      })

      // Ajouter l'image au PDF
      pdf.addImage(imgData, "PNG", 0, 0, width, height)

      // Ajouter un titre et des informations
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text("Plan d'étage 3D", 20, 20)

      pdf.setFontSize(10)
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35)
      pdf.text(`Nombre d'éléments: ${elements.length}`, 20, 45)

      // Ajouter une légende avec les dimensions de chaque élément
      pdf.setFontSize(12)
      pdf.text("Légende des éléments:", 20, 60)

      let yPos = 75
      elements.forEach((element, index) => {
        if (index < 15) {
          // Limiter le nombre d'éléments dans la légende pour éviter de surcharger le PDF
          pdf.setFontSize(8)
          pdf.text(
            `${getElementLabel(element.type)}: ${formatDimension(element.width)} × ${formatDimension(
              element.height,
            )} × ${formatDimension(element.depth)}`,
            20,
            yPos,
          )
          yPos += 10
        }
      })

      // Télécharger le PDF
      pdf.save(`floor-plan-3d-${new Date().toISOString().slice(0, 10)}.pdf`)
    }
  }

  // Function to handle saving the floor plan
  const handleSaveFloorPlan = () => {
    if (!planName.trim()) {
      toast({
        title: "Erreur de sauvegarde",
        description: "Veuillez entrer un nom pour votre plan d'étage.",
        variant: "destructive",
      })
      return
    }

    try {
      // Create floor plan object
      const floorPlan: FloorPlan = {
        id: `plan-${Date.now()}`,
        name: planName,
        elements: elements,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Save to storage
      saveFloorPlan(floorPlan)

      toast({
        title: "Plan d'étage sauvegardé",
        description: "Votre plan d'étage a été sauvegardé avec succès.",
      })

      // Close dialog
      setShowSaveDialog(false)
      setPlanName("")
    } catch (error) {
      console.error("Error saving floor plan:", error)
      toast({
        title: "Erreur de sauvegarde",
        description: "Une erreur est survenue lors de la sauvegarde du plan d'étage.",
        variant: "destructive",
      })
    }
  }

  // Fonction pour supprimer l'élément sélectionné
  const deleteSelectedElement = () => {
    if (selectedElement) {
      // Supprimer l'objet 3D s'il existe
      if (sceneRef.current && objectsRef.current.has(selectedElement)) {
        const object = objectsRef.current.get(selectedElement)
        if (object) {
          sceneRef.current.remove(object)
          objectsRef.current.delete(selectedElement)
        }
      }

      // Supprimer l'élément de la liste
      setElements((prevElements) => prevElements.filter((el) => el.id !== selectedElement))
      setSelectedElement(null)

      toast({
        title: "Élément supprimé",
        description: "L'élément a été supprimé avec succès.",
      })
    }
  }

  // Effet pour gérer les événements clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Annuler la sélection d'un outil avec Échap
      if (e.key === "Escape") {
        setCurrentTool(null)
        setSelectedElement(null)
        setGhostElement(null)
      }

      // Supprimer l'élément sélectionné avec la touche Delete
      if (e.key === "Delete" && selectedElement) {
        deleteSelectedElement()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedElement, currentTool])

  return (
    <div className="mt-14">
      <div className="flex h-screen flex-col">
        <div className="border-b p-4 flex justify-between items-center">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Button>
          <h1 className="text-2xl font-bold">Éditeur de plan d'étage</h1>

          <div className="flex gap-2">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "2d" | "3d")}>
              <TabsList>
                <TabsTrigger value="2d">Vue 2D</TabsTrigger>
                <TabsTrigger value="3d">Vue 3D</TabsTrigger>
              </TabsList>
            </Tabs>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={exportToImage}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exporter en image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={exportToPDF}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exporter en PDF</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={exportToJSON}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exporter en JSON</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <input type="file" id="import-json" accept=".json" onChange={importFromJSON} className="hidden" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => document.getElementById("import-json")?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Importer un JSON</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setShowSaveDialog(true)}>
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sauvegarder le plan</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="default">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Aller à l'éditeur de magasin
            </Button>
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
          {/* Barre latérale  */}
          <div
            className={`${sidebarVisible ? "w-96" : "w-0 p-0 overflow-hidden"} border-r bg-gray-50 p-4 overflow-y-auto transition-all duration-300`}
          >
            <Tabs
              value={currentTab}
              onValueChange={(value) => setCurrentTab(value as "structures" | "shapes" | "furniture")}
            >
              <TabsList className="w-full mb-4">
                <TabsTrigger value="structures" className="flex-1">
                  Structures
                </TabsTrigger>
                <TabsTrigger value="shapes" className="flex-1">
                  Formes
                </TabsTrigger>
                <TabsTrigger value="furniture" className="flex-1">
                  Meubles
                </TabsTrigger>
              </TabsList>

              <div className="space-y-6">
                <div className="space-y-4" style={{ display: currentTab === "structures" ? "block" : "none" }}>
                  {/* Onglet Structures */}
                  <div className="space-y-4" data-value="structures">
                    <div>
                      <h2 className="font-semibold mb-2 text-gray-700 flex items-center">
                        <Square className="h-4 w-4 mr-2" />
                        Structures de base
                      </h2>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <Button
                          variant={currentTool === "wall" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("wall")}
                        >
                          <Square className="h-5 w-5 mb-1" />
                          <span className="text-xs">Mur</span>
                        </Button>
                        <Button
                          variant={currentTool === "door" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("door")}
                        >
                          <DoorOpen className="h-5 w-5 mb-1" />
                          <span className="text-xs">Porte</span>
                        </Button>
                        <Button
                          variant={currentTool === "window" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("window")}
                        >
                          <Columns className="h-5 w-5 mb-1" />
                          <span className="text-xs">Fenêtre</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Onglet Formes */}
                <div className="space-y-4" style={{ display: currentTab === "shapes" ? "block" : "none" }}>
                  <div className="space-y-4" data-value="shapes">
                    <div>
                      <h2 className="font-semibold mb-2 text-gray-700 flex items-center">
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        Formes basiques
                      </h2>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <Button
                          variant={currentTool === "line" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("line")}
                        >
                          <div className="w-6 h-0.5 bg-gray-700 mb-1"></div>
                          <span className="text-xs">Ligne</span>
                        </Button>
                        <Button
                          variant={currentTool === "rectangle" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("rectangle")}
                        >
                          <Square className="h-5 w-5 mb-1" />
                          <span className="text-xs">Rectangle</span>
                        </Button>
                        <Button
                          variant={currentTool === "circle" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("circle")}
                        >
                          <div className="w-5 h-5 rounded-full border-2 border-gray-700 mb-1"></div>
                          <span className="text-xs">Cercle</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Onglet Meubles */}
                <div className="space-y-4" style={{ display: currentTab === "furniture" ? "block" : "none" }}>
                  <div className="space-y-6" data-value="furniture">
                    <div>
                      <h2 className="font-semibold mb-2 text-gray-700 flex items-center">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Meubles de magasin
                      </h2>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <Button
                          variant={currentTool === "shelf" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("shelf")}
                        >
                          <SquareStack className="h-5 w-5 mb-1" />
                          <span className="text-xs">Shelf</span>
                        </Button>
                        <Button
                          variant={currentTool === "display" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("display")}
                        >
                          <ShoppingBag className="h-5 w-5 mb-1" />
                          <span className="text-xs">Display</span>
                        </Button>
                        <Button
                          variant={currentTool === "table" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("table")}
                        >
                          <Square className="h-5 w-5 mb-1" />
                          <span className="text-xs">Table</span>
                        </Button>
                        <Button
                          variant={currentTool === "fridge" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("fridge")}
                        >
                          <Square className="h-5 w-5 mb-1" />
                          <span className="text-xs">Fridge</span>
                        </Button>
                        <Button
                          variant={currentTool === "dairy_fridge" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("dairy_fridge")}
                        >
                          <Square className="h-5 w-5 mb-1" />
                          <span className="text-xs">Dairy Fridge</span>
                        </Button>
                        <Button
                          variant={currentTool === "planogram" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("planogram")}
                        >
                          <LayoutGrid className="h-5 w-5 mb-1" />
                          <span className="text-xs">Planogram</span>
                        </Button>
                        <Button
                          variant={currentTool === "gondola" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("gondola")}
                        >
                          <Layers className="h-5 w-5 mb-1" />
                          <span className="text-xs">Gondola</span>
                        </Button>
                        <Button
                          variant={currentTool === "counter" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("counter")}
                        >
                          <Square className="h-5 w-5 mb-1" />
                          <span className="text-xs">Counter</span>
                        </Button>
                        <Button
                          variant={currentTool === "cashier" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("cashier")}
                        >
                          <Square className="h-5 w-5 mb-1" />
                          <span className="text-xs">Cash Register</span>
                        </Button>
                        <Button
                          variant={currentTool === "cube" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("cube")}
                        >
                          <LayoutGrid className="h-5 w-5 mb-1" />
                          <span className="text-xs">Cube</span>
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h2 className="font-semibold mb-2 text-gray-700 flex items-center">
                        <Shirt className="h-4 w-4 mr-2" />
                        Clothing Furniture
                      </h2>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <Button
                          variant={currentTool === "rack" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("rack")}
                        >
                          <Shirt className="h-5 w-5 mb-1" />
                          <span className="text-xs">Clothes Rack</span>
                        </Button>
                        <Button
                          variant={currentTool === "mannequin" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("mannequin")}
                        >
                          <Shirt className="h-5 w-5 mb-1" />
                          <span className="text-xs">Mannequin</span>
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h2 className="font-semibold mb-2 text-gray-700 flex items-center">
                        <Square className="h-4 w-4 mr-2" />
                        Miscellaneous Furniture
                      </h2>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <Button
                          variant={currentTool === "chair" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("chair")}
                        >
                          <Square className="h-5 w-5 mb-1" />
                          <span className="text-xs">Chair</span>
                        </Button>
                        <Button
                          variant={currentTool === "sofa" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("sofa")}
                        >
                          <Square className="h-5 w-5 mb-1" />
                          <span className="text-xs">Sofa</span>
                        </Button>
                        <Button
                          variant={currentTool === "bed" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("bed")}
                        >
                          <Square className="h-5 w-5 mb-1" />
                          <span className="text-xs">Bed</span>
                        </Button>
                        <Button
                          variant={currentTool === "plant" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-16 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300"
                          onClick={() => selectTool("plant")}
                        >
                          <Square className="h-5 w-5 mb-1" />
                          <span className="text-xs">Plant</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tabs>

            {/* Propriétés de l'élément sélectionné */}
            {selectedElementData && (
              <>
                <Separator className="my-4" />
                <h2 className="font-semibold mb-2 text-gray-700">Propriétés</h2>
                <div className="space-y-4 bg-white p-3 rounded-md shadow-sm">
                  <div>
                    <label className="text-sm font-medium">Nom</label>
                    <Input
                      className="mt-1"
                      value={selectedElementData.name || ""}
                      onChange={(e) => {
                        setElements((prevElements) =>
                          prevElements.map((el) => (el.id === selectedElement ? { ...el, name: e.target.value } : el)),
                        )
                      }}
                      placeholder="Entrez un nom pour cet élément"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <div className="mt-1 text-sm bg-gray-50 p-2 rounded">
                      {getElementLabel(selectedElementData.type)}
                    </div>
                  </div>

                  {/* Largeur avec slider */}
                  <div>
                    <label className="text-sm font-medium">Largeur</label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[selectedElementData.width]}
                        min={10}
                        max={300}
                        step={1}
                        onValueChange={(value) => {
                          setElements((prevElements) =>
                            prevElements.map((el) => (el.id === selectedElement ? { ...el, width: value[0] } : el)),
                          )
                          if (sceneRef.current) {
                            update3DObjectSize(selectedElement!)
                          }
                        }}
                        className="mt-2"
                      />
                      <span className="text-sm bg-gray-50 p-1 rounded min-w-[50px] text-center">
                        {formatDimension(selectedElementData.width)}
                      </span>
                    </div>
                  </div>

                  {/* Profondeur avec slider */}
                  <div>
                    <label className="text-sm font-medium">Profondeur</label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[selectedElementData.height]}
                        min={10}
                        max={300}
                        step={1}
                        onValueChange={(value) => {
                          setElements((prevElements) =>
                            prevElements.map((el) => (el.id === selectedElement ? { ...el, height: value[0] } : el)),
                          )
                          if (sceneRef.current) {
                            update3DObjectSize(selectedElement!)
                          }
                        }}
                        className="mt-2"
                      />
                      <span className="text-sm bg-gray-50 p-1 rounded min-w-[50px] text-center">
                        {formatDimension(selectedElementData.height)}
                      </span>
                    </div>
                  </div>

                  {/* Hauteur avec slider */}
                  <div>
                    <label className="text-sm font-medium">Hauteur</label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[selectedElementData.depth]}
                        min={10}
                        max={200}
                        step={1}
                        onValueChange={(value) => updateElementDepth(value[0])}
                        className="mt-2"
                      />
                      <span className="text-sm bg-gray-50 p-1 rounded min-w-[50px] text-center">
                        {formatDimension(selectedElementData.depth)}
                      </span>
                    </div>
                  </div>

                  {selectedElementData && selectedElementData.type === "window" && selectedElementData.parentWallId && (
                    <>
                      <div>
                        <label className="text-sm font-medium">Distance du haut</label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[selectedElementData.windowTopDistance || 0]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(value) => {
                              setElements((prevElements) =>
                                prevElements.map((el) =>
                                  el.id === selectedElement
                                    ? {
                                        ...el,
                                        windowTopDistance: value[0],
                                      }
                                    : el,
                                ),
                              )
                              if (sceneRef.current) {
                                update3DObjectSize(selectedElement!)
                              }
                            }}
                            className="mt-2"
                          />
                          <span className="text-sm bg-gray-50 p-1 rounded min-w-[50px] text-center">
                            {formatDimension(selectedElementData.windowTopDistance || 0)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Distance du bas</label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[selectedElementData.windowBottomDistance || 0]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(value) => {
                              setElements((prevElements) =>
                                prevElements.map((el) =>
                                  el.id === selectedElement
                                    ? {
                                        ...el,
                                        windowBottomDistance: value[0],
                                      }
                                    : el,
                                ),
                              )
                              if (sceneRef.current) {
                                update3DObjectSize(selectedElement!)
                              }
                            }}
                            className="mt-2"
                          />
                          <span className="text-sm bg-gray-50 p-1 rounded min-w-[50px] text-center">
                            {formatDimension(selectedElementData.windowBottomDistance || 0)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="text-sm font-medium">Rotation</label>
                    <div className="mt-1 text-sm bg-gray-50 p-2 rounded">
                      {Math.round(selectedElementData.rotation)}°
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Position</label>
                    <div className="mt-1 text-sm bg-gray-50 p-2 rounded">
                      X: {formatDimension(selectedElementData.x)}, Y: {formatDimension(selectedElementData.y)}
                    </div>
                  </div>
                  {/* Add this at the end of the properties panel */}
                  <div className="pt-2">
                    <Button
                      variant="destructive"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={deleteSelectedElement}
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer l'élément
                    </Button>
                  </div>
                </div>
              </>
            )}

            <Separator className="my-4" />

            <div className="space-y-4 bg-white p-3 rounded-md shadow-sm">
              <div className="flex items-center justify-between">
                <Label htmlFor="grid-snap" className="text-sm font-medium">
                  Aligner sur la grille
                </Label>
                <Switch id="grid-snap" checked={snapToGrid} onCheckedChange={setSnapToGrid} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-dimensions" className="text-sm font-medium">
                  Afficher les dimensions
                </Label>
                <Switch id="show-dimensions" checked={showDimensions} onCheckedChange={setShowDimensions} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit-system" className="text-sm font-medium">
                  Unité de mesure
                </Label>
                <Select value={unitSystem} onValueChange={(value) => setUnitSystem(value as "m" | "cm")}>
                  <SelectTrigger id="unit-system">
                    <SelectValue placeholder="Choisir une unité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">Centimètres</SelectItem>
                    <SelectItem value="m">Mètres</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {!sidebarVisible && (
            <button
              className="absolute top-4 left-4 z-20 bg-white p-2 rounded-md shadow-md hover:bg-gray-100"
              onClick={() => setSidebarVisible(true)}
            >
              <PanelLeft className="h-4 w-4 rotate-180" />
            </button>
          )}

          {/* Zone d'édition */}
          <div className={`flex-1 relative overflow-hidden bg-gray-100 transition-all duration-300`}>
            {/* Contrôles de zoom et déplacement */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary" size="icon" onClick={() => handleZoom("in")}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zoom avant</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary" size="icon" onClick={() => handleZoom("out")}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zoom arrière</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={moveMode ? "default" : "secondary"}
                      size="icon"
                      onClick={() => {
                        setMoveMode(!moveMode)
                        if (!moveMode) {
                          // Désactiver les autres modes
                          setCurrentTool(null)
                          setSelectedElement(null)
                        }
                      }}
                    >
                      <Move className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{moveMode ? "Mode déplacement actif" : "Activer le mode déplacement"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={snapToGrid ? "default" : "secondary"}
                      size="icon"
                      onClick={() => setSnapToGrid(!snapToGrid)}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Aligner sur la grille</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary" size="icon" onClick={centerView}>
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Centrer la vue</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary" size="icon" onClick={() => setSidebarVisible(!sidebarVisible)}>
                      <PanelLeft className={`h-4 w-4 ${!sidebarVisible ? "rotate-180" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{sidebarVisible ? "Masquer le panneau latéral" : "Afficher le panneau latéral"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Grille et éléments */}
            {viewMode === "2d" ? (
              <div
                ref={canvasRef}
                className={`w-full h-full relative ${moveMode ? "cursor-move" : "cursor-crosshair"}`}
                style={{
                  backgroundImage:
                    "linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)",
                  backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
                  transform: `scale(${zoom})`,
                  transformOrigin: "0 0",
                  width: "200%",
                  height: "200%",
                }}
                onClick={handleCanvasClick}
                onMouseDown={handleCanvasDragStart}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <div
                  style={{
                    transform: `translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                  }}
                >
                  {renderElements()}
                  {renderGhostElement()}
                </div>
              </div>
            ) : (
              <div ref={threeContainerRef} className="w-full h-full" />
            )}
          </div>
        </div>
      </div>

      {/* Save Floor Plan Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sauvegarder le plan d'étage</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan-name" className="text-right">
                Nom
              </Label>
              <Input
                id="plan-name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="col-span-3"
                placeholder="Entrez le nom du plan d'étage"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveFloorPlan}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
