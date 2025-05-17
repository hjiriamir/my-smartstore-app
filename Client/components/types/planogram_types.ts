// Planogram types

// Furniture types
export enum PlanogramTypes {
    PLANOGRAM = "planogram",
    GONDOLA = "gondola",
  }
  
  // JSON planogram data structure
  export interface PlanogramJsonData {
    emplacement_magasin: string;
    dimension_longueur_planogramme: number;
    dimension_largeur_planogramme: number;
    nb_etageres: number;
    nb_colonnes: number;
    product_placements: ProductPlacement[];
  }
  
  // Product placement in planogram
  export interface ProductPlacement {
    produit_id: string;
    etage: number;
    colonne: number;
  }
  
  // Cell in planogram grid
  export interface PlanogramCell {
    id: string;
    productId: string | null;
    instanceId: string | null;
    x: number;
    y: number;
    furnitureType: string;
    quantity?: number;
  }
  
  // Planogram configuration
  export interface PlanogramConfig {
    id?: string;
    name: string;
    rows: number;
    columns: number;
    cellWidth: number;
    cellHeight: number;
    furnitureType: string;
    displayMode: "compact" | "spaced";
    furnitureDimensions: {
      width: number;
      height: number;
      depth: number;
      baseHeight: number;
      shelfThickness: number;
    };
  }