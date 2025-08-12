// ==========================================
// 📁 react-app/src/core/services/taskHistoryService.js
// SYSTÈME D'HISTORIQUE COMPLET DES TÂCHES - VERSION CLEAN SANS DUPLICATION
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc,
  getDocs,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🗃️ SERVICE DE GESTION DE L'HISTORIQUE DES TÂCHES
 */
class TaskHistoryService {
  constructor() {
    this.HISTORY_COLLECTION = 'task_history';
    this.TASKS_COLLECTION = 'tasks';
    this.USER_STATS_COLLECTION = 'user_task_stats';
  }

  /**
   * 📝 ARCHIVER UNE TÂCHE TERMINÉE
   */
  async archiveCompletedTask(taskId, completionData) {
    try {
      console.log('📝 [ARCHIVE] Début archivage tâche:', taskId);

      // Récupérer la tâche originale
      const taskRef = doc(db, this.TASKS_COLLECTION, taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche originale introuvable');
      }

      const originalTask = { id: taskId, ...taskDoc.data() };

      // Créer l'entrée d'historique
      const historyEntry = {
        originalTaskId: taskId,
        completedBy: completionData.userId,
        completedByName: completionData.userName || 'Utilisateur',
        
        title: originalTask.title,
        description: originalTask.description || '',
        difficulty: originalTask.difficulty || 'medium',
        priority: originalTask.priority || 'medium',
        xpReward: originalTask.xpReward || 0,
        roleId: originalTask.roleId || null,
        category: originalTask.category || 'general',
        estimatedHours: originalTask.estimatedHours || 0,
        
        completedAt: serverTimestamp(),
        validatedBy: completionData.validatedBy || null,
        validatedAt: completionData.validatedAt || serverTimestamp(),
        adminComment: completionData.adminComment || '',
        submissionComment: completionData.submissionComment || '',
        
        isRecurring: Boolean(originalTask.isRecurring),
        recurrenceType: originalTask.recurrenceType || null,
        instanceNumber: originalTask.instanceNumber || 1,
        
        completionWeek: this.getWeekNumber(new Date()),
        completionMonth: new Date().getMonth() + 1,
        completionYear: new Date().getFullYear(),
        
        archivedAt: serverTimestamp(),
        version: '1.0'
      };

      // Sauvegarder dans l'historique
      const historyRef = await addDoc(
        collection(db, this.HISTORY_COLLECTION), 
        historyEntry
      );

      // Mettre à jour les statistiques utilisateur
      await this.updateUserTaskStats(
        completionData.userId, 
        originalTask, 
        completionData,
        historyRef.id
      );

      // Gérer la récurrence ou archiver
      if (originalTask.isRecurring) {
        const nextOccurrence = this.calculateNextOccurrence(originalTask);
        if (nextOccurrence) {
          await this.handleRecurringTaskCompletion(taskId, originalTask, nextOccurrence);
        } else {
          await this.archiveNonRecurringTask(taskId);
        }
      } else {
        await this.archiveNonRecurringTask(taskId);
      }

      console.log('✅ [ARCHIVE] Tâche archivée avec succès:', historyRef.id);
      
      return {
        success: true,
        historyId: historyRef.id,
        message: 'Tâche archivée avec succès'
      };

    } catch (error) {
      console.error('❌ [ARCHIVE] Erreur archivage tâche:', error);
      throw error;
    }
  }

  /**
   * 🔄 GÉRER LA COMPLETION D'UNE TÂCHE RÉCURRENTE
   */
  async handleRecurringTaskCompletion(taskId, originalTask, nextOccurrence) {
    try {
      console.log('🔄 [RECURRENCE] Gestion tâche récurrente:', originalTask.title);

      const taskRef = doc(db, this.TASKS_COLLECTION, taskId);
      
      await updateDoc(taskRef, {
        status: 'todo',
        completedAt: null,
        validatedBy: null,
        adminComment: null,
        submissionComment: null,
        
        dueDate: nextOccurrence,
        instanceNumber: (originalTask.instanceNumber || 1) + 1,
        lastCompletedAt: serverTimestamp(),
        
        updatedAt: serverTimestamp(),
        recreatedAt: serverTimestamp(),
        recreatedReason: 'recurring_task_completion'
      });

      console.log('✅ [RECURRENCE] Prochaine instance programmée:', nextOccurrence);

    } catch (error) {
      console.error('❌ [RECURRENCE] Erreur gestion récurrence:', error);
      throw error;
    }
  }

  /**
   * 🗂️ ARCHIVER UNE TÂCHE NON-RÉCURRENTE
   */
  async archiveNonRecurringTask(taskId) {
    try {
      const taskRef = doc(db, this.TASKS_COLLECTION, taskId);
      
      await updateDoc(taskRef, {
        status: 'archived',
        archivedAt: serverTimestamp(),
        archivedReason: 'task_completed_non_recurring'
      });

      console.log('🗂️ [ARCHIVE] Tâche non-récurrente archivée:', taskId);

    } catch (error) {
      console.error('❌ [ARCHIVE] Erreur archivage non-récurrent:', error);
      throw error;
    }
  }

  /**
   * 📊 METTRE À JOUR LES STATISTIQUES UTILISATEUR
   */
  async updateUserTaskStats(userId, originalTask, completionData, historyId) {
    try {
      console.log('📊 [STATS] Mise à jour statistiques pour:', userId);

      const statsRef = doc(db, this.USER_STATS_COLLECTION, userId);
      const statsDoc = await getDoc(statsRef);
      
      let currentStats = {
        userId: userId,
        totalTasksCompleted: 0,
        totalXpEarned: 0,
        totalTimeSpent: 0,
        tasksThisWeek: 0,
        tasksThisMonth: 0
      };

      if (statsDoc.exists()) {
        currentStats = { ...currentStats, ...statsDoc.data() };
      }

      const xpEarned = originalTask.xpReward || 0;
      const timeSpent = completionData.timeSpent || 0;

      const updates = {
        totalTasksCompleted: (currentStats.totalTasksCompleted || 0) + 1,
        totalXpEarned: (currentStats.totalXpEarned || 0) + xpEarned,
        totalTimeSpent: (currentStats.totalTimeSpent || 0) + timeSpent,
        
        tasksThisWeek: this.isCurrentWeek(new Date()) ? 
          (currentStats.tasksThisWeek || 0) + 1 : (currentStats.tasksThisWeek || 0),
        tasksThisMonth: this.isCurrentMonth(new Date()) ? 
          (currentStats.tasksThisMonth || 0) + 1 : (currentStats.tasksThisMonth || 0),
        
        [`${originalTask.difficulty || 'medium'}TasksCompleted`]: 
          (currentStats[`${originalTask.difficulty || 'medium'}TasksCompleted`] || 0) + 1,
        
        [`role_${originalTask.roleId || 'none'}_completed`]: 
          (currentStats[`role_${originalTask.roleId || 'none'}_completed`] || 0) + 1,
        
        lastTaskCompleted: originalTask.title,
        lastTaskCompletedId: historyId,
        lastCompletionDate: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      if (originalTask.isRecurring) {
        const taskKey = this.sanitizeTaskKey(originalTask.title);
        const recurringCountKey = `recurring_${taskKey}_count`;
        updates[recurringCountKey] = (currentStats[recurringCountKey] || 0) + 1;
        updates.totalRecurringCompleted = (currentStats.totalRecurringCompleted || 0) + 1;
      }

      await setDoc(statsRef, updates, { merge: true });

      console.log('✅ [STATS] Statistiques mises à jour avec succès');

    } catch (error) {
      console.error('❌ [STATS] Erreur mise à jour statistiques:', error);
      throw error;
    }
  }

  /**
   * 📅 CALCULER LA PROCHAINE OCCURRENCE
   */
  calculateNextOccurrence(task) {
    if (!task.isRecurring || !task.recurrenceType) {
      return null;
    }

    const now = new Date();
    const interval = parseInt(task.recurrenceInterval) || 1;
    
    switch (task.recurrenceType) {
      case 'daily':
        return new Date(now.getTime() + (interval * 24 * 60 * 60 * 1000));
        
      case 'weekly':
        return new Date(now.getTime() + (interval * 7 * 24 * 60 * 60 * 1000));
        
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + interval);
        return nextMonth;
        
      case 'yearly':
        const nextYear = new Date(now);
        nextYear.setFullYear(nextYear.getFullYear() + interval);
        return nextYear;
        
      default:
        return null;
    }
  }

  /**
   * 📋 RÉCUPÉRER L'HISTORIQUE D'UN UTILISATEUR
   */
  async getUserTaskHistory(userId, options = {}) {
    try {
      const {
        limit: queryLimit = 50,
        roleId = null,
        category = null,
        isRecurring = null,
        difficulty = null
      } = options;

      let constraints = [
        where('completedBy', '==', userId),
        orderBy('completedAt', 'desc')
      ];

      if (roleId) {
        constraints.push(where('roleId', '==', roleId));
      }
      
      if (category) {
        constraints.push(where('category', '==', category));
      }
      
      if (isRecurring !== null) {
        constraints.push(where('isRecurring', '==', isRecurring));
      }
      
      if (difficulty) {
        constraints.push(where('difficulty', '==', difficulty));
      }

      if (queryLimit) {
        constraints.push(limit(queryLimit));
      }

      const q = query(collection(db, this.HISTORY_COLLECTION), ...constraints);
      const snapshot = await getDocs(q);
      const history = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        history.push({
          id: doc.id,
          ...data,
          completedAt: data.completedAt?.toDate?.() || data.completedAt
        });
      });

      console.log(`📋 [HISTORY] Historique récupéré: ${history.length} entrées`);
      return history;

    } catch (error) {
      console.error('❌ [HISTORY] Erreur récupération historique:', error);
      throw error;
    }
  }

  /**
   * 📊 RÉCUPÉRER LES STATISTIQUES D'UN UTILISATEUR
   */
  async getUserTaskStats(userId) {
    try {
      const statsRef = doc(db, this.USER_STATS_COLLECTION, userId);
      const statsDoc = await getDoc(statsRef);
      
      if (!statsDoc.exists()) {
        return {
          userId,
          totalTasksCompleted: 0,
          totalXpEarned: 0,
          totalTimeSpent: 0,
          tasksThisWeek: 0,
          tasksThisMonth: 0,
          lastTaskCompleted: null,
          lastCompletionDate: null
        };
      }

      const stats = statsDoc.data();
      
      if (stats.lastCompletionDate?.toDate) {
        stats.lastCompletionDate = stats.lastCompletionDate.toDate();
      }

      return stats;

    } catch (error) {
      console.error('❌ [STATS] Erreur récupération statistiques:', error);
      throw error;
    }
  }

  /**
   * 🔍 ANALYSER LES PERFORMANCES PAR TYPE DE TÂCHE
   */
  async analyzeTaskTypePerformance(userId, taskTitle) {
    try {
      const q = query(
        collection(db, this.HISTORY_COLLECTION),
        where('completedBy', '==', userId),
        where('title', '==', taskTitle),
        orderBy('completedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const occurrences = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        occurrences.push({
          id: doc.id,
          completedAt: data.completedAt?.toDate?.() || data.completedAt,
          timeSpent: data.timeSpent || 0,
          xpReward: data.xpReward || 0,
          instanceNumber: data.instanceNumber || 1
        });
      });

      const totalOccurrences = occurrences.length;
      const averageTime = totalOccurrences > 0 ? 
        occurrences.reduce((sum, occ) => sum + occ.timeSpent, 0) / totalOccurrences : 0;
      const totalXp = occurrences.reduce((sum, occ) => sum + occ.xpReward, 0);

      return {
        taskTitle,
        totalOccurrences,
        averageTime: Math.round(averageTime),
        totalXpEarned: totalXp,
        occurrences: occurrences.slice(0, 10),
        lastCompleted: occurrences[0]?.completedAt || null
      };

    } catch (error) {
      console.error('❌ [ANALYSIS] Erreur analyse performance:', error);
      throw error;
    }
  }

  /**
   * 🏆 RÉCUPÉRER LE CLASSEMENT DES UTILISATEURS PAR TÂCHES
   */
  async getTaskLeaderboard(timeframe = 'all', queryLimit = 10) {
    try {
      let orderField = 'totalTasksCompleted';
      
      if (timeframe === 'week') {
        orderField = 'tasksThisWeek';
      } else if (timeframe === 'month') {
        orderField = 'tasksThisMonth';
      }

      const q = query(
        collection(db, this.USER_STATS_COLLECTION),
        orderBy(orderField, 'desc'),
        limit(queryLimit)
      );

      const snapshot = await getDocs(q);
      const leaderboard = [];
      
      snapshot.forEach(doc => {
        leaderboard.push({
          userId: doc.id,
          ...doc.data()
        });
      });

      return leaderboard;

    } catch (error) {
      console.error('❌ [LEADERBOARD] Erreur récupération classement:', error);
      throw error;
    }
  }

  /**
   * 🛠️ UTILITAIRES
   */
  sanitizeTaskKey(taskTitle) {
    return taskTitle.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }

  isCurrentWeek(date) {
    return this.getWeekNumber(date) === this.getWeekNumber(new Date());
  }

  isCurrentMonth(date) {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
}

// Export unique - pas de duplication
export const taskHistoryService = new TaskHistoryService();
