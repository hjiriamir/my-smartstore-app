"use client"

import type React from "react"
import { Columns, DoorOpen, LayoutGrid, ShoppingBag, Square, SquareStack, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Element, ElementType } from "@/lib/typese"
import { formatDimension, getElementLabel } from "@/lib/utilse"

interface FloorPlanSidebarProps {
  sidebarVisible: boolean
  setSidebarVisible: (visible: boolean) => void
  currentTab: "structures" | "shapes" | "furniture"
  setCurrentTab: (tab: "structures" | "shapes" | "furniture") => void
  selectTool: (type: ElementType) => void
  currentTool: ElementType | null
  selectedElementData: Element | null
  setElements: React.Dispatch<React.SetStateAction<Element[]>>
  selectedElement: string | null
  updateElementDepth: (depth: number) => void
  snapToGrid: boolean
  setSnapToGrid: (checked: boolean) => void
  showDimensions: boolean
  setShowDimensions: (checked: boolean) => void
  unitSystem: "m" | "cm"
  setUnitSystem: (unit: "m" | "cm") => void
  deleteSelectedElement: () => void
}

export function FloorPlanSidebar({
  sidebarVisible,
  setSidebarVisible,
  currentTab,
  setCurrentTab,
  selectTool,
  currentTool,
  selectedElementData,
  setElements,
  selectedElement,
  updateElementDepth,
  snapToGrid,
  setSnapToGrid,
  showDimensions,
  setShowDimensions,
  unitSystem,
  setUnitSystem,
  deleteSelectedElement,
}: FloorPlanSidebarProps) {
  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      {/* Header avec bouton fermer sur mobile */}
      <div className="flex justify-between items-center mb-4 lg:hidden">
        <h2 className="text-lg font-semibold">Outils</h2>
        <Button variant="ghost" size="icon" onClick={() => setSidebarVisible(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as "structures" | "shapes" | "furniture")}>
        <TabsList className="w-full mb-4 grid grid-cols-3">
          <TabsTrigger value="structures" className="text-xs sm:text-sm">
            Structures
          </TabsTrigger>
          <TabsTrigger value="shapes" className="text-xs sm:text-sm">
            Formes
          </TabsTrigger>
          <TabsTrigger value="furniture" className="text-xs sm:text-sm">
            Meubles
          </TabsTrigger>
        </TabsList>

        <div className="space-y-6">
          {/* Onglet Structures */}
          <div className="space-y-4" style={{ display: currentTab === "structures" ? "block" : "none" }}>
            <div>
              <h2 className="font-semibold mb-2 text-gray-700 flex items-center text-sm">
                <Square className="h-4 w-4 mr-2" />
                Structures de base
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                <Button
                  variant={currentTool === "wall" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-14 sm:h-16 text-xs"
                  onClick={() => selectTool("wall")}
                >
                  <Square className="h-4 w-4 mb-1" />
                  <span>Mur</span>
                </Button>
                <Button
                  variant={currentTool === "door" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-14 sm:h-16 text-xs"
                  onClick={() => selectTool("door")}
                >
                  <DoorOpen className="h-4 w-4 mb-1" />
                  <span>Porte</span>
                </Button>
                <Button
                  variant={currentTool === "window" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-14 sm:h-16 text-xs"
                  onClick={() => selectTool("window")}
                >
                  <Columns className="h-4 w-4 mb-1" />
                  <span>Fenêtre</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Onglet Formes */}
          <div className="space-y-4" style={{ display: currentTab === "shapes" ? "block" : "none" }}>
            <div>
              <h2 className="font-semibold mb-2 text-gray-700 flex items-center text-sm">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Formes basiques
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                <Button
                  variant={currentTool === "line" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-14 sm:h-16 text-xs"
                  onClick={() => selectTool("line")}
                >
                  <div className="w-6 h-0.5 bg-current mb-1"></div>
                  <span>Ligne</span>
                </Button>
                <Button
                  variant={currentTool === "rectangle" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-14 sm:h-16 text-xs"
                  onClick={() => selectTool("rectangle")}
                >
                  <Square className="h-4 w-4 mb-1" />
                  <span>Rectangle</span>
                </Button>
                <Button
                  variant={currentTool === "circle" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-14 sm:h-16 text-xs"
                  onClick={() => selectTool("circle")}
                >
                  <div className="w-4 h-4 rounded-full border-2 border-current mb-1"></div>
                  <span>Cercle</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Onglet Meubles */}
          <div className="space-y-4" style={{ display: currentTab === "furniture" ? "block" : "none" }}>
            <div>
              <h2 className="font-semibold mb-2 text-gray-700 flex items-center text-sm">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Meubles de magasin
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                <Button
                  variant={currentTool === "shelf" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-14 sm:h-16 text-xs"
                  onClick={() => selectTool("shelf")}
                >
                  <SquareStack className="h-4 w-4 mb-1" />
                  <span>Étagère</span>
                </Button>
                <Button
                  variant={currentTool === "display" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-14 sm:h-16 text-xs"
                  onClick={() => selectTool("display")}
                >
                  <ShoppingBag className="h-4 w-4 mb-1" />
                  <span>Présentoir</span>
                </Button>
                <Button
                  variant={currentTool === "table" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-14 sm:h-16 text-xs"
                  onClick={() => selectTool("table")}
                >
                  <Square className="h-4 w-4 mb-1" />
                  <span>Table</span>
                </Button>
                <Button
                  variant={currentTool === "fridge" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-14 sm:h-16 text-xs"
                  onClick={() => selectTool("fridge")}
                >
                  <Square className="h-4 w-4 mb-1" />
                  <span>Frigo</span>
                </Button>
                <Button
                  variant={currentTool === "dairy_fridge" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-14 sm:h-16 text-xs"
                  onClick={() => selectTool("dairy_fridge")}
                >
                  <Square className="h-4 w-4 mb-1" />
                  <span>Frigo Laitier</span>
                </Button>
                <Button
                  variant={currentTool === "counter" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-14 sm:h-16 text-xs"
                  onClick={() => selectTool("counter")}
                >
                  <Square className="h-4 w-4 mb-1" />
                  <span>Comptoir</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Tabs>

      {/* Propriétés de l'élément sélectionné */}
      {selectedElementData && (
        <>
          <Separator className="my-4" />
          <h2 className="font-semibold mb-2 text-gray-700 text-sm">Propriétés</h2>
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
                placeholder="Nom de l'élément"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Type</label>
              <div className="mt-1 text-sm bg-gray-50 p-2 rounded">{getElementLabel(selectedElementData.type)}</div>
            </div>

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
                  }}
                  className="mt-2"
                />
                <span className="text-xs bg-gray-50 p-1 rounded min-w-[50px] text-center">
                  {formatDimension(selectedElementData.width, unitSystem)}
                </span>
              </div>
            </div>

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
                  }}
                  className="mt-2"
                />
                <span className="text-xs bg-gray-50 p-1 rounded min-w-[50px] text-center">
                  {formatDimension(selectedElementData.height, unitSystem)}
                </span>
              </div>
            </div>

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
                <span className="text-xs bg-gray-50 p-1 rounded min-w-[50px] text-center">
                  {formatDimension(selectedElementData.depth, unitSystem)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="destructive"
                size="sm"
                className="w-full flex items-center justify-center gap-2"
                onClick={deleteSelectedElement}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </div>
        </>
      )}

      <Separator className="my-4" />

      {/* Paramètres */}
      <div className="space-y-4 bg-white p-3 rounded-md shadow-sm">
        <div className="flex items-center justify-between">
          <Label htmlFor="grid-snap" className="text-sm font-medium">
            Grille
          </Label>
          <Switch id="grid-snap" checked={snapToGrid} onCheckedChange={setSnapToGrid} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-dimensions" className="text-sm font-medium">
            Dimensions
          </Label>
          <Switch id="show-dimensions" checked={showDimensions} onCheckedChange={setShowDimensions} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit-system" className="text-sm font-medium">
            Unité
          </Label>
          <Select value={unitSystem} onValueChange={(value) => setUnitSystem(value as "m" | "cm")}>
            <SelectTrigger id="unit-system" className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cm">cm</SelectItem>
              <SelectItem value="m">m</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
