"use client"
import { useState, useEffect, useCallback } from "react"
import "./Header.css"
import "bootstrap-icons/font/bootstrap-icons.css"
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const languages = [
    { code: "ar", flag: "🇸🇦", label: "SA" },
    { code: "fr", flag: "🇫🇷", label: "FR" },
    { code: "en", flag: "🇬🇧", label: "EN" },
  ]

  useEffect(() => {
    setIsClient(true)
    const currentLang = i18n.language || "ar"
    const langIndex = languages.findIndex((lang) => lang.code === currentLang)
    if (langIndex !== -1) {
      setCurrentLanguageIndex(langIndex)
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLanguageChange = useCallback(() => {
    const nextLanguageIndex = (currentLanguageIndex + 1) % languages.length
    const nextLanguage = languages[nextLanguageIndex]
    i18n.changeLanguage(nextLanguage.code)
    setCurrentLanguageIndex(nextLanguageIndex)
  }, [currentLanguageIndex, languages])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  if (!isClient) {
    return null
  }

  return (
    <div className="header-wrapper">
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          {/* Language Selector - Far Left */}
          <div className="language-section">
            <div className="language-selector" onClick={handleLanguageChange}>
              <FaGlobe className="language-icon" />
              <span className="language-label">{languages[currentLanguageIndex]?.label || "SA"}</span>
            </div>
          </div>

          {/* Login Button - Left */}
          <div className="login-section">
            <button className="login-btn" onClick={() => router.push("/LoginSignup")}>
              {t("login")}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className={`mobile-menu-toggle ${isMobileMenuOpen ? "active" : ""}`} onClick={toggleMobileMenu}>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {/* Navigation Menu - Center */}
          <div className={`navigation-section ${isMobileMenuOpen ? "mobile-open" : ""}`}>
            <div className="nav-menu">
              <Link
                href="/blog"
                className={`nav-item ${pathname === "/blog" ? "active" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("blog")}
              </Link>
              <span className="nav-separator">|</span>

              <Link
                href="/Forfaits"
                className={`nav-item ${pathname === "/Forfaits" ? "active" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("plans")}
              </Link>
              <span className="nav-separator">|</span>

              <Link
                href="/services"
                className={`nav-item ${pathname === "/services" ? "active" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("services")}
              </Link>
              <span className="nav-separator">|</span>

              <Link
                href="/about"
                className={`nav-item ${pathname === "/about" ? "active" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("about")}
              </Link>
              <span className="nav-separator">|</span>

              <Link
                href="/"
                className={`nav-item ${pathname === "/" ? "active" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("home")}
              </Link>
            </div>
          </div>

          {/* Contact Button - Far Right */}
          <div className="contact-section">
            <Link href="/Contact">
              <button className="contact-btn">{t("contact")}</button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}
      </nav>
    </div>
  )
}

export default Header
