"use client"

import { useEffect, useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { jsPDF } from "jspdf"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Plus,
  RotateCw,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
  Map,
  AlertCircle,
  Info,
  Save,
  Download,
  ImageIcon,
  FileText,
  Trash2,
  Menu,
  GripVertical,
} from "lucide-react"
import "@/components/multilingue/i18n.js"
import { useTranslation } from "react-i18next"

// Import our decomposed components and hooks
import { useStoreEditor } from "@/hooks/use-store-editor"
import { FloorPlanSelector } from "@/components/editor2D/store-display/dialogs/floor-plan-selector"
import { ManualMatchDialog } from "@/components/editor2D/store-display/dialogs/manual-match-dialog"
import { FurnitureControls } from "@/components/editor2D/store-display/controls/furniture-controls"
import { ZoomControls } from "@/components/editor2D/store-display/controls/zoom-controls"
import { VisualizationSettings } from "@/components/editor2D/store-display/controls/visualization-settings"
import { getFloorPlanFurnitureNames, getAutoPlacementCoordinates, isFurnitureInPlan } from "@/lib/utils1"
import { FURNITURE_ELEMENT_TYPES } from "@/lib/constants"
import { useProductStore } from "@/lib/product-store"
import { useFurnitureStore } from "@/lib/furniture-store"

// Import the remaining components that need to be created
import { StoreDisplayArea } from "@/components/editor2D/store-display/3d/store-display-area"
import { DraggableFurnitureItem } from "@/components/editor2D/store-display/furniture/draggable-furniture-item"

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
    handleResize() // Call once to set initial values

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return screenSize
}

export function StoreDisplayEditor() {
  const { t, i18n } = useTranslation()
  const screenSize = useScreenSize()

  const { products } = useProductStore()
  const { savedFurniture } = useFurnitureStore()

  const {
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
  } = useStoreEditor()

  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  // Adapter la largeur de la sidebar selon la taille d'écran
  const adaptiveSidebarWidth = screenSize.isMobile
    ? Math.min(screenSize.width * 0.85, 350)
    : screenSize.isTablet
      ? Math.min(screenSize.width * 0.4, 400)
      : sidebarWidth

  // Détecter si on doit utiliser le touch backend pour le drag and drop
  const dndBackend = screenSize.isMobile ? TouchBackend : HTML5Backend
  const dndOptions = screenSize.isMobile ? { enableMouseEvents: true } : {}

  // Auto-hide sidebar on mobile
  useEffect(() => {
    if (screenSize.isMobile && isSidebarVisible) {
      toggleSidebar()
    }
  }, [screenSize.isMobile])

  // Handle manual element selection
  const handleManualElementSelection = (element: any, furnitureId: string) => {
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
      if (furniture) {
        toast({
          title: "Meuble associé",
          description: `Le meuble "${furniture.furniture.name}" a été associé à l'élément "${element.name || element.type}" du plan.`,
        })
      }
    }

    setShowManualMatchDialog(false)
    setCurrentFurnitureToMatch(null)
  }

  // Handle furniture drop
  const handleDropFurniture = (furnitureId: string, x: number, y: number, z: number) => {
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
        x,
        y,
        z,
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
      const newPlacedFurniture = {
        id: `placed-${Date.now()}`,
        savedFurnitureId: furnitureId,
        savedFurniture: furniture,
        x,
        y,
        z,
        rotation: 0,
      }
      setPlacedFurniture((prev) => [...prev, newPlacedFurniture])
      setSelectedFurnitureId(newPlacedFurniture.id)
      toast({
        title: "Meuble placé",
        description: `Le meuble "${furniture.furniture.name}" a été placé dans le magasin.`,
      })
    }
  }

  // Handle manual placement
  const handleManualPlacement = (furnitureId: string, showMatchDialog = false, cancelMatch = false) => {
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

    // For placement
    const matchedElement = Object.values(matchedPlanElements).find((match) => match.furnitureId === furnitureId)
    if (!matchedElement) {
      toast({
        title: "Association requise",
        description: "Veuillez d'abord associer ce meuble à un élément du plan avec le bouton 'Matcher'.",
        variant: "destructive",
      })
      return
    }

    const element = floorPlan?.elements.find(
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

    const coords = getAutoPlacementCoordinates(element, 20, 20)

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

  // Handle rename furniture
  const handleRenameFurniture = (id: string, newName: string) => {
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
      description: `Le meuble a été renommé en "${newName}".`,
    })
  }

  // Handle auto placement
  const handleAutoPlacement = () => {
    if (!floorPlan) {
      toast({
        title: "Aucun plan chargé",
        description: "Veuillez d'abord charger un plan d'étage.",
        variant: "destructive",
      })
      return
    }

    const furnitureElements = floorPlan.elements.filter((element) => FURNITURE_ELEMENT_TYPES.includes(element.type))

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
        const coords = getAutoPlacementCoordinates(element, 20, 20, floorPlan)
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

  // Handle capture complete
  const handleCaptureComplete = (dataURL: string | null) => {
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
          item.savedFurniture.products.forEach((product: any, prodIndex: number) => {
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

  // Export functions
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

  const saveStoreLayout = () => {
    toast({
      title: "Agencement sauvegardé",
      description: "L'agencement de la boutique a été sauvegardé avec succès.",
    })
  }

  // Handle element selection from dialog
  const handleElementSelection = (element: any) => {
    const furniture = savedFurniture.find((f) => f.furniture.id === pendingFurnitureId)
    if (furniture && element) {
      const coords = getAutoPlacementCoordinates(element, 20, 20, floorPlan)
      const newPlacedFurniture = {
        id: `placed-${Date.now()}`,
        savedFurnitureId: pendingFurnitureId!,
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

  // Setup event listeners for resizing (desktop only)
  useEffect(() => {
    if (screenSize.isMobile) return

    const handleMouseMove = (e: MouseEvent) => {
      if (resizingRef.current) {
        const newWidth = isRTL ? window.innerWidth - e.clientX : e.clientX
        if (newWidth > 250 && newWidth < Math.min(800, window.innerWidth * 0.6)) {
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
  }, [isRTL, setSidebarWidth, screenSize.isMobile])

  // Close export menu when clicking outside
  useEffect(() => {
    if (showExportMenu) {
      const handleClickOutside = (event: MouseEvent) => {
        if ((event.target as Element).closest("[data-export-menu]") === null) {
          setShowExportMenu(false)
        }
      }
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [showExportMenu])

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (showMobileMenu) {
      const handleClickOutside = (event: MouseEvent) => {
        if ((event.target as Element).closest("[data-mobile-menu]") === null) {
          setShowMobileMenu(false)
        }
      }
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [showMobileMenu])

  // Reset export state if error occurs
  useEffect(() => {
    if (isExporting) {
      const timer = setTimeout(() => {
        if (isExporting) {
          setIsExporting(false)
          setTriggerCapture(false)
          setExportType(null)
          console.log("Réinitialisation de l'état d'exportation après délai")
        }
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [isExporting])

  // Sidebar content component
  const SidebarContent = () => (
    <Tabs defaultValue="library" className="flex flex-col h-full">
      {/* Tab headers - Fixed height */}
      <div className="px-2 sm:px-4 pt-2 sm:pt-4 border-b flex-shrink-0">
        <TabsList
          className={`w-full grid gap-1 mb-2 sm:mb-4 ${screenSize.isMobile ? "grid-cols-2 text-xs" : "grid-cols-2 lg:grid-cols-3 text-xs sm:text-sm"}`}
        >
          <TabsTrigger value="library" className="text-xs sm:text-sm">
            {screenSize.isMobile ? "Lib" : t("productImport.library")}
          </TabsTrigger>
          <TabsTrigger value="placed" className="text-xs sm:text-sm">
            {screenSize.isMobile ? "Placés" : t("productImport.floorPlan.placed")}
          </TabsTrigger>
          {!screenSize.isMobile && (
            <TabsTrigger value="structural" className="text-xs sm:text-sm lg:hidden xl:block">
              {t("productImport.floorPlan.structural")}
            </TabsTrigger>
          )}
          {selectedFurniture && (
            <TabsTrigger value="edit" className="text-xs sm:text-sm">
              {screenSize.isMobile ? "Edit" : t("productImport.edit")}
            </TabsTrigger>
          )}
          <TabsTrigger value="visual" className="text-xs sm:text-sm">
            {screenSize.isMobile ? "Visuel" : t("productImport.floorPlan.visuel")}
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Tab content - Modifié avec une meilleure gestion de la hauteur */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* Library Tab */}
        <TabsContent value="library" className="h-full m-0">
          <div className="h-full flex flex-col">
            {/* Fixed header section */}
            <div className="p-2 sm:p-4 border-b flex-shrink-0">
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

              <Button asChild className="w-full mt-4">
                <a href="/furniture-editor">
                  <Plus className="h-4 w-4 mr-2" />
                  {screenSize.isMobile ? "Créer" : t("productImport.floorPlan.creerMeuble")}
                </a>
              </Button>

              {floorPlan && (
                <div className="text-sm text-muted-foreground mt-4 p-2 bg-muted rounded-md">
                  <Info className="h-4 w-4 inline-block mr-1" />
                  {t("productImport.floorPlan.notice")}
                </div>
              )}
            </div>

            {/* Scrollable content */}
            <ScrollArea className="flex-1 min-h-0 px-2 sm:px-4">
              <div className="flex flex-col gap-3 py-4">
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
                  isMobile={screenSize.isMobile}
                />

                <div className="border-t my-2"></div>

                {savedFurniture
                  .filter((furniture) => selectedMagasin === "all" || furniture.storeId === selectedMagasin)
                  .filter((furniture) => furniture.furniture && furniture.furniture.name)
                  .map((furniture) => {
                    const isInPlan = isFurnitureInPlan(furniture, floorPlan)
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
                        isMobile={screenSize.isMobile}
                      />
                    )
                  })}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* Placed Tab */}
        <TabsContent value="placed" className="h-full m-0">
          <div className="h-full flex flex-col">
            <ScrollArea className="flex-1 min-h-0 px-2 sm:px-4">
              <div className="space-y-2 py-4">
                {placedFurniture.length > 0 ? (
                  placedFurniture.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedFurnitureId === item.id ? "border-primary bg-primary/5" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedFurnitureId(item.id)}
                    >
                      <div className="flex-1 truncate">
                        <div className="font-medium text-sm">
                          {item.savedFurniture?.furniture?.name || t("furniture.unknown")}
                        </div>
                        <div className="text-xs text-muted-foreground">{item.savedFurniture?.furniture?.type}</div>
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
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-sm">
                      {floorPlan
                        ? t("productImport.floorPlan.dragFromLibrary")
                        : t("productImport.floorPlan.loadFirst")}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            {floorPlan && (
              <div className="p-2 sm:p-4 border-t flex-shrink-0">
                <Button variant="outline" className="w-full bg-transparent" onClick={handleAutoPlacement}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {screenSize.isMobile ? "Auto" : t("productImport.placementAuto")}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Edit Tab */}
        {selectedFurniture && (
          <TabsContent value="edit" className="h-full m-0">
            <ScrollArea className="h-full px-2 sm:px-4 py-4">
              <FurnitureControls
                selectedFurniture={selectedFurniture}
                onUpdate={handleUpdateFurniture}
                onDelete={() => handleRemoveFurniture(selectedFurniture.id)}
                isMobile={screenSize.isMobile}
              />
            </ScrollArea>
          </TabsContent>
        )}

        {/* Visual Tab */}
        <TabsContent value="visual" className="h-full m-0">
          <ScrollArea className="h-full px-2 sm:px-4 py-4">
            <VisualizationSettings
              lightIntensity={lightIntensity}
              setLightIntensity={setLightIntensity}
              environmentPreset={environmentPreset}
              setEnvironmentPreset={setEnvironmentPreset}
              showShadows={showShadows}
              setShowShadows={setShowShadows}
              isMobile={screenSize.isMobile}
            />
          </ScrollArea>
        </TabsContent>

        {/* Structural Tab */}
        <TabsContent value="structural" className="h-full m-0">
          <ScrollArea className="h-full px-2 sm:px-4 py-4">
            <div className="space-y-4">
              <h3 className="font-medium">{t("productImport.floorPlan.structuralElements")}</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center bg-transparent"
                  onClick={() => handleAddWall(0, 0)}
                >
                  <div className="w-12 h-6 bg-gray-400 rounded-sm mb-2"></div>
                  <span className="text-xs">{t("productImport.floorPlan.wall")}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center bg-transparent"
                  onClick={() => handleAddWindow(0, 0)}
                >
                  <div className="w-12 h-6 bg-blue-200 border-2 border-gray-400 rounded-sm mb-2"></div>
                  <span className="text-xs">{t("productImport.floorPlan.window")}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center bg-transparent"
                  onClick={() => handleAddDoor(0, 0)}
                >
                  <div className="w-12 h-6 bg-brown-400 border-2 border-gray-400 rounded-sm mb-2"></div>
                  <span className="text-xs">{t("productImport.floorPlan.door")}</span>
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>{t("productImport.floorPlan.conseil")}</p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </div>
    </Tabs>
  )

  return (
    <div className="h-screen bg-gray-50 mt-14 flex flex-col" dir={textDirection}>
      <DndProvider backend={dndBackend} options={dndOptions}>
        {/* Header responsive avec toolbar groupée */}
        <div className="bg-white border-b shadow-sm flex-shrink-0">
          <div className="px-2 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-12 sm:h-16">
              <div className="flex items-center space-x-1 sm:space-x-4">
                {/* Mobile: Sheet trigger, Desktop: Sidebar toggle */}
                {screenSize.isMobile ? (
                  <Sheet open={showMobileSidebar} onOpenChange={setShowMobileSidebar}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                        <PanelLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] sm:w-[400px] p-0">
                      <SheetHeader className="px-4 py-3 border-b">
                        <SheetTitle className="text-left">Outils</SheetTitle>
                      </SheetHeader>
                      <div className="h-[calc(100vh-80px)]">
                        <SidebarContent />
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    title={isSidebarVisible ? "Masquer le panneau latéral" : "Afficher le panneau latéral"}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  >
                    {isSidebarVisible ? (
                      <PanelLeftClose className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <PanelLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </Button>
                )}
                <h1 className="text-sm sm:text-lg lg:text-2xl font-bold truncate">
                  {screenSize.isMobile ? "Store Editor" : t("productImport.storeLayoutEditor")}
                </h1>
              </div>

              {/* Actions responsive - Version desktop */}
              <div className="hidden lg:flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  onClick={() => (window.location.href = "/Editor")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("productImport.backToEditor")}
                </Button>

                <Button variant="outline" size="sm" onClick={() => setShowFloorPlanSelector(true)}>
                  <Map className="h-4 w-4 mr-2" />
                  {floorPlan ? t("productImport.change") : t("productImport.load")}
                </Button>

                {floorPlan && (
                  <Button variant="outline" size="sm" className="bg-transparent" onClick={handleAutoPlacement}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("productImport.placementAuto")}
                  </Button>
                )}

                <div className="relative" data-export-menu>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isExporting}
                    onClick={() => setShowExportMenu(!showExportMenu)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t("productImport.export")}
                  </Button>
                  {showExportMenu && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[9999]"
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

                <Button size="sm" onClick={saveStoreLayout}>
                  <Save className="h-4 w-4 mr-2" />
                  {t("productImport.save")}
                </Button>
              </div>

              {/* Actions responsive - Version mobile/tablette avec menu groupé */}
              <div className="flex lg:hidden items-center space-x-1 sm:space-x-2">
                {/* Bouton principal toujours visible */}
                <Button
                  variant="outline"
                  size={screenSize.isMobile ? "sm" : "sm"}
                  onClick={() => setShowFloorPlanSelector(true)}
                >
                  <Map className="h-4 w-4" />
                  {!screenSize.isMobile && <span className="ml-2">Plan</span>}
                </Button>

                {/* Menu groupé pour les autres actions */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size={screenSize.isMobile ? "sm" : "sm"}
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="bg-transparent"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>

                  {showMobileMenu && (
                    <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[9999]">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <button
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-b"
                          onClick={() => {
                            setShowMobileMenu(false)
                            window.location.href = "/Editor"
                          }}
                        >
                          <ArrowLeft className="h-4 w-4 mr-3" />
                          {t("productImport.backToEditor")}
                        </button>

                        {floorPlan && (
                          <button
                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-b"
                            onClick={() => {
                              setShowMobileMenu(false)
                              handleAutoPlacement()
                            }}
                          >
                            <ArrowLeft className="h-4 w-4 mr-3" />
                            {t("productImport.placementAuto")}
                          </button>
                        )}

                        <button
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-b"
                          onClick={() => {
                            setShowMobileMenu(false)
                            exportAsImage()
                          }}
                          disabled={isExporting}
                        >
                          <ImageIcon className="h-4 w-4 mr-3" />
                          {t("productImport.exportAsImage")}
                        </button>

                        <button
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-b"
                          onClick={() => {
                            setShowMobileMenu(false)
                            exportAsPDF()
                          }}
                          disabled={isExporting}
                        >
                          <FileText className="h-4 w-4 mr-3" />
                          {t("productImport.exportAsPDF")}
                        </button>

                        <button
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setShowMobileMenu(false)
                            saveStoreLayout()
                          }}
                        >
                          <Save className="h-4 w-4 mr-3" />
                          {t("productImport.save")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts - Responsive */}
        <div className="px-2 sm:px-4 lg:px-8 py-2 sm:py-4 space-y-2 sm:space-y-4 flex-shrink-0">
          {!floorPlan && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm sm:text-base">{t("productImport.floorPlan.required")}</AlertTitle>
              <AlertDescription className="text-xs sm:text-sm">
                {t("productImport.floorPlan.loadPrompt")}
              </AlertDescription>
            </Alert>
          )}

          {floorPlan && (
            <Alert variant="info">
              <Info className="h-4 w-4" />
              <AlertTitle className="text-sm sm:text-base">
                {t("productImport.floorPlan.loadedLabel")} {floorPlan.name} ({floorPlan.elements?.length || 0} éléments)
              </AlertTitle>
              <AlertDescription className="text-xs sm:text-sm">
                {t("productImport.floorPlan.validFurnitureOnly")}
                {getFloorPlanFurnitureNames(floorPlan).length > 0 ? (
                  <span>
                    {" "}
                    {t("productImport.floorPlan.availableFurniture")} {getFloorPlanFurnitureNames(floorPlan).join(", ")}
                  </span>
                ) : (
                  <span> {t("productImport.floorPlan.noNamedFurniture")}</span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {showFloorPlan && floorPlan && (
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-2 sm:p-4 bg-white rounded-lg border">
              <Label htmlFor="floor-plan-opacity" className="text-sm font-medium">
                {t("productImport.floorPlan.opacity")}
              </Label>
              <div className="flex items-center space-x-2 flex-1 max-w-xs">
                <Slider
                  id="floor-plan-opacity"
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={[floorPlanOpacity]}
                  onValueChange={(value) => setFloorPlanOpacity(value[0])}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-right">{Math.round(floorPlanOpacity * 100)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Main content - CRUCIAL: This needs flex-1 and min-h-0 to work properly */}
        <div className="flex flex-1 min-h-0">
          {/* Desktop Sidebar - CRUCIAL: Height constraint is key here */}
          {!screenSize.isMobile && isSidebarVisible && (
            <div
              ref={sidebarRef}
              className="relative bg-white border-r shadow-sm flex flex-col min-h-0"
              style={{ width: `${adaptiveSidebarWidth}px`, minWidth: `${adaptiveSidebarWidth}px` }}
            >
              <SidebarContent />

              {/* Resize handle - Desktop only */}
              {!screenSize.isMobile && (
                <div
                  className={`absolute top-0 ${
                    isRTL ? "left-0" : "right-0"
                  } h-full w-2 cursor-ew-resize flex items-center justify-center hover:bg-gray-200 transition-colors group`}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    resizingRef.current = true
                    document.body.style.cursor = "ew-resize"
                    document.body.style.userSelect = "none"
                  }}
                >
                  <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </div>
              )}
            </div>
          )}

          {/* Main 3D Area - Responsive */}
          <div className="flex-1 bg-white min-h-0">
            <div className="h-full p-2 sm:p-4 lg:p-6 flex flex-col">
              <div className="flex items-center justify-between mb-2 sm:mb-4 flex-shrink-0">
                <h2 className="text-base sm:text-lg font-medium">{t("productImport.floorPlan.monMagasin")}</h2>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {placedFurniture.length} {screenSize.isMobile ? "meubles" : t("productImport.placedFurniture")}
                </div>
              </div>
              <div className="relative flex-1 min-h-0 rounded-lg overflow-hidden">
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
                  isSidebarVisible={isSidebarVisible}
                  screenSize={screenSize}
                />
                <ZoomControls sceneScale={sceneScale} setSceneScale={setSceneScale} isMobile={screenSize.isMobile} />
              </div>
            </div>
          </div>
        </div>

        <FloorPlanSelector
          open={showFloorPlanSelector}
          onOpenChange={setShowFloorPlanSelector}
          onSelectPlan={handleSelectFloorPlan}
          floorPlans={floorPlans}
          isMobile={screenSize.isMobile}
        />

        {/* Dialog for selecting which matching element to use */}
        <Dialog open={showNameMatchDialog} onOpenChange={setShowNameMatchDialog}>
          <DialogContent
            className={`${screenSize.isMobile ? "w-[95vw] max-w-[95vw]" : "sm:max-w-[500px]"}`}
            dir={textDirection}
          >
            <DialogHeader>
              <DialogTitle className="text-sm sm:text-base">{t("productImport.floorPlan.correspendance")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p className="text-xs sm:text-sm text-muted-foreground">{t("productImport.floorPlan.multipleMatches")}</p>
              <div className="grid gap-2">
                {matchingElements.map((element: any) => (
                  <div
                    key={element.id}
                    className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted"
                    onClick={() => handleElementSelection(element)}
                  >
                    <div>
                      <div className="font-medium text-sm">{element.name || element.type}</div>
                      <div className="text-xs text-muted-foreground">
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

        {/* Manual match dialog */}
        {currentFurnitureToMatch && (
          <ManualMatchDialog
            open={showManualMatchDialog}
            onOpenChange={setShowManualMatchDialog}
            furnitureId={currentFurnitureToMatch.id}
            furnitureName={currentFurnitureToMatch.name}
            floorPlan={floorPlan}
            onSelectElement={handleManualElementSelection}
            isMobile={screenSize.isMobile}
          />
        )}
      </DndProvider>
    </div>
  )
}
