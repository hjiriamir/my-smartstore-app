"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Trash2, AlertTriangle } from "lucide-react"
import type { Zone } from "@/types/magasin-types"

interface ZonesListProps {
  zones: Zone[]
  zoneToDelete: string | null
  isDeletingZone: boolean
  onDeleteZone: (zoneId: number) => void
  onSetZoneToDelete: (zoneId: string | null) => void
}

export function ZonesList({ zones, zoneToDelete, isDeletingZone, onDeleteZone, onSetZoneToDelete }: ZonesListProps) {
  return (
    <>
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
            <div className="bg-white/20 rounded-full p-1.5 sm:p-2">
              <MapPin className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <span className="text-sm sm:text-xl">Détails des Zones ({zones.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                style={{ borderColor: zone.couleur || "#3B82F6" }}
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: zone.couleur || "#3B82F6" }}
                    />
                    <h4 className="font-semibold text-sm sm:text-base truncate">{zone.nom_zone}</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSetZoneToDelete(zone.id.toString())}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 sm:p-2 flex-shrink-0"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>

                {zone.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                    {zone.description}
                  </p>
                )}

                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="border-b pb-2">
                    <p className="font-medium text-muted-foreground mb-1 text-xs sm:text-sm">Dimensions:</p>
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block">L:</span>
                        <span className="font-medium text-xs sm:text-sm">{zone.longueur || 0}m</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block">l:</span>
                        <span className="font-medium text-xs sm:text-sm">{zone.largeur || 0}m</span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block">H:</span>
                        <span className="font-medium text-xs sm:text-sm">{zone.hauteur || 0}m</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-2">
                    <p className="font-medium text-muted-foreground mb-1 text-xs sm:text-sm">Position:</p>
                    <div className="grid grid-cols-2 gap-1 sm:gap-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">X:</span>
                        <span className="font-medium text-xs sm:text-sm">{zone.position_x}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Y:</span>
                        <span className="font-medium text-xs sm:text-sm">{zone.position_y}m</span>
                      </div>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <span className="text-xs text-muted-foreground">Orientation:</span>
                      <span className="font-medium text-xs sm:text-sm">{zone.orientation || "Nord"}</span>
                    </div>
                  </div>

                  <div className="border-b pb-2">
                    <p className="font-medium text-muted-foreground mb-1 text-xs sm:text-sm">Environnement:</p>
                    <div className="space-y-1">
                      {zone.temperature && (
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Température:</span>
                          <span className="font-medium text-xs sm:text-sm">{zone.temperature}°C</span>
                        </div>
                      )}
                      {zone.eclairage && (
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Éclairage:</span>
                          <span className="font-medium text-xs sm:text-sm">{zone.eclairage}</span>
                        </div>
                      )}
                      {zone.emplacement && (
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Emplacement:</span>
                          <span className="font-medium text-xs truncate ml-2">{zone.emplacement}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">ID Zone:</span>
                      <span className="font-medium text-xs sm:text-sm">{zone.zone_id}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Superficie:</span> 
                        <span className="font-medium text-xs sm:text-sm">
                        {zone.longueur && zone.largeur 
                            ? (zone.longueur * zone.largeur).toFixed(2) 
                            : 0} m²
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {zoneToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full mx-4 sm:mx-0">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-red-600 text-lg sm:text-xl">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                Confirmer la suppression
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <p className="text-sm sm:text-base">
                Êtes-vous sûr de vouloir supprimer cette zone ? Cette action est irréversible.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => onSetZoneToDelete(null)}
                  className="w-full sm:w-auto text-sm h-9 sm:h-10 bg-transparent"
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => onDeleteZone(Number(zoneToDelete))}
                  disabled={isDeletingZone}
                  className="w-full sm:w-auto text-sm h-9 sm:h-10"
                >
                  {isDeletingZone ? (
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  )}
                  {isDeletingZone ? "Suppression..." : "Supprimer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
