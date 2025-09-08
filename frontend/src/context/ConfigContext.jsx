import React, { createContext, useContext } from 'react';

/**
 * Context pour gérer la configuration spécifique à chaque pays
 * Fournit les fonctionnalités activées/désactivées selon le pays :
 * - Visualisation des données (dataviz)
 * - Conformité RGPD
 * - Support multi-langues
 * 
 * La configuration est déterminée par la variable d'environnement VITE_COUNTRY
 * et doit correspondre à la configuration du backend.
 */
const ConfigContext = createContext({
  countryName: '',
  // Accès aux tableaux de bord de visualisation (MSPR1)
  isDatavizEnabled: true,  // Toujours true pour permettre l'accès à la page
  hasDatavizFeature: false,  // Pour vérifier si la fonctionnalité est disponible
  // Accès à l'API technique pour manipuler les données brutes
  isTechnicalApiEnabled: false,
  isRGPDEnabled: false,
  isMultiLanguage: false,
  supportedLanguages: ['en'],
});

/**
 * Hook personnalisé pour accéder à la configuration du pays
 * @returns {Object} Configuration du pays actuel avec les fonctionnalités activées/désactivées
 */
export const useConfig = () => useContext(ConfigContext);

/**
 * Provider qui gère la configuration spécifique au pays
 * Lit VITE_COUNTRY des variables d'environnement et configure les fonctionnalités
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants qui auront accès à la configuration
 */
export function ConfigProvider({ children }) {
  // Configuration des pays supportés (doit correspondre au backend)
  const COUNTRY_CONFIGS = {
    'usa': {
      name: 'United States',
      dataviz_enabled: true,        // ✅ Accès aux tableaux de bord
      technical_api_enabled: true,   // ✅ Accès à l'API technique
      rgpd: false,
      multi_language: true,
      languages: ['en', 'fr'],
      defaultLanguage: 'en'
    },
    'france': {
      name: 'France',
      dataviz_enabled: true,        // ✅ Accès aux tableaux de bord
      technical_api_enabled: false,  // ❌ Pas d'accès à l'API technique
      rgpd: true,
      multi_language: true,
      languages: ['fr', 'en'],
      defaultLanguage: 'fr'
    },
    'switzerland': {
      name: 'Suisse',
      dataviz_enabled: false,       // ❌ Pas de tableaux de bord
      technical_api_enabled: false,  // ❌ Pas d'API technique
      rgpd: false,
      multi_language: true,
      languages: ['fr', 'de', 'it'],
      defaultLanguage: 'fr'
    },
    'italy': {
      name: 'Italie',
      dataviz_enabled: true,        // ✅ Accès aux tableaux de bord
      technical_api_enabled: false,  // ❌ Pas d'accès à l'API technique
      rgpd: true,
      multi_language: true,
      languages: ['it', 'en', 'fr'],
      defaultLanguage: 'it'
    }
  };

  const getCountryName = (country) => {
    const config = COUNTRY_CONFIGS[country?.toLowerCase()];
    if (!config) {
      console.error(`❌ Invalid country: ${country}. Must be one of: ${Object.keys(COUNTRY_CONFIGS).join(', ')}`);
      return country;
    }
    return config.name;
  };

  // Validation des variables requises
  if (!import.meta.env.VITE_COUNTRY) {
    console.error('❌ VITE_COUNTRY is not defined in environment variables');
  }

  const rawCountry = import.meta.env.VITE_COUNTRY;
  const translatedCountry = getCountryName(rawCountry);
  console.log('ConfigContext - Traduction pays:', { rawCountry, translatedCountry });

  // Récupérer la configuration du pays
  const countryConfig = COUNTRY_CONFIGS[rawCountry?.toLowerCase()];
  
  console.log('🌍 Configuration pays trouvée:', countryConfig);

  // Toujours autoriser l'accès aux pages, mais afficher des messages si les fonctionnalités sont désactivées
  const config = {
    countryName: translatedCountry,
    isDatavizEnabled: true,  // Toujours true pour permettre l'accès à la page
    hasDatavizFeature: countryConfig?.dataviz_enabled ?? true,  // Pour vérifier si la fonctionnalité est disponible
    isTechnicalApiEnabled: countryConfig?.technical_api_enabled ?? true,
    isRGPDEnabled: countryConfig?.rgpd ?? false,
    isMultiLanguage: countryConfig?.multi_language ?? false,
    supportedLanguages: countryConfig?.languages ?? ['en'],
    defaultLanguage: countryConfig?.defaultLanguage ?? 'en',
  };

  console.log('🔧 Configuration finale:', config);

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}
