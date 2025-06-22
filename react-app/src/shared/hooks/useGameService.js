import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { useGameStore } from '../stores/gameStore.js';
import { gameService } from '../../core/services/gameService.js';

export const useGameService = () => {
  const { user } = useAuthStore();
  const { 
    setGameData, 
    setLoading, 
    setError,
    gameData,
    isLoading,
    error,
    triggerXPAnimation,
    showLevelUpNotification,
    showBadgeNotification,
    addRecentActivity,
    getters
  } = useGameStore();

  // 🔄 Synchroniser les données depuis Firestore
  const syncGameData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const data = await gameService.getUserGameData(user.uid);
      setGameData(data);
      setError(null);
    } catch (error) {
      console.error('Erreur sync game data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, setGameData, setLoading, setError]);

  // ⭐ Ajouter de l'XP avec feedback visuel
  const addXP = useCallback(async (amount, source = 'unknown') => {
    if (!user?.uid) return null;

    try {
      const result = await gameService.addXP(user.uid, amount, source);
      
      // Mise à jour locale immédiate
      setGameData(result);
      
      // Feedback visuel
      triggerXPAnimation(amount);
      
      // Ajouter à l'activité récente
      addRecentActivity({
        type: 'xp_gained',
        amount,
        source,
        newTotal: result.totalXp
      });
      
      // Vérifier level up
      if (result.leveledUp) {
        showLevelUpNotification({
          newLevel: result.newLevel,
          previousLevel: result.previousLevel
        });
      }
      
      return result;
    } catch (error) {
      console.error('Erreur ajout XP:', error);
      setError(error.message);
      return null;
    }
  }, [user?.uid, setGameData, setError, triggerXPAnimation, addRecentActivity, showLevelUpNotification]);

  // 🏅 Débloquer un badge
  const unlockBadge = useCallback(async (badge) => {
    if (!user?.uid) return false;

    try {
      const success = await gameService.unlockBadge(user.uid, badge);
      if (success) {
        // Recharger les données
        await syncGameData();
        
        // Feedback visuel
        showBadgeNotification(badge);
        
        // Ajouter à l'activité récente
        addRecentActivity({
          type: 'badge_unlocked',
          badge: badge.name,
          category: badge.category
        });
      }
      return success;
    } catch (error) {
      console.error('Erreur déblocage badge:', error);
      setError(error.message);
      return false;
    }
  }, [user?.uid, syncGameData, setError, showBadgeNotification, addRecentActivity]);

  // 🎯 Actions de gamification rapides
  const quickActions = {
    dailyLogin: () => addXP(10, 'daily_login'),
    taskCompleted: () => addXP(25, 'task_completed'),
    longSession: () => addXP(15, 'long_session'),
    firstLogin: async () => {
      const badge = {
        id: 'first_login',
        name: 'Premier Pas',
        description: 'Première connexion à Synergia',
        icon: '👋',
        category: 'milestone',
        rarity: 'common'
      };
      await unlockBadge(badge);
      return addXP(50, 'first_login');
    }
  };

  // 🧮 Fonctions de calcul utiles
  const calculations = {
    getProgressToNextLevel: () => {
      if (!gameData) return 0;
      return getters.getProgressPercentage() / 100;
    },
    
    getXPNeededForNextLevel: () => {
      return getters.getXPForNextLevel();
    },
    
    getBadgesByCategory: (category) => {
      if (!gameData?.badges) return [];
      return gameData.badges.filter(badge => badge.category === category);
    }
  };

  // 🔄 Écouter les changements en temps réel
  useEffect(() => {
    if (!user?.uid) return;

    // Synchronisation initiale si pas de données
    if (!gameData || !gameData.level) {
      syncGameData();
    }

    // Écoute en temps réel
    const unsubscribe = gameService.subscribeToUserGameData(
      user.uid,
      (data) => {
        setGameData(data);
        setLoading(false);
      }
    );

    return () => {
      gameService.unsubscribeFromUserGameData(user.uid);
    };
  }, [user?.uid, gameData, syncGameData, setGameData, setLoading]);

  return {
    // Données
    gameData,
    isLoading,
    error,
    
    // Actions principales
    addXP,
    unlockBadge,
    syncGameData,
    
    // Actions rapides
    quickActions,
    
    // Utilitaires
    calculations,
    getters,
    
    // État de connexion
    isConnected: !!user?.uid
  };
};
