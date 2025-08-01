// ==========================================
// 📁 react-app/src/shared/hooks/useBadges.js
// HOOK BADGES FIREBASE PUR - SANS MOCK
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { firebaseDataSyncService } from '../../core/services/firebaseDataSyncService.js';

/**
 * 🏅 HOOK BADGES FIREBASE PUR
 * Système de badges connecté 100% à Firebase
 */
export const useBadges = () => {
  const { user } = useAuthStore();
  
  // États
  const [userBadges, setUserBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [badgeProgress, setBadgeProgress] = useState({});
  const [stats, setStats] = useState(null);
  const [recentBadges, setRecentBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  // Charger les données badges
  useEffect(() => {
    if (user?.uid) {
      loadBadgeData();
    } else {
      resetBadgeData();
    }
  }, [user?.uid]);

  /**
   * 📊 CHARGER LES DONNÉES BADGES DEPUIS FIREBASE
   */
  const loadBadgeData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🏅 Chargement badges Firebase pour:', user.uid);

      // Récupérer les stats utilisateur complètes
      const userStats = await firebaseDataSyncService.getUserCompleteStats(user.uid);
      
      if (!userStats) {
        throw new Error('Impossible de récupérer les données utilisateur');
      }

      // Badges de l'utilisateur
      const badges = userStats.gamification.badges || [];
      setUserBadges(badges);

      // Tous les badges disponibles
      const availableBadges = getSystemBadges();
      setAllBadges(availableBadges);

      // Calculer la progression vers les badges
      const progress = calculateBadgeProgress(userStats, availableBadges);
      setBadgeProgress(progress);

      // Statistiques badges
      const badgeStats = calculateBadgeStats(badges, availableBadges);
      setStats(badgeStats);

      // Badges récents (derniers 5)
      const recent = badges
        .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
        .slice(0, 5);
      setRecentBadges(recent);

      console.log('✅ Badges chargés:', {
        utilisateur: badges.length,
        disponibles: availableBadges.length,
        progression: Object.keys(progress).length
      });

    } catch (err) {
      console.error('❌ Erreur chargement badges:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  /**
   * 🔍 VÉRIFIER LES NOUVEAUX BADGES
   */
  const checkBadges = useCallback(async () => {
    if (!user?.uid || checking) return [];

    try {
      setChecking(true);
      
      console.log('🔍 Vérification nouveaux badges...');
      
      // Récupérer les stats actuelles
      const userStats = await firebaseDataSyncService.getUserCompleteStats(user.uid);
      
      if (!userStats) return [];
      
      const availableBadges = getSystemBadges();
      const currentBadges = userStats.gamification.badges || [];
      const currentBadgeIds = currentBadges.map(b => b.id);
      
      const newBadges = [];
      
      // Vérifier chaque badge disponible
      for (const badge of availableBadges) {
        if (!currentBadgeIds.includes(badge.id)) {
          const shouldUnlock = checkBadgeCondition(badge, userStats);
          
          if (shouldUnlock) {
            // Débloquer le badge
            const unlockResult = await firebaseDataSyncService.unlockBadge(
              user.uid, 
              badge.id, 
              badge
            );
            
            if (unlockResult.success) {
              newBadges.push(unlockResult.badge);
              console.log('🏅 Nouveau badge débloqué:', badge.name);
            }
          }
        }
      }
      
      // Recharger les données si de nouveaux badges
      if (newBadges.length > 0) {
        await loadBadgeData();
      }
      
      return newBadges;
      
    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
      return [];
    } finally {
      setChecking(false);
    }
  }, [user?.uid, checking, loadBadgeData]);

  /**
   * 🏆 DÉBLOQUER UN BADGE MANUELLEMENT
   */
  const unlockBadge = useCallback(async (badgeId, badgeData) => {
    if (!user?.uid) return { success: false };

    try {
      const result = await firebaseDataSyncService.unlockBadge(user.uid, badgeId, badgeData);
      
      if (result.success) {
        // Recharger les données
        await loadBadgeData();
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur déblocage badge:', error);
      return { success: false, error: error.message };
    }
  }, [user?.uid, loadBadgeData]);

  /**
   * 🔄 FORCER LE RECHARGEMENT
   */
  const refreshBadges = useCallback(() => {
    if (user?.uid) {
      loadBadgeData();
    }
  }, [user?.uid, loadBadgeData]);

  /**
   * 🧹 RESET DES DONNÉES
   */
  const resetBadgeData = () => {
    setUserBadges([]);
    setAllBadges([]);
    setBadgeProgress({});
    setStats(null);
    setRecentBadges([]);
    setLoading(false);
    setError(null);
  };

  return {
    // Données principales
    userBadges,
    allBadges,
    badgeProgress,
    stats,
    recentBadges,
    
    // États
    loading,
    error,
    checking,
    
    // Actions
    checkBadges,
    unlockBadge,
    refreshBadges
  };
};

/**
 * 🎯 BADGES SYSTÈME DISPONIBLES
 */
const getSystemBadges = () => {
  return [
    // Badges d'accueil
    {
      id: 'welcome',
      name: 'Bienvenue !',
      description: 'Premiers pas dans Synergia',
      type: 'onboarding',
      rarity: 'common',
      xpReward: 25,
      icon: '👋',
      condition: 'user_created'
    },
    {
      id: 'first_login',
      name: 'Première Connexion',
      description: 'Première connexion à l\'application',
      type: 'onboarding',
      rarity: 'common',
      xpReward: 10,
      icon: '🚪',
      condition: 'login_count:1'
    },
    
    // Badges de tâches
    {
      id: 'first_task',
      name: 'Première Tâche',
      description: 'Première tâche complétée',
      type: 'productivity',
      rarity: 'common',
      xpReward: 30,
      icon: '✅',
      condition: 'tasks_completed:1'
    },
    {
      id: 'task_master',
      name: 'Maître des Tâches',
      description: '10 tâches complétées',
      type: 'productivity',
      rarity: 'uncommon',
      xpReward: 75,
      icon: '🎯',
      condition: 'tasks_completed:10'
    },
    {
      id: 'task_legend',
      name: 'Légende des Tâches',
      description: '50 tâches complétées',
      type: 'productivity',
      rarity: 'rare',
      xpReward: 200,
      icon: '🏆',
      condition: 'tasks_completed:50'
    },
    
    // Badges de niveau
    {
      id: 'level_up_5',
      name: 'Niveau 5',
      description: 'Atteindre le niveau 5',
      type: 'progression',
      rarity: 'uncommon',
      xpReward: 100,
      icon: '⭐',
      condition: 'level:5'
    },
    {
      id: 'level_up_10',
      name: 'Niveau 10',
      description: 'Atteindre le niveau 10',
      type: 'progression',
      rarity: 'rare',
      xpReward: 250,
      icon: '🌟',
      condition: 'level:10'
    },
    
    // Badges de streak
    {
      id: 'week_warrior',
      name: 'Guerrier Hebdomadaire',
      description: '7 jours de connexion consécutifs',
      type: 'consistency',
      rarity: 'uncommon',
      xpReward: 150,
      icon: '🔥',
      condition: 'login_streak:7'
    },
    {
      id: 'month_master',
      name: 'Maître du Mois',
      description: '30 jours de connexion consécutifs',
      type: 'consistency',
      rarity: 'epic',
      xpReward: 500,
      icon: '💎',
      condition: 'login_streak:30'
    },
    
    // Badges de projets
    {
      id: 'project_creator',
      name: 'Créateur de Projet',
      description: 'Premier projet créé',
      type: 'leadership',
      rarity: 'uncommon',
      xpReward: 100,
      icon: '🚀',
      condition: 'projects_created:1'
    },
    
    // Badges spéciaux
    {
      id: 'early_adopter',
      name: 'Early Adopter',
      description: 'Parmi les premiers utilisateurs',
      type: 'special',
      rarity: 'legendary',
      xpReward: 300,
      icon: '🏅',
      condition: 'special'
    },
    {
      id: 'beta_tester',
      name: 'Beta Testeur',
      description: 'Participation au programme beta',
      type: 'special',
      rarity: 'epic',
      xpReward: 200,
      icon: '🧪',
      condition: 'special'
    }
  ];
};

/**
 * ✅ VÉRIFIER LES CONDITIONS D'UN BADGE
 */
const checkBadgeCondition = (badge, userStats) => {
  const condition = badge.condition;
  const gamification = userStats.gamification;
  
  switch (condition) {
    case 'user_created':
      return true; // Toujours vrai pour utilisateur existant
      
    case 'tasks_completed:1':
      return gamification.tasksCompleted >= 1;
      
    case 'tasks_completed:10':
      return gamification.tasksCompleted >= 10;
      
    case 'tasks_completed:50':
      return gamification.tasksCompleted >= 50;
      
    case 'level:5':
      return gamification.level >= 5;
      
    case 'level:10':
      return gamification.level >= 10;
      
    case 'login_streak:7':
      return gamification.loginStreak >= 7;
      
    case 'login_streak:30':
      return gamification.loginStreak >= 30;
      
    case 'projects_created:1':
      return gamification.projectsCreated >= 1;
      
    case 'special':
      return false; // Badges spéciaux débloqués manuellement
      
    default:
      return false;
  }
};

/**
 * 📊 CALCULER LA PROGRESSION VERS LES BADGES
 */
const calculateBadgeProgress = (userStats, allBadges) => {
  const progress = {};
  const gamification = userStats.gamification;
  const currentBadgeIds = gamification.badges?.map(b => b.id) || [];
  
  allBadges.forEach(badge => {
    if (!currentBadgeIds.includes(badge.id)) {
      const condition = badge.condition;
      let current = 0;
      let required = 1;
      
      if (condition.includes('tasks_completed:')) {
        required = parseInt(condition.split(':')[1]);
        current = gamification.tasksCompleted || 0;
      } else if (condition.includes('level:')) {
        required = parseInt(condition.split(':')[1]);
        current = gamification.level || 1;
      } else if (condition.includes('login_streak:')) {
        required = parseInt(condition.split(':')[1]);
        current = gamification.loginStreak || 0;
      } else if (condition.includes('projects_created:')) {
        required = parseInt(condition.split(':')[1]);
        current = gamification.projectsCreated || 0;
      }
      
      if (current < required) {
        progress[badge.id] = {
          current: Math.min(current, required),
          required,
          percentage: Math.round((current / required) * 100)
        };
      }
    }
  });
  
  return progress;
};

/**
 * 📊 CALCULER LES STATISTIQUES DES BADGES
 */
const calculateBadgeStats = (userBadges, allBadges) => {
  const total = allBadges.length;
  const earned = userBadges.length;
  const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;
  
  // XP total des badges
  const totalXpFromBadges = userBadges.reduce((sum, badge) => 
    sum + (badge.xpReward || 0), 0
  );
  
  // Par rareté
  const byRarity = userBadges.reduce((acc, badge) => {
    const rarity = badge.rarity || 'common';
    acc[rarity] = (acc[rarity] || 0) + 1;
    return acc;
  }, {});
  
  // Par catégorie
  const byCategory = userBadges.reduce((acc, badge) => {
    const category = badge.type || 'other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  return {
    total,
    earned,
    percentage,
    totalXpFromBadges,
    byRarity,
    byCategory
  };
};

export default useBadges;
