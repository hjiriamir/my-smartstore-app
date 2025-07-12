"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, BarChart3, Target, TrendingUp, Users, Zap, Plus, Upload, Calendar, Eye, Edit } from "lucide-react"
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

export default function MarketingStrategyPage() {
  const [activePromo, setActivePromo] = useState("flash-sale")
  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const [showStoreReports, setShowStoreReports] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)

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
    <div className="min-h-screen bg-slate-50 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/marketing">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Marketing Strategy Display</h1>
            <p className="text-slate-600">Gestion avancée des stratégies marketing et promotions</p>
          </div>
        </div>

        <Tabs defaultValue="promotions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="promotions">Promotions & Offres</TabsTrigger>
            <TabsTrigger value="planograms">Planogrammes</TabsTrigger>
            <TabsTrigger value="campaigns">Campagnes Ciblées</TabsTrigger>
            <TabsTrigger value="testing">A/B Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="promotions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestion des Promotions</h2>
              <Dialog open={showNewCampaign} onOpenChange={setShowNewCampaign}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nouvelle Campagne
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Créer une Campagne Promotionnelle</DialogTitle>
                    <DialogDescription>
                      Configurez votre nouvelle campagne marketing avec tous les paramètres
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="campaign-name">Nom de la campagne</Label>
                        <Input id="campaign-name" placeholder="Ex: Flash Sale Électronique" />
                      </div>
                      <div>
                        <Label htmlFor="campaign-type">Type de promotion</Label>
                        <Select>
                          <SelectTrigger>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-date">Date de début</Label>
                        <Input id="start-date" type="date" />
                      </div>
                      <div>
                        <Label htmlFor="end-date">Date de fin</Label>
                        <Input id="end-date" type="date" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="target-stores">Magasins ciblés</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {["Paris Centre", "Lyon Part-Dieu", "Marseille", "Toulouse", "Nice", "Bordeaux"].map(
                          (store) => (
                            <div key={store} className="flex items-center space-x-2">
                              <Checkbox id={store} />
                              <Label htmlFor={store} className="text-sm">
                                {store}
                              </Label>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="objectives">Objectifs KPI</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div>
                          <Label className="text-xs">Ventes attendues (€)</Label>
                          <Input placeholder="50000" />
                        </div>
                        <div>
                          <Label className="text-xs">Trafic (+%)</Label>
                          <Input placeholder="25" />
                        </div>
                        <div>
                          <Label className="text-xs">Conversion (%)</Label>
                          <Input placeholder="4.5" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="visuals">Visuels & PLV</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Glissez vos fichiers ici ou cliquez pour sélectionner</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF jusqu'à 10MB</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewCampaign(false)}>
                      Annuler
                    </Button>
                    <Button onClick={() => setShowNewCampaign(false)}>Créer la Campagne</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Promotions Actives</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 depuis hier</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenus Promo</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€45,280</div>
                  <p className="text-xs text-muted-foreground">+18% vs semaine dernière</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taux Conversion</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.2%</div>
                  <p className="text-xs text-muted-foreground">+0.8% vs moyenne</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Campagnes Actives</CardTitle>
                    <CardDescription>Gestion et suivi des campagnes en cours</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setShowStoreReports(true)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Retours Magasins
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {promotions.map((promo) => (
                    <div key={promo.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold">{promo.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={promo.status === "active" ? "default" : "secondary"}>
                              {promo.status === "active" ? "Actif" : "Programmé"}
                            </Badge>
                            <span className="text-sm text-slate-600">
                              {promo.type} - {promo.discount}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <div className="font-semibold text-green-600">{promo.revenue}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={promo.performance} className="w-20" />
                            <span className="text-sm text-slate-600">{promo.performance}%</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planograms" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Planogramme Digital - Rayon Électronique</CardTitle>
                  <CardDescription>Optimisation des placements produits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {Array.from({ length: 16 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-12 rounded border-2 flex items-center justify-center text-xs font-medium ${
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
                  <div className="flex justify-between text-sm">
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
                  <CardTitle>Performance par Zone</CardTitle>
                  <CardDescription>Analyse des ventes par emplacement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tête de Gondole</span>
                      <div className="flex items-center gap-2">
                        <Progress value={92} className="w-20" />
                        <span className="text-sm font-medium">92%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Niveau Œil</span>
                      <div className="flex items-center gap-2">
                        <Progress value={78} className="w-20" />
                        <span className="text-sm font-medium">78%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Niveau Bas</span>
                      <div className="flex items-center gap-2">
                        <Progress value={45} className="w-20" />
                        <span className="text-sm font-medium">45%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Niveau Haut</span>
                      <div className="flex items-center gap-2">
                        <Progress value={32} className="w-20" />
                        <span className="text-sm font-medium">32%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Segmentation Clients
                  </CardTitle>
                  <CardDescription>Campagnes personnalisées par profil client</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Clients Fidèles Premium</h4>
                        <Badge>2,340 clients</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">Offres exclusives et avant-premières</p>
                      <div className="flex gap-2">
                        <Badge variant="outline">Remise 20%</Badge>
                        <Badge variant="outline">Livraison gratuite</Badge>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Nouveaux Clients</h4>
                        <Badge>890 clients</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">Offres de bienvenue et découverte</p>
                      <div className="flex gap-2">
                        <Badge variant="outline">Code WELCOME15</Badge>
                        <Badge variant="outline">Guide produits</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Intégration Multicanale</CardTitle>
                  <CardDescription>Cohérence magasin physique et digital</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-green-800">Synchronisation Prix</h4>
                        <p className="text-sm text-green-600">Magasin ↔ E-commerce</p>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-blue-800">Promotions Unifiées</h4>
                        <p className="text-sm text-blue-600">Même offre tous canaux</p>
                      </div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-purple-800">Stock Temps Réel</h4>
                        <p className="text-sm text-purple-600">Disponibilité synchronisée</p>
                      </div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Tests A/B en Cours
                </CardTitle>
                <CardDescription>Optimisation continue des displays et promotions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {abTests.map((test, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">{test.name}</h3>
                        <Badge variant={test.winner ? "default" : "secondary"}>
                          {test.winner ? `Gagnant: Variante ${test.winner}` : "En cours"}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium mb-2">Variante A</h4>
                          <p className="text-sm text-slate-600 mb-2">{test.variant_a.name}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={test.variant_a.conversion * 20} className="flex-1" />
                            <span className="text-sm font-medium">{test.variant_a.conversion}%</span>
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium mb-2">Variante B</h4>
                          <p className="text-sm text-slate-600 mb-2">{test.variant_b.name}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={test.variant_b.conversion * 20} className="flex-1" />
                            <span className="text-sm font-medium">{test.variant_b.conversion}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-slate-600">Confiance statistique: {test.confidence}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <Dialog open={showStoreReports} onOpenChange={setShowStoreReports}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Retours Magasins - Mise en Place</DialogTitle>
              <DialogDescription>Photos et commentaires des équipes terrain</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {report.photo ? "📷" : "❌"}
                    </div>
                    <div>
                      <h4 className="font-medium">{report.store}</h4>
                      <p className="text-sm text-slate-600">{report.comment}</p>
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
