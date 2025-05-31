"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import Papa from "papaparse"
import { FileSpreadsheet, CheckCircle2, AlertCircle, ChevronRight, ArrowLeft } from "lucide-react"
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import '@/components/multilingue/i18n.js';

interface StoreData {
  magasin_id: string
  nom_magasin: string
  surface?: number
  longueur?: number
  largeur?: number
  zones_configurees?: boolean
  adresse?: string
  date_creation?: string
  date_modification?: string
}
interface MagasinImportProps {
  onMagasinsImported?: (magasins: StoreData[]) => void;
  existingData: any[];
  isComplete: boolean;
}
export function MagasinImport({ onMagasinsImported, existingData = [], isComplete }: MagasinImportProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const textDirection = isRTL ? 'rtl' : 'ltr';
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState<number>(1)
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<StoreData[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [importProgress, setImportProgress] = useState<number>(0)
  const [rawData, setRawData] = useState<any[]>([])
  const [importedStores, setImportedStores] = useState<StoreData[]>(existingData || [])
  
  const [magasins, setMagasins] = useState<any[]>(existingData);
  const [isFileValid, setIsFileValid] = useState<boolean>(true);

  const [showAddForm, setShowAddForm] = useState(true);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);
  const [editField, setEditField] = useState<{key: string, value: any} | null>(null);
  const [newStore, setNewStore] = useState<Omit<StoreData, 'date_creation' | 'date_modification'> & {
    date_creation?: string;
  }>({
    magasin_id: "",
    nom_magasin: "",
    surface: undefined,
    longueur: undefined,
    largeur: undefined,
    zones_configurees: undefined,
    adresse: "",
    date_creation: "",
  });

  useEffect(() => {
    if (isComplete && existingData.length > 0) {
      setImportedStores(existingData);
      setStep(5); // Aller directement à l'affichage si déjà complété
    }
  }, [isComplete, existingData]);

  const handleImport = (newData: StoreData[]) => {
    setImportedStores(newData);
    if (onMagasinsImported) {
      onMagasinsImported(newData); // Envoie toutes les données mises à jour
    }
  };


  // formulaire d'ajout
  // Fonction pour gérer les changements dans le formulaire d'ajout
const handleNewStoreChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setNewStore(prev => ({
    ...prev,
    [name]: value
  }));
};

// Fonction pour ajouter un nouveau magasin
const handleAddStore = () => {
  if (!newStore.magasin_id || !newStore.nom_magasin) {
    toast({
      title: "Erreur",
      description: "L'ID et le nom du magasin sont obligatoires",
      variant: "destructive",
    });
    return;
  }

  const now = new Date().toISOString();
  
  const storeToAdd: StoreData = {
    ...newStore,
    surface: newStore.surface ? Number(newStore.surface) : undefined,
    longueur: newStore.longueur ? Number(newStore.longueur) : undefined,
    largeur: newStore.largeur ? Number(newStore.largeur) : undefined,
    zones_configurees: newStore.zones_configurees === "true",
    date_creation: now,
    date_modification: now,
  };

  const updatedStores = [...importedStores, storeToAdd];
  setImportedStores(prev => [...prev, storeToAdd]);
  handleImport(updatedStores);
  
  setNewStore({
    magasin_id: "",
    nom_magasin: "",
    surface: undefined,
    longueur: undefined,
    largeur: undefined,
    zones_configurees: undefined,
    adresse: "",
    date_creation: "",
  });

  toast({
    title: "Succès",
    description: "Le magasin a été ajouté avec succès",
    variant: "default",
  });
};

// Fonction pour supprimer un magasin
const handleDeleteStore = (storeId: string) => {
  const updatedStores = importedStores.filter(store => store.magasin_id !== storeId);
  setImportedStores(updatedStores);
  handleImport(updatedStores);
  toast({
    title: "Succès",
    description: "Magasin supprimé avec succès",
    variant: "default",
  });
};

// Fonction pour démarrer la modification
const handleStartEdit = (store: StoreData) => {
  setEditingStore(store);
};

// Fonction pour valider les modifications
const handleSaveEdit = () => {
  if (!editingStore || !editField) return;

  const updatedStores = importedStores.map(s => 
    s.magasin_id === editingStore.magasin_id 
      ? {...s, [editField.key]: editField.value}
      : s
  );

  setImportedStores(updatedStores);
  handleImport(updatedStores);
  setEditingStore(null);
  setEditField(null);
  
  toast({
    title: "Succès",
    description: "Magasin modifié avec succès",
    variant: "default",
  });
};

// Fonction pour gérer le double-clic sur un champ
const handleFieldDoubleClick = (store: StoreData, fieldName: string, value: any) => {
  if (editingStore?.magasin_id === store.magasin_id) {
    setEditField({key: fieldName, value});
  }
};

// Fonction pour annuler la modification
const handleCancelEdit = () => {
  setEditingStore(null);
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
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    setIsFileValid(true); // Réinitialiser l'état de validation

  const showFileError = (fileType: string, message: string) => {
    setIsFileValid(false);
    toast({
      title: `Erreur ${fileType}`,
      description: message,
      variant: "destructive",
    });
  };

    if (fileExtension === "csv") {
      const buffer = await file.arrayBuffer();
      const decoder = new TextDecoder('windows-1252');
      const fileContent = decoder.decode(buffer);

      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        delimitersToGuess: [',', ';', '\t', '|'],
        transform: (value) => {
          if (typeof value === 'string') {
            return value.trim();
          }
          return value;
        },
        complete: (results) => {
          const processedData = results.data.map((row: any) => {
            const processedRow: any = {};
            for (const key in row) {
              processedRow[key] = row[key];
            }
            return processedRow;
          });
          
          setRawData(processedData);
          handleParsedData(processedData as StoreData[]);
        },
        error: (error) => {
          toast({
            title: "Erreur CSV",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) throw new Error("Aucune donnée de fichier");

          const buffer = data instanceof ArrayBuffer ? data : await file.arrayBuffer();
          const workbook = XLSX.read(buffer, {
            type: 'array',
            codepage: 65001,
            cellText: true,
            cellDates: true,
            dense: true
          });

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            defval: "",
            raw: false,
            dateNF: 'YYYY-MM-DD',
            blankrows: false
          }) as any[];

          const processedData = jsonData.map(row => {
            const processedRow: any = {};
            for (const key in row) {
              processedRow[key] = cleanCellValue(row[key]);
            }
            return processedRow;
          });

          setRawData(processedData);
          handleParsedData(processedData as StoreData[]);

        } catch (error) {
          showFileError("Excel", error instanceof Error ? error.message : "Erreur inconnue");
        }
      };
      
      reader.onerror = () => showFileError("Fichier", "Erreur lors de la lecture du fichier");
      reader.readAsArrayBuffer(file);
    } else {
      showFileError("Format", "Seuls les fichiers CSV (UTF-8) ou Excel (.xlsx, .xls) sont acceptés");
    }
  };

  const cleanCellValue = (value: any): any => {
    if (value === null || value === undefined) return "";
    if (typeof value === 'string') {
      return value
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim();
    }
    if (value instanceof Date) return value.toISOString().split('T')[0];
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? "true" : "false";
    return value;
  };

  const handleParsedData = (data: StoreData[]) => {
    if (data.length === 0) {
      setIsFileValid(false);
      toast({
        title: "Fichier vide",
        description: "Le fichier importé ne contient aucune donnée.",
        variant: "destructive",
      });
      return;
    }
  
    const filteredData = data.filter((row) => {
      return Object.values(row).some((value) => value !== undefined && value !== null && value !== "");
    });
  
    if (filteredData.length === 0) {
      setIsFileValid(false);
      toast({
        title: "Aucune donnée valide",
        description: "Le fichier ne contient aucune donnée valide.",
        variant: "destructive",
      });
      return;
    }
  
    setParsedData(filteredData);
    setIsFileValid(true);

    const firstRow = data[0]
    const mapping: Record<string, string> = {}

    Object.keys(firstRow).forEach((column) => {
      const lowerColumn = column.toLowerCase().trim()

      if (lowerColumn.includes("magasin_id") || lowerColumn.includes("id")) {
        mapping[column] = "magasin_id"
      } 
      else if (lowerColumn.includes("nom_magasin") || lowerColumn.includes("nom")) {
        mapping[column] = "nom_magasin"
      }
      else if (lowerColumn.includes("surface")) {
        mapping[column] = "surface"
      }
      else if (lowerColumn.includes("longueur")) {
        mapping[column] = "longueur"
      }
      else if (lowerColumn.includes("largeur")) {
        mapping[column] = "largeur"
      }
      else if (lowerColumn.includes("zones_configurees") || lowerColumn.includes("zones")) {
        mapping[column] = "zones_configurees"
      }
      else if (lowerColumn.includes("adresse")) {
        mapping[column] = "adresse"
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

    if (!Object.values(columnMapping).includes("magasin_id")) {
      errors.push(t('magasinImport.storeIdRequired'))
    }

    if (!Object.values(columnMapping).includes("nom_magasin")) {
      errors.push(t('magasinImport.storeNameRequired'))
    }

    parsedData.forEach((row, index) => {
      const idColumn = Object.entries(columnMapping).find(([_, value]) => value === "magasin_id")?.[0]
      const nameColumn = Object.entries(columnMapping).find(([_, value]) => value === "nom_magasin")?.[0]

      if (idColumn) {
        const idValue = row[idColumn]
        if (idValue === undefined || idValue === null || idValue === "") {
          errors.push(`Ligne ${index + 1}: Identifiant du magasin manquant`)
        }
      }

      if (nameColumn) {
        const nameValue = row[nameColumn]
        if (nameValue === undefined || nameValue === null || nameValue === "") {
          errors.push(`Ligne ${index + 1}: Nom du magasin manquant`)
        }
      }
    })

    setValidationErrors(errors)

    if (errors.length === 0) {
      setStep(3)
    }
  }

  const importStores = () => {
    const validStores = parsedData.map((row) => {
      const mappedStore: StoreData = {
        magasin_id: "",
        nom_magasin: "",
      };
      
      Object.entries(columnMapping).forEach(([originalCol, mappedCol]) => {
        if (mappedCol && row[originalCol] !== undefined && row[originalCol] !== null) {
          if (mappedCol === "magasin_id") {
            mappedStore.magasin_id = String(row[originalCol]);
          } else if (mappedCol === "surface" || mappedCol === "longueur" || mappedCol === "largeur") {
            mappedStore[mappedCol] = Number(row[originalCol]) || 0;
          } else if (mappedCol === "zones_configurees") {
            mappedStore.zones_configurees = row[originalCol] === "true" || row[originalCol] === "1";
          } else {
            mappedStore[mappedCol as keyof StoreData] = row[originalCol];
          }
        }
      });
      
      return mappedStore;
    }).filter(store => store.magasin_id && store.nom_magasin);
    const mergedStores = [...importedStores, ...validStores];
  
    setImportedStores(mergedStores);
    handleImport(mergedStores);

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
    <div className="container max-w-4xl mx-auto py-6 mt-6" dir={textDirection}>
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
          <CardTitle className="text-2xl"> {t("magasinImport.title")}</CardTitle>
          <CardDescription>
          {t("magasinImport.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <Badge variant={step >= 1 ? "default" : "outline"}>1</Badge>
              <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>{t("magasinImport.selectFile")}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />

              <Badge variant={step >= 2 ? "default" : "outline"}>2</Badge>
              <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>{t("magasinImport.mapColonne")}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />

              <Badge variant={step >= 3 ? "default" : "outline"}>3</Badge>
              <span className={step >= 3 ? "font-medium" : "text-muted-foreground"}>{t("magasinImport.import")}</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{t("magasinImport.title")}</h3>
                <p className="text-sm text-muted-foreground">
                {t("magasinImport.description1")}
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
      {isFileValid ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <AlertCircle className="h-5 w-5 text-red-500" />
      )}
    </div>
    <p className="font-medium">{file.name}</p>
    <p className="text-sm text-muted-foreground">
      {isFileValid ? `${parsedData.length} magasins détectés` : "Fichier non valide"}
    </p>
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation()
        setFile(null)
        setParsedData([])
        setIsFileValid(true)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }}
    >
      {t("productImport.changeFile")}
    </Button>
    {!isFileValid && (
      <Alert variant="destructive" className="mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
        {t("magasinImport.fichierNotValid")}
        </AlertDescription>
      </Alert>
    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium">{t("magasinImport.select")}</p>
                    <p className="text-sm text-muted-foreground">{t("magasinImport.dragdrop")}</p>
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
    <Button 
      onClick={() => setStep(2)} 
      disabled={!isFileValid || parsedData.length === 0}
    >
      {t("productImport.generateurContinuer")}
    </Button>
  </div>
)}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{t("magasinImport.mapColonne")}</h3>
                <p className="text-sm text-muted-foreground">
                {t("magasinImport.associer")}
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
                            <option value=""> {t("productImport.columnsStep.ignoreColumn")}</option>
                            <option value="magasin_id">ID Magasin</option>
                            <option value="nom_magasin">{t("magasinImport.requiredNamePlaceholder")}</option>
                            <option value="surface">{t("magasinImport.surface")}</option>
                            <option value="longueur">{t("magasinImport.longeur")}</option>
                            <option value="largeur">{t("magasinImport.largeur")}</option>
                            <option value="zones_configurees">{t("magasinImport.configureZone")}</option>
                            <option value="adresse">{t("magasinImport.addresse")}</option>
                            <option value="date_creation">{t("magasinImport.creationDate")}</option>
                            <option value="date_modification">{t("magasinImport.updateDate")}</option>
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
                    {t(`magasinImport.headers.${mappedColumn}`)}
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
            + {parsedData.length - 5} {t("magasinImport.otherStores")}
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
                      {validationErrors.length > 5 && <li>+ {validationErrors.length - 5} {t("magasinImport.otherErrors")}</li>}
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
                <h3 className="text-lg font-medium">{t("magasinImport.title")}</h3>
                <p className="text-sm text-muted-foreground">
                {t("magasinImport.pret")} {parsedData.length} {t("magasinImport.pret1")}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">{t("magasinImport.resume")}</h4>
                <div className="border rounded-md p-4">
                  <p className="text-sm text-muted-foreground">{t("magasinImport.Aimporter")}</p>
                  <p className="text-2xl font-bold">{parsedData.length}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                {t("productImport.retourGenerateur")}
                </Button>
                <Button onClick={importStores}>{t("magasinImport.validImport")}</Button>
              </div>
            </div>
          )}

          {step === 3 && importProgress > 0 && (
            <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
              <Card className="w-[400px]">
                <CardHeader>
                  <CardTitle>{t("categoryImport.importProgress.title")}</CardTitle>
                  <CardDescription>
                  {t("magasinImport.patient")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-center text-sm">
                    {importProgress < 100 
                      ? t('magasinImport.processing')
                      : t('magasinImport.complete')}
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
                  <h3 className="text-2xl font-medium">{t("categoryImport.completeStep.title")}</h3>
                  <p className="text-muted-foreground">
                    {parsedData.length} {t("magasinImport.succesImport")}
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
                 {t("magasinImport.autreMagasin")}
                </Button>
                <Button onClick={() => setStep(5)}>
                {t("magasinImport.viewMagasin")}
                </Button>
              </div>
            </div>
          )}

{step === 5 && (
  <div className="space-y-6">
    <div className="space-y-2">
      <h3 className="text-lg font-medium">{t("magasinImport.magasinImporter")}</h3>
      <p className="text-sm text-muted-foreground">
        {t("magasinImport.listeMagasin")}
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

    {/* Formulaire d'ajout de magasin */}
    {showAddForm && (
      <Card>
        <CardHeader>
          <CardTitle>{t("magasinImport.addMagasinDesc")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ID {t("magasinImport.magasin")}*</label>
              <Input
                name="magasin_id"
                value={newStore.magasin_id}
                onChange={handleNewStoreChange}
                placeholder="ID unique du magasin"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("magasinImport.requiredName")}</label>
              <Input
                name="nom_magasin"
                value={newStore.nom_magasin}
                onChange={handleNewStoreChange}
                placeholder={t("magasinImport.requiredNamePlaceholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("magasinImport.surface")}</label>
              <Input
                name="surface"
                type="number"
                value={newStore.surface || ""}
                onChange={handleNewStoreChange}
                placeholder={t("magasinImport.surfacePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("magasinImport.longeur")}</label>
              <Input
                name="longueur"
                type="number"
                value={newStore.longueur || ""}
                onChange={handleNewStoreChange}
                placeholder={t("magasinImport.longeurPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("magasinImport.largeurPlaceholder")}</label>
              <Input
                name="largeur"
                type="number"
                value={newStore.largeur || ""}
                onChange={handleNewStoreChange}
                placeholder={t("magasinImport.largeurPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("magasinImport.configureZone")}</label>
              <select
                name="zones_configurees"
                value={newStore.zones_configurees ? "true" : "false"}
                onChange={handleNewStoreChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="true">{t("magasinImport.oui")}</option>
                <option value="false">{t("magasinImport.non")}</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">{t("magasinImport.addresse")}</label>
              <Input
                name="adresse"
                value={newStore.adresse}
                onChange={handleNewStoreChange}
                placeholder={t("magasinImport.addressePlaceholder")}
              />
            </div>
          </div>
          <Button onClick={handleAddStore} className="mt-4">
          {t("magasinImport.addMagasin")}
          </Button>
        </CardContent>
      </Card>
    )}

    {/* Liste des magasins avec fonctionnalités de modification/suppression */}
    <div className="space-y-2">
      <h4 className="font-medium">{t("magasinImport.magasinImporter")}</h4>
      <div className="relative">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: "max-content" }}>
          <thead className="border-b">
          <tr>
            <th className="p-2 text-left font-medium">{t("Tactions")}</th>
            {Object.keys(importedStores[0] || {}).map((key) => (
              <th key={key} className="fpreviewTitlep-2 text-left font-medium">
                {t(`magasinImport.headers.${key}`)}
              </th>
            ))}
          </tr>
        </thead>
            <tbody>
              {importedStores.map((store, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  {/* Colonne Actions */}
                  <td className="p-2 flex gap-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteStore(store.magasin_id)}
                    >
                      {t("productImport.delete")}
                    </Button>
                    {editingStore?.magasin_id === store.magasin_id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>{t("magasinImport.valider1")}</Button>
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>{t("cancel")}</Button>
                      </div>
                    ) : (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleStartEdit(store)}
                      >
                        {t("modifier")}
                      </Button>
                    )}
                  </td>

                  {/* Autres colonnes */}
                  {Object.entries(store).map(([key, value]) => (
                    <td key={key} className="p-2">
                      {editingStore?.magasin_id === store.magasin_id && editField?.key === key ? (
                        key === 'zones_configurees' ? (
                          <select
                            value={editField.value ? "true" : "false"}
                            onChange={(e) => setEditField({key, value: e.target.value === "true"})}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="true">{t("magasinImport.oui")}</option>
                            <option value="false">{t("magasinImport.non")}</option>
                          </select>
                        ) : (
                          <Input
                            value={editField.value}
                            onChange={(e) => setEditField({key, value: e.target.value})}
                          />
                        )
                      ) : (
                        <span onDoubleClick={() => handleFieldDoubleClick(store, key, value)}>
                          {value === undefined || value === null || value === "" 
                            ? "-" 
                            : key === 'zones_configurees' 
                              ? value ? "Oui" : "Non"
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
        {t("productImport.back")}
      </Button>
      <Button onClick={() => window.location.href = "/magasins"}>
        {t("magasinImport.viewMagasin")}
      </Button>
    </div>
  </div>
)}
        </CardContent>
      </Card>
    </div>
  )
}