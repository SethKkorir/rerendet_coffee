// src/components/Admin/AdminLayout.jsx
import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { 
  FaTachometerAlt, FaShoppingBag, FaBox, FaUsers, 
  FaEnvelope, FaChartBar, FaCog, FaSignOutAlt,
  FaBars, FaTimes, FaBell, FaUserCircle
} from 'react-icons/fa';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { user, logout, showNotification } = useContext(AppContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt />, path: '/admin' },
    { id: 'orders', label: 'Orders', icon: <FaShoppingBag />, path: '/admin/orders' },
    { id: 'products', label: 'Products', icon: <FaBox />, path: '/admin/products' },
    { id: 'users', label: 'Users', icon: <FaUsers />, path: '/admin/users' },
    { id: 'contacts', label: 'Contacts', icon: <FaEnvelope />, path: '/admin/contacts' },
    { id: 'analytics', label: 'Analytics', icon: <FaChartBar />, path: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: <FaCog />, path: '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
    showNotification('Logged out successfully', 'info');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Rerendet Admin</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <FaUserCircle className="profile-avatar" />
            {sidebarOpen && (
              <div className="profile-info">
                <span className="admin-name">{user?.firstName} {user?.lastName}</span>
                <span className="admin-role capitalize">{user?.role}</span>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars />
            </button>
            <h1 className="page-title">
              {menuItems.find(item => item.id === activeMenu)?.label}
            </h1>
          </div>

          <div className="header-right">
            <button className="notification-btn">
              <FaBell />
              <span className="notification-badge">3</span>
            </button>
            <div className="user-menu">
              <span className="welcome-text">Welcome, {user?.firstName}</span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;