"use client"
import { useState, useEffect } from "react"
import "./TopBanner.css"
import { Bell, Menu, BellRing, Package, RefreshCw, Check, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import i18n from "../multilingue/i18n"
import { useRouter } from "next/navigation"

const TopBanner = ({ 
  onMenuClick = () => {}, 
  onRightMenuClick = () => {} 
}) => {
  const { t } = useTranslation()
  const isRTL = i18n.language === "ar"
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [idEntreprise, setIdEntreprise] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)

  const router = useRouter()

  const languages = [
    { code: "sa", flag: "/sa.png", alt: "Saudi Arabia Flag", i18nCode: "ar" },
    { code: "us", flag: "/us.png", alt: "United States Flag", i18nCode: "en" },
    { code: "fr", flag: "/fr.png", alt: "France Flag", i18nCode: "fr" },
  ]

  const defaultLanguageIndex = languages.findIndex((lang) => lang.i18nCode === "en")
  const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(defaultLanguageIndex)

  // Gestion du scroll pour l'effet de réduction
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Récupération des données utilisateur
  useEffect(() => {
    const fetchCurrentUserDataAndStores = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("Token d'authentification manquant")
          return
        }

        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })

        if (!userResponse.ok) {
          throw new Error("Erreur lors de la récupération des données utilisateur")
        }

        const userData = await userResponse.json()
        const userId = userData.user?.idUtilisateur || userData.idUtilisateur || userData.id
        const entrepriseId = userData.user?.entreprises_id || userData.entreprises_id

        setCurrentUserId(userId)
        setIdEntreprise(entrepriseId)
      } catch (error) {
        console.error("Error fetching current user data:", error)
      }
    }

    fetchCurrentUserDataAndStores()
  }, [])

  // Récupération des notifications de stock
  useEffect(() => {
    const fetchStockAlerts = async () => {
      if (!idEntreprise) return

      setIsLoadingNotifications(true)
      try {
        const response = await fetch(`${API_BASE_URL}/stock-alerts/getAllStockAlerts/${idEntreprise}`)

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des alertes de stock")
        }

        const stockAlerts = await response.json()

        // Transformer les alertes en notifications
        const transformedNotifications = stockAlerts.map((alert) => ({
          id: alert.id,
          title: getAlertTitle(alert.alert_type, alert.Produit?.nom),
          message: getAlertMessage(alert.alert_type, alert.Produit?.nom, alert.Produit?.stock, alert.threshold),
          time: formatNotificationTime(alert.notified_at, t),
          unread: true,
          type: alert.alert_type,
          productId: alert.product_id,
          productName: alert.Produit?.nom,
          currentStock: alert.Produit?.stock,
          threshold: alert.threshold,
          icon: getAlertIcon(alert.alert_type),
        }))

        setNotifications(transformedNotifications)
      } catch (error) {
        console.error("Erreur lors de la récupération des alertes:", error)
      } finally {
        setIsLoadingNotifications(false)
      }
    }

    fetchStockAlerts()

    // Actualiser les notifications toutes les 5 minutes
    const interval = setInterval(fetchStockAlerts, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [idEntreprise])

  // Fonctions utilitaires pour transformer les données
  const getAlertTitle = (alertType, productName) => {
    switch (alertType) {
      case "out_of_stock":
        return `🚨 ${t("stockAlert.outOfStock")}`
      case "low_stock":
        return `⚠️ ${t("stockAlert.lowStock")}`
      default:
        return `📦 ${t("stockAlert.default")}`
    }
  }

  const getAlertMessage = (alertType, productName, currentStock, threshold) => {
    switch (alertType) {
      case "out_of_stock":
        return t("stockAlert.outOfStockMessage", { productName })
      case "low_stock":
        return t("stockAlert.lowStockMessage", { productName, currentStock, threshold })
      default:
        return t("stockAlert.defaultMessage", { productName })
    }
  }

  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case "out_of_stock":
        return "🚨"
      case "low_stock":
        return "⚠️"
      default:
        return "📦"
    }
  }

  const formatNotificationTime = (dateString, t) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
  
    if (diffInMinutes < 1) return t("aInstant");
    if (diffInMinutes < 60)
      return `${t("ilYa")} ${diffInMinutes} ${t("minute")}${diffInMinutes > 1 ? "s" : ""}`;
  
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${t("ilYa")} ${diffInHours} ${t("heure")}${diffInHours > 1 ? "s" : ""}`;
  
    const diffInDays = Math.floor(diffInHours / 24);
    return `${t("ilYa")} ${diffInDays} ${t("jour")}${diffInDays > 1 ? "s" : ""}`;
  };

  useEffect(() => {
    i18n.changeLanguage(languages[selectedLanguageIndex].i18nCode)
  }, [selectedLanguageIndex])

  // Fermer les notifications quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".notifications-section")) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  const handleLanguageClick = (index) => {
    const selectedLanguage = languages[index]
    i18n.changeLanguage(selectedLanguage.i18nCode)
    setSelectedLanguageIndex(index)
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  const markAsRead = (notificationId) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, unread: false } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, unread: false })))
  }

  const clearAllNotifications = () => {
    setNotifications([])
    setShowNotifications(false)
  }

  const refreshNotifications = async () => {
    if (!idEntreprise) return

    setIsLoadingNotifications(true)
    try {
      const response = await fetch(`${API_BASE_URL}/stock-alerts/getAllStockAlerts/${idEntreprise}`)

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des alertes de stock")
      }

      const stockAlerts = await response.json()

      const transformedNotifications = stockAlerts.map((alert) => ({
        id: alert.id,
        title: getAlertTitle(alert.alert_type, alert.Produit?.nom),
        message: getAlertMessage(alert.alert_type, alert.Produit?.nom, alert.Produit?.stock, alert.threshold),
        time: formatNotificationTime(alert.notified_at, t),
        unread: true,
        type: alert.alert_type,
        productId: alert.product_id,
        productName: alert.Produit?.nom,
        currentStock: alert.Produit?.stock,
        threshold: alert.threshold,
        icon: getAlertIcon(alert.alert_type),
      }))

      setNotifications(transformedNotifications)
    } catch (error) {
      console.error("Erreur lors de l'actualisation des alertes:", error)
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  const unreadCount = notifications.filter((notif) => notif.unread).length
  const hasNotifications = notifications.length > 0

  const navigateToShelfLabels = (productId, event) => {
    event.stopPropagation()
    router.push("/shelf-labels")
    setShowNotifications(false)
  }

  return (
    <section className={`top-banner ${isScrolled ? 'scrolled' : ''}`}>
      {/* Bouton menu mobile gauche */}
      <button
        className={`mobile-menu-button ${onMenuClick ? "active" : ""}`}
        onClick={onMenuClick}
        aria-label={t("toggleMenu")}
      >
        <Menu size={24} />
      </button>

      <div className="banner-left">
        <h1 className="logo-title">
          <span>Smart</span> <span>Store</span>
        </h1>

        {/* Sélecteur de langue */}
        <div className="lang_toggle" title={t("selectLanguage") || "Select Language"}>
          {languages.map((lang, index) => (
            <img
              key={lang.code}
              src={lang.flag || "/placeholder.svg"}
              alt={lang.alt}
              className={selectedLanguageIndex === index ? "selected" : ""}
              onClick={() => handleLanguageClick(index)}
            />
          ))}
        </div>
      </div>

      {/* Section Notifications */}
      <div className="notifications-section">
        <div className="notifications-container" onClick={toggleNotifications}>
          <div className={`notification-icon ${hasNotifications ? "has-notifications" : ""}`}>
            {unreadCount > 0 ? <BellRing size={20} /> : <Bell size={20} />}
          </div>
          <span className="notification-text">
            {unreadCount > 0
              ? t("notificationMessage", { count: unreadCount })
              : t("front.dashboard.notif")}
          </span>

          {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
        </div>

        {/* Dropdown des notifications */}
        <div className={`notifications-dropdown ${showNotifications ? "open" : ""}`}>
          <div className="notifications-header">
            <h3>{t("front.dashboard.notif")}</h3>
          </div>

          <div className="notifications-list">
            {isLoadingNotifications ? (
              <div className="loading-notifications">
                <div className="loading-spinner"></div>
                <p>{t("chargementAlertes")}</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.unread ? "unread" : ""} ${notification.type}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-content">
                    <div className="notification-header">
                      <span className="notification-icon-type">{notification.icon}</span>
                      <h4>{notification.title}</h4>
                      <button
                        className="shelf-labels-btn"
                        onClick={(e) => navigateToShelfLabels(notification.productId, e)}
                        title={t("manageLabels")}
                      >
                        🏷️
                      </button>
                    </div>
                    <p>{notification.message}</p>
                    <div className="notification-details">
                      <span className="product-info">
                        📦 {notification.productName} - {t("actionsRapide.createProduct.stock")}: {notification.currentStock}
                      </span>
                      <div className="notification-time">{notification.time}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <div className="no-notifications-icon">
                  <Package size={48} />
                </div>
                <p>{t("aucuneAlert")}</p>
                <small>{t("appAletes")}</small>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notifications-footer">
              <button onClick={refreshNotifications} disabled={isLoadingNotifications}>
                <RefreshCw size={16} /> {t("actul")}
              </button>
              <button onClick={markAllAsRead}>
                <Check size={16} /> {t("marqueCommeLu")}
              </button>
              <button onClick={clearAllNotifications}>
                <Trash2 size={16} /> {t("effacerTous")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bouton menu mobile droite */}
      <button
        className={`mobile-right-menu-button ${onRightMenuClick ? "active" : ""}`}
        onClick={onRightMenuClick}
        aria-label={t("toggleMenu")}
      >
        <Menu size={24} />
      </button>
    </section>
  )
}

export default TopBanner