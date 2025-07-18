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
   * 📄 RÉCUPÉRER UNE TÂCHE PAR ID
   */
  async getTask(taskId) {
    try {
      console.log('📄 [GET] Récupération tâche:', taskId);

      const taskDoc = await getDoc(doc(db, 'tasks', taskId));
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const task = {
        id: taskDoc.id,
        ...taskDoc.data()
      };

      console.log('✅ [GET] Tâche récupérée:', task.title);
      return task;

    } catch (error) {
      console.error('❌ [GET] Erreur récupération tâche:', error);
      throw error;
    }
  }

  /**
   * 👤 RÉCUPÉRER LES TÂCHES D'UN UTILISATEUR
   */
  async getUserTasks(userId, options = {}) {
    try {
      console.log('👤 [GET_USER] Récupération tâches utilisateur:', userId);

      let tasksQuery = query(
        collection(db, 'tasks'),
        where('createdBy', '==', userId)
      );

      if (options.status) {
        tasksQuery = query(tasksQuery, where('status', '==', options.status));
      }

      if (options.priority) {
        tasksQuery = query(tasksQuery, where('priority', '==', options.priority));
      }

      if (options.projectId) {
        tasksQuery = query(tasksQuery, where('projectId', '==', options.projectId));
      }

      tasksQuery = query(tasksQuery, orderBy('createdAt', 'desc'));
      
      if (options.limit) {
        tasksQuery = query(tasksQuery, limit(options.limit));
      }

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
   * 📁 RÉCUPÉRER LES TÂCHES D'UN PROJET
   */
  async getTasksByProject(projectId) {
    try {
      console.log('📁 [GET_PROJECT] Récupération tâches projet:', projectId);

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId),
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

      console.log('✅ [GET_PROJECT] Tâches projet récupérées:', tasks.length);
      return tasks;

    } catch (error) {
      console.error('❌ [GET_PROJECT] Erreur récupération tâches projet:', error);
      throw error;
    }
  }

  /**
   * ✏️ METTRE À JOUR UNE TÂCHE
   */
  async updateTask(taskId, updates, userId) {
    try {
      console.log('✏️ [UPDATE] Mise à jour tâche:', taskId);

      const taskRef = doc(db, 'tasks', taskId);
      
      const taskDoc = await getDoc(taskRef);
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const updatedData = {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      };

      await updateDoc(taskRef, updatedData);

      console.log('✅ [UPDATE] Tâche mise à jour');
      
      return {
        id: taskId,
        ...taskDoc.data(),
        ...updatedData
      };

    } catch (error) {
      console.error('❌ [UPDATE] Erreur mise à jour tâche:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UNE TÂCHE
   */
  async deleteTask(taskId, userId) {
    try {
      console.log('🗑️ [DELETE] Suppression tâche:', taskId);

      const taskRef = doc(db, 'tasks', taskId);
      
      const taskDoc = await getDoc(taskRef);
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();

      if (taskData.createdBy !== userId) {
        throw new Error('Vous n\'avez pas le droit de supprimer cette tâche');
      }

      const batch = writeBatch(db);
      batch.delete(taskRef);

      const assignmentsQuery = query(
        collection(db, 'taskAssignments'),
        where('taskId', '==', taskId)
      );

      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      assignmentsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log('✅ [DELETE] Tâche et assignations supprimées');
      return { success: true };

    } catch (error) {
      console.error('❌ [DELETE] Erreur suppression tâche:', error);
      throw error;
    }
  }

  /**
   * 📤 SOUMETTRE UNE TÂCHE POUR VALIDATION
   */
  async submitTaskForValidation(taskId, submissionData) {
    try {
      console.log('📤 [SUBMIT] Soumission tâche pour validation:', taskId);

      const taskRef = doc(db, 'tasks', taskId);
      
      const updates = {
        status: 'submitted',
        submissionData: submissionData,
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(taskRef, updates);

      console.log('✅ [SUBMIT] Tâche soumise pour validation');
      return { success: true };

    } catch (error) {
      console.error('❌ [SUBMIT] Erreur soumission tâche:', error);
      throw error;
    }
  }

  /**
   * 📊 CHANGER LE STATUT D'UNE TÂCHE
   */
  async updateTaskStatus(taskId, newStatus, userId) {
    try {
      console.log('📊 [STATUS] Changement statut tâche:', { taskId, newStatus });

      const updates = {
        status: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      };

      if (newStatus === 'in_progress') {
        updates.startedAt = serverTimestamp();
      } else if (newStatus === 'completed') {
        updates.completedAt = serverTimestamp();
      }

      await this.updateTask(taskId, updates, userId);

      console.log('✅ [STATUS] Statut mis à jour vers:', newStatus);
      return { success: true };

    } catch (error) {
      console.error('❌ [STATUS] Erreur changement statut:', error);
      throw error;
    }
  }

  /**
   * 🔍 RECHERCHER DES TÂCHES
   */
  async searchTasks(searchParams, userId) {
    try {
      console.log('🔍 [SEARCH] Recherche tâches:', searchParams);

      let tasksQuery = collection(db, 'tasks');

      if (searchParams.createdBy) {
        tasksQuery = query(tasksQuery, where('createdBy', '==', searchParams.createdBy));
      } else if (userId) {
        tasksQuery = query(tasksQuery, where('createdBy', '==', userId));
      }

      if (searchParams.status) {
        tasksQuery = query(tasksQuery, where('status', '==', searchParams.status));
      }

      if (searchParams.priority) {
        tasksQuery = query(tasksQuery, where('priority', '==', searchParams.priority));
      }

      if (searchParams.projectId) {
        tasksQuery = query(tasksQuery, where('projectId', '==', searchParams.projectId));
      }

      if (searchParams.assignedTo) {
        tasksQuery = query(tasksQuery, where('assignedTo', 'array-contains', searchParams.assignedTo));
      }

      tasksQuery = query(tasksQuery, orderBy('createdAt', 'desc'));

      if (searchParams.limit) {
        tasksQuery = query(tasksQuery, limit(searchParams.limit));
      }

      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      
      tasksSnapshot.forEach(doc => {
        const taskData = { id: doc.id, ...doc.data() };
        
        let matches = true;
        
        if (searchParams.keyword) {
          const keyword = searchParams.keyword.toLowerCase();
          matches = matches && (
            taskData.title?.toLowerCase().includes(keyword) ||
            taskData.description?.toLowerCase().includes(keyword) ||
            taskData.tags?.some(tag => tag.toLowerCase().includes(keyword))
          );
        }

        if (searchParams.dueDateBefore) {
          const dueDate = taskData.dueDate?.toDate ? taskData.dueDate.toDate() : new Date(taskData.dueDate);
          matches = matches && dueDate && dueDate <= new Date(searchParams.dueDateBefore);
        }

        if (searchParams.dueDateAfter) {
          const dueDate = taskData.dueDate?.toDate ? taskData.dueDate.toDate() : new Date(taskData.dueDate);
          matches = matches && dueDate && dueDate >= new Date(searchParams.dueDateAfter);
        }

        if (matches) {
          tasks.push(taskData);
        }
      });

      console.log('✅ [SEARCH] Tâches trouvées:', tasks.length);
      return tasks;

    } catch (error) {
      console.error('❌ [SEARCH] Erreur recherche tâches:', error);
      throw error;
    }
  }

  /**
   * 📊 STATISTIQUES DES TÂCHES
   */
  async getTaskStats(userId) {
    try {
      console.log('📊 [STATS] Calcul statistiques tâches:', userId);

      const userTasks = await this.getUserTasks(userId);

      const stats = {
        total: userTasks.length,
        pending: 0,
        inProgress: 0,
        assigned: 0,
        submitted: 0,
        completed: 0,
        cancelled: 0,
        overdue: 0,
        totalXpReward: 0,
        averageEstimatedHours: 0
      };

      let totalHours = 0;
      const now = new Date();

      userTasks.forEach(task => {
        switch (task.status) {
          case 'pending':
            stats.pending++;
            break;
          case 'assigned':
            stats.assigned++;
            break;
          case 'in_progress':
            stats.inProgress++;
            break;
          case 'submitted':
            stats.submitted++;
            break;
          case 'completed':
            stats.completed++;
            break;
          case 'cancelled':
            stats.cancelled++;
            break;
        }

        if (task.dueDate && task.status !== 'completed') {
          const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
          if (dueDate < now) {
            stats.overdue++;
          }
        }

        if (task.xpReward) {
          stats.totalXpReward += task.xpReward;
        }

        if (task.estimatedHours) {
          totalHours += task.estimatedHours;
        }
      });

      stats.averageEstimatedHours = userTasks.length > 0 ? 
        Math.round(totalHours / userTasks.length * 10) / 10 : 0;

      console.log('✅ [STATS] Statistiques calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ [STATS] Erreur calcul statistiques:', error);
      throw error;
    }
  }
}

// Export de l'instance
export const taskService = new TaskService();
