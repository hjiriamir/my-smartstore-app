"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import Papa from "papaparse"
import { FileSpreadsheet, CheckCircle2, AlertCircle, ChevronRight, ArrowLeft } from "lucide-react"
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import '@/components/multilingue/i18n.js'

interface ZoneData {
  zone_id: string
  nom_zone: string
  magasin_id: string
  description?: string
  emplacement?: string
  date_creation?: string
  date_modification?: string
}

export function ZonesImport() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const textDirection = isRTL ? 'rtl' : 'ltr'
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState<number>(1)
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ZoneData[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [importProgress, setImportProgress] = useState<number>(0)
  const [rawData, setRawData] = useState<any[]>([])
  const [importedZones, setImportedZones] = useState<ZoneData[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseFile(selectedFile)
    }
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

    if (fileExtension === "csv") {
      const buffer = await file.arrayBuffer()
      const decoder = new TextDecoder('windows-1252')
      const fileContent = decoder.decode(buffer)

      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        delimitersToGuess: [',', ';', '\t', '|'],
        transform: (value) => {
          if (typeof value === 'string') {
            return value.trim()
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
          handleParsedData(processedData as ZoneData[])
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
            type: 'array',
            codepage: 65001,
            cellText: true,
            cellDates: true,
            dense: true
          })

          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]

          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            defval: "",
            raw: false,
            dateNF: 'YYYY-MM-DD',
            blankrows: false
          }) as any[]

          const processedData = jsonData.map(row => {
            const processedRow: any = {}
            for (const key in row) {
              processedRow[key] = cleanCellValue(row[key])
            }
            return processedRow
          })

          setRawData(processedData)
          handleParsedData(processedData as ZoneData[])

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

  const cleanCellValue = (value: any): any => {
    if (value === null || value === undefined) return ""
    if (typeof value === 'string') {
      return value
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim()
    }
    if (value instanceof Date) return value.toISOString().split('T')[0]
    if (typeof value === 'number') return String(value)
    return value
  }

  const handleParsedData = (data: ZoneData[]) => {
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

      if (lowerColumn.includes("zone_id") || lowerColumn.includes("id")) {
        mapping[column] = "zone_id"
      } 
      else if (lowerColumn.includes("nom_zone") || lowerColumn.includes("nom")) {
        mapping[column] = "nom_zone"
      }
      else if (lowerColumn.includes("magasin_id") || lowerColumn.includes("magasin")) {
        mapping[column] = "magasin_id"
      }
      else if (lowerColumn.includes("description")) {
        mapping[column] = "description"
      }
      else if (lowerColumn.includes("emplacement")) {
        mapping[column] = "emplacement"
      }
      else if (lowerColumn.includes("date_creation") || lowerColumn.includes("created")) {
        mapping[column] = "date_creation"
      }
      else if (lowerColumn.includes("date_modification") || lowerColumn.includes("updated")) {
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

    if (!Object.values(columnMapping).includes("zone_id")) {
      errors.push("L'identifiant de la zone est requis")
    }

    if (!Object.values(columnMapping).includes("nom_zone")) {
      errors.push("Le nom de la zone est requis")
    }

    if (!Object.values(columnMapping).includes("magasin_id")) {
      errors.push("L'identifiant du magasin est requis")
    }

    parsedData.forEach((row, index) => {
      const idColumn = Object.entries(columnMapping).find(([_, value]) => value === "zone_id")?.[0]
      const nameColumn = Object.entries(columnMapping).find(([_, value]) => value === "nom_zone")?.[0]
      const storeColumn = Object.entries(columnMapping).find(([_, value]) => value === "magasin_id")?.[0]

      if (idColumn) {
        const idValue = row[idColumn]
        if (idValue === undefined || idValue === null || idValue === "") {
          errors.push(`Ligne ${index + 1}: Identifiant de zone manquant`)
        }
      }

      if (nameColumn) {
        const nameValue = row[nameColumn]
        if (nameValue === undefined || nameValue === null || nameValue === "") {
          errors.push(`Ligne ${index + 1}: Nom de zone manquant`)
        }
      }

      if (storeColumn) {
        const storeValue = row[storeColumn]
        if (storeValue === undefined || storeValue === null || storeValue === "") {
          errors.push(`Ligne ${index + 1}: Identifiant de magasin manquant`)
        }
      }
    })

    setValidationErrors(errors)

    if (errors.length === 0) {
      setStep(3)
    }
  }

  const importZones = () => {
    const validZones = parsedData.map((row) => {
      const mappedZone: ZoneData = {
        zone_id: "",
        nom_zone: "",
        magasin_id: ""
      }
      
      Object.entries(columnMapping).forEach(([originalCol, mappedCol]) => {
        if (mappedCol && row[originalCol] !== undefined && row[originalCol] !== null) {
          if (mappedCol === "zone_id") {
            mappedZone.zone_id = String(row[originalCol])
          } else if (mappedCol === "magasin_id") {
            mappedZone.magasin_id = String(row[originalCol])
          } else {
            mappedZone[mappedCol as keyof ZoneData] = row[originalCol]
          }
        }
      })
      
      return mappedZone
    }).filter(zone => zone.zone_id && zone.nom_zone && zone.magasin_id)
  
    setImportedZones(validZones)
    
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

    setTimeout(() => {
      clearInterval(interval)
      setImportProgress(100)
      setTimeout(() => {
        setStep(4)
      }, 500)
    }, 1000)
  }

  return (
    <div className="container max-w-4xl mx-auto py-6" dir={textDirection}>
      <Button 
        variant="outline" 
        onClick={() => window.location.href = "/Editor"}
        className={`flex items-center gap-2 mb-4 mt-14 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("productImport.backToEditor1")}
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Importation de zones</CardTitle>
          <CardDescription>
            Importez un fichier CSV ou Excel contenant vos zones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <Badge variant={step >= 1 ? "default" : "outline"}>1</Badge>
              <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>Sélection du fichier</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />

              <Badge variant={step >= 2 ? "default" : "outline"}>2</Badge>
              <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>Mapping des colonnes</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />

              <Badge variant={step >= 3 ? "default" : "outline"}>3</Badge>
              <span className={step >= 3 ? "font-medium" : "text-muted-foreground"}>Importation</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Importation de zones</h3>
                <p className="text-sm text-muted-foreground">
                  Sélectionnez un fichier CSV ou Excel contenant vos zones
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
                    <p className="text-sm text-muted-foreground">{parsedData.length} zones détectées</p>
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
                      Changer de fichier
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium">Sélectionnez un fichier</p>
                    <p className="text-sm text-muted-foreground">Glissez-déposez un fichier CSV ou Excel ici</p>
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
                <h3 className="text-lg font-medium">Mapping des colonnes</h3>
                <p className="text-sm text-muted-foreground">
                  Associez les colonnes de votre fichier aux champs de zone
                </p>
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
                        <div key={index} className="grid grid-cols-2 gap-4 items-center">
                          <div className="font-mono text-sm">{column}</div>
                          <select
                            className="w-full p-2 border rounded-md"
                            value={columnMapping[column] || ""}
                            onChange={(e) => updateColumnMapping(column, e.target.value)}
                          >
                            <option value="">-- Ignorer cette colonne --</option>
                            <option value="zone_id">ID Zone</option>
                            <option value="nom_zone">Nom de la zone</option>
                            <option value="magasin_id">ID Magasin</option>
                            <option value="description">Description</option>
                            <option value="emplacement">Emplacement</option>
                            <option value="date_creation">Date création</option>
                            <option value="date_modification">Date modification</option>
                          </select>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Aperçu des données</h4>
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
                                    ? <span className="font-mono">{String(row[originalColumn])}</span>
                                    : ""}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedData.length > 5 && (
                      <div className="p-2 text-center text-muted-foreground">
                        + {parsedData.length - 5} autres zones
                      </div>
                    )}
                  </div>
                </ScrollArea>
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

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Retour
                </Button>
                <Button onClick={validateData}>Valider et continuer</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Importation des zones</h3>
                <p className="text-sm text-muted-foreground">
                  Prêt à importer {parsedData.length} zones
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Résumé</h4>
                <div className="border rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Zones à importer</p>
                  <p className="text-2xl font-bold">{parsedData.length}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Retour
                </Button>
                <Button onClick={importZones}>Importer les zones</Button>
              </div>
            </div>
          )}

          {step === 3 && importProgress > 0 && (
            <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
              <Card className="w-[400px]">
                <CardHeader>
                  <CardTitle>Importation en cours</CardTitle>
                  <CardDescription>
                    Veuillez patienter pendant l'importation des zones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-center text-sm">
                    {importProgress < 100 
                      ? "Traitement des données..." 
                      : "Importation terminée !"}
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
                  <h3 className="text-2xl font-medium">Importation terminée</h3>
                  <p className="text-muted-foreground">
                    {parsedData.length} zones importées avec succès
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
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
                >
                  Importer d'autres zones
                </Button>
                <Button onClick={() => setStep(5)}>
                  Voir les zones importées
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Zones importées</h3>
                <p className="text-sm text-muted-foreground">
                  Liste des zones importées avec succès
                </p>
              </div>

              <ScrollArea className="h-[500px] border rounded-md">
                <table className="w-full text-sm">
                  <thead className="border-b sticky top-0 bg-background">
                    <tr>
                      {Object.keys(importedZones[0] || {}).map((key) => (
                        <th key={key} className="p-2 text-left font-medium capitalize">
                          {key.split('_').join(' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importedZones.map((zone, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        {Object.entries(zone).map(([key, value]) => (
                          <td key={key} className="p-2">
                            {value === undefined || value === null || value === "" 
                              ? "-" 
                              : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(4)}>
                  Retour
                </Button>
                <Button onClick={() => window.location.href = "/zones"}>
                  Voir toutes les zones
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}