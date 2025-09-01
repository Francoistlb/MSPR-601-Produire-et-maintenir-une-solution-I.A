import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AccessibilityContext, useAuth, useConfig } from '../../context';
import { useTranslation } from 'react-i18next';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { darkMode } = useContext(AccessibilityContext);
  const { logout, user } = useAuth();
  const { countryName, isDatavizEnabled } = useConfig();
  const { t, i18n } = useTranslation();

  console.log('Header - Configuration pays:', {
    countryName,
    isDatavizEnabled,
    rawCountry: import.meta.env.VITE_COUNTRY
  });

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
          {/* Prédictions toujours disponibles */}
          <NavLink 
            to="/predictions" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('predictions')}
          </NavLink>

          {/* Visualisation des données selon le pays */}
          {isDatavizEnabled && (
            <>
              <NavLink 
                to="/archives" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('archives')}
              </NavLink>
              <NavLink 
                to="/comparaisons" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('comparisons')}
              </NavLink>
            </>
          )}
          <NavLink 
            to="/accessibilite" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('accessibility')}
          </NavLink>
        </nav>

        <div className="header-user-info">
          <div className="user-details">
            <span className="user-name">
              {user?.username || user?.email}
            </span>
            <span className="user-country">
              {t('country')} : {countryName}
            </span>
          </div>
          
          {/* Bouton de changement de langue */}
          <div className="language-switcher">
            <button 
              onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
              className="language-btn"
              aria-label={i18n.language === 'fr' ? 'Switch to English' : 'Passer en français'}
            >
              {i18n.language === 'fr' ? '🇺🇸 EN' : '🇫🇷 FR'}
            </button>
          </div>
          
          <button 
            onClick={logout}
            className="logout-btn"
            aria-label={t('logout')}
          >
            {t('logout')}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
