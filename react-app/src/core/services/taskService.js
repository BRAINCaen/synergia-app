// src/services/taskService.js - SERVICE COMPLET AVEC GAMIFICATION
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  writeBatch,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../core/firebase.js';
import gamificationService from './gamificationService.js';

// Collections Firestore
const COLLECTIONS = {
  TASKS: 'tasks',
  ACTIVITIES: 'activities',
  USERS: 'users'
};

class TaskService {

  /**
   * 🎯 COMPLÉTER UNE TÂCHE AVEC XP AUTOMATIQUE
   * @param {string} taskId - ID de la tâche
   * @param {Object} additionalData - Données supplémentaires (optionnel)
   */
  async completeTask(taskId, additionalData = {}) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      console.log('🎯 Complétion tâche:', taskId, 'par:', currentUser.email);

      // 1. Récupérer les détails de la tâche
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskSnap.data();
      
      // Vérifier que la tâche n'est pas déjà terminée
      if (taskData.status === 'completed') {
        console.warn('⚠️ Tâche déjà terminée');
        return { success: false, error: 'Tâche déjà terminée' };
      }

      // Vérifier les permissions (optionnel)
      if (taskData.assignedTo && taskData.assignedTo !== currentUser.uid) {
        console.warn('⚠️ Utilisateur non assigné à cette tâche');
        // On continue quand même pour permettre la complétion
      }

      // 2. Déterminer la difficulté et les XP
      const difficulty = this.determineDifficulty(taskData, additionalData);
      const xpReward = this.getXPReward(difficulty);

      // 3. Marquer la tâche comme terminée
      const now = new Date();
      const updates = {
        status: 'completed',
        completedAt: now,
        completedBy: currentUser.uid,
        updatedAt: now,
        difficulty: difficulty,
        xpRewarded: xpReward,
        ...additionalData // Données supplémentaires fournies
      };

      await updateDoc(taskRef, updates);

      // 4. 🎮 AJOUTER XP ET RÉCOMPENSES
      const gamificationResult = await gamificationService.addXP(
        currentUser.uid,
        xpReward,
        'task_complete',
        {
          taskId,
          difficulty,
          taskTitle: taskData.title,
          taskCategory: taskData.category,
          timeSpent: additionalData.timeSpent || 0
        }
      );

      // 5. Créer l'historique d'activité
      await this.createActivityLog({
        userId: currentUser.uid,
        type: 'task_completed',
        taskId,
        taskTitle: taskData.title,
        xpGained: gamificationResult.success ? gamificationResult.xpGain : 0,
        timestamp: now,
        metadata: {
          difficulty,
          xpReward,
          originalTask: taskData
        }
      });

      // 6. Afficher notification de succès
      this.showTaskCompletionNotification({
        taskTitle: taskData.title,
        xpGain: gamificationResult.success ? gamificationResult.xpGain : 0,
        difficulty,
        ...gamificationResult
      });

      console.log('✅ Tâche complétée avec succès:', {
        taskId,
        xpGained: gamificationResult.success ? gamificationResult.xpGain : 0,
        levelUp: gamificationResult.success ? gamificationResult.leveledUp : false,
        difficulty
      });

      return {
        success: true,
        taskId,
        taskData: { ...taskData, ...updates },
        gamification: gamificationResult,
        xpGained: gamificationResult.success ? gamificationResult.xpGain : 0,
        difficulty,
        message: `Tâche "${taskData.title}" terminée ! +${gamificationResult.success ? gamificationResult.xpGain : 0} XP`
      };

    } catch (error) {
      console.error('❌ Erreur complétion tâche:', error);
      throw error;
    }
  }

  /**
   * 📊 DÉTERMINER LA DIFFICULTÉ D'UNE TÂCHE
   */
  determineDifficulty(taskData, additionalData = {}) {
    let score = 0;
    
    // Priorité (0-3 points)
    const priority = taskData.priority?.toLowerCase() || 'medium';
    if (priority === 'urgent' || priority === 'critical') score += 4;
    else if (priority === 'high') score += 3;
    else if (priority === 'medium') score += 2;
    else if (priority === 'low') score += 1;
    
    // Complexité (0-3 points)
    const complexity = taskData.complexity?.toLowerCase() || 'medium';
    if (complexity === 'expert' || complexity === 'very_complex') score += 4;
    else if (complexity === 'complex' || complexity === 'hard') score += 3;
    else if (complexity === 'medium' || complexity === 'normal') score += 2;
    else if (complexity === 'simple' || complexity === 'easy') score += 1;
    
    // Temps estimé (0-3 points)
    const estimatedHours = taskData.estimatedHours || additionalData.estimatedHours || 0;
    if (estimatedHours > 16) score += 4; // Plus d'une journée
    else if (estimatedHours > 8) score += 3; // Plus d'une demi-journée
    else if (estimatedHours > 4) score += 2; // Demi-journée
    else if (estimatedHours > 1) score += 1; // Quelques heures
    
    // Type de tâche (0-2 points)
    const type = taskData.type?.toLowerCase() || 'task';
    if (type === 'epic' || type === 'milestone' || type === 'project') score += 3;
    else if (type === 'feature' || type === 'story' || type === 'enhancement') score += 2;
    else if (type === 'bug' || type === 'fix' || type === 'maintenance') score += 1;
    
    // Points bonus selon tags/labels spéciaux
    const tags = taskData.tags || [];
    if (tags.includes('urgent') || tags.includes('critical')) score += 1;
    if (tags.includes('complex') || tags.includes('research')) score += 1;
    if (tags.includes('learning') || tags.includes('new_tech')) score += 1;
    
    // Déterminer la difficulté finale
    if (score >= 12) return 'expert';   // 100 XP
    else if (score >= 8) return 'hard'; // 60 XP
    else if (score >= 4) return 'normal'; // 40 XP
    else return 'easy'; // 20 XP
  }

  /**
   * 🎯 OBTENIR RÉCOMPENSE XP SELON DIFFICULTÉ
   */
  getXPReward(difficulty) {
    const rewards = {
      'easy': 20,
      'normal': 40,
      'hard': 60,
      'expert': 100
    };
    return rewards[difficulty] || 40;
  }

  /**
   * 📝 CRÉER UNE NOUVELLE TÂCHE
   */
  async createTask(taskData) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const now = new Date();
      
      // Validation des données minimales
      if (!taskData.title || taskData.title.trim() === '') {
        throw new Error('Le titre de la tâche est requis');
      }

      const completeTaskData = {
        // Informations de base
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        status: 'todo',
        
        // Classification
        priority: taskData.priority || 'medium',
        category: taskData.category || 'general',
        complexity: taskData.complexity || 'normal',
        type: taskData.type || 'task',
        
        // Assignation
        createdBy: currentUser.uid,
        assignedTo: taskData.assignedTo || currentUser.uid,
        
        // Métadonnées
        estimatedHours: taskData.estimatedHours || 0,
        tags: Array.isArray(taskData.tags) ? taskData.tags : [],
        
        // Dates
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        startDate: taskData.startDate ? new Date(taskData.startDate) : null,
        
        // Timestamps
        createdAt: now,
        updatedAt: now,
        
        // Projet/Epic (optionnel)
        projectId: taskData.projectId || null,
        epicId: taskData.epicId || null,
        
        // Gamification
        xpReward: this.getXPReward(taskData.complexity || 'normal'),
        
        // Métadonnées supplémentaires
        metadata: {
          source: 'manual_creation',
          version: '3.0',
          createdByEmail: currentUser.email
        }
      };

      const tasksCollection = collection(db, COLLECTIONS.TASKS);
      const docRef = await addDoc(tasksCollection, completeTaskData);

      console.log('✅ Tâche créée:', docRef.id, completeTaskData.title);

      // Créer log d'activité
      await this.createActivityLog({
        userId: currentUser.uid,
        type: 'task_created',
        taskId: docRef.id,
        taskTitle: completeTaskData.title,
        timestamp: now,
        metadata: {
          taskData: completeTaskData
        }
      });

      return {
        success: true,
        taskId: docRef.id,
        taskData: completeTaskData
      };

    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER LES TÂCHES D'UN UTILISATEUR
   */
  async getUserTasks(userId = null, filters = {}) {
    const targetUserId = userId || auth.currentUser?.uid;
    if (!targetUserId) {
      throw new Error('Utilisateur non spécifié');
    }

    try {
      const tasksCollection = collection(db, COLLECTIONS.TASKS);
      
      // Construction de la requête de base
      let constraints = [
        where('assignedTo', '==', targetUserId),
        orderBy('updatedAt', 'desc')
      ];

      // Appliquer filtres
      if (filters.status) {
        constraints.splice(-1, 0, where('status', '==', filters.status));
      }
      if (filters.priority) {
        constraints.splice(-1, 0, where('priority', '==', filters.priority));
      }
      if (filters.category) {
        constraints.splice(-1, 0, where('category', '==', filters.category));
      }
      if (filters.projectId) {
        constraints.splice(-1, 0, where('projectId', '==', filters.projectId));
      }

      const q = query(tasksCollection, ...constraints);
      const querySnapshot = await getDocs(q);
      const tasks = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          // Convertir les timestamps Firestore en dates
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          completedAt: data.completedAt?.toDate?.() || data.completedAt,
          dueDate: data.dueDate?.toDate?.() || data.dueDate,
          startDate: data.startDate?.toDate?.() || data.startDate
        });
      });

      console.log(`📋 ${tasks.length} tâche(s) récupérée(s) pour`, targetUserId);
      return tasks;

    } catch (error) {
      console.error('❌ Erreur récupération tâches:', error);
      throw error;
    }
  }

  /**
   * 📊 ÉCOUTER LES TÂCHES EN TEMPS RÉEL
   */
  listenToUserTasks(userId, callback, filters = {}) {
    const tasksCollection = collection(db, COLLECTIONS.TASKS);
    
    let constraints = [
      where('assignedTo', '==', userId),
      orderBy('updatedAt', 'desc')
    ];

    const q = query(tasksCollection, ...constraints);

    return onSnapshot(q, (querySnapshot) => {
      const tasks = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          completedAt: data.completedAt?.toDate?.() || data.completedAt,
          dueDate: data.dueDate?.toDate?.() || data.dueDate,
          startDate: data.startDate?.toDate?.() || data.startDate
        });
      });
      
      console.log(`🔄 Mise à jour temps réel: ${tasks.length} tâche(s)`);
      callback(tasks);
    }, (error) => {
      console.error('❌ Erreur écoute tâches:', error);
    });
  }

  /**
   * ✏️ METTRE À JOUR UNE TÂCHE
   */
  async updateTask(taskId, updates) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      
      // Vérifier que la tâche existe
      const taskSnap = await getDoc(taskRef);
      if (!taskSnap.exists()) {
        throw new Error('Tâche introuvable');
      }

      const cleanUpdates = {
        ...updates,
        updatedAt: new Date(),
        lastUpdatedBy: currentUser.uid
      };

      // Nettoyer les valeurs undefined
      Object.keys(cleanUpdates).forEach(key => {
        if (cleanUpdates[key] === undefined) {
          delete cleanUpdates[key];
        }
      });

      await updateDoc(taskRef, cleanUpdates);

      console.log('✅ Tâche mise à jour:', taskId);
      
      // Log d'activité
      await this.createActivityLog({
        userId: currentUser.uid,
        type: 'task_updated',
        taskId,
        timestamp: new Date(),
        metadata: { updates: cleanUpdates }
      });

      return { success: true };

    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UNE TÂCHE
   */
  async deleteTask(taskId) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      
      // Récupérer les détails avant suppression
      const taskSnap = await getDoc(taskRef);
      if (!taskSnap.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskSnap.data();
      
      // Vérifier les permissions
      if (taskData.createdBy !== currentUser.uid && taskData.assignedTo !== currentUser.uid) {
        throw new Error('Permissions insuffisantes pour supprimer cette tâche');
      }

      await deleteDoc(taskRef);

      console.log('✅ Tâche supprimée:', taskId);
      
      // Log d'activité
      await this.createActivityLog({
        userId: currentUser.uid,
        type: 'task_deleted',
        taskId,
        taskTitle: taskData.title,
        timestamp: new Date(),
        metadata: { deletedTask: taskData }
      });

      return { success: true };

    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      throw error;
    }
  }

  /**
   * 📈 STATISTIQUES TÂCHES
   */
  async getTaskStats(userId = null) {
    const targetUserId = userId || auth.currentUser?.uid;
    
    try {
      const tasks = await this.getUserTasks(targetUserId);
      
      const now = new Date();
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const stats = {
        // Totaux généraux
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        todo: tasks.filter(t => t.status === 'todo').length,
        overdue: tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== 'completed').length,
        
        // Par priorité
        byPriority: {
          urgent: tasks.filter(t => t.priority === 'urgent').length,
          high: tasks.filter(t => t.priority === 'high').length,
          medium: tasks.filter(t => t.priority === 'medium').length,
          low: tasks.filter(t => t.priority === 'low').length
        },
        
        // Par difficulté/complexité
        byComplexity: {
          expert: tasks.filter(t => t.complexity === 'expert').length,
          complex: tasks.filter(t => t.complexity === 'complex').length,
          medium: tasks.filter(t => t.complexity === 'medium').length,
          simple: tasks.filter(t => t.complexity === 'simple').length
        },
        
        // Période récente
        thisWeek: {
          created: tasks.filter(t => t.createdAt >= thisWeek).length,
          completed: tasks.filter(t => t.completedAt && t.completedAt >= thisWeek).length
        },
        
        thisMonth: {
          created: tasks.filter(t => t.createdAt >= thisMonth).length,
          completed: tasks.filter(t => t.completedAt && t.completedAt >= thisMonth).length
        },
        
        // XP total gagné
        totalXPEarned: tasks
          .filter(t => t.status === 'completed' && t.xpRewarded)
          .reduce((total, task) => total + (task.xpRewarded || 0), 0),
        
        // Temps estimé vs réel
        estimatedHours: tasks.reduce((total, task) => total + (task.estimatedHours || 0), 0),
        
        // Taux de complétion
        completionRate: tasks.length > 0 ? 
          Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
      };

      return stats;

    } catch (error) {
      console.error('❌ Erreur statistiques tâches:', error);
      return null;
    }
  }

  /**
   * 🔍 RECHERCHER DES TÂCHES
   */
  async searchTasks(searchTerm, userId = null) {
    const targetUserId = userId || auth.currentUser?.uid;
    
    try {
      const allTasks = await this.getUserTasks(targetUserId);
      
      const searchTermLower = searchTerm.toLowerCase();
      
      const filteredTasks = allTasks.filter(task => {
        return (
          task.title.toLowerCase().includes(searchTermLower) ||
          task.description.toLowerCase().includes(searchTermLower) ||
          task.category.toLowerCase().includes(searchTermLower) ||
          (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchTermLower)))
        );
      });

      return filteredTasks;
      
    } catch (error) {
      console.error('❌ Erreur recherche tâches:', error);
      return [];
    }
  }

  /**
   * 📝 CRÉER LOG D'ACTIVITÉ
   */
  async createActivityLog(activityData) {
    try {
      const activitiesCollection = collection(db, COLLECTIONS.ACTIVITIES);
      const logData = {
        ...activityData,
        id: `${activityData.userId}_${Date.now()}`,
        createdAt: activityData.timestamp || new Date()
      };
      
      await addDoc(activitiesCollection, logData);
      
    } catch (error) {
      console.warn('⚠️ Erreur création log activité:', error);
      // Ne pas faire échouer l'opération principale pour un problème de log
    }
  }

  /**
   * 🎉 NOTIFICATION DE COMPLÉTION
   */
  showTaskCompletionNotification(data) {
    // Créer notification stylée
    const notification = document.createElement('div');
    notification.className = `
      fixed top-4 right-4 z-50 transform transition-all duration-500 translate-x-full
      bg-gradient-to-r from-green-500 to-emerald-600 text-white 
      px-6 py-4 rounded-lg shadow-2xl max-w-sm border border-green-400
    `;
    
    let difficultyText = '';
    if (data.difficulty) {
      const difficultyLabels = {
        'easy': '🟢 Facile',
        'normal': '🟡 Normal',
        'hard': '🔴 Difficile',
        'expert': '🟣 Expert'
      };
      difficultyText = `<div class="text-xs opacity-75 mt-1">${difficultyLabels[data.difficulty]}</div>`;
    }
    
    let badgeText = '';
    if (data.newBadges && data.newBadges.length > 0) {
      badgeText = `<div class="text-xs opacity-90 mt-1">🏆 ${data.newBadges.length} nouveau(x) badge(s) débloqué(s) !</div>`;
    }
    
    let levelUpText = '';
    if (data.leveledUp) {
      levelUpText = `<div class="text-sm font-bold mt-1 text-yellow-200 animate-pulse">🎊 NIVEAU ${data.newLevel} ATTEINT !</div>`;
    }
    
    notification.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="text-2xl animate-bounce">✅</div>
        <div class="flex-1">
          <div class="font-bold">${data.taskTitle || 'Tâche'} terminée !</div>
          <div class="text-sm opacity-90">+${data.xpGain || 0} XP • Total: ${data.newXP || 0} XP</div>
          ${difficultyText}
          ${levelUpText}
          ${badgeText}
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Son de notification (optionnel)
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeBS0HmQ==');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignorer les erreurs de lecture
    } catch (e) {}
    
    // Animation de sortie
    const duration = data.leveledUp ? 8000 : 5000; // Plus long si level up
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 500);
    }, duration);
  }

  /**
   * 🎯 MÉTHODES RAPIDES POUR ACTIONS COMMUNES
   */
  
  // Démarrer une tâche
  async startTask(taskId) {
    return await this.updateTask(taskId, { 
      status: 'in_progress',
      startedAt: new Date()
    });
  }
  
  // Mettre en pause une tâche
  async pauseTask(taskId) {
    return await this.updateTask(taskId, { 
      status: 'paused',
      pausedAt: new Date()
    });
  }
  
  // Assigner une tâche à quelqu'un
  async assignTask(taskId, userId) {
    return await this.updateTask(taskId, { 
      assignedTo: userId,
      assignedAt: new Date(),
      assignedBy: auth.currentUser.uid
    });
  }
  
  // Définir une date d'échéance
  async setDueDate(taskId, dueDate) {
    return await this.updateTask(taskId, { 
      dueDate: new Date(dueDate)
    });
  }
  
  // Ajouter un commentaire/note
  async addComment(taskId, comment) {
    const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
    const taskSnap = await getDoc(taskRef);
    
    if (taskSnap.exists()) {
      const currentComments = taskSnap.data().comments || [];
      const newComment = {
        id: Date.now().toString(),
        text: comment,
        author: auth.currentUser.uid,
        authorEmail: auth.currentUser.email,
        createdAt: new Date()
      };
      
      return await this.updateTask(taskId, {
        comments: [...currentComments, newComment]
      });
    }
  }
}

export default new TaskService();
