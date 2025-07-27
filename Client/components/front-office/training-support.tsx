"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "react-i18next"
import "@/components/multilingue/i18n.js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { toast } from "sonner"
import {
  Play,
  Book,
  HelpCircle,
  Search,
  Clock,
  CheckCircle,
  Check,
  Video,
  FileText,
  Lock,
  User,
  Settings,
  Loader2,
  Edit,
  X,
  Save,
  Smartphone,
  Bell,
  Key,
  Monitor,
  LogOut,
  Menu,
} from "lucide-react"

export default function TrainingSupport() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [completedModules, setCompletedModules] = useState<number[]>([1, 3])
  const [trainingModules, setTrainingModules] = useState<any[]>([])
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [currentResource, setCurrentResource] = useState<{ type: string; url: string } | null>(null)
  const [faqItems, setFaqItems] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showDevicesModal, setShowDevicesModal] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("training");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const API_FRONT_URL = process.env.NEXT_PUBLIC_FRONTEND_URL

  const [connectedDevices, setConnectedDevices] = useState([
    {
      id: 1,
      name: "iPhone 13",
      type: "Mobile",
      ip: "192.168.1.45",
      lastActivity: "2023-10-15T14:30:00",
      browser: "Safari",
      os: "iOS 16",
      status: "active",
      icon: <Smartphone className="h-5 w-5" />,
    },
    {
      id: 2,
      name: "Chrome sous Windows",
      type: "Desktop",
      ip: "192.168.1.100",
      lastActivity: "2023-10-16T09:15:00",
      browser: "Chrome 118",
      os: "Windows 11",
      status: "active",
      icon: <Monitor className="h-5 w-5" />,
    },
  ])

  // Mobile Menu Component
  const MobileMenu = ({ onTabChange }: { onTabChange: (tab: string) => void }) => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden mb-4 bg-transparent">
          <Menu className="h-4 w-4 mr-2" />
          {t("mobileFront.visualization.menu")}
        </Button>
      </SheetTrigger>
      <SheetContent side={isRTL ? "right" : "left"} className="w-80 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>{t("mobileFront.visualization.menu")}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {[
                { 
                  value: "training", 
                  label: t("front.support.formation"), 
                  icon: <Video className="h-4 w-4" /> 
                },
                { 
                  value: "faq", 
                  label: t("front.support.faq"), 
                  icon: <HelpCircle className="h-4 w-4" /> 
                },
                { 
                  value: "support", 
                  label: t("front.support.gestionCompte"), 
                  icon: <Settings className="h-4 w-4" /> 
                },
              ].map((tab) => (
                <Button
                  key={tab.value}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    onTabChange(tab.value);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  const DevicesModal = () => {
    if (!showDevicesModal) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="text-lg font-semibold">{t("front.support.appareil")}</h3>
            <button
              onClick={() => setShowDevicesModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
            {/* Mobile-friendly device list */}
            <div className="space-y-4">
              {connectedDevices.map((device) => (
                <div
                  key={device.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700 space-y-3 sm:space-y-0"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">{device.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{device.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{device.type}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {device.ip} • {new Date(device.lastActivity).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <Badge
                      variant={device.status === "active" ? "default" : "outline"}
                      className={
                        device.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }
                    >
                      {device.status === "active" ? "Actif" : "Expiré"}
                    </Badge>

                    {device.status === "active" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnectDevice(device.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 flex-1 sm:flex-none"
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">{t("front.support.deconnecter")}</span>
                        <span className="sm:hidden">Déconnecter</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="opacity-50 flex-1 sm:flex-none bg-transparent"
                      >
                        {t("front.support.dejaConnecter")}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {connectedDevices.filter((d) => d.status === "active").length} appareil(s) actif(s)
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 w-full sm:w-auto bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  {t("front.support.toutDeconnecter")}
                </Button>
                <Button variant="outline" onClick={() => setShowDevicesModal(false)} className="w-full sm:w-auto">
                  {t("front.support.fermer")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleDisconnectDevice = async (sessionId: number) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Aucun token d'authentification trouvé")
      }

      const logoutSessionResponse = await fetch(`${API_BASE_URL}/session/logoutSession/${sessionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${token}`,
        },
        credentials: "include",
      })

      if (!logoutSessionResponse.ok) {
        throw new Error("Erreur lors de la déconnexion de la session")
      }

      const logoutResponse = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${token}`,
        },
        credentials: "include",
      })

      if (!logoutResponse.ok) {
        throw new Error("Erreur lors de la déconnexion générale")
      }

      setConnectedDevices((prevDevices) =>
        prevDevices.map((device) => (device.id === sessionId ? { ...device, status: "expired" } : device)),
      )

      toast.success("Session déconnectée avec succès")
      window.location.href = API_FRONT_URL
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
      toast.error("Erreur lors de la déconnexion de la session")
    }
  }

  // Password validation rules
  const passwordRules = [
    { id: 1, text: "8 caractères minimum", validator: (pwd: any) => pwd.length >= 8 },
    { id: 2, text: "1 majuscule minimum", validator: (pwd: any) => /[A-Z]/.test(pwd) },
    { id: 3, text: "1 minuscule minimum", validator: (pwd: any) => /[a-z]/.test(pwd) },
    { id: 4, text: "1 chiffre minimum", validator: (pwd: any) => /[0-9]/.test(pwd) },
    { id: 5, text: "1 caractère spécial", validator: (pwd: any) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ]

  const isPasswordValid = passwordRules.every((rule) => rule.validator(newPassword))
  const doPasswordsMatch = newPassword === confirmPassword

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPasswordValid) {
      toast.error("Le mot de passe ne respecte pas toutes les exigences de sécurité")
      return
    }

    if (!doPasswordsMatch) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Aucun token d'authentification trouvé")
      }

      const response = await fetch(`${API_BASE_URL}/auth1/updatePassword`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${token}`,
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword: newPassword,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la mise à jour du mot de passe")
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowPasswordForm(false)

      toast.success("Mot de passe mis à jour avec succès")
    } catch (error: any) {
      console.error("Erreur lors du changement de mot de passe:", error)
      toast.error(error.message || "Une erreur est survenue lors du changement de mot de passe")
    }
  }

  const [userData, setUserData] = useState({
    id: "",
    firstName: "",
    email: "",
    role: "",
    magasin_id: "",
    NotificationPreference: "",
  })

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Aucun token d'authentification trouvé")
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données utilisateur")
      }

      const data = await response.json()
      console.log("Données utilisateur reçues:", data)

      setUserData({
        id: data.user?.idUtilisateur || "",
        firstName: data.user?.name || "",
        email: data.user?.email || "",
        role: data.user?.role || "",
        magasin_id: data.user?.magasin_id || "",
        NotificationPreference: data.user?.NotificationPreference || "",
      })
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  useEffect(() => {
    fetchUserData()
    fetchActiveSessions()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Aucun token d'authentification trouvé")
      }

      if (!userData.id) {
        throw new Error("ID utilisateur non trouvé")
      }

      const updateNameResponse = await fetch(`${API_BASE_URL}/auth1/updateUserName/${userData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userData.firstName,
        }),
        credentials: "include",
      })

      if (!updateNameResponse.ok) {
        const errorData = await updateNameResponse.json().catch(() => ({}))
        throw new Error(errorData.message || "Erreur lors de la mise à jour du nom")
      }

      setIsEditing(false)
      await fetchUserData()

      toast.success("Nom mis à jour avec succès")
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error)
      toast.error(error.message || "Une erreur est survenue lors de la mise à jour")
    } finally {
      setIsSaving(false)
    }
  }

  const fetchActiveSessions = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Aucun token d'authentification trouvé")
      }

      const response = await fetch(`${API_BASE_URL}/session/getActiveSessions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${token}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des sessions actives")
      }

      const data = await response.json()

      const formattedDevices = data.sessions.map((session: any) => ({
        id: session.id,
        name: `${session.deviceType} (${session.browser})`,
        type: session.deviceType,
        ip: session.ipAddress,
        lastActivity: session.lastActivity,
        browser: session.browser,
        os: session.os,
        status: "active",
        icon: session.deviceType === "Mobile" ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />,
      }))

      setConnectedDevices(formattedDevices)
    } catch (error) {
      console.error("Erreur lors de la récupération des sessions:", error)
      toast.error("Erreur lors du chargement des appareils connectés")
    }
  }

  const NotificationsModal = () => {
    const [notificationPrefs, setNotificationPrefs] = useState({
      email: false,
      platform: true,
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
      const fetchNotificationPreferences = async () => {
        try {
          const token = localStorage.getItem("token")
          if (!token) throw new Error("Aucun token d'authentification trouvé")
          if (!userData.id) throw new Error("ID utilisateur non trouvé")

          const response = await fetch(`${API_BASE_URL}/auth1/getNotificationPreferenceByUser/${userData.id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          })

          if (!response.ok) throw new Error("Erreur lors de la récupération des préférences")

          const data = await response.json()

          const emailPref =
            data.NotificationPreference === true ||
            data.NotificationPreference === "true" ||
            data.NotificationPreference === 1

          setNotificationPrefs({
            email: emailPref,
            platform: true,
          })

          console.log("Préférence récupérée:", data.NotificationPreference, "Convertie:", emailPref)
        } catch (error) {
          console.error("Erreur:", error)
          toast.error("Erreur lors du chargement des préférences")
        } finally {
          setIsLoading(false)
        }
      }

      if (showNotificationsModal) {
        fetchNotificationPreferences()
      }
    }, [showNotificationsModal, userData.id])

    const handleSavePreferences = async () => {
      setIsSaving(true)
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Aucun token d'authentification trouvé")
        if (!userData.id) throw new Error("ID utilisateur non trouvé")

        const response = await fetch(`${API_BASE_URL}/auth1/updateNotificationPreference/${userData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            NotificationPreference: notificationPrefs.email,
          }),
          credentials: "include",
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || "Erreur lors de la mise à jour")
        }

        setUserData((prev) => ({
          ...prev,
          NotificationPreference: notificationPrefs.email.toString(),
        }))

        toast.success("Préférences enregistrées")
        setShowNotificationsModal(false)
      } catch (error: any) {
        console.error("Erreur lors de la sauvegarde:", error)
        toast.error(error.message || "Erreur lors de la mise à jour")
      } finally {
        setIsSaving(false)
      }
    }

    if (!showNotificationsModal) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="text-lg font-semibold">Préférences de notification</h3>
            <button
              onClick={() => setShowNotificationsModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <Label>{t("front.support.parEmail")}</Label>
                      <p className="text-sm text-muted-foreground">{t("front.support.parEmailDescr")}</p>
                    </div>
                    <Switch
                      checked={notificationPrefs.email}
                      onCheckedChange={(checked) => setNotificationPrefs((prev) => ({ ...prev, email: checked }))}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <Label>{t("front.support.dansPlateforme")}</Label>
                      <p className="text-sm text-muted-foreground">{t("front.support.alerteInterne")}</p>
                    </div>
                    <Switch checked={true} disabled className="opacity-100" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowNotificationsModal(false)}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    {t("front.support.annuler")}
                  </Button>
                  <Button onClick={handleSavePreferences} disabled={isSaving} className="w-full sm:w-auto">
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t("front.support.enregistrement")}
                      </>
                    ) : (
                      t("front.support.enregistrer")
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Fetch FAQs
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/faq/getAllFaqs`)
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des FAQs")
        }
        const data = await response.json()
        const formattedData = data.map((faq: any) => ({
          id: Math.random().toString(36).substring(2, 9),
          question: faq.question,
          answer: faq.reponse,
          category: faq.categorie,
          helpful: faq.personnes_aidees,
          views: faq.vues,
        }))
        setFaqItems(formattedData)
      } catch (error) {
        console.error("Erreur:", error)
      }
    }

    fetchFaqs()
  }, [])

  // Fetch formations
  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/formations/getAllFormations`)
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des formations")
        }
        const data = await response.json()
        const formattedData = data.map((formation: any) => ({
          id: formation.id,
          title: formation.titre,
          description: formation.description,
          duration: `${formation.duree} min`,
          type: "video",
          difficulty: "Débutant",
          completed: completedModules.includes(formation.id),
          progress: completedModules.includes(formation.id) ? 100 : 0,
          thumbnail: "/placeholder.svg?height=120&width=200",
          url_video: formation.url_video,
          url_pdf: formation.url_pdf,
        }))
        setTrainingModules(formattedData)
      } catch (error) {
        console.error("Erreur:", error)
      }
    }

    fetchFormations()
  }, [completedModules])

  const tutorials = [
    {
      id: 1,
      title: "Guide de démarrage rapide",
      description: "Tout ce qu'il faut savoir pour commencer",
      type: "pdf",
      size: "2.3 MB",
      downloads: 1234,
    },
    {
      id: 2,
      title: "Raccourcis clavier",
      description: "Liste complète des raccourcis pour gagner du temps",
      type: "pdf",
      size: "0.8 MB",
      downloads: 567,
    },
    {
      id: 3,
      title: "Bonnes pratiques d'implémentation",
      description: "Conseils pour une mise en place efficace",
      type: "pdf",
      size: "1.5 MB",
      downloads: 890,
    },
  ]

  const filteredFAQ = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-600" />
      case "interactive":
        return <Play className="h-4 w-4 text-green-600" />
      case "tutorial":
        return <Book className="h-4 w-4 text-purple-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Débutant":
        return "bg-green-100 text-green-800"
      case "Intermédiaire":
        return "bg-yellow-100 text-yellow-800"
      case "Avancé":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleModuleComplete = (moduleId: number) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules([...completedModules, moduleId])
      setTrainingModules((prevModules) =>
        prevModules.map((module) => (module.id === moduleId ? { ...module, completed: true, progress: 100 } : module)),
      )
    }
  }

  const ResourceViewer = () => {
    if (!currentResource) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="text-lg font-medium">
              {currentResource.type === "video" ? "Visionnage vidéo" : "Document PDF"}
            </h3>
            <button
              onClick={() => {
                setIsViewerOpen(false)
                setCurrentResource(null)
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4">
            {currentResource.type === "video" ? (
              <div className="aspect-video w-full">
                <video controls autoPlay className="w-full h-full" onEnded={handleVideoEnded}>
                  <source src={currentResource.url} type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              </div>
            ) : (
              <iframe src={currentResource.url} className="w-full min-h-[70vh]" frameBorder="0">
                <p>
                  Votre navigateur ne supporte pas les PDF. Vous pouvez le <a href={currentResource.url}>télécharger</a>
                  .
                </p>
              </iframe>
            )}
          </div>
        </div>
      </div>
    )
  }

  const handleVideoEnded = () => {
    if (selectedVideo && !completedModules.includes(selectedVideo.id)) {
      setCompletedModules([...completedModules, selectedVideo.id])
    }
  }

  const handleModuleClick = (module: any) => {
    setSelectedVideo(module)

    if (module.url_video) {
      setCurrentResource({ type: "video", url: module.url_video })
      setIsViewerOpen(true)
    } else if (module.url_pdf) {
      setCurrentResource({ type: "pdf", url: module.url_pdf })
      setIsViewerOpen(true)
    }
  }

  const overallProgress = trainingModules.length > 0 ? (completedModules.length / trainingModules.length) * 100 : 0

  return (
    <div className="space-y-6" dir={textDirection}>
      {/* Mobile Menu */}
      <MobileMenu 
        onTabChange={(tab) => setActiveTab(tab)} 
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Desktop Tabs */}
        <TabsList className="hidden md:grid w-full grid-cols-3">
          <TabsTrigger value="training">{t("front.support.formation")}</TabsTrigger>
          <TabsTrigger value="faq">{t("front.support.faq")}</TabsTrigger>
          <TabsTrigger value="support">{t("front.support.gestionCompte")}</TabsTrigger>
        </TabsList>

        {/* Training Modules */}
        <TabsContent value="training" className="space-y-6" dir={textDirection}>
          <Card>
            <CardHeader>
              <CardTitle>{t("front.support.moduleFormation")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {trainingModules.length > 0 ? (
                  trainingModules.map((module) => (
                    <Card
                      key={module.id}
                      className={`hover:shadow-lg transition-shadow cursor-pointer ${
                        module.completed ? "border-green-200 bg-green-50" : ""
                      }`}
                      onClick={() => setSelectedVideo(module)}
                    >
                      <div className="relative">
                        <img
                          src={module.thumbnail || "/placeholder.svg"}
                          alt={module.title}
                          className="w-full h-32 object-cover rounded-t-lg"
                        />
                        {module.completed && (
                          <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 flex items-center space-x-2">
                          {module.url_video && getTypeIcon("video")}
                          {module.url_video && (
                            <span className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                              {module.duration}
                            </span>
                          )}
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-medium mb-2 text-sm sm:text-base">{module.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                          {module.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {module.url_video ? (
                            <>
                              <Badge variant="outline" className="flex items-center text-xs">
                                <Video className="h-3 w-3 mr-1" />
                                {t("front.support.video")}
                              </Badge>
                              <Badge variant="outline" className="flex items-center text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {module.duration}
                              </Badge>
                            </>
                          ) : module.url_pdf ? (
                            <Badge variant="outline" className="flex items-center text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              PDF
                            </Badge>
                          ) : null}
                        </div>

                        {(module.url_video || module.url_pdf) && (
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                            {module.url_video && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs sm:text-sm bg-transparent"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setCurrentResource({ type: "video", url: module.url_video })
                                  setIsViewerOpen(true)
                                }}
                              >
                                <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                {t("front.support.video")}
                              </Button>
                            )}
                            {module.url_pdf && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs sm:text-sm bg-transparent"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setCurrentResource({ type: "pdf", url: module.url_pdf })
                                  setIsViewerOpen(true)
                                }}
                              >
                                <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                PDF
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full flex justify-center py-8">
                    <p className="text-muted-foreground">{t("front.support.chargementModule")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-6" dir={textDirection}>
          <Card>
            <CardHeader>
              <CardTitle>{t("front.support.questionsFrequent")}</CardTitle>
              <CardDescription>{t("front.support.questionsFrequentDescr")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={t("front.support.rechercheFaq")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {faqItems.length > 0 ? (
                  filteredFAQ.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-start justify-between mb-2 gap-2">
                          <h3 className="font-medium text-base sm:text-lg flex-1">{item.question}</h3>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3 text-sm">{item.answer}</p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-muted-foreground gap-3">
                          <div className="flex items-center space-x-4">
                            <span className="text-xs">
                              {item.views} {t("front.support.vues")}
                            </span>
                            <span className="text-xs">
                              {item.helpful} {t("front.support.personnesAider")}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" className="text-xs">
                              👍 {t("front.support.utile")}
                            </Button>
                            <Button size="sm" variant="ghost" className="text-xs">
                              👎
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="flex justify-center py-8">
                    <p className="text-muted-foreground">Chargement des questions fréquentes...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support */}
        <TabsContent value="support" className="space-y-6" dir={textDirection}>
          <Card>
            <CardHeader>
              <CardTitle>{t("front.support.gestionCompte")}</CardTitle>
              <CardDescription>{t("front.support.gestionCompteDescr")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information Section - Responsive */}
              <div className="space-y-6 bg-white/50 dark:bg-gray-900/50 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-gray-200 dark:border-gray-700 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("front.support.infoPersonnel")}
                    </h3>
                  </div>
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-1 w-full sm:w-auto"
                    size="sm"
                  >
                    {isEditing ? (
                      <>
                        <X className="h-4 w-4" />
                        <span className="hidden sm:inline">{t("front.support.annuler")}</span>
                        <span className="sm:hidden">Annuler</span>
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline">{t("front.support.modifier")}</span>
                        <span className="sm:hidden">Modifier</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {[
                    {
                      label: t("front.support.nomPrenom"),
                      value: userData.firstName,
                      key: "firstName",
                      editable: true,
                    },
                    { label: t("front.support.email"), value: userData.email, key: "email", editable: false },
                    {
                      label: t("front.support.magasin"),
                      value: userData.magasin_id,
                      key: "magasin_id",
                      editable: false,
                    },
                    { label: t("front.support.role"), value: userData.role, key: "role", editable: false },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 transition-all hover:shadow-sm"
                    >
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                        {item.label}
                      </Label>

                      {isEditing && item.editable ? (
                        <Input
                          value={item.value}
                          onChange={(e) => setUserData({ ...userData, [item.key]: e.target.value })}
                          disabled={!item.editable}
                          className="bg-white dark:bg-gray-800"
                        />
                      ) : (
                        <div className="flex items-center">
                          <span className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                            {item.value || (
                              <span className="text-gray-400 dark:text-gray-500 italic text-sm">
                                {t("front.support.nonRenseigner")}
                              </span>
                            )}
                          </span>
                          {!item.editable && <Lock className="h-4 w-4 ml-2 text-gray-400 dark:text-gray-500" />}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        fetchUserData()
                      }}
                      className="gap-1 w-full sm:w-auto"
                    >
                      <X className="h-4 w-4" />
                      {t("front.support.annuler")}
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="gap-1 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="hidden sm:inline">{t("front.support.enregistrement")}</span>
                          <span className="sm:hidden">Enregistrement...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {t("front.support.enregistrer")}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Account Security Section - Responsive */}
              <div className="space-y-6 bg-white/50 dark:bg-gray-900/50 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center space-x-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
                    <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("front.support.securiteCompte")}
                  </h3>
                </div>

                <div className="space-y-4">
                  {showPasswordForm ? (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                          <Label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                            {t("front.support.ancienMotDePasse")}
                          </Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                            {t("front.support.nouvMotDePasse")}
                          </Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />

                          <div className="mt-2 space-y-1">
                            {passwordRules.map((rule) => (
                              <div key={rule.id} className="flex items-center">
                                {rule.validator(newPassword) ? (
                                  <Check className="h-4 w-4 text-green-500 mr-2" />
                                ) : (
                                  <X className="h-4 w-4 text-red-500 mr-2" />
                                )}
                                <span
                                  className={`text-sm ${rule.validator(newPassword) ? "text-green-500" : "text-gray-500"}`}
                                >
                                  {rule.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                            {t("front.support.confirmNouv")}
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                          {confirmPassword && !doPasswordsMatch && (
                            <p className="mt-1 text-sm text-red-500">{t("front.support.motDePasseNeCorrespondant")}</p>
                          )}
                          {confirmPassword && doPasswordsMatch && (
                            <p className="mt-1 text-sm text-green-500">{t("front.support.motDePasseCorrespondant")}</p>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                          <Button
                            variant="outline"
                            type="button"
                            onClick={() => setShowPasswordForm(false)}
                            className="w-full sm:w-auto"
                          >
                            {t("front.support.annuler")}
                          </Button>
                          <Button
                            type="submit"
                            disabled={!isPasswordValid || !doPasswordsMatch || !currentPassword}
                            className="w-full sm:w-auto"
                          >
                            {t("front.support.enregistrer")}
                          </Button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                          <Key className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium">{t("front.support.motDePasse")}</Label>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => setShowPasswordForm(true)} className="w-full sm:w-auto">
                        {t("front.support.changer")}
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <Smartphone className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <Label className="block text-sm font-medium">{t("front.support.appareil")}</Label>
                        <p className="text-sm text-muted-foreground">{connectedDevices.length} appareil(s) actif(s)</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setShowDevicesModal(true)} className="w-full sm:w-auto">
                      {t("front.support.gerer")}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preferences Section - Responsive */}
              <div className="space-y-6 bg-white/50 dark:bg-gray-900/50 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center space-x-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50">
                    <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("front.support.preference")}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <Bell className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <Label className="block text-sm font-medium">{t("front.support.label")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {userData.NotificationPreference === "true"
                            ? t("front.support.enabled")
                            : t("front.support.disabled")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowNotificationsModal(true)}
                      className="w-full sm:w-auto"
                    >
                      {t("front.support.configurer")}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isViewerOpen && <ResourceViewer />}
      {showDevicesModal && <DevicesModal />}
      {showNotificationsModal && <NotificationsModal />}
    </div>
  )
}
