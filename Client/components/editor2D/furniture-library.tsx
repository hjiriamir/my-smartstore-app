"use client"

import { useState } from "react"
import Link from "next/link"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { ConfirmationModal } from "./ConfirmationModal";
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  Grid,
  CuboidIcon as Cube,
  Table,
  Shirt,
  ArrowUpDown,
  ArrowRight,
  ArrowLeft
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useFurnitureStore } from "@/lib/furniture-store"
import { useProductStore } from "@/lib/product-store"
import {
  WallDisplay,
  ClothingRack,
  AccessoryDisplay,
  ModularCube,
  GondolaDisplay,
  TableDisplay,
} from "@/components/editor2D/furniture-3d-components"
import type { FurnitureType, SavedFurniture } from "@/lib/furniture-store"

// Furniture Card Component
const FurnitureCard = ({ furniture, onEdit, onDelete, onUse }) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const { products } = useProductStore()
  const [showPreview, setShowPreview] = useState(false)

  // Get furniture icon
  const getFurnitureIcon = (type: FurnitureType) => {
    switch (type) {
      case "clothing-rack":
        return <Shirt className="h-6 w-6 text-muted-foreground" />
      case "wall-display":
        return <Grid className="h-6 w-6 text-muted-foreground" />
      case "accessory-display":
        return <Package className="h-6 w-6 text-muted-foreground" />
      case "modular-cube":
        return <Cube className="h-6 w-6 text-muted-foreground" />
      case "gondola":
        return <Grid className="h-6 w-6 text-muted-foreground" />
      case "table":
        return <Table className="h-6 w-6 text-muted-foreground" />
      default:
        return <Package className="h-6 w-6 text-muted-foreground" />
    }
  }

  // Render 3D preview
  const render3DPreview = () => {
    const props = {
      furniture: furniture.furniture,
      displayItems: furniture.products.map((p) => ({
        id: `preview-${p.productId}`,
        productId: p.productId,
        section: p.section,
        position: p.position,
        furnitureId: furniture.furniture.id,
      })),
      products,
      onRemove: () => {},
    }

    switch (furniture.furniture.type) {
      case "clothing-rack":
        return <ClothingRack {...props} />
      case "wall-display":
        return <WallDisplay {...props} />
      case "accessory-display":
        return <AccessoryDisplay {...props} />
      case "modular-cube":
        return <ModularCube {...props} />
      case "gondola":
        return <GondolaDisplay {...props} />
      case "table":
        return <TableDisplay {...props} />
      default:
        return null
    }
  }

  return (
    <Card className="overflow-hidden text-left">
      <div
        className="relative aspect-video bg-muted/30 flex items-center justify-center cursor-pointer"
        onClick={() => setShowPreview(true)}
      >
        {showPreview ? (
          <Canvas shadows>
            {render3DPreview()}
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
            <directionalLight position={[-5, 5, -5]} intensity={0.6} />
            <directionalLight position={[0, 5, 0]} intensity={0.4} />
          </Canvas>
        ) : (
          <div className="flex flex-col items-center justify-center">
            {getFurnitureIcon(furniture.furniture.type)}
            <span className="text-xs text-muted-foreground mt-2">{t("furnitureEditor.visualiser")}</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-medium truncate">{furniture.furniture.name}</h3>
          </div>
          <div className="text-xs text-muted-foreground">
            {furniture.furniture.sections} {t("furnitureEditor.sections")}, {furniture.furniture.slots} {t("furnitureEditor.emplacement")}
          </div>
          <div className="text-xs text-muted-foreground">{furniture.products.length} {t("productImport.produitPlacerIA")}</div>
          {furniture.description && (
            <div className="text-xs text-muted-foreground truncate">{furniture.description}</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" size="sm" onClick={() => onEdit(furniture)}>
          <Edit className="h-4 w-4 mr-2" />
          {t("modifier")}
        </Button>
        <Button variant="outline" size="sm" onClick={() => onUse(furniture)}>
          <ArrowRight className="h-4 w-4 mr-2" />
          {t("utiliser")}
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(furniture.furniture.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

// Delete Confirmation Dialog
const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, furnitureName }) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("productImport.floorPlan.deleteFurniture")}</DialogTitle>
          <DialogDescription>
          {t("productImport.floorPlan.confirmDeleteFurniture")} "{furnitureName}" {t("productImport.floorPlan.confirmDeleteFurnitureAfter")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
          {t("cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
          {t("productImport.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Main Furniture Library Component
export function FurnitureLibrary() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const { toast } = useToast()
  const { savedFurniture, clearAllFurniture, deleteFurniture  } = useFurnitureStore()
  const [isModalOpen, setIsModalOpen] = useState(false);


  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<"name" | "type" | "products">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedType, setSelectedType] = useState<FurnitureType | "all">("all")

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [furnitureToDelete, setFurnitureToDelete] = useState<{ id: string; name: string } | null>(null)

  // Filter furniture
  const filteredFurniture = savedFurniture.filter((furniture) => {
    // Search term filter
    const matchesSearch =
      furniture.furniture.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (furniture.description && furniture.description.toLowerCase().includes(searchTerm.toLowerCase()))

    // Type filter
    const matchesType = selectedType === "all" || furniture.furniture.type === selectedType

    return matchesSearch && matchesType
  })
  const handleClearLibrary = () => {
    if (confirm("Êtes-vous sûr de vouloir vider toute la bibliothèque ?")) {
      clearAllFurniture()
    }
  }
  // Sort furniture
  const sortedFurniture = [...filteredFurniture].sort((a, b) => {
    let valueA, valueB

    switch (sortField) {
      case "name":
        valueA = a.furniture.name.toLowerCase()
        valueB = b.furniture.name.toLowerCase()
        break
      case "type":
        valueA = a.furniture.type
        valueB = b.furniture.type
        break
      case "products":
        valueA = a.products.length
        valueB = b.products.length
        break
      default:
        valueA = a.furniture.name.toLowerCase()
        valueB = b.furniture.name.toLowerCase()
    }

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  // Handle sort change
  const handleSortChange = (field: "name" | "type" | "products") => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle delete furniture
  const handleDeleteFurniture = (id: string) => {
    const furniture = savedFurniture.find((f) => f.furniture.id === id)
    if (furniture) {
      setFurnitureToDelete({ id, name: furniture.furniture.name })
      setDeleteDialogOpen(true)
    }
  }

  // Confirm delete
  const confirmDelete = () => {
    if (furnitureToDelete) {
      deleteFurniture(furnitureToDelete.id)
      toast({
        title: "Meuble supprimé",
        description: `Le meuble "${furnitureToDelete.name}" a été supprimé.`,
      })
      setDeleteDialogOpen(false)
      setFurnitureToDelete(null)
    }
  }

  // Handle edit furniture
  const handleEditFurniture = (furniture: SavedFurniture) => {
    // Navigate to furniture editor with this furniture
    // This would be implemented with router in a real app
    console.log("Edit furniture:", furniture)
  }

  // Handle use furniture
  const handleUseFurniture = (furniture: SavedFurniture) => {
    // Add to store display
    // This would be implemented with router in a real app
    console.log("Use furniture:", furniture)
  }

  return (
    <div className="container max-w-6xl mx-auto py-6 mt-12"
    dir={textDirection} // Applique RTL/LTR au conteneur principal
  >
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("furnitureLibrary")}</h1>
          <Button 
        variant="outline" 
        onClick={() => window.location.href = "/Editor"}
        className="flex items-center gap-2 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("productImport.backToEditor")}
      </Button>
          <Button asChild>
            <Link href="/furniture-editor">
              <Plus className="h-4 w-4 mr-2" />
              {t("productImport.floorPlan.creerMeuble")}

            </Link>
          </Button>
        </div>

        <div className="flex flex-col space-y-4">
          {/* Filters */}
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("productImport.rechercheFurniture")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex space-x-2">
              <select
                className="p-2 border rounded-md"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as FurnitureType | "all")}
              >
                <option value="all">{t("furnitureEditor.allTypes")}</option>
                <option value="clothing-rack">Portants</option>
                <option value="wall-display">Présentoirs muraux</option>
                <option value="accessory-display">Présentoirs à accessoires</option>
                <option value="modular-cube">Cubes modulables</option>
                <option value="gondola">Gondoles</option>
                <option value="table">Tables</option>
              </select>
            </div>
          </div>

          {/* Sort options */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground">{t("productImport.sortBy")}:</span>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => handleSortChange("name")}>
            {t("productImport.name")}
              {sortField === "name" && (
                <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
              )}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => handleSortChange("type")}>
            {t("productImport.type")}
              {sortField === "type" && (
                <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
              )}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => handleSortChange("products")}>
            {t("productImport.produits")}
              {sortField === "products" && (
                <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
              )}
            </Button>
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">{filteredFurniture.length} {t("productImport.meubletrouve")}</div>

          {/* Furniture grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedFurniture.length > 0 ? (
              sortedFurniture.map((furniture) => (
                <FurnitureCard
                  key={furniture.furniture.id}
                  furniture={furniture}
                  onEdit={handleEditFurniture}
                  onDelete={handleDeleteFurniture}
                  onUse={handleUseFurniture}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                {t("productImport.noFurnitureInLibrary")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {furnitureToDelete && (
        <DeleteConfirmationDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          furnitureName={furnitureToDelete.name}
        />
      )}
    </div>
  )
}
