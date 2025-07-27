"use client"

import { useTranslation } from "react-i18next"
import { Grid, CuboidIcon as Cube, Layers } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { FurnitureTypes } from "@/lib/furniture"
import type { PlanogramConfig } from "@/lib/planogram"

interface FurniturePanelProps {
  planogramConfig: PlanogramConfig
  setPlanogramConfig: (config: PlanogramConfig | ((prev: PlanogramConfig) => PlanogramConfig)) => void
}

export const FurniturePanel = ({ planogramConfig, setPlanogramConfig }: FurniturePanelProps) => {
  const { t } = useTranslation()

  const updatePlanogramConfig = (key: keyof PlanogramConfig, value: any) => {
    setPlanogramConfig((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card
          className={`cursor-pointer border-2 ${
            planogramConfig.furnitureType === FurnitureTypes.PLANOGRAM ? "border-primary" : "border-muted"
          }`}
          onClick={() => updatePlanogramConfig("furnitureType", FurnitureTypes.PLANOGRAM)}
        >
          <CardContent className="p-4 flex flex-col items-center">
            <div className="h-32 w-32 bg-muted/20 rounded-md flex items-center justify-center mb-2">
              <Grid className="h-16 w-16 text-muted-foreground" />
            </div>
            <span className="font-medium">{t("productImport.meubleTitle")} </span>
            <span className="text-xs text-muted-foreground">{t("productImport.meubleDescription")}</span>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer border-2 ${
            planogramConfig.furnitureType === FurnitureTypes.GONDOLA ? "border-primary" : "border-muted"
          }`}
          onClick={() => updatePlanogramConfig("furnitureType", FurnitureTypes.GONDOLA)}
        >
          <CardContent className="p-4 flex flex-col items-center">
            <div className="h-32 w-32 bg-muted/20 rounded-md flex items-center justify-center mb-2">
              <Cube className="h-16 w-16 text-muted-foreground" />
            </div>
            <span className="font-medium">{t("productImport.meubleTitle1")} </span>
            <span className="text-xs text-muted-foreground">{t("productImport.meubleDescription1")}</span>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer border-2 ${
            planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY ? "border-primary" : "border-muted"
          }`}
          onClick={() => updatePlanogramConfig("furnitureType", FurnitureTypes.SHELVES_DISPLAY)}
        >
          <CardContent className="p-4 flex flex-col items-center">
            <div className="h-32 w-32 bg-muted/20 rounded-md flex items-center justify-center mb-2">
              <Layers className="h-16 w-16 text-muted-foreground" />
            </div>
            <span className="font-medium">{t("productImport.meubleTitle2")}</span>
            <span className="text-xs text-muted-foreground">{t("productImport.meubleDescription2")}</span>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-muted/20 rounded-md">
        <h3 className="font-medium mb-2">{t("productImport.selectedmeubleinfo")}</h3>
        {planogramConfig.furnitureType === FurnitureTypes.SHELVES_DISPLAY ? (
          <p className="text-sm text-muted-foreground">{t("productImport.selectedmeubledescription2")}</p>
        ) : planogramConfig.furnitureType === FurnitureTypes.PLANOGRAM ? (
          <p className="text-sm text-muted-foreground">{t("productImport.selectedmeubledescription")}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{t("productImport.selectedmeubledescription1")}</p>
        )}
      </div>

      <div className="p-4 border rounded-md">
        <h3 className="font-medium mb-2">{t("productImport.currentDimensions")}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <strong>{t("productImport.width")}:</strong> {planogramConfig.furnitureDimensions.width}m
            </p>
            <p>
              <strong>{t("productImport.height")}:</strong> {planogramConfig.furnitureDimensions.height}m
            </p>
            <p>
              <strong>{t("productImport.depth")}:</strong> {planogramConfig.furnitureDimensions.depth}m
            </p>
          </div>
          <div>
            <p>
              <strong>{t("productImport.baseHeight")}:</strong> {planogramConfig.furnitureDimensions.baseHeight}m
            </p>
            <p>
              <strong>{t("productImport.shelfThickness")}:</strong> {planogramConfig.furnitureDimensions.shelfThickness}
              m
            </p>
            <p>
              <strong>{t("productImport.spacing")}:</strong>{" "}
              {(planogramConfig.furnitureDimensions.height / planogramConfig.rows).toFixed(2)}m
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
