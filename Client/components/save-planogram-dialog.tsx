"use client"

import { useState } from "react"
import { Grid } from "lucide-react"
import { useTranslation } from "react-i18next"
import i18next from "i18next" // <-- à importer pour accéder à la langue actuelle

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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export function SavePlanogramDialog({ planogramConfig, cells, products, productInstances, onSave, children }) {
  const { t } = useTranslation()
  const [name, setName] = useState(planogramConfig.name)
  const [description, setDescription] = useState("")

  const isArabic = i18next.language === "ar"

  const placedProductsCount = cells.filter((cell) => cell.instanceId !== null).length

  // Helper function to determine the side based on position for shelves display
  const getSideFromPosition = (x, totalColumns) => {
    const columnQuarter = totalColumns / 4
    if (x < columnQuarter) {
      return "left"
    } else if (x >= columnQuarter && x < columnQuarter * 2) {
      return "front"
    } else if (x >= columnQuarter * 2 && x < columnQuarter * 3) {
      return "back"
    } else {
      return "right"
    }
  }

  const handleSave = () => {
    // Get the cells that have products and match the current furniture type
    const relevantCells = cells.filter(
      (cell) => cell.instanceId !== null && cell.furnitureType === planogramConfig.furnitureType,
    )

    // Create a map to track which products have been processed
    const processedProducts = new Map()

    // Process each cell to create furniture products with quantities
    relevantCells.forEach((cell) => {
      const productInstance = productInstances.find((pi) => pi.instanceId === cell.instanceId)
      if (productInstance) {
        // Create a unique key for this product's position
        const positionKey = `${cell.y}-${cell.x}`

        // If we haven't processed this position yet, add it to the map
        if (!processedProducts.has(positionKey)) {
          processedProducts.set(positionKey, {
            productId: productInstance.productId,
            section: cell.y,
            position: cell.x,
            quantity: cell.quantity || 1, // Use the cell's quantity or default to 1
            // Add side information for shelves-display type
            side:
              cell.side ||
              (planogramConfig.furnitureType === "shelves-display"
                ? getSideFromPosition(cell.x, planogramConfig.columns)
                : undefined),
          })
        }
      }
    })

    // Convert the map values to an array of furniture products
    const furnitureProducts = Array.from(processedProducts.values())

    // Log the products being saved (for debugging)
    console.log("Saving planogram with products:", furnitureProducts)

    // Call the original onSave function with the name, description, and processed products
    onSave(name, description, furnitureProducts)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={`sm:max-w-[500px] ${isArabic ? "text-right rtl" : ""}`}>
        <DialogHeader>
          <DialogTitle>{t("savePlanogramDialog.title")}</DialogTitle>
          <DialogDescription>{t("savePlanogramDialog.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium">{t("savePlanogramDialog.nameLabel")}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              placeholder={t("savePlanogramDialog.namePlaceholder")}
              dir={isArabic ? "rtl" : "ltr"} // <-- pour l'input
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t("savePlanogramDialog.descriptionLabel")}</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              placeholder={t("savePlanogramDialog.descriptionPlaceholder")}
              dir={isArabic ? "rtl" : "ltr"} // <-- pour l'input
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("savePlanogramDialog.previewLabel")}</label>
            <Card className="p-4 bg-muted/20">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-muted/30 rounded-md flex items-center justify-center">
                  <Grid className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-medium">{name || t("savePlanogramDialog.unnamed")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("savePlanogramDialog.dimensions", {
                      rows: planogramConfig.rows,
                      columns: planogramConfig.columns,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("savePlanogramDialog.placedProducts", { count: placedProductsCount })}
                  </p>
                  {/* Display the number of products with quantities greater than 1 */}
                  <p className="text-sm text-muted-foreground">
                    {t("savePlanogramDialog.multipleQuantityProducts", {
                      count: cells.filter((cell) => cell.instanceId !== null && (cell.quantity || 1) > 1).length,
                    })}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <DialogFooter className={isArabic ? "justify-start" : "justify-end"}>
          <DialogClose asChild>
            <Button variant="outline">{t("cancel")}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleSave}>{t("save")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
