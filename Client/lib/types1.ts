export interface Magasin {
  magasin_id: string
  nom_magasin: string
}

export interface FloorPlan {
  id: string
  name: string
  elements: FloorPlanElement[]
  updatedAt: number
}

export interface FloorPlanElement {
  id: string
  type: string
  name?: string
  x: number
  y: number
  width: number
  height: number
  rotation?: number
}

export interface SavedFurniture {
  furniture: {
    id: string
    name: string
    type: string
    width: number
    height: number
    depth: number
  }
  products: Array<{
    productId: string
    section: string
    position: number
    quantity?: number
  }>
  storeId?: string
}

export interface PlacedFurniture {
  id: string
  savedFurnitureId: string
  savedFurniture: SavedFurniture
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

export interface MatchedPlanElement {
  furnitureId: string
  elementName: string
}

export interface CurrentFurnitureToMatch {
  id: string
  name: string
}
