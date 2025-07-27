"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Tag,
  Zap,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  Plus,
  Edit,
  Printer,
  Send,
  Camera,
  ChevronDown,
  Menu,
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

export default function ShelfLabelsPage() {
  const [dynamicPricing, setDynamicPricing] = useState(true)
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [showNewPromo, setShowNewPromo] = useState(false)
  const [showNewLabel, setShowNewLabel] = useState(false)
  const [showBulkEdit, setShowBulkEdit] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [activeTab, setActiveTab] = useState("dynamic-pricing")

  const navigationItems = [
    { value: "dynamic-pricing", label: "Prix Dynamiques", icon: Zap },
    { value: "esl-management", label: "Labels Électroniques", icon: Tag },
    { value: "stock-integration", label: "Intégration Stocks", icon: Package },
    { value: "compliance", label: "Conformité Légale", icon: CheckCircle },
  ]

  const getCurrentNavLabel = () => {
    const current = navigationItems.find((item) => item.value === activeTab)
    return current ? current.label : "Navigation"
  }

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
    },
  ]

  const eslDevices = [
    { id: "ESL001", location: "Rayon A1", status: "online", battery: 85, lastSync: "Il y a 5min" },
    { id: "ESL002", location: "Rayon A2", status: "online", battery: 92, lastSync: "Il y a 3min" },
    { id: "ESL003", location: "Rayon B1", status: "offline", battery: 15, lastSync: "Il y a 2h" },
    { id: "ESL004", location: "Rayon B2", status: "online", battery: 78, lastSync: "Il y a 1min" },
    { id: "ESL005", location: "Rayon C1", status: "updating", battery: 88, lastSync: "En cours" },
  ]

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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">Shelf Labels Pricing</h1>
            <p className="text-slate-600 text-xs sm:text-sm lg:text-base">
              Étiquetage dynamique et gestion intelligente des prix
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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 min-w-[600px] sm:min-w-0">
              <TabsTrigger value="dynamic-pricing" className="text-xs sm:text-sm">
                Prix Dynamiques
              </TabsTrigger>
              <TabsTrigger value="esl-management" className="text-xs sm:text-sm">
                Labels Électroniques
              </TabsTrigger>
              <TabsTrigger value="stock-integration" className="text-xs sm:text-sm">
                Intégration Stocks
              </TabsTrigger>
              <TabsTrigger value="compliance" className="text-xs sm:text-sm">
                Conformité Légale
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dynamic-pricing" className="space-y-4 sm:space-y-6">
            {/* Header with responsive buttons */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Gestion des Prix Dynamiques</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <Dialog open={showBulkEdit} onOpenChange={setShowBulkEdit}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-sm w-full sm:w-auto bg-transparent">
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Édition en Masse
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl">Gestion des Prix en Masse</DialogTitle>
                      <DialogDescription className="text-sm">
                        Modifiez les prix de plusieurs produits simultanément
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label className="text-sm">Sélectionner les produits</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                          {products.map((product) => (
                            <div key={product.id} className="flex items-center space-x-2 p-2 border rounded">
                              <Checkbox id={product.id} />
                              <Label htmlFor={product.id} className="text-xs sm:text-sm truncate">
                                {product.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bulk-action" className="text-sm">
                            Action
                          </Label>
                          <Select>
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Choisir l'action" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="increase">Augmenter prix</SelectItem>
                              <SelectItem value="decrease">Diminuer prix</SelectItem>
                              <SelectItem value="set">Définir prix fixe</SelectItem>
                              <SelectItem value="promo">Appliquer promo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="bulk-value" className="text-sm">
                            Valeur (%)
                          </Label>
                          <Input id="bulk-value" placeholder="Ex: 10" className="text-sm" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowBulkEdit(false)} className="text-sm">
                        Annuler
                      </Button>
                      <Button onClick={() => setShowBulkEdit(false)} className="text-sm">
                        Appliquer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={showNewPromo} onOpenChange={setShowNewPromo}>
                  <DialogTrigger asChild>
                    <Button className="text-sm w-full sm:w-auto">
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Nouvelle Promotion Prix
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl">Créer une Promotion Prix</DialogTitle>
                      <DialogDescription className="text-sm">
                        Programmez une promotion avec génération automatique d'étiquettes
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="promo-name" className="text-sm">
                            Nom de la promotion
                          </Label>
                          <Input id="promo-name" placeholder="Ex: -20% du 1er au 10 août" className="text-sm" />
                        </div>
                        <div>
                          <Label htmlFor="promo-type" className="text-sm">
                            Type de réduction
                          </Label>
                          <Select>
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Pourcentage</SelectItem>
                              <SelectItem value="fixed">Montant fixe</SelectItem>
                              <SelectItem value="price">Prix spécial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="promo-value" className="text-sm">
                            Valeur
                          </Label>
                          <Input id="promo-value" placeholder="20" className="text-sm" />
                        </div>
                        <div>
                          <Label htmlFor="promo-start" className="text-sm">
                            Date début
                          </Label>
                          <Input id="promo-start" type="date" className="text-sm" />
                        </div>
                        <div>
                          <Label htmlFor="promo-end" className="text-sm">
                            Date fin
                          </Label>
                          <Input id="promo-end" type="date" className="text-sm" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Produits concernés</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                          {products.slice(0, 6).map((product) => (
                            <div key={product.id} className="flex items-center space-x-2 p-2 border rounded">
                              <Checkbox id={`promo-${product.id}`} />
                              <Label htmlFor={`promo-${product.id}`} className="text-xs sm:text-sm truncate">
                                {product.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">Génération automatique</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="auto-labels" defaultChecked />
                            <Label htmlFor="auto-labels" className="text-xs sm:text-sm">
                              Générer les étiquettes automatiquement
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="auto-esl" defaultChecked />
                            <Label htmlFor="auto-esl" className="text-xs sm:text-sm">
                              Envoyer aux ESL automatiquement
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNewPromo(false)} className="text-sm">
                        Annuler
                      </Button>
                      <Button onClick={() => setShowNewPromo(false)} className="text-sm">
                        Créer la Promotion
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Prix Mis à Jour</CardTitle>
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">247</div>
                  <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Économies Générées</CardTitle>
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-green-600">€3,240</div>
                  <p className="text-xs text-muted-foreground">Cette semaine</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Revenus Additionnels</CardTitle>
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">€1,890</div>
                  <p className="text-xs text-muted-foreground">Prix optimisés</p>
                </CardContent>
              </Card>
              <Card className="col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Taux Rotation</CardTitle>
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">+18%</div>
                  <p className="text-xs text-muted-foreground">Vs mois dernier</p>
                </CardContent>
              </Card>
            </div>

            {/* Products Management */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Gestion des Étiquettes Produits</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Création, modification et envoi des étiquettes
                    </CardDescription>
                  </div>
                  <Dialog open={showNewLabel} onOpenChange={setShowNewLabel}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="text-sm w-full sm:w-auto bg-transparent">
                        <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Nouvelle Étiquette
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl">Créer une Nouvelle Étiquette</DialogTitle>
                        <DialogDescription className="text-sm">
                          Configurez le format et les données de l'étiquette
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="label-format" className="text-sm">
                              Format
                            </Label>
                            <Select>
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="esl">ESL Électronique</SelectItem>
                                <SelectItem value="paper">Papier Standard</SelectItem>
                                <SelectItem value="promo">Papier Promo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="label-size" className="text-sm">
                              Taille
                            </Label>
                            <Select>
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="small">Petit (2.9")</SelectItem>
                                <SelectItem value="medium">Moyen (4.2")</SelectItem>
                                <SelectItem value="large">Grand (7.5")</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm">Données à afficher</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {[
                              "Prix principal",
                              "Prix promo",
                              "QR Code",
                              "Code-barres",
                              "Origine",
                              "Score écologique",
                            ].map((data) => (
                              <div key={data} className="flex items-center space-x-2">
                                <Checkbox id={data} defaultChecked={["Prix principal", "Prix promo"].includes(data)} />
                                <Label htmlFor={data} className="text-xs sm:text-sm">
                                  {data}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="label-location" className="text-sm">
                            Emplacement produit
                          </Label>
                          <Input id="label-location" placeholder="Ex: Rayon A1 - Étagère 2" className="text-sm" />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowNewLabel(false)} className="text-sm">
                          Annuler
                        </Button>
                        <Button onClick={() => setShowNewLabel(false)} className="text-sm">
                          Créer l'Étiquette
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {products.map((product) => (
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
                            <span className="text-xs sm:text-sm text-slate-600">ID: {product.id}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="text-left sm:text-right">
                          <div className="font-semibold text-green-600 text-sm sm:text-base">
                            €{product.currentPrice}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-600">{product.lastUpdate}</div>
                        </div>
                        <div className="flex gap-1 sm:gap-2">
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
                            title="Envoyer à ESL"
                            className="h-8 w-8 p-0 bg-transparent"
                          >
                            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Vérifier conformité"
                            className="h-8 w-8 p-0 bg-transparent"
                          >
                            <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="esl-management" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">ESL Connectés</CardTitle>
                  <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">142/150</div>
                  <p className="text-xs text-muted-foreground">94.7% opérationnels</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Batterie Moyenne</CardTitle>
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">78%</div>
                  <p className="text-xs text-muted-foreground">8 ESL à remplacer</p>
                </CardContent>
              </Card>
              <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Mises à Jour</CardTitle>
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">État des Labels Électroniques (ESL)</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Monitoring en temps réel des étiquettes connectées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {eslDevices.map((device) => (
                    <div
                      key={device.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div
                          className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            device.status === "online"
                              ? "bg-green-500"
                              : device.status === "offline"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                          }`}
                        ></div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm sm:text-base">{device.id}</h4>
                          <p className="text-xs sm:text-sm text-slate-600">{device.location}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="text-left sm:text-right">
                          <div className="flex items-center gap-2">
                            <Progress value={device.battery} className="w-12 sm:w-16" />
                            <span className="text-xs sm:text-sm font-medium">{device.battery}%</span>
                          </div>
                          <p className="text-xs text-slate-600">{device.lastSync}</p>
                        </div>
                        <Badge
                          variant={
                            device.status === "online"
                              ? "default"
                              : device.status === "offline"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-xs w-fit"
                        >
                          {device.status === "online"
                            ? "En ligne"
                            : device.status === "offline"
                              ? "Hors ligne"
                              : "Mise à jour"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock-integration" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Intégration Stocks & Prix</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Synchronisation automatique entre niveaux de stock et affichage prix
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="p-3 sm:p-4 border rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm sm:text-base truncate">{product.name}</h4>
                          <p className="text-xs sm:text-sm text-slate-600">ID: {product.id}</p>
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
                          <h5 className="text-xs sm:text-sm font-medium text-slate-700 mb-1">Prix Actuel</h5>
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
                              Stock faible
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
                          <div className="text-xs text-slate-600">Synchronisation auto</div>
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
                  <CardTitle className="text-lg sm:text-xl">Alertes Stock</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Notifications automatiques de réapprovisionnement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-red-800 text-sm sm:text-base">Rupture de stock</h4>
                        <p className="text-xs sm:text-sm text-red-600">Tablette Ultra HD - Réappro urgent</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-orange-800 text-sm sm:text-base">Stock faible</h4>
                        <p className="text-xs sm:text-sm text-orange-600">
                          Smartphone Galaxy Pro - 12 unités restantes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-green-800 text-sm sm:text-base">Réappro programmé</h4>
                        <p className="text-xs sm:text-sm text-green-600">Casque Audio Premium - Livraison demain</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Prévisions de Stock</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Analyse prédictive des besoins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { name: "Smartphone Galaxy Pro", days: "7 jours restants", progress: 30 },
                      { name: "Montre Connectée Sport", days: "14 jours restants", progress: 65 },
                      { name: "Casque Audio Premium", days: "21 jours restants", progress: 85 },
                    ].map((item, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                          <h4 className="font-medium text-sm sm:text-base truncate">{item.name}</h4>
                          <Badge variant="outline" className="text-xs w-fit">
                            {item.days}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={item.progress} className="flex-1" />
                          <span className="text-xs sm:text-sm">{item.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Vérification de Conformité</h2>
              <Button className="text-sm w-full sm:w-auto">
                <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Nouveau Contrôle Terrain
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Conformité</CardTitle>
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-green-600">98.5%</div>
                  <p className="text-xs text-muted-foreground">Étiquettes conformes</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Erreurs Détectées</CardTitle>
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-orange-600">3</div>
                  <p className="text-xs text-muted-foreground">À corriger aujourd'hui</p>
                </CardContent>
              </Card>
              <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Audits Passés</CardTitle>
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">12/12</div>
                  <p className="text-xs text-muted-foreground">Cette année</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Contrôles Terrain en Temps Réel</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Photos et vérifications des équipes magasin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    {
                      product: "Smartphone Galaxy Pro",
                      store: "Paris Centre",
                      status: "Conforme",
                      photo: true,
                      issues: [],
                    },
                    {
                      product: "Casque Audio Premium",
                      store: "Lyon Part-Dieu",
                      status: "Non conforme",
                      photo: true,
                      issues: ["Prix promo manquant"],
                    },
                    {
                      product: "Tablette Ultra HD",
                      store: "Marseille",
                      status: "En attente",
                      photo: false,
                      issues: ["Vérification en cours"],
                    },
                  ].map((check, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                          {check.photo ? "📷" : "⏳"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm sm:text-base truncate">{check.product}</h4>
                          <p className="text-xs sm:text-sm text-slate-600">{check.store}</p>
                          {check.issues.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {check.issues.map((issue, i) => (
                                <Badge key={i} variant="destructive" className="text-xs">
                                  {issue}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Badge
                          variant={
                            check.status === "Conforme"
                              ? "default"
                              : check.status === "Non conforme"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-xs w-fit"
                        >
                          {check.status}
                        </Badge>
                        {check.status === "Non conforme" && (
                          <Button size="sm" variant="outline" className="text-xs bg-transparent">
                            Corriger
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Vérifications Légales</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Contrôles automatiques de conformité</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      {
                        name: "Affichage TVA",
                        desc: "Toutes les étiquettes conformes",
                        status: "Conforme",
                        color: "green",
                      },
                      {
                        name: "Prix au kg/litre",
                        desc: "Calculs automatiques validés",
                        status: "Conforme",
                        color: "green",
                      },
                      {
                        name: "Promotions",
                        desc: "3 étiquettes à mettre à jour",
                        status: "À corriger",
                        color: "orange",
                      },
                      { name: "Origine produits", desc: "Traçabilité complète", status: "Conforme", color: "green" },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 bg-${item.color}-50 border border-${item.color}-200 rounded-lg`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {item.color === "green" ? (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className={`font-medium text-${item.color}-800 text-sm sm:text-base`}>{item.name}</h4>
                            <p className={`text-xs sm:text-sm text-${item.color}-600`}>{item.desc}</p>
                          </div>
                        </div>
                        <Badge className={`bg-${item.color}-100 text-${item.color}-800 text-xs`}>
                          {item.status === "Conforme" ? "✓ Conforme" : "⚠ À corriger"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Historique des Audits</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Suivi des contrôles de conformité</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { date: "15 Nov 2024", type: "Audit DGCCRF", result: "Conforme", score: "100%" },
                      { date: "22 Oct 2024", type: "Contrôle interne", result: "Conforme", score: "98%" },
                      { date: "08 Oct 2024", type: "Audit prix", result: "Conforme", score: "99%" },
                      { date: "25 Sep 2024", type: "Contrôle TVA", result: "Conforme", score: "100%" },
                      { date: "12 Sep 2024", type: "Audit étiquetage", result: "Conforme", score: "97%" },
                    ].map((audit, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm sm:text-base truncate">{audit.type}</h4>
                          <p className="text-xs sm:text-sm text-slate-600">{audit.date}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <Badge className="bg-green-100 text-green-800 mb-1 text-xs">{audit.result}</Badge>
                          <div className="text-xs sm:text-sm font-medium">{audit.score}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Réglementations Appliquées</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Conformité aux normes françaises et européennes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm sm:text-base">Réglementations Françaises</h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                        <span>Code de la consommation (Art. L112-1)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                        <span>Arrêté du 3 décembre 1987</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                        <span>Décret n°2009-1139</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm sm:text-base">Normes Européennes</h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                        <span>Directive 2011/83/UE</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                        <span>Règlement (UE) n°1169/2011</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                        <span>RGPD (Protection données)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
