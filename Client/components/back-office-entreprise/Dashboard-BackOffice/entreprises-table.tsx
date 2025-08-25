"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Ban } from "lucide-react"; 
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Search, Eye, Edit, Trash2, Plus, Users, Calendar, Euro, Pause, Check   } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"

interface Entreprise {
  id: number
  nomEntreprise: string
  adresse: string | null
  type_forfait: string | null
  date_creation: string
  totalUtilisateurs: number
  admin: {
    name: string
    email: string
  } | null
  statut_abonnement: string | null
  informations_abonnement?: string
  etatAbonnements: Array<{
    type_forfait: string
    statut: string
  }>
}

interface DashboardStats {
  totalEntreprises: number
  totalEntreprisesActives: number
  totalUtilisateurs: number
  chiffreAffaire: number
}

export function EntreprisesTable() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [forfaitFilter, setForfaitFilter] = useState<string>("all")
  const [selectedEntreprise, setSelectedEntreprise] = useState<Entreprise | null>(null)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;



  
  const [confirmationData, setConfirmationData] = useState<{
    open: boolean
    action: 'activate' | 'suspend' | 'deactivate' | null
    entrepriseId: number | null
    entrepriseName: string
    type_forfait: string | null
  }>({
    open: false,
    action: null,
    entrepriseId: null,
    entrepriseName: '',
    type_forfait: null
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE_URL}/entreprises/getDashboardStats`)
      if (!statsResponse.ok) throw new Error('Failed to fetch stats')
      const statsData = await statsResponse.json()
      setStats(statsData)
      
      // Fetch entreprises
      const entreprisesResponse = await fetch(`${API_BASE_URL}/entreprises/getEntreprisesAvecInfos`)
      if (!entreprisesResponse.ok) throw new Error('Failed to fetch entreprises')
      const entreprisesData = await entreprisesResponse.json()
      
      // Traiter les données pour utiliser etatAbonnements
      const processedData = entreprisesData.map((entreprise: any) => ({
        ...entreprise,
        type_forfait: entreprise.etatAbonnements[0]?.type_forfait || null,
        statut_abonnement: entreprise.etatAbonnements[0]?.statut || null
      }))
      
      setEntreprises(processedData)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleActiverEntreprise = async (id: number, type_forfait: string | null) => {
    if (!type_forfait) {
      toast({
        title: "Erreur",
        description: "Le type de forfait est requis pour activer l'entreprise",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/entreprises/activer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idEntreprise: id,
          forfait: type_forfait
        })
      })

      if (!response.ok) throw new Error('Échec de l\'activation')

      toast({
        title: "Succès",
        description: "Entreprise activée avec succès",
      })

      // Rafraîchir les données
      await fetchData()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    }
  }

  const handleSuspendreEntreprise = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/entreprises/suspendu/${id}`, {
        method: 'PUT',
      })

      if (!response.ok) throw new Error('Échec de la suspension')

      toast({
        title: "Succès",
        description: "Entreprise suspendue avec succès",
      })

      // Rafraîchir les données
      await fetchData()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    }
  }

  const handleDesactiverEntreprise = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/entreprises/inactif/${id}`, {
        method: 'PUT',
      })

      if (!response.ok) throw new Error('Échec de la désactivation')

      toast({
        title: "Succès",
        description: "Entreprise désactivée avec succès",
      })

      // Rafraîchir les données
      await fetchData()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    }
  }

  const filteredEntreprises = entreprises.filter(entreprise => {
    const search = searchTerm.toLowerCase();
  
    const matchesSearch =
      entreprise.nomEntreprise.toLowerCase().includes(search) ||
      entreprise.admin?.name.toLowerCase().includes(search) ||
      entreprise.admin?.email.toLowerCase().includes(search);
  
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Actif" ? entreprise.statut_abonnement === "actif" :
       statusFilter === "Inactif" ? entreprise.statut_abonnement === "inactif" :
       statusFilter === "Suspendu" ? entreprise.statut_abonnement === "suspendu" : true);
  
    const matchesForfait =
      forfaitFilter === "all" ||
      (forfaitFilter === "basic" ? entreprise.type_forfait?.toLowerCase() === "basic" :
       forfaitFilter === "advanced" ? entreprise.type_forfait?.toLowerCase() === "advanced" :
       forfaitFilter === "gold" ? entreprise.type_forfait?.toLowerCase() === "gold" : true);
  
    return matchesSearch && matchesStatus && matchesForfait;
  });
  

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Inconnu</Badge>
    
    switch (status.toLowerCase()) {
      case 'actif':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>
      case 'inactif':
        return <Badge variant="secondary">Inactif</Badge>
      case 'suspendu':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspendu</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getForfaitBadge = (forfait: string | null) => {
    if (!forfait) return <Badge variant="outline">Non défini</Badge>
    
    switch (forfait.toLowerCase()) {
      case 'advanced':
        return <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">Advanced</Badge>
      case 'gold':
        return <Badge className="bg-gradient-to-r from-yellow-300 to-yellow-600 text-white">Gold</Badge>
      default:
        return <Badge variant="secondary">Basic</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }
  return (
    <div className="space-y-4 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Gestion des Entreprises
          </CardTitle>
          <CardDescription>
            Gérez toutes les entreprises clientes et leurs abonnements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats?.totalEntreprises || 0}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Actives</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.totalEntreprisesActives || 0}</p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Utilisateurs</p>
                    <p className="text-2xl font-bold">{stats?.totalUtilisateurs || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CA Total</p>
                    <p className="text-2xl font-bold">€{(stats ? stats.chiffreAffaire / 1000 : 0).toFixed(0)}K</p>
                  </div>
                  <Euro className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres et actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher une entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="Inactif">Inactif</SelectItem>
                <SelectItem value="Suspendu">Suspendu</SelectItem>
              </SelectContent>
            </Select>
            <Select value={forfaitFilter} onValueChange={setForfaitFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Forfait" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les forfaits</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau */}
          <div className="rounded-md border w-full overflow-x-auto">
              <div className="max-h-[500px] overflow-y-auto">
            <Table>
            <TableHeader className="sticky top-0 bg-white dark:bg-gray-950 z-10">
                <TableRow>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Administrateur</TableHead>
                  <TableHead>Forfait</TableHead>
                  <TableHead>Utilisateurs</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntreprises.length > 0 ? (
                  filteredEntreprises.map((entreprise) => (
                    <TableRow key={entreprise.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entreprise.nomEntreprise}</div>
                          <div className="text-sm text-muted-foreground">
                            {entreprise.adresse || "Adresse non spécifiée"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {entreprise.admin ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {entreprise.admin.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{entreprise.admin.name}</div>
                              <div className="text-sm text-muted-foreground">{entreprise.admin.email}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Aucun admin</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getForfaitBadge(entreprise.type_forfait)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {entreprise.totalUtilisateurs}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(entreprise.statut_abonnement)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(entreprise.date_creation).toLocaleDateString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedEntreprise(entreprise)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Détails de l'entreprise</DialogTitle>
                                <DialogDescription>
                                  Informations complètes sur l'entreprise
                                </DialogDescription>
                              </DialogHeader>
                              {selectedEntreprise && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium">Nom de l'entreprise</label>
                                      <p className="text-sm text-muted-foreground">{selectedEntreprise.nomEntreprise}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Adresse</label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedEntreprise.adresse || "Adresse non spécifiée"}
                                      </p>
                                    </div>
                                    {selectedEntreprise.admin && (
                                      <div>
                                        <label className="text-sm font-medium">Administrateur</label>
                                        <p className="text-sm text-muted-foreground">{selectedEntreprise.admin.name}</p>
                                        <p className="text-xs text-muted-foreground">{selectedEntreprise.admin.email}</p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium">Forfait</label>
                                      <div className="mt-1">{getForfaitBadge(selectedEntreprise.type_forfait)}</div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Nombre d'utilisateurs</label>
                                      <p className="text-sm text-muted-foreground">{selectedEntreprise.totalUtilisateurs}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Informations abonnement</label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedEntreprise.informations_abonnement || "Non spécifié"}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Statut</label>
                                      <div className="mt-1">{getStatusBadge(selectedEntreprise.statut_abonnement)}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {/* Bouton Activer (Check) */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`text-green-600 hover:text-green-700 ${
                              entreprise.statut_abonnement === 'actif' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            disabled={entreprise.statut_abonnement === 'actif'}
                            onClick={() => setConfirmationData({
                              open: true,
                              action: 'activate',
                              entrepriseId: entreprise.id,
                              entrepriseName: entreprise.nomEntreprise,
                              type_forfait: entreprise.type_forfait
                            })}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          
                          {/* Bouton Suspendre (Pause) */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`text-yellow-600 hover:text-yellow-700 ${
                              entreprise.statut_abonnement === 'suspendu' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            disabled={entreprise.statut_abonnement === 'suspendu'}
                            onClick={() => setConfirmationData({
                              open: true,
                              action: 'suspend',
                              entrepriseId: entreprise.id,
                              entrepriseName: entreprise.nomEntreprise,
                              type_forfait: null
                            })}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                          
                          {/* Bouton Désactiver (Ban) */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`text-red-600 hover:text-red-700 ${
                              entreprise.statut_abonnement === 'inactif' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            disabled={entreprise.statut_abonnement === 'inactif'}
                            onClick={() => setConfirmationData({
                              open: true,
                              action: 'deactivate',
                              entrepriseId: entreprise.id,
                              entrepriseName: entreprise.nomEntreprise,
                              type_forfait: null
                            })}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Aucune entreprise trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmation */}
      <Dialog 
        open={confirmationData.open} 
        onOpenChange={(open) => setConfirmationData({...confirmationData, open})}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'action</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              {confirmationData.action === 'activate' && `Êtes-vous sûr de vouloir activer l'entreprise ${confirmationData.entrepriseName} ?`}
              {confirmationData.action === 'suspend' && `Êtes-vous sûr de vouloir suspendre l'entreprise ${confirmationData.entrepriseName} ?`}
              {confirmationData.action === 'deactivate' && `Êtes-vous sûr de vouloir désactiver l'entreprise ${confirmationData.entrepriseName} ?`}
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setConfirmationData({...confirmationData, open: false})}
              >
                Annuler
              </Button>
              <Button 
                variant={
                  confirmationData.action === 'deactivate' ? 'destructive' : 
                  confirmationData.action === 'suspend' ? 'secondary' : 'default'
                }
                onClick={() => {
                  if (confirmationData.action === 'activate') {
                    handleActiverEntreprise(confirmationData.entrepriseId!, confirmationData.type_forfait)
                  } else if (confirmationData.action === 'suspend') {
                    handleSuspendreEntreprise(confirmationData.entrepriseId!)
                  } else if (confirmationData.action === 'deactivate') {
                    handleDesactiverEntreprise(confirmationData.entrepriseId!)
                  }
                  setConfirmationData({...confirmationData, open: false})
                }}
              >
                Confirmer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}