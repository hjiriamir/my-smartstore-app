"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, TrendingDown, Users, Building2, Euro, Calendar } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = React.useState("6months")
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch dashboard stats
  const { data: statsData, error: statsError } = useSWR(
    `${API_BASE_URL}/entreprises/getDashboarEntreprisedStats`, 
    fetcher,
    { refreshInterval: 30000 }
  )
  
  // Fetch subscription distribution
  const { data: subscriptionData, error: subscriptionError } = useSWR(
    `${API_BASE_URL}/entreprises/repartition`, 
    fetcher,
    { refreshInterval: 30000 }
  )

  // Fetch revenue evolution data
  const { data: revenueData, error: revenueError } = useSWR(
    `${API_BASE_URL}/entreprises/evolution-chiffre-affaire`, 
    fetcher,
    { refreshInterval: 30000 }
  )

  // Fetch users and companies growth data
  const { data: growthData, error: growthError } = useSWR(
   `${API_BASE_URL}/entreprises/evolution-users-entreprises`, 
    fetcher,
    { refreshInterval: 30000 }
  )

  // Fetch top companies data
  const { data: topCompaniesData, error: topCompaniesError } = useSWR(
    `${API_BASE_URL}/entreprises/top-entreprises`, 
    fetcher,
    { refreshInterval: 30000 }
  )

  // Transform revenue data for the chart
  const transformedRevenueData = revenueData?.map(item => ({
    month: item.mois,
    revenue: item.chiffreAffaire
  })) || []

  // Transform growth data for the chart
  const transformedGrowthData = growthData?.map(item => ({
    month: item.mois,
    users: item.utilisateurs,
    companies: item.entreprises
  })) || []

  // Transform top companies data
  const transformedTopCompanies = topCompaniesData?.slice(0, 4).map(item => ({
    name: item.entreprise.nomEntreprise,
    revenue: item.chiffre_affaire,
    users:item.nombre_utilisateurs,
    growth: 0 
  })) || []

  // Transform subscription data for the pie chart
  const transformedSubscriptionData = subscriptionData?.repartition ? [
    { name: 'Gold', value: parseFloat(subscriptionData.repartition.gold.pourcentage), color: '#FFD700' },
    { name: 'Advanced', value: parseFloat(subscriptionData.repartition.advanced.pourcentage), color: '#4F46E5' },
    { name: 'Basic', value: parseFloat(subscriptionData.repartition.basic.pourcentage), color: '#6b7280' },
  ] : []

  // Loading state
  if (!statsData || !subscriptionData || !revenueData || !growthData || !topCompaniesData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Error state
  if (statsError || subscriptionError || revenueError || growthError || topCompaniesError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Erreur lors du chargement des données</div>
      </div>
    )
  }

  const totalRevenue = statsData?.chiffreAffaire?.chiffreAffaireGlobal || 0
  const revenueVariation = statsData?.chiffreAffaire?.pourcentageVariation || 0
  const totalUsers = statsData?.utilisateurs?.totalUtilisateurs || 0
  const usersVariation = statsData?.utilisateurs?.pourcentageVariation || 0
  const totalCompanies = statsData?.entreprises?.totalEntreprises || 0
  const companiesVariation = statsData?.entreprises?.pourcentageVariation || 0

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Tableau de bord analytique de votre plateforme
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(totalRevenue / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {revenueVariation > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(revenueVariation)}% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {usersVariation > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(usersVariation)}% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entreprises</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompanies}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {companiesVariation > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(companiesVariation)}% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
  <CardHeader>
    <CardTitle>Évolution du Chiffre d'Affaires</CardTitle>
    <CardDescription>
      Revenus mensuels sur les {transformedRevenueData.length} derniers mois
    </CardDescription>
  </CardHeader>
  <CardContent>
    <ChartContainer
      config={{
        revenue: {
          label: "Chiffre d'Affaires",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={transformedRevenueData} margin={{ right: 80, left: -20 }} >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tickFormatter={(value) => value}
            interval={0}
          />
          <YAxis />
          <ChartTooltip 
            content={<ChartTooltipContent />} 
            formatter={(value) => [`€${value}`, "Chiffre d'Affaires"]}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="var(--color-revenue)" 
            strokeWidth={2}
            dot={{ fill: "var(--color-revenue)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  </CardContent>
</Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Abonnements</CardTitle>
            <CardDescription>
              Distribution des forfaits Gold vs Advanced vs Basic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                gold: {
                  label: "Gold",
                  color: "#FFD700", 
                },
                advanced: {
                  label: "Advanced",
                  color: "#4F46E5", 
                },
                basic: {
                  label: "Basic",
                  color: "#6B7280", 
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%" >
                <PieChart>
                  <Pie
                    data={transformedSubscriptionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {transformedSubscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {transformedSubscriptionData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Croissance des Utilisateurs et Entreprises</CardTitle>
          <CardDescription>
            Évolution du nombre d'utilisateurs et d'entreprises
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              users: {
                label: "Utilisateurs",
                color: "hsl(var(--chart-2))",
              },
              companies: {
                label: "Entreprises",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transformedGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="users" fill="var(--color-users)" />
                <Bar dataKey="companies" fill="var(--color-companies)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top Companies */}
      <Card>
        <CardHeader>
          <CardTitle>Top Entreprises</CardTitle>
          <CardDescription>
            Entreprises générant le plus de revenus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transformedTopCompanies.map((company, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{company.name}</div>
                    <div className="text-sm text-muted-foreground">{company.users} utilisateurs</div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="font-medium">€{(company.revenue / 1000).toFixed(0)}K</div>
                  
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}