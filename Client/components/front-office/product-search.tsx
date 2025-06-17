"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Package, MapPin, Barcode, Eye, AlertTriangle, CheckCircle } from "lucide-react"

export default function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("name")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const products = [
    {
      id: "P001",
      name: "Pâtes Barilla Spaghetti 500g",
      barcode: "8076809513456",
      category: "Épicerie Salée",
      brand: "Barilla",
      price: 1.89,
      stock: 156,
      location: {
        planogram: "Rayon Épicerie Salée",
        shelf: 2,
        position: { x: 120, y: 80 },
        facing: 4,
      },
      performance: {
        sales: 85,
        rotation: "Élevée",
        margin: 23.5,
      },
      status: "En stock",
      image: "/placeholder.svg?height=100&width=100",
      description: "Pâtes italiennes de qualité premium, cuisson parfaite en 8-10 minutes",
      supplier: "Barilla France",
      lastUpdate: "2024-01-18",
    },
    {
      id: "P002",
      name: "Sauce Tomate Mutti 400g",
      barcode: "8005110101007",
      category: "Épicerie Salée",
      brand: "Mutti",
      price: 2.45,
      stock: 89,
      location: {
        planogram: "Rayon Épicerie Salée",
        shelf: 2,
        position: { x: 180, y: 80 },
        facing: 3,
      },
      performance: {
        sales: 92,
        rotation: "Très élevée",
        margin: 28.1,
      },
      status: "Stock faible",
      image: "/placeholder.svg?height=100&width=100",
      description: "Sauce tomate italienne 100% naturelle, sans conservateurs",
      supplier: "Mutti SPA",
      lastUpdate: "2024-01-19",
    },
    {
      id: "P003",
      name: "Huile Olive Puget 500ml",
      barcode: "3250391234567",
      category: "Épicerie Salée",
      brand: "Puget",
      price: 4.99,
      stock: 45,
      location: {
        planogram: "Rayon Épicerie Salée",
        shelf: 3,
        position: { x: 240, y: 120 },
        facing: 2,
      },
      performance: {
        sales: 78,
        rotation: "Moyenne",
        margin: 31.2,
      },
      status: "En stock",
      image: "/placeholder.svg?height=100&width=100",
      description: "Huile d'olive vierge extra, première pression à froid",
      supplier: "Lesieur",
      lastUpdate: "2024-01-17",
    },
    {
      id: "P004",
      name: "Riz Basmati Taureau Ailé 1kg",
      barcode: "3168930010234",
      category: "Épicerie Salée",
      brand: "Taureau Ailé",
      price: 3.29,
      stock: 0,
      location: {
        planogram: "Rayon Épicerie Salée",
        shelf: 1,
        position: { x: 60, y: 40 },
        facing: 3,
      },
      performance: {
        sales: 65,
        rotation: "Faible",
        margin: 25.8,
      },
      status: "Rupture",
      image: "/placeholder.svg?height=100&width=100",
      description: "Riz basmati long grain, cuisson parfaite et grains séparés",
      supplier: "Riviana Foods",
      lastUpdate: "2024-01-15",
    },
  ]

  const filteredProducts = products.filter((product) => {
    const searchValue = searchTerm.toLowerCase()
    switch (searchType) {
      case "name":
        return product.name.toLowerCase().includes(searchValue)
      case "barcode":
        return product.barcode.includes(searchTerm)
      case "brand":
        return product.brand.toLowerCase().includes(searchValue)
      case "category":
        return product.category.toLowerCase().includes(searchValue)
      default:
        return product.name.toLowerCase().includes(searchValue)
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En stock":
        return "bg-green-100 text-green-800"
      case "Stock faible":
        return "bg-yellow-100 text-yellow-800"
      case "Rupture":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "En stock":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Stock faible":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "Rupture":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const getPerformanceColor = (sales: number) => {
    if (sales >= 90) return "text-green-600"
    if (sales >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Barre de recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche de produits</CardTitle>
          <CardDescription>Trouvez rapidement un produit et sa localisation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Type de recherche" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom du produit</SelectItem>
                <SelectItem value="barcode">Code-barres</SelectItem>
                <SelectItem value="brand">Marque</SelectItem>
                <SelectItem value="category">Catégorie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des résultats */}
        <div className="lg:col-span-2 space-y-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  selectedProduct?.id === product.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedProduct(product)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg truncate">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {product.brand} • {product.category}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {getStatusIcon(product.status)}
                          <Badge className={getStatusColor(product.status)}>{product.status}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <span className="font-medium">Prix:</span>
                          <div className="text-lg font-bold text-blue-600">{product.price}€</div>
                        </div>
                        <div>
                          <span className="font-medium">Stock:</span>
                          <div className={product.stock === 0 ? "text-red-600 font-bold" : "font-medium"}>
                            {product.stock} unités
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Performance:</span>
                          <div className={`font-bold ${getPerformanceColor(product.performance.sales)}`}>
                            {product.performance.sales}%
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Emplacement:</span>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>Étagère {product.location.shelf}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Barcode className="h-3 w-3" />
                          <span>{product.barcode}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Localiser
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-500">Essayez de modifier votre recherche ou le type de recherche.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Détails du produit sélectionné */}
        <div>
          {selectedProduct ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Fiche produit détaillée</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <img
                    src={selectedProduct.image || "/placeholder.svg"}
                    alt={selectedProduct.name}
                    className="w-24 h-24 object-cover rounded-lg border mx-auto mb-3"
                  />
                  <h3 className="font-medium">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">ID Produit:</span>
                    <span className="text-sm">{selectedProduct.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Code-barres:</span>
                    <span className="text-sm font-mono">{selectedProduct.barcode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Marque:</span>
                    <span className="text-sm">{selectedProduct.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Fournisseur:</span>
                    <span className="text-sm">{selectedProduct.supplier}</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <h4 className="font-medium mb-2">Localisation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Planogramme:</span>
                      <span className="font-medium">{selectedProduct.location.planogram}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Étagère:</span>
                      <span className="font-medium">{selectedProduct.location.shelf}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Position:</span>
                      <span className="font-medium">
                        ({selectedProduct.location.position.x}, {selectedProduct.location.position.y})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Facings:</span>
                      <span className="font-medium">{selectedProduct.location.facing}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <h4 className="font-medium mb-2">Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ventes:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              selectedProduct.performance.sales >= 90
                                ? "bg-green-500"
                                : selectedProduct.performance.sales >= 80
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${selectedProduct.performance.sales}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{selectedProduct.performance.sales}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Rotation:</span>
                      <Badge variant="outline">{selectedProduct.performance.rotation}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Marge:</span>
                      <span className="text-sm font-medium text-green-600">{selectedProduct.performance.margin}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <Button className="w-full" size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Localiser dans le magasin
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Sélectionnez un produit pour voir ses détails</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
