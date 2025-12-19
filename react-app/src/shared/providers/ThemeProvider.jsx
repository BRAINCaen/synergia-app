// ==========================================
// react-app/src/shared/providers/ThemeProvider.jsx
// PROVIDER THEME - SYNERGIA v4.0
// Module 16: Mode Sombre/Clair
// ==========================================

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { themeService, THEMES, THEME_COLORS } from '../../core/services/themeService.js';
import { useAuthStore } from '../stores/authStore.js';

// Context
export const ThemeContext = createContext({
  theme: THEMES.dark,
  effectiveTheme: THEMES.dark,
  themeColors: THEME_COLORS.dark,
  isDark: true,
  isLight: false,
  isSystem: false,
  setTheme: () => {},
  toggleTheme: () => {},
  THEMES,
  THEME_COLORS
});

// Provider
export const ThemeProvider = ({ children }) => {
  const { user } = useAuthStore();
  const [theme, setThemeState] = useState(THEMES.dark);
  const [effectiveTheme, setEffectiveTheme] = useState(THEMES.dark);

  // Charger le theme initial
  useEffect(() => {
    const loadInitialTheme = async () => {
      const savedTheme = await themeService.loadTheme(user?.uid);
      setThemeState(savedTheme);
      setEffectiveTheme(themeService.getEffectiveTheme(savedTheme));
    };

    loadInitialTheme();
  }, [user?.uid]);

  // Ecouter les changements de theme systeme
  useEffect(() => {
    const unsubscribe = themeService.listenToSystemTheme((newEffectiveTheme) => {
      if (theme === THEMES.system) {
        setEffectiveTheme(newEffectiveTheme);
      }
    });

    return unsubscribe;
  }, [theme]);

  // S'abonner aux changements depuis Firebase
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = themeService.subscribeToUserTheme(user.uid, (newTheme) => {
      setThemeState(newTheme);
      setEffectiveTheme(themeService.getEffectiveTheme(newTheme));
    });

    return unsubscribe;
  }, [user?.uid]);

  // Changer le theme
  const setTheme = useCallback(async (newTheme) => {
    await themeService.saveTheme(user?.uid, newTheme);
    setThemeState(newTheme);
    setEffectiveTheme(themeService.getEffectiveTheme(newTheme));
  }, [user?.uid]);

  // Toggle dark/light
  const toggleTheme = useCallback(async () => {
    const currentEffective = themeService.getEffectiveTheme(theme);
    const newTheme = currentEffective === THEMES.dark ? THEMES.light : THEMES.dark;
    await setTheme(newTheme);
  }, [theme, setTheme]);

  // Valeurs calculees
  const value = useMemo(() => ({
    theme,
    effectiveTheme,
    themeColors: THEME_COLORS[effectiveTheme] || THEME_COLORS.dark,
    isDark: effectiveTheme === THEMES.dark,
    isLight: effectiveTheme === THEMES.light,
    isSystem: theme === THEMES.system,
    setTheme,
    toggleTheme,
    THEMES,
    THEME_COLORS
  }), [theme, effectiveTheme, setTheme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
