// ==========================================
// 📁 react-app/src/shared/services/badgeService.js
// Système intelligent de déblocage automatique des badges
// ==========================================

import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../core/firebase.js';
import { useToast } from '../components/ToastNotification.jsx';

// Définition des badges avec conditions
export const BADGE_DEFINITIONS = {
  // 🚀 Badges de Démarrage
  FIRST_STEPS: {
    id: 'first_steps',
    name: 'Premiers Pas',
    description: 'Première connexion à Synergia',
    icon: '🎯',
    rarity: 'common',
    xpReward: 10,
    condition: (userData) => true // Accordé à la première connexion
  },

  PROFILE_COMPLETE: {
    id: 'profile_complete',
    name: 'Profil Complet',
    description: 'Compléter son profil utilisateur',
    icon: '👤',
    rarity: 'common',
    xpReward: 25,
    condition: (userData) => {
      const profile = userData.profile || {};
      return profile.firstName && profile.lastName && profile.department;
    }
  },

  // 📋 Badges de Productivité
  TASK_ROOKIE: {
    id: 'task_rookie',
    name: 'Débutant',
    description: 'Compléter 5 tâches',
    icon: '🌱',
    rarity: 'common',
    xpReward: 50,
    condition: (userData) => (userData.gamification?.tasksCompleted || 0) >= 5
  },

  TASK_MASTER: {
    id: 'task_master',
    name: 'Maître des Tâches',
    description: 'Compléter 25 tâches',
    icon: '⚡',
    rarity: 'uncommon',
    xpReward: 100,
    condition: (userData) => (userData.gamification?.tasksCompleted || 0) >= 25
  },

  TASK_LEGEND: {
    id: 'task_legend',
    name: 'Légende',
    description: 'Compléter 100 tâches',
    icon: '👑',
    rarity: 'rare',
    xpReward: 250,
    condition: (userData) => (userData.gamification?.tasksCompleted || 0) >= 100
  },

  // 🔥 Badges de Streak
  WEEK_WARRIOR: {
    id: 'week_warrior',
    name: 'Guerrier de la Semaine',
    description: 'Connexion quotidienne pendant 7 jours',
    icon: '🔥',
    rarity: 'uncommon',
    xpReward: 75,
    condition: (userData) => (userData.gamification?.loginStreak || 0) >= 7
  },

  MONTH_CHAMPION: {
    id: 'month_champion',
    name: 'Champion du Mois',
    description: 'Connexion quotidienne pendant 30 jours',
    icon: '🏆',
    rarity: 'rare',
    xpReward: 200,
    condition: (userData) => (userData.gamification?.loginStreak || 0) >= 30
  },

  // 🎯 Badges de Performance
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Démon de Vitesse',
    description: 'Compléter 5 tâches en une journée',
    icon: '💨',
    rarity: 'uncommon',
    xpReward: 100,
    condition: (userData) => {
      const today = new Date().toDateString();
      const todayTasks = userData.gamification?.dailyStats?.[today]?.tasksCompleted || 0;
      return todayTasks >= 5;
    }
  },

  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Lève-tôt',
    description: 'Compléter une tâche avant 8h du matin',
    icon: '🌅',
    rarity: 'uncommon',
    xpReward: 50,
    condition: (userData) => {
      // Cette condition sera vérifiée lors de la completion d'une tâche
      return userData.gamification?.earlyBirdUnlocked === true;
    }
  },

  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Oiseau de Nuit',
    description: 'Compléter une tâche après 22h',
    icon: '🦉',
    rarity: 'uncommon',
    xpReward: 50,
    condition: (userData) => {
      return userData.gamification?.nightOwlUnlocked === true;
    }
  },

  // 🤝 Badges Sociaux
  TEAM_PLAYER: {
    id: 'team_player',
    name: 'Joueur d\'Équipe',
    description: 'Participer à 3 projets différents',
    icon: '🤝',
    rarity: 'uncommon',
    xpReward: 75,
    condition: (userData) => {
      const projectsParticipated = userData.stats?.projectsParticipated || 0;
      return projectsParticipated >= 3;
    }
  },

  // 💎 Badges XP
  XP_COLLECTOR: {
    id: 'xp_collector',
    name: 'Collectionneur XP',
    description: 'Atteindre 1000 XP total',
    icon: '💎',
    rarity: 'rare',
    xpReward: 100,
    condition: (userData) => (userData.gamification?.totalXp || 0) >= 1000
  },

  XP_MILLIONAIRE: {
    id: 'xp_millionaire',
    name: 'Millionnaire XP',
    description: 'Atteindre 10000 XP total',
    icon: '💰',
    rarity: 'legendary',
    xpReward: 500,
    condition: (userData) => (userData.gamification?.totalXp || 0) >= 10000
  }
};

// Service de gestion des badges
export class BadgeService {
  static async checkAndUnlockBadges(userId, userData, context = {}) {
    try {
      const currentBadges = userData.gamification?.badges || [];
      const currentBadgeIds = currentBadges.map(b => b.id);
      const newlyUnlocked = [];

      // Vérifier chaque badge
      for (const [key, badgeDefinition] of Object.entries(BADGE_DEFINITIONS)) {
        // Skip si déjà débloqué
        if (currentBadgeIds.includes(badgeDefinition.id)) {
          continue;
        }

        // Vérifier la condition avec le contexte
        const contextualUserData = { ...userData, ...context };
        
        if (badgeDefinition.condition(contextualUserData)) {
          const newBadge = {
            ...badgeDefinition,
            unlockedAt: new Date(),
            unlockedTimestamp: serverTimestamp()
          };

          newlyUnlocked.push(newBadge);
        }
      }

      // Mettre à jour Firebase si de nouveaux badges
      if (newlyUnlocked.length > 0) {
        const userRef = doc(db, 'users', userId);
        
        // Calculer XP total des nouveaux badges
        const totalXpFromBadges = newlyUnlocked.reduce((total, badge) => 
          total + (badge.xpReward || 0), 0);

        await updateDoc(userRef, {
          'gamification.badges': arrayUnion(...newlyUnlocked),
          'gamification.totalXp': (userData.gamification?.totalXp || 0) + totalXpFromBadges,
          'gamification.xp': (userData.gamification?.xp || 0) + totalXpFromBadges,
          'stats.lastBadgeUnlock': serverTimestamp()
        });

        // Notifications toast pour chaque badge
        newlyUnlocked.forEach(badge => {
          this.showBadgeNotification(badge);
        });

        console.log(`🏆 ${newlyUnlocked.length} nouveaux badges débloqués:`, 
          newlyUnlocked.map(b => b.name));
      }

      return newlyUnlocked;
    } catch (error) {
      console.error('Erreur vérification badges:', error);
      return [];
    }
  }

  static showBadgeNotification(badge) {
    // Animation et notification pour nouveau badge
    if (typeof window !== 'undefined' && window.showBadgeUnlock) {
      window.showBadgeUnlock(badge);
    }
    
    // Toast notification si disponible
    try {
      const toast = useToast();
      toast.success(`🏆 Badge débloqué: ${badge.name}!`, {
        title: 'Nouveau Badge',
        duration: 6000
      });
    } catch {
      // Fallback si useToast n'est pas disponible
      console.log(`🏆 Badge débloqué: ${badge.name} - ${badge.description}`);
    }
  }

  // Vérifications spécifiques par contexte
  static async checkTaskCompletionBadges(userId, userData, taskData) {
    const now = new Date();
    const hour = now.getHours();
    
    const context = {};

    // Early Bird (avant 8h)
    if (hour < 8) {
      context.gamification = {
        ...userData.gamification,
        earlyBirdUnlocked: true
      };
    }

    // Night Owl (après 22h)
    if (hour >= 22) {
      context.gamification = {
        ...userData.gamification,
        nightOwlUnlocked: true
      };
    }

    // Statistiques quotidiennes
    const today = now.toDateString();
    const dailyStats = userData.gamification?.dailyStats || {};
    const todayStats = dailyStats[today] || { tasksCompleted: 0 };
    
    context.gamification = {
      ...userData.gamification,
      dailyStats: {
        ...dailyStats,
        [today]: {
          ...todayStats,
          tasksCompleted: todayStats.tasksCompleted + 1
        }
      }
    };

    return this.checkAndUnlockBadges(userId, userData, context);
  }

  static async checkLoginBadges(userId, userData) {
    // Ce sera appelé lors du login pour vérifier les streaks
    return this.checkAndUnlockBadges(userId, userData);
  }

  static async checkProjectBadges(userId, userData, projectContext) {
    const context = {
      stats: {
        ...userData.stats,
        projectsParticipated: (userData.stats?.projectsParticipated || 0) + 1
      }
    };

    return this.checkAndUnlockBadges(userId, userData, context);
  }

  // Obtenir les badges par rareté
  static getBadgesByRarity(rarity) {
    return Object.values(BADGE_DEFINITIONS)
      .filter(badge => badge.rarity === rarity);
  }

  // Progress vers le prochain badge
  static getNextBadgeProgress(userData) {
    const currentBadges = userData.gamification?.badges || [];
    const currentBadgeIds = currentBadges.map(b => b.id);
    
    const availableBadges = Object.values(BADGE_DEFINITIONS)
      .filter(badge => !currentBadgeIds.includes(badge.id))
      .map(badge => {
        // Calculer le progress vers ce badge
        const progress = this.calculateBadgeProgress(badge, userData);
        return { ...badge, progress };
      })
      .sort((a, b) => b.progress - a.progress);

    return availableBadges.slice(0, 3); // Top 3 des prochains badges
  }

  static calculateBadgeProgress(badge, userData) {
    // Exemples de calcul de progression
    switch (badge.id) {
      case 'task_rookie':
        return Math.min(100, ((userData.gamification?.tasksCompleted || 0) / 5) * 100);
      case 'task_master':
        return Math.min(100, ((userData.gamification?.tasksCompleted || 0) / 25) * 100);
      case 'week_warrior':
        return Math.min(100, ((userData.gamification?.loginStreak || 0) / 7) * 100);
      case 'xp_collector':
        return Math.min(100, ((userData.gamification?.totalXp || 0) / 1000) * 100);
      default:
        return 0;
    }
  }
}

export default BadgeService;
