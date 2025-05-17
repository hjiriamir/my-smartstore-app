"use client"

import { useState } from "react"
import "./essai.css"
import { usePathname, useRouter  } from 'next/navigation'; // Remplace useLocation

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
} from "lucide-react"
import SideBarEssai from "./SideBarEssai"

export default function Essai() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="layout">
      <SideBarEssai />

      {/* Main Content */}
      <main className="main">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="search-container">
              <input type="text" placeholder="Rechercher..." className="search-input" />
              <Search size={20} className="search-icon" />
            </div>
          </div>
          <div className="header-right">
            <div className="notifications">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </div>
            <div className="user-profile">
              <img src="../Assets/photo.jpg" alt="Profile" className="avatar" />
              <div className="user-info">
                <h4>HJIRI Amir : </h4>
                <p>:  Administrateur</p>
              </div>
            </div>
          </div>
        </header>


        {/* Content */}
        <div className="content">
          <h1 className="page-title">Tableau de bord</h1>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon users">
                <Users size={24} />
              </div>
              <div className="stat-details">
                <h3>Utilisateurs</h3>
                <p className="stat-value">1,254</p>
                <p className="stat-change positive">+12% ce mois</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orders">
                <ShoppingCart size={24} />
              </div>
              <div className="stat-details">
                <h3>Commandes</h3>
                <p className="stat-value">854</p>
                <p className="stat-change positive">+8% ce mois</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon revenue">
                <CreditCard size={24} />
              </div>
              <div className="stat-details">
                <h3>Revenus</h3>
                <p className="stat-value">€24,530</p>
                <p className="stat-change positive">+18% ce mois</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon products">
                <Package size={24} />
              </div>
              <div className="stat-details">
                <h3>Produits</h3>
                <p className="stat-value">432</p>
                <p className="stat-change negative">-3% ce mois</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Commandes récentes</h2>
              <a href="#" className="view-all">
                Voir tout
              </a>
            </div>
            <div className="card-content">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Produit</th>
                    <th>Date</th>
                    <th>Montant</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#ORD-001</td>
                    <td>Marie Martin</td>
                    <td>Smartphone XYZ</td>
                    <td>12 Fév 2023</td>
                    <td>€899</td>
                    <td>
                      <span className="status completed">Complété</span>
                    </td>
                  </tr>
                  <tr>
                    <td>#ORD-002</td>
                    <td>Pierre Dubois</td>
                    <td>Laptop Pro</td>
                    <td>11 Fév 2023</td>
                    <td>€1,299</td>
                    <td>
                      <span className="status pending">En attente</span>
                    </td>
                  </tr>
                  <tr>
                    <td>#ORD-003</td>
                    <td>Sophie Leroy</td>
                    <td>Écouteurs sans fil</td>
                    <td>10 Fév 2023</td>
                    <td>€199</td>
                    <td>
                      <span className="status completed">Complété</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="two-column-grid">
            <div className="card">
              <div className="card-header">
                <h2>Utilisateurs récents</h2>
                <a href="#" className="view-all">
                  Voir tout
                </a>
              </div>
              <div className="card-content">
                <div className="users-list">
                  <div className="user-item">
                    <img src="/placeholder.svg?height=40&width=40" alt="User" className="user-avatar" />
                    <div className="user-details">
                      <h4>Émilie Rousseau</h4>
                      <p>emilie@example.com</p>
                    </div>
                    <span className="user-status active">Actif</span>
                  </div>
                  <div className="user-item">
                    <img src="/placeholder.svg?height=40&width=40" alt="User" className="user-avatar" />
                    <div className="user-details">
                      <h4>Lucas Moreau</h4>
                      <p>lucas@example.com</p>
                    </div>
                    <span className="user-status active">Actif</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2>Statistiques rapides</h2>
              </div>
              <div className="card-content">
                <div className="stat-item">
                  <div className="stat-info">
                    <h4>Taux de conversion</h4>
                    <p>24.5%</p>
                  </div>
                  <div className="stat-progress">
                    <div className="progress-bar" style={{ width: "24.5%" }}></div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-info">
                    <h4>Taux de rebond</h4>
                    <p>42.3%</p>
                  </div>
                  <div className="stat-progress">
                    <div className="progress-bar" style={{ width: "42.3%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

