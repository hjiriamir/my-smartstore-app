import React from 'react';
import { ChevronRight } from 'lucide-react';
import "@/components/multilingue/i18n.js"
import { useTranslation } from "react-i18next"

interface ManagementCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  badgeText?: string;
  accentColor?: 'amber' | 'blue' | 'emerald' | 'violet'; // Couleurs définies
  showAction?: boolean;
}

const ManagementCard: React.FC<ManagementCardProps> = ({
  title,
  description,
  icon,
  onClick,
  badgeText,
  accentColor = 'blue', // Valeur par défaut
  showAction = true
}) => {
  // Couleurs CSS personnalisées pour éviter les problèmes de purge Tailwind
  const colorVariants = {
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      hover: 'hover:bg-amber-100',
      border: 'border-amber-200',
      dark: 'bg-amber-500/10'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      hover: 'hover:bg-blue-100',
      border: 'border-blue-200',
      dark: 'bg-blue-500/10'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      hover: 'hover:bg-emerald-100',
      border: 'border-emerald-200',
      dark: 'bg-emerald-500/10'
    },
    violet: {
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      hover: 'hover:bg-violet-100',
      border: 'border-violet-200',
      dark: 'bg-violet-500/10'
    }
  };
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const textDirection = isRTL ? "rtl" : "ltr"
  const colors = colorVariants[accentColor];

  return (
    <div 
      className={`relative rounded-xl p-6 cursor-pointer transition-all duration-300 
      hover:shadow-md hover:transform hover:-translate-y-1 border ${colors.border}
      ${colors.bg} ${colors.hover} group backdrop-blur-sm bg-opacity-70`}
      onClick={onClick}
    >
      {/* Badge */}
      {badgeText && (
        <span className={`absolute top-4 right-4 ${colors.bg} ${colors.text} 
        text-xs font-medium px-2.5 py-0.5 rounded-full z-10 border ${colors.border}`}>
          {badgeText}
        </span>
      )}

      {/* Icon container */}
      <div className="mb-6 flex justify-center relative">
        <div className={`w-20 h-20 flex items-center justify-center rounded-2xl 
          ${colors.dark} group-hover:bg-opacity-20 transition-all duration-300`}>
          <div className={`p-3 rounded-full ${colors.text} bg-white shadow-xs border ${colors.border}`}>
            {React.cloneElement(icon as React.ReactElement, { size: 28 })}
          </div>
        </div>
        <div className={`absolute -bottom-2 h-1 w-12 ${colors.bg} rounded-full opacity-80`}></div>
      </div>
      
      {/* Content */}
      <div className="flex flex-col h-full">
        <h2 className={`text-xl font-bold ${colors.text} text-center mb-3`}>{title}</h2>
        
        <p className="text-gray-600 leading-relaxed flex-grow text-center text-sm mb-4">
          {description}
        </p>
        
        {/* Action button */}
        {showAction && (
          <div className="flex justify-center mt-2">
            <button className={`inline-flex items-center px-4 py-2 rounded-full 
              ${colors.bg} ${colors.text} group-hover:bg-opacity-100 
              border ${colors.border} transition-all duration-300`}>
              <span className="text-sm font-medium">{t("dashboardManagement.acceder")}</span>
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Subtle hover effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 
        ${colors.bg} transition-opacity duration-300 pointer-events-none`}></div>
    </div>
  );
};

export default ManagementCard;