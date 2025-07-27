import type { FloorPlan, SavedFurniture } from "./types1"

// Helper function to get element color
export const getElementColor = (type: string): string => {
  switch (type) {
    case "wall":
      return "#555555"
    case "door":
      return "#8B4513"
    case "window":
      return "#87CEEB"
    case "shelf":
      return "#A0522D"
    case "rack":
      return "#708090"
    case "display":
      return "#4682B4"
    case "table":
      return "#CD853F"
    case "fridge":
      return "#B0C4DE"
    case "planogram":
      return "#6A5ACD"
    case "gondola":
      return "#20B2AA"
    case "line":
      return "#333333"
    case "rectangle":
      return "#5D8AA8"
    case "circle":
      return "#6495ED"
    case "chair":
      return "#8B8970"
    case "sofa":
      return "#9370DB"
    case "bed":
      return "#8B008B"
    case "plant":
      return "#228B22"
    case "counter":
      return "#D2691E"
    case "cashier":
      return "#FF7F50"
    case "mannequin":
      return "#E6E6FA"
    case "cube":
      return "#5D4037"
    default:
      return "#CCCCCC"
  }
}

// Check if a furniture matches any element in the floor plan
export const isFurnitureInPlan = (furniture: SavedFurniture, floorPlan: FloorPlan | null): boolean => {
  if (!floorPlan || !furniture?.furniture?.name) return false

  const furnitureName =
    typeof furniture.furniture.name === "string"
      ? furniture.furniture.name.toLowerCase()
      : String(furniture.furniture.name).toLowerCase()

  return floorPlan.elements.some(
    (element) =>
      (element.name && element.name.toLowerCase() === furnitureName) ||
      (!element.name && element.type === furniture.furniture.type),
  )
}

// Get all furniture names from the floor plan
export const getFloorPlanFurnitureNames = (floorPlan: FloorPlan | null): string[] => {
  if (!floorPlan) return []
  return floorPlan.elements.filter((element) => element.name).map((element) => element.name.toLowerCase())
}

// Function to calculate auto-placement coordinates
export const getAutoPlacementCoordinates = (
  element: any,
  roomWidth: number,
  roomDepth: number,
  floorPlan?: FloorPlan | null,
) => {
  // Convert pixel coordinates to meters (assuming 100 pixels = 1 meter)
  const xPos = element.x / 100 - roomWidth / 4
  const zPos = element.y / 100 - roomDepth / 4
  const width = element.width / 100
  const depth = element.height / 100

  // Calculate the center position of the element
  const x = xPos + width / 2
  const z = zPos + depth / 2

  // Determine rotation based on element rotation
  const rotation = element.rotation || 0

  return { x, y: 0, z, rotation }
}

// Furniture element types that can be matched
export const FURNITURE_ELEMENT_TYPES = [
  "shelf",
  "display",
  "table",
  "fridge",
  "planogram",
  "gondola",
  "counter",
  "cashier",
  "rack",
  "mannequin",
  "cube",
]
