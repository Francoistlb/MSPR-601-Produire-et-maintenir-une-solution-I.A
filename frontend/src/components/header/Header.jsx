import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AccessibilityContext } from '../../context';
import { useAuth } from '../../context';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { darkMode } = useContext(AccessibilityContext);
  const { logout, user, selectedCountry } = useAuth();

  const isActive = (path) => location.pathname === path;

  const getCountryName = (code) => {
    const countries = {
      'FR': 'France',
      'CH': 'Suisse', 
      'US': 'États-Unis'
    };
    return countries[code] || 'Région';
  };

  return (
    <header className={`modern-header ${darkMode ? 'dark' : ''}`} role="banner">
      <div className="header-container">
        <div className="header-logo">
          <span className="logo-text">Analyze IT 2</span>
        </div>
        
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="main-navigation"
          aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>

        <nav 
          id="main-navigation" 
          className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}
          role="navigation"
          aria-label="Navigation principale"
        >
          <Link 
            to="/predictions" 
            className={`nav-link ${isActive('/predictions') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-current={isActive('/predictions') ? 'page' : undefined}
          >
            Prédictions
          </Link>
          <Link 
            to="/archives" 
            className={`nav-link ${isActive('/archives') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-current={isActive('/archives') ? 'page' : undefined}
          >
            Archives
          </Link>
          <Link 
            to="/comparaisons" 
            className={`nav-link ${isActive('/comparaisons') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-current={isActive('/comparaisons') ? 'page' : undefined}
          >
            Comparaisons
          </Link>
          <Link 
            to="/accessibilite" 
            className={`nav-link ${isActive('/accessibilite') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-current={isActive('/accessibilite') ? 'page' : undefined}
          >
            Accessibilité
          </Link>
        </nav>

        <div className="header-user-info">
          {selectedCountry && (
            <span className="user-country" style={{ marginRight: '1rem', color: darkMode ? '#fff' : '#666' }}>
              {getCountryName(selectedCountry)}
            </span>
          )}
          <span className="user-email" style={{ marginRight: '1rem', color: darkMode ? '#fff' : '#666' }}>
            {user?.email}
          </span>
          <button 
            onClick={logout}
            className="logout-btn"
            style={{
              background: 'none',
              border: '1px solid currentColor',
              color: darkMode ? '#fff' : '#666',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
