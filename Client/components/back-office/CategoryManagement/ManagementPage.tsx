import React from 'react';
import ManagementCard from './ManagementCard';
import Link from 'next/link';
import { 
  LayoutGrid, 
  Store, 
  MapPin,
  ChevronRight
} from 'lucide-react';
import "@/components/multilingue/i18n.js"
import { useTranslation } from "react-i18next"

const ManagementPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 mt-16"> {/* Fond plus neutre */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">{t("dashboardManagement.title")}</h1>
         
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"> {/* Container blanc pour les cartes */}
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
            <Link href="/magasin-management" passHref>  
              <ManagementCard 
                title={t("magasinManagement")}
                description={t("dashboardManagement.magasinManagementDescription")}
                icon={<Store />}
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