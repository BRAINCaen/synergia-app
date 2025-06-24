// src/shared/hooks/useGameService.js
import { useState, useEffect, useCallback } from 'react';

// Import conditionnel du service de gamification
let gamificationService = null;
try {
  const module = await import('../../core/services/gamificationService.js');
  gamificationService = module.gamificationService || module.default;
} catch (error) {
  console.warn('⚠️ GamificationService non disponible:', error.message);
}

const XP_CONFIG = {
  REWARDS: {
    DAILY_LOGIN: 10,
    TASK_COMPLETE_EASY: 20,
    TASK_COMPLETE_NORMAL: 40,
    TASK_COMPLETE_HARD: 60,
    TASK_COMPLETE_EXPERT: 100,
    PROJECT_COMPLETE: 200,
    BADGE_UNLOCK: 50
  },
  LEVEL_FORMULA: (level) => Math.floor(100 * Math.pow(1.5, level - 1)),
  MAX_LEVEL: 50
};

const BADGES_CONFIG = {
  FIRST_TASK: { 
    id: 'first_task', 
    name: 'Premier Pas', 
    description: 'Première tâche complétée',
    icon: '🎯'
  },
  TASK_MASTER: { 
    id: 'task_master', 
    name: 'Maître des Tâches', 
    description: '50 tâches complétées',
    icon: '🏆'
  },
  STREAK_WARRIOR: { 
    id: 'streak_warrior', 
    name: 'Guerrier de la Constance', 
    description: '7 jours consécutifs actif',
    icon: '🔥'
  },
  LEVEL_CHAMPION: { 
    id: 'level_champion', 
    name: 'Champion des Niveaux', 
    description: 'Atteindre le niveau 10',
    icon: '⭐'
  }
};

// Données mock par défaut
const getMockGameData = () => ({
  userId: 'demo-user',
  totalXp: 240,
  level: 3,
  tasksCompleted: 12,
  projectsCompleted: 2,
  badges: [
    {
      id: 'first_task',
      name: 'Premier Pas',
      description: 'Première tâche complétée',
      icon: '🎯',
      unlockedAt: new Date()
    }
  ],
  loginStreak: 5,
  lastLoginDate: new Date().toISOString().split('T')[0],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  completionRate: 80
});

export const useGameService = (userId = 'demo-user') => {
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let unsubscribe = null;

    const initializeGameData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (gamificationService && typeof gamificationService.initializeUserData === 'function') {
          // Mode Firebase
          const initialData = await gamificationService.initializeUserData(userId);
          setGameData(initialData);
          setIsConnected(true);

          // S'abonner aux changements
          if (typeof gamificationService.subscribeToUserData === 'function') {
            unsubscribe = gamificationService.subscribeToUserData(userId, (data) => {
              setGameData(data);
            });
          }
        } else {
          // Mode démo
          console.warn('⚠️ Mode démo - GamificationService non disponible');
          setGameData(getMockGameData());
          setIsConnected(false);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Erreur initialisation gamification:', err);
        setError(err.message);
        setIsLoading(false);
        
        // Fallback sur données mock
        setGameData(getMockGameData());
        setIsConnected(false);
      }
    };

    if (userId) {
      initializeGameData();
    }

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [userId]);

  const addXP = useCallback(async (amount, reason) => {
    try {
      if (gamificationService && typeof gamificationService.addXP === 'function') {
        const result = await gamificationService.addXP(userId, amount, reason);
        return result;
      } else {
        // Mode démo
        console.log(`🎮 [DEMO] +${amount} XP pour ${reason}`);
        const newXp = (gameData?.totalXp || 0) + amount;
        setGameData(prev => prev ? { ...prev, totalXp: newXp } : getMockGameData());
        return { success: true, xpGained: amount, totalXp: newXp };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [userId, gameData]);

  const completeTask = useCallback(async (difficulty = 'normal') => {
    try {
      if (gamificationService && typeof gamificationService.completeTask === 'function') {
        const result = await gamificationService.completeTask(userId, difficulty);
        return result;
      } else {
        // Mode démo
        const xpRewards = {
          easy: 20,
          normal: 40,
          hard: 60,
          expert: 100
        };
        const xpReward = xpRewards[difficulty] || 40;
        return await addXP(xpReward, `Tâche ${difficulty} complétée`);
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [userId, addXP]);

  const dailyLogin = useCallback(async () => {
    try {
      if (gamificationService && typeof gamificationService.dailyLogin === 'function') {
        const result = await gamificationService.dailyLogin(userId);
        return result;
      } else {
        // Mode démo
        return await addXP(10, 'Connexion quotidienne');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [userId, addXP]);

  const unlockBadge = useCallback(async () => {
    try {
      if (gamificationService && typeof gamificationService.checkForNewBadges === 'function') {
        const newBadges = await gamificationService.checkForNewBadges(userId);
        return newBadges;
      } else {
        // Mode démo
        console.log('🏆 [DEMO] Vérification badges');
        return [];
      }
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, [userId]);

  const calculations = {
    getCurrentLevel: () => {
      if (!gameData) return 1;
      return gameData.level || 1;
    },

    getXPForNextLevel: () => {
      if (!gameData) return 100;
      const currentLevel = gameData.level || 1;
      return XP_CONFIG.LEVEL_FORMULA(currentLevel + 1);
    },

    getLevelProgress: () => {
      if (!gameData) return 0;
      const currentLevel = gameData.level || 1;
      const currentXP = gameData.totalXp || 0;
      const xpForCurrentLevel = currentLevel > 1 
        ? XP_CONFIG.LEVEL_FORMULA(currentLevel)
        : 0;
      const xpForNextLevel = XP_CONFIG.LEVEL_FORMULA(currentLevel + 1);
      const progressInLevel = currentXP - xpForCurrentLevel;
      const xpNeededInLevel = xpForNextLevel - xpForCurrentLevel;
      
      return Math.min(100, Math.max(0, (progressInLevel / xpNeededInLevel) * 100));
    },

    getStats: () => {
      if (!gameData) return {
        level: 1,
        totalXP: 0,
        tasksCompleted: 0,
        badges: 0,
        loginStreak: 0
      };
      
      return {
        level: gameData.level || 1,
        totalXP: gameData.totalXp || 0,
        tasksCompleted: gameData.tasksCompleted || 0,
        badges: gameData.badges ? gameData.badges.length : 0,
        loginStreak: gameData.loginStreak || 0
      };
    },

    getUnlockedBadges: () => {
      return gameData?.badges || [];
    },

    getAvailableBadges: () => {
      const unlockedBadgeIds = gameData?.badges?.map(b => b.id) || [];
      return Object.values(BADGES_CONFIG).map(badge => ({
        ...badge,
        unlocked: unlockedBadgeIds.includes(badge.id)
      }));
    }
  };

  const quickActions = {
    completeEasyTask: () => completeTask('easy'),
    completeNormalTask: () => completeTask('normal'),
    completeHardTask: () => completeTask('hard'),
    completeExpertTask: () => completeTask('expert'),
    dailyLogin,
    addCustomXP: (amount, reason) => addXP(amount, reason)
  };

  return {
    gameData,
    isLoading,
    error,
    isConnected,
    addXP,
    completeTask,
    dailyLogin,
    unlockBadge,
    calculations,
    quickActions
  };
};

export default useGameService;
