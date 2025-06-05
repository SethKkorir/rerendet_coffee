import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUser, 
  FaShoppingBag, 
  FaBars, 
  FaTimes,
  FaSignInAlt,
  FaUserPlus,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaSun,
  FaMoon
} from 'react-icons/fa';
import { AppContext } from '../../context/AppContext';
import './Navbar.css';

function Navbar() {
  const {
    cartCount,
    setIsCartOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
    user,
    logout
  } = useContext(AppContext);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialMode = savedMode !== null ? savedMode : systemPrefersDark;
    
    setDarkMode(initialMode);
    document.documentElement.setAttribute('data-theme', initialMode ? 'dark' : 'light');
  }, []);

  // Toggle dark/light mode
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.classList.toggle('menu-open', !mobileMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo-container" onClick={() => setMobileMenuOpen(false)}>
          <div className="logo">Rerendet Coffee</div>
        </Link>

        <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          <a href="#features" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Our Coffee
          </a>
          <a href="#coffee-shop" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Shop
          </a>
          <Link to="/blog" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Blog
          </Link>
          <a href="#about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            About
          </a>
          <a href="#contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Contact
          </a>
        </div>

        <div className="nav-actions">
          {/* Theme Toggle Button */}
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          <div className="user-dropdown">
            <button 
              className="user-icon"
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
            >
              {user ? <FaUserCircle /> : <FaUser />}
            </button>
            
            {isDropdownOpen && (
              <ul className="dropdown-menu">
                {user ? (
                  <>
                    <li>
                      <Link to="/account" className="dropdown-link">
                        <FaUserCircle /> My Account
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings" className="dropdown-link">
                        <FaCog /> Settings
                      </Link>
                    </li>
                    <li>
                      <button className="dropdown-link" onClick={logout}>
                        <FaSignOutAlt /> Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/login" className="dropdown-link">
                        <FaSignInAlt /> Login
                      </Link>
                    </li>
                    <li>
                      <Link to="/signup" className="dropdown-link">
                        <FaUserPlus /> Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            )}
          </div>

          <div className="cart-action" onClick={() => setIsCartOpen(true)}>
            <div className="cart-count">{cartCount}</div>
            <FaShoppingBag />
          </div>
        </div>

        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;