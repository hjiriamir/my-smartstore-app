    "use client"

    import { useState, useEffect } from "react"
    import { useTranslation } from "react-i18next"
    import { Button } from "@/components/ui/button"
    import { Input } from "@/components/ui/input"
    import { Card } from "@/components/ui/card"
    import html2canvas from "html2canvas";
    import { jsPDF } from "jspdf";
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    import { useFurnitureStore } from "@/lib/furniture-store"
    import { Save } from "lucide-react"
    import { Image as ImageIcon, Box as BoxIcon, FileText as FileTextIcon } from "lucide-react";
    import type { Product } from "@/lib/product-store"
    import type { FurnitureItem, Magasin, Zone, User, FurnitureType } from "@/components/types/furniture-types"
    import { getFurnitureIcon } from '@/lib/furniture-utils';

    interface SaveFurnitureDialogProps {
        furniture: FurnitureItem
        products: Product[]
        cells: { id: string; x: number; y: number; productId: string | null; quantity?: number }[]
        onSave?: (planogramId: string) => void
        viewMode: "2D" | "3D" 
        setViewMode: (mode: "2D" | "3D") => void  
      }

    export function SaveFurnitureDialog({ furniture, products, cells, onSave,  viewMode, setViewMode }: SaveFurnitureDialogProps) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === "ar"
    const textDirection = isRTL ? "rtl" : "ltr"
    const [name, setName] = useState(furniture.name)
    const [description, setDescription] = useState("")
    const { toast } = useToast()
    const { addFurniture } = useFurnitureStore()

    // États pour tous les champs requis
    const [magasins, setMagasins] = useState<Magasin[]>([])
    const [selectedMagasinId, setSelectedMagasinId] = useState<string>("")
    const [zones, setZones] = useState<Zone[]>([])
    const [selectedZoneId, setSelectedZoneId] = useState<string>("")
    const [users, setUsers] = useState<User[]>([])
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
    const [furnitureTypes, setFurnitureTypes] = useState<FurnitureType[]>([])
    const [selectedFurnitureTypeId, setSelectedFurnitureTypeId] = useState<string>("")
    const [selectedPlanogramStatus, setSelectedPlanogramStatus] = useState<string>("brouillon")
    const [selectedTaskType, setSelectedTaskType] = useState<string>("mise_en_place")
    
    //  champ pour le nom des fichiers
    const [filesBaseName, setFilesBaseName] = useState(furniture.name);

    // stockage des fichiers 
    const [image2DUrl, setImage2DUrl] = useState("");
    const [image3DUrl, setImage3DUrl] = useState("");
    const [pdfUrl, setPdfUrl] = useState("");
    const [isGeneratingFiles, setIsGeneratingFiles] = useState(false);

    // États de chargement
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingZones, setIsLoadingZones] = useState(false)
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)
    const [isLoadingFurnitureTypes, setIsLoadingFurnitureTypes] = useState(false)
    const [currentUser, setCurrentUser] = useState<User | null>(null)

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
        { value: "brouillon", label: "Brouillon" },
        { value: "actif", label: "Actif" },
        { value: "inactif", label: "Inactif" },
        { value: "en cours", label: "En cours" },
    ]

    const [planograms, setPlanograms] = useState<any[]>([]);
    const [selectedPlanogramId, setSelectedPlanogramId] = useState<number | null>(null);
    const [isLoadingPlanograms, setIsLoadingPlanograms] = useState(false);

    // Charger les planogrammes selon le magasin
useEffect(() => {
    if (selectedMagasinId) {
        const fetchPlanograms = async () => {
            setIsLoadingPlanograms(true);
            try {
                const response = await fetch(`http://localhost:8081/api/planogram/fetchPlanogramByStore/${selectedMagasinId}`);
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                const data = await response.json();
                setPlanograms(data.rows || []);
                setSelectedPlanogramId(null);
            } catch (error) {
                console.error("Erreur lors du chargement des planogrammes:", error);
                toast({
                    title: "Erreur",
                    description: "Impossible de charger la liste des planogrammes pour ce magasin",
                    variant: "destructive",
                });
            } finally {
                setIsLoadingPlanograms(false);
            }
        };

        fetchPlanograms();
    } else {
        setPlanograms([]);
        setSelectedPlanogramId(null);
    }
}, [selectedMagasinId, toast]);

    // générer et télécharger les fichiers
    const generateAndUploadFiles = async () => {
        setIsGeneratingFiles(true);
        
        try {
          // Sauvegarder le mode de vue actuel
          const originalViewMode = viewMode;
          
          // Forcer le mode 2D pour la capture
          setViewMode("2D");
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const image2DFile = await generate2DImage().catch(e => {
            console.warn("Échec génération 2D:", e.message);
            return null;
          });
          
          // Forcer le mode 3D pour la capture
          setViewMode("3D");
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const image3DFile = await generate3DImage().catch(e => {
            console.warn("Échec génération 3D:", e.message);
            return null;
          });
          
          const pdfFile = await generatePDF().catch(e => {
            console.warn("Échec génération PDF:", e.message);
            return null;
          });
      
          // Restaurer le mode de vue original
          setViewMode(originalViewMode);
          
          // Upload seulement les fichiers générés avec succès
          const uploadPromises = [];
          if (image2DFile) uploadPromises.push(
            uploadFile(image2DFile, generateFileName("2d-view", "png")).then(url => ({ type: '2d', url }))
          );
          if (image3DFile) uploadPromises.push(
            uploadFile(image3DFile, generateFileName("3d-view", "png")).then(url => ({ type: '3d', url }))
          );
          if (pdfFile) uploadPromises.push(
            uploadFile(pdfFile, generateFileName("planogram-details", "pdf")).then(url => ({ type: 'pdf', url }))
          );
      
          const results = await Promise.all(uploadPromises);
          
          return {
            image2DUrl: results.find(r => r.type === '2d')?.url || "",
            image3DUrl: results.find(r => r.type === '3d')?.url || "",
            pdfUrl: results.find(r => r.type === 'pdf')?.url || ""
          };
        } catch (error) {
          console.error("Erreur lors de la génération des fichiers:", error);
          throw error;
        } finally {
          setIsGeneratingFiles(false);
        }
      };

      // Générer l'image 2D
      const generate2DImage = async (): Promise<File> => {
        return new Promise((resolve) => {
          // Trouver l'élément DOM du meuble 2D
          const furniture2DElement = document.querySelector(".furniture-2d-container");
          
          if (!furniture2DElement) {
            throw new Error("Élément 2D non trouvé");
          }
      
          // Utiliser html2canvas pour capturer l'élément
          html2canvas(furniture2DElement as HTMLElement).then((canvas) => {
            canvas.toBlob((blob) => {
              if (!blob) {
                throw new Error("Erreur lors de la création du blob");
              }
              resolve(new File([blob], generateFileName("2d-view", "png"), { type: "image/png" }));
            }, "image/png");
          });
        });
      };

      // Générer l'image 3D
      const generate3DImage = async (): Promise<File> => {
        return new Promise((resolve, reject) => {
          // Augmentez le délai pour le rendu 3D
          setTimeout(async () => {
            try {
              // Essayer plusieurs sélecteurs de canvas
              const selectors = [
                '.threejs-canvas canvas',
                'canvas[data-engine]',
                '.furniture-3d-container canvas',
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
      
              // Créer un canvas hors-écran pour la capture
              const offscreenCanvas = document.createElement('canvas');
              offscreenCanvas.width = threeCanvas.width;
              offscreenCanvas.height = threeCanvas.height;
              
              const ctx = offscreenCanvas.getContext('2d');
              if (!ctx) throw new Error("Contexte 2D non disponible");
      
              // Dessiner un fond blanc et le contenu 3D
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
              ctx.drawImage(threeCanvas, 0, 0);
      
              // Convertir en fichier
              offscreenCanvas.toBlob((blob) => {
                if (!blob) {
                  reject(new Error("Échec de la conversion en blob"));
                  return;
                }
                resolve(new File([blob], generateFileName("3d-view", "png"), { type: "image/png" }));
            }, 'image/png', 0.95);
            } catch (error) {
              reject(error);
            }
          }, 1500); // Délai plus long pour le rendu 3D
        });
      };

      // Générer le fichier PDF
      const generatePDF = async (): Promise<File> => {
        return new Promise((resolve) => {
          const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm"
          });
      
          // Couleurs personnalisées
          const primaryColor = [41, 128, 185]; // Bleu
          const secondaryColor = [52, 152, 219]; // Bleu clair
          const accentColor = [231, 76, 60]; // Rouge
          const darkColor = [44, 62, 80]; // Noir bleuté
          const lightColor = [236, 240, 241]; // Gris clair
      
          // Style de base
          doc.setFont("helvetica");
          
          // Page de couverture
          doc.setFillColor(...primaryColor);
          doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
          
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(36);
          doc.text("PLANOGRAMME", 105, 40, { align: "center" });
          doc.setFontSize(24);
          doc.text(name, 105, 50, { align: "center" });
          
          // Logo ou icône
          try {
            const icon = getFurnitureIcon(furniture.type);
            // Ici vous pourriez ajouter un logo si disponible
          } catch (e) {
            console.log("Impossible d'ajouter l'icône:", e);
          }
          
          doc.setFontSize(16);
          doc.text(`Généré le ${new Date().toLocaleDateString()}`, 105, 70, { align: "center" });
          
          // Informations du magasin
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
          doc.text(`Détails du meuble: ${name}`, 10, 10);
          
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
          doc.text(`Dimensions: ${furniture.width}m (L) × ${furniture.height}m (H) × ${furniture.depth}m (P)`, 10, 40);
          doc.text(`Sections: ${furniture.sections}`, 10, 45);
          doc.text(`Emplacements: ${furniture.slots}`, 10, 50);
          doc.text(`Produits placés: ${placedProductsCount}`, 10, 55);
          
          // Image schématique (placeholder)
          doc.setTextColor(...secondaryColor);
          doc.text("Représentation schématique:", 110, 25);
          doc.setDrawColor(200, 200, 200);
          doc.rect(110, 30, 80, 40, 'S');
          doc.setTextColor(150, 150, 150);
          doc.text("[Schéma du meuble]", 150, 50, { align: "center" });
      
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
          
          cells.filter(cell => cell.productId !== null).forEach((cell) => {
            const product = products.find(p => p.primary_id === cell.productId);
            if (!product) return;
            
            let face = "front";
            if (furniture.type === "gondola") {
              face = cell.x < furniture.slots / 2 ? "front" : "back";
            } else if (furniture.type === "shelves-display") {
              const quarterWidth = furniture.slots / 4;
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
            
            rows.push([
              product.name,
              product.primary_id,
              (cell.quantity || 1).toString(),
              `E${cell.y + 1}C${cell.x + 1}`,
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
            
            // Alternance des couleurs de fond
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
            
            // Texte des cellules
            row.forEach((cell, cellIndex) => {
              doc.text(
                cell,
                headers.slice(0, cellIndex).reduce((a, _, j) => a + columnWidths[j], 10) + 3,
                yPos - 3,
                { maxWidth: columnWidths[cellIndex] - 6 }
              );
            });
            
            // Pagination si nécessaire
            if (yPos > doc.internal.pageSize.getHeight() - 20) {
              doc.addPage();
              yPos = 25;
            }
          });
          
          // Page de notes
          doc.addPage();
          doc.setFillColor(...lightColor);
          doc.rect(0, 0, doc.internal.pageSize.getWidth(), 15, 'F');
          doc.setTextColor(...darkColor);
          doc.setFont("helvetica", "bold");
          doc.text("Notes et commentaires", 10, 10);
          
          doc.setDrawColor(...secondaryColor);
          doc.line(10, 12, 70, 12);
          
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
          doc.text("Instructions spéciales:", 10, 25);
          doc.setDrawColor(200, 200, 200);
          doc.rect(10, 30, 180, 40, 'S');
          
          doc.text("Responsable:", 10, 80);
          if (selectedUserId) {
            const user = users.find(u => u.id === selectedUserId);
            doc.text(`${user?.username || ''} (${user?.email || ''})`, 40, 80);
          }
          
          doc.text("Statut:", 10, 90);
          doc.text(planogramStatusOptions.find(s => s.value === selectedPlanogramStatus)?.label || '', 30, 90);
          
          doc.text("Type de tâche:", 10, 100);
          doc.text(taskTypes.find(t => t.value === selectedTaskType)?.label || '', 40, 100);
          
          // Pied de page
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(`Document généré automatiquement par Planogram Editor - ${new Date().toLocaleString()}`, 105, doc.internal.pageSize.getHeight() - 10, { align: "center" });
      
          // Générer le fichier
          const pdfBlob = doc.output("blob");
          resolve(new File([pdfBlob], generateFileName("planogramme", "pdf"), { type: "application/pdf" }));
        });
      };

      

    // Récupérer l'utilisateur connecté
    useEffect(() => {
        const fetchCurrentUser = async () => {
        try {
            const response = await fetch("http://localhost:8081/api/auth/me", {
            credentials: "include",
            })
            if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`)
            }
            const responseData = await response.json()
            const userData = responseData.user || responseData
            setCurrentUser(userData)
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

    // Charger les magasins
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

    // Charger les zones selon le magasin
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

    // Charger les utilisateurs selon le magasin
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

    // méthode d'envoi d'email
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
                    "Authorization": `Bearer ${localStorage.getItem('token')}` // Si nécessaire
                },
                body: JSON.stringify({
                    senderEmail: currentUser.email,
                    receiverEmail: receiverEmail
                }),
                credentials: "include"
            });
    
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
    
            console.log("Email envoyé avec succès");
        } catch (error) {
            console.error("Erreur lors de l'envoi de l'email:", error);
        }
    };


    //fonction d'upload
    const uploadFile = async (file: File, fileName: string): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file, fileName);
        
        try {
            const response = await fetch("http://localhost:8081/api/furniture/upload", {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            return data.filePath; // Retourne le chemin comme "uploads/accessorie.JPG"
        } catch (error) {
            console.error("Erreur lors de l'upload:", error);
            toast({
                title: "Erreur d'upload",
                description: "Échec du téléchargement du fichier",
                variant: "destructive",
            });
            throw error;
        }
    };

    // Optimisation de la génération des noms de fichiers
    const generateFileName = (suffix: string, extension: string): string => {
        const sanitizedName = filesBaseName.replace(/[^a-zA-Z0-9-_]/g, '-');
        return `${sanitizedName}-${suffix}.${extension}`;
    };

    const placedProductsCount = cells.filter((cell) => cell.productId !== null).length

    const handleSave = async () => {
        const selectedUser = users.find(user => user.id === selectedUserId);
        console.log("=== DEBUT handleSave ===");
        
        // Validation des champs obligatoires
        if (!selectedMagasinId || !selectedZoneId || !name || !currentUser) {
            toast({
                title: "Erreur",
                description: "Veuillez remplir tous les champs obligatoires",
                variant: "destructive",
            });
            return;
        }
    
        setIsLoading(true);
    
        try {
            // Petit délai pour s'assurer que le rendu est prêt
            await new Promise(resolve => setTimeout(resolve, 500));
            // 1. Générer et uploader les fichiers (avec gestion d'erreur spécifique)
            let files = { image2DUrl: "", image3DUrl: "", pdfUrl: "" };
            try {
                setIsGeneratingFiles(true);
                files = await generateAndUploadFiles();
                
                // Mettre à jour les états avec les URLs
                setImage2DUrl(files.image2DUrl);
                setImage3DUrl(files.image3DUrl);
                setPdfUrl(files.pdfUrl);
                
                console.log("Fichiers générés et uploadés:", files);
            } catch (fileError) {
                console.error("Erreur lors de la génération des fichiers:", fileError);
                toast({
                    title: "Avertissement",
                    description: "Le meuble sera enregistré sans les fichiers joints",
                    variant: "default",
                });
            } finally {
                setIsGeneratingFiles(false);
            }
    
            // 2. Récupérer tous les codes produits uniques
            const productCodes = Array.from(
                new Set(
                    cells
                        .filter((cell) => cell.productId !== null)
                        .map((cell) => cell.productId)
                )
            ) as string[];
    
            // 3. Convertir les codes en IDs via l'API
            const productIdMap = new Map<string, number>();
            for (const code of productCodes) {
                try {
                    const response = await fetch(`http://localhost:8081/api/produits/getProductIdsByCodes/${code}`);
                    if (!response.ok) {
                        throw new Error(`Erreur HTTP: ${response.status} pour le produit ${code}`);
                    }
                    const productId = await response.json();
                    
                    if (typeof productId !== 'number' || isNaN(productId)) {
                        throw new Error(`ID de produit invalide reçu pour ${code}`);
                    }
                    
                    productIdMap.set(code, productId);
                } catch (error) {
                    console.error(`Erreur produit ${code}:`, error);
                    toast({
                        title: "Erreur produit",
                        description: `Impossible de récupérer l'ID pour ${code}: ${error.message}`,
                        variant: "destructive",
                    });
                    return;
                }
            }
    
            // 4. Construire les positions de produits avec les vrais IDs
            const productPositions = cells
                .filter((cell) => cell.productId !== null)
                .map((cell) => {
                    const productId = productIdMap.get(cell.productId!);
                    if (!productId) {
                        console.error("ID non trouvé pour le produit", cell.productId);
                        return null;
                    }
    
                    const product = products.find((p) => p.primary_id === cell.productId);
                    if (!product) {
                        console.error("Produit non trouvé dans la liste locale", cell.productId);
                        return null;
                    }
    
                    let face = "front";
                    if (furniture.type === "gondola") {
                        face = cell.x < furniture.slots / 2 ? "front" : "back";
                    } else if (furniture.type === "shelves-display") {
                        const quarterWidth = furniture.slots / 4;
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
    
                    return {
                        product_id: productId,
                        face: face,
                        etagere: cell.y + 1,
                        colonne: cell.x + 1,
                        quantite: cell.quantity || 1,
                    };
                })
                .filter(Boolean);
    
            // Validation des produits placés
            if (productPositions.length === 0) {
                toast({
                    title: "Attention",
                    description: "Veuillez placer au moins un produit valide avant de sauvegarder le meuble",
                    variant: "destructive",
                });
                return;
            }
    
            // Construire l'objet furniture avec les URLs des fichiers
            const furnitureData = {
                furniture_type_id: Number.parseInt(selectedFurnitureTypeId),
                largeur: furniture.width,
                hauteur: furniture.height,
                profondeur: furniture.depth,
                nb_colonnes_unique_face: furniture.slots,
                nb_etageres_unique_face: furniture.sections,
                productPositions: productPositions,
                imageUrl_2D: files.image2DUrl,
                imageUrl_3D: files.image3DUrl,
                pdfUrl: files.pdfUrl,
            };
    
            // Envoi de la requête au serveur
            const apiUrl = selectedPlanogramId 
                ? "http://localhost:8081/api/planogram/createFullPlanogramm" 
                : "http://localhost:8081/api/planogram/createFullPlanogram";
    
            const requestBody = selectedPlanogramId ? {
                planogram_id: selectedPlanogramId, // ✅ Inclure l'ID du planogramme existant
                magasin_id: selectedMagasinId,
                zone_id: selectedZoneId,
                nom: name,
                description: description || `Meuble créé le ${new Date().toLocaleDateString()}`,
                created_by: currentUser.id || currentUser.idUtilisateur,
                statut: selectedPlanogramStatus,
                furnitures: [furnitureData],
                tache: selectedUserId
                    ? {
                        idUser: selectedUserId,
                        statut: "à faire",
                        date_debut: new Date().toISOString(),
                        date_fin_prevue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        type: selectedTaskType,
                        commentaire: `Tâche liée au meuble ${name}`,
                    }
                    : null,
            } : {
                magasin_id: selectedMagasinId,
                zone_id: selectedZoneId,
                nom: name,
                description: description || `Meuble créé le ${new Date().toLocaleDateString()}`,
                created_by: currentUser.id || currentUser.idUtilisateur,
                statut: selectedPlanogramStatus,
                furnitures: [furnitureData],
                tache: selectedUserId
                    ? {
                        idUser: selectedUserId,
                        statut: "à faire",
                        date_debut: new Date().toISOString(),
                        date_fin_prevue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        type: selectedTaskType,
                        commentaire: `Tâche liée au meuble ${name}`,
                    }
                    : null,
            };
    
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
                credentials: "include",
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || "Erreur inconnue lors de l'enregistrement");
            }
    
            const data = await response.json();
    
            toast({
                title: "Succès",
                description: `Le meuble a été enregistré avec succès${selectedUser ? ` et la tâche a été attribuée à ${selectedUser.email}` : ""}`,
                variant: "default",
            });
    
            // Envoyer l'email si un utilisateur est assigné
            if (selectedUser?.email) {
                try {
                    await sendAssignmentEmail(
                        selectedUser.email,
                        name,
                        selectedMagasinId,
                        selectedZoneId,
                        selectedTaskType
                    );
                    toast({
                        title: "Notification envoyée",
                        description: `Un email a été envoyé à ${selectedUser.email}`,
                        variant: "default",
                    });
                } catch (emailError) {
                    console.error("Erreur lors de l'envoi de l'email:", emailError);
                    toast({
                        title: "Erreur d'envoi",
                        description: `Le meuble a été enregistré mais l'email à ${selectedUser.email} n'a pas pu être envoyé`,
                        variant: "destructive",
                    });
                }
            }
    
            if (onSave) onSave(data.planogram_id);
        } catch (error) {
            console.error("Erreur lors de la création du meuble:", error);
            toast({
                title: "Erreur",
                description: error.message || "Une erreur est survenue lors de la création du meuble",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setIsGeneratingFiles(false);
        }
    };

    return (
        <Dialog>
        <DialogTrigger asChild>
            <Button>
            <Save className="h-4 w-4 mr-2" />
            {t("save")}
            </Button>
        </DialogTrigger>
        <DialogContent className={`sm:max-w-[500px] max-h-[90vh] overflow-hidden ${isRTL ? "text-right rtl" : ""}`}>
            <DialogHeader>
            <DialogTitle>Save furniture</DialogTitle>
            <DialogDescription>Save this furniture to your library to reuse it in your layouts.</DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto max-h-[calc(90vh-150px)] pr-2">
            <div className="space-y-4 mt-4">

                {/* Magasin */}
                <div>
                <label className="text-sm font-medium">Magasin</label>
                <Select
                    value={selectedMagasinId}
                    onValueChange={setSelectedMagasinId}
                    disabled={isLoading || magasins.length === 0}
                >
                    <SelectTrigger className="mt-1" dir={textDirection}>
                    <SelectValue placeholder="Sélectionner un magasin" />
                    </SelectTrigger>
                    <SelectContent>
                    {magasins.map((magasin) => (
                        <SelectItem key={magasin.magasin_id} value={magasin.magasin_id}>
                        {magasin.magasin_id} - {magasin.nom_magasin}
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
                {/* Planogramme existant */}
                <div>
                    <label className="text-sm font-medium">Planogramme existant (optionnel)</label>
                    <Select
                        value={selectedPlanogramId?.toString() || ""}
                        onValueChange={(value) => {
                            setSelectedPlanogramId(value ? Number.parseInt(value) : null);
                            
                            // Si un planogramme est sélectionné, remplir automatiquement certains champs
                            if (value) {
                                const selectedPlanogram = planograms.find(p => p.planogram_id === Number.parseInt(value));
                                if (selectedPlanogram) {
                                    setName(selectedPlanogram.nom);
                                    setDescription(selectedPlanogram.description || "");
                                    setSelectedPlanogramStatus(selectedPlanogram.statut || "actif");
                                    setSelectedZoneId(selectedPlanogram.zone_id);
                                }
                            }
                        }}
                        disabled={isLoadingPlanograms || !selectedMagasinId || planograms.length === 0}
                    >
                        <SelectTrigger className="mt-1" dir={textDirection}>
                            <SelectValue placeholder={selectedMagasinId ? "Sélectionner un planogramme existant" : "Sélectionnez d'abord un magasin"} />
                        </SelectTrigger>
                        <SelectContent>
                            {planograms.map((planogram) => (
                                <SelectItem key={planogram.planogram_id} value={planogram.planogram_id.toString()}>
                                    {planogram.nom} - {planogram.description || "Pas de description"}
                                </SelectItem>
                            ))}
                            {planograms.length === 0 && !isLoadingPlanograms && selectedMagasinId && (
                                <SelectItem value="no-planograms" disabled>
                                    Aucun planogramme disponible pour ce magasin
                                </SelectItem>
                            )}
                            {isLoadingPlanograms && (
                                <SelectItem value="loading-planograms" disabled>
                                    Chargement des planogrammes...
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                        Sélectionnez un planogramme existant pour y ajouter ce meuble
                    </p>
                </div>
                {/* Nom du meuble */}
                    <div>
                        <label className="text-sm font-medium">name of the furniture</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1"
                            placeholder="Enter furniture name"
                            dir={textDirection}
                            readOnly={!!selectedPlanogramId}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium">Description</label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1"
                            placeholder="Enter description"
                            dir={textDirection}
                            readOnly={!!selectedPlanogramId}
                        />
                    </div>

                

                {/* Zone */}
                <div>
                <label className="text-sm font-medium">Zone</label>
                <Select
                    value={selectedZoneId}
                    onValueChange={setSelectedZoneId}
                    disabled={isLoadingZones || !selectedMagasinId || zones.length === 0}
                >
                    <SelectTrigger className="mt-1" dir={textDirection}>
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

                {/* Utilisateur */}
                <div>
                <label className="text-sm font-medium">Utilisateur</label>
                <Select
                    value={selectedUserId?.toString() || ""}
                    onValueChange={(value) => setSelectedUserId(value ? Number.parseInt(value) : null)}
                    disabled={isLoadingUsers || !selectedMagasinId || users.length === 0}
                >
                    <SelectTrigger className="mt-1" dir={textDirection}>
                    <SelectValue
                        placeholder={selectedMagasinId ? "Sélectionner un utilisateur" : "Sélectionnez d'abord un magasin"}
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

                {/* Type de meuble */}
                <div>
                <label className="text-sm font-medium">Type de meuble</label>
                <Select
                    value={selectedFurnitureTypeId}
                    onValueChange={setSelectedFurnitureTypeId}
                    disabled={isLoadingFurnitureTypes || furnitureTypes.length === 0}
                >
                    <SelectTrigger className="mt-1" dir={textDirection}>
                    <SelectValue placeholder="Sélectionner un type de meuble" />
                    </SelectTrigger>
                    <SelectContent>
                    {furnitureTypes.map((type) => (
                        <SelectItem key={type.furniture_type_id} value={type.furniture_type_id}>
                        {type.nomType} - Nb_Faces : {type.nombreFaces}
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

                {/* Sélection du statut du planogramme */}
                <div>
                    <label className="text-sm font-medium">Statut du planogramme</label>
                    <Select 
                        value={selectedPlanogramStatus} 
                        onValueChange={setSelectedPlanogramStatus}
                        disabled={!!selectedPlanogramId}
                    >
                        <SelectTrigger className="mt-1" dir={textDirection}>
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

                {/* Sélection du type de tâche */}
                <div>
                <label className="text-sm font-medium">Type de tâche</label>
                <Select value={selectedTaskType} onValueChange={setSelectedTaskType}>
                    <SelectTrigger className="mt-1" dir={textDirection}>
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
                    {/* Nom de base pour les fichiers */}
                    <div>
                        <label className="text-sm font-medium">Nom des fichiers exportés</label>
                        <Input
                            value={filesBaseName}
                            onChange={(e) => setFilesBaseName(e.target.value)}
                            className="mt-1"
                            placeholder="Entrez le nom de base pour les fichiers"
                            dir={textDirection}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Ce nom sera utilisé pour les fichiers image et PDF générés.
                        </p>
                    </div>
                {/* Preview détaillé */}
                <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <Card className="p-4 bg-muted/20">
    <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-muted/30 rounded-md flex items-center justify-center flex-shrink-0">
            {getFurnitureIcon(furniture.type)}
        </div>
        <div className="flex-1 space-y-2">
            {/* Nom du meuble (dynamique) */}
            <div className="text-sm font-medium" dir={textDirection}>
                {name || "Meuble sans nom"}
            </div>
            
            {/* Informations de base */}
            <div className="text-sm text-muted-foreground" dir={textDirection}>
                <div>({furniture.sections}) rows, ({furniture.slots}) columns</div>
                <div>({placedProductsCount}) products placed</div>
                {selectedMagasinId && (
                    <div>Magasin: {magasins.find((m) => m.magasin_id === selectedMagasinId)?.nom_magasin || ""}</div>
                )}
            </div>
            
            {/* Type de meuble avec détails */}
            {selectedFurnitureTypeId && (
                <div className="text-xs text-blue-600">
                    <div>
                        Type de meuble: {furnitureTypes.find((ft) => ft.furniture_type_id === selectedFurnitureTypeId)?.nomType || ""} | 
                        Nombre des faces: {furnitureTypes.find((ft) => ft.furniture_type_id === selectedFurnitureTypeId)?.nombreFaces || ""}
                    </div>
                    {furniture.type === "gondola" && (
                        <>
                            <div className="text-green-600">
                                Gondola - Avant: {Math.floor(furniture.slots / 2)} col × {furniture.sections} étag
                            </div>
                            <div className="text-green-600">
                                Gondola - Arrière: {Math.floor(furniture.slots / 2)} col × {furniture.sections} étag
                            </div>
                        </>
                    )}
                    {furniture.type === "shelves-display" && (
                        <>
                            <div className="text-purple-600">
                                Avant/Arrière: {Math.floor(furniture.slots / 2)} col × {furniture.sections} étag
                            </div>
                            <div className="text-purple-600">Gauche/Droite: 1 col × {furniture.sections} étag</div>
                        </>
                    )}
                </div>
            )}
            
            {/* Dimensions du meuble */}
            <div className="text-xs text-gray-600 p-2 bg-gray-100 rounded">
                <div className="font-semibold mb-1">Dimensions du meuble :</div>
                <div className="grid grid-cols-2 gap-2">
                    <span>Largeur: {furniture.width}m</span>
                    <span>Hauteur: {furniture.height}m</span>
                    <span>Profondeur: {furniture.depth}m</span>
                    <span>Base: 0.3m</span>
                    <span>Épaisseur étagère: 0.05m</span>
                </div>
            </div>

            {/* Produits placés */}
            {placedProductsCount > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                    <h5 className="text-xs font-semibold text-gray-700 mb-2">Produits placés :</h5>
                    <div className="space-y-1">
                        {cells
                            .filter((cell) => cell.productId !== null)
                            .map((cell, index) => {
                                const product = products.find((p) => p.primary_id === cell.productId);
                                if (!product) return null;

                                let face = "front";
                                if (furniture.type === "gondola") {
                                    face = cell.x < furniture.slots / 2 ? "front" : "back";
                                } else if (furniture.type === "shelves-display") {
                                    const quarterWidth = furniture.slots / 4;
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
                                            <span>Étagère: {cell.y + 1}</span>
                                            <span>Colonne: {cell.x + 1}</span>
                                            <span>Face: {face}</span>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Fichiers générés */}
            {(image2DUrl || image3DUrl || pdfUrl) && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <h5 className="text-xs font-semibold text-blue-700 mb-2">Fichiers générés :</h5>
                    <div className="flex flex-wrap gap-2">
                        {image2DUrl && (
                            <a 
                                href={`http://localhost:8081/${image2DUrl}`} 
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
        </div>
    </div>
</Card>
                </div>
            </div>
            </div>

            <DialogFooter className={isRTL ? "justify-start" : "justify-end"}>
    <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
    </DialogClose>
    <Button
        onClick={handleSave}
        disabled={!selectedMagasinId || !selectedZoneId || !selectedFurnitureTypeId || isLoading || isGeneratingFiles}
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
        </DialogContent>
        </Dialog>
    )
    }
