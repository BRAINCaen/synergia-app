// Configuration globale de l'application
export const APP_CONFIG = {
  name: 'Synergia',
  version: '2.0.0',
  environment: import.meta.env.MODE,
  apiUrl: import.meta.env.VITE_API_URL || '',
  
  // Firebase config (utilise les variables d'environnement existantes)
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  }
}

// Routes de l'application
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings'
}

// Configuration des thèmes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
}

// Configuration de la PWA
export const PWA_CONFIG = {
  enableNotifications: true,
  enableOfflineMode: true,
  cacheVersion: '2.0.0'
}
