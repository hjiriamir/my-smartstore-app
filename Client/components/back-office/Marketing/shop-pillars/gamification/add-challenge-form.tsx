"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { Challenge, Magasin } from "@/lib/gamification"
import { useToast } from "@/hooks/use-toast"

interface AddChallengeFormProps {
  onChallengeAdded: (challenge: Challenge) => void
  stores: Magasin[]
  initialSelectedMagasinId: string | null
}

export function AddChallengeForm({ onChallengeAdded, stores, initialSelectedMagasinId }: AddChallengeFormProps) {
  const { toast } = useToast()
  const [nom, setNom] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("")
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")
  const [recompense, setRecompense] = useState("")
  const [selectedMagasinId, setSelectedMagasinId] = useState<string>(initialSelectedMagasinId || "")
  const [isLoading, setIsLoading] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!nom || !description || !type || !dateDebut || !dateFin || !recompense || !selectedMagasinId) {
      toast({
        variant: "destructive",
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs, y compris le magasin associé.",
      })
      return
    }

    const startDateObj = new Date(dateDebut)
    const endDateObj = new Date(dateFin)

    if (startDateObj >= endDateObj) {
      toast({
        variant: "destructive",
        title: "Dates invalides",
        description: "La date de fin doit être postérieure à la date de début.",
      })
      return
    }

    setIsLoading(true)
    try {
      // Format dates to ISO 8601 for the API
      const formattedDateDebut = new Date(dateDebut + "T00:00:00Z").toISOString()
      const formattedDateFin = new Date(dateFin + "T23:59:59Z").toISOString()

      // Trouver le magasin sélectionné pour obtenir son ID numérique
      const selectedStore = stores.find((store) => store.magasin_id === selectedMagasinId)
      if (!selectedStore) {
        toast({
          variant: "destructive",
          title: "Magasin invalide",
          description: "Magasin sélectionné introuvable. Veuillez sélectionner un magasin valide.",
        })
        setIsLoading(false)
        return
      }

      const challengeData = {
        magasin_id: selectedStore.magasin_id,
        nom,
        description,
        type,
        date_debut: formattedDateDebut,
        date_fin: formattedDateFin,
        recompense,
      }

      const response = await fetch(`${API_BASE_URL}/gamification/challenges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add Authorization header if needed
          // Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(challengeData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de l'ajout du challenge.")
      }

      const addedChallenge: Challenge = await response.json()
      onChallengeAdded(addedChallenge)

      // Show success toast
      toast({
        variant: "success",
        title: "🎯 Challenge créé !",
        description: `Le challenge "${nom}" a été ajouté avec succès.`,
      })

      // Reset form
      setNom("")
      setDescription("")
      setType("")
      setDateDebut("")
      setDateFin("")
      setRecompense("")
      setSelectedMagasinId(initialSelectedMagasinId || "")
    } catch (err: any) {
      console.error("Error adding challenge:", err)
      toast({
        variant: "destructive",
        title: "Erreur de création",
        description: err.message || "Une erreur est survenue lors de l'ajout du challenge.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Ajouter un Nouveau Challenge</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Créez un nouveau défi pour vos clients.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="challenge-magasin">Magasin Associé</Label>
            <Select value={selectedMagasinId} onValueChange={setSelectedMagasinId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un magasin" />
              </SelectTrigger>
              <SelectContent>
                {stores.length === 0 ? (
                  <SelectItem value="no-stores" disabled>
                    Aucun magasin disponible
                  </SelectItem>
                ) : (
                  stores.map((store) => (
                    <SelectItem key={store.magasin_id} value={store.magasin_id}>
                      {store.nom_magasin}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="challenge-nom">Nom du Challenge</Label>
            <Input
              id="challenge-nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Chasse au Trésor de Pâques"
            />
          </div>
          <div>
            <Label htmlFor="challenge-description">Description</Label>
            <Textarea
              id="challenge-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le challenge en quelques mots."
            />
          </div>
          <div>
            <Label htmlFor="challenge-type">Type de Challenge</Label>
            <Select value={type} onValueChange={(value) => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chasse_tresor">Chasse au Trésor</SelectItem>
                <SelectItem value="points">Points</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="mission">Mission</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="challenge-date-debut">Date de Début</Label>
              <Input
                type="date"
                id="challenge-date-debut"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="challenge-date-fin">Date de Fin</Label>
              <Input type="date" id="challenge-date-fin" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="challenge-recompense">Récompense</Label>
            <Input
              id="challenge-recompense"
              value={recompense}
              onChange={(e) => setRecompense(e.target.value)}
              placeholder="Ex: Bon d'achat de 10€"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ajouter le Challenge"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
