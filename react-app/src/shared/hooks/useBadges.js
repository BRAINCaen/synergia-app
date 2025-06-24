// ==========================================
// 📁 react-app/src/shared/hooks/useBadges.js
// Hook React personnalisé pour la gestion des badges - EXPORTS CORRIGÉS
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import BadgeEngine from '../../core/services/badgeEngine.js';
import BadgeIntegrationService from '../../core/services/badgeIntegrationService.js';

/**
 * 🏆 HOOK PERSONNALISÉ POUR LES BADGES
 * 
 * Fournit une interface React simple pour interagir avec le système de badges
 * - État des badges utilisateur
 * - Progression vers les badges
 * - Notifications en temps réel
 * - Actions de vérification manuelle
 */
export const useBadges = () => {
  const { user } = useAuthStore();
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [badgeProgress, setBadgeProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentBadges, setRecentBadges] = useState([]);
  const [error, setError] = useState(null);

  /**
   * 📊 CHARGER LES DONNÉES INITIALES
   */
  const loadBadgeData = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Charger tous les badges disponibles
      const allBadges = BadgeEngine.getAllBadges();
      setBadges(allBadges);

      // Charger les données utilisateur
      const userData = await BadgeEngine.getUserAnalytics(user.uid);
      setUserBadges(userData.badges || []);

      // Charger la progression pour les badges non débloqués
      const progressData = {};
      for (const badge of allBadges) {
        if (!userData.badges?.includes(badge.id)) {
          const progress = await BadgeEngine.getBadgeProgress(badge.id, user.uid);
          if (progress) {
            progressData[badge.id] = progress;
          }
        }
      }
      setBadgeProgress(progressData);

      // Charger les statistiques
      const badgeStats = await BadgeIntegrationService.getBadgeStats(user.uid);
      setStats(badgeStats);

      // Charger les badges récents
      const recent = await BadgeIntegrationService.getRecentBadges(user.uid, 5);
      setRecentBadges(recent);

    } catch (err) {
      console.error('❌ Erreur loadBadgeData:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  /**
   * 🔍 VÉRIFICATION MANUELLE DES BADGES
   */
  const checkBadges = useCallback(async () => {
    if (!user?.uid || checking) return [];

    try {
      setChecking(true);
      
      const newBadges = await BadgeIntegrationService.manualBadgeCheck(user.uid);
      
      if (newBadges && newBadges.length > 0) {
        // Recharger les données après de nouveaux badges
        await loadBadgeData();
        return newBadges;
      }

      return [];

    } catch (err) {
      console.error('❌ Erreur checkBadges:', err);
      setError(err.message);
      return [];
    } finally {
      setChecking(false);
    }
  }, [user?.uid, checking, loadBadgeData]);

  /**
   * 🎯 OBTENIR UN BADGE SPÉCIFIQUE
   */
  const getBadge = useCallback((badgeId) => {
    return badges.find(badge => badge.id === badgeId);
  }, [badges]);

  /**
   * ✅ VÉRIFIER SI UN BADGE EST DÉBLOQUÉ
   */
  const isBadgeUnlocked = useCallback((badgeId) => {
    return userBadges.includes(badgeId);
  }, [userBadges]);

  /**
   * 📈 OBTENIR LA PROGRESSION D'UN BADGE
   */
  const getBadgeProgressById = useCallback((badgeId) => {
    return badgeProgress[badgeId] || null;
  }, [badgeProgress]);

  /**
   * 📂 OBTENIR LES BADGES PAR CATÉGORIE
   */
  const getBadgesByCategory = useCallback((category) => {
    if (category === 'all') return badges;
    return badges.filter(badge => badge.category === category);
  }, [badges]);

  /**
   * 💎 OBTENIR LES BADGES PAR RARETÉ
   */
  const getBadgesByRarity = useCallback((rarity) => {
    if (rarity === 'all') return badges;
    return badges.filter(badge => badge.rarity === rarity);
  }, [badges]);

  /**
   * 🏆 OBTENIR LES BADGES DÉBLOQUÉS
   */
  const getUnlockedBadges = useCallback(() => {
    return badges.filter(badge => userBadges.includes(badge.id));
  }, [badges, userBadges]);

  /**
   * 🔒 OBTENIR LES BADGES VERROUILLÉS
   */
  const getLockedBadges = useCallback(() => {
    return badges.filter(badge => !userBadges.includes(badge.id));
  }, [badges, userBadges]);

  /**
   * 📊 OBTENIR LES STATISTIQUES PAR CATÉGORIE
   */
  const getStatsByCategory = useCallback(() => {
    if (!stats?.byCategory) return {};
    return stats.byCategory;
  }, [stats]);

  /**
   * 💎 OBTENIR LES STATISTIQUES PAR RARETÉ
   */
  const getStatsByRarity = useCallback(() => {
    if (!stats?.byRarity) return {};
    return stats.byRarity;
  }, [stats]);

  /**
   * 🎯 OBTENIR LES BADGES PROCHES DU DÉBLOCAGE
   */
  const getNearCompletionBadges = useCallback(async (threshold = 80) => {
    if (!user?.uid) return [];
    
    try {
      return await BadgeIntegrationService.getNearCompletionBadges(user.uid, threshold);
    } catch (error) {
      console.error('❌ Erreur getNearCompletionBadges:', error);
      return [];
    }
  }, [user?.uid]);

  /**
   * 🔄 ACTUALISER LES DONNÉES
   */
  const refreshBadgeData = useCallback(async () => {
    await loadBadgeData();
  }, [loadBadgeData]);

  /**
   * 📋 OBTENIR LE BADGE PROGRESS (alias pour compatibilité)
   */
  const getBadgeProgress = useCallback((badgeId) => {
    return getBadgeProgressById(badgeId);
  }, [getBadgeProgressById]);

  // Charger les données au montage et quand l'utilisateur change
  useEffect(() => {
    loadBadgeData();
  }, [loadBadgeData]);

  // Écouter les événements de badges débloqués pour actualiser
  useEffect(() => {
    const handleBadgeUnlocked = () => {
      // Recharger les données après un court délai pour laisser Firebase se synchroniser
      setTimeout(() => {
        loadBadgeData();
      }, 1000);
    };

    window.addEventListener('badgeUnlocked', handleBadgeUnlocked);

    return () => {
      window.removeEventListener('badgeUnlocked', handleBadgeUnlocked);
    };
  }, [loadBadgeData]);

  // Calculer les statistiques dérivées
  const completionPercentage = badges.length > 0 
    ? Math.round((userBadges.length / badges.length) * 100) 
    : 0;

  const nextBadge = getLockedBadges().find(badge => {
    const progress = getBadgeProgress(badge.id);
    return progress && progress.percentage > 0;
  });

  return {
    // États principaux
    badges,
    userBadges,
    badgeProgress,
    loading,
    checking,
    stats,
    recentBadges,
    error,

    // Statistiques dérivées
    completionPercentage,
    nextBadge,

    // Actions
    checkBadges,
    refreshBadgeData,

    // Getters
    getBadge,
    isBadgeUnlocked,
    getBadgeProgress,
    getBadgeProgressById,
    getBadgesByCategory,
    getBadgesByRarity,
    getUnlockedBadges,
    getLockedBadges,
    getStatsByCategory,
    getStatsByRarity,
    getNearCompletionBadges
  };
};

// Export par défaut pour compatibilité
const useBadges = () => {
  return useBadges();
};

export default useBadges;
