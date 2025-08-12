// ==========================================
// 📁 react-app/src/core/services/taskHistoryService.js
// SYSTÈME D'HISTORIQUE COMPLET DES TÂCHES AVEC RÉCURRENCE
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
  writeBatch
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
      console.log('📝 [ARCHIVE] Archivage tâche terminée:', taskId);

      // 1. Récupérer la tâche originale
      const taskRef = doc(db, this.TASKS_COLLECTION, taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche originale introuvable');
      }

      const originalTask = taskDoc.data();
      
      // 2. Créer l'entrée d'historique
      const historyEntry = {
        // Données de la tâche originale
        originalTaskId: taskId,
        title: originalTask.title,
        description: originalTask.description,
        difficulty: originalTask.difficulty,
        priority: originalTask.priority,
        xpReward: originalTask.xpReward,
        roleId: originalTask.roleId,
        category: originalTask.category,
        estimatedHours: originalTask.estimatedHours,
        
        // Données de l'utilisateur qui a terminé
        completedBy: completionData.userId,
        completedByName: completionData.userName || 'Utilisateur',
        
        // Données de completion
        completedAt: serverTimestamp(),
        validatedBy: completionData.validatedBy,
        validatedAt: completionData.validatedAt || serverTimestamp(),
        adminComment: completionData.adminComment || '',
        submissionComment: completionData.submissionComment || '',
        submissionPhoto: completionData.submissionPhoto || null,
        submissionVideo: completionData.submissionVideo || null,
        
        // Métadonnées de performance
        timeSpent: completionData.timeSpent || null,
        quality: completionData.quality || 'good',
        
        // Données de récurrence si applicable
        isRecurring: Boolean(originalTask.isRecurring),
        recurrenceType: originalTask.recurrenceType || null,
        instanceNumber: completionData.instanceNumber || 1,
        nextOccurrence: originalTask.isRecurring ? 
          this.calculateNextOccurrence(originalTask) : null,
        
        // Données du projet
        projectId: originalTask.projectId || null,
        projectName: completionData.projectName || null,
        
        // Contexte temporel
        completionWeek: this.getWeekNumber(new Date()),
        completionMonth: new Date().getMonth() + 1,
        completionYear: new Date().getFullYear(),
        
        // Métadonnées système
        archivedAt: serverTimestamp(),
        version: '1.0'
      };

      // 3. Sauvegarder dans l'historique
      const historyRef = await addDoc(
        collection(db, this.HISTORY_COLLECTION), 
        historyEntry
      );

      // 4. Mettre à jour les statistiques utilisateur
      await this.updateUserTaskStats(
        completionData.userId, 
        originalTask, 
        completionData
      );

      // 5. Gérer la récurrence ou supprimer la tâche
      if (originalTask.isRecurring) {
        await this.handleRecurringTaskCompletion(taskId, originalTask);
      } else {
        // Supprimer la tâche non-récurrente des tâches actives
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
  async handleRecurringTaskCompletion(taskId, originalTask) {
    try {
      console.log('🔄 [RECURRENCE] Gestion tâche récurrente:', taskId);

      // 1. Calculer la prochaine occurrence
      const nextOccurrence = this.calculateNextOccurrence(originalTask);
      
      if (!nextOccurrence) {
        // Pas de prochaine occurrence, archiver définitivement
        await this.archiveNonRecurringTask(taskId);
        return;
      }

      // 2. Mettre à jour la tâche existante pour la prochaine occurrence
      const taskRef = doc(db, this.TASKS_COLLECTION, taskId);
      
      await updateDoc(taskRef, {
        status: 'todo',
        completedAt: null,
        validatedBy: null,
        adminComment: null,
        submissionComment: null,
        submissionPhoto: null,
        submissionVideo: null,
        
        // Nouvelle échéance
        dueDate: nextOccurrence,
        
        // Incrémenter le compteur d'instance
        instanceNumber: (originalTask.instanceNumber || 1) + 1,
        
        // Métadonnées de récurrence
        lastCompletedAt: serverTimestamp(),
        lastInstanceArchived: true,
        
        // Mise à jour système
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
      
      // Marquer comme archivée au lieu de supprimer
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
  async updateUserTaskStats(userId, originalTask, completionData) {
    try {
      const statsRef = doc(db, this.USER_STATS_COLLECTION, userId);
      const statsDoc = await getDoc(statsRef);
      
      let currentStats = {};
      if (statsDoc.exists()) {
        currentStats = statsDoc.data();
      }

      // Préparer les nouvelles statistiques
      const updates = {
        userId: userId,
        
        // Compteurs généraux
        totalTasksCompleted: (currentStats.totalTasksCompleted || 0) + 1,
        totalXpEarned: (currentStats.totalXpEarned || 0) + (originalTask.xpReward || 0),
        totalTimeSpent: (currentStats.totalTimeSpent || 0) + (completionData.timeSpent || 0),
        
        // Compteurs par difficulté
        [`${originalTask.difficulty}TasksCompleted`]: 
          (currentStats[`${originalTask.difficulty}TasksCompleted`] || 0) + 1,
        
        // Compteurs par rôle
        [`role_${originalTask.roleId}_completed`]: 
          (currentStats[`role_${originalTask.roleId}_completed`] || 0) + 1,
        
        // Compteurs par catégorie
        [`category_${originalTask.category}_completed`]: 
          (currentStats[`category_${originalTask.category}_completed`] || 0) + 1,
        
        // Compteurs temporels
        tasksThisWeek: this.isCurrentWeek(new Date()) ? 
          (currentStats.tasksThisWeek || 0) + 1 : (currentStats.tasksThisWeek || 0),
        tasksThisMonth: this.isCurrentMonth(new Date()) ? 
          (currentStats.tasksThisMonth || 0) + 1 : (currentStats.tasksThisMonth || 0),
        
        // Métadonnées
        lastTaskCompleted: originalTask.title,
        lastCompletionDate: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      // Gestion spéciale pour les tâches récurrentes
      if (originalTask.isRecurring) {
        const recurringKey = `recurring_${originalTask.title.toLowerCase().replace(/\s+/g, '_')}_count`;
        updates[recurringKey] = (currentStats[recurringKey] || 0) + 1;
        
        updates.totalRecurringCompleted = (currentStats.totalRecurringCompleted || 0) + 1;
      }

      // Sauvegarder ou mettre à jour
      await updateDoc(statsRef, updates, { merge: true });

      console.log('📊 [STATS] Statistiques utilisateur mises à jour');

    } catch (error) {
      console.error('❌ [STATS] Erreur mise à jour statistiques:', error);
      throw error;
    }
  }

  /**
   * 📅 CALCULER LA PROCHAINE OCCURRENCE D'UNE TÂCHE RÉCURRENTE
   */
  calculateNextOccurrence(task) {
    if (!task.isRecurring || !task.recurrenceType) {
      return null;
    }

    const now = new Date();
    const interval = task.recurrenceInterval || 1;
    
    switch (task.recurrenceType) {
      case 'daily':
        return new Date(now.getTime() + (interval * 24 * 60 * 60 * 1000));
        
      case 'weekly':
        const nextWeek = new Date(now.getTime() + (interval * 7 * 24 * 60 * 60 * 1000));
        
        // Si des jours spécifiques sont définis
        if (task.recurrenceDays && task.recurrenceDays.length > 0) {
          // Logique pour trouver le prochain jour de la semaine spécifié
          const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
          const nextDay = task.recurrenceDays[0]; // Prendre le premier jour défini
          const targetDayIndex = dayNames.indexOf(nextDay.toLowerCase());
          
          if (targetDayIndex !== -1) {
            const daysUntilTarget = (targetDayIndex - now.getDay() + 7) % 7;
            return new Date(now.getTime() + (daysUntilTarget * 24 * 60 * 60 * 1000));
          }
        }
        
        return nextWeek;
        
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
        timeframe = null, // 'week', 'month', 'year'
        isRecurring = null
      } = options;

      let q = query(
        collection(db, this.HISTORY_COLLECTION),
        where('completedBy', '==', userId),
        orderBy('completedAt', 'desc')
      );

      // Filtres optionnels
      if (roleId) {
        q = query(q, where('roleId', '==', roleId));
      }
      
      if (category) {
        q = query(q, where('category', '==', category));
      }
      
      if (isRecurring !== null) {
        q = query(q, where('isRecurring', '==', isRecurring));
      }

      // Filtrage temporel
      if (timeframe) {
        const now = new Date();
        let startDate;
        
        switch (timeframe) {
          case 'week':
            startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            break;
          case 'month':
            startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            break;
          case 'year':
            startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
            break;
        }
        
        if (startDate) {
          q = query(q, where('completedAt', '>=', startDate));
        }
      }

      // Limitation
      if (queryLimit) {
        q = query(q, limit(queryLimit));
      }

      const snapshot = await getDocs(q);
      const history = [];
      
      snapshot.forEach(doc => {
        history.push({
          id: doc.id,
          ...doc.data(),
          completedAt: doc.data().completedAt?.toDate?.() || doc.data().completedAt
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
      
      // Convertir les timestamps
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
   * 🏆 RÉCUPÉRER LE CLASSEMENT DES UTILISATEURS PAR TÂCHES
   */
  async getTaskLeaderboard(timeframe = 'all', limit = 10) {
    try {
      let q = query(
        collection(db, this.USER_STATS_COLLECTION),
        orderBy('totalTasksCompleted', 'desc'),
        limit(limit)
      );

      // Pour un classement temporel, on utiliserait les compteurs spécifiques
      if (timeframe === 'week') {
        q = query(
          collection(db, this.USER_STATS_COLLECTION),
          orderBy('tasksThisWeek', 'desc'),
          limit(limit)
        );
      } else if (timeframe === 'month') {
        q = query(
          collection(db, this.USER_STATS_COLLECTION),
          orderBy('tasksThisMonth', 'desc'),
          limit(limit)
        );
      }

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
   * 🔍 ANALYSER LES PERFORMANCES PAR TYPE DE TÂCHE
   */
  async analyzeTaskTypePerformance(userId, taskTitle) {
    try {
      // Rechercher toutes les occurrences de cette tâche pour cet utilisateur
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
          quality: data.quality || 'good',
          instanceNumber: data.instanceNumber || 1
        });
      });

      // Calculer les métriques
      const totalOccurrences = occurrences.length;
      const averageTime = occurrences.reduce((sum, occ) => sum + occ.timeSpent, 0) / totalOccurrences;
      const qualityDistribution = {};
      
      occurrences.forEach(occ => {
        qualityDistribution[occ.quality] = (qualityDistribution[occ.quality] || 0) + 1;
      });

      return {
        taskTitle,
        totalOccurrences,
        averageTime,
        qualityDistribution,
        occurrences,
        lastCompleted: occurrences[0]?.completedAt || null
      };

    } catch (error) {
      console.error('❌ [ANALYSIS] Erreur analyse performance:', error);
      throw error;
    }
  }

  /**
   * 🛠️ UTILITAIRES
   */
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

// Export de l'instance singleton
export const taskHistoryService = new TaskHistoryService();

// ==========================================
// 📱 HOOK REACT POUR L'HISTORIQUE DES TÂCHES
// ==========================================

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../shared/stores/authStore.js';

export const useTaskHistory = (options = {}) => {
  const { user } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHistory = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [historyData, statsData] = await Promise.all([
        taskHistoryService.getUserTaskHistory(user.uid, options),
        taskHistoryService.getUserTaskStats(user.uid)
      ]);
      
      setHistory(historyData);
      setStats(statsData);
      
    } catch (err) {
      console.error('❌ Erreur chargement historique:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user?.uid, JSON.stringify(options)]);

  return {
    history,
    stats,
    loading,
    error,
    refetch: loadHistory
  };
};
