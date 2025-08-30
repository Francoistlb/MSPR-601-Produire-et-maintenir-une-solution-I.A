import React from 'react';
import './Home.css';
import { NavLink } from 'react-router-dom';
import { useConfig } from '../../context';

const Navigation = () => {
  const { countryName, isDatavizEnabled } = useConfig();

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="home-title">Analyze IT 2 - Tableau de bord</h1>
        <div className="selected-region">
          Pays : {countryName}
        </div>
      </header>
      <main className="home-container">
        <div className="card-grid">
          {/* Prédictions toujours visibles car fonctionnalité de base */}
          <NavLink to="/predictions" className={({ isActive }) => `home-card ${isActive ? 'active' : ''}`}>
            <h2>Voir les prédictions</h2>
            <p>Consultez les prédictions générées par le modèle.</p>
          </NavLink>
          
          {/* Archives et Comparaisons nécessitent la visualisation des données */}
          {isDatavizEnabled && (
            <>
              <NavLink to="/archives" className={({ isActive }) => `home-card ${isActive ? 'active' : ''}`}>
                <h2>Voir les données archives</h2>
                <p>Accédez à l'historique des données archivées.</p>
              </NavLink>
              <NavLink to="/comparaisons" className={({ isActive }) => `home-card ${isActive ? 'active' : ''}`}>
                <h2>Voir les comparaisons</h2>
                <p>Comparez les différentes données et prédictions.</p>
              </NavLink>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Navigation;
