import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context';

const Navigation = () => {
  const { selectedCountry } = useAuth();
  
  const getCountryName = (code) => {
    const countries = {
      'FR': 'France',
      'CH': 'Suisse', 
      'US': 'États-Unis'
    };
    return countries[code] || 'Région sélectionnée';
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="home-title">Analyze IT 2 - Tableau de bord</h1>
        {selectedCountry && (
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            Région : {getCountryName(selectedCountry)}
          </p>
        )}
      </header>
      <main className="home-container">
        <div className="card-grid">
          <Link to="/predictions" className="home-card">
            <h2>Voir les prédictions</h2>
            <p>Consultez les prédictions générées par le modèle.</p>
          </Link>
          <Link to="/archives" className="home-card">
            <h2>Voir les données archives</h2>
            <p>Accédez à l'historique des données archivées.</p>
          </Link>
          <Link to="/comparaisons" className="home-card">
            <h2>Voir les comparaisons</h2>
            <p>Comparez les différentes données et prédictions.</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Navigation;
