"use client"
import { useState, useEffect } from "react"
import "./TopBanner.css"
import { Bell, Menu, BellRing, Package } from "lucide-react"
import { useTranslation } from "react-i18next"
import i18n from "../multilingue/i18n"
import { useRouter } from "next/navigation"

const TopBanner = ({ onMenuClick, onRightMenuClick }) => {
  const { t } = useTranslation()
  const isRTL = i18n.language === "ar"

  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [idEntreprise, setIdEntreprise] = useState(null)

  const router = useRouter()

  const languages = [
    { code: "sa", flag: "/sa.png", alt: "Saudi Arabia Flag", i18nCode: "ar" },
    { code: "us", flag: "/us.png", alt: "United States Flag", i18nCode: "en" },
    { code: "fr", flag: "/fr.png", alt: "France Flag", i18nCode: "fr" },
  ]

  const defaultLanguageIndex = languages.findIndex((lang) => lang.i18nCode === "en")
  const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(defaultLanguageIndex)

  // Récupération des données utilisateur
  useEffect(() => {
    const fetchCurrentUserDataAndStores = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("Token d'authentification manquant")
          return
        }

        const userResponse = await fetch(`http://localhost:8081/api/auth/me`, {
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

        console.log("Entreprise récupérée:", entrepriseId)
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
        const response = await fetch(`http://localhost:8081/api/stock-alerts/getAllStockAlerts/${idEntreprise}`)

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des alertes de stock")
        }

        const stockAlerts = await response.json()

        // Transformer les alertes en notifications
        const transformedNotifications = stockAlerts.map((alert) => ({
          id: alert.id,
          title: getAlertTitle(alert.alert_type, alert.Produit?.nom),
          message: getAlertMessage(alert.alert_type, alert.Produit?.nom, alert.Produit?.stock, alert.threshold),
          time: formatNotificationTime(alert.notified_at),
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
        return `🚨 Rupture de stock`
      case "low_stock":
        return `⚠️ Stock faible`
      default:
        return `📦 Alerte stock`
    }
  }

  const getAlertMessage = (alertType, productName, currentStock, threshold) => {
    switch (alertType) {
      case "out_of_stock":
        return `Le produit "${productName}" est en rupture de stock (0 unité)`
      case "low_stock":
        return `Le produit "${productName}" a un stock faible (${currentStock} unités, seuil: ${threshold})`
      default:
        return `Alerte pour le produit "${productName}"`
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

  const formatNotificationTime = (dateString) => {
    const now = new Date()
    const notificationDate = new Date(dateString)
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60))

    if (diffInMinutes < 1) return "À l'instant"
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`

    const diffInDays = Math.floor(diffInHours / 24)
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`
  }

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
    console.log("Selected language:", selectedLanguage.i18nCode)
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
      const response = await fetch(`http://localhost:8081/api/stock-alerts/getAllStockAlerts/${idEntreprise}`)

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des alertes de stock")
      }

      const stockAlerts = await response.json()

      const transformedNotifications = stockAlerts.map((alert) => ({
        id: alert.id,
        title: getAlertTitle(alert.alert_type, alert.Produit?.nom),
        message: getAlertMessage(alert.alert_type, alert.Produit?.nom, alert.Produit?.stock, alert.threshold),
        time: formatNotificationTime(alert.notified_at),
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

  const navigateToShelfLabels = (productId, event) => {
    event.stopPropagation() // Empêcher le clic sur la notification
    router.push("/shelf-labels")
    setShowNotifications(false) // Fermer le dropdown
  }

  const hasNotifications = notifications.length > 0

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
            {isLoadingNotifications
              ? "Chargement..."
              : unreadCount > 0
                ? `${unreadCount} nouvelle${unreadCount > 1 ? "s" : ""} alerte${unreadCount > 1 ? "s" : ""}`
                : "Notifications"}
          </span>
          {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
        </div>

        {/* Dropdown des notifications */}
        <div className={`notifications-dropdown ${showNotifications ? "open" : ""}`}>
          <div className="notifications-header">
            <h3>Alertes de Stock</h3>
          </div>

          <div className="notifications-list">
            {isLoadingNotifications ? (
              <div className="loading-notifications">
                <div className="loading-spinner"></div>
                <p>Chargement des alertes...</p>
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
                        title="Gérer les étiquettes"
                      >
                        🏷️
                      </button>
                    </div>
                    <p>{notification.message}</p>
                    <div className="notification-details">
                      <span className="product-info">
                        📦 {notification.productName} - Stock: {notification.currentStock}
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
                <p>Aucune alerte de stock</p>
                <small>Toutes vos alertes apparaîtront ici</small>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notifications-footer">
              <button onClick={refreshNotifications} disabled={isLoadingNotifications}>
                {isLoadingNotifications ? "⟳" : "🔄"} Actualiser
              </button>
              <button onClick={markAllAsRead}>✓ Tout marquer lu</button>
              <button onClick={clearAllNotifications}>🗑️ Effacer tout</button>
            </div>
          )}
        </div>
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
