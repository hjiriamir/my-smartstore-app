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
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"

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

  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  // Classes RTL optimisées
  const rtlClasses = {
    container: isRTL ? "rtl" : "ltr",
    textAlign: isRTL ? "text-right" : "text-left",
    textAlignOpposite: isRTL ? "text-left" : "text-right",
    flexRow: isRTL ? "flex-row-reverse" : "flex-row",
    flexRowReverse: isRTL ? "flex-row" : "flex-row-reverse",
    marginLeft: isRTL ? "mr-2" : "ml-2",
    marginRight: isRTL ? "ml-2" : "mr-2",
    paddingLeft: isRTL ? "pr-3" : "pl-3",
    paddingRight: isRTL ? "pl-3" : "pr-3",
    borderLeft: isRTL ? "border-r" : "border-l",
    borderRight: isRTL ? "border-l" : "border-r",
    roundedLeft: isRTL ? "rounded-r" : "rounded-l",
    roundedRight: isRTL ? "rounded-l" : "rounded-r",
    spaceX: isRTL ? "space-x-reverse space-x-4" : "space-x-4",
    directionClass: isRTL ? "flex-row-reverse" : "flex-row",
    inputPadding: isRTL ? "pr-4 pl-10" : "pl-4 pr-10",
    buttonSpacing: isRTL ? "space-x-reverse space-x-2" : "space-x-2",
    gridFlow: isRTL ? "grid-flow-col-dense" : "",
    justifyBetween: "justify-between",
    itemsCenter: "items-center",
    formSpacing: "space-y-4",
    cardPadding: "p-4",
    labelSpacing: "mb-2",
    selectTrigger: isRTL ? "text-right" : "text-left",
    textareaAlign: isRTL ? "text-right" : "text-left",
    buttonContent: isRTL ? "flex-row-reverse" : "flex-row",
  }

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
    <div className={rtlClasses.container} dir={textDirection}>
      <Card>
        <CardHeader className={`${rtlClasses.textAlign} ${rtlClasses.cardPadding}`}>
          <CardTitle className={`text-lg sm:text-xl ${rtlClasses.textAlign}`}>
            {t("marketing.pilliersMagasins.gamification.gestion.ajouterClient")}
          </CardTitle>
          <CardDescription className={`text-xs sm:text-sm ${rtlClasses.textAlign}`}>
            {t("marketing.pilliersMagasins.gamification.gestion.masqueClient")}
          </CardDescription>
        </CardHeader>
        <CardContent className={rtlClasses.cardPadding}>
          <form onSubmit={handleSubmit} className={rtlClasses.formSpacing}>
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${rtlClasses.gridFlow}`}>
              <div>
                <Label htmlFor="client-nom" className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}>
                  {t("marketing.pilliersMagasins.gamification.gestion.nom")}
                </Label>
                <Input
                  id="client-nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder={t("marketing.pilliersMagasins.gamification.gestion.nomPlaceholder")}
                  className={rtlClasses.textAlign}
                  dir={textDirection}
                />
              </div>
              <div>
                <Label htmlFor="client-prenom" className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}>
                  {t("marketing.pilliersMagasins.gamification.gestion.prenom")}
                </Label>
                <Input
                  id="client-prenom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder={t("marketing.pilliersMagasins.gamification.gestion.prenom")}
                  className={rtlClasses.textAlign}
                  dir={textDirection}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="client-email" className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}>
                {t("marketing.pilliersMagasins.gamification.gestion.email")}
              </Label>
              <Input
                type="email"
                id="client-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("marketing.pilliersMagasins.gamification.gestion.emailPlaceholder")}
                className={rtlClasses.textAlign}
                dir={textDirection}
              />
            </div>

            <div>
              <Label htmlFor="client-telephone" className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}>
                {t("marketing.pilliersMagasins.gamification.gestion.telephone")}
              </Label>
              <Input
                type="tel"
                id="client-telephone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder={t("marketing.pilliersMagasins.gamification.gestion.telephonePlaceholder")}
                className={rtlClasses.textAlign}
                dir={textDirection}
              />
            </div>

            <div>
              <Label htmlFor="client-adresse" className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}>
                {t("marketing.pilliersMagasins.gamification.gestion.adresse")}
              </Label>
              <Input
                id="client-adresse"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder={t("marketing.pilliersMagasins.gamification.gestion.adressePlaceholder")}
                className={rtlClasses.textAlign}
                dir={textDirection}
              />
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${rtlClasses.gridFlow}`}>
              <div>
                <Label htmlFor="client-ville" className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}>
                  {t("marketing.pilliersMagasins.gamification.gestion.ville")}
                </Label>
                <Input
                  id="client-ville"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  placeholder={t("marketing.pilliersMagasins.gamification.gestion.ville")}
                  className={rtlClasses.textAlign}
                  dir={textDirection}
                />
              </div>
              <div>
                <Label htmlFor="client-pays" className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}>
                  {t("marketing.pilliersMagasins.gamification.gestion.pays")}
                </Label>
                <Input
                  id="client-pays"
                  value={pays}
                  onChange={(e) => setPays(e.target.value)}
                  placeholder={t("marketing.pilliersMagasins.gamification.gestion.pays")}
                  className={rtlClasses.textAlign}
                  dir={textDirection}
                />
              </div>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${rtlClasses.gridFlow}`}>
              <div>
                <Label
                  htmlFor="client-date-naissance"
                  className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}
                >
                  {t("marketing.pilliersMagasins.gamification.gestion.dateNaissance")}
                </Label>
                <Input
                  type="date"
                  id="client-date-naissance"
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                  className={rtlClasses.textAlign}
                  dir={textDirection}
                />
              </div>
              <div>
                <Label htmlFor="client-genre" className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}>
                  {t("marketing.pilliersMagasins.gamification.gestion.genre")}
                </Label>
                <Select value={genre} onValueChange={(value) => setGenre(value)}>
                  <SelectTrigger className={rtlClasses.selectTrigger}>
                    <SelectValue placeholder="Sélectionner un genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homme">{t("marketing.pilliersMagasins.gamification.gestion.homme")}</SelectItem>
                    <SelectItem value="femme">{t("marketing.pilliersMagasins.gamification.gestion.femme")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full flex ${rtlClasses.buttonContent} ${rtlClasses.itemsCenter} ${rtlClasses.justifyBetween}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className={`flex ${rtlClasses.buttonContent} ${rtlClasses.itemsCenter} gap-2`}>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("marketing.pilliersMagasins.gamification.gestion.ajoutClientButton")}</span>
                </div>
              ) : (
                t("marketing.pilliersMagasins.gamification.gestion.ajoutClientButton")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
