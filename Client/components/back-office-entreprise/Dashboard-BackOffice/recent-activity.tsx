"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Building2 } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

type Activity = {
  id: number;
  nom: string;
  prenom: string;
  entreprise: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

type RecentActivityProps = {
  activities?: Activity[];
  loading: boolean;
}

export function RecentActivity({ activities = [], loading }: RecentActivityProps) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const getActionText = (type: string) => {
    switch (type) {
      case "Accepter":
        return "Demande acceptée"
      case "Refuser":
        return "Demande refusée"
      case "En attente":
        return "Nouvelle demande"
      default:
        return "Action inconnue"
    }
  }

  const getActionBadge = (type: string) => {
    switch (type) {
      case "Accepter":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Acceptée</Badge>
      case "Refuser":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Refusée</Badge>
      case "En attente":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En attente</Badge>
      default:
        return <Badge variant="secondary">Inconnue</Badge>
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "Accepter":
        return { icon: CheckCircle, color: "text-green-600" }
      case "Refuser":
        return { icon: XCircle, color: "text-red-600" }
      case "En attente":
        return { icon: Clock, color: "text-yellow-600" }
      default:
        return { icon: Clock, color: "text-gray-600" }
    }
  }

  if (loading) {
    return (
      <Card className="h-full w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Activité récente
          </CardTitle>
          <CardDescription>
            Dernières actions sur les demandes d'abonnement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-3 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Activité récente
        </CardTitle>
        <CardDescription>
          Dernières actions sur les demandes d'abonnement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 4).map((activity) => {
            const { icon: Icon, color } = getIcon(activity.status)
            return (
              <div key={activity.id} className="flex flex-col sm:flex-row items-start sm:items-center space-x-0 sm:space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mb-2 sm:mb-0">
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="flex-1 space-y-1 w-full">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-sm font-medium leading-none">
                      {getActionText(activity.status)} - {activity.entreprise}
                    </p>
                    {getActionBadge(activity.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Par {activity.prenom} {activity.nom} • {formatDistanceToNow(new Date(activity.updatedAt), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}