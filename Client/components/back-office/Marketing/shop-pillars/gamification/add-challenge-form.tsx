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
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"

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
    <div className={rtlClasses.container} dir={textDirection}>
      <Card>
        <CardHeader className={`${rtlClasses.textAlign} ${rtlClasses.cardPadding}`}>
          <CardTitle className={`text-lg sm:text-xl ${rtlClasses.textAlign}`}>
            {t("marketing.pilliersMagasins.gamification.gestion.creerChallenge")}
          </CardTitle>
          <CardDescription className={`text-xs sm:text-sm ${rtlClasses.textAlign}`}>
            {t("marketing.pilliersMagasins.gamification.gestion.creerChallengeDescr")}
          </CardDescription>
        </CardHeader>
        <CardContent className={rtlClasses.cardPadding}>
          <form onSubmit={handleSubmit} className={rtlClasses.formSpacing}>
            <div>
              <Label htmlFor="challenge-magasin" className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}>
                {t("marketing.pilliersMagasins.gamification.gestion.magasinAssocier")}
              </Label>
              <Select value={selectedMagasinId} onValueChange={setSelectedMagasinId}>
                <SelectTrigger className={rtlClasses.selectTrigger}>
                  <SelectValue placeholder="Sélectionner un magasin" />
                </SelectTrigger>
                <SelectContent>
                  {stores.length === 0 ? (
                    <SelectItem value="no-stores" disabled>
                      {t("marketing.pilliersMagasins.gamification.gestion.aucunMagasin")}
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
              <Label htmlFor="challenge-nom" className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}>
                {t("marketing.pilliersMagasins.gamification.gestion.nomChallenge")}
              </Label>
              <Input
                id="challenge-nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder={t("marketing.pilliersMagasins.gamification.gestion.nomChallengePlaceholder")}
                className={rtlClasses.textAlign}
                dir={textDirection}
              />
            </div>

            <div>
              <Label
                htmlFor="challenge-description"
                className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}
              >
                {t("marketing.pilliersMagasins.gamification.gestion.desription")}
              </Label>
              <Textarea
                id="challenge-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("marketing.pilliersMagasins.gamification.gestion.descriptionPlaceholder")}
                className={`${rtlClasses.textareaAlign} min-h-[80px]`}
                dir={textDirection}
              />
            </div>

            <div>
              <Label htmlFor="challenge-type" className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}>
                {t("marketing.pilliersMagasins.gamification.gestion.typeChallenge")}
              </Label>
              <Select value={type} onValueChange={(value) => setType(value)}>
                <SelectTrigger className={rtlClasses.selectTrigger}>
                  <SelectValue
                    placeholder={t("marketing.pilliersMagasins.gamification.gestion.typeChallengePlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chasse_tresor">
                    {t("marketing.pilliersMagasins.gamification.gestion.chase")}
                  </SelectItem>
                  <SelectItem value="points">{t("marketing.pilliersMagasins.gamification.gestion.points")}</SelectItem>
                  <SelectItem value="quiz">{t("marketing.pilliersMagasins.gamification.gestion.quiz")}</SelectItem>
                  <SelectItem value="mission">
                    {t("marketing.pilliersMagasins.gamification.gestion.mission")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${rtlClasses.gridFlow}`}>
              <div>
                <Label
                  htmlFor="challenge-date-debut"
                  className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}
                >
                  {t("marketing.pilliersMagasins.gamification.gestion.dateDebur")}
                </Label>
                <Input
                  type="date"
                  id="challenge-date-debut"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className={rtlClasses.textAlign}
                  dir={textDirection}
                />
              </div>
              <div>
                <Label
                  htmlFor="challenge-date-fin"
                  className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}
                >
                  {t("marketing.pilliersMagasins.gamification.gestion.dateFin")}
                </Label>
                <Input
                  type="date"
                  id="challenge-date-fin"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className={rtlClasses.textAlign}
                  dir={textDirection}
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="challenge-recompense"
                className={`block ${rtlClasses.textAlign} ${rtlClasses.labelSpacing}`}
              >
                {t("marketing.pilliersMagasins.gamification.gestion.recompense")}
              </Label>
              <Input
                id="challenge-recompense"
                value={recompense}
                onChange={(e) => setRecompense(e.target.value)}
                placeholder={t("marketing.pilliersMagasins.gamification.gestion.recompensePlaceholder")}
                className={rtlClasses.textAlign}
                dir={textDirection}
              />
            </div>

            <Button
              type="submit"
              className={`w-full flex ${rtlClasses.buttonContent} ${rtlClasses.itemsCenter} ${rtlClasses.justifyBetween}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className={`flex ${rtlClasses.buttonContent} ${rtlClasses.itemsCenter} gap-2`}>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("marketing.pilliersMagasins.gamification.gestion.ajoutChallengeButton")}</span>
                </div>
              ) : (
                t("marketing.pilliersMagasins.gamification.gestion.ajoutChallengeButton")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
