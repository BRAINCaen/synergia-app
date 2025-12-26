// ==========================================
// react-app/src/shared/providers/CelebrationProvider.jsx
// PROVIDER GLOBAL POUR LES CÉLÉBRATIONS
// ==========================================

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  Confetti,
  Sparkles,
  Fireworks,
  XPGainPopup,
  LevelUpCelebration,
  BadgeUnlockCelebration
} from '../../components/effects/CelebrationEffects';

// Création du contexte
const CelebrationContext = createContext(null);

/**
 * Provider pour les célébrations
 */
export const CelebrationProvider = ({ children }) => {
  // États des effets
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiConfig, setConfettiConfig] = useState({});

  const [sparklesActive, setSparklesActive] = useState(false);
  const [sparklesConfig, setSparklesConfig] = useState({});

  const [fireworksActive, setFireworksActive] = useState(false);
  const [fireworksConfig, setFireworksConfig] = useState({});

  const [levelUpVisible, setLevelUpVisible] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);

  const [badgeUnlockVisible, setBadgeUnlockVisible] = useState(false);
  const [badgeData, setBadgeData] = useState(null);

  const [xpPopups, setXpPopups] = useState([]);
  const popupIdRef = useRef(0);

  // ==========================================
  // FONCTIONS DE DÉCLENCHEMENT
  // ==========================================

  /**
   * Déclencher des confettis
   */
  const triggerConfetti = useCallback((config = {}) => {
    setConfettiConfig({
      duration: 3000,
      particleCount: 100,
      ...config
    });
    setConfettiActive(true);

    setTimeout(() => {
      setConfettiActive(false);
    }, config.duration || 3000);
  }, []);

  /**
   * Déclencher des sparkles
   */
  const triggerSparkles = useCallback((config = {}) => {
    setSparklesConfig({
      duration: 2000,
      count: 30,
      ...config
    });
    setSparklesActive(true);

    setTimeout(() => {
      setSparklesActive(false);
    }, config.duration || 2000);
  }, []);

  /**
   * Déclencher des feux d'artifice
   */
  const triggerFireworks = useCallback((config = {}) => {
    setFireworksConfig({
      duration: 2500,
      burstCount: 3,
      ...config
    });
    setFireworksActive(true);

    setTimeout(() => {
      setFireworksActive(false);
    }, config.duration || 2500);
  }, []);

  /**
   * Afficher la célébration de level up
   */
  const showLevelUp = useCallback((newLevel, duration = 4000) => {
    setLevelUpData({ newLevel });
    setLevelUpVisible(true);
    triggerConfetti({ duration: duration, particleCount: 150 });

    setTimeout(() => {
      setLevelUpVisible(false);
      setLevelUpData(null);
    }, duration);
  }, [triggerConfetti]);

  /**
   * Afficher la célébration de badge
   */
  const showBadgeUnlock = useCallback((badge, duration = 4000) => {
    setBadgeData(badge);
    setBadgeUnlockVisible(true);
    triggerSparkles({ duration: duration, count: 50 });

    setTimeout(() => {
      setBadgeUnlockVisible(false);
      setBadgeData(null);
    }, duration);
  }, [triggerSparkles]);

  /**
   * Afficher un popup de gain d'XP
   */
  const showXpGain = useCallback((amount, position = { x: '50%', y: '50%' }) => {
    const id = ++popupIdRef.current;

    setXpPopups(prev => [...prev, { id, amount, position, visible: true }]);

    // Petit effet sparkles pour les gros gains
    if (amount >= 50) {
      triggerSparkles({ duration: 1000, count: 15 });
    }

    setTimeout(() => {
      setXpPopups(prev => prev.filter(p => p.id !== id));
    }, 1500);
  }, [triggerSparkles]);

  /**
   * Grande célébration (combinaison de tout)
   */
  const celebrate = useCallback((type = 'normal') => {
    switch (type) {
      case 'epic':
        triggerConfetti({ particleCount: 200, duration: 5000 });
        triggerFireworks({ burstCount: 5, duration: 4000 });
        triggerSparkles({ count: 50, duration: 3000 });
        break;
      case 'legendary':
        triggerConfetti({ particleCount: 300, duration: 6000 });
        triggerFireworks({ burstCount: 8, duration: 5000 });
        triggerSparkles({ count: 80, duration: 4000 });
        break;
      case 'small':
        triggerSparkles({ count: 20, duration: 1500 });
        break;
      default:
        triggerConfetti({ particleCount: 100, duration: 3000 });
        triggerSparkles({ count: 30, duration: 2000 });
    }
  }, [triggerConfetti, triggerFireworks, triggerSparkles]);

  // ==========================================
  // FERMETURES MANUELLES
  // ==========================================

  const closeLevelUp = useCallback(() => {
    setLevelUpVisible(false);
    setLevelUpData(null);
  }, []);

  const closeBadgeUnlock = useCallback(() => {
    setBadgeUnlockVisible(false);
    setBadgeData(null);
  }, []);

  // Valeur du contexte
  const value = {
    // Déclencheurs
    triggerConfetti,
    triggerSparkles,
    triggerFireworks,
    showLevelUp,
    showBadgeUnlock,
    showXpGain,
    celebrate,

    // Fermetures
    closeLevelUp,
    closeBadgeUnlock,

    // États (pour debug si nécessaire)
    isConfettiActive: confettiActive,
    isSparklesActive: sparklesActive,
    isFireworksActive: fireworksActive,
    isLevelUpVisible: levelUpVisible,
    isBadgeUnlockVisible: badgeUnlockVisible
  };

  return (
    <CelebrationContext.Provider value={value}>
      {children}

      {/* Effets visuels */}
      <Confetti
        active={confettiActive}
        {...confettiConfig}
      />

      <Sparkles
        active={sparklesActive}
        {...sparklesConfig}
      />

      <Fireworks
        active={fireworksActive}
        {...fireworksConfig}
      />

      {/* Popups XP */}
      {xpPopups.map((popup) => (
        <XPGainPopup
          key={popup.id}
          amount={popup.amount}
          position={popup.position}
          visible={popup.visible}
        />
      ))}

      {/* Level Up */}
      <LevelUpCelebration
        visible={levelUpVisible}
        newLevel={levelUpData?.newLevel}
        onComplete={closeLevelUp}
      />

      {/* Badge Unlock */}
      <BadgeUnlockCelebration
        visible={badgeUnlockVisible}
        badge={badgeData}
        onComplete={closeBadgeUnlock}
      />
    </CelebrationContext.Provider>
  );
};

/**
 * Hook pour utiliser les célébrations
 */
export const useCelebration = () => {
  const context = useContext(CelebrationContext);

  if (!context) {
    throw new Error('useCelebration must be used within a CelebrationProvider');
  }

  return context;
};

export default CelebrationProvider;
