"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import Papa from "papaparse"
import {
  FileSpreadsheet,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  FolderTree,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { useProductStore } from "@/lib/product-store"
import { CategoryManager } from "@/components/editor2D/category-manager"
import "@/components/multilingue/i18n.js"

interface ProductData {
  primary_id: string
  name: string
  supplier: string
  category_id?: string
  width?: number
  height?: number
  depth?: number
  category_name?: string // Ajouté automatiquement après matching
  [key: string]: any
}

interface Category {
  id: string
  categorie_id: string
  nom: string
  parent_id: string | null
  niveau: string
  saisonnalite: string
  priorite: string
  zone_exposition_preferee: string
  temperature_exposition: string
  clientele_ciblee: string
  magasin_id: string
  date_creation: string
  date_modification: string
  name?: string
  color?: string
  parentId?: string | null
  children?: Category[]
}

export function ProductImport() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const router = useRouter()
  const { toast } = useToast()
  const { addProducts, updateProductImage, products, categories, setActiveTab } = useProductStore()
  const [step, setStep] = useState<number>(1)
  const [file, setFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [parsedData, setParsedData] = useState<ProductData[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [importProgress, setImportProgress] = useState<number>(0)
  const [showCategoryManager, setShowCategoryManager] = useState<boolean>(false)
  const [rawData, setRawData] = useState<any[]>([])
  const [categoriesWithIds, setCategoriesWithIds] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const [categoryMatchingStats, setCategoryMatchingStats] = useState({
    matched: 0,
    unmatched: 0,
    total: 0,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Fonction pour récupérer les catégories depuis l'API
  const fetchCategories = async () => {
    setLoadingCategories(true)
    try {
      const response = await fetch(`${API_BASE_URL}/categories/getAllCategories`)
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des catégories")
      }
      const data = await response.json()
      // Transformer les données pour correspondre à l'interface Category
      const transformedCategories: Category[] = data.map((cat: any) => ({
        ...cat,
        name: cat.nom, // Mapper nom vers name pour compatibilité
        color: "#3B82F6", // Couleur par défaut
        parentId: cat.parent_id,
        children: [],
      }))
      setCategoriesWithIds(transformedCategories)
      toast({
        title: "Catégories chargées",
        description: `${transformedCategories.length} catégories ont été récupérées avec succès.`,
      })
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les catégories depuis l'API.",
        variant: "destructive",
      })
    } finally {
      setLoadingCategories(false)
    }
  }

  // Charger les catégories au montage du composant
  useEffect(() => {
    fetchCategories()
  }, [])

  // Handle file selection for product data
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseFile(selectedFile)
    }
  }

  // Parse Excel or CSV file
  const parseFile = (file: File) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    if (fileExtension === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setRawData(results.data)
          handleParsedData(results.data as ProductData[])
        },
        error: () => {
          toast({
            title: "Erreur de fichier",
            description: "Impossible de lire le fichier CSV. Vérifiez le format.",
            variant: "destructive",
          })
        },
      })
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: "binary" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as ProductData[]
          setRawData(jsonData)
          handleParsedData(jsonData)
        } catch (error) {
          toast({
            title: "Erreur de fichier",
            description: "Impossible de lire le fichier Excel. Vérifiez le format.",
            variant: "destructive",
          })
        }
      }
      reader.readAsBinaryString(file)
    } else {
      toast({
        title: "Format non supporté",
        description: "Veuillez importer un fichier CSV ou Excel (.xlsx, .xls)",
        variant: "destructive",
      })
    }
  }

  // Process the parsed data
  const handleParsedData = (data: ProductData[]) => {
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

    // Auto-detect columns avec les nouvelles colonnes simplifiées
    const firstRow = data[0]
    const mapping: Record<string, string> = {}
    Object.keys(firstRow).forEach((column) => {
      const lowerColumn = column.toLowerCase().trim()
      // Détection de l'ID primaire
      if (
        lowerColumn === "primary_id" ||
        lowerColumn === "primaryid" ||
        (lowerColumn.includes("id") &&
          (lowerColumn.includes("primary") ||
            lowerColumn.includes("principal") ||
            lowerColumn === "id" ||
            lowerColumn === "code" ||
            lowerColumn === "reference" ||
            lowerColumn === "ref" ||
            lowerColumn === "sku" ||
            lowerColumn === "article"))
      ) {
        mapping[column] = "primary_id"
      }
      // Détection du nom
      else if (
        lowerColumn === "name" ||
        lowerColumn.includes("nom") ||
        lowerColumn.includes("name") ||
        lowerColumn.includes("designation") ||
        lowerColumn.includes("produit") ||
        lowerColumn.includes("product") ||
        lowerColumn === "libelle" ||
        lowerColumn === "description"
      ) {
        mapping[column] = "name"
      }
      // Détection du fournisseur
      else if (
        lowerColumn === "supplier" ||
        lowerColumn.includes("fournisseur") ||
        lowerColumn.includes("supplier") ||
        lowerColumn.includes("vendor")
      ) {
        mapping[column] = "supplier"
      }
      // Détection de l'ID de catégorie (simplifié)
      else if (
        lowerColumn === "category_id" ||
        lowerColumn === "categoryid" ||
        lowerColumn.includes("category") ||
        lowerColumn.includes("categorie")
      ) {
        mapping[column] = "category_id"
      }
      // Détection des dimensions
      else if (
        lowerColumn === "width" ||
        lowerColumn.includes("larg") ||
        lowerColumn.includes("width") ||
        lowerColumn === "l"
      ) {
        mapping[column] = "width"
      } else if (
        lowerColumn === "height" ||
        lowerColumn.includes("haut") ||
        lowerColumn.includes("height") ||
        lowerColumn === "h"
      ) {
        mapping[column] = "height"
      } else if (
        lowerColumn === "depth" ||
        lowerColumn.includes("prof") ||
        lowerColumn.includes("depth") ||
        lowerColumn === "p"
      ) {
        mapping[column] = "depth"
      }
    })

    // Auto-mapping fallback
    if (!Object.values(mapping).includes("primary_id")) {
      const firstNumericColumn = Object.keys(firstRow).find(
        (column) =>
          typeof firstRow[column] === "number" ||
          (typeof firstRow[column] === "string" && !isNaN(Number(firstRow[column]))),
      )
      if (firstNumericColumn) {
        mapping[firstNumericColumn] = "primary_id"
      }
    }
    if (!Object.values(mapping).includes("name")) {
      const firstTextColumn = Object.keys(firstRow).find(
        (column) => typeof firstRow[column] === "string" && !Object.values(mapping).includes(column),
      )
      if (firstTextColumn) {
        mapping[firstTextColumn] = "name"
      }
    }
    setColumnMapping(mapping)
    setStep(2)
  }

  // Fonction pour trouver une catégorie par son ID
  const findCategoryById = (categoryId: string): Category | undefined => {
    return categoriesWithIds.find((cat) => cat.categorie_id === categoryId)
  }

  // Update column mapping
  const updateColumnMapping = (originalColumn: string, mappedColumn: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [originalColumn]: mappedColumn,
    }))
  }

  // Validate the data before import
  const validateData = () => {
    const errors: string[] = []
    if (!Object.values(columnMapping).includes("primary_id")) {
      errors.push("L'identifiant primaire (primary_id) est requis - veuillez sélectionner une colonne pour l'ID")
    }
    if (!Object.values(columnMapping).includes("name")) {
      errors.push("Le nom du produit (name) est requis - veuillez sélectionner une colonne pour le nom")
    }

    // Validation des données avec matching des catégories
    let matchedCategories = 0
    let unmatchedCategories = 0
    parsedData.forEach((row, index) => {
      const primaryIdColumn = Object.entries(columnMapping).find(([_, value]) => value === "primary_id")?.[0]
      const nameColumn = Object.entries(columnMapping).find(([_, value]) => value === "name")?.[0]
      const categoryIdColumn = Object.entries(columnMapping).find(([_, value]) => value === "category_id")?.[0]

      if (primaryIdColumn) {
        const primaryIdValue = row[primaryIdColumn]
        if (primaryIdValue === undefined || primaryIdValue === null || primaryIdValue === "") {
          errors.push(`Ligne ${index + 1}: Identifiant primaire manquant`)
        }
      }
      if (nameColumn) {
        const nameValue = row[nameColumn]
        if (nameValue === undefined || nameValue === null || nameValue === "") {
          errors.push(`Ligne ${index + 1}: Nom du produit manquant`)
        }
      }

      // Vérification du matching des catégories
      if (categoryIdColumn && row[categoryIdColumn]) {
        const categoryId = row[categoryIdColumn]
        const category = findCategoryById(categoryId)
        if (category) {
          matchedCategories++
        } else {
          unmatchedCategories++
        }
      } else {
        unmatchedCategories++
      }
    })

    // Mise à jour des statistiques de matching
    setCategoryMatchingStats({
      matched: matchedCategories,
      unmatched: unmatchedCategories,
      total: parsedData.length,
    })

    setValidationErrors(errors)
    if (errors.length === 0) {
      setStep(3)
    }
  }

  // Map a row using the column mapping
  const mapRow = (row: ProductData): ProductData => {
    const mappedRow: ProductData = {
      primary_id: "",
      name: "",
      supplier: "",
    }
    Object.entries(columnMapping).forEach(([originalColumn, mappedColumn]) => {
      if (mappedColumn) {
        mappedRow[mappedColumn] =
          row[originalColumn] !== undefined && row[originalColumn] !== null ? row[originalColumn] : ""
      }
    })
    return mappedRow
  }

  // Handle image files selection
  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setImageFiles(Array.from(files))
    }
  }

  // Fonction pour mapper automatiquement les catégories
  const mapCategories = (product: ProductData): ProductData => {
    const mappedProduct = { ...product }
    // Matching automatique via category_id
    if (product.category_id) {
      const category = findCategoryById(product.category_id)
      if (category) {
        mappedProduct.category_name = category.nom
      }
    }
    return mappedProduct
  }

  // Import the products
  const importProducts = () => {
    const validProducts = parsedData
      .map(mapRow)
      .map(mapCategories)
      .filter((product) => product.primary_id && product.name)

    if (validProducts.length === 0) {
      toast({
        title: "Aucun produit valide",
        description: "Aucun produit valide n'a été trouvé dans le fichier importé.",
        variant: "destructive",
      })
      return
    }

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

    // Match images with products BEFORE adding products to store
    const imageMap = new Map<string, string>()
    // Process images synchronously first
    const processImages = async () => {
      const imagePromises = imageFiles.map((file) => {
        return new Promise<void>((resolve) => {
          const fileName = file.name.split(".")[0]
          const reader = new FileReader()
          reader.onload = (e) => {
            const imageUrl = e.target?.result as string
            imageMap.set(fileName, imageUrl)
            resolve()
          }
          reader.readAsDataURL(file)
        })
      })
      await Promise.all(imagePromises)

      // Now add products with images
      const productsWithImages = validProducts.map((product) => {
        const imageUrl = imageMap.get(product.primary_id)
        return {
          ...product,
          image: imageUrl || undefined,
        }
      })
      addProducts(productsWithImages)

      // Complete progress
      setTimeout(() => {
        clearInterval(interval)
        setImportProgress(100)
        setTimeout(() => {
          setStep(4)
        }, 500)
      }, 1000)
    }
    processImages()
  }

  // Go to planogram editor
  const goToPlanogramEditor = () => {
    setActiveTab("library")
    router.push("/planogram-editor")
  }

  const debugData = () => {
    console.log("Données brutes:", rawData)
    console.log("Données parsées:", parsedData)
    console.log("Mapping des colonnes:", columnMapping)
    console.log("Catégories:", categoriesWithIds)
    console.log("Statistiques matching:", categoryMatchingStats)
    parsedData.forEach((row, index) => {
      const primaryIdColumn = Object.entries(columnMapping).find(([_, value]) => value === "primary_id")?.[0]
      const nameColumn = Object.entries(columnMapping).find(([_, value]) => value === "name")?.[0]
      const categoryIdColumn = Object.entries(columnMapping).find(([_, value]) => value === "category_id")?.[0]
      console.log(`Ligne ${index + 1}:`)
      console.log(`   ID (${primaryIdColumn}):`, row[primaryIdColumn])
      console.log(`   Nom (${nameColumn}):`, row[nameColumn])
      if (categoryIdColumn) {
        console.log(`   Category ID (${categoryIdColumn}):`, row[categoryIdColumn])
        const category = findCategoryById(row[categoryIdColumn])
        console.log(`   Category trouvée:`, category?.nom || "Non trouvée")
      }
    })
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8" dir={textDirection}>
      <Button
        variant="outline"
        onClick={() => (window.location.href = "/Editor")}
        className={`flex items-center gap-2 mb-4 mt-14 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("productImport.backToEditor")}
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("productImport.title")}</CardTitle>
          <CardDescription>{t("productImport.description")}</CardDescription>
          <div className="text-sm text-muted-foreground mt-2">
            <p>
              <strong>Format attendu :</strong> primary_id, name, supplier, category_id, width, height, depth
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {showCategoryManager ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-lg font-medium">Gestion des catégories</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={fetchCategories} disabled={loadingCategories}>
                    {loadingCategories && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Actualiser les catégories
                  </Button>
                  <Button variant="ghost" onClick={() => setShowCategoryManager(false)}>
                    Retour à l'importation
                  </Button>
                </div>
              </div>
              <CategoryManager
                categories={categoriesWithIds}
                onCategoriesChange={setCategoriesWithIds}
                onCategoryAdd={(newCategory: Category) => {
                  setCategoriesWithIds((prev) => [...prev, newCategory])
                }}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex flex-wrap items-center gap-2 md:space-x-2">
                  <Badge variant={step >= 1 ? "default" : "outline"}>1</Badge>
                  <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>
                    {t("productImport.step1")}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant={step >= 2 ? "default" : "outline"}>2</Badge>
                  <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>
                    {t("productImport.step2")}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant={step >= 3 ? "default" : "outline"}>3</Badge>
                  <span className={step >= 3 ? "font-medium" : "text-muted-foreground"}>
                    {t("productImport.step3")}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant={step >= 4 ? "default" : "outline"}>4</Badge>
                  <span className={step >= 4 ? "font-medium" : "text-muted-foreground"}>Terminé</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCategoryManager(true)}
                    className="flex items-center gap-2"
                  >
                    <FolderTree className="h-4 w-4" />
                    {t("productImport.manageCategories")}
                  </Button>
                  {loadingCategories && (
                    <Badge variant="secondary" className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Chargement des catégories...
                    </Badge>
                  )}
                  {categoriesWithIds.length > 0 && (
                    <Badge variant="secondary">{categoriesWithIds.length} catégories disponibles</Badge>
                  )}
                </div>
              </div>
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">{t("productImport.fileStep.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("productImport.fileStep.description")}</p>
                  </div>
                  <div
                    className={`
                      border-2 border-dashed rounded-lg p-6 sm:p-12 text-center
                      ${file ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25"}
                      hover:border-primary/50 transition-colors cursor-pointer
                    `}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {file ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <FileSpreadsheet className="h-8 w-8 text-primary" />
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{parsedData.length} produits détectés</p>
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
                          <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-medium">{t("productImport.fileStep.selectFile")}</p>
                        <p className="text-sm text-muted-foreground">{t("productImport.fileStep.dragDrop")}</p>
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
                      <Button onClick={() => setStep(2)}>Continuer</Button>
                    </div>
                  )}
                </div>
              )}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">{t("productImport.columnsStep.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("productImport.columnsStep.description")}</p>
                  </div>
                  <div className="border rounded-md">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 font-medium border-b">
                      <div>{t("productImport.columnsStep.fileColumn")}</div>
                      <div>{t("productImport.columnsStep.mappedField")}</div>
                    </div>
                    <ScrollArea className="h-[300px]">
                      <div className="p-4 space-y-4">
                        {parsedData.length > 0 &&
                          Object.keys(parsedData[0]).map((column, index) => (
                            <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 items-center">
                              <div className="font-mono text-sm">{column}</div>
                              <select
                                className="w-full p-2 border rounded-md text-sm"
                                value={columnMapping[column] || ""}
                                onChange={(e) => updateColumnMapping(column, e.target.value)}
                              >
                                <option value="">-- Ignorer cette colonne --</option>
                                <option value="primary_id">Identifiant (primary_id)</option>
                                <option value="name">Nom du produit (name)</option>
                                <option value="supplier">Fournisseur (supplier)</option>
                                <option value="category_id">ID Catégorie (category_id)</option>
                                <option value="width">Largeur (width)</option>
                                <option value="height">Hauteur (height)</option>
                                <option value="depth">Profondeur (depth)</option>
                              </select>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                  {/* Statistiques de matching des catégories */}
                  {categoryMatchingStats.total > 0 && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Matching automatique des catégories</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{categoryMatchingStats.matched}</div>
                          <div className="text-muted-foreground">Catégories trouvées</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{categoryMatchingStats.unmatched}</div>
                          <div className="text-muted-foreground">Non trouvées</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{categoryMatchingStats.total}</div>
                          <div className="text-muted-foreground">Total produits</div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    <h4 className="font-medium">{t("productImport.columnsStep.previewTitle")}</h4>
                    <ScrollArea className="h-[200px] border rounded-md">
                      <div className="p-4">
                        <table className="w-full text-sm">
                          <thead className="border-b">
                            <tr>
                              {Object.values(columnMapping)
                                .filter(Boolean)
                                .map((mappedColumn, index) => (
                                  <th key={index} className="p-2 text-left font-medium">
                                    {mappedColumn}
                                  </th>
                                ))}
                              <th className="p-2 text-left font-medium">Catégorie trouvée</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedData.slice(0, 5).map((row, rowIndex) => {
                              const mappedProduct = mapRow(row)
                              const category = mappedProduct.category_id
                                ? findCategoryById(mappedProduct.category_id)
                                : null
                              return (
                                <tr key={rowIndex} className="border-b">
                                  {Object.entries(columnMapping)
                                    .filter(([_, mappedColumn]) => mappedColumn)
                                    .map(([originalColumn, _], colIndex) => (
                                      <td key={colIndex} className="p-2">
                                        {row[originalColumn] !== undefined && row[originalColumn] !== null
                                          ? row[originalColumn]
                                          : ""}
                                      </td>
                                    ))}
                                  <td className="p-2">
                                    {category ? (
                                      <Badge variant="secondary" className="text-xs">
                                        {category.nom}
                                      </Badge>
                                    ) : mappedProduct.category_id ? (
                                      <Badge variant="destructive" className="text-xs">
                                        Non trouvée
                                      </Badge>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">Aucune</span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                        {parsedData.length > 5 && (
                          <div className="p-2 text-center text-muted-foreground">
                            + {parsedData.length - 5} {t("productImport.columnsStep.otherProducts")}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                  {validationErrors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{t("productImport.validation.errors")}</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          {validationErrors.slice(0, 5).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {validationErrors.length > 5 && <li>+ {validationErrors.length - 5} autres erreurs</li>}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      {t("productImport.back")}
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={debugData}>
                        {t("productImport.debug")}
                      </Button>
                      <Button onClick={validateData}>{t("productImport.validateContinue")}</Button>
                    </div>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">{t("productImport.imagesStep.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("productImport.imagesStep.description")}</p>
                  </div>
                  <div
                    className={`
                      border-2 border-dashed rounded-lg p-6 sm:p-12 text-center
                      ${imageFiles.length ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25"}
                      hover:border-primary/50 transition-colors cursor-pointer
                    `}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    {imageFiles.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <ImageIcon className="h-8 w-8 text-primary" />
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="font-medium">
                          {imageFiles.length} {t("productImport.imagesStep.imagesSelected")}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                          {imageFiles.slice(0, 5).map((file, index) => (
                            <div key={index} className="relative w-16 h-16 border rounded-md overflow-hidden">
                              <img
                                src={URL.createObjectURL(file) || "/placeholder.svg"}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {imageFiles.length > 5 && (
                            <div className="w-16 h-16 border rounded-md flex items-center justify-center bg-muted">
                              +{imageFiles.length - 5}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setImageFiles([])
                            if (imageInputRef.current) {
                              imageInputRef.current.value = ""
                            }
                          }}
                        >
                          {t("productImport.imagesStep.changeImages")}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-medium">{t("productImport.imagesStep.selectImages")}</p>
                        <p className="text-sm text-muted-foreground">{t("productImport.imagesStep.dragDropImages")}</p>
                        <p className="text-xs text-muted-foreground mt-4">
                          {t("productImport.imagesStep.namingConvention")}
                        </p>
                      </div>
                    )}
                    <Input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageFilesChange}
                    />
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">{t("productImport.imagesStep.matchingTitle")}</h4>
                    <ScrollArea className="h-[200px] border rounded-md">
                      <div className="p-4 space-y-2">
                        {parsedData.slice(0, 10).map((product, index) => {
                          const mappedProduct = mapRow(product)
                          const productId = mappedProduct.primary_id
                          const matchingImage = imageFiles.find((file) => file.name.split(".")[0] === productId)
                          const category = mappedProduct.category_id
                            ? findCategoryById(mappedProduct.category_id)
                            : null
                          return (
                            <div
                              key={index}
                              className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-2 border-b"
                            >
                              <div className="font-medium">{productId}</div>
                              <div className="flex-1 truncate">{mappedProduct.name}</div>
                              {category && (
                                <Badge variant="secondary" className="text-xs">
                                  {category.nom}
                                </Badge>
                              )}
                              {matchingImage ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 border rounded-md overflow-hidden">
                                    <img
                                      src={URL.createObjectURL(matchingImage) || "/placeholder.svg"}
                                      alt={matchingImage.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  {t("productImport.imagesStep.noImage")}
                                </Badge>
                              )}
                            </div>
                          )
                        })}
                        {parsedData.length > 10 && (
                          <div className="p-2 text-center text-muted-foreground">
                            + {parsedData.length - 10} {t("productImport.columnsStep.otherProducts")}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      {t("productImport.back")}
                    </Button>
                    <Button onClick={importProducts}>{t("productImport.importProducts")}</Button>
                  </div>
                </div>
              )}
              {step === 3 && importProgress > 0 && (
                <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
                  <Card className="w-full max-w-sm">
                    <CardHeader>
                      <CardTitle>{t("productImport.importProgress.title")}</CardTitle>
                      <CardDescription>{t("productImport.importProgress.description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress value={importProgress} className="h-2" />
                      <p className="text-center text-sm">
                        {t(
                          importProgress < 100
                            ? "productImport.importProgress.processing"
                            : "productImport.importProgress.complete",
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-medium">{t("productImport.completeStep.title")}</h3>
                      <p className="text-muted-foreground">
                        {parsedData.length} {t("productImport.completeStep.productsImported")}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">{t("productImport.completeStep.summary")}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="border rounded-md p-4 space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {t("productImport.completeStep.importedProducts")}
                        </p>
                        <p className="text-2xl font-bold">{parsedData.length}</p>
                      </div>
                      <div className="border rounded-md p-4 space-y-2">
                        <p className="text-sm text-muted-foreground">{t("productImport.completeStep.matchedImages")}</p>
                        <p className="text-2xl font-bold">{imageFiles.length}</p>
                      </div>
                      <div className="border rounded-md p-4 space-y-2">
                        <p className="text-sm text-muted-foreground">Catégories matchées</p>
                        <p className="text-2xl font-bold text-green-600">{categoryMatchingStats.matched}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep(1)
                        setFile(null)
                        setParsedData([])
                        setImageFiles([])
                        setColumnMapping({})
                        setValidationErrors([])
                        setImportProgress(0)
                        setCategoryMatchingStats({ matched: 0, unmatched: 0, total: 0 })
                      }}
                    >
                      {t("productImport.completeStep.importMore")}
                    </Button>
                    <Button onClick={goToPlanogramEditor}>{t("productImport.completeStep.goToEditor")}</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
