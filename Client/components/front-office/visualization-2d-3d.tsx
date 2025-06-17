"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Eye,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move3D,
  FileImage,
  FileText,
  Thermometer,
  Package,
  MapPin,
} from "lucide-react"

// Définir les types pour les données de l'API
interface Meuble {
  id: string
  name: string
  type: string
  model3D?: { url: string }
}

// Simuler les fonctions d'API (à remplacer par les vraies)
const getUserStoreId = async () => {
  // Simule une requête API pour obtenir l'ID du magasin de l'utilisateur
  return "store123"
}

const getMeublesForStore = async (storeId: string): Promise<Meuble[]> => {
  // Simule une requête API pour obtenir les meubles d'un magasin
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: "meuble1", name: "Meuble Épicerie", type: "Épicerie" },
        { id: "meuble2", name: "Meuble Laitier", type: "Frais" },
      ])
    }, 500)
  })
}

const getMeubleById = async (meubleId: string): Promise<Meuble> => {
  // Simule une requête API pour obtenir un meuble par ID
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: meubleId,
        name: `Meuble ${meubleId}`,
        type: "Type",
        model3D: { url: `url/vers/modele/${meubleId}.glb` },
      })
    }, 300)
  })
}

export default function Visualization2D3D() {
  // Remplacer les données simulées par un appel API
  const [meubles, setMeubles] = useState<Meuble[]>([])
  const [selectedMeuble, setSelectedMeuble] = useState<Meuble | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMeublesForVisualization()
  }, [])

  const loadMeublesForVisualization = async () => {
    try {
      const storeId = await getUserStoreId()
      const meublesData = await getMeublesForStore(storeId)
      setMeubles(meublesData)
      if (meublesData.length > 0) {
        setSelectedMeuble(meublesData[0])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des meubles:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour charger le modèle 3D
  const load3DModel = async (meubleId: string) => {
    try {
      const meuble = await getMeubleById(meubleId)
      if (meuble.model3D) {
        // Ici vous appelleriez votre système de visualisation 3D existant
        console.log("Chargement du modèle 3D:", meuble.model3D.url)
        // Votre logique de chargement 3D existante
      }
    } catch (error) {
      console.error("Erreur lors du chargement du modèle 3D:", error)
    }
  }

  const [selectedPlanogram, setSelectedPlanogram] = useState("epicerie-salee")
  const [viewMode, setViewMode] = useState("2d")
  const [zoomLevel, setZoomLevel] = useState([100])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showHeatmap, setShowHeatmap] = useState(false)

  const planograms = [
    { id: "epicerie-salee", name: "Rayon Épicerie Salée", category: "Épicerie" },
    { id: "produits-laitiers", name: "Produits Laitiers", category: "Frais" },
    { id: "boissons-chaudes", name: "Boissons Chaudes", category: "Épicerie" },
  ]

  const products = [
    {
      id: "P001",
      name: "Pâtes Barilla Spaghetti 500g",
      position: { x: 120, y: 80, shelf: 2 },
      quantity: 24,
      price: 1.89,
      stock: "En stock",
      performance: 85,
    },
    {
      id: "P002",
      name: "Sauce Tomate Mutti 400g",
      position: { x: 180, y: 80, shelf: 2 },
      quantity: 18,
      price: 2.45,
      stock: "Stock faible",
      performance: 92,
    },
    {
      id: "P003",
      name: "Huile Olive Puget 500ml",
      position: { x: 240, y: 80, shelf: 2 },
      quantity: 12,
      price: 4.99,
      stock: "En stock",
      performance: 78,
    },
  ]

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
  }

  const handleExport = (format: "pdf" | "image") => {
    // Simulation de l'export
    console.log(`Export en ${format} du planogramme ${selectedPlanogram}`)
  }

  return (
    <div className="space-y-6">
      {/* Contrôles de visualisation */}
      <Card>
        <CardHeader>
          <CardTitle>Contrôles de visualisation</CardTitle>
          <CardDescription>Sélectionnez le planogramme et configurez l'affichage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={selectedMeuble?.id || ""}
              onValueChange={(value) => {
                const meuble = meubles.find((m) => m.id === value)
                setSelectedMeuble(meuble || null)
                if (meuble) load3DModel(meuble.id)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un meuble" />
              </SelectTrigger>
              <SelectContent>
                {meubles.map((meuble) => (
                  <SelectItem key={meuble.id} value={meuble.id}>
                    {meuble.name} ({meuble.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="2d">Vue 2D</TabsTrigger>
                <TabsTrigger value="3d">Vue 3D</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Zoom:</span>
              <div className="flex-1">
                <Slider
                  value={zoomLevel}
                  onValueChange={setZoomLevel}
                  max={200}
                  min={50}
                  step={10}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-muted-foreground">{zoomLevel[0]}%</span>
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={showHeatmap ? "default" : "outline"}
                onClick={() => setShowHeatmap(!showHeatmap)}
              >
                <Thermometer className="h-4 w-4 mr-2" />
                Heatmap
              </Button>
              <Button
                size="sm"
                onClick={() => selectedMeuble && load3DModel(selectedMeuble.id)}
                disabled={!selectedMeuble}
              >
                <Eye className="h-4 w-4 mr-2" />
                Charger modèle 3D
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Zone de visualisation principale */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{planograms.find((p) => p.id === selectedPlanogram)?.name}</CardTitle>
                  <CardDescription>
                    Mode {viewMode.toUpperCase()} - Zoom {zoomLevel[0]}%
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExport("image")}>
                    <FileImage className="h-4 w-4 mr-2" />
                    Export Image
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExport("pdf")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Zone de visualisation simulée */}
              <div className="relative bg-gray-100 rounded-lg h-96 overflow-hidden">
                {viewMode === "2d" ? (
                  <div className="relative w-full h-full" style={{ transform: `scale(${zoomLevel[0] / 100})` }}>
                    {/* Simulation d'un planogramme 2D */}
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-200 to-gray-300">
                      {/* Étagères */}
                      {[1, 2, 3, 4].map((shelf) => (
                        <div
                          key={shelf}
                          className="absolute w-full h-16 bg-white border-2 border-gray-400 shadow-md"
                          style={{ top: `${shelf * 80}px` }}
                        >
                          <div className="absolute left-2 top-1 text-xs font-medium text-gray-600">Étagère {shelf}</div>
                        </div>
                      ))}

                      {/* Produits */}
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className={`absolute w-12 h-12 rounded cursor-pointer transition-all hover:scale-110 ${
                            selectedProduct?.id === product.id
                              ? "bg-blue-500 ring-2 ring-blue-300"
                              : showHeatmap
                                ? `bg-gradient-to-r ${
                                    product.performance > 90
                                      ? "from-green-400 to-green-600"
                                      : product.performance > 80
                                        ? "from-yellow-400 to-yellow-600"
                                        : "from-red-400 to-red-600"
                                  }`
                                : "bg-blue-400 hover:bg-blue-500"
                          }`}
                          style={{
                            left: `${product.position.x}px`,
                            top: `${product.position.shelf * 80 + 20}px`,
                          }}
                          onClick={() => handleProductClick(product)}
                          title={product.name}
                        >
                          <Package className="h-6 w-6 text-white m-3" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-100">
                    <div className="text-center">
                      <Move3D className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Vue 3D Interactive</h3>
                      <p className="text-gray-500 mb-4">Visualisation 3D du planogramme avec rotation et zoom</p>
                      <div className="flex justify-center space-x-2">
                        <Button size="sm" variant="outline">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Rotation
                        </Button>
                        <Button size="sm" variant="outline">
                          <ZoomIn className="h-4 w-4 mr-2" />
                          Zoom +
                        </Button>
                        <Button size="sm" variant="outline">
                          <ZoomOut className="h-4 w-4 mr-2" />
                          Zoom -
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panneau d'informations produit */}
        <div className="space-y-4">
          {selectedProduct ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Détails du produit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">{selectedProduct.name}</h4>
                  <p className="text-sm text-muted-foreground">ID: {selectedProduct.id}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Prix:</span>
                    <span className="text-sm font-medium">{selectedProduct.price}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quantité:</span>
                    <span className="text-sm font-medium">{selectedProduct.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Stock:</span>
                    <Badge variant={selectedProduct.stock === "En stock" ? "default" : "destructive"}>
                      {selectedProduct.stock}
                    </Badge>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Performance:</span>
                    <span className="text-sm font-medium">{selectedProduct.performance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${selectedProduct.performance}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      Étagère {selectedProduct.position.shelf}, Position ({selectedProduct.position.x},{" "}
                      {selectedProduct.position.y})
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Cliquez sur un produit pour voir ses détails</p>
              </CardContent>
            </Card>
          )}

          {/* Légende Heatmap */}
          {showHeatmap && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Légende Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded"></div>
                  <span className="text-sm">Excellente (90%+)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded"></div>
                  <span className="text-sm">Bonne (80-90%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-600 rounded"></div>
                  <span className="text-sm">À améliorer (&lt;80%)</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
