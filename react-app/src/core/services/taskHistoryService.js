// ==========================================
// 📁 react-app/src/core/services/taskHistoryService.js
// SYSTÈME D'HISTORIQUE COMPLET DES TÂCHES AVEC RÉCURRENCE - IMPLÉMENTÉ
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
  writeBatch,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🗃️ SERVICE DE GESTION DE L'HISTORIQUE DES TÂCHES - IMPLÉMENTATION COMPLÈTE
 */
class TaskHistoryService {
  constructor() {
    this.HISTORY_COLLECTION = 'task_history';
    this.TASKS_COLLECTION = 'tasks';
    this.USER_STATS_COLLECTION = 'user_task_stats';
    this.SETTINGS_COLLECTION = 'task_settings';
  }

  /**
   * 📝 ARCHIVER UNE TÂCHE TERMINÉE - FONCTION PRINCIPALE
   */
  async archiveCompletedTask(taskId, completionData) {
    try {
      console.log('📝 [ARCHIVE] Début archivage tâche:', taskId);
      console.log('📝 [ARCHIVE] Données completion:', completionData);

      // 1. Récupérer la tâche originale
      const taskRef = doc(db, this.TASKS_COLLECTION, taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche originale introuvable');
      }

      const originalTask = { id: taskId, ...taskDoc.data() };
      console.log('📋 [ARCHIVE] Tâche originale:', originalTask.title);

      // 2. Créer l'entrée d'historique complète
      const historyEntry = {
        // Identifiants
        originalTaskId: taskId,
        completedBy: completionData.userId,
        completedByName: completionData.userName || completionData.userDisplayName || 'Utilisateur',
        
        // Données de la tâche
        title: originalTask.title,
        description: originalTask.description || '',
        difficulty: originalTask.difficulty || 'medium',
        priority: originalTask.priority || 'medium',
        xpReward: originalTask.xpReward || 0,
        roleId: originalTask.roleId || null,
        category: originalTask.category || 'general',
        estimatedHours: originalTask.estimatedHours || 0,
        
        // Timestamps de completion
        completedAt: serverTimestamp(),
        taskCreatedAt: originalTask.createdAt || null,
        validatedBy: completionData.validatedBy || null,
        validatedAt: completionData.validatedAt || serverTimestamp(),
        
        // Données de soumission
        adminComment: completionData.adminComment || '',
        submissionComment: completionData.submissionComment || '',
        submissionPhoto: completionData.submissionPhoto || null,
        submissionVideo: completionData.submissionVideo || null,
        
        // Performance et qualité
        timeSpent: completionData.timeSpent || null,
        quality: completionData.quality || 'good',
        efficiency: this.calculateEfficiency(originalTask.estimatedHours, completionData.timeSpent),
        
        // Données de récurrence
        isRecurring: Boolean(originalTask.isRecurring),
        recurrenceType: originalTask.recurrenceType || null,
        recurrenceInterval: originalTask.recurrenceInterval || null,
        recurrenceDays: originalTask.recurrenceDays || [],
        instanceNumber: originalTask.instanceNumber || 1,
        
        // Données du projet
        projectId: originalTask.projectId || null,
        projectName: completionData.projectName || null,
        
        // Métadonnées temporelles
        completionWeek: this.getWeekNumber(new Date()),
        completionMonth: new Date().getMonth() + 1,
        completionYear: new Date().getFullYear(),
        completionDayOfWeek: new Date().getDay(),
        completionHour: new Date().getHours(),
        
        // Contexte d'assignation
        wasVolunteer: completionData.wasVolunteer || false,
        assignedBy: originalTask.createdBy || null,
        openToVolunteers: originalTask.openToVolunteers || false,
        
        // Métadonnées système
        archivedAt: serverTimestamp(),
        archiveVersion: '1.0',
        source: 'task_validation_system'
      };

      // 3. Calculer la prochaine occurrence si récurrente
      let nextOccurrence = null;
      if (originalTask.isRecurring) {
        nextOccurrence = this.calculateNextOccurrence(originalTask);
        historyEntry.nextOccurrenceCalculated = nextOccurrence;
      }

      // 4. Sauvegarder dans l'historique
      const historyRef = await addDoc(
        collection(db, this.HISTORY_COLLECTION), 
        historyEntry
      );

      console.log('✅ [ARCHIVE] Entrée historique créée:', historyRef.id);

      // 5. Mettre à jour les statistiques utilisateur
      await this.updateUserTaskStats(
        completionData.userId, 
        originalTask, 
        completionData,
        historyRef.id
      );

      // 6. Gérer la récurrence ou archiver définitivement
      if (originalTask.isRecurring && nextOccurrence) {
        await this.handleRecurringTaskCompletion(taskId, originalTask, nextOccurrence);
      } else {
        await this.archiveNonRecurringTask(taskId);
      }

      console.log('✅ [ARCHIVE] Archivage complet terminé avec succès');
      
      return {
        success: true,
        historyId: historyRef.id,
        nextOccurrence: nextOccurrence,
        wasRecurring: Boolean(originalTask.isRecurring),
        message: originalTask.isRecurring ? 
          'Tâche archivée et prochaine occurrence programmée' : 
          'Tâche archivée définitivement'
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
      console.log('🔄 [RECURRENCE] Prochaine occurrence:', nextOccurrence);

      const taskRef = doc(db, this.TASKS_COLLECTION, taskId);
      
      // Réinitialiser la tâche pour la prochaine occurrence
      const resetData = {
        // Statut réinitialisé
        status: 'todo',
        completedAt: null,
        validatedBy: null,
        adminComment: null,
        submissionComment: null,
        submissionPhoto: null,
        submissionVideo: null,
        
        // Nouvelle échéance
        dueDate: nextOccurrence,
        
        // Compteurs de récurrence
        instanceNumber: (originalTask.instanceNumber || 1) + 1,
        totalInstancesCompleted: (originalTask.totalInstancesCompleted || 0) + 1,
        
        // Historique de récurrence
        lastCompletedAt: serverTimestamp(),
        lastInstanceArchived: true,
        previousInstancesCount: (originalTask.instanceNumber || 1),
        
        // Maintenir les assignations pour les tâches récurrentes
        assignedTo: originalTask.assignedTo || [],
        
        // Métadonnées de régénération
        updatedAt: serverTimestamp(),
        recreatedAt: serverTimestamp(),
        recreatedReason: 'recurring_task_completion',
        recurringTaskActive: true
      };

      await updateDoc(taskRef, resetData);

      console.log('✅ [RECURRENCE] Tâche réinitialisée pour prochaine occurrence');
      console.log('🔄 [RECURRENCE] Instance #' + resetData.instanceNumber + ' programmée');

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
      
      // Marquer comme archivée définitivement
      await updateDoc(taskRef, {
        status: 'archived',
        archivedAt: serverTimestamp(),
        archivedReason: 'task_completed_non_recurring',
        isActive: false,
        completionArchived: true
      });

      console.log('🗂️ [ARCHIVE] Tâche non-récurrente archivée définitivement:', taskId);

    } catch (error) {
      console.error('❌ [ARCHIVE] Erreur archivage non-récurrent:', error);
      throw error;
    }
  }

  /**
   * 📊 METTRE À JOUR LES STATISTIQUES UTILISATEUR - VERSION COMPLÈTE
   */
  async updateUserTaskStats(userId, originalTask, completionData, historyId) {
    try {
      console.log('📊 [STATS] Mise à jour statistiques pour:', userId);

      const statsRef = doc(db, this.USER_STATS_COLLECTION, userId);
      const statsDoc = await getDoc(statsRef);
      
      let currentStats = {
        userId: userId,
        createdAt: new Date().toISOString(),
        totalTasksCompleted: 0,
        totalXpEarned: 0,
        totalTimeSpent: 0,
        tasksThisWeek: 0,
        tasksThisMonth: 0,
        tasksThisYear: 0
      };

      if (statsDoc.exists()) {
        currentStats = { ...currentStats, ...statsDoc.data() };
      }

      // Calculer les nouvelles valeurs
      const xpEarned = originalTask.xpReward || 0;
      const timeSpent = completionData.timeSpent || 0;
      const isCurrentWeek = this.isCurrentWeek(new Date());
      const isCurrentMonth = this.isCurrentMonth(new Date());
      const isCurrentYear = this.isCurrentYear(new Date());

      // Préparer les mises à jour
      const updates = {
        // Compteurs généraux
        totalTasksCompleted: (currentStats.totalTasksCompleted || 0) + 1,
        totalXpEarned: (currentStats.totalXpEarned || 0) + xpEarned,
        totalTimeSpent: (currentStats.totalTimeSpent || 0) + timeSpent,
        
        // Compteurs temporels
        tasksThisWeek: isCurrentWeek ? 
          (currentStats.tasksThisWeek || 0) + 1 : (currentStats.tasksThisWeek || 0),
        tasksThisMonth: isCurrentMonth ? 
          (currentStats.tasksThisMonth || 0) + 1 : (currentStats.tasksThisMonth || 0),
        tasksThisYear: isCurrentYear ? 
          (currentStats.tasksThisYear || 0) + 1 : (currentStats.tasksThisYear || 0),
        
        // Compteurs par difficulté
        [`${originalTask.difficulty || 'medium'}TasksCompleted`]: 
          (currentStats[`${originalTask.difficulty || 'medium'}TasksCompleted`] || 0) + 1,
        
        // Compteurs par priorité
        [`${originalTask.priority || 'medium'}PriorityCompleted`]: 
          (currentStats[`${originalTask.priority || 'medium'}PriorityCompleted`] || 0) + 1,
        
        // Compteurs par rôle Synergia
        [`role_${originalTask.roleId || 'none'}_completed`]: 
          (currentStats[`role_${originalTask.roleId || 'none'}_completed`] || 0) + 1,
        [`role_${originalTask.roleId || 'none'}_xp`]: 
          (currentStats[`role_${originalTask.roleId || 'none'}_xp`] || 0) + xpEarned,
        
        // Compteurs par catégorie
        [`category_${originalTask.category || 'general'}_completed`]: 
          (currentStats[`category_${originalTask.category || 'general'}_completed`] || 0) + 1,
        
        // Statistiques de récurrence
        totalRecurringCompleted: originalTask.isRecurring ? 
          (currentStats.totalRecurringCompleted || 0) + 1 : (currentStats.totalRecurringCompleted || 0),
        totalNonRecurringCompleted: !originalTask.isRecurring ? 
          (currentStats.totalNonRecurringCompleted || 0) + 1 : (currentStats.totalNonRecurringCompleted || 0),
        
        // Performance moyenne
        averageTaskTime: timeSpent > 0 ? 
          ((currentStats.averageTaskTime || 0) * (currentStats.totalTasksCompleted || 0) + timeSpent) / 
          ((currentStats.totalTasksCompleted || 0) + 1) : (currentStats.averageTaskTime || 0),
        
        // Métadonnées
        lastTaskCompleted: originalTask.title,
        lastTaskCompletedId: historyId,
        lastCompletionDate: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        
        // Streaks et habitudes
        currentStreak: this.calculateStreak(currentStats, new Date()),
        longestStreak: Math.max(
          currentStats.longestStreak || 0, 
          this.calculateStreak(currentStats, new Date())
        )
      };

      // Gestion spéciale pour les tâches récurrentes spécifiques
      if (originalTask.isRecurring && originalTask.title) {
        const taskKey = this.sanitizeTaskKey(originalTask.title);
        const recurringCountKey = `recurring_${taskKey}_count`;
        const recurringXpKey = `recurring_${taskKey}_xp`;
        const recurringTimeKey = `recurring_${taskKey}_time`;
        
        updates[recurringCountKey] = (currentStats[recurringCountKey] || 0) + 1;
        updates[recurringXpKey] = (currentStats[recurringXpKey] || 0) + xpEarned;
        updates[recurringTimeKey] = (currentStats[recurringTimeKey] || 0) + timeSpent;
      }

      // Sauvegarder avec merge pour préserver les données existantes
      await setDoc(statsRef, updates, { merge: true });

      console.log('✅ [STATS] Statistiques mises à jour avec succès');
      console.log('📊 [STATS] Nouvelles valeurs:', {
        totalCompleted: updates.totalTasksCompleted,
        totalXP: updates.totalXpEarned,
        thisWeek: updates.tasksThisWeek,
        thisMonth: updates.tasksThisMonth
      });

    } catch (error) {
      console.error('❌ [STATS] Erreur mise à jour statistiques:', error);
      throw error;
    }
  }

  /**
   * 📅 CALCULER LA PROCHAINE OCCURRENCE - VERSION AMÉLIORÉE
   */
  calculateNextOccurrence(task) {
    if (!task.isRecurring || !task.recurrenceType) {
      return null;
    }

    console.log('📅 [RECURRENCE] Calcul prochaine occurrence pour:', task.title);
    console.log('📅 [RECURRENCE] Type:', task.recurrenceType, 'Intervalle:', task.recurrenceInterval);

    const now = new Date();
    const interval = parseInt(task.recurrenceInterval) || 1;
    let nextDate = null;
    
    switch (task.recurrenceType) {
      case 'daily':
        nextDate = new Date(now.getTime() + (interval * 24 * 60 * 60 * 1000));
        break;
        
      case 'weekly':
        if (task.recurrenceDays && task.recurrenceDays.length > 0) {
          // Trouver le prochain jour spécifié
          nextDate = this.getNextWeeklyOccurrence(now, task.recurrenceDays, interval);
        } else {
          // Semaine standard
          nextDate = new Date(now.getTime() + (interval * 7 * 24 * 60 * 60 * 1000));
        }
        break;
        
      case 'monthly':
        nextDate = new Date(now);
        nextDate.setMonth(nextDate.getMonth() + interval);
        // Garder le même jour du mois si possible
        if (task.dueDate) {
          const originalDay = new Date(task.dueDate).getDate();
          nextDate.setDate(Math.min(originalDay, this.getDaysInMonth(nextDate)));
        }
        break;
        
      case 'yearly':
        nextDate = new Date(now);
        nextDate.setFullYear(nextDate.getFullYear() + interval);
        break;
        
      default:
        console.warn('⚠️ [RECURRENCE] Type de récurrence non supporté:', task.recurrenceType);
        return null;
    }

    // Vérifier la date de fin de récurrence
    if (task.recurrenceEndDate) {
      const endDate = new Date(task.recurrenceEndDate);
      if (nextDate > endDate) {
        console.log('📅 [RECURRENCE] Fin de récurrence atteinte');
        return null;
      }
    }

    console.log('📅 [RECURRENCE] Prochaine occurrence calculée:', nextDate);
    return nextDate;
  }

  /**
   * 📋 RÉCUPÉRER L'HISTORIQUE D'UN UTILISATEUR - VERSION AVANCÉE
   */
  async getUserTaskHistory(userId, options = {}) {
    try {
      const {
        limit: queryLimit = 50,
        roleId = null,
        category = null,
        timeframe = null,
        isRecurring = null,
        taskTitle = null,
        difficulty = null,
        sortBy = 'completedAt',
        sortOrder = 'desc'
      } = options;

      console.log('📋 [HISTORY] Récupération historique pour:', userId);
      console.log('📋 [HISTORY] Options:', options);

      let constraints = [
        where('completedBy', '==', userId),
        orderBy(sortBy, sortOrder)
      ];

      // Filtres optionnels
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
      
      if (taskTitle) {
        constraints.push(where('title', '==', taskTitle));
      }

      // Limitation des résultats
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
          completedAt: data.completedAt?.toDate?.() || data.completedAt,
          validatedAt: data.validatedAt?.toDate?.() || data.validatedAt,
          archivedAt: data.archivedAt?.toDate?.() || data.archivedAt
        });
      });

      // Filtrage temporel en post-traitement pour plus de flexibilité
      let filteredHistory = history;
      if (timeframe) {
        filteredHistory = this.filterByTimeframe(history, timeframe);
      }

      console.log(`📋 [HISTORY] Historique récupéré: ${filteredHistory.length} entrées`);
      
      return filteredHistory;

    } catch (error) {
      console.error('❌ [HISTORY] Erreur récupération historique:', error);
      throw error;
    }
  }

  /**
   * 📊 RÉCUPÉRER LES STATISTIQUES COMPLÈTES D'UN UTILISATEUR
   */
  async getUserTaskStats(userId) {
    try {
      console.log('📊 [STATS] Récupération statistiques pour:', userId);

      const statsRef = doc(db, this.USER_STATS_COLLECTION, userId);
      const statsDoc = await getDoc(statsRef);
      
      if (!statsDoc.exists()) {
        console.log('📊 [STATS] Aucune statistique trouvée, création par défaut');
        return this.getDefaultUserStats(userId);
      }

      const stats = statsDoc.data();
      
      // Convertir les timestamps Firestore
      if (stats.lastCompletionDate?.toDate) {
        stats.lastCompletionDate = stats.lastCompletionDate.toDate();
      }
      if (stats.lastUpdated?.toDate) {
        stats.lastUpdated = stats.lastUpdated.toDate();
      }

      // Calculer des métriques dérivées
      stats.completionRate = this.calculateCompletionRate(stats);
      stats.averageXpPerTask = stats.totalTasksCompleted > 0 ? 
        Math.round(stats.totalXpEarned / stats.totalTasksCompleted) : 0;
      stats.averageTimePerTask = stats.totalTasksCompleted > 0 ? 
        Math.round(stats.totalTimeSpent / stats.totalTasksCompleted) : 0;

      console.log('📊 [STATS] Statistiques récupérées avec succès');
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
      console.log('🔍 [ANALYSIS] Analyse performance pour:', taskTitle);

      const history = await this.getUserTaskHistory(userId, { 
        taskTitle: taskTitle,
        limit: 100,
        sortBy: 'completedAt',
        sortOrder: 'desc'
      });

      if (history.length === 0) {
        return {
          taskTitle,
          totalOccurrences: 0,
          message: 'Aucune occurrence trouvée pour cette tâche'
        };
      }

      // Calculs des métriques
      const totalOccurrences = history.length;
      const validTimeEntries = history.filter(h => h.timeSpent && h.timeSpent > 0);
      const averageTime = validTimeEntries.length > 0 ? 
        validTimeEntries.reduce((sum, h) => sum + h.timeSpent, 0) / validTimeEntries.length : 0;
      
      const totalXp = history.reduce((sum, h) => sum + (h.xpReward || 0), 0);
      const averageXp = totalOccurrences > 0 ? totalXp / totalOccurrences : 0;

      // Distribution par qualité
      const qualityDistribution = {};
      history.forEach(h => {
        const quality = h.quality || 'unknown';
        qualityDistribution[quality] = (qualityDistribution[quality] || 0) + 1;
      });

      // Tendances temporelles
      const monthlyTrend = this.calculateMonthlyTrend(history);
      const weeklyPattern = this.calculateWeeklyPattern(history);

      const analysis = {
        taskTitle,
        totalOccurrences,
        averageTime: Math.round(averageTime),
        totalXpEarned: totalXp,
        averageXpPerOccurrence: Math.round(averageXp),
        qualityDistribution,
        monthlyTrend,
        weeklyPattern,
        lastCompleted: history[0]?.completedAt || null,
        firstCompleted: history[history.length - 1]?.completedAt || null,
        isRecurring: history[0]?.isRecurring || false,
        occurrences: history.slice(0, 20) // Limiter pour la performance
      };

      console.log('🔍 [ANALYSIS] Analyse terminée:', analysis);
      return analysis;

    } catch (error) {
      console.error('❌ [ANALYSIS] Erreur analyse performance:', error);
      throw error;
    }
  }

  /**
   * 🛠️ UTILITAIRES ET HELPERS
   */
  
  getDefaultUserStats(userId) {
    return {
      userId,
      totalTasksCompleted: 0,
      totalXpEarned: 0,
      totalTimeSpent: 0,
      tasksThisWeek: 0,
      tasksThisMonth: 0,
      tasksThisYear: 0,
      totalRecurringCompleted: 0,
      totalNonRecurringCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageTaskTime: 0,
      lastTaskCompleted: null,
      lastCompletionDate: null,
      createdAt: new Date().toISOString()
    };
  }

  calculateEfficiency(estimatedHours, actualTime) {
    if (!estimatedHours || !actualTime || estimatedHours <= 0) return null;
    const estimatedSeconds = estimatedHours * 3600;
    return Math.round((estimatedSeconds / actualTime) * 100) / 100;
  }

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

  isCurrentYear(date) {
    return date.getFullYear() === new Date().getFullYear();
  }

  getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  getNextWeeklyOccurrence(startDate, recurrenceDays, interval) {
    const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const currentDay = startDate.getDay();
    
    // Trouver le prochain jour dans la liste
    let nextDayIndex = -1;
    let daysToAdd = 7; // Par défaut, semaine suivante
    
    for (const dayName of recurrenceDays) {
      const dayIndex = dayNames.indexOf(dayName.toLowerCase());
      if (dayIndex !== -1) {
        const daysUntilTarget = (dayIndex - currentDay + 7) % 7;
        if (daysUntilTarget > 0 && daysUntilTarget < daysToAdd) {
          daysToAdd = daysUntilTarget;
          nextDayIndex = dayIndex;
        }
      }
    }
    
    // Si pas de jour trouvé cette semaine, prendre le premier jour de la semaine suivante
    if (nextDayIndex === -1 && recurrenceDays.length > 0) {
      const firstDay = recurrenceDays[0];
      nextDayIndex = dayNames.indexOf(firstDay.toLowerCase());
      daysToAdd = (nextDayIndex - currentDay + 7) % 7 + 7;
    }
    
    const nextDate = new Date(startDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    return nextDate;
  }

  calculateStreak(stats, currentDate) {
    // Logique simple pour calculer une streak basée sur les tâches récentes
    // À améliorer avec des données plus précises si nécessaire
    const lastCompletion = stats.lastCompletionDate;
    if (!lastCompletion) return 0;
    
    const daysDiff = Math.floor((currentDate - new Date(lastCompletion)) / (1000 * 60 * 60 * 24));
    return daysDiff <= 1 ? (stats.currentStreak || 0) + 1 : 1;
  }

  calculateCompletionRate(stats) {
    // Pourcentage basé sur un objectif théorique
    const weeklyGoal = 5; // 5 tâches par semaine
    const currentWeekProgress = (stats.tasksThisWeek || 0) / weeklyGoal;
    return Math.min(100, Math.round(currentWeekProgress * 100));
  }

  filterByTimeframe(history, timeframe) {
    const now = new Date();
    let cutoffDate;
    
    switch (timeframe) {
      case 'today':
        cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        cutoffDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case 'month':
        cutoffDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        break;
      case 'year':
        cutoffDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
        break;
      default:
        return history;
    }
    
    return history.filter(item => {
      const itemDate = new Date(item.completedAt);
      return itemDate >= cutoffDate;
    });
  }

  calculateMonthlyTrend(history) {
    const monthlyData = {};
    history.forEach(item => {
      const date = new Date(item.completedAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });
    return monthlyData;
  }

  calculateWeeklyPattern(history) {
    const weeklyData = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0};
    history.forEach(item => {
      const dayOfWeek = new Date(item.completedAt).getDay();
      weeklyData[dayOfWeek] = (weeklyData[dayOfWeek] || 0) + 1;
    });
    return weeklyData;
  }
}

// Export de l'instance singleton
export const taskHistoryService = new TaskHistoryService();

// Export de l'instance singleton
export const taskHistoryService = new TaskHistoryService();
