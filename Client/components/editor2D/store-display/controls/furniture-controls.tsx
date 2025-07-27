"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowUp, ArrowDown, ArrowRight, ArrowLeft, RotateCw, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { PlacedFurniture } from "@/lib/types1"

interface FurnitureControlsProps {
  selectedFurniture: PlacedFurniture | undefined
  onUpdate: (furniture: PlacedFurniture) => void
  onDelete: () => void
  isMobile?: boolean
}

export const FurnitureControls = ({
  selectedFurniture,
  onUpdate,
  onDelete,
  isMobile = false,
}: FurnitureControlsProps) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  if (!selectedFurniture) return null

  const moveStep = isMobile ? 0.3 : 0.2
  const rotateStep = 15

  // Handle position changes
  const handlePositionChange = (axis: "x" | "y" | "z", value: string) => {
    console.log(`Changing ${axis} to ${value}`)
    onUpdate({
      ...selectedFurniture,
      [axis]: Number.parseFloat(value),
    })
  }

  // Handle rotation changes
  const handleRotationChange = (value: string) => {
    console.log(`Changing rotation to ${value}`)
    onUpdate({
      ...selectedFurniture,
      rotation: Number.parseInt(value),
    })
  }

  // Handle dimension changes
  const handleDimensionChange = (dimension: string, value: string) => {
    console.log(`Changing ${dimension} to ${value}`)

    if (["wall", "window", "door"].includes(selectedFurniture.type || "")) {
      onUpdate({
        ...selectedFurniture,
        [dimension]: Number.parseFloat(value),
      })
      return
    }

    if (selectedFurniture.savedFurniture && selectedFurniture.savedFurniture.furniture) {
      onUpdate({
        ...selectedFurniture,
        savedFurniture: {
          ...selectedFurniture.savedFurniture,
          furniture: {
            ...selectedFurniture.savedFurniture.furniture,
            [dimension]: Number.parseFloat(value),
          },
        },
      })
    }
  }

  // Handle name changes
  const handleNameChange = (value: string) => {
    onUpdate({
      ...selectedFurniture,
      savedFurniture: {
        ...selectedFurniture.savedFurniture,
        furniture: {
          ...selectedFurniture.savedFurniture.furniture,
          name: value,
        },
      },
    })
  }

  // Handle movement with buttons
  const handleMoveButton = (axis: "x" | "y" | "z", direction: number) => {
    const step = direction * moveStep
    console.log(`Moving ${axis} by ${step}`)
    onUpdate({
      ...selectedFurniture,
      [axis]: selectedFurniture[axis] + step,
    })
  }

  // Handle rotation with buttons
  const handleRotateButton = (direction: number) => {
    const newRotation = (selectedFurniture.rotation + direction * rotateStep) % 360
    console.log(`Rotating to ${newRotation}`)
    onUpdate({
      ...selectedFurniture,
      rotation: newRotation < 0 ? newRotation + 360 : newRotation,
    })
  }

  return (
    <div className={`space-y-4 p-2 sm:p-4 border rounded-md mt-4 ${isMobile ? "text-sm" : ""}`} dir={textDirection}>
      <h3 className={`font-medium ${isMobile ? "text-base" : ""}`}>{t("productImport.furnitureControls")}</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="furniture-name" className={isMobile ? "text-sm" : ""}>
            {t("productImport.floorPlan.nomMeuble")}
          </Label>
          <Input
            id="furniture-name"
            value={selectedFurniture?.savedFurniture?.furniture?.name || ""}
            onChange={(e) => handleNameChange(e.target.value)}
            className={isMobile ? "h-8 text-sm" : ""}
          />
        </div>

        {/* Position Controls - Responsive */}
        <div>
          <h4 className={`font-medium mb-2 ${isMobile ? "text-sm" : "text-sm"}`}>{t("position")}</h4>
          <div className={`grid gap-2 ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}>
            <div>
              <Label htmlFor="position-x" className="text-xs">
                {t("productImport.positionX")}
              </Label>
              <Input
                id="position-x"
                type="number"
                step="0.1"
                value={selectedFurniture.x}
                onChange={(e) => handlePositionChange("x", e.target.value)}
                className={isMobile ? "h-8 text-sm" : ""}
              />
            </div>
            <div>
              <Label htmlFor="position-y" className="text-xs">
                {t("productImport.positionY")}
              </Label>
              <Input
                id="position-y"
                type="number"
                step="0.1"
                value={selectedFurniture.y}
                onChange={(e) => handlePositionChange("y", e.target.value)}
                className={isMobile ? "h-8 text-sm" : ""}
              />
            </div>
            <div>
              <Label htmlFor="position-z" className="text-xs">
                {t("productImport.positionZ")}
              </Label>
              <Input
                id="position-z"
                type="number"
                step="0.1"
                value={selectedFurniture.z}
                onChange={(e) => handlePositionChange("z", e.target.value)}
                className={isMobile ? "h-8 text-sm" : ""}
              />
            </div>
          </div>

          {/* Movement Controls - Responsive */}
          <div className="mt-2">
            <Label className={`mb-1 block ${isMobile ? "text-xs" : "text-sm"}`}>{t("productImport.deplacer")}</Label>
            <div className={`grid grid-cols-3 gap-1 w-full ${isMobile ? "max-w-[200px] mx-auto" : ""}`}>
              <div className="col-span-3 flex justify-center">
                <Button
                  size={isMobile ? "sm" : "sm"}
                  variant="outline"
                  onClick={() => handleMoveButton("y", 1)}
                  className={isMobile ? "h-8 w-8 p-0" : ""}
                >
                  <ArrowUp className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                </Button>
              </div>
              <div className="flex justify-end">
                <Button
                  size={isMobile ? "sm" : "sm"}
                  variant="outline"
                  onClick={() => handleMoveButton("x", isRTL ? 1 : -1)}
                  className={isMobile ? "h-8 w-8 p-0" : ""}
                >
                  <ArrowLeft className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                </Button>
              </div>
              <div className="flex justify-center">
                <Button
                  size={isMobile ? "sm" : "sm"}
                  variant="outline"
                  onClick={() => handleMoveButton("y", -1)}
                  className={isMobile ? "h-8 w-8 p-0" : ""}
                >
                  <ArrowDown className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                </Button>
              </div>
              <div className="flex justify-start">
                <Button
                  size={isMobile ? "sm" : "sm"}
                  variant="outline"
                  onClick={() => handleMoveButton("x", isRTL ? -1 : 1)}
                  className={isMobile ? "h-8 w-8 p-0" : ""}
                >
                  <ArrowRight className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Rotation Controls - Responsive */}
        <div>
          <h4 className={`font-medium mb-2 ${isMobile ? "text-sm" : "text-sm"}`}>{t("productImport.rotation")}</h4>
          <div className="flex items-center space-x-2">
            <Input
              id="rotation"
              type="number"
              step="15"
              value={selectedFurniture.rotation}
              onChange={(e) => handleRotationChange(e.target.value)}
              className={`flex-1 ${isMobile ? "h-8 text-sm" : ""}`}
            />
            <div className="flex space-x-1">
              <Button
                size={isMobile ? "sm" : "sm"}
                variant="outline"
                onClick={() => handleRotateButton(-1)}
                title="Rotation gauche"
                className={isMobile ? "h-8 px-2" : ""}
              >
                <RotateCw className={`transform -scale-x-100 ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
              </Button>
              <Button
                size={isMobile ? "sm" : "sm"}
                variant="outline"
                onClick={() => handleRotateButton(1)}
                title="Rotation droite"
                className={isMobile ? "h-8 px-2" : ""}
              >
                <RotateCw className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
              </Button>
            </div>
          </div>
        </div>

        {/* Dimension Controls - Responsive */}
        <div>
          <h4 className={`font-medium mb-2 ${isMobile ? "text-sm" : "text-sm"}`}>{t("productImport.dimensions")}</h4>
          <div className={`grid gap-2 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
            <div>
              <Label htmlFor="width" className="text-xs">
                {t("productImport.width")}
              </Label>
              <Input
                id="width"
                type="number"
                step="0.1"
                min="0.1"
                value={
                  selectedFurniture.type === "wall" ||
                  selectedFurniture.type === "window" ||
                  selectedFurniture.type === "door"
                    ? selectedFurniture.width
                    : selectedFurniture?.savedFurniture?.furniture?.width || 0.1
                }
                onChange={(e) => handleDimensionChange("width", e.target.value)}
                className={isMobile ? "h-8 text-sm" : ""}
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-xs">
                {t("productImport.height")}
              </Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                min="0.1"
                value={
                  selectedFurniture.type === "wall" ||
                  selectedFurniture.type === "window" ||
                  selectedFurniture.type === "door"
                    ? selectedFurniture.height
                    : selectedFurniture?.savedFurniture?.furniture?.height || 0.1
                }
                onChange={(e) => handleDimensionChange("height", e.target.value)}
                className={isMobile ? "h-8 text-sm" : ""}
              />
            </div>
            <div className={isMobile ? "" : "col-span-2"}>
              <Label htmlFor="depth" className="text-xs">
                {t("productImport.depth")}
              </Label>
              <Input
                id="depth"
                type="number"
                step="0.1"
                min="0.1"
                value={
                  selectedFurniture.type === "wall" ||
                  selectedFurniture.type === "window" ||
                  selectedFurniture.type === "door"
                    ? selectedFurniture.depth
                    : selectedFurniture?.savedFurniture?.furniture?.depth || 0.1
                }
                onChange={(e) => handleDimensionChange("depth", e.target.value)}
                className={isMobile ? "h-8 text-sm" : ""}
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="destructive" size={isMobile ? "sm" : "sm"} className="w-full" onClick={onDelete}>
            <Trash2 className={`mr-2 ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
            {t("productImport.delete")}
          </Button>
        </div>
      </div>
    </div>
  )
}
