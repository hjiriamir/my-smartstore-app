"use client"

import { useState } from "react"
import { Header } from "./header"
import { DashboardContent } from "./dashboard-content"
import { CommunicationContent } from "./communication-content"
import { TrainingContent } from "./training-content"
import { FAQContent } from "./faq-content"
import { UserManagementContent } from "./user-management-content"
import { useRouter } from "next/navigation"
import { ArrowLeftCircle } from "lucide-react"
import "@/components/multilingue/i18n.js"
import { useTranslation } from "react-i18next"

export type ActiveTab = "dashboard" | "communication" | "training" | "faq" | "users"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard")
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />
      case "communication":
        return <CommunicationContent />
      case "training":
        return <TrainingContent />
      case "faq":
        return <FAQContent />
      case "users":
        return <UserManagementContent />
      default:
        return <DashboardContent />
    }
  }

  const handleBackToDashboard = () => {
    router.push("/Dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-14">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="p-6">
        {activeTab !== "dashboard" && (
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 mb-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ArrowLeftCircle className="w-5 h-5" />
            <span>{t("backToDashboard")}</span>
          </button>
        )}
        {renderContent()}
      </main>
    </div>
  )
}