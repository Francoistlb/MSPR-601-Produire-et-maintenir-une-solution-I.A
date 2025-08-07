import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser, logoutUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedCountry = localStorage.getItem('selectedCountry');
      
      if (token) {
        try {
          // Vérifier si le token est encore valide en récupérant les infos utilisateur
          const userData = await getCurrentUser();
          setUser(userData);
          console.log('🔐 User authenticated from stored token:', userData);
        } catch (error) {
          console.log('🔐 Stored token invalid, clearing auth data:', error);
          // Token invalide, nettoyer les données
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('selectedCountry');
        }
      }
      
      if (savedCountry) {
        setSelectedCountry(savedCountry);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const loginData = await loginUser(email, password);
      
      // Stocker le token
      localStorage.setItem('token', loginData.access_token);
      
      // Récupérer les données utilisateur avec le token
      const userData = await getCurrentUser();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('🔐 Login successful, user data:', userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('🔐 Login failed:', error);
      return { success: false, error: error.message || 'Erreur de connexion' };
    }
  };

  const register = async (email, password, username = null) => {
    try {
      // Utiliser l'email comme username si aucun username n'est fourni
      const finalUsername = username || email.split('@')[0];
      
      console.log('📝 Attempting registration for:', email);
      const userData = await registerUser(finalUsername, email, password);
      
      console.log('📝 Registration successful:', userData);
      return { success: true, user: userData, message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' };
    } catch (error) {
      console.error('📝 Registration failed:', error);
      return { success: false, error: error.message || 'Erreur lors de l\'inscription' };
    }
  };

  const logout = async () => {
    try {
      // Appeler l'endpoint de logout du backend
      await logoutUser();
      console.log('🚪 Logout successful');
    } catch (error) {
      console.error('🚪 Logout error (continuing anyway):', error);
      // Continuer même si l'appel au backend échoue
    } finally {
      // Nettoyer les données locales dans tous les cas
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedCountry');
      setUser(null);
      setSelectedCountry(null);
      console.log('🚪 Local auth data cleared');
    }
  };

  const selectCountry = (country) => {
    localStorage.setItem('selectedCountry', country);
    setSelectedCountry(country);
    console.log('🌍 Country selected:', country);
  };

  const value = {
    user,
    selectedCountry,
    loading,
    login,
    register,
    logout,
    selectCountry,
    isAuthenticated: !!user,
    hasSelectedCountry: !!selectedCountry
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
