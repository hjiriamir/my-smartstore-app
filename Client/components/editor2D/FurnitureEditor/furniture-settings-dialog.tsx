"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Plus, Minus, Settings } from "lucide-react"
import type { FurnitureItem } from "@/components/types/furniture-types"

interface FurnitureSettingsDialogProps {
  furniture: FurnitureItem
  updateFurniture: (furniture: FurnitureItem) => void
}

export function FurnitureSettingsDialog({ furniture, updateFurniture }: FurnitureSettingsDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  const [localFurniture, setLocalFurniture] = useState<FurnitureItem>({ ...furniture })

  const handleChange = (key: keyof FurnitureItem, value: any) => {
    setLocalFurniture((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    updateFurniture(localFurniture)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          {t("productImport.settings")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("furnitureEditor.settings")}</DialogTitle>
          <DialogDescription>{t("furnitureEditor.configuration")}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">{t("general")}</TabsTrigger>
            <TabsTrigger value="appearance">{t("furnitureEditor.apparence")}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">{t("productImport.floorPlan.nomMeuble")}</label>
              <Input
                value={localFurniture.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("furnitureEditor.sections")}</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleChange("sections", Math.max(1, localFurniture.sections - 1))}
                    disabled={localFurniture.sections <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={localFurniture.sections}
                    onChange={(e) => handleChange("sections", Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleChange("sections", localFurniture.sections + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("furnitureEditor.emplacement")}</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleChange("slots", Math.max(1, localFurniture.slots - 1))}
                    disabled={localFurniture.slots <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={localFurniture.slots}
                    onChange={(e) => handleChange("slots", Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="text-center"
                  />
                  <Button variant="outline" size="icon" onClick={() => handleChange("slots", localFurniture.slots + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("productImport.width")} (m)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={localFurniture.width}
                  onChange={(e) => handleChange("width", Number.parseFloat(e.target.value))}
                  className="text-center"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("productImport.height")} (m)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={localFurniture.height}
                  onChange={(e) => handleChange("height", Number.parseFloat(e.target.value))}
                  className="text-center"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("productImport.depth")} (m)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={localFurniture.depth}
                  onChange={(e) => handleChange("depth", Number.parseFloat(e.target.value))}
                  className="text-center"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("furnitureEditor.couleur")}</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={localFurniture.color || "#333333"}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={localFurniture.color || "#333333"}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("cancel")}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleSave}>{t("appliquer")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
