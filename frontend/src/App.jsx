import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import CountrySelector from './pages/CountrySelector/CountrySelector';
import { AccessibilityProvider, AccessibilityContext, AuthProvider, useAuth } from './context';

function ProtectedRoutes() {
  const { isAuthenticated, hasSelectedCountry, loading } = useAuth();
  const { fontSize, darkMode } = useContext(AccessibilityContext);
  const location = useLocation();
  
  // Pages qui n'ont pas de header/footer
  const authPages = ['/', '/login', '/country-selector'];
  const isAuthPage = authPages.includes(location.pathname);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: `${fontSize}px`
      }}>
        Chargement...
      </div>
    );
  }

  // Si pas connecté, afficher la page de login
  if (!isAuthenticated) {
    return <LoginRegister />;
  }

  // Si connecté mais pas de pays sélectionné, afficher le sélecteur de pays
  if (!hasSelectedCountry) {
    return <CountrySelector />;
  }

  // Si tout est OK, afficher l'app normale
  return (
    <div style={{ 
      fontSize: `${fontSize}px`, 
      background: isAuthPage ? 'transparent' : (darkMode ? '#181818' : '#f5f5f5'), 
      color: darkMode ? '#fff' : '#222', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {!isAuthPage && <Header />}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Navigation />} />
          <Route path="/navigation" element={<Navigation />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="/comparaisons" element={<Comparaisons />} />
          <Route path="/accessibilite" element={<Accessibility />} />
          <Route path="/aide" element={<Help />} />
        </Routes>
      </main>
      {!isAuthPage && <BackToTop />}
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <BrowserRouter>
          <ProtectedRoutes />
        </BrowserRouter>
      </AccessibilityProvider>
    </AuthProvider>
  );
}

export default App;
