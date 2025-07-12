import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, X, Search, Image as ImageIcon, Trash2, Edit,
  User, DollarSign, Ruler, LayoutGrid, AlertTriangle, Save,
  ChevronDown, Store, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import './CreateOrder.css';
import '../multilingue/i18n.js';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = "http://localhost:8081/api";

// Composant pour afficher les détails du produit dans un modal
const ProductDetailsModal = ({ product, onClose, categories, fournisseurs }) => {
  const { t, i18n } = useTranslation(); 
  const isRTL = i18n.language === 'ar'; // RTL pour l'arabe, sinon LTR
  const textDirection = isRTL ? 'rtl' : 'ltr';
  if (!product) return null;

  return (
    <div className="modal-overlay" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <div className="product-details-modal">
        <div className="modal-header">
          <h2>{t("actionsRapide.createProduct.detailsProduit")}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="product-details-content">
          <div className="product-image-section">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.nom} 
                className="product-detail-image"
                onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=Image+non+disponible'}
              />
            ) : (
              <div className="image-placeholder">
                <ImageIcon size={48} />
              </div>
            )}
          </div>
          
          <div className="product-info-section">
            <div className="detail-row">
              <span className="detail-label">{t("actionsRapide.createProduct.id")}:</span>
              <span className="detail-value">{product.produit_id}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">{t("actionsRapide.createProduct.nom")}:</span>
              <span className="detail-value">{product.nom}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">{t("actionsRapide.createProduct.description")}:</span>
              <span className="detail-value">{product.description || 'Non renseignée'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">{t("actionsRapide.createProduct.prix")}:</span>
              <span className="detail-value">€{product.prix?.toFixed(2)}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">{t("actionsRapide.createProduct.stock")}:</span>
              <span className="detail-value">{product.stock}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">{t("actionsRapide.createProduct.categorie")}:</span>
              <span className="detail-value">
                {categories.find(c => c.categorie_id === product.categorie_id)?.nom || product.categorie_id}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">{t("actionsRapide.createProduct.fournisseur")}:</span>
              <span className="detail-value">
                {fournisseurs.find(s => s.fournisseur_id == product.fournisseur_id)?.nom || product.fournisseur_id}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">{t("actionsRapide.createProduct.dimensions")}:</span>
              <span className="detail-value">
                {product.longeur && product.largeur && product.hauteur 
                  ? `${product.longeur}cm × ${product.largeur}cm × ${product.hauteur}cm` 
                  : 'Non renseignées'}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">{t("actionsRapide.createProduct.poids")}:</span>
              <span className="detail-value">{product.poids ? `${product.poids} kg` : 'Non renseigné'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">{t("actionsRapide.createProduct.saisonnalite")}:</span>
              <span className="detail-value">{product.saisonnalite || 'Non renseignée'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">{t("actionsRapide.createProduct.prioriteMarch")}:</span>
              <span className={`detail-value priority-${product.priorite_merchandising}`}>
                {product.priorite_merchandising === 'high' ? 'Haute' : 
                 product.priorite_merchandising === 'medium' ? 'Moyenne' : 'Basse'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateProduct = () => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(1);
  const [entrepriseId, setEntrepriseId] = useState(1); 
  const [magasins, setMagasins] = useState([]);
  const [selectedMagasin, setSelectedMagasin] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentEntrepriseID, setcurrentEntrepriseID] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [isMagasinDropdownOpen, setIsMagasinDropdownOpen] = useState(false);

  const { t, i18n } = useTranslation(); 
  const isRTL = i18n.language === 'ar'; // RTL pour l'arabe, sinon LTR
  const textDirection = isRTL ? 'rtl' : 'ltr';

  // Form state
  const [formData, setFormData] = useState({
    produit_id: '',
    nom: '',
    description: '',
    prix: 0,
    stock: 0,
    categorie_id: '',
    magasin_id: '',
    longeur: 0,
    largeur: 0,
    hauteur: 0,
    poids: 0,
    saisonnalite: '',
    priorite_merchandising: 'medium',
    contrainte_temperature: '',
    contrainte_conditionnement: '',
    conditionnement: '',
    imageUrl: '',
    fournisseur_id: ''
  });

  // Fonction pour afficher les détails du produit
  const showProductDetails = (product) => {
    setSelectedProductDetails(product);
    setShowDetailsModal(true);
  };

  // Récupérer l'utilisateur connecté et l'ID de l'entreprise
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/auth/me", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const responseData = await response.json();
        const userData = responseData.user || responseData;
        const entrepriseId = userData.entreprises_id;
        console.log('ID de l\'entreprise connectée :', entrepriseId);
        setCurrentUser(userData);
        setcurrentEntrepriseID(entrepriseId);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        toast.error("Impossible de récupérer les informations de l'utilisateur");
      }
    };

    fetchCurrentUser();
  }, []);

  // Récupérer les magasins
  useEffect(() => {
    if (currentEntrepriseID) {
      const fetchMagasins = async () => {
        try {
          const response = await fetch(`http://localhost:8081/api/magasins/getMagasinsByEntrepriseId/${currentEntrepriseID}`);
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          const data = await response.json();
          console.log("magasin selectionner", data);
          setMagasins(data);
        } catch (error) {
          console.error("Erreur lors de la récupération des magasins:", error);
          toast.error("Impossible de charger les magasins");
        }
      };
      fetchMagasins();
    }
  }, [currentEntrepriseID]);

  // Récupérer les fournisseurs
  useEffect(() => {
    if (currentEntrepriseID) {
      const fetchFournisseurs = async () => {
        try {
          const response = await fetch(`http://localhost:8081/api/fournisseur/getAllFournisseursByEntreprise/${currentEntrepriseID}`);
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          const data = await response.json();
          setFournisseurs(data);
        } catch (error) {
          console.error("Erreur lors de la récupération des fournisseurs:", error);
          toast.error("Impossible de charger les fournisseurs");
        }
      };
      fetchFournisseurs();
    }
  }, [currentEntrepriseID]);

  // supprimer produit : 
  const deleteProduct = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/produits/deleteProduit/${id}`, {
          method: "DELETE"
        });
        
        if (!response.ok) throw new Error("Erreur lors de la suppression");
        
        setProducts(prev => prev.filter(product => product.id !== id));
        toast.success('Produit supprimé avec succès');
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // update produit
  const updateProduct = async (id) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/produits/updateProduit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour du produit");
      }
  
      const updatedProduct = await response.json();
      
      // Mise à jour de la liste des produits
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      
      toast.success('Produit mis à jour avec succès!');
      setIsCreating(false);
      resetForm();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer les catégories lorsque le magasin change
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/categories/getCategoriesByMagasin/${selectedMagasin}`);
        if (!response.ok) throw new Error("Erreur lors de la récupération des catégories");
        const data = await response.json();
        setCategories(data);
        setFormData(prev => ({ ...prev, magasin_id: selectedMagasin }));
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (selectedMagasin) fetchCategories();
  }, [selectedMagasin]);

  // Récupérer les produits lorsque le magasin change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/produits/getProductsByMagasin/${selectedMagasin}`);
        if (!response.ok) throw new Error("Erreur lors de la récupération des produits");
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (selectedMagasin) fetchProducts();
  }, [selectedMagasin]);

  const filteredProducts = products.filter(product =>
    product.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.produit_id?.includes(searchQuery)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'prix' || name === 'stock' || name === 'longeur' || 
               name === 'largeur' || name === 'hauteur' || name === 'poids' 
               ? parseFloat(value) || 0 
               : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.produit_id.startsWith('P')) {
      toast.error("L'ID produit doit commencer par 'P'");
      return;
    }
  
    try {
      setIsLoading(true);
      
      // Si c'est une modification (on vérifie si le produit existe déjà)
      const existingProduct = products.find(p => p.produit_id === formData.produit_id);
      
      if (currentProduct) {
        await updateProduct(currentProduct.id);
      } else {
        // Sinon, création
        const response = await fetch(`${API_BASE_URL}/produits/createProduit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erreur lors de la création du produit");
        }
  
        const newProduct = await response.json();
        setProducts(prev => [...prev, newProduct]);
        resetForm();
        setIsCreating(false);
        toast.success('Produit créé avec succès!');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      produit_id: '',
      nom: '',
      description: '',
      prix: 0,
      stock: 0,
      categorie_id: '',
      magasin_id: selectedMagasin || '',
      longeur: 0,
      largeur: 0,
      hauteur: 0,
      poids: 0,
      saisonnalite: '',
      priorite_merchandising: 'medium',
      contrainte_temperature: '',
      contrainte_conditionnement: '',
      conditionnement: '',
      imageUrl: '',
      fournisseur_id: ''
    });
    setCurrentTab(1);
  };

  const handleTabChange = (tabNumber) => {
    setCurrentTab(tabNumber);
  };

  // Sélecteur de magasin personnalisé
  const CustomMagasinSelector = ({ magasins, selectedMagasin, onSelect, isLoading }) => {
    return (
      <div className={`custom-select ${isMagasinDropdownOpen ? 'open' : ''}`}>
        <div 
          className="select-header"
          onClick={() => setIsMagasinDropdownOpen(!isMagasinDropdownOpen)}
        >
          <div className="selected-value">
            <Store size={16} className="store-icon" />
            {selectedMagasin 
                ? magasins.find(m => m.magasin_id == selectedMagasin)?.nom_magasin 
                : t("actionsRapide.createOrder.selectMagasin")}
          </div>
          <ChevronDown size={16} className={`dropdown-icon ${isMagasinDropdownOpen ? 'rotate' : ''}`} />
        </div>
        
        {isMagasinDropdownOpen && (
          <div className="select-options">
            {magasins.length === 0 ? (
              <div className="option disabled">{t("actionsRapide.createProduct.aucunMagasin")}</div>
            ) : (
              magasins.map(magasin => (
                <div
                  key={magasin.magasin_id}
                  className={`option ${selectedMagasin == magasin.magasin_id ? 'selected' : ''}`}
                  onClick={() => {
                    onSelect(magasin.magasin_id);
                    setIsMagasinDropdownOpen(false);
                  }}
                >
                  <Store size={14} className="option-icon" />
                  {magasin.nom_magasin}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <main className="main-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header className="page-header">
          <h1>{t("actionsRapide.createProduct.gestionProduit")}</h1>
          <div className="header-actions">
            <button 
              className="button secondary"
              onClick={() => router.push('/Dashboard')}
              disabled={isLoading}
            >
              <X size={18} /> {t("actionsRapide.createProduct.annuler")}
            </button>
            <button 
              className="button primary"
              onClick={() => setIsCreating(true)}
              disabled={!selectedMagasin || isLoading}
            >
              <Plus size={18} />{t("actionsRapide.createProduct.nouvProduit")}
            </button>
          </div>
        </header>

        {/* Sélecteur de magasin amélioré */}
        <div className="magasin-selector-container">
          <label>{t("actionsRapide.createProduct.magasin")}</label>
          <CustomMagasinSelector
            magasins={magasins}
            selectedMagasin={selectedMagasin}
            onSelect={setSelectedMagasin}
            isLoading={isLoading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Formulaire de création */}
        {isCreating && (
          <div className="creation-modal expanded-modal">
            <div className="modal-content expanded-content">
              <div className="modal-header">
              <h2>
                {formData.produit_id
                  ? t("actionsRapide.createProduct.modifierProduit")
                  : t("actionsRapide.createProduct.nouvProduit")}
              </h2>

                <button 
                  className="close-button"
                  onClick={() => {
                    setIsCreating(false);
                    resetForm();
                  }}
                  disabled={isLoading}
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="product-form expanded-form">
                <div className="form-progress">
                  <div className="progress-steps">
                    {[1, 2, 3, 4].map(step => (
                      <button 
                        type="button" 
                        key={step}
                        className={`progress-step ${currentTab === step ? 'active' : ''}`}
                        onClick={() => handleTabChange(step)}
                        disabled={isLoading}
                      >
                        {step === 1 && t("actionsRapide.createProduct.info")}
                        {step === 2 && t("actionsRapide.createProduct.details")}
                        {step === 3 && t("actionsRapide.createProduct.marchandising")}
                        {step === 4 && t("actionsRapide.createProduct.revue")}

                      </button>
                    ))}
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(currentTab / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Onglet 1 - Informations de base */}
                <div className={`form-section-tab ${currentTab === 1 ? 'active' : ''}`}>
                  <div className="form-section">
                    <h3 className="section-title">
                      <User size={18} /> {t("actionsRapide.createProduct.info")}
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label> {t("actionsRapide.createProduct.idProduit")} <span className="required">*</span></label>
                        <div className="input-with-prefix">
                          <span className="prefix">P</span>
                          <input
                            type="text"
                            name="produit_id"
                            value={formData.produit_id.replace('P', '')}
                            onChange={(e) => setFormData({...formData, produit_id: 'P' + e.target.value})}
                            required
                            pattern="[0-9]+"
                            title="Doit contenir uniquement des chiffres après le P"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label> {t("actionsRapide.createProduct.nom")} <span className="required">*</span></label>
                        <input
                          type="text"
                          name="nom"
                          value={formData.nom}
                          onChange={handleInputChange}
                          required
                          maxLength="100"
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div className="form-group span-2">
                        <label> {t("actionsRapide.createProduct.description")}</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={3}
                          maxLength="500"
                          placeholder="Décrivez le produit en quelques mots..."
                          disabled={isLoading}
                        />
                        <div className="character-counter">
                          {formData.description.length}/500  {t("actionsRapide.createProduct.caracteres")}
                        </div>
                      </div>

                      <div className="form-group">
                        <label> {t("actionsRapide.createProduct.categorie")} <span className="required">*</span></label>
                        <select
                          name="categorie_id"
                          value={formData.categorie_id}
                          onChange={handleInputChange}
                          required
                          disabled={isLoading || categories.length === 0}
                        >
                          <option value=""> {t("actionsRapide.createProduct.selectionner")}</option>
                          {categories.map(category => (
                            <option key={category.categorie_id} value={category.categorie_id}>
                              {category.nom}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-navigation">
                    <button 
                      type="button" 
                      className="button next-tab"
                      onClick={() => handleTabChange(2)}
                      disabled={isLoading}
                    >
                       {t("actionsRapide.createProduct.suivant")} <span>→</span>
                    </button>
                  </div>
                </div>

                {/* Onglet 2 - Détails */}
                <div className={`form-section-tab ${currentTab === 2 ? 'active' : ''}`}>
                  <div className="form-section">
                    <h3 className="section-title">
                      <DollarSign size={18} />  {t("actionsRapide.createProduct.prixStock")}
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label> {t("actionsRapide.createProduct.prix")} (€) <span className="required">*</span></label>
                        <div className="input-with-suffix">
                          <input
                            type="number"
                            name="prix"
                            value={formData.prix}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            required
                            disabled={isLoading}
                          />
                          <span className="suffix">€</span>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label> {t("actionsRapide.createProduct.stock")} <span className="required">*</span></label>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          min="0"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label> {t("actionsRapide.createProduct.fournisseur")} <span className="required">*</span></label>
                        <select
                          name="fournisseur_id"
                          value={formData.fournisseur_id}
                          onChange={handleInputChange}
                          required
                          disabled={isLoading || fournisseurs.length === 0}
                        >
                          <option value=""> {t("actionsRapide.createProduct.selectionner")}</option>
                          {fournisseurs.map(fournisseur => (
                            <option key={fournisseur.fournisseur_id} value={fournisseur.fournisseur_id}>
                              {fournisseur.nom}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="section-title">
                      <Ruler size={18} />  {t("actionsRapide.createProduct.dimensions")}
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label> {t("actionsRapide.createProduct.longeur")} ( {t("actionsRapide.createProduct.cm")})</label>
                        <div className="input-with-suffix">
                          <input
                            type="number"
                            name="longeur"
                            value={formData.longeur}
                            onChange={handleInputChange}
                            min="0"
                            step="0.1"
                            disabled={isLoading}
                          />
                          <span className="suffix"> {t("actionsRapide.createProduct.cd")}</span>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label> {t("actionsRapide.createProduct.largeur")} ( {t("actionsRapide.createProduct.cm")})</label>
                        <div className="input-with-suffix">
                          <input
                            type="number"
                            name="largeur"
                            value={formData.largeur}
                            onChange={handleInputChange}
                            min="0"
                            step="0.1"
                            disabled={isLoading}
                          />
                          <span className="suffix"> {t("actionsRapide.createProduct.cm")}</span>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label> {t("actionsRapide.createProduct.hauteur")} ( {t("actionsRapide.createProduct.cm")})</label>
                        <div className="input-with-suffix">
                          <input
                            type="number"
                            name="hauteur"
                            value={formData.hauteur}
                            onChange={handleInputChange}
                            min="0"
                            step="0.1"
                            disabled={isLoading}
                          />
                          <span className="suffix"> {t("actionsRapide.createProduct.cm")}</span>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label> {t("actionsRapide.createProduct.poids")} ( {t("actionsRapide.createProduct.kg")})</label>
                        <div className="input-with-suffix">
                          <input
                            type="number"
                            name="poids"
                            value={formData.poids}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            disabled={isLoading}
                          />
                          <span className="suffix"> {t("actionsRapide.createProduct.kg")}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-navigation">
                    <button 
                      type="button" 
                      className="button secondary prev-tab"
                      onClick={() => handleTabChange(1)}
                      disabled={isLoading}
                    >
                      ←  {t("actionsRapide.createProduct.precedent")}
                    </button>
                    <button 
                      type="button" 
                      className="button next-tab"
                      onClick={() => handleTabChange(3)}
                      disabled={isLoading}
                    >
                       {t("actionsRapide.createProduct.suivant")} <span>→</span>
                    </button>
                  </div>
                </div>

                {/* Onglet 3 - Merchandising */}
                <div className={`form-section-tab ${currentTab === 3 ? 'active' : ''}`}>
                  <div className="form-section">
                    <h3 className="section-title">
                      <LayoutGrid size={18} />  {t("actionsRapide.createProduct.merch")}
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>{t("actionsRapide.createProduct.saisonnalite")}</label>
                        <select
                          name="saisonnalite"
                          value={formData.saisonnalite}
                          onChange={handleInputChange}
                          disabled={isLoading}
                        >
                          <option value="">{t("actionsRapide.createProduct.nonSpecifier")}</option>
                          <option value="Toute l'année">{t("actionsRapide.createProduct.toutAnnee")}</option>
                          <option value="Printemps">{t("actionsRapide.createProduct.printemps")}</option>
                          <option value="Été">{t("actionsRapide.createProduct.ete")}</option>
                          <option value="Automne">{t("actionsRapide.createProduct.automne")}</option>
                          <option value="Hiver">{t("actionsRapide.createProduct.hiver")}</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>{t("actionsRapide.createProduct.prioriteMarch")}</label>
                        <div className="priority-select">
                          <select
                            name="priorite_merchandising"
                            value={formData.priorite_merchandising}
                            onChange={handleInputChange}
                            disabled={isLoading}
                          >
                            <option value="low">{t("actionsRapide.createProduct.basse")}</option>
                            <option value="medium">{t("actionsRapide.createProduct.moyenne")}</option>
                            <option value="high">{t("actionsRapide.createProduct.haute")}</option>
                          </select>
                          <div className={`priority-indicator ${formData.priorite_merchandising}`}>
                            {formData.priorite_merchandising === 'high' ? 'Haute' : 
                            formData.priorite_merchandising === 'medium' ? 'Moyenne' : 'Basse'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="section-title">
                      <AlertTriangle size={18} /> {t("actionsRapide.createProduct.contraints")}
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>{t("actionsRapide.createProduct.contraintsTemperature")}</label>
                        <input
                          type="text"
                          name="contrainte_temperature"
                          value={formData.contrainte_temperature}
                          onChange={handleInputChange}
                          placeholder="Ex: 2-8°C"
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>{t("actionsRapide.createProduct.contraintsConditionnement")}</label>
                        <input
                          type="text"
                          name="contrainte_conditionnement"
                          value={formData.contrainte_conditionnement}
                          onChange={handleInputChange}
                          placeholder="Ex: Fragile"
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>{t("actionsRapide.createProduct.conditionnement")}</label>
                        <input
                          type="text"
                          name="conditionnement"
                          value={formData.conditionnement}
                          onChange={handleInputChange}
                          placeholder="Ex: Boîte carton"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-navigation">
                    <button 
                      type="button" 
                      className="button secondary prev-tab"
                      onClick={() => handleTabChange(2)}
                      disabled={isLoading}
                    >
                      ← {t("actionsRapide.createProduct.precedent")}
                    </button>
                    <button 
                      type="button" 
                      className="button next-tab"
                      onClick={() => handleTabChange(4)}
                      disabled={isLoading}
                    >
                      {t("actionsRapide.createProduct.suivant")} <span>→</span>
                    </button>
                  </div>
                </div>

                {/* Onglet 4 - Revue et Image */}
                <div className={`form-section-tab ${currentTab === 4 ? 'active' : ''}`}>
                  <div className="form-section">
                    <h3 className="section-title">
                      <ImageIcon size={18} /> {t("actionsRapide.createProduct.imageProduit")}
                    </h3>
                    <div className="form-group">
                      <label>{t("actionsRapide.createProduct.urlImage")}</label>
                      <div className="image-upload-container">
                        <input
                          type="url"
                          name="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleInputChange}
                          placeholder="https://..."
                          pattern="https://.*"
                          title="L'URL doit commencer par https://"
                          disabled={isLoading}
                        />
                        {formData.imageUrl ? (
                          <div className="image-preview-large">
                            <img 
                              src={formData.imageUrl} 
                              alt="Aperçu" 
                              onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Image+non+disponible'} 
                            />
                            <button 
                              type="button" 
                              className="remove-image-btn"
                              onClick={() => setFormData({...formData, imageUrl: ''})}
                              disabled={isLoading}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="image-upload-placeholder">
                            <ImageIcon size={32} />
                            <span>{t("actionsRapide.createProduct.apercuImage")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-section review-section">
                    <h3 className="section-title">
                      <Save size={18} /> {t("actionsRapide.createProduct.revueAvant")}
                    </h3>
                    <div className="review-grid">
                      <div className="review-item">
                        <label>{t("actionsRapide.createProduct.nomProduit")}</label>
                        <p>{formData.nom || <span className="missing-info">{t("actionsRapide.createProduct.nonRenseignier")}</span>}</p>
                      </div>
                      <div className="review-item">
                        <label>{t("actionsRapide.createProduct.idProduit")}</label>
                        <p>{formData.produit_id || <span className="missing-info">{t("actionsRapide.createProduct.nonRenseignier")}</span>}</p>
                      </div>
                      <div className="review-item">
                        <label>{t("actionsRapide.createProduct.prix")}:</label>
                        <p>{formData.prix ? `€${formData.prix.toFixed(2)}` : <span className="missing-info">{t("actionsRapide.createProduct.nonRenseignier")}</span>}</p>
                      </div>
                      <div className="review-item">
                        <label>{t("actionsRapide.createProduct.stock")}:</label>
                        <p>{formData.stock || <span className="missing-info">{t("actionsRapide.createProduct.nonRenseignier")}</span>}</p>
                      </div>
                      <div className="review-item">
                        <label>{t("actionsRapide.createProduct.categorie")}:</label>
                        <p>
                          {formData.categorie_id ? 
                            categories.find(c => c.categorie_id === formData.categorie_id)?.nom || formData.categorie_id 
                            : <span className="missing-info">{t("actionsRapide.createProduct.nonRenseignier")}</span>}
                        </p>
                      </div>
                      <div className="review-item">
                        <label>{t("actionsRapide.createProduct.fournisseur")}:</label>
                        <p>
                          {formData.fournisseur_id ? 
                            fournisseurs.find(s => s.fournisseur_id == formData.fournisseur_id)?.nom || formData.fournisseur_id 
                            : <span className="missing-info">{t("actionsRapide.createProduct.nonRenseignier")}</span>}
                        </p>
                      </div>
                      <div className="review-item">
                        <label>{t("actionsRapide.createProduct.dimensions")}:</label>
                        <p>
                          {formData.longeur && formData.largeur && formData.hauteur 
                            ? `${formData.longeur}cm × ${formData.largeur}cm × ${formData.hauteur}cm` 
                            : <span className="missing-info">{t("actionsRapide.createProduct.nonRenseignier")}</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="form-navigation">
                    <button 
                      type="button" 
                      className="button secondary prev-tab"
                      onClick={() => handleTabChange(3)}
                      disabled={isLoading}
                    >
                      ← {t("actionsRapide.createProduct.precedent")}
                    </button>
                    <button 
                      type="submit" 
                      className="button primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        t("actionsRapide.createProduct.enregistrement")
                      ) : (
                        <>
                          <Save size={18} /> {t("actionsRapide.createProduct.saveProduit")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Liste des produits */}
        <div className="products-container">
          <div className="search-bar">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder={t("actionsRapide.createProduct.rechercheParNom")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading || !selectedMagasin}
            />
          </div>

          {isLoading ? (
            <div className="loading-state">
              <p>{t("actionsRapide.createProduct.chargement")}</p>
            </div>
          ) : (
            <div className="products-list">
              {!selectedMagasin ? (
                <div className="empty-state">
                  <p>{t("actionsRapide.createProduct.selectionnerMagasin")}</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="empty-state">
                  <p>{t("actionsRapide.createProduct.aucunProduit")}</p>
                  <button 
                    className="button primary"
                    onClick={() => setIsCreating(true)}
                    disabled={isLoading}
                  >
                    <Plus size={16} />{t("actionsRapide.createProduct.ajouterProduit")}
                  </button>
                </div>
              ) : (
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>{t("actionsRapide.createProduct.id")}</th>
                      <th>{t("actionsRapide.createProduct.produit")}</th>
                      <th>{t("actionsRapide.createProduct.prix")}</th>
                      <th>{t("actionsRapide.createProduct.stock")}</th>
                      <th>{t("actionsRapide.createProduct.categorie")}</th>
                      <th>{t("actionsRapide.createProduct.fournisseur")}</th>
                      <th>{t("actionsRapide.createProduct.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr key={product.id}>
                        <td>{product.produit_id}</td>
                        <td>
                          <div className="product-info-cell">
                            {product.imageUrl && (
                              <img 
                                src={product.imageUrl} 
                                alt={product.nom} 
                                className="product-thumbnail"
                                onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Image+non+disponible'}
                              />
                            )}
                            <div>
                              <div className="product-name">{product.nom}</div>
                              <div className="product-description">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td>€{product.prix?.toFixed(2)}</td>
                        <td>{product.stock}</td>
                        <td>
                          {categories.find(c => c.categorie_id === product.categorie_id)?.nom || product.categorie_id}
                        </td>
                        <td>
                          {fournisseurs.find(s => s.fournisseur_id == product.fournisseur_id)?.nom || product.fournisseur_id}
                        </td>
                        <td>
                          <div className="actions">
                            <button 
                              className="icon-button details"
                              onClick={() => showProductDetails(product)}
                              disabled={isLoading}
                              title="Voir les détails"
                            >
                              <Info size={16} />
                            </button>
                            <button 
                              className="icon-button edit"
                              onClick={() => {
                                setCurrentProduct(product); // Sauvegarder le produit courant
                                setFormData({
                                  produit_id: product.produit_id || '',
                                  nom: product.nom || '',
                                  description: product.description || '',
                                  prix: product.prix || 0,
                                  stock: product.stock || 0,
                                  categorie_id: product.categorie_id || '',
                                  magasin_id: product.magasin_id || selectedMagasin || '',
                                  longeur: product.longeur || 0,
                                  largeur: product.largeur || 0,
                                  hauteur: product.hauteur || 0,
                                  poids: product.poids || 0,
                                  saisonnalite: product.saisonnalite || '',
                                  priorite_merchandising: product.priorite_merchandising || 'medium',
                                  contrainte_temperature: product.contrainte_temperature || '',
                                  contrainte_conditionnement: product.contrainte_conditionnement || '',
                                  conditionnement: product.conditionnement || '',
                                  imageUrl: product.imageUrl || '',
                                  fournisseur_id: product.fournisseur_id || ''
                                });
                                setIsCreating(true);
                              }}
                              disabled={isLoading}
                              title="Modifier"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="icon-button delete"
                              onClick={() => deleteProduct(product.id)}
                              disabled={isLoading}
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal des détails du produit */}
      {showDetailsModal && (
        <ProductDetailsModal 
          product={selectedProductDetails}
          onClose={() => setShowDetailsModal(false)}
          categories={categories}
          fournisseurs={fournisseurs}
        />
      )}
    </div>
  );
};

export default CreateProduct;