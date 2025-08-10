// ==========================================
// 📁 react-app/src/shared/hooks/useBadges.js
// HOOK BADGES ENHANCED - AJOUT DES BADGES SYNERGIA
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import firebaseDataSyncService from '../../core/services/firebaseDataSyncService.js';
import synergiaBadgeService, { SYNERGIA_BADGE_DEFINITIONS } from '../../core/services/synergiaBadgeService.js';

/**
 * 🏆 BADGES SYSTÈME DE BASE (existants)
 */
const getSystemBadges = () => [
  {
    id: 'first_login',
    name: 'Bienvenue !',
    description: 'Première connexion à Synergia',
    icon: '👋',
    rarity: 'common',
    xpReward: 10,
    type: 'milestone',
    condition: 'first_login',
    category: 'general'
  },
  {
    id: 'task_beginner',
    name: 'Premier Pas',
    description: 'Première tâche complétée',
    icon: '✅',
    rarity: 'common',
    xpReward: 20,
    type: 'achievement',
    condition: 'tasks_completed:1',
    category: 'productivity'
  },
  {
    id: 'task_enthusiast',
    name: 'Enthousiaste',
    description: 'Compléter 5 tâches',
    icon: '🔥',
    rarity: 'uncommon',
    xpReward: 50,
    type: 'achievement',
    condition: 'tasks_completed:5',
    category: 'productivity'
  },
  {
    id: 'task_expert',
    name: 'Expert',
    description: 'Compléter 25 tâches',
    icon: '⚡',
    rarity: 'rare',
    xpReward: 100,
    type: 'achievement',
    condition: 'tasks_completed:25',
    category: 'productivity'
  },
  {
    id: 'task_master',
    name: 'Maître des Tâches',
    description: 'Compléter 100 tâches',
    icon: '👑',
    rarity: 'epic',
    xpReward: 250,
    type: 'achievement',
    condition: 'tasks_completed:100',
    category: 'productivity'
  },
  {
    id: 'level_5',
    name: 'Niveau 5',
    description: 'Atteindre le niveau 5',
    icon: '🌟',
    rarity: 'uncommon',
    xpReward: 75,
    type: 'level',
    condition: 'level:5',
    category: 'progression'
  },
  {
    id: 'level_10',
    name: 'Niveau 10',
    description: 'Atteindre le niveau 10',
    icon: '💎',
    rarity: 'rare',
    xpReward: 150,
    type: 'level',
    condition: 'level:10',
    category: 'progression'
  },
  {
    id: 'streak_champion',
    name: 'Champion de Série',
    description: 'Connexion quotidienne pendant 7 jours',
    icon: '🔥',
    rarity: 'rare',
    xpReward: 100,
    type: 'streak',
    condition: 'login_streak:7',
    category: 'engagement'
  },
  {
    id: 'streak_legend',
    name: 'Légende de Série',
    description: 'Connexion quotidienne pendant 30 jours',
    icon: '🏆',
    rarity: 'epic',
    xpReward: 300,
    type: 'streak',
    condition: 'login_streak:30',
    category: 'engagement'
  },
  {
    id: 'project_starter',
    name: 'Lanceur de Projet',
    description: 'Créer son premier projet',
    icon: '🚀',
    rarity: 'uncommon',
    xpReward: 60,
    type: 'project',
    condition: 'projects_created:1',
    category: 'leadership'
  }
];

/**
 * 🔍 VÉRIFIER LA CONDITION D'UN BADGE SYSTÈME
 */
const checkBadgeCondition = (badge, userStats) => {
  const condition = badge.condition;
  const gamification = userStats.gamification || {};
  
  switch (condition) {
    case 'first_login':
      return true; // Accordé à la première utilisation du hook
      
    case 'tasks_completed:1':
      return (gamification.tasksCompleted || 0) >= 1;
      
    case 'tasks_completed:5':
      return (gamification.tasksCompleted || 0) >= 5;
      
    case 'tasks_completed:25':
      return (gamification.tasksCompleted || 0) >= 25;
      
    case 'tasks_completed:100':
      return (gamification.tasksCompleted || 0) >= 100;
      
    case 'level:5':
      return (gamification.level || 1) >= 5;
      
    case 'level:10':
      return (gamification.level || 1) >= 10;
      
    case 'login_streak:7':
      return (gamification.loginStreak || 0) >= 7;
      
    case 'login_streak:30':
      return (gamification.loginStreak || 0) >= 30;
      
    case 'projects_created:1':
      return (gamification.projectsCreated || 0) >= 1;
      
    default:
      return false;
  }
};

/**
 * 📊 CALCULER LA PROGRESSION VERS LES BADGES
 */
const calculateBadgeProgress = (userStats, allBadges) => {
  const progress = {};
  const gamification = userStats.gamification || {};
  const currentBadgeIds = (gamification.badges || []).map(b => b.id);
  
  allBadges.forEach(badge => {
    if (!currentBadgeIds.includes(badge.id)) {
      const condition = badge.condition;
      let current = 0;
      let required = 1;
      
      if (typeof condition === 'string') {
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
    const category = badge.category || badge.type || 'other';
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

/**
 * 🏆 HOOK PRINCIPAL BADGES ENHANCED
 */
export const useBadges = () => {
  const { user } = useAuthStore();
  
  // États
  const [badges, setBadges] = useState([]); // Tous les badges disponibles
  const [userBadges, setUserBadges] = useState([]); // Badges de l'utilisateur
  const [stats, setStats] = useState(null);
  const [badgeProgress, setBadgeProgress] = useState({});
  const [recentBadges, setRecentBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 🔄 CHARGER TOUS LES BADGES (système + Synergia)
   */
  const loadAllBadges = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Chargement des badges...');

      // 1. Badges système de base
      const systemBadges = getSystemBadges();

      // 2. Badges spécialisés Synergia
      const synergiaBadges = Object.values(SYNERGIA_BADGE_DEFINITIONS);

      // 3. Fusionner tous les badges
      const allAvailableBadges = [...systemBadges, ...synergiaBadges];
      setBadges(allAvailableBadges);

      // 4. Récupérer les statistiques utilisateur complètes
      const userStats = await firebaseDataSyncService.getUserCompleteStats(user.uid);
      
      if (!userStats) {
        console.warn('⚠️ Statistiques utilisateur non trouvées');
        setUserBadges([]);
        setStats(calculateBadgeStats([], allAvailableBadges));
        setBadgeProgress({});
        setRecentBadges([]);
        return;
      }

      // 5. Badges actuels de l'utilisateur
      const currentUserBadges = userStats.gamification?.badges || [];
      setUserBadges(currentUserBadges);

      // 6. Calculer la progression vers les badges non débloqués
      const progress = calculateBadgeProgress(userStats, allAvailableBadges);
      setBadgeProgress(progress);

      // 7. Statistiques badges
      const badgeStats = calculateBadgeStats(currentUserBadges, allAvailableBadges);
      setStats(badgeStats);

      // 8. Badges récents (derniers 5)
      const recent = currentUserBadges
        .sort((a, b) => new Date(b.unlockedAt || b.earnedAt) - new Date(a.unlockedAt || a.earnedAt))
        .slice(0, 5);
      setRecentBadges(recent);

      console.log('✅ Badges chargés:', {
        utilisateur: currentUserBadges.length,
        disponibles: allAvailableBadges.length,
        système: systemBadges.length,
        synergia: synergiaBadges.length,
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
   * 🔍 VÉRIFIER LES NOUVEAUX BADGES (système + Synergia)
   */
  const checkBadges = useCallback(async (activityContext = {}) => {
    if (!user?.uid || checking) return [];

    try {
      setChecking(true);
      
      console.log('🔍 Vérification nouveaux badges...', activityContext);
      
      // Récupérer les stats actuelles
      const userStats = await firebaseDataSyncService.getUserCompleteStats(user.uid);
      
      if (!userStats) {
        console.warn('⚠️ Stats utilisateur non trouvées pour vérification');
        return [];
      }
      
      const systemBadges = getSystemBadges();
      const currentBadges = userStats.gamification?.badges || [];
      const currentBadgeIds = currentBadges.map(b => b.id);
      
      const newBadges = [];
      
      // 1. Vérifier les badges système
      for (const badge of systemBadges) {
        if (!currentBadgeIds.includes(badge.id)) {
          const shouldUnlock = checkBadgeCondition(badge, userStats);
          
          if (shouldUnlock) {
            // Débloquer le badge système
            const unlockResult = await firebaseDataSyncService.unlockBadge(
              user.uid, 
              badge.id, 
              badge
            );
            
            if (unlockResult.success) {
              newBadges.push(unlockResult.badge);
            }
          }
        }
      }
      
      // 2. Vérifier les badges Synergia spécialisés
      const synergiaResult = await synergiaBadgeService.checkAndUnlockBadges(user.uid, activityContext);
      
      if (synergiaResult.success && synergiaResult.newBadges.length > 0) {
        newBadges.push(...synergiaResult.newBadges);
      }

      // 3. Recharger les données si de nouveaux badges
      if (newBadges.length > 0) {
        await loadAllBadges();
        
        // Déclencher les événements de notification
        newBadges.forEach(badge => {
          const event = new CustomEvent('badgeUnlocked', {
            detail: { badge, timestamp: Date.now() }
          });
          window.dispatchEvent(event);
        });
      }

      console.log(`✅ Vérification terminée: ${newBadges.length} nouveaux badges`);
      return newBadges;

    } catch (err) {
      console.error('❌ Erreur vérification badges:', err);
      setError(err.message);
      return [];
    } finally {
      setChecking(false);
    }
  }, [user?.uid, checking, loadAllBadges]);

  /**
   * 🎯 VÉRIFIER BADGES POUR ACTIVITÉ SPÉCIFIQUE
   */
  const checkBadgesForActivity = useCallback(async (activity) => {
    const activityContexts = {
      task_completed: { trigger: 'task_completed', type: 'productivity' },
      maintenance_task: { trigger: 'task_completed', roleId: 'maintenance', type: 'technical' },
      reputation_task: { trigger: 'task_completed', roleId: 'reputation', type: 'customer_service' },
      stock_task: { trigger: 'task_completed', roleId: 'stock', type: 'logistics' },
      escape_game_animated: { trigger: 'game_animated', activityType: 'escapeGame', type: 'entertainment' },
      quiz_game_animated: { trigger: 'game_animated', activityType: 'quizGame', type: 'education' },
      login_streak: { trigger: 'login_streak', type: 'engagement' },
      level_up: { trigger: 'level_up', type: 'progression' }
    };

    const context = activityContexts[activity] || { trigger: activity, type: 'general' };
    return await checkBadges(context);
  }, [checkBadges]);

  /**
   * 📊 OBTENIR LA PROGRESSION VERS UN BADGE SPÉCIFIQUE
   */
  const getBadgeProgress = useCallback((badgeId) => {
    return badgeProgress[badgeId] || null;
  }, [badgeProgress]);

  /**
   * 🔍 RECHERCHER DES BADGES
   */
  const searchBadges = useCallback((query, filters = {}) => {
    let filteredBadges = badges;

    // Filtrer par catégorie
    if (filters.category && filters.category !== 'all') {
      filteredBadges = filteredBadges.filter(badge => 
        badge.category === filters.category || badge.type === filters.category
      );
    }

    // Filtrer par rareté
    if (filters.rarity && filters.rarity !== 'all') {
      filteredBadges = filteredBadges.filter(badge => badge.rarity === filters.rarity);
    }

    // Filtrer par statut (débloqué/verrouillé)
    if (filters.status) {
      const unlockedIds = userBadges.map(b => b.id);
      if (filters.status === 'unlocked') {
        filteredBadges = filteredBadges.filter(badge => unlockedIds.includes(badge.id));
      } else if (filters.status === 'locked') {
        filteredBadges = filteredBadges.filter(badge => !unlockedIds.includes(badge.id));
      }
    }

    // Recherche textuelle
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filteredBadges = filteredBadges.filter(badge =>
        badge.name.toLowerCase().includes(searchTerm) ||
        badge.description.toLowerCase().includes(searchTerm) ||
        (badge.category && badge.category.toLowerCase().includes(searchTerm))
      );
    }

    return filteredBadges;
  }, [badges, userBadges]);

  /**
   * 🏆 OBTENIR LES BADGES PROCHES DU DÉBLOCAGE
   */
  const getNearCompletionBadges = useCallback((threshold = 70) => {
    return Object.entries(badgeProgress)
      .filter(([_, progress]) => progress.percentage >= threshold)
      .map(([badgeId, progress]) => ({
        badge: badges.find(b => b.id === badgeId),
        progress
      }))
      .filter(item => item.badge)
      .sort((a, b) => b.progress.percentage - a.progress.percentage);
  }, [badgeProgress, badges]);

  // Charger les badges au montage
  useEffect(() => {
    loadAllBadges();
  }, [loadAllBadges]);

  // Écouter les événements de badge
  useEffect(() => {
    const handleBadgeUnlocked = (event) => {
      console.log('🎊 Badge débloqué détecté:', event.detail.badge.name);
      // Les données seront rechargées automatiquement par checkBadges
    };

    window.addEventListener('badgeUnlocked', handleBadgeUnlocked);
    
    return () => {
      window.removeEventListener('badgeUnlocked', handleBadgeUnlocked);
    };
  }, []);

  return {
    // Données
    badges, // Tous les badges disponibles
    userBadges, // Badges débloqués par l'utilisateur
    stats, // Statistiques globales
    badgeProgress, // Progression vers badges non débloqués
    recentBadges, // Derniers badges débloqués
    
    // États
    loading,
    checking,
    error,
    
    // Actions
    checkBadges, // Vérification générale
    checkBadgesForActivity, // Vérification pour activité spécifique
    loadAllBadges, // Rechargement manuel
    
    // Utilitaires
    getBadgeProgress, // Progression badge spécifique
    searchBadges, // Recherche et filtrage
    getNearCompletionBadges, // Badges proches déblocage
    
    // Helpers
    isBadgeUnlocked: (badgeId) => userBadges.some(b => b.id === badgeId),
    getBadgeById: (badgeId) => badges.find(b => b.id === badgeId),
    getTotalXpFromBadges: () => stats?.totalXpFromBadges || 0,
    getCompletionPercentage: () => stats?.percentage || 0
  };
};

export default useBadges;
