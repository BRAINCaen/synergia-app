// src/shared/hooks/useGameService.js
// Hook React pour le service de gamification - VERSION CORRIGÉE
import { useState, useEffect, useCallback, useRef } from 'react';
import { gamificationService } from '../../core/services/gamificationService.js';

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

export const useGameService = (userId) => {
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // ✅ Utiliser useRef pour éviter les réinitialisations multiples
  const initializationRef = useRef(false);
// ❌ SUPPRIMÉ: dailyLoginRef qui bloquait

// ✅ CORRECTION: dailyLogin appelé à CHAQUE montage du hook
setTimeout(async () => {
  try {
    console.log('🌅 Tentative connexion quotidienne...');
    const loginResult = await gamificationService.dailyLogin(userId);
    
    if (loginResult.isNewDay) {
      console.log(`✅ Nouveau jour ! Streak: ${loginResult.streak}`);
    }
  } catch (err) {
    console.error('❌ Erreur connexion quotidienne:', err);
  }
}, 1000);

        // ✅ S'abonner aux mises à jour temps réel
        unsubscribe = gamificationService.subscribeToUserData(userId, (data) => {
          console.log('🔄 Données gamification mises à jour:', data);
          setGameData(data);
        });

        setIsLoading(false);
        console.log('✅ Service de gamification initialisé avec succès');

      } catch (err) {
        console.error('❌ Erreur initialisation gamification:', err);
        setError(err.message);
        setIsLoading(false);
        
        // Mode fallback
        setGameData(gamificationService.getDefaultUserData());
        setIsConnected(false);
      }
    };

    if (userId && !initializationRef.current) {
      initializeGameData();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId]);

  // ✅ Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      gamificationService.unsubscribeAll();
    };
  }, []);

  const addXP = useCallback(async (amount, reason) => {
    try {
      const result = await gamificationService.addXP(userId, amount, reason);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [userId]);

  const completeTask = useCallback(async (difficulty = 'normal') => {
    try {
      const result = await gamificationService.completeTask(userId, difficulty);
      
      // Vérifier les nouveaux badges
      setTimeout(async () => {
        await gamificationService.checkAndUnlockBadges(userId);
      }, 500);
      
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [userId]);

  const unlockBadge = useCallback(async (badgeId) => {
    try {
      const badges = await gamificationService.checkAndUnlockBadges(userId);
      return badges.includes(badgeId);
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  const getLeaderboard = useCallback(async (limit = 10) => {
    try {
      return await gamificationService.getLeaderboard(limit);
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  const resetDailyLogin = useCallback(() => {
    dailyLoginRef.current = false;
  }, []);

  // ✅ CORRIGÉ: Calculer les stats dérivées avec méthodes correctes
  const derivedStats = gameData ? {
    currentLevel: gameData.level || 1,
    currentXP: gameData.totalXp || 0,
    // ✅ CORRECTION: Utiliser la bonne méthode du service
    xpForNextLevel: gamificationService.getXpForLevel((gameData.level || 1) + 1),
    // ✅ CORRECTION: Calcul correct du pourcentage
    progressPercentage: (() => {
      const currentLevel = gameData.level || 1;
      const currentXP = gameData.totalXp || 0;
      const currentLevelXP = gamificationService.getXpForLevel(currentLevel);
      const nextLevelXP = gamificationService.getXpForLevel(currentLevel + 1);
      const progressXP = currentXP - currentLevelXP;
      const neededXP = nextLevelXP - currentLevelXP;
      return neededXP > 0 ? Math.round((progressXP / neededXP) * 100) : 0;
    })(),
    totalBadges: (gameData.badges || []).length,
    tasksCompleted: gameData.tasksCompleted || 0,
    loginStreak: gameData.loginStreak || 0
  } : null;

  // ✅ Fonctions utilitaires pour le Dashboard
  const calculations = {
    getStats: () => ({
      level: derivedStats?.currentLevel || 1,
      totalXP: derivedStats?.currentXP || 0,
      tasksCompleted: derivedStats?.tasksCompleted || 0,
      badges: derivedStats?.totalBadges || 0
    }),
    getLevelProgress: () => derivedStats?.progressPercentage || 0,
    getUnlockedBadges: () => gameData?.badges || []
  };

  const quickActions = {
    dailyLogin: useCallback(async () => {
      if (!dailyLoginRef.current && userId) {
        dailyLoginRef.current = true;
        return await gamificationService.dailyLogin(userId);
      }
      return { success: true, alreadyProcessed: true };
    }, [userId])
  };

  return {
    // Données
    gameData,
    derivedStats,
    isLoading,
    error,
    isConnected,
    
    // Actions
    addXP,
    completeTask,
    unlockBadge,
    getLeaderboard,
    resetDailyLogin,
    
    // ✅ Nouvelles propriétés pour Dashboard
    calculations,
    quickActions,
    dailyLogin: quickActions.dailyLogin,
    
    // Configuration
    XP_CONFIG,
    BADGES_CONFIG
  };
};
