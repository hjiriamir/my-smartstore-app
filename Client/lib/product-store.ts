import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

export interface Product {
  primary_Id: string;
  name: string;
  supplier: string;
  category1_id?: string;
  category2_id?: string;
  category3_id?: string;
  width_cm?: number;
  height_cm?: number;
  depth_cm?: number;
  image?: string;
  color?: string;
  [key: string]: any;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  parentId: string | null;
}

interface Planogram {
  id: string;
  name: string;
  rows: number;
  columns: number;
  cellWidth: number;
  cellHeight: number;
  furnitureType: string;
  furnitureDimensions: {
    width: number;
    height: number;
    depth: number;
    baseHeight: number;
    shelfThickness: number;
  };
  cells: {
    id: string;
    productId: string | null;
    instanceId?: string | null;
    x: number;
    y: number;
  }[];
}

export interface ProductInstance {
  instanceId: string;
  productId: string;
  furnitureType: string;
}

interface ProductStore {
  products: Product[];
  categories: Category[];
  planograms: Planogram[];
  activeTab: string;
  productInstances: ProductInstance[];

  // Product actions
  addProduct: (product: Product) => void;
  addProducts: (products: Product[]) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  updateProductImage: (id: string, imageUrl: string) => void;
  deleteProduct: (id: string) => void;

  // Category actions
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Planogram actions
  addPlanogram: (planogram: Planogram) => void;
  updatePlanogram: (id: string, updates: Partial<Planogram>) => void;
  updatePlanogramFurnitureDimensions: (
    id: string,
    dimensions: Partial<Planogram["furnitureDimensions"]>
  ) => void;
  deletePlanogram: (id: string) => void;

  // Product instance actions
  addProductInstance: (instance: ProductInstance) => void;
  updateProductInstance: (instanceId: string, updates: Partial<ProductInstance>) => void;
  deleteProductInstance: (instanceId: string) => void;

  // UI state
  setActiveTab: (tab: string) => void;
  clearLibrary: () => void;
}

// Configuration du stockage IndexedDB
const indexedDbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: [],
      categories: [],
      planograms: [],
      productInstances: [],
      activeTab: "import",

      // Product actions
      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product],
        })),

      addProducts: (products) =>
        set((state) => ({
          products: [...state.products, ...products],
        })),

      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.primary_Id === id ? { ...product, ...updates } : product
          ),
        })),

      updateProductImage: (id, imageUrl) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.primary_Id === id ? { ...product, image: imageUrl } : product
          ),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((product) => product.primary_Id !== id),
        })),

      clearLibrary: () =>
        set(() => ({
          products: [],
          categories: [],
          planograms: [],
          productInstances: [],
        })),

      // Category actions
      addCategory: (category) =>
        set((state) => ({
          categories: [...state.categories, category],
        })),

      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, ...updates } : category
          ),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
        })),

      // Planogram actions
      addPlanogram: (planogram) =>
        set((state) => ({
          planograms: [...state.planograms, planogram],
        })),

      updatePlanogram: (id, updates) =>
        set((state) => ({
          planograms: state.planograms.map((planogram) =>
            planogram.id === id ? { ...planogram, ...updates } : planogram
          ),
        })),

      updatePlanogramFurnitureDimensions: (id, dimensions) =>
        set((state) => ({
          planograms: state.planograms.map((planogram) =>
            planogram.id === id
              ? {
                  ...planogram,
                  furnitureDimensions: {
                    ...planogram.furnitureDimensions,
                    ...dimensions,
                  },
                }
              : planogram
          ),
        })),

      deletePlanogram: (id) =>
        set((state) => ({
          planograms: state.planograms.filter((planogram) => planogram.id !== id),
        })),

      // Product instance actions
      addProductInstance: (instance) =>
        set((state) => ({
          productInstances: [...state.productInstances, instance],
        })),

      updateProductInstance: (instanceId, updates) =>
        set((state) => ({
          productInstances: state.productInstances.map((instance) =>
            instance.instanceId === instanceId ? { ...instance, ...updates } : instance
          ),
        })),

      deleteProductInstance: (instanceId) =>
        set((state) => ({
          productInstances: state.productInstances.filter(
            (instance) => instance.instanceId !== instanceId
          ),
        })),

      // UI state
      setActiveTab: (tab) =>
        set(() => ({
          activeTab: tab,
        })),
    }),
    {
      name: "product-store",
      storage: createJSONStorage(() => indexedDbStorage),
    }
  )
);

// Exemple de produits (optionnel)
const exampleProducts: Product[] = [
  {
    primary_Id: "PROD001",
    name: "Boîte de céréales",
    supplier: "Céréales Inc.",
    category1_id: "ALIM",
    width_cm: 20,
    height_cm: 30,
    depth_cm: 8,
    color: "#E74C3C",
  },
  {
    primary_Id: "PROD002",
    name: "Bouteille de lait",
    supplier: "Laiterie Bio",
    category1_id: "ALIM",
    width_cm: 10,
    height_cm: 25,
    depth_cm: 10,
    color: "#3498DB",
  },
];

// Fonction d'initialisation (optionnelle)
export const initializeExampleProducts = () => {
  return exampleProducts;
};