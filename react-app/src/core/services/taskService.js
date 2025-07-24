// ==========================================
// 📁 react-app/src/core/services/taskService.js
// SERVICE COMPLET DE GESTION DES TÂCHES - VERSION PROPRE
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
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 📋 SERVICE COMPLET DE GESTION DES TÂCHES
 */
class TaskService {
  constructor() {
    console.log('📋 TaskService initialisé avec toutes les fonctions');
    this.validateFirebaseConnection();
  }

  /**
   * 🔥 VALIDATION DE LA CONNEXION FIREBASE
   */
  validateFirebaseConnection() {
    try {
      if (!db) {
        console.error('❌ [VALIDATION] Base de données Firestore non initialisée');
        throw new Error('Firebase non configuré');
      }
      
      console.log('✅ [VALIDATION] Connexion Firebase validée');
      return true;
    } catch (error) {
      console.error('❌ [VALIDATION] Erreur validation Firebase:', error);
      return false;
    }
  }

  /**
   * 🛡️ VALIDATION STRICTE DES PARAMÈTRES
   */
  validateParameters(params, requiredFields) {
    const errors = [];
    
    for (const field of requiredFields) {
      if (!params[field]) {
        errors.push(`${field} est requis`);
      } else if (typeof params[field] === 'string' && params[field].trim() === '') {
        errors.push(`${field} ne peut pas être vide`);
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Paramètres invalides: ${errors.join(', ')}`);
    }
    
    return true;
  }

  /**
   * ➕ CRÉER UNE NOUVELLE TÂCHE
   */
  async createTask(taskData, userId) {
    try {
      // ✅ VALIDATION STRICTE DES PARAMÈTRES
      this.validateParameters({ taskData, userId }, ['taskData', 'userId']);
      
      if (!taskData.title || typeof taskData.title !== 'string' || taskData.title.trim() === '') {
        throw new Error('Le titre de la tâche est requis');
      }

      const cleanUserId = userId.trim();
      console.log('➕ [CREATE] Création tâche:', taskData.title);

      const newTask = {
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        createdBy: cleanUserId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        assignedTo: Array.isArray(taskData.assignedTo) ? taskData.assignedTo : [],
        tags: Array.isArray(taskData.tags) ? taskData.tags : [],
        estimatedHours: typeof taskData.estimatedHours === 'number' ? taskData.estimatedHours : 0,
        xpReward: typeof taskData.xpReward === 'number' ? taskData.xpReward : 25,
        openToVolunteers: taskData.openToVolunteers === true,
        volunteers: [],
        volunteerApplications: [],
        // ✅ Champs additionnels sécurisés
        category: taskData.category || 'general',
        complexity: taskData.complexity || 'medium',
        dueDate: taskData.dueDate || null,
        projectId: taskData.projectId || null
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
      console.log('📋 [GET_ALL] Récupération toutes les tâches...');

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
   * 👤 RÉCUPÉRER LES TÂCHES D'UN UTILISATEUR SPÉCIFIQUE
   */
  async getTasksByUser(userId) {
    try {
      // ✅ VALIDATION STRICTE DE L'USER ID
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        console.warn('⚠️ [GET_BY_USER] UserID invalide:', userId);
        return [];
      }

      const cleanUserId = userId.trim();
      console.log('👤 [GET_BY_USER] Récupération tâches utilisateur:', cleanUserId);

      // ✅ REQUÊTE SÉCURISÉE AVEC FALLBACK
      let tasks = [];
      
      try {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('assignedTo', 'array-contains', cleanUserId),
          orderBy('createdAt', 'desc')
        );
        
        const tasksSnapshot = await getDocs(tasksQuery);
        
        tasksSnapshot.forEach(doc => {
          const taskData = doc.data();
          // ✅ Validation des données de tâche
          if (taskData && typeof taskData === 'object') {
            tasks.push({
              id: doc.id,
              ...taskData,
              // ✅ Valeurs par défaut pour éviter undefined
              title: taskData.title || 'Tâche sans titre',
              status: taskData.status || 'pending',
              priority: taskData.priority || 'medium',
              assignedTo: Array.isArray(taskData.assignedTo) ? taskData.assignedTo : [],
              xpReward: typeof taskData.xpReward === 'number' ? taskData.xpReward : 0
            });
          }
        });

        console.log('✅ [GET_BY_USER] Tâches utilisateur récupérées:', tasks.length);
        return tasks;

      } catch (queryError) {
        console.error('❌ [GET_BY_USER] Erreur requête Firestore:', queryError);
        
        // ✅ FALLBACK : Récupérer toutes les tâches et filtrer côté client
        console.log('🔄 [GET_BY_USER] Tentative de fallback...');
        
        const allTasksSnapshot = await getDocs(collection(db, 'tasks'));
        const fallbackTasks = [];
        
        allTasksSnapshot.forEach(doc => {
          const taskData = doc.data();
          if (taskData && Array.isArray(taskData.assignedTo) && taskData.assignedTo.includes(cleanUserId)) {
            fallbackTasks.push({
              id: doc.id,
              ...taskData,
              title: taskData.title || 'Tâche sans titre',
              status: taskData.status || 'pending',
              priority: taskData.priority || 'medium',
              xpReward: typeof taskData.xpReward === 'number' ? taskData.xpReward : 0
            });
          }
        });

        console.log('✅ [GET_BY_USER] Fallback réussi:', fallbackTasks.length, 'tâches');
        return fallbackTasks;
      }

    } catch (error) {
      console.error('❌ [GET_BY_USER] Erreur critique récupération tâches utilisateur:', error);
      // ✅ Retourner array vide plutôt que de planter
      return [];
    }
  }

  /**
   * 👤 ALIAS POUR getTasksByUser (pour compatibilité)
   */
  async getUserTasks(userId) {
    return this.getTasksByUser(userId);
  }

  /**
   * 🌟 RÉCUPÉRER LES TÂCHES DISPONIBLES (OUVERTES AUX VOLONTAIRES)
   */
  async getAvailableTasks() {
    try {
      console.log('🌟 [GET_AVAILABLE] Récupération tâches disponibles...');

      let tasks = [];

      try {
        // ✅ REQUÊTE SÉCURISÉE AVEC VALIDATION
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('openToVolunteers', '==', true),
          where('status', 'in', ['pending', 'open']),
          orderBy('createdAt', 'desc')
        );
        
        const tasksSnapshot = await getDocs(tasksQuery);
        
        tasksSnapshot.forEach(doc => {
          const taskData = doc.data();
          // ✅ Validation stricte des données
          if (taskData && typeof taskData === 'object') {
            tasks.push({
              id: doc.id,
              ...taskData,
              // ✅ Valeurs par défaut sécurisées
              title: taskData.title || 'Tâche disponible',
              description: taskData.description || '',
              status: taskData.status || 'pending',
              priority: taskData.priority || 'medium',
              xpReward: typeof taskData.xpReward === 'number' ? taskData.xpReward : 25,
              assignedTo: Array.isArray(taskData.assignedTo) ? taskData.assignedTo : []
            });
          }
        });

        console.log('✅ [GET_AVAILABLE] Tâches disponibles récupérées:', tasks.length);
        return tasks;

      } catch (queryError) {
        console.error('❌ [GET_AVAILABLE] Erreur requête, tentative fallback:', queryError);
        
        // ✅ FALLBACK : Filtrer toutes les tâches côté client
        const allTasksSnapshot = await getDocs(collection(db, 'tasks'));
        const fallbackTasks = [];
        
        allTasksSnapshot.forEach(doc => {
          const taskData = doc.data();
          if (taskData && 
              taskData.openToVolunteers === true && 
              ['pending', 'open'].includes(taskData.status)) {
            fallbackTasks.push({
              id: doc.id,
              ...taskData,
              title: taskData.title || 'Tâche disponible',
              description: taskData.description || '',
              status: taskData.status || 'pending',
              priority: taskData.priority || 'medium',
              xpReward: typeof taskData.xpReward === 'number' ? taskData.xpReward : 25,
              assignedTo: Array.isArray(taskData.assignedTo) ? taskData.assignedTo : []
            });
          }
        });

        console.log('✅ [GET_AVAILABLE] Fallback réussi:', fallbackTasks.length, 'tâches');
        return fallbackTasks;
      }

    } catch (error) {
      console.error('❌ [GET_AVAILABLE] Erreur critique récupération tâches disponibles:', error);
      return [];
    }
  }

  /**
   * 🎯 METTRE À JOUR UNE TÂCHE
   */
  async updateTask(taskId, updateData) {
    try {
      console.log('🎯 [UPDATE] Mise à jour tâche:', taskId);

      const taskRef = doc(db, 'tasks', taskId);
      const updates = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(taskRef, updates);

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
   * ✅ MARQUER UNE TÂCHE COMME TERMINÉE
   */
  async completeTask(taskId, userId) {
    try {
      console.log('✅ [COMPLETE] Completion tâche:', { taskId, userId });

      const updates = {
        status: 'completed',
        completedAt: serverTimestamp(),
        completedBy: userId
      };

      const updatedTask = await this.updateTask(taskId, updates);

      console.log('✅ [COMPLETE] Tâche marquée comme terminée');
      return { success: true, task: updatedTask };

    } catch (error) {
      console.error('❌ [COMPLETE] Erreur completion tâche:', error);
      throw error;
    }
  }

  /**
   * 🎯 ASSIGNER UNE TÂCHE À UN UTILISATEUR
   */
  async assignTask(taskId, userId, assignerId) {
    try {
      console.log('🎯 [ASSIGN] Assignation tâche:', { taskId, userId, assignerId });

      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();
      const currentAssigned = taskData.assignedTo || [];

      // Vérifier si l'utilisateur est déjà assigné
      if (currentAssigned.includes(userId)) {
        throw new Error('Utilisateur déjà assigné à cette tâche');
      }

      // Ajouter l'utilisateur aux assignés
      await updateDoc(taskRef, {
        assignedTo: arrayUnion(userId),
        status: taskData.status === 'pending' ? 'assigned' : taskData.status,
        updatedAt: serverTimestamp(),
        lastAssignedBy: assignerId,
        lastAssignedAt: serverTimestamp()
      });

      console.log('✅ [ASSIGN] Tâche assignée avec succès');
      return { success: true };

    } catch (error) {
      console.error('❌ [ASSIGN] Erreur assignation tâche:', error);
      throw error;
    }
  }

  /**
   * ❌ DÉSASSIGNER UNE TÂCHE D'UN UTILISATEUR
   */
  async unassignTask(taskId, userId) {
    try {
      console.log('❌ [UNASSIGN] Désassignation tâche:', { taskId, userId });

      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();
      const currentAssigned = taskData.assignedTo || [];

      // Retirer l'utilisateur des assignés
      await updateDoc(taskRef, {
        assignedTo: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });

      // Si plus personne n'est assigné, remettre en pending
      if (currentAssigned.length === 1 && currentAssigned[0] === userId) {
        await updateDoc(taskRef, {
          status: 'pending'
        });
      }

      console.log('✅ [UNASSIGN] Tâche désassignée avec succès');
      return { success: true };

    } catch (error) {
      console.error('❌ [UNASSIGN] Erreur désassignation tâche:', error);
      throw error;
    }
  }

  /**
   * 📊 RÉCUPÉRER LES TÂCHES PAR STATUT
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
   * 📂 RÉCUPÉRER LES TÂCHES D'UN PROJET
   */
  async getTasksByProject(projectId) {
    try {
      console.log('📂 [GET_BY_PROJECT] Récupération tâches du projet:', projectId);

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

      console.log('✅ [GET_BY_PROJECT] Tâches du projet récupérées:', tasks.length);
      return tasks;

    } catch (error) {
      console.error('❌ [GET_BY_PROJECT] Erreur récupération tâches du projet:', error);
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
        assigned: tasks.filter(t => t.status === 'assigned').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        cancelled: tasks.filter(t => t.status === 'cancelled').length,
        highPriority: tasks.filter(t => t.priority === 'high').length,
        mediumPriority: tasks.filter(t => t.priority === 'medium').length,
        lowPriority: tasks.filter(t => t.priority === 'low').length,
        totalXP: tasks.reduce((sum, task) => sum + (task.xpReward || 0), 0)
      };

      console.log('✅ [STATS] Statistiques calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ [STATS] Erreur calcul statistiques:', error);
      throw error;
    }
  }

  /**
   * ⏰ RÉCUPÉRER LES TÂCHES EN RETARD
   */
  async getOverdueTasks(userId = null) {
    try {
      console.log('⏰ [OVERDUE] Récupération tâches en retard');

      const tasks = userId ? await this.getUserTasks(userId) : await this.getAllTasks();
      const now = new Date();
      
      const overdueTasks = tasks.filter(task => {
        if (task.status === 'completed' || !task.dueDate) return false;
        
        const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
        return dueDate < now;
      });

      console.log('✅ [OVERDUE] Tâches en retard trouvées:', overdueTasks.length);
      return overdueTasks;

    } catch (error) {
      console.error('❌ [OVERDUE] Erreur récupération tâches en retard:', error);
      throw error;
    }
  }

  /**
   * 📅 RÉCUPÉRER LES TÂCHES DUE CETTE SEMAINE
   */
  async getTasksDueThisWeek(userId = null) {
    try {
      console.log('📅 [DUE_WEEK] Récupération tâches due cette semaine');

      const tasks = userId ? await this.getUserTasks(userId) : await this.getAllTasks();
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const dueThisWeekTasks = tasks.filter(task => {
        if (task.status === 'completed' || !task.dueDate) return false;
        
        const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
        return dueDate >= now && dueDate <= nextWeek;
      });

      console.log('✅ [DUE_WEEK] Tâches due cette semaine:', dueThisWeekTasks.length);
      return dueThisWeekTasks;

    } catch (error) {
      console.error('❌ [DUE_WEEK] Erreur récupération tâches due cette semaine:', error);
      throw error;
    }
  }
}

// ✅ INSTANCE UNIQUE
const taskService = new TaskService();

// ✅ EXPORTS
export default TaskService;
export { taskService };
