"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Move3D,
  Eye,
  Grid3X3,
} from "lucide-react"
import { useTranslation } from "react-i18next"

interface AdvancedSceneControlsProps {
  sceneScale: number
  setSceneScale: (scale: number | ((prev: number) => number)) => void
  onMoveScene: (direction: "up" | "down" | "left" | "right" | "reset") => void
  onResetView: () => void
  onToggleGrid?: () => void
  showGrid?: boolean
  cameraPosition?: { x: number; y: number; z: number }
  onCameraReset?: () => void
}

export const AdvancedSceneControls = ({
  sceneScale,
  setSceneScale,
  onMoveScene,
  onResetView,
  onToggleGrid,
  showGrid = false,
  cameraPosition,
  onCameraReset,
}: AdvancedSceneControlsProps) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  const minScale = 0.3
  const maxScale = 3.0
  const stepScale = 0.1

  const handleZoomIn = () => {
    setSceneScale((prev) => Math.min(prev + stepScale, maxScale))
  }

  const handleZoomOut = () => {
    setSceneScale((prev) => Math.max(prev - stepScale, minScale))
  }

  const handleResetZoom = () => {
    setSceneScale(1.0)
  }

  const handleFitToScreen = () => {
    setSceneScale(0.8)
    onResetView()
  }

  return (
    <div className="absolute top-4 right-4 z-20 space-y-3">
      {/* Zoom Slider */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 min-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium text-gray-600">{t("productImport.zoom")}</Label>
          <span className="text-xs font-bold text-gray-800">{Math.round(sceneScale * 100)}%</span>
        </div>
        <Slider
          value={[sceneScale]}
          onValueChange={(value) => setSceneScale(value[0])}
          min={minScale}
          max={maxScale}
          step={stepScale}
          className="w-full"
        />
      </div>

      {/* Scene Movement Controls */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3">
        <div className="text-xs font-medium text-center mb-2 text-gray-600">
          {t("productImport.floorPlan.deplacerScene")}
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div></div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={() => onMoveScene("up")}
            title={t("productImport.moveUp")}
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <div></div>

          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={() => onMoveScene(isRTL ? "right" : "left")}
            title={t("productImport.moveLeft")}
          >
            <ArrowLeft className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={() => onMoveScene("reset")}
            title={t("productImport.center")}
          >
            <Move3D className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={() => onMoveScene(isRTL ? "left" : "right")}
            title={t("productImport.moveRight")}
          >
            <ArrowRight className="h-3 w-3" />
          </Button>

          <div></div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={() => onMoveScene("down")}
            title={t("productImport.moveDown")}
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
          <div></div>
        </div>
      </div>

      {/* Zoom and View Controls */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2">
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={handleZoomOut}
            disabled={sceneScale <= minScale}
            title={t("productImport.zoomOut")}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="px-2 h-8 bg-white/80 hover:bg-white text-xs font-medium min-w-[50px]"
            onClick={handleResetZoom}
            title={t("productImport.resetZoom")}
          >
            {Math.round(sceneScale * 100)}%
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={handleZoomIn}
            disabled={sceneScale >= maxScale}
            title={t("productImport.zoomIn")}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={handleFitToScreen}
            title={t("productImport.fitToScreen")}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Additional View Controls */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2">
        <div className="flex items-center space-x-1">
          {onCameraReset && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={onCameraReset}
              title={t("productImport.resetCamera")}
            >
              <Eye className="h-3 w-3" />
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={onResetView}
            title={t("productImport.resetView")}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>

          {onToggleGrid && (
            <Button
              size="sm"
              variant="outline"
              className={`h-8 w-8 p-0 ${
                showGrid ? "bg-blue-100 text-blue-600 border-blue-300" : "bg-white/80 hover:bg-white"
              }`}
              onClick={onToggleGrid}
              title={t("productImport.toggleGrid")}
            >
              <Grid3X3 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Camera Position Info (if available) */}
      {cameraPosition && (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2">
          <div className="text-xs text-gray-500 space-y-1">
            <div>X: {cameraPosition.x.toFixed(1)}</div>
            <div>Y: {cameraPosition.y.toFixed(1)}</div>
            <div>Z: {cameraPosition.z.toFixed(1)}</div>
          </div>
        </div>
      )}
    </div>
  )
}
