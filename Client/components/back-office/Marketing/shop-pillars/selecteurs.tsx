"\"use client"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { Magasin, Zone } from "@/lib/gamification"

interface SelecteursProps {
  stores: Magasin[]
  availableZones: Zone[]
  selectedMagasinFilter: string
  setSelectedMagasinFilter: (value: string) => void
  selectedZoneTypeFilter: string
  setSelectedZoneTypeFilter: (value: string) => void
  startDateZoning: string
  setStartDateZoning: (value: string) => void
  endDateZoning: string
  setEndDateZoning: (value: string) => void
  zoningDateError: string | null
  isLoadingUserAndStores: boolean
  errorUserAndStores: string | null
  isLoadingZones: boolean
  errorZones: string | null
}

export function Selecteurs({
  stores,
  availableZones,
  selectedMagasinFilter,
  setSelectedMagasinFilter,
  selectedZoneTypeFilter,
  setSelectedZoneTypeFilter,
  startDateZoning,
  setStartDateZoning,
  endDateZoning,
  setEndDateZoning,
  zoningDateError,
  isLoadingUserAndStores,
  errorUserAndStores,
  isLoadingZones,
  errorZones,
}: SelecteursProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="store-filter">Magasin</Label>
        <Select value={selectedMagasinFilter} onValueChange={setSelectedMagasinFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un magasin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les magasins</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store.magasin_id} value={store.magasin_id}>
                {store.nom_magasin}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="zone-type-filter">Type de Zone</Label>
        <Select value={selectedZoneTypeFilter} onValueChange={setSelectedZoneTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un type de zone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types de zone</SelectItem>
            {availableZones.map((zone) => (
              <SelectItem key={zone.zone_id} value={zone.zone_id}>
                {zone.nom_zone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Période</Label>
        <div className="flex space-x-2">
          <Input
            type="date"
            value={startDateZoning}
            onChange={(e) => setStartDateZoning(e.target.value)}
            className="w-1/2"
          />
          <Input
            type="date"
            value={endDateZoning}
            onChange={(e) => setEndDateZoning(e.target.value)}
            className="w-1/2"
          />
        </div>
        {zoningDateError && <p className="text-red-500 text-sm">{zoningDateError}</p>}
      </div>
    </div>
  )
}
"\
