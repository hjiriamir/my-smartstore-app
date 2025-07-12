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

  const priceRules = [
    {
      name: "Réduction Stock Élevé",
      condition: "Stock > 50 unités",
      action: "Réduction 15%",
      active: true,
      triggered: 12,
    },
    {
      name: "Prix Dynamique Demande",
      condition: "Forte demande + Stock faible",
      action: "Augmentation 5-10%",
      active: true,
      triggered: 8,
    },
    {
      name: "Promo Fin de Journée",
      condition: "Après 18h + Produits frais",
      action: "Réduction 20%",
      active: false,
      triggered: 0,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/marketing">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Shelf Labels Pricing</h1>
            <p className="text-slate-600">Étiquetage dynamique et gestion intelligente des prix</p>
          </div>
        </div>

        <Tabs defaultValue="dynamic-pricing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dynamic-pricing">Prix Dynamiques</TabsTrigger>
            <TabsTrigger value="esl-management">Labels Électroniques</TabsTrigger>
            <TabsTrigger value="stock-integration">Intégration Stocks</TabsTrigger>
            <TabsTrigger value="compliance">Conformité Légale</TabsTrigger>
          </TabsList>

          <TabsContent value="dynamic-pricing" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestion des Prix Dynamiques</h2>
              <div className="flex gap-2">
                <Dialog open={showBulkEdit} onOpenChange={setShowBulkEdit}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Édition en Masse
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Gestion des Prix en Masse</DialogTitle>
                      <DialogDescription>Modifiez les prix de plusieurs produits simultanément</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label>Sélectionner les produits</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                          {products.map((product) => (
                            <div key={product.id} className="flex items-center space-x-2 p-2 border rounded">
                              <Checkbox id={product.id} />
                              <Label htmlFor={product.id} className="text-sm">
                                {product.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bulk-action">Action</Label>
                          <Select>
                            <SelectTrigger>
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
                          <Label htmlFor="bulk-value">Valeur (%)</Label>
                          <Input id="bulk-value" placeholder="Ex: 10" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowBulkEdit(false)}>
                        Annuler
                      </Button>
                      <Button onClick={() => setShowBulkEdit(false)}>Appliquer</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={showNewPromo} onOpenChange={setShowNewPromo}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nouvelle Promotion Prix
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Créer une Promotion Prix</DialogTitle>
                      <DialogDescription>
                        Programmez une promotion avec génération automatique d'étiquettes
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="promo-name">Nom de la promotion</Label>
                          <Input id="promo-name" placeholder="Ex: -20% du 1er au 10 août" />
                        </div>
                        <div>
                          <Label htmlFor="promo-type">Type de réduction</Label>
                          <Select>
                            <SelectTrigger>
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
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="promo-value">Valeur</Label>
                          <Input id="promo-value" placeholder="20" />
                        </div>
                        <div>
                          <Label htmlFor="promo-start">Date début</Label>
                          <Input id="promo-start" type="date" />
                        </div>
                        <div>
                          <Label htmlFor="promo-end">Date fin</Label>
                          <Input id="promo-end" type="date" />
                        </div>
                      </div>
                      <div>
                        <Label>Produits concernés</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                          {products.slice(0, 6).map((product) => (
                            <div key={product.id} className="flex items-center space-x-2 p-2 border rounded">
                              <Checkbox id={`promo-${product.id}`} />
                              <Label htmlFor={`promo-${product.id}`} className="text-sm">
                                {product.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Génération automatique</h4>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="auto-labels" defaultChecked />
                          <Label htmlFor="auto-labels" className="text-sm">
                            Générer les étiquettes automatiquement
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox id="auto-esl" defaultChecked />
                          <Label htmlFor="auto-esl" className="text-sm">
                            Envoyer aux ESL automatiquement
                          </Label>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNewPromo(false)}>
                        Annuler
                      </Button>
                      <Button onClick={() => setShowNewPromo(false)}>Créer la Promotion</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Prix Mis à Jour</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">247</div>
                  <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Économies Générées</CardTitle>
                  <TrendingDown className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">€3,240</div>
                  <p className="text-xs text-muted-foreground">Cette semaine</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenus Additionnels</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">€1,890</div>
                  <p className="text-xs text-muted-foreground">Prix optimisés</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taux Rotation</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+18%</div>
                  <p className="text-xs text-muted-foreground">Vs mois dernier</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestion des Étiquettes Produits</CardTitle>
                    <CardDescription>Création, modification et envoi des étiquettes</CardDescription>
                  </div>
                  <Dialog open={showNewLabel} onOpenChange={setShowNewLabel}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Tag className="w-4 h-4 mr-2" />
                        Nouvelle Étiquette
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Créer une Nouvelle Étiquette</DialogTitle>
                        <DialogDescription>Configurez le format et les données de l'étiquette</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="label-format">Format</Label>
                            <Select>
                              <SelectTrigger>
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
                            <Label htmlFor="label-size">Taille</Label>
                            <Select>
                              <SelectTrigger>
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
                          <Label>Données à afficher</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
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
                                <Label htmlFor={data} className="text-sm">
                                  {data}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="label-location">Emplacement produit</Label>
                          <Input id="label-location" placeholder="Ex: Rayon A1 - Étagère 2" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowNewLabel(false)}>
                          Annuler
                        </Button>
                        <Button onClick={() => setShowNewLabel(false)}>Créer l'Étiquette</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                product.status === "in_stock"
                                  ? "default"
                                  : product.status === "low_stock"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {product.status === "in_stock"
                                ? "En stock"
                                : product.status === "low_stock"
                                  ? "Stock faible"
                                  : "Rupture"}
                            </Badge>
                            <span className="text-sm text-slate-600">ID: {product.id}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <div className="font-semibold text-green-600">€{product.currentPrice}</div>
                          <div className="text-sm text-slate-600">{product.lastUpdate}</div>
                        </div>
                        <Button variant="outline" size="sm" title="Imprimer étiquette">
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" title="Envoyer à ESL">
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" title="Vérifier conformité">
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="esl-management" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ESL Connectés</CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">142/150</div>
                  <p className="text-xs text-muted-foreground">94.7% opérationnels</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Batterie Moyenne</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-xs text-muted-foreground">8 ESL à remplacer</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mises à Jour</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>État des Labels Électroniques (ESL)</CardTitle>
                <CardDescription>Monitoring en temps réel des étiquettes connectées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {eslDevices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            device.status === "online"
                              ? "bg-green-500"
                              : device.status === "offline"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                          }`}
                        ></div>
                        <div>
                          <h4 className="font-medium">{device.id}</h4>
                          <p className="text-sm text-slate-600">{device.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Progress value={device.battery} className="w-16" />
                            <span className="text-sm font-medium">{device.battery}%</span>
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

          <TabsContent value="stock-integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Intégration Stocks & Prix</CardTitle>
                <CardDescription>Synchronisation automatique entre niveaux de stock et affichage prix</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-slate-600">ID: {product.id}</p>
                        </div>
                        <Badge
                          variant={
                            product.status === "in_stock"
                              ? "default"
                              : product.status === "low_stock"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {product.status === "in_stock"
                            ? "En stock"
                            : product.status === "low_stock"
                              ? "Stock faible"
                              : "Rupture"}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-1">Prix Actuel</h5>
                          <div className="text-xl font-bold text-green-600">€{product.currentPrice}</div>
                          {product.originalPrice !== product.currentPrice && (
                            <div className="text-sm text-slate-500 line-through">€{product.originalPrice}</div>
                          )}
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-1">Stock Disponible</h5>
                          <div className="text-xl font-bold">{product.stock} unités</div>
                          {product.stock <= 15 && product.stock > 0 && (
                            <div className="text-sm text-orange-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Stock faible
                            </div>
                          )}
                          {product.stock === 0 && (
                            <div className="text-sm text-red-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Rupture de stock
                            </div>
                          )}
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-1">Dernière MAJ</h5>
                          <div className="text-sm">{product.lastUpdate}</div>
                          <div className="text-xs text-slate-600">Synchronisation auto</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alertes Stock</CardTitle>
                  <CardDescription>Notifications automatiques de réapprovisionnement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div>
                        <h4 className="font-medium text-red-800">Rupture de stock</h4>
                        <p className="text-sm text-red-600">Tablette Ultra HD - Réappro urgent</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <div>
                        <h4 className="font-medium text-orange-800">Stock faible</h4>
                        <p className="text-sm text-orange-600">Smartphone Galaxy Pro - 12 unités restantes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-green-800">Réappro programmé</h4>
                        <p className="text-sm text-green-600">Casque Audio Premium - Livraison demain</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prévisions de Stock</CardTitle>
                  <CardDescription>Analyse prédictive des besoins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Smartphone Galaxy Pro</h4>
                        <Badge variant="outline">7 jours restants</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={30} className="flex-1" />
                        <span className="text-sm">30%</span>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Montre Connectée Sport</h4>
                        <Badge variant="outline">14 jours restants</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={65} className="flex-1" />
                        <span className="text-sm">65%</span>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Casque Audio Premium</h4>
                        <Badge variant="outline">21 jours restants</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={85} className="flex-1" />
                        <span className="text-sm">85%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Vérification de Conformité</h2>
              <Button>
                <Camera className="w-4 h-4 mr-2" />
                Nouveau Contrôle Terrain
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conformité</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <p className="text-xs text-muted-foreground">Étiquettes conformes</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Erreurs Détectées</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">3</div>
                  <p className="text-xs text-muted-foreground">À corriger aujourd'hui</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Audits Passés</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12/12</div>
                  <p className="text-xs text-muted-foreground">Cette année</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Contrôles Terrain en Temps Réel</CardTitle>
                <CardDescription>Photos et vérifications des équipes magasin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {check.photo ? "📷" : "⏳"}
                        </div>
                        <div>
                          <h4 className="font-medium">{check.product}</h4>
                          <p className="text-sm text-slate-600">{check.store}</p>
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
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            check.status === "Conforme"
                              ? "default"
                              : check.status === "Non conforme"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {check.status}
                        </Badge>
                        {check.status === "Non conforme" && (
                          <Button size="sm" variant="outline">
                            Corriger
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vérifications Légales</CardTitle>
                  <CardDescription>Contrôles automatiques de conformité</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-green-800">Affichage TVA</h4>
                          <p className="text-sm text-green-600">Toutes les étiquettes conformes</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">✓ Conforme</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-green-800">Prix au kg/litre</h4>
                          <p className="text-sm text-green-600">Calculs automatiques validés</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">✓ Conforme</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <div>
                          <h4 className="font-medium text-orange-800">Promotions</h4>
                          <p className="text-sm text-orange-600">3 étiquettes à mettre à jour</p>
                        </div>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">⚠ À corriger</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-green-800">Origine produits</h4>
                          <p className="text-sm text-green-600">Traçabilité complète</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">✓ Conforme</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Historique des Audits</CardTitle>
                  <CardDescription>Suivi des contrôles de conformité</CardDescription>
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
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{audit.type}</h4>
                          <p className="text-sm text-slate-600">{audit.date}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 mb-1">{audit.result}</Badge>
                          <div className="text-sm font-medium">{audit.score}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Réglementations Appliquées</CardTitle>
                <CardDescription>Conformité aux normes françaises et européennes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Réglementations Françaises</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Code de la consommation (Art. L112-1)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Arrêté du 3 décembre 1987</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Décret n°2009-1139</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium">Normes Européennes</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Directive 2011/83/UE</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Règlement (UE) n°1169/2011</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
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
