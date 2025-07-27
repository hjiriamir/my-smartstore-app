import type { FloorPlanElement } from "@/types/store-display"

export const getElementColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    wall: "#555555",
    door: "#8B4513",
    window: "#87CEEB",
    shelf: "#A0522D",
    rack: "#708090",
    display: "#4682B4",
    table: "#CD853F",
    fridge: "#B0C4DE",
    planogram: "#6A5ACD",
    gondola: "#20B2AA",
    line: "#333333",
    rectangle: "#5D8AA8",
    circle: "#6495ED",
    chair: "#8B8970",
    sofa: "#9370DB",
    bed: "#8B008B",
    plant: "#228B22",
    counter: "#D2691E",
    cashier: "#FF7F50",
    mannequin: "#E6E6FA",
    cube: "#5D4037",
  }
  return colorMap[type] || "#CCCCCC"
}

export const getAutoPlacementCoordinates = (element: FloorPlanElement, roomWidth: number, roomDepth: number) => {
  const xPos = element.x / 100 - roomWidth / 4
  const zPos = element.y / 100 - roomDepth / 4
  const width = element.width / 100
  const depth = element.height / 100

  const x = xPos + width / 2
  const z = zPos + depth / 2
  const rotation = element.rotation || 0

  return { x, y: 0, z, rotation }
}

export const isFurnitureInPlan = (furniture: any, floorPlan: any): boolean => {
  if (!floorPlan || !furniture?.furniture?.name) return false

  const furnitureName =
    typeof furniture.furniture.name === "string"
      ? furniture.furniture.name.toLowerCase()
      : String(furniture.furniture.name).toLowerCase()

  return floorPlan.elements.some(
    (element: any) =>
      (element.name && element.name.toLowerCase() === furnitureName) ||
      (!element.name && element.type === furniture.furniture.type),
  )
}

export const getFloorPlanFurnitureNames = (floorPlan: any): string[] => {
  if (!floorPlan) return []
  return floorPlan.elements.filter((element: any) => element.name).map((element: any) => element.name.toLowerCase())
}
