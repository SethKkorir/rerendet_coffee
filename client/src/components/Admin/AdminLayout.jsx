// src/components/Admin/AdminLayout.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import {
  FaTachometerAlt, FaShoppingBag, FaBox, FaUsers,
  FaEnvelope, FaChartBar, FaCog, FaSignOutAlt,
  FaBars, FaTimes, FaBell, FaUserCircle,
  FaInfoCircle, FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { user, logout, showNotification } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock Admin Notifications
  const adminNotifications = [
    { id: 1, type: 'order', message: 'New order #1023 received', time: '5 min ago', read: false },
    { id: 2, type: 'alert', message: 'Low stock: Ethiopian Yirgacheffe', time: '1 hour ago', read: false },
    { id: 3, type: 'user', message: 'New user registered: John Doe', time: '2 hours ago', read: true },
    { id: 4, type: 'system', message: 'System backup completed', time: '1 day ago', read: true },
  ];

  const unreadCount = adminNotifications.filter(n => !n.read).length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt />, path: '/admin' },
    { id: 'orders', label: 'Orders', icon: <FaShoppingBag />, path: '/admin/orders' },
    { id: 'products', label: 'Products', icon: <FaBox />, path: '/admin/products' },
    { id: 'users', label: 'Users', icon: <FaUsers />, path: '/admin/users' },
    { id: 'contacts', label: 'Contacts', icon: <FaEnvelope />, path: '/admin/contacts' },
    { id: 'analytics', label: 'Analytics', icon: <FaChartBar />, path: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: <FaCog />, path: '/admin/settings' },
  ];

  // Update active menu based on current location
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find(item => currentPath === item.path || currentPath.startsWith(item.path + '/'));
    if (activeItem) {
      setActiveMenu(activeItem.id);
    }
  }, [location.pathname]);

  const handleMenuClick = (item) => {
    setActiveMenu(item.id);
    navigate(item.path);
  };

  const handleLogout = () => {
    logout();
    showNotification('Logged out successfully', 'info');
    navigate('/admin/login');
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
              onClick={() => handleMenuClick(item)}
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
            <div className="notification-wrapper">
              <button
                className="notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    <button className="mark-all-read">Mark all read</button>
                  </div>
                  <div className="notification-list">
                    {adminNotifications.map(notification => (
                      <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                        <div className={`notification-icon ${notification.type}`}>
                          {notification.type === 'order' && <FaShoppingBag />}
                          {notification.type === 'alert' && <FaExclamationCircle />}
                          {notification.type === 'user' && <FaUsers />}
                          {notification.type === 'system' && <FaInfoCircle />}
                        </div>
                        <div className="notification-content">
                          <p>{notification.message}</p>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="notification-footer">
                    <button>View All Notifications</button>
                  </div>
                </div>
              )}
            </div>
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