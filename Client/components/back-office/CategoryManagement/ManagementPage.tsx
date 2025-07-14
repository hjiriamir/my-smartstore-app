import React from 'react';
import ManagementCard from './ManagementCard';
import Link from 'next/link';
import { 
  LayoutGrid, 
  Store, 
  MapPin,
  ChevronRight,
  Database,
  ArrowLeft // Nouvelle icône importée
} from 'lucide-react';
import "@/components/multilingue/i18n.js"
import { useTranslation } from "react-i18next"

const ManagementPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 mt-16 relative"> {/* Ajout de relative pour positionnement */}
      {/* Bouton de retour au Dashboard */}
      <Link href="/Dashboard" passHref>
        <button className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-full transition-all duration-300 shadow-md hover:shadow-lg`}>
          {isRTL ? (
            <>
              <span>{t("dashboard")}</span>
              <ArrowLeft className="h-5 w-5" />
            </>
          ) : (
            <>
              <ArrowLeft className="h-5 w-5" />
              <span>{t("dashboard")}</span>
            </>
          )}
        </button>
      </Link>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">{t("dashboardManagement.title")}</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <Link href="/category-management" passHref>         
              <ManagementCard 
                title={t("categoryManagement")}
                description={t("dashboardManagement.categoryManagementDescription")}
                icon={<LayoutGrid />}
                accentColor="amber"
                badgeText="Nouveau"
              />
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <Link href="/display-data" passHref>  
              <ManagementCard 
                title={t("databaseManagement")}
                description={t("databaseManagementDesc")}
                icon={<Database />}
                accentColor="blue"
              />
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <Link href="/zones-management" passHref>  
              <ManagementCard 
                title={t("zoneManagement")}
                description={t("dashboardManagement.zoneManagementDescription")}
                icon={<MapPin />}
                accentColor="emerald"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementPage;