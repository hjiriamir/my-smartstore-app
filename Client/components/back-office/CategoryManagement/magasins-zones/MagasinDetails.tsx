"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Store, Ruler, Plus } from "lucide-react"
import type { MagasinDetails } from "@/types/magasin-types"

interface MagasinDetailsProps {
  magasin: MagasinDetails
  loadingDetails: boolean
  showAddZoneForm: boolean
  onToggleAddZoneForm: () => void
}

export function MagasinDetailsComponent({
  magasin,
  loadingDetails,
  showAddZoneForm,
  onToggleAddZoneForm,
}: MagasinDetailsProps) {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
          <div className="bg-white/20 rounded-full p-1.5 sm:p-2">
            <MapPin className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <span className="truncate">{magasin.nom_magasin}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {loadingDetails ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Adresse</p>
              <p className="font-medium text-sm sm:text-base">{magasin.adresse}</p>
              <p className="font-medium text-sm sm:text-base">{magasin.ville}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Téléphone</p>
              <p className="font-medium text-sm sm:text-base">{magasin.telephone}</p>
            </div>

            <div className="flex items-start sm:items-center gap-2">
              <Store className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0 mt-0.5 sm:mt-0" />
              <span className="text-xs sm:text-sm leading-relaxed">{magasin.horaires}</span>
            </div>

            <div className="border-t pt-3 sm:pt-4">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 flex items-center gap-2">
                <Ruler className="h-3 w-3 sm:h-4 sm:w-4" />
                Dimensions du magasin
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex justify-between sm:block">
                  <span className="text-muted-foreground">Longueur:</span>
                  <p className="font-medium sm:mt-1">{magasin.longueur} m</p>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="text-muted-foreground">Largeur:</span>
                  <p className="font-medium sm:mt-1">{magasin.largeur} m</p>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="text-muted-foreground">Surface:</span>
                  <p className="font-medium sm:mt-1">{magasin.surface} m²</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-3 sm:pt-4">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">Zones de couverture</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {magasin.zones.map((zone) => (
                  <Badge
                    key={zone.id}
                    variant="secondary"
                    className="text-xs px-2 py-1"
                    style={{
                      backgroundColor: (zone.couleur || "#3B82F6") + "20",
                      color: zone.couleur || "#3B82F6",
                    }}
                  >
                    {zone.nom_zone}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="border-t pt-3 sm:pt-4 space-y-2">
              <Button
                onClick={onToggleAddZoneForm}
                className="w-full text-sm sm:text-base h-9 sm:h-10"
                variant={showAddZoneForm ? "outline" : "default"}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                {showAddZoneForm ? "Annuler" : "Ajouter une zone"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
