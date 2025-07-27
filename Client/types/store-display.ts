export interface Magasin {
    magasin_id: string
    nom_magasin: string
  }
  
  export interface PlacedFurniture {
    id: string
    savedFurnitureId: string
    savedFurniture: any
    x: number
    y: number
    z: number
    rotation: number
    type?: string
    width?: number
    height?: number
    depth?: number
    matchedElementName?: string
  }
  
  export interface FloorPlan {
    id: string
    name: string
    updatedAt: string
    elements: FloorPlanElement[]
  }
  
  export interface FloorPlanElement {
    id: string
    name?: string
    type: string
    x: number
    y: number
    width: number
    height: number
    rotation?: number
  }
  
  export interface MatchedPlanElement {
    furnitureId: string
    elementName: string
  }
  
  export interface FurnitureToMatch {
    id: string
    name: string
  }
  
  export interface ExportType {
    type: "image" | "pdf" | null
  }
  