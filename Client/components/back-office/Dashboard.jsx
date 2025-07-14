import React, { useContext, useState, useEffect } from 'react';
import { Search, Flag, FilePlus, PackagePlus, UserPlus, Download } from 'lucide-react';
import './Dashboard.css';
import RightSidebarDashboard from './rightSidebarDashboard';
import TopBanner from './TopBanner';
import { AuthContext } from "../../src/context/AuthContext";
import { usePathname, useRouter } from 'next/navigation';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import '../multilingue/i18n.js';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t, i18n } = useTranslation(); 
  const isRTL = i18n.language === 'ar'; // RTL pour l'arabe, sinon LTR
  const textDirection = isRTL ? 'rtl' : 'ltr';


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
      let url = `${API_BASE_URL}/vente/fetchStat/${user.entreprises_id}`;
      if (selectedStore) {
        url += `?magasinId=${selectedStore}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      const data = await response.json();
      setDashboardData(data);
      setLoadingData(false);
    } catch (err) {
      setError(err.message);
      setLoadingData(false);
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
    <div className="dashboard-container" >
      <RightSidebarDashboard />
      <main className="main-content">
        <TopBanner />
        
        {/* Sélecteur de magasin */}
        <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="store-select-label">Magasin</InputLabel>
            <Select
              labelId="store-select-label"
              value={selectedStore || ''}
              onChange={(e) => setSelectedStore(e.target.value)}
              label="Magasin"
            >
              <MenuItem value="">Tous les magasins</MenuItem>
              {dashboardData.magasinsDisponibles?.map(store => (
                <MenuItem key={store.id} value={store.id}>
                  Magasin #{store.magasin_id} {store.nom && `- ${store.nom}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <section className="sales-summary" style={{ marginTop: '2rem' }}>
            <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
            <h2 >{t("salesSummary")}</h2>
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
                <h3>{dashboardData.todaySales.toFixed(1)}k</h3>
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
                <h3>$ {dashboardData.yearlySales.toFixed(1)}k</h3>
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
                <h3>${dashboardData.netIncome.toFixed(1)}k</h3>
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
                  <td>{channel.replace(/_/g, ' ')}</td>
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
      </main>
      
      <aside className="right-sidebar">
        <div className="profile">
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces" alt="Profile" />
          <div>
            <p className="profile-name">{user.name}</p>
            <p className="profile-role">{user.role}</p>
          </div>
        </div>
        <section className="quick-actions" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
          <h2>{t("quickActions")}</h2>
          <div className="action-list">
            <button 
              className="action-item"
              onClick={() => router.push('/orders')}
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

        <section className="fast-moving" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
          <h2 >{t("fastMoving")}</h2>
          <div className="items-list">
            <div className="item">
              <span>Macbook Pro</span>
              <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop" alt="Macbook Pro" />
            </div>
            <div className="item">
              <span>iPhone 14 pro</span>
              <img src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&h=500&fit=crop" alt="iPhone 14 pro" />
            </div>
            <div className="item">
              <span>Zoom75</span>
              <img src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop" alt="Zoom75" />
            </div>
            <div className="item">
              <span>Airpods Pro</span>
              <img src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=500&fit=crop" alt="Airpods Pro" />
            </div>
            <div className="item">
              <span>Samsung Galaxy Fold</span>
              <img src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=500&fit=crop" alt="Samsung Galaxy Fold" />
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
};

export default Dashboard;