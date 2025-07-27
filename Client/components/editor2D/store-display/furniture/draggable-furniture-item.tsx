"use client"

import { useDrag } from "react-dnd"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Package, Edit2, Check, X, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ItemTypes } from "@/lib/constants"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { SavedFurniture, FloorPlan, MatchedPlanElement, PlacedFurniture } from "@/lib/types1"

interface DraggableFurnitureItemProps {
  furniture: SavedFurniture
  onRename: (id: string, newName: string) => void
  isMatchingPlan: boolean
  disabled: boolean
  onManualPlacement: (furnitureId: string, showMatchDialog?: boolean, cancelMatch?: boolean) => void
  floorPlan: FloorPlan | null
  toast: any
  matchedPlanElements: Record<string, MatchedPlanElement>
  placedFurniture: PlacedFurniture[]
  isMobile?: boolean
}

export const DraggableFurnitureItem = ({
  furniture,
  onRename,
  isMatchingPlan,
  disabled,
  onManualPlacement,
  floorPlan,
  toast,
  matchedPlanElements,
  placedFurniture,
  isMobile = false,
}: DraggableFurnitureItemProps) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(furniture.furniture.name)

  const furnitureId = furniture.furniture.id

  // Vérifier si ce meuble est déjà placé dans la scène
  const isPlaced = placedFurniture.some((item) => item.savedFurniture.furniture.id === furnitureId)

  // Check if this furniture is matched with a plan element
  const isMatched = Object.values(matchedPlanElements).some((match) => match.furnitureId === furnitureId)

  // Get the matched element name if it exists
  const matchedElementName = isMatched
    ? Object.values(matchedPlanElements).find((match) => match.furnitureId === furnitureId)?.elementName
    : null

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.FURNITURE,
      item: { id: furnitureId, type: ItemTypes.FURNITURE, name: furniture.furniture.name },
      canDrag: !disabled && isMatched, // Only allow dragging if matched
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {
        if (!monitor.didDrop()) {
          console.log("Drag ended without drop")
        }
      },
    }),
    [furnitureId, disabled, furniture.furniture.name, isMatched],
  )

  // Mettre à jour le nom lorsque le meuble change
  useEffect(() => {
    setNewName(furniture.furniture.name)
  }, [furniture.furniture.name])

  const handleRename = () => {
    if (newName.trim() && newName !== furniture.furniture.name) {
      onRename(furnitureId, newName.trim())
      // Update the local state to reflect the change
      furniture.furniture.name = newName.trim()
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setNewName(furniture.furniture.name)
    setIsEditing(false)
  }

  // Ajouter un bouton de placement manuel pour les meubles qui correspondent au plan
  const handleManualPlacementClick = (furnitureId: string) => {
    if (!floorPlan) {
      toast({
        title: "Aucun plan chargé",
        description: "Veuillez d'abord charger un plan d'étage.",
        variant: "destructive",
      })
      return
    }
    // Appeler la fonction passée en prop au lieu d'utiliser des variables globales
    onManualPlacement(furnitureId)
  }

  const getStatusColor = () => {
    if (disabled) return "border-gray-300 bg-gray-50"
    if (isPlaced) return "border-green-400 bg-gradient-to-r from-green-50 to-green-100"
    if (isMatched) return "border-cyan-400 bg-gradient-to-r from-cyan-50 to-cyan-100"
    if (isMatchingPlan) return "border-green-500 bg-green-50"
    return "border-gray-200 bg-white"
  }

  const getStatusBadge = () => {
    if (isPlaced)
      return { text: t("productImport.floorPlan.placed"), color: "bg-green-100 text-green-800 border-green-500" }
    if (isMatched)
      return { text: t("productImport.floorPlan.associer1"), color: "bg-blue-100 text-blue-800 border-blue-500" }
    if (isMatchingPlan)
      return { text: t("productImport.floorPlan.dansPlan"), color: "bg-green-100 text-green-800 border-green-500" }
    return null
  }

  const statusBadge = getStatusBadge()

  return (
    <div
      className={`
        flex flex-col border-2 rounded-lg group relative w-full
        transition-all duration-300 ease-in-out
        ${isDragging ? "opacity-50 scale-95 shadow-inner" : "opacity-100 scale-100"}
        ${getStatusColor()}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${isMatched && !isPlaced ? "animate-[pulse_2s_ease-in-out_infinite]" : ""}
        hover:border-primary hover:bg-primary/10
        ${isMobile ? "p-2" : "p-4"}
      `}
      dir={textDirection}
    >
      <div className="flex items-center w-full">
        <div
          ref={drag}
          className={`flex items-center justify-center mr-3 flex-shrink-0 bg-muted/30 rounded-md ${
            !disabled && isMatched ? "cursor-move" : "cursor-default"
          } ${isMobile ? "w-8 h-8" : "w-10 h-10"}`}
        >
          <Package className={`text-muted-foreground ${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          {isEditing ? (
            <div className="flex items-center space-x-1">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={isMobile ? "h-6 text-xs" : "h-7 text-sm"}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename()
                  if (e.key === "Escape") handleCancelEdit()
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                className={`flex-shrink-0 ${isMobile ? "h-6 px-1" : "h-7 px-2"}`}
                onClick={handleRename}
              >
                <Check className={isMobile ? "h-2 w-2" : "h-3 w-3"} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className={`flex-shrink-0 ${isMobile ? "h-6 px-1" : "h-7 px-2"}`}
                onClick={handleCancelEdit}
              >
                <X className={isMobile ? "h-2 w-2" : "h-3 w-3"} />
              </Button>
            </div>
          ) : (
            <div>
              <div className={`font-medium truncate flex items-center ${isMobile ? "text-sm" : ""}`}>
                {furniture.furniture.name}
                {isMatched && <CheckCircle2 className={`ml-2 text-blue-500 ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />}
              </div>
              <div className={`text-muted-foreground ${isMobile ? "text-xs" : "text-xs"}`}>
                {furniture.products.length} {t("productImport.produits")}
              </div>
              {matchedElementName && (
                <div className={`text-blue-600 mt-1 ${isMobile ? "text-xs" : "text-xs"}`}>{matchedElementName}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Boutons d'action - Responsive */}
      <div className={`flex justify-between w-full ${isMobile ? "mt-1" : "mt-2"}`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={`text-xs ${isMobile ? "h-6 px-1" : "h-7 px-2"}`}
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className={`mr-1 ${isMobile ? "h-2 w-2" : "h-3 w-3"}`} />
                {isMobile ? "Ren" : t("productImport.floorPlan.renommer")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("productImport.floorPlan.renameFurniture")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {floorPlan && (
          <div className="flex space-x-1">
            {isMatched ? (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`text-xs bg-transparent ${isMobile ? "h-6 px-1" : "h-7 px-2"}`}
                        onClick={() => handleManualPlacementClick(furnitureId)}
                        disabled={!isMatched}
                      >
                        {isMobile ? "Place" : t("productImport.floorPlan.placer")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("productImport.floorPlan.placeInStore")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`text-xs text-red-500 border-red-200 hover:bg-red-50 bg-transparent ${isMobile ? "h-6 px-1" : "h-7 px-2"}`}
                        onClick={() => onManualPlacement(furnitureId, false, true)}
                      >
                        {isMobile ? "X" : t("cancel")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("productImport.floorPlan.cancelMatching")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`text-xs bg-transparent ${isMobile ? "h-6 px-1" : "h-7 px-2"}`}
                      onClick={() => onManualPlacement(furnitureId, true)}
                    >
                      {isMobile ? "Match" : t("productImport.floorPlan.matchFurniture")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("productImport.floorPlan.associateWithElement")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </div>

      {statusBadge && (
        <Badge
          variant="outline"
          className={`absolute -top-2 -right-2 ${statusBadge.color} ${isMobile ? "text-xs px-1 py-0" : "text-xs"}`}
        >
          {statusBadge.text}
        </Badge>
      )}

      {disabled && (
        <div className={`text-gray-500 ${isMobile ? "mt-1 text-xs" : "mt-2 text-xs"}`}>
          Ce meuble n'est pas compatible avec le plan d'étage actuel
        </div>
      )}
    </div>
  )
}
