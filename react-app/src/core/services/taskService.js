// ==========================================
// 📁 react-app/src/core/services/taskService.js
// SERVICE DES TÂCHES - MIS À JOUR AVEC VALIDATION OBLIGATOIRE
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

// 🚨 IMPORTANT: XP automatique supprimé - validation admin obligatoire
// import { gamificationService } from './gamificationService.js'; // ❌ RETIRÉ

// Constantes pour les statuts des tâches
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  VALIDATION_PENDING: 'validation_pending', // ✅ NOUVEAU STATUT
  COMPLETED: 'completed',
  REJECTED: 'rejected', // ✅ NOUVEAU STATUT
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
        
        // 🆕 NOUVEAUX CHAMPS POUR LA VALIDATION
        requiresValidation: true, // Toujours true maintenant
        xpReward: this.calculateXPReward(taskData.difficulty || TASK_DIFFICULTIES.NORMAL),
        
        // Métadonnées
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId
      };

      const docRef = await addDoc(collection(db, 'tasks'), task);
      
      console.log('✅ Tâche créée:', docRef.id, '- XP en attente de validation:', task.xpReward);
      
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

      // 🚨 NOUVELLE LOGIQUE: Pas d'XP automatique
      if (updates.status === TASK_STATUS.COMPLETED) {
        // ❌ Ancien comportement supprimé:
        // updateData.completedAt = serverTimestamp();
        // await gamificationService.completeTask(userId, updates.difficulty);
        
        // ✅ Nouveau comportement: Marquer comme en validation
        updateData.status = TASK_STATUS.VALIDATION_PENDING;
        updateData.submittedForValidationAt = serverTimestamp();
        
        console.log('📋 Tâche soumise pour validation au lieu d\'être auto-complétée');
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
   * 🎯 SOUMETTRE UNE TÂCHE POUR VALIDATION (REMPLACE completeTask)
   */
  async submitTaskForValidation(taskId, submissionData) {
    try {
      const { comment, photoFile } = submissionData;
      
      // Mettre à jour le statut de la tâche
      await this.updateTask(taskId, {
        status: TASK_STATUS.VALIDATION_PENDING,
        submissionComment: comment,
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
        status: TASK_STATUS.IN_PROGRESS,
        rejectionHandled: true,
        restartedAt: serverTimestamp()
      });
      
      console.log('🔄 Tâche remise en cours:', taskId);
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur restart tâche:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENIR LES TÂCHES PAR PROJET
   */
  async getProjectTasks(projectId) {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      return tasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches projet:', error);
      return [];
    }
  }

  /**
   * 🎯 OBTENIR UNE TÂCHE SPÉCIFIQUE
   */
  async getTask(taskId) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (taskSnap.exists()) {
        return { id: taskSnap.id, ...taskSnap.data() };
      } else {
        throw new Error('Tâche introuvable');
      }
      
    } catch (error) {
      console.error('❌ Erreur récupération tâche:', error);
      throw error;
    }
  }

  /**
   * 🏷️ OBTENIR LES TÂCHES PAR STATUT
   */
  async getTasksByStatus(status, userId = null) {
    try {
      let q;
      if (userId) {
        q = query(
          collection(db, 'tasks'),
          where('userId', '==', userId),
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'tasks'),
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      return tasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches par statut:', error);
      return [];
    }
  }

  /**
   * 🧹 NETTOYER LES LISTENERS
   */
  unsubscribeAll() {
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
  }

  /**
   * 📊 DONNÉES MOCK POUR LE DÉVELOPPEMENT
   */
  getMockTasks() {
    return [
      {
        id: 'mock-1',
        title: 'Finaliser le rapport mensuel',
        description: 'Compiler les données et rédiger le rapport de performance',
        status: TASK_STATUS.IN_PROGRESS,
        priority: TASK_PRIORITIES.HIGH,
        difficulty: TASK_DIFFICULTIES.NORMAL,
        xpReward: 50,
        requiresValidation: true,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'mock-2',
        title: 'Révision du code frontend',
        description: 'Revoir et optimiser les composants React',
        status: TASK_STATUS.TODO,
        priority: TASK_PRIORITIES.NORMAL,
        difficulty: TASK_DIFFICULTIES.HARD,
        xpReward: 100,
        requiresValidation: true,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'mock-3',
        title: 'Tests unitaires validés',
        description: 'Tests pour les nouveaux composants - Validé par admin',
        status: TASK_STATUS.COMPLETED,
        priority: TASK_PRIORITIES.NORMAL,
        difficulty: TASK_DIFFICULTIES.NORMAL,
        xpReward: 50,
        requiresValidation: true,
        validatedBy: 'admin',
        validatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        adminComment: 'Excellent travail !',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}

// ✅ Instance singleton
const taskService = new TaskService();

// ✅ Export multiple pour compatibilité
export { taskService };
export default taskService; tâches:', error);
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
      console.error('❌ Erreur écoute
