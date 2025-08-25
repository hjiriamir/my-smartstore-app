// Types pour les éléments du plan
export type ElementType =
  | "wall"
  | "door"
  | "window"
  | "line"
  | "rectangle"
  | "circle"
  | "shelf"
  | "display"
  | "table"
  | "chair"
  | "sofa"
  | "bed"
  | "fridge"
  | "dairy_fridge"
  | "counter"
  | "cashier"
  | "rack"
  | "mannequin"
  | "plant"
  | "gondola"

export interface Element {
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
  windowTopDistance?: number
  windowBottomDistance?: number
  parentWallId?: string
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
  resetCamera: () => void
  focusOnPlan: () => void
}