import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AccessibilityContext, useAuth, useConfig } from '../../context';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const { darkMode } = useContext(AccessibilityContext);
  const { logout, user } = useAuth();
  const { countryName, isDatavizEnabled, supportedLanguages, isMultiLanguage } = useConfig();
  const { t } = useTranslation();

  console.log('Header - Configuration pays:', {
    countryName,
    isDatavizEnabled,
    supportedLanguages,
    isMultiLanguage,
    rawCountry: import.meta.env.VITE_COUNTRY
  });

  // Configuration des langues avec drapeaux et noms
  const languageOptions = {
    'en': { flag: '🇺🇸', name: 'English' },
    'fr': { flag: '🇫🇷', name: 'Français' },
    'de': { flag: '🇩🇪', name: 'Deutsch' },
    'it': { flag: '🇮🇹', name: 'Italiano' }
  };

  // Fonction pour changer de langue
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
    setIsLanguageMenuOpen(false);
  };

  // Fonction pour obtenir les langues disponibles selon le pays
  const getAvailableLanguages = () => {
    if (isMultiLanguage) {
      return supportedLanguages;
    }
    return [i18n.language]; // Seulement la langue actuelle si pas multilingue
  };

  return (
    <header className={`modern-header ${darkMode ? 'dark' : ''}`} role="banner">
      <div className="header-container">
        <div className="header-logo">
          <span className="logo-text">{t('Analyze IT 2')}</span>
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
          aria-label={t('Navigation principale')}
        >
          {/* Prédictions toujours disponibles */}
          <NavLink 
            to="/predictions" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('Prédictions')}
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
          
          {/* Sélecteur de langue */}
          <div className="language-switcher">
            {isMultiLanguage ? (
              // Menu déroulant pour les pays multilingues (Suisse)
              <div className="language-dropdown">
                <button 
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className="language-btn"
                  aria-label={t('Changer de langue')}
                  aria-expanded={isLanguageMenuOpen}
                >
                  {languageOptions[i18n.language]?.flag} {languageOptions[i18n.language]?.name}
                  <span className="dropdown-arrow">▼</span>
                </button>
                {isLanguageMenuOpen && (
                  <div className="language-menu">
                    {getAvailableLanguages().map((lang) => (
                      <button
                        key={lang}
                        onClick={() => changeLanguage(lang)}
                        className={`language-option ${i18n.language === lang ? 'active' : ''}`}
                        aria-label={`Changer vers ${languageOptions[lang]?.name}`}
                      >
                        {languageOptions[lang]?.flag} {languageOptions[lang]?.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Bouton simple pour les pays monolingues
              <div className="language-single">
                <span className="current-language">
                  {languageOptions[i18n.language]?.flag} {languageOptions[i18n.language]?.name}
                </span>
              </div>
            )}
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
