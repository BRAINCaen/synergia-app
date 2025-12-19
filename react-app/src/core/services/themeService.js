// ==========================================
// react-app/src/core/services/themeService.js
// SERVICE THEME - SYNERGIA v4.0
// Module 16: Mode Sombre/Clair
// ==========================================

import { doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';

// ==========================================
// CONSTANTES DE THEME
// ==========================================
export const THEMES = {
  dark: 'dark',
  light: 'light',
  system: 'system'
};

export const THEME_COLORS = {
  dark: {
    id: 'dark',
    name: 'Sombre',
    emoji: '🌙',
    description: 'Theme sombre pour reduire la fatigue oculaire',
    background: 'from-slate-900 via-purple-900 to-slate-900',
    surface: 'bg-gray-800/50',
    surfaceHover: 'hover:bg-gray-700/50',
    border: 'border-gray-700/50',
    text: 'text-white',
    textMuted: 'text-gray-400',
    accent: 'purple'
  },
  light: {
    id: 'light',
    name: 'Clair',
    emoji: '☀️',
    description: 'Theme clair classique',
    background: 'from-gray-50 via-purple-50 to-gray-50',
    surface: 'bg-white/80',
    surfaceHover: 'hover:bg-gray-100/80',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    accent: 'purple'
  },
  system: {
    id: 'system',
    name: 'Systeme',
    emoji: '💻',
    description: 'Suivre les preferences du systeme'
  }
};

// ==========================================
// SERVICE THEME
// ==========================================
class ThemeService {
  constructor() {
    this.currentTheme = THEMES.dark;
    this.listeners = new Set();
    this.mediaQuery = null;

    // Detecter le theme systeme
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    }
  }

  /**
   * Obtenir le theme effectif (resout 'system' en dark/light)
   */
  getEffectiveTheme(theme) {
    if (theme === THEMES.system) {
      if (this.mediaQuery) {
        return this.mediaQuery.matches ? THEMES.dark : THEMES.light;
      }
      return THEMES.dark; // Defaut si pas de mediaQuery
    }
    return theme;
  }

  /**
   * Obtenir les classes CSS pour le theme
   */
  getThemeClasses(theme) {
    const effectiveTheme = this.getEffectiveTheme(theme);
    return THEME_COLORS[effectiveTheme] || THEME_COLORS.dark;
  }

  /**
   * Appliquer le theme au document
   */
  applyTheme(theme) {
    if (typeof document === 'undefined') return;

    const effectiveTheme = this.getEffectiveTheme(theme);
    const root = document.documentElement;

    // Ajouter/retirer classe dark sur html
    if (effectiveTheme === THEMES.dark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Stocker dans localStorage pour persistance
    localStorage.setItem('synergia-theme', theme);

    this.currentTheme = theme;
    this.notifyListeners(theme);
  }

  /**
   * Charger le theme depuis localStorage ou Firebase
   */
  async loadTheme(userId = null) {
    // D'abord verifier localStorage
    const localTheme = localStorage.getItem('synergia-theme');

    if (localTheme && Object.values(THEMES).includes(localTheme)) {
      this.applyTheme(localTheme);
      return localTheme;
    }

    // Si connecte, charger depuis Firebase
    if (userId) {
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const theme = userDoc.data()?.preferences?.interface?.theme || THEMES.dark;
          this.applyTheme(theme);
          return theme;
        }
      } catch (error) {
        console.error('Erreur chargement theme:', error);
      }
    }

    // Defaut: dark
    this.applyTheme(THEMES.dark);
    return THEMES.dark;
  }

  /**
   * Sauvegarder le theme dans Firebase
   */
  async saveTheme(userId, theme) {
    if (!userId) {
      this.applyTheme(theme);
      return { success: true };
    }

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'preferences.interface.theme': theme,
        updatedAt: new Date()
      });

      this.applyTheme(theme);
      return { success: true };
    } catch (error) {
      console.error('Erreur sauvegarde theme:', error);
      // Appliquer quand meme localement
      this.applyTheme(theme);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle entre dark et light
   */
  toggleTheme(userId = null) {
    const effectiveTheme = this.getEffectiveTheme(this.currentTheme);
    const newTheme = effectiveTheme === THEMES.dark ? THEMES.light : THEMES.dark;
    return this.saveTheme(userId, newTheme);
  }

  /**
   * S'abonner aux changements de theme
   */
  subscribe(callback) {
    this.listeners.add(callback);

    // Retourner fonction de desinscription
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notifier les listeners
   */
  notifyListeners(theme) {
    this.listeners.forEach(callback => {
      try {
        callback(theme);
      } catch (error) {
        console.error('Erreur listener theme:', error);
      }
    });
  }

  /**
   * Ecouter les changements de theme systeme
   */
  listenToSystemTheme(callback) {
    if (!this.mediaQuery) return () => {};

    const handler = (e) => {
      if (this.currentTheme === THEMES.system) {
        callback(e.matches ? THEMES.dark : THEMES.light);
      }
    };

    this.mediaQuery.addEventListener('change', handler);

    return () => {
      this.mediaQuery.removeEventListener('change', handler);
    };
  }

  /**
   * S'abonner aux changements depuis Firebase
   */
  subscribeToUserTheme(userId, callback) {
    if (!userId) return () => {};

    const userRef = doc(db, 'users', userId);

    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const theme = doc.data()?.preferences?.interface?.theme || THEMES.dark;
        if (theme !== this.currentTheme) {
          this.applyTheme(theme);
          callback(theme);
        }
      }
    });
  }
}

// Export instance singleton
export const themeService = new ThemeService();
export default themeService;
