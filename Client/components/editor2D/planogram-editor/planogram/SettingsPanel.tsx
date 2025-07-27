"use client"

import type React from "react"

import { useTranslation } from "react-i18next"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import type { PlanogramConfig } from "@/lib/planogram"

interface SettingsPanelProps {
  planogramConfig: PlanogramConfig
  setPlanogramConfig: (config: PlanogramConfig) => void
  defaultQuantity: number
  setDefaultQuantity: (quantity: number) => void
  zoom: number
  setZoom: (zoom: number) => void
  productSizeScale: number
  setProductSizeScale: (scale: number) => void
}

export function SettingsPanel({
  planogramConfig,
  setPlanogramConfig,
  defaultQuantity,
  setDefaultQuantity,
  zoom,
  setZoom,
  productSizeScale,
  setProductSizeScale,
}: SettingsPanelProps) {
  const { t } = useTranslation()

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlanogramConfig({ ...planogramConfig, name: e.target.value })
  }

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rows = Number.parseInt(e.target.value)
    if (!isNaN(rows) && rows > 0) {
      setPlanogramConfig({ ...planogramConfig, rows })
    }
  }

  const handleColumnsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const columns = Number.parseInt(e.target.value)
    if (!isNaN(columns) && columns > 0) {
      setPlanogramConfig({ ...planogramConfig, columns })
    }
  }

  const handleCellWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cellWidth = Number.parseInt(e.target.value)
    if (!isNaN(cellWidth) && cellWidth > 0) {
      setPlanogramConfig({ ...planogramConfig, cellWidth })
    }
  }

  const handleCellHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cellHeight = Number.parseInt(e.target.value)
    if (!isNaN(cellHeight) && cellHeight > 0) {
      setPlanogramConfig({ ...planogramConfig, cellHeight })
    }
  }

  const handleDefaultQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = Number.parseInt(e.target.value)
    if (!isNaN(quantity) && quantity > 0) {
      setDefaultQuantity(quantity)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="planogram-name">{t("productImport.planogramName")}</Label>
        <Input
          id="planogram-name"
          value={planogramConfig.name}
          onChange={handleNameChange}
          placeholder={t("productImport.enterPlanogramName")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rows">{t("productImport.rows")}</Label>
          <Input id="rows" type="number" min="1" value={planogramConfig.rows} onChange={handleRowsChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="columns">{t("productImport.columns")}</Label>
          <Input id="columns" type="number" min="1" value={planogramConfig.columns} onChange={handleColumnsChange} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cell-width">{t("productImport.cellWidth")}</Label>
          <Input
            id="cell-width"
            type="number"
            min="50"
            value={planogramConfig.cellWidth}
            onChange={handleCellWidthChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cell-height">{t("productImport.cellHeight")}</Label>
          <Input
            id="cell-height"
            type="number"
            min="50"
            value={planogramConfig.cellHeight}
            onChange={handleCellHeightChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="default-quantity">{t("productImport.defaultQuantity")}</Label>
        <Input
          id="default-quantity"
          type="number"
          min="1"
          value={defaultQuantity}
          onChange={handleDefaultQuantityChange}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="zoom">{t("productImport.zoom")}</Label>
          <span className="text-sm text-muted-foreground">{zoom}%</span>
        </div>
        <Slider id="zoom" min={50} max={200} step={5} value={[zoom]} onValueChange={(values) => setZoom(values[0])} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="product-size">{t("productImport.productSize3D")}</Label>
          <span className="text-sm text-muted-foreground">{productSizeScale}%</span>
        </div>
        <Slider
          id="product-size"
          min={50}
          max={300}
          step={10}
          value={[productSizeScale]}
          onValueChange={(values) => setProductSizeScale(values[0])}
        />
      </div>
    </div>
  )
}
