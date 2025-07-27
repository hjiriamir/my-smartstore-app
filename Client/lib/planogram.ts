export interface PlanogramCell {
    id: string
    productId: string | null
    instanceId: string | null
    x: number
    y: number
    furnitureType: string
    quantity?: number
    side?: string
    etagere?: number
    colonne?: number
    face?: "front" | "back" | "left" | "right"
  }
  
  export interface PlanogramConfig {
    id?: string
    name: string
    rows: number
    columns: number
    cellWidth: number
    cellHeight: number
    furnitureType: string
    displayMode: "compact" | "spaced"
    furnitureDimensions: {
      width: number
      height: number
      depth: number
      baseHeight: number
      shelfThickness: number
    }
    planogramDetails?: {
      nbre_colonnes: number
      nbre_etageres: number
    }
    gondolaDetails?: {
      nbre_colonnes_back: number
      nbre_colonnes_front: number
      nbre_etageres_back: number
      nbre_etageres_front: number
    }
    shelvesDisplayDetails?: {
      nbre_colonnes_back: number
      nbre_colonnes_front: number
      nbre_etageres_back: number
      nbre_etageres_front: number
      nb_colonnes_left_right: number
      nb_etageres_left_right: number
    }
    shelvesConfig: {
      rows: number
      frontBackColumns: number
      leftRightColumns: number
    }
  }
  
  export interface SceneCaptureRef {
    current: ((callback: (dataUrl: string) => void) => void) | null
  }
  