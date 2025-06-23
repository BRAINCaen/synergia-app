// ==========================================
// 📁 react-app/src/core/services/taskService.js
// Service complet pour tâches et projets avec Firebase
// ==========================================

import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase.js';

// Collections Firestore
const COLLECTIONS = {
  TASKS: 'tasks',
  USERS: 'users',
  PROJECTS: 'projects',
  ACTIVITIES: 'activities'
};

// Configuration des complexités et XP
const COMPLEXITY_XP = {
  easy: 20,
  medium: 40,
  hard: 60,
  expert: 100
};

// ==========================================
// 📋 SERVICE TÂCHES
// ==========================================

class TaskService {
  /**
   * 📝 CRÉER UNE NOUVELLE TÂCHE
   */
  async createTask(taskData, userId) {
    if (!userId) {
      throw new Error('UserId requis');
    }

    try {
      const now = new Date();
      
      // Déterminer la complexité et calculer l'XP
      const complexity = this.determineDifficulty(taskData);
      const xpReward = this.calculateXP(complexity, taskData);

      const completeTaskData = {
        title: taskData.title?.trim() || '',
        description: taskData.description?.trim() || '',
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        complexity: complexity,
        xpReward: xpReward,
        projectId: taskData.projectId || null,
        assignedTo: taskData.assignedTo || userId,
        createdBy: userId,
        tags: Array.isArray(taskData.tags) ? taskData.tags : [],
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        startDate: taskData.startDate ? new Date(taskData.startDate) : null,
        estimatedTime: taskData.estimatedTime || null,
        createdAt: now,
        updatedAt: now
      };

      const tasksCollection = collection(db, COLLECTIONS.TASKS);
      const docRef = await addDoc(tasksCollection, completeTaskData);

      console.log('✅ Tâche créée:', docRef.id, completeTaskData.title);

      // Créer log d'activité
      await this.createActivityLog({
        userId: userId,
        type: 'task_created',
        taskId: docRef.id,
        timestamp: now,
        metadata: { taskTitle: completeTaskData.title }
      });

      return {
        id: docRef.id,
        ...completeTaskData
      };

    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      throw error;
    }
  }

  /**
   * 📊 RÉCUPÉRER LES TÂCHES D'UN UTILISATEUR
   */
  async getUserTasks(userId, filters = {}) {
    if (!userId) {
      throw new Error('Utilisateur non spécifié');
    }

    try {
      const tasksCollection = collection(db, COLLECTIONS.TASKS);
      
      let constraints = [
        where('assignedTo', '==', userId),
        orderBy('updatedAt', 'desc')
      ];

      if (filters.status && filters.status !== 'all') {
        constraints.splice(-1, 0, where('status', '==', filters.status));
      }

      if (filters.projectId && filters.projectId !== 'all') {
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

      console.log(`📋 ${tasks.length} tâche(s) récupérée(s) pour`, userId);
      return tasks;

    } catch (error) {
      console.error('❌ Erreur récupération tâches:', error);
      return [];
    }
  }

  /**
   * ✏️ METTRE À JOUR UNE TÂCHE
   */
  async updateTask(taskId, updates, userId) {
    if (!userId) {
      throw new Error('UserId requis');
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
        lastUpdatedBy: userId
      };

      Object.keys(cleanUpdates).forEach(key => {
        if (cleanUpdates[key] === undefined) {
          delete cleanUpdates[key];
        }
      });

      await updateDoc(taskRef, cleanUpdates);

      console.log('✅ Tâche mise à jour:', taskId);
      
      await this.createActivityLog({
        userId: userId,
        type: 'task_updated',
        taskId,
        timestamp: new Date(),
        metadata: { updates: cleanUpdates }
      });

      return { 
        id: taskId, 
        ...taskSnap.data(), 
        ...cleanUpdates 
      };

    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      throw error;
    }
  }

  /**
   * ✅ COMPLÉTER UNE TÂCHE AVEC XP
   */
  async completeTask(taskId, userId) {
    if (!userId) {
      throw new Error('UserId requis');
    }

    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskSnap.data();
      const now = new Date();

      // Mettre à jour la tâche
      await updateDoc(taskRef, {
        status: 'completed',
        completedAt: now,
        updatedAt: now
      });

      console.log('✅ Tâche complétée:', taskData.title);

      // Log d'activité
      await this.createActivityLog({
        userId: userId,
        type: 'task_completed',
        taskId,
        timestamp: now,
        metadata: { 
          taskTitle: taskData.title,
          xpGained: taskData.xpReward || 0
        }
      });

      return {
        task: { id: taskId, ...taskData, status: 'completed', completedAt: now },
        xpGain: taskData.xpReward || 0
      };

    } catch (error) {
      console.error('❌ Erreur completion tâche:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UNE TÂCHE
   */
  async deleteTask(taskId, userId) {
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskSnap.data();
      
      // Vérifier les permissions
      if (taskData.createdBy !== userId && taskData.assignedTo !== userId) {
        throw new Error('Permissions insuffisantes pour supprimer cette tâche');
      }

      await deleteDoc(taskRef);

      console.log('✅ Tâche supprimée:', taskId);

      await this.createActivityLog({
        userId: userId,
        type: 'task_deleted',
        taskId,
        timestamp: new Date(),
        metadata: { taskTitle: taskData.title }
      });

      return { success: true, taskId };

    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      throw error;
    }
  }

  /**
   * 🎯 DÉTERMINER LA DIFFICULTÉ D'UNE TÂCHE
   */
  determineDifficulty(taskData) {
    let score = 0;

    // Facteurs de complexité
    if (taskData.description && taskData.description.length > 100) score += 1;
    if (taskData.estimatedTime && taskData.estimatedTime > 480) score += 1; // > 8h
    if (taskData.priority === 'high' || taskData.priority === 'urgent') score += 1;
    if (taskData.tags && taskData.tags.length > 3) score += 1;

    // Déterminer la complexité
    if (score >= 3) return 'expert';
    if (score >= 2) return 'hard';
    if (score >= 1) return 'medium';
    return 'easy';
  }

  /**
   * 🎯 CALCULER L'XP SELON LA COMPLEXITÉ
   */
  calculateXP(complexity, taskData) {
    let baseXP = COMPLEXITY_XP[complexity] || COMPLEXITY_XP.medium;
    
    // Bonus selon priorité
    if (taskData.priority === 'urgent') baseXP *= 1.2;
    else if (taskData.priority === 'high') baseXP *= 1.1;
    
    return Math.round(baseXP);
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DES TÂCHES
   */
  async getTaskStats(userId) {
    try {
      const tasks = await this.getUserTasks(userId);
      
      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        todo: tasks.filter(t => t.status === 'todo').length,
        overdue: 0,
        totalXPEarned: 0,
        completionRate: 0
      };

      const now = new Date();
      tasks.forEach(task => {
        if (task.dueDate && task.status !== 'completed') {
          const dueDate = new Date(task.dueDate);
          if (dueDate < now) stats.overdue++;
        }
        
        if (task.status === 'completed' && task.xpReward) {
          stats.totalXPEarned += task.xpReward;
        }
      });

      stats.completionRate = tasks.length > 0 ? 
        Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0;

      return stats;

    } catch (error) {
      console.error('❌ Erreur statistiques tâches:', error);
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
        overdue: 0,
        totalXPEarned: 0,
        completionRate: 0
      };
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

    if (filters.status && filters.status !== 'all') {
      constraints.splice(-1, 0, where('status', '==', filters.status));
    }

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

// ==========================================
// 📁 SERVICE PROJETS
// ==========================================

class ProjectService {
  /**
   * 📁 CRÉER UN NOUVEAU PROJET
   */
  async createProject(projectData, userId) {
    if (!userId) {
      throw new Error('UserId requis');
    }

    try {
      const now = new Date();
      
      const completeProjectData = {
        name: projectData.name?.trim() || '',
        description: projectData.description?.trim() || '',
        status: projectData.status || 'active',
        icon: projectData.icon || '📁',
        color: projectData.color || '#3b82f6',
        priority: projectData.priority || 'medium',
        tags: Array.isArray(projectData.tags) ? projectData.tags : [],
        deadline: projectData.deadline ? new Date(projectData.deadline) : null,
        budget: projectData.budget ? parseFloat(projectData.budget) : null,
        progress: {
          completed: 0,
          total: 0,
          percentage: 0
        },
        createdBy: userId,
        members: [userId],
        createdAt: now,
        updatedAt: now
      };

      const projectsCollection = collection(db, COLLECTIONS.PROJECTS);
      const docRef = await addDoc(projectsCollection, completeProjectData);

      console.log('✅ Projet créé:', docRef.id, completeProjectData.name);

      return {
        id: docRef.id,
        ...completeProjectData
      };

    } catch (error) {
      console.error('❌ Erreur création projet:', error);
      throw error;
    }
  }

  /**
   * ✏️ METTRE À JOUR UN PROJET
   */
  async updateProject(projectId, updates) {
    try {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
      
      // Vérifier que le projet existe
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) {
        throw new Error('Projet introuvable');
      }

      // Préparer les données de mise à jour
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      // Nettoyer les valeurs undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      // Mettre à jour dans Firebase
      await updateDoc(projectRef, updateData);

      console.log('✅ Projet mis à jour:', projectId);
      
      // Retourner les données mises à jour
      return {
        id: projectId,
        ...projectSnap.data(),
        ...updateData
      };

    } catch (error) {
      console.error('❌ Erreur mise à jour projet:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UN PROJET
   */
  async deleteProject(projectId, userId) {
    try {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
      
      // Vérifier que le projet existe et que l'utilisateur a les droits
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) {
        throw new Error('Projet introuvable');
      }

      const projectData = projectSnap.data();
      
      // Vérifier que l'utilisateur est créateur ou membre
      if (projectData.createdBy !== userId && !projectData.members?.includes(userId)) {
        throw new Error('Permissions insuffisantes pour supprimer ce projet');
      }

      // Supprimer le projet
      await deleteDoc(projectRef);

      console.log('✅ Projet supprimé:', projectId);

      // Gérer les tâches liées
      await this.handleProjectDeletion(projectId);

      return { success: true, projectId };

    } catch (error) {
      console.error('❌ Erreur suppression projet:', error);
      throw error;
    }
  }

  /**
   * 📊 RÉCUPÉRER LES PROJETS D'UN UTILISATEUR
   */
  async getUserProjects(userId, filters = {}) {
    if (!userId) {
      throw new Error('Utilisateur non spécifié');
    }

    try {
      const projectsCollection = collection(db, COLLECTIONS.PROJECTS);
      
      let constraints = [
        where('members', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      ];

      if (filters.status && filters.status !== 'all') {
        constraints.splice(-1, 0, where('status', '==', filters.status));
      }

      const q = query(projectsCollection, ...constraints);
      const querySnapshot = await getDocs(q);
      const projects = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projects.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
        });
      });

      console.log(`📁 ${projects.length} projet(s) récupéré(s) pour`, userId);
      return projects;

    } catch (error) {
      console.error('❌ Erreur récupération projets:', error);
      return [];
    }
  }

  /**
   * 📊 METTRE À JOUR LA PROGRESSION D'UN PROJET
   */
  async updateProjectProgress(projectId) {
    try {
      // Récupérer toutes les tâches du projet
      const tasksQuery = query(
        collection(db, COLLECTIONS.TASKS),
        where('projectId', '==', projectId)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      
      let totalTasks = 0;
      let completedTasks = 0;
      
      tasksSnapshot.forEach((doc) => {
        totalTasks++;
        const taskData = doc.data();
        if (taskData.status === 'completed') {
          completedTasks++;
        }
      });

      const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const progressData = {
        completed: completedTasks,
        total: totalTasks,
        percentage: percentage
      };

      // Mettre à jour le projet
      await this.updateProject(projectId, {
        progress: progressData
      });

      console.log(`📊 Progression projet ${projectId} mise à jour: ${percentage}%`);
      
      return progressData;

    } catch (error) {
      console.error('❌ Erreur mise à jour progression:', error);
      throw error;
    }
  }

  /**
   * 👥 AJOUTER UN MEMBRE AU PROJET
   */
  async addProjectMember(projectId, userId, memberUserId) {
    try {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error('Projet introuvable');
      }

      const projectData = projectSnap.data();
      
      // Vérifier les permissions
      if (projectData.createdBy !== userId && !projectData.members?.includes(userId)) {
        throw new Error('Permissions insuffisantes');
      }

      // Vérifier que le membre n'est pas déjà ajouté
      if (projectData.members?.includes(memberUserId)) {
        throw new Error('Utilisateur déjà membre du projet');
      }

      // Ajouter le membre
      await updateDoc(projectRef, {
        members: arrayUnion(memberUserId),
        updatedAt: new Date()
      });

      console.log(`👥 Membre ${memberUserId} ajouté au projet ${projectId}`);
      
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur ajout membre:', error);
      throw error;
    }
  }

  /**
   * 👥 RETIRER UN MEMBRE DU PROJET
   */
  async removeProjectMember(projectId, userId, memberUserId) {
    try {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error('Projet introuvable');
      }

      const projectData = projectSnap.data();
      
      // Vérifier les permissions (seul le créateur peut retirer des membres)
      if (projectData.createdBy !== userId) {
        throw new Error('Seul le créateur peut retirer des membres');
      }

      // Ne pas permettre de retirer le créateur
      if (memberUserId === projectData.createdBy) {
        throw new Error('Impossible de retirer le créateur du projet');
      }

      // Retirer le membre
      await updateDoc(projectRef, {
        members: arrayRemove(memberUserId),
        updatedAt: new Date()
      });

      console.log(`👥 Membre ${memberUserId} retiré du projet ${projectId}`);
      
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur retrait membre:', error);
      throw error;
    }
  }

  /**
   * 🗑️ GÉRER LA SUPPRESSION DU PROJET (tâches liées)
   */
  async handleProjectDeletion(projectId) {
    try {
      // Récupérer toutes les tâches du projet
      const tasksQuery = query(
        collection(db, COLLECTIONS.TASKS),
        where('projectId', '==', projectId)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      
      // Déplacer les tâches vers "Aucun projet" (recommandé)
      const updatePromises = [];
      tasksSnapshot.forEach((doc) => {
        updatePromises.push(
          updateDoc(doc.ref, {
            projectId: null,
            updatedAt: new Date()
          })
        );
      });
      await Promise.all(updatePromises);

      console.log(`🔄 ${tasksSnapshot.size} tâche(s) transférée(s) depuis le projet supprimé`);

    } catch (error) {
      console.error('❌ Erreur gestion suppression projet:', error);
      // Ne pas faire échouer la suppression du projet pour ça
    }
  }

  /**
   * 📊 ÉCOUTER LES PROJETS EN TEMPS RÉEL
   */
  subscribeToUserProjects(userId, callback) {
    const projectsCollection = collection(db, COLLECTIONS.PROJECTS);
    
    const q = query(
      projectsCollection,
      where('members', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const projects = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projects.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
        });
      });
      
      console.log(`🔄 Projets mis à jour: ${projects.length}`);
      callback(projects);
    }, (error) => {
      console.error('❌ Erreur écoute projets:', error);
    });
  }
}

// ==========================================
// 📤 EXPORTS
// ==========================================

const taskService = new TaskService();
const projectService = new ProjectService();

export default taskService;
export { TaskService, ProjectService, projectService };
