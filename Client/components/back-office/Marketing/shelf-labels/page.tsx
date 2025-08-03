"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Tag,
  Package,
  AlertTriangle,
  CheckCircle,
  Edit,
  Printer,
  Camera,
  ChevronDown,
  Menu,
  DollarSign,
  Settings,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

export default function OptimizedShelfLabelsPage() {
  const [showNewLabel, setShowNewLabel] = useState(false)
  const [showBulkPricing, setShowBulkPricing] = useState(false)
  const [showLabelTemplate, setShowLabelTemplate] = useState(false)
  const [showPriceUpdate, setShowPriceUpdate] = useState(false)
  const [showEditTemplate, setShowEditTemplate] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [activeTab, setActiveTab] = useState("labels-pricing")
  const [showNewTemplate, setShowNewTemplate] = useState(false)

  // États pour les recherches multicritères
  const [labelSearchFilters, setLabelSearchFilters] = useState({
    name: "",
    category: "all",
    location: "all",
    status: "all",
    priceMin: "",
    priceMax: "",
  })

  const [priceSearchFilters, setPriceSearchFilters] = useState({
    name: "",
    category: "all",
    location: "all",
    status: "all",
    priceMin: "",
    priceMax: "",
  })

  const [productSearchFilters, setProductSearchFilters] = useState({
    name: "",
    category: "all",
    location: "all",
    status: "all",
    priceMin: "",
    priceMax: "",
  })

  const [stockSearchFilters, setStockSearchFilters] = useState({
    name: "",
    category: "all",
    location: "all",
    status: "all",
    priceMin: "",
    priceMax: "",
  })

  // DÉPLACER ICI : Déclaration du tableau products AVANT son utilisation
  const products = [
    {
      id: "P001",
      name: "Smartphone Galaxy Pro",
      currentPrice: 899.99,
      originalPrice: 999.99,
      stock: 12,
      status: "low_stock",
      priceChange: -10,
      lastUpdate: "Il y a 2h",
      compliance: true,
      category: "Électronique",
      location: "Rayon A1",
      labelStatus: "printed",
      eslStatus: "synced",
    },
    {
      id: "P002",
      name: "Casque Audio Premium",
      currentPrice: 249.99,
      originalPrice: 249.99,
      stock: 45,
      status: "in_stock",
      priceChange: 0,
      lastUpdate: "Il y a 30min",
      compliance: true,
      category: "Audio",
      location: "Rayon A2",
      labelStatus: "pending",
      eslStatus: "pending",
    },
    {
      id: "P003",
      name: "Tablette Ultra HD",
      currentPrice: 599.99,
      originalPrice: 549.99,
      stock: 0,
      status: "out_of_stock",
      priceChange: +9,
      lastUpdate: "Il y a 1h",
      compliance: false,
      category: "Électronique",
      location: "Rayon A3",
      labelStatus: "error",
      eslStatus: "error",
    },
    {
      id: "P004",
      name: "Montre Connectée Sport",
      currentPrice: 199.99,
      originalPrice: 229.99,
      stock: 28,
      status: "in_stock",
      priceChange: -13,
      lastUpdate: "Il y a 15min",
      compliance: true,
      category: "Accessoires",
      location: "Rayon B1",
      labelStatus: "printed",
      eslStatus: "synced",
    },
  ]

  // Fonction de filtrage des produits (maintenant products est défini)
  const filterProducts = (products, filters) => {
    return products.filter((product) => {
      const matchesName = !filters.name || product.name.toLowerCase().includes(filters.name.toLowerCase())
      const matchesCategory = filters.category === "all" || !filters.category || product.category === filters.category
      const matchesLocation =
        filters.location === "all" ||
        !filters.location ||
        product.location.toLowerCase().includes(filters.location.toLowerCase())
      const matchesStatus = filters.status === "all" || !filters.status || product.status === filters.status
      const matchesPriceMin = !filters.priceMin || product.currentPrice >= Number.parseFloat(filters.priceMin)
      const matchesPriceMax = !filters.priceMax || product.currentPrice <= Number.parseFloat(filters.priceMax)

      return matchesName && matchesCategory && matchesLocation && matchesStatus && matchesPriceMin && matchesPriceMax
    })
  }

  // Obtenir les produits filtrés
  const filteredProductsForLabels = filterProducts(products, labelSearchFilters)
  const filteredProductsForPricing = filterProducts(products, priceSearchFilters)
  const filteredProductsForManagement = filterProducts(products, productSearchFilters)
  const filteredProductsForStock = filterProducts(products, stockSearchFilters)

  // Obtenir les catégories uniques
  const categories = [...new Set(products.map((p) => p.category))]
  const locations = [...new Set(products.map((p) => p.location))]

  const labelTemplates = [
    { id: "standard", name: "Standard Magasin", size: '2.9"', fields: ["Prix", "Code-barres", "Nom"] },
    {
      id: "promo",
      name: "Promotion",
      size: '4.2"',
      fields: ["Prix promo", "Prix barré", "% réduction", "Code-barres"],
    },
    {
      id: "detailed",
      name: "Détaillée",
      size: '7.5"',
      fields: ["Prix", "Prix/kg", "Origine", "Nutri-Score", "Code-barres"],
    },
  ]

  const navigationItems = [
    { value: "labels-pricing", label: "Étiquettes & Prix", icon: Tag },
    { value: "stock-integration", label: "Intégration Stocks", icon: Package },
  ]

  const getCurrentNavLabel = () => {
    const activeItem = navigationItems.find((item) => item.value === activeTab)
    return activeItem ? activeItem.label : "Étiquettes & Prix"
  }

  return (
    <div className="min-h-screen bg-slate-50 mt-8 sm:mt-12">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link href="/marketing">
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">
              Étiquetage & Prix Magasin
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm lg:text-base">
              Gestion intelligente des étiquettes et prix en magasin physique
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Navigation - Dropdown on mobile, tabs on desktop */}
          <div className="block sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-transparent">
                  <div className="flex items-center gap-2">
                    <Menu className="w-4 h-4" />
                    <span className="truncate">{getCurrentNavLabel()}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[280px]">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem
                      key={item.value}
                      onClick={() => setActiveTab(item.value)}
                      className={`flex items-center gap-2 cursor-pointer ${
                        activeTab === item.value ? "bg-slate-100" : ""
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden sm:block overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 min-w-[600px] sm:min-w-0">
              <TabsTrigger value="labels-pricing" className="text-xs sm:text-sm">
                Étiquettes & Prix
              </TabsTrigger>
              <TabsTrigger value="stock-integration" className="text-xs sm:text-sm">
                Intégration Stocks
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="labels-pricing" className="space-y-4 sm:space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Dialog open={showNewLabel} onOpenChange={setShowNewLabel}>
                <DialogTrigger asChild>
                  <Button className="text-sm w-full sm:w-auto">
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Créer Étiquettes
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">Générateur d'Étiquettes</DialogTitle>
                    <DialogDescription className="text-sm">
                      Créez et configurez vos étiquettes magasin
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Modèle d'étiquette</Label>
                        <Select>
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Choisir un modèle" />
                          </SelectTrigger>
                          <SelectContent>
                            {labelTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name} ({template.size})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Quantité</Label>
                        <Input placeholder="Ex: 50" className="text-sm" />
                      </div>
                    </div>

                    {/* Recherche multicritères pour étiquettes */}
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium mb-3 text-sm sm:text-base">Recherche Avancée</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Nom du produit</Label>
                          <Input
                            placeholder="Rechercher..."
                            value={labelSearchFilters.name}
                            onChange={(e) => setLabelSearchFilters({ ...labelSearchFilters, name: e.target.value })}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Catégorie</Label>
                          <Select
                            value={labelSearchFilters.category}
                            onValueChange={(value) => setLabelSearchFilters({ ...labelSearchFilters, category: value })}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Toutes" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Toutes les catégories</SelectItem>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Rayon</Label>
                          <Select
                            value={labelSearchFilters.location}
                            onValueChange={(value) => setLabelSearchFilters({ ...labelSearchFilters, location: value })}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Tous" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous les rayons</SelectItem>
                              {locations.map((loc) => (
                                <SelectItem key={loc} value={loc}>
                                  {loc}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Statut</Label>
                          <Select
                            value={labelSearchFilters.status}
                            onValueChange={(value) => setLabelSearchFilters({ ...labelSearchFilters, status: value })}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Tous" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous les statuts</SelectItem>
                              <SelectItem value="in_stock">En stock</SelectItem>
                              <SelectItem value="low_stock">Stock faible</SelectItem>
                              <SelectItem value="out_of_stock">Rupture</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Prix min</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={labelSearchFilters.priceMin}
                            onChange={(e) => setLabelSearchFilters({ ...labelSearchFilters, priceMin: e.target.value })}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Prix max</Label>
                          <Input
                            type="number"
                            placeholder="999"
                            value={labelSearchFilters.priceMax}
                            onChange={(e) => setLabelSearchFilters({ ...labelSearchFilters, priceMax: e.target.value })}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setLabelSearchFilters({
                              name: "",
                              category: "all",
                              location: "all",
                              status: "all",
                              priceMin: "",
                              priceMax: "",
                            })
                          }
                          className="text-xs bg-transparent"
                        >
                          Réinitialiser
                        </Button>
                        <Badge variant="secondary" className="text-xs">
                          {filteredProductsForLabels.length} produit(s) trouvé(s)
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Sélectionner les produits ({filteredProductsForLabels.length})</Label>
                      <div className="grid grid-cols-1 gap-2 mt-2 max-h-60 overflow-y-auto border rounded p-2">
                        {filteredProductsForLabels.map((product) => (
                          <div key={product.id} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded">
                            <Checkbox id={`label-${product.id}`} />
                            <div className="min-w-0 flex-1">
                              <Label
                                htmlFor={`label-${product.id}`}
                                className="text-xs sm:text-sm truncate block font-medium"
                              >
                                {product.name}
                              </Label>
                              <div className="flex gap-2 text-xs text-slate-500">
                                <span>{product.location}</span>
                                <span>•</span>
                                <span>{product.category}</span>
                                <span>•</span>
                                <span>€{product.currentPrice}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {filteredProductsForLabels.length === 0 && (
                          <div className="text-center py-4 text-slate-500 text-sm">
                            Aucun produit ne correspond aux critères de recherche
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-3 text-sm sm:text-base">Options d'impression</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="auto-print" className="text-xs sm:text-sm">
                            Impression automatique
                          </Label>
                          <Switch id="auto-print" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="include-qr" className="text-xs sm:text-sm">
                            Inclure QR Code
                          </Label>
                          <Switch id="include-qr" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="color-coding" className="text-xs sm:text-sm">
                            Codage couleur par rayon
                          </Label>
                          <Switch id="color-coding" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewLabel(false)} className="text-sm">
                      Annuler
                    </Button>
                    <Button onClick={() => setShowNewLabel(false)} className="text-sm">
                      <Printer className="w-4 h-4 mr-2" />
                      Générer Étiquettes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showBulkPricing} onOpenChange={setShowBulkPricing}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-sm w-full sm:w-auto bg-transparent">
                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Modification Prix
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">Modification des Prix</DialogTitle>
                    <DialogDescription className="text-sm">
                      Modifiez les prix individuellement ou en masse
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm">Type de modification</Label>
                        <Select>
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Choisir" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Pourcentage</SelectItem>
                            <SelectItem value="fixed">Montant fixe</SelectItem>
                            <SelectItem value="new-price">Nouveau prix</SelectItem>
                            <SelectItem value="promotion">Promotion</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Valeur</Label>
                        <Input placeholder="Ex: 10" className="text-sm" />
                      </div>
                      <div>
                        <Label className="text-sm">Action</Label>
                        <Select>
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="increase">Augmenter</SelectItem>
                            <SelectItem value="decrease">Diminuer</SelectItem>
                            <SelectItem value="set">Définir</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Recherche multicritères pour prix */}
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium mb-3 text-sm sm:text-base">Recherche Avancée</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Nom du produit</Label>
                          <Input
                            placeholder="Rechercher..."
                            value={priceSearchFilters.name}
                            onChange={(e) => setPriceSearchFilters({ ...priceSearchFilters, name: e.target.value })}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Catégorie</Label>
                          <Select
                            value={priceSearchFilters.category}
                            onValueChange={(value) => setPriceSearchFilters({ ...priceSearchFilters, category: value })}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Toutes" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Toutes les catégories</SelectItem>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Rayon</Label>
                          <Select
                            value={priceSearchFilters.location}
                            onValueChange={(value) => setPriceSearchFilters({ ...priceSearchFilters, location: value })}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Tous" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous les rayons</SelectItem>
                              {locations.map((loc) => (
                                <SelectItem key={loc} value={loc}>
                                  {loc}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Statut</Label>
                          <Select
                            value={priceSearchFilters.status}
                            onValueChange={(value) => setPriceSearchFilters({ ...priceSearchFilters, status: value })}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Tous" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous les statuts</SelectItem>
                              <SelectItem value="in_stock">En stock</SelectItem>
                              <SelectItem value="low_stock">Stock faible</SelectItem>
                              <SelectItem value="out_of_stock">Rupture</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Prix min</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={priceSearchFilters.priceMin}
                            onChange={(e) => setPriceSearchFilters({ ...priceSearchFilters, priceMin: e.target.value })}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Prix max</Label>
                          <Input
                            type="number"
                            placeholder="999"
                            value={priceSearchFilters.priceMax}
                            onChange={(e) => setPriceSearchFilters({ ...priceSearchFilters, priceMax: e.target.value })}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPriceSearchFilters({
                              name: "",
                              category: "all",
                              location: "all",
                              status: "all",
                              priceMin: "",
                              priceMax: "",
                            })
                          }
                          className="text-xs bg-transparent"
                        >
                          Réinitialiser
                        </Button>
                        <Badge variant="secondary" className="text-xs">
                          {filteredProductsForPricing.length} produit(s) trouvé(s)
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Produits concernés ({filteredProductsForPricing.length})</Label>
                      <div className="grid grid-cols-1 gap-2 mt-2 max-h-60 overflow-y-auto border rounded p-2">
                        {filteredProductsForPricing.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-2 hover:bg-slate-50 rounded"
                          >
                            <div className="flex items-center space-x-2">
                              <Checkbox id={`price-${product.id}`} />
                              <div>
                                <Label htmlFor={`price-${product.id}`} className="text-xs sm:text-sm font-medium">
                                  {product.name}
                                </Label>
                                <div className="flex gap-2 text-xs text-slate-500">
                                  <span>{product.location}</span>
                                  <span>•</span>
                                  <span>{product.category}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">€{product.currentPrice}</div>
                              <div className="text-xs text-green-600">→ €{(product.currentPrice * 0.9).toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                        {filteredProductsForPricing.length === 0 && (
                          <div className="text-center py-4 text-slate-500 text-sm">
                            Aucun produit ne correspond aux critères de recherche
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-3 text-sm sm:text-base">Mise à jour automatique</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="update-labels" className="text-xs sm:text-sm">
                            Réimprimer étiquettes
                          </Label>
                          <Switch id="update-labels" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="update-esl" className="text-xs sm:text-sm">
                            Synchroniser ESL
                          </Label>
                          <Switch id="update-esl" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="notify-team" className="text-xs sm:text-sm">
                            Notifier équipes
                          </Label>
                          <Switch id="notify-team" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowBulkPricing(false)} className="text-sm">
                      Annuler
                    </Button>
                    <Button onClick={() => setShowBulkPricing(false)} className="text-sm">
                      Appliquer Modifications
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showLabelTemplate} onOpenChange={setShowLabelTemplate}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-sm w-full sm:w-auto bg-transparent">
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Modèles
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">Gestion des Modèles</DialogTitle>
                    <DialogDescription className="text-sm">
                      Modifiez vos modèles d'étiquettes existants
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full text-sm bg-transparent"
                      onClick={() => setShowNewTemplate(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nouveau Modèle
                    </Button>
                    {labelTemplates.map((template) => (
                      <div key={template.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-sm sm:text-base">{template.name}</h4>
                            <p className="text-xs text-slate-500">Taille: {template.size}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-transparent"
                            onClick={() => {
                              setEditingTemplate(template)
                              setShowEditTemplate(true)
                            }}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Modifier
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {template.fields.map((field) => (
                            <Badge key={field} variant="secondary" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Dialog de modification de modèle */}
              <Dialog open={showEditTemplate} onOpenChange={setShowEditTemplate}>
                <DialogContent className="w-[95vw] max-w-xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">
                      Modifier le Modèle: {editingTemplate?.name}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                      Personnalisez les champs et paramètres de ce modèle
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Nom du modèle</Label>
                        <Input defaultValue={editingTemplate?.name} className="text-sm" />
                      </div>
                      <div>
                        <Label className="text-sm">Taille</Label>
                        <Select defaultValue={editingTemplate?.size}>
                          <SelectTrigger className="text-sm">
                            <SelectValue value={editingTemplate?.size || ""} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='2.9"'>Petit (2.9")</SelectItem>
                            <SelectItem value='4.2"'>Moyen (4.2")</SelectItem>
                            <SelectItem value='7.5"'>Grand (7.5")</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Champs à afficher</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 p-3 border rounded">
                        {[
                          "Prix principal",
                          "Prix promotionnel",
                          "Prix barré",
                          "% réduction",
                          "Code-barres",
                          "QR Code",
                          "Nom produit",
                          "Origine produit",
                          "Nutri-Score",
                          "Éco-Score",
                          "Prix au kg/litre",
                          "Date limite",
                          "Lot/Série",
                        ].map((field) => (
                          <div key={field} className="flex items-center space-x-2">
                            <Checkbox id={`field-${field}`} defaultChecked={editingTemplate?.fields.includes(field)} />
                            <Label htmlFor={`field-${field}`} className="text-xs sm:text-sm">
                              {field}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Options d'affichage</Label>
                      <div className="space-y-3 mt-2 p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs sm:text-sm">Police en gras</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs sm:text-sm">Bordure</Label>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs sm:text-sm">Logo magasin</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs sm:text-sm">Couleur par rayon</Label>
                          <Switch />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Aperçu</Label>
                      <div className="mt-2 p-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
                        <div className="text-center text-slate-500 text-sm">
                          Aperçu du modèle "{editingTemplate?.name}"
                          <br />
                          <span className="text-xs">Taille: {editingTemplate?.size}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowEditTemplate(false)} className="text-sm">
                      Annuler
                    </Button>
                    <Button onClick={() => setShowEditTemplate(false)} className="text-sm">
                      Sauvegarder
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Étiquettes Générées</CardTitle>
                  <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">247</div>
                  <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Prix Modifiés</CardTitle>
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-green-600">89</div>
                  <p className="text-xs text-muted-foreground">Cette semaine</p>
                </CardContent>
              </Card>
            </div>

            {/* Products Management */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Gestion Produits</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Étiquetage et modification des prix par produit
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Recherche multicritères pour la gestion des produits */}
                <div className="p-4 bg-slate-50 rounded-lg mb-4">
                  <h4 className="font-medium mb-3 text-sm sm:text-base">Recherche et Filtres</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Nom du produit</Label>
                      <Input
                        placeholder="Rechercher..."
                        value={productSearchFilters.name}
                        onChange={(e) => setProductSearchFilters({ ...productSearchFilters, name: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Catégorie</Label>
                      <Select
                        value={productSearchFilters.category}
                        onValueChange={(value) => setProductSearchFilters({ ...productSearchFilters, category: value })}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Toutes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les catégories</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Rayon</Label>
                      <Select
                        value={productSearchFilters.location}
                        onValueChange={(value) => setProductSearchFilters({ ...productSearchFilters, location: value })}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Tous" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les rayons</SelectItem>
                          {locations.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Statut</Label>
                      <Select
                        value={productSearchFilters.status}
                        onValueChange={(value) => setProductSearchFilters({ ...productSearchFilters, status: value })}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Tous" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les statuts</SelectItem>
                          <SelectItem value="in_stock">En stock</SelectItem>
                          <SelectItem value="low_stock">Stock faible</SelectItem>
                          <SelectItem value="out_of_stock">Rupture</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Prix min</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={productSearchFilters.priceMin}
                        onChange={(e) => setProductSearchFilters({ ...productSearchFilters, priceMin: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Prix max</Label>
                      <Input
                        type="number"
                        placeholder="999"
                        value={productSearchFilters.priceMax}
                        onChange={(e) => setProductSearchFilters({ ...productSearchFilters, priceMax: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setProductSearchFilters({
                          name: "",
                          category: "all",
                          location: "all",
                          status: "all",
                          priceMin: "",
                          priceMax: "",
                        })
                      }
                      className="text-xs bg-transparent"
                    >
                      Réinitialiser
                    </Button>
                    <Badge variant="secondary" className="text-xs">
                      {filteredProductsForManagement.length} produit(s) affiché(s)
                    </Badge>
                  </div>
                </div>

                {/* Liste des produits filtrés */}
                <div className="space-y-3 sm:space-y-4">
                  {filteredProductsForManagement.map((product) => (
                    <div
                      key={product.id}
                      className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-3 sm:p-4 border rounded-lg gap-3"
                    >
                      <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge
                              variant={
                                product.status === "in_stock"
                                  ? "default"
                                  : product.status === "low_stock"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {product.status === "in_stock"
                                ? "En stock"
                                : product.status === "low_stock"
                                  ? "Stock faible"
                                  : "Rupture"}
                            </Badge>
                            <Badge
                              variant={
                                product.labelStatus === "printed"
                                  ? "default"
                                  : product.labelStatus === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              Étiquette:{" "}
                              {product.labelStatus === "printed"
                                ? "OK"
                                : product.labelStatus === "pending"
                                  ? "En attente"
                                  : "Erreur"}
                            </Badge>
                            <span className="text-xs sm:text-sm text-slate-600">{product.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="text-left sm:text-right">
                          <div className="font-semibold text-green-600 text-sm sm:text-base">
                            €{product.currentPrice}
                            {product.originalPrice !== product.currentPrice && (
                              <span className="text-xs text-slate-500 line-through ml-2">€{product.originalPrice}</span>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-600">{product.lastUpdate}</div>
                        </div>
                        <div className="flex gap-1 sm:gap-2">
                          <Dialog open={showPriceUpdate} onOpenChange={setShowPriceUpdate}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                title="Modifier prix"
                                className="h-8 w-8 p-0 bg-transparent"
                              >
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[95vw] max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-lg">Modifier le Prix</DialogTitle>
                                <DialogDescription className="text-sm">{product.name}</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div>
                                  <Label className="text-sm">Prix actuel</Label>
                                  <Input value={`€${product.currentPrice}`} disabled className="text-sm" />
                                </div>
                                <div>
                                  <Label className="text-sm">Nouveau prix</Label>
                                  <Input placeholder="€0.00" className="text-sm" />
                                </div>
                                <div>
                                  <Label className="text-sm">Raison du changement</Label>
                                  <Select>
                                    <SelectTrigger className="text-sm">
                                      <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="promotion">Promotion</SelectItem>
                                      <SelectItem value="competition">Concurrence</SelectItem>
                                      <SelectItem value="cost">Coût fournisseur</SelectItem>
                                      <SelectItem value="clearance">Déstockage</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="update-label" defaultChecked />
                                  <Label htmlFor="update-label" className="text-sm">
                                    Réimprimer l'étiquette
                                  </Label>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowPriceUpdate(false)} className="text-sm">
                                  Annuler
                                </Button>
                                <Button onClick={() => setShowPriceUpdate(false)} className="text-sm">
                                  Confirmer
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Imprimer étiquette"
                            className="h-8 w-8 p-0 bg-transparent"
                          >
                            <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            title="Vérifier en magasin"
                            className="h-8 w-8 p-0 bg-transparent"
                          >
                            <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredProductsForManagement.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Aucun produit trouvé</p>
                      <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section Intégration Stocks - Gardée intacte */}
          <TabsContent value="stock-integration" className="space-y-4 sm:space-y-6">
            {/* Recherche multicritères pour intégration stocks */}
            <div className="p-4 bg-slate-50 rounded-lg mb-4">
              <h4 className="font-medium mb-3 text-sm sm:text-base">Recherche et Filtres</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Nom du produit</Label>
                  <Input
                    placeholder="Rechercher..."
                    value={stockSearchFilters.name}
                    onChange={(e) => setStockSearchFilters({ ...stockSearchFilters, name: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Catégorie</Label>
                  <Select
                    value={stockSearchFilters.category}
                    onValueChange={(value) => setStockSearchFilters({ ...stockSearchFilters, category: value })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Rayon</Label>
                  <Select
                    value={stockSearchFilters.location}
                    onValueChange={(value) => setStockSearchFilters({ ...stockSearchFilters, location: value })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les rayons</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Statut</Label>
                  <Select
                    value={stockSearchFilters.status}
                    onValueChange={(value) => setStockSearchFilters({ ...stockSearchFilters, status: value })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="in_stock">En stock</SelectItem>
                      <SelectItem value="low_stock">Stock faible</SelectItem>
                      <SelectItem value="out_of_stock">Rupture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Prix min</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={stockSearchFilters.priceMin}
                    onChange={(e) => setStockSearchFilters({ ...stockSearchFilters, priceMin: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Prix max</Label>
                  <Input
                    type="number"
                    placeholder="999"
                    value={stockSearchFilters.priceMax}
                    onChange={(e) => setStockSearchFilters({ ...stockSearchFilters, priceMax: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setStockSearchFilters({
                      name: "",
                      category: "all",
                      location: "all",
                      status: "all",
                      priceMin: "",
                      priceMax: "",
                    })
                  }
                  className="text-xs bg-transparent"
                >
                  Réinitialiser
                </Button>
                <Badge variant="secondary" className="text-xs">
                  {filteredProductsForStock.length} produit(s) affiché(s)
                </Badge>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Intégration Stocks & Prix Magasin</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Synchronisation automatique entre niveaux de stock et affichage prix en magasin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {filteredProductsForStock.map((product) => (
                    <div key={product.id} className="p-3 sm:p-4 border rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm sm:text-base truncate">{product.name}</h4>
                          <p className="text-xs sm:text-sm text-slate-600">
                            {product.location} • ID: {product.id}
                          </p>
                        </div>
                        <Badge
                          variant={
                            product.status === "in_stock"
                              ? "default"
                              : product.status === "low_stock"
                                ? "secondary"
                                : "destructive"
                          }
                          className="text-xs w-fit"
                        >
                          {product.status === "in_stock"
                            ? "En stock"
                            : product.status === "low_stock"
                              ? "Stock faible"
                              : "Rupture"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                          <h5 className="text-xs sm:text-sm font-medium text-slate-700 mb-1">Prix Magasin</h5>
                          <div className="text-lg sm:text-xl font-bold text-green-600">€{product.currentPrice}</div>
                          {product.originalPrice !== product.currentPrice && (
                            <div className="text-xs sm:text-sm text-slate-500 line-through">
                              €{product.originalPrice}
                            </div>
                          )}
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-sm font-medium text-slate-700 mb-1">Stock Disponible</h5>
                          <div className="text-lg sm:text-xl font-bold">{product.stock} unités</div>
                          {product.stock <= 15 && product.stock > 0 && (
                            <div className="text-xs sm:text-sm text-orange-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Réappro nécessaire
                            </div>
                          )}
                          {product.stock === 0 && (
                            <div className="text-xs sm:text-sm text-red-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Rupture de stock
                            </div>
                          )}
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-sm font-medium text-slate-700 mb-1">Dernière MAJ</h5>
                          <div className="text-xs sm:text-sm">{product.lastUpdate}</div>
                          <div className="text-xs text-slate-600">Sync automatique</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Alertes Stock Magasin</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Notifications automatiques pour les équipes magasin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-red-800 text-sm sm:text-base">Rupture de stock</h4>
                        <p className="text-xs sm:text-sm text-red-600">Tablette Ultra HD - Rayon A3 - Réappro urgent</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-orange-800 text-sm sm:text-base">Stock faible</h4>
                        <p className="text-xs sm:text-sm text-orange-600">
                          Smartphone Galaxy Pro - Rayon A1 - Moins de 15 unités
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-green-800 text-sm sm:text-base">Conformité prix</h4>
                        <p className="text-xs sm:text-sm text-green-600">
                          Casque Audio Premium - Rayon A2 - Prix vérifié et conforme
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Performance Globale</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Suivi en temps réel des principaux indicateurs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Conformité Prix</p>
                        <span className="text-sm text-slate-600">92%</span>
                      </div>
                      <Progress value={92} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Synchronisation ESL</p>
                        <span className="text-sm text-slate-600">88%</span>
                      </div>
                      <Progress value={88} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Rotation Stocks</p>
                        <span className="text-sm text-slate-600">75%</span>
                      </div>
                      <Progress value={75} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
    
    <DialogContent className="w-[95vw] max-w-xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-lg sm:text-xl">Créer un Nouveau Modèle</DialogTitle>
        <DialogDescription className="text-sm">Configurez un nouveau modèle d'étiquette personnalisé</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Nom du modèle</Label>
            <Input placeholder="Ex: Modèle Promo Spécial" className="text-sm" />
          </div>
          <div>
            <Label className="text-sm">Taille</Label>
            <Select>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='2.9"'>Petit (2.9")</SelectItem>
                <SelectItem value='4.2"'>Moyen (4.2")</SelectItem>
                <SelectItem value='7.5"'>Grand (7.5")</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm">Champs à afficher</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 p-3 border rounded">
            {[
              "Prix principal",
              "Prix promotionnel",
              "Prix barré",
              "% réduction",
              "Code-barres",
              "QR Code",
              "Nom produit",
              "Origine produit",
              "Nutri-Score",
              "Éco-Score",
              "Prix au kg/litre",
              "Date limite",
              "Lot/Série",
            ].map((field) => (
              <div key={field} className="flex items-center space-x-2">
                <Checkbox id={`new-field-${field}`} />
                <Label htmlFor={`new-field-${field}`} className="text-xs sm:text-sm">
                  {field}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm">Options d'affichage</Label>
          <div className="space-y-3 mt-2 p-3 border rounded">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm">Police en gras</Label>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm">Bordure</Label>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm">Logo magasin</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm">Couleur par rayon</Label>
              <Switch />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm">Aperçu</Label>
          <div className="mt-2 p-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
            <div className="text-center text-slate-500 text-sm">
              Aperçu du nouveau modèle
              <br />
              <span className="text-xs">Les paramètres seront appliqués ici</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <Button variant="outline" onClick={() => setShowNewTemplate(false)} className="text-sm">
          Annuler
        </Button>
        <Button onClick={() => setShowNewTemplate(false)} className="text-sm">
          Créer le Modèle
        </Button>
      </div>
    </DialogContent>
  </Dialog>
    </div>
 
  )
}
