"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import type { FloorPlan } from "@/lib/types1"

interface ManualMatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  furnitureId: string
  furnitureName: string
  floorPlan: FloorPlan | null
  onSelectElement: (element: any, furnitureId: string) => void
  isMobile?: boolean
}

// Helper function to get element color
const getElementColor = (type: string): string => {
  switch (type) {
    case "wall":
      return "#555555"
    case "door":
      return "#8B4513"
    case "window":
      return "#87CEEB"
    case "shelf":
      return "#A0522D"
    case "rack":
      return "#708090"
    case "display":
      return "#4682B4"
    case "table":
      return "#CD853F"
    case "fridge":
      return "#B0C4DE"
    case "planogram":
      return "#6A5ACD"
    case "gondola":
      return "#20B2AA"
    case "line":
      return "#333333"
    case "rectangle":
      return "#5D8AA8"
    case "circle":
      return "#6495ED"
    case "chair":
      return "#8B8970"
    case "sofa":
      return "#9370DB"
    case "bed":
      return "#8B008B"
    case "plant":
      return "#228B22"
    case "counter":
      return "#D2691E"
    case "cashier":
      return "#FF7F50"
    case "mannequin":
      return "#E6E6FA"
    case "cube":
      return "#5D4037"
    default:
      return "#CCCCCC"
  }
}

export const ManualMatchDialog = ({
  open,
  onOpenChange,
  furnitureId,
  furnitureName,
  floorPlan,
  onSelectElement,
  isMobile = false,
}: ManualMatchDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  if (!floorPlan) return null

  // Filtrer les éléments du plan qui peuvent être des meubles
  const furnitureElements =
    floorPlan?.elements.filter((element) =>
      [
        "shelf",
        "display",
        "table",
        "fridge",
        "planogram",
        "gondola",
        "counter",
        "cashier",
        "rack",
        "mannequin",
        "cube",
      ].includes(element.type),
    ) || []

  // Filtrer les éléments en fonction du terme de recherche
  const filteredElements = furnitureElements.filter(
    (element) =>
      element.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      element.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${isMobile ? "w-[95vw] max-w-[95vw] h-[90vh]" : "sm:max-w-[600px]"}`}
        dir={textDirection}
      >
        <DialogHeader>
          <DialogTitle className={isMobile ? "text-base" : ""}>
            {t("productImport.floorPlan.associerFenetre")} "{furnitureName}"{" "}
            {t("productImport.floorPlan.associerFenetre1")}
          </DialogTitle>
          <DialogDescription className={isMobile ? "text-sm" : ""}>
            {t("productImport.floorPlan.associerFenetre2")}
          </DialogDescription>
        </DialogHeader>
        <div className={isMobile ? "py-2" : "py-4"}>
          <div className="mb-4">
            <Label htmlFor="search-element" className={`font-medium ${isMobile ? "text-sm" : "text-sm"}`}>
              {t("productImport.floorPlan.associerFenetre3")}
            </Label>
            <Input
              id="search-element"
              placeholder={t("productImport.floorPlan.elementNameOrType")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`mt-1 ${isMobile ? "h-8 text-sm" : ""}`}
            />
          </div>
          <ScrollArea className={`w-full ${isMobile ? "h-[50vh]" : "h-[300px]"}`}>
            {filteredElements.length > 0 ? (
              <div className="grid gap-1 p-1">
                {filteredElements.map((element) => (
                  <div
                    key={element.id}
                    className={`flex items-center justify-between border rounded-md cursor-pointer hover:bg-muted ${isMobile ? "p-2" : "p-3"}`}
                    onClick={() => onSelectElement(element, furnitureId)}
                  >
                    <div className="flex items-center">
                      <div
                        className={`rounded-full mr-2 ${isMobile ? "w-3 h-3" : "w-4 h-4"}`}
                        style={{ backgroundColor: getElementColor(element.type) }}
                      />
                      <div>
                        <div className={`font-medium ${isMobile ? "text-sm" : ""}`}>
                          {element.name || `${element.type} sans nom`}
                        </div>
                        <div className={`text-muted-foreground ${isMobile ? "text-xs" : "text-xs"}`}>
                          {t("productImport.type")} : {element.type} • {t("position")}: {element.x.toFixed(0)},{" "}
                          {element.y.toFixed(0)}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size={isMobile ? "sm" : "sm"}>
                      {t("selectionner")}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center text-muted-foreground ${isMobile ? "p-2" : "p-4"}`}>
                {t("productImport.floorPlan.aucunAssocier")} "{searchTerm}"
              </div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            size={isMobile ? "sm" : "default"}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
