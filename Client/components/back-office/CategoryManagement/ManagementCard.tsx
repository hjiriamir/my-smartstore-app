import React from 'react';

interface ManagementCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const ManagementCard: React.FC<ManagementCardProps> = ({
  title,
  description,
  icon,
  onClick
}) => {
  return (
    <div 
      className="bg-white rounded-2xl shadow-md p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]"
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="mb-4 flex justify-center">
          <div className="w-32 h-32 flex items-center justify-center">
            <div className="p-4 rounded-full bg-gray-50 flex items-center justify-center">
              {icon}
            </div>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-3">{title}</h2>
        
        <p className="text-gray-600 leading-relaxed flex-grow text-center text-sm">
          {description}
        </p>
        
        <div className="flex justify-center mt-4">
          <div className="flex space-x-1">
            <div className={`h-2 w-2 rounded-full ${title.includes('catégories') ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
            <div className={`h-2 w-2 rounded-full ${title.includes('magasins') ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className={`h-2 w-2 rounded-full ${title.includes('zones') ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementCard;