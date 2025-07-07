// ==========================================
// 📁 react-app/src/core/services/taskService.js
// AJOUT MÉTHODE getTasksByProject - CORRECTION ERREUR
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

// ✅ CONSTANTES EXPORTÉES UNE SEULE FOIS
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  VALIDATION_PENDING: 'validation_pending',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
};

/**
 * ✅ SERVICE DES TÂCHES COMPLET AVEC getTasksByProject
 */
class TaskService {
  constructor() {
    this.listeners = new Map();
    this.COLLECTION_NAME = 'tasks';
    console.log('✅ TaskService initialisé avec getTasksByProject');
  }

  /**
   * ✅ RÉCUPÉRER UNE TÂCHE PAR SON ID
   */
  async getTask(taskId) {
    try {
      console.log('📝 Récupération tâche:', taskId);
      
      const docRef = doc(db, this.COLLECTION_NAME, taskId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const taskData = { id: docSnap.id, ...docSnap.data() };
        console.log('✅ Tâche trouvée:', taskData.title);
        return taskData;
      } else {
        console.log('❌ Tâche non trouvée:', taskId);
        return null;
      }
      
    } catch (error) {
      console.error('❌ Erreur récupération tâche:', error);
      return null;
    }
  }

  /**
   * 🆕 RÉCUPÉRER LES TÂCHES D'UN PROJET SPÉCIFIQUE
   */
  async getTasksByProject(projectId) {
    try {
      console.log('📂 Récupération tâches du projet:', projectId);
      
      if (!projectId) {
        console.warn('⚠️ ProjectId manquant pour getTasksByProject');
        return [];
      }
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ ${tasks.length} tâches trouvées pour le projet ${projectId}`);
      return tasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches par projet:', error);
      return [];
    }
  }

  /**
   * ✅ RÉCUPÉRER TOUTES LES TÂCHES D'UN UTILISATEUR
   */
  async getUserTasks(userId) {
    try {
      console.log('👤 Récupération tâches utilisateur:', userId);
      
      if (!userId) {
        console.warn('⚠️ UserId manquant pour getUserTasks');
        return [];
      }
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ ${tasks.length} tâches trouvées pour l'utilisateur`);
      return tasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches utilisateur:', error);
      return [];
    }
  }

  /**
   * ✅ CRÉER UNE NOUVELLE TÂCHE
   */
  async createTask(taskData, userId) {
    try {
      console.log('📝 Création nouvelle tâche:', taskData.title);
      
      const task = {
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || TASK_STATUS.PENDING,
        priority: taskData.priority || 'medium',
        complexity: taskData.complexity || 'medium',
        xpReward: taskData.xpReward || this.calculateDefaultXP(taskData.complexity),
        projectId: taskData.projectId || null,
        dueDate: taskData.dueDate || null,
        tags: taskData.tags || [],
        userId: userId,
        createdBy: userId,
        assignedTo: userId,
        userEmail: taskData.userEmail || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), task);
      
      console.log('✅ Tâche créée avec ID:', docRef.id);
      return {
        success: true,
        task: { id: docRef.id, ...task }
      };
      
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * ✅ METTRE À JOUR UNE TÂCHE
   */
  async updateTask(taskId, updateData, userId) {
    try {
      console.log('🔄 Mise à jour tâche:', taskId);
      
      const taskRef = doc(db, this.COLLECTION_NAME, taskId);
      
      const updatePayload = {
        ...updateData,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      };
      
      await updateDoc(taskRef, updatePayload);
      
      console.log('✅ Tâche mise à jour avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * ✅ SUPPRIMER UNE TÂCHE
   */
  async deleteTask(taskId, userId) {
    try {
      console.log('🗑️ Suppression tâche:', taskId);
      
      const taskRef = doc(db, this.COLLECTION_NAME, taskId);
      await deleteDoc(taskRef);
      
      console.log('✅ Tâche supprimée avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * ✅ CALCULER L'XP PAR DÉFAUT SELON LA COMPLEXITÉ
   */
  calculateDefaultXP(complexity) {
    const xpMap = {
      'simple': 10,
      'medium': 25,
      'complex': 50,
      'expert': 100
    };
    return xpMap[complexity] || 25;
  }

  /**
   * ✅ MARQUER UNE TÂCHE COMME TERMINÉE
   */
  async completeTask(taskId, userId) {
    try {
      console.log('✅ Marquage tâche terminée:', taskId);
      
      const updateData = {
        status: TASK_STATUS.COMPLETED,
        completedAt: serverTimestamp(),
        completedBy: userId
      };
      
      return await this.updateTask(taskId, updateData, userId);
      
    } catch (error) {
      console.error('❌ Erreur completion tâche:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * ✅ ÉCOUTER LES CHANGEMENTS DE TÂCHES EN TEMPS RÉEL
   */
  subscribeToUserTasks(userId, callback) {
    try {
      console.log('🔄 Abonnement aux tâches utilisateur:', userId);
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tasks = [];
        querySnapshot.forEach((doc) => {
          tasks.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log('🔄 Mise à jour temps réel des tâches:', tasks.length);
        callback(tasks);
      });
      
      this.listeners.set(userId, unsubscribe);
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur abonnement tâches:', error);
      return null;
    }
  }

  /**
   * 🔍 RECHERCHER DES TÂCHES
   */
  async searchTasks(userId, searchTerm) {
    try {
      const tasks = await this.getUserTasks(userId);
      
      if (!searchTerm || searchTerm.trim() === '') {
        return tasks;
      }
      
      const term = searchTerm.toLowerCase().trim();
      
      return tasks.filter(task => 
        task.title.toLowerCase().includes(term) ||
        task.description?.toLowerCase().includes(term) ||
        task.tags?.some(tag => tag.toLowerCase().includes(term))
      );
      
    } catch (error) {
      console.error('❌ Erreur recherche tâches:', error);
      return [];
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DES TÂCHES
   */
  async getTasksStats(userId) {
    try {
      const tasks = await this.getUserTasks(userId);
      
      const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === TASK_STATUS.PENDING).length,
        inProgress: tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length,
        completed: tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length,
        validationPending: tasks.filter(t => t.status === TASK_STATUS.VALIDATION_PENDING).length,
        rejected: tasks.filter(t => t.status === TASK_STATUS.REJECTED).length,
        highPriority: tasks.filter(t => t.priority === 'high').length,
        urgentPriority: tasks.filter(t => t.priority === 'urgent').length,
        totalXpPotential: tasks.reduce((sum, t) => sum + (t.xpReward || 0), 0),
        earnedXp: tasks
          .filter(t => t.status === TASK_STATUS.COMPLETED)
          .reduce((sum, t) => sum + (t.xpReward || 0), 0)
      };
      
      console.log('📊 Statistiques tâches:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur stats tâches:', error);
      return {
        total: 0, pending: 0, inProgress: 0, completed: 0,
        validationPending: 0, rejected: 0, highPriority: 0, urgentPriority: 0,
        totalXpPotential: 0, earnedXp: 0
      };
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
    console.log('🧹 Listeners tâches nettoyés');
  }
}

// ✅ EXPORT DE LA CLASSE ET DE L'INSTANCE
export default TaskService;

// ✅ EXPORT DE L'INSTANCE SINGLETON
export const taskService = new TaskService();

console.log('✅ TaskService - Classe et instance exportées avec getTasksByProject');
