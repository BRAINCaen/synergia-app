// ==========================================
// shared/themes/ThemePresetContext.jsx
// Context pour gérer le thème global de l'application
// Gaming RPG | Corporate | Startup Tech
// ==========================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../core/firebase.js';
import {
  THEME_PRESETS,
  DEFAULT_THEME,
  getThemeById,
  THEME_LIST
} from './themePresets.js';

// Créer le contexte
const ThemePresetContext = createContext(null);

/**
 * Hook pour utiliser le thème
 */
export const useThemePreset = () => {
  const context = useContext(ThemePresetContext);
  if (!context) {
    console.warn('useThemePreset utilisé hors de ThemePresetProvider');
    return {
      themeId: DEFAULT_THEME,
      theme: THEME_PRESETS[DEFAULT_THEME],
      setTheme: () => {},
      t: (key) => key,
      e: () => '',
      isLoading: false,
      themeList: THEME_LIST
    };
  }
  return context;
};

/**
 * Provider pour le thème global
 */
export const ThemePresetProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);
  const [isChanging, setIsChanging] = useState(false);

  // Charger le thème depuis Firebase au démarrage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // D'abord vérifier le localStorage pour un chargement rapide
        const cachedTheme = localStorage.getItem('synergia_theme_preset');
        if (cachedTheme && THEME_PRESETS[cachedTheme]) {
          setThemeId(cachedTheme);
        }

        // Ensuite charger depuis Firebase
        const settingsRef = doc(db, 'systemSettings', 'themePreset');
        const settingsDoc = await getDoc(settingsRef);

        if (settingsDoc.exists()) {
          const savedTheme = settingsDoc.data().themeId;
          if (savedTheme && THEME_PRESETS[savedTheme]) {
            setThemeId(savedTheme);
            localStorage.setItem('synergia_theme_preset', savedTheme);
          }
        } else {
          // Créer le document avec le thème par défaut
          await setDoc(settingsRef, {
            themeId: DEFAULT_THEME,
            updatedAt: new Date()
          });
        }
      } catch (error) {
        console.error('Erreur chargement thème:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();

    // Écouter les changements en temps réel
    const unsubscribe = onSnapshot(
      doc(db, 'systemSettings', 'themePreset'),
      (doc) => {
        if (doc.exists()) {
          const newTheme = doc.data().themeId;
          if (newTheme && THEME_PRESETS[newTheme] && newTheme !== themeId) {
            setThemeId(newTheme);
            localStorage.setItem('synergia_theme_preset', newTheme);
          }
        }
      },
      (error) => {
        console.error('Erreur écoute thème:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Changer le thème
  const setTheme = useCallback(async (newThemeId) => {
    if (!THEME_PRESETS[newThemeId] || newThemeId === themeId) return;

    setIsChanging(true);
    try {
      // Mettre à jour localement immédiatement
      setThemeId(newThemeId);
      localStorage.setItem('synergia_theme_preset', newThemeId);

      // Sauvegarder dans Firebase
      const settingsRef = doc(db, 'systemSettings', 'themePreset');
      await setDoc(settingsRef, {
        themeId: newThemeId,
        updatedAt: new Date()
      });

      console.log('Thème changé:', newThemeId);
    } catch (error) {
      console.error('Erreur changement thème:', error);
      // Revenir à l'ancien thème en cas d'erreur
      const cachedTheme = localStorage.getItem('synergia_theme_preset');
      if (cachedTheme) setThemeId(cachedTheme);
    } finally {
      setIsChanging(false);
    }
  }, [themeId]);

  // Récupérer le thème actuel
  const theme = getThemeById(themeId);

  // Helper pour traduire (t = translate)
  const t = useCallback((key) => {
    return theme.vocabulary[key] || key;
  }, [theme]);

  // Helper pour les emojis (e = emoji)
  const e = useCallback((key) => {
    return theme.emojis[key] || '';
  }, [theme]);

  // Valeur du contexte
  const value = {
    themeId,
    theme,
    setTheme,
    t,
    e,
    isLoading,
    isChanging,
    themeList: THEME_LIST,
    // Helpers additionnels
    isGaming: themeId === 'gaming',
    isCorporate: themeId === 'corporate',
    isStartup: themeId === 'startup'
  };

  return (
    <ThemePresetContext.Provider value={value}>
      {children}
    </ThemePresetContext.Provider>
  );
};

export default ThemePresetProvider;
