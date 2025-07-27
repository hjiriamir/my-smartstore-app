"use client"

import { useState, useEffect } from "react"
import "./Dashboard.css"
import { Search, Menu } from "lucide-react"
import { useTranslation } from "react-i18next"
import i18n from "../multilingue/i18n"

const TopBanner = ({ onMenuClick, onRightMenuClick }) => {
  const { t } = useTranslation()

  const languages = [
    { code: "sa", flag: "/sa.png", alt: "Saudi Arabia Flag", i18nCode: "ar" },
    { code: "us", flag: "/us.png", alt: "United States Flag", i18nCode: "en" },
    { code: "fr", flag: "/fr.png", alt: "France Flag", i18nCode: "fr" },
  ]

  const defaultLanguageIndex = languages.findIndex((lang) => lang.i18nCode === "en")
  const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(defaultLanguageIndex)

  useEffect(() => {
    i18n.changeLanguage(languages[selectedLanguageIndex].i18nCode)
  }, [])

  const handleLanguageClick = (index) => {
    const selectedLanguage = languages[index]
    i18n.changeLanguage(selectedLanguage.i18nCode)
    setSelectedLanguageIndex(index)
    console.log("Selected language:", selectedLanguage.i18nCode)
  }

  return (
    <section className="top-banner">
      {/* Bouton menu mobile gauche */}
      <button
        className={`mobile-menu-button ${onMenuClick ? "active" : ""}`}
        onClick={onMenuClick}
        aria-label="Toggle left menu"
      >
        <Menu size={24} />
      </button>

      <div className="banner-left">
        <h1 className="logo-title">
          <span>Smart</span> <span>Store</span>
        </h1>

        {/* Sélecteur de langue - maintenant visible sur tous les écrans */}
        <div className="lang_toggle" title={t("selectLanguage") || "Select Language"}>
          {languages.map((lang, index) => (
            <img
              key={lang.code}
              src={lang.flag || "/placeholder.svg"}
              alt={lang.alt}
              className={selectedLanguageIndex === index ? "selected" : ""}
              onClick={() => handleLanguageClick(index)}
              style={{
                width: "28px",
                height: "18px",
                objectFit: "cover",
                borderRadius: "3px",
                display: "block",
                cursor: "pointer",
                margin: "5px",
                border: selectedLanguageIndex === index ? "2px solid blue" : "1px solid transparent",
                opacity: selectedLanguageIndex === index ? 1 : 0.7,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="search-box">
        <Search className="search-icon" />
        <input type="text" placeholder={t("search")} />
      </div>

      {/* Bouton menu mobile droite */}
      <button
        className={`mobile-right-menu-button ${onRightMenuClick ? "active" : ""}`}
        onClick={onRightMenuClick}
        aria-label="Toggle right menu"
      >
        <Menu size={24} />
      </button>
    </section>
  )
}

export default TopBanner
