"use client"

import { Calendar, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"

// Interfaces (doit être les mêmes que dans shop-pillars-page.tsx ou importées)
interface Magasin {
  magasin_id: string
  nom_magasin: string
}

interface Zone {
  zone_id: string
  nom_zone: string
  description: string
}

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
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  // Classes RTL optimisées
  const rtlClasses = {
    container: isRTL ? "rtl" : "ltr",
    textAlign: isRTL ? "text-right" : "text-left",
    textAlignOpposite: isRTL ? "text-left" : "text-right",
    flexRow: isRTL ? "flex-row-reverse" : "flex-row",
    flexRowReverse: isRTL ? "flex-row" : "flex-row-reverse",
    marginLeft: isRTL ? "mr-2" : "ml-2",
    marginRight: isRTL ? "ml-2" : "mr-2",
    paddingLeft: isRTL ? "pr-3" : "pl-3",
    paddingRight: isRTL ? "pl-3" : "pr-3",
    borderLeft: isRTL ? "border-r" : "border-l",
    borderRight: isRTL ? "border-l" : "border-r",
    roundedLeft: isRTL ? "rounded-r" : "rounded-l",
    roundedRight: isRTL ? "rounded-l" : "rounded-r",
    spaceX: isRTL ? "space-x-reverse space-x-4" : "space-x-4",
    directionClass: isRTL ? "flex-row-reverse" : "flex-row",
    inputPadding: isRTL ? "pr-10 pl-4" : "pl-10 pr-4",
    buttonSpacing: isRTL ? "space-x-reverse space-x-2" : "space-x-2",
    gridFlow: isRTL ? "grid-flow-col-dense" : "",
    justifyBetween: "justify-between",
    itemsCenter: "items-center",
    formSpacing: "space-y-4",
    cardPadding: "p-3 sm:p-4",
    labelSpacing: "mb-1",
    selectTrigger: isRTL ? "text-right" : "text-left",
    calendarIcon: isRTL ? "left-3" : "right-3",
    inputAlign: isRTL ? "text-right" : "text-left",
  }

  return (
    <div
      className={`${rtlClasses.container} bg-white/50 backdrop-blur-sm ${rtlClasses.cardPadding} rounded-lg border shadow-sm`}
      dir={textDirection}
    >
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${rtlClasses.gridFlow}`}>
        {/* Store Selector */}
        <div>
          <Label
            htmlFor="store-selector"
            className={`block text-sm font-medium text-slate-700 ${rtlClasses.labelSpacing} ${rtlClasses.textAlign}`}
          >
            {t("marketing.pilliersMagasins.selecteur.selectMagsin")}
          </Label>
          {isLoadingUserAndStores ? (
            <div
              className={`flex ${rtlClasses.itemsCenter} justify-center h-10 w-full bg-white border border-slate-300 rounded-lg`}
            >
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            </div>
          ) : errorUserAndStores ? (
            <p className={`text-red-500 text-sm ${rtlClasses.textAlign}`}>{errorUserAndStores}</p>
          ) : (
            <Select value={selectedMagasinFilter} onValueChange={setSelectedMagasinFilter}>
              <SelectTrigger
                className={`w-full ${rtlClasses.paddingLeft} ${rtlClasses.paddingRight} py-2 ${rtlClasses.selectTrigger} bg-white border border-slate-300 rounded-lg shadow-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
              >
                <SelectValue placeholder={t("marketing.pilliersMagasins.selecteur.selectZone")} />
              </SelectTrigger>
              <SelectContent className="z-50 mt-1 w-full bg-white shadow-lg rounded-lg border border-slate-200 py-1 max-h-60 overflow-auto">
                <SelectItem value="all" className="px-4 py-2 hover:bg-slate-50 cursor-pointer">
                  {t("marketing.pilliersMagasins.selecteur.tousMagasins")}
                </SelectItem>
                {stores.map((store) => (
                  <SelectItem
                    key={store.magasin_id}
                    value={store.magasin_id}
                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer"
                  >
                    {store.nom_magasin}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Zone Type Selector */}
        <div>
          <Label
            htmlFor="zone-type-selector"
            className={`block text-sm font-medium text-slate-700 ${rtlClasses.labelSpacing} ${rtlClasses.textAlign}`}
          >
            {t("marketing.pilliersMagasins.selecteur.tousMagasins")}
          </Label>
          {isLoadingZones ? (
            <div
              className={`flex ${rtlClasses.itemsCenter} justify-center h-10 w-full bg-white border border-slate-300 rounded-lg`}
            >
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            </div>
          ) : errorZones ? (
            <p className={`text-red-500 text-sm ${rtlClasses.textAlign}`}>{errorZones}</p>
          ) : (
            <Select
              value={selectedZoneTypeFilter}
              onValueChange={setSelectedZoneTypeFilter}
              disabled={selectedMagasinFilter === "all" || availableZones.length === 0}
            >
              <SelectTrigger
                className={`w-full ${rtlClasses.paddingLeft} ${rtlClasses.paddingRight} py-2 ${rtlClasses.selectTrigger} bg-white border border-slate-300 rounded-lg shadow-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
              >
                <SelectValue placeholder={t("marketing.pilliersMagasins.selecteur.tousZone")} />
              </SelectTrigger>
              <SelectContent className="z-50 mt-1 w-full bg-white shadow-lg rounded-lg border border-slate-200 py-1 max-h-60 overflow-auto">
                <SelectItem value="all" className="px-4 py-2 hover:bg-slate-50 cursor-pointer">
                  {t("marketing.pilliersMagasins.selecteur.tousZone")}
                </SelectItem>
                {/* Extract unique zone types from availableZones */}
                {[...new Set(availableZones.map((zone) => zone.zone_id))].map((zone_id) => {
                  const zone = availableZones.find((z) => z.zone_id === zone_id)
                  return zone ? (
                    <SelectItem
                      key={zone.zone_id}
                      value={zone.zone_id}
                      className="px-4 py-2 hover:bg-slate-50 cursor-pointer"
                    >
                      {zone.nom_zone}
                    </SelectItem>
                  ) : null
                })}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Date de début */}
        <div>
          <Label htmlFor="zoning-start-date" className={`text-sm ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}>
            {t("marketing.pilliersMagasins.selecteur.dateDebut")}
          </Label>
          <div className="relative">
            <Input
              type="date"
              id="zoning-start-date"
              className={`text-sm ${rtlClasses.inputPadding} ${rtlClasses.inputAlign}`}
              value={startDateZoning}
              onChange={(e) => setStartDateZoning(e.target.value)}
              dir={textDirection}
            />
            <Calendar
              className={`absolute ${rtlClasses.calendarIcon} top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500`}
            />
          </div>
        </div>

        {/* Date de fin */}
        <div>
          <Label htmlFor="zoning-end-date" className={`text-sm ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}>
            {t("marketing.pilliersMagasins.selecteur.dateFin")}
          </Label>
          <div className="relative">
            <Input
              type="date"
              id="zoning-end-date"
              className={`text-sm ${rtlClasses.inputPadding} ${rtlClasses.inputAlign}`}
              value={endDateZoning}
              onChange={(e) => setEndDateZoning(e.target.value)}
              dir={textDirection}
            />
            <Calendar
              className={`absolute ${rtlClasses.calendarIcon} top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500`}
            />
          </div>
        </div>
      </div>
      {zoningDateError && <p className={`text-red-500 text-xs mt-2 ${rtlClasses.textAlign}`}>{zoningDateError}</p>}
    </div>
  )
}
