// ==========================================
// HOOK USEYSTEMSETTINGS
// Synchronisation temps réel des paramètres système
// ==========================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../core/firebase.js';

/**
 * Hook pour charger et écouter les paramètres système en temps réel
 * Utilisé pour synchroniser le menu avec les modules activés/désactivés
 */
const useSystemSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Écoute en temps réel des paramètres système
  useEffect(() => {
    const settingsRef = doc(db, 'systemSettings', 'main');

    const unsubscribe = onSnapshot(
      settingsRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setSettings(docSnapshot.data());
          console.log('⚙️ [SETTINGS] Paramètres système chargés');
        } else {
          // Paramètres par défaut si non existants
          setSettings(getDefaultSettings());
          console.log('⚙️ [SETTINGS] Paramètres par défaut utilisés');
        }
        setLoading(false);
      },
      (err) => {
        console.error('❌ [SETTINGS] Erreur chargement paramètres:', err);
        setError(err);
        setSettings(getDefaultSettings());
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /**
   * Vérifie si un module est activé
   * @param {string} moduleId - ID du module (gamification, skills, rewards, etc.)
   * @returns {boolean} - true si le module est activé
   */
  const isModuleEnabled = useCallback((moduleId) => {
    if (!settings) return true; // Par défaut, tout est activé si pas de settings

    // Mapping des modules vers leurs clés dans les settings
    const moduleMapping = {
      gamification: 'gamification',
      skills: 'skills',
      rewards: 'rewards',
      customization: 'customization',
      mentoring: 'mentoring',
      pulse: 'pulse',
      hr: 'hr',
      planning: 'planning',
      challenges: 'challenges',
      boosts: 'boosts',
      ranks: 'ranks',
      checkpoints: 'checkpoints',
      geofencing: 'geofencing'
    };

    const settingsKey = moduleMapping[moduleId] || moduleId;

    // Vérifier si le module existe et s'il est activé
    if (settings[settingsKey] && typeof settings[settingsKey].enabled !== 'undefined') {
      return settings[settingsKey].enabled;
    }

    return true; // Par défaut activé si non spécifié
  }, [settings]);

  /**
   * Récupère les paramètres d'un module spécifique
   * @param {string} moduleId - ID du module
   * @returns {object|null} - Paramètres du module
   */
  const getModuleSettings = useCallback((moduleId) => {
    if (!settings) return null;
    return settings[moduleId] || null;
  }, [settings]);

  /**
   * Récupère une valeur de paramètre spécifique
   * @param {string} path - Chemin du paramètre (ex: "gamification.xpMultiplier")
   * @param {*} defaultValue - Valeur par défaut si non trouvé
   * @returns {*} - Valeur du paramètre
   */
  const getSetting = useCallback((path, defaultValue = null) => {
    if (!settings) return defaultValue;

    const keys = path.split('.');
    let value = settings;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value;
  }, [settings]);

  // Liste des modules activés (memoized)
  const enabledModules = useMemo(() => {
    if (!settings) return [];

    const modules = [
      'gamification', 'skills', 'rewards', 'customization',
      'mentoring', 'pulse', 'hr', 'planning', 'challenges',
      'boosts', 'ranks', 'checkpoints'
    ];

    return modules.filter(moduleId => isModuleEnabled(moduleId));
  }, [settings, isModuleEnabled]);

  return {
    settings,
    loading,
    error,
    isModuleEnabled,
    getModuleSettings,
    getSetting,
    enabledModules
  };
};

/**
 * Paramètres par défaut si Firestore n'est pas accessible
 */
const getDefaultSettings = () => ({
  app: {
    name: 'Synergia',
    version: '5.0',
    maintenanceMode: false
  },
  gamification: { enabled: true },
  skills: { enabled: true },
  rewards: { enabled: true },
  customization: { enabled: true },
  mentoring: { enabled: true },
  pulse: { enabled: true },
  hr: { enabled: true },
  planning: { enabled: true },
  challenges: { enabled: true },
  boosts: { enabled: true },
  ranks: { enabled: true },
  checkpoints: { enabled: true },
  geofencing: { enabled: false }
});

export default useSystemSettings;
