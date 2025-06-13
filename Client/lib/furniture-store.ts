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
  storeId?: string // Ajout de l'ID du magasin associé au meuble
  storeName?: string // Ajout du nom du magasin pour l'affichage
}

export interface FurnitureProduct {
  productId: string
  section: number
  position: number
  quantity?: number
  side?: string // Add side property for 4-sided displays
  storeId?: string // Ajout de l'ID du magasin pour chaque produit
}

export interface SavedFurniture {
  furniture: FurnitureItem
  products: FurnitureProduct[]
  description?: string
  createdAt: number
  updatedAt: number
  storeId?: string // Ajout de l'ID du magasin au niveau du meuble sauvegardé
  storeName?: string // Ajout du nom du magasin pour l'affichage
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
  storeId?: string // Ajout de l'ID du magasin pour le layout
}

// Interface pour représenter un magasin
export interface Store {
  id: string
  name: string
  address?: string
}

interface FurnitureStore {
  savedFurniture: SavedFurniture[]
  storeLayouts: StoreLayout[]
  stores: Store[] // Ajout d'une liste de magasins en cache

  // Furniture actions
  addFurniture: (
    furniture: FurnitureItem,
    products: FurnitureProduct[],
    description?: string,
    storeId?: string,
    storeName?: string,
  ) => void
  updateFurniture: (
    id: string,
    furniture: FurnitureItem,
    products: FurnitureProduct[],
    description?: string,
    storeId?: string,
    storeName?: string,
  ) => void
  deleteFurniture: (id: string) => void
  clearAllFurniture: () => void

  // Store layout actions
  addStoreLayout: (
    name: string,
    furniture: { furnitureId: string; x: number; y: number; z: number; rotation: number }[],
    description?: string,
    storeId?: string,
  ) => void
  updateStoreLayout: (
    id: string,
    name: string,
    furniture: { furnitureId: string; x: number; y: number; z: number; rotation: number }[],
    description?: string,
    storeId?: string,
  ) => void
  deleteStoreLayout: (id: string) => void

  // Planogram actions
  addPlanogramFurniture: (
    furniture: FurnitureItem,
    products: FurnitureProduct[],
    description?: string,
    storeId?: string,
    storeName?: string,
  ) => void

  // Store management
  addStore: (store: Store) => void
  updateStores: (stores: Store[]) => void
  getStoreById: (id: string) => Store | undefined
}

export const useFurnitureStore = create<FurnitureStore>()(
  persist(
    (set, get) => ({
      savedFurniture: [],
      storeLayouts: [],
      stores: [], // Initialisation de la liste des magasins

      // Furniture actions
      addFurniture: (furniture, products, description, storeId, storeName) =>
        set((state) => ({
          savedFurniture: [
            ...state.savedFurniture,
            {
              furniture: {
                ...furniture,
                storeId, // Ajout de l'ID du magasin au meuble
                storeName, // Ajout du nom du magasin
              },
              products: products.map((product) => ({
                ...product,
                storeId, // Ajout de l'ID du magasin à chaque produit
              })),
              description,
              storeId, // Ajout de l'ID du magasin au niveau du meuble sauvegardé
              storeName, // Ajout du nom du magasin
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        })),

      updateFurniture: (id, furniture, products, description, storeId, storeName) =>
        set((state) => ({
          savedFurniture: state.savedFurniture.map((item) =>
            item.furniture.id === id
              ? {
                  furniture: {
                    ...furniture,
                    storeId, // Mise à jour de l'ID du magasin
                    storeName, // Mise à jour du nom du magasin
                  },
                  products: products.map((product) => ({
                    ...product,
                    storeId, // Mise à jour de l'ID du magasin pour chaque produit
                  })),
                  description,
                  storeId, // Mise à jour de l'ID du magasin au niveau du meuble sauvegardé
                  storeName, // Mise à jour du nom du magasin
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
      addStoreLayout: (name, furniture, description, storeId) =>
        set((state) => ({
          storeLayouts: [
            ...state.storeLayouts,
            {
              id: `layout-${Date.now()}`,
              name,
              description,
              furniture,
              storeId, // Ajout de l'ID du magasin
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        })),

      updateStoreLayout: (id, name, furniture, description, storeId) =>
        set((state) => ({
          storeLayouts: state.storeLayouts.map((layout) =>
            layout.id === id
              ? {
                  ...layout,
                  name,
                  description,
                  furniture,
                  storeId, // Mise à jour de l'ID du magasin
                  updatedAt: Date.now(),
                }
              : layout,
          ),
        })),

      deleteStoreLayout: (id) =>
        set((state) => ({
          storeLayouts: state.storeLayouts.filter((layout) => layout.id !== id),
        })),

      // Planogram actions - Modified to preserve the original furniture type and add store information
      addPlanogramFurniture: (furniture, products, description, storeId, storeName) =>
        set((state) => ({
          savedFurniture: [
            ...state.savedFurniture,
            {
              furniture: {
                ...furniture,
                storeId, // Ajout de l'ID du magasin
                storeName, // Ajout du nom du magasin
              },
              products: products.map((product) => ({
                ...product,
                storeId, // Ajout de l'ID du magasin à chaque produit
              })),
              description,
              storeId, // Ajout de l'ID du magasin au niveau du meuble sauvegardé
              storeName, // Ajout du nom du magasin
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        })),

      // Store management
      addStore: (store) =>
        set((state) => ({
          stores: [...state.stores, store],
        })),

      updateStores: (stores) =>
        set(() => ({
          stores: stores,
        })),

      getStoreById: (id) => {
        const state = get()
        return state.stores.find((store) => store.id === id)
      },
    }),
    {
      name: "furniture-store",
    },
  ),
)
