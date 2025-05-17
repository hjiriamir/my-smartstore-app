// Sidebar.js
import React from 'react';
import { Home, Package, Users, BarChart2, MessageSquare, Settings, LogOut } from 'react-feather'; // ou vos icônes personnalisées
import './DashboardEntreprise.css'
import { usePathname, useRouter  } from 'next/navigation'; // Remplace useLocation

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-icon">😊</div>
        <h2>AdminHub</h2>
      </div>

      <nav className="nav-menu">
        <a href="#" className="nav-item active">
          <Home className="nav-icon" />
          <span>Dashboard</span>
        </a>
        <a href="#" className="nav-item">
          <Package className="nav-icon" />
          <span>My Store</span>
        </a>
        <a href="/listeDemandes" className="nav-item">
          <Users className="nav-icon" />
          <span>Subscription Requests</span>
        </a>
        <a href="#" className="nav-item">
          <BarChart2 className="nav-icon" />
          <span>Analytics</span>
        </a>
        <a href="#" className="nav-item">
          <MessageSquare className="nav-icon" />
          <span>Message</span>
        </a>
        <a href="#" className="nav-item">
          <Users className="nav-icon" />
          <span>Team</span>
        </a>
        <a href="#" className="nav-item">
          <Settings className="nav-icon" />
          <span>Settings</span>
        </a>
        <a href="#" className="nav-item logout">
          <LogOut className="nav-icon" />
          <span>Logout</span>
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
