import React, { useState, useEffect } from 'react';
import { MagasinImport } from './MagasinImport';
import { CategoryImport } from './CategoryImport';
import { ZonesImport } from './ZonesImport';
import './CombinedPage.css';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Zap } from 'lucide-react';

const CombinedPage = () => {
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
      title: "Bienvenue dans l'outil d'import",
      content: "Commencez par importer vos magasins, puis les catégories et enfin les zones."
    },
    {
      title: "Import des magasins",
      content: "Importez votre fichier CSV/Excel de magasins ou ajoutez-les manuellement."
    },
    {
      title: "Import des catégories",
      content: "Une fois les magasins importés, passez aux catégories."
    },
    {
      title: "Import des zones",
      content: "Enfin, importez les zones en les associant aux magasins existants."
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
          <h3>Félicitations !</h3>
          <p>Vous avez complété toutes les étapes d'import avec succès.</p>
          
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{importedMagasins.length}</span>
              <span className="stat-label">Magasins</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{importedCategories.length}</span>
              <span className="stat-label">Catégories</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{importedZones.length}</span>
              <span className="stat-label">Zones</span>
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
            Voir le tableau de bord
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
  return (
    <div className="mt-12 combined-page">
      {showTour && (
        <div className="tour-overlay">
          <div className="tour-card">
            <h3>{tourSteps[currentStep].title}</h3>
            <p>{tourSteps[currentStep].content}</p>
            <div className="tour-actions">
              {currentStep < tourSteps.length - 1 ? (
                <>
                  <button onClick={handleSkipTour} className="secondary-button">
                    Passer
                  </button>
                  <button onClick={handleNextStep} className="primary-button">
                    Suivant
                  </button>
                </>
              ) : (
                <button onClick={handleSkipTour} className="primary-button">
                  Commencer
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
          Gestion des Données
          <div className="subtitle">Importez et gérez vos données commerciales</div>
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
          Magasins
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
          Catégories
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
  Zones
  {importedZones.length > 0 && (
    <span className="badge">{importedZones.length}</span>
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
          <p>Vous avez importé {importedMagasins.length} magasin(s). Passez maintenant aux catégories !</p>
          <button onClick={() => setActiveTab('categorie')} className="suggestion-button">
            Aller aux catégories <i className="icon-arrow-right"></i>
          </button>
        </motion.div>
      )}

      {importedCategories.length > 0 && activeTab === 'categorie' && (
        <motion.div className="suggestion-banner">
          <p>Vous avez importé {importedCategories.length} catégorie(s). Passez maintenant aux zones !</p>
          <button onClick={() => setActiveTab('zone')} className="suggestion-button">
            Aller aux zones <i className="icon-arrow-right"></i>
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