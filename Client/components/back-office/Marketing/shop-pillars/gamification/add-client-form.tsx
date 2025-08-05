"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { Client } from "@/lib/gamification"
import { useToast } from "@/hooks/use-toast"

interface AddClientFormProps {
  onClientAdded: (client: Client) => void
  entrepriseId: string | null // Passed from parent
}

export function AddClientForm({ onClientAdded, entrepriseId }: AddClientFormProps) {
  const { toast } = useToast()
  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [email, setEmail] = useState("")
  const [telephone, setTelephone] = useState("")
  const [adresse, setAdresse] = useState("")
  const [ville, setVille] = useState("")
  const [pays, setPays] = useState("")
  const [dateNaissance, setDateNaissance] = useState("")
  const [genre, setGenre] = useState("homme")
  const [isLoading, setIsLoading] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!entrepriseId) {
      toast({
        variant: "destructive",
        title: "Entreprise manquante",
        description: "ID d'entreprise manquant. Impossible d'ajouter le client.",
      })
      return
    }

    // Basic validation
    if (!nom || !prenom || !email || !telephone || !adresse || !ville || !pays || !dateNaissance || !genre) {
      toast({
        variant: "destructive",
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
      })
      return
    }

    setIsLoading(true)
    try {
      // Generate a simple unique client code
      const generatedCodeClient = `CL-${Date.now()}-${Math.floor(Math.random() * 1000)}`

      const clientData = {
        code_client: generatedCodeClient,
        nom,
        prenom,
        email,
        telephone,
        adresse,
        ville,
        entreprise_id: Number(entrepriseId), // Ensure it's a number
        pays,
        date_naissance: dateNaissance, // YYYY-MM-DD
        genre,
        date_creation: new Date().toISOString(), // ISO 8601
      }

      const response = await fetch(`${API_BASE_URL}/client/createClient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add Authorization header if needed
          // Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(clientData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de l'ajout du client.")
      }

      const addedClient: Client = await response.json()
      onClientAdded(addedClient)

      // Show success toast
      toast({
        variant: "success",
        title: "👤 Client ajouté !",
        description: `${prenom} ${nom} a été ajouté avec succès.`,
      })

      // Reset form
      setNom("")
      setPrenom("")
      setEmail("")
      setTelephone("")
      setAdresse("")
      setVille("")
      setPays("")
      setDateNaissance("")
      setGenre("homme")
    } catch (err: any) {
      console.error("Error adding client:", err)
      toast({
        variant: "destructive",
        title: "Erreur d'ajout",
        description: err.message || "Une erreur est survenue lors de l'ajout du client.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Ajouter un Nouveau Client</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Enregistrez un nouveau client pour la gamification.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client-nom">Nom</Label>
              <Input
                id="client-nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom de famille"
              />
            </div>
            <div>
              <Label htmlFor="client-prenom">Prénom</Label>
              <Input
                id="client-prenom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Prénom"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="client-email">Email</Label>
            <Input
              type="email"
              id="client-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <Label htmlFor="client-telephone">Téléphone</Label>
            <Input
              type="tel"
              id="client-telephone"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="06XXXXXXXX"
            />
          </div>
          <div>
            <Label htmlFor="client-adresse">Adresse</Label>
            <Input
              id="client-adresse"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="123 Rue de l'Exemple"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client-ville">Ville</Label>
              <Input id="client-ville" value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ville" />
            </div>
            <div>
              <Label htmlFor="client-pays">Pays</Label>
              <Input id="client-pays" value={pays} onChange={(e) => setPays(e.target.value)} placeholder="Pays" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client-date-naissance">Date de Naissance</Label>
              <Input
                type="date"
                id="client-date-naissance"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="client-genre">Genre</Label>
              <Select value={genre} onValueChange={(value) => setGenre(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homme">Homme</SelectItem>
                  <SelectItem value="femme">Femme</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ajouter le Client"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
