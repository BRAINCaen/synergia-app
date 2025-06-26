// ==========================================
// 📁 react-app/src/core/services/badgeEngine.js
// Badge Engine Intelligent - Détection automatique des badges
// ==========================================

import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🏆 DÉFINITION DES BADGES INTELLIGENTS
 */
const BADGE_DEFINITIONS = {
  // 🌅 Badges de productivité temporelle
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Lève-tôt',
    description: 'Créer 5 tâches avant 9h du matin',
    icon: '🌅',
    xp: 50,
    rarity: 'common',
    condition: 'early_tasks',
    threshold: 5
  },
  
  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Oiseau de nuit',
    description: 'Compléter 5 tâches après 18h',
    icon: '🦉',
    xp: 50,
    rarity: 'common',
    condition: 'late_tasks',
    threshold: 5
  },
  
  // ⚡ Badges de performance
  SPRINT_MASTER: {
    id: 'sprint_master',
    name: 'Maître du Sprint',
    description: 'Compléter 10 tâches en une journée',
    icon: '⚡',
    xp: 100,
    rarity: 'rare',
    condition: 'daily_tasks',
    threshold: 10
  },
  
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Démon de vitesse',
    description: 'Compléter une tâche en moins de 30 minutes',
    icon: '💨',
    xp: 75,
    rarity: 'uncommon',
    condition: 'quick_completion',
    threshold: 30 // minutes
  },
  
  // 🔥 Badges de consistance
  CONSISTENCY_KING: {
    id: 'consistency_king',
    name: 'Roi de la Régularité',
    description: '7 jours consécutifs avec au moins une tâche',
    icon: '🔥',
    xp: 200,
    rarity: 'epic',
    condition: 'consecutive_days',
    threshold: 7
  },
  
  WEEK_WARRIOR: {
    id: 'week_warrior',
    name: 'Guerrier de la Semaine',
    description: 'Être actif tous les jours de la semaine',
    icon: '⚔️',
    xp: 150,
    rarity: 'rare',
    condition: 'weekly_activity',
    threshold: 7
  },
  
  // 🎯 Badges de volume
  TASK_DESTROYER: {
    id: 'task_destroyer_25',
    name: 'Destructeur de Tâches',
    description: 'Compléter 25 tâches au total',
    icon: '🎯',
    xp: 100,
    rarity: 'common',
    condition: 'total_tasks',
    threshold: 25
  },
  
  TASK_ANNIHILATOR: {
    id: 'task_annihilator_100',
    name: 'Annihilateur de Tâches',
    description: 'Compléter 100 tâches au total',
    icon: '💥',
    xp: 300,
    rarity: 'legendary',
    condition: 'total_tasks',
    threshold: 100
  },
  
  // 📊 Badges de qualité
  PERFECTIONIST: {
    id: 'perfectionist',
    name: 'Perfectionniste',
    description: '95% de taux de completion sur 20 tâches',
    icon: '⭐',
    xp: 150,
    rarity: 'rare',
    condition: 'completion_rate',
    threshold: 0.95,
    minTasks: 20
  },
  
  DEADLINE_NINJA: {
    id: 'deadline_ninja',
    name: 'Ninja des Deadlines',
    description: 'Terminer 10 tâches avant leur deadline',
    icon: '🥷',
    xp: 125,
    rarity: 'uncommon',
    condition: 'deadline_respect',
    threshold: 10
  },
  
  // 🚀 Badges de milestone
  FIRST_WEEK: {
    id: 'first_week',
    name: 'Première Semaine',
    description: 'Utiliser Synergia pendant 7 jours',
    icon: '🚀',
    xp: 75,
    rarity: 'common',
    condition: 'usage_days',
    threshold: 7
  },
  
  COMEBACK_KID: {
    id: 'comeback_kid',
    name: 'Retour en Force',
    description: 'Revenir après 7+ jours d\'inactivité',
    icon: '🔄',
    xp: 100,
    rarity: 'uncommon',
    condition: 'comeback',
    threshold: 7
  }
};

/**
 * 🤖 CLASSE BADGE ENGINE PRINCIPALE
 */
class BadgeEngine {
  constructor() {
    this.userId = null;
    this.userBadges = new Set();
    this.pendingNotifications = [];
  }

  /**
   * 🔧 Initialiser le moteur pour un utilisateur
   */
  async initialize(userId) {
    this.userId = userId;
    await this.loadUserBadges();
    console.log('🏆 Badge Engine initialisé pour:', userId);
  }

  /**
   * 📊 Charger les badges existants de l'utilisateur
   */
  async loadUserBadges() {
    try {
      const userDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', this.userId))
      );
      
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        this.userBadges = new Set(userData.badges || []);
        console.log('🏆 Badges existants chargés:', this.userBadges.size);
      }
    } catch (error) {
      console.error('❌ Erreur chargement badges:', error);
    }
  }

  /**
   * 🎯 MÉTHODE PRINCIPALE - Vérifier tous les badges
   */
  async checkAllBadges() {
    if (!this.userId) {
      console.warn('⚠️ Badge Engine non initialisé');
      return [];
    }

    console.log('🔍 Vérification automatique des badges...');
    const newBadges = [];

    for (const [key, badge] of Object.entries(BADGE_DEFINITIONS)) {
      if (!this.userBadges.has(badge.id)) {
        const earned = await this.checkBadgeCondition(badge);
        if (earned) {
          newBadges.push(badge);
          this.userBadges.add(badge.id);
          console.log(`🏆 Nouveau badge débloqué: ${badge.name}`);
        }
      }
    }

    return newBadges;
  }

  /**
   * 🧮 Vérifier une condition de badge spécifique
   */
  async checkBadgeCondition(badge) {
    try {
      switch (badge.condition) {
        case 'early_tasks':
          return await this.checkEarlyTasks(badge.threshold);
        
        case 'late_tasks':
          return await this.checkLateTasks(badge.threshold);
        
        case 'daily_tasks':
          return await this.checkDailyTasks(badge.threshold);
        
        case 'total_tasks':
          return await this.checkTotalTasks(badge.threshold);
        
        case 'consecutive_days':
          return await this.checkConsecutiveDays(badge.threshold);
        
        case 'completion_rate':
          return await this.checkCompletionRate(badge.threshold, badge.minTasks);
        
        case 'deadline_respect':
          return await this.checkDeadlineRespect(badge.threshold);
        
        case 'usage_days':
          return await this.checkUsageDays(badge.threshold);
        
        case 'quick_completion':
          return await this.checkQuickCompletion(badge.threshold);
        
        case 'comeback':
          return await this.checkComeback(badge.threshold);
        
        default:
          console.warn(`⚠️ Condition inconnue: ${badge.condition}`);
          return false;
      }
    } catch (error) {
      console.error(`❌ Erreur vérification badge ${badge.id}:`, error);
      return false;
    }
  }

  /**
   * 🌅 Vérifier les tâches créées tôt le matin
   */
  async checkEarlyTasks(threshold) {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', this.userId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    
    const snapshot = await getDocs(q);
    let earlyTasksCount = 0;
    
    snapshot.forEach(doc => {
      const task = doc.data();
      const createdAt = new Date(task.createdAt);
      const hour = createdAt.getHours();
      
      if (hour >= 5 && hour < 9) {
        earlyTasksCount++;
      }
    });
    
    return earlyTasksCount >= threshold;
  }

  /**
   * 🦉 Vérifier les tâches complétées tard le soir
   */
  async checkLateTasks(threshold) {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', this.userId),
      where('status', '==', 'completed'),
      orderBy('completedAt', 'desc'),
      limit(100)
    );
    
    const snapshot = await getDocs(q);
    let lateTasksCount = 0;
    
    snapshot.forEach(doc => {
      const task = doc.data();
      if (task.completedAt) {
        const completedAt = new Date(task.completedAt);
        const hour = completedAt.getHours();
        
        if (hour >= 18 || hour < 6) {
          lateTasksCount++;
        }
      }
    });
    
    return lateTasksCount >= threshold;
  }

  /**
   * ⚡ Vérifier les tâches complétées en une journée
   */
  async checkDailyTasks(threshold) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', this.userId),
      where('status', '==', 'completed'),
      where('completedAt', '>=', today.toISOString()),
      where('completedAt', '<', tomorrow.toISOString())
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size >= threshold;
  }

  /**
   * 🎯 Vérifier le nombre total de tâches complétées
   */
  async checkTotalTasks(threshold) {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', this.userId),
      where('status', '==', 'completed')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size >= threshold;
  }

  /**
   * 🔥 Vérifier les jours consécutifs d'activité
   */
  async checkConsecutiveDays(threshold) {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', this.userId),
      orderBy('createdAt', 'desc'),
      limit(200)
    );
    
    const snapshot = await getDocs(q);
    const activeDays = new Set();
    
    snapshot.forEach(doc => {
      const task = doc.data();
      const date = new Date(task.createdAt);
      const dayKey = date.toDateString();
      activeDays.add(dayKey);
    });
    
    // Vérifier la séquence de jours consécutifs
    const sortedDays = Array.from(activeDays)
      .map(day => new Date(day))
      .sort((a, b) => b - a);
    
    let consecutiveCount = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < threshold; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() - i);
      
      const hasActivity = sortedDays.some(day => 
        day.toDateString() === checkDate.toDateString()
      );
      
      if (hasActivity) {
        consecutiveCount++;
      } else {
        break;
      }
    }
    
    return consecutiveCount >= threshold;
  }

  /**
   * ⭐ Vérifier le taux de completion
   */
  async checkCompletionRate(threshold, minTasks) {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', this.userId),
      orderBy('createdAt', 'desc'),
      limit(minTasks + 50)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.size < minTasks) {
      return false;
    }
    
    let completedCount = 0;
    let totalCount = 0;
    
    snapshot.forEach(doc => {
      const task = doc.data();
      totalCount++;
      if (task.status === 'completed') {
        completedCount++;
      }
    });
    
    const completionRate = completedCount / totalCount;
    return completionRate >= threshold && totalCount >= minTasks;
  }

  /**
   * 🥷 Vérifier le respect des deadlines
   */
  async checkDeadlineRespect(threshold) {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', this.userId),
      where('status', '==', 'completed'),
      orderBy('completedAt', 'desc'),
      limit(100)
    );
    
    const snapshot = await getDocs(q);
    let onTimeCount = 0;
    
    snapshot.forEach(doc => {
      const task = doc.data();
      if (task.dueDate && task.completedAt) {
        const dueDate = new Date(task.dueDate);
        const completedAt = new Date(task.completedAt);
        
        if (completedAt <= dueDate) {
          onTimeCount++;
        }
      }
    });
    
    return onTimeCount >= threshold;
  }

  /**
   * 🚀 Vérifier les jours d'utilisation
   */
  async checkUsageDays(threshold) {
    // Calculer depuis la première connexion
    const userDoc = await getDocs(
      query(collection(db, 'users'), where('uid', '==', this.userId))
    );
    
    if (userDoc.empty) return false;
    
    const userData = userDoc.docs[0].data();
    const createdAt = new Date(userData.createdAt || userData.metadata?.creationTime);
    const now = new Date();
    
    const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    return daysDiff >= threshold;
  }

  /**
   * 💨 Vérifier les complétions rapides
   */
  async checkQuickCompletion(thresholdMinutes) {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', this.userId),
      where('status', '==', 'completed'),
      orderBy('completedAt', 'desc'),
      limit(50)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.some(doc => {
      const task = doc.data();
      if (task.createdAt && task.completedAt) {
        const created = new Date(task.createdAt);
        const completed = new Date(task.completedAt);
        const diffMinutes = (completed - created) / (1000 * 60);
        
        return diffMinutes <= thresholdMinutes;
      }
      return false;
    });
  }

  /**
   * 🔄 Vérifier le retour après inactivité
   */
  async checkComeback(thresholdDays) {
    // Vérifier s'il y a eu une période d'inactivité puis un retour
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', this.userId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    
    const snapshot = await getDocs(q);
    const activities = [];
    
    snapshot.forEach(doc => {
      activities.push(new Date(doc.data().createdAt));
    });
    
    if (activities.length < 2) return false;
    
    activities.sort((a, b) => b - a);
    
    // Chercher un gap de plus de thresholdDays
    for (let i = 0; i < activities.length - 1; i++) {
      const gap = (activities[i] - activities[i + 1]) / (1000 * 60 * 60 * 24);
      if (gap >= thresholdDays) {
        // Vérifier qu'il y a eu une activité récente (moins de 24h)
        const lastActivity = activities[0];
        const now = new Date();
        const hoursSinceLastActivity = (now - lastActivity) / (1000 * 60 * 60);
        
        return hoursSinceLastActivity <= 24;
      }
    }
    
    return false;
  }
}

// Export de l'instance singleton
export const badgeEngine = new BadgeEngine();
export { BADGE_DEFINITIONS };
export default badgeEngine;
