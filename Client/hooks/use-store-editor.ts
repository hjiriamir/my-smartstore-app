"use client"

import { useState, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import type { PlacedFurniture, FloorPlan, Magasin, MatchedPlanElement, CurrentFurnitureToMatch } from "@/lib/types1"
import { useProductStore } from "@/lib/product-store"
import { useFurnitureStore } from "@/lib/furniture-store"

export const useStoreEditor = () => {
  // State management
  const [magasins] = useState<Magasin[]>([
    { magasin_id: "1", nom_magasin: "Magasin Principal" },
    { magasin_id: "2", nom_magasin: "Magasin Secondaire" },
  ])

  const [selectedMagasin, setSelectedMagasin] = useState("all")
  const [placedFurniture, setPlacedFurniture] = useState<PlacedFurniture[]>([])
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [triggerCapture, setTriggerCapture] = useState(false)
  const [exportType, setExportType] = useState<string | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // UI State - Updated default sidebar width and constraints
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [sceneScale, setSceneScale] = useState(1)
  const [sidebarWidth, setSidebarWidth] = useState(400) // Increased default width
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Floor plan state
  const loadFloorPlansFromStorage = () => {
    try {
      const plansJSON = localStorage.getItem("store-floor-plans")
      if (plansJSON) {
        const plans = JSON.parse(plansJSON)
        return plans.map((plan: any) => ({
          ...plan,
          updatedAt: plan.updatedAt || Date.now(),
          elements: plan.elements || [],
        }))
      }
      return []
    } catch (error) {
      console.error("Error loading floor plans:", error)
      return []
    }
  }

  const [floorPlans] = useState<FloorPlan[]>(loadFloorPlansFromStorage())

  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null)
  const [showFloorPlanSelector, setShowFloorPlanSelector] = useState(false)
  const [showFloorPlan, setShowFloorPlan] = useState(true)
  const [floorPlanOpacity, setFloorPlanOpacity] = useState(0.7)
  const [showNameMatchDialog, setShowNameMatchDialog] = useState(false)
  const [matchingElements, setMatchingElements] = useState<any[]>([])
  const [pendingFurnitureId, setPendingFurnitureId] = useState<string | null>(null)
  const [showManualMatchDialog, setShowManualMatchDialog] = useState(false)
  const [currentFurnitureToMatch, setCurrentFurnitureToMatch] = useState<CurrentFurnitureToMatch | null>(null)
  const [matchedPlanElements, setMatchedPlanElements] = useState<Record<string, MatchedPlanElement>>({})

  // Visual settings
  const [lightIntensity, setLightIntensity] = useState(1.0)
  const [environmentPreset, setEnvironmentPreset] = useState("sunset")
  const [showShadows, setShowShadows] = useState(true)

  // Refs
  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizingRef = useRef(false)

  // Mock data
  const { savedFurniture } = useFurnitureStore()
  const { products } = useProductStore()
  const [cashierFurniture] = useState({
    furniture: {
      id: "fixed-cashier",
      name: "Caisse",
      type: "cashier",
      width: 1.2,
      height: 1.0,
      depth: 0.8,
    },
    products: [],
    storeId: "all",
  })

  const { toast } = useToast()

  // Computed values
  const selectedFurniture = placedFurniture.find((item) => item.id === selectedFurnitureId)

  // Handlers
  const handleAddWall = (x: number, z: number) => {
    const newWall = {
      id: `wall-${Date.now()}`,
      savedFurnitureId: `wall-${Date.now()}`,
      savedFurniture: null,
      type: "wall",
      x,
      y: 0,
      z,
      rotation: 0,
      width: 5,
      height: 3,
      depth: 0.2,
    }
    setPlacedFurniture((prev) => [...prev, newWall])
    setSelectedFurnitureId(newWall.id)
  }

  const handleAddDoor = (x: number, z: number) => {
    const newDoor = {
      id: `door-${Date.now()}`,
      savedFurnitureId: `door-${Date.now()}`,
      savedFurniture: null,
      type: "door",
      x,
      y: 0,
      z,
      rotation: 0,
      width: 1,
      height: 2,
      depth: 0.1,
    }
    setPlacedFurniture((prev) => [...prev, newDoor])
    setSelectedFurnitureId(newDoor.id)
  }

  const handleAddWindow = (x: number, z: number) => {
    const newWindow = {
      id: `window-${Date.now()}`,
      savedFurnitureId: `window-${Date.now()}`,
      savedFurniture: null,
      type: "window",
      x,
      y: 1,
      z,
      rotation: 0,
      width: 2,
      height: 1.5,
      depth: 0.1,
    }
    setPlacedFurniture((prev) => [...prev, newWindow])
    setSelectedFurnitureId(newWindow.id)
  }

  const handleRemoveFurniture = (id: string) => {
    setPlacedFurniture((prev) => prev.filter((item) => item.id !== id))
    if (selectedFurnitureId === id) {
      setSelectedFurnitureId(null)
    }
  }

  const handleUpdateFurniture = (updatedFurniture: PlacedFurniture) => {
    setPlacedFurniture((prev) => prev.map((item) => (item.id === updatedFurniture.id ? updatedFurniture : item)))
  }

  const handleSelectFloorPlan = (plan: FloorPlan) => {
    setFloorPlan(plan)
    setShowFloorPlan(true)
    setShowFloorPlanSelector(false)
    toast({
      title: "Plan d'étage chargé",
      description: `Le plan "${plan.name}" a été chargé avec succès.`,
    })
  }

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible)
  }

  // Fonction pour calculer les coordonnées de placement automatique
  const getAutoPlacementCoordinates = (element: any, roomWidth: number, roomDepth: number) => {
    // Convertir les coordonnées pixel en mètres (en supposant 100 pixels = 1 mètre)
    const xPos = element.x / 100 - roomWidth / 4
    const zPos = element.y / 100 - roomDepth / 4
    const width = element.width / 100
    const depth = element.height / 100

    // Calculer la position centrale de l'élément
    const x = xPos + width / 2
    const z = zPos + depth / 2

    // Déterminer la rotation basée sur la rotation de l'élément
    const rotation = element.rotation || 0

    return { x, y: 0, z, rotation }
  }

  return {
    // State
    magasins,
    selectedMagasin,
    setSelectedMagasin,
    placedFurniture,
    setPlacedFurniture,
    selectedFurnitureId,
    setSelectedFurnitureId,
    selectedFurniture,
    isExporting,
    setIsExporting,
    triggerCapture,
    setTriggerCapture,
    exportType,
    setExportType,
    showExportMenu,
    setShowExportMenu,

    // UI State
    isSidebarVisible,
    sceneScale,
    setSceneScale,
    sidebarWidth,
    setSidebarWidth,
    showMobileMenu,
    setShowMobileMenu,

    // Floor plan state
    floorPlans,
    floorPlan,
    showFloorPlanSelector,
    setShowFloorPlanSelector,
    showFloorPlan,
    setShowFloorPlan,
    floorPlanOpacity,
    setFloorPlanOpacity,
    showNameMatchDialog,
    setShowNameMatchDialog,
    matchingElements,
    setMatchingElements,
    pendingFurnitureId,
    setPendingFurnitureId,
    showManualMatchDialog,
    setShowManualMatchDialog,
    currentFurnitureToMatch,
    setCurrentFurnitureToMatch,
    matchedPlanElements,
    setMatchedPlanElements,

    // Visual settings
    lightIntensity,
    setLightIntensity,
    environmentPreset,
    setEnvironmentPreset,
    showShadows,
    setShowShadows,

    // Refs
    sidebarRef,
    resizingRef,

    // Data
    products,
    savedFurniture,
    cashierFurniture,

    // Handlers
    handleAddWall,
    handleAddDoor,
    handleAddWindow,
    handleRemoveFurniture,
    handleUpdateFurniture,
    handleSelectFloorPlan,
    toggleSidebar,

    // Utils
    toast,
    getAutoPlacementCoordinates,
  }
}
