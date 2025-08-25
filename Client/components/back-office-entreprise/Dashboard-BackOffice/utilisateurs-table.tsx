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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Eye, Edit, Trash2, Plus, Shield, User, Crown } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Entreprise {
  id: number
  nomEntreprise: string
  adresse: string | null
}

interface Utilisateur {
  id: number
  name: string
  email: string
  role: string
  entreprise: Entreprise
  derniereConnexion: string | null
  dateCreation?: string
  avatar?: string
}

interface StatistiquesUtilisateurs {
  totalUtilisateurs: number
  totalAdmins: number
  totalConnectes: number
  utilisateurs: Utilisateur[]
}

export function UtilisateursTable() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([])
  const [statistiques, setStatistiques] = useState({
    totalUtilisateurs: 0,
    totalAdmins: 0,
    totalConnectes: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [selectedUtilisateur, setSelectedUtilisateur] = useState<Utilisateur | null>(null)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth1/getStatistiquesUtilisateurs`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: StatistiquesUtilisateurs = await response.json()
        setUtilisateurs(data.utilisateurs)
        setStatistiques({
          totalUtilisateurs: data.totalUtilisateurs,
          totalAdmins: data.totalAdmins,
          totalConnectes: data.totalConnectes
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue')
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredUtilisateurs = utilisateurs.filter(utilisateur => {
    const matchesSearch = 
      utilisateur.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      utilisateur.entreprise.nomEntreprise.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === "all" || utilisateur.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            <Crown className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )
      case 'store_manager':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Shield className="h-3 w-3 mr-1" />
            Manager
          </Badge>
        )
      case 'chef de rayon':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <User className="h-3 w-3 mr-1" />
            Chef de Rayon
          </Badge>
        )
      case 'cashier':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <User className="h-3 w-3 mr-1" />
            Caissier
          </Badge>
        )
      case 'seller':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <User className="h-3 w-3 mr-1" />
            Vendeur
          </Badge>
        )
      case 'support_technician':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <User className="h-3 w-3 mr-1" />
            Support Technique
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <User className="h-3 w-3 mr-1" />
            {role || 'Non défini'}
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
            <Users className="h-5 w-5" />
            Gestion des Utilisateurs
          </CardTitle>
          <CardDescription>
            Gérez tous les utilisateurs de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{statistiques.totalUtilisateurs}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Admins</p>
                    <p className="text-2xl font-bold text-purple-600">{statistiques.totalAdmins}</p>
                  </div>
                  <Crown className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Connectés</p>
                    <p className="text-2xl font-bold text-orange-600">{statistiques.totalConnectes}</p>
                  </div>
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-orange-600 rounded-full animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
  
          {/* Filtres et actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="store_manager">Store Manager</SelectItem>
                <SelectItem value="chef de rayon">Chef de Rayon</SelectItem>
                <SelectItem value="cashier">Caissier</SelectItem>
                <SelectItem value="seller">Vendeur</SelectItem>
                <SelectItem value="support_technician">Support Technique</SelectItem>
              </SelectContent>
            </Select>
          </div>
  
          {/* Tableau */}
          <div className="rounded-md border w-full overflow-x-auto">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
            <TableHeader className="sticky top-0 bg-white dark:bg-gray-950 z-10">
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUtilisateurs.length > 0 ? (
                  filteredUtilisateurs.map((utilisateur) => (
                    <TableRow key={utilisateur.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={utilisateur.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {utilisateur.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{utilisateur.name}</div>
                            <div className="text-sm text-muted-foreground">{utilisateur.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{utilisateur.entreprise.nomEntreprise}</div>
                        {utilisateur.entreprise.adresse && (
                          <div className="text-xs text-muted-foreground">
                            {utilisateur.entreprise.adresse}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(utilisateur.role)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(utilisateur.derniereConnexion)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedUtilisateur(utilisateur)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Détails de l'utilisateur</DialogTitle>
                                <DialogDescription>
                                  Informations complètes sur l'utilisateur
                                </DialogDescription>
                              </DialogHeader>
                              {selectedUtilisateur && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium">Nom complet</label>
                                      <p className="text-sm text-muted-foreground">{selectedUtilisateur.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Email</label>
                                      <p className="text-sm text-muted-foreground">{selectedUtilisateur.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Entreprise</label>
                                      <p className="text-sm text-muted-foreground">{selectedUtilisateur.entreprise.nomEntreprise}</p>
                                      {selectedUtilisateur.entreprise.adresse && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {selectedUtilisateur.entreprise.adresse}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium">Rôle</label>
                                      <div className="mt-1">{getRoleBadge(selectedUtilisateur.role)}</div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Dernière connexion</label>
                                      <p className="text-sm text-muted-foreground">
                                        {formatDate(selectedUtilisateur.derniereConnexion)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}