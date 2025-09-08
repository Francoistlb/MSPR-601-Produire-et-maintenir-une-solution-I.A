import React from 'react';
import './Home.css';
import { NavLink } from 'react-router-dom';
import { useConfig } from '../../context';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

const Navigation = () => {
  const { countryName, isDatavizEnabled } = useConfig();
  const { t } = useTranslation();

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="home-title">Analyze IT 2 - {t('dashboard')}</h1>
        <div className="selected-region">
          {t('country')} : {countryName}
        </div>
        
        {/* Bouton de changement de langue temporaire */}
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button 
            onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '25px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {i18n.language === 'fr' ? '🇺🇸 Switch to English' : '🇫🇷 Passer en français'}
          </button>
        </div>
      </header>
      <main className="home-container">
        <div className="card-grid">
          {/* Prédictions toujours visibles car fonctionnalité de base */}
          <NavLink to="/predictions" className={({ isActive }) => `home-card ${isActive ? 'active' : ''}`}>
            <h2>{t('viewPredictions')}</h2>
            <p>{t('viewPredictionsDesc')}</p>
          </NavLink>
          
          {/* Archives et Comparaisons nécessitent la visualisation des données */}
          {isDatavizEnabled && (
            <>
              <NavLink to="/archives" className={({ isActive }) => `home-card ${isActive ? 'active' : ''}`}>
                <h2>{t('viewArchives')}</h2>
                <p>{t('viewArchivesDesc')}</p>
              </NavLink>
              <NavLink to="/comparaisons" className={({ isActive }) => `home-card ${isActive ? 'active' : ''}`}>
                <h2>{t('viewComparisons')}</h2>
                <p>{t('viewComparisonsDesc')}</p>
              </NavLink>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Navigation;
