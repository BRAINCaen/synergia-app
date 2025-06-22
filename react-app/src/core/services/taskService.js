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
  increment
} from 'firebase/firestore';
import { db, auth } from '../core/firebase.js';
import gamificationService from './gamificationService.js';
import { COLLECTIONS } from '../core/constants.js';

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
      const taskRef = doc(db, COLLECTIONS.TASKS || 'tasks', taskId);
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
        throw new Error('Vous n\'êtes pas assigné à cette tâche');
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
        timestamp: now
      });

      // 6. Afficher notification de succès
      this.showTaskCompletionNotification({
        taskTitle: taskData.title,
        xpGain: gamificationResult.success ? gamificationResult.xpGain : 0,
        ...gamificationResult
      });

      console.log('✅ Tâche complétée avec succès:', {
        taskId,
        xpGained: gamificationResult.success ? gamificationResult.xpGain : 0,
        levelUp: gamificationResult.success ? gamificationResult.leveledUp : false
      });

      return {
        success: true,
        taskId,
        taskData: { ...taskData, ...updates },
        gamification: gamificationResult,
        message: `Tâche "${taskData.title}" terminée !`
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
    // Logique de difficulté basée sur plusieurs critères
    let score = 0;
    
    // Priorité
    if (taskData.priority === 'high' || taskData.priority === 'urgent') score += 3;
    else if (taskData.priority === 'medium') score += 2;
    else if (taskData.priority === 'low') score += 1;
    
    // Complexité
    if (taskData.complexity === 'complex' || taskData.complexity === 'expert') score += 3;
    else if (taskData.complexity === 'medium' || taskData.complexity === 'intermediate') score += 2;
    else if (taskData.complexity === 'simple' || taskData.complexity === 'beginner') score += 1;
    
    // Temps estimé
    const estimatedHours = taskData.estimatedHours || additionalData.estimatedHours || 0;
    if (estimatedHours > 8) score += 3;
    else if (estimatedHours > 4) score += 2;
    else if (estimatedHours > 1) score += 1;
    
    // Type de tâche
    if (taskData.type === 'epic' || taskData.type === 'milestone') score += 3;
    else if (taskData.type === 'feature' || taskData.type === 'story') score += 2;
    else if (taskData.type === 'bug' || taskData.type === 'task') score += 1;
    
    // Déterminer la difficulté finale
    if (score >= 8) return 'expert';   // 100 XP
    else if (score >= 6) return 'hard';     // 60 XP
    else if (score >= 3) return 'normal';   // 40 XP
    else return 'easy';                     // 20 XP
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
      const completeTaskData = {
        title: taskData.title || 'Nouvelle tâche',
        description: taskData.description || '',
        status: 'todo',
        priority: taskData.priority || 'medium',
        category: taskData.category || 'general',
        complexity: taskData.complexity || 'normal',
        type: taskData.type || 'task',
        
        // Assignation
        createdBy: currentUser.uid,
        assignedTo: taskData.assignedTo || currentUser.uid,
        
        // Métadonnées
        estimatedHours: taskData.estimatedHours || 0,
        tags: taskData.tags || [],
        dueDate: taskData.dueDate || null,
        
        // Timestamps
        createdAt: now,
        updatedAt: now,
        
        // Projet (optionnel)
        projectId: taskData.projectId || null,
        
        // Gamification
        xpReward: this.getXPReward(taskData.complexity || 'normal')
      };

      const tasksCollection = collection(db, COLLECTIONS.TASKS || 'tasks');
      const docRef = await addDoc(tasksCollection, completeTaskData);

      console.log('✅ Tâche créée:', docRef.id);

      // Créer log d'activité
      await this.createActivityLog({
        userId: currentUser.uid,
        type: 'task_created',
        taskId: docRef.id,
        taskTitle: completeTaskData.title,
        timestamp: now
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
      const tasksCollection = collection(db, COLLECTIONS.TASKS || 'tasks');
      let q = query(
        tasksCollection,
        where('assignedTo', '==', targetUserId),
        orderBy('createdAt', 'desc')
      );

      // Appliquer filtres
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }

      const querySnapshot = await getDocs(q);
      const tasks = [];

      querySnapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });

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
    const tasksCollection = collection(db, COLLECTIONS.TASKS || 'tasks');
    let q = query(
      tasksCollection,
      where('assignedTo', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(tasks);
    });
  }

  /**
   * ✏️ METTRE À JOUR UNE TÂCHE
   */
  async updateTask(taskId, updates) {
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS || 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: new Date()
      });

      console.log('✅ Tâche mise à jour:', taskId);
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
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS || 'tasks', taskId);
      await deleteDoc(taskRef);

      console.log('✅ Tâche supprimée:', taskId);
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
      
      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        todo: tasks.filter(t => t.status === 'todo').length,
        
        byPriority: {
          high: tasks.filter(t => t.priority === 'high').length,
          medium: tasks.filter(t => t.priority === 'medium').length,
          low: tasks.filter(t => t.priority === 'low').length
        },
        
        byDifficulty: {
          expert: tasks.filter(t => t.complexity === 'expert').length,
          hard: tasks.filter(t => t.complexity === 'complex').length,
          normal: tasks.filter(t => t.complexity === 'medium').length,
          easy: tasks.filter(t => t.complexity === 'simple').length
        }
      };

      return stats;

    } catch (error) {
      console.error('❌ Erreur statistiques tâches:', error);
      return null;
    }
  }

  /**
   * 📝 CRÉER LOG D'ACTIVITÉ
   */
  async createActivityLog(activityData) {
    try {
      const activitiesCollection = collection(db, COLLECTIONS.ACTIVITIES || 'activities');
      await addDoc(activitiesCollection, activityData);
    } catch (error) {
      console.warn('⚠️ Erreur création log activité:', error);
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
}

export default new TaskService();
