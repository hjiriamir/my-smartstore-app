import React, { useState, useEffect } from 'react'
import { usePathname, useRouter  } from 'next/navigation'; // Remplace useLocation

import './essai.css'
import {
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Home,
  CreditCard,
  HelpCircle,
} from 'lucide-react'

const SideBarEssai = () => {
  // Récupérer l'élément actif depuis le localStorage
  const storedActiveItem = localStorage.getItem('activeItem') || 'dashboard'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeItem, setActiveItem] = useState(storedActiveItem)

  // Mettre à jour localStorage chaque fois que l'élément actif change
  useEffect(() => {
    localStorage.setItem('activeItem', activeItem)
  }, [activeItem])

  const handleItemClick = (item) => {
    setActiveItem(item) // Mettre à jour l'élément actif
  }

  return (
    <div>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="logo">SmartStore - Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={activeItem === 'dashboard' ? 'active' : ''}>
              <a href="#" onClick={() => handleItemClick('dashboard')}>
                <Home size={20} />
                <span>Tableau de bord</span>
              </a>
            </li>
            <li className={activeItem === 'users' ? 'active' : ''}>
              <a href="#" onClick={() => handleItemClick('users')}>
                <Users size={20} />
                <span>Utilisateurs</span>
              </a>
            </li>
            <li className={activeItem === 'abonnements' ? 'active' : ''}>
              <a href="/abonnementList" onClick={() => handleItemClick('abonnements')}>
                <ShoppingCart size={20} />
                <span>Liste d'abonnement</span>
              </a>
            </li>
            <li className={activeItem === 'products' ? 'active' : ''}>
              <a href="#" onClick={() => handleItemClick('products')}>
                <Package size={20} />
                <span>Produits</span>
              </a>
            </li>
            <li className={activeItem === 'transactions' ? 'active' : ''}>
              <a href="#" onClick={() => handleItemClick('transactions')}>
                <CreditCard size={20} />
                <span>Transactions</span>
              </a>
            </li>
            <li className={activeItem === 'stats' ? 'active' : ''}>
              <a href="#" onClick={() => handleItemClick('stats')}>
                <BarChart3 size={20} />
                <span>Statistiques</span>
              </a>
            </li>
            <li className={activeItem === 'settings' ? 'active' : ''}>
              <a href="#" onClick={() => handleItemClick('settings')}>
                <Settings size={20} />
                <span>Paramètres</span>
              </a>
            </li>
            <li className={activeItem === 'help' ? 'active' : ''}>
              <a href="#" onClick={() => handleItemClick('help')}>
                <HelpCircle size={20} />
                <span>Aide</span>
              </a>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <a href="#" className="logout">
            <LogOut size={20} />
            <span>Déconnexion</span>
          </a>
        </div>
      </aside>
    </div>
  )
}

export default SideBarEssai