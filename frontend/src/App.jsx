import React, { useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Accessibility from './pages/Accessibility/Accessibility';
import Help from './pages/Help/Help';
import Footer from './components/footer/Footer';
import BackToTop from './components/BackToTop';
import Header from './components/header/Header';
import Navigation from './pages/Navigation/Navigation';
import Predictions from './pages/Predictions/Predictions';
import Archives from './pages/Archives/Archives';
import Comparaisons from './pages/Comparaison/Comparaisons';
import LoginRegister from './pages/Auth/LoginRegister';

import { AccessibilityProvider, AccessibilityContext, AuthProvider, useAuth, ConfigProvider, useConfig } from './context';

/**
 * Composant de routage principal de l'application
 * Gère :
 * - L'authentification (redirection vers /login si non authentifié)
 * - L'accessibilité (taille de police et mode sombre)
 * - Les routes conditionnelles selon la configuration du pays
 */
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();
  const { fontSize, darkMode } = useContext(AccessibilityContext);
  const { isDatavizEnabled } = useConfig();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <LoginRegister />;
  }

  return (
    <div style={{ 
      fontSize: `${fontSize}px`, 
      background: darkMode ? '#181818' : '#f5f5f5',
      color: darkMode ? '#fff' : '#222', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Navigation />} />
          
          {/* Les prédictions sont toujours disponibles */}
          <Route path="/predictions" element={<Predictions />} />
          
          {/* La visualisation des données dépend de isDatavizEnabled */}
          {isDatavizEnabled && (
            <>
              <Route path="/archives" element={<Archives />} />
              <Route path="/comparaisons" element={<Comparaisons />} />
            </>
          )}
          
          <Route path="/accessibilite" element={<Accessibility />} />
          <Route path="/aide" element={<Help />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BackToTop />
      <Footer />
    </div>
  );
}

/**
 * Point d'entrée de l'application
 * Configure les providers nécessaires dans l'ordre suivant :
 * 1. AuthProvider - Gestion de l'authentification
 * 2. AccessibilityProvider - Paramètres d'accessibilité
 * 3. ConfigProvider - Configuration spécifique au pays
 * 4. BrowserRouter - Routage React
 */
function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <ConfigProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ConfigProvider>
      </AccessibilityProvider>
    </AuthProvider>
  );
}

export default App;
