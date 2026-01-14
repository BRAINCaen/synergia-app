// ==========================================
// shared/hooks/useRewardAnimations.js
// Hook pour les animations de récompenses gamification
// Détecte automatiquement XP gains, level ups, badges
// ==========================================

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook pour gérer les animations de récompenses
 * S'intègre avec le système de gamification pour afficher
 * automatiquement les popups XP, Level Up et Badge
 *
 * @param {Object} options
 * @param {Object} options.gamification - Données de gamification (depuis useGamificationSync)
 * @param {boolean} options.enabled - Active/désactive les animations
 * @returns {Object} États et contrôles d'animation
 */
export const useRewardAnimations = ({ gamification, enabled = true } = {}) => {
  // États pour les popups
  const [xpPopup, setXpPopup] = useState({ show: false, amount: 0 });
  const [levelPopup, setLevelPopup] = useState({ show: false, level: 1 });
  const [badgePopup, setBadgePopup] = useState({ show: false, badge: null });

  // Queue pour les animations multiples
  const [animationQueue, setAnimationQueue] = useState([]);
  const isAnimating = useRef(false);

  // Références pour détecter les changements
  const prevXP = useRef(null);
  const prevLevel = useRef(null);
  const prevBadgeCount = useRef(null);

  // Traiter la queue d'animations
  const processQueue = useCallback(() => {
    if (isAnimating.current || animationQueue.length === 0) return;

    const nextAnimation = animationQueue[0];
    isAnimating.current = true;

    switch (nextAnimation.type) {
      case 'xp':
        setXpPopup({ show: true, amount: nextAnimation.amount });
        break;
      case 'level':
        setLevelPopup({ show: true, level: nextAnimation.level });
        break;
      case 'badge':
        setBadgePopup({ show: true, badge: nextAnimation.badge });
        break;
      default:
        break;
    }

    // Retirer l'animation de la queue
    setAnimationQueue(prev => prev.slice(1));
  }, [animationQueue]);

  // Détecter les changements de gamification
  useEffect(() => {
    if (!enabled || !gamification) return;

    const currentXP = gamification.totalXp || 0;
    const currentLevel = gamification.level || 1;
    const currentBadgeCount = gamification.badgeCount || 0;

    // Premier rendu - initialiser les refs
    if (prevXP.current === null) {
      prevXP.current = currentXP;
      prevLevel.current = currentLevel;
      prevBadgeCount.current = currentBadgeCount;
      return;
    }

    const newAnimations = [];

    // Détecter gain XP
    if (currentXP > prevXP.current) {
      const xpGained = currentXP - prevXP.current;
      newAnimations.push({ type: 'xp', amount: xpGained });
    }

    // Détecter level up
    if (currentLevel > prevLevel.current) {
      newAnimations.push({ type: 'level', level: currentLevel });
    }

    // Détecter nouveau badge
    if (currentBadgeCount > prevBadgeCount.current) {
      const newBadges = gamification.badges?.slice(-(currentBadgeCount - prevBadgeCount.current)) || [];
      newBadges.forEach(badge => {
        newAnimations.push({ type: 'badge', badge });
      });
    }

    // Ajouter à la queue
    if (newAnimations.length > 0) {
      setAnimationQueue(prev => [...prev, ...newAnimations]);
    }

    // Mettre à jour les refs
    prevXP.current = currentXP;
    prevLevel.current = currentLevel;
    prevBadgeCount.current = currentBadgeCount;

  }, [gamification?.totalXp, gamification?.level, gamification?.badgeCount, enabled]);

  // Traiter la queue quand elle change
  useEffect(() => {
    if (!isAnimating.current && animationQueue.length > 0) {
      processQueue();
    }
  }, [animationQueue, processQueue]);

  // Callbacks de fermeture
  const onXpComplete = useCallback(() => {
    setXpPopup({ show: false, amount: 0 });
    isAnimating.current = false;
  }, []);

  const onLevelComplete = useCallback(() => {
    setLevelPopup({ show: false, level: 1 });
    isAnimating.current = false;
  }, []);

  const onBadgeComplete = useCallback(() => {
    setBadgePopup({ show: false, badge: null });
    isAnimating.current = false;
  }, []);

  // Trigger manuel pour tester
  const triggerXP = useCallback((amount) => {
    setAnimationQueue(prev => [...prev, { type: 'xp', amount }]);
  }, []);

  const triggerLevelUp = useCallback((level) => {
    setAnimationQueue(prev => [...prev, { type: 'level', level }]);
  }, []);

  const triggerBadge = useCallback((badge) => {
    setAnimationQueue(prev => [...prev, { type: 'badge', badge }]);
  }, []);

  return {
    // États des popups
    xpPopup,
    levelPopup,
    badgePopup,

    // Callbacks pour les composants
    onXpComplete,
    onLevelComplete,
    onBadgeComplete,

    // Triggers manuels (pour tests ou événements custom)
    triggerXP,
    triggerLevelUp,
    triggerBadge,

    // Info sur la queue
    hasPendingAnimations: animationQueue.length > 0,
    pendingCount: animationQueue.length
  };
};

export default useRewardAnimations;
