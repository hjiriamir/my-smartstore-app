import React,{useContext } from 'react';
import { Search, Flag, FilePlus, PackagePlus, UserPlus, Download } from 'lucide-react';
import './Dashboard.css';
import RightSidebarDashboard from './rightSidebarDashboard';
import TopBanner from './TopBanner';
import { AuthContext } from "../../src/context/AuthContext";
import { usePathname, useRouter  } from 'next/navigation'; // Remplace useLocation

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
   // const navigate = useNavigate();

   
  if (user) {
    console.log("entreprise_id", user.entreprise_id);
    console.log("role ", user.role);
    console.log("email ", user.email);
    console.log("profile de", user.name);
  }
  
    if (!user) return <p>Chargement...</p>;
  return (
    
    <div className="dashboard-container">
      
    <RightSidebarDashboard />
      <main className="main-content">
      <TopBanner/>
        <section className="sales-summary">
            <h2>Sales Summary</h2>
            <div className="stats-container">
              <div className="stat-card">
                <div className="icon" style={{ backgroundColor: '#e8f3fe' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>143.3k</h3>
                  <p>Today's Sale</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="icon" style={{ backgroundColor: '#f0e8fe' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9c27b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>$ 250,423</h3>
                  <p>Yearly Total Sales</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="icon" style={{ backgroundColor: '#fff4e5' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>$68.9k</h3>
                  <p>Net Income</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="icon" style={{ backgroundColor: '#ffe8f0' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e91e63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>343</h3>
                  <p>Products</p>
                </div>
              </div>
            </div>
          
        </section>

        <section className="stock-report">
     <div className="chart-container">
     <div className="chart-header">
     <div className="legend">
      <div className="legend-item">
        <span className="legend-color stock-in"></span>
        <span>Stock In</span>
      </div>
      <div className="legend-item">
        <span className="legend-color stock-out"></span>
        <span>Stock Out</span>
      </div>
    </div>
    <h2>Stock Report</h2>
    
  </div>

            <div className="y-axis">
              <span>25000</span>
              <span>20000</span>
              <span>15000</span>
              <span>10000</span>
              <span>5000</span>
              <span>0</span>
            </div>

            <div className="chart">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
                // Define heights based on the original values
                const stockInHeights = [40, 35, 38, 42, 20, 25, 35, 45, 42, 35, 32, 25];
                const stockOutHeights = [20, 15, 22, 25, 15, 18, 20, 25, 20, 15, 18, 15];
                
                return (
                  <div className="bar-container" key={index}>
                    <div className="bar">
                      <div className="stock-in" style={{ height: `${stockInHeights[index]}%` }}></div>
                      <div className="stock-out" style={{ height: `${stockOutHeights[index]}%` }}></div>
                    </div>
                    <span>{month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="sales-order">
          <div className="h2-container">
           
            <h2 className="date-range"><span className="dropdown-icon">&#9662;</span>Last 7 Days </h2>
            <h2>Sales Order</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Draft</th>
                  <th>Confirmed</th>
                  <th>Packed</th>
                  <th>Shipped</th>
                  <th>Invoiced</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Direct Sales</td>
                  <td>2</td>
                  <td>32</td>
                  <td>42</td>
                  <td>23</td>
                  <td>7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <aside className="right-sidebar">
        <div className="profile">
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces" alt="Profile" />
          <div>
            <p className="profile-name">Bryan Doe</p>
            <p className="profile-role">Admin</p>
          </div>
        </div>
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-list">
            <a href="#" className="action-item">
              <FilePlus className="action-icon" />
              <span>Create Order</span>
              <span className="shortcut">ctrl + n</span>
            </a>
            <a href="#" className="action-item">
              <PackagePlus className="action-icon" />
              <span>Add Product</span>
              <span className="shortcut">ctrl + p</span>
            </a>
            <a href="#" className="action-item">
              <UserPlus className="action-icon" />
              <span>Add Supplier</span>
              <span className="shortcut">ctrl + k</span>
            </a>
            <a href="#" className="action-item">
              <Download className="action-icon" />
              <span>Export</span>
              <span className="shortcut">ctrl + s</span>
            </a>
          </div>
        </section>

        <section className="fast-moving">
          <h2>Fast Moving Items</h2>
          <div className="items-list">
            <div className="item">
            <span>Macbook Pro</span>
              <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop" alt="Macbook Pro" />
              
            </div>
            <div className="item">
            <span>iPhone 14 pro</span>
              <img src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&h=500&fit=crop" alt="iPhone 14 pro" />
              
            </div>
            <div className="item">
            <span>Zoom75</span>
              <img src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop" alt="Zoom75" />
             
            </div>
            <div className="item">
            <span>Airpods Pro</span>
              <img src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=500&fit=crop" alt="Airpods Pro" />
              
            </div>
            <div className="item">
            <span>Samsung Galaxy Fold</span>
              <img src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=500&fit=crop" alt="Samsung Galaxy Fold" />
              
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
};

export default Dashboard;