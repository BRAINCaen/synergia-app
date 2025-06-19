// src/shared/hooks/useGameService.js
import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { gameService } from '../../core/services/gameService';

export const useGameService = () => {
  const { user } = useAuthStore();
  const { 
    setGameData, 
    setLoading, 
    setError,
    gameData 
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
      
      // Mise à jour locale immédiate pour UX fluide
      setGameData(result);
      
      return result;
    } catch (error) {
      console.error('Erreur ajout XP:', error);
      setError(error.message);
      return null;
    }
  }, [user?.uid, setGameData, setError]);

  // 🏅 Débloquer un badge
  const unlockBadge = useCallback(async (badge) => {
    if (!user?.uid) return false;

    try {
      const success = await gameService.unlockBadge(user.uid, badge);
      if (success) {
        // Recharger les données pour avoir les badges à jour
        await syncGameData();
      }
      return success;
    } catch (error) {
      console.error('Erreur déblocage badge:', error);
      setError(error.message);
      return false;
    }
  }, [user?.uid, syncGameData, setError]);

  // 📊 Mettre à jour les stats d'activité
  const updateActivity = useCallback(async (activityType, data = {}) => {
    if (!user?.uid) return;

    try {
      await gameService.updateActivityStats(user.uid, {
        type: activityType,
        ...data
      });
      
      // Recharger les données après mise à jour
      await syncGameData();
    } catch (error) {
      console.error('Erreur mise à jour activité:', error);
      setError(error.message);
    }
  }, [user?.uid, syncGameData, setError]);

  // 🎯 Actions de gamification rapides
  const quickActions = {
    // Connexion quotidienne
    dailyLogin: () => addXP(10, 'daily_login'),
    
    // Completion de tâche
    taskCompleted: () => addXP(25, 'task_completed'),
    
    // Session prolongée
    longSession: () => addXP(15, 'long_session'),
    
    // Premier login
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
      const currentLevelXP = Math.pow(gameData.level - 1, 2) * 100;
      const nextLevelXP = Math.pow(gameData.level, 2) * 100;
      const progress = gameData.totalXp - currentLevelXP;
      const needed = nextLevelXP - currentLevelXP;
      return Math.min(progress / needed, 1);
    },
    
    getXPNeededForNextLevel: () => {
      if (!gameData) return 0;
      const nextLevelXP = Math.pow(gameData.level, 2) * 100;
      return Math.max(nextLevelXP - gameData.totalXp, 0);
    },
    
    getBadgesByCategory: (category) => {
      if (!gameData?.badges) return [];
      return gameData.badges.filter(badge => badge.category === category);
    }
  };

  // 🔄 Écouter les changements en temps réel
  useEffect(() => {
    if (!user?.uid) return;

    // Synchronisation initiale
    syncGameData();

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
  }, [user?.uid, syncGameData, setGameData, setLoading]);

  // 🧹 Nettoyage lors du logout
  useEffect(() => {
    if (!user) {
      setGameData(null);
      setError(null);
    }
  }, [user, setGameData, setError]);

  return {
    // Données
    gameData,
    isLoading: useGameStore(state => state.isLoading),
    error: useGameStore(state => state.error),
    
    // Actions principales
    addXP,
    unlockBadge,
    updateActivity,
    syncGameData,
    
    // Actions rapides
    quickActions,
    
    // Utilitaires
    calculations,
    
    // État de connexion
    isConnected: !!user?.uid
  };
};
