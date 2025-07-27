"use client"

import { Grid3X3, Maximize, Move, PanelLeft, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FloorPlanControlsProps {
  handleZoom: (direction: "in" | "out") => void
  moveMode: boolean
  setMoveMode: (mode: boolean) => void
  snapToGrid: boolean
  setSnapToGrid: (checked: boolean) => void
  centerView: () => void
  sidebarVisible: boolean
  setSidebarVisible: (visible: boolean) => void
}

export function FloorPlanControls({
  handleZoom,
  moveMode,
  setMoveMode,
  snapToGrid,
  setSnapToGrid,
  centerView,
  sidebarVisible,
  setSidebarVisible,
}: FloorPlanControlsProps) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
      {/* Contrôles de zoom */}
      <div className="flex flex-col gap-1 bg-white rounded-lg shadow-lg p-1 border border-gray-200">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-gray-100"
                onClick={() => handleZoom("in")}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom avant</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-gray-100"
                onClick={() => handleZoom("out")}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom arrière</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Contrôles d'outils */}
      <div className="flex flex-col gap-1 bg-white rounded-lg shadow-lg p-1 border border-gray-200">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={moveMode ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => setMoveMode(!moveMode)}
              >
                <Move className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{moveMode ? "Désactiver déplacement" : "Mode déplacement"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={snapToGrid ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => setSnapToGrid(!snapToGrid)}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Aligner sur la grille</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-gray-100"
                onClick={centerView}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Centrer la vue</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Contrôle sidebar supplémentaire - visible seulement sur desktop */}
      <div className="hidden lg:block">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-100"
                onClick={() => setSidebarVisible(!sidebarVisible)}
              >
                <PanelLeft
                  className={`h-4 w-4 transition-transform duration-200 ${!sidebarVisible ? "rotate-180" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{sidebarVisible ? "Masquer panneau" : "Afficher panneau"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
