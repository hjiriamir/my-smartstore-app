"use client"

import type React from "react"
import { useState } from "react"
import { ArrowLeft, Download, MoreVertical, PanelLeft, Save, ShoppingBag, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FloorPlanToolbarProps {
  viewMode: "2d" | "3d"
  setViewMode: (mode: "2d" | "3d") => void
  exportToImage: () => void
  exportToPDF: () => void
  exportToJSON: () => void
  importFromJSON: (e: React.ChangeEvent<HTMLInputElement>) => void
  setShowSaveDialog: (show: boolean) => void
  sidebarVisible: boolean
  setSidebarVisible: (visible: boolean) => void
}

export function FloorPlanToolbar({
  viewMode,
  setViewMode,
  exportToImage,
  exportToPDF,
  exportToJSON,
  importFromJSON,
  setShowSaveDialog,
  sidebarVisible,
  setSidebarVisible,
}: FloorPlanToolbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleImportClick = () => {
    document.getElementById("import-json")?.click()
    setMobileMenuOpen(false)
  }

  const handleExportImage = () => {
    exportToImage()
    setMobileMenuOpen(false)
  }

  const handleExportPDF = () => {
    exportToPDF()
    setMobileMenuOpen(false)
  }

  const handleExportJSON = () => {
    exportToJSON()
    setMobileMenuOpen(false)
  }

  const handleSave = () => {
    setShowSaveDialog(true)
    setMobileMenuOpen(false)
  }

  const handleToggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Input caché pour l'import */}
      <input type="file" id="import-json" accept=".json" onChange={importFromJSON} className="hidden" />

      {/* Toolbar Desktop (md et plus) */}
      <div className="hidden md:flex border-b p-4 justify-between items-center bg-white shadow-sm">
        {/* Section gauche */}
        <div className="flex items-center gap-2">
          {/* Bouton toggle sidebar */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-transparent hover:bg-gray-100"
                  onClick={() => setSidebarVisible(!sidebarVisible)}
                >
                  <PanelLeft
                    className={`h-4 w-4 transition-transform duration-200 ${!sidebarVisible ? "rotate-180" : ""}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{sidebarVisible ? "Masquer le panneau" : "Afficher le panneau"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Bouton retour */}
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden lg:inline">Retour à l'accueil</span>
          </Button>
        </div>

        {/* Titre central */}
        <h1 className="text-xl lg:text-2xl font-bold text-center flex-1 lg:flex-none">Éditeur de plan d'étage</h1>

        {/* Section droite */}
        <div className="flex gap-2 items-center">
          {/* Tabs Vue 2D/3D */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "2d" | "3d")}>
            <TabsList className="h-10">
              <TabsTrigger value="2d" className="text-sm px-3">
                2D
              </TabsTrigger>
              <TabsTrigger value="3d" className="text-sm px-3">
                3D
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Boutons d'export */}
          <div className="flex gap-1">
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
                  <Button variant="outline" size="icon" onClick={handleImportClick}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Importer un JSON</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Bouton sauvegarder */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setShowSaveDialog(true)}>
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sauvegarder</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Bouton magasin */}
          <Button variant="default" className="hidden lg:flex">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Aller à l'éditeur de magasin
          </Button>
        </div>
      </div>

      {/* Toolbar Mobile (sm et moins) - Bouton compact */}
      <div className="md:hidden border-b bg-white shadow-sm">
        <div className="flex items-center justify-between p-3">
          {/* Titre */}
          <h1 className="text-lg font-bold truncate flex-1">Éditeur</h1>

          {/* Tabs Vue 2D/3D - Compact */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "2d" | "3d")} className="mr-2">
            <TabsList className="h-8">
              <TabsTrigger value="2d" className="text-xs px-2">
                2D
              </TabsTrigger>
              <TabsTrigger value="3d" className="text-xs px-2">
                3D
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Menu déroulant mobile */}
          <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Toggle Sidebar */}
              <DropdownMenuItem onClick={handleToggleSidebar} className="flex items-center gap-2">
                <PanelLeft className={`h-4 w-4 ${!sidebarVisible ? "rotate-180" : ""}`} />
                {sidebarVisible ? "Masquer panneau" : "Afficher panneau"}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Navigation */}
              <DropdownMenuItem className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour à l'accueil
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Export/Import */}
              <DropdownMenuItem onClick={handleExportImage} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exporter en image
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleExportPDF} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exporter en PDF
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleExportJSON} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exporter en JSON
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleImportClick} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Importer JSON
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Actions */}
              <DropdownMenuItem onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Sauvegarder
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Éditeur de magasin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )
}
