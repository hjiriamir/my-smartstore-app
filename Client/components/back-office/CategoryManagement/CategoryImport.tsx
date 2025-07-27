"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import Papa from "papaparse"
import { FileSpreadsheet, CheckCircle2, AlertCircle, ChevronRight, ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import "@/components/multilingue/i18n.js"
import "./CardsPage.css"

interface CategoryData {
  categorie_id: string
  nom: string
  parent_id?: string
  niveau?: number
  saisonnalite?: string
  priorite?: number
  zone_exposition_preferee?: string
  temperature_exposition?: string
  conditionnement?: string
  clientele_ciblee?: string
  magasin_id?: string
  date_creation?: string
  date_modification?: string
}

interface NewCategoryForm {
  categorie_id: string
  nom: string
  parent_id?: string
  niveau?: string
  saisonnalite?: string
  priorite?: string
  zone_exposition_preferee?: string
  temperature_exposition?: string
  conditionnement?: string
  clientele_ciblee?: string
  magasin_id?: string
  date_creation?: string
}

interface CategoryImportProps {
  importedMagasins: any[]
  onCategoriesImported?: (categories: any[]) => void
  existingData: CategoryData[] // Ajouter cette prop
  isComplete: boolean
}

export function CategoryImport({
  importedMagasins,
  onCategoriesImported,
  existingData = [],
  isComplete,
}: CategoryImportProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(isComplete ? 5 : 1)
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<CategoryData[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [importProgress, setImportProgress] = useState<number>(0)
  const [rawData, setRawData] = useState<any[]>([])
  const [importedCategories, setImportedCategories] = useState<CategoryData[]>(existingData)
  const [existingCategories, setExistingCategories] = useState<CategoryData[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showAddForm, setShowAddForm] = useState(true)

  const niveauOptions = [
    { value: "1", label: "Catégorie" },
    { value: "2", label: "Sous-catégorie" },
    { value: "3", label: "Sous-sous-catégorie" },
  ]

  const prioriteOptions = [
    { value: "1", label: "Basse" },
    { value: "2", label: "Moyenne" },
    { value: "3", label: "Haute" },
  ]
  const [newCategory, setNewCategory] = useState<NewCategoryForm>({
    categorie_id: "",
    nom: "",
    parent_id: "",
    niveau: "",
    saisonnalite: "",
    priorite: "",
    zone_exposition_preferee: "",
    temperature_exposition: "",
    conditionnement: "",
    clientele_ciblee: "",
    magasin_id: "",
    date_creation: "",
  })
  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewCategory((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddCategory = () => {
    // Validation simple
    if (!newCategory.categorie_id || !newCategory.nom) {
      toast({
        title: "Erreur",
        description: "L'ID et le nom de la catégorie sont obligatoires",
        variant: "destructive",
      })
      return
    }

    // Obtenir la date et heure actuelles au format ISO
    const now = new Date().toISOString()

    // Convertir les valeurs pour correspondre au type CategoryData
    const categoryToAdd: CategoryData = {
      categorie_id: newCategory.categorie_id,
      nom: newCategory.nom,
      parent_id: newCategory.parent_id || undefined,
      magasin_id: newCategory.magasin_id || undefined,
      niveau: newCategory.niveau ? Number.parseInt(newCategory.niveau) : undefined,
      saisonnalite: newCategory.saisonnalite || undefined,
      priorite: newCategory.priorite ? Number.parseInt(newCategory.priorite) : undefined,
      zone_exposition_preferee: newCategory.zone_exposition_preferee || undefined,
      temperature_exposition: newCategory.temperature_exposition || undefined,
      conditionnement: newCategory.conditionnement || undefined,
      clientele_ciblee: newCategory.clientele_ciblee || undefined,
      magasin_id: newCategory.magasin_id || undefined,
      date_creation: now,
    }

    // Ajouter à la liste des catégories importées
    const updatedCategories = [...importedCategories, categoryToAdd]
    setImportedCategories(updatedCategories)
    handleImport(updatedCategories)

    // Réinitialiser le formulaire
    setNewCategory({
      categorie_id: "",
      nom: "",
      parent_id: "",
      niveau: "",
      saisonnalite: "",
      priorite: "",
      zone_exposition_preferee: "",
      temperature_exposition: "",
      conditionnement: "",
      clientele_ciblee: "",
      magasin_id: newCategory.magasin_id || "",
      date_creation: "",
    })

    toast({
      title: "Succès",
      description: "La catégorie a été ajoutée avec succès",
      variant: "default",
    })
  }
  useEffect(() => {
    // Vérifier si les données existantes sont différentes avant de mettre à jour
    if (JSON.stringify(importedCategories) !== JSON.stringify(existingData)) {
      setImportedCategories(existingData)
    }

    // Passer à l'étape 5 seulement si les conditions sont remplies ET qu'on n'y est pas déjà
    if (isComplete && existingData.length > 0 && step !== 5) {
      setStep(5)
    }
  }, [existingData, isComplete, step])
  const handleImport = useCallback(
    (data: CategoryData[]) => {
      // Éviter les mises à jour inutiles
      if (JSON.stringify(importedCategories) !== JSON.stringify(data)) {
        setImportedCategories(data)
        if (onCategoriesImported) {
          onCategoriesImported(data)
        }
      }
    },
    [importedCategories, onCategoriesImported],
  )
  const getNiveauLabel = (value: number | undefined) => {
    if (!value) return "-"
    const option = niveauOptions.find((opt) => Number.parseInt(opt.value) === value)
    return option ? option.label : value
  }

  const getPrioriteLabel = (value: number | undefined) => {
    if (!value) return "-"
    const option = prioriteOptions.find((opt) => Number.parseInt(opt.value) === value)
    return option ? option.label : value
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseFile(selectedFile)
    }
  }
  // Fonction pour supprimer une catégorie
  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategories = importedCategories.filter((cat) => cat.categorie_id !== categoryId)
    setImportedCategories(updatedCategories)
    handleImport(updatedCategories)
    toast({
      title: "Succès",
      description: "Catégorie supprimée avec succès",
      variant: "default",
    })
  }
  // État pour la modification
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null)
  const [editField, setEditField] = useState<{ key: string; value: any } | null>(null)
  // Fonction pour démarrer la modification
  const handleStartEdit = (category: CategoryData) => {
    setEditingCategory(category)
  }
  // Fonction pour valider les modifications
  const handleSaveEdit = () => {
    if (!editingCategory || !editField) return
    const updatedCategories = importedCategories.map((cat) =>
      cat.categorie_id === editingCategory.categorie_id ? { ...cat, [editField.key]: editField.value } : cat,
    )
    setImportedCategories(updatedCategories)
    handleImport(updatedCategories)
    setEditingCategory(null)
    setEditField(null)

    toast({
      title: "Succès",
      description: "Catégorie modifiée avec succès",
      variant: "default",
    })
  }
  // Fonction pour gérer le double-clic sur un champ
  const handleFieldDoubleClick = (category: CategoryData, fieldName: string, value: any) => {
    if (editingCategory?.categorie_id === category.categorie_id) {
      setEditField({ key: fieldName, value })
    }
  }
  // Fonction pour annuler la modification
  const handleCancelEdit = () => {
    setEditingCategory(null)
    setEditField(null)
  }

  const parseFile = async (file: File) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase()

    const showFileError = (fileType: string, message: string) => {
      toast({
        title: `Erreur ${fileType}`,
        description: message,
        variant: "destructive",
      })
    }

    // Nouvelle fonction de décodage robuste
    const decodeText = async (buffer: ArrayBuffer): Promise<string> => {
      try {
        const encoding = detectEncoding(buffer)
        const decoder = new TextDecoder(encoding)
        return decoder.decode(buffer)
      } catch (error) {
        console.error("Erreur de décodage:", error)
        // Fallback: essayer UTF-8 puis windows-1252
        try {
          return new TextDecoder("UTF-8").decode(buffer)
        } catch {
          return new TextDecoder("windows-1252").decode(buffer)
        }
      }
    }

    if (fileExtension === "csv") {
      const buffer = await file.arrayBuffer()
      const decoder = new TextDecoder("windows-1252") // Forcer Windows-1252
      const fileContent = decoder.decode(buffer)

      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        delimitersToGuess: [",", ";", "\t", "|"],
        transform: (value) => {
          if (typeof value === "string") {
            return value.trim() // Nettoyage de base, l'encodage est déjà géré
          }
          return value
        },
        complete: (results) => {
          const processedData = results.data.map((row: any) => {
            const processedRow: any = {}
            for (const key in row) {
              processedRow[key] = row[key]
            }
            return processedRow
          })

          setRawData(processedData)
          handleParsedData(processedData as CategoryData[])
        },
        error: (error) => {
          toast({
            title: "Erreur CSV",
            description: error.message,
            variant: "destructive",
          })
        },
      })
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const data = e.target?.result
          if (!data) throw new Error("Aucune donnée de fichier")

          const buffer = data instanceof ArrayBuffer ? data : await file.arrayBuffer()
          const workbook = XLSX.read(buffer, {
            type: "array",
            codepage: 65001, // UTF-8
            cellText: true,
            cellDates: true,
            dense: true,
          })

          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]

          // Convertir en JSON en préservant les caractères spéciaux
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            defval: "",
            raw: false,
            dateNF: "YYYY-MM-DD",
            blankrows: false,
          }) as any[]

          // Traitement des valeurs
          const processedData = jsonData.map((row) => {
            const processedRow: any = {}
            for (const key in row) {
              processedRow[key] = cleanCellValue(row[key])
            }
            return processedRow
          })

          setRawData(processedData)
          handleParsedData(processedData as CategoryData[])
        } catch (error) {
          showFileError("Excel", error instanceof Error ? error.message : "Erreur inconnue")
        }
      }

      reader.onerror = () => showFileError("Fichier", "Erreur lors de la lecture du fichier")
      reader.readAsArrayBuffer(file)
    } else {
      showFileError("Format", "Seuls les fichiers CSV (UTF-8) ou Excel (.xlsx, .xls) sont acceptés")
    }
  }
  const detectEncoding = (buffer: ArrayBuffer): string => {
    // Vérifier le BOM UTF-8
    const view = new DataView(buffer)
    if (view.byteLength >= 3 && view.getUint8(0) === 0xef && view.getUint8(1) === 0xbb && view.getUint8(2) === 0xbf) {
      return "UTF-8"
    }

    // Analyse heuristique pour Windows-1252
    const bytes = new Uint8Array(buffer)
    let isProbablyWindows1252 = false

    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] > 0x7f && bytes[i] < 0xa0) {
        isProbablyWindows1252 = true
        break
      }
    }

    return isProbablyWindows1252 ? "windows-1252" : "UTF-8"
  }
  const cleanCellValue = (value: any): any => {
    if (value === null || value === undefined) return ""
    if (typeof value === "string") {
      return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim()
    }
    if (value instanceof Date) return value.toISOString().split("T")[0]
    if (typeof value === "number") return String(value)
    return value
  }
  const handleParsedData = (data: CategoryData[]) => {
    if (data.length === 0) {
      toast({
        title: "Fichier vide",
        description: "Le fichier importé ne contient aucune donnée.",
        variant: "destructive",
      })
      return
    }
    const filteredData = data.filter((row) => {
      return Object.values(row).some((value) => value !== undefined && value !== null && value !== "")
    })
    setParsedData(filteredData)
    const firstRow = data[0]
    const mapping: Record<string, string> = {}
    Object.keys(firstRow).forEach((column) => {
      const lowerColumn = column.toLowerCase().trim()
      if (lowerColumn.includes("categorie_id") || lowerColumn.includes("id")) {
        mapping[column] = "categorie_id"
      } else if (lowerColumn.includes("nom") || lowerColumn.includes("name")) {
        mapping[column] = "nom"
      } else if (lowerColumn.includes("parent_id") || lowerColumn.includes("parent")) {
        mapping[column] = "parent_id"
      } else if (lowerColumn.includes("niveau") || lowerColumn.includes("level")) {
        mapping[column] = "niveau"
      } else if (lowerColumn.includes("saisonnalite") || lowerColumn.includes("season")) {
        mapping[column] = "saisonnalite"
      } else if (lowerColumn.includes("priorite") || lowerColumn.includes("priority")) {
        mapping[column] = "priorite"
      } else if (lowerColumn.includes("zone_exposition") || lowerColumn.includes("exposition_zone")) {
        mapping[column] = "zone_exposition_preferee"
      } else if (lowerColumn.includes("temperature") || lowerColumn.includes("temp")) {
        mapping[column] = "temperature_exposition"
      } else if (lowerColumn.includes("conditionnement") || lowerColumn.includes("packaging")) {
        mapping[column] = "conditionnement"
      } else if (lowerColumn.includes("clientele") || lowerColumn.includes("target")) {
        mapping[column] = "clientele_ciblee"
      } else if (lowerColumn.includes("magasin_id") || lowerColumn.includes("store_id")) {
        mapping[column] = "magasin_id"
      } else if (lowerColumn.includes("date_creation") || lowerColumn.includes("created")) {
        mapping[column] = "date_creation"
      } else if (lowerColumn.includes("date_modification") || lowerColumn.includes("updated")) {
        mapping[column] = "date_modification"
      }
    })
    setColumnMapping(mapping)
    setStep(2)
  }
  const updateColumnMapping = (originalColumn: string, mappedColumn: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [originalColumn]: mappedColumn,
    }))
  }
  const validateData = () => {
    const errors: string[] = []
    if (!Object.values(columnMapping).includes("categorie_id")) {
      errors.push("L'identifiant de catégorie est requis")
    }
    if (!Object.values(columnMapping).includes("nom")) {
      errors.push("Le nom de la catégorie est requis")
    }
    parsedData.forEach((row, index) => {
      const idColumn = Object.entries(columnMapping).find(([_, value]) => value === "categorie_id")?.[0]
      const nameColumn = Object.entries(columnMapping).find(([_, value]) => value === "nom")?.[0]
      if (idColumn) {
        const idValue = row[idColumn]
        if (idValue === undefined || idValue === null || idValue === "") {
          errors.push(`Ligne ${index + 1}: Identifiant de catégorie manquant`)
        }
      }
      if (nameColumn) {
        const nameValue = row[nameColumn]
        if (nameValue === undefined || nameValue === null || nameValue === "") {
          errors.push(`Ligne ${index + 1}: Nom de catégorie manquant`)
        }
      }
    })
    setValidationErrors(errors)
    if (errors.length === 0) {
      setStep(3)
    }
  }
  const importCategories = () => {
    const validCategories = parsedData
      .map((row) => {
        const mappedCategory: CategoryData = {
          categorie_id: "",
          nom: "",
        }

        // Mappage correct des colonnes
        Object.entries(columnMapping).forEach(([originalCol, mappedCol]) => {
          if (mappedCol && row[originalCol] !== undefined && row[originalCol] !== null) {
            // Correction spéciale pour les IDs
            if (mappedCol === "categorie_id") {
              mappedCategory.categorie_id = String(row[originalCol])
            } else if (mappedCol === "parent_id") {
              mappedCategory.parent_id =
                row[originalCol] === "-" || row[originalCol] === "" ? undefined : String(row[originalCol])
            } else {
              mappedCategory[mappedCol as keyof CategoryData] = row[originalCol]
            }
          }
        })

        return mappedCategory
      })
      .filter((cat) => cat.categorie_id && cat.nom)

    // Fusionner avec les données existantes
    const mergedCategories = [...importedCategories, ...validCategories]
    handleImport(mergedCategories)

    setImportProgress(0)
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + 5
      })
    }, 100)
    console.log("Catégories à importer:", validCategories)
    setTimeout(() => {
      clearInterval(interval)
      setImportProgress(100)
      setTimeout(() => {
        setStep(4)
      }, 500)
    }, 1000)
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 md:px-6 lg:px-8" dir={textDirection}>
      <Button
        variant="outline"
        onClick={() => (window.location.href = "/management-page")}
        className={`flex items-center gap-2 mb-4 mt-10 md:mt-14 text-sm md:text-base ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("productImport.backToEditor1")}
      </Button>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">{t("productImport.title1")}</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Étape complétée ({importedCategories.length} catégories)
            {t("productImport.description1")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between mb-6 md:mb-8 gap-2">
            <div className="flex items-center space-x-1 md:space-x-2 text-sm md:text-base">
              <Badge variant={step >= 1 ? "default" : "outline"}>1</Badge>
              <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>{t("productImport.step1")}</span>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              <Badge variant={step >= 2 ? "default" : "outline"}>2</Badge>
              <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>{t("productImport.step2")}</span>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              <Badge variant={step >= 3 ? "default" : "outline"}>3</Badge>
              <span className={step >= 3 ? "font-medium" : "text-muted-foreground"}>{t("categoryImport.step3")}</span>
            </div>
          </div>
          {step === 1 && (
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-1 md:space-y-2">
                <h3 className="text-base md:text-lg font-medium"> {t("categoryImport.title")}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{t("categoryImport.description")}</p>
              </div>
              <div
                className={`
                  border-2 border-dashed rounded-lg p-6 md:p-12 text-center
                  ${file ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25"}
                  hover:border-primary/50 transition-colors cursor-pointer
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <FileSpreadsheet className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                    </div>
                    <p className="font-medium text-sm md:text-base">{file.name}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{parsedData.length} catégories détectées</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                        setParsedData([])
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }}
                    >
                      {t("productImport.fileStep.changeFile")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <FileSpreadsheet className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />
                    </div>
                    <p className="text-base md:text-lg font-medium">{t("productImport.fileStep.selectFile")}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{t("productImport.fileStep.dragDrop")}</p>
                  </div>
                )}
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {file && (
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} className="text-sm md:text-base">
                    Continuer
                  </Button>
                </div>
              )}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-1 md:space-y-2">
                <h3 className="text-base md:text-lg font-medium">{t("productImport.columnsStep.title")}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{t("productImport.columnsStep.description")}</p>
              </div>
              <div className="border rounded-md">
                <div className="grid grid-cols-2 gap-4 p-3 md:p-4 bg-muted/50 font-medium border-b text-sm">
                  <div>{t("productImport.columnsStep.fileColumn")}</div>
                  <div>{t("productImport.columnsStep.mappedField")}</div>
                </div>
                <ScrollArea className="h-[250px] md:h-[300px]">
                  <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                    {parsedData.length > 0 &&
                      Object.keys(parsedData[0]).map((column, index) => (
                        <div key={index} className="grid grid-cols-2 gap-4 items-center">
                          <div className="font-mono text-xs md:text-sm">{column}</div>
                          <select
                            className="w-full p-1.5 md:p-2 border rounded-md text-xs md:text-sm"
                            value={columnMapping[column] || ""}
                            onChange={(e) => updateColumnMapping(column, e.target.value)}
                          >
                            <option value="">-- {t("productImport.columnsStep.ignoreColumn")} --</option>
                            <option value="categorie_id">ID Catégorie</option>
                            <option value="nom">{t("categoryImport.headers.nom")}</option>
                            <option value="parent_id">{t("categoryImport.headers.parent_id")}</option>
                            <option value="niveau">{t("categoryImport.headers.niveau")}</option>
                            <option value="saisonnalite">{t("categoryImport.headers.saisonnalite")}</option>
                            <option value="priorite">{t("categoryImport.headers.priorite")}</option>
                            <option value="zone_exposition_preferee">
                              {t("categoryImport.headers.zone_exposition_preferee")}
                            </option>
                            <option value="temperature_exposition">
                              {t("categoryImport.headers.temperature_exposition")}
                            </option>
                            <option value="conditionnement">{t("categoryImport.headers.conditionnement")}</option>
                            <option value="clientele_ciblee">{t("categoryImport.headers.clientele_ciblee")}</option>
                            <option value="magasin_id">{t("categoryImport.headers.magasin_id")}</option>
                            <option value="date_creation">{t("categoryImport.headers.date_creation")}</option>
                            <option value="date_modification">{t("categoryImport.headers.date_modification")}</option>
                          </select>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </div>
              <div className="space-y-2 md:space-y-4">
                <h4 className="font-medium text-sm md:text-base">{t("productImport.columnsStep.previewTitle")}</h4>
                <div className="border rounded-md overflow-auto">
                  <ScrollArea className="h-[150px] md:h-[200px] w-full" orientation="horizontal">
                    <div className="p-3 md:p-4 min-w-max">
                      <table className={`w-full text-xs md:text-sm ${isRTL ? "rtl-table" : "ltr-table"}`}>
                        <thead className="border-b">
                          <tr>
                            {Object.values(columnMapping)
                              .filter(Boolean)
                              .map((mappedColumn, index) => (
                                <th
                                  key={index}
                                  className="p-2 text-left font-medium whitespace-nowrap"
                                  style={{
                                    textAlign: isRTL ? "right" : "left",
                                    direction: isRTL ? "rtl" : "ltr",
                                  }}
                                >
                                  {t(`categoryImport.headers.${mappedColumn}`)}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parsedData.slice(0, 5).map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b">
                              {Object.entries(columnMapping)
                                .filter(([_, mappedColumn]) => mappedColumn)
                                .map(([originalColumn, _], colIndex) => (
                                  <td key={colIndex} className="p-2 whitespace-nowrap">
                                    {row[originalColumn] !== undefined && row[originalColumn] !== null ? (
                                      <span className="font-mono">{String(row[originalColumn])}</span>
                                    ) : (
                                      ""
                                    )}
                                  </td>
                                ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {parsedData.length > 5 && (
                        <div className="p-2 text-center text-muted-foreground text-xs md:text-sm">
                          + {parsedData.length - 5} {t("categoryImport.columnsStep.otherCategories")}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm md:text-base">{t("categoryImport.validation.errors")}</AlertTitle>
                  <AlertDescription className="text-xs md:text-sm">
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {validationErrors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {validationErrors.length > 5 && <li>+ {validationErrors.length - 5} autres erreurs</li>}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="text-sm md:text-base">
                  {t("productImport.back")}
                </Button>
                <Button onClick={validateData} className="text-sm md:text-base">
                  {t("productImport.validateContinue")}
                </Button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-1 md:space-y-2">
                <h3 className="text-base md:text-lg font-medium">{t("categoryImport.importStep.title")}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{t("categoryImport.importStep.description")}</p>
              </div>
              <div className="space-y-2 md:space-y-4">
                <h4 className="font-medium text-sm md:text-base">{t("categoryImport.importStep.summary")}</h4>
                <div className="border rounded-md p-3 md:p-4">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {t("categoryImport.importStep.categoriesToImport")}
                  </p>
                  <p className="text-xl md:text-2xl font-bold">{parsedData.length}</p>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} className="text-sm md:text-base">
                  {t("productImport.back")}
                </Button>
                <Button onClick={importCategories} className="text-sm md:text-base">
                  {t("categoryImport.importCategories")}
                </Button>
              </div>
            </div>
          )}
          {step === 3 && importProgress > 0 && (
            <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-sm md:max-w-[400px]">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">{t("categoryImport.importProgress.title")}</CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    {t("categoryImport.importProgress.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-center text-xs md:text-sm">
                    {importProgress < 100
                      ? t("categoryImport.importProgress.processing")
                      : t("categoryImport.importProgress.complete")}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-center p-4 md:p-8">
                <div className="text-center space-y-3 md:space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 className="h-12 w-12 md:h-16 md:w-16 text-green-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-medium">{t("categoryImport.completeStep.title")}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {parsedData.length} {t("categoryImport.completeStep.categoriesImported")}
                  </p>
                </div>
              </div>
              <div className="flex justify-center gap-3 md:gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep(1)
                    setFile(null)
                    setParsedData([])
                    setColumnMapping({})
                    setValidationErrors([])
                    setImportProgress(0)
                  }}
                  className="text-sm md:text-base"
                >
                  {t("categoryImport.completeStep.importMore")}
                </Button>
                <Button onClick={() => setStep(5)} className="text-sm md:text-base">
                  {t("categoryImport.completeStep.viewCategories")}
                </Button>
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-1 md:space-y-2">
                <h3 className="text-base md:text-lg font-medium">{t("categoryImport.validCategoryImport")}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {t("categoryImport.importedCategoriesDescription")}
                </p>
              </div>
              {/* Bouton pour afficher/masquer le formulaire */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="mb-3 md:mb-4 text-sm md:text-base"
                >
                  {showAddForm ? t("magasinImport.hideFormulaire") : t("magasinImport.showFormulaire")}
                </Button>
              </div>
              {/* Nouveau formulaire d'ajout manuel */}
              {showAddForm && (
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">{t("categoryImport.formulaire.addCategorie")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div className="space-y-1 md:space-y-2">
                        <label className="text-xs md:text-sm font-medium">
                          {t("categoryImport.headers.categorie_id")}*
                        </label>
                        <Input
                          name="categorie_id"
                          value={newCategory.categorie_id}
                          onChange={handleNewCategoryChange}
                          placeholder={t("categoryImport.formulaire.idCategoriePlaceholder")}
                          required
                          className="text-sm md:text-base"
                        />
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <label className="text-xs md:text-sm font-medium">{t("categoryImport.headers.nom")}*</label>
                        <Input
                          name="nom"
                          value={newCategory.nom}
                          onChange={handleNewCategoryChange}
                          placeholder={t("categoryImport.formulaire.namePlaceholder")}
                          required
                          className="text-sm md:text-base"
                        />
                      </div>
                      <div className="space-y-1 md:space-y-2 md:col-span-2">
                        <label className="text-xs md:text-sm font-medium">
                          {t("magasinImport.headers.magasin_id")}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <select
                            name="magasin_id"
                            value={newCategory.magasin_id || ""}
                            onChange={handleNewCategoryChange}
                            className="w-full p-1.5 md:p-2 border rounded-md text-sm md:text-base"
                          >
                            <option value="">{t("categoryImport.formulaire.selectMagasin")}</option>
                            {importedMagasins.map((magasin) => (
                              <option key={magasin.magasin_id} value={magasin.magasin_id}>
                                {magasin.nom_magasin} ({t("productImport.id")}: {magasin.magasin_id})
                              </option>
                            ))}
                          </select>
                          <Input
                            name="magasin_id"
                            value={newCategory.magasin_id || ""}
                            onChange={handleNewCategoryChange}
                            placeholder={t("categoryImport.formulaire.orPutID")}
                            className="w-full text-sm md:text-base"
                          />
                        </div>
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <label className="text-xs md:text-sm font-medium">
                          {t("categoryImport.headers.parent_id")}
                        </label>
                        <select
                          name="parent_id"
                          value={newCategory.parent_id || ""}
                          onChange={handleNewCategoryChange}
                          className="w-full p-1.5 md:p-2 border rounded-md text-sm md:text-base"
                        >
                          <option value="">{t("categoryImport.formulaire.noParent")}</option>
                          {existingCategories && existingCategories.length > 0 ? (
                            existingCategories.map((category) => (
                              <option key={category.categorie_id} value={category.categorie_id}>
                                {category.nom} (ID: {category.categorie_id})
                              </option>
                            ))
                          ) : (
                            <option disabled>{t("categoryImport.formulaire.noCategorie")}</option>
                          )}
                        </select>
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <label className="text-xs md:text-sm font-medium">{t("categoryImport.headers.niveau")}</label>
                        <select
                          name="niveau"
                          value={newCategory.niveau}
                          onChange={handleNewCategoryChange}
                          className="w-full p-1.5 md:p-2 border rounded-md text-sm md:text-base"
                        >
                          <option value="">{t("categoryImport.formulaire.selectNiveau")}</option>
                          {niveauOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <label className="text-xs md:text-sm font-medium">{t("categoryImport.headers.priorite")}</label>
                        <select
                          name="priorite"
                          value={newCategory.priorite}
                          onChange={handleNewCategoryChange}
                          className="w-full p-1.5 md:p-2 border rounded-md text-sm md:text-base"
                        >
                          <option value="">{t("categoryImport.formulaire.selectPriorite")}</option>
                          {prioriteOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <label className="text-xs md:text-sm font-medium">
                          {t("categoryImport.formulaire.saisonnalite")}
                        </label>
                        <Input
                          name="saisonnalite"
                          value={newCategory.saisonnalite}
                          onChange={handleNewCategoryChange}
                          placeholder={t("categoryImport.formulaire.saisonnalite")}
                          className="text-sm md:text-base"
                        />
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <label className="text-xs md:text-sm font-medium">
                          {t("categoryImport.formulaire.zone_preferee")}
                        </label>
                        <Input
                          name="zone_exposition_preferee"
                          value={newCategory.zone_exposition_preferee}
                          onChange={handleNewCategoryChange}
                          placeholder={t("categoryImport.formulaire.zone_preferee_placeholder")}
                          className="text-sm md:text-base"
                        />
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <label className="text-xs md:text-sm font-medium">
                          {t("categoryImport.formulaire.temperature")}
                        </label>
                        <Input
                          name="temperature_exposition"
                          value={newCategory.temperature_exposition}
                          onChange={handleNewCategoryChange}
                          placeholder={t("categoryImport.formulaire.temperaturePlaceholder")}
                          className="text-sm md:text-base"
                        />
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <label className="text-xs md:text-sm font-medium">
                          {t("categoryImport.headers.conditionnement")}
                        </label>
                        <Input
                          name="conditionnement"
                          value={newCategory.conditionnement}
                          onChange={handleNewCategoryChange}
                          placeholder={t("categoryImport.headers.conditionnement")}
                          className="text-sm md:text-base"
                        />
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <label className="text-xs md:text-sm font-medium">
                          {t("categoryImport.formulaire.clinetel_cible")}
                        </label>
                        <Input
                          name="clientele_ciblee"
                          value={newCategory.clientele_ciblee}
                          onChange={handleNewCategoryChange}
                          placeholder={t("categoryImport.formulaire.clinetel_cible")}
                          className="text-sm md:text-base"
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddCategory} className="mt-3 md:mt-4 text-sm md:text-base">
                      {t("categoryImport.formulaire.addCategBoutton")}
                    </Button>
                  </CardContent>
                </Card>
              )}
              {/* Liste des catégories existantes */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm md:text-base">{t("categoryImport.validCategoryImport")}</h4>
                <div className="relative">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-xs md:text-sm" style={{ minWidth: "max-content" }}>
                      <thead className="border-b">
                        <tr>
                          <th className="p-2 text-left font-medium">{t("Tactions")}</th>
                          {Object.keys(importedCategories[0] || {}).map((key) => (
                            <th key={key} className="p-2 text-left font-medium">
                              {t(`categoryImport.headers.${key}`)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importedCategories.map((category, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            {/* Colonne Actions */}
                            <td className="p-2 flex flex-col sm:flex-row gap-1 sm:gap-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteCategory(category.categorie_id)}
                                className="text-xs md:text-sm"
                              >
                                {t("productImport.delete")}
                              </Button>
                              {editingCategory?.categorie_id === category.categorie_id ? (
                                <div className="flex gap-1 sm:gap-2">
                                  <Button size="sm" onClick={handleSaveEdit} className="text-xs md:text-sm">
                                    {t("magasinImport.valider1")}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    className="text-xs md:text-sm bg-transparent"
                                  >
                                    {t("cancel")}
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleStartEdit(category)}
                                  className="text-xs md:text-sm"
                                >
                                  {t("modifier")}
                                </Button>
                              )}
                            </td>
                            {/* Autres colonnes */}
                            {Object.entries(category).map(([key, value]) => (
                              <td key={key} className="p-2">
                                {editingCategory?.categorie_id === category.categorie_id && editField?.key === key ? (
                                  key === "niveau" || key === "priorite" ? (
                                    <select
                                      value={editField.value || ""}
                                      onChange={(e) => {
                                        const val = e.target.value ? Number.parseInt(e.target.value) : undefined
                                        setEditField({ key, value: val })
                                      }}
                                      className="w-full p-1.5 border rounded-md text-xs md:text-sm"
                                    >
                                      <option value="">-</option>
                                      {(key === "niveau" ? niveauOptions : prioriteOptions).map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <Input
                                      value={editField.value || ""}
                                      onChange={(e) => setEditField({ key, value: e.target.value })}
                                      className="text-xs md:text-sm"
                                    />
                                  )
                                ) : (
                                  <span onDoubleClick={() => handleFieldDoubleClick(category, key, value)}>
                                    {value === undefined || value === null || value === ""
                                      ? "-"
                                      : key === "niveau"
                                        ? getNiveauLabel(value as number)
                                        : key === "priorite"
                                          ? getPrioriteLabel(value as number)
                                          : key === "date_creation"
                                            ? new Date(value as string).toLocaleString()
                                            : String(value)}
                                  </span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => setStep(4)} className="text-sm md:text-base">
                  {t("productImport.retourGenerateur")}
                </Button>
                <Button onClick={() => (window.location.href = "/categories")} className="text-sm md:text-base">
                  {t("categoryImport.viewAllCategories")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
