// ==========================================
// react-app/src/shared/hooks/useCelebration.js
// HOOK POUR GÉRER LES CÉLÉBRATIONS
// ==========================================

import { useState, useCallback, useRef } from 'react';

/**
 * Hook pour gérer les différents types de célébrations
 */
export const useCelebration = () => {
  // États pour les différentes célébrations
  const [confettiActive, setConfettiActive] = useState(false);
  const [sparklesActive, setSparklesActive] = useState(false);
  const [fireworksActive, setFireworksActive] = useState(false);
  const [levelUpVisible, setLevelUpVisible] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [badgeUnlockVisible, setBadgeUnlockVisible] = useState(false);
  const [badgeUnlockData, setBadgeUnlockData] = useState(null);
  const [xpPopups, setXpPopups] = useState([]);

  // Ref pour les IDs uniques
  const popupIdRef = useRef(0);

  // ==========================================
  // CONFETTI
  // ==========================================
  const triggerConfetti = useCallback((duration = 3000) => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), duration);
  }, []);

  // ==========================================
  // SPARKLES
  // ==========================================
  const triggerSparkles = useCallback((duration = 2000) => {
    setSparklesActive(true);
    setTimeout(() => setSparklesActive(false), duration);
  }, []);

  // ==========================================
  // FIREWORKS
  // ==========================================
  const triggerFireworks = useCallback((duration = 2500) => {
    setFireworksActive(true);
    setTimeout(() => setFireworksActive(false), duration);
  }, []);

  // ==========================================
  // LEVEL UP
  // ==========================================
  const triggerLevelUp = useCallback((newLevel, duration = 4000) => {
    setLevelUpData({ newLevel });
    setLevelUpVisible(true);

    setTimeout(() => {
      setLevelUpVisible(false);
      setLevelUpData(null);
    }, duration);
  }, []);

  const closeLevelUp = useCallback(() => {
    setLevelUpVisible(false);
    setLevelUpData(null);
  }, []);

  // ==========================================
  // BADGE UNLOCK
  // ==========================================
  const triggerBadgeUnlock = useCallback((badge, duration = 4000) => {
    setBadgeUnlockData(badge);
    setBadgeUnlockVisible(true);

    setTimeout(() => {
      setBadgeUnlockVisible(false);
      setBadgeUnlockData(null);
    }, duration);
  }, []);

  const closeBadgeUnlock = useCallback(() => {
    setBadgeUnlockVisible(false);
    setBadgeUnlockData(null);
  }, []);

  // ==========================================
  // XP POPUP
  // ==========================================
  const triggerXpPopup = useCallback((amount, position = { x: '50%', y: '50%' }) => {
    const id = ++popupIdRef.current;

    setXpPopups(prev => [...prev, { id, amount, position }]);

    setTimeout(() => {
      setXpPopups(prev => prev.filter(p => p.id !== id));
    }, 1500);
  }, []);

  // ==========================================
  // COMBOS
  // ==========================================

  // Célébration complète pour un level up
  const celebrateLevelUp = useCallback((newLevel) => {
    triggerLevelUp(newLevel);
    triggerConfetti(4000);
  }, [triggerLevelUp, triggerConfetti]);

  // Célébration pour un badge
  const celebrateBadge = useCallback((badge) => {
    triggerBadgeUnlock(badge);
    triggerSparkles(3000);
  }, [triggerBadgeUnlock, triggerSparkles]);

  // Petite célébration pour XP gagné
  const celebrateXp = useCallback((amount, position) => {
    triggerXpPopup(amount, position);
    if (amount >= 50) {
      triggerSparkles(1500);
    }
  }, [triggerXpPopup, triggerSparkles]);

  // Grande célébration (victoire, succès majeur)
  const celebrateBig = useCallback(() => {
    triggerConfetti(5000);
    triggerFireworks(4000);
    triggerSparkles(3000);
  }, [triggerConfetti, triggerFireworks, triggerSparkles]);

  return {
    // États
    confettiActive,
    sparklesActive,
    fireworksActive,
    levelUpVisible,
    levelUpData,
    badgeUnlockVisible,
    badgeUnlockData,
    xpPopups,

    // Actions simples
    triggerConfetti,
    triggerSparkles,
    triggerFireworks,
    triggerLevelUp,
    triggerBadgeUnlock,
    triggerXpPopup,

    // Fermetures
    closeLevelUp,
    closeBadgeUnlock,

    // Combos
    celebrateLevelUp,
    celebrateBadge,
    celebrateXp,
    celebrateBig
  };
};

export default useCelebration;
