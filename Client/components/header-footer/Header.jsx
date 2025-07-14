"use client"
import { useState, useEffect, useCallback } from "react"
import "./Header.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import i18n from "../multilingue/i18n"
import { FaGlobe } from "react-icons/fa"

const Header = () => {
  const { t } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()
  const [currentLanguageIndex, setCurrentLanguageIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)

  const languages = [
    { code: "ar", flag: "🇸🇦" },
    { code: "fr", flag: "🇫🇷" },
    { code: "en", flag: "🇬🇧" },
  ]

  useEffect(() => {
    setIsClient(true)
    const currentLang = i18n.language || "fr"
    const langIndex = languages.findIndex((lang) => lang.code === currentLang)
    if (langIndex !== -1) {
      setCurrentLanguageIndex(langIndex)
    }
  }, [])

  const handleLanguageChange = useCallback(() => {
    const nextLanguageIndex = (currentLanguageIndex + 1) % languages.length
    const nextLanguage = languages[nextLanguageIndex]
    i18n.changeLanguage(nextLanguage.code)
    setCurrentLanguageIndex(nextLanguageIndex)
  }, [currentLanguageIndex, languages])

  if (!isClient) {
    return null
  }

  return (
    <div className="heroo">
      <nav className="navbar">
        <div className="navbar-content">
          {/* Bouton Contact à gauche */}
          <div className="left-section">
            <Link href="/Contact">
              <div className="contact-us">{t("contact")}</div>
            </Link>
          </div>

          {/* Navigation au centre */}
          <div className="center-section">
            <div className="nav-links">
              <Link href="/" className={pathname === "/" ? "active" : ""}>
                <span className="nav-link-text">{t("home")}</span>
              </Link>
              <span className="separator">|</span>
              <Link href="/about" className={pathname === "/about" ? "active" : ""}>
                <span className="nav-link-text">{t("about")}</span>
              </Link>
              <span className="separator">|</span>
              <Link href="/services" className={pathname === "/services" ? "active" : ""}>
                <span className="nav-link-text">{t("services")}</span>
              </Link>
              <span className="separator">|</span>
              <Link href="/Forfaits" className={pathname === "/Forfaits" ? "active" : ""}>
                <span className="nav-link-text">{t("plans")}</span>
              </Link>
              <span className="separator">|</span>
              <Link href="/blog" className={pathname === "/blog" ? "active" : ""}>
                <span className="nav-link-text">{t("blog")}</span>
              </Link>
            </div>
          </div>

          {/* Login et sélecteur de langue à droite */}
          <div className="right-section">
            <div className="login" onClick={() => router.push("/LoginSignup")}>
              {t("login")}
            </div>
            <div className="language-selector-container" onClick={handleLanguageChange}>
              <FaGlobe className="language-icon" />
              <span className="language-flag">{languages[currentLanguageIndex]?.flag || "🇫🇷"}</span>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Header
