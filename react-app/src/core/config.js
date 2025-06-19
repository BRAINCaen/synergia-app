// src/core/config.js

export const APP_CONFIG = {
  name: 'Synergia',
  version: '2.0.0',
  description: 'Plateforme de gestion d\'équipe gamifiée',
  
  // Environnement
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // URLs
  baseURL: import.meta.env.VITE_BASE_URL || '/',
  apiURL: import.meta.env.VITE_API_URL || '',
  
  // Firebase
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  },
  
  // Fonctionnalités (feature flags)
  features: {
    gamification: true,
    timeTracking: false, // À activer en Phase 3
    messaging: false,    // À activer en Phase 4
    shop: false,         // À activer en Phase 5
    analytics: false     // À activer en Phase 6
  },
  
  // Thème
  theme: {
    defaultMode: 'dark',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6'
  }
};
