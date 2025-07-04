import type { FurnitureType } from "@/lib/furniture-store"
import { Package, Grid, CuboidIcon as Cube, Snowflake } from "lucide-react"

// Mapping des types de meubles
export const FURNITURE_TYPE_MAPPING: Record<string, FurnitureType> = {
  "wall-display": "wall-display",
  "clothing-rack": "clothing-rack",
  "accessory-display": "accessory-display",
  "modular-cube": "modular-cube",
  gondola: "gondola",
  table: "table",
  refrigerator: "refrigerator",
  "refrigerated-showcase": "refrigerated-showcase",
  "clothing-display": "clothing-display",
  "clothing-wall": "clothing-wall",
}

// Helper function to get furniture icon
export const getFurnitureIcon = (type: FurnitureType) => {
  switch (type) {
    case "clothing-rack":
      return <Package className="h-8 w-8 text-muted-foreground" />
    case "wall-display":
      return <Grid className="h-8 w-8 text-muted-foreground" />
    case "accessory-display":
      return <Package className="h-8 w-8 text-muted-foreground" />
    case "modular-cube":
      return <Cube className="h-8 w-8 text-muted-foreground" />
    case "gondola":
      return <Grid className="h-8 w-8 text-muted-foreground" />
    case "table":
      return <Package className="h-8 w-8 text-muted-foreground" />
    case "refrigerator":
      return <Snowflake className="h-8 w-8 text-muted-foreground" />
    case "refrigerated-showcase":
      return <Snowflake className="h-8 w-8 text-muted-foreground" />
    default:
      return <Package className="h-8 w-8 text-muted-foreground" />
  }
}

export function adjustColor(color: string, amount: number): string {
  let r = Number.parseInt(color.substring(1, 3), 16)
  let g = Number.parseInt(color.substring(3, 5), 16)
  let b = Number.parseInt(color.substring(5, 7), 16)

  r = Math.max(0, Math.min(255, r + amount))
  g = Math.max(0, Math.min(255, g + amount))
  b = Math.max(0, Math.min(255, b + amount))

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}
