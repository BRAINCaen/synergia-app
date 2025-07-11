// ==========================================
// 📁 react-app/src/services/achievementService.js
// Service pour les achievements complexes avec progression
// ==========================================

import gameService from './gameService.js';
import userService from './userService.js';
import taskService from './taskService.js';

// Configuration des achievements avec progression
const ACHIEVEMENT_DEFINITIONS = {
  // 🎯 ACHIEVEMENTS DE PRODUCTIVITÉ
  productivity: {
    'task_marathon': {
      name: 'Marathon des Tâches',
      description: 'Complétez 100 tâches au total',
      icon: '🏃‍♂️',
      category: 'productivity',
      type: 'progressive',
      milestones: [
        { threshold: 10, reward: 100, title: 'Premier Pas' },
        { threshold: 25, reward: 200, title: 'En Route' },
        { threshold: 50, reward: 300, title: 'À Mi-Chemin' },
        { threshold: 75, reward: 400, title: 'Presque Là' },
        { threshold: 100, reward: 500, title: 'Marathon Terminé!' }
      ],
      getCurrentValue: (userStats) => userStats.tasksCompleted || 0,
      maxValue: 100
    },
    'speed_master': {
      name: 'Maître de la Vitesse',
      description: 'Complétez 50 tâches avant leur échéance',
      icon: '⚡',
      category: 'productivity',
      type: 'progressive',
      milestones: [
        { threshold: 5, reward: 75, title: 'Rapide' },
        { threshold: 15, reward: 150, title: 'Plus Rapide' },
        { threshold: 30, reward: 225, title: 'Très Rapide' },
        { threshold: 50, reward: 400, title: 'Maître de la Vitesse' }
      ],
      getCurrentValue: (userStats) => userStats.tasksCompletedEarly || 0,
      maxValue: 50
    },
    'priority_expert': {
      name: 'Expert des Priorités',
      description: 'Complétez 75 tâches haute priorité',
      icon: '🔥',
      category: 'productivity',
      type: 'progressive',
      milestones: [
        { threshold: 10, reward: 120, title: 'Priorité!' },
        { threshold: 25, reward: 200, title: 'Haute Priorité!' },
        { threshold: 50, reward: 300, title: 'Expert!' },
        { threshold: 75, reward: 500, title: 'Maître des Priorités!' }
      ],
      getCurrentValue: (userStats) => userStats.highPriorityCompleted || 0,
      maxValue: 75
    }
  },

  // 🎪 ACHIEVEMENTS SOCIAUX
  social: {
    'team_helper': {
      name: 'Aidant de l\'Équipe',
      description: 'Aidez 25 collègues sur leurs projets',
      icon: '🤝',
      category: 'social',
      type: 'progressive',
      milestones: [
        { threshold: 3, reward: 100, title: 'Première Aide' },
        { threshold: 8, reward: 150, title: 'Bon Collègue' },
        { threshold: 15, reward: 250, title: 'Équipier Solid' },
        { threshold: 25, reward: 400, title: 'Héros de l\'Équipe' }
      ],
      getCurrentValue: (userStats) => userStats.helpedColleagues || 0,
      maxValue: 25
    },
    'communication_master': {
      name: 'Maître de la Communication',
      description: 'Laissez 100 commentaires constructifs',
      icon: '💬',
      category: 'social',
      type: 'progressive',
      milestones: [
        { threshold: 10, reward: 80, title: 'Communicateur' },
        { threshold: 30, reward: 160, title: 'Bavard' },
        { threshold: 60, reward: 240, title: 'Expert Comm.' },
        { threshold: 100, reward: 400, title: 'Maître Communicateur' }
      ],
      getCurrentValue: (userStats) => userStats.commentsLeft || 0,
      maxValue: 100
    }
  },

  // 🔥 ACHIEVEMENTS DE RÉGULARITÉ
  consistency: {
    'login_legend': {
      name: 'Légende de la Connexion',
      description: 'Connectez-vous 100 jours consécutifs',
      icon: '🗓️',
      category: 'consistency',
      type: 'progressive',
      milestones: [
        { threshold: 7, reward: 150, title: 'Semaine' },
        { threshold: 30, reward: 400, title: 'Mois' },
        { threshold: 60, reward: 600, title: 'Deux Mois' },
        { threshold: 100, reward: 1000, title: 'Légende!' }
      ],
      getCurrentValue: (userStats) => userStats.loginStreak || 0,
      maxValue: 100
    },
    'task_consistency': {
      name: 'Régularité Parfaite',
      description: 'Complétez au moins une tâche pendant 30 jours consécutifs',
      icon: '📈',
      category: 'consistency',
      type: 'progressive',
      milestones: [
        { threshold: 5, reward: 100, title: 'Bon Début' },
        { threshold: 10, reward: 200, title: 'Momentum' },
        { threshold: 20, reward: 350, title: 'Habitude' },
        { threshold: 30, reward: 500, title: 'Régularité Parfaite' }
      ],
      getCurrentValue: (userStats) => userStats.taskStreak || 0,
      maxValue: 30
    }
  },

  // 🎨 ACHIEVEMENTS CRÉATIFS
  creative: {
    'project_architect': {
      name: 'Architecte de Projets',
      description: 'Créez et menez 20 projets à bien',
      icon: '🏗️',
      category: 'creative',
      type: 'progressive',
      milestones: [
        { threshold: 3, reward: 150, title: 'Premier Projet' },
        { threshold: 8, reward: 250, title: 'Gestionnaire' },
        { threshold: 15, reward: 400, title: 'Chef de Projet' },
        { threshold: 20, reward: 600, title: 'Architecte' }
      ],
      getCurrentValue: (userStats) => userStats.projectsCompleted || 0,
      maxValue: 20
    },
    'tag_master': {
      name: 'Maître de l\'Organisation',
      description: 'Utilisez 50 tags différents pour organiser vos tâches',
      icon: '🏷️',
      category: 'creative',
      type: 'progressive',
      milestones: [
        { threshold: 10, reward: 80, title: 'Organisé' },
        { threshold: 20, reward: 150, title: 'Bien Organisé' },
        { threshold: 35, reward: 250, title: 'Expert Organisation' },
        { threshold: 50, reward: 400, title: 'Maître Organisation' }
      ],
      getCurrentValue: (userStats) => userStats.uniqueTagsUsed || 0,
      maxValue: 50
    }
  },

  // 🏆 ACHIEVEMENTS SPÉCIAUX
  special: {
    'xp_collector': {
      name: 'Collectionneur d\'XP',
      description: 'Accumlez 10 000 XP au total',
      icon: '💎',
      category: 'special',
      type: 'progressive',
      milestones: [
        { threshold: 1000, reward: 200, title: 'Premier Millier' },
        { threshold: 2500, reward: 300, title: 'Collectionneur' },
        { threshold: 5000, reward: 500, title: 'Grand Collectionneur' },
        { threshold: 10000, reward: 1000, title: 'Légende XP' }
      ],
      getCurrentValue: (userStats) => userStats.totalXp || 0,
      maxValue: 10000
    },
    'level_climber': {
      name: 'Grimpeur de Niveaux',
      description: 'Atteignez le niveau 25',
      icon: '🗻',
      category: 'special',
      type: 'progressive',
      milestones: [
        { threshold: 5, reward: 150, title: 'Débutant Avancé' },
        { threshold: 10, reward: 300, title: 'Intermédiaire' },
        { threshold: 15, reward: 500, title: 'Avancé' },
        { threshold: 20, reward: 750, title: 'Expert' },
        { threshold: 25, reward: 1000, title: 'Sommet Atteint' }
      ],
      getCurrentValue: (userStats) => userStats.level || 1,
      maxValue: 25
    }
  },

  // 🎯 ACHIEVEMENTS DÉFIS
  challenges: {
    'weekend_warrior': {
      name: 'Guerrier du Weekend',
      description: 'Complétez 25 tâches pendant le weekend',
      icon: '🏖️',
      category: 'challenges',
      type: 'progressive',
      milestones: [
        { threshold: 5, reward: 120, title: 'Weekend Productif' },
        { threshold: 10, reward: 200, title: 'Weekend Actif' },
        { threshold: 18, reward: 300, title: 'Weekend Warrior' },
        { threshold: 25, reward: 500, title: 'Maître du Weekend' }
      ],
      getCurrentValue: (userStats) => userStats.weekendTasks || 0,
      maxValue: 25
    },
    'night_shift': {
      name: 'Équipe de Nuit',
      description: 'Complétez 15 tâches après 20h',
      icon: '🌙',
      category: 'challenges',
      type: 'progressive',
      milestones: [
        { threshold: 3, reward: 100, title: 'Noctambule' },
        { threshold: 8, reward: 180, title: 'Oiseau de Nuit' },
        { threshold: 15, reward: 350, title: 'Équipe de Nuit' }
      ],
      getCurrentValue: (userStats) => userStats.nightTasks || 0,
      maxValue: 15
    }
  }
};

class AchievementService {
  
  // Vérifier et mettre à jour les achievements
  async checkAndUpdateAchievements(userId) {
    try {
      console.log('🎪 Vérification achievements pour:', userId);
      
      const userStats = await this.calculateUserStats(userId);
      const userProfile = await userService.getUserProfile(userId);
      
      if (!userProfile.data) return { updates: [], error: 'Profil introuvable' };
      
      const currentAchievements = userProfile.data.gamification?.achievements || [];
      const updates = [];
      
      // Parcourir tous les achievements
      for (const [category, achievements] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
        for (const [achievementId, config] of Object.entries(achievements)) {
          
          const currentProgress = this.getCurrentAchievementProgress(
            currentAchievements, 
            achievementId
          );
          
          const currentValue = config.getCurrentValue(userStats);
          const newProgress = this.calculateNewProgress(config, currentValue);
          
          // Vérifier s'il y a des nouveaux milestones atteints
          const newMilestones = this.getNewMilestones(
            config, 
            currentProgress, 
            newProgress
          );
          
          if (newMilestones.length > 0) {
            // Mettre à jour l'achievement
            await this.updateAchievementProgress(
              userId, 
              achievementId, 
              newProgress, 
              newMilestones
            );
            
            updates.push({
              achievementId,
              config,
              newMilestones,
              currentValue,
              progress: newProgress
            });
          }
        }
      }
      
      console.log(`✅ ${updates.length} achievements mis à jour`);
      return { updates, error: null };
      
    } catch (error) {
      console.error('❌ Erreur vérification achievements:', error);
      return { updates: [], error: error.message };
    }
  }
  
  // Calculer les statistiques utilisateur pour les achievements
  async calculateUserStats(userId) {
    try {
      // Récupérer le profil utilisateur
      const userResult = await userService.getUserProfile(userId);
      if (userResult.error) throw new Error(userResult.error);
      
      const user = userResult.data;
      const gamification = user.gamification || {};
      
      // Récupérer les activités
      const activitiesResult = await gameService.getUserActivities(userId, 500);
      const activities = activitiesResult.error ? [] : activitiesResult.data;
      
      // Récupérer les tâches pour des stats avancées
      const tasksResult = await taskService.getUserTasks(userId);
      const tasks = tasksResult.error ? [] : tasksResult.data;
      
      return {
        // Stats de base
        tasksCompleted: gamification.tasksCompleted || 0,
        totalXp: gamification.totalXp || 0,
        level: gamification.level || 1,
        loginStreak: gamification.loginStreak || 0,
        
        // Stats avancées
        tasksCompletedEarly: this.countTasksCompletedEarly(tasks),
        highPriorityCompleted: this.countHighPriorityTasks(tasks),
        helpedColleagues: this.countHelpActivities(activities),
        commentsLeft: this.countCommentActivities(activities),
        projectsCompleted: this.countProjectsCompleted(activities),
        uniqueTagsUsed: this.countUniqueTags(tasks),
        taskStreak: this.calculateTaskStreak(activities),
        weekendTasks: this.countWeekendTasks(tasks),
        nightTasks: this.countNightTasks(tasks)
      };
      
    } catch (error) {
      console.error('Erreur calcul stats achievements:', error);
      return {};
    }
  }
  
  // Méthodes de calcul de statistiques
  countTasksCompletedEarly(tasks) {
    return tasks.filter(task => 
      task.status === 'completed' && 
      task.dueDate && 
      task.completedAt && 
      new Date(task.completedAt) < new Date(task.dueDate)
    ).length;
  }
  
  countHighPriorityTasks(tasks) {
    return tasks.filter(task => 
      task.status === 'completed' && 
      task.priority === 'high'
    ).length;
  }
  
  countHelpActivities(activities) {
    return activities.filter(activity => 
      activity.type === 'helped_colleague'
    ).length;
  }
  
  countCommentActivities(activities) {
    return activities.filter(activity => 
      activity.type === 'comment_added'
    ).length;
  }
  
  countProjectsCompleted(activities) {
    return activities.filter(activity => 
      activity.type === 'project_completed'
    ).length;
  }
  
  countUniqueTags(tasks) {
    const tags = new Set();
    tasks.forEach(task => {
      if (task.tags) {
        task.tags.forEach(tag => tags.add(tag));
      }
    });
    return tags.size;
  }
  
  calculateTaskStreak(activities) {
    // Logique similaire à badgeService mais optimisée
    const tasksByDate = new Map();
    
    activities
      .filter(activity => activity.type === 'task_completed')
      .forEach(activity => {
        const date = new Date(activity.timestamp?.seconds * 1000);
        const dateKey = date.toDateString();
        tasksByDate.set(dateKey, true);
      });
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 100; i++) {
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
  
  countWeekendTasks(tasks) {
    return tasks.filter(task => {
      if (task.status !== 'completed' || !task.completedAt) return false;
      const date = new Date(task.completedAt);
      const day = date.getDay();
      return day === 0 || day === 6; // Dimanche ou Samedi
    }).length;
  }
  
  countNightTasks(tasks) {
    return tasks.filter(task => {
      if (task.status !== 'completed' || !task.completedAt) return false;
      const date = new Date(task.completedAt);
      return date.getHours() >= 20;
    }).length;
  }
  
  // Obtenir la progression actuelle d'un achievement
  getCurrentAchievementProgress(achievements, achievementId) {
    const achievement = achievements.find(a => a.id === achievementId);
    return achievement ? {
      currentValue: achievement.currentValue || 0,
      milestones: achievement.milestones || [],
      lastUpdated: achievement.lastUpdated
    } : { currentValue: 0, milestones: [], lastUpdated: null };
  }
  
  // Calculer la nouvelle progression
  calculateNewProgress(config, currentValue) {
    const completedMilestones = [];
    
    config.milestones.forEach((milestone, index) => {
      if (currentValue >= milestone.threshold) {
        completedMilestones.push({
          ...milestone,
          index,
          completedAt: new Date()
        });
      }
    });
    
    return {
      currentValue,
      completedMilestones,
      nextMilestone: config.milestones.find(m => currentValue < m.threshold),
      isCompleted: currentValue >= config.maxValue,
      progressPercentage: Math.min((currentValue / config.maxValue) * 100, 100)
    };
  }
  
  // Obtenir les nouveaux milestones atteints
  getNewMilestones(config, currentProgress, newProgress) {
    const currentMilestoneIndices = new Set(
      currentProgress.milestones.map(m => m.index)
    );
    
    return newProgress.completedMilestones.filter(milestone => 
      !currentMilestoneIndices.has(milestone.index)
    );
  }
  
  // Mettre à jour la progression d'un achievement
  async updateAchievementProgress(userId, achievementId, progress, newMilestones) {
    try {
      // Récupérer le profil actuel
      const userResult = await userService.getUserProfile(userId);
      if (userResult.error) throw new Error(userResult.error);
      
      const user = userResult.data;
      const achievements = user.gamification?.achievements || [];
      
      // Mettre à jour ou ajouter l'achievement
      const existingIndex = achievements.findIndex(a => a.id === achievementId);
      
      const updatedAchievement = {
        id: achievementId,
        currentValue: progress.currentValue,
        milestones: progress.completedMilestones,
        isCompleted: progress.isCompleted,
        progressPercentage: progress.progressPercentage,
        lastUpdated: new Date()
      };
      
      if (existingIndex >= 0) {
        achievements[existingIndex] = updatedAchievement;
      } else {
        achievements.push(updatedAchievement);
      }
      
      // Sauvegarder
      await userService.updateUserProfile(userId, {
        'gamification.achievements': achievements
      });
      
      // Récompenser l'XP pour les nouveaux milestones
      let totalXpReward = 0;
      for (const milestone of newMilestones) {
        totalXpReward += milestone.reward;
        
        // Créer une activité pour le milestone
        await gameService.createActivity(userId, 'milestone_reached', {
          achievementId,
          milestone: milestone.title,
          reward: milestone.reward
        });
      }
      
      if (totalXpReward > 0) {
        await gameService.addXP(
          userId, 
          totalXpReward, 
          `Milestones atteints: ${newMilestones.map(m => m.title).join(', ')}`
        );
      }
      
      console.log(`✅ Achievement ${achievementId} mis à jour pour ${userId}`);
      
    } catch (error) {
      console.error('❌ Erreur mise à jour achievement:', error);
      throw error;
    }
  }
  
  // Obtenir tous les achievements avec progression
  async getUserAchievements(userId) {
    try {
      const userStats = await this.calculateUserStats(userId);
      const userProfile = await userService.getUserProfile(userId);
      
      if (!userProfile.data) return { achievements: [], error: 'Profil introuvable' };
      
      const currentAchievements = userProfile.data.gamification?.achievements || [];
      const allAchievements = [];
      
      // Construire la liste complète avec progression
      for (const [category, achievements] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
        for (const [achievementId, config] of Object.entries(achievements)) {
          const currentProgress = this.getCurrentAchievementProgress(
            currentAchievements, 
            achievementId
          );
          
          const currentValue = config.getCurrentValue(userStats);
          const progress = this.calculateNewProgress(config, currentValue);
          
          allAchievements.push({
            id: achievementId,
            category,
            ...config,
            ...progress,
            savedProgress: currentProgress
          });
        }
      }
      
      // Trier par progression et catégorie
      allAchievements.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1; // Complétés à la fin
        }
        return b.progressPercentage - a.progressPercentage;
      });
      
      return { achievements: allAchievements, error: null };
      
    } catch (error) {
      console.error('❌ Erreur récupération achievements:', error);
      return { achievements: [], error: error.message };
    }
  }
  
  // Obtenir les achievements par catégorie
  async getAchievementsByCategory(userId, category) {
    const result = await this.getUserAchievements(userId);
    if (result.error) return result;
    
    const filtered = result.achievements.filter(a => a.category === category);
    return { achievements: filtered, error: null };
  }
  
  // Obtenir les achievements en cours (pas encore complétés)
  async getActiveAchievements(userId, limit = 5) {
    const result = await this.getUserAchievements(userId);
    if (result.error) return result;
    
    const active = result.achievements
      .filter(a => !a.isCompleted && a.progressPercentage > 0)
      .slice(0, limit);
    
    return { achievements: active, error: null };
  }
}

export default new AchievementService();
