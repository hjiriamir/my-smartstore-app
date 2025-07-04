"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { useToast } from "@/hooks/use-toast"
import { useProductStore } from "@/lib/product-store"
import { Bot, ExternalLink, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import type { ImportedPlanogram } from "@/components/types/furniture-types"
import { FURNITURE_TYPE_MAPPING } from "@/lib/furniture-utils"

interface AIGenerationDialogProps {
  onImport: (data: ImportedPlanogram) => void
}

export function AIGenerationDialog({ onImport }: AIGenerationDialogProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"ai" | "import">("ai")

  // États pour l'importation JSON
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewData, setPreviewData] = useState<ImportedPlanogram | null>(null)
  const [validationResults, setValidationResults] = useState<{
    furniture: { found: boolean; type: string }[]
    products: { found: boolean; id: string }[]
  } | null>(null)

  // Ajouter ces nouveaux états après les états existants
  const [savedPlanogramData, setSavedPlanogramData] = useState<ImportedPlanogram | null>(null)

  const { products } = useProductStore()

  // États pour la sélection de meubles
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null)
  const [generatedFurnitureIds, setGeneratedFurnitureIds] = useState<Set<string>>(new Set())

  // Charger les meubles déjà générés depuis localStorage
  // Modifier l'useEffect pour charger aussi les données du planogramme
  useEffect(() => {
    const savedGeneratedIds = localStorage.getItem("generatedFurnitureIds")
    if (savedGeneratedIds) {
      setGeneratedFurnitureIds(new Set(JSON.parse(savedGeneratedIds)))
    }

    // Charger les données du planogramme sauvegardé
    const savedPlanogram = localStorage.getItem("savedPlanogramData")
    if (savedPlanogram) {
      try {
        const planogramData = JSON.parse(savedPlanogram)
        setSavedPlanogramData(planogramData)
        setPreviewData(planogramData)

        // Recalculer les validations
        const furnitureValidation = planogramData.furniture.map((furniture) => ({
          found: !!FURNITURE_TYPE_MAPPING[furniture.furniture_type_name],
          type: furniture.furniture_type_name,
        }))

        const productValidation = planogramData.product_positions.map((position) => ({
          found: products.some((p) => p.primary_id === position.produit_id),
          id: position.produit_id,
        }))

        setValidationResults({
          furniture: furnitureValidation,
          products: productValidation,
        })
      } catch (error) {
        console.error("Erreur lors du chargement des données sauvegardées:", error)
      }
    }
  }, [products])

  // Sauvegarder les meubles générés dans localStorage
  const saveGeneratedFurnitureId = (furnitureId: string) => {
    const newGeneratedIds = new Set([...generatedFurnitureIds, furnitureId])
    setGeneratedFurnitureIds(newGeneratedIds)
    localStorage.setItem("generatedFurnitureIds", JSON.stringify([...newGeneratedIds]))
  }

  // Fonction pour ouvrir l'interface IA dans une nouvelle fenêtre
  const openAIInterface = () => {
    const aiWindow = window.open(
      "http://localhost:8501",
      "ai-furniture-generator",
      "width=1400,height=900,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no",
    )

    if (!aiWindow) {
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir l'interface IA. Vérifiez que les popups sont autorisés.",
        variant: "destructive",
      })
      return
    }

    // Optionnel: Écouter les messages de la fenêtre IA
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "http://localhost:8501") return

      // Si l'IA envoie des données de planogramme
      if (event.data.type === "planogram_generated") {
        try {
          onImport(event.data.planogram)
          aiWindow.close()
          setIsOpen(false)
          toast({
            title: "Succès",
            description: "Planogramme généré par IA importé avec succès!",
            variant: "default",
          })
        } catch (error) {
          console.error("Erreur lors de l'importation depuis l'IA:", error)
          toast({
            title: "Erreur",
            description: "Erreur lors de l'importation du planogramme généré par IA",
            variant: "destructive",
          })
        }
      }
    }

    window.addEventListener("message", handleMessage)

    // Nettoyer l'écouteur quand la fenêtre se ferme
    const checkClosed = setInterval(() => {
      if (aiWindow.closed) {
        window.removeEventListener("message", handleMessage)
        clearInterval(checkClosed)
      }
    }, 1000)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/json") {
      setSelectedFile(file)
      parseAndValidateFile(file)
    } else {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier JSON valide",
        variant: "destructive",
      })
    }
  }

  // Modifier la fonction parseAndValidateFile pour sauvegarder les données
  const parseAndValidateFile = async (file: File) => {
    setIsLoading(true)
    try {
      const text = await file.text()
      const data: ImportedPlanogram = JSON.parse(text)

      if (!data.planogram_info || !data.furniture || !data.product_positions) {
        throw new Error("Structure JSON invalide")
      }

      setPreviewData(data)
      setSavedPlanogramData(data)

      // Sauvegarder dans localStorage
      localStorage.setItem("savedPlanogramData", JSON.stringify(data))

      const furnitureValidation = data.furniture.map((furniture) => ({
        found: !!FURNITURE_TYPE_MAPPING[furniture.furniture_type_name],
        type: furniture.furniture_type_name,
      }))

      const productValidation = data.product_positions.map((position) => ({
        found: products.some((p) => p.primary_id === position.produit_id),
        id: position.produit_id,
      }))

      setValidationResults({
        furniture: furnitureValidation,
        products: productValidation,
      })
    } catch (error) {
      console.error("Erreur lors du parsing:", error)
      toast({
        title: "Erreur",
        description: "Fichier JSON invalide ou structure incorrecte",
        variant: "destructive",
      })
      setSelectedFile(null)
      setPreviewData(null)
      setValidationResults(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Ajouter une fonction pour effacer les données sauvegardées
  const clearSavedData = () => {
    localStorage.removeItem("savedPlanogramData")
    localStorage.removeItem("generatedFurnitureIds")
    setSavedPlanogramData(null)
    setPreviewData(null)
    setValidationResults(null)
    setGeneratedFurnitureIds(new Set())
    setSelectedFurnitureId(null)
    toast({
      title: "Données effacées",
      description: "Toutes les données sauvegardées ont été supprimées",
    })
  }

  // Fonction modifiée pour l'importation avec sélection
  // Modifier handleImportFromFile pour utiliser les données sauvegardées
  const handleImportFromFile = () => {
    const dataToUse = previewData || savedPlanogramData
    if (dataToUse && selectedFurnitureId) {
      // Créer un nouveau planogramme avec seulement le meuble sélectionné
      const selectedFurniture = dataToUse.furniture.find((f) => f.furniture_id === selectedFurnitureId)
      if (!selectedFurniture) {
        toast({
          title: "Erreur",
          description: "Meuble sélectionné non trouvé",
          variant: "destructive",
        })
        return
      }

      // Filtrer les positions pour ce meuble uniquement
      const selectedPositions = dataToUse.product_positions.filter((pos) => pos.furniture_id === selectedFurnitureId)

      const modifiedPlanogram: ImportedPlanogram = {
        ...dataToUse,
        furniture: [selectedFurniture],
        product_positions: selectedPositions,
      }

      onImport(modifiedPlanogram)

      // Marquer ce meuble comme généré
      saveGeneratedFurnitureId(selectedFurnitureId)

      setIsOpen(false)
      setSelectedFurnitureId(null)
      setActiveTab("ai") // Reset to AI tab
    }
  }

  // Modifier la condition canImport pour utiliser les données sauvegardées aussi
  const canImport =
    (previewData || savedPlanogramData) &&
    validationResults &&
    selectedFurnitureId &&
    validationResults.furniture.some((f) => f.found) &&
    validationResults.products.some((p) => p.found)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Bot className="h-4 w-4 mr-2" />
          Générer furniture par IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Génération de meuble par IA</DialogTitle>
          <DialogDescription>
            Utilisez l'intelligence artificielle pour générer automatiquement des configurations de meubles ou importez
            un fichier JSON existant
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "ai" | "import")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Génération IA
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import JSON
            </TabsTrigger>
          </TabsList>

          {/* Modifier la section TabsContent value="import" pour afficher les données sauvegardées même sans fichier sélectionné */}
          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="text-center space-y-4">
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <Bot className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Interface de génération IA</h3>
                <p className="text-gray-600 mb-4">
                  Cliquez sur le bouton ci-dessous pour ouvrir l'interface de génération de meubles par intelligence
                  artificielle. L'IA vous aidera à créer des configurations optimales basées sur vos critères.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">• Génération automatique de planogrammes</p>
                  <p className="text-sm text-gray-500">• Optimisation basée sur les données de vente</p>
                  <p className="text-sm text-gray-500">• Suggestions de placement intelligent</p>
                </div>
              </div>
              <Button onClick={openAIInterface} size="lg" className="w-full">
                <ExternalLink className="h-5 w-5 mr-2" />
                Ouvrir l'interface IA
              </Button>
              <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">Note:</span>
                </div>
                <p className="mt-1">
                  L'interface IA s'ouvrira dans une nouvelle fenêtre. Assurez-vous que les popups sont autorisés dans
                  votre navigateur. Une fois la génération terminée, les données seront automatiquement importées dans
                  l'éditeur.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* File selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Fichier JSON</label>
                <div className="flex items-center space-x-2">
                  <Input type="file" accept=".json" onChange={handleFileSelect} className="flex-1" />
                  {selectedFile && (
                    <div className="flex items-center text-sm text-green-600">
                      <FileText className="h-4 w-4 mr-1" />
                      {selectedFile.name}
                    </div>
                  )}
                  {savedPlanogramData && (
                    <Button variant="outline" size="sm" onClick={clearSavedData}>
                      Effacer données
                    </Button>
                  )}
                </div>

                {/* Message informatif si des données sont sauvegardées */}
                {savedPlanogramData && !selectedFile && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Données précédemment importées disponibles</span>
                    </div>
                    <div className="text-xs mt-1">
                      Planogramme: {savedPlanogramData.planogram_info.nom_planogram} |
                      {savedPlanogramData.furniture.length} meuble(s) |{generatedFurnitureIds.size} déjà généré(s)
                    </div>
                  </div>
                )}
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">Analyse du fichier...</div>
                </div>
              )}

              {/* Preview and validation - Afficher même avec des données sauvegardées */}
              {(previewData || savedPlanogramData) && validationResults && (
                <div className="space-y-4">
                  {/* Planogram info */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Informations du planogramme</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>ID: {(previewData || savedPlanogramData)?.planogram_info.planogram_id}</div>
                        <div>Nom: {(previewData || savedPlanogramData)?.planogram_info.nom_planogram}</div>
                        <div>Magasin: {(previewData || savedPlanogramData)?.planogram_info.magasin_id}</div>
                        <div>Catégorie: {(previewData || savedPlanogramData)?.planogram_info.categorie_id}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Furniture selection */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">
                        Sélectionner un meuble ({(previewData || savedPlanogramData)?.furniture.length})
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(previewData || savedPlanogramData)?.furniture.map((furniture, index) => {
                          const isGenerated = generatedFurnitureIds.has(furniture.furniture_id)
                          const isSelected = selectedFurnitureId === furniture.furniture_id
                          const furnitureValidation = validationResults.furniture[index]

                          return (
                            <div
                              key={furniture.furniture_id}
                              className={`
                                p-3 border rounded-md cursor-pointer transition-all
                                ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                                ${isGenerated ? "bg-green-50 border-green-300" : ""}
                                ${!furnitureValidation.found ? "opacity-50" : ""}
                                hover:border-blue-300
                              `}
                              onClick={() => {
                                if (furnitureValidation.found) {
                                  setSelectedFurnitureId(isSelected ? null : furniture.furniture_id)
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-3 h-3 rounded-full border-2 ${
                                        isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                                      }`}
                                    ></div>
                                    <span className="font-medium text-sm">{furniture.furniture_type_name}</span>
                                    {isGenerated && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                        Déjà généré
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 ml-5">
                                    ID: {furniture.furniture_id} | {furniture.nb_etageres_unique_face}×
                                    {furniture.nb_colonnes_unique_face} | {furniture.largeur}×{furniture.hauteur}×
                                    {furniture.profondeur}cm
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  {furnitureValidation.found ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <span
                                    className={`ml-1 text-xs ${furnitureValidation.found ? "text-green-600" : "text-red-600"}`}
                                  >
                                    {furnitureValidation.found ? "Compatible" : "Non compatible"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {selectedFurnitureId && (
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="text-sm text-blue-800">
                            <strong>Meuble sélectionné:</strong>{" "}
                            {
                              (previewData || savedPlanogramData)?.furniture.find(
                                (f) => f.furniture_id === selectedFurnitureId,
                              )?.furniture_type_name
                            }
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            {
                              (previewData || savedPlanogramData)?.product_positions.filter(
                                (p) => p.furniture_id === selectedFurnitureId,
                              ).length
                            }{" "}
                            produits associés
                          </div>
                        </div>
                      )}

                      {(previewData || savedPlanogramData)?.furniture.length > 0 && !selectedFurnitureId && (
                        <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200">
                          Veuillez sélectionner un meuble pour continuer l'importation
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Products validation */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">
                        Produits ({(previewData || savedPlanogramData)?.product_positions.length})
                      </h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {validationResults.products.map((result, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="truncate">{result.id}</span>
                            <div className="flex items-center">
                              {result.found ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className={`ml-1 ${result.found ? "text-green-600" : "text-red-600"}`}>
                                {result.found ? "Trouvé" : "Non trouvé"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {validationResults.products.filter((p) => p.found).length} / {validationResults.products.length}{" "}
                        produits trouvés
                      </div>
                    </CardContent>
                  </Card>

                  {/* Warnings */}
                  {!canImport && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                        <span className="text-sm text-yellow-800">
                          Aucun meuble ou produit compatible trouvé. Vérifiez votre bibliothèque.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <DialogClose asChild>
            <Button variant="outline">Fermer</Button>
          </DialogClose>
          {activeTab === "import" && (
            <Button onClick={handleImportFromFile} disabled={!canImport || isLoading || !selectedFurnitureId}>
              {selectedFurnitureId ? "Importer le meuble sélectionné" : "Sélectionner un meuble"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
