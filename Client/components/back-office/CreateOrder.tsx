import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Plus, Minus, ShoppingCart, User, ChevronDown } from 'lucide-react';
import './CreateOrder.css';
import { toast } from 'react-hot-toast';
import '../multilingue/i18n.js';
import { useTranslation } from 'react-i18next';

const CreateOrder = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [selectedMagasin, setSelectedMagasin] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [fournisseurs, setFournisseurs] = useState([]);
  const [magasins, setMagasins] = useState([]);
  const [currentEntrepriseID, setcurrentEntrepriseID] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { t, i18n } = useTranslation(); 
  const isRTL = i18n.language === 'ar'; // RTL pour l'arabe, sinon LTR
  const textDirection = isRTL ? 'rtl' : 'ltr';

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

  // Récupérer les fournisseurs de l'entreprise
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

  // Récupérer les magasins de l'entreprise
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

  

  // Récupérer les produits lorsqu'un magasin est sélectionné
  useEffect(() => {
    if (selectedMagasin) {
      const fetchProducts = async () => {
        try {
          setIsLoading(true);
          // Utilisation directe de selectedMagasin dans l'URL
          const response = await fetch(
            `http://localhost:8081/api/produits/getProductsByMagasin/${selectedMagasin}`
          );
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          const data = await response.json();
          setProducts(data);
        } catch (error) {
          console.error("Erreur lors de la récupération des produits:", error);
          toast.error("Impossible de charger les produits");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [selectedMagasin]);

  const filteredProducts = products.filter(product =>
    product.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.product_id?.includes(searchQuery)
  );

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { 
          ...product, 
          quantity: 1,
          prix_unitaire: product.prix_vente // Utilisez le prix approprié selon votre logique
        }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    const quantity = typeof newQuantity === 'string' 
      ? parseInt(newQuantity) || 1 
      : newQuantity;
    const validatedQuantity = Math.max(1, quantity);
  
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: validatedQuantity } : item
      )
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.prix * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const generateReference = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CMD-${year}${month}${day}-${random}`;
  };

  const handleCheckout = async () => {
    if (!selectedFournisseur || !selectedMagasin || cart.length === 0) {
      toast.error("Veuillez sélectionner un fournisseur, un magasin et ajouter des produits");
      return;
    }
  
    try {
      setIsLoading(true);
      
      // Trouver le magasin complet pour obtenir son ID numérique
      const magasinSelectionne = magasins.find(m => m.magasin_id === selectedMagasin);
      
      if (!magasinSelectionne) {
        throw new Error("Magasin sélectionné introuvable");
      }
  
      const commandeData = {
        reference: generateReference(),
        id_fournisseur: Number(selectedFournisseur),
        id_entreprise: Number(currentEntrepriseID),
        id_magasin: Number(magasinSelectionne.id), // Utilisation de l'ID numérique ici
        date_commande: new Date().toISOString().split('T')[0],
        statut: "en_attente",
        date_livraison_prevue: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        commentaire: "Commande créée via l'interface",
        lignes: cart.map(item => ({
          id_produit: Number(item.id),
          quantite: Number(item.quantity),
          prix_unitaire: Number(item.prix)
        }))
      };
  
      console.log("Données de la commande:", commandeData); // Pour le débogage
  
      const response = await fetch('http://localhost:8081/api/commande-achat/createCommandeAchat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commandeData),
        credentials: 'include'
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }
  
      const result = await response.json();
      toast.success("Commande créée avec succès!");
      //router.push('/Dashboard');
    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      toast.error(error.message || "Échec de la création de la commande");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    console.log('Selected magasin:', selectedMagasin);
    console.log('Liste des magasins:', magasins);
  }, [selectedMagasin, magasins]);
  

  return (
    <div className="dashboard-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <main className="main-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header className="page-header">
          <h1>{t("actionsRapide.createOrder.creerCommande")}</h1>
          <button 
            className="button secondary"
            onClick={() => router.push('/Dashboard')}
            disabled={isLoading}
          >
            <X size={18} /> {t("actionsRapide.createOrder.abbuler")}
          </button>
        </header>

        <div className="order-creation-grid">
          {/* Section Produits */}
          <section className="product-search-section">
            <div className="search-bar">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder={t("actionsRapide.createOrder.rechreche")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!selectedMagasin || isLoading}
              />
            </div>

            <div className="product-grid">
              {isLoading ? (
                <p>{t("actionsRapide.createOrder.chargement")}</p>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      <img 
                        src={`${product.imageUrl}`}
                        alt={product.nom}
                      />
                    </div>
                    <div className="product-info">
                      <h3>{product.nom}</h3>
                      <p>${product.prix?.toFixed(2)}</p>
                      <p>{t("actionsRapide.createOrder.stock")}: {product.stock}</p>
                      <button 
                        className="button primary"
                        onClick={() => addToCart(product)}
                        disabled={isLoading}
                      >
                        <Plus size={16} /> {t("actionsRapide.createOrder.ajouter")}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>
                {selectedMagasin
                  ? t("actionsRapide.createOrder.aucunProduit")
                  : t("actionsRapide.createOrder.selectionnerMagasin")}
              </p>

              )}
            </div>
          </section>

          {/* Section Panier */}
          <section className="order-summary-section">
            <div className="customer-section">
              <h2>
                <User size={20} /> {t("actionsRapide.createOrder.fournisseur")}
              </h2>
              <select 
                className="customer-select"
                value={selectedFournisseur || ''}
                onChange={(e) => setSelectedFournisseur(Number(e.target.value))}
                disabled={isLoading || fournisseurs.length === 0}
              >
                <option value="">{t("actionsRapide.createOrder.selectFournisseur")}</option>
                {fournisseurs.map(fournisseur => (
                  <option key={fournisseur.fournisseur_id} value={fournisseur.fournisseur_id}>
                    {fournisseur.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="customer-section">
              <h2>
                <ShoppingCart size={20} /> {t("actionsRapide.createOrder.magasin")}
              </h2>
              <select 
              className="customer-select"
              value={selectedMagasin || ''}
              onChange={(e) => setSelectedMagasin(e.target.value)} // Pas besoin de Number() si magasin_id est une string
              disabled={isLoading || magasins.length === 0}
            >
              <option value="">{t("actionsRapide.createOrder.selectMagasin")}</option>
              {magasins.map(magasin => (
                <option key={magasin.magasin_id} value={magasin.magasin_id}>
                  {magasin.nom_magasin}
                </option>
              ))}
            </select>
            </div>

            <div className="cart-items">
              <h2>
                <ShoppingCart size={20} /> {t("actionsRapide.createOrder.panier")} ({cart.length})
              </h2>
              {cart.length === 0 ? (
                <p className="empty-cart">{t("actionsRapide.createOrder.aucunArticle")}</p>
              ) : (
                <ul>
                  {cart.map(item => (
                    <li key={item.id} className="cart-item">
                      <div className="item-info">
                        <span className="item-name">{item.nom}</span>
                        <span className="item-price">${item.prix?.toFixed(2)}</span>
                      </div>
                      <div className="item-actions">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isLoading}
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="quantity-input"
                          disabled={isLoading}
                        />
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isLoading}
                        >
                          <Plus size={14} />
                        </button>
                        <button 
                          className="remove-btn"
                          onClick={() => removeFromCart(item.id)}
                          disabled={isLoading}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="item-subtotal">
                        ${(item.prix * item.quantity).toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>{t("actionsRapide.createOrder.sousTotal")}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>{t("actionsRapide.createOrder.taxes")} (10%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>{t("actionsRapide.createOrder.total")}</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="payment-section">
              <h2>{t("actionsRapide.createOrder.paiment")}</h2>
              

              <button
                className="checkout-button"
                disabled={cart.length === 0 || !selectedFournisseur || !selectedMagasin || isLoading}
                onClick={handleCheckout}
              >
                {isLoading
                  ? t("actionsRapide.createOrder.traitement")
                  : t("actionsRapide.createOrder.finaliserCommande")
                  }

              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CreateOrder;