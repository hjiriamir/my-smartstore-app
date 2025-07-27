"use client"

import { Button } from "@/components/ui/button"
import { ZoomOut, ZoomIn, Maximize } from "lucide-react"

interface ZoomControlsProps {
  sceneScale: number
  setSceneScale: (scale: number | ((prev: number) => number)) => void
  isMobile?: boolean
}

export const ZoomControls = ({ sceneScale, setSceneScale, isMobile = false }: ZoomControlsProps) => {
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

  if (isMobile) {
    // Version mobile compacte
    return (
      <div className="absolute bottom-2 right-2 bg-white rounded-md shadow-md p-1 flex flex-col space-y-1 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          title="Zoom in"
          className="h-8 w-8 p-0 bg-transparent"
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
        <div className="text-[10px] text-center bg-white rounded px-1 py-0.5 min-w-[32px]">
          {Math.round(sceneScale * 100)}%
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          title="Zoom out"
          className="h-8 w-8 p-0 bg-transparent"
        >
          <ZoomOut className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          title="Reset zoom"
          className="h-8 w-8 p-0 bg-transparent"
        >
          <Maximize className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  // Version desktop
  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-md shadow-md p-1 flex space-x-1 z-10">
      <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom out">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={handleReset} className="px-2 bg-transparent">
        {Math.round(sceneScale * 100)}%
      </Button>
      <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom in">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={handleReset} title="Reset zoom">
        <Maximize className="h-4 w-4" />
      </Button>
    </div>
  )
}
