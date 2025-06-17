export interface Product {
    id: string
    name: string
    description: string
    price: number
    image: string
    barcode: string
    brand: string
    category: string
    supplier: string
    stock: number
    position: {
      x: number
      y: number
      z: number
      shelf: number
    }
    performance: {
      sales: number
      rotation: string
      margin: number
    }
    status: "En stock" | "Stock faible" | "Rupture"
  }
  
  export interface Meuble {
    id: string
    name: string
    type: "planogramme" | "gondole" | "tete_gondole" | "ilot" | "vitrine" | "comptoir"
    description: string
    category: string
    storeId: string
    storeName: string
    status: "Publié" | "En cours" | "Terminé" | "À implémenter"
    publishDate: string
    implementationDate: string
    version: string
    previousVersion?: string
    products: Product[]
    productCount: number
    changes: number
    dimensions: {
      width: number
      height: number
      depth: number
    }
    position: {
      x: number
      y: number
      rotation: number
    }
    createdBy: string
    createdAt: string
    updatedAt: string
    assignedTo?: string[]
    priority: "Haute" | "Moyenne" | "Basse"
    implementationProgress: number
    model3D?: {
      url: string
      format: "glb" | "gltf"
      textures?: string[]
    }
  }
  
  export interface Store {
    id: string
    name: string
    address: string
    city: string
    manager: string
    surface: number
    type: "hypermarché" | "supermarché" | "proximité"
  }
  
  export interface User {
    id: string
    name: string
    email: string
    role: "admin" | "manager" | "employee"
    storeId: string
    storeName: string
    permissions: string[]
  }
  