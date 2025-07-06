"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Package, MapPin, Barcode, Eye, AlertTriangle, CheckCircle, Download } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"

export default function ProductSearch() {

  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("name")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentMagasin, setCurrentMagasin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  

  const pdfRef = useRef<HTMLDivElement>(null)

  // Fonction pour générer le PDF
  const generatePDF = async () => {
    if (!selectedProduct || !pdfRef.current) return;
  
    try {
      setLoading(true);
  
      // 1. Clonage propre de l'élément
      const element = pdfRef.current;
      const clone = element.cloneNode(true) as HTMLElement;
  
      clone.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 210mm;
        padding: 15mm;
        background: white;
        z-index: 9999;
        visibility: visible;
        box-sizing: border-box;
      `;
  
      // Prévention de coupure de cartes
      const cards = clone.querySelectorAll('.position-card');
      cards.forEach(card => {
        (card as HTMLElement).style.cssText += `
          page-break-inside: avoid;
          break-inside: avoid;
          margin-bottom: 10px;
        `;
      });
  
      document.body.appendChild(clone);
  
      // 2. Rendu Canvas
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: '#ffffff'
      });
  
      document.body.removeChild(clone);
      if (!canvas) throw new Error("Rendu HTML échoué");
  
      // 3. PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
  
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 297;
      const margin = 15;
      const contentHeight = pageHeight - 2 * margin;
      let position = 0;
  
      // 4. Calcul des positions des cartes
      const cardElements = Array.from(cards) as HTMLElement[];
      const cardPositions = cardElements.map(card => {
        const top = card.offsetTop * (canvas.height / clone.scrollHeight);
        const height = card.offsetHeight * (canvas.height / clone.scrollHeight);
        return { top, bottom: top + height };
      });
  
      // 5. Pagination intelligente
      while (position < imgHeight) {
        let nextPosition = position + contentHeight;
  
        // Vérifie si un élément est coupé
        const breakingCard = cardPositions.find(({ top, bottom }) =>
          top < nextPosition && bottom > nextPosition
        );
  
        // Ajuste la position pour éviter les coupures
        if (breakingCard) {
          nextPosition = breakingCard.bottom;
        }
  
        if (position > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
        position = nextPosition;
      }
  
      // 6. Pied de page
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(
          `Page ${i}/${totalPages} - ${selectedProduct.nom}`,
          105,
          287,
          { align: 'center' }
        );
      }
  
      pdf.save(`fiche_produit_${selectedProduct.nom.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      setError("Erreur lors de la génération. Essayez avec un autre produit.");
  
      if (confirm("La génération a échoué. Voulez-vous une version simplifiée ?")) {
        generateEnhancedSimplePDF();
      }
    } finally {
      setLoading(false);
    }
  };
  
  
  // Version simplifiée améliorée
  const generateEnhancedSimplePDF = () => {
    if (!selectedProduct) return;
  
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;
  
    // Couleurs
    const primaryColor = [33, 150, 243];
    const secondaryColor = [100, 100, 100];
    const accentColor = [76, 175, 80];
  
    // En-tête
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 15, 'F');
    pdf.setFontSize(20);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`Fiche Produit: ${selectedProduct.nom}`, pageWidth / 2, 10, { align: 'center' });
  
    // Réinitialiser la position Y
    y = 25;
  
    // Image du produit (si disponible)
    if (selectedProduct.imageUrl) {
      try {
        const img = new Image();
        img.src = selectedProduct.imageUrl;
        img.crossOrigin = "Anonymous";
        
        // Ajouter l'image (150x150px)
        pdf.addImage(img, 'JPEG', margin, y, 40, 40);
      } catch (e) {
        console.error("Erreur chargement image:", e);
      }
      y += 45;
    }
  
    // Informations principales
    pdf.setFontSize(12);
    pdf.setTextColor(...secondaryColor);
    
    const mainInfo = [
      { label: "ID Produit", value: selectedProduct.produit_id },
      { label: "Description", value: selectedProduct.description || "Non disponible" },
      { label: "Catégorie", value: selectedProduct.categorie?.nom || "Inconnu" },
      { label: "Fournisseur", value: selectedProduct.fournisseur?.nom || "Inconnu" },
      { label: "Prix", value: `${selectedProduct.prix} RS` },
      { label: "Stock", value: `${selectedProduct.stock} unités` },
      { label: "Statut", value: getStatusText(selectedProduct.stock) }
    ];
  
    mainInfo.forEach(info => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${info.label}:`, margin, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(info.value, margin + 30, y);
      y += 7;
    });
  
    y += 5;
  
    // Section Emplacements
    pdf.setFontSize(14);
    pdf.setTextColor(...primaryColor);
    pdf.text("Emplacements:", margin, y);
    y += 10;
  
    pdf.setFontSize(10);
    pdf.setTextColor(...secondaryColor);
  
    if (selectedProduct.positions?.length > 0) {
      selectedProduct.positions.forEach((pos: any, index: number) => {
        if (y > 250) { // Nouvelle page si nécessaire
          pdf.addPage();
          y = 20;
        }
  
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, y, pageWidth - 2 * margin, 25, 'F');
        
        pdf.text(`Zone: ${pos.furniture?.planogram?.zone?.nom_zone || "Inconnue"}`, margin + 5, y + 7);
        pdf.text(`Position: Face ${pos.face}, Étagère ${pos.etagere}, Colonne ${pos.colonne}`, margin + 5, y + 14);
        pdf.text(`Quantité: ${pos.quantite}`, margin + 5, y + 21);
        
        y += 30;
      });
    } else {
      pdf.text("Aucun emplacement enregistré", margin, y);
      y += 10;
    }
  
    // Pied de page
    pdf.setFontSize(8);
    pdf.setTextColor(...secondaryColor);
    pdf.text(`Généré le ${new Date().toLocaleString()}`, margin, 290);
    pdf.text(`© ${new Date().getFullYear()} ${currentMagasin?.nom || 'Notre Magasin'}`, pageWidth - margin, 290, { align: 'right' });
  
    pdf.save(`fiche_produit_${selectedProduct.nom.replace(/[^a-z0-9]/gi, '_')}.pdf`);
  };
  
  // Version simplifiée sans html2canvas
  const generateSimplePDF = () => {
    const pdf = new jsPDF();
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text(`Fiche Produit: ${selectedProduct.nom}`, 105, 20, { align: 'center' });
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    
    let y = 40;
    const addField = (label: string, value: string) => {
      pdf.text(`${label}: ${value}`, 20, y);
      y += 10;
    };
    
    addField('ID Produit', selectedProduct.produit_id);
    addField('Description', selectedProduct.description || 'Non disponible');
    addField('Catégorie', selectedProduct.categorie?.nom || "Inconnu");
    addField('Fournisseur', selectedProduct.fournisseur?.nom || "Inconnu");
    addField('Prix', `${selectedProduct.prix} RS`);
    addField('Stock', `${selectedProduct.stock} unités`);
    addField('Statut', getStatusText(selectedProduct.stock));
    
    pdf.save(`fiche_simple_${selectedProduct.nom}.pdf`);
  };
  // Fetch current user ID
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token d'authentification manquant")
        }

        const response = await fetch("http://localhost:8081/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include"
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données utilisateur")
        }

        const data = await response.json()
        const userId = data.user?.idUtilisateur || data.idUtilisateur || data.id
        setCurrentUserId(userId)
      } catch (error) {
        console.error("Error fetching current user ID:", error)
        setError("Erreur lors de la récupération de l'utilisateur")
      }
    }

    fetchCurrentUserId()
  }, [])

  // Fetch user's magasin
  useEffect(() => {
    const fetchUserMagasin = async () => {
      if (!currentUserId) return

      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`http://localhost:8081/api/magasins/getMagasinByUser/${currentUserId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du magasin")
        }

        const data = await response.json()
        setCurrentMagasin(data)
      } catch (error) {
        console.error("Error fetching user's magasin:", error)
        setError("Erreur lors de la récupération du magasin")
      }
    }

    fetchUserMagasin()
  }, [currentUserId])

  // Fetch products when magasin is available
  useEffect(() => {
    const fetchProducts = async () => {
      if (!currentMagasin?.magasin_id) return

      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const response = await fetch(`http://localhost:8081/api/produits/getProduitDetails/${currentMagasin.magasin_id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des produits")
        }

        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Erreur lors de la récupération des produits")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentMagasin])

  const filteredProducts = products.filter((product) => {
    const searchValue = searchTerm.toLowerCase()
    switch (searchType) {
      case "name":
        return product.nom.toLowerCase().includes(searchValue)
      case "barcode":
        return product.produit_id.toLowerCase().includes(searchValue)
      case "category":
        return product.categorie.nom.toLowerCase().includes(searchValue)
      default:
        return product.nom.toLowerCase().includes(searchValue)
    }
  })

  const getStatusColor = (stock: number) => {
    if (stock === 0) return "bg-red-100 text-red-800"
    if (stock < 50) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getStatusText = (stock: number) => {
    if (stock === 0) return "Rupture"
    if (stock < 50) return "Stock faible"
    return "En stock"
  }

  const getStatusIcon = (stock: number) => {
    if (stock === 0) return <AlertTriangle className="h-4 w-4 text-red-600" />
    if (stock < 50) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }

  const getPerformanceColor = (sales: any[]) => {
    const totalSales = sales.reduce((sum, vente) => sum + vente.quantite, 0)
    if (totalSales >= 50) return "text-green-600"
    if (totalSales >= 20) return "text-yellow-600"
    return "text-red-600"
  }

  const getTotalSales = (sales: any[]) => {
    return sales.reduce((sum, vente) => sum + vente.quantite, 0)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
          <p className="text-gray-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Barre de recherche */}
      <Card>
        <CardHeader>
          <CardTitle>{t("front.recherche.rechercheProd")}</CardTitle>
          <CardDescription>{t("front.recherche.rechercheProdDescr")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t("front.recherche.rechercherProduit")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Type de recherche" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t("front.recherche.nomProduit")}</SelectItem>
                <SelectItem value="barcode">{t("front.recherche.codeProduit")}</SelectItem>
                <SelectItem value="category">{t("front.recherche.categorie")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des résultats */}
        <div className="lg:col-span-2 space-y-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  selectedProduct?.id === product.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedProduct(product)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.nom}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg truncate">{product.nom}</h3>
                          <p className="text-sm text-muted-foreground">
                            {product.fournisseur?.nom} • {product.categorie?.nom}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {getStatusIcon(product.stock)}
                          <Badge className={getStatusColor(product.stock)}>
                            {getStatusText(product.stock)}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <span className="font-medium">{t("front.recherche.prix")}</span>
                          <div className="text-lg font-bold text-blue-600">{product.prix}RS</div>
                        </div>
                        <div>
                          <span className="font-medium">{t("front.recherche.stock")}</span>
                          <div className={product.stock === 0 ? "text-red-600 font-bold" : "font-medium"}>
                            {product.stock} {t("front.recherche.unite")}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">{t("front.recherche.ventes")}</span>
                          <div className={`font-bold ${getPerformanceColor(product.ventes)}`}>
                            {getTotalSales(product.ventes)} {t("front.recherche.unite")}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">{t("front.recherche.emplacement")}</span>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{product.positions?.length || 0} {t("front.recherche.position")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Barcode className="h-3 w-3" />
                          <span>{product.produit_id}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          {t("front.recherche.localiser")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t("front.recherche.noProduit")}</h3>
                <p className="text-gray-500">{t("front.recherche.ameliorerFiltre")}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Détails du produit sélectionné */}
        <div>
          {selectedProduct ? (
            <>
              {/* Bouton de téléchargement en haut à droite */}
              <div className="flex justify-end mb-4">
                <Button onClick={generatePDF} size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  {t("front.recherche.telechargerFiche")}
                </Button>
              </div>

              {/* Contenu du PDF (caché à l'écran mais utilisé pour le PDF) */}
              <div 
  ref={pdfRef} 
  id="pdf-container"
  style={{
    visibility: 'hidden',
    position: 'absolute',
    left: '-9999px'
  }}
>
  <div className="bg-white" style={{
    fontFamily: "'Helvetica', 'Arial', sans-serif",
    lineHeight: 1.6,
    color: '#333',
    maxWidth: '210mm',
    margin: '0 auto'
  }}>
    {/* En-tête avec style PDF-friendly */}
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      paddingBottom: '15px',
      borderBottom: '1px solid #eee'
    }}>
      <div>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#2c3e50',
          margin: '0 0 5px 0'
        }}>FICHE PRODUIT</h1>
        <p style={{ fontSize: '12px', color: '#7f8c8d', margin: 0 }}>
          Magasin: {currentMagasin?.nom || 'Non spécifié'}
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: '12px', margin: '0 0 5px 0' }}>
          Date: {new Date().toLocaleDateString('fr-FR')}
        </p>
        <p style={{ fontSize: '12px', margin: 0 }}>
          Réf: {selectedProduct.produit_id}
        </p>
      </div>
    </div>

    {/* Section principale avec colonnes */}
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '20px',
      marginBottom: '25px'
    }}>
      {/* Colonne image */}
      <div style={{ width: '35%' }}>
        <div style={{
          width: '100%',
          height: '200px',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '15px',
          border: '1px solid #eee',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <img
            src={selectedProduct.imageUrl || "/placeholder.svg"}
            alt={selectedProduct.nom}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
            crossOrigin="anonymous"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>
        <div style={{
          padding: '8px 12px',
          backgroundColor: getStatusColor(selectedProduct.stock),
          color: 'white',
          borderRadius: '20px',
          textAlign: 'center',
          fontWeight: '500',
          fontSize: '14px'
        }}>
          {getStatusText(selectedProduct.stock)}
        </div>
      </div>

      {/* Colonne informations */}
      <div style={{ width: '65%' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          margin: '0 0 10px 0',
          color: '#34495e'
        }}>{selectedProduct.nom}</h2>
        
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: 0 }}>
            {selectedProduct.description || "Aucune description disponible"}
          </p>
        </div>

        {/* Grille d'informations */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px'
        }}>
          {/* Bloc informations */}
          <div style={{
            border: '1px solid #eee',
            borderRadius: '4px',
            padding: '15px',
            backgroundColor: 'white'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 12px 0',
              color: '#2980b9',
              paddingBottom: '8px',
              borderBottom: '1px solid #eee'
            }}>INFORMATIONS</h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                <span style={{ fontWeight: '500' }}>Catégorie:</span> {selectedProduct.categorie?.nom || "Inconnu"}
              </p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                <span style={{ fontWeight: '500' }}>Fournisseur:</span> {selectedProduct.fournisseur?.nom || "Inconnu"}
              </p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                <span style={{ fontWeight: '500' }}>Saisonnalité:</span> {selectedProduct.saisonnalite || "Toute saison"}
              </p>
            </div>
          </div>

          {/* Bloc stock */}
          <div style={{
            border: '1px solid #eee',
            borderRadius: '4px',
            padding: '15px',
            backgroundColor: 'white'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 12px 0',
              color: '#2980b9',
              paddingBottom: '8px',
              borderBottom: '1px solid #eee'
            }}>STOCK & PRIX</h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                <span style={{ fontWeight: '500' }}>Prix:</span> {selectedProduct.prix.toFixed(2)}€
              </p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                <span style={{ fontWeight: '500' }}>Stock:</span> {selectedProduct.stock} unités
              </p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                <span style={{ fontWeight: '500' }}>Ventes:</span> {getTotalSales(selectedProduct.ventes)} unités
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Section emplacements */}
    <div style={{ marginBottom: '25px' }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: 'bold',
        margin: '0 0 15px 0',
        color: '#2c3e50',
        paddingBottom: '8px',
        borderBottom: '1px solid #eee'
      }}>EMPLACEMENTS</h3>
      
      {selectedProduct.positions?.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '15px'
        }}>
          {selectedProduct.positions.map((position: any) => (
            <div key={position.position_id} style={{
              border: '1px solid #eee',
              borderRadius: '4px',
              padding: '15px',
              backgroundColor: 'white'
            }}>
              <h4 style={{
                fontSize: '15px',
                fontWeight: '600',
                margin: '0 0 10px 0',
                color: '#34495e'
              }}>
                {position.furniture?.planogram?.zone?.nom_zone || "Zone inconnue"}
              </h4>
              <div style={{ display: 'grid', gap: '6px', fontSize: '13px' }}>
                <div>
                  <span style={{ fontWeight: '500' }}>Planogramme:</span> {position.furniture?.planogram?.nom || "Non spécifié"}
                </div>
                <div>
                  <span style={{ fontWeight: '500' }}>Type:</span> {position.furniture?.furnitureType?.nomType || "Inconnu"}
                </div>
                <div>
                  <span style={{ fontWeight: '500' }}>Position:</span> Face {position.face}, Étagère {position.etagere}, Colonne {position.colonne}
                </div>
                <div>
                  <span style={{ fontWeight: '500' }}>Quantité:</span> {position.quantite}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontStyle: 'italic', color: '#7f8c8d' }}>
            Aucune position enregistrée pour ce produit
          </p>
        </div>
      )}
    </div>

    {/* Pied de page */}
    <div style={{
      textAlign: 'center',
      fontSize: '11px',
      color: '#7f8c8d',
      marginTop: '30px',
      paddingTop: '15px',
      borderTop: '1px solid #eee'
    }}>
      <p style={{ margin: '5px 0' }}>
        Document généré le {new Date().toLocaleString('fr-FR')} par {currentUserId}
      </p>
      <p style={{ margin: '5px 0' }}>
        © {new Date().getFullYear()} {currentMagasin?.nom || 'Smart Store-IA'} - Tous droits réservés
      </p>
    </div>
  </div>
</div>

              {/* Affichage normal à l'écran */}
              <Card className="sticky top-4">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{t("front.recherche.ficheProduit")}</CardTitle>
                    <Button onClick={generatePDF} size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <img
                      src={selectedProduct.imageUrl || "/placeholder.svg"}
                      alt={selectedProduct.nom}
                      className="w-24 h-24 object-cover rounded-lg border mx-auto mb-3"
                    />
                    <h3 className="font-medium">{selectedProduct.nom}</h3>
                    <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{t("front.recherche.idProduit")}</span>
                      <span className="text-sm">{selectedProduct.produit_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{t("front.recherche.codeProduit")}</span>
                      <span className="text-sm font-mono">{selectedProduct.produit_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{t("front.recherche.fournisseur")}</span>
                      <span className="text-sm">{selectedProduct.fournisseur?.nom || "Inconnu"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{t("front.recherche.categorie")}</span>
                      <span className="text-sm">{selectedProduct.categorie?.nom || "Inconnu"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{t("front.recherche.saisonnalite")}</span>
                      <span className="text-sm">{selectedProduct.saisonnalite || "Toute saison"}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <h4 className="font-medium mb-2">{t("front.recherche.localisations")}</h4>
                    {selectedProduct.positions?.length > 0 ? (
                      <div className="space-y-3">
                        {selectedProduct.positions.map((position: any) => (
                          <div key={position.position_id} className="text-sm border p-2 rounded">
                            <div className="flex justify-between">
                              <span>{t("front.recherche.zone")}</span>
                              <span className="font-medium">
                                {position.furniture?.planogram?.zone?.nom_zone || "Inconnue"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t("front.recherche.planogramme")}</span>
                              <span className="font-medium">
                                {position.furniture?.planogram?.nom || "Non spécifié"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t("front.recherche.type")}</span>
                              <span className="font-medium">
                                {position.furniture?.furnitureType?.nomType || "Inconnu"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t("front.recherche.position")}:</span>
                              <span className="font-medium">
                                Face {position.face}, {t("front.recherche.etagere")} {position.etagere}, {t("front.recherche.colonne")} {position.colonne}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t("front.recherche.quantite")}</span>
                              <span className="font-medium">{position.quantite}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("front.recherche.noPosition")}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t">
                    <h4 className="font-medium mb-2">{t("front.recherche.performance")}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{t("front.recherche.venteTotals")}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getPerformanceColor(selectedProduct.ventes)}`}
                              style={{
                                width: `${Math.min(100, (getTotalSales(selectedProduct.ventes) / 100) * 100)}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {getTotalSales(selectedProduct.ventes)} {t("front.recherche.unite")}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">{t("front.recherche.dernierPrix")}</span>
                        <span className="text-sm font-medium">
                          {selectedProduct.ventes[0]?.prix_unitaire || selectedProduct.prix}RS
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <h4 className="font-medium mb-2">{t("front.recherche.stock")}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">{t("front.recherche.quantiteActuel")}</span>
                        <span className="text-sm font-medium">{selectedProduct.stock} {t("front.recherche.unite")}</span>
                      </div>
                      {selectedProduct.stockmovements?.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm">{t("front.recherche.dernierMouvement")}</span>
                          <span className="text-sm font-medium">
                            {selectedProduct.stockmovements[0].type_mouvement} de {selectedProduct.stockmovements[0].quantite} {t("front.recherche.unite")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <Button className="w-full" size="sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      {t("front.recherche.localiserDansMagasin")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500"> {t("front.recherche.selectProdDetails")}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}