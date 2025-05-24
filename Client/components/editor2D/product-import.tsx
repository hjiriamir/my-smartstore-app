"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import Papa from "papaparse"
import { FileSpreadsheet, ImageIcon, CheckCircle2, AlertCircle, ChevronRight, FolderTree, ArrowLeft } from "lucide-react"
import { useTranslation } from 'react-i18next';
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
import  TopBanner  from "@/components/back-office/TopBanner"
import  '@/components/multilingue/i18n.js';



interface ProductData {
  primary_Id: string
  name: string
  supplier: string
  category1_id?: string
  category2_id?: string
  category3_id?: string
  category1_name?: string // Ajouté pour référence
  category2_name?: string // Ajouté pour référence
  category3_name?: string // Ajouté pour référence
  width_cm?: number
  height_cm?: number
  depth_cm?: number
  [key: string]: any
}

// Ajoutez cette interface pour le type de catégorie
interface Category {
  id: string
  name: string
  color: string
  parentId: string | null
  children?: Category[]
}


export function ProductImport() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar'; // RTL pour l'arabe, sinon LTR
  const textDirection = isRTL ? 'rtl' : 'ltr';
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

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [categoriesWithIds, setCategoriesWithIds] = useState<Category[]>([])

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
        skipEmptyLines: true, // Ignorer les lignes vides
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

    // Filtrer les lignes vides ou qui ne contiennent que des valeurs vides
    const filteredData = data.filter((row) => {
      return Object.values(row).some((value) => value !== undefined && value !== null && value !== "")
    })

    setParsedData(filteredData)

    // Auto-detect columns
    const firstRow = data[0]
    const mapping: Record<string, string> = {}

    // Détection plus intelligente des colonnes
    Object.keys(firstRow).forEach((column) => {
      const lowerColumn = column.toLowerCase().trim()

      // Détection de l'ID primaire - plus flexible
      if (
        lowerColumn === "primary_id" ||
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
        mapping[column] = "primary_Id"
      }
      // Détection du nom - plus flexible
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
      // Si on trouve une colonne qui pourrait être un nom de produit (comme "SkinGlow" dans l'exemple)
      else if (
        !mapping["name"] &&
        typeof firstRow[column] === "string" &&
        !lowerColumn.includes("supplier") &&
        !lowerColumn.includes("fournisseur") &&
        !lowerColumn.includes("categor")
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
      // Détection des catégories
      else if (
        lowerColumn === "category1_id" ||
        (lowerColumn.includes("cat") &&
          (lowerColumn.includes("1") || lowerColumn.includes("one") || lowerColumn.includes("principale")))
      ) {
        mapping[column] = "category1_id"
      } else if (
        lowerColumn === "category2_id" ||
        (lowerColumn.includes("cat") &&
          (lowerColumn.includes("2") || lowerColumn.includes("two") || lowerColumn.includes("secondaire")))
      ) {
        mapping[column] = "category2_id"
      } else if (
        lowerColumn === "category3_id" ||
        (lowerColumn.includes("cat") &&
          (lowerColumn.includes("3") || lowerColumn.includes("three") || lowerColumn.includes("tertiaire")))
      ) {
        mapping[column] = "category3_id"
      }
      else if (
        lowerColumn === "category1_name" ||
        (lowerColumn.includes("cat") && lowerColumn.includes("1") && lowerColumn.includes("name"))
      ) {
        mapping[column] = "category1_name"
      } else if (
        lowerColumn === "category2_name" ||
        (lowerColumn.includes("cat") && lowerColumn.includes("2") && lowerColumn.includes("name"))
      ) {
        mapping[column] = "category2_name"
      } else if (
        lowerColumn === "category3_name" ||
        (lowerColumn.includes("cat") && lowerColumn.includes("3") && lowerColumn.includes("name"))
      ) {
        mapping[column] = "category3_name"
      }
      // Détection des dimensions
      else if (
        lowerColumn === "width_cm" ||
        lowerColumn.includes("larg") ||
        lowerColumn.includes("width") ||
        lowerColumn === "l"
      ) {
        mapping[column] = "width_cm"
      } else if (
        lowerColumn === "height_cm" ||
        lowerColumn.includes("haut") ||
        lowerColumn.includes("height") ||
        lowerColumn === "h"
      ) {
        mapping[column] = "height_cm"
      } else if (
        lowerColumn === "depth_cm" ||
        lowerColumn.includes("prof") ||
        lowerColumn.includes("depth") ||
        lowerColumn === "p"
      ) {
        mapping[column] = "depth_cm"
      }
    })

    // Si aucun ID primaire n'a été trouvé, essayons de prendre la première colonne numérique
    if (!Object.values(mapping).includes("primary_Id")) {
      const firstNumericColumn = Object.keys(firstRow).find(
        (column) =>
          typeof firstRow[column] === "number" ||
          (typeof firstRow[column] === "string" && !isNaN(Number(firstRow[column]))),
      )
      if (firstNumericColumn) {
        mapping[firstNumericColumn] = "primary_Id"
      }
    }

    // Si aucun nom n'a été trouvé, prenons la première colonne de texte qui n'est pas déjà mappée
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
  const findCategoryById = (id: string): Category | undefined => {
    const findInTree = (categories: Category[]): Category | undefined => {
      for (const category of categories) {
        if (category.id === id) return category
        if (category.children) {
          const found = findInTree(category.children)
          if (found) return found
        }
      }
      return undefined
    }
    return findInTree(categoriesWithIds)
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

    // Check if required columns are mapped
    if (!Object.values(columnMapping).includes("primary_Id")) {
      errors.push("L'identifiant primaire (primary_Id) est requis - veuillez sélectionner une colonne pour l'ID")
    }

    if (!Object.values(columnMapping).includes("name")) {
      errors.push("Le nom du produit (name) est requis - veuillez sélectionner une colonne pour le nom")
    }

    // Validate data in each row with more flexibility
    parsedData.forEach((row, index) => {
      // Trouver les colonnes correspondant à primary_Id et name
      const primaryIdColumn = Object.entries(columnMapping).find(([_, value]) => value === "primary_Id")?.[0]
      const nameColumn = Object.entries(columnMapping).find(([_, value]) => value === "name")?.[0]

      // Vérifier si l'ID est présent et non vide
      if (primaryIdColumn) {
        const primaryIdValue = row[primaryIdColumn]
        if (primaryIdValue === undefined || primaryIdValue === null || primaryIdValue === "") {
          errors.push(`Ligne ${index + 1}: Identifiant primaire manquant`)
        }
      }

      // Vérifier si le nom est présent et non vide
      if (nameColumn) {
        const nameValue = row[nameColumn]
        if (nameValue === undefined || nameValue === null || nameValue === "") {
          errors.push(`Ligne ${index + 1}: Nom du produit manquant`)
        }
      }
    })

    setValidationErrors(errors)

    if (errors.length === 0) {
      setStep(3)
    }
  }

  // Map a row using the column mapping
  const mapRow = (row: ProductData): ProductData => {
    const mappedRow: ProductData = {
      primary_Id: "",
      name: "",
      supplier: "",
    }

    Object.entries(columnMapping).forEach(([originalColumn, mappedColumn]) => {
      if (mappedColumn) {
        // Convertir les valeurs undefined ou null en chaînes vides pour éviter les erreurs
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
  const mapCategories = (product: ProductData) => {
    const mappedProduct = { ...product }
    
    // Si category1_id est fourni, trouver la catégorie correspondante
    if (product.category1_id) {
      const category = findCategoryById(product.category1_id)
      if (category) {
        mappedProduct.category1_name = category.name
      }
    }
    
    // Si category1_name est fourni mais pas category1_id, trouver par nom
    else if (product.category1_name) {
      const category = categoriesWithIds.find(c => c.name === product.category1_name)
      if (category) {
        mappedProduct.category1_id = category.id
      }
    }
    
    // Répéter pour les sous-catégories...
    if (product.category2_id) {
      const category = findCategoryById(product.category2_id)
      if (category) {
        mappedProduct.category2_name = category.name
      }
    } else if (product.category2_name) {
      const category = categoriesWithIds.find(c => c.name === product.category2_name)
      if (category) {
        mappedProduct.category2_id = category.id
      }
    }
    
    if (product.category3_id) {
      const category = findCategoryById(product.category3_id)
      if (category) {
        mappedProduct.category3_name = category.name
      }
    } else if (product.category3_name) {
      const category = categoriesWithIds.find(c => c.name === product.category3_name)
      if (category) {
        mappedProduct.category3_id = category.id
      }
    }
    
    return mappedProduct
  }
  // Import the products
  const importProducts = () => {
    // Filtrer les produits qui ont un ID et un nom
    const validProducts = parsedData.map(mapRow).map(mapCategories).filter((product) => product.primary_Id && product.name)

    if (validProducts.length === 0) {
      toast({
        title: "Aucun produit valide",
        description: "Aucun produit valide n'a été trouvé dans le fichier importé.",
        variant: "destructive",
      })
      return
    }

    // Start progress
    setImportProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + 5
      })
    }, 100)

    // Add products to store
    addProducts(validProducts)

    // Match images with products
    const imageMap = new Map<string, File>()

    imageFiles.forEach((file) => {
      // Extract primary_Id from filename (remove extension)
      const fileName = file.name.split(".")[0]
      imageMap.set(fileName, file)
    })

    // Update products with images
    validProducts.forEach((product) => {
      const imageFile = imageMap.get(product.primary_Id)

      if (imageFile) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string
          updateProductImage(product.primary_Id, imageUrl)
        }
        reader.readAsDataURL(imageFile)
      }
    })

    // Complete progress
    setTimeout(() => {
      clearInterval(interval)
      setImportProgress(100)

      setTimeout(() => {
        setStep(4)
      }, 500)
    }, 1000)
  }

  // Go to planogram editor
  const goToPlanogramEditor = () => {
    setActiveTab("library")
    router.push("/planogram-editor")
  }

  // Afficher les données brutes pour le débogage
  const debugData = () => {
    console.log("Données brutes:", rawData)
    console.log("Données parsées:", parsedData)
    console.log("Mapping des colonnes:", columnMapping)

    // Vérifier chaque ligne pour les valeurs manquantes
    parsedData.forEach((row, index) => {
      const primaryIdColumn = Object.entries(columnMapping).find(([_, value]) => value === "primary_Id")?.[0]
      const nameColumn = Object.entries(columnMapping).find(([_, value]) => value === "name")?.[0]

      console.log(`Ligne ${index + 1}:`)
      console.log(`  ID (${primaryIdColumn}):`, row[primaryIdColumn])
      console.log(`  Nom (${nameColumn}):`, row[nameColumn])
    })
  }

  return (
    <div className="container max-w-4xl mx-auto py-6" dir={textDirection}>
      
      <Button 
  variant="outline" 
  onClick={() => window.location.href = "/Editor"}
  className={`flex items-center gap-2 mb-4 mt-14 ${isRTL ? 'flex-row-reverse' : ''}`}
        
      >
        <ArrowLeft className="h-4 w-4" />
        {t("productImport.backToEditor")}
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("productImport.title")}</CardTitle>
          <CardDescription>
          {t("productImport.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
        {showCategoryManager ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Gestion des catégories</h3>
              <Button variant="ghost" onClick={() => setShowCategoryManager(false)}>
                Retour à l'importation
              </Button>
            </div>
            <CategoryManager 
              categories={categoriesWithIds}
              onCategoriesChange={setCategoriesWithIds}
              onCategoryAdd={(newCategory: Category) => {
                setCategoriesWithIds(prev => [...prev, newCategory])
              }}
            />
          </div>
         ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <Badge variant={step >= 1 ? "default" : "outline"}>1</Badge>
                  <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>{t("productImport.step1")}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />

                  <Badge variant={step >= 2 ? "default" : "outline"}>2</Badge>
                  <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>{t("productImport.step2")}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />

                  <Badge variant={step >= 3 ? "default" : "outline"}>3</Badge>
                  <span className={step >= 3 ? "font-medium" : "text-muted-foreground"}>{t("productImport.step3")}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />

                  <Badge variant={step >= 4 ? "default" : "outline"}>4</Badge>
                  <span className={step >= 4 ? "font-medium" : "text-muted-foreground"}>{t("productImport.manageCategories")}</span>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowCategoryManager(true)}
                  className="flex items-center gap-2"
                >
                  <FolderTree className="h-4 w-4" />
                  {t("productImport.manageCategories")}
                </Button>
              </div>

              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium"> {t("productImport.fileStep.title")}</h3>
                    <p className="text-sm text-muted-foreground">
                    {t("productImport.fileStep.description")}
                    </p>
                  </div>

                  <div
                    className={`
                      border-2 border-dashed rounded-lg p-12 text-center
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
                    <p className="text-sm text-muted-foreground">
                    {t("productImport.columnsStep.description")}
                    </p>
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
                            <div key={index} className="grid grid-cols-2 gap-4 items-center">
                              <div className="font-mono text-sm">{column}</div>
                              <select
                                className="w-full p-2 border rounded-md"
                                value={columnMapping[column] || ""}
                                onChange={(e) => updateColumnMapping(column, e.target.value)}
                              >
                                <option value="">-- Ignorer cette colonne --</option>
                                <option value="primary_Id">Identifiant (primary_Id)</option>
                                <option value="name">Nom du produit (name)</option>
                                <option value="supplier">Fournisseur (supplier)</option>
                                <option value="category1_id">Catégorie 1 (category1_id)</option>
                                <option value="category2_id">Catégorie 2 (category2_id)</option>
                                <option value="category3_id">Catégorie 3 (category3_id)</option>
                                <option value="width_cm">Largeur en cm (width_cm)</option>
                                <option value="height_cm">Hauteur en cm (height_cm)</option>
                                <option value="depth_cm">Profondeur en cm (depth_cm)</option>
                              </select>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>

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
                            </tr>
                          </thead>
                          <tbody>
                            {parsedData.slice(0, 5).map((row, rowIndex) => (
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
                              </tr>
                            ))}
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

                  <div className="flex justify-between">
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
                    <p className="text-sm text-muted-foreground">
                    {t("productImport.imagesStep.description")}
                    </p>
                  </div>

                  <div
                    className={`
                      border-2 border-dashed rounded-lg p-12 text-center
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
                        <p className="font-medium">{imageFiles.length} {t("productImport.imagesStep.imagesSelected")}</p>
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
                        <p className="text-lg font-medium">{t("productImport.imagesStep.selectImages")}
                        </p>
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
                          const productId = mappedProduct.primary_Id
                          const matchingImage = imageFiles.find((file) => file.name.split(".")[0] === productId)

                          return (
                            <div key={index} className="flex items-center gap-4 p-2 border-b">
                              <div className="font-medium">{productId}</div>
                              <div className="flex-1 truncate">{mappedProduct.name}</div>
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

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>
                    {t("productImport.back")}
                    </Button>
                    <Button onClick={importProducts}>{t("productImport.importProducts")}</Button>
                  </div>
                </div>
              )}

              {step === 3 && importProgress > 0 && (
                <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
                  <Card className="w-[400px]">
                    <CardHeader>
                      <CardTitle>{t("productImport.importProgress.title")}</CardTitle>
                      <CardDescription>
                      {t("productImport.importProgress.description")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress value={importProgress} className="h-2" />
                      <p className="text-center text-sm">
                        {t(importProgress < 100 ? "productImport.importProgress.processing" : "productImport.importProgress.complete")}
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-md p-4 space-y-2">
                        <p className="text-sm text-muted-foreground">{t("productImport.completeStep.importedProducts")}</p>
                        <p className="text-2xl font-bold">{parsedData.length}</p>
                      </div>
                      <div className="border rounded-md p-4 space-y-2">
                        <p className="text-sm text-muted-foreground">{t("productImport.completeStep.matchedImages")}</p>
                        <p className="text-2xl font-bold">{imageFiles.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
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
