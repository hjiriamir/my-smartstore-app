"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import Papa from "papaparse"
import { FileSpreadsheet, CheckCircle2, ChevronRight, FolderTree, ArrowLeft, Loader2, ImageIcon, AlertCircle, ChevronDown  } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useProductStore } from "@/lib/product-store"
import { CategoryManager } from "@/components/editor2D/category-manager"
import { useTranslation } from "react-i18next"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface ProductData {
  primary_id: string
  name: string 
  supplier?: string 
  category_id: string 
  width?: number 
  height?: number 
  depth?: number 
  description?: string 
  price?: number 
  weight?: number 
  packaging?: string 
  seasonality?: "Hiver" | "Printemps" | "Été" | "Automne" | "Toute saison" 
  priority_merchandising?: "Haute" | "Moyenne" | "Basse" 
  temperature_constraint?: string 
  conditioning_constraint?: string 
  [key: string]: any
}

interface Fournisseur {
  fournisseur_id: number
  nom: string
  adresse: string
  ville: string
  code_postal: string
  pays: string
  telephone: string
  email: string
  contact_principal: string
  siret: string
  date_creation: string
  statut: string
  notes: string
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

// Interface pour les données à envoyer à l'API
interface ApiProductData {
  produit_id: string;
  nom: string;
  description?: string;
  prix?: number;
  stock?: number;
  categorie_id: string;
  fournisseur_id: number;
  entreprise_id: string;
  longueur?: number;
  largeur?: number;
  hauteur?: number;
  poids?: number;
  saisonnalite?: string;
  priorite_merchandising?: string;
  contrainte_temperature?: string;
  contrainte_conditionnement?: string;
}

export function ProductImport() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
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

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [idEntreprise, setIdEntreprise] = useState<string | null>(null)
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([])
  const [loadingFournisseurs, setLoadingFournisseurs] = useState<boolean>(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const [categoryMatchingStats, setCategoryMatchingStats] = useState({
    matched: 0,
    unmatched: 0,
    total: 0,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [selectedFournisseur, setSelectedFournisseur] = useState<string | null>(null)
  const [isImportingToAPI, setIsImportingToAPI] = useState<boolean>(false)

  const fetchCurrentUserDataAndStores = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("Token d'authentification manquant")
        return
      }

      const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (!userResponse.ok) {
        throw new Error("Erreur lors de la récupération des données utilisateur")
      }

      const userData = await userResponse.json()
      const userId = userData.user?.idUtilisateur || userData.idUtilisateur || userData.id
      const entrepriseId = userData.user?.entreprises_id || userData.entreprises_id

      setCurrentUserId(userId)
      setIdEntreprise(entrepriseId)

      // Fetch suppliers after getting enterprise ID
      if (entrepriseId) {
        await fetchFournisseurs(entrepriseId)
      }
    } catch (error) {
      console.error("Error fetching current user data:", error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les données utilisateur.",
        variant: "destructive",
      })
    }
  }

  const fetchFournisseurs = async (entrepriseId: string) => {
    setLoadingFournisseurs(true)
    try {
      const response = await fetch(`${API_BASE_URL}/fournisseur/getAllFournisseursByEntreprise/${entrepriseId}`)
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des fournisseurs")
      }
      const data = await response.json()
      setFournisseurs(data)
      toast({
        title: "Fournisseurs chargés",
        description: `${data.length} fournisseurs ont été récupérés avec succès.`,
      })
    } catch (error) {
      console.error("Erreur lors de la récupération des fournisseurs:", error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les fournisseurs depuis l'API.",
        variant: "destructive",
      })
    } finally {
      setLoadingFournisseurs(false)
    }
  }

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

  useEffect(() => {
    fetchCurrentUserDataAndStores()
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

    // Auto-detect columns avec les nouveaux attributs
    const firstRow = data[0]
    const mapping: Record<string, string> = {}
    Object.keys(firstRow).forEach((column) => {
      const lowerColumn = column.toLowerCase().trim()

      // Détection de primary_id
      if (
        lowerColumn === "primary_id" ||
        lowerColumn === "primaryid" ||
        lowerColumn === "product_id" ||
        lowerColumn === "id" ||
        lowerColumn === "code" ||
        lowerColumn === "reference" ||
        lowerColumn === "ref" ||
        lowerColumn === "sku"
      ) {
        mapping[column] = "primary_id"
      }
      // Détection de name
      else if (
        lowerColumn === "name" ||
        lowerColumn === "nom" ||
        lowerColumn === "product" ||
        lowerColumn === "produit" ||
        lowerColumn === "designation" ||
        lowerColumn === "title" ||
        lowerColumn === "titre"
      ) {
        mapping[column] = "name"
      }
      // Détection de supplier
      else if (
        lowerColumn === "supplier" ||
        lowerColumn === "fournisseur" ||
        lowerColumn === "vendor" ||
        lowerColumn === "fournisseur_id" ||
        lowerColumn === "supplier_id"
      ) {
        mapping[column] = "supplier"
      }
      // Détection de category_id
      else if (
        lowerColumn === "category_id" ||
        lowerColumn === "category" ||
        lowerColumn === "categorie" ||
        lowerColumn === "categorie_id" ||
        lowerColumn === "cat_id" ||
        lowerColumn === "categoryid"
      ) {
        mapping[column] = "category_id"
      }
      // Détection de width
      else if (
        lowerColumn === "width" ||
        lowerColumn === "largeur" ||
        lowerColumn === "w" ||
        lowerColumn === "large"
      ) {
        mapping[column] = "width"
      }
      // Détection de height
      else if (
        lowerColumn === "height" ||
        lowerColumn === "hauteur" ||
        lowerColumn === "h" ||
        lowerColumn === "haut"
      ) {
        mapping[column] = "height"
      }
      // Détection de depth
      else if (
        lowerColumn === "depth" ||
        lowerColumn === "profondeur" ||
        lowerColumn === "d" ||
        lowerColumn === "epaisseur" ||
        lowerColumn === "thickness"
      ) {
        mapping[column] = "depth"
      }
      // Détection de description
      else if (
        lowerColumn === "description" ||
        lowerColumn === "desc" ||
        lowerColumn === "detail" ||
        lowerColumn === "details"
      ) {
        mapping[column] = "description"
      }
      // Détection de price
      else if (
        lowerColumn === "price" ||
        lowerColumn === "prix" ||
        lowerColumn === "cost" ||
        lowerColumn === "cout"
      ) {
        mapping[column] = "price"
      }
      // Détection de weight
      else if (
        lowerColumn === "weight" ||
        lowerColumn === "poids" ||
        lowerColumn === "mass" ||
        lowerColumn === "poids_net"
      ) {
        mapping[column] = "weight"
      }
      // Détection de packaging
      else if (
        lowerColumn === "packaging" ||
        lowerColumn === "conditionnement" ||
        lowerColumn === "pack" ||
        lowerColumn === "emballage"
      ) {
        mapping[column] = "packaging"
      }
      // Détection de seasonality
      else if (
        lowerColumn === "seasonality" ||
        lowerColumn === "saisonnalite" ||
        lowerColumn === "saison" ||
        lowerColumn === "season"
      ) {
        mapping[column] = "seasonality"
      }
      // Détection de priority_merchandising
      else if (
        lowerColumn === "priority_merchandising" ||
        lowerColumn === "priorite_merchandising" ||
        lowerColumn === "priority" ||
        lowerColumn === "priorite" ||
        lowerColumn === "merch_priority"
      ) {
        mapping[column] = "priority_merchandising"
      }
      // Détection de temperature_constraint
      else if (
        lowerColumn === "temperature_constraint" ||
        lowerColumn === "contrainte_temperature" ||
        lowerColumn === "temp_constraint" ||
        lowerColumn === "contrainte_temp"
      ) {
        mapping[column] = "temperature_constraint"
      }
      // Détection de conditioning_constraint
      else if (
        lowerColumn === "conditioning_constraint" ||
        lowerColumn === "contrainte_conditionnement" ||
        lowerColumn === "conditioning_constraint" ||
        lowerColumn === "contrainte_cond"
      ) {
        mapping[column] = "conditioning_constraint"
      }
    })

    setColumnMapping(mapping)
    setStep(2)
  }

  const findCategoryById = (categoryId: string): Category | undefined => {
    return categoriesWithIds.find((cat) => cat.categorie_id === categoryId)
  }

  const findFournisseurByName = (supplierName: string): Fournisseur | undefined => {
    return fournisseurs.find((fournisseur) => 
      fournisseur.nom.toLowerCase() === supplierName.toLowerCase()
    )
  }

  const updateColumnMapping = (originalColumn: string, mappedColumn: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [originalColumn]: mappedColumn,
    }))
  }

  const validateData = () => {
    const errors: string[] = []

    // Vérification des colonnes obligatoires
    if (!Object.values(columnMapping).includes("primary_id")) {
      errors.push("L'identifiant produit (primary_id) est requis - veuillez sélectionner une colonne pour l'ID")
    }
    if (!Object.values(columnMapping).includes("name")) {
      errors.push("Le nom du produit (name) est requis - veuillez sélectionner une colonne pour le nom")
    }
    if (!Object.values(columnMapping).includes("category_id")) {
      errors.push("L'ID de catégorie (category_id) est requis - veuillez sélectionner une colonne pour la catégorie")
    }

    // Vérification des données
    parsedData.forEach((row, index) => {
      const rowNumber = index + 2 // +2 car l'en-tête est la ligne 1 et on commence à 0

      if (!row.primary_id) {
        errors.push(`Ligne ${rowNumber}: L'identifiant produit (primary_id) est requis`)
      }
      if (!row.name) {
        errors.push(`Ligne ${rowNumber}: Le nom du produit (name) est requis`)
      }
      if (!row.category_id) {
        errors.push(`Ligne ${rowNumber}: L'ID de catégorie (category_id) est requis`)
      }
      if (row.price && isNaN(Number(row.price))) {
        errors.push(`Ligne ${rowNumber}: Le prix doit être un nombre valide`)
      }
      if (row.width && isNaN(Number(row.width))) {
        errors.push(`Ligne ${rowNumber}: La largeur doit être un nombre valide`)
      }
      if (row.height && isNaN(Number(row.height))) {
        errors.push(`Ligne ${rowNumber}: La hauteur doit être un nombre valide`)
      }
      if (row.depth && isNaN(Number(row.depth))) {
        errors.push(`Ligne ${rowNumber}: La profondeur doit être un nombre valide`)
      }
      if (row.weight && isNaN(Number(row.weight))) {
        errors.push(`Ligne ${rowNumber}: Le poids doit être un nombre valide`)
      }
    })

    // Calculer les statistiques de matching des catégories
    const matchedCategories = parsedData.filter((row) => {
      const categoryId = row.category_id
      return categoryId && findCategoryById(categoryId)
    }).length

    setCategoryMatchingStats({
      matched: matchedCategories,
      unmatched: parsedData.length - matchedCategories,
      total: parsedData.length,
    })

    setValidationErrors(errors)
    if (errors.length === 0) {
      setStep(3)
    }
  }

  const mapRow = (row: ProductData): ProductData => {
    const mappedRow: ProductData = {
      primary_id: "",
      name: "",
      category_id: "",
    }

    Object.entries(columnMapping).forEach(([originalColumn, mappedColumn]) => {
      if (mappedColumn && row[originalColumn] !== undefined && row[originalColumn] !== null) {
        const value = row[originalColumn]

        // Conversion des types pour les champs numériques
        if (
          mappedColumn === "price" ||
          mappedColumn === "width" ||
          mappedColumn === "height" ||
          mappedColumn === "depth" ||
          mappedColumn === "weight"
        ) {
          mappedRow[mappedColumn] = Number(value) || 0
        } else {
          mappedRow[mappedColumn] = value
        }
      }
    })

    return mappedRow
  }

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setImageFiles(Array.from(files))
    }
  }

  const mapCategories = (product: ProductData): ProductData => {
    const mappedProduct = { ...product }
    // Matching automatique via category_id
    if (product.category_id) {
      const category = findCategoryById(product.category_id)
      if (category) {
        mappedProduct.category_name = category.nom
      }
    }
    // Matching automatique via supplier
    if (product.supplier) {
      const fournisseur = findFournisseurByName(product.supplier)
      if (fournisseur) {
        mappedProduct.fournisseur_id = fournisseur.fournisseur_id
        mappedProduct.fournisseur_nom = fournisseur.nom
      }
    }
    return mappedProduct
  }

  // Fonction pour envoyer les produits à l'API
  const sendProductsToAPI = async (productsToSend: ApiProductData[]) => {
    setIsImportingToAPI(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const response = await fetch("http://localhost:8081/api/produits/createProduitsList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productsToSend),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de l'importation des produits")
      }

      const result = await response.json()
      toast({
        title: "Succès",
        description: `${productsToSend.length} produits ont été importés avec succès dans la base de données.`,
      })
      return result
    } catch (error) {
      console.error("Erreur lors de l'envoi des produits à l'API:", error)
      toast({
        title: "Erreur API",
        description: "Impossible d'importer les produits dans la base de données. Ils ont été ajoutés localement seulement.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsImportingToAPI(false)
    }
  }

  const importProducts = async () => {
    const validProducts = parsedData
      .map(mapRow)
      .map(mapCategories)
      .filter(
        (product) =>
          product.primary_id && product.name && product.category_id
      )

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

      // Préparer les données pour l'API
      const apiProducts: ApiProductData[] = validProducts.map(product => ({
        produit_id: product.primary_id,
        nom: product.name,
        description: product.description || "",
        prix: product.price || 0,
        stock: 0, // Valeur par défaut, peut être modifiée si nécessaire
        categorie_id: product.category_id,
        fournisseur_id: product.fournisseur_id || 1, // Valeur par défaut si non trouvé
        entreprise_id: idEntreprise || "14", // Récupéré depuis l'utilisateur connecté
        longueur: product.depth || 0,
        largeur: product.width || 0,
        hauteur: product.height || 0,
        poids: product.weight || 0,
        saisonnalite: product.seasonality || "Toute saison",
        priorite_merchandising: product.priority_merchandising || "Moyenne",
        contrainte_temperature: product.temperature_constraint || "Température ambiante",
        contrainte_conditionnement: product.conditioning_constraint || "Boîte en carton"
      }))

      // Envoyer les produits à l'API
      try {
        await sendProductsToAPI(apiProducts)
      } catch (error) {
        console.error("Erreur lors de l'envoi à l'API, mais les produits ont été ajoutés localement", error)
      }

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

  const goToPlanogramEditor = () => {
    setActiveTab("library")
    router.push("/planogram-editor")
  }

  const debugData = () => {
    console.log("Données brutes:", rawData)
    console.log("Données parsées:", parsedData)
    console.log("Mapping des colonnes:", columnMapping)
    console.log("Catégories:", categoriesWithIds)
    console.log("Fournisseurs:", fournisseurs)
    console.log("Statistiques matching:", categoryMatchingStats)
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <Button
        variant="outline"
        onClick={() => (window.location.href = "/Editor")}
        className="flex items-center gap-2 mb-4 mt-14"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l'Éditeur
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Import de Produits</CardTitle>
          <CardDescription>Importez vos produits depuis des fichiers CSV ou Excel</CardDescription>
          <div className="text-sm text-muted-foreground mt-2">
            <p>
              <strong>Format attendu :</strong> primary_id, name, supplier, category_id, width, height, depth, description, price, weight, packaging, seasonality, priority_merchandising, temperature_constraint, conditioning_constraint
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
                  <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>Sélectionner le Fichier</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant={step >= 2 ? "default" : "outline"}>2</Badge>
                  <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>Mapper les Colonnes</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant={step >= 3 ? "default" : "outline"}>3</Badge>
                  <span className={step >= 3 ? "font-medium" : "text-muted-foreground"}>Importer les Images</span>
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
                    Gérer les Catégories
                  </Button>
                  {loadingCategories && (
                    <Badge variant="secondary" className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Chargement des catégories...
                    </Badge>
                  )}
                  {loadingFournisseurs && (
                    <Badge variant="secondary" className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Chargement des fournisseurs...
                    </Badge>
                  )}
                  {categoriesWithIds.length > 0 && (
                    <Badge variant="secondary">{categoriesWithIds.length} catégories disponibles</Badge>
                  )}
                  {fournisseurs.length > 0 && (
                    <div className="relative group">
                      <Badge 
                        variant="secondary" 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => setSelectedFournisseur(selectedFournisseur ? null : 'open')}
                      >
                        {fournisseurs.length} fournisseurs disponibles
                        <ChevronDown className="h-3 w-3" />
                      </Badge>
                      
                      {selectedFournisseur && (
                        <div className="absolute top-full right-0 mt-1 w-48 bg-background border rounded-md shadow-lg z-10">
                          <div className="p-2 max-h-60 overflow-y-auto">
                            <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                              Liste des fournisseurs
                            </div>
                            {fournisseurs.map((fournisseur) => (
                              <div
                                key={fournisseur.fournisseur_id}
                                className="px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer"
                                onClick={() => setSelectedFournisseur(fournisseur.nom)}
                              >
                                {fournisseur.nom}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Sélectionnez votre fichier</h3>
                    <p className="text-sm text-muted-foreground">
                      Choisissez un fichier CSV ou Excel contenant vos produits
                    </p>
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
                          Changer de Fichier
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-center">
                          <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-medium">Sélectionner un Fichier</p>
                        <p className="text-sm text-muted-foreground">Ou glissez-déposez votre fichier ici</p>
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
                    <h3 className="text-lg font-medium">Mapper les colonnes</h3>
                    <p className="text-sm text-muted-foreground">Associez chaque colonne de votre fichier au champ correspondant dans le système</p>
                  </div>
                  <div className="border rounded-md">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 font-medium border-b">
                      <div>Colonne du fichier</div>
                      <div>Champ correspondant</div>
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
                                <option value="description">Description (description)</option>
                                <option value="price">Prix (price)</option>
                                <option value="weight">Poids (weight)</option>
                                <option value="packaging">Conditionnement (packaging)</option>
                                <option value="seasonality">Saisonnalité (seasonality)</option>
                                <option value="priority_merchandising">Priorité merchandising (priority_merchandising)</option>
                                <option value="temperature_constraint">Contrainte température (temperature_constraint)</option>
                                <option value="conditioning_constraint">Contrainte conditionnement (conditioning_constraint)</option>
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
                  {/* Statistiques de matching des fournisseurs */}
                  {fournisseurs.length > 0 && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Matching automatique des fournisseurs</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {parsedData.filter(row => {
                              const supplier = mapRow(row).supplier;
                              return supplier && findFournisseurByName(supplier);
                            }).length}
                          </div>
                          <div className="text-muted-foreground">Fournisseurs trouvés</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {parsedData.filter(row => {
                              const supplier = mapRow(row).supplier;
                              return supplier && !findFournisseurByName(supplier);
                            }).length}
                          </div>
                          <div className="text-muted-foreground">Non trouvés</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {parsedData.filter(row => mapRow(row).supplier).length}
                          </div>
                          <div className="text-muted-foreground">Avec fournisseur</div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    <h4 className="font-medium">Aperçu des données</h4>
                    <div className="border rounded-md overflow-auto"> 
                      <div className="min-w-full"> 
                        <table className="w-full text-sm">
                          <thead className="border-b">
                            <tr>
                              {Object.values(columnMapping)
                                .filter(Boolean)
                                .map((mappedColumn, index) => (
                                  <th key={index} className="p-2 text-left font-medium whitespace-nowrap">
                                    {mappedColumn}
                                  </th>
                                ))}
                              <th className="p-2 text-left font-medium whitespace-nowrap">Catégorie trouvée</th>
                              <th className="p-2 text-left font-medium whitespace-nowrap">Fournisseur trouvé</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedData.slice(0, 5).map((row, rowIndex) => {
                              const mappedProduct = mapRow(row)
                              const category = mappedProduct.category_id
                                ? findCategoryById(mappedProduct.category_id)
                                : null
                              const fournisseur = mappedProduct.supplier
                                ? findFournisseurByName(mappedProduct.supplier)
                                : null
                              return (
                                <tr key={rowIndex} className="border-b">
                                  {Object.entries(columnMapping)
                                    .filter(([_, mappedColumn]) => mappedColumn)
                                    .map(([originalColumn, _], colIndex) => (
                                      <td key={colIndex} className="p-2 whitespace-nowrap">
                                        {row[originalColumn] !== undefined && row[originalColumn] !== null
                                          ? String(row[originalColumn]).length > 50
                                            ? String(row[originalColumn]).substring(0, 50) + '...'
                                            : row[originalColumn]
                                          : ""}
                                      </td>
                                    ))}
                                  <td className="p-2 whitespace-nowrap">
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
                                  <td className="p-2 whitespace-nowrap">
                                    {fournisseur ? (
                                      <Badge variant="secondary" className="text-xs">
                                        {fournisseur.nom}
                                      </Badge>
                                    ) : mappedProduct.supplier ? (
                                      <Badge variant="destructive" className="text-xs">
                                        Non trouvé
                                      </Badge>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">Aucun</span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                        {parsedData.length > 5 && (
                          <div className="p-2 text-center text-muted-foreground">
                            + {parsedData.length - 5} autres produits
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {validationErrors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erreurs de validation</AlertTitle>
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
                      Retour
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={debugData}>
                        Debug
                      </Button>
                      <Button onClick={validateData}>Valider et continuer</Button>
                    </div>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Importer les images</h3>
                    <p className="text-sm text-muted-foreground">Associez des images à vos produits (optionnel)</p>
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
                          {imageFiles.length} images sélectionnées
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
                          Changer les images
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-medium">Sélectionner des images</p>
                        <p className="text-sm text-muted-foreground">Glissez-déposez vos images ici</p>
                        <p className="text-xs text-muted-foreground mt-4">
                          Nommez vos images avec l'ID du produit (ex: PROD001.jpg)
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
                    <h4 className="font-medium">Correspondance des images</h4>
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
                                  Aucune image
                                </Badge>
                              )}
                            </div>
                          )
                        })}
                        {parsedData.length > 10 && (
                          <div className="p-2 text-center text-muted-foreground">
                            + {parsedData.length - 10} autres produits
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Retour
                    </Button>
                    <Button onClick={importProducts} disabled={isImportingToAPI}>
                      {isImportingToAPI && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Importer les produits
                    </Button>
                  </div>
                </div>
              )}
              {step === 3 && importProgress > 0 && (
                <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
                  <Card className="w-full max-w-sm">
                    <CardHeader>
                      <CardTitle>Import en cours</CardTitle>
                      <CardDescription>Veuillez patienter pendant l'importation des produits</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress value={importProgress} className="h-2" />
                      <p className="text-center text-sm">
                        {importProgress < 100
                          ? "Traitement des données..."
                          : "Importation terminée!"}
                      </p>
                      {isImportingToAPI && (
                        <p className="text-center text-sm text-muted-foreground">
                          Envoi des données à l'API...
                        </p>
                      )}
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
                      <h3 className="text-2xl font-medium">Importation terminée!</h3>
                      <p className="text-muted-foreground">
                        {parsedData.length} produits importés avec succès
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Résumé de l'importation</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="border rounded-md p-4 space-y-2">
                        <p className="text-sm text-muted-foreground">Produits importés</p>
                        <p className="text-2xl font-bold">{parsedData.length}</p>
                      </div>
                      <div className="border rounded-md p-4 space-y-2">
                        <p className="text-sm text-muted-foreground">Images associées</p>
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
                      Importer d'autres produits
                    </Button>
                    <Button onClick={goToPlanogramEditor}>Aller à l'éditeur de planogramme</Button>
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