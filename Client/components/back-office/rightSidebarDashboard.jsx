"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import "./Dashboard.css"
import { useRouter } from "next/navigation"
import "../multilingue/i18n.js"
import { useTranslation } from "react-i18next"
import { X } from "lucide-react"

const RightSidebarDashboard = ({ isOpen, onClose, isAnimating }) => {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const [auth, setAuth] = useState(false)
  const [message, setMessage] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const [activeItem, setActiveItem] = useState("dashboard")
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  // Ajouter les langues
  const languages = [
    { code: "sa", flag: "/sa.png", alt: "Saudi Arabia Flag", i18nCode: "ar", name: "العربية" },
    { code: "us", flag: "/us.png", alt: "United States Flag", i18nCode: "en", name: "English" },
    { code: "fr", flag: "/fr.png", alt: "France Flag", i18nCode: "fr", name: "Français" },
  ]

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode)
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActiveItem(localStorage.getItem("activeItem") || "dashboard")
    }
  }, [])

  const handleClick = (item) => {
    setActiveItem(item)
    if (typeof window !== "undefined") {
      localStorage.setItem("activeItem", item)
    }
    // Fermer la sidebar sur mobile après clic
    if (window.innerWidth <= 768) {
      onClose()
    }
  }

  const handleDelete = () => {
    axios
      .get(`${API_BASE_URL}/auth/logout`)
      .then((res) => {
        setAuth(false)
        setMessage("You are not authenticated")
        router.push("/")
      })
      .catch((err) => console.log(err))
  }

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""} ${isAnimating ? "animating" : ""}`}>
      {/* Bouton fermer pour mobile */}
      <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
        <X size={24} />
      </button>

      <div className="menu1">
        {/* Sélecteur de langue dans la sidebar (visible sur mobile) */}
        <div className="sidebar-language-selector">
          <p className="menu-label">{t("language") || "Language"}</p>
          <div className="sidebar-lang-options">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`sidebar-lang-item ${i18n.language === lang.i18nCode ? "active" : ""}`}
                onClick={() => handleLanguageChange(lang.i18nCode)}
              >
                <img src={lang.flag || "/placeholder.svg"} alt={lang.alt} />
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="menu-label">{t("general")}</p>
        <nav>
          {/* Menu items existants... */}
          <Link
            href="/Dashboard"
            className={`menu-item ${activeItem === "dashboard" ? "active" : ""}`}
            style={{ backgroundColor: activeItem === "dashboard" ? "#0f766e" : "" }}
            onClick={() => handleClick("dashboard")}
          >
            <img src="/category.png" className="menu-icon" alt="Category Icon" />
            <span style={{ color: activeItem === "dashboard" ? "white" : "" }}>{t("dashboard")}</span>
          </Link>

          <a
            href="/management-page"
            className={`menu-item ${activeItem === "category-management" ? "active" : ""}`}
            style={{ backgroundColor: activeItem === "category-management" ? "#0f766e" : "" }}
            onClick={() => handleClick("category-management")}
          >
            <img src="/dimensions.png" className="menu-icon" alt="Category Icon" />
            <span style={{ color: activeItem === "category-management" ? "white" : "" }}>
              {t("categoryManagement")}
            </span>
          </a>

          <Link
            href="/Editor"
            className={`menu-item ${activeItem === "Library-Furniture" ? "active" : ""}`}
            style={{ backgroundColor: activeItem === "Library-Furniture" ? "#0f766e" : "" }}
            onClick={() => handleClick("Library-Furniture")}
          >
            <img src="/building.png" className="menu-icon" alt="Category Icon" />
            <span style={{ color: activeItem === "Library-Furniture" ? "white" : "" }}>{t("Library_Furniture")}</span>
          </Link>

          <a
            href="/marketing"
            className={`menu-item ${activeItem === "marketing-strategy" ? "active" : ""}`}
            style={{ backgroundColor: activeItem === "marketing-strategy" ? "#0f766e" : "" }}
            onClick={() => handleClick("marketing-strategy")}
          >
            <img src="/cart.png" className="menu-icon" alt="Category Icon" />
            <span style={{ color: activeItem === "marketing-strategy" ? "white" : "" }}>{t("marketingStrategy")}</span>
          </a>

          <Link
            href="/user-management"
            className={`menu-item ${activeItem === "user-management" ? "active" : ""}`}
            style={{ backgroundColor: activeItem === "user-management" ? "#0f766e" : "" }}
            onClick={() => handleClick("user-management")}
          >
            <img src="/management.png" className="menu-icon" alt="Category Icon" />
            <span style={{ color: activeItem === "user-management" ? "white" : "" }}>{t("user_management")}</span>
          </Link>

          <Link
            href="/carte-magasin"
            className={`menu-item ${activeItem === "sales-strategy" ? "active" : ""}`}
            style={{ backgroundColor: activeItem === "sales-strategy" ? "#0f766e" : "" }}
            onClick={() => handleClick("sales-strategy")}
          >
            <img src="/target.png" className="menu-icon" alt="Category Icon" />
            <span style={{ color: activeItem === "sales-strategy" ? "white" : "" }}>{t("push_sales")}</span>
          </Link>

          <p className="menu-label support-label">{t("support")}</p>
          <div className="support">
            <a
              href="#"
              className={`menu-item ${activeItem === "help" ? "active" : ""}`}
              onClick={() => handleClick("help")}
            >
              <img src="/i.png" className="menu-icon" alt="User Icon" />
              <span>{t("help")}</span>
            </a>
            <a
              href="#"
              className={`menu-item ${activeItem === "settings" ? "active" : ""}`}
              onClick={() => handleClick("settings")}
            >
              <img src="/settings.png" className="menu-icon" alt="Category Icon" />
              <span>{t("settings")}</span>
            </a>
            <a href="#" className={`menu-item ${activeItem === "logout" ? "active" : ""}`}>
              <img src="/logout.png" className="menu-icon" alt="Category Icon" />
              <span onClick={handleDelete}>{t("log_out")}</span>
            </a>
          </div>
        </nav>
      </div>
    </aside>
  )
}

export default RightSidebarDashboard
