import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ElementType, FloorPlan } from "@/lib/types"

// Local storage keys
const FLOOR_PLANS_STORAGE_KEY = "store-floor-plans"
const ACTIVE_FLOOR_PLAN_KEY = "active-floor-plan"

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

// Constante pour la conversion pixels -> unités réelles
export const PIXELS_PER_METER = 100 // 100 pixels = 1 mètre
export const PIXELS_PER_CM = 1 // 1 pixel = 1 cm

// Fonction pour convertir les pixels en unités réelles
export const pixelsToUnit = (pixels: number, unitSystem: "m" | "cm"): number => {
  if (unitSystem === "m") {
    return pixels / PIXELS_PER_METER
  } else {
    return pixels / PIXELS_PER_CM
  }
}

// Fonction pour formater les dimensions
export const formatDimension = (pixels: number, unitSystem: "m" | "cm"): string => {
  const value = pixelsToUnit(pixels, unitSystem)
  return `${value.toFixed(unitSystem === "m" ? 2 : 0)}${unitSystem}`
}

// Fonction pour obtenir la couleur d'un élément selon son type
export const getElementColor = (type: ElementType): string => {
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
    case "dairy_fridge":
      return "#000000"
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
      return "#5D4037" // Brun foncé pour le cube
    default:
      return "#CCCCCC"
  }
}

// Fonction pour obtenir le libellé d'un élément selon son type
export const getElementLabel = (type: ElementType): string => {
  switch (type) {
    case "wall":
      return "Mur"
    case "door":
      return "Porte"
    case "window":
      return "Fenêtre"
    case "shelf":
      return "Étagère"
    case "rack":
      return "Portant"
    case "display":
      return "Présentoir"
    case "table":
      return "Table"
    case "fridge":
      return "Frigo"
    case "dairy_fridge":
      return "Frigo Produits Laitiers"
    case "planogram":
      return "Planogramme"
    case "gondola":
      return "Gondole"
    case "line":
      return "Ligne"
    case "rectangle":
      return "Rectangle"
    case "circle":
      return "Cercle"
    case "chair":
      return "Chaise"
    case "sofa":
      return "Canapé"
    case "bed":
      return "Lit"
    case "plant":
      return "Plante"
    case "counter":
      return "Comptoir"
    case "cashier":
      return "Caisse"
    case "mannequin":
      return "Mannequin"
    case "cube":
      return "Cube"
    default:
      return ""
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
