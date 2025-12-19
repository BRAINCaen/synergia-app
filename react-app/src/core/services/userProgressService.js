// ==========================================
// 📁 react-app/src/core/services/userProgressService.js
// SERVICE DE PROGRESSION UTILISATEUR - CORRECTION COMPLÈTE
// ==========================================

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';
import gameService from './gameService.js';
import userService from './userService.js';
import { calculateLevel, getXPProgress } from './levelService.js';

/**
 * 📊 SERVICE DE GESTION DE PROGRESSION UTILISATEUR
 */
class UserProgressService {
  constructor() {
    this.collectionName = 'userProgress';
  }

  /**
   * 🔄 FONCTION CRITIQUE: updateUserProgress
   * Corrige l'erreur "updateUserProgress is not a function"
   */
  async updateUserProgress(userId, progressData) {
    try {
      console.log('📊 Mise à jour progression utilisateur:', userId, progressData);

      if (!userId || !progressData) {
        throw new Error('userId et progressData requis');
      }

      const progressRef = doc(db, this.collectionName, userId);
      const progressDoc = await getDoc(progressRef);

      const timestamp = new Date();
      const updatedData = {
        ...progressData,
        userId,
        lastUpdated: timestamp,
        updatedAt: timestamp
      };

      if (progressDoc.exists()) {
        // Mise à jour existante
        const currentData = progressDoc.data();
        const mergedData = {
          ...currentData,
          ...updatedData,
          // Fusionner les statistiques
          stats: {
            ...currentData.stats,
            ...updatedData.stats
          }
        };

        await updateDoc(progressRef, mergedData);
        console.log('✅ Progression mise à jour avec succès');
        return { success: true, data: mergedData };

      } else {
        // Création nouvelle
        const newData = {
          ...updatedData,
          createdAt: timestamp,
          version: '1.0'
        };

        await setDoc(progressRef, newData);
        console.log('✅ Nouvelle progression créée avec succès');
        return { success: true, data: newData };
      }

    } catch (error) {
      console.error('❌ Erreur updateUserProgress:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📈 FONCTION CRITIQUE: getUserProgress
   * Corrige l'erreur "getUserProgress is not a function"
   */
  async getUserProgress(userId) {
    try {
      console.log('📊 Récupération progression utilisateur:', userId);

      if (!userId) {
        throw new Error('userId requis');
      }

      const progressRef = doc(db, this.collectionName, userId);
      const progressDoc = await getDoc(progressRef);

      if (progressDoc.exists()) {
        const data = progressDoc.data();
        console.log('✅ Progression récupérée avec succès');
        return { success: true, data };

      } else {
        // Créer une progression par défaut
        const defaultProgress = await this.createDefaultProgress(userId);
        return { success: true, data: defaultProgress };
      }

    } catch (error) {
      console.error('❌ Erreur getUserProgress:', error);
      return { success: false, error: error.message, data: null };
    }
  }

  /**
   * 🆕 Créer une progression par défaut
   */
  async createDefaultProgress(userId) {
    try {
      const userProfile = await userService.getUserProfile(userId);
      const user = userProfile.data || {};

      const defaultData = {
        userId,
        level: 1,
        experience: 0,
        experienceToNext: 100,
        streak: 0,
        longestStreak: 0,
        totalTasks: 0,
        completedTasks: 0,
        stats: {
          tasksCompleted: 0,
          tasksCompletedEarly: 0,
          highPriorityTasks: 0,
          perfectWeeks: 0,
          currentStreak: 0,
          weekendTasks: 0,
          nightOwlTasks: 0,
          helpfulVotes: 0,
          projectsLed: 0,
          teamCollaborations: 0,
          creativeTasks: 0,
          codingTasks: 0,
          presentationsGiven: 0,
          mentoringHours: 0
        },
        milestones: [],
        achievements: [],
        badges: [],
        lastActivityDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0'
      };

      // Sauvegarder la progression par défaut
      await this.updateUserProgress(userId, defaultData);
      
      console.log('✅ Progression par défaut créée');
      return defaultData;

    } catch (error) {
      console.error('❌ Erreur création progression par défaut:', error);
      return {
        userId,
        level: 1,
        experience: 0,
        stats: {},
        error: error.message
      };
    }
  }

  /**
   * 📊 Calculer les statistiques de progression
   */
  async calculateProgressStats(userId) {
    try {
      // Récupérer les données utilisateur
      const [userResult, tasksResult, activitiesResult] = await Promise.all([
        userService.getUserProfile(userId),
        this.getUserTasks(userId),
        gameService.getUserActivities(userId, 100)
      ]);

      const user = userResult.data || {};
      const tasks = tasksResult || [];
      const activities = activitiesResult.data || [];

      const completedTasks = tasks.filter(t => t.status === 'completed');
      const highPriorityTasks = completedTasks.filter(t => t.priority === 'high' || t.priority === 'urgent');
      const tasksCompletedEarly = completedTasks.filter(t => {
        if (!t.dueDate || !t.completedAt) return false;
        return new Date(t.completedAt) < new Date(t.dueDate);
      });

      // Calculer la streak actuelle
      const currentStreak = this.calculateStreak(completedTasks);

      return {
        tasksCompleted: completedTasks.length,
        tasksCompletedEarly: tasksCompletedEarly.length,
        highPriorityTasks: highPriorityTasks.length,
        currentStreak,
        totalActivities: activities.length,
        level: user.level || 1,
        experience: user.experience || 0
      };

    } catch (error) {
      console.error('❌ Erreur calcul stats progression:', error);
      return {};
    }
  }

  /**
   * 🔥 Calculer la streak de tâches
   */
  calculateStreak(tasks) {
    if (!tasks || tasks.length === 0) return 0;

    const tasksByDate = new Map();
    tasks.forEach(task => {
      if (task.completedAt) {
        const date = new Date(task.completedAt);
        const dateKey = date.toDateString();
        tasksByDate.set(dateKey, true);
      }
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

  /**
   * 📋 Récupérer les tâches utilisateur (fallback)
   */
  async getUserTasks(userId) {
    try {
      // Essayer d'utiliser le service de tâches
      if (window.taskService && typeof window.taskService.getUserTasks === 'function') {
        const result = await window.taskService.getUserTasks(userId);
        return result.data || result || [];
      }

      // Fallback : récupération directe depuis Firestore
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('assignedTo', '==', userId)
      );
      
      const querySnapshot = await getDocs(tasksQuery);
      const tasks = [];
      querySnapshot.forEach(doc => {
        tasks.push({ id: doc.id, ...doc.data() });
      });

      return tasks;

    } catch (error) {
      console.error('❌ Erreur récupération tâches:', error);
      return [];
    }
  }

  /**
   * 🎯 Mettre à jour une métrique spécifique
   */
  async updateMetric(userId, metricName, value, operation = 'set') {
    try {
      const currentProgress = await this.getUserProgress(userId);
      const progressData = currentProgress.data || {};

      if (!progressData.stats) progressData.stats = {};

      switch (operation) {
        case 'increment':
          progressData.stats[metricName] = (progressData.stats[metricName] || 0) + value;
          break;
        case 'decrement':
          progressData.stats[metricName] = Math.max((progressData.stats[metricName] || 0) - value, 0);
          break;
        case 'max':
          progressData.stats[metricName] = Math.max(progressData.stats[metricName] || 0, value);
          break;
        default: // 'set'
          progressData.stats[metricName] = value;
      }

      return await this.updateUserProgress(userId, progressData);

    } catch (error) {
      console.error('❌ Erreur mise à jour métrique:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🏆 Mettre à jour le niveau et l'expérience
   */
  async updateLevelAndXP(userId, xpToAdd, reason = 'Activité') {
    try {
      const currentProgress = await this.getUserProgress(userId);
      const progressData = currentProgress.data || {};

      const currentXP = progressData.experience || 0;
      const newXP = currentXP + xpToAdd;
      
      // Calculer le nouveau niveau (système calibré)
      const newLevel = calculateLevel(newXP);
      const progress = getXPProgress(newXP);
      const experienceToNext = progress.xpToNextLevel;

      progressData.experience = newXP;
      progressData.level = newLevel;
      progressData.experienceToNext = experienceToNext;

      // Ajouter à l'historique XP
      if (!progressData.xpHistory) progressData.xpHistory = [];
      progressData.xpHistory.push({
        amount: xpToAdd,
        reason,
        timestamp: new Date(),
        newTotal: newXP
      });

      // Garder seulement les 50 dernières entrées
      if (progressData.xpHistory.length > 50) {
        progressData.xpHistory = progressData.xpHistory.slice(-50);
      }

      const result = await this.updateUserProgress(userId, progressData);

      console.log(`🎯 ${xpToAdd} XP ajoutés pour "${reason}". Nouveau total: ${newXP} XP, Niveau: ${newLevel}`);
      return result;

    } catch (error) {
      console.error('❌ Erreur mise à jour niveau/XP:', error);
      return { success: false, error: error.message };
    }
  }
}

// Créer l'instance du service
const userProgressService = new UserProgressService();

// ==========================================
// 🔧 CORRECTION GLOBALE DES RÉFÉRENCES
// ==========================================

// Exposer le service globalement pour corriger les erreurs
if (typeof window !== 'undefined') {
  window.userProgressService = userProgressService;
  window.updateUserProgress = userProgressService.updateUserProgress.bind(userProgressService);
  window.getUserProgress = userProgressService.getUserProgress.bind(userProgressService);
  
  // Créer des aliases pour la compatibilité
  if (!window.qd) window.qd = {};
  window.qd.updateUserProgress = userProgressService.updateUserProgress.bind(userProgressService);
  window.qd.getUserProgress = userProgressService.getUserProgress.bind(userProgressService);
  
  console.log('✅ Service de progression utilisateur exposé globalement');
}

export default userProgressService;
export { userProgressService };

// Log de confirmation
console.log('📊 UserProgressService initialisé et corrigé');
