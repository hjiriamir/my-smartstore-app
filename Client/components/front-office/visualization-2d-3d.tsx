"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  Eye,
  RotateCcw,
  Download,
  FileImage,
  Thermometer,
  Package,
  MapPin,
  List,
  Grid,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"

//const API_BASE_URL = "http://localhost:8081/api"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// Définir les types pour les données
interface Furniture {
  furniture_id: number
  planogram_id: number
  furniture_type_id: number
  largeur: number
  hauteur: number
  profondeur: number
  nb_colonnes_unique_face: number
  nb_etageres_unique_face: number
  nb_colonnes_front_back: number | null
  nb_etageres_front_back: number | null
  nb_colonnes_left_right: number | null
  nb_etageres_left_right: number | null
  pdfUrl: string | null
  imageUrl: string | null
  furnitureType: {
    furniture_type_id: number
    nomType: string
    nombreFaces: number
    description: string
  }
  positions: Array<{
    position_id: number
    furniture_id: number
    product_id: number
    face: string
    etagere: number
    colonne: number
    quantite: number
    product: {
      id: number
      produit_id: string
      nom: string
      description: string
      prix: number
      stock: number
      categorie_id: string
      longueur: number
      conditionnement: string
      largeur: number
      hauteur: number
      poids: number
      saisonnalite: string
      priorite_merchandising: string
      contrainte_temperature: string
      contrainte_conditionnement: string
      date_creation: string
      date_modification: string
      imageUrl: string | null
    }
  }>
}

interface Product {
  id: number
  produit_id: string
  nom: string
  prix: number
  stock: number
  position: {
    face: string
    etagere: number
    colonne: number
    quantite: number
  }
  sales_performance?: number // Optionnel car non présent dans l'API
}

export default function FurnitureVisualization() {

  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  const [furnitures, setFurnitures] = useState<Furniture[]>([])
  const [selectedFurniture, setSelectedFurniture] = useState<Furniture | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [zoomLevel, setZoomLevel] = useState([100])
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [activeTab, setActiveTab] = useState("furniture")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()



  

  const generateFullPdf = async () => {
    if (!selectedFurniture) {
      toast({
        title: "Erreur",
        description: "Aucun meuble sélectionné",
        variant: "destructive",
      });
      return;
    }
  
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const margin = 10;
      let yPosition = margin;
  
      // Styles
      const titleColor = '#2c3e50';
      const headerColor = '#3498db';
      const textColor = '#34495e';
  
      // 1. Page de titre
      doc.setFontSize(24);
      doc.setTextColor(titleColor);
      doc.text(`Fiche Technique du Meuble`, 105, yPosition, { align: 'center' });
      yPosition += 10;
      doc.setFontSize(18);
      doc.text(`Référence: ${selectedFurniture.furniture_id}`, 105, yPosition, { align: 'center' });
      yPosition += 20;
  
      // 2. Image du meuble
      if (selectedFurniture.imageUrl) {
        try {
          const imgData = await fetch(selectedFurniture.imageUrl)
            .then(response => response.blob())
            .then(blob => new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            }));
  
          const imgProps = doc.getImageProperties(imgData as string);
          const pdfWidth = doc.internal.pageSize.getWidth() - 2 * margin;
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
          // Cadre autour de l'image
          doc.setDrawColor(200, 200, 200);
          doc.setFillColor(245, 245, 245);
          doc.roundedRect(margin, yPosition, pdfWidth, pdfHeight + 10, 3, 3, 'FD');
          
          doc.addImage(imgData as string, 'JPEG', margin + 5, yPosition + 5, pdfWidth - 10, pdfHeight - 10);
          yPosition += pdfHeight + 15;
        } catch (error) {
          console.error("Erreur lors du chargement de l'image", error);
        }
      }
  
      // 3. Détails du meuble avec mise en forme
      doc.setFontSize(16);
      doc.setTextColor(headerColor);
      doc.text('Détails du Meuble', margin, yPosition);
      yPosition += 10;
  
      // Ligne de séparation
      doc.setDrawColor(headerColor);
      doc.line(margin, yPosition, doc.internal.pageSize.getWidth() - margin, yPosition);
      yPosition += 5;
  
      doc.setFontSize(12);
      doc.setTextColor(textColor);
  
      const furnitureDetails = [
        { label: 'Type', value: selectedFurniture.furnitureType.nomType },        { label: 'Dimensions', value: `${selectedFurniture.largeur}cm × ${selectedFurniture.hauteur}cm × ${selectedFurniture.profondeur}cm` },
        { label: 'Colonnes', value: selectedFurniture.nb_colonnes_unique_face.toString() },
        { label: 'Étagères', value: selectedFurniture.nb_etageres_unique_face.toString() },
        { label: 'Description', value: selectedFurniture.furnitureType.description }
      ];
  
      furnitureDetails.forEach(detail => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${detail.label}:`, margin, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(detail.value, margin + 30, yPosition);
        yPosition += 7;
      });
  
      // 4. Liste des produits avec tableau
      doc.addPage();
      yPosition = margin;
      
      doc.setFontSize(16);
      doc.setTextColor(headerColor);
      doc.text('Liste des Produits', margin, yPosition);
      yPosition += 10;
      
      // Ligne de séparation
      doc.line(margin, yPosition, doc.internal.pageSize.getWidth() - margin, yPosition);
      yPosition += 8;
  
      // En-tête du tableau
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(titleColor);
      
      const columns = [
        { header: 'Nom', width: 60 },
        { header: 'Position', width: 40 },
        { header: 'Prix', width: 30 },
        { header: 'Stock', width: 30 },
        { header: 'Quantité', width: 30 }
      ];
      
      // Dessiner l'en-tête
      let xPosition = margin;
      columns.forEach(col => {
        doc.text(col.header, xPosition, yPosition);
        xPosition += col.width;
      });
      yPosition += 5;
      
      // Ligne sous l'en-tête
      doc.line(margin, yPosition, doc.internal.pageSize.getWidth() - margin, yPosition);
      yPosition += 7;
  
      // Contenu du tableau
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor);
      
      products.forEach(product => {
        if (yPosition > 270) { // Nouvelle page si on arrive en bas
          doc.addPage();
          yPosition = margin;
          
          // Redessiner l'en-tête sur la nouvelle page
          doc.setFont('helvetica', 'bold');
          xPosition = margin;
          columns.forEach(col => {
            doc.text(col.header, xPosition, yPosition);
            xPosition += col.width;
          });
          yPosition += 12;
          doc.setFont('helvetica', 'normal');
        }
        
        xPosition = margin;
        doc.text(product.nom, xPosition, yPosition);
        xPosition += columns[0].width;
        
        doc.text(`${product.position.face}, E${product.position.etagere}, C${product.position.colonne}`, xPosition, yPosition);
        xPosition += columns[1].width;
        
        doc.text(`${product.prix} RS`, xPosition, yPosition);
        xPosition += columns[2].width;
        
        const stockStatus = getStockStatus(product.stock);
        doc.setTextColor(
          stockStatus === "En stock" ? '#27ae60' : 
          stockStatus === "Stock faible" ? '#e67e22' : '#e74c3c'
        );
        doc.text(stockStatus, xPosition, yPosition);
        doc.setTextColor(textColor);
        xPosition += columns[3].width;
        
        doc.text(product.position.quantite.toString(), xPosition, yPosition);
        
        yPosition += 7;
      });
  
      // 5. Sauvegarder le PDF
      doc.save(`meuble_${selectedFurniture.furniture_id}_fiche_technique.pdf`);
  
      toast({
        title: "Succès",
        description: "PDF généré avec succès",
        variant: "default",
      });
    } catch (error) {
      console.error("Erreur lors de la génération du PDF", error);
      toast({
        title: "Erreur",
        description: "Échec de la génération du PDF",
        variant: "destructive",
      });
    }
  };
  

  //  la fonction handleExport
  const handleExport = async (format: "pdf" | "image" | "full-pdf") => {
    if (!selectedFurniture) return;
    
    if (format === "pdf") {
      // Générer un PDF même si pdfUrl est null
      if (selectedFurniture.pdfUrl) {
        window.open(selectedFurniture.pdfUrl, '_blank');
      } else {
        await generateFullPdf(); // Utilisez la génération de PDF complet comme fallback
      }
    } else if (format === "image" && selectedFurniture.imageUrl) {
      const link = document.createElement('a');
      link.href = selectedFurniture.imageUrl;
      link.download = `meuble-${selectedFurniture.furniture_id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "full-pdf") {
      await generateFullPdf();
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
        }

        // 1. Récupérer l'ID de l'utilisateur connecté
        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include"
        })

        if (!userResponse.ok) {
          const errorData = await userResponse.json()
          throw new Error(errorData.message || "Erreur lors de la récupération de l'utilisateur")
        }

        const userData = await userResponse.json()
        const userId = userData.user?.idUtilisateur || userData.id

        // 2. Récupérer les meubles de l'utilisateur
        const furnituresResponse = await fetch(`${API_BASE_URL}/furniture/getFurnituresByUser/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (!furnituresResponse.ok) {
          throw new Error("Erreur lors de la récupération des meubles")
        }

        const furnituresData = await furnituresResponse.json()
        setFurnitures(furnituresData)

        if (furnituresData.length > 0) {
          setSelectedFurniture(furnituresData[0])
          // Transformer les positions en produits pour l'affichage
          const productsData = furnituresData[0].positions.map(pos => ({
            ...pos.product,
            position: {
              face: pos.face,
              etagere: pos.etagere,
              colonne: pos.colonne,
              quantite: pos.quantite
            },
            // Ajout d'une performance de vente aléatoire pour l'exemple
            sales_performance: Math.floor(Math.random() * 30) + 70
          }))
          setProducts(productsData)
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Une erreur inconnue est survenue"
        setError(errorMessage)
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleFurnitureChange = async (furnitureId: string) => {
    const furniture = furnitures.find(f => f.furniture_id.toString() === furnitureId)
    if (furniture) {
      setSelectedFurniture(furniture)
      // Transformer les positions en produits pour l'affichage
      const productsData = furniture.positions.map(pos => ({
        ...pos.product,
        position: {
          face: pos.face,
          etagere: pos.etagere,
          colonne: pos.colonne,
          quantite: pos.quantite
        },
        // Ajout d'une performance de vente aléatoire pour l'exemple
        sales_performance: Math.floor(Math.random() * 30) + 70
      }))
      setProducts(productsData)
      setSelectedProduct(null)
    }
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
  }


  const getStockStatus = (stock: number): string => {
    return stock > 20 ? "En stock" : stock > 0 ? "Stock faible" : "Rupture"
  }

  const renderFurnitureView = () => {
    if (!selectedFurniture) return null;
  
    return (
      <div className="relative bg-gray-100 rounded-lg h-[600px] w-full overflow-hidden">
        {selectedFurniture.imageUrl ? (
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={3}
            wheel={{ step: 0.1 }}
            doubleClick={{ disabled: true }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute top-2 left-2 z-10 flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => zoomIn()}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    +
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => zoomOut()}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    -
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resetTransform()}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                <TransformComponent
                  wrapperStyle={{
                    width: "100%",
                    height: "100%",
                  }}
                  contentStyle={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={selectedFurniture.imageUrl}
                    alt={`Meuble ${selectedFurniture.furniture_id}`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {t("front.library.pasImage")}
          </div>
        )}
      </div>
    );
  };

  const renderProductsView = () => {
    return (
      <div className="space-y-2">
        {products.map(product => (
          <div
            key={product.id}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedProduct?.id === product.id
                ? "bg-blue-100 border border-blue-300"
                : "bg-white hover:bg-gray-50 border border-gray-200"
            }`}
            onClick={() => handleProductClick(product)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{product.nom}</h4>
                <p className="text-sm text-muted-foreground">
                  {product.position.face}, Étagère {product.position.etagere}, Colonne {product.position.colonne}
                </p>
              </div>
              <Badge variant={
                getStockStatus(product.stock) === "En stock" 
                  ? "default" 
                  : getStockStatus(product.stock) === "Stock faible" 
                    ? "destructive" 
                    : "outline"
              }>
                {getStockStatus(product.stock)}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6" dir={textDirection}>
      {/* Contrôles de visualisation */}
      <Card>
        <CardHeader>
          <CardTitle>{t("front.visualisation.visMeubles")}</CardTitle>
          <CardDescription>{t("front.visualisation.visMeublesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={selectedFurniture?.furniture_id.toString() || ""}
              onValueChange={handleFurnitureChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? t("front.visualisation.chargement") : t("front.visualisation.selectMeuble")} />
              </SelectTrigger>
              <SelectContent>
              {furnitures.map((furniture) => (
  <SelectItem key={furniture.furniture_id} value={furniture.furniture_id.toString()}>
    {`Meuble ${furniture.furniture_id} (${furniture.furnitureType.nomType})`}
  </SelectItem>
))}
              </SelectContent>
            </Select>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="furniture">
                  <Grid className="h-4 w-4 mr-2" />
                  {t("front.visualisation.meuble")}
                </TabsTrigger>
                <TabsTrigger value="products">
                  <List className="h-4 w-4 mr-2" />
                  {t("front.visualisation.produits")}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {activeTab === "furniture" && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{t("front.visualisation.zoom")}</span>
                <div className="flex-1">
                  <Slider
                    value={zoomLevel}
                    onValueChange={setZoomLevel}
                    max={200}
                    min={50}
                    step={10}
                    className="w-full"
                  />
                </div>
                <span className="text-sm text-muted-foreground">{zoomLevel[0]}%</span>
              </div>
            )}

<div className="flex space-x-2">
  {activeTab === "furniture" && (
    <>
      <Button
        size="sm"
        variant={showHeatmap ? "default" : "outline"}
        onClick={() => setShowHeatmap(!showHeatmap)}
      >
        <Thermometer className="h-4 w-4 mr-2" />
        {t("front.visualisation.performance")}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleExport("image")}
        disabled={!selectedFurniture || !selectedFurniture.imageUrl}
      >
        <FileImage className="h-4 w-4 mr-2" />
        {t("front.visualisation.image")}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleExport("pdf")}
        disabled={!selectedFurniture} 
      >
        <Download className="h-4 w-4 mr-2" />
        {t("front.visualisation.ficheTech")}
      </Button>
      <Button
        size="sm"
        variant="default"
        onClick={() => handleExport("full-pdf")}
        disabled={!selectedFurniture}
      >
        <Download className="h-4 w-4 mr-2" />
        {t("front.visualisation.ficheTech")}
      </Button>
    </>
  )}
</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Zone de visualisation principale */}
        <div className="lg:col-span-3">
  <Card className="h-full">
    <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {selectedFurniture ? `Meuble ${selectedFurniture.furniture_id}` : t("front.visualisation.noSelectedMeuble")}
                  </CardTitle>
                  <CardDescription>
                    {selectedFurniture && (
                      <>
                        {activeTab === "furniture" 
                          ? t("front.visualisation.viewFurnitureZoom", { zoom: zoomLevel[0] })
                          : t("front.visualisation.productsListes", { count: products.length })}
                        {activeTab === "furniture" && (
                          <span className="ml-4">
                            {t("front.visualisation.dimensions")} {selectedFurniture.largeur} {t("front.visualisation.cm")} × {selectedFurniture.hauteur} {t("front.visualisation.cm")} × {selectedFurniture.profondeur} {t("front.visualisation.cm")}
                          </span>
                        )}
                        <span className="ml-4">
                        {t("front.visualisation.type")}  {selectedFurniture.furnitureType.nomType}
                        </span>
                      </>
                    )}
                  </CardDescription>
                </div>
                {activeTab === "furniture" && (
                  <Button size="sm" variant="outline" onClick={() => setZoomLevel([100])}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {t("front.visualisation.reinitialiserZoom")}
                  </Button>
                )}
              </div>
            </CardHeader>
    <CardContent className="h-[calc(100%-120px)]">
      {activeTab === "furniture" ? renderFurnitureView() : renderProductsView()}
    </CardContent>
  </Card>
</div>

        {/* Panneau d'informations produit */}
        <div className="space-y-4">
          {selectedProduct ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("front.visualisation.produitDetails")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">{selectedProduct.nom}</h4>
                  <p className="text-sm text-muted-foreground">{t("front.visualisation.id")} {selectedProduct.produit_id}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{t("front.visualisation.prix")}</span>
                    <span className="text-sm font-medium">{selectedProduct.prix} RS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t("front.visualisation.quantite")}</span>
                    <span className="text-sm font-medium">{selectedProduct.position.quantite}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t("front.visualisation.stock")}</span>
                    <Badge variant={
                      getStockStatus(selectedProduct.stock) === t("front.visualisation.enStock")
                        ? "default" 
                        : getStockStatus(selectedProduct.stock) === t("front.visualisation.stockFaible")
                          ? "destructive" 
                          : "outline"
                    }>
                      {getStockStatus(selectedProduct.stock)}
                    </Badge>
                  </div>
                </div>

                {selectedProduct.sales_performance && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">{t("front.visualisation.performance")}:</span>
                      <span className="text-sm font-medium">{selectedProduct.sales_performance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${selectedProduct.sales_performance}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                    {t("front.visualisation.face")} {selectedProduct.position.face}, {t("front.visualisation.etagere")} {selectedProduct.position.etagere}, {t("front.visualisation.colonne")} {selectedProduct.position.colonne}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {activeTab === "products" 
                    ? t("front.visualisation.selectProduit") 
                    : t("front.visualisation.listeProduits")}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Légende Heatmap */}
          {showHeatmap && activeTab === "furniture" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("front.visualisation.legendePerformance")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded"></div>
                  <span className="text-sm">{t("front.visualisation.excellente")} (90%+)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded"></div>
                  <span className="text-sm">{t("front.visualisation.bonne")} (80-90%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-600 rounded"></div>
                  <span className="text-sm">{t("front.visualisation.aAmeliorer")}(&lt;80%)</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}