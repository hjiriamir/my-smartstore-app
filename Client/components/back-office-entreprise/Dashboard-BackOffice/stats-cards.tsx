"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, TrendingUp, Clock } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"

type StatsCardsProps = {
  pendingRequests?: number;
  companiesCount?: number;
  activeUsers?: number;
  loading: boolean;
}

export function StatsCards({ pendingRequests, companiesCount, activeUsers, loading }: StatsCardsProps) {
  const stats = [
    {
      title: "Demandes en attente",
      value: pendingRequests?.toString() || "0",
      description: "+0 depuis hier",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      title: "Entreprises créées",
      value: companiesCount?.toString() || "0",
      description: "+0 ce mois",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Utilisateurs actifs",
      value: activeUsers?.toString() || "0",
      description: "+0% ce mois",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100"
    }
  ]

  if (loading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[100px] mb-2" />
              <Skeleton className="h-4 w-[200px]" />
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index} className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`h-8 w-8 ${stat.bgColor} rounded-full flex items-center justify-center`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}