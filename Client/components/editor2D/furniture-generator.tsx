"use client"

import { useMemo } from "react"
import {
  WallDisplay,
  ClothingRack,
  AccessoryDisplay,
  ModularCube,
  GondolaDisplay,
  TableDisplay,
  Fridge3D,
  SupermarketFridge,
  RefrigeratedShowcase,
  ClothingDisplay,
  ClothingWallDisplay,
  CashierDisplay,
  ShelvesDisplay,
  PlanogramDisplay,
} from "@/components/editor2D/furniture-3d-components"

// Furniture type mapping based on Streamlit furniture_type_id
const FURNITURE_TYPES = {
  1: PlanogramDisplay,
  2: GondolaDisplay,
  3: ShelvesDisplay,
  4: ClothingRack,
  5: WallDisplay,
  6: AccessoryDisplay,
  7: ModularCube,
  8: TableDisplay,
  9: SupermarketFridge, // refrigerator
  10: RefrigeratedShowcase,
  11: ClothingDisplay,
  12: ClothingWallDisplay,
  // String-based mapping for backward compatibility
  wall_display: WallDisplay,
  clothing_rack: ClothingRack,
  accessory_display: AccessoryDisplay,
  modular_cube: ModularCube,
  gondola: GondolaDisplay,
  table: TableDisplay,
  refrigerator: SupermarketFridge,
  fridge_3d: Fridge3D,
  supermarket_fridge: SupermarketFridge,
  refrigerated_showcase: RefrigeratedShowcase,
  clothing_display: ClothingDisplay,
  clothing_wall: ClothingWallDisplay,
  cashier: CashierDisplay,
  shelves: ShelvesDisplay,
  planogram: PlanogramDisplay,
}

// Default furniture configurations
const DEFAULT_FURNITURE_CONFIGS = {
  1: {
    // planogram
    width: 1.8,
    height: 1.6,
    depth: 0.4,
    sections: 4,
    slots: 10,
    color: "#a0a0a0",
  },
  2: {
    // gondola
    width: 3.0,
    height: 1.8,
    depth: 1.2,
    sections: 4,
    slots: 12,
    color: "#333333",
  },
  3: {
    // shelves
    width: 2.5,
    height: 2.0,
    depth: 1.0,
    sections: 5,
    slots: 16,
    color: "#f5f5f5",
    shelvesConfig: {
      rows: 5,
      frontBackColumns: 6,
      leftRightColumns: 1,
    },
  },
  4: {
    // clothing_rack
    width: 1.5,
    height: 1.8,
    depth: 0.6,
    sections: 2,
    slots: 8,
    color: "#666666",
  },
  5: {
    // wall_display
    width: 2.0,
    height: 2.0,
    depth: 0.3,
    sections: 4,
    slots: 6,
    color: "#8B4513",
  },
  6: {
    // accessory_display
    width: 1.0,
    height: 1.5,
    depth: 0.3,
    sections: 3,
    slots: 4,
    color: "#8B4513",
  },
  7: {
    // modular_cube
    width: 1.2,
    height: 1.2,
    depth: 0.4,
    sections: 3,
    slots: 9,
    color: "#8B4513",
  },
  8: {
    // table
    width: 1.5,
    height: 0.8,
    depth: 1.0,
    sections: 1,
    slots: 6,
    color: "#8B4513",
  },
  9: {
    // refrigerator
    width: 1.2,
    height: 2.0,
    depth: 0.8,
    sections: 3,
    slots: 4,
    color: "#4a4a4a",
  },
  10: {
    // refrigerated_showcase
    width: 1.5,
    height: 1.8,
    depth: 0.8,
    sections: 3,
    slots: 5,
    color: "#4a4a4a",
  },
  11: {
    // clothing_display
    width: 2.0,
    height: 2.0,
    depth: 0.4,
    sections: 3,
    slots: 6,
    color: "#8B4513",
  },
  12: {
    // clothing_wall
    width: 2.5,
    height: 2.2,
    depth: 0.3,
    sections: 4,
    slots: 6,
    color: "#8B4513",
  },
}

interface FurnitureGeneratorProps {
  jsonParams: any
  products: any[]
  onFurnitureGenerated?: (furniture: any, displayItems: any[]) => void
}

export function FurnitureGenerator({ jsonParams, products, onFurnitureGenerated }: FurnitureGeneratorProps) {
  const generatedFurniture = useMemo(() => {
    if (!jsonParams) return null

    // Determine furniture type - support both ID and string formats
    let furnitureType = jsonParams.furniture_type_id || jsonParams.furniture_type || jsonParams.type_meuble

    // If it's a string, try to map it to an ID
    if (typeof furnitureType === "string") {
      const typeMap = {
        planogram: 1,
        gondola: 2,
        "shelves-display": 3,
        shelves: 3,
        "clothing-rack": 4,
        "wall-display": 5,
        "accessory-display": 6,
        "modular-cube": 7,
        table: 8,
        refrigerator: 9,
        "refrigerated-showcase": 10,
        "clothing-display": 11,
        "clothing-wall": 12,
      }
      furnitureType = typeMap[furnitureType] || 1
    }

    // Get base configuration
    const baseConfig = DEFAULT_FURNITURE_CONFIGS[furnitureType] || DEFAULT_FURNITURE_CONFIGS[1]

    // Create furniture configuration from JSON parameters
    const furniture = {
      id: jsonParams.furniture_id || `generated-${Date.now()}`,
      type: furnitureType,
      name: jsonParams.nom_meuble || jsonParams.furniture_name || jsonParams.name || `Meuble ${furnitureType}`,

      // Dimensions from JSON or defaults (already converted from cm to meters in the parent)
      width: jsonParams.largeur || jsonParams.width || jsonParams.dimension_longueur_planogramme || baseConfig.width,
      height: jsonParams.hauteur || jsonParams.height || jsonParams.dimension_largeur_planogramme || baseConfig.height,
      depth:
        jsonParams.profondeur || jsonParams.depth || jsonParams.dimension_profondeur_planogramme || baseConfig.depth,

      // Structure from JSON or defaults
      sections:
        jsonParams.nb_etageres_unique_face || jsonParams.nb_etageres || jsonParams.sections || baseConfig.sections,
      slots: jsonParams.nb_colonnes_unique_face || jsonParams.nb_colonnes || jsonParams.slots || baseConfig.slots,

      // Appearance
      color: jsonParams.couleur || jsonParams.color || baseConfig.color,

      // Position
      x: jsonParams.position_x || jsonParams.x || 0,
      y: jsonParams.position_y || jsonParams.y || 0,
      z: jsonParams.position_z || jsonParams.z || 0,
      rotation: jsonParams.rotation || 0,

      // Special configurations
      shelvesConfig: jsonParams.shelves_config || baseConfig.shelvesConfig,
      faces: jsonParams.faces || 1,
      available_faces: jsonParams.available_faces || ["front"],

      // Store location info
      emplacement_magasin: jsonParams.emplacement_magasin,
      magasin_id: jsonParams.magasin_id,
      categorie_id: jsonParams.categorie_id,
    }

    // Generate display items from product placements
    const displayItems = (jsonParams.product_placements || []).map((placement: any, index: number) => ({
      id: placement.position_id || `item-${index}`,
      productId: placement.produit_id,
      section: placement.etage !== undefined ? placement.etage : placement.section || 0,
      position: placement.colonne !== undefined ? placement.colonne : placement.position || index,
      quantity: placement.quantite || placement.quantity || 1,
      face: placement.face || "front",
      furnitureId: furniture.id,
    }))

    return { furniture, displayItems }
  }, [jsonParams])

  // Render the generated furniture
  if (!generatedFurniture) return null

  const { furniture, displayItems } = generatedFurniture

  // Get the appropriate component based on furniture type
  const FurnitureComponent = FURNITURE_TYPES[furniture.type] || PlanogramDisplay

  // Notify parent component
  if (onFurnitureGenerated) {
    onFurnitureGenerated(furniture, displayItems)
  }

  console.log("Rendering furniture:", furniture.type, "with", displayItems.length, "items")

  return (
    <group>
      <FurnitureComponent
        furniture={furniture}
        displayItems={displayItems}
        products={products}
        onRemove={(item: any) => {
          console.log("Remove item:", item)
        }}
      />
    </group>
  )
}

// Export furniture types for external use
export { FURNITURE_TYPES, DEFAULT_FURNITURE_CONFIGS }
