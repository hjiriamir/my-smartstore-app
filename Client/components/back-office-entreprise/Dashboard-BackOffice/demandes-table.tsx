"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
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
import { CheckCircle, XCircle, Search, Filter, Eye, Mail, Phone, Building, Calendar, Euro } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

import {
  fetchDemandes,
  createEntreprise,
  createUser,
  sendEmail,
  refuserDemande,
  accepterDemande,
  createEtatAbonnement
} from "@/src/services/userService"

// Types
interface Demande {
  id: number
  nom: string
  prenom: string
  entreprise: string
  email: string
  telephone: string
  commentaire?: string
  titre_post?: string
  prix_abonnement: string
  date_debut: string
  date_fin: string
  forfait: string
  status: 'En attente' | 'Accepter' | 'Refuser'
  createdAt: string
  updatedAt: string
}

export function DemandesTable() {
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [forfaitFilter, setForfaitFilter] = useState<string>("all")
  const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const { toast } = useToast()

  const loadDemandes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchDemandes()
      setDemandes(data)
    } catch (error) {
      console.error("Failed to fetch demandes:", error)
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les demandes d'abonnement.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadDemandes()
  }, [loadDemandes])

  // Filtrage des demandes
  const filteredDemandes = demandes.filter(demande => {
    const matchesSearch = 
      demande.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || demande.status === statusFilter
    // Correction: Utiliser === pour une correspondance exacte et toLowerCase() pour la robustesse
    const matchesForfait = forfaitFilter === "all" || demande.forfait.toLowerCase() === forfaitFilter.toLowerCase()
    
    return matchesSearch && matchesStatus && matchesForfait
  })

  const handleAccept = async (demande: Demande) => {
    setActionLoading(demande.id)
    try {
      // 1️⃣ Créer l'entreprise
      const entrepriseData = {
        nomEntreprise: demande.entreprise,
        adresse: "Adresse non spécifiée", 
        informations_abonnement: demande.forfait,
        date_creation: new Date().toISOString(),
      };
      const entrepriseResponse = await createEntreprise(entrepriseData);
      console.log("Réponse création entreprise:", entrepriseResponse);
  
      const entrepriseId = entrepriseResponse.id || entrepriseResponse.data?.id;
      if (!entrepriseId) {
        throw new Error("ID de l'entreprise non reçu dans la réponse: " + JSON.stringify(entrepriseResponse));
      }
  
      // 2️⃣ Créer l'utilisateur admin avec l'ID entreprise
      const userData = {
        name: `${demande.nom} ${demande.prenom}`,
        email: demande.email,
        password: "defaultPassword",
        role: "admin",
        entreprises_id: entrepriseId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const userResponse = await createUser(userData);
      console.log("Réponse création utilisateur:", userResponse);
  
      // 3️⃣ Créer l'état d'abonnement
      const currentDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(currentDate.getFullYear() + 1); // Ajoute 1 an
  
      await createEtatAbonnement({
        entreprise_id: entrepriseId,
        type_forfait: demande.forfait,
        date_acceptation: currentDate.toISOString(),
        date_fin: endDate.toISOString(),
        statut: "actif"
      });
  
      // 4️⃣ Envoyer un email
      await sendEmail({
        toEmail: demande.email,
        userEmail: demande.email,
        userPassword: "defaultPassword",
      });
  
      // 5️⃣ Mettre à jour le statut de la demande à "Accepter"
      await accepterDemande(demande.id);
  
      // Mise à jour de l'UI
      setDemandes(prev => prev.filter(d => d.id !== demande.id));
      
      toast({
        title: "Demande acceptée",
        description: `L'entreprise ${demande.entreprise} a été créée avec succès.`,
      });
    } catch (error: any) {
      console.error("Erreur détaillée:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du traitement de la demande.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (demande: Demande) => {
    setActionLoading(demande.id)
    try {
      await refuserDemande(demande.id)
      
      // Mettre à jour l'état local
      setDemandes(prev => 
        prev.map(d => 
          d.id === demande.id 
            ? { ...d, status: 'Refuser' as const }
            : d
        )
      )
      
      toast({
        title: "Demande refusée",
        description: `La demande de ${demande.entreprise} a été refusée.`,
      })
    } catch (error: any) {
      console.error("Erreur lors du refus de la demande:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du refus de la demande.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En attente':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>
      case 'Accepter':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Acceptée</Badge>
      case 'Refuser':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Refusée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getForfaitBadge = (forfait: string) => {
    switch (forfait.toLowerCase()) {
      case 'gold':
        return <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">Gold</Badge>
      case 'advanced':
        return <Badge className="bg-blue-500 text-white">Advanced</Badge>
      case 'basic':
        return <Badge variant="secondary">Basic</Badge>
      default:
        return <Badge variant="outline">{forfait}</Badge>
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Demandes d'Abonnement</CardTitle>
          <CardDescription>Gestion des demandes d'abonnement en attente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Demandes d'Abonnement
          </CardTitle>
          <CardDescription>
            Gérez les demandes d'abonnement et créez de nouveaux comptes entreprise
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, entreprise ou email..."
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
                <SelectItem value="En attente">En attente</SelectItem>
                <SelectItem value="Accepter">Acceptées</SelectItem>
                <SelectItem value="Refuser">Refusées</SelectItem>
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

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">En attente</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {demandes.filter(d => d.status === 'En attente').length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Filter className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Acceptées</p>
                    <p className="text-2xl font-bold text-green-600">
                      {demandes.filter(d => d.status === 'Accepter').length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Refusées</p>
                    <p className="text-2xl font-bold text-red-600">
                      {demandes.filter(d => d.status === 'Refuser').length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tableau */}
          {filteredDemandes.length === 0 ? (
            <Alert className="w-full">
              <AlertDescription>
                Aucune demande ne correspond à vos critères de recherche.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border w-full overflow-x-auto"> {/* Ajout de overflow-x-auto */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Forfait</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDemandes.map((demande) => (
                    <TableRow key={demande.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{demande.entreprise}</div>
                          <div className="text-sm text-muted-foreground">{demande.titre_post}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{demande.prenom} {demande.nom}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {demande.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getForfaitBadge(demande.forfait)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Euro className="h-3 w-3" />
                          {parseFloat(demande.prix_abonnement).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(demande.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(demande.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedDemande(demande)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Détails de la demande</DialogTitle>
                                <DialogDescription>
                                  Informations complètes sur la demande d'abonnement
                                </DialogDescription>
                              </DialogHeader>
                              {selectedDemande && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-sm font-medium">Entreprise</label>
                                      <p className="text-sm text-muted-foreground">{selectedDemande.entreprise}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Contact</label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedDemande.prenom} {selectedDemande.nom}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Email</label>
                                      <p className="text-sm text-muted-foreground">{selectedDemande.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Téléphone</label>
                                      <p className="text-sm text-muted-foreground">{selectedDemande.telephone}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-sm font-medium">Forfait</label>
                                      <p className="text-sm text-muted-foreground">{selectedDemande.forfait}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Prix</label>
                                      <p className="text-sm text-muted-foreground">€{parseFloat(selectedDemande.prix_abonnement).toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Période</label>
                                      <p className="text-sm text-muted-foreground">
                                        Du {new Date(selectedDemande.date_debut).toLocaleDateString('fr-FR')} au {new Date(selectedDemande.date_fin).toLocaleDateString('fr-FR')}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Statut</label>
                                      <div className="mt-1">{getStatusBadge(selectedDemande.status)}</div>
                                    </div>
                                  </div>
                                  {selectedDemande.commentaire && (
                                    <div className="col-span-2">
                                      <label className="text-sm font-medium">Commentaire</label>
                                      <p className="text-sm text-muted-foreground mt-1">{selectedDemande.commentaire}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {demande.status === 'En attente' && (
  <>
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="bg-green-600 hover:bg-green-700"
          disabled={actionLoading === demande.id}
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer l'acceptation</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir accepter cette demande ? 
            Cela créera automatiquement l'entreprise et le compte administrateur.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSelectedDemande(null)}>Annuler</Button>
          <Button 
            onClick={() => handleAccept(demande)}
            disabled={actionLoading === demande.id}
            className="bg-green-600 hover:bg-green-700"
          >
            {actionLoading === demande.id ? "Traitement..." : "Accepter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50"
          disabled={actionLoading === demande.id}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer le refus</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir refuser cette demande ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSelectedDemande(null)}>Annuler</Button>
          <Button 
            variant="destructive"
            onClick={() => handleReject(demande)}
            disabled={actionLoading === demande.id}
          >
            {actionLoading === demande.id ? "Traitement..." : "Refuser"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  )}
  
