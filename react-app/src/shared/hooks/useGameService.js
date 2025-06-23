// 🔧 CORRECTION: react-app/src/shared/hooks/useGameService.js
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

  // 🔄 Synchroniser les données depuis Firestore - CORRIGÉ
  const syncGameData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const data = await gameService.getUserGameData(user.uid);
      
      // 🔧 CORRECTION: S'assurer que les données sont cohérentes
      const normalizedData = {
        ...data,
        // S'assurer que totalXp et xp sont synchronisés
        totalXp: data.totalXp || data.xp || 0,
        xp: data.xp || data.totalXp || 0,
        level: data.level || 1,
        badges: data.badges || [],
        loginStreak: data.loginStreak || 0,
        tasksCompleted: data.tasksCompleted || 0
      };
      
      console.log('🔄 Données synchronisées:', normalizedData);
      setGameData(normalizedData);
      setError(null);
    } catch (error) {
      console.error('❌ Erreur sync game data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, setGameData, setLoading, setError]);

  // ⭐ Ajouter de l'XP avec feedback visuel - CORRIGÉ
  const addXP = useCallback(async (amount, source = 'unknown') => {
    if (!user?.uid) return null;

    try {
      console.log(`🎯 Ajout XP: +${amount} (${source})`);
      const result = await gameService.addXP(user.uid, amount, source);
      
      // 🔧 CORRECTION: Mise à jour locale immédiate ET temps réel
      const normalizedResult = {
        ...result,
        totalXp: result.totalXp || result.xp || 0,
        xp: result.xp || result.totalXp || 0
      };
      
      console.log('✅ Résultat XP:', normalizedResult);
      setGameData(normalizedResult);
      
      // Feedback visuel
      triggerXPAnimation(amount);
      
      // Ajouter à l'activité récente
      addRecentActivity({
        type: 'xp_gained',
        amount,
        source,
        newTotal: normalizedResult.totalXp
      });
      
      // Vérifier level up
      if (result.leveledUp) {
        showLevelUpNotification({
          newLevel: result.newLevel,
          previousLevel: result.previousLevel
        });
      }
      
      // 🔧 CORRECTION: Forcer une resynchronisation après mise à jour
      setTimeout(syncGameData, 500);
      
      return normalizedResult;
    } catch (error) {
      console.error('❌ Erreur ajout XP:', error);
      setError(error.message);
      return null;
    }
  }, [user?.uid, setGameData, setError, triggerXPAnimation, addRecentActivity, showLevelUpNotification, syncGameData]);

  // 🏅 Débloquer un badge - CORRIGÉ
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
      console.error('❌ Erreur déblocage badge:', error);
      setError(error.message);
      return false;
    }
  }, [user?.uid, syncGameData, setError, showBadgeNotification, addRecentActivity]);

  // 🎯 Actions de gamification rapides - CORRIGÉ
  const quickActions = {
    dailyLogin: () => {
      console.log('🌅 Daily login triggered');
      return addXP(10, 'daily_login');
    },
    taskCompleted: () => {
      console.log('✅ Task completed triggered');
      return addXP(25, 'task_completed');
    },
    longSession: () => {
      console.log('⏰ Long session triggered');
      return addXP(15, 'long_session');
    },
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

  // 🧮 Fonctions de calcul utiles - CORRIGÉ
  const calculations = {
    getProgressToNextLevel: () => {
      if (!gameData || !gameData.level) return 0;
      return getters.getProgressPercentage() / 100;
    },
    
    getXPNeededForNextLevel: () => {
      if (!gameData) return 100;
      return getters.getXPForNextLevel();
    },
    
    getBadgesByCategory: (category) => {
      if (!gameData?.badges) return [];
      return gameData.badges.filter(badge => badge.category === category);
    }
  };

  // 🔄 Écouter les changements en temps réel - CORRIGÉ
  useEffect(() => {
    if (!user?.uid) {
      console.log('👤 Pas d\'utilisateur connecté');
      return;
    }

    console.log('🔄 Setup real-time listener pour:', user.uid);

    // Synchronisation initiale
    syncGameData();

    // Écoute en temps réel
    const unsubscribe = gameService.subscribeToUserGameData(
      user.uid,
      (data) => {
        console.log('📡 Données temps réel reçues:', data);
        
        // Normaliser les données
        const normalizedData = {
          ...data,
          totalXp: data.totalXp || data.xp || 0,
          xp: data.xp || data.totalXp || 0,
          level: data.level || 1,
          badges: data.badges || []
        };
        
        setGameData(normalizedData);
        setLoading(false);
      }
    );

    return () => {
      console.log('🛑 Cleanup real-time listener');
      gameService.unsubscribeFromUserGameData(user.uid);
    };
  }, [user?.uid, setGameData, setLoading, syncGameData]);

  // 🔧 CORRECTION: Log pour debug
  useEffect(() => {
    if (gameData) {
      console.log('🎮 GameData mis à jour:', {
        level: gameData.level,
        xp: gameData.xp,
        totalXp: gameData.totalXp,
        badges: gameData.badges?.length || 0
      });
    }
  }, [gameData]);

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
