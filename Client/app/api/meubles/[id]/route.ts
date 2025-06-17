import { type NextRequest, NextResponse } from "next/server"
import type { Meuble } from "@/lib/types.ts"

// GET /api/meubles/[id] - Récupérer un meuble spécifique
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const meubleId = params.id

    // Récupérer le meuble depuis la base de données
    const meuble = await getMeubleFromDatabase(meubleId)

    if (!meuble) {
      return NextResponse.json({ error: "Meuble non trouvé" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      meuble,
    })
  } catch (error) {
    console.error("Erreur API meuble:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// Fonction simulée pour récupérer un meuble
async function getMeubleFromDatabase(id: string): Promise<Meuble | null> {
  // Simulation - remplacez par votre logique de base de données
  // Cette fonction devrait inclure les produits associés au meuble

  if (id === "M001") {
    return {
      id: "M001",
      name: "Gondole Épicerie Salée - Section A",
      type: "gondole",
      description: "Gondole principale pour les produits d'épicerie salée",
      category: "Épicerie",
      storeId: "STORE_001",
      storeName: "Magasin Centre-Ville",
      status: "Publié",
      publishDate: "2024-01-15",
      implementationDate: "2024-01-20",
      version: "2.1",
      previousVersion: "2.0",
      products: [
        {
          id: "P001",
          name: "Pâtes Barilla Spaghetti 500g",
          description: "Pâtes italiennes de qualité premium",
          price: 1.89,
          image: "/placeholder.svg?height=100&width=100",
          barcode: "8076809513456",
          brand: "Barilla",
          category: "Épicerie Salée",
          supplier: "Barilla France",
          stock: 156,
          position: {
            x: 120,
            y: 80,
            z: 20,
            shelf: 2,
          },
          performance: {
            sales: 85,
            rotation: "Élevée",
            margin: 23.5,
          },
          status: "En stock",
        },
      ],
      productCount: 156,
      changes: 12,
      dimensions: {
        width: 120,
        height: 180,
        depth: 60,
      },
      position: {
        x: 100,
        y: 50,
        rotation: 0,
      },
      createdBy: "Admin Retail",
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-15T14:30:00Z",
      assignedTo: ["Marie Dubois"],
      priority: "Haute",
      implementationProgress: 65,
      model3D: {
        url: "/models/gondole-epicerie.glb",
        format: "glb",
        textures: ["/textures/gondole-metal.jpg"],
      },
    }
  }

  return null
}
