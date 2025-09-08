import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import it from "./locales/it.json";

// Fonction pour détecter la langue par défaut selon le pays
const getDefaultLanguage = () => {
  const country = import.meta.env.VITE_COUNTRY?.toLowerCase();
  const countryLanguageMap = {
    'usa': 'en',
    'france': 'fr',
    'switzerland': 'fr', // Suisse par défaut en français
    'italy': 'it'
  };
  
  return countryLanguageMap[country] || 'fr';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it },
    },
    lng: (localStorage.getItem("lang") || getDefaultLanguage()),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
