import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { Search } from 'lucide-react';
import { useTranslation } from "react-i18next";
import i18n from "../multilingue/i18n";

const TopBanner = () => {
  const { t } = useTranslation();
  
  const languages = [
    { code: 'sa', flag: '/sa.png', alt: 'Saudi Arabia Flag', i18nCode: 'ar' },
    { code: 'us', flag: '/us.png', alt: 'United States Flag', i18nCode: 'en' },
    { code: 'fr', flag: '/fr.png', alt: 'France Flag', i18nCode: 'fr' }
  ];

  // Trouver l'index de la langue anglaise ('en') par défaut
  const defaultLanguageIndex = languages.findIndex(lang => lang.i18nCode === 'en');
  
  const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(defaultLanguageIndex);

  // Synchroniser avec i18n au montage du composant
  useEffect(() => {
    i18n.changeLanguage(languages[selectedLanguageIndex].i18nCode);
  }, []);

  const handleLanguageClick = (index) => {
    const selectedLanguage = languages[index];
    i18n.changeLanguage(selectedLanguage.i18nCode);
    setSelectedLanguageIndex(index);
    console.log("Selected language:", selectedLanguage.i18nCode);
  };

  return (
    <section className="top-banner">
      <div className="banner-left">
        <h1>
          <span>Smart</span> <span>Store</span>
        </h1>
        <div className="lang_toggle">
          {languages.map((lang, index) => (
            <img
              key={lang.code}
              src={lang.flag}
              alt={lang.alt}
              className={selectedLanguageIndex === index ? 'selected' : ''}
              onClick={() => handleLanguageClick(index)}
              style={{
                width: '28px',
                height: '18px',
                objectFit: 'cover',
                borderRadius: '3px',
                display: 'block',
                cursor: 'pointer',
                margin: '5px',
                border: selectedLanguageIndex === index ? '2px solid blue' : 'none',
                opacity: selectedLanguageIndex === index ? 1 : 0.7,
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>
      <div className="search-box">
        <Search className="search-icon" />
        <input type="text" placeholder={t("search")} />
      </div>
    </section>
  );
};

export default TopBanner;