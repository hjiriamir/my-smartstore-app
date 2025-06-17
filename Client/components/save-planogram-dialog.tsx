"use client"

import { useState, useEffect } from "react"
import { Grid } from "lucide-react"
import { useTranslation } from "react-i18next"
import i18next from "i18next"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Interface pour les magasins
interface Magasin {
  magasin_id: string
  nom_magasin: string
  adresse?: string
}

interface User {
  id: number
  username: string
  email: string
  role: string
  idUtilisateur?: number
}

// Interface pour les zones
interface Zone {
  zone_id: string
  nom_zone: string
  magasin_id: string
}

// Interface pour les types de meubles
interface FurnitureType {
  furniture_type_id: number
  nomType: string
  description?: string
  nombreFaces?: number
}

export function SavePlanogramDialog({ planogramConfig, cells, products, productInstances, onSave, children }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [name, setName] = useState(planogramConfig.name)
  const [description, setDescription] = useState("")
  const [magasins, setMagasins] = useState<Magasin[]>([])
  const [selectedMagasinId, setSelectedMagasinId] = useState<string>("")
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZoneId, setSelectedZoneId] = useState<string>("")
  const [furnitureTypes, setFurnitureTypes] = useState<FurnitureType[]>([])
  const [selectedFurnitureTypeId, setSelectedFurnitureTypeId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingZones, setIsLoadingZones] = useState(false)
  const [isLoadingFurnitureTypes, setIsLoadingFurnitureTypes] = useState(false)

  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [selectedTaskType, setSelectedTaskType] = useState<string>("mise_en_place")
  const [selectedPlanogramStatus, setSelectedPlanogramStatus] = useState<string>("en cours")
  const taskTypes = [
    { value: "mise_en_place", label: "Mise en place" },
    { value: "controle", label: "Contrôle" },
    { value: "audit", label: "Audit" },
    { value: "reapprovisionnement", label: "Réapprovisionnement" },
    { value: "nettoyage", label: "Nettoyage" },
    { value: "formation", label: "Formation" },
    { value: "promotion", label: "Promotion" },
    { value: "maintenance", label: "Maintenance" },
    { value: "remplacement_produit", label: "Remplacement produit" },
    { value: "inspection", label: "Inspection" },
    { value: "autre", label: "Autre" },
  ]
  const planogramStatusOptions = [
    { value: "actif", label: "Actif" },
    { value: "inactif", label: "Inactif" },
    { value: "en cours", label: "En cours" },
  ]
  const isArabic = i18next.language === "ar"

  const [currentUser, setCurrentUser] = useState<User | null>(null)

  //useEffect pour récupérer l'utilisateur connecté
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/auth/me", {
          credentials: "include", // nécessaire pour envoyer les cookies d'authentification
        })
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        const responseData = await response.json()
        console.log("Réponse complète de l'API /me:", responseData)

        // Extraire l'utilisateur de la réponse
        const userData = responseData.user || responseData
        setCurrentUser(userData)
        console.log("Utilisateur connecté:", userData)
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error)
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les informations de l'utilisateur",
          variant: "destructive",
        })
      }
    }

    fetchCurrentUser()
  }, [toast])

  const placedProductsCount = cells.filter((cell) => cell.instanceId !== null).length

  // Charger la liste des magasins au chargement du composant
  useEffect(() => {
    const fetchMagasins = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("http://localhost:8081/api/magasins/getAllMagasins")
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        const data = await response.json()
        setMagasins(data)

        // Si des magasins sont disponibles, sélectionner le premier par défaut
        if (data.length > 0) {
          setSelectedMagasinId(data[0].magasin_id)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des magasins:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des magasins",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMagasins()
  }, [toast])

  // Charger les zones quand un magasin est sélectionné
  useEffect(() => {
    if (selectedMagasinId) {
      const fetchZones = async () => {
        setIsLoadingZones(true)
        try {
          const response = await fetch(`http://localhost:8081/api/zones/getZonesMagasin/${selectedMagasinId}`)
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`)
          }
          const data = await response.json()
          setZones(data)

          // Réinitialiser la sélection de zone
          setSelectedZoneId("")
        } catch (error) {
          console.error("Erreur lors du chargement des zones:", error)
          toast({
            title: "Erreur",
            description: "Impossible de charger la liste des zones pour ce magasin",
            variant: "destructive",
          })
        } finally {
          setIsLoadingZones(false)
        }
      }

      fetchZones()
    } else {
      setZones([])
      setSelectedZoneId("")
    }
  }, [selectedMagasinId, toast])

  // Charger les types de meubles
  useEffect(() => {
    const fetchFurnitureTypes = async () => {
      setIsLoadingFurnitureTypes(true)
      try {
        const response = await fetch("http://localhost:8081/api/furnitureType/getAllFurnitureTypes")
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        const data = await response.json()
        setFurnitureTypes(data)

        // Sélectionner le type de meuble par défaut si disponible
        if (data.length > 0) {
          setSelectedFurnitureTypeId(data[0].furniture_type_id)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des types de meubles:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des types de meubles",
          variant: "destructive",
        })
      } finally {
        setIsLoadingFurnitureTypes(false)
      }
    }

    fetchFurnitureTypes()
  }, [toast])

  // Charger les utilisateurs quand un magasin est sélectionné
  useEffect(() => {
    if (selectedMagasinId) {
      const fetchUsers = async () => {
        setIsLoadingUsers(true)
        try {
          const response = await fetch(`http://localhost:8081/api/auth1/users/store/${selectedMagasinId}`)
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`)
          }
          const data = await response.json()
          setUsers(data)

          // Réinitialiser la sélection d'utilisateur
          setSelectedUserId(null)
        } catch (error) {
          console.error("Erreur lors du chargement des utilisateurs:", error)
          toast({
            title: "Erreur",
            description: "Impossible de charger la liste des utilisateurs pour ce magasin",
            variant: "destructive",
          })
        } finally {
          setIsLoadingUsers(false)
        }
      }

      fetchUsers()
    } else {
      setUsers([])
      setSelectedUserId(null)
    }
  }, [selectedMagasinId, toast])

  // Helper function to determine the side based on position for shelves display
  const getSideFromPosition = (x, totalColumns) => {
    // Diviser en 4 sections égales pour les 4 faces
    const sectionWidth = totalColumns / 4

    if (x < sectionWidth) {
      return "left"
    } else if (x < sectionWidth * 2) {
      return "front"
    } else if (x < sectionWidth * 3) {
      return "back"
    } else {
      return "right"
    }
  }

  const handleSave = async () => {
    // Validate required fields before sending
    if (!selectedMagasinId || !selectedZoneId || !name || !currentUser) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Construire les positions de produits à partir des cellules
      const productPositions = cells
        .filter((cell) => cell.instanceId !== null)
        .map((cell) => {
          const productInstance = productInstances.find((pi) => pi.instanceId === cell.instanceId)
          const product = productInstance ? products.find((p) => p.primary_id === productInstance.productId) : null

          if (!product) return null

          // Déterminer la face correcte selon le type de meuble et la position
          let face = "front" // valeur par défaut

          if (planogramConfig.furnitureType === "gondola") {
            // Pour gondola : front si colonne < moitié, back sinon
            face = cell.x < planogramConfig.columns / 2 ? "front" : "back"
          } else if (planogramConfig.furnitureType === "shelves-display") {
            // Pour shelves-display : utiliser la face directement depuis la cellule si disponible
            // Sinon, calculer basé sur la position
            if (cell.face) {
              face = cell.face
            } else if (cell.side) {
              face = cell.side
            } else {
              // Logique de fallback basée sur la position
              const totalColumns = planogramConfig.columns
              const quarterWidth = totalColumns / 4

              if (cell.x < quarterWidth) {
                face = "left"
              } else if (cell.x < quarterWidth * 2) {
                face = "front"
              } else if (cell.x < quarterWidth * 3) {
                face = "back"
              } else {
                face = "right"
              }
            }
          }
          // Pour planogram simple face, garder "front"

          console.log(
            `Produit ${product.primary_id} - Position: (${cell.x}, ${cell.y}) - Face: ${face} - Qty: ${cell.quantity || 1}`,
          )

          return {
            product_id: product.primary_id,
            face: face,
            etagere: cell.y + 1, // +1 car les étagères commencent à 1
            colonne: cell.x + 1, // +1 car les colonnes commencent à 1
            quantite: cell.quantity || 1,
          }
        })
        .filter(Boolean) // Supprimer les éléments null

      // Vérifier s'il y a des doublons
      const uniquePositions = new Set()
      const duplicates = []

      productPositions.forEach((pos, index) => {
        const key = `${pos.product_id}-${pos.face}-${pos.etagere}-${pos.colonne}`
        if (uniquePositions.has(key)) {
          duplicates.push({ index, position: pos, key })
        } else {
          uniquePositions.add(key)
        }
      })

      if (duplicates.length > 0) {
        console.warn("Doublons détectés:", duplicates)
      }

      console.log("Product positions finales à envoyer:", productPositions)
      console.log(`Nombre de positions: ${productPositions.length}`)

      // Obtenir la configuration du meuble
      const furnitureConfig = getFurnitureConfiguration()

      // Construire l'objet furniture selon le type
      const furniture = {
        furniture_type_id: Number.parseInt(selectedFurnitureTypeId),
        largeur: planogramConfig.furnitureDimensions.width,
        hauteur: planogramConfig.furnitureDimensions.height,
        profondeur: planogramConfig.furnitureDimensions.depth,
        productPositions: productPositions,
      }

      // Ajouter les propriétés spécifiques selon le type de meuble
      if (planogramConfig.furnitureType === "planogram") {
        furniture.nb_colonnes_unique_face = planogramConfig.columns
        furniture.nb_etageres_unique_face = planogramConfig.rows
      } else if (planogramConfig.furnitureType === "gondola") {
        furniture.nb_colonnes_front_back = planogramConfig.columns
        furniture.nb_etageres_front_back = planogramConfig.rows
      } else if (planogramConfig.furnitureType === "shelves-display") {
        // Pour shelves-display 4 faces, utiliser les mêmes propriétés que dans l'exemple Postman

        // Récupérer les détails du shelves-display
        const shelvesDetails = planogramConfig.shelvesDisplayDetails || {}

        // Propriétés pour les faces gauche/droite
        furniture.nb_colonnes_left_right = shelvesDetails.nb_colonnes_left_right || 1
        furniture.nb_etageres_left_right = shelvesDetails.nb_etageres_left_right || planogramConfig.rows

        // Propriétés pour les faces avant/arrière (utiliser la même structure que Postman)
        furniture.nb_colonnes_front_back = shelvesDetails.nbre_colonnes_front || 3
        furniture.nb_etageres_front_back = planogramConfig.rows

        console.log("Configuration du meuble shelves-display:", furniture)
      }

      // Construire l'objet requestBody
      const requestBody = {
        magasin_id: selectedMagasinId,
        zone_id: selectedZoneId,
        nom: name,
        description: description || `Planogramme créé le ${new Date().toLocaleDateString()}`,
        created_by: currentUser.id || currentUser.idUtilisateur,
        statut: selectedPlanogramStatus,
        furnitures: [furniture],
        tache: selectedUserId
          ? {
              idUser: selectedUserId,
              statut: "à faire",
              date_debut: new Date().toISOString(),
              date_fin_prevue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 jours
              type: selectedTaskType,
              commentaire: `Tâche liée au planogramme ${name}`,
            }
          : null,
      }

      console.log("RequestBody à envoyer:", JSON.stringify(requestBody, null, 2))

      const response = await fetch("http://localhost:8081/api/planogram/createFullPlanogram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || "Erreur inconnue")
      }

      toast({
        title: "Succès",
        description: `Planogramme créé avec succès (ID: ${data.planogram_id})`,
        variant: "default",
      })

      // Handle success (refresh list, redirect, etc.)
      if (onSave) onSave(data.planogram_id)
    } catch (error) {
      console.error("Erreur lors de la création du planogramme:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création du planogramme",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fonctions utilitaires
  function getFaceFromPosition(x: number): string {
    if (planogramConfig.furnitureType === "shelves-display") {
      return getSideFromPosition(x, planogramConfig.columns)
    }
    return planogramConfig.furnitureType === "gondola" ? (x < planogramConfig.columns / 2 ? "front" : "back") : "front"
  }

  function getFurnitureConfiguration() {
    switch (planogramConfig.furnitureType) {
      case "planogram":
        return planogramConfig.planogramDetails
      case "gondola":
        return planogramConfig.gondolaDetails
      case "shelves-display":
        return planogramConfig.shelvesDisplayDetails
      default:
        return {}
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={`sm:max-w-[500px] max-h-[90vh] overflow-hidden ${isArabic ? "text-right rtl" : ""}`}>
        <DialogHeader>
          <DialogTitle>{t("savePlanogramDialog.title")}</DialogTitle>
          <DialogDescription>{t("savePlanogramDialog.description")}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-150px)] pr-2">
          <div className="space-y-4 mt-4">
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">{t("savePlanogramDialog.nameLabel")}</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  placeholder={t("savePlanogramDialog.namePlaceholder")}
                  dir={isArabic ? "rtl" : "ltr"}
                />
              </div>

              <div>
                <label className="text-sm font-medium">{t("savePlanogramDialog.descriptionLabel")}</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  placeholder={t("savePlanogramDialog.descriptionPlaceholder")}
                  dir={isArabic ? "rtl" : "ltr"}
                />
              </div>

              {/* Sélection du statut du planogramme */}
              <div>
                <label className="text-sm font-medium">Statut du planogramme</label>
                <Select value={selectedPlanogramStatus} onValueChange={setSelectedPlanogramStatus}>
                  <SelectTrigger className="mt-1" dir={isArabic ? "rtl" : "ltr"}>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {planogramStatusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sélection du magasin */}
              <div>
                <label className="text-sm font-medium">Magasin</label>
                <Select
                  value={selectedMagasinId}
                  onValueChange={setSelectedMagasinId}
                  disabled={isLoading || magasins.length === 0}
                >
                  <SelectTrigger className="mt-1" dir={isArabic ? "rtl" : "ltr"}>
                    <SelectValue placeholder="Sélectionner un magasin" />
                  </SelectTrigger>
                  <SelectContent>
                    {magasins.map((magasin) => (
                      <SelectItem key={magasin.magasin_id} value={magasin.magasin_id}>
                        {magasin.magasin_id} : {magasin.nom_magasin}
                      </SelectItem>
                    ))}
                    {magasins.length === 0 && !isLoading && (
                      <SelectItem value="no-stores" disabled>
                        Aucun magasin disponible
                      </SelectItem>
                    )}
                    {isLoading && (
                      <SelectItem value="loading" disabled>
                        Chargement...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Sélection de la zone */}
              <div>
                <label className="text-sm font-medium">Zone</label>
                <Select
                  value={selectedZoneId}
                  onValueChange={setSelectedZoneId}
                  disabled={isLoadingZones || !selectedMagasinId || zones.length === 0}
                >
                  <SelectTrigger className="mt-1" dir={isArabic ? "rtl" : "ltr"}>
                    <SelectValue
                      placeholder={selectedMagasinId ? "Sélectionner une zone" : "Sélectionnez d'abord un magasin"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.zone_id} value={zone.zone_id}>
                        {zone.nom_zone}
                      </SelectItem>
                    ))}
                    {zones.length === 0 && !isLoadingZones && selectedMagasinId && (
                      <SelectItem value="no-zones" disabled>
                        Aucune zone disponible pour ce magasin
                      </SelectItem>
                    )}
                    {isLoadingZones && (
                      <SelectItem value="loading-zones" disabled>
                        Chargement des zones...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {/* Sélection de l'utilisateur */}
              <div>
                <label className="text-sm font-medium">Utilisateur</label>
                <Select
                  value={selectedUserId?.toString() || ""}
                  onValueChange={(value) => setSelectedUserId(value ? Number.parseInt(value) : null)}
                  disabled={isLoadingUsers || !selectedMagasinId || users.length === 0}
                >
                  <SelectTrigger className="mt-1" dir={isArabic ? "rtl" : "ltr"}>
                    <SelectValue
                      placeholder={
                        selectedMagasinId ? "Sélectionner un utilisateur" : "Sélectionnez d'abord un magasin"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username} ({user.email}) - {user.role}
                      </SelectItem>
                    ))}
                    {users.length === 0 && !isLoadingUsers && selectedMagasinId && (
                      <SelectItem value="no-users" disabled>
                        Aucun utilisateur disponible pour ce magasin
                      </SelectItem>
                    )}
                    {isLoadingUsers && (
                      <SelectItem value="loading-users" disabled>
                        Chargement des utilisateurs...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {/* Sélection du type de meuble */}
              <div>
                <label className="text-sm font-medium">Type de meuble</label>
                <Select
                  value={selectedFurnitureTypeId}
                  onValueChange={setSelectedFurnitureTypeId}
                  disabled={isLoadingFurnitureTypes || furnitureTypes.length === 0}
                >
                  <SelectTrigger className="mt-1" dir={isArabic ? "rtl" : "ltr"}>
                    <SelectValue placeholder="Sélectionner un type de meuble" />
                  </SelectTrigger>
                  <SelectContent>
                    {furnitureTypes.map((type) => (
                      <SelectItem key={type.furniture_type_id} value={type.furniture_type_id}>
                        {type.nomType} Nb_Faces : {type.nombreFaces}
                      </SelectItem>
                    ))}
                    {furnitureTypes.length === 0 && !isLoadingFurnitureTypes && (
                      <SelectItem value="no-types" disabled>
                        Aucun type de meuble disponible
                      </SelectItem>
                    )}
                    {isLoadingFurnitureTypes && (
                      <SelectItem value="loading-types" disabled>
                        Chargement des types...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {/* Sélection du type de tâche */}
              <div>
                <label className="text-sm font-medium">Type de tâche</label>
                <Select value={selectedTaskType} onValueChange={setSelectedTaskType}>
                  <SelectTrigger className="mt-1" dir={isArabic ? "rtl" : "ltr"}>
                    <SelectValue placeholder="Sélectionner un type de tâche" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("savePlanogramDialog.previewLabel")}</label>
                <Card className="p-4 bg-muted/20">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-muted/30 rounded-md flex items-center justify-center">
                      <Grid className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium">{name || t("savePlanogramDialog.unnamed")}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t("savePlanogramDialog.dimensions", {
                          rows: planogramConfig.rows,
                          columns: planogramConfig.columns,
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("savePlanogramDialog.placedProducts", { count: placedProductsCount })}
                      </p>
                      {/* Display the number of products with quantities greater than 1 */}
                      <p className="text-sm text-muted-foreground">
                        {t("savePlanogramDialog.multipleQuantityProducts", {
                          count: cells.filter((cell) => cell.instanceId !== null && (cell.quantity || 1) > 1).length,
                        })}
                      </p>
                      {/* Afficher le magasin sélectionné */}
                      {selectedMagasinId && (
                        <p className="text-sm text-muted-foreground">
                          Magasin: {magasins.find((m) => m.magasin_id === selectedMagasinId)?.nom_magasin || ""}
                        </p>
                      )}
                      {/* Afficher la zone sélectionnée */}
                      {selectedZoneId && (
                        <p className="text-sm text-muted-foreground">
                          Zone: {zones.find((z) => z.zone_id === selectedZoneId)?.nom_zone || ""}
                        </p>
                      )}
                      {/* Afficher le type de meuble sélectionné */}
                      {selectedFurnitureTypeId && (
                        <p className="text-sm text-muted-foreground">
                          Type de meuble:{" "}
                          {furnitureTypes.find((ft) => ft.furniture_type_id === selectedFurnitureTypeId)?.nomType || ""}
                          &nbsp;|&nbsp; Nombre des faces:{" "}
                          {furnitureTypes.find((ft) => ft.furniture_type_id === selectedFurnitureTypeId)?.nombreFaces ||
                            ""}
                        </p>
                      )}
                      {/* Affichage des détails spécifiques */}
                      {planogramConfig.furnitureType === "planogram" && planogramConfig.planogramDetails && (
                        <div className="text-xs text-blue-600 mt-1">
                          <p>
                            Planogram: {planogramConfig.planogramDetails.nbre_colonnes} col ×{" "}
                            {planogramConfig.planogramDetails.nbre_etageres} étag
                          </p>
                        </div>
                      )}

                      {planogramConfig.furnitureType === "gondola" && planogramConfig.gondolaDetails && (
                        <div className="text-xs text-green-600 mt-1">
                          <p>
                            Gondola - Avant: {planogramConfig.gondolaDetails.nbre_colonnes_front} col ×{" "}
                            {planogramConfig.gondolaDetails.nbre_etageres_front} étag
                          </p>
                          <p>
                            Gondola - Arrière: {planogramConfig.gondolaDetails.nbre_colonnes_back} col ×{" "}
                            {planogramConfig.gondolaDetails.nbre_etageres_back} étag
                          </p>
                        </div>
                      )}

                      {planogramConfig.furnitureType === "shelves-display" && planogramConfig.shelvesDisplayDetails && (
                        <div className="text-xs text-purple-600 mt-1">
                          <p>
                            Avant/Arrière: {planogramConfig.shelvesDisplayDetails.nbre_colonnes_front}/
                            {planogramConfig.shelvesDisplayDetails.nbre_colonnes_back} col × {planogramConfig.rows} étag
                          </p>
                          <p>
                            Gauche/Droite: {planogramConfig.shelvesDisplayDetails.nb_colonnes_left_right} col ×{" "}
                            {planogramConfig.shelvesDisplayDetails.nb_etageres_left_right} étag
                          </p>
                        </div>
                      )}

                      {/* Affichage des dimensions du meuble */}
                      <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded">
                        <p className="font-semibold mb-1">Dimensions du meuble :</p>
                        <div className="flex justify-between">
                          <span>Largeur: {planogramConfig.furnitureDimensions.width}m</span>
                          <span>Hauteur: {planogramConfig.furnitureDimensions.height}m</span>
                          <span>Profondeur: {planogramConfig.furnitureDimensions.depth}m</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Base: {planogramConfig.furnitureDimensions.baseHeight}m</span>
                          <span>Épaisseur étagère: {planogramConfig.furnitureDimensions.shelfThickness}m</span>
                        </div>
                      </div>

                      {/* Nouvelle section pour afficher les détails des produits placés */}
                      {placedProductsCount > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                          <h5 className="text-xs font-semibold text-gray-700 mb-2">Produits placés :</h5>
                          <div className="space-y-1">
                            {cells
                              .filter(
                                (cell) =>
                                  cell.instanceId !== null && cell.furnitureType === planogramConfig.furnitureType,
                              )
                              .map((cell, index) => {
                                const productInstance = productInstances.find((pi) => pi.instanceId === cell.instanceId)
                                const product = productInstance
                                  ? products.find((p) => p.primary_id === productInstance.productId)
                                  : null

                                if (!product) return null

                                return (
                                  <div key={index} className="text-xs text-gray-600 border-b border-gray-200 pb-1">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <span className="font-medium text-gray-800">{product.name}</span>
                                        <span className="text-gray-500 ml-1">({product.primary_id})</span>
                                      </div>
                                      <div className="text-right text-xs">
                                        <div>Qty: {cell.quantity || 1}</div>
                                      </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                      <span>Étagère: {cell.etagere || cell.y + 1}</span>
                                      <span>Colonne: {cell.colonne || cell.x + 1}</span>
                                      <span>Face: {cell.face || cell.side || "front"}</span>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          <DialogFooter className={isArabic ? "justify-start" : "justify-end"}>
            <DialogClose asChild>
              <Button variant="outline">{t("cancel")}</Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              disabled={!selectedMagasinId || !selectedZoneId || !selectedFurnitureTypeId || isLoading}
            >
              {t("save")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
