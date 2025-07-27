"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Canvas } from "@react-three/fiber"
import "@/components/multilingue/i18n.js"
import { useTranslation } from "react-i18next"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  CuboidIcon as Cube,
  Grid,
  ImageIcon,
  FileText,
  Layers,
  Save,
  Package,
  Menu,
  Eye,
  EyeOff,
} from "lucide-react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useProductStore } from "@/lib/product-store"
import { useFurnitureStore } from "@/lib/furniture-store"
import { Card, CardContent } from "@/components/ui/card"
import { SavePlanogramDialog } from "@/components/save-planogram-dialog"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"

import { ProductSidebar } from "@/components/editor2D/planogram-editor/planogram/ProductSidebar"
import { PlanogramCell } from "@/components/editor2D/planogram-editor/planogram/PlanogramCell"
import { PlanogramScene } from "@/components/editor2D/planogram-editor/3d/PlanogramScene"
import { FurnitureTypes } from "@/lib/furniture"
import { generateFileName, uploadFile } from "@/utils/file-utils"
import type { PlanogramCell as PlanogramCellType, PlanogramConfig } from "@/lib/planogram"
import type { ProductInstance } from "@/lib/product-store"

export function PlanogramEditor() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const router = useRouter()
  const { toast } = useToast()
  const { products, addProductInstance, deleteProductInstance } = useProductStore()
  const { addPlanogramFurniture } = useFurnitureStore()

  const planogram2DRef = useRef<HTMLDivElement>(null)
  const captureSceneRef = useRef<((callback: (dataUrl: string) => void) => void) | null>(null)

  // State
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

  const [cells, setCells] = useState<PlanogramCellType[]>([])
  const [productInstances, setProductInstances] = useState<ProductInstance[]>([])
  const [filesBaseName, setFilesBaseName] = useState(planogramConfig.name || "planogram")
  const [image2DUrl, setImage2DUrl] = useState("")
  const [image3DUrl, setImage3DUrl] = useState("")
  const [pdfUrl, setPdfUrl] = useState("")
  const [isGeneratingFiles, setIsGeneratingFiles] = useState(false)
  const [viewMode, setViewMode] = useState<"2D" | "3D">("2D")
  const [isExporting, setIsExporting] = useState(false)
  const [forceRender, setForceRender] = useState(0)
  const [productSizeScale, setProductSizeScale] = useState(180)
  const [defaultQuantity, setDefaultQuantity] = useState(3)
  const [zoom, setZoom] = useState(100)

  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [mobileToolbarOpen, setMobileToolbarOpen] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarVisible(false)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Initialize planogram cells
  useEffect(() => {
    const newCells: PlanogramCellType[] = []
    if (planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY) {
      const rows = planogramConfig.shelvesConfig?.rows || planogramConfig.rows
      const frontBackColumns = planogramConfig.shelvesConfig?.frontBackColumns || 3
      const leftRightColumns = planogramConfig.shelvesConfig?.leftRightColumns || 1
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
            etagere: rows - y,
            colonne: x + 1,
            face: "left",
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
            etagere: rows - y,
            colonne: x + 1,
            face: "front",
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
            etagere: planogramConfig.rows - y,
            colonne: x + 1,
            face: "back",
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
            etagere: planogramConfig.rows - y,
            colonne: x + 1,
            face: "right",
          })
        }
      }

      if (totalColumns !== planogramConfig.columns) {
        setPlanogramConfig((prev) => ({ ...prev, columns: totalColumns }))
      }
    } else {
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
            etagere: planogramConfig.rows - y,
            colonne: x + 1,
            face:
              planogramConfig.furnitureType === FurnitureTypes.GONDOLA
                ? x < planogramConfig.columns / 2
                  ? "front"
                  : "back"
                : "front",
          })
        }
      }
    }

    setCells((prevCells) => {
      const otherTypeCells = prevCells.filter((cell) => cell.furnitureType !== planogramConfig.furnitureType)
      return [...otherTypeCells, ...newCells]
    })
  }, [
    planogramConfig.rows,
    planogramConfig.columns,
    planogramConfig.furnitureType,
    defaultQuantity,
    planogramConfig.shelvesConfig,
  ])

  // Generate a unique instance ID
  const generateInstanceId = () => {
    return `instance-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }

  // Handle drop on cell
  const handleDrop = (cellId: string, productId: string, draggedInstanceId: string | null, isNewInstance: boolean) => {
    const targetCell = cells.find((c) => c.id === cellId)
    if (!targetCell) return

    if (isNewInstance) {
      const newInstanceId = generateInstanceId()
      const newInstance = {
        instanceId: newInstanceId,
        productId,
        furnitureType: planogramConfig.furnitureType,
      }

      setProductInstances((prev) => [...prev, newInstance])
      addProductInstance(newInstance)

      setCells((prev) =>
        prev.map((cell) =>
          cell.id === cellId ? { ...cell, instanceId: newInstanceId, quantity: defaultQuantity } : cell,
        ),
      )
      setForceRender((prev) => prev + 1)
    } else if (draggedInstanceId) {
      const sourceCell = cells.find((c) => c.instanceId === draggedInstanceId)
      const quantity = sourceCell?.quantity || defaultQuantity

      setCells((prev) =>
        prev.map((cell) => {
          if (cell.id === cellId) {
            return { ...cell, instanceId: draggedInstanceId, quantity }
          } else if (cell.instanceId === draggedInstanceId) {
            return { ...cell, instanceId: null, quantity: defaultQuantity }
          }
          return cell
        }),
      )
      setForceRender((prev) => prev + 1)
    }
  }

  // Handle remove product from cell
  const handleRemoveProduct = (cellId: string) => {
    const cell = cells.find((c) => c.id === cellId)
    if (!cell || !cell.instanceId) return

    setCells((prev) => prev.map((c) => (c.id === cellId ? { ...c, instanceId: null, quantity: defaultQuantity } : c)))

    const isInstanceUsedElsewhere = cells.some((c) => c.id !== cellId && c.instanceId === cell.instanceId)

    if (!isInstanceUsedElsewhere) {
      setProductInstances((prev) => prev.filter((pi) => pi.instanceId !== cell.instanceId))
      deleteProductInstance(cell.instanceId)
    }

    setForceRender((prev) => prev + 1)
  }

  // Handle update quantity
  const handleUpdateQuantity = (cellId: string, quantity: number) => {
    setCells((prev) => prev.map((cell) => (cell.id === cellId ? { ...cell, quantity } : cell)))
    setForceRender((prev) => prev + 1)
  }

  // Toggle display mode
  const toggleDisplayMode = () => {
    setPlanogramConfig((prev) => ({
      ...prev,
      displayMode: prev.displayMode === "compact" ? "spaced" : "compact",
    }))
    setForceRender((prev) => prev + 1)
  }

  // Save planogram to library
  const savePlanogramToLibrary = (
    name: string,
    description: string,
    data: {
      products: any[]
      image2DUrl?: string
      image3DUrl?: string
      pdfUrl?: string
    },
  ) => {
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
      shelvesConfig:
        planogramConfig.furnitureType === "shelves-display"
          ? {
              rows: planogramConfig.shelvesConfig.rows,
              frontBackColumns: planogramConfig.shelvesConfig.frontBackColumns,
              leftRightColumns: planogramConfig.shelvesConfig.leftRightColumns,
            }
          : undefined,
    }

    addPlanogramFurniture(furnitureToSave, data.products, description)

    toast({
      title: t("productImport.planogramSaved"),
      description: t("productImport.planogramSavedDesc", { name }),
    })
  }

  // Save planogram
  const savePlanogram = () => {
    toast({
      title: t("productImport.planogramSaved"),
      description: t("productImport.planogramSavedSuccess", { name: planogramConfig.name }),
    })
  }

  // Export as image
  const exportAsImage = async () => {
    setIsExporting(true)
    try {
      if (viewMode === "2D") {
        const element = planogram2DRef.current
        if (!element) throw new Error("Element not found")

        const canvas = await html2canvas(element, {
          backgroundColor: "#ffffff",
          scale: 2,
        })

        const link = document.createElement("a")
        link.download = `${planogramConfig.name.replace(/\s+/g, "_")}_2D.png`
        link.href = canvas.toDataURL("image/png")
        link.click()

        toast({
          title: t("productImport.exportSuccess"),
          description: t("productImport.exportSuccessDesc2D"),
        })
      } else {
        if (!captureSceneRef.current) throw new Error("3D capture not available")

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
        return
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

  // Export as PDF
  const exportAsPDF = async () => {
    setIsExporting(true)
    try {
      if (viewMode === "2D") {
        const element = planogram2DRef.current
        if (!element) throw new Error("Element not found")

        const canvas = await html2canvas(element, {
          backgroundColor: "#ffffff",
          scale: 2,
        })

        const imgData = canvas.toDataURL("image/png")
        const imgWidth = 210
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
        if (!captureSceneRef.current) throw new Error("3D capture not available")

        captureSceneRef.current((dataUrl) => {
          const pdf = new jsPDF("p", "mm", "a4")
          pdf.text(`${t("productImport.planogram")}: ${planogramConfig.name}`, 10, 10)
          pdf.text(`${t("productImport.view")}: 3D`, 10, 20)
          pdf.text(`${t("productImport.date")}: ${new Date().toLocaleDateString()}`, 10, 30)

          const img = new Image()
          img.src = dataUrl
          img.onload = () => {
            const imgWidth = 210
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
        return
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

  // Calculate effective cell dimensions
  const effectiveCellWidth = (planogramConfig.cellWidth * zoom) / 100
  const effectiveCellHeight = (planogramConfig.cellHeight * zoom) / 100

  // Filter cells for current furniture type
  const currentCells = cells.filter((cell) => cell.furnitureType === planogramConfig.furnitureType)

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="w-full">
      <div className="mt-12">
        <DndProvider backend={HTML5Backend}>
          <div className="container mx-auto py-6 max-w-full">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className={`flex items-center ${isRTL ? "space-x-reverse space-x-4" : "space-x-4"}`}>
                  <Button variant="outline" size="icon" onClick={() => router.back()}>
                    {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                  <h1 className="text-xl lg:text-2xl font-bold">{t("planogramEditor")}</h1>

                  {/* Toggle sidebar button for desktop */}
                  {!isMobile && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSidebarVisible(!sidebarVisible)}
                      className="hidden lg:flex"
                    >
                      {sidebarVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  )}

                  {/* Mobile sidebar trigger */}
                  {isMobile && (
                    <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Menu className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side={isRTL ? "right" : "left"} className="w-80 p-0">
                        <SheetHeader className="px-4 pt-4">
                          <SheetTitle>{t("productImport.productSidebar")}</SheetTitle>
                        </SheetHeader>
                        <div className="p-4">
                          <ProductSidebar
                            products={products}
                            planogramConfig={planogramConfig}
                            setPlanogramConfig={setPlanogramConfig}
                            defaultQuantity={defaultQuantity}
                            setDefaultQuantity={setDefaultQuantity}
                            zoom={zoom}
                            setZoom={setZoom}
                            productSizeScale={productSizeScale}
                            setProductSizeScale={setProductSizeScale}
                            isRTL={isRTL}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}
                </div>

                {/* Mobile toolbar */}
                {isMobile ? (
                  <Sheet open={mobileToolbarOpen} onOpenChange={setMobileToolbarOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Menu className="h-4 w-4 mr-2" />
                        {t("productImport.tools")}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="top" className="h-auto">
                      <SheetHeader>
                        <SheetTitle>{t("productImport.tools")}</SheetTitle>
                      </SheetHeader>
                      <div className="flex flex-col space-y-4 p-4">
                        {/* View mode toggle */}
                        <div className="flex border rounded-md">
                          <Button
                            variant={viewMode === "2D" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("2D")}
                            className="flex-1"
                          >
                            <Grid className="h-4 w-4 mr-2" />
                            {t("productImport.TwoD")}
                          </Button>
                          <Button
                            variant={viewMode === "3D" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("3D")}
                            className="flex-1"
                          >
                            <Cube className="h-4 w-4 mr-2" />
                            {t("productImport.ThreeD")}
                          </Button>
                        </div>

                        <Button variant="outline" size="sm" onClick={toggleDisplayMode}>
                          <Layers className="h-4 w-4 mr-2" />
                          {planogramConfig.displayMode === "compact"
                            ? t("productImport.compactMode")
                            : t("productImport.spacedMode")}
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full bg-transparent">
                              <Download className="h-4 w-4 mr-2" />
                              {t("productImport.export")}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={exportAsImage} disabled={isExporting}>
                              <ImageIcon className="h-4 w-4 mr-2" />
                              {t("productImport.exportAsImage")} ({viewMode})
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={exportAsPDF} disabled={isExporting}>
                              <FileText className="h-4 w-4 mr-2" />
                              {t("productImport.exportAsPDF")} ({viewMode})
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="outline" onClick={() => router.push("/product-library")}>
                          {t("productLibrary")}
                        </Button>

                        <Button onClick={savePlanogram}>
                          <Save className="h-4 w-4 mr-2" />
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
                          <Button variant="outline" className="w-full bg-transparent">
                            <Package className="h-4 w-4 mr-2" />
                            {t("productImport.saveForShop")}
                          </Button>
                        </SavePlanogramDialog>
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : (
                  /* Desktop toolbar */
                  <div className={`flex items-center flex-wrap gap-2 ${isRTL ? "space-x-reverse" : ""}`}>
                    <div className="flex border rounded-md">
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

                    <Button variant="outline" size="sm" onClick={toggleDisplayMode}>
                      <Layers className="h-4 w-4 mr-2" />
                      {planogramConfig.displayMode === "compact"
                        ? t("productImport.compactMode")
                        : t("productImport.spacedMode")}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          {t("productImport.export")}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isRTL ? "end" : "start"}>
                        <DropdownMenuItem onClick={exportAsImage} disabled={isExporting}>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          {t("productImport.exportAsImage")} ({viewMode})
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={exportAsPDF} disabled={isExporting}>
                          <FileText className="h-4 w-4 mr-2" />
                          {t("productImport.exportAsPDF")} ({viewMode})
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" onClick={() => router.push("/product-library")}>
                      {t("productLibrary")}
                    </Button>

                    <Button onClick={savePlanogram}>
                      <Save className="h-4 w-4 mr-2" />
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
                        <Package className="h-4 w-4 mr-2" />
                        {t("productImport.saveForShop")}
                      </Button>
                    </SavePlanogramDialog>
                  </div>
                )}
              </div>

              <div
                className={`grid gap-6 ${
                  isMobile ? "grid-cols-1" : sidebarVisible ? "grid-cols-1 lg:grid-cols-4" : "grid-cols-1"
                }`}
              >
                {/* Sidebar - Desktop only when visible */}
                {!isMobile && sidebarVisible && (
                  <div className={`lg:col-span-1 ${isRTL ? "order-last" : "order-first"}`}>
                    <ProductSidebar
                      products={products}
                      planogramConfig={planogramConfig}
                      setPlanogramConfig={setPlanogramConfig}
                      defaultQuantity={defaultQuantity}
                      setDefaultQuantity={setDefaultQuantity}
                      zoom={zoom}
                      setZoom={setZoom}
                      productSizeScale={productSizeScale}
                      setProductSizeScale={setProductSizeScale}
                      isRTL={isRTL}
                    />
                  </div>
                )}

                {/* Main planogram area */}
                <div
                  className={`${
                    isMobile ? "col-span-1" : sidebarVisible ? "lg:col-span-3" : "col-span-1"
                  } ${isRTL ? "order-first" : "order-last"} w-full`}
                >
                  <Card className="w-full">
                    <CardContent className="p-3 lg:p-6 w-full">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base lg:text-lg font-medium">{planogramConfig.name}</h2>
                        <div className="text-xs lg:text-sm text-muted-foreground">
                          {planogramConfig.rows} {t("ranger")} × {planogramConfig.columns} {t("colone")}
                        </div>
                      </div>

                      {viewMode === "2D" ? (
                        <div className="planogram-2d-container overflow-auto border rounded-md p-2 lg:p-4 bg-muted/20 w-full">
                          <div className="flex justify-center w-full">
                            <div
                              ref={planogram2DRef}
                              className="relative bg-white"
                              style={{
                                width: `${effectiveCellWidth * planogramConfig.columns + 2}px`,
                                minHeight: `${effectiveCellHeight * planogramConfig.rows + 2}px`,
                                direction: "ltr",
                                maxWidth: "100%",
                              }}
                            >
                              {/* Row numbers */}
                              <div
                                className={`absolute ${isRTL ? "left-full pl-2" : "right-full pr-2"} top-0 bottom-0`}
                              >
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
                                  direction: "ltr",
                                }}
                              >
                                {currentCells.map((cell) => (
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

                              {/* Gondola separator indicator */}
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

                              {/* Shelves display separators */}
                              {viewMode === "2D" &&
                                planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY && (
                                  <>
                                    {(() => {
                                      const leftRightColumns = planogramConfig.shelvesConfig?.leftRightColumns || 1
                                      const frontBackColumns = planogramConfig.shelvesConfig?.frontBackColumns || 3

                                      const leftFrontPosition = leftRightColumns * effectiveCellWidth
                                      const frontBackPosition =
                                        (leftRightColumns + frontBackColumns) * effectiveCellWidth
                                      const backRightPosition =
                                        (leftRightColumns + frontBackColumns * 2) * effectiveCellWidth

                                      return (
                                        <>
                                          <div
                                            className="absolute top-0 bottom-0 border-r-2 border-dashed border-primary/50 z-10 pointer-events-none"
                                            style={{ left: `${leftFrontPosition}px` }}
                                          >
                                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-md text-xs font-medium text-primary border border-primary/50">
                                              {t("productImport.leftFront")}
                                            </div>
                                          </div>
                                          <div
                                            className="absolute top-0 bottom-0 border-r-2 border-dashed border-primary/50 z-10 pointer-events-none"
                                            style={{ left: `${frontBackPosition}px` }}
                                          >
                                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-md text-xs font-medium text-primary border border-primary/50">
                                              {t("productImport.frontBack")}
                                            </div>
                                          </div>
                                          <div
                                            className="absolute top-0 bottom-0 border-r-2 border-dashed border-primary/50 z-10 pointer-events-none"
                                            style={{ left: `${backRightPosition}px` }}
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
                        </div>
                      ) : (
                        <div
                          className="planogram-3d-container border rounded-md overflow-hidden"
                          style={{ height: isMobile ? "400px" : "600px" }}
                        >
                          <Canvas
                            shadows
                            key={`3d-canvas-${forceRender}`}
                            gl={{
                              preserveDrawingBuffer: true,
                              antialias: true,
                            }}
                            style={{
                              background: "#f0f8ff",
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
