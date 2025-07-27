"use client"

import type React from "react"
import { useState } from "react"
import { RotateCw } from "lucide-react"
import type { Element, ElementType } from "@/lib/typese"
import { formatDimension, getElementColor, getElementLabel } from "@/lib/utilse"

interface FloorPlanCanvasProps {
  canvasRef: React.RefObject<HTMLDivElement>
  elements: Element[]
  selectedElement: string | null
  currentTool: ElementType | null
  zoom: number
  offset: { x: number; y: number }
  snapToGrid: boolean
  gridSize: number
  ghostElement: Element | null
  unitSystem: "m" | "cm"
  showDimensions: boolean
  moveMode: boolean
  handleCanvasClick: (e: React.MouseEvent) => void
  handleElementDragStart: (e: React.MouseEvent, elementId: string) => void
  handleCanvasDragStart: (e: React.MouseEvent) => void
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseUp: () => void
  startResize: (e: React.MouseEvent, direction: string) => void
  startRotate: (e: React.MouseEvent) => void
}

export function FloorPlanCanvas({
  canvasRef,
  elements,
  selectedElement,
  currentTool,
  zoom,
  offset,
  snapToGrid,
  gridSize,
  ghostElement,
  unitSystem,
  showDimensions,
  moveMode,
  handleCanvasClick,
  handleElementDragStart,
  handleCanvasDragStart,
  handleMouseMove,
  handleMouseUp,
  startResize,
  startRotate,
}: FloorPlanCanvasProps) {
  const [selectedElementState, setSelectedElementState] = useState<string | null>(selectedElement)

  // Rendu des éléments sur le canvas
  const renderElements = () => {
    return elements.map((element) => {
      const isSelected = selectedElementState === element.id
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
            setSelectedElementState(element.id)
          }}
          onMouseDown={(e) => handleElementDragStart(e, element.id)}
        >
          <div className="w-full h-full flex items-center justify-center text-xs text-white">
            {element.name || getElementLabel(element.type)}
          </div>
          {/* Afficher les dimensions si activé */}
          {showDimensions && (
            <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-800 font-medium">
              {formatDimension(element.width, unitSystem)} × {formatDimension(element.height, unitSystem)}
            </div>
          )}
          {element.type === "window" && showDimensions && (
            <>
              <div className="absolute -top-5 left-0 right-0 text-center text-xs text-gray-800 font-medium">
                {formatDimension(element.windowTopDistance || 0, unitSystem)}
              </div>
              <div className="absolute -bottom-10 left-0 right-0 text-center text-xs text-gray-800 font-medium">
                {formatDimension(element.windowBottomDistance || 0, unitSystem)}
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
            {formatDimension(ghostElement.width, unitSystem)} × {formatDimension(ghostElement.height, unitSystem)}
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

  return (
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
  )
}
