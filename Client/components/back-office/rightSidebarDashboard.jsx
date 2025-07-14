import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link'; // Utilisez Link de next/link
import './Dashboard.css';
//import { useRouter } from 'next/router'; // Utilisez useRouter pour la navigation
import { usePathname, useRouter  } from 'next/navigation'; // Remplace useLocation
import '../multilingue/i18n.js';
import { useTranslation } from 'react-i18next';


const RightSidebarDashboard = () => {
  const router = useRouter(); // Utilisez useRouter pour la navigation
  const { t, i18n } = useTranslation(); 
  const [auth, setAuth] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Lecture de l'élément actif depuis le localStorage lors du chargement de la page
  const [activeItem, setActiveItem] = useState('dashboard');

  const isRTL = i18n.language === 'ar'; // RTL pour l'arabe, sinon LTR
  const textDirection = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActiveItem(localStorage.getItem('activeItem') || 'dashboard');
    }
  }, []);

  // Fonction pour changer l'élément actif
  const handleClick = (item) => {
    setActiveItem(item);
    // Enregistrer l'élément actif dans le localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeItem', item);
    }
  };

  const handleDelete = () => {
    axios.get(`${API_BASE_URL}/auth/logout`)
      .then(res => {
        setAuth(false); // Réinitialise l'état auth
        setMessage('You are not authenticated'); // Affiche le message d'erreur
        router.push('/'); // Redirige vers la page d'accueil
      })
      .catch(err => console.log(err));
  };

  return (
    <aside className="sidebar">
      <div className="menu1">
      <p className="menu-label" style={{ marginTop: "7px" }}>{t("general")}</p>
        <nav>
          <Link
            href="/Dashboard"
            className={`menu-item ${activeItem === 'dashboard' ? 'active' : ''}`}
            style={{ backgroundColor: activeItem === 'dashboard' ? '#0f766e' : '' }}
            onClick={() => handleClick('dashboard')}
          >
            <img src="/category.png" className="menu-icon" alt="Category Icon" />
            <span style={{ color: activeItem === 'dashboard' ? 'white' : '' }}>{t("dashboard")}</span>
            
          </Link>
          <a
            href="/management-page"
            className={`menu-item ${activeItem === 'category-management' ? 'active' : ''}`}
            style={{ backgroundColor: activeItem === 'category-management' ? '#0f766e' : '' }}
            onClick={() => handleClick('category-management')}
          >
            <img src="/dimensions.png" className="menu-icon" alt="Category Icon" />
            <span style={{ color: activeItem === 'category-management' ? 'white' : '' }}>{t("categoryManagement")}</span>
            
          </a>
         
          <Link
            href="/Editor"
            className={`menu-item ${activeItem === 'Library-Furniture' ? 'active' : ''}`}
            style={{ backgroundColor: activeItem === 'Library-Furniture' ? '#0f766e' : '' }}
            onClick={() => handleClick('Library-Furniture')}
          >
             <img src="/building.png" className="menu-icon" alt="Category Icon" />
            <span style={{ color: activeItem === 'Library-Furniture' ? 'white' : '' }}>{t("Library_Furniture")}</span>
           
          </Link>
          <a
            href="/marketing"
            className={`menu-item ${activeItem === 'marketing-strategy' ? 'active' : ''}`}
            style={{ backgroundColor: activeItem === 'marketing-strategy' ? '#0f766e' : '' }}
            onClick={() => handleClick('marketing-strategy')}
          >
             <img src="/cart.png" className="menu-icon" alt="Category Icon" />
            <span style={{ color: activeItem === 'marketing-strategy' ? 'white' : '' }}>{t("marketingStrategy")}</span>
           
          </a>
          <Link
            href="/user-management"
            className={`menu-item ${activeItem === 'user-management' ? 'active' : ''}`}
            style={{ backgroundColor: activeItem === 'user-management' ? '#0f766e' : '' }}
            onClick={() => handleClick('user-management')} // ✅ Correction ici
          >
            <img src="/management.png" className="menu-icon" alt="Category Icon" />
            <span style={{ color: activeItem === 'user-management' ? 'white' : '' }}>{t("user_management")}</span>
          </Link>

          <a
            href="#"
            className={`menu-item ${activeItem === 'sales-strategy' ? 'active' : ''}`}
            style={{ backgroundColor: activeItem === 'sales-strategy' ? '#0f766e' : '' }}
            onClick={() => handleClick('sales-strategy')}
          >
            <img src="/target.png" className="menu-icon" alt="Category Icon" />
            <span style={{ color: activeItem === 'sales-strategy' ? 'white' : '' }}>{t("push_sales")}</span>
            
          </a>
      
          <p className="menu-label" style={{ marginTop: "7px" }}>{t("support")}</p>
          <div className="support">
            <a
              href="#"
              className={`menu-item ${activeItem === 'help' ? 'active' : ''}`}
              onClick={() => handleClick('help')}
            >
               <img src="/i.png" className="menu-icon" alt="User Icon" />
              <span>{t("help")}</span>
             
            </a>
            <a
              href="#"
              className={`menu-item ${activeItem === 'settings' ? 'active' : ''}`}
              onClick={() => handleClick('settings')}
            >
              <img src="/settings.png" className="menu-icon" alt="Category Icon" />
              <span>{t("settings")}</span>
              
            </a>
            <a
              href="#"
              className={`menu-item ${activeItem === 'logout' ? 'active' : ''}`}
            >
               <img src="/logout.png" className="menu-icon" alt="Category Icon" />
              <span onClick={handleDelete}>{t("log_out")}</span>
             
            </a>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default RightSidebarDashboard;