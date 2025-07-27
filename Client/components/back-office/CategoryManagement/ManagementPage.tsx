"use client"

import type React from "react"
import Link from "next/link"
import { LayoutGrid, MapPin, Database, ArrowLeft } from "lucide-react"
import "@/components/multilingue/i18n.js"
import { useTranslation } from "react-i18next"
import ManagementCard from "./ManagementCard"

const ManagementPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 mt-16 relative" dir={isRTL ? "rtl" : "ltr"}>
      {/* Bouton de retour au Dashboard */}
      <Link href="/Dashboard" passHref>
        <button
          className={`absolute top-4 ${isRTL ? "right-4" : "left-4"} flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-full transition-all duration-300 shadow-md hover:shadow-lg text-sm`}
        >
          {isRTL ? (
            <>
              <span>{t("dashboard")}</span>
              <ArrowLeft className="h-4 w-4" />
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4" />
              <span>{t("dashboard")}</span>
            </>
          )}
        </button>
      </Link>
      
      <div className="max-w-7xl mx-auto pt-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">{t("dashboardManagement.title")}</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/category-management" passHref className="h-full">
            <ManagementCard
              title={t("categoryManagement")}
              description={t("dashboardManagement.categoryManagementDescription")}
              icon={LayoutGrid}
              accentColor="amber"
              badgeText="Nouveau"
            />
          </Link>

          <Link href="/display-data" passHref className="h-full">
            <ManagementCard
              title={t("databaseManagement")}
              description={t("databaseManagementDesc")}
              icon={Database}
              accentColor="blue"
            />
          </Link>

          <Link href="/zones-management" passHref className="h-full">
            <ManagementCard
              title={t("zoneManagement")}
              description={t("dashboardManagement.zoneManagementDescription")}
              icon={MapPin}
              accentColor="emerald"
            />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ManagementPage