// Types pour les éléments du plan
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
  | "dairy_fridge"

export type Element = {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  depth: number
  rotation: number
  name?: string // Ajout du champ nom
  valid?: boolean // Optionnel pour la compatibilité avec les éléments existants
  // Add window-specific properties
  windowTopDistance?: number
  windowBottomDistance?: number
  parentWallId?: string // To track which wall the window belongs to
}

// Type for floor plan
export interface FloorPlan {
  id: string
  name: string
  elements: Element[]
  createdAt: string
  updatedAt: string
}

// Interface for the 3D viewer component's exposed methods
export interface FloorPlan3DViewerRef {
  add3DObject: (element: Element) => void
  update3DObjectPosition: (elementId: string) => void
  update3DObjectSize: (elementId: string) => void
  update3DObjectRotation: (elementId: string) => void
  remove3DObject: (elementId: string) => void
  updateAllElements: (elements: Element[]) => void
  renderScene: () => void
  getDomElement: () => HTMLCanvasElement | null
}
