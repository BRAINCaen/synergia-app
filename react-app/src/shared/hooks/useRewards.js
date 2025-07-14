// ==========================================
// 📁 react-app/src/shared/hooks/useRewards.js
// HOOK PERSONNALISÉ POUR LE SYSTÈME DE RÉCOMPENSES
// ==========================================

import { useCallback, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { useRewardsStore } from '../stores/rewardsStore.js';
import { useGameStore } from '../stores/gameStore.js';

/**
 * 🎁 HOOK PERSONNALISÉ POUR LES RÉCOMPENSES
 */
export const useRewards = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { userStats } = useGameStore();
  const {
    availableRewards,
    teamRewards,
    userRewardHistory,
    pendingRequests,
    userXP,
    teamTotalXP,
    loading,
    error,
    loadAvailableRewards,
    loadTeamRewards,
    loadUserRewardHistory,
    requestReward,
    loadPendingRequests,
    approveRequest,
    rejectRequest,
    getRewardStats,
    getNextReward,
    canAffordReward,
    startListeningToPendingRequests,
    stopListeningToPendingRequests,
    clearError,
    resetStore
  } = useRewardsStore();

  // XP actuels de l'utilisateur
  const currentUserXP = userStats?.totalXp || 0;

  /**
   * 🚀 INITIALISER LES RÉCOMPENSES POUR UN UTILISATEUR
   */
  const initializeRewards = useCallback(async () => {
    if (!isAuthenticated || !user?.uid) {
      console.warn('⚠️ Utilisateur non connecté, impossible d\'initialiser les récompenses');
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      console.log('🎁 Initialisation système récompenses pour:', user.uid);
      
      // Charger les récompenses disponibles
      await loadAvailableRewards(currentUserXP);
      
      // Charger les récompenses d'équipe (XP simulé pour la démo)
      await loadTeamRewards(5000);
      
      // Charger l'historique utilisateur
      await loadUserRewardHistory(user.uid);
      
      console.log('✅ Système récompenses initialisé avec succès');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur initialisation récompenses:', error);
      return { success: false, error: error.message };
    }
  }, [isAuthenticated, user?.uid, currentUserXP, loadAvailableRewards, loadTeamRewards, loadUserRewardHistory]);

  /**
   * 🎁 DEMANDER UNE RÉCOMPENSE AVEC VALIDATION
   */
  const requestRewardSafely = useCallback(async (rewardId, rewardType = 'individual') => {
    if (!isAuthenticated || !user?.uid) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    // Vérifier si l'utilisateur a assez d'XP
    const rewardDetails = getRewardDetails(rewardId);
    if (!rewardDetails) {
      return { success: false, error: 'Récompense introuvable' };
    }

    if (currentUserXP < rewardDetails.xpCost) {
      return { success: false, error: 'XP insuffisants' };
    }

    try {
      console.log('🎯 Demande récompense:', { rewardId, rewardType, userId: user.uid });
      const result = await requestReward(user.uid, rewardId, rewardType);
      console.log('✅ Demande envoyée avec succès');
      return { success: true, ...result };
    } catch (error) {
      console.error('❌ Erreur demande récompense:', error);
      return { success: false, error: error.message };
    }
  }, [isAuthenticated, user?.uid, currentUserXP, requestReward]);

  /**
   * 👑 INITIALISER L'ADMINISTRATION (ADMIN SEULEMENT)
   */
  const initializeAdmin = useCallback(async () => {
    if (!isAuthenticated || !user?.uid) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      console.log('👑 Initialisation admin récompenses');
      
      // Charger les demandes en attente
      await loadPendingRequests();
      
      // Démarrer l'écoute en temps réel
      startListeningToPendingRequests();
      
      console.log('✅ Interface admin initialisée');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur initialisation admin:', error);
      return { success: false, error: error.message };
    }
  }, [isAuthenticated, user?.uid, loadPendingRequests, startListeningToPendingRequests]);

  /**
   * ✅ APPROUVER UNE DEMANDE (ADMIN)
   */
  const approveRewardRequest = useCallback(async (requestId, userCurrentXP) => {
    if (!isAuthenticated || !user?.uid) {
      return { success: false, error: 'Admin non connecté' };
    }

    try {
      const result = await approveRequest(requestId, user.uid, userCurrentXP);
      console.log('✅ Demande approuvée par admin');
      return { success: true, ...result };
    } catch (error) {
      console.error('❌ Erreur approbation admin:', error);
      return { success: false, error: error.message };
    }
  }, [isAuthenticated, user?.uid, approveRequest]);

  /**
   * ❌ REJETER UNE DEMANDE (ADMIN)
   */
  const rejectRewardRequest = useCallback(async (requestId, reason) => {
    if (!isAuthenticated || !user?.uid) {
      return { success: false, error: 'Admin non connecté' };
    }

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: 'Raison du rejet requise' };
    }

    try {
      const result = await rejectRequest(requestId, user.uid, reason);
      console.log('❌ Demande rejetée par admin');
      return { success: true, ...result };
    } catch (error) {
      console.error('❌ Erreur rejet admin:', error);
      return { success: false, error: error.message };
    }
  }, [isAuthenticated, user?.uid, rejectRequest]);

  /**
   * 🎯 OBTENIR LES DÉTAILS D'UNE RÉCOMPENSE
   */
  const getRewardDetails = useCallback((rewardId) => {
    // Rechercher dans les récompenses individuelles
    for (const category of availableRewards) {
      const reward = category.rewards.find(r => r.id === rewardId);
      if (reward) {
        return {
          ...reward,
          category: category.category,
          categoryIcon: category.icon,
          categoryColor: category.color
        };
      }
    }

    // Rechercher dans les récompenses d'équipe
    for (const category of teamRewards) {
      const reward = category.rewards.find(r => r.id === rewardId);
      if (reward) {
        return {
          ...reward,
          category: category.category,
          categoryIcon: category.icon,
          categoryColor: category.color,
          isTeamReward: true
        };
      }
    }

    return null;
  }, [availableRewards, teamRewards]);

  /**
   * 📊 OBTENIR LES STATISTIQUES COMPLÈTES
   */
  const getCompleteStats = useCallback(() => {
    const baseStats = getRewardStats();
    const nextReward = getNextReward();
    
    return {
      ...baseStats,
      currentXP: currentUserXP,
      teamXP: teamTotalXP,
      nextReward,
      canAffordNext: nextReward ? canAffordReward(nextReward.xpCost) : false,
      progressToNext: nextReward ? Math.min((currentUserXP / nextReward.xpCost) * 100, 100) : 100
    };
  }, [getRewardStats, getNextReward, currentUserXP, teamTotalXP, canAffordReward]);

  /**
   * 🎯 OBTENIR LES RÉCOMPENSES PAR CATÉGORIE
   */
  const getRewardsByCategory = useCallback((categoryName) => {
    return availableRewards.find(cat => cat.category === categoryName) || null;
  }, [availableRewards]);

  /**
   * 🏆 OBTENIR LES MEILLEURES RÉCOMPENSES ACCESSIBLES
   */
  const getTopAffordableRewards = useCallback((limit = 5) => {
    const affordableRewards = [];
    
    availableRewards.forEach(category => {
      category.rewards.forEach(reward => {
        if (canAffordReward(reward.xpCost)) {
          affordableRewards.push({
            ...reward,
            category: category.category,
            categoryIcon: category.icon
          });
        }
      });
    });

    // Trier par coût décroissant et prendre les meilleures
    return affordableRewards
      .sort((a, b) => b.xpCost - a.xpCost)
      .slice(0, limit);
  }, [availableRewards, canAffordReward]);

  /**
   * 💡 OBTENIR DES RECOMMANDATIONS DE RÉCOMPENSES
   */
  const getRecommendations = useCallback(() => {
    const recommendations = {
      affordable: getTopAffordableRewards(3),
      nextGoal: getNextReward(),
      popular: [], // À implémenter avec des données de popularité
      seasonal: [] // À implémenter avec des récompenses saisonnières
    };

    return recommendations;
  }, [getTopAffordableRewards, getNextReward]);

  // Initialiser automatiquement si l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && user?.uid && userStats) {
      initializeRewards();
    }
  }, [isAuthenticated, user?.uid, userStats, initializeRewards]);

  // Nettoyer à la déconnexion
  useEffect(() => {
    if (!isAuthenticated) {
      stopListeningToPendingRequests();
      resetStore();
    }
  }, [isAuthenticated, stopListeningToPendingRequests, resetStore]);

  return {
    // État
    availableRewards,
    teamRewards,
    userRewardHistory,
    pendingRequests,
    currentUserXP,
    teamTotalXP,
    loading,
    error,
    isAuthenticated,

    // Actions utilisateur
    initializeRewards,
    requestReward: requestRewardSafely,

    // Actions admin
    initializeAdmin,
    approveRequest: approveRewardRequest,
    rejectRequest: rejectRewardRequest,

    // Getters utiles
    getRewardDetails,
    getCompleteStats,
    getRewardsByCategory,
    getTopAffordableRewards,
    getRecommendations,
    canAffordReward,
    getNextReward,

    // Helpers
    hasRewards: availableRewards.length > 0,
    hasHistory: userRewardHistory.length > 0,
    hasPendingRequests: pendingRequests.length > 0,
    
    // Actions de nettoyage
    clearError,
    
    // Statistiques rapides
    stats: getCompleteStats()
  };
};

export default useRewards;
