"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bell, CheckCircle, Clock, TrendingUp, Package, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PlanogramLibrary from "../../components/front-office/planogram-library"
import Visualization2D3D from "../../components/front-office/visualization-2d-3d"
import ImplementationTracking from "../../components/front-office/implementation-tracking"
import Communication from "../../components/front-office/communication"
import ProductSearch from "../../components/front-office/product-search"
import TrainingSupport from "../../components/front-office/training-support"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  // Données simulées pour le tableau de bord
  const dashboardStats = {
    pendingTasks: 12,
    completedToday: 8,
    totalPlanograms: 45,
    implementationRate: 87,
  }

  const recentPlanograms = [
    {
      id: 1,
      name: "Rayon Épicerie Salée",
      category: "Épicerie",
      status: "À implémenter",
      priority: "Haute",
      dueDate: "2024-01-20",
    },
    {
      id: 2,
      name: "Produits Laitiers",
      category: "Frais",
      status: "En cours",
      priority: "Moyenne",
      dueDate: "2024-01-22",
    },
    {
      id: 3,
      name: "Boissons Chaudes",
      category: "Épicerie",
      status: "Terminé",
      priority: "Basse",
      dueDate: "2024-01-18",
    },
  ]

  const notifications = [
    { id: 1, type: "urgent", message: "Nouveau planogramme publié pour le rayon Boulangerie", time: "10:30" },
    { id: 2, type: "info", message: "Confirmation requise pour le rayon Fruits & Légumes", time: "09:15" },
    { id: 3, type: "warning", message: "Retard détecté sur l'implémentation du rayon Textile", time: "08:45" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 mt-14">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">PlanogramPro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  3
                </Badge>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">Magasin Centre-Ville</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="library">Bibliothèque</TabsTrigger>
            <TabsTrigger value="visualization">Visualisation</TabsTrigger>
            <TabsTrigger value="tracking">Suivi</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="search">Recherche</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          {/* Tableau de bord d'accueil */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tâches en attente</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.pendingTasks}</div>
                  <p className="text-xs text-muted-foreground">À traiter aujourd'hui</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Terminées aujourd'hui</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{dashboardStats.completedToday}</div>
                  <p className="text-xs text-muted-foreground">+12% par rapport à hier</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total planogrammes</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalPlanograms}</div>
                  <p className="text-xs text-muted-foreground">Actifs ce mois</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taux d'implémentation</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{dashboardStats.implementationRate}%</div>
                  <Progress value={dashboardStats.implementationRate} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Planogrammes récents */}
              <Card>
                <CardHeader>
                  <CardTitle>Planogrammes récents</CardTitle>
                  <CardDescription>Dernières publications pour votre magasin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPlanograms.map((planogram) => (
                      <div key={planogram.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{planogram.name}</h4>
                          <p className="text-sm text-muted-foreground">{planogram.category}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              planogram.status === "Terminé"
                                ? "default"
                                : planogram.status === "En cours"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {planogram.status}
                          </Badge>
                          <Badge variant="outline">{planogram.priority}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Alertes et mises à jour importantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === "urgent"
                              ? "bg-red-500"
                              : notification.type === "warning"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            
          </TabsContent>

          <TabsContent value="library">
            <PlanogramLibrary />
          </TabsContent>

          <TabsContent value="visualization">
            <Visualization2D3D />
          </TabsContent>

          <TabsContent value="tracking">
            <ImplementationTracking />
          </TabsContent>

          <TabsContent value="communication">
            <Communication />
          </TabsContent>

          <TabsContent value="search">
            <ProductSearch />
          </TabsContent>

          <TabsContent value="support">
            <TrainingSupport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
