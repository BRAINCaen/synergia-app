// ==========================================
// 📁 react-app/src/shared/stores/themeStore.js
// STORE DE THÈME - FICHIER MANQUANT POUR BUILD
// ==========================================

import { useState, useEffect } from 'react';

/**
 * 🎨 STORE DE THÈME
 * Gestion du thème sombre/clair de l'application
 */
let themeState = {
  theme: 'light',
  isInitialized: false
};

let themeListeners = [];

const notifyThemeListeners = () => {
  themeListeners.forEach(listener => listener(themeState));
};

const themeActions = {
  initialize: async () => {
    console.log('🎨 Initialisation themeStore...');
    
    // Récupérer le thème depuis localStorage ou système
    const savedTheme = typeof window !== 'undefined' 
      ? localStorage.getItem('synergia-theme') 
      : null;
      
    const systemTheme = typeof window !== 'undefined' && window.matchMedia 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : 'light';
    
    themeState = {
      theme: savedTheme || systemTheme,
      isInitialized: true
    };
    
    notifyThemeListeners();
    console.log('✅ ThemeStore initialisé:', themeState.theme);
  },

  setTheme: (newTheme) => {
    themeState.theme = newTheme;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('synergia-theme', newTheme);
      
      // Appliquer le thème immédiatement
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    notifyThemeListeners();
    console.log('🎨 Thème changé:', newTheme);
  },

  toggleTheme: () => {
    const newTheme = themeState.theme === 'light' ? 'dark' : 'light';
    themeActions.setTheme(newTheme);
  }
};

/**
 * 🎣 HOOK USETHEMESTORE
 */
export const useThemeStore = () => {
  const [state, setState] = useState(themeState);

  useEffect(() => {
    const listener = (newState) => {
      setState({ ...newState });
    };
    
    themeListeners.push(listener);
    
    // Auto-initialisation
    if (!themeState.isInitialized) {
      themeActions.initialize();
    }
    
    return () => {
      themeListeners = themeListeners.filter(l => l !== listener);
    };
  }, []);

  return {
    ...state,
    ...themeActions
  };
};

// Export par défaut pour compatibilité
export default { useThemeStore, themeState, themeActions };
