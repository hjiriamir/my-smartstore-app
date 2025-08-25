import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ElementType, FloorPlan } from "./typese"

// Local storage keys
const FLOOR_PLANS_STORAGE_KEY = "store-floor-plans"
const ACTIVE_FLOOR_PLAN_KEY = "active-floor-plan"

// Constantes pour la conversion pixels -> unités réelles
export const PIXELS_PER_METER = 100 // 100 pixels = 1 mètre
export const PIXELS_PER_CM = 1 // 1 pixel = 1 cm

// Fonction utilitaire pour gérer className avec Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Save a floor plan to local storage
export const saveFloorPlan = (plan: FloorPlan): void => {
  try {
    // Get existing plans
    const existingPlansJSON = localStorage.getItem(FLOOR_PLANS_STORAGE_KEY)
    const existingPlans: FloorPlan[] = existingPlansJSON ? JSON.parse(existingPlansJSON) : []

    // Check if plan already exists
    const planIndex = existingPlans.findIndex((p) => p.id === plan.id)
    const now = new Date().toISOString()
    
    if (planIndex >= 0) {
      // Update existing plan
      existingPlans[planIndex] = {
        ...plan,
        updatedAt: now,
      }
    } else {
      // Add new plan
      existingPlans.push({
        ...plan,
        createdAt: now,
        updatedAt: now,
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

// Fonction pour convertir les pixels en unités réelles
export const pixelsToUnit = (pixels: number, unitSystem: "m" | "cm"): number => {
  return unitSystem === "m" ? pixels / PIXELS_PER_METER : pixels / PIXELS_PER_CM
}

// Fonction pour formater les dimensions
export const formatDimension = (pixels: number, unitSystem: "m" | "cm"): string => {
  const value = pixelsToUnit(pixels, unitSystem)
  return `${value.toFixed(unitSystem === "m" ? 2 : 0)}${unitSystem}`
}

// Fonction pour obtenir la couleur d'un élément selon son type
export const getElementColor = (type: ElementType): string => {
  const colors: Record<ElementType, string> = {
    wall: "#555555",
    door: "#8B4513",
    window: "#87CEEB",
    shelf: "#A0522D",
    rack: "#708090",
    display: "#4682B4",
    table: "#CD853F",
    fridge: "#B0C4DE",
    dairy_fridge: "#000000",
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
    gondola: "#20B2AA",
  }

  return colors[type] || "#CCCCCC"
}

// Fonction pour obtenir le libellé d'un élément selon son type
export const getElementLabel = (type: ElementType): string => {
  const labels: Record<ElementType, string> = {
    wall: "Mur",
    door: "Porte",
    window: "Fenêtre",
    shelf: "Étagère",
    rack: "Portant",
    display: "Présentoir",
    table: "Table",
    fridge: "Frigo",
    dairy_fridge: "Frigo Produits Laitiers",
    line: "Ligne",
    rectangle: "Rectangle",
    circle: "Cercle",
    chair: "Chaise",
    sofa: "Canapé",
    bed: "Lit",
    plant: "Plante",
    counter: "Comptoir",
    cashier: "Caisse",
    mannequin: "Mannequin",
    gondola: "Gondole",
  }

  return labels[type] || type
}
// Fonction throttle pour limiter la fréquence d'exécution
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastExec = 0;

  return (...args: Parameters<T>) => {
    const elapsed = Date.now() - lastExec;

    const execute = () => {
      func(...args);
      lastExec = Date.now();
    };

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (elapsed > delay) {
      execute();
    } else {
      timeoutId = setTimeout(execute, delay - elapsed);
    }
  };
};

// Fonction debounce pour retarder l'exécution jusqu'à ce que les actions soient terminées
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Fonctions pour gérer les plans dans le localStorage
export const getFloorPlans = (): FloorPlan[] => {
  try {
    const plansJSON = localStorage.getItem(FLOOR_PLANS_STORAGE_KEY)
    return plansJSON ? JSON.parse(plansJSON) : []
  } catch (error) {
    console.error("Error getting floor plans:", error)
    return []
  }
}

export const getActiveFloorPlanId = (): string | null => {
  return localStorage.getItem(ACTIVE_FLOOR_PLAN_KEY)
}

export const deleteFloorPlan = (id: string): void => {
  try {
    const plans = getFloorPlans()
    const updatedPlans = plans.filter(plan => plan.id !== id)
    localStorage.setItem(FLOOR_PLANS_STORAGE_KEY, JSON.stringify(updatedPlans))
    
    // Si on supprime le plan actif, on le retire aussi
    const activePlanId = getActiveFloorPlanId()
    if (activePlanId === id) {
      localStorage.removeItem(ACTIVE_FLOOR_PLAN_KEY)
    }
  } catch (error) {
    console.error("Error deleting floor plan:", error)
    throw new Error("Failed to delete floor plan")
  }
}