"use client"

import { useState, useCallback, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { PlacedFurniture, Magasin, FloorPlan, MatchedPlanElement } from "@/types/store-display"

export const useStoreDisplay = () => {
  const { toast } = useToast()
  const [magasins, setMagasins] = useState<Magasin[]>([])
  const [selectedMagasin, setSelectedMagasin] = useState<string>("all")
  const [placedFurniture, setPlacedFurniture] = useState<PlacedFurniture[]>([])
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null)
  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null)
  const [matchedPlanElements, setMatchedPlanElements] = useState<Record<string, MatchedPlanElement>>({})

  // UI State
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(300)
  const [sceneScale, setSceneScale] = useState(1.0)

  // Visual settings
  const [lightIntensity, setLightIntensity] = useState(0.7)
  const [environmentPreset, setEnvironmentPreset] = useState("warehouse")
  const [showShadows, setShowShadows] = useState(true)
  const [showFloorPlan, setShowFloorPlan] = useState(true)
  const [floorPlanOpacity, setFloorPlanOpacity] = useState(0.5)

  // Add these states after the existing ones
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([])
  const [showFloorPlanSelector, setShowFloorPlanSelector] = useState(false)
  const [showNameMatchDialog, setShowNameMatchDialog] = useState(false)
  const [matchingElements, setMatchingElements] = useState<any[]>([])
  const [pendingFurnitureId, setPendingFurnitureId] = useState<string | null>(null)
  const [showManualMatchDialog, setShowManualMatchDialog] = useState(false)
  const [currentFurnitureToMatch, setCurrentFurnitureToMatch] = useState<any>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

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

  const handleUpdateFurniture = useCallback((updatedFurniture: PlacedFurniture) => {
    setPlacedFurniture((prev) =>
      prev.map((item) => (item.id === updatedFurniture.id ? { ...item, ...updatedFurniture } : item)),
    )
  }, [])

  const handleRemoveFurniture = useCallback(
    (id: string) => {
      setPlacedFurniture((prev) => prev.filter((item) => item.id !== id))
      if (selectedFurnitureId === id) {
        setSelectedFurnitureId(null)
      }
    },
    [selectedFurnitureId],
  )

  const toggleSidebar = useCallback(() => {
    setIsSidebarVisible((prev) => !prev)
  }, [])

  // Load floor plans from localStorage on mount
  useEffect(() => {
    try {
      const plansJSON = localStorage.getItem("store-floor-plans")
      if (plansJSON) {
        const plans = JSON.parse(plansJSON)
        if (Array.isArray(plans)) {
          setFloorPlans(plans)
        }

        // Load active floor plan if exists
        const activeId = localStorage.getItem("active-floor-plan")
        if (activeId) {
          const activePlan = plans.find((plan: FloorPlan) => plan.id === activeId)
          if (activePlan) {
            setFloorPlan(activePlan)
          }
        }
      }
    } catch (error) {
      console.error("Error loading floor plans:", error)
    }
  }, [])

  const handleSelectFloorPlan = useCallback(
    (plan: FloorPlan) => {
      setFloorPlan(plan)
      setShowFloorPlanSelector(false)
      setPlacedFurniture([])
      setSelectedFurnitureId(null)
      setMatchedPlanElements({})

      // Save active floor plan
      localStorage.setItem("active-floor-plan", plan.id)

      toast({
        title: "Plan d'étage chargé",
        description: `Le plan "${plan.name}" a été chargé. Vous pouvez maintenant placer les meubles correspondants.`,
      })
    },
    [toast],
  )

  return {
    // State
    magasins,
    selectedMagasin,
    setSelectedMagasin,
    placedFurniture,
    setPlacedFurniture,
    selectedFurnitureId,
    setSelectedFurnitureId,
    floorPlan,
    setFloorPlan,
    matchedPlanElements,
    setMatchedPlanElements,

    // UI State
    isSidebarVisible,
    sidebarWidth,
    setSidebarWidth,
    sceneScale,
    setSceneScale,

    // Visual settings
    lightIntensity,
    setLightIntensity,
    environmentPreset,
    setEnvironmentPreset,
    showShadows,
    setShowShadows,
    showFloorPlan,
    setShowFloorPlan,
    floorPlanOpacity,
    setFloorPlanOpacity,

    // Floor plan states
    floorPlans,
    setFloorPlans,
    showFloorPlanSelector,
    setShowFloorPlanSelector,
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

    // Actions
    fetchMagasins,
    handleUpdateFurniture,
    handleRemoveFurniture,
    toggleSidebar,
    toast,
    handleSelectFloorPlan,
  }
}
