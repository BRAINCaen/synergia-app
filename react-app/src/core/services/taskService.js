// ==========================================
// 📁 react-app/src/core/services/taskService.js
// FICHIER COMPLET ET CORRIGÉ - REMPLACE TON FICHIER ENTIER
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
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 📋 SERVICE COMPLET DE GESTION DES TÂCHES
 */
class TaskService {
  constructor() {
    console.log('📋 TaskService initialisé');
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
        xpReward: taskData.xpReward || 0
      };

      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      
      console.log('✅ [CREATE] Tâche créée avec ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...newTask
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
      console.log('📋 [GET_ALL] Récupération de toutes les tâches');

      const tasksQuery = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc')
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      
      tasksSnapshot.forEach(doc => {
        tasks.push({
          id: doc.id,
          ...doc.data()
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
        tasks.push({
          id: doc.id,
          ...doc.data()
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
   * 📄 RÉCUPÉRER UNE TÂCHE PAR ID
   */
  async getTaskById(taskId) {
    try {
      console.log('📄 [GET_BY_ID] Récupération tâche:', taskId);

      const taskDoc = await getDoc(doc(db, 'tasks', taskId));
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const task = {
        id: taskDoc.id,
        ...taskDoc.data()
      };

      console.log('✅ [GET_BY_ID] Tâche récupérée:', task.title);
      return task;

    } catch (error) {
      console.error('❌ [GET_BY_ID] Erreur récupération tâche:', error);
      throw error;
    }
  }

  /**
   * ✏️ METTRE À JOUR UNE TÂCHE
   */
  async updateTask(taskId, updates) {
    try {
      console.log('✏️ [UPDATE] Mise à jour tâche:', taskId);

      const taskRef = doc(db, 'tasks', taskId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(taskRef, updateData);
      
      console.log('✅ [UPDATE] Tâche mise à jour');
      return { success: true };

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

      await deleteDoc(doc(db, 'tasks', taskId));
      
      console.log('✅ [DELETE] Tâche supprimée');
      return { success: true };

    } catch (error) {
      console.error('❌ [DELETE] Erreur suppression tâche:', error);
      throw error;
    }
  }

  /**
   * 📊 RÉCUPÉRER TÂCHES PAR STATUT
   */
  async getTasksByStatus(status) {
    try {
      console.log('📊 [GET_BY_STATUS] Récupération tâches par statut:', status);

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      
      tasksSnapshot.forEach(doc => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ [GET_BY_STATUS] Tâches par statut récupérées:', tasks.length);
      return tasks;

    } catch (error) {
      console.error('❌ [GET_BY_STATUS] Erreur récupération tâches par statut:', error);
      throw error;
    }
  }

  /**
   * 🔍 RECHERCHER DES TÂCHES
   */
  async searchTasks(searchTerm) {
    try {
      console.log('🔍 [SEARCH] Recherche tâches:', searchTerm);

      // Firebase ne supporte pas la recherche full-text nativement
      // On récupère toutes les tâches et on filtre côté client
      const allTasks = await this.getAllTasks();
      
      const filteredTasks = allTasks.filter(task => 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      console.log('✅ [SEARCH] Tâches trouvées:', filteredTasks.length);
      return filteredTasks;

    } catch (error) {
      console.error('❌ [SEARCH] Erreur recherche tâches:', error);
      throw error;
    }
  }

  /**
   * 📈 RÉCUPÉRER STATISTIQUES DES TÂCHES
   */
  async getTaskStats(userId = null) {
    try {
      console.log('📈 [STATS] Récupération statistiques tâches');

      const tasks = userId ? await this.getUserTasks(userId) : await this.getAllTasks();
      
      const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        cancelled: tasks.filter(t => t.status === 'cancelled').length,
        highPriority: tasks.filter(t => t.priority === 'high').length,
        mediumPriority: tasks.filter(t => t.priority === 'medium').length,
        lowPriority: tasks.filter(t => t.priority === 'low').length
      };

      console.log('✅ [STATS] Statistiques calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ [STATS] Erreur calcul statistiques:', error);
      throw error;
    }
  }
}

// ✅ INSTANCE UNIQUE
const taskService = new TaskService();

// ✅ EXPORTS
export default TaskService;
export { taskService };
