import React from 'react';
import ManagementCard from './ManagementCard';
import Link from 'next/link'; // Utilisez Link de next/link

import { 
  LayoutGrid, 
  Store, 
  MapPin 
} from 'lucide-react';

const ManagementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-sky-100 p-6 md:p-10 mt-16">
      <div className="max-w-7xl mx-auto"> 
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Dashboard Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/category-management" passHref>         
              <ManagementCard 
                title="Gestion des catégories"
                description="Créez, structurez et gérez vos catégories, sous-catégories et critères d’attribution pour enrichir vos planogrammes et optimiser l’expérience en magasin."
                icon={<LayoutGrid size={24} className="text-amber-500" />}
              />
          </Link>
          <Link href="/magasin-management" passHref>  
          <ManagementCard 
            title="Gestion des magasins"
            description="Administrez l’ensemble de vos magasins, configurez leurs espaces et zones, et associez chaque magasin à ses catégories et planogrammes pour une gestion cohérente et centralisée."
            icon={<Store size={24} className="text-blue-500" />}
            
          />
          </Link>
          <Link href="/zones-management" passHref>  
          <ManagementCard 
            title="Gestion des zones"
            description="Configurez et organisez les zones d’exposition dans chaque magasin (par exemple : entrée, étagères, murs), afin d’optimiser l’aménagement, la circulation et la présentation des produits."
            icon={<MapPin size={24} className="text-emerald-500" />}
            
          />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ManagementPage;