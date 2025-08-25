"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Store, MapPin, Info, CheckCircle, Ruler } from "lucide-react"
import type { EntrepriseStats, MagasinDetails } from "../../../../types/magasin-types"

interface MagasinSelectorProps {
  entrepriseStats: EntrepriseStats | null
  magasinSelectionne: MagasinDetails | null
  onMagasinChange: (magasinId: string) => void
  onClearSelection: () => void
}

export function MagasinSelector({
  entrepriseStats,
  magasinSelectionne,
  onMagasinChange,
  onClearSelection,
}: MagasinSelectorProps) {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="bg-white/20 rounded-full p-2">
            <Store className="h-6 w-6" />
          </div>
          Sélectionner un magasin
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {!magasinSelectionne ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Choisissez un magasin dans la liste ci-dessous pour visualiser ses zones et gérer son plan.
              </p>
            </div>
            <Select onValueChange={onMagasinChange}>
              <SelectTrigger className="w-full h-12 text-lg">
                <SelectValue placeholder="🏪 Choisissez un magasin..." />
              </SelectTrigger>
              <SelectContent>
                {entrepriseStats?.magasins.map((magasin) => (
                  <SelectItem key={magasin.magasin_id} value={magasin.magasin_id} className="text-lg py-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{magasin.nom_magasin}</div>
                        <div className="text-sm text-gray-500">{magasin.adresse}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 rounded-full p-2">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-800">{entrepriseStats?.totalMagasins || 0}</p>
                    <p className="text-sm text-green-600">Magasins disponibles</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600 rounded-full p-2">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-800">{entrepriseStats?.totalZones || 0}</p>
                    <p className="text-sm text-purple-600">Zones totales</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-600 rounded-full p-2">
                    <Ruler className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-800">{entrepriseStats?.surfaceTotal || 0}</p>
                    <p className="text-sm text-orange-600">m² de surface totale</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Magasin sélectionné: {magasinSelectionne.nom_magasin}</span>
            </div>
            <Button variant="outline" onClick={onClearSelection} className="text-sm bg-transparent">
              Changer de magasin
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
