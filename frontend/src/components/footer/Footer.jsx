import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AccessibilityContext } from '../../context';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { increaseFont, decreaseFont, resetFont, darkMode, toggleDarkMode } = useContext(AccessibilityContext);
  const { t } = useTranslation();
  
  return (
    <footer className={`modern-footer ${darkMode ? 'dark' : ''}`} role="contentinfo">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-info">
            <div className="footer-brand">Analyze IT 2 - Tableau de bord</div>
            <div>Projet MSPR-502 &copy; {new Date().getFullYear()}</div>
            <div className="footer-links">
              <Link to="/aide" className="footer-link">{t('Aide')}</Link>
              <Link to="/accessibilite" className="footer-link">{t('Accessibilité')}</Link>
              <a href="mailto:support@analyzit.org" className="footer-link">Contact</a>
            </div>
          </div>
          
          <div className="accessibility-controls">
            <div className="controls-group">
              <button 
                onClick={decreaseFont} 
                aria-label="Réduire la taille du texte" 
                className="control-btn"
                title="Réduire la taille du texte"
              >
                A-
              </button>
              <button 
                onClick={resetFont} 
                aria-label="Taille normale du texte" 
                className="control-btn"
                title="Taille normale du texte"
              >
                A
              </button>
              <button 
                onClick={increaseFont} 
                aria-label="Agrandir la taille du texte" 
                className="control-btn"
                title="Agrandir la taille du texte"
              >
                A+
              </button>
            </div>
            <button 
              onClick={toggleDarkMode} 
              aria-pressed={darkMode}
              aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
              className={`control-btn toggle-btn ${darkMode ? 'active' : ''}`}
              title={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
            >
              {darkMode ? '☀️ Mode clair' : '🌙 Mode sombre'}
            </button>
          </div>
        </div>
        
        <div className="footer-bottom">
          Conforme aux standards WCAG 2.1 AA
        </div>
      </div>
    </footer>
  );
};

export default Footer; 