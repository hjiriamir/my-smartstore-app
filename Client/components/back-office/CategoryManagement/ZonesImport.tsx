"use client"

import { useState, useRef, useEffect } from "react"
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
interface ZonesImportProps {
  importedMagasins: any[];
  importedCategories: any[];
  onZonesImported?: (zones: any[]) => void;
  existingData?: ZoneData[]; 
  isComplete?: boolean;
}

export function ZonesImport({importedMagasins, 
  importedCategories, 
  onZonesImported, 
  existingData = [], 
  isComplete = false 
}: ZonesImportProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const textDirection = isRTL ? 'rtl' : 'ltr'
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState(isComplete ? 5 : 1);
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ZoneData[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [importProgress, setImportProgress] = useState<number>(0)
  const [rawData, setRawData] = useState<any[]>([])
  const [importedZones, setImportedZones] = useState<ZoneData[]>(existingData);

  const [showAddForm, setShowAddForm] = useState(true);
  const [editingZone, setEditingZone] = useState<ZoneData | null>(null);
  const [editField, setEditField] = useState<{key: string, value: any} | null>(null);
  const [existingZones, setExistingZones] = useState<ZoneData[]>([]);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [newZone, setNewZone] = useState<Omit<ZoneData, 'date_creation' | 'date_modification'> & {
    date_creation?: string;
  }>({
    zone_id: "",
    nom_zone: "",
    magasin_id: "",
    description: "",
    emplacement: "",
    date_creation: "",
  });

  // Fonction pour gérer les changements dans le formulaire d'ajout
const handleNewZoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setNewZone(prev => ({
    ...prev,
    [name]: value
  }));
};

// Fonction pour ajouter une nouvelle zone
const handleAddZone = () => {
  if (!newZone.zone_id || !newZone.nom_zone || !newZone.magasin_id) {
    toast({
      title: "Erreur",
      description: "L'ID, le nom de la zone et l'ID du magasin sont obligatoires",
      variant: "destructive",
    });
    return;
  }

  const now = new Date().toISOString();
  
  const zoneToAdd: ZoneData = {
    ...newZone,
    date_creation: now,
    date_modification: now,
  };

  const updatedZones = [...importedZones, zoneToAdd];
  setImportedZones(updatedZones);
  handleImport(updatedZones);
  
  setNewZone({
    zone_id: "",
    nom_zone: "",
    magasin_id: "",
    description: "",
    emplacement: "",
    date_creation: "",
  });

  toast({
    title: "Succès",
    description: "La zone a été ajoutée avec succès",
    variant: "default",
  });
};

useEffect(() => {
  setImportedZones(existingData);
  if (isComplete && existingData.length > 0 && step !== 5) {
    setStep(5); // Aller à l'affichage si déjà complété
  }
}, [existingData, isComplete]);

const handleImport = (data: ZoneData[]) => {
  setImportedZones(data);
  if (onZonesImported) {
    onZonesImported(data);
  }
};

// Fonction pour supprimer une zone
const handleDeleteZone = (zoneId: string) => {
  const updatedZones = importedZones.filter(z => z.zone_id !== zoneId);
  setImportedZones(updatedZones);
  handleImport(updatedZones);
  toast({
    title: "Succès",
    description: "Zone supprimée avec succès",
    variant: "default",
  });
};

// Fonction pour démarrer la modification
const handleStartEdit = (zone: ZoneData) => {
  setEditingZone(zone);
};

// Fonction pour valider les modifications
const handleSaveEdit = () => {
  if (!editingZone || !editField) return;

  const updatedZones = importedZones.map(z => 
    z.zone_id === editingZone.zone_id 
      ? {...z, [editField.key]: editField.value}
      : z
  );

  setImportedZones(updatedZones);
  handleImport(updatedZones);
  setEditingZone(null);
  setEditField(null);
  
  toast({
    title: "Succès",
    description: "Zone modifiée avec succès",
    variant: "default",
  });
};

// Fonction pour gérer le double-clic sur un champ
const handleFieldDoubleClick = (zone: ZoneData, fieldName: string, value: any) => {
  if (editingZone?.zone_id === zone.zone_id) {
    setEditField({key: fieldName, value});
  }
};

// Fonction pour annuler la modification
const handleCancelEdit = () => {
  setEditingZone(null);
  setEditField(null);
};


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
      errors.push(t('zoneImport.zoneIdError'))
    }

    if (!Object.values(columnMapping).includes("nom_zone")) {
      errors.push(t('zoneImport.zoneNomError'))
    }

    if (!Object.values(columnMapping).includes("magasin_id")) {
      errors.push(t('zoneImport.error'))
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
  
    // Fusion avec données existantes
  const mergedZones = [...importedZones, ...validZones];
  handleImport(mergedZones)
    
  setImportProgress(0);
  const interval = setInterval(() => {
    setImportProgress((prev) => {
      if (prev >= 95) {
        clearInterval(interval);
        return prev;
      }
      return prev + 5;
    });
  }, 100);

  setTimeout(() => {
    clearInterval(interval);
    setImportProgress(100);
    setTimeout(() => {
      setStep(4);
      //setShowCompletionPopup(true); 
    }, 500);
  }, 1000);
  }
 
  return (
    <div className="container max-w-4xl mx-auto py-6" dir={textDirection}>
      <Button 
        variant="outline" 
        onClick={() => window.location.href = "/management-page"}
        className={`flex items-center gap-2 mb-4 mt-14 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("productImport.backToEditor1")}
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("zoneImport.title")}</CardTitle>
          <CardDescription>
          {t("zoneImport.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <Badge variant={step >= 1 ? "default" : "outline"}>1</Badge>
              <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>{t("zoneImport.selectFile")}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />

              <Badge variant={step >= 2 ? "default" : "outline"}>2</Badge>
              <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>{t("zoneImport.mapColonne")}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />

              <Badge variant={step >= 3 ? "default" : "outline"}>3</Badge>
              <span className={step >= 3 ? "font-medium" : "text-muted-foreground"}>{t("zoneImport.import")}</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{t("zoneImport.title")}</h3>
                <p className="text-sm text-muted-foreground">
                {t("zoneImport.description1")}
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
                      {t("productImport.changeFile")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium">{t("zoneImport.select")}</p>
                    <p className="text-sm text-muted-foreground">{t("zoneImport.dragdrop")}</p>
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
                  <Button onClick={() => setStep(2)}>{t("productImport.continue")}</Button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{t("zoneImport.mapColonne")}</h3>
                <p className="text-sm text-muted-foreground">
                {t("zoneImport.associer")}
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
                            <option value="">{t("productImport.columnsStep.ignoreColumn")}</option>
                            <option value="zone_id">ID Zone</option>
                            <option value="nom_zone">{t("zoneImport.zoneName")}</option>
                            <option value="magasin_id">{t("categoryImport.headers.magasin_id")}</option>
                            <option value="description">{t("furnitureEditor.description")}</option>
                            <option value="emplacement">{t("furnitureEditor.emplacement")}</option>
                            <option value="date_creation">{t("categoryImport.headers.date_creation")}</option>
                            <option value="date_modification">{t("categoryImport.headers.date_modification")}</option>
                          </select>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-4">
  <h4 className="font-medium">{t("productImport.columnsStep.previewTitle")}</h4>
  <div className="border rounded-md overflow-auto">
    <ScrollArea className="h-[200px] w-full" orientation="horizontal">
      <div className="p-4 min-w-max">
        <table className={`w-full text-sm ${isRTL ? 'rtl-table' : 'ltr-table'}`}>
          <thead className="border-b">
            <tr>
              {Object.values(columnMapping)
                .filter(Boolean)
                .map((mappedColumn, index) => (
                  <th 
                    key={index} 
                    className="p-2 text-left font-medium whitespace-nowrap"
                    style={{ 
                      textAlign: isRTL ? 'right' : 'left',
                      direction: isRTL ? 'rtl' : 'ltr'
                    }}
                  >
                    {t(`zoneImport.headers.${mappedColumn}`)}
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
                    <td 
                      key={colIndex} 
                      className="p-2 whitespace-nowrap"
                      style={{
                        textAlign: isRTL ? 'right' : 'left',
                        direction: isRTL ? 'rtl' : 'ltr'
                      }}
                    >
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
            + {parsedData.length - 5} {t("productImport.moreProducts")}
          </div>
        )}
      </div>
    </ScrollArea>
  </div>
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
                <Button onClick={validateData}>{t("productImport.validateContinue")}</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{t("zoneImport.title")}</h3>
                <p className="text-sm text-muted-foreground">
                {t("zoneImport.pret")} {parsedData.length} {t("zoneImport.pret1")}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">{t("zoneImport.resume")}</h4>
                <div className="border rounded-md p-4">
                  <p className="text-sm text-muted-foreground">{t("zoneImport.Aimporter")}</p>
                  <p className="text-2xl font-bold">{parsedData.length}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                {t("productImport.retourGenerateur")}
                </Button>
                <Button onClick={importZones}>{t("zoneImport.validImport")}</Button>
              </div>
            </div>
          )}

          {step === 3 && importProgress > 0 && (
            <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
              <Card className="w-[400px]">
                <CardHeader>
                  <CardTitle>{t("productImport.importationEnCours")}</CardTitle>
                  <CardDescription>
                  {t("zoneImport.patient")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-center text-sm">
                    {importProgress < 100 
                      ? t('zoneImport.processing')
                      : t('zoneImport.complete')}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          {/* Popup de complétion (affiché si showCompletionPopup est true) */}
    {showCompletionPopup && <CompletionPopup />}

          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-medium">{t("zoneImport.complete")}</h3>
                  <p className="text-muted-foreground">
                    {parsedData.length} {t("zoneImport.succesImport")}
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
                 {t("zoneImport.autreZone")}
                </Button>
                <Button onClick={() => setStep(5)}>
                {t("zoneImport.viewZone")}
                </Button>
              </div>
            </div>
          )}

{step === 5 && (
  <div className="space-y-6">
    <div className="space-y-2">
      <h3 className="text-lg font-medium">{t("zoneImport.zoneImporter")}</h3>
      <p className="text-sm text-muted-foreground">
        {t("zoneImport.listeZones")}
      </p>
    </div>

    {/* Bouton pour afficher/masquer le formulaire */}
    <div className="flex justify-end">
      <Button 
        variant="outline" 
        onClick={() => setShowAddForm(!showAddForm)}
        className="mb-4"
      >
       {showAddForm ? t("magasinImport.hideFormulaire") : t("magasinImport.showFormulaire")}
      </Button>
    </div>

    {/* Formulaire d'ajout de zone */}
    {showAddForm && (
      <Card>
        <CardHeader>
          <CardTitle>{t("zoneImport.formulaire.addZone")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("zoneImport.headers.zone_id")}*</label>
              <Input
                name="zone_id"
                value={newZone.zone_id}
                onChange={handleNewZoneChange}
                placeholder={t("zoneImport.formulaire.zone_idPlaceholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("zoneImport.headers.nom_zone")}*</label>
              <Input
                name="nom_zone"
                value={newZone.nom_zone}
                onChange={handleNewZoneChange}
                placeholder={t("zoneImport.headers.nom_zone")}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("categoryImport.headers.magasin_id")}*</label>
              <div className="flex gap-2">
              <select
                name="magasin_id"
                value={newZone.magasin_id || ""}
                onChange={handleNewZoneChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">{t("categoryImport.formulaire.selectMagasin")}</option>
                {importedMagasins.map((magasin) => (
                  <option key={magasin.magasin_id} value={magasin.magasin_id}>
                    {magasin.nom_magasin} (ID: {magasin.magasin_id})
                  </option>
                ))}
              </select>
              <Input
                name="magasin_id"
                value={newZone.magasin_id || ""}
                onChange={handleNewZoneChange}
                placeholder={t("categoryImport.formulaire.orPutID")}
                className="w-full"
                required
              />
            </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("zoneImport.formulaire.zoneNameDescription")}</label>
              <Input
                name="description"
                value={newZone.description}
                onChange={handleNewZoneChange}
                placeholder={t("zoneImport.formulaire.zoneNameDescription")}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">{t("locationTitle")}</label>
              <Input
                name="emplacement"
                value={newZone.emplacement}
                onChange={handleNewZoneChange}
                placeholder={t("zoneImport.formulaire.emplacement")}
              />
            </div>
          </div>
          <Button onClick={handleAddZone} className="mt-4">
          {t("zoneImport.formulaire.addZoneButton")}
          </Button>
        </CardContent>
      </Card>
    )}

    {/* Liste des zones avec fonctionnalités de modification/suppression */}
    <div className="space-y-2">
      <h4 className="font-medium">{t("zoneImport.zoneImporter")}</h4>
      <div className="relative">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: "max-content" }}>
            <thead className="border-b">
              <tr>
                <th className="p-2 text-left font-medium">{t("Tactions")}</th>
                {Object.keys(importedZones[0] || {}).map((key) => (
                  <th key={key} className="fpreviewTitlep-2 text-left font-medium">
                  {t(`zoneImport.headers.${key}`)}
                </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {importedZones.map((zone, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  {/* Colonne Actions */}
                  <td className="p-2 flex gap-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteZone(zone.zone_id)}
                    >
                      {t("productImport.delete")}
                    </Button>
                    {editingZone?.zone_id === zone.zone_id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}> {t("magasinImport.valider1")}</Button>
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>{t("cancel")}</Button>
                      </div>
                    ) : (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleStartEdit(zone)}
                      >
                        {t("modifier")}
                      </Button>
                    )}
                  </td>

                  {/* Autres colonnes */}
                  {Object.entries(zone).map(([key, value]) => (
                    <td key={key} className="p-2">
                      {editingZone?.zone_id === zone.zone_id && editField?.key === key ? (
                        <Input
                          value={editField.value}
                          onChange={(e) => setEditField({key, value: e.target.value})}
                        />
                      ) : (
                        <span onDoubleClick={() => handleFieldDoubleClick(zone, key, value)}>
                          {value === undefined || value === null || value === "" 
                            ? "-" 
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

    <div className="flex justify-between">
      <Button variant="outline" onClick={() => setStep(4)}>
        {t("productImport.retourGenerateur")}
      </Button>
      <Button onClick={() => window.location.href = "/zones"}>
        {t("zoneImport.viewZone")}
      </Button>
    </div>
  </div>
)}
        </CardContent>
      </Card>
      
    </div>
  
)
}