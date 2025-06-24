// ==========================================
// 📁 react-app/src/core/services/badgeEngine.js
// Badge Engine - VERSION COMPLÈTE ET CORRIGÉE
// ==========================================

import { collection, doc, updateDoc, arrayUnion, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🏆 BADGE ENGINE SYNERGIA v3.5 - COMPLET
 */
class BadgeEngine {
  
  static BADGE_DEFINITIONS = {
    'task_destroyer_25': {
      id: 'task_destroyer_25',
      name: 'Task Destroyer',
      icon: '💥',
      description: 'Complété 25 tâches',
      condition: 'completedTasks >= 25',
      category: 'progression',
      rarity: 'common',
      xpReward: 100
    },
    'task_destroyer_50': {
      id: 'task_destroyer_50',
      name: 'Task Annihilator',
      icon: '🔥',
      description: 'Complété 50 tâches',
      condition: 'completedTasks >= 50',
      category: 'progression',
      rarity: 'rare',
      xpReward: 250
    },
    'task_destroyer_100': {
      id: 'task_destroyer_100',
      name: 'Task Obliterator',
      icon: '💀',
      description: 'Complété 100 tâches',
      condition: 'completedTasks >= 100',
      category: 'progression',
      rarity: 'epic',
      xpReward: 500
    },
    'early_bird': {
      id: 'early_bird',
      name: 'Early Bird',
      icon: '🌅',
      description: 'Complété 5 tâches avant 8h du matin',
      condition: 'earlyMorningTasks >= 5',
      category: 'temporal',
      rarity: 'uncommon',
      xpReward: 150
    },
    'night_owl': {
      id: 'night_owl',
      name: 'Night Owl',
      icon: '🦉',
      description: 'Complété 5 tâches après 22h',
      condition: 'lateNightTasks >= 5',
      category: 'temporal',
      rarity: 'uncommon',
      xpReward: 150
    },
    'weekend_warrior': {
      id: 'weekend_warrior',
      name: 'Weekend Warrior',
      icon: '⚔️',
      description: 'Complété 10 tâches le weekend',
      condition: 'weekendTasks >= 10',
      category: 'temporal',
      rarity: 'rare',
      xpReward: 200
    },
    'perfectionist': {
      id: 'perfectionist',
      name: 'Perfectionist',
      icon: '✨',
      description: 'Complété 10 tâches priorité HAUTE sans retard',
      condition: 'perfectHighPriorityTasks >= 10',
      category: 'performance',
      rarity: 'rare',
      xpReward: 300
    },
    'speed_demon': {
      id: 'speed_demon',
      name: 'Speed Demon',
      icon: '💨',
      description: 'Complété 5 tâches en moins de 1h chacune',
      condition: 'fastCompletions >= 5',
      category: 'performance',
      rarity: 'uncommon',
      xpReward: 175
    },
    'deadline_ninja': {
      id: 'deadline_ninja',
      name: 'Deadline Ninja',
      icon: '🥷',
      description: 'Complété 15 tâches le jour de la deadline',
      condition: 'lastMinuteTasks >= 15',
      category: 'performance',
      rarity: 'rare',
      xpReward: 250
    },
    'consistency_king': {
      id: 'consistency_king',
      name: 'Consistency King',
      icon: '👑',
      description: 'Streak de 7 jours consécutifs',
      condition: 'maxStreak >= 7',
      category: 'consistency',
      rarity: 'epic',
      xpReward: 400
    },
    'streak_master': {
      id: 'streak_master',
      name: 'Streak Master',
      icon: '🔥',
      description: 'Streak de 14 jours consécutifs',
      condition: 'maxStreak >= 14',
      category: 'consistency',
      rarity: 'legendary',
      xpReward: 750
    },
    'sprint_master': {
      id: 'sprint_master',
      name: 'Sprint Master',
      icon: '🏃‍♂️',
      description: 'Complété 8 tâches en une seule journée',
      condition: 'maxTasksInDay >= 8',
      category: 'sprint',
      rarity: 'rare',
      xpReward: 200
    },
    'project_finisher': {
      id: 'project_finisher',
      name: 'Project Finisher',
      icon: '🏁',
      description: 'Terminé votre premier projet à 100%',
      condition: 'completedProjects >= 1',
      category: 'projects',
      rarity: 'uncommon',
      xpReward: 300
    },
    'multitasker': {
      id: 'multitasker',
      name: 'Multitasker',
      icon: '🎭',
      description: 'Travaillé sur 3 projets différents en une journée',
      condition: 'maxProjectsInDay >= 3',
      category: 'projects',
      rarity: 'rare',
      xpReward: 250
    }
  };

  static async checkAndAwardBadges(userId) {
    try {
      console.log('🏆 Badge Engine: Analyse démarré pour', userId);

      const userData = await this.getUserAnalytics(userId);
      const newBadges = [];
      
      for (const badgeId in this.BADGE_DEFINITIONS) {
        const badge = this.BADGE_DEFINITIONS[badgeId];
        
        if (userData.badges && userData.badges.includes(badgeId)) {
          continue;
        }
        
        if (await this.evaluateBadgeCondition(badge, userData, userId)) {
          newBadges.push(badge);
        }
      }

      if (newBadges.length > 0) {
        await this.awardBadges(userId, newBadges);
        console.log(`🎉 ${newBadges.length} nouveaux badges débloqués!`);
        return newBadges;
      }

      return [];

    } catch (error) {
      console.error('❌ Erreur Badge Engine:', error);
      return [];
    }
  }

  static async getUserAnalytics(userId) {
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const projectsQuery = query(
        collection(db, 'projects'),
        where('ownerId', '==', userId)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId),
        limit(1)
      );
      const userSnapshot = await getDocs(userQuery);
      const userProfile = userSnapshot.docs[0]?.data() || {};

      const analytics = this.calculateAdvancedMetrics(tasks, projects, userProfile);
      
      return {
        ...userProfile,
        ...analytics,
        totalTasks: tasks.length,
        totalProjects: projects.length
      };

    } catch (error) {
      console.error('❌ Erreur getUserAnalytics:', error);
      return {};
    }
  }

  static calculateAdvancedMetrics(tasks, projects, userProfile) {
    const now = new Date();
    const completedTasks = tasks.filter(task => task.status === 'completed');
    
    const metrics = {
      completedTasks: completedTasks.length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      badges: userProfile.badges || [],
      maxStreak: userProfile.streak || 0
    };

    // 🌅 Analyse temporelle - Early Bird (avec gestion sécurisée des dates)
    metrics.earlyMorningTasks = completedTasks.filter(task => {
      if (!task.completedAt) return false;
      try {
        let completedDate;
        if (task.completedAt.toDate) {
          completedDate = task.completedAt.toDate();
        } else if (task.completedAt instanceof Date) {
          completedDate = task.completedAt;
        } else if (typeof task.completedAt === 'string') {
          completedDate = new Date(task.completedAt);
        } else {
          return false;
        }
        
        const completedHour = completedDate.getHours();
        return completedHour >= 5 && completedHour < 8;
      } catch (error) {
        console.warn('⚠️ Erreur traitement date earlyMorningTasks:', error);
        return false;
      }
    }).length;

    // 🦉 Analyse temporelle - Night Owl
    metrics.lateNightTasks = completedTasks.filter(task => {
      if (!task.completedAt) return false;
      try {
        let completedDate;
        if (task.completedAt.toDate) {
          completedDate = task.completedAt.toDate();
        } else if (task.completedAt instanceof Date) {
          completedDate = task.completedAt;
        } else if (typeof task.completedAt === 'string') {
          completedDate = new Date(task.completedAt);
        } else {
          return false;
        }
        
        const completedHour = completedDate.getHours();
        return completedHour >= 22 || completedHour < 2;
      } catch (error) {
        console.warn('⚠️ Erreur traitement date lateNightTasks:', error);
        return false;
      }
    }).length;

    // ⚔️ Weekend Warrior
    metrics.weekendTasks = completedTasks.filter(task => {
      if (!task.completedAt) return false;
      try {
        let completedDate;
        if (task.completedAt.toDate) {
          completedDate = task.completedAt.toDate();
        } else if (task.completedAt instanceof Date) {
          completedDate = task.completedAt;
        } else if (typeof task.completedAt === 'string') {
          completedDate = new Date(task.completedAt);
        } else {
          return false;
        }
        
        const dayOfWeek = completedDate.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // Dimanche = 0, Samedi = 6
      } catch (error) {
        console.warn('⚠️ Erreur traitement date weekendTasks:', error);
        return false;
      }
    }).length;

    // ✨ Perfectionist - tâches haute priorité sans retard
    metrics.perfectHighPriorityTasks = completedTasks.filter(task => {
      if (task.priority !== 'high') return false;
      if (!task.dueDate || !task.completedAt) return false;
      
      try {
        let dueDate, completedDate;
        
        if (task.dueDate.toDate) {
          dueDate = task.dueDate.toDate();
        } else {
          dueDate = new Date(task.dueDate);
        }
        
        if (task.completedAt.toDate) {
          completedDate = task.completedAt.toDate();
        } else {
          completedDate = new Date(task.completedAt);
        }
        
        return completedDate <= dueDate;
      } catch (error) {
        console.warn('⚠️ Erreur traitement date perfectHighPriorityTasks:', error);
        return false;
      }
    }).length;

    // 💨 Speed Demon - tâches complétées rapidement
    metrics.fastCompletions = completedTasks.filter(task => {
      if (!task.createdAt || !task.completedAt) return false;
      
      try {
        let createdDate, completedDate;
        
        if (task.createdAt.toDate) {
          createdDate = task.createdAt.toDate();
        } else {
          createdDate = new Date(task.createdAt);
        }
        
        if (task.completedAt.toDate) {
          completedDate = task.completedAt.toDate();
        } else {
          completedDate = new Date(task.completedAt);
        }
        
        const timeSpent = completedDate.getTime() - createdDate.getTime();
        return timeSpent < (60 * 60 * 1000); // Moins d'1 heure
      } catch (error) {
        console.warn('⚠️ Erreur traitement date fastCompletions:', error);
        return false;
      }
    }).length;

    // 🥷 Deadline Ninja - tâches complétées le jour de la deadline
    metrics.lastMinuteTasks = completedTasks.filter(task => {
      if (!task.dueDate || !task.completedAt) return false;
      
      try {
        let dueDate, completedDate;
        
        if (task.dueDate.toDate) {
          dueDate = task.dueDate.toDate();
        } else {
          dueDate = new Date(task.dueDate);
        }
        
        if (task.completedAt.toDate) {
          completedDate = task.completedAt.toDate();
        } else {
          completedDate = new Date(task.completedAt);
        }
        
        return dueDate.toDateString() === completedDate.toDateString();
      } catch (error) {
        console.warn('⚠️ Erreur traitement date lastMinuteTasks:', error);
        return false;
      }
    }).length;

    // 🏃‍♂️ Sprint Master - max tâches en une journée
    const tasksByDay = {};
    completedTasks.forEach(task => {
      if (!task.completedAt) return;
      try {
        let completedDate;
        if (task.completedAt.toDate) {
          completedDate = task.completedAt.toDate();
        } else {
          completedDate = new Date(task.completedAt);
        }
        
        const dateKey = completedDate.toDateString();
        tasksByDay[dateKey] = (tasksByDay[dateKey] || 0) + 1;
      } catch (error) {
        console.warn('⚠️ Erreur traitement date tasksByDay:', error);
      }
    });
    metrics.maxTasksInDay = Math.max(0, ...Object.values(tasksByDay));

    // 🎭 Multitasker - max projets différents en une journée
    const projectsByDay = {};
    completedTasks.forEach(task => {
      if (!task.completedAt || !task.projectId) return;
      try {
        let completedDate;
        if (task.completedAt.toDate) {
          completedDate = task.completedAt.toDate();
        } else {
          completedDate = new Date(task.completedAt);
        }
        
        const dateKey = completedDate.toDateString();
        if (!projectsByDay[dateKey]) projectsByDay[dateKey] = new Set();
        projectsByDay[dateKey].add(task.projectId);
      } catch (error) {
        console.warn('⚠️ Erreur traitement date projectsByDay:', error);
      }
    });
    
    metrics.maxProjectsInDay = Math.max(0, ...Object.values(projectsByDay).map(set => set.size));

    return metrics;
  }

  static async evaluateBadgeCondition(badge, userData, userId) {
    try {
      const condition = badge.condition;
      let evaluableCondition = condition;
      
      const metrics = [
        'completedTasks', 'earlyMorningTasks', 'lateNightTasks', 'weekendTasks',
        'perfectHighPriorityTasks', 'fastCompletions', 'lastMinuteTasks',
        'maxStreak', 'maxTasksInDay', 'completedProjects', 'maxProjectsInDay'
      ];
      
      metrics.forEach(metric => {
        const value = userData[metric] || 0;
        evaluableCondition = evaluableCondition.replace(
          new RegExp(metric, 'g'), 
          value.toString()
        );
      });

      const result = eval(evaluableCondition);
      console.log(`🔍 Badge ${badge.id}: ${condition} → ${evaluableCondition} = ${result}`);
      return result;

    } catch (error) {
      console.error(`❌ Erreur évaluation condition ${badge.id}:`, error);
      return false;
    }
  }

  static async awardBadges(userId, newBadges) {
    try {
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId),
        limit(1)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        console.error('❌ Utilisateur non trouvé:', userId);
        return;
      }

      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();

      const totalXpBonus = newBadges.reduce((sum, badge) => sum + badge.xpReward, 0);
      const newBadgeIds = newBadges.map(badge => badge.id);

      await updateDoc(doc(db, 'users', userDoc.id), {
        badges: arrayUnion(...newBadgeIds),
        xp: (userData.xp || 0) + totalXpBonus,
        lastBadgeUnlock: new Date()
      });

      this.triggerBadgeNotifications(newBadges);

      console.log(`✅ ${newBadges.length} badges attribués à l'utilisateur ${userId}`);
      console.log(`🎯 XP bonus total: +${totalXpBonus}`);

    } catch (error) {
      console.error('❌ Erreur awardBadges:', error);
    }
  }

  static triggerBadgeNotifications(badges) {
    badges.forEach(badge => {
      window.dispatchEvent(new CustomEvent('badgeUnlocked', {
        detail: {
          badge,
          timestamp: new Date()
        }
      }));
    });
  }

  static getAllBadges() {
    return Object.values(this.BADGE_DEFINITIONS);
  }

  static getBadgesByCategory() {
    const badges = this.getAllBadges();
    const categories = {};

    badges.forEach(badge => {
      if (!categories[badge.category]) {
        categories[badge.category] = [];
      }
      categories[badge.category].push(badge);
    });

    return categories;
  }

  static async getBadgeProgress(badgeId, userId) {
    try {
      const badge = this.BADGE_DEFINITIONS[badgeId];
      if (!badge) return null;

      const userData = await this.getUserAnalytics(userId);
      
      const conditionMatch = badge.condition.match(/(\w+)\s*>=\s*(\d+)/);
      if (!conditionMatch) return null;

      const [, metric, targetValue] = conditionMatch;
      const currentValue = userData[metric] || 0;
      const target = parseInt(targetValue);

      return {
        current: currentValue,
        target,
        percentage: Math.min(100, Math.round((currentValue / target) * 100)),
        completed: currentValue >= target
      };

    } catch (error) {
      console.error('❌ Erreur getBadgeProgress:', error);
      return null;
    }
  }
}

export default BadgeEngine;
