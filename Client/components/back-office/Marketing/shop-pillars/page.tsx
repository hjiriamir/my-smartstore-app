"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Palette,
  Smartphone,
  Gamepad2,
  Activity,
  Eye,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Save,
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ShopPillarsPage() {
  const [selectedZone, setSelectedZone] = useState("electronics")
  const [showNewPillar, setShowNewPillar] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])

  const zones = [
    { id: "electronics", name: "Électronique", traffic: 85, revenue: "€25,400", color: "bg-blue-500" },
    { id: "fashion", name: "Mode", traffic: 72, revenue: "€18,900", color: "bg-pink-500" },
    { id: "home", name: "Maison", traffic: 68, revenue: "€22,100", color: "bg-green-500" },
    { id: "beauty", name: "Beauté", traffic: 91, revenue: "€15,600", color: "bg-purple-500" },
    { id: "sports", name: "Sport", traffic: 54, revenue: "€12,800", color: "bg-orange-500" },
  ]

  const heatmapData = [
    { zone: "Entrée", intensity: 95, visitors: 1240 },
    { zone: "Caisse", intensity: 88, visitors: 980 },
    { zone: "Promo", intensity: 82, visitors: 750 },
    { zone: "Nouveautés", intensity: 76, visitors: 620 },
    { zone: "Fond magasin", intensity: 34, visitors: 280 },
  ]

  const interactiveElements = [
    { name: "Bornes tactiles", usage: 78, satisfaction: 4.2 },
    { name: "QR Codes produits", usage: 65, satisfaction: 4.0 },
    { name: "Réalité augmentée", usage: 42, satisfaction: 4.5 },
    { name: "App mobile magasin", usage: 89, satisfaction: 4.3 },
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
            <h1 className="text-3xl font-bold text-slate-900">Shop Pillars</h1>
            <p className="text-slate-600">Piliers structurants de l'expérience magasin</p>
          </div>
        </div>

        <Tabs defaultValue="zoning" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="zoning">Zonage Intelligent</TabsTrigger>
            <TabsTrigger value="branding">Branding Visuel</TabsTrigger>
            <TabsTrigger value="interactive">Interactivité</TabsTrigger>
            <TabsTrigger value="gamification">Gamification</TabsTrigger>
            <TabsTrigger value="analytics">Analytics Physiques</TabsTrigger>
          </TabsList>

          <TabsContent value="zoning" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestion des Piliers & Univers</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditMode(!editMode)}>
                  <Edit className="w-4 h-4 mr-2" />
                  {editMode ? "Terminer" : "Modifier Planogramme"}
                </Button>
                <Dialog open={showNewPillar} onOpenChange={setShowNewPillar}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nouveau Pilier
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Créer un Nouveau Pilier/Univers</DialogTitle>
                      <DialogDescription>Définissez un nouvel univers produit pour votre magasin</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="pillar-name">Nom du pilier</Label>
                        <Input id="pillar-name" placeholder="Ex: Produits Locaux, Spécial Rentrée" />
                      </div>
                      <div>
                        <Label htmlFor="pillar-description">Description</Label>
                        <Textarea id="pillar-description" placeholder="Décrivez l'univers et sa stratégie..." />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pillar-season">Saisonnalité</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="permanent">Permanent</SelectItem>
                              <SelectItem value="spring">Printemps</SelectItem>
                              <SelectItem value="summer">Été</SelectItem>
                              <SelectItem value="autumn">Automne</SelectItem>
                              <SelectItem value="winter">Hiver</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="pillar-priority">Priorité</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">Haute</SelectItem>
                              <SelectItem value="medium">Moyenne</SelectItem>
                              <SelectItem value="low">Basse</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Produits à associer</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                          {[
                            "Smartphone Galaxy",
                            "Casque Audio",
                            "Tablette",
                            "Montre Connectée",
                            "Écouteurs",
                            "Chargeur",
                            "Coque",
                            "Support",
                          ].map((product) => (
                            <div key={product} className="flex items-center space-x-2 p-2 border rounded">
                              <input type="checkbox" id={product} />
                              <Label htmlFor={product} className="text-sm">
                                {product}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNewPillar(false)}>
                        Annuler
                      </Button>
                      <Button onClick={() => setShowNewPillar(false)}>Créer le Pilier</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Zones Actives</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Optimisées cette semaine</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Trafic Moyen</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">74%</div>
                  <p className="text-xs text-muted-foreground">+12% vs mois dernier</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenus Zones</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€94,800</div>
                  <p className="text-xs text-muted-foreground">Cette semaine</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Temps Séjour</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18min</div>
                  <p className="text-xs text-muted-foreground">+3min vs moyenne</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Planogramme Interactif - Rayon Électronique</CardTitle>
                  <CardDescription>
                    {editMode ? "Mode édition activé - Cliquez pour modifier" : "Visualisation des placements produits"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {Array.from({ length: 16 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-12 rounded border-2 flex items-center justify-center text-xs font-medium cursor-pointer transition-all ${
                          editMode ? "hover:scale-105 hover:shadow-md" : ""
                        } ${
                          i < 4
                            ? "bg-red-100 border-red-300 text-red-700"
                            : i < 8
                              ? "bg-yellow-100 border-yellow-300 text-yellow-700"
                              : i < 12
                                ? "bg-green-100 border-green-300 text-green-700"
                                : "bg-blue-100 border-blue-300 text-blue-700"
                        }`}
                        onClick={() => editMode && alert(`Édition produit P${i + 1}`)}
                      >
                        P{i + 1}
                      </div>
                    ))}
                  </div>
                  {editMode && (
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-800">Mode édition actif</span>
                      <Button size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </Button>
                    </div>
                  )}
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
                  <CardTitle>Recommandations d'Assortiment</CardTitle>
                  <CardDescription>Suggestions personnalisées basées sur les données</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        action: "Ajouter",
                        product: "Écouteurs sans fil",
                        reason: "Forte demande détectée",
                        impact: "+15% CA",
                      },
                      {
                        action: "Déplacer",
                        product: "Chargeur rapide",
                        reason: "Meilleur emplacement",
                        impact: "+8% ventes",
                      },
                      {
                        action: "Retirer",
                        product: "Ancien modèle",
                        reason: "Faible rotation",
                        impact: "Libère espace",
                      },
                    ].map((rec, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Badge
                              variant={
                                rec.action === "Ajouter"
                                  ? "default"
                                  : rec.action === "Déplacer"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {rec.action}
                            </Badge>
                            <h4 className="font-medium mt-1">{rec.product}</h4>
                          </div>
                          <Button size="sm" variant="outline">
                            Appliquer
                          </Button>
                        </div>
                        <p className="text-sm text-slate-600">{rec.reason}</p>
                        <p className="text-sm font-medium text-green-600">{rec.impact}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Identité Visuelle
                  </CardTitle>
                  <CardDescription>Cohérence des éléments de branding</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Palette de Couleurs</h4>
                      <div className="flex gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-600 rounded"></div>
                        <div className="w-8 h-8 bg-blue-400 rounded"></div>
                        <div className="w-8 h-8 bg-slate-800 rounded"></div>
                        <div className="w-8 h-8 bg-slate-200 rounded"></div>
                      </div>
                      <p className="text-sm text-slate-600">Appliquée sur 95% des supports</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Typographie</h4>
                      <div className="space-y-1">
                        <p className="font-bold text-lg">Titre Principal - Bold</p>
                        <p className="font-medium">Sous-titre - Medium</p>
                        <p className="text-sm">Corps de texte - Regular</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Supports de Communication</CardTitle>
                  <CardDescription>Présentoirs et affichages digitaux</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-green-800">Écrans Digitaux</h4>
                        <p className="text-sm text-green-600">12 écrans actifs</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">100% Opérationnels</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-blue-800">Présentoirs</h4>
                        <p className="text-sm text-blue-600">45 supports physiques</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Conformes</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-purple-800">Vitrines</h4>
                        <p className="text-sm text-purple-600">6 vitrines thématiques</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">Mise à jour</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="interactive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Outils d'Engagement Client
                </CardTitle>
                <CardDescription>Technologies interactives et leur performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {interactiveElements.map((element, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{element.name}</h4>
                          <Badge variant="outline">{element.satisfaction}/5 ⭐</Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-slate-600">Utilisation:</span>
                          <Progress value={element.usage} className="flex-1" />
                          <span className="text-sm font-medium">{element.usage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">QR Codes Produits</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center mb-4">
                          <div className="w-24 h-24 bg-black mx-auto mb-2 flex items-center justify-center">
                            <div className="w-20 h-20 bg-white grid grid-cols-8 gap-px p-1">
                              {Array.from({ length: 64 }, (_, i) => (
                                <div key={i} className={`${Math.random() > 0.5 ? "bg-black" : "bg-white"}`}></div>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600">Scannez pour plus d'infos</p>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Scans aujourd'hui:</span>
                            <span className="font-medium">247</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Conversions:</span>
                            <span className="font-medium">18%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gamification" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5" />
                    Éléments Ludiques
                  </CardTitle>
                  <CardDescription>Engagement par le jeu et les défis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                      <h4 className="font-medium mb-2">Chasse au Trésor Mensuelle</h4>
                      <p className="text-sm text-slate-600 mb-3">
                        Trouvez 5 produits cachés dans le magasin via l'app mobile
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge className="bg-purple-100 text-purple-800">342 participants</Badge>
                        <span className="text-sm font-medium">Récompense: 20% de remise</span>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                      <h4 className="font-medium mb-2">Programme de Points</h4>
                      <p className="text-sm text-slate-600 mb-3">
                        Gagnez des points à chaque achat et débloquez des récompenses
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge className="bg-blue-100 text-blue-800">1,240 membres actifs</Badge>
                        <span className="text-sm font-medium">Taux engagement: 78%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Classement des Joueurs</CardTitle>
                  <CardDescription>Top participants du mois</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { rank: 1, name: "Marie L.", points: 2450, badge: "🏆" },
                      { rank: 2, name: "Pierre M.", points: 2180, badge: "🥈" },
                      { rank: 3, name: "Sophie D.", points: 1920, badge: "🥉" },
                      { rank: 4, name: "Jean R.", points: 1750, badge: "⭐" },
                      { rank: 5, name: "Emma B.", points: 1680, badge: "⭐" },
                    ].map((player) => (
                      <div key={player.rank} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{player.badge}</span>
                          <div>
                            <h4 className="font-medium">{player.name}</h4>
                            <p className="text-sm text-slate-600">#{player.rank}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-purple-600">{player.points}</div>
                          <div className="text-sm text-slate-600">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visiteurs Uniques</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3,247</div>
                  <p className="text-xs text-muted-foreground">+8% vs semaine dernière</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Temps Moyen</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18min</div>
                  <p className="text-xs text-muted-foreground">+2min vs moyenne</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taux Conversion</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24.5%</div>
                  <p className="text-xs text-muted-foreground">+3.2% vs mois dernier</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Heatmap du Magasin</CardTitle>
                <CardDescription>Analyse des zones de forte affluence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {heatmapData.map((zone, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded ${
                            zone.intensity > 80
                              ? "bg-red-500"
                              : zone.intensity > 60
                                ? "bg-orange-500"
                                : zone.intensity > 40
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                          }`}
                        ></div>
                        <div>
                          <h4 className="font-medium">{zone.zone}</h4>
                          <p className="text-sm text-slate-600">{zone.visitors} visiteurs/jour</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={zone.intensity} className="w-20" />
                        <span className="text-sm font-medium">{zone.intensity}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Très forte affluence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span>Forte affluence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Affluence modérée</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Faible affluence</span>
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
