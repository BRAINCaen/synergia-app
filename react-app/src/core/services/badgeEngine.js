// ==========================================
// 📁 react-app/src/core/services/badgeEngine.js
// Badge Engine - VERSION COMPLÈTE ET CORRIGÉE
// ==========================================

import { collection, doc, updateDoc, arrayUnion, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🏆 BADGE ENGINE SIMPLIFIÉ ET CORRIGÉ
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
    'consistency_king': {
      id: 'consistency_king',
      name: 'Consistency King',
      icon: '👑',
      description: 'Streak de 7 jours consécutifs',
      condition: 'maxStreak >= 7',
      category: 'consistency',
      rarity: 'epic',
      xpReward: 400
    }
  };

  static async checkAndAwardBadges(userId) {
    try {
      console.log('🏆 Badge Engine: Analyse pour', userId);

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
        console.log(`🎉 ${newBadges.length} nouveaux badges!`);
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

      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId),
        limit(1)
      );
      const userSnapshot = await getDocs(userQuery);
      const userProfile = userSnapshot.docs[0]?.data() || {};

      const analytics = this.calculateMetrics(tasks, userProfile);
      
      return {
        ...userProfile,
        ...analytics,
        totalTasks: tasks.length
      };

    } catch (error) {
      console.error('❌ Erreur getUserAnalytics:', error);
      return {};
    }
  }

  static calculateMetrics(tasks, userProfile) {
    const completedTasks = tasks.filter(task => task.status === 'completed');
    
    const metrics = {
      completedTasks: completedTasks.length,
      badges: userProfile.badges || [],
      maxStreak: userProfile.streak || 0
    };

    // 🔧 CORRECTION: Gestion sécurisée des dates Firebase
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
        console.warn('⚠️ Erreur traitement date:', error);
        return false;
      }
    }).length;

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
        console.warn('⚠️ Erreur traitement date:', error);
        return false;
      }
    }).length;

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
        console.warn('⚠️ Erreur traitement date:', error);
        return false;
      }
    }).length;

    return metrics;
  }

  static async evaluateBadgeCondition(badge, userData, userId) {
    try {
      const condition = badge.condition;
      let evaluableCondition = condition;
      
      const metrics = [
        'completedTasks', 'earlyMorningTasks', 'lateNightTasks',
        'perfectHighPriorityTasks', 'maxStreak'
      ];
      
      metrics.forEach(metric => {
        const value = userData[metric] || 0;
        evaluableCondition = evaluableCondition.replace(
          new RegExp(metric, 'g'), 
          value.toString()
        );
      });

      const result = eval(evaluableCondition);
      console.log(`🔍 Badge ${badge.id}: ${condition} → ${result}`);
      return result;

    } catch (error) {
      console.error(`❌ Erreur évaluation ${badge.id}:`, error);
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

      console.log(`✅ ${newBadges.length} badges attribués`);

    } catch (error) {
      console.error('❌ Erreur awardBadges:', error);
    }
  }

  static triggerBadgeNotifications(badges) {
    badges.forEach(badge => {
      window.dispatchEvent(new CustomEvent('badgeUnlocked', {
        detail: { badge, timestamp: new Date() }
      }));
    });
  }

  static getAllBadges() {
    return Object.values(this.BADGE_DEFINITIONS);
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
