// This file contains shared types and utilities for synchronizing
// between the floor plan editor and store display editor

// Types for floor plan elements
export type ElementType =
  | "wall"
  | "door"
  | "window"
  | "shelf"
  | "rack"
  | "display"
  | "table"
  | "fridge"
  | "planogram"
  | "gondola"
  | "line"
  | "rectangle"
  | "circle"
  | "chair"
  | "sofa"
  | "bed"
  | "plant"
  | "counter"
  | "cashier"
  | "mannequin"
  | "cube"

export interface FloorPlanElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  depth: number
  rotation: number
  name?: string
  valid?: boolean
}

export interface FloorPlan {
  id: string
  name: string
  elements: FloorPlanElement[]
  createdAt: string
  updatedAt: string
}

// Local storage keys
export const FLOOR_PLANS_STORAGE_KEY = "store-floor-plans"
export const ACTIVE_FLOOR_PLAN_KEY = "active-floor-plan"

// Save a floor plan to local storage
export const saveFloorPlan = (plan: FloorPlan): void => {
  try {
    // Get existing plans
    const existingPlansJSON = localStorage.getItem(FLOOR_PLANS_STORAGE_KEY)
    const existingPlans: FloorPlan[] = existingPlansJSON ? JSON.parse(existingPlansJSON) : []

    // Check if plan already exists
    const planIndex = existingPlans.findIndex((p) => p.id === plan.id)

    if (planIndex >= 0) {
      // Update existing plan
      existingPlans[planIndex] = {
        ...plan,
        updatedAt: new Date().toISOString(),
      }
    } else {
      // Add new plan
      existingPlans.push({
        ...plan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    // Save back to local storage
    localStorage.setItem(FLOOR_PLANS_STORAGE_KEY, JSON.stringify(existingPlans))

    // Set as active plan
    localStorage.setItem(ACTIVE_FLOOR_PLAN_KEY, plan.id)
  } catch (error) {
    console.error("Error saving floor plan:", error)
    throw new Error("Failed to save floor plan")
  }
}

// Get all floor plans from local storage
export const getFloorPlans = (): FloorPlan[] => {
  try {
    const plansJSON = localStorage.getItem(FLOOR_PLANS_STORAGE_KEY)
    return plansJSON ? JSON.parse(plansJSON) : []
  } catch (error) {
    console.error("Error getting floor plans:", error)
    return []
  }
}

// Get a specific floor plan by ID
export const getFloorPlanById = (id: string): FloorPlan | null => {
  try {
    const plans = getFloorPlans()
    return plans.find((plan) => plan.id === id) || null
  } catch (error) {
    console.error("Error getting floor plan by ID:", error)
    return null
  }
}

// Get the active floor plan
export const getActiveFloorPlan = (): FloorPlan | null => {
  try {
    const activeId = localStorage.getItem(ACTIVE_FLOOR_PLAN_KEY)
    if (!activeId) return null

    return getFloorPlanById(activeId)
  } catch (error) {
    console.error("Error getting active floor plan:", error)
    return null
  }
}

// Delete a floor plan
export const deleteFloorPlan = (id: string): void => {
  try {
    const plans = getFloorPlans()
    const filteredPlans = plans.filter((plan) => plan.id !== id)
    localStorage.setItem(FLOOR_PLANS_STORAGE_KEY, JSON.stringify(filteredPlans))

    // If active plan was deleted, clear active plan
    const activeId = localStorage.getItem(ACTIVE_FLOOR_PLAN_KEY)
    if (activeId === id) {
      localStorage.removeItem(ACTIVE_FLOOR_PLAN_KEY)
    }
  } catch (error) {
    console.error("Error deleting floor plan:", error)
  }
}

// Convert floor plan coordinates to 3D scene coordinates
export const convertFloorPlanToSceneCoordinates = (
  element: FloorPlanElement,
  roomWidth: number,
  roomDepth: number,
): { x: number; y: number; z: number; width: number; depth: number; height: number; rotation: number } => {
  // In floor plan: x,y are 2D coordinates, width/height are 2D dimensions
  // In 3D scene: x,z are horizontal, y is vertical

  // Center the floor plan in the room
  const centerX = roomWidth / 2
  const centerZ = roomDepth / 2

  // Convert coordinates (floor plan origin is top-left, 3D scene origin is center)
  const x = element.x - centerX
  const z = element.y - centerZ

  // Convert dimensions
  const width = element.width
  const depth = element.height
  const height = element.depth

  // Convert rotation (floor plan rotation is in degrees, 3D scene is in radians)
  const rotation = (element.rotation * Math.PI) / 180

  return { x, y: 0, z, width, depth, height, rotation }
}

// Trouver un meuble correspondant à un élément du plan
export const findMatchingFurniture = (element: FloorPlanElement, furnitureList: any[]): any | null => {
  // D'abord essayer de trouver par nom exact
  if (element.name) {
    const matchByName = furnitureList.find((f) => f.furniture.name.toLowerCase() === element.name?.toLowerCase())
    if (matchByName) return matchByName
  }

  // Sinon essayer de trouver par type
  return furnitureList.find((f) => f.furniture.type === element.type)
}

// Convertir les coordonnées du plan en coordonnées 3D pour le placement automatique
export const getAutoPlacementCoordinates = (
  element: FloorPlanElement,
  roomWidth: number,
  roomDepth: number,
): { x: number; y: number; z: number; rotation: number } => {
  // Conversion de pixels à mètres (100 pixels = 1 mètre)
  const x = element.x / 100 - roomWidth / 4 + element.width / 200
  const z = element.y / 100 - roomDepth / 4 + element.height / 200

  return {
    x,
    y: 0,
    z,
    rotation: element.rotation,
  }
}
