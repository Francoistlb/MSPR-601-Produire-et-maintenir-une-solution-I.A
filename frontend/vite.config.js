import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Récupère et valide les variables d'environnement nécessaires
 * Variables requises :
 * - COUNTRY : Code du pays (usa, france, switzerland)
 * - ENV : Environnement (development, production)
 * @returns {Object} Variables d'environnement validées et formatées
 * @throws {Error} Si COUNTRY n'est pas défini
 */
const getEnvVars = () => {
  // Validation des variables requises
  // Utiliser "usa" par défaut si COUNTRY n'est pas défini
  const country = process.env.COUNTRY || 'usa';

  // env du pays
  const env = {
    VITE_COUNTRY: country.toLowerCase(),
    VITE_ENV: process.env.ENV || 'development'
  };

  // Log pour debug
  console.log('🌍 Variables d\'environnement brutes:');
  console.log('COUNTRY:', process.env.COUNTRY);
  console.log('ENV:', process.env.ENV);

  return env;
};

/**
 * Configuration Vite pour le projet
 * Gère :
 * - Les variables d'environnement pour la configuration par pays
 * - Le proxy API pour le développement
 * - La configuration de build pour React
 * @see https://vitejs.dev/config/
 */
export default defineConfig(({ mode }) => {
  const envVars = getEnvVars();
  console.log('🔍 Variables d\'environnement détectées:', envVars);
  
  console.log('='.repeat(50));
  console.log(`🌍 Configuration pays: ${process.env.COUNTRY || 'non défini'}`);
  console.log('Variables d\'environnement qui seront injectées:', envVars);
  console.log('='.repeat(50));
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true
        }
      }
    },
    define: {
      // Définir le pays choisi par l'utilisateur
      'import.meta.env.VITE_COUNTRY': JSON.stringify(envVars.VITE_COUNTRY),
      'import.meta.env.VITE_ENV': JSON.stringify(envVars.VITE_ENV)
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
  };
}); 