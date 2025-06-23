// ==========================================
// 📁 react-app/src/shared/hooks/useGameService.js
// Hook Gamification FINAL - Compatible avec Dashboard optimisé
// ==========================================

import { useEffect, useCallback, useRef } from 'react';
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

  // 🔧 FIX: Refs pour éviter les boucles infinies
  const isListenerSetup = useRef(false);
  const currentUserId = useRef(null);
  const isSyncing = useRef(false);

  // 🔄 Synchroniser les données depuis Firestore - OPTIMISÉ
  const syncGameData = useCallback(async () => {
    if (!user?.uid || isSyncing.current) return;

    try {
      isSyncing.current = true;
      console.log('🔄 syncGameData pour:', user.uid);
      setLoading(true);
      
      const data = await gameService.getUserGameData(user.uid);
      
      // 🔧 CORRECTION: S'assurer que les données sont cohérentes
      const normalizedData = {
        ...data,
        totalXp: data.totalXp || data.xp || 0,
        xp: data.xp || data.totalXp || 0,
        level: data.level || 1,
        badges: data.badges || [],
        loginStreak: data.loginStreak || 0,
        tasksCompleted: data.tasksCompleted || 0,
        xpHistory: data.xpHistory || []
      };
      
      console.log('✅ Données normalisées:', {
        level: normalizedData.level,
        totalXp: normalizedData.totalXp,
        badges: normalizedData.badges.length
      });
      
      setGameData(normalizedData);
      setError(null);
    } catch (error) {
      console.error('❌ Erreur sync game data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      isSyncing.current = false;
    }
  }, [user?.uid, setGameData, setLoading, setError]);

  // ⭐ Ajouter de l'XP avec feedback visuel - OPTIMISÉ
  const addXP = useCallback(async (amount, source = 'unknown') => {
    if (!user?.uid) {
      console.warn('❌ Pas d\'utilisateur pour addXP');
      return null;
    }

    try {
      console.log(`🎯 Ajout XP: +${amount} (${source})`);
      
      // Optimiste update local d'abord
      if (gameData) {
        const optimisticData = {
          ...gameData,
          totalXp: (gameData.totalXp || 0) + amount,
          xp: (gameData.xp || 0) + amount
        };
        console.log('🚀 Mise à jour optimiste:', optimisticData);
        setGameData(optimisticData);
      }
      
      // Puis update serveur
      const result = await gameService.addXP(user.uid, amount, source);
      
      // Normaliser les données de retour
      const normalizedResult = {
        ...result,
        totalXp: result.totalXp || result.xp || 0,
        xp: result.xp || result.totalXp || 0,
        level: result.level || 1,
        badges: result.badges || gameData?.badges || []
      };
      
      console.log('✅ Résultat final XP:', {
        level: normalizedResult.level,
        totalXp: normalizedResult.totalXp,
        gained: amount
      });
      
      // Mise à jour définitive
      setGameData(normalizedResult);
      
      // Feedback visuel
      triggerXPAnimation(amount);
      
      // Ajouter à l'activité récente
      addRecentActivity({
        type: 'xp_gained',
        amount,
        source,
        newTotal: normalizedResult.totalXp,
        timestamp: new Date().toISOString()
      });
      
      // Vérifier level up
      if (result.leveledUp) {
        console.log('🎉 LEVEL UP!', result.newLevel);
        showLevelUpNotification({
          newLevel: result.newLevel,
          previousLevel: result.previousLevel
        });
      }
      
      return normalizedResult;
    } catch (error) {
      console.error('❌ Erreur ajout XP:', error);
      setError(error.message);
      
      // Rollback en cas d'erreur
      if (gameData) {
        console.log('🔄 Rollback données XP');
        setGameData(gameData);
      }
      
      return null;
    }
  }, [user?.uid, gameData, setGameData, setError, triggerXPAnimation, addRecentActivity, showLevelUpNotification]);

  // 🏅 Débloquer un badge - OPTIMISÉ
  const unlockBadge = useCallback(async (badge) => {
    if (!user?.uid) return false;

    try {
      console.log('🏅 Tentative déblocage badge:', badge.name);
      const success = await gameService.unlockBadge(user.uid, badge);
      
      if (success) {
        console.log('✅ Badge débloqué:', badge.name);
        showBadgeNotification(badge);
        addRecentActivity({
          type: 'badge_unlocked',
          badge: badge.name,
          category: badge.category,
          timestamp: new Date().toISOString()
        });
        
        // Resync après déblocage
        setTimeout(() => {
          syncGameData();
        }, 500);
      }
      return success;
    } catch (error) {
      console.error('❌ Erreur déblocage badge:', error);
      setError(error.message);
      return false;
    }
  }, [user?.uid, syncGameData, setError, showBadgeNotification, addRecentActivity]);

  // 🎯 Actions de gamification rapides - STABLES
  const quickActions = {
    dailyLogin: async () => {
      console.log('🌅 Daily login triggered');
      const result = await addXP(10, 'daily_login');
      if (result) {
        console.log('✅ Daily login réussi:', result.totalXp);
      }
      return result;
    },
    
    taskCompleted: async () => {
      console.log('✅ Task completed triggered');
      const result = await addXP(25, 'task_completed');
      if (result) {
        console.log('✅ Task XP ajouté:', result.totalXp);
      }
      return result;
    },
    
    longSession: async () => {
      console.log('⏰ Long session triggered');
      const result = await addXP(15, 'long_session');
      if (result) {
        console.log('✅ Long session XP:', result.totalXp);
      }
      return result;
    },
    
    firstLogin: async () => {
      console.log('👋 First login triggered');
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

  // 🧮 Fonctions de calcul utiles - CORRIGÉES
  const calculations = {
    getProgressToNextLevel: () => {
      if (!gameData || !gameData.level) {
        console.log('⚠️ Pas de gameData pour progression');
        return 0;
      }
      const percentage = getters.getProgressPercentage();
      const result = Math.min(percentage / 100, 1);
      console.log('🧮 Progress calculé:', { percentage, result });
      return result;
    },
    
    getXPNeededForNextLevel: () => {
      if (!gameData) {
        console.log('⚠️ Pas de gameData pour XP needed');
        return 100;
      }
      const needed = getters.getXPForNextLevel();
      console.log('🎯 XP needed calculé:', needed);
      return needed;
    },
    
    getBadgesByCategory: (category) => {
      if (!gameData?.badges) return [];
      return gameData.badges.filter(badge => badge.category === category);
    }
  };

  // 🔄 Écouter les changements en temps réel - ULTRA OPTIMISÉ
  useEffect(() => {
    if (!user?.uid) {
      console.log('👤 Pas d\'utilisateur connecté');
      isListenerSetup.current = false;
      currentUserId.current = null;
      return;
    }

    // 🔧 FIX: Éviter de recreer les listeners si déjà setup pour le même user
    if (isListenerSetup.current && currentUserId.current === user.uid) {
      console.log('🔄 Listener déjà configuré pour:', user.uid);
      return;
    }

    console.log('🔄 Setup NOUVEAU real-time listener pour:', user.uid);

    // Cleanup précédent si changement d'utilisateur
    if (isListenerSetup.current && currentUserId.current && currentUserId.current !== user.uid) {
      console.log('🛑 Cleanup ancien listener pour:', currentUserId.current);
      gameService.unsubscribeFromUserGameData(currentUserId.current);
    }

    // Synchronisation initiale seulement si nécessaire
    if (!gameData || gameData.level === undefined) {
      console.log('🚀 Sync initiale nécessaire');
      syncGameData();
    }

    // Écoute en temps réel
    const unsubscribe = gameService.subscribeToUserGameData(
      user.uid,
      (data) => {
        console.log('📡 Données temps réel reçues:', {
          level: data.level,
          totalXp: data.totalXp,
          badges: data.badges?.length || 0
        });
        
        // Normaliser les données temps réel
        const normalizedData = {
          ...data,
          totalXp: data.totalXp || data.xp || 0,
          xp: data.xp || data.totalXp || 0,
          level: data.level || 1,
          badges: data.badges || [],
          loginStreak: data.loginStreak || 0,
          tasksCompleted: data.tasksCompleted || 0,
          xpHistory: data.xpHistory || []
        };
        
        setGameData(normalizedData);
        setLoading(false);
      }
    );

    // Marquer comme configuré
    isListenerSetup.current = true;
    currentUserId.current = user.uid;

    return () => {
      console.log('🛑 Cleanup real-time listener pour:', user.uid);
      if (gameService.unsubscribeFromUserGameData) {
        gameService.unsubscribeFromUserGameData(user.uid);
      }
      isListenerSetup.current = false;
      currentUserId.current = null;
    };
  }, [user?.uid]); // 🔧 SEULE dépendance : user.uid

  // 🔧 Debug gameData changes
  useEffect(() => {
    if (gameData) {
      console.log('🎮 GameData updated:', {
        level: gameData.level,
        totalXp: gameData.totalXp,
        badges: gameData.badges?.length || 0,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  }, [gameData?.level, gameData?.totalXp, gameData?.badges?.length]);

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
