"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Plus, MousePointer, DoorOpen, Square, Maximize2 } from "lucide-react"
import { getOrientationDegrees } from "@/utils/magasin-utils"
import type { MagasinDetails, Structure, NewZone, NewStructure } from "@/types/magasin-types"

interface Plan2DProps {
  magasin: MagasinDetails
  structures: Structure[]
  showAddStructure: boolean
  placementMode: boolean
  previewStructure: Structure | null
  newStructure: NewStructure
  showAddZoneForm: boolean
  newZone: NewZone
  conflictZones: string[]
  onToggleAddStructure: () => void
  onStartPlacement: () => void
  onCancelPlacement: () => void
  onPlanClick: (e: React.MouseEvent<HTMLDivElement>) => void
  onPlanMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void
  onRemoveStructure: (id: string) => void
  onApplySuggestion: (suggestion: any) => void
  onToggleAddZone?: () => void
}

export function Plan2D({
  magasin,
  structures,
  showAddStructure,
  placementMode,
  previewStructure,
  newStructure,
  showAddZoneForm,
  newZone,
  conflictZones,
  onToggleAddStructure,
  onStartPlacement,
  onCancelPlacement,
  onPlanClick,
  onPlanMouseMove,
  onRemoveStructure,
  onApplySuggestion,
  onToggleAddZone,
}: Plan2DProps) {
  const magasinLongueur = Number.parseInt(magasin.longueur)
  const magasinLargeur = Number.parseInt(magasin.largeur)

  const suggestions = [
    { x: 0, y: 0, width: Math.min(20, magasinLongueur), height: Math.min(15, magasinLargeur) },
    { x: magasinLongueur - 20, y: 0, width: 20, height: Math.min(15, magasinLargeur) },
  ]

  return (
    <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg sm:shadow-xl lg:shadow-2xl border border-gray-200 p-3 sm:p-4 lg:p-6 xl:p-8 mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-4">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg">
            <Maximize2 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              Plan 2D du Magasin
            </h3>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-600">
              <span className="bg-blue-50 px-2 sm:px-3 py-1 rounded-full font-medium">
                📏 {magasin.longueur}m × {magasin.largeur}m
              </span>
              <span className="bg-green-50 px-2 sm:px-3 py-1 rounded-full font-medium">
                📐 Surface: {magasin.surface}m²
              </span>
              <span className="bg-purple-50 px-2 sm:px-3 py-1 rounded-full font-medium">
                🏷️ {magasin.zones.length} zone{magasin.zones.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          {onToggleAddZone && (
            <Button
              onClick={onToggleAddZone}
              variant="outline"
              size="sm"
              disabled={placementMode}
              className="shadow-md bg-transparent text-xs sm:text-sm"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Ajouter </span>Zone
            </Button>
          )}
          <Button
            onClick={onToggleAddStructure}
            variant="outline"
            size="sm"
            disabled={placementMode}
            className="shadow-md bg-transparent text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Ajouter </span>Structure
          </Button>
          {placementMode && (
            <Button
              onClick={onCancelPlacement}
              variant="outline"
              size="sm"
              className="shadow-md bg-transparent text-xs sm:text-sm"
            >
              Annuler
            </Button>
          )}
        </div>
      </div>

      {placementMode && (
        <div className="mb-4 sm:mb-6 lg:mb-8 p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl shadow-sm">
          <p className="text-blue-700 font-medium text-sm sm:text-base lg:text-lg flex items-center">
            <MousePointer className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
            Cliquez sur le plan pour placer la {newStructure.type === "door" ? "porte" : "fenêtre"}
          </p>
        </div>
      )}

      <div
        className={`relative bg-gradient-to-br from-gray-50 to-gray-100 border-2 sm:border-3 lg:border-4 border-gray-300 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl lg:shadow-2xl ${
          placementMode ? "cursor-crosshair" : ""
        }`}
        style={{
          aspectRatio: `${magasin.longueur}/${magasin.largeur}`,
          minHeight: "500px",
          maxHeight: "85vh",
          width: "100%",
        }}
        onClick={onPlanClick}
        onMouseMove={onPlanMouseMove}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100">
          <svg className="absolute inset-0 w-full h-full opacity-20 sm:opacity-30">
            <defs>
              <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                <path d="M 25 0 L 0 0 0 25" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
              <pattern id="smallGrid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="currentColor" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#smallGrid)" />
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="absolute top-2 sm:top-3 lg:top-4 left-6 sm:left-8 lg:left-12 right-6 sm:right-8 lg:right-12 h-6 sm:h-8 lg:h-10 flex items-center justify-between text-xs sm:text-sm lg:text-base font-bold text-gray-800">
          <span className="bg-white px-1 sm:px-2 lg:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg shadow-md border text-xs sm:text-sm">
            0m
          </span>
          <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 sm:px-4 lg:px-6 py-1 sm:py-2 rounded-full shadow-lg text-xs sm:text-sm lg:text-lg">
            <span className="hidden sm:inline">Longueur: </span>
            {magasin.longueur}m<span className="hidden lg:inline"> (Axe X)</span>
          </span>
          <span className="bg-white px-1 sm:px-2 lg:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg shadow-md border text-xs sm:text-sm">
            {magasin.longueur}m
          </span>
        </div>

        <div className="absolute left-2 sm:left-3 lg:left-4 top-6 sm:top-8 lg:top-12 bottom-6 sm:bottom-8 lg:bottom-12 w-6 sm:w-8 lg:w-10 flex flex-col items-center justify-between text-xs sm:text-sm lg:text-base font-bold text-gray-800">
          <span className="bg-white px-1 sm:px-2 py-1 sm:py-2 lg:py-3 rounded-md sm:rounded-lg shadow-md border text-xs sm:text-sm">
            0m
          </span>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-1 sm:px-2 lg:px-3 py-2 sm:py-4 lg:py-6 rounded-full shadow-lg -rotate-90 whitespace-nowrap text-xs sm:text-sm lg:text-lg">
            <span className="hidden sm:inline">Largeur: </span>
            {magasin.largeur}m<span className="hidden lg:inline"> (Axe Y)</span>
          </div>
          <span className="bg-white px-1 sm:px-2 py-1 sm:py-2 lg:py-3 rounded-md sm:rounded-lg shadow-md border text-xs sm:text-sm">
            {magasin.largeur}m
          </span>
        </div>

        <div
          className="absolute w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 bg-red-500 rounded-full border-2 sm:border-3 lg:border-4 border-white shadow-xl z-10 animate-pulse"
          style={{
            left: `50%`,
            top: `50%`,
            transform: "translate(-50%, -50%)",
          }}
          title={`Point de référence central: (${Math.round(magasinLongueur / 2)}, ${Math.round(magasinLargeur / 2)})`}
        />

        <div className="absolute left-6 sm:left-8 lg:left-12 top-6 sm:top-8 lg:top-12 right-6 sm:right-8 lg:right-12 bottom-6 sm:bottom-8 lg:bottom-12 border-2 sm:border-3 lg:border-4 border-slate-600 bg-white/70 rounded-lg sm:rounded-xl shadow-inner">
          {magasin.zones.map((zone) => {
            const posX = (zone.position_x / magasinLongueur) * 100
            const posY = (zone.position_y / magasinLargeur) * 100
            const tailleX = ((zone.longueur || 10) / magasinLongueur) * 100
            const tailleY = ((zone.largeur || 10) / magasinLargeur) * 100

            return (
              <div
                key={zone.id}
                className="absolute border-2 sm:border-3 border-white shadow-lg sm:shadow-xl opacity-90 hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl group rounded-md sm:rounded-lg"
                style={{
                  backgroundColor: zone.couleur || "#3B82F6",
                  left: `${Math.max(0, Math.min(100 - tailleX, posX))}%`,
                  top: `${Math.max(0, Math.min(100 - tailleY, posY))}%`,
                  width: `${tailleX}%`,
                  height: `${tailleY}%`,
                  transform: `rotate(${getOrientationDegrees(zone.orientation || "Nord")}deg)`,
                  transformOrigin: "center",
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 sm:p-2 lg:p-3">
                  <span className="text-white text-xs sm:text-sm lg:text-base font-bold text-center bg-black/60 rounded-md sm:rounded-lg px-1 sm:px-2 lg:px-3 py-1 sm:py-2 shadow-lg">
                    {zone.nom_zone}
                  </span>
                  <span className="text-white text-xs sm:text-sm bg-black/60 rounded-md sm:rounded-lg px-1 sm:px-2 lg:px-3 py-1 mt-1 sm:mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {zone.longueur}×{zone.largeur}×{zone.hauteur}m
                  </span>
                  <span className="text-white text-xs sm:text-sm bg-black/60 rounded-md sm:rounded-lg px-1 sm:px-2 lg:px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    ({zone.position_x}, {zone.position_y})
                  </span>
                </div>
              </div>
            )
          })}

          {showAddZoneForm && newZone.longueur > 0 && newZone.largeur > 0 && (
            <div
              className="absolute border-2 sm:border-3 border-dashed border-red-500 bg-red-500/20 opacity-80 z-20 rounded-md sm:rounded-lg"
              style={{
                left: `${(newZone.position_x / magasinLongueur) * 100}%`,
                top: `${(newZone.position_y / magasinLargeur) * 100}%`,
                width: `${(newZone.longueur / magasinLongueur) * 100}%`,
                height: `${(newZone.largeur / magasinLargeur) * 100}%`,
                transform: `rotate(${getOrientationDegrees(newZone.orientation)}deg)`,
                transformOrigin: "center",
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-red-700 text-xs sm:text-sm font-bold bg-white/90 rounded-md sm:rounded-lg px-1 sm:px-2 py-1">
                  {newZone.nom || "Nouvelle zone"}
                </span>
                <span className="text-red-700 text-xs sm:text-sm bg-white/90 rounded-md sm:rounded-lg px-1 sm:px-2 py-1 mt-1">
                  {newZone.longueur}×{newZone.largeur}×{newZone.hauteur}m
                </span>
              </div>
            </div>
          )}

          {showAddZoneForm &&
            suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="absolute border-2 sm:border-3 border-dashed border-green-500 bg-green-500/20 opacity-70 hover:opacity-95 cursor-pointer transition-all hover:scale-105 group rounded-md sm:rounded-lg"
                style={{
                  left: `${(suggestion.x / magasinLongueur) * 100}%`,
                  top: `${(suggestion.y / magasinLargeur) * 100}%`,
                  width: `${(suggestion.width / magasinLongueur) * 100}%`,
                  height: `${(suggestion.height / magasinLargeur) * 100}%`,
                }}
                onClick={() => onApplySuggestion(suggestion)}
                title={`Emplacement suggéré: ${suggestion.width}×${suggestion.height}m à (${suggestion.x}, ${suggestion.y})`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-green-700 text-xs sm:text-sm font-bold bg-white/90 rounded-md sm:rounded-lg px-1 sm:px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Suggéré
                  </span>
                </div>
              </div>
            ))}

          {structures.map((structure) => {
            const posX = (structure.position_x / magasinLongueur) * 100
            const posY = (structure.position_y / magasinLargeur) * 100
            const tailleX = (structure.width / magasinLongueur) * 100
            const tailleY = (structure.height / magasinLargeur) * 100

            return (
              <div
                key={structure.id}
                className={`absolute border-2 sm:border-3 group rounded-md sm:rounded-lg ${
                  structure.type === "door"
                    ? "border-amber-600 bg-amber-200 hover:bg-amber-300"
                    : "border-blue-500 bg-blue-200 hover:bg-blue-300"
                } opacity-90 hover:opacity-100 transition-all cursor-pointer shadow-lg`}
                style={{
                  left: `${Math.max(0, Math.min(100 - tailleX, posX))}%`,
                  top: `${Math.max(0, Math.min(100 - tailleY, posY))}%`,
                  width: `${tailleX}%`,
                  height: `${tailleY}%`,
                  transform: `rotate(${getOrientationDegrees(structure.orientation)}deg)`,
                  transformOrigin: "center",
                  minWidth: "20px",
                  minHeight: "20px",
                }}
                title={`${structure.type === "door" ? "Porte" : "Fenêtre"}: ${structure.width}×${structure.height}m`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {structure.type === "door" ? (
                    <DoorOpen className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-amber-700" />
                  ) : (
                    <Square className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-700" />
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveStructure(structure.id)
                  }}
                  className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs sm:text-sm font-bold shadow-lg"
                >
                  ×
                </button>
              </div>
            )
          })}

          {placementMode && previewStructure && (
            <div
              className={`absolute border-2 sm:border-3 border-dashed opacity-70 rounded-md sm:rounded-lg ${
                previewStructure.type === "door" ? "border-amber-400 bg-amber-100" : "border-blue-400 bg-blue-100"
              }`}
              style={{
                left: `${(previewStructure.position_x / magasinLongueur) * 100}%`,
                top: `${(previewStructure.position_y / magasinLargeur) * 100}%`,
                width: `${(previewStructure.width / magasinLongueur) * 100}%`,
                height: `${(previewStructure.height / magasinLargeur) * 100}%`,
                transform: `rotate(${getOrientationDegrees(previewStructure.orientation)}deg)`,
                transformOrigin: "center",
                minWidth: "20px",
                minHeight: "20px",
                pointerEvents: "none",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {previewStructure.type === "door" ? (
                  <DoorOpen className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-amber-600" />
                ) : (
                  <Square className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-600" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
