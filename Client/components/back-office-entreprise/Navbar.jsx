import React from 'react';
import './DashboardEntreprise.css'
import { IconName } from 'lucide-react';
import { usePathname, useRouter  } from 'next/navigation'; // Remplace useLocation

const Navbar = () => {
  return (
    <nav>
      <i data-lucide="menu" className="menu-icon"></i>
      <a href="#" className="nav-link">Categories</a>
      <form action="#">
        <div className="form-input">
          <input type="search" placeholder="Search..." />
          <button type="submit" className="search-btn">
            <i data-lucide="search" className="search-icon"></i>
          </button>
        </div>
      </form>
      <input type="checkbox" id="switch-mode" hidden />
      <label htmlFor="switch-mode" className="switch-mode"></label>
      <a href="#" className="notification">
        <i data-lucide="bell"></i>
        <span className="num">8</span>
      </a>
      <a href="#" className="profile">
        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile" />
      </a>
    </nav>
  );
};

export default Navbar;