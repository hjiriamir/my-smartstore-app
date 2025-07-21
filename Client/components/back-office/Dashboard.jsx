import React, { useContext, useState, useEffect } from 'react';
import { Search, Flag, FilePlus, PackagePlus, UserPlus, Download } from 'lucide-react';
import './Dashboard.css';
import RightSidebarDashboard from './rightSidebarDashboard';
import TopBanner from './TopBanner';
import { AuthContext } from "../../src/context/AuthContext";
import { usePathname, useRouter } from 'next/navigation';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Alert } from "@/components/ui/alert";
import AlertTitle from '@mui/material/AlertTitle';
import { Button } from "@/components/ui/button";
import '../multilingue/i18n.js';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t, i18n } = useTranslation(); 
  const isRTL = i18n.language === 'ar'; // RTL pour l'arabe, sinon LTR
  const textDirection = isRTL ? 'rtl' : 'ltr';
  const [hasStores, setHasStores] = useState(true);

  const { user, loading } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, selectedStore]);

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + N - Créer une commande
      if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        router.push('/orders');
      }
      // Ctrl + P - Ajouter un produit
      else if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        router.push('/products');
      }
      // Ctrl + K - Ajouter un fournisseur
      else if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        router.push('/suppliers');
      }
      
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);
      setError(null); // Réinitialiser les erreurs précédentes
      
      // Vérifier que l'utilisateur est bien chargé
      if (!user || !user.entreprises_id) {
        throw new Error('Informations utilisateur manquantes');
      }
  
      let url = `${API_BASE_URL}/vente/fetchStat/${user.entreprises_id}`;
      if (selectedStore) {
        url += `?magasinId=${selectedStore}`;
      }
      
      const response = await fetch(url);
      
      // Gérer les réponses non-OK
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          `Erreur ${response.status} lors de la récupération des données`
        );
      }
  
      const data = await response.json();
      
      // Vérifier si des magasins sont disponibles
      const hasStores = data.magasinsDisponibles?.length > 0;
      
      // Si un magasin est sélectionné mais n'existe pas dans les données
      if (selectedStore && hasStores) {
        const storeExists = data.magasinsDisponibles.some(store => store.id === parseInt(selectedStore));
        if (!storeExists) {
          setSelectedStore(null); // Réinitialiser la sélection
        }
      }
      
      // Formater les données pour s'assurer que tous les champs nécessaires existent
      const formattedData = {
        todaySales: data.todaySales || 0,
        yearlySales: data.yearlySales || 0,
        netIncome: data.netIncome || 0,
        produitsEnStock: data.produitsEnStock || 0,
        mouvementsStock: data.mouvementsStock || Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          in: 0,
          out: 0
        })),
        commandesParStatut: data.commandesParStatut || {},
        commandesParCanal: data.commandesParCanal || {},
        commandes: data.commandes || [],
        magasinsDisponibles: data.magasinsDisponibles || [],
        topProducts: data.topProducts || []
      };
      
      setDashboardData(formattedData);
      setHasStores(hasStores);
      setLoadingData(false);
      
    } catch (err) {
      console.error('Erreur dans fetchDashboardData:', err);
      setError(err.message);
      
      // Fournir des données par défaut en cas d'erreur
      setDashboardData({
        todaySales: 0,
        yearlySales: 0,
        netIncome: 0,
        produitsEnStock: 0,
        mouvementsStock: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          in: 0,
          out: 0
        })),
        commandesParStatut: {},
        commandesParCanal: {},
        commandes: [],
        magasinsDisponibles: []
      });
      
      setLoadingData(false);
      setHasStores(false);
    }
  };



  // Fonction pour calculer les hauteurs des barres du graphique
  const calculateBarHeights = (value, maxValue) => {
    const maxHeight = 100; // hauteur maximale en pourcentage
    return (value / maxValue) * maxHeight;
  };

  // Trouver la valeur maximale pour l'échelle du graphique
  const maxStockValue = Math.max(
    ...dashboardData?.mouvementsStock?.map(m => Math.max(m.in, m.out)) || [0]
  );

  if (!user) return <p>Chargement...</p>;
  if (loadingData) return <p>Chargement des données...</p>;
  if (error) return <p>Erreur: {error}</p>;
  if (!dashboardData) return <p>Aucune donnée disponible</p>;

  return (
    <div className="dashboard-container" dir={textDirection} >
      <RightSidebarDashboard />
      <main className="main-content">
        <TopBanner />
        
        {/* Sélecteur de magasin - Conditionnel si des magasins existent */}
        {dashboardData.magasinsDisponibles?.length > 0 ? (
          <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="store-select-label">{t("productImport.filterByStore")}</InputLabel>
            <Select
              labelId="store-select-label"
              value={selectedStore || ''}
              onChange={(e) => setSelectedStore(e.target.value)}
              label={t("productImport.filterByStore")}
            >
              <MenuItem value="">{t("productImport.allStores")}</MenuItem>
              {dashboardData.magasinsDisponibles.map(store => (
                <MenuItem key={store.id} value={store.id}>
                  {t("store")} #{store.magasin_id} {store.nom_magasin && `- ${store.nom_magasin}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <div className="no-stores-banner">
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>{t("noStoresTitle")}</AlertTitle>
              {t("noStoresMessage")}
              <Button 
                variant="contained" 
                sx={{ mt: 1 }}
                onClick={() => router.push('/display-data')}
              >
                {t("createFirstStore")}
              </Button>
            </Alert>
          </div>
        )}
  
        {/* Section des statistiques */}
        <section className="sales-summary" style={{ marginTop: '2rem' }} dir={textDirection} >
          <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
            <h2>{t("salesSummary")}</h2>
          </div>
        
          <div className="stats-container">
            <div className="stat-card">
              <div className="icon" style={{ backgroundColor: '#e8f3fe' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
              </div>
              <div className="stat-info">
                <h3>{(dashboardData.todaySales / 1000).toFixed(1)}k</h3>
                <p>{t("todaySales")}</p>
              </div>
            </div>
  
            <div className="stat-card">
              <div className="icon" style={{ backgroundColor: '#f0e8fe' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9c27b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
              <div className="stat-info">
                <h3>$ {(dashboardData.yearlySales / 1000).toFixed(1)}k</h3>
                <p>{t("yearlySales")}</p>
              </div>
            </div>
  
            <div className="stat-card">
              <div className="icon" style={{ backgroundColor: '#fff4e5' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className="stat-info">
                <h3>${(dashboardData.netIncome / 1000).toFixed(1)}k</h3>
                <p>{t("netIncome")}</p>
              </div>
            </div>
  
            <div className="stat-card">
              <div className="icon" style={{ backgroundColor: '#ffe8f0' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e91e63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <div className="stat-info">
                <h3>{dashboardData.produitsEnStock}</h3>
                <p>{t("products")}</p>
              </div>
            </div>
          </div>
        </section>
  
        {/* Section du rapport de stock - Conditionnelle */}
        {dashboardData.magasinsDisponibles?.length > 0 && (
          <section className="stock-report">
            <div className="chart-container">
              <div className="chart-header">
                <div className="legend">
                  <div className="legend-item">
                    <span className="legend-color stock-in"></span>
                    <span>{t("stockIn")}</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color stock-out"></span>
                    <span>{t("stockOut")}</span>
                  </div>
                </div>
                <h2>{t("stockReport")}</h2>
              </div>
  
              <div className="y-axis">
                <span>0</span>
                <span>{Math.round(maxStockValue * 0.2)}</span>
                <span>{Math.round(maxStockValue * 0.4)}</span>
                <span>{Math.round(maxStockValue * 0.6)}</span>
                <span>{Math.round(maxStockValue * 0.8)}</span>
                <span>{maxStockValue}</span>
              </div>
  
              <div className="chart">
                {dashboardData.mouvementsStock.map((movement, index) => {
                  const monthNames = [t("months.jan"), t("months.feb"), t("months.mar"), t("months.apr"), t("months.may"), t("months.jun"), t("months.jul"), t("months.aug"), t("months.sep"), t("months.oct"), t("months.nov"), t("months.dec")];
                  const monthName = monthNames[movement.month - 1];
                  
                  return (
                    <div className="bar-container" key={index}>
                      <div className="bar">
                        <div 
                          className="stock-in" 
                          style={{ height: `${calculateBarHeights(movement.in, maxStockValue)}%` }}
                        ></div>
                        <div 
                          className="stock-out" 
                          style={{ height: `${calculateBarHeights(movement.out, maxStockValue)}%` }}
                        ></div>
                      </div>
                      <span>{monthName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
  
        {/* Section des commandes fournisseurs - Conditionnelle */}
        {Object.keys(dashboardData.commandesParCanal).length > 0 && (
          <section className="sales-order">
            <div className="h2-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
              <h2 className="date-range">{t("supplierOrders")}</h2>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t("canal")}</th>
                    <th>{t("draft")}</th>
                    <th>{t("approved")}</th>
                    <th>{t("sent")}</th>
                    <th>{t("invoiced")}</th>
                    <th>{t("cancelled")}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(dashboardData.commandesParCanal).map(([channel, statusCounts]) => (
                    <tr key={channel}>
                      <td>{t(channel.toLowerCase())}</td>
                      <td>{statusCounts.draft || 0}</td>
                      <td>{statusCounts.approved || 0}</td>
                      <td>{statusCounts.sent || 0}</td>
                      <td>{statusCounts.invoiced || 0}</td>
                      <td>{statusCounts.cancelled || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
  
        {/* Message si aucune donnée */}
        {dashboardData.magasinsDisponibles?.length === 0 && (
          <div className="empty-state">
            <img src="/emptyStore.jpg" alt="Empty store" width="200" />
            <h3>{t("noDataTitle")}</h3>
            <p>{t("noDataMessage")}</p>
          </div>
        )}
      </main>
      
      <aside className="right-sidebar">
        <div className="profile">
          <img 
            src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces"} 
            alt={user.name} 
            onError={(e) => {
              e.target.src = "https://www.gravatar.com/avatar/default?s=32&d=mp";
            }}
          />
          <div>
            <p className="profile-name">{user.name}</p>
            <p className="profile-role">{t(user.role.toLowerCase())}</p>
          </div>
        </div>
        
        <section className="quick-actions" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
          <h2>{t("quickActions")}</h2>
          <div className="action-list">
            <button 
              className="action-item"
              onClick={() => router.push('/orders')}
              disabled={dashboardData.magasinsDisponibles?.length === 0}
            >
              <FilePlus className="action-icon" />
              <span>{t("createOrder")}</span>
              <span className="shortcut">ctrl + o</span>
            </button>
            <button 
              className="action-item"
              onClick={() => router.push('/products')}
            >
              <PackagePlus className="action-icon" />
              <span>{t("addProduct")}</span>
              <span className="shortcut">ctrl + p</span>
            </button>
            <button 
              className="action-item"
              onClick={() => router.push('/suppliers')}
            >
              <UserPlus className="action-icon" />
              <span>{t("addSupplier")}</span>
              <span className="shortcut">ctrl + k</span>
            </button>
          </div>
        </section>
  
        {/* Section des produits populaires - Conditionnelle */}
        {dashboardData.magasinsDisponibles?.length > 0 && (
          <section className="fast-moving" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
            <h2>{t("fastMoving")}</h2>
            <div className="items-list">
            {dashboardData.topProducts.length > 0 ? (
                  dashboardData.topProducts.map(product => (
                    <div className="item" key={product.id}>
                      <span>{product.name}</span>
                      <img 
                        src={product.image || '/images/product-placeholder.png'} 
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = '/images/product-placeholder.png';
                        }}
                      />
                    </div>
                  ))
                ) : (
                <div className="no-products">
                  <p>{t("noProductsData")}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </aside>
    </div>
  );
};

export default Dashboard;