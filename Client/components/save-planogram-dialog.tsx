"use client"

import { useState, useEffect } from "react"
import { Grid } from "lucide-react"
import { useTranslation } from "react-i18next"
import i18next from "i18next"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Interface pour les magasins
interface Magasin {
  magasin_id: string
  nom_magasin: string
  adresse?: string
}

export function SavePlanogramDialog({ planogramConfig, cells, products, productInstances, onSave, children }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [name, setName] = useState(planogramConfig.name)
  const [description, setDescription] = useState("")
  const [magasins, setMagasins] = useState<Magasin[]>([])
  const [selectedMagasinId, setSelectedMagasinId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const isArabic = i18next.language === "ar"

  const placedProductsCount = cells.filter((cell) => cell.instanceId !== null).length

  // Charger la liste des magasins au chargement du composant
  useEffect(() => {
    const fetchMagasins = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("http://localhost:8081/api/magasins/getAllMagasins")
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        const data = await response.json()
        setMagasins(data)

        // Si des magasins sont disponibles, sélectionner le premier par défaut
        if (data.length > 0) {
          setSelectedMagasinId(data[0].id)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des magasins:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des magasins",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMagasins()
  }, [toast])

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
    if (!selectedMagasinId) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner un magasin",
        variant: "destructive",
      })
      return
    }

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
            storeId: selectedMagasinId, // Ensure the store ID is passed correctly
          })
        }
      }
    })

    // Convert the map values to an array of furniture products
    const furnitureProducts = Array.from(processedProducts.values())

    // Log the products being saved (for debugging)
    console.log("Saving planogram with products:", furnitureProducts)
    console.log("Selected magasin ID:", selectedMagasinId)

    // Find the selected store's name
    const selectedStore = magasins.find((m) => m.magasin_id === selectedMagasinId)
    const storeName = selectedStore ? selectedStore.nom_magasin : ""

    // Call the original onSave function with the name, description, processed products, and store info
    onSave(name, description, furnitureProducts, selectedMagasinId, storeName)
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
              dir={isArabic ? "rtl" : "ltr"}
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t("savePlanogramDialog.descriptionLabel")}</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              placeholder={t("savePlanogramDialog.descriptionPlaceholder")}
              dir={isArabic ? "rtl" : "ltr"}
            />
          </div>

          {/* Sélection du magasin */}
          <div>
            <label className="text-sm font-medium">Magasin</label>
            <Select
              value={selectedMagasinId}
              onValueChange={setSelectedMagasinId}
              disabled={isLoading || magasins.length === 0}
            >
              <SelectTrigger className="mt-1" dir={isArabic ? "rtl" : "ltr"}>
                <SelectValue placeholder="Sélectionner un magasin" />
              </SelectTrigger>
              <SelectContent>
                {magasins.map((magasin) => (
                  <SelectItem key={magasin.magasin_id} value={magasin.magasin_id}>
                    {magasin.magasin_id} : {magasin.nom_magasin}
                  </SelectItem>
                ))}
                {magasins.length === 0 && !isLoading && (
                  <SelectItem value="no-stores" disabled>
                    Aucun magasin disponible
                  </SelectItem>
                )}
                {isLoading && (
                  <SelectItem value="loading" disabled>
                    Chargement...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
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
                  {/* Afficher le magasin sélectionné */}
                  {selectedMagasinId && (
                    <p className="text-sm text-muted-foreground">
                      Magasin: {magasins.find((m) => m.id === selectedMagasinId)?.nom || ""}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        <DialogFooter className={isArabic ? "justify-start" : "justify-end"}>
          <DialogClose asChild>
            <Button variant="outline">{t("cancel")}</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={!selectedMagasinId || isLoading}>
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
