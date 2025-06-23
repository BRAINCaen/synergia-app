// ==========================================
// 📁 react-app/src/shared/hooks/useGameService.js
// Hook GameService COMPLET - Version Corrigée Anti-Boucle
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

  // ✅ CORRECTION: Refs pour éviter les re-créations
  const listenerRef = useRef(null);
  const isInitializedRef = useRef(false);

  // 🔄 Synchroniser les données depuis Firestore
  const syncGameData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const data = await gameService.getUserGameData(user.uid);
      setGameData(data);
      setError(null);
      isInitializedRef.current = true;
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

  // ✅ CORRECTION: Cleanup function stable
  const cleanup = useCallback(() => {
    if (listenerRef.current) {
      console.log('🛑 Cleanup real-time listener pour:', user?.uid);
      listenerRef.current();
      listenerRef.current = null;
    }
    if (user?.uid) {
      gameService.unsubscribeFromUserGameData(user.uid);
    }
    isInitializedRef.current = false;
  }, [user?.uid]);

  // 🔄 Écouter les changements en temps réel - VERSION CORRIGÉE
  useEffect(() => {
    // ✅ CORRECTION: Conditions strictes pour éviter la boucle
    if (!user?.uid) {
      console.log('🔇 useGameService: Pas d\'utilisateur, skip listener');
      cleanup();
      return;
    }

    // ✅ CORRECTION: Éviter de re-setup si déjà initialisé
    if (isInitializedRef.current && listenerRef.current) {
      console.log('🔇 useGameService: Listener déjà actif, skip re-setup');
      return;
    }

    console.log('🔄 Setup NOUVEAU real-time listener pour:', user.uid);

    // Synchronisation initiale si nécessaire
    if (!gameData?.level) {
      syncGameData();
    }

    // ✅ CORRECTION: Tracker le listener pour éviter les doublons
    let listenerActive = true;

    // Écoute en temps réel avec guard
    const unsubscribe = gameService.subscribeToUserGameData(
      user.uid,
      (data) => {
        if (!listenerActive) {
          console.log('🔇 Listener inactif, ignore update');
          return;
        }
        
        console.log('📡 Données temps réel reçues:', {
          level: data.level,
          totalXp: data.totalXp,
          badges: data.badges?.length || 0
        });
        
        // ✅ CORRECTION: Vérifier changement significatif avant update
        if (gameData && 
            gameData.totalXp === data.totalXp && 
            gameData.level === data.level && 
            (gameData.badges?.length || 0) === (data.badges?.length || 0)) {
          console.log('🔄 Pas de changement significatif, skip update');
          return;
        }
        
        if (gameData?.totalXp !== data.totalXp) {
          console.log('🎮 setGameData:', {
            prev: `L${gameData?.level || 0} - ${gameData?.totalXp || 0}XP`,
            new: `L${data.level} - ${data.totalXp}XP`
          });
        }
        
        setGameData(data);
        setLoading(false);
      }
    );

    // Sauvegarder la référence
    listenerRef.current = unsubscribe;
    isInitializedRef.current = true;

    // Cleanup function
    return () => {
      console.log('🛑 Cleanup real-time listener pour:', user.uid);
      listenerActive = false;
      if (unsubscribe) {
        unsubscribe();
      }
      gameService.unsubscribeFromUserGameData(user.uid);
      listenerRef.current = null;
    };
    
    // ✅ CORRECTION: Dépendances strictes pour éviter re-créations infinies
  }, [user?.uid]); // ✅ SEULEMENT user.uid

  // ✅ CORRECTION: useEffect séparé pour sync initial
  useEffect(() => {
    if (user?.uid && !gameData?.level && !isLoading && !isInitializedRef.current) {
      console.log('🔄 Sync initial gameData pour:', user.uid);
      syncGameData();
    }
  }, [user?.uid, gameData?.level, isLoading, syncGameData]);

  // 🧹 Cleanup lors du démontage ou logout
  useEffect(() => {
    if (!user) {
      cleanup();
    }
    
    return cleanup;
  }, [user, cleanup]);

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
    
    // Cleanup
    cleanup,
    
    // État de connexion
    isConnected: !!user?.uid
  };
};
