// ==========================================
// 📁 react-app/src/shared/hooks/useTeamPool.js
// HOOK POUR GÉRER LA CAGNOTTE COLLECTIVE XP
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import teamPoolService from '../../core/services/teamPoolService.js';

/**
 * 🏆 HOOK POUR LA CAGNOTTE COLLECTIVE D'ÉQUIPE
 * Gère l'affichage et les interactions avec la cagnotte XP partagée
 */
export const useTeamPool = (options = {}) => {
  const { 
    autoInit = true,
    realTimeUpdates = true,
    enableContributions = true 
  } = options;
  
  const { user, isAuthenticated } = useAuthStore();
  
  // 📊 ÉTATS DE LA CAGNOTTE
  const [poolData, setPoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributing, setContributing] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  
  // 📈 DONNÉES CALCULÉES
  const [stats, setStats] = useState({
    totalXP: 0,
    currentLevel: 'BRONZE',
    nextLevel: 'SILVER',
    progressToNext: { progress: 0, xpNeeded: 1000, nextThreshold: 1000 },
    affordableRewards: [],
    contributorsCount: 0,
    totalContributions: 0
  });

  /**
   * 🚀 INITIALISER LA CAGNOTTE
   */
  const initializePool = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 [USE-TEAM-POOL] Initialisation...');
      
      // Initialiser la cagnotte si nécessaire
      await teamPoolService.initializeTeamPool();
      
      // Charger les données actuelles
      const result = await teamPoolService.getPoolStats();
      
      if (result.success) {
        setPoolData(result.data);
        updateStats(result.data);
        console.log('✅ [USE-TEAM-POOL] Cagnotte chargée:', result.data);
      } else {
        setError(result.error);
        console.error('❌ [USE-TEAM-POOL] Erreur chargement:', result.error);
      }
      
    } catch (err) {
      setError(err.message);
      console.error('❌ [USE-TEAM-POOL] Erreur initialisation:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * 📊 METTRE À JOUR LES STATISTIQUES
   */
  const updateStats = useCallback((data) => {
    setStats({
      totalXP: data.totalXP || 0,
      currentLevel: data.currentLevel || 'BRONZE',
      nextLevel: data.nextLevel,
      progressToNext: data.progressToNext || { progress: 0, xpNeeded: 1000, nextThreshold: 1000 },
      affordableRewards: data.canPurchase || [],
      contributorsCount: data.contributorsCount || 0,
      totalContributions: data.totalContributions || 0,
      weeklyContributions: data.statistics?.weeklyContributions || 0,
      monthlyContributions: data.statistics?.monthlyContributions || 0,
      averageContribution: data.statistics?.averageContribution || 0
    });
  }, []);

  /**
   * 💰 CONTRIBUER À LA CAGNOTTE (Manuel)
   */
  const contributeManually = useCallback(async (amount) => {
    if (!user?.uid || contributing) return { success: false, error: 'Action en cours' };
    
    setContributing(true);
    
    try {
      console.log('💰 [USE-TEAM-POOL] Contribution manuelle:', amount);
      
      const result = await teamPoolService.contributeToPool(
        user.uid,
        user.email,
        amount,
        'manual_contribution',
        true
      );
      
      if (result.success && result.contributed > 0) {
        console.log(`✅ [USE-TEAM-POOL] Contribution réussie: +${result.contributed} XP`);
        
        // Rafraîchir les données
        await refreshPoolData();
        
        return { 
          success: true, 
          contributed: result.contributed,
          newTotal: result.newPoolTotal,
          levelChanged: result.levelChanged,
          newLevel: result.newLevel
        };
      } else {
        return { success: false, error: 'Contribution échouée' };
      }
      
    } catch (err) {
      console.error('❌ [USE-TEAM-POOL] Erreur contribution:', err);
      return { success: false, error: err.message };
    } finally {
      setContributing(false);
    }
  }, [user?.uid, contributing]);

  /**
   * 🏪 ACHETER UNE RÉCOMPENSE D'ÉQUIPE
   */
  const purchaseTeamReward = useCallback(async (reward) => {
    if (!user?.uid || purchasing) return { success: false, error: 'Action en cours' };
    
    setPurchasing(true);
    
    try {
      console.log('🏪 [USE-TEAM-POOL] Achat récompense:', reward.name);
      
      // Vérifier si assez d'XP dans la cagnotte
      if (stats.totalXP < reward.cost) {
        return { 
          success: false, 
          error: `XP insuffisants dans la cagnotte. Disponible: ${stats.totalXP}, Requis: ${reward.cost}` 
        };
      }
      
      const result = await teamPoolService.purchaseTeamReward(
        reward.id,
        reward,
        user.uid
      );
      
      if (result.success) {
        console.log('✅ [USE-TEAM-POOL] Récompense achetée avec succès!');
        
        // Rafraîchir les données
        await refreshPoolData();
        
        return { 
          success: true,
          purchaseId: result.purchaseId,
          newPoolTotal: result.newPoolTotal
        };
      } else {
        return { success: false, error: result.error };
      }
      
    } catch (err) {
      console.error('❌ [USE-TEAM-POOL] Erreur achat:', err);
      return { success: false, error: err.message };
    } finally {
      setPurchasing(false);
    }
  }, [user?.uid, purchasing, stats.totalXP]);

  /**
   * 🔄 RAFRAÎCHIR LES DONNÉES
   */
  const refreshPoolData = useCallback(async () => {
    try {
      const result = await teamPoolService.getPoolStats();
      if (result.success) {
        setPoolData(result.data);
        updateStats(result.data);
      }
    } catch (err) {
      console.error('❌ [USE-TEAM-POOL] Erreur refresh:', err);
    }
  }, [updateStats]);

  /**
   * 🏆 OBTENIR LES RÉCOMPENSES DISPONIBLES
   */
  const getAvailableRewards = useCallback(() => {
    return teamPoolService.getTeamRewards();
  }, []);

  /**
   * 🎯 OBTENIR LES RÉCOMPENSES ACCESSIBLES
   */
  const getAffordableRewards = useCallback(() => {
    return stats.affordableRewards;
  }, [stats.affordableRewards]);

  /**
   * 📈 CALCULER LA CONTRIBUTION AUTOMATIQUE
   */
  const calculateAutoContribution = useCallback((xpGained) => {
    return teamPoolService.CONFIG.AUTO_CONTRIBUTION_RATE * xpGained;
  }, []);

  // 🚀 INITIALISATION AUTOMATIQUE
  useEffect(() => {
    if (autoInit) {
      // Initialiser même si pas encore authentifié (avec valeurs par défaut)
      if (isAuthenticated) {
        initializePool();
      } else {
        // Mettre fin au chargement avec valeurs par défaut si pas authentifié
        console.log('⚠️ [USE-TEAM-POOL] Non authentifié, valeurs par défaut');
        setLoading(false);
      }
    }
  }, [autoInit, isAuthenticated, initializePool]);

  // 👂 ÉCOUTE DES CHANGEMENTS EN TEMPS RÉEL
  useEffect(() => {
    if (!realTimeUpdates || !isAuthenticated) return;

    console.log('👂 [USE-TEAM-POOL] Démarrage écoute temps réel...');
    
    const unsubscribe = teamPoolService.subscribeToPoolChanges((result) => {
      if (result.success) {
        console.log('🔄 [USE-TEAM-POOL] Mise à jour temps réel:', result.data);
        setPoolData(result.data);
        updateStats(result.data);
      } else {
        console.error('❌ [USE-TEAM-POOL] Erreur écoute:', result.error);
      }
    });

    return () => {
      if (unsubscribe) {
        console.log('🔇 [USE-TEAM-POOL] Arrêt écoute temps réel');
        unsubscribe();
      }
    };
  }, [realTimeUpdates, isAuthenticated, updateStats]);

  // 🎉 ÉCOUTER LES ÉVÉNEMENTS DE NIVEAU SUPÉRIEUR
  useEffect(() => {
    const handleLevelUp = (event) => {
      const { newLevel, totalXP } = event.detail;
      console.log(`🎉 [USE-TEAM-POOL] NIVEAU SUPÉRIEUR DÉTECTÉ: ${newLevel} (${totalXP} XP)`);
      
      // Déclencher une notification ou animation
      // TODO: Ajouter système de notifications
    };

    window.addEventListener('teamPoolLevelUp', handleLevelUp);

    return () => {
      window.removeEventListener('teamPoolLevelUp', handleLevelUp);
    };
  }, []);

  return {
    // === DONNÉES ===
    poolData,
    stats,
    
    // === ÉTATS ===
    loading,
    error,
    contributing,
    purchasing,
    isReady: !loading && !error && poolData !== null,
    
    // === ACTIONS ===
    contributeManually,
    purchaseTeamReward,
    refreshPoolData,
    initializePool,
    
    // === UTILITAIRES ===
    getAvailableRewards,
    getAffordableRewards,
    calculateAutoContribution,
    
    // === INFORMATIONS ===
    canContribute: enableContributions && isAuthenticated && user?.uid,
    canPurchase: isAuthenticated && user?.uid,
    autoContributionRate: teamPoolService.CONFIG.AUTO_CONTRIBUTION_RATE * 100, // En pourcentage
    poolLevels: teamPoolService.CONFIG.POOL_LEVELS
  };
};
