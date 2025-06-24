// ==========================================
// 📁 react-app/src/core/services/taskService.js
// Service de gestion des tâches avec imports Firebase corrigés
// ==========================================

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';

// ✅ CORRECTION : Import db directement depuis firebase.js
import { db } from '../firebase.js';

// Vérification simple si db existe
const isFirebaseConfigured = !!db;

// Configuration des tâches
export const TASK_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const TASK_DIFFICULTIES = {
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard',
  EXPERT: 'expert'
};

// Récompenses XP par difficulté
export const XP_REWARDS = {
  easy: 20,
  normal: 40,
  hard: 60,
  expert: 100
};

class TaskService {
  constructor() {
    this.listeners = new Map();
    this.cache = new Map();
  }

  // Créer une nouvelle tâche
  async createTask(userId, taskData) {
    if (!isFirebaseConfigured || !userId) {
      console.log('🔧 [MOCK] Création tâche:', taskData.title);
      return { 
        id: `mock-${Date.now()}`, 
        ...taskData, 
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    try {
      const task = {
        ...taskData,
        userId,
        status: taskData.status || TASK_STATUS.TODO,
        priority: taskData.priority || TASK_PRIORITIES.NORMAL,
        difficulty: taskData.difficulty || TASK_DIFFICULTIES.NORMAL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null
      };

      const docRef = await addDoc(collection(db, 'tasks'), task);
      return { id: docRef.id, ...task };
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      throw new Error(`Erreur création tâche: ${error.message}`);
    }
  }

  // Récupérer toutes les tâches d'un utilisateur
  async getUserTasks(userId) {
    if (!isFirebaseConfigured || !userId) {
      return this.getMockTasks();
    }

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
      return this.getMockTasks();
    }
  }

  // Mettre à jour une tâche
  async updateTask(taskId, updates) {
    if (!isFirebaseConfigured) {
      console.log('🔧 [MOCK] Mise à jour tâche:', taskId);
      return { success: true };
    }

    try {
      const taskRef = doc(db, 'tasks', taskId);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      if (updates.status === TASK_STATUS.COMPLETED) {
        updateData.completedAt = new Date().toISOString();
      }

      await updateDoc(taskRef, updateData);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      throw error;
    }
  }

  // Supprimer une tâche
  async deleteTask(taskId) {
    if (!isFirebaseConfigured) {
      console.log('🔧 [MOCK] Suppression tâche:', taskId);
      return { success: true };
    }

    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      throw error;
    }
  }

  // Écouter les changements en temps réel
  subscribeToUserTasks(userId, callback) {
    if (!isFirebaseConfigured) {
      console.log('🔧 [MOCK] Mode écoute tâches');
      callback(this.getMockTasks());
      return () => {};
    }

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
      callback(this.getMockTasks());
      return () => {};
    }
  }

  // Nettoyer les listeners
  unsubscribeAll() {
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
  }

  // Données mock pour le développement
  getMockTasks() {
    return [
      {
        id: 'mock-1',
        title: 'Finaliser le rapport mensuel',
        description: 'Compiler les données et rédiger le rapport de performance',
        status: TASK_STATUS.IN_PROGRESS,
        priority: TASK_PRIORITIES.HIGH,
        difficulty: TASK_DIFFICULTIES.NORMAL,
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
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'mock-3',
        title: 'Tests unitaires',
        description: 'Écrire les tests pour les nouveaux composants',
        status: TASK_STATUS.TODO,
        priority: TASK_PRIORITIES.NORMAL,
        difficulty: TASK_DIFFICULTIES.NORMAL,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}

// ✅ Instance singleton
const taskService = new TaskService();
export default taskService;
