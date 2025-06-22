// ==========================================
// 📁 react-app/src/services/badgeService.js
// Service avancé pour la gestion des badges
// ==========================================

import gameService from './gameService.js';
import userService from './userService.js';

// Configuration des badges avec conditions complexes
const BADGE_DEFINITIONS = {
  // 🎯 BADGES DE PRODUCTIVITÉ
  productivity: {
    'task_rookie': {
      name: 'Rookie des Tâches',
      description: 'Complétez vos 5 premières tâches',
      icon: '🌱',
      rarity: 'common',
      condition: (userStats) => userStats.tasksCompleted >= 5,
      xpReward: 50
    },
    'task_warrior': {
      name: 'Guerrier des Tâches',
      description: 'Complétez 25 tâches',
      icon: '⚔️',
      rarity: 'uncommon',
      condition: (userStats) => userStats.tasksCompleted >= 25,
      xpReward: 150
    },
    'task_master': {
      name: 'Maître des Tâches',
      description: 'Complétez 100 tâches',
      icon: '👑',
      rarity: 'rare',
      condition: (userStats) => userStats.tasksCompleted >= 100,
      xpReward: 500
    },
    'speed_demon': {
      name: 'Démon de Vitesse',
      description: 'Complétez 10 tâches en un jour',
      icon: '⚡',
      rarity: 'epic',
      condition: (userStats) => userStats.tasksCompletedToday >= 10,
      xpReward: 300
    },
    'early_bird': {
      name: 'Lève-tôt',
      description: 'Complétez une tâche avant 8h du matin',
      icon: '🌅',
      rarity: 'uncommon',
      condition: (userStats) => userStats.hasEarlyCompletion,
      xpReward: 100
    },
    'night_owl': {
      name: 'Oiseau de Nuit',
      description: 'Complétez une tâche après 22h',
      icon: '🦉',
      rarity: 'uncommon',
      condition: (userStats) => userStats.hasLateCompletion,
      xpReward: 100
    },
    'perfectionist': {
      name: 'Perfectionniste',
      description: 'Complétez 20 tâches haute priorité',
      icon: '💎',
      rarity: 'rare',
      condition: (userStats) => userStats.highPriorityCompleted >= 20,
      xpReward: 250
    }
  },

  // 🔥 BADGES DE STREAK
  streaks: {
    'daily_login_3': {
      name: 'Régularité',
      description: 'Connectez-vous 3 jours consécutifs',
      icon: '📅',
      rarity: 'common',
      condition: (userStats) => userStats.loginStreak >= 3,
      xpReward: 75
    },
    'daily_login_7': {
      name: 'Semaine Parfaite',
      description: 'Connectez-vous 7 jours consécutifs',
      icon: '🗓️',
      rarity: 'uncommon',
      condition: (userStats) => userStats.loginStreak >= 7,
      xpReward: 200
    },
    'daily_login_30': {
      name: 'Mois Exemplaire',
      description: 'Connectez-vous 30 jours consécutifs',
      icon: '🏆',
      rarity: 'epic',
      condition: (userStats) => userStats.loginStreak >= 30,
      xpReward: 1000
    },
    'task_streak_5': {
      name: 'Momentum',
      description: 'Complétez au moins une tâche 5 jours de suite',
      icon: '🎯',
      rarity: 'uncommon',
      condition: (userStats) => userStats.taskStreak >= 5,
      xpReward: 150
    },
    'task_streak_10': {
      name: 'Force Imparable',
      description: 'Complétez au moins une tâche 10 jours de suite',
      icon: '🚀',
      rarity: 'rare',
      condition: (userStats) => userStats.taskStreak >= 10,
      xpReward: 400
    }
  },

  // 🎖️ BADGES SOCIAUX
  social: {
    'team_player': {
      name: 'Esprit d\'Équipe',
      description: 'Aidez 5 collègues sur leurs tâches',
      icon: '🤝',
      rarity: 'uncommon',
      condition: (userStats) => userStats.helpedColleagues >= 5,
      xpReward: 200
    },
    'mentor': {
      name: 'Mentor',
      description: 'Créez 10 tâches pour vos collègues',
      icon: '🎓',
      rarity: 'rare',
      condition: (userStats) => userStats.tasksCreatedForOthers >= 10,
      xpReward: 300
    },
    'communicator': {
      name: 'Communicateur',
      description: 'Laissez 50 commentaires sur des tâches',
      icon: '💬',
      rarity: 'uncommon',
      condition: (userStats) => userStats.commentsLeft >= 50,
      xpReward: 150
    }
  },

  // 🏅 BADGES SPÉCIAUX
  special: {
    'first_task': {
      name: 'Premier Pas',
      description: 'Complétez votre première tâche',
      icon: '✨',
      rarity: 'common',
      condition: (userStats) => userStats.tasksCompleted >= 1,
      xpReward: 25
    },
    'overachiever': {
      name: 'Surpassement',
      description: 'Gagnez 1000 XP en une semaine',
      icon: '🌟',
      rarity: 'epic',
      condition: (userStats) => userStats.xpThisWeek >= 1000,
      xpReward: 500
    },
    'legend': {
      name: 'Légende Synergia',
      description: 'Atteignez le niveau 20',
      icon: '👑',
      rarity: 'legendary',
      condition: (userStats) => userStats.level >= 20,
      xpReward: 1000
    },
    'pioneer': {
      name: 'Pionnier',
      description: 'Soyez parmi les 10 premiers utilisateurs',
      icon: '🗿',
      rarity: 'legendary',
      condition: (userStats) => userStats.registrationRank <= 10,
      xpReward: 750
    }
  },

  // 🎨 BADGES CRÉATIFS
  creative: {
    'organizer': {
      name: 'Organisateur',
      description: 'Créez 5 projets',
      icon: '📋',
      rarity: 'uncommon',
      condition: (userStats) => userStats.projectsCreated >= 5,
      xpReward: 200
    },
    'categorizer': {
      name: 'Catégoriseur',
      description: 'Utilisez 10 tags différents',
      icon: '🏷️',
      rarity: 'uncommon',
      condition: (userStats) => userStats.uniqueTagsUsed >= 10,
      xpReward: 150
    },
    'planner': {
      name: 'Planificateur',
      description: 'Planifiez 25 tâches avec dates d\'échéance',
      icon: '📅',
      rarity: 'uncommon',
      condition: (userStats) => userStats.tasksWithDueDate >= 25,
      xpReward: 180
    }
  }
};

class BadgeService {
  
  // Vérifier et débloquer les badges pour un utilisateur
  async checkAndUnlockBadges(userId) {
    try {
      console.log('🏆 Vérification des badges pour:', userId);
      
      // Récupérer les stats utilisateur
      const userStats = await this.getUserStats(userId);
      const userProfile = await userService.getUserProfile(userId);
      
      if (!userProfile.data) return { newBadges: [], error: 'Profil introuvable' };
      
      const currentBadges = userProfile.data.gamification?.badges || [];
      const currentBadgeIds = currentBadges.map(b => b.id);
      const newBadges = [];
      
      // Parcourir toutes les catégories de badges
      for (const [category, badges] of Object.entries(BADGE_DEFINITIONS)) {
        for (const [badgeId, badgeConfig] of Object.entries(badges)) {
          
          // Si le badge n'est pas déjà débloqué
          if (!currentBadgeIds.includes(badgeId)) {
            
            // Vérifier la condition
            if (badgeConfig.condition(userStats)) {
              console.log('🎉 Nouveau badge débloqué:', badgeConfig.name);
              
              // Débloquer le badge
              const result = await gameService.unlockBadge(
                userId, 
                badgeId, 
                badgeConfig.name, 
                category
              );
              
              if (!result.error) {
                newBadges.push({
                  ...badgeConfig,
                  id: badgeId,
                  category,
                  unlockedAt: new Date()
                });
                
                // Ajouter l'XP bonus
                if (badgeConfig.xpReward) {
                  await gameService.addXP(
                    userId, 
                    badgeConfig.xpReward, 
                    `Badge débloqué: ${badgeConfig.name}`
                  );
                }
              }
            }
          }
        }
      }
      
      console.log(`✅ ${newBadges.length} nouveaux badges débloqués`);
      return { newBadges, error: null };
      
    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
      return { newBadges: [], error: error.message };
    }
  }
  
  // Calculer les statistiques utilisateur pour les conditions de badges
  async getUserStats(userId) {
    try {
      // Récupérer le profil utilisateur
      const userResult = await userService.getUserProfile(userId);
      if (userResult.error) throw new Error(userResult.error);
      
      const user = userResult.data;
      const gamification = user.gamification || {};
      
      // Récupérer les activités récentes
      const activitiesResult = await gameService.getUserActivities(userId, 100);
      const activities = activitiesResult.error ? [] : activitiesResult.data;
      
      // Calculer les stats
      const stats = {
        // Stats de base
        tasksCompleted: gamification.tasksCompleted || 0,
        level: gamification.level || 1,
        loginStreak: gamification.loginStreak || 0,
        
        // Stats avancées
        tasksCompletedToday: this.getTasksCompletedToday(activities),
        tasksCompletedThisWeek: this.getTasksCompletedThisWeek(activities),
        xpThisWeek: this.getXPThisWeek(activities),
        highPriorityCompleted: this.getHighPriorityCompleted(activities),
        
        // Stats temporelles
        hasEarlyCompletion: this.hasEarlyCompletion(activities),
        hasLateCompletion: this.hasLateCompletion(activities),
        
        // Stats sociales
        helpedColleagues: this.getHelpedColleagues(activities),
        tasksCreatedForOthers: this.getTasksCreatedForOthers(activities),
        commentsLeft: this.getCommentsLeft(activities),
        
        // Stats créatives
        projectsCreated: this.getProjectsCreated(activities),
        uniqueTagsUsed: this.getUniqueTagsUsed(activities),
        tasksWithDueDate: this.getTasksWithDueDate(activities),
        
        // Stats spéciales
        registrationRank: user.registrationRank || 999999,
        taskStreak: this.calculateTaskStreak(activities)
      };
      
      return stats;
      
    } catch (error) {
      console.error('Erreur calcul stats utilisateur:', error);
      return {};
    }
  }
  
  // Méthodes de calcul des statistiques
  getTasksCompletedToday(activities) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return activities.filter(activity => 
      activity.type === 'task_completed' && 
      new Date(activity.timestamp?.seconds * 1000) >= today
    ).length;
  }
  
  getTasksCompletedThisWeek(activities) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    return activities.filter(activity => 
      activity.type === 'task_completed' && 
      new Date(activity.timestamp?.seconds * 1000) >= weekStart
    ).length;
  }
  
  getXPThisWeek(activities) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    return activities
      .filter(activity => 
        activity.type === 'xp_gained' && 
        new Date(activity.timestamp?.seconds * 1000) >= weekStart
      )
      .reduce((total, activity) => total + (activity.data?.xpAmount || 0), 0);
  }
  
  getHighPriorityCompleted(activities) {
    return activities.filter(activity => 
      activity.type === 'task_completed' && 
      activity.data?.priority === 'high'
    ).length;
  }
  
  hasEarlyCompletion(activities) {
    return activities.some(activity => {
      if (activity.type === 'task_completed') {
        const completionTime = new Date(activity.timestamp?.seconds * 1000);
        return completionTime.getHours() < 8;
      }
      return false;
    });
  }
  
  hasLateCompletion(activities) {
    return activities.some(activity => {
      if (activity.type === 'task_completed') {
        const completionTime = new Date(activity.timestamp?.seconds * 1000);
        return completionTime.getHours() >= 22;
      }
      return false;
    });
  }
  
  getHelpedColleagues(activities) {
    return activities.filter(activity => 
      activity.type === 'helped_colleague'
    ).length;
  }
  
  getTasksCreatedForOthers(activities) {
    return activities.filter(activity => 
      activity.type === 'task_created' && 
      activity.data?.forOthers
    ).length;
  }
  
  getCommentsLeft(activities) {
    return activities.filter(activity => 
      activity.type === 'comment_added'
    ).length;
  }
  
  getProjectsCreated(activities) {
    return activities.filter(activity => 
      activity.type === 'project_created'
    ).length;
  }
  
  getUniqueTagsUsed(activities) {
    const tags = new Set();
    activities.forEach(activity => {
      if (activity.data?.tags) {
        activity.data.tags.forEach(tag => tags.add(tag));
      }
    });
    return tags.size;
  }
  
  getTasksWithDueDate(activities) {
    return activities.filter(activity => 
      activity.type === 'task_created' && 
      activity.data?.hasDueDate
    ).length;
  }
  
  calculateTaskStreak(activities) {
    // Calculer la streak de tâches complétées (au moins 1 par jour)
    const tasksByDate = new Map();
    
    activities
      .filter(activity => activity.type === 'task_completed')
      .forEach(activity => {
        const date = new Date(activity.timestamp?.seconds * 1000);
        const dateKey = date.toDateString();
        tasksByDate.set(dateKey, (tasksByDate.get(dateKey) || 0) + 1);
      });
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateKey = checkDate.toDateString();
      
      if (tasksByDate.has(dateKey)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }
  
  // Obtenir tous les badges disponibles
  getAllBadges() {
    const allBadges = [];
    
    for (const [category, badges] of Object.entries(BADGE_DEFINITIONS)) {
      for (const [badgeId, badgeConfig] of Object.entries(badges)) {
        allBadges.push({
          id: badgeId,
          category,
          ...badgeConfig
        });
      }
    }
    
    return allBadges.sort((a, b) => {
      const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });
  }
  
  // Obtenir les badges par catégorie
  getBadgesByCategory(category) {
    const badges = BADGE_DEFINITIONS[category] || {};
    return Object.entries(badges).map(([id, config]) => ({
      id,
      category,
      ...config
    }));
  }
  
  // Obtenir les statistiques de progression vers les badges
  async getBadgeProgress(userId) {
    const userStats = await this.getUserStats(userId);
    const userProfile = await userService.getUserProfile(userId);
    const currentBadges = userProfile.data?.gamification?.badges || [];
    const currentBadgeIds = currentBadges.map(b => b.id);
    
    const progress = [];
    
    for (const [category, badges] of Object.entries(BADGE_DEFINITIONS)) {
      for (const [badgeId, badgeConfig] of Object.entries(badges)) {
        if (!currentBadgeIds.includes(badgeId)) {
          const progressInfo = this.calculateBadgeProgress(badgeConfig, userStats);
          if (progressInfo.progress > 0) {
            progress.push({
              id: badgeId,
              category,
              ...badgeConfig,
              ...progressInfo
            });
          }
        }
      }
    }
    
    return progress.sort((a, b) => b.progress - a.progress);
  }
  
  // Calculer la progression vers un badge spécifique
  calculateBadgeProgress(badgeConfig, userStats) {
    // Analyser la condition pour extraire la valeur cible
    const conditionStr = badgeConfig.condition.toString();
    
    // Rechercher des patterns comme >= X ou === X
    const matches = conditionStr.match(/>=\s*(\d+)|===\s*(\d+)/);
    if (!matches) return { progress: 0, current: 0, target: 1 };
    
    const target = parseInt(matches[1] || matches[2]);
    
    // Déterminer la propriété utilisée
    let current = 0;
    if (conditionStr.includes('tasksCompleted')) current = userStats.tasksCompleted || 0;
    else if (conditionStr.includes('loginStreak')) current = userStats.loginStreak || 0;
    else if (conditionStr.includes('level')) current = userStats.level || 0;
    else if (conditionStr.includes('xpThisWeek')) current = userStats.xpThisWeek || 0;
    // Ajouter d'autres propriétés selon les besoins
    
    const progress = Math.min((current / target) * 100, 100);
    
    return {
      progress: Math.round(progress),
      current,
      target,
      completed: current >= target
    };
  }
}

export default new BadgeService();
