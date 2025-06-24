// ==========================================
// 📁 react-app/src/shared/hooks/useGameService.js
// Hook React pour le service de gamification CORRIGÉ
// ==========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import gamificationService from '../../core/services/gamificationService';

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

export const useGameService = (userId = 'demo-user') => {
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // ✅ Utiliser useRef pour éviter les réinitialisations multiples
  const initializationRef = useRef(false);
  const dailyLoginRef = useRef(false);

  useEffect(() => {
    let unsubscribe = null;

    const initializeGameData = async () => {
      // ✅ Éviter les initialisations multiples
      if (initializationRef.current) return;
      initializationRef.current = true;

      try {
        setIsLoading(true);
        setError(null);

        console.log('🔧 Initialisation du service de gamification...');
        
        const initialData = await gamificationService.initializeUserData(userId);
        setGameData(initialData);
        setIsConnected(true);

        // ✅ Gérer la connexion quotidienne UNE SEULE FOIS
        if (!dailyLoginRef.current) {
          dailyLoginRef.current = true;
          setTimeout(async () => {
            try {
              await gamificationService.dailyLogin(userId);
            } catch (err) {
              console.log('ℹ️ Connexion quotidienne déjà traitée ou erreur mineure');
            }
          }, 1000);
        }

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
        setGameData(gamificationService.getMockUserData());
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
  }, [userId]);

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

  // ✅ Calculer les stats dérivées
  const derivedStats = gameData ? {
    currentLevel: gameData.level || 1,
    currentXP: gameData.xp || 0,
    xpForNextLevel: gamificationService.getXPForNextLevel(gameData.level || 1),
    progressPercentage: gameData.xp ? Math.round((gameData.xp / gamificationService.getXPForNextLevel(gameData.level || 1)) * 100) : 0,
    totalBadges: (gameData.badges || []).length,
    tasksCompleted: gameData.tasksCompleted || 0,
    currentStreak: gameData.currentStreak || 0
  } : null;

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
    
    // Configuration
    XP_CONFIG,
    BADGES_CONFIG
  };
};
