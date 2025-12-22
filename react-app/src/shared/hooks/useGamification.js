// src/shared/hooks/useGamification.js
// Hook personnalisé pour utiliser facilement les fonctionnalités de gamification
import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { useGameStore } from '../stores/gameStore.js';

export const useGamification = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { 
    userStats, 
    notifications, 
    loading, 
    error,
    addXP: gameStoreAddXP,
    loadLeaderboard,
    markNotificationAsRead,
    clearNotifications,
    getCurrentLevel,
    getLevelProgress,
    getUnlockedBadges,
    getAvailableBadges,
    getUserInsights,
    getUserRank,
    predictTimeToNextLevel,
    getXpRecommendations
  } = useGameStore();

  // ✅ Fonction addXP simplifiée qui ne nécessite plus userId
  const addXP = useCallback(async (amount, reason = 'Activité') => {
    if (!isAuthenticated || !user?.uid) {
      console.warn('⚠️ Utilisateur non connecté, impossible d\'ajouter XP');
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      console.log('🎯 Hook addXP:', { amount, reason, userId: user.uid });
      const result = await gameStoreAddXP(amount, reason);
      return { success: true, ...result };
    } catch (error) {
      console.error('❌ Erreur hook addXP:', error);
      return { success: false, error: error.message };
    }
  }, [isAuthenticated, user?.uid, gameStoreAddXP]);

  // Fonction pour ajouter XP avec différents événements prédéfinis
  const addXPForEvent = useCallback(async (event, metadata = {}) => {
    const events = {
      'profile_update': { amount: 10, reason: 'Mise à jour du profil' },
      'task_create': { amount: 5, reason: 'Création de tâche' },
      'task_complete_easy': { amount: 10, reason: 'Tâche facile terminée' },
      'task_complete_medium': { amount: 20, reason: 'Tâche moyenne terminée' },
      'task_complete_hard': { amount: 35, reason: 'Tâche difficile terminée' },
      'project_create': { amount: 25, reason: 'Création de projet' },
      'daily_login': { amount: 5, reason: 'Connexion quotidienne' },
      'streak_bonus': { amount: 15, reason: 'Bonus série de connexions' },
      'first_task': { amount: 15, reason: 'Première tâche créée' },
      'first_project': { amount: 30, reason: 'Premier projet créé' }
    };

    const eventConfig = events[event];
    if (!eventConfig) {
      console.warn(`⚠️ Événement XP inconnu: ${event}`);
      return { success: false, error: 'Événement inconnu' };
    }

    let { amount, reason } = eventConfig;
    
    // Personnaliser le message avec les métadonnées
    if (metadata.taskTitle) {
      reason = `${reason}: ${metadata.taskTitle}`;
    }
    if (metadata.projectName) {
      reason = `${reason}: ${metadata.projectName}`;
    }

    return await addXP(amount, reason);
  }, [addXP]);

  // Vérifier si l'utilisateur peut gagner de l'XP
  const canEarnXP = useCallback(() => {
    return isAuthenticated && user?.uid;
  }, [isAuthenticated, user?.uid]);

  // Obtenir le niveau actuel de l'utilisateur
  const currentLevel = getCurrentLevel();
  const levelProgress = getLevelProgress();

  return {
    // État
    userStats,
    notifications,
    loading,
    error,
    isAuthenticated,
    currentLevel,
    levelProgress,

    // Actions principales
    addXP,
    addXPForEvent,
    canEarnXP,

    // Actions secondaires
    loadLeaderboard,
    markNotificationAsRead,
    clearNotifications,

    // Getters
    getUnlockedBadges,
    getAvailableBadges,
    getUserInsights,
    getUserRank,
    predictTimeToNextLevel,
    getXpRecommendations,

    // Helpers
    hasNotifications: notifications.length > 0,
    unreadNotificationsCount: notifications.length,
    isNewUser: userStats?.totalXp === 0,
    
    // Statistiques rapides
    totalXP: userStats?.totalXp || 0,
    weeklyXP: userStats?.weeklyXp || 0,
    monthlyXP: userStats?.monthlyXp || 0,
    tasksCompleted: userStats?.tasksCompleted || 0,
    loginStreak: userStats?.loginStreak || 0,
    badgeCount: userStats?.badges?.length || 0
  };
};

export default useGamification;
