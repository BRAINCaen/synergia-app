// ==========================================
// 📁 react-app/src/core/services/taskService.js  
// SERVICE TÂCHES AVEC SUPPORT PROJETS - VERSION COMPLÈTE
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
 * 📋 SERVICE COMPLET DE GESTION DES TÂCHES AVEC PROJETS
 */
class TaskService {
  constructor() {
    console.log('📋 TaskService initialisé avec support projets complet');
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
   * ➕ CRÉER UNE NOUVELLE TÂCHE AVEC SUPPORT PROJET
   */
  async createTask(taskData, userId) {
    try {
      console.log('➕ [CREATE] Création tâche:', taskData.title);
      console.log('🔗 [CREATE] Projet lié:', taskData.projectId || 'Aucun');

      const cleanUserId = userId.trim();

      const newTask = {
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        createdBy: cleanUserId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        category: taskData.category || 'general',
        assignedTo: Array.isArray(taskData.assignedTo) ? taskData.assignedTo : [],
        tags: Array.isArray(taskData.tags) ? taskData.tags : [],
        estimatedHours: typeof taskData.estimatedHours === 'number' ? taskData.estimatedHours : 1,
        xpReward: typeof taskData.xpReward === 'number' ? taskData.xpReward : 25,
        dueDate: taskData.dueDate || null,
        notes: taskData.notes || '',
        
        // ✅ NOUVEAU : Support projet
        projectId: taskData.projectId || null,
        projectTitle: taskData.projectTitle || null, // Cache pour affichage rapide
        
        // Métadonnées
        completedAt: null,
        completedBy: null,
        submittedForValidation: false,
        validationRequestId: null
      };

      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      
      // ✅ NOUVEAU : Mettre à jour le projet si lié
      if (taskData.projectId) {
        await this.linkTaskToProject(docRef.id, taskData.projectId);
      }

      const createdTask = {
        id: docRef.id,
        ...newTask
      };

      console.log('✅ [CREATE] Tâche créée avec ID:', docRef.id);
      
      return createdTask;

    } catch (error) {
      console.error('❌ [CREATE] Erreur création tâche:', error);
      throw error;
    }
  }

  /**
   * 🔗 LIER UNE TÂCHE À UN PROJET
   */
  async linkTaskToProject(taskId, projectId) {
    try {
      console.log('🔗 [LINK] Liaison tâche-projet:', { taskId, projectId });

      // Vérifier que le projet existe
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }

      const projectData = projectDoc.data();

      // Mettre à jour la tâche avec les infos du projet
      await updateDoc(doc(db, 'tasks', taskId), {
        projectId: projectId,
        projectTitle: projectData.title,
        updatedAt: serverTimestamp()
      });

      // Ajouter la tâche à la liste des tâches du projet
      const currentTasks = projectData.tasks || [];
      if (!currentTasks.includes(taskId)) {
        await updateDoc(projectRef, {
          tasks: arrayUnion(taskId),
          updatedAt: serverTimestamp()
        });
      }

      console.log('✅ [LINK] Tâche liée au projet avec succès');
      return { success: true };

    } catch (error) {
      console.error('❌ [LINK] Erreur liaison tâche-projet:', error);
      throw error;
    }
  }

  /**
   * 🔓 DÉLIER UNE TÂCHE D'UN PROJET
   */
  async unlinkTaskFromProject(taskId, projectId) {
    try {
      console.log('🔓 [UNLINK] Déconnexion tâche-projet:', { taskId, projectId });

      // Mettre à jour la tâche
      await updateDoc(doc(db, 'tasks', taskId), {
        projectId: null,
        projectTitle: null,
        updatedAt: serverTimestamp()
      });

      // Retirer la tâche de la liste du projet
      if (projectId) {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, {
          tasks: arrayRemove(taskId),
          updatedAt: serverTimestamp()
        });
      }

      console.log('✅ [UNLINK] Tâche déliée du projet avec succès');
      return { success: true };

    } catch (error) {
      console.error('❌ [UNLINK] Erreur déconnexion tâche-projet:', error);
      throw error;
    }
  }

  /**
   * 📁 RÉCUPÉRER LES TÂCHES D'UN PROJET
   */
  async getTasksByProject(projectId) {
    try {
      console.log('📁 [GET_BY_PROJECT] Récupération tâches du projet:', projectId);

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

      console.log(`✅ [GET_BY_PROJECT] ${tasks.length} tâches récupérées pour le projet`);
      return tasks;

    } catch (error) {
      console.error('❌ [GET_BY_PROJECT] Erreur récupération tâches du projet:', error);
      return [];
    }
  }

  /**
   * 📊 STATISTIQUES DES TÂCHES PAR PROJET
   */
  async getProjectTaskStats(projectId) {
    try {
      console.log('📊 [STATS] Calcul stats tâches projet:', projectId);

      const tasks = await this.getTasksByProject(projectId);
      
      const stats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo' || t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        validationPending: tasks.filter(t => t.status === 'validation_pending').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        totalXP: tasks.reduce((sum, task) => sum + (task.xpReward || 0), 0),
        totalEstimatedHours: tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
        completionRate: tasks.length > 0 ? 
          Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
      };

      console.log('✅ [STATS] Stats calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ [STATS] Erreur calcul stats projet:', error);
      return {
        total: 0,
        todo: 0,
        inProgress: 0,
        validationPending: 0,
        completed: 0,
        totalXP: 0,
        totalEstimatedHours: 0,
        completionRate: 0
      };
    }
  }

  /**
   * 🔄 METTRE À JOUR UNE TÂCHE AVEC GESTION PROJET
   */
  async updateTask(taskId, updateData) {
    try {
      console.log('🔄 [UPDATE] Mise à jour tâche:', taskId);

      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const currentTask = taskDoc.data();
      const oldProjectId = currentTask.projectId;
      const newProjectId = updateData.projectId;

      // Préparer les updates
      const updates = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      // Gestion changement de projet
      if (oldProjectId !== newProjectId) {
        console.log('🔄 [UPDATE] Changement de projet:', { oldProjectId, newProjectId });

        // Délier de l'ancien projet
        if (oldProjectId) {
          await this.unlinkTaskFromProject(taskId, oldProjectId);
        }

        // Lier au nouveau projet
        if (newProjectId) {
          await this.linkTaskToProject(taskId, newProjectId);
          
          // Récupérer le titre du nouveau projet
          const projectDoc = await getDoc(doc(db, 'projects', newProjectId));
          if (projectDoc.exists()) {
            updates.projectTitle = projectDoc.data().title;
          }
        } else {
          updates.projectTitle = null;
        }
      }

      await updateDoc(taskRef, updates);

      console.log('✅ [UPDATE] Tâche mise à jour avec succès');
      return { success: true };

    } catch (error) {
      console.error('❌ [UPDATE] Erreur mise à jour tâche:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UNE TÂCHE AVEC NETTOYAGE PROJET
   */
  async deleteTask(taskId) {
    try {
      console.log('🗑️ [DELETE] Suppression tâche:', taskId);

      // Récupérer la tâche pour obtenir le projectId
      const taskDoc = await getDoc(doc(db, 'tasks', taskId));
      if (taskDoc.exists()) {
        const taskData = taskDoc.data();
        
        // Délier du projet si nécessaire
        if (taskData.projectId) {
          await this.unlinkTaskFromProject(taskId, taskData.projectId);
        }
      }

      // Supprimer la tâche
      await deleteDoc(doc(db, 'tasks', taskId));

      console.log('✅ [DELETE] Tâche supprimée avec nettoyage projet');
      return { success: true };

    } catch (error) {
      console.error('❌ [DELETE] Erreur suppression tâche:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER TOUTES LES TÂCHES AVEC INFOS PROJET
   */
  async getAllTasks() {
    try {
      console.log('📋 [GET_ALL] Récupération de toutes les tâches avec projets');

      const tasksQuery = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc')
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];

      tasksSnapshot.forEach(doc => {
        const taskData = doc.data();
        tasks.push({
          id: doc.id,
          ...taskData,
          // ✅ NOUVEAU : Indiquer si la tâche est liée à un projet
          hasProject: !!taskData.projectId,
          projectInfo: taskData.projectId ? {
            id: taskData.projectId,
            title: taskData.projectTitle
          } : null
        });
      });

      console.log(`✅ [GET_ALL] ${tasks.length} tâches récupérées avec infos projet`);
      return tasks;

    } catch (error) {
      console.error('❌ [GET_ALL] Erreur récupération toutes tâches:', error);
      return [];
    }
  }

  /**
   * 🌟 RÉCUPÉRER LES TÂCHES DISPONIBLES AVEC FILTRAGE PROJET
   */
  async getAvailableTasks(userId = null, projectFilter = null) {
    try {
      console.log('🌟 [GET_AVAILABLE] Récupération tâches disponibles');
      console.log('🔍 [GET_AVAILABLE] Filtres:', { userId, projectFilter });

      let tasksQuery = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc')
      );

      // Filtrer par projet si spécifié
      if (projectFilter) {
        tasksQuery = query(
          collection(db, 'tasks'),
          where('projectId', '==', projectFilter),
          orderBy('createdAt', 'desc')
        );
      }

      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];

      tasksSnapshot.forEach(doc => {
        const taskData = doc.data();
        
        // Filtres de disponibilité
        const isCompleted = taskData.status === 'completed';
        const isInValidation = taskData.status === 'validation_pending';
        
        if (!isCompleted && !isInValidation) {
          tasks.push({
            id: doc.id,
            ...taskData,
            hasProject: !!taskData.projectId,
            projectInfo: taskData.projectId ? {
              id: taskData.projectId,
              title: taskData.projectTitle
            } : null
          });
        }
      });

      console.log(`✅ [GET_AVAILABLE] ${tasks.length} tâches disponibles trouvées`);
      return tasks;

    } catch (error) {
      console.error('❌ [GET_AVAILABLE] Erreur récupération tâches disponibles:', error);
      return [];
    }
  }

  /**
   * 👤 RÉCUPÉRER LES TÂCHES D'UN UTILISATEUR AVEC GROUPEMENT PROJET
   */
  async getUserTasksGroupedByProject(userId) {
    try {
      console.log('👤 [GET_GROUPED] Récupération tâches utilisateur groupées:', userId);

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('assignedTo', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      const allTasks = [];

      tasksSnapshot.forEach(doc => {
        allTasks.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Grouper par projet
      const grouped = {
        withProject: {},
        withoutProject: []
      };

      allTasks.forEach(task => {
        if (task.projectId) {
          if (!grouped.withProject[task.projectId]) {
            grouped.withProject[task.projectId] = {
              projectId: task.projectId,
              projectTitle: task.projectTitle,
              tasks: []
            };
          }
          grouped.withProject[task.projectId].tasks.push(task);
        } else {
          grouped.withoutProject.push(task);
        }
      });

      console.log(`✅ [GET_GROUPED] Tâches groupées: ${Object.keys(grouped.withProject).length} projets, ${grouped.withoutProject.length} indépendantes`);
      
      return {
        byProject: grouped.withProject,
        independent: grouped.withoutProject,
        total: allTasks.length
      };

    } catch (error) {
      console.error('❌ [GET_GROUPED] Erreur groupement tâches:', error);
      return {
        byProject: {},
        independent: [],
        total: 0
      };
    }
  }

  /**
   * 👤 RÉCUPÉRER LES TÂCHES D'UN UTILISATEUR (STANDARD)
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

      console.log(`✅ [GET_USER] ${tasks.length} tâches utilisateur récupérées`);
      return tasks;

    } catch (error) {
      console.error('❌ [GET_USER] Erreur récupération tâches utilisateur:', error);
      return [];
    }
  }

  /**
   * 👨‍💼 RÉCUPÉRER LES TÂCHES CRÉÉES PAR UN UTILISATEUR
   */
  async getTasksByCreator(userId) {
    try {
      console.log('👨‍💼 [GET_CREATOR] Récupération tâches créées par:', userId);

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('createdBy', '==', userId),
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

      console.log(`✅ [GET_CREATOR] ${tasks.length} tâches créées par l'utilisateur`);
      return tasks;

    } catch (error) {
      console.error('❌ [GET_CREATOR] Erreur récupération tâches créateur:', error);
      return [];
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

      await this.updateTask(taskId, updates);

      console.log('✅ [COMPLETE] Tâche marquée comme terminée');
      return { success: true };

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
        status: taskData.status === 'pending' ? 'todo' : taskData.status,
        updatedAt: serverTimestamp(),
        assignedBy: assignerId
      });

      console.log('✅ [ASSIGN] Tâche assignée avec succès');
      return { success: true };

    } catch (error) {
      console.error('❌ [ASSIGN] Erreur assignation tâche:', error);
      throw error;
    }
  }

  /**
   * 🔓 DÉSASSIGNER UNE TÂCHE D'UN UTILISATEUR
   */
  async unassignTask(taskId, userId) {
    try {
      console.log('🔓 [UNASSIGN] Désassignation tâche:', { taskId, userId });

      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      // Retirer l'utilisateur des assignés
      await updateDoc(taskRef, {
        assignedTo: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });

      console.log('✅ [UNASSIGN] Tâche désassignée avec succès');
      return { success: true };

    } catch (error) {
      console.error('❌ [UNASSIGN] Erreur désassignation tâche:', error);
      throw error;
    }
  }

  /**
   * 📝 SOUMETTRE UNE TÂCHE POUR VALIDATION
   */
  async submitTaskForValidation(taskId, userId, submissionData = {}) {
    try {
      console.log('📝 [SUBMIT] Soumission tâche pour validation:', taskId);

      const updates = {
        status: 'validation_pending',
        submittedForValidation: true,
        submittedAt: serverTimestamp(),
        submittedBy: userId,
        submissionNotes: submissionData.notes || '',
        submissionFiles: submissionData.files || [],
        updatedAt: serverTimestamp()
      };

      await this.updateTask(taskId, updates);

      console.log('✅ [SUBMIT] Tâche soumise pour validation');
      return { success: true };

    } catch (error) {
      console.error('❌ [SUBMIT] Erreur soumission validation:', error);
      throw error;
    }
  }

  /**
   * ✅ VALIDER UNE TÂCHE (ADMIN)
   */
  async validateTask(taskId, validatorId, approved = true, feedback = '') {
    try {
      console.log('✅ [VALIDATE] Validation tâche:', { taskId, approved });

      const updates = {
        status: approved ? 'completed' : 'todo',
        validatedAt: serverTimestamp(),
        validatedBy: validatorId,
        validationApproved: approved,
        validationFeedback: feedback,
        submittedForValidation: false,
        updatedAt: serverTimestamp()
      };

      if (approved) {
        updates.completedAt = serverTimestamp();
        updates.completedBy = updates.submittedBy || null;
      }

      await this.updateTask(taskId, updates);

      console.log('✅ [VALIDATE] Tâche validée:', approved ? 'Approuvée' : 'Rejetée');
      return { success: true, approved };

    } catch (error) {
      console.error('❌ [VALIDATE] Erreur validation tâche:', error);
      throw error;
    }
  }

  /**
   * 📊 STATISTIQUES GÉNÉRALES DES TÂCHES
   */
  async getTaskStats(userId = null) {
    try {
      console.log('📊 [STATS] Calcul statistiques générales');

      let tasks = [];
      
      if (userId) {
        tasks = await this.getUserTasks(userId);
      } else {
        tasks = await this.getAllTasks();
      }

      const stats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo' || t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        validationPending: tasks.filter(t => t.status === 'validation_pending').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        withProject: tasks.filter(t => t.projectId).length,
        withoutProject: tasks.filter(t => !t.projectId).length,
        totalXP: tasks.reduce((sum, task) => sum + (task.xpReward || 0), 0),
        completionRate: tasks.length > 0 ? 
          Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
      };

      console.log('✅ [STATS] Statistiques calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ [STATS] Erreur calcul statistiques:', error);
      return {
        total: 0,
        todo: 0,
        inProgress: 0,
        validationPending: 0,
        completed: 0,
        withProject: 0,
        withoutProject: 0,
        totalXP: 0,
        completionRate: 0
      };
    }
  }

  /**
   * 🔍 RECHERCHER DES TÂCHES
   */
  async searchTasks(searchTerm, filters = {}) {
    try {
      console.log('🔍 [SEARCH] Recherche tâches:', searchTerm);

      // Récupérer toutes les tâches pour filtrage local
      const allTasks = await this.getAllTasks();
      
      let filteredTasks = allTasks;

      // Filtre par terme de recherche
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        filteredTasks = filteredTasks.filter(task => 
          task.title.toLowerCase().includes(term) ||
          task.description?.toLowerCase().includes(term) ||
          task.tags?.some(tag => tag.toLowerCase().includes(term))
        );
      }

      // Filtre par projet
      if (filters.projectId) {
        filteredTasks = filteredTasks.filter(task => task.projectId === filters.projectId);
      }

      // Filtre par statut
      if (filters.status) {
        filteredTasks = filteredTasks.filter(task => task.status === filters.status);
      }

      // Filtre par priorité
      if (filters.priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
      }

      // Filtre par assigné
      if (filters.assignedTo) {
        filteredTasks = filteredTasks.filter(task => 
          task.assignedTo && task.assignedTo.includes(filters.assignedTo)
        );
      }

      console.log(`✅ [SEARCH] ${filteredTasks.length} tâches trouvées`);
      return filteredTasks;

    } catch (error) {
      console.error('❌ [SEARCH] Erreur recherche tâches:', error);
      return [];
    }
  }

  /**
   * 📅 RÉCUPÉRER LES TÂCHES PAR ÉCHÉANCE
   */
  async getTasksByDueDate(daysAhead = 7) {
    try {
      console.log('📅 [DUE_DATE] Récupération tâches avec échéance');

      const allTasks = await this.getAllTasks();
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + daysAhead);

      const tasksWithDueDate = allTasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= now && dueDate <= futureDate;
      });

      // Trier par date d'échéance
      tasksWithDueDate.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      console.log(`✅ [DUE_DATE] ${tasksWithDueDate.length} tâches avec échéance trouvées`);
      return tasksWithDueDate;

    } catch (error) {
      console.error('❌ [DUE_DATE] Erreur récupération tâches échéance:', error);
      return [];
    }
  }

  /**
   * ⚠️ RÉCUPÉRER LES TÂCHES EN RETARD
   */
  async getOverdueTasks() {
    try {
      console.log('⚠️ [OVERDUE] Récupération tâches en retard');

      const allTasks = await this.getAllTasks();
      const now = new Date();

      const overdueTasks = allTasks.filter(task => {
        if (!task.dueDate || task.status === 'completed') return false;
        const dueDate = new Date(task.dueDate);
        return dueDate < now;
      });

      console.log(`⚠️ [OVERDUE] ${overdueTasks.length} tâches en retard trouvées`);
      return overdueTasks;

    } catch (error) {
      console.error('❌ [OVERDUE] Erreur récupération tâches retard:', error);
      return [];
    }
  }
}

// ✅ INSTANCE UNIQUE DU SERVICE
const taskService = new TaskService();

// ✅ EXPORTS
export default TaskService;
export { taskService };
