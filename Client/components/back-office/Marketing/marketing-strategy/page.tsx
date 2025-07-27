"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BarChart3,
  Target,
  TrendingUp,
  Users,
  Zap,
  Plus,
  Upload,
  Calendar,
  Eye,
  Edit,
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

export default function MarketingStrategyPage() {
  const [activePromo, setActivePromo] = useState("flash-sale")
  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const [showStoreReports, setShowStoreReports] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [activeTab, setActiveTab] = useState("promotions")

  const navigationItems = [
    { value: "promotions", label: "Promotions & Offres", icon: Zap },
    { value: "planograms", label: "Planogrammes", icon: BarChart3 },
    { value: "campaigns", label: "Campagnes Ciblées", icon: Target },
    { value: "testing", label: "A/B Testing", icon: TrendingUp },
  ]

  const getCurrentNavLabel = () => {
    const current = navigationItems.find((item) => item.value === activeTab)
    return current ? current.label : "Navigation"
  }

  const promotions = [
    {
      id: "flash-sale",
      name: "Flash Sale Électronique",
      type: "Remise",
      discount: "30%",
      status: "active",
      performance: 85,
      revenue: "€12,450",
    },
    {
      id: "bundle-offer",
      name: "Bundle Maison & Jardin",
      type: "Bundle",
      discount: "2 pour 1",
      status: "active",
      performance: 72,
      revenue: "€8,920",
    },
    {
      id: "loyalty-promo",
      name: "Promo Clients Fidèles",
      type: "Ciblée",
      discount: "15%",
      status: "scheduled",
      performance: 0,
      revenue: "€0",
    },
  ]

  const abTests = [
    {
      name: "Packaging Produit A vs B",
      variant_a: { name: "Design Classique", conversion: 3.2 },
      variant_b: { name: "Design Moderne", conversion: 4.7 },
      winner: "B",
      confidence: 95,
    },
    {
      name: "Position Promo Tête de Gondole",
      variant_a: { name: "Position Haute", conversion: 2.8 },
      variant_b: { name: "Position Œil", conversion: 5.1 },
      winner: "B",
      confidence: 98,
    },
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">
              Marketing Strategy Display
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm lg:text-base">
              Gestion avancée des stratégies marketing et promotions
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
              <TabsTrigger value="promotions" className="text-xs sm:text-sm">
                Promotions & Offres
              </TabsTrigger>
              <TabsTrigger value="planograms" className="text-xs sm:text-sm">
                Planogrammes
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="text-xs sm:text-sm">
                Campagnes Ciblées
              </TabsTrigger>
              <TabsTrigger value="testing" className="text-xs sm:text-sm">
                A/B Testing
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="promotions" className="space-y-4 sm:space-y-6">
            {/* Header with responsive button */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Gestion des Promotions</h2>
              <Dialog open={showNewCampaign} onOpenChange={setShowNewCampaign}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 w-full sm:w-auto text-sm">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Nouvelle Campagne</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">Créer une Campagne Promotionnelle</DialogTitle>
                    <DialogDescription className="text-sm">
                      Configurez votre nouvelle campagne marketing avec tous les paramètres
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="campaign-name" className="text-sm">
                          Nom de la campagne
                        </Label>
                        <Input id="campaign-name" placeholder="Ex: Flash Sale Électronique" className="text-sm" />
                      </div>
                      <div>
                        <Label htmlFor="campaign-type" className="text-sm">
                          Type de promotion
                        </Label>
                        <Select>
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Sélectionner le type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="discount">Remise %</SelectItem>
                            <SelectItem value="bundle">Bundle</SelectItem>
                            <SelectItem value="bogo">2 pour 1</SelectItem>
                            <SelectItem value="fixed">Prix fixe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-date" className="text-sm">
                          Date de début
                        </Label>
                        <Input id="start-date" type="date" className="text-sm" />
                      </div>
                      <div>
                        <Label htmlFor="end-date" className="text-sm">
                          Date de fin
                        </Label>
                        <Input id="end-date" type="date" className="text-sm" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="target-stores" className="text-sm">
                        Magasins ciblés
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                        {["Paris Centre", "Lyon Part-Dieu", "Marseille", "Toulouse", "Nice", "Bordeaux"].map(
                          (store) => (
                            <div key={store} className="flex items-center space-x-2">
                              <Checkbox id={store} />
                              <Label htmlFor={store} className="text-xs sm:text-sm">
                                {store}
                              </Label>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="objectives" className="text-sm">
                        Objectifs KPI
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                        <div>
                          <Label className="text-xs">Ventes attendues (€)</Label>
                          <Input placeholder="50000" className="text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs">Trafic (+%)</Label>
                          <Input placeholder="25" className="text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs">Conversion (%)</Label>
                          <Input placeholder="4.5" className="text-sm" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="visuals" className="text-sm">
                        Visuels & PLV
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-xs sm:text-sm text-gray-600">
                          Glissez vos fichiers ici ou cliquez pour sélectionner
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF jusqu'à 10MB</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewCampaign(false)} className="text-sm">
                      Annuler
                    </Button>
                    <Button onClick={() => setShowNewCampaign(false)} className="text-sm">
                      Créer la Campagne
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Promotions Actives</CardTitle>
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 depuis hier</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Revenus Promo</CardTitle>
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">€45,280</div>
                  <p className="text-xs text-muted-foreground">+18% vs semaine dernière</p>
                </CardContent>
              </Card>
              <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Taux Conversion</CardTitle>
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">4.2%</div>
                  <p className="text-xs text-muted-foreground">+0.8% vs moyenne</p>
                </CardContent>
              </Card>
            </div>

            {/* Campaigns List */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Campagnes Actives</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Gestion et suivi des campagnes en cours
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowStoreReports(true)}
                    className="text-sm w-full sm:w-auto"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Retours Magasins
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {promotions.map((promo) => (
                    <div
                      key={promo.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{promo.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant={promo.status === "active" ? "default" : "secondary"} className="text-xs">
                              {promo.status === "active" ? "Actif" : "Programmé"}
                            </Badge>
                            <span className="text-xs sm:text-sm text-slate-600">
                              {promo.type} - {promo.discount}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="text-left sm:text-right">
                          <div className="font-semibold text-green-600 text-sm sm:text-base">{promo.revenue}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={promo.performance} className="w-16 sm:w-20" />
                            <span className="text-xs sm:text-sm text-slate-600">{promo.performance}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent">
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planograms" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Planogramme Digital - Rayon Électronique</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Optimisation des placements produits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-1 sm:gap-2 mb-4">
                    {Array.from({ length: 16 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-8 sm:h-12 rounded border-2 flex items-center justify-center text-xs font-medium ${
                          i < 4
                            ? "bg-red-100 border-red-300 text-red-700"
                            : i < 8
                              ? "bg-yellow-100 border-yellow-300 text-yellow-700"
                              : i < 12
                                ? "bg-green-100 border-green-300 text-green-700"
                                : "bg-blue-100 border-blue-300 text-blue-700"
                        }`}
                      >
                        P{i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-200 rounded"></div>
                      <span>Niveau Œil</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-200 rounded"></div>
                      <span>Cross-selling</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Performance par Zone</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Analyse des ventes par emplacement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { name: "Tête de Gondole", value: 92 },
                      { name: "Niveau Œil", value: 78 },
                      { name: "Niveau Bas", value: 45 },
                      { name: "Niveau Haut", value: 32 },
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm min-w-0 flex-1 truncate">{item.name}</span>
                        <div className="flex items-center gap-2 ml-2">
                          <Progress value={item.value} className="w-16 sm:w-20" />
                          <span className="text-xs sm:text-sm font-medium w-8 text-right">{item.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    Segmentation Clients
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Campagnes personnalisées par profil client
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                        <h4 className="font-medium text-sm sm:text-base">Clients Fidèles Premium</h4>
                        <Badge className="text-xs w-fit">2,340 clients</Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 mb-2">Offres exclusives et avant-premières</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">
                          Remise 20%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Livraison gratuite
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                        <h4 className="font-medium text-sm sm:text-base">Nouveaux Clients</h4>
                        <Badge className="text-xs w-fit">890 clients</Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 mb-2">Offres de bienvenue et découverte</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">
                          Code WELCOME15
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Guide produits
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Intégration Multicanale</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Cohérence magasin physique et digital
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { name: "Synchronisation Prix", desc: "Magasin ↔ E-commerce", color: "green" },
                      { name: "Promotions Unifiées", desc: "Même offre tous canaux", color: "blue" },
                      { name: "Stock Temps Réel", desc: "Disponibilité synchronisée", color: "purple" },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 bg-${item.color}-50 rounded-lg`}
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className={`font-medium text-${item.color}-800 text-sm sm:text-base`}>{item.name}</h4>
                          <p className={`text-xs sm:text-sm text-${item.color}-600`}>{item.desc}</p>
                        </div>
                        <div className={`w-3 h-3 bg-${item.color}-500 rounded-full flex-shrink-0 ml-2`}></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="testing" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Tests A/B en Cours
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Optimisation continue des displays et promotions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 sm:space-y-6">
                  {abTests.map((test, index) => (
                    <div key={index} className="border rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
                        <h3 className="font-semibold text-sm sm:text-base">{test.name}</h3>
                        <Badge variant={test.winner ? "default" : "secondary"} className="text-xs w-fit">
                          {test.winner ? `Gagnant: Variante ${test.winner}` : "En cours"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium mb-2 text-sm sm:text-base">Variante A</h4>
                          <p className="text-xs sm:text-sm text-slate-600 mb-2">{test.variant_a.name}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={test.variant_a.conversion * 20} className="flex-1" />
                            <span className="text-xs sm:text-sm font-medium">{test.variant_a.conversion}%</span>
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium mb-2 text-sm sm:text-base">Variante B</h4>
                          <p className="text-xs sm:text-sm text-slate-600 mb-2">{test.variant_b.name}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={test.variant_b.conversion * 20} className="flex-1" />
                            <span className="text-xs sm:text-sm font-medium">{test.variant_b.conversion}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs sm:text-sm text-slate-600">
                        Confiance statistique: {test.confidence}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Store Reports Dialog */}
        <Dialog open={showStoreReports} onOpenChange={setShowStoreReports}>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Retours Magasins - Mise en Place</DialogTitle>
              <DialogDescription className="text-sm">Photos et commentaires des équipes terrain</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:gap-4 py-4">
              {[
                {
                  store: "Paris Centre",
                  status: "Validé",
                  photo: true,
                  comment: "Mise en place parfaite, très visible",
                },
                {
                  store: "Lyon Part-Dieu",
                  status: "En attente",
                  photo: true,
                  comment: "PLV installée, manque étiquettes promo",
                },
                {
                  store: "Marseille",
                  status: "Problème",
                  photo: false,
                  comment: "Emplacement occupé, besoin réorganisation",
                },
              ].map((report, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                      {report.photo ? "📷" : "❌"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm sm:text-base">{report.store}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 break-words">{report.comment}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      report.status === "Validé"
                        ? "default"
                        : report.status === "En attente"
                          ? "secondary"
                          : "destructive"
                    }
                    className="text-xs w-fit"
                  >
                    {report.status}
                  </Badge>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
