import type { FurnitureType } from "@/lib/furniture-store"

// Drag item types
export const ItemTypes = {
  PRODUCT: "product",
  FURNITURE_PRODUCT: "furniture_product",
} as const

// Interface pour les magasins
export interface Magasin {
  magasin_id: string
  nom_magasin: string
  adresse?: string
}

// FurnitureItem Interface
export type FurnitureItem = {
  id: string
  type: FurnitureType
  name: string
  sections: number
  slots: number
  width: number
  height: number
  depth: number
  color?: string
  x: number
  y: number
  z: number
  rotation: number
  storeId?: string
  storeName?: string
}

// FurnitureProduct Interface
export type FurnitureProduct = {
  productId: string
  section: number
  position: number
  storeId?: string
}

// Interfaces pour l'importation JSON
export interface PlanogramInfo {
  planogram_id: string
  nom_planogram: string
  statut: string
  date_creation: string
  magasin_id: string
  categorie_id: string
}

export interface ImportedFurniture {
  furniture_id: string
  furniture_type_id: number
  furniture_type_name: string
  faces: number
  available_faces: string[]
  largeur: number
  hauteur: number
  profondeur: number
  imageUrl?: string
  nb_etageres_unique_face: number
  nb_colonnes_unique_face: number
  nb_etageres_front_back: number
  nb_colonnes_front_back: number
  nb_etageres_left_right: number
  nb_colonnes_left_right: number
}

export interface ProductPosition {
  position_id: string
  furniture_id: string
  produit_id: string
  face: string
  etagere: number
  colonne: number
  quantite: number
}

export interface ImportedPlanogram {
  planogram_info: PlanogramInfo
  furniture: ImportedFurniture[]
  product_positions: ProductPosition[]
}

export interface Zone {
  zone_id: string
  nom_zone: string
}

export interface User {
  id: number
  idUtilisateur: number
  username: string
  email: string
  role: string
}
