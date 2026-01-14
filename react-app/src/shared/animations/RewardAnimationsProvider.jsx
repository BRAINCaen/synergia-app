// ==========================================
// shared/animations/RewardAnimationsProvider.jsx
// Provider pour les animations de récompenses globales
// Affiche automatiquement XP popups, Level ups, Badges
// ==========================================

import React, { createContext, useContext } from 'react';
import { useGamificationSync } from '../hooks/useGamificationSync.js';
import { useRewardAnimations } from '../hooks/useRewardAnimations.js';
import { XPPopup, LevelUpPopup, BadgeEarnedPopup, Confetti } from './components.jsx';

// Context pour accéder aux triggers manuels
const RewardAnimationsContext = createContext(null);

/**
 * Hook pour accéder aux triggers d'animation manuels
 */
export const useRewardAnimationsTriggers = () => {
  const context = useContext(RewardAnimationsContext);
  if (!context) {
    console.warn('useRewardAnimationsTriggers: utilisé hors de RewardAnimationsProvider');
    return {
      triggerXP: () => {},
      triggerLevelUp: () => {},
      triggerBadge: () => {}
    };
  }
  return context;
};

/**
 * Provider pour les animations de récompenses
 * À placer au niveau Layout ou App pour des animations globales
 */
export const RewardAnimationsProvider = ({ children, enabled = true }) => {
  // Récupérer les données de gamification
  const { gamification } = useGamificationSync();

  // Hook d'animations
  const {
    xpPopup,
    levelPopup,
    badgePopup,
    onXpComplete,
    onLevelComplete,
    onBadgeComplete,
    triggerXP,
    triggerLevelUp,
    triggerBadge
  } = useRewardAnimations({ gamification, enabled });

  // Valeur du context
  const contextValue = {
    triggerXP,
    triggerLevelUp,
    triggerBadge
  };

  return (
    <RewardAnimationsContext.Provider value={contextValue}>
      {children}

      {/* Popup XP */}
      <XPPopup
        amount={xpPopup.amount}
        show={xpPopup.show}
        onComplete={onXpComplete}
        position="top"
      />

      {/* Popup Level Up */}
      <LevelUpPopup
        level={levelPopup.level}
        show={levelPopup.show}
        onComplete={onLevelComplete}
      />

      {/* Popup Badge */}
      <BadgeEarnedPopup
        badge={badgePopup.badge}
        show={badgePopup.show}
        onComplete={onBadgeComplete}
      />

      {/* Confetti pour level up */}
      <Confetti show={levelPopup.show} duration={3000} />
    </RewardAnimationsContext.Provider>
  );
};

export default RewardAnimationsProvider;
