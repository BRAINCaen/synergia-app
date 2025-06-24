// ==========================================
// 📁 react-app/src/hooks/useBadges.js
// Hook React personnalisé pour la gestion des badges
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import BadgeEngine from '../core/services/badgeEngine.js';
import BadgeIntegrationService from '../core/services/badgeIntegrationService.js';

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
    if (!user?.uid || checking) return;

    try {
      setChecking(true);
      
      const newBadges = await BadgeIntegrationService.manualBadgeCheck(user.uid);
      
      if (newBadges.length > 0) {
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
  const getBadgeProgress = useCallback((badgeId) => {
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
   * 📊 OBTENIR LES CATÉGORIES DISPONIBLES
   */
  const getCategories = useCallback(() => {
    const categories = [...new Set(badges.map(badge => badge.category))];
    return categories.sort();
  }, [badges]);

  /**
   * 💫 OBTENIR LES RARETÉS DISPONIBLES
   */
  const getRarities = useCallback(() => {
    const rarities = [...new Set(badges.map(badge => badge.rarity))];
    const order = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    return rarities.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [badges]);

  /**
   * 🎯 CALCULER LE POURCENTAGE DE COMPLÉTION GLOBAL
   */
  const getCompletionPercentage = useCallback(() => {
    if (badges.length === 0) return 0;
    return Math.round((userBadges.length / badges.length) * 100);
  }, [badges.length, userBadges.length]);

  /**
   * 🌟 OBTENIR LE PROCHAIN BADGE À DÉBLOQUER
   */
  const getNextBadge = useCallback(() => {
    const lockedBadges = getLockedBadges();
    
    // Trier par progression (plus proche de la complétion)
    const sortedByProgress = lockedBadges
      .map(badge => ({
        ...badge,
        progress: getBadgeProgress(badge.id)
      }))
      .filter(badge => badge.progress)
      .sort((a, b) => b.progress.percentage - a.progress.percentage);

    return sortedByProgress[0] || null;
  }, [getLockedBadges, getBadgeProgress]);

  // 🎧 ÉCOUTER LES ÉVÉNEMENTS DE BADGES
  useEffect(() => {
    const handleBadgeAwarded = (event) => {
      const { badges: newBadges, userId } = event.detail;
      
      if (userId === user?.uid) {
        console.log('🎉 Nouveaux badges reçus:', newBadges);
        setRecentBadges(prev => [...newBadges, ...prev].slice(0, 10)); // Garder les 10 derniers
        
        // Recharger les données
        loadBadgeData();
      }
    };

    const handleBadgeUnlocked = (event) => {
      const { badge } = event.detail;
      console.log('🏆 Badge débloqué:', badge);
      
      // Mettre à jour la liste des badges récents
      setRecentBadges(prev => [badge, ...prev].slice(0, 10));
    };

    window.addEventListener('badgesAwarded', handleBadgeAwarded);
    window.addEventListener('badgeUnlocked', handleBadgeUnlocked);

    return () => {
      window.removeEventListener('badgesAwarded', handleBadgeAwarded);
      window.removeEventListener('badgeUnlocked', handleBadgeUnlocked);
    };
  }, [user?.uid, loadBadgeData]);

  // 📊 CHARGER LES DONNÉES AU MONTAGE ET CHANGEMENT D'UTILISATEUR
  useEffect(() => {
    loadBadgeData();
  }, [loadBadgeData]);

  // 🔄 RAFRAÎCHISSEMENT PÉRIODIQUE (optionnel)
  useEffect(() => {
    if (!user?.uid) return;

    const interval = setInterval(() => {
      // Rafraîchir les statistiques toutes les 2 minutes
      BadgeIntegrationService.getBadgeStats(user.uid).then(setStats);
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.uid]);

  return {
    // 📊 État des données
    badges,
    userBadges,
    badgeProgress,
    stats,
    recentBadges,
    loading,
    checking,
    error,

    // 🔧 Actions
    checkBadges,
    loadBadgeData,

    // 🔍 Fonctions utilitaires
    getBadge,
    isBadgeUnlocked,
    getBadgeProgress,
    getBadgesByCategory,
    getBadgesByRarity,
    getUnlockedBadges,
    getLockedBadges,
    getCategories,
    getRarities,
    getCompletionPercentage,
    getNextBadge,

    // 📈 Statistiques calculées
    unlockedCount: userBadges.length,
    totalCount: badges.length,
    completionPercentage: getCompletionPercentage(),
    nextBadge: getNextBadge()
  };
};

/**
 * 🎯 HOOK SIMPLIFIÉ POUR LES STATISTIQUES UNIQUEMENT
 * Utile pour les widgets ou composants légers
 */
export const useBadgeStats = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    BadgeIntegrationService.getBadgeStats(user.uid)
      .then(setStats)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  return { stats, loading };
};

/**
 * 🏆 HOOK POUR UN BADGE SPÉCIFIQUE
 * Surveille l'état d'un badge particulier
 */
export const useBadge = (badgeId) => {
  const { getBadge, isBadgeUnlocked, getBadgeProgress } = useBadges();
  
  const badge = getBadge(badgeId);
  const isUnlocked = isBadgeUnlocked(badgeId);
  const progress = getBadgeProgress(badgeId);

  return {
    badge,
    isUnlocked,
    progress,
    exists: !!badge
  };
};

export default useBadges;
