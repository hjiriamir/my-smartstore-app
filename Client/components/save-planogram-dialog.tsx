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

  // stocker les planogrammes existants
  const [existingPlanograms, setExistingPlanograms] = useState<any[]>([]);
  const [selectedPlanogramId, setSelectedPlanogramId] = useState<string | null>(null);


  // Charger les planogrammes existants quand un magasin est sélectionné
  useEffect(() => {
    if (selectedMagasinId) {
      const fetchPlanograms = async () => {
        try {
          const response = await fetch(`http://localhost:8081/api/planogram/fetchPlanogramByStore/${selectedMagasinId}`);
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          const data = await response.json();
          // Extraire le tableau 'rows' de la réponse
          const planograms = data.rows || [];
          setExistingPlanograms(Array.isArray(planograms) ? planograms : []);
        } catch (error) {
          console.error("Erreur lors du chargement des planogrammes:", error);
          setExistingPlanograms([]);
          toast({
            title: "Erreur",
            description: "Impossible de charger la liste des planogrammes existants",
            variant: "destructive",
          });
        }
      };
  
      fetchPlanograms();
    } else {
      setExistingPlanograms([]);
      setSelectedPlanogramId(null);
    }
  }, [selectedMagasinId, toast]);
  //const [filesBaseName, setFilesBaseName] = useState(planogramConfig.name);
  //const [image2DUrl, setImage2DUrl] = useState("");
  //const [image3DUrl, setImage3DUrl] = useState("");
  //const [pdfUrl, setPdfUrl] = useState("");
  //const [isGeneratingFiles, setIsGeneratingFiles] = useState(false);
  const [dateFinPrevue, setDateFinPrevue] = useState<string>("");

  const generateMultiAngle3DImage = async (): Promise<File> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Créer un canvas composite
        const compositeCanvas = document.createElement('canvas');
        compositeCanvas.width = 2000; // Largeur suffisante pour 4 vues
        compositeCanvas.height = 1000;
        const ctx = compositeCanvas.getContext('2d');
        if (!ctx) throw new Error("Contexte 2D non disponible");
  
        // Dessiner un fond blanc
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
  
        // Liste des angles de vue
        const views = [
          { name: "Front", position: [0, height * 0.5, depth * 1.5], rotation: [0, 0, 0] },
          { name: "Left", position: [-width * 1.5, height * 0.5, 0], rotation: [0, Math.PI / 2, 0] },
          { name: "Back", position: [0, height * 0.5, -depth * 1.5], rotation: [0, Math.PI, 0] },
          { name: "Right", position: [width * 1.5, height * 0.5, 0], rotation: [0, -Math.PI / 2, 0] }
        ];
  
        // Capturer chaque vue
        for (let i = 0; i < views.length; i++) {
          const view = views[i];
          // Ici vous devrez implémenter la logique pour positionner la caméra
          // et capturer chaque vue (cela dépend de votre implémentation Three.js)
          // Ceci est un exemple simplifié
          const viewCanvas = await capture3DView(view.position, view.rotation);
          
          // Dessiner la vue sur le canvas composite
          const x = (i % 2) * 1000;
          const y = Math.floor(i / 2) * 500;
          ctx.drawImage(viewCanvas, x, y, 1000, 500);
          
          // Ajouter un label
          ctx.fillStyle = '#000000';
          ctx.font = '20px Arial';
          ctx.fillText(view.name, x + 20, y + 30);
        }
  
        // Convertir en fichier
        compositeCanvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Échec de la conversion en blob"));
            return;
          }
          const fileName = generateFileName(filesBaseName, "3d-multi-view", "png");
          resolve(new File([blob], fileName, { type: "image/png" }));
        }, 'image/png', 0.95);
      } catch (error) {
        reject(error);
      }
    });
  };
  
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
        // Try to find the canvas more reliably
        let threeCanvas: HTMLCanvasElement | null = null;
        
        // First try the specific class
        threeCanvas = document.querySelector('.planogram-3d-container canvas');
        
        // Fallback to any canvas with data-engine attribute
        if (!threeCanvas) {
          threeCanvas = document.querySelector('canvas[data-engine]');
        }
        
        // Final fallback to any canvas
        if (!threeCanvas) {
          threeCanvas = document.querySelector('canvas');
        }

        if (!threeCanvas) {
          throw new Error("Canvas 3D non trouvé");
        }

        // Wait for canvas to be rendered
        let attempts = 0;
        while ((threeCanvas.width === 0 || threeCanvas.height === 0) && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }

        if (threeCanvas.width === 0 || threeCanvas.height === 0) {
          throw new Error("Canvas 3D pas encore rendu");
        }

        // Create offscreen canvas
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = threeCanvas.width;
        offscreenCanvas.height = threeCanvas.height;
        
        const ctx = offscreenCanvas.getContext('2d');
        if (!ctx) throw new Error("Contexte 2D non disponible");

        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        
        // Draw 3D content
        ctx.drawImage(threeCanvas, 0, 0);

        // Convert to blob
        offscreenCanvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Échec de la conversion en blob"));
            return;
          }
          const fileName = generateFileName(filesBaseName, "3d-view", "png");
          resolve(new File([blob], fileName, { type: "image/png" }));
        }, 'image/png', 1.0);

      } catch (error) {
        console.error("Erreur lors de la génération 3D:", error);
        reject(error);
      }
    }, 2000); // Increased delay for 3D rendering
  });
};

const generatePDF = async (): Promise<File> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm"
      });

      // Définition des couleurs
      const colors = {
        primary: [41, 128, 185],    // Bleu primaire
        secondary: [52, 152, 219],  // Bleu secondaire
        dark: [44, 62, 80],         // Texte foncé
        light: [236, 240, 241],     // Fond clair
        white: [255, 255, 255],     // Blanc
        rowEven: [255, 255, 255],   // Ligne paire
        rowOdd: [245, 245, 245],     // Ligne impaire
        headerBlue: [33, 150, 243]
      };

      // Page de couverture
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
      
      doc.setTextColor(...colors.white);
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

      // Page d'informations
      doc.setFillColor(...colors.light);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 15, 'F');
      doc.setTextColor(...colors.dark);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Détails du planogramme: ${name}`, 10, 10);
      
      // Informations de base
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      
      doc.setTextColor(...colors.dark);
      doc.setFont("helvetica", "bold");
      doc.text("Informations de base", 10, 25);
      
      doc.setDrawColor(...colors.secondary);
      doc.line(10, 27, 60, 27);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      const furnitureType = furnitureTypes.find(ft => ft.furniture_type_id === selectedFurnitureTypeId);

      let facesDescription = "";
      if (planogramConfig.furnitureType === "planogram") {
        facesDescription = "1 face (frontale)";
      } else if (planogramConfig.furnitureType === "gondola") {
        facesDescription = "2 faces (avant/arrière)";
      } else if (planogramConfig.furnitureType === "shelves-display") {
        facesDescription = "4 faces (gauche/front/arrière/droite)";
      }

      doc.text(`Type: ${furnitureType?.nomType || ''} - ${facesDescription}`, 10, 35);
      doc.text(`Dimensions: ${planogramConfig.furnitureDimensions.width}m (L) × ${planogramConfig.furnitureDimensions.height}m (H) × ${planogramConfig.furnitureDimensions.depth}m (P)`, 10, 40);
      doc.text(`Sections: ${planogramConfig.rows}`, 10, 45);
      doc.text(`Emplacements: ${planogramConfig.columns}`, 10, 50);
      doc.text(`Produits placés: ${placedProductsCount}`, 10, 55);

      // Configuration des faces
      doc.setFont("helvetica", "bold");
      doc.text("Configuration des faces:", 10, 65);

      if (planogramConfig.furnitureType === "gondola" && planogramConfig.gondolaDetails) {
        doc.setFont("helvetica", "normal");
        doc.text(`- Face avant: ${planogramConfig.gondolaDetails.nbre_colonnes_front} colonnes × ${planogramConfig.gondolaDetails.nbre_etageres_front} étagères`, 15, 70);
        doc.text(`- Face arrière: ${planogramConfig.gondolaDetails.nbre_colonnes_back} colonnes × ${planogramConfig.gondolaDetails.nbre_etageres_back} étagères`, 15, 75);
      } else if (planogramConfig.furnitureType === "shelves-display" && planogramConfig.shelvesDisplayDetails) {
        doc.setFont("helvetica", "normal");
        doc.text(`- Face gauche: ${planogramConfig.shelvesDisplayDetails.nb_colonnes_left_right} colonnes × ${planogramConfig.shelvesDisplayDetails.nb_etageres_left_right} étagères`, 15, 70);
        doc.text(`- Face avant: ${planogramConfig.shelvesDisplayDetails.nbre_colonnes_front} colonnes × ${planogramConfig.rows} étagères`, 15, 75);
        doc.text(`- Face arrière: ${planogramConfig.shelvesDisplayDetails.nbre_colonnes_back} colonnes × ${planogramConfig.rows} étagères`, 15, 80);
        doc.text(`- Face droite: ${planogramConfig.shelvesDisplayDetails.nb_colonnes_left_right} colonnes × ${planogramConfig.shelvesDisplayDetails.nb_etageres_left_right} étagères`, 15, 85);
      }
      
      // Page des produits
      doc.addPage();
      doc.setFillColor(...colors.light);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 15, 'F');
      doc.setTextColor(...colors.dark);
      doc.setFont("helvetica", "bold");
      doc.text("Détail des produits", 10, 10);
      
      doc.setDrawColor(...colors.secondary);
      doc.line(10, 12, 60, 12);

      // Configuration du tableau
      const headers = ["Produit", "Code", "Quantité", "Position", "Face"];
      const columnWidths = [70, 30, 20, 30, 20];
      const startX = 10;
      let startY = 25;
      const rowHeight = 8;

      // Fonction pour dessiner l'en-tête du tableau
      const drawTableHeader = (y: number) => {
        doc.setFillColor(...colors.headerBlue); // Utilisation du bleu pour l'arrière-plan
        doc.setTextColor(...colors.white);
        doc.setFont("helvetica", "bold");
        
        let xPos = startX;
        headers.forEach((header, i) => {
          doc.rect(xPos, y, columnWidths[i], rowHeight, 'F');
          doc.text(
            header,
            xPos + columnWidths[i] / 2,
            y + rowHeight / 2 + 2,
            { align: "center" }
          );
          xPos += columnWidths[i];
        });
      };

      // Préparation des données
      const rows = cells
        .filter(cell => cell.instanceId !== null && cell.furnitureType === planogramConfig.furnitureType)
        .map((cell) => {
          const productInstance = productInstances.find(pi => pi.instanceId === cell.instanceId);
          if (!productInstance) return null;
          
          const product = products.find(p => p.primary_id === productInstance.productId);
          if (!product) return null;
          
          let face = "front";
          if (planogramConfig.furnitureType === "gondola") {
            face = cell.x < planogramConfig.columns / 2 ? "front" : "back";
          } else if (planogramConfig.furnitureType === "shelves-display") {
            const quarterWidth = planogramConfig.columns / 4;
            if (cell.x < quarterWidth) face = "left";
            else if (cell.x < quarterWidth * 2) face = "front";
            else if (cell.x < quarterWidth * 3) face = "back";
            else face = "right";
          }
          
          const etagereNumber = planogramConfig.rows - cell.y;
          return [
            product.name,
            product.primary_id,
            (cell.quantity || 1).toString(),
            `E${etagereNumber}C${cell.x + 1}`,
            face
          ];
        })
        .filter(Boolean) as string[][];

      // Dessin du tableau
      drawTableHeader(startY);
      startY += rowHeight;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      rows.forEach((row, rowIndex) => {
        // Nouvelle page si nécessaire
        if (startY > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          startY = 25;
          drawTableHeader(startY);
          startY += rowHeight;
        }

        // Fond alterné
        doc.setFillColor(...(rowIndex % 2 === 0 ? colors.rowEven : colors.rowOdd));
        
        // Dessin des cellules
        let xPos = startX;
        row.forEach((cell, cellIndex) => {
          doc.rect(xPos, startY, columnWidths[cellIndex], rowHeight, 'F');
          xPos += columnWidths[cellIndex];
        });

        // Texte des cellules
        xPos = startX;
        row.forEach((cell, cellIndex) => {
          doc.text(
            cell,
            xPos + 3,
            startY + rowHeight / 2 + 2,
            { 
              maxWidth: columnWidths[cellIndex] - 6,
              align: cellIndex === 0 ? "left" : "center"
            }
          );
          xPos += columnWidths[cellIndex];
        });

        startY += rowHeight;
      });

      // Génération du fichier PDF
      const pdfBlob = doc.output("blob");
      const fileName = generateFileName(filesBaseName, "planogram", "pdf");
      resolve(new File([pdfBlob], fileName, { type: "application/pdf" }));
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      reject(error);
    }
  });
};
const generateAndUploadFiles = async () => {
  setIsGeneratingFiles(true);
  
  try {
    const originalViewMode = viewMode;
    
    // Générer l'image 2D
    setViewMode("2D");
    await new Promise(resolve => setTimeout(resolve, 1000));
    const image2DFile = await generate2DImage().catch(e => {
      console.error("Erreur 2D:", e);
      return null;
    }); 
    
    // Générer l'image 3D multi-angles
    setViewMode("3D");
    await new Promise(resolve => setTimeout(resolve, 2000));
    const image3DFile = await generateMultiAngle3DImage().catch(e => {
      console.warn("Échec génération 3D multi-angles:", e.message);
      // Fallback à la vue simple si échec
      return generate3DImage().catch(e => {
        console.warn("Échec génération 3D simple:", e.message);
        return null;
      });
    });
    
    // Générer le PDF
    const pdfFile = await generatePDF().catch(e => {
      console.warn("Échec génération PDF:", e.message);
      return null;
    });

    setViewMode(originalViewMode);
    
    // Upload des fichiers
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

  // send email
  const sendAssignmentEmail = async (receiverEmail: string) => {
    try {
      if (!currentUser?.email) {
        console.warn("Aucun email d'expéditeur disponible");
        return;
      }
  
      const response = await fetch("http://localhost:8081/api/emails/sendBasicEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          senderEmail: currentUser.email,
          receiverEmail: receiverEmail,
          subject: `Nouvelle tâche assignée: ${name}`,
          message: `Bonjour,\n\nUne nouvelle tâche de type "${selectedTaskType}" vous a été assignée concernant le planogramme "${name}".\n\nCordialement,\n${currentUser.username}`
        }),
        credentials: "include"
      });
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
  
      console.log("Email envoyé avec succès");
      toast({
        title: "Email envoyé",
        description: `Un email a été envoyé à ${receiverEmail}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      toast({
        title: "Erreur",
        description: "L'email n'a pas pu être envoyé",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (selectedUserId && !dateFinPrevue) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date de fin prévue pour la tâche",
        variant: "destructive",
      });
      return;
    }
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
      const productPositions = (await Promise.all(
        cells
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
              const productPrimaryId = await fetchProductIdByCode(product.primary_id);
              
              return {
                product_id: productPrimaryId,
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
          })
      )).filter(Boolean);
  
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
        planogram_id: selectedPlanogramId || undefined,
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
          date_debut: new Date().toISOString().split('T')[0], // Date du jour
          date_fin_prevue: dateFinPrevue || null,
        } : undefined,
      };
  
      /* ------------------------------------------------------------------
       * 5. Appel API avec gestion d'erreur détaillée
       * ------------------------------------------------------------------ */
      let response;
      try {
        response = await fetch(
          "http://localhost:8081/api/planogram/createFullPlanogramm",
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
          description: selectedPlanogramId 
            ? "Meubles ajoutés au planogramme existant avec succès"
            : "Nouveau planogramme créé avec succès",
          variant: "default",
        });
  
        // Envoyer l'email si un utilisateur est sélectionné
        if (selectedUserId) {
          const selectedUser = users.find(u => u.id === selectedUserId);
          if (selectedUser?.email) {
            await sendAssignmentEmail(selectedUser.email);
          }
        }
  
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

// Effet pour pré-remplir les champs quand un planogramme est sélectionné
useEffect(() => {
  if (selectedPlanogramId) {
    const selectedPlanogram = existingPlanograms.find(
      (p) => p.planogram_id.toString() === selectedPlanogramId
    );
    if (selectedPlanogram) {
      setName(selectedPlanogram.nom);
      setDescription(selectedPlanogram.description || ""); // Pré-remplit la description
    }
  } else {
    // Réinitialiser si aucun planogramme n'est sélectionné
    setName(planogramConfig.name);
    setDescription("");
  }
}, [selectedPlanogramId, existingPlanograms, planogramConfig.name]);


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
              {/* Sélection d'un planogramme existant */}
              <div>
                <label className="text-sm font-medium">Planogramme existant</label>
                <Select 
                  value={selectedPlanogramId || ""} 
                  onValueChange={setSelectedPlanogramId}
                  disabled={isLoading || !selectedMagasinId || existingPlanograms.length === 0}
                >
                  <SelectTrigger className="mt-1" dir={isArabic ? "rtl" : "ltr"}>
                    <SelectValue placeholder={
                      !selectedMagasinId 
                        ? "Sélectionnez d'abord un magasin" 
                        : existingPlanograms.length === 0
                          ? "Aucun planogramme disponible"
                          : "Sélectionner un planogramme existant"
                    } />
                  </SelectTrigger>
                  {existingPlanograms.length > 0 && (
                    <SelectContent>
                      {existingPlanograms.map((planogram) => (
                        <SelectItem key={planogram.planogram_id} value={planogram.planogram_id.toString()}>
                          {planogram.nom} (ID: {planogram.planogram_id}, Magasin: {planogram.magasin_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  )}
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Sélectionnez un planogramme existant pour y ajouter des meubles au lieu d'en créer un nouveau
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">{t("savePlanogramDialog.nameLabel")}</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  placeholder={t("savePlanogramDialog.namePlaceholder")}
                  dir={isArabic ? "rtl" : "ltr"}
                  disabled={!!selectedPlanogramId} // Désactivé si un planogramme est sélectionné
                />
                {selectedPlanogramId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Le nom est verrouillé car vous modifiez un planogramme existant
                  </p>
                )}
              </div>
                  {/* Sélection du description du planogramme */}
                                <div>
                    <label className="text-sm font-medium">{t("savePlanogramDialog.descriptionLabel")}</label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1"
                      placeholder={t("savePlanogramDialog.descriptionPlaceholder")}
                      dir={isArabic ? "rtl" : "ltr"}
                      disabled={!!selectedPlanogramId} // Désactivé si un planogramme est sélectionné
                    />
                    {selectedPlanogramId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        La description est verrouillée car vous modifiez un planogramme existant
                      </p>
                    )}
                  </div>

              {/* Sélection du statut du planogramme */}
              <div>
                <label className="text-sm font-medium">Statut du planogramme</label>
                <Select 
                  value={selectedPlanogramStatus} 
                  onValueChange={setSelectedPlanogramStatus}
                  disabled={!!selectedPlanogramId} // Désactivé si un planogramme existant est sélectionné
                >
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
                {selectedPlanogramId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Le statut est verrouillé pour les planogrammes existants
                  </p>
                )}
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

                  {/* Sélection du date de fin prevu */}
                <div>
                  <label className="text-sm font-medium">Date de fin prévue</label>
                  <Input
                    type="date"
                    value={dateFinPrevue}
                    onChange={(e) => setDateFinPrevue(e.target.value)}
                    className="mt-1"
                    dir={isArabic ? "rtl" : "ltr"}
                    min={new Date().toISOString().split('T')[0]} // Date minimum = aujourd'hui
                  />
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