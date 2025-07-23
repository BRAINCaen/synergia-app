// ==========================================
// 📁 react-app/src/core/services/taskService.js
// SERVICE COMPLET AVEC TOUTES LES MÉTHODES MANQUANTES
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
  limit,
  serverTimestamp,
  writeBatch,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 📋 SERVICE COMPLET DE GESTION DES TÂCHES
 */
class TaskService {
  constructor() {
    console.log('📋 TaskService initialisé avec toutes les méthodes');
  }

  /**
   * ➕ CRÉER UNE NOUVELLE TÂCHE
   */
  async createTask(taskData, userId) {
    try {
      console.log('➕ [CREATE] Création tâche:', taskData.title);

      const newTask = {
        ...taskData,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        assignedTo: taskData.assignedTo || [],
        tags: taskData.tags || [],
        estimatedHours: taskData.estimatedHours || 0,
        xpReward: taskData.xpReward || 0,
        isAvailable: taskData.isAvailable || false,
        submissions: [],
        comments: []
      };

      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      
      console.log('✅ [CREATE] Tâche créée avec ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...newTask,
        createdAt: new Date(),
        updatedAt: new Date()
      };

    } catch (error) {
      console.error('❌ [CREATE] Erreur création tâche:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER TOUTES LES TÂCHES
   */
  async getAllTasks() {
    try {
      console.log('📋 [GET_ALL] Récupération toutes les tâches...');

      const tasksQuery = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc')
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      
      tasksSnapshot.forEach(doc => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        });
      });

      console.log('✅ [GET_ALL] Tâches récupérées:', tasks.length);
      return tasks;

    } catch (error) {
      console.error('❌ [GET_ALL] Erreur récupération tâches:', error);
      throw error;
    }
  }

  /**
   * 👤 RÉCUPÉRER LES TÂCHES D'UN UTILISATEUR
   */
  async getUserTasks(userId) {
    try {
      console.log('👤 [GET_USER] Récupération tâches utilisateur:', userId);

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('assignedTo', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      
      tasksSnapshot.forEach(doc => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        });
      });

      console.log('✅ [GET_USER] Tâches utilisateur récupérées:', tasks.length);
      return tasks;

    } catch (error) {
      console.error('❌ [GET_USER] Erreur récupération tâches utilisateur:', error);
      throw error;
    }
  }

  /**
   * 🎯 RÉCUPÉRER LES TÂCHES DISPONIBLES (VOLONTARIAT)
   */
  async getAvailableTasks() {
    try {
      console.log('🎯 [GET_AVAILABLE] Récupération tâches disponibles...');

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('isAvailable', '==', true),
        where('status', 'in', ['pending', 'open']),
        orderBy('createdAt', 'desc')
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      
      tasksSnapshot.forEach(doc => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        });
      });

      console.log('✅ [GET_AVAILABLE] Tâches disponibles récupérées:', tasks.length);
      return tasks;

    } catch (error) {
      console.error('❌ [GET_AVAILABLE] Erreur récupération tâches disponibles:', error);
      // Retourner un tableau vide en cas d'erreur pour éviter les plantages
      return [];
    }
  }

  /**
   * 👨‍💼 RÉCUPÉRER LES TÂCHES CRÉÉES PAR UN UTILISATEUR
   */
  async getTasksByCreator(userId) {
    try {
      console.log('👨‍💼 [GET_BY_CREATOR] Récupération tâches créées par:', userId);

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      
      tasksSnapshot.forEach(doc => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        });
      });

      console.log('✅ [GET_BY_CREATOR] Tâches créées récupérées:', tasks.length);
      return tasks;

    } catch (error) {
      console.error('❌ [GET_BY_CREATOR] Erreur récupération tâches créées:', error);
      return [];
    }
  }

  /**
   * ✏️ METTRE À JOUR UNE TÂCHE
   */
  async updateTask(taskId, updateData) {
    try {
      console.log('✏️ [UPDATE] Mise à jour tâche:', taskId);

      const taskRef = doc(db, 'tasks', taskId);
      const updatePayload = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(taskRef, updatePayload);
      
      // Récupérer la tâche mise à jour
      const updatedDoc = await getDoc(taskRef);
      if (updatedDoc.exists()) {
        const data = updatedDoc.data();
        const updatedTask = {
          id: updatedDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: new Date()
        };
        
        console.log('✅ [UPDATE] Tâche mise à jour:', updatedTask.title);
        return updatedTask;
      }

      throw new Error('Tâche introuvable après mise à jour');

    } catch (error) {
      console.error('❌ [UPDATE] Erreur mise à jour tâche:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UNE TÂCHE
   */
  async deleteTask(taskId) {
    try {
      console.log('🗑️ [DELETE] Suppression tâche:', taskId);

      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
      
      console.log('✅ [DELETE] Tâche supprimée');
      return { success: true };

    } catch (error) {
      console.error('❌ [DELETE] Erreur suppression tâche:', error);
      throw error;
    }
  }

  /**
   * 👥 ASSIGNER UN UTILISATEUR À UNE TÂCHE
   */
  async assignUserToTask(taskId, userId) {
    try {
      console.log('👥 [ASSIGN] Assignation utilisateur:', { taskId, userId });

      const taskRef = doc(db, 'tasks', taskId);
      
      // Vérifier que la tâche existe
      const taskDoc = await getDoc(taskRef);
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }
      
      const taskData = taskDoc.data();
      
      // Vérifier si l'utilisateur n'est pas déjà assigné
      if (taskData.assignedTo && taskData.assignedTo.includes(userId)) {
        throw new Error('Utilisateur déjà assigné à cette tâche');
      }

      // Ajouter l'utilisateur à la liste des assignés
      await updateDoc(taskRef, {
        assignedTo: arrayUnion(userId),
        updatedAt: serverTimestamp(),
        status: 'assigned'
      });
      
      // Retourner la tâche mise à jour
      const updatedDoc = await getDoc(taskRef);
      const data = updatedDoc.data();
      
      const updatedTask = {
        id: updatedDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: new Date()
      };
      
      console.log('✅ [ASSIGN] Utilisateur assigné à la tâche');
      return updatedTask;

    } catch (error) {
      console.error('❌ [ASSIGN] Erreur assignation:', error);
      throw error;
    }
  }

  /**
   * 📤 SOUMETTRE UNE TÂCHE TERMINÉE
   */
  async submitTask(taskId, submissionData) {
    try {
      console.log('📤 [SUBMIT] Soumission tâche:', taskId);

      const taskRef = doc(db, 'tasks', taskId);
      
      const submission = {
        ...submissionData,
        submittedAt: serverTimestamp(),
        id: Date.now().toString()
      };

      await updateDoc(taskRef, {
        submissions: arrayUnion(submission),
        status: 'submitted',
        updatedAt: serverTimestamp()
      });
      
      // Retourner la tâche mise à jour
      const updatedDoc = await getDoc(taskRef);
      const data = updatedDoc.data();
      
      console.log('✅ [SUBMIT] Tâche soumise pour validation');
      return {
        id: updatedDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: new Date()
      };

    } catch (error) {
      console.error('❌ [SUBMIT] Erreur soumission:', error);
      throw error;
    }
  }

  /**
   * 📊 RÉCUPÉRER LES STATISTIQUES DES TÂCHES
   */
  async getTaskStats(userId = null) {
    try {
      console.log('📊 [STATS] Calcul statistiques tâches', userId ? `pour ${userId}` : 'globales');

      let tasksQuery;
      if (userId) {
        tasksQuery = query(
          collection(db, 'tasks'),
          where('assignedTo', 'array-contains', userId)
        );
      } else {
        tasksQuery = query(collection(db, 'tasks'));
      }
      
      const tasksSnapshot = await getDocs(tasksQuery);
      
      const stats = {
        total: 0,
        pending: 0,
        assigned: 0,
        in_progress: 0,
        completed: 0,
        submitted: 0,
        cancelled: 0,
        high: 0,
        medium: 0,
        low: 0
      };
      
      tasksSnapshot.forEach(doc => {
        const task = doc.data();
        stats.total++;
        
        // Comptage par statut
        if (task.status) {
          stats[task.status] = (stats[task.status] || 0) + 1;
        }
        
        // Comptage par priorité
        if (task.priority) {
          stats[task.priority] = (stats[task.priority] || 0) + 1;
        }
      });

      console.log('✅ [STATS] Statistiques calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ [STATS] Erreur calcul statistiques:', error);
      // Retourner des stats vides en cas d'erreur
      return {
        total: 0,
        pending: 0,
        assigned: 0,
        in_progress: 0,
        completed: 0,
        submitted: 0,
        cancelled: 0,
        high: 0,
        medium: 0,
        low: 0
      };
    }
  }

  /**
   * 🔍 RECHERCHER DES TÂCHES
   */
  async searchTasks(searchTerm, userId = null) {
    try {
      console.log('🔍 [SEARCH] Recherche tâches:', searchTerm);

      // Récupérer toutes les tâches (Firebase ne supporte pas la recherche full-text)
      const allTasks = userId ? await this.getUserTasks(userId) : await this.getAllTasks();
      
      const filteredTasks = allTasks.filter(task => 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      console.log('✅ [SEARCH] Tâches trouvées:', filteredTasks.length);
      return filteredTasks;

    } catch (error) {
      console.error('❌ [SEARCH] Erreur recherche:', error);
      return [];
    }
  }

  /**
   * 📋 RÉCUPÉRER UNE TÂCHE PAR ID
   */
  async getTaskById(taskId) {
    try {
      console.log('📋 [GET_BY_ID] Récupération tâche:', taskId);

      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }
      
      const data = taskDoc.data();
      const task = {
        id: taskDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      };

      console.log('✅ [GET_BY_ID] Tâche récupérée:', task.title);
      return task;

    } catch (error) {
      console.error('❌ [GET_BY_ID] Erreur récupération tâche:', error);
      throw error;
    }
  }

  /**
   * 🏷️ RÉCUPÉRER LES TÂCHES PAR STATUT
   */
  async getTasksByStatus(status, userId = null) {
    try {
      console.log('🏷️ [GET_BY_STATUS] Récupération par statut:', status);

      let tasksQuery;
      if (userId) {
        tasksQuery = query(
          collection(db, 'tasks'),
          where('assignedTo', 'array-contains', userId),
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
      } else {
        tasksQuery = query(
          collection(db, 'tasks'),
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
      }
      
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      
      tasksSnapshot.forEach(doc => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        });
      });

      console.log('✅ [GET_BY_STATUS] Tâches par statut récupérées:', tasks.length);
      return tasks;

    } catch (error) {
      console.error('❌ [GET_BY_STATUS] Erreur récupération par statut:', error);
      return [];
    }
  }
}

// ✅ INSTANCE UNIQUE
const taskService = new TaskService();

// ✅ EXPORTS
export default TaskService;
export { taskService };
