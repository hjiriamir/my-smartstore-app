"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useTranslation } from "react-i18next"
import { ENVIRONMENT_PRESETS } from "@/lib/constants"

interface VisualizationSettingsProps {
  lightIntensity: number
  setLightIntensity: (intensity: number) => void
  environmentPreset: string
  setEnvironmentPreset: (preset: string) => void
  showShadows: boolean
  setShowShadows: (show: boolean) => void
  isMobile?: boolean
}

export const VisualizationSettings = ({
  lightIntensity,
  setLightIntensity,
  environmentPreset,
  setEnvironmentPreset,
  showShadows,
  setShowShadows,
  isMobile = false,
}: VisualizationSettingsProps) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  return (
    <div className={`space-y-4 p-2 sm:p-4 border rounded-md mt-4 ${isMobile ? "text-sm" : ""}`} dir={textDirection}>
      <h3 className={`font-medium ${isMobile ? "text-base" : ""}`}>{t("productImport.floorPlan.visualSettings")}</h3>
      <div className="space-y-3">
        <div>
          <Label htmlFor="light-intensity" className={isMobile ? "text-xs" : "text-sm"}>
            {t("productImport.floorPlan.intensite")} {Math.round(lightIntensity * 100)}%
          </Label>
          <Slider
            id="light-intensity"
            min={0.2}
            max={1.5}
            step={0.1}
            value={[lightIntensity]}
            onValueChange={(value) => setLightIntensity(value[0])}
            className={isMobile ? "mt-2" : ""}
          />
        </div>
        <div>
          <Label htmlFor="environment-preset" className={isMobile ? "text-xs" : "text-sm"}>
            {t("productImport.floorPlan.environnement")}
          </Label>
          <select
            id="environment-preset"
            value={environmentPreset}
            onChange={(e) => setEnvironmentPreset(e.target.value)}
            className={`w-full rounded-md border border-input bg-background px-3 py-1 shadow-sm transition-colors ${
              isMobile ? "h-8 text-sm" : "h-9 text-sm"
            }`}
          >
            {ENVIRONMENT_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="show-shadows"
            checked={showShadows}
            onChange={(e) => setShowShadows(e.target.checked)}
            className={`rounded border-gray-300 text-primary focus:ring-primary ${isMobile ? "h-3 w-3" : "h-4 w-4"}`}
          />
          <Label htmlFor="show-shadows" className={isMobile ? "text-xs" : "text-sm"}>
            {t("productImport.floorPlan.ombre")}
          </Label>
        </div>
      </div>
    </div>
  )
}
