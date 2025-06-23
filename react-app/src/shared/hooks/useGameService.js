// ==========================================
// 📁 react-app/src/shared/hooks/useGameService.js
// Hook Gamification OPTIMISÉ - Évite les boucles de re-render
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

  // 🔄 Synchroniser les données depuis Firestore - OPTIMISÉ
  const syncGameData = useCallback(async () => {
    if (!user?.uid) return;

    try {
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
      
      console.log('✅ Données normalisées:', normalizedData);
      setGameData(normalizedData);
      setError(null);
    } catch (error) {
      console.error('❌ Erreur sync game data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]); // 🔧 FIX: Retirer les dépendances qui causent des boucles

  // ⭐ Ajouter de l'XP avec feedback visuel - OPTIMISÉ
  const addXP = useCallback(async (amount, source = 'unknown') => {
    if (!user?.uid) return null;

    try {
      console.log(`🎯 Ajout XP: +${amount} (${source})`);
      const result = await gameService.addXP(user.uid, amount, source);
      
      // 🔧 CORRECTION: Mise à jour immédiate ET attendre la propagation
      const normalizedResult = {
        ...result,
        totalXp: result.totalXp || result.xp || 0,
        xp: result.xp || result.totalXp || 0,
        level: result.level || 1,
        badges: result.badges || gameData?.badges || []
      };
      
      console.log('✅ Résultat XP normalisé:', normalizedResult);
      
      // Mise à jour immédiate
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
      
      // 🔧 FIX: Synchronisation différée pour éviter les conflits
      setTimeout(() => {
        syncGameData();
      }, 1000);
      
      return normalizedResult;
    } catch (error) {
      console.error('❌ Erreur ajout XP:', error);
      setError(error.message);
      return null;
    }
  }, [user?.uid, gameData?.badges]); // 🔧 FIX: Dépendances minimales

  // 🏅 Débloquer un badge - OPTIMISÉ
  const unlockBadge = useCallback(async (badge) => {
    if (!user?.uid) return false;

    try {
      const success = await gameService.unlockBadge(user.uid, badge);
      if (success) {
        showBadgeNotification(badge);
        addRecentActivity({
          type: 'badge_unlocked',
          badge: badge.name,
          category: badge.category
        });
        
        // Synchronisation différée
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
  }, [user?.uid]);

  // 🎯 Actions de gamification rapides - STABLES
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

  // 🧮 Fonctions de calcul utiles - CORRIGÉES
  const calculations = {
    getProgressToNextLevel: () => {
      if (!gameData || !gameData.level) return 0;
      const percentage = getters.getProgressPercentage();
      console.log('🧮 Progress percentage from getter:', percentage);
      return Math.min(percentage / 100, 1); // Retourner entre 0 et 1
    },
    
    getXPNeededForNextLevel: () => {
      if (!gameData) return 100;
      const needed = getters.getXPForNextLevel();
      console.log('🧮 XP needed from getter:', needed);
      return needed;
    },
    
    getBadgesByCategory: (category) => {
      if (!gameData?.badges) return [];
      return gameData.badges.filter(badge => badge.category === category);
    }
  };

  // 🔄 Écouter les changements en temps réel - OPTIMISÉ
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

    console.log('🔄 Setup real-time listener pour:', user.uid);

    // Cleanup précédent si changement d'utilisateur
    if (isListenerSetup.current && currentUserId.current !== user.uid) {
      console.log('🛑 Cleanup ancien listener');
      gameService.unsubscribeFromUserGameData(currentUserId.current);
    }

    // Synchronisation initiale seulement si pas de données
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
          xp: data.xp,
          totalXp: data.totalXp,
          badges: data.badges?.length
        });
        
        // Normaliser les données
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
      console.log('🛑 Cleanup real-time listener');
      gameService.unsubscribeFromUserGameData(user.uid);
      isListenerSetup.current = false;
      currentUserId.current = null;
    };
  }, [user?.uid]); // 🔧 FIX: Seul user.uid comme dépendance

  // 🔧 NOUVEAU: Force refresh si données incohérentes
  useEffect(() => {
    if (gameData) {
      console.log('🎮 GameData current:', {
        level: gameData.level,
        xp: gameData.xp,
        totalXp: gameData.totalXp,
        badges: gameData.badges?.length || 0
      });

      // Vérifier la cohérence
      if (gameData.xp !== gameData.totalXp && Math.abs(gameData.xp - gameData.totalXp) > 1) {
        console.warn('⚠️ Incohérence détectée, resync...');
        setTimeout(() => {
          syncGameData();
        }, 2000);
      }
    }
  }, [gameData?.level, gameData?.xp, gameData?.totalXp]); // Seulement les valeurs importantes

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
