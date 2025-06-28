// ==========================================
// 📁 react-app/src/core/services/taskService.js
// SERVICE DES TÂCHES - VERSION PROPRE POUR BUILD
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

// Constantes pour les statuts des tâches
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  VALIDATION_PENDING: 'validation_pending',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  BLOCKED: 'blocked',
  CANCELLED: 'cancelled'
};

export const TASK_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal', 
  HIGH: 'high',
  URGENT: 'urgent'
};

export const TASK_DIFFICULTIES = {
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard',
  EXPERT: 'expert'
};

/**
 * 📋 SERVICE DES TÂCHES AVEC VALIDATION OBLIGATOIRE
 */
class TaskService {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * ✅ CRÉER UNE NOUVELLE TÂCHE
   */
  async createTask(taskData, userId) {
    try {
      const task = {
        title: taskData.title || '',
        description: taskData.description || '',
        status: TASK_STATUS.TODO,
        priority: taskData.priority || TASK_PRIORITIES.NORMAL,
        difficulty: taskData.difficulty || TASK_DIFFICULTIES.NORMAL,
        projectId: taskData.projectId || null,
        userId: userId,
        assignedTo: taskData.assignedTo || userId,
        estimatedTime: taskData.estimatedTime || null,
        actualTime: null,
        tags: taskData.tags || [],
        dueDate: taskData.dueDate || null,
        
        // Nouveaux champs pour la validation
        requiresValidation: true,
        xpReward: this.calculateXPReward(taskData.difficulty || TASK_DIFFICULTIES.NORMAL),
        
        // Métadonnées
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId
      };

      const docRef = await addDoc(collection(db, 'tasks'), task);
      
      console.log('✅ Tâche créée:', docRef.id);
      
      return { 
        id: docRef.id, 
        ...task,
        success: true 
      };
      
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      throw error;
    }
  }

  /**
   * 📝 METTRE À JOUR UNE TÂCHE
   */
  async updateTask(taskId, updates) {
    try {
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Nouvelle logique: Pas d'XP automatique
      if (updates.status === TASK_STATUS.COMPLETED) {
        updateData.status = TASK_STATUS.VALIDATION_PENDING;
        updateData.submittedForValidationAt = serverTimestamp();
        console.log('📋 Tâche soumise pour validation');
      }

      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, updateData);
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      throw error;
    }
  }

  /**
   * 🎯 SOUMETTRE UNE TÂCHE POUR VALIDATION
   */
  async submitTaskForValidation(taskId, submissionData) {
    try {
      const { comment, photoFile } = submissionData || {};
      
      await this.updateTask(taskId, {
        status: TASK_STATUS.VALIDATION_PENDING,
        submissionComment: comment || '',
        submittedAt: serverTimestamp(),
        hasPhoto: !!photoFile
      });
      
      console.log('📝 Tâche soumise pour validation:', taskId);
      
      return {
        success: true,
        message: 'Tâche soumise pour validation admin',
        status: TASK_STATUS.VALIDATION_PENDING
      };
      
    } catch (error) {
      console.error('❌ Erreur soumission validation:', error);
      throw error;
    }
  }

  /**
   * ✅ VALIDER UNE TÂCHE (Admin seulement)
   */
  async validateTask(taskId, adminId, approved, adminComment = '') {
    try {
      const updateData = {
        status: approved ? TASK_STATUS.COMPLETED : TASK_STATUS.REJECTED,
        validatedBy: adminId,
        validatedAt: serverTimestamp(),
        adminComment: adminComment,
        updatedAt: serverTimestamp()
      };
      
      if (approved) {
        updateData.completedAt = serverTimestamp();
      }
      
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, updateData);
      
      console.log(`✅ Tâche ${approved ? 'validée' : 'rejetée'}:`, taskId);
      
      return { 
        success: true, 
        approved,
        message: `Tâche ${approved ? 'validée' : 'rejetée'} avec succès`
      };
      
    } catch (error) {
      console.error('❌ Erreur validation tâche:', error);
      throw error;
    }
  }

  /**
   * 🎯 CALCULER L'XP SELON LA DIFFICULTÉ
   */
  calculateXPReward(difficulty) {
    const xpMap = {
      [TASK_DIFFICULTIES.EASY]: 25,
      [TASK_DIFFICULTIES.NORMAL]: 50,
      [TASK_DIFFICULTIES.HARD]: 100,
      [TASK_DIFFICULTIES.EXPERT]: 200
    };
    
    return xpMap[difficulty] || 50;
  }

  /**
   * 📊 OBTENIR LES TÂCHES D'UN UTILISATEUR
   */
  async getUserTasks(userId) {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      return tasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches:', error);
      return [];
    }
  }

  /**
   * 📋 OBTENIR LES TÂCHES EN ATTENTE DE VALIDATION
   */
  async getTasksPendingValidation() {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('status', '==', TASK_STATUS.VALIDATION_PENDING),
        orderBy('submittedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('📋 Tâches en validation:', tasks.length);
      return tasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches validation:', error);
      return [];
    }
  }

  /**
   * 🗑️ SUPPRIMER UNE TÂCHE
   */
  async deleteTask(taskId) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      throw error;
    }
  }

  /**
   * 🎧 ÉCOUTER LES TÂCHES EN TEMPS RÉEL
   */
  subscribeToUserTasks(userId, callback) {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tasks = [];
        querySnapshot.forEach((doc) => {
          tasks.push({ id: doc.id, ...doc.data() });
        });
        callback(tasks);
      });

      this.listeners.set(userId, unsubscribe);
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur écoute tâches:', error);
      callback([]);
      return () => {};
    }
  }

  /**
   * 🎧 ÉCOUTER LES VALIDATIONS EN ATTENTE (Admin)
   */
  subscribeToValidationTasks(callback) {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('status', '==', TASK_STATUS.VALIDATION_PENDING),
        orderBy('submittedAt', 'desc')
      );

      return onSnapshot(q, (querySnapshot) => {
        const tasks = [];
        querySnapshot.forEach((doc) => {
          tasks.push({ id: doc.id, ...doc.data() });
        });
        callback(tasks);
      });
      
    } catch (error) {
      console.error('❌ Erreur écoute validations:', error);
      callback([]);
      return () => {};
    }
  }

  /**
   * 📊 STATISTIQUES DES TÂCHES
   */
  async getTaskStats(userId) {
    try {
      const tasks = await this.getUserTasks(userId);
      
      const stats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === TASK_STATUS.TODO).length,
        inProgress: tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length,
        validationPending: tasks.filter(t => t.status === TASK_STATUS.VALIDATION_PENDING).length,
        completed: tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length,
        rejected: tasks.filter(t => t.status === TASK_STATUS.REJECTED).length,
        
        // XP stats
        totalPotentialXP: tasks.reduce((sum, task) => sum + (task.xpReward || 0), 0),
        pendingXP: tasks
          .filter(t => t.status === TASK_STATUS.VALIDATION_PENDING)
          .reduce((sum, task) => sum + (task.xpReward || 0), 0),
        earnedXP: tasks
          .filter(t => t.status === TASK_STATUS.COMPLETED)
          .reduce((sum, task) => sum + (task.xpReward || 0), 0)
      };
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur stats tâches:', error);
      return {
        total: 0, todo: 0, inProgress: 0, validationPending: 0, 
        completed: 0, rejected: 0, totalPotentialXP: 0, pendingXP: 0, earnedXP: 0
      };
    }
  }

  /**
   * 🔄 REMETTRE UNE TÂCHE EN COURS (si rejetée)
   */
  async restartTask(taskId, userId) {
    try {
      await this.updateTask(taskId, {
        status: TASK_STATUS.TODO,
        rejectedAt: null,
        adminComment: null,
        validatedBy: null
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur restart tâche:', error);
      throw error;
    }
  }

  /**
   * 🧹 NETTOYER LES LISTENERS
   */
  cleanup() {
    this.listeners.forEach((unsubscribe, key) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
    console.log('🧹 TaskService listeners nettoyés');
  }
}

// ✅ Instance singleton
const taskService = new TaskService();

// ✅ Exports propres
export { taskService };
export default taskService;
