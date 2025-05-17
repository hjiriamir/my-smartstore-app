import { create } from "zustand"
import { persist } from "zustand/middleware"

export type FurnitureType =
  | "clothing-rack"
  | "wall-display"
  | "accessory-display"
  | "modular-cube"
  | "gondola"
  | "table"
  | "planogram"
  | "refrigerator"
  | "refrigerated-showcase"
  | "clothing-display"
  | "clothing-wall"
  | "shelves-display"

export interface FurnitureItem {
  id: string
  type: FurnitureType
  name: string
  sections: number
  slots: number
  width: number
  height: number
  depth: number
  color: string
  x: number
  y: number
  z: number
  rotation: number
}

export interface FurnitureProduct {
  productId: string
  section: number
  position: number
  quantity?: number
  side?: string // Add side property for 4-sided displays
}

export interface SavedFurniture {
  furniture: FurnitureItem
  products: FurnitureProduct[]
  description?: string
  createdAt: number
  updatedAt: number
}

export interface StoreLayout {
  id: string
  name: string
  description?: string
  furniture: {
    furnitureId: string
    x: number
    y: number
    z: number
    rotation: number
  }[]
  createdAt: number
  updatedAt: number
}

interface FurnitureStore {
  savedFurniture: SavedFurniture[]
  storeLayouts: StoreLayout[]

  // Furniture actions
  addFurniture: (furniture: FurnitureItem, products: FurnitureProduct[], description?: string) => void
  updateFurniture: (id: string, furniture: FurnitureItem, products: FurnitureProduct[], description?: string) => void
  deleteFurniture: (id: string) => void
  clearAllFurniture: () => void

  // Store layout actions
  addStoreLayout: (
    name: string,
    furniture: { furnitureId: string; x: number; y: number; z: number; rotation: number }[],
    description?: string,
  ) => void
  updateStoreLayout: (
    id: string,
    name: string,
    furniture: { furnitureId: string; x: number; y: number; z: number; rotation: number }[],
    description?: string,
  ) => void
  deleteStoreLayout: (id: string) => void

  // Planogram actions
  addPlanogramFurniture: (furniture: FurnitureItem, products: FurnitureProduct[], description?: string) => void
}

export const useFurnitureStore = create<FurnitureStore>()(
  persist(
    (set) => ({
      savedFurniture: [],
      storeLayouts: [],

      // Furniture actions
      addFurniture: (furniture, products, description) =>
        set((state) => ({
          savedFurniture: [
            ...state.savedFurniture,
            {
              furniture,
              products,
              description,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        })),

      updateFurniture: (id, furniture, products, description) =>
        set((state) => ({
          savedFurniture: state.savedFurniture.map((item) =>
            item.furniture.id === id
              ? {
                  furniture,
                  products,
                  description,
                  createdAt: item.createdAt,
                  updatedAt: Date.now(),
                }
              : item,
          ),
        })),

      deleteFurniture: (id) =>
        set((state) => ({
          savedFurniture: state.savedFurniture.filter((item) => item.furniture.id !== id),
        })),

      // Nouvelle fonction pour vider complètement la bibliothèque
      clearAllFurniture: () => set({ savedFurniture: [] }),

      // Store layout actions
      addStoreLayout: (name, furniture, description) =>
        set((state) => ({
          storeLayouts: [
            ...state.storeLayouts,
            {
              id: `layout-${Date.now()}`,
              name,
              description,
              furniture,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        })),

      updateStoreLayout: (id, name, furniture, description) =>
        set((state) => ({
          storeLayouts: state.storeLayouts.map((layout) =>
            layout.id === id
              ? {
                  ...layout,
                  name,
                  description,
                  furniture,
                  updatedAt: Date.now(),
                }
              : layout,
          ),
        })),

      deleteStoreLayout: (id) =>
        set((state) => ({
          storeLayouts: state.storeLayouts.filter((layout) => layout.id !== id),
        })),

      // Planogram actions - Modified to preserve the original furniture type
      addPlanogramFurniture: (furniture, products, description) =>
        set((state) => ({
          savedFurniture: [
            ...state.savedFurniture,
            {
              furniture: {
                ...furniture,
                // Keep the original furniture type instead of forcing it to "planogram"
                // This is the key change to fix the compatibility issue
              },
              products,
              description,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        })),
    }),
    {
      name: "furniture-store",
    },
  ),
)
