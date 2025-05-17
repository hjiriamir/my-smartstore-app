import {
    Search,
    Download,
    Plus,
    MoreVertical,
    Home,
    Package,
    BarChart2,
    MessageSquare,
    Users,
    Settings,
    LogOut,
  } from "lucide-react"
  import "./DashboardEntreprise.css"
  import Sidebar from './Sidebar'; // Importez le composant Sidebar
  import { usePathname, useRouter  } from 'next/navigation'; // Remplace useLocation

  const DashboardEntreprise = () => {
    return (
      <div className="dashboard-container">
        {/* Appel du composant Sidebar */}
      <Sidebar />
        {/* Main Content */}
        <div className="main-content1" style={{ marginLeft: "400px" }}>
        {/* Header */}
          <header className="header">
            <div className="header-left">
              <button className="menu-toggle">
                <span></span>
              </button>
              <div className="categories-dropdown">
                <span>Categories</span>
              </div>
              <div className="search-bar">
                <input type="text" placeholder="Search..." />
                <button className="search-button">
                  <Search size={18} />
                </button>
              </div>
            </div>
            <div className="header-right">
              <div className="notification">
                <div className="notification-badge">8</div>
                <div className="notification-icon">🔔</div>
              </div>
              <div className="user-profile">
                <img src="/placeholder.svg?height=40&width=40" alt="User" className="avatar" />
              </div>
            </div>
          </header>
  
          {/* Dashboard Content */}
          <div className="dashboard-content">
            <div className="page-header">
              <h1>Dashboard</h1>
              <button className="download-btn">
                <Download size={16} />
                Download PDF
              </button>
            </div>
  
            <div className="breadcrumb">
              <span>Dashboard</span>
              <span className="separator">›</span>
              <span className="active">Home</span>
            </div>
  
            {/* Stats Cards */}
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon blue">
                  <div className="icon-bg">📋</div>
                </div>
                <div className="stat-info">
                  <h2>1020</h2>
                  <p>New Order</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon yellow">
                  <div className="icon-bg">👥</div>
                </div>
                <div className="stat-info">
                  <h2>2834</h2>
                  <p>Visitors</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange">
                  <div className="icon-bg">💰</div>
                </div>
                <div className="stat-info">
                  <h2>$2543</h2>
                  <p>Total Sales</p>
                </div>
              </div>
            </div>
  
            {/* Dashboard Widgets */}
            <div className="dashboard-widgets">
              {/* Recent Orders */}
              <div className="widget orders-widget">
                <div className="widget-header">
                  <h3>Recent Orders</h3>
                  <div className="widget-actions">
                    <button className="action-btn">
                      <Search size={16} />
                    </button>
                    <button className="action-btn">
                      <span className="filter-icon">≡</span>
                    </button>
                  </div>
                </div>
                <div className="widget-content">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Date Order</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className="user-info">
                            <img src="/placeholder.svg?height=32&width=32" alt="User" className="user-avatar" />
                            <span>John Doe</span>
                          </div>
                        </td>
                        <td>01-10-2021</td>
                        <td>
                          <span className="status completed">Completed</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="user-info">
                            <img src="/placeholder.svg?height=32&width=32" alt="User" className="user-avatar" />
                            <span>John Doe</span>
                          </div>
                        </td>
                        <td>01-10-2021</td>
                        <td>
                          <span className="status pending">Pending</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="user-info">
                            <img src="/placeholder.svg?height=32&width=32" alt="User" className="user-avatar" />
                            <span>John Doe</span>
                          </div>
                        </td>
                        <td>01-10-2021</td>
                        <td>
                          <span className="status process">Process</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
  
              {/* Todos */}
              <div className="widget todos-widget">
                <div className="widget-header">
                  <h3>Todos</h3>
                  <div className="widget-actions">
                    <button className="action-btn">
                      <Plus size={16} />
                    </button>
                    <button className="action-btn">
                      <span className="filter-icon">≡</span>
                    </button>
                  </div>
                </div>
                <div className="widget-content">
                  <div className="todo-item">
                    <div className="todo-color blue"></div>
                    <div className="todo-content">
                      <span>Todo List</span>
                    </div>
                    <button className="todo-more">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  <div className="todo-item">
                    <div className="todo-color blue"></div>
                    <div className="todo-content">
                      <span>Todo List</span>
                    </div>
                    <button className="todo-more">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  <div className="todo-item">
                    <div className="todo-color orange"></div>
                    <div className="todo-content">
                      <span>Todo List</span>
                    </div>
                    <button className="todo-more">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  export default DashboardEntreprise
  
  