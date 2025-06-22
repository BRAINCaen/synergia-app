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
import { db, auth } from '../firebase.js';
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
        ...additionalData
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
      return { success: false, error: error.message };
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
    if (estimatedHours > 16) score += 4;
    else if (estimatedHours > 8) score += 3;
    else if (estimatedHours > 4) score += 2;
    else if (estimatedHours > 1) score += 1;
    
    // Déterminer la difficulté finale
    if (score >= 12) return 'expert';
    else if (score >= 8) return 'hard';
    else if (score >= 4) return 'normal';
    else return 'easy';
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
      
      if (!taskData.title || taskData.title.trim() === '') {
        throw new Error('Le titre de la tâche est requis');
      }

      const completeTaskData = {
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        status: 'todo',
        priority: taskData.priority || 'medium',
        category: taskData.category || 'general',
        complexity: taskData.complexity || 'normal',
        type: taskData.type || 'task',
        createdBy: currentUser.uid,
        assignedTo: taskData.assignedTo || currentUser.uid,
        estimatedHours: taskData.estimatedHours || 0,
        tags: Array.isArray(taskData.tags) ? taskData.tags : [],
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        startDate: taskData.startDate ? new Date(taskData.startDate) : null,
        createdAt: now,
        updatedAt: now,
        projectId: taskData.projectId || null,
        epicId: taskData.epicId || null,
        xpReward: this.getXPReward(taskData.complexity || 'normal'),
        metadata: {
          source: 'manual_creation',
          version: '3.0',
          createdByEmail: currentUser.email
        }
      };

      const tasksCollection = collection(db, COLLECTIONS.TASKS);
      const docRef = await addDoc(tasksCollection, completeTaskData);

      console.log('✅ Tâche créée:', docRef.id, completeTaskData.title);

      await this.createActivityLog({
        userId: currentUser.uid,
        type: 'task_created',
        taskId: docRef.id,
        taskTitle: completeTaskData.title,
        timestamp: now,
        metadata: { taskData: completeTaskData }
      });

      return {
        success: true,
        taskId: docRef.id,
        taskData: completeTaskData
      };

    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      return { success: false, error: error.message };
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
      
      let constraints = [
        where('assignedTo', '==', targetUserId),
        orderBy('updatedAt', 'desc')
      ];

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
      return [];
    }
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
      
      const taskSnap = await getDoc(taskRef);
      if (!taskSnap.exists()) {
        throw new Error('Tâche introuvable');
      }

      const cleanUpdates = {
        ...updates,
        updatedAt: new Date(),
        lastUpdatedBy: currentUser.uid
      };

      Object.keys(cleanUpdates).forEach(key => {
        if (cleanUpdates[key] === undefined) {
          delete cleanUpdates[key];
        }
      });

      await updateDoc(taskRef, cleanUpdates);

      console.log('✅ Tâche mise à jour:', taskId);
      
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
      return { success: false, error: error.message };
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
      
      const taskSnap = await getDoc(taskRef);
      if (!taskSnap.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskSnap.data();
      
      if (taskData.createdBy !== currentUser.uid && taskData.assignedTo !== currentUser.uid) {
        throw new Error('Permissions insuffisantes pour supprimer cette tâche');
      }

      await deleteDoc(taskRef);

      console.log('✅ Tâche supprimée:', taskId);
      
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
      return { success: false, error: error.message };
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
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        todo: tasks.filter(t => t.status === 'todo').length,
        overdue: tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== 'completed').length,
        
        byPriority: {
          urgent: tasks.filter(t => t.priority === 'urgent').length,
          high: tasks.filter(t => t.priority === 'high').length,
          medium: tasks.filter(t => t.priority === 'medium').length,
          low: tasks.filter(t => t.priority === 'low').length
        },
        
        byComplexity: {
          expert: tasks.filter(t => t.complexity === 'expert').length,
          complex: tasks.filter(t => t.complexity === 'complex').length,
          medium: tasks.filter(t => t.complexity === 'medium').length,
          simple: tasks.filter(t => t.complexity === 'simple').length
        },
        
        thisWeek: {
          created: tasks.filter(t => t.createdAt >= thisWeek).length,
          completed: tasks.filter(t => t.completedAt && t.completedAt >= thisWeek).length
        },
        
        thisMonth: {
          created: tasks.filter(t => t.createdAt >= thisMonth).length,
          completed: tasks.filter(t => t.completedAt && t.completedAt >= thisMonth).length
        },
        
        totalXPEarned: tasks
          .filter(t => t.status === 'completed' && t.xpRewarded)
          .reduce((total, task) => total + (task.xpRewarded || 0), 0),
        
        estimatedHours: tasks.reduce((total, task) => total + (task.estimatedHours || 0), 0),
        
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
}

export default new TaskService();
export { TaskService };
