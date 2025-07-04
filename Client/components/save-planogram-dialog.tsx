"use client"

import { useState, useEffect } from "react"
import { Grid, ImageIcon  } from "lucide-react"
import { useTranslation } from "react-i18next"
import i18next from "i18next"
import { FileText as FileTextIcon } from 'lucide-react';
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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
import { BoxIcon  } from 'lucide-react';


interface SavePlanogramDialogProps {
  planogramConfig: PlanogramConfig;
  cells: PlanogramCell[];
  products: Product[];
  productInstances: ProductInstance[];
  onSave?: (name: string, description: string, furnitureProducts: any) => void;
  filesBaseName: string;
  setFilesBaseName: (name: string) => void;
  uploadFile: (file: File, fileName: string) => Promise<string>;
  generateFileName: (suffix: string, extension: string) => string;
  viewMode: "2D" | "3D";
  setViewMode: (mode: "2D" | "3D") => void;
  image2DUrl: string;
  setImage2DUrl: (url: string) => void;
  image3DUrl: string;
  setImage3DUrl: (url: string) => void;
  pdfUrl: string;
  setPdfUrl: (url: string) => void;
  isGeneratingFiles: boolean;
  setIsGeneratingFiles: (isGenerating: boolean) => void;
  children: React.ReactNode;
}

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

export function SavePlanogramDialog({
  planogramConfig,
  cells,
  products,
  productInstances,
  onSave,
  filesBaseName,
  setFilesBaseName,
  uploadFile,
  generateFileName,
  viewMode,
  setViewMode,
  image2DUrl,
  setImage2DUrl,
  image3DUrl,
  setImage3DUrl,
  pdfUrl,
  setPdfUrl,
  isGeneratingFiles,
  setIsGeneratingFiles,
  children
}: SavePlanogramDialogProps) {
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

  //const [filesBaseName, setFilesBaseName] = useState(planogramConfig.name);
  //const [image2DUrl, setImage2DUrl] = useState("");
  //const [image3DUrl, setImage3DUrl] = useState("");
  //const [pdfUrl, setPdfUrl] = useState("");
  //const [isGeneratingFiles, setIsGeneratingFiles] = useState(false);
  


  
 // Génération image 2D
 const generate2DImage = async (): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Attendre que le rendu 2D soit prêt
    setTimeout(async () => {
      try {
        // Essayer plusieurs sélecteurs possibles
        const selectors = [
          '.planogram-2d-container',
          '.grid.bg-white',
          '.planogram-grid'
        ];
        
        let element: HTMLElement | null = null;
        for (const selector of selectors) {
          element = document.querySelector(selector);
          if (element) break;
        }

        if (!element) {
          throw new Error("Élément 2D non trouvé");
        }

        const canvas = await html2canvas(element as HTMLElement, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: true,
          useCORS: true
        });

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Erreur blob"));
            return;
          }
          const fileName = generateFileName(filesBaseName, "2d-view", "png")
          resolve(new File([blob], fileName, { type: "image/png" }));
        }, 'image/png', 0.95);
      } catch (error) {
        reject(error);
      }
    }, 1000); // Délai pour s'assurer que le rendu est prêt
  });
};

const generate3DImage = async (): Promise<File> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        // Essayer plusieurs sélecteurs de canvas
        const selectors = [
          '.planogram-3d-container canvas',
          'canvas[data-engine]',
          'canvas'
        ];
        
        let threeCanvas: HTMLCanvasElement | null = null;
        for (const selector of selectors) {
          threeCanvas = document.querySelector(selector);
          if (threeCanvas) break;
        }

        if (!threeCanvas) {
          throw new Error("Canvas 3D non trouvé");
        }

        // Vérifier que le canvas est prêt
        if (threeCanvas.width === 0 || threeCanvas.height === 0) {
          throw new Error("Canvas 3D pas encore rendu");
        }

        // Créer un nouveau canvas pour la capture
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = threeCanvas.width;
        offscreenCanvas.height = threeCanvas.height;
        
        const ctx = offscreenCanvas.getContext('2d');
        if (!ctx) throw new Error("Contexte 2D non disponible");

        // 1. Dessiner un fond blanc
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        
        // 2. Dessiner le contenu 3D
        ctx.drawImage(threeCanvas, 0, 0);

        // Convertir en blob avec une meilleure qualité
        return new Promise((resolveBlob) => {
          offscreenCanvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error("Échec de la conversion en blob"));
              return;
            }
            const fileName = generateFileName(filesBaseName, "3d-view", "png");
            resolve(new File([blob], fileName, { type: "image/png" }));
          }, 'image/png', 1.0); // Qualité maximale
        });

      } catch (error) {
        console.error("Erreur lors de la génération 3D:", error);
        reject(error);
      }
    }, 2000); // Augmenter le délai pour le rendu 3D
  });
};

const generatePDF = async (): Promise<File> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm"
      });

      // Couleurs personnalisées
      const primaryColor = [41, 128, 185];
      const secondaryColor = [52, 152, 219];
      const darkColor = [44, 62, 80];
      const lightColor = [236, 240, 241];

      doc.setFont("helvetica");
      
      // Page de couverture
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(36);
      doc.text("PLANOGRAMME", 105, 40, { align: "center" });
      doc.setFontSize(24);
      doc.text(name, 105, 50, { align: "center" });
      
      doc.setFontSize(16);
      doc.text(`Généré le ${new Date().toLocaleDateString()}`, 105, 70, { align: "center" });
      
      if (selectedMagasinId) {
        const magasin = magasins.find(m => m.magasin_id === selectedMagasinId);
        doc.text(`Magasin: ${magasin?.nom_magasin || ''}`, 105, 80, { align: "center" });
      }
      
      doc.addPage();

      // En-tête de page
      doc.setFillColor(...lightColor);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 15, 'F');
      doc.setTextColor(...darkColor);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Détails du planogramme: ${name}`, 10, 10);
      
      // Informations principales
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      
      // Section informations de base
      doc.setTextColor(...darkColor);
      doc.setFont("helvetica", "bold");
      doc.text("Informations de base", 10, 25);
      
      doc.setDrawColor(...secondaryColor);
      doc.line(10, 27, 60, 27);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      
      const furnitureType = furnitureTypes.find(ft => ft.furniture_type_id === selectedFurnitureTypeId);
      doc.text(`Type: ${furnitureType?.nomType || ''}`, 10, 35);
      doc.text(`Dimensions: ${planogramConfig.furnitureDimensions.width}m (L) × ${planogramConfig.furnitureDimensions.height}m (H) × ${planogramConfig.furnitureDimensions.depth}m (P)`, 10, 40);
      doc.text(`Sections: ${planogramConfig.rows}`, 10, 45);
      doc.text(`Emplacements: ${planogramConfig.columns}`, 10, 50);
      doc.text(`Produits placés: ${placedProductsCount}`, 10, 55);
      
      // Section produits
      doc.addPage();
      doc.setFillColor(...lightColor);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 15, 'F');
      doc.setTextColor(...darkColor);
      doc.setFont("helvetica", "bold");
      doc.text("Détail des produits", 10, 10);
      
      doc.setDrawColor(...secondaryColor);
      doc.line(10, 12, 60, 12);
      
      // Tableau des produits
      const headers = ["Produit", "Code", "Quantité", "Position", "Face"];
      const columnWidths = [70, 30, 20, 30, 20];
      const rows: string[][] = [];
      
      cells
        .filter(cell => cell.instanceId !== null && cell.furnitureType === planogramConfig.furnitureType)
        .forEach((cell) => {
          const productInstance = productInstances.find(pi => pi.instanceId === cell.instanceId);
          if (!productInstance) return;
          
          const product = products.find(p => p.primary_id === productInstance.productId);
          if (!product) return;
          
          let face = "front";
          if (planogramConfig.furnitureType === "gondola") {
            face = cell.x < planogramConfig.columns / 2 ? "front" : "back";
          } else if (planogramConfig.furnitureType === "shelves-display") {
            const quarterWidth = planogramConfig.columns / 4;
            if (cell.x < quarterWidth) {
              face = "left";
            } else if (cell.x < quarterWidth * 2) {
              face = "front";
            } else if (cell.x < quarterWidth * 3) {
              face = "back";
            } else {
              face = "right";
            }
          }
          
          // MODIFICATION ICI: Inverser l'étagère pour que 1 soit en bas
          const etagereNumber = planogramConfig.rows - cell.y;
          rows.push([
            product.name,
            product.primary_id,
            (cell.quantity || 1).toString(),
            `E${etagereNumber}C${cell.x + 1}`, // E1 devient la première étagère en bas
            face
          ]);
        });
      
      // Style du tableau
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      let yPos = 25;
      
      // En-tête du tableau
      doc.setFillColor(...primaryColor);
      headers.forEach((header, i) => {
        doc.rect(
          headers.slice(0, i).reduce((a, _, j) => a + columnWidths[j], 10),
          yPos - 8,
          columnWidths[i],
          8,
          'F'
        );
        doc.text(
          header,
          headers.slice(0, i).reduce((a, _, j) => a + columnWidths[j], 10) + columnWidths[i] / 2,
          yPos - 3,
          { align: "center" }
        );
      });
      
      // Lignes du tableau
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      
      rows.forEach((row, rowIndex) => {
        yPos = 25 + (rowIndex + 1) * 8;
        
        doc.setFillColor(rowIndex % 2 === 0 ? 255 : 245, 245, 245);
        row.forEach((cell, cellIndex) => {
          doc.rect(
            headers.slice(0, cellIndex).reduce((a, _, j) => a + columnWidths[j], 10),
            yPos - 8,
            columnWidths[cellIndex],
            8,
            'F'
          );
        });
        
        row.forEach((cell, cellIndex) => {
          doc.text(
            cell,
            headers.slice(0, cellIndex).reduce((a, _, j) => a + columnWidths[j], 10) + 3,
            yPos - 3,
            { maxWidth: columnWidths[cellIndex] - 6 }
          );
        });
        
        if (yPos > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPos = 25;
        }
      });
      
      // Générer le blob PDF
      const pdfBlob = doc.output("blob");
      const fileName = generateFileName(filesBaseName, "planogram", "pdf");
      resolve(new File([pdfBlob], fileName, { type: "application/pdf" }));
    } catch (error) {
      reject(error);
    }
  });
};

const generateAndUploadFiles = async () => {
  setIsGeneratingFiles(true);
  
  try {
    // Sauvegarder le mode de vue actuel
    const originalViewMode = viewMode;
    
    // Générer l'image 2D
    setViewMode("2D");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Délai pour le rendu
    
    console.log("Génération image 2D");
    const image2DFile = await generate2DImage()
      .then(file => {
        console.log("2D généré:", file.name);
        return file;
      })
      .catch(e => {
        console.error("Erreur 2D:", e);
        return null;
      }); 
    
    // Générer l'image 3D
    setViewMode("3D");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Délai plus long pour le rendu 3D
    
    const image3DFile = await generate3DImage().catch(e => {
      console.warn("Échec génération 3D:", e.message);
      return null;
    });
    
    // Générer le PDF (peut être fait en parallèle)
    const pdfFile = await generatePDF().catch(e => {
      console.warn("Échec génération PDF:", e.message);
      return null;
    });

    // Restaurer le mode de vue original
    setViewMode(originalViewMode);
    
    // Upload seulement les fichiers générés avec succès
    const uploadResults = {
      image2DUrl: "",
      image3DUrl: "",
      pdfUrl: ""
    };

    if (image2DFile) {
      try {
        uploadResults.image2DUrl = await uploadFile(image2DFile, image2DFile.name);
      } catch (e) {
        console.error("Erreur upload 2D:", e);
      }
    }
    
    if (image3DFile) {
      try {
        uploadResults.image3DUrl = await uploadFile(image3DFile, image3DFile.name);
      } catch (e) {
        console.error("Erreur upload 3D:", e);
      }
    }
    
    if (pdfFile) {
      try {
        uploadResults.pdfUrl = await uploadFile(pdfFile, pdfFile.name);
      } catch (e) {
        console.error("Erreur upload PDF:", e);
      }
    }
    
    return uploadResults;
  } catch (error) {
    console.error("Erreur lors de la génération des fichiers:", error);
    throw error;
  } finally {
    setIsGeneratingFiles(false);
  }
};

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

  useEffect(() => {
    console.log("State update:", {
      selectedMagasinId,
      selectedZoneId,
      selectedFurnitureTypeId,
      isLoading,
      isGeneratingFiles
    });
  }, [selectedMagasinId, selectedZoneId, selectedFurnitureTypeId, isLoading, isGeneratingFiles]);

  useEffect(() => {
    console.log("État actuel :", {
      magasin: selectedMagasinId,
      zone: selectedZoneId,
      typeMeuble: selectedFurnitureTypeId,
      utilisateur: currentUser?.idUtilisateur,
      isLoading,
      isGeneratingFiles
    });
  }, [selectedMagasinId, selectedZoneId, selectedFurnitureTypeId, currentUser, isLoading, isGeneratingFiles]);

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

  // fetch products IDs
  const fetchProductIdsMap = async (productCodes: string[]): Promise<Record<string, number>> => {
    try {
      const response = await fetch(
        `http://localhost:8081/api/produits/getProductIdsFromCodes?productCodes=${encodeURIComponent(productCodes.join(','))}`,
        {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
  
      const productsData = await response.json();
      
      return productsData.reduce((acc: Record<string, number>, product: any) => {
        acc[product.produit_id] = product.id;
        return acc;
      }, {});
    } catch (error) {
      console.error("Erreur lors de la récupération des IDs produits:", error);
      throw error;
    }
  };

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
  // Fonction pour récupérer l'ID d'un produit à partir de son code
  const fetchProductIdByCode = async (productCode: string): Promise<number> => {
    try {
      const response = await fetch(`http://localhost:8081/api/produits/getProductIdsByCodes/${productCode}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return await response.json(); // Retourne directement l'ID
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'ID pour ${productCode}:`, error);
      throw error;
    }
  };


  const handleSave = async () => {
    console.log("handleSave déclenchée !", { currentUser });
    // 1. Vérification des champs obligatoires
    if (!selectedMagasinId || !selectedZoneId || !name || !currentUser?.idUtilisateur || !selectedFurnitureTypeId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires (magasin, zone, nom, type de meuble)",
        variant: "destructive",
      });
      return;
    }
  
    setIsLoading(true);
  
    try {
      /* ------------------------------------------------------------------
       * 2. Générer et uploader les fichiers (2D, 3D, PDF)
       * ------------------------------------------------------------------ */
      let files = { image2DUrl: "", image3DUrl: "", pdfUrl: "" };
  
      try {
        setIsGeneratingFiles(true);
        files = await generateAndUploadFiles();
  
        setImage2DUrl(files.image2DUrl);
        setImage3DUrl(files.image3DUrl);
        setPdfUrl(files.pdfUrl);
      } catch (fileError) {
        console.error("Erreur lors de la génération des fichiers:", fileError);
        toast({
          title: "Avertissement",
          description: "Le planogramme sera enregistré sans les fichiers joints",
          variant: "default",
        });
      } finally {
        setIsGeneratingFiles(false);
      }
  
      /* ------------------------------------------------------------------
       * 3. Construire les positions produits avec les vrais IDs
       * ------------------------------------------------------------------ */
      const productPositionsPromises = cells
        .filter(
          (cell) =>
            cell.instanceId !== null &&
            cell.furnitureType === planogramConfig.furnitureType
        )
        .map(async (cell) => {
          const productInstance = productInstances.find(
            (pi) => pi.instanceId === cell.instanceId
          );
          if (!productInstance) return null;
  
          const product = products.find(
            (p) => p.primary_id === productInstance.productId
          );
          if (!product) return null;
  
          try {
            // Récupérer l'ID primaire du produit
            const productPrimaryId = await fetchProductIdByCode(product.primary_id);
            
            return {
              product_id: productPrimaryId, // Utiliser l'ID primaire ici
              position: cell.x + 1,
              quantite: cell.quantity || 1,
              face: cell.face || getFaceFromPosition(cell.x),
              etagere: cell.etagere || cell.y + 1,
              colonne: cell.colonne || cell.x + 1
            };
          } catch (error) {
            console.error(`Erreur avec le produit ${product.primary_id}:`, error);
            return null;
          }
        });
  
      // Attendre que toutes les promesses se résolvent
      const productPositions = (await Promise.all(productPositionsPromises)).filter(Boolean);
  
      if (productPositions.length === 0) {
        toast({
          title: "Erreur",
          description: "Aucune position produit valide à enregistrer",
          variant: "destructive",
        });
        return;
      }
  
      /* ------------------------------------------------------------------
       * 4. Préparer le payload pour l'API
       * ------------------------------------------------------------------ */
      const requestData = {
        magasin_id: selectedMagasinId,
        zone_id: selectedZoneId,
        nom: name,
        description,
        created_by: currentUser.id || currentUser.idUtilisateur,
        statut: selectedPlanogramStatus,
        furnitures: [
          {
            furniture_type_id: Number(selectedFurnitureTypeId),
            largeur: planogramConfig.furnitureDimensions.width,
            hauteur: planogramConfig.furnitureDimensions.height,
            profondeur: planogramConfig.furnitureDimensions.depth,
            name: name,
            type: planogramConfig.furnitureType,
            color: "#f0f0f0",
            imageUrl_2D: files.image2DUrl,
            imageUrl_3D: files.image3DUrl,
            pdfUrl: files.pdfUrl,
            // Ajout des configurations spécifiques
            ...(planogramConfig.furnitureType === "planogram" && {
              nb_colonnes_unique_face: planogramConfig.planogramDetails?.nbre_colonnes,
              nb_etageres_unique_face: planogramConfig.planogramDetails?.nbre_etageres
            }),
            ...(planogramConfig.furnitureType === "gondola" && {
              nb_colonnes_front_back: planogramConfig.gondolaDetails?.nbre_colonnes_front + planogramConfig.gondolaDetails?.nbre_colonnes_back,
              nb_etageres_front_back: planogramConfig.gondolaDetails?.nbre_etageres_front + planogramConfig.gondolaDetails?.nbre_etageres_back
            }),
            ...(planogramConfig.furnitureType === "shelves-display" && {
              nb_colonnes_front_back: planogramConfig.shelvesDisplayDetails?.nbre_colonnes_front + planogramConfig.shelvesDisplayDetails?.nbre_colonnes_back,
              nb_etageres_front_back: planogramConfig.shelvesDisplayDetails?.nbre_etageres_front + planogramConfig.shelvesDisplayDetails?.nbre_etageres_back,
              nb_colonnes_left_right: planogramConfig.shelvesDisplayDetails?.nb_colonnes_left_right * 2, // *2 pour gauche+droite
              nb_etageres_left_right: planogramConfig.shelvesDisplayDetails?.nb_etageres_left_right
            }),
            productPositions,
          },
        ],
        tache: selectedUserId ? {
          idUser: selectedUserId,
          statut: "à faire",
          type: selectedTaskType,
          commentaire: `Tâche liée au planogramme ${name}`,
        } : undefined,
      };
  
      /* ------------------------------------------------------------------
       * 5. Appel API avec gestion d'erreur détaillée
       * ------------------------------------------------------------------ */
      let response;
      try {
        response = await fetch(
          "http://localhost:8081/api/planogram/createFullPlanogram",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData),
            credentials: "include",
          }
        );
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw {
            response: {
              status: response.status,
              data: errorData,
            },
            message: errorData.message || `Erreur HTTP: ${response.status}`,
          };
        }
  
        const result = await response.json();
        console.log("Réponse API:", result);
  
        toast({
          title: "Succès",
          description: "Planogramme enregistré avec succès",
          variant: "default",
        });
  
        /* ------------------------------------------------------------------
         * 6. Callback onSave (si fourni)
         * ------------------------------------------------------------------ */
        if (onSave) {
          onSave(name, description, {
            products: productPositions,
            image2DUrl: files.image2DUrl,
            image3DUrl: files.image3DUrl,
            pdfUrl: files.pdfUrl,
          });
        }
      } catch (apiError) {
        throw {
          response: apiError.response || null,
          request: !apiError.response,
          message: apiError.message || "Erreur lors de l'appel API",
        };
      }
    } catch (error: any) {
      console.error("Erreur complète:", error);
      let errorMessage = "Une erreur est survenue lors de l'enregistrement";
      
      if (error.response) {
        // Si c'est une erreur HTTP
        errorMessage = `Erreur ${error.response.status}: ${error.response.data?.message || error.message}`;
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        errorMessage = "Pas de réponse du serveur - veuillez vérifier votre connexion";
      } else {
        // Quelque chose s'est mal passé lors de la configuration de la requête
        errorMessage = error.message || "Erreur inconnue";
      }
    
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

               {/* Sélection des fichiers */}
              <div>
                <label className="text-sm font-medium">Nom des fichiers exportés</label>
                <Input
                  value={filesBaseName}
                  onChange={(e) => setFilesBaseName(e.target.value)}
                  className="mt-1"
                  placeholder="Entrez le nom de base pour les fichiers"
                  dir={isArabic ? "rtl" : "ltr"}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ce nom sera utilisé pour les fichiers image et PDF générés.
                </p>
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
                      {(image2DUrl || image3DUrl || pdfUrl) && (
  <div className="mt-3 p-3 bg-blue-50 rounded-md">
    <h5 className="text-xs font-semibold text-blue-700 mb-2">Fichiers générés :</h5>
    <div className="flex flex-wrap gap-2">
      {image2DUrl && (
        <a 
          href={image2DUrl.startsWith('http') ? image2DUrl : `http://localhost:8081/${image2DUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline flex items-center"
        >
          <ImageIcon className="h-4 w-4 mr-1" />
          Vue 2D
        </a>
      )}
      {image3DUrl && (
        <a 
          href={`http://localhost:8081/${image3DUrl}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-blue-600 hover:underline flex items-center"
        >
          <BoxIcon className="h-4 w-4 mr-1" />
          Vue 3D
        </a>
      )}
      {pdfUrl && (
        <a 
          href={`http://localhost:8081/${pdfUrl}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-blue-600 hover:underline flex items-center"
        >
          <FileTextIcon className="h-4 w-4 mr-1" />
          Fiche technique
        </a>
      )}
    </div>
  </div>
)}
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
  disabled={isLoading || isGeneratingFiles}
>
  {isGeneratingFiles ? (
    <>
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Génération des fichiers...
    </>
  ) : isLoading ? (
    "Enregistrement..."
  ) : (
    "Enregistrer"
  )}
</Button>
</DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}