import React, { useState, useEffect } from 'react';
import { MagasinImport } from './MagasinImport';
import { CategoryImport } from './CategoryImport';
import { ZonesImport } from './ZonesImport';
import './CombinedPage.css';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Zap, Save, Database, Trash2 } from 'lucide-react';
import '@/components/multilingue/i18n.js';
import { useTranslation } from 'react-i18next';


const CombinedPage = () => {
    
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const textDirection = isRTL ? 'rtl' : 'ltr';


  const [activeTab, setActiveTab] = useState<'magasin' | 'categorie' | 'zone'>('magasin');
  const [importedMagasins, setImportedMagasins] = useState<any[]>([]);
  const [showTour, setShowTour] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [importedCategories, setImportedCategories] = useState<any[]>([]);
  const [importedZones, setImportedZones] = useState<any[]>([]);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);

  const [hasImportedMagasins, setHasImportedMagasins] = useState(false);
  const [hasImportedCategories, setHasImportedCategories] = useState(false);
  const [hasImportedZones, setHasImportedZones] = useState(false);
 
  // États pour suivre la complétion de chaque étape
  const [isMagasinComplete, setIsMagasinComplete] = useState(false);
  const [isCategorieComplete, setIsCategorieComplete] = useState(false);
  const [isZoneComplete, setIsZoneComplete] = useState(false);

  // nouvel état pour la section de sauvegarde
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');

  // fonction pour sauvegarder les données via l'API
 // fonction pour sauvegarder les données via l'API
const handleSaveData = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setSaveError('');
  
    try {
      // Sauvegarde des catégories
      const categoriesResponse = await fetch('http://localhost:8081/api/categories/createCategorieList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(importedCategories)
      });
  
      if (!categoriesResponse.ok) {
        throw new Error('Échec de la sauvegarde des catégories');
      }
  
      // Sauvegarde des magasins
      const magasinsResponse = await fetch('http://localhost:8081/api/magasins/createMagasinsList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(importedMagasins)
      });
  
      if (!magasinsResponse.ok) {
        throw new Error('Échec de la sauvegarde des magasins');
      }
  
      // Sauvegarde des zones
      const zonesResponse = await fetch('http://localhost:8081/api/zones/createZonesList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(importedZones)
      });
  
      if (!zonesResponse.ok) {
        throw new Error('Échec de la sauvegarde des zones');
      }
  
      setSaveStatus('success');
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveStatus('error');
      setSaveError(error.message || 'Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

// Composant pour afficher les détails des données
const DataSummary = () => {
    // Fonction pour trouver le nom d'un magasin par son ID
    const getMagasinName = (magasinId: number) => {
        const magasin = importedMagasins.find(m => m.id === magasinId);
        return magasin?.name || magasin?.nom_magasin || magasin?.libelle || magasin?.magasinName || magasin?.magasinNom || `Magasin ${magasinId}`;
      };
  
    return (
      <div className="data-summary" style={{ textAlign: isRTL ? 'right' : 'left' }}>
        <h3 className="summary-title">
          <Database size={20} className="mr-2" />
          {t("combinedManagement.reacapitulatifDescription")}
        </h3>
        
        <div className="summary-grid">
          {/* Section Magasins */}
          <div className="summary-card">
            <h4>{t("combinedManagement.magasins")}</h4>
            <ul>
            {importedMagasins.slice(0, 3).map((magasin, index) => (
            <li key={index}>
                <strong>{magasin.name || magasin.nom_magasin || magasin.libelle || magasin.magasinName || `Magasin ${index + 1}`}</strong>
                <div className="detail-item">ID: {magasin.magasin_id}</div>
            </li>
            ))}
              {importedMagasins.length > 3 && (
                <li className="more-items">+ {importedMagasins.length - 3} {t("combinedManagement.others")}</li>
              )}
            </ul>
            <div className="total-count">{importedMagasins.length} {t("combinedManagement.plusMagasins")}</div>
          </div>
  
          {/* Section Catégories */}
          <div className="summary-card">
            <h4>{t("combinedManagement.categories")}</h4>
            <ul>
            {importedCategories.slice(0, 3).map((categorie, index) => (
                <li key={index}>
                    <strong>{ categorie.nom || `Catégorie ${index + 1}`}</strong>
                    {categorie.magasin_id && (
                    <div className="detail-item">
                        {t("combinedManagement.seulMG")}: {getMagasinName(categorie.magasin_id)}
                    </div>
                    )}
                </li>
                ))}
              {importedCategories.length > 3 && (
                <li className="more-items">+ {importedCategories.length - 3} {t("combinedManagement.others")}</li>
              )}
            </ul>
            <div className="total-count">{importedCategories.length} {t("combinedManagement.plusCategories")}</div>
          </div>
  
          {/* Section Zones */}
          <div className="summary-card">
            <h4>{t("combinedManagement.zones")}</h4>
            <ul>
            {importedZones.slice(0, 3).map((zone, index) => (
  <li key={index}>
    <strong>{zone.nom_zone || `Zone ${index + 1}`}</strong>
    {zone.magasin_id && (
      <div className="detail-item">
        {t("combinedManagement.seulMG")}: {getMagasinName(zone.magasin_id)}
      </div>
    )}
  </li>
))}
              {importedZones.length > 3 && (
                <li className="more-items">+ {importedZones.length - 3} {t("combinedManagement.others")}</li>
              )}
            </ul>
            <div className="total-count">{importedZones.length} {t("combinedManagement.plusZones")}</div>
          </div>
        </div>
  
        {/* Section Sauvegarde */}
        
        <div className="save-section">
        <div className="flex items-center justify-center gap-4 fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-md z-10">
  <button 
    onClick={handleSaveData} 
    disabled={isSaving || !allStepsCompleted}
    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
      !allStepsCompleted ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 
      'bg-blue-600 text-white hover:bg-blue-700'
    }`}
  >
    <Save size={18} className="mr-2" />
    {isSaving ? t('combinedManagement.sauvegardEnCours') : t('combinedManagement.sauvegarderDansBD')}
  </button>

  <button 
    //onClick={handleClearDatabase} 
    disabled={isSaving}
    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
      isSaving ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 
      'bg-red-600 text-white hover:bg-red-700'
    }`}
  >
    <Trash2 size={18} className="mr-2" />
    {t('combinedManagement.sauvegarderDansBD1')}
  </button>
</div>
          {saveStatus === t('combinedManagement.success') && (
  <div className="save-status success">
    <CheckCircle size={16} className="mr-2" />
    {t("combinedManagement.successSave")}
    <div className="save-details">
      <span>{importedMagasins.length} {t("combinedManagement.plusMagasins")}</span>
      <span>{importedCategories.length} {t("combinedManagement.plusCategories")}</span>
      <span>{importedZones.length} {t("combinedManagement.plusZones")}</span>
    </div>
  </div>
)}
  
          {saveStatus === 'error' && (
            <div className="save-status error">
              <X size={16} className="mr-2" />
              {saveError || 'Erreur lors de la sauvegarde'}
            </div>
          )}
        </div>
      </div>
    );
  };




  const handleMagasinsImported = (data: any[]) => {
    setImportedMagasins(data);
    setIsMagasinComplete(true);
  };

  const handleCategoriesImported = (data: any[]) => {
    setImportedCategories(data);
    setIsCategorieComplete(true);
  };

  const handleZonesImported = (data: any[]) => {
    setImportedZones(data);
    setIsZoneComplete(true);
  };
  

// Vérifie si toutes les étapes sont complétées
const allStepsCompleted = importedMagasins.length > 0 && 
                            importedCategories.length > 0 && 
                            importedZones.length > 0;
  const tourSteps = [
    {
      title: t("combinedManagement.bienvenue"),
      content: t("combinedManagement.bienvenueDescription"),
    },
    {
      title: t("combinedManagement.magasinImport"),
      content:t("combinedManagement.magasinImportDesc"),
    },
    {
      title: t("combinedManagement.categorieImport"),
      content: t("combinedManagement.categorieImportDesc"),
    },
    {
      title: t("combinedManagement.zoneImport"),
      content: t("combinedManagement.zoneImportDesc"),
    }
  ];

  const handleNextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTour(false);
    }
  };

  const handleSkipTour = () => {
    setShowTour(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'magasin':
        return (
          <MagasinImport 
            onMagasinsImported={handleMagasinsImported}
            existingData={importedMagasins}
            isComplete={isMagasinComplete}
          />
        );
      case 'categorie':
        return (
          <CategoryImport 
            onCategoriesImported={handleCategoriesImported}
            existingData={importedCategories}
            isComplete={isCategorieComplete}
            importedMagasins={importedMagasins}
          />
        );
      case 'zone':
        return (
          <ZonesImport 
            onZonesImported={handleZonesImported}
            existingData={importedZones}
            isComplete={isZoneComplete}
            importedMagasins={importedMagasins}
            importedCategories={importedCategories}
          />
        );
        case 'summary':
        return <DataSummary />;
      default:
        return null;
    }
  };
  useEffect(() => {
    if (allStepsCompleted) {
      setShowCompletionPopup(true);
    }
  }, [importedZones]);
  useEffect(() => {
    // Si des magasins sont importés, suggérer de passer aux catégories
    if (importedMagasins.length > 0 && activeTab === 'magasin') {
      setTimeout(() => {
        setCurrentStep(2); // Passe à l'étape des catégories dans le guide
      }, 1500);
    }
    
    // Si des catégories sont importées, suggérer de passer aux zones
    if (importedCategories.length > 0 && activeTab === 'categorie') {
      setTimeout(() => {
        setCurrentStep(3); // Passe à l'étape des zones dans le guide
      }, 1500);
    }
  }, [importedMagasins, importedCategories, activeTab]);

  useEffect(() => {
    if (importedMagasins.length > 0) {
      console.log("Liste des magasins:", importedMagasins);
    }
  }, [importedMagasins]);

  useEffect(() => {
    if (importedCategories.length > 0) {
      console.log("Liste des catégories:", importedCategories);
    }
  }, [importedCategories]);

  useEffect(() => {
    if (importedZones.length > 0) {
      console.log("Liste des zones:", importedZones);
    }
  }, [importedZones]);
  
//  fonction pour le popup
const CompletionPopup = () => (
    <motion.div 
      className="completion-popup-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="completion-popup"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
      >
        <button 
          className="close-popup"
          onClick={() => setShowCompletionPopup(false)}
        >
          <X size={20} />
        </button>
        
        <div className="popup-content">
          <CheckCircle size={60} className="success-icon" />
          <h3>{t("combinedManagement.felicitation")}</h3>
          <p>{t("combinedManagement.felicitationDescription")}</p>
          
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{importedMagasins.length}</span>
              <span className="stat-label">{t("combinedManagement.magasins")}</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{importedCategories.length}</span>
              <span className="stat-label">{t("combinedManagement.categories")}</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{importedZones.length}</span>
              <span className="stat-label">{t("combinedManagement.zones")}</span>
            </div>
          </div>
          
          <button 
            className="cta-button"
            onClick={() => {
              setShowCompletionPopup(false);
              // Option: Rediriger vers un tableau de bord
            }}
          >
            <Zap size={18} className="mr-2" />
            {t("combinedManagement.viewDashboard")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
  return (
    <div className="mt-12 combined-page" dir={textDirection}>
      {showTour && (
        <div className="tour-overlay">
          <div className="tour-card">
            <h3>{tourSteps[currentStep].title}</h3>
            <p>{tourSteps[currentStep].content}</p>
            <div className="tour-actions">
            {currentStep < tourSteps.length - 1 ? (
  <>
    {isRTL ? (
      <>
        <button onClick={handleNextStep} className="primary-button">
          {t("combinedManagement.bienvenueSuivant")}
        </button>
        <button onClick={handleSkipTour} className="secondary-button">
          {t("combinedManagement.bienvenuePasser")}
        </button>
      </>
    ) : (
      <>
        <button onClick={handleSkipTour} className="secondary-button">
          {t("combinedManagement.bienvenuePasser")}
        </button>
        <button onClick={handleNextStep} className="primary-button">
          {t("combinedManagement.bienvenueSuivant")}
        </button>
      </>
    )}
  </>
) : (
  <button onClick={handleSkipTour} className="primary-button">
    {t("combinedManagement.commencer")}
  </button>
)}
            </div>
            <div className="tour-progress">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`dot ${index <= currentStep ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="combined-container">
        <motion.h1 
          className="page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t("combinedManagement.gestionDonnee")}
          <div className="subtitle">{t("combinedManagement.gestionDecription")}</div>
        </motion.h1>
        
        <motion.div 
          className="tabs-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
            <div className="tabs-container">
            <button
          onClick={() => setActiveTab('magasin')}
          className={`tab-button ${activeTab === 'magasin' ? 'active' : ''}`}
        >
          <i className="icon-store"></i>
          {t("combinedManagement.magasins")}
          {importedMagasins.length > 0 && (
            <span className="badge">{importedMagasins.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('categorie')}
          className={`tab-button ${activeTab === 'categorie' ? 'active' : ''} ${
            importedMagasins.length === 0 ? 'disabled' : ''
          }`}
          disabled={importedMagasins.length === 0}
        >
          <i className="icon-category"></i>
          {t("combinedManagement.categories")}
          {importedCategories.length > 0 && (
            <span className="badge">{importedCategories.length}</span>
          )}
        </button>
        <button
  onClick={() => setActiveTab('zone')}
  className={`tab-button ${activeTab === 'zone' ? 'active' : ''} ${
    importedCategories.length === 0 ? 'disabled' : ''
  }`}
  disabled={importedCategories.length === 0}
>
  <i className="icon-zone"></i>
  {t("combinedManagement.zones")}
  {importedZones.length > 0 && (
    <span className="badge">{importedZones.length}</span>
  )}
</button>
<button
            onClick={() => setActiveTab('summary')}
            className={`tab-button ${activeTab === 'summary' ? 'active' : ''} ${
              !allStepsCompleted ? 'disabled' : ''
            }`}
            disabled={!allStepsCompleted}
          >
            <i className="icon-database"></i>
            {t("combinedManagement.recapitulatif")}
            {allStepsCompleted && (
              <span className="badge success-badge">
                <CheckCircle size={14} />
              </span>
            )}
          </button>
        </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="tab-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {importedMagasins.length > 0 && activeTab === 'magasin' && (
        <motion.div className="suggestion-banner">
          <p>{t("combinedManagement.import")} {importedMagasins.length} {t("combinedManagement.importMgasin2")}</p>
          <button onClick={() => setActiveTab('categorie')} className="suggestion-button">
  {isRTL ? (
    <>
      <i className="icon-arrow-left"></i> {t("combinedManagement.versCategorie")}
    </>
  ) : (
    <>
      {t("combinedManagement.versCategorie")} <i className="icon-arrow-right"></i>
    </>
  )}
</button>
        </motion.div>
      )}

      {importedCategories.length > 0 && activeTab === 'categorie' && (
        <motion.div className="suggestion-banner">
          <p>{t("combinedManagement.import")} {importedCategories.length} {t("combinedManagement.importCategorie2")}</p>
          <button onClick={() => setActiveTab('zone')} className="suggestion-button">
          {t("combinedManagement.versZone")} <i className={`icon-arrow-right ${isRTL ? 'flipped' : ''}`}></i>
          </button>
        </motion.div>
      )}
      </div>
      <AnimatePresence>
  {showCompletionPopup && <CompletionPopup />}
</AnimatePresence>
    </div>
  );
};

export default CombinedPage;