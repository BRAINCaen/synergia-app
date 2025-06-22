// ==========================================
// 📁 react-app/src/core/services/taskService.js
// Service Firebase COMPLET pour les tâches - RÉCUPÉRATION TOTALE
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  writeBatch,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import gamificationService from './gamificationService.js';

// Collections Firestore
const COLLECTIONS = {
  TASKS: 'tasks',
  ACTIVITIES: 'activities',
  USERS: 'users'
};

class TaskService {

  /**
   * 🎯 COMPLÉTER UNE TÂCHE AVEC XP AUTOMATIQUE
   */
  async completeTask(taskId, additionalData = {}) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      console.log('🎯 Complétion tâche:', taskId, 'par:', currentUser.email);

      // 1. Récupérer les détails de la tâche
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskSnap.data();
      
      // Vérifier que la tâche n'est pas déjà terminée
      if (taskData.status === 'completed') {
        console.warn('⚠️ Tâche déjà terminée');
        return { success: false, error: 'Tâche déjà terminée' };
      }

      // 2. Déterminer la difficulté et les XP
      const difficulty = this.determineDifficulty(taskData, additionalData);
      const xpReward = this.getXPReward(difficulty);

      // 3. Marquer la tâche comme terminée
      const now = new Date();
      const updates = {
        status: 'completed',
        completedAt: now,
        completedBy: currentUser.uid,
        updatedAt: now,
        difficulty: difficulty,
        xpRewarded: xpReward,
        ...additionalData
      };

      await updateDoc(taskRef, updates);

      // 4. 🎮 AJOUTER XP ET RÉCOMPENSES
      const gamificationResult = await gamificationService.addXP(
        currentUser.uid,
        xpReward,
        'task_complete',
        {
          taskId,
          difficulty,
          taskTitle: taskData.title,
          taskCategory: taskData.category,
          timeSpent: additionalData.timeSpent || 0
        }
      );

      // 5. Créer l'historique d'activité
      await this.createActivityLog({
        userId: currentUser.uid,
        type: 'task_completed',
        taskId,
        taskTitle: taskData.title,
        xpGained: gamificationResult.success ? gamificationResult.xpGain : 0,
        timestamp: now,
        metadata: {
          difficulty,
          xpReward,
          originalTask: taskData
        }
      });

      console.log('✅ Tâche complétée avec succès:', {
        taskId,
        xpGained: gamificationResult.success ? gamificationResult.xpGain : 0,
        levelUp: gamificationResult.success ? gamificationResult.leveledUp : false,
        difficulty
      });

      return {
        success: true,
        taskId,
        taskData: { ...taskData, ...updates },
        gamification: gamificationResult,
        xpGained: gamificationResult.success ? gamificationResult.xpGain : 0,
        difficulty,
        message: `Tâche "${taskData.title}" terminée ! +${gamificationResult.success ? gamificationResult.xpGain : 0} XP`
      };

    } catch (error) {
      console.error('❌ Erreur complétion tâche:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 DÉTERMINER LA DIFFICULTÉ D'UNE TÂCHE
   */
  determineDifficulty(taskData, additionalData = {}) {
    let score = 0;
    
    // Priorité (0-3 points)
    const priority = taskData.priority?.toLowerCase() || 'medium';
    if (priority === 'urgent' || priority === 'critical') score += 4;
    else if (priority === 'high') score += 3;
    else if (priority === 'medium') score += 2;
    else if (priority === 'low') score += 1;
    
    // Complexité (0-3 points)
    const complexity = taskData.complexity?.toLowerCase() || 'medium';
    if (complexity === 'expert' || complexity === 'very_complex') score += 4;
    else if (complexity === 'complex' || complexity === 'hard') score += 3;
    else if (complexity === 'medium' || complexity === 'normal') score += 2;
    else if (complexity === 'simple' || complexity === 'easy') score += 1;
    
    // Temps estimé (0-3 points)
    const estimatedHours = taskData.estimatedHours || additionalData.estimatedHours || 0;
    if (estimatedHours > 16) score += 4;
    else if (estimatedHours > 8) score += 3;
    else if (estimatedHours > 4) score += 2;
    else if (estimatedHours > 1) score += 1;
    
    // Déterminer la difficulté finale
    if (score >= 12) return 'expert';
    else if (score >= 8) return 'hard';
    else if (score >= 4) return 'normal';
    else return 'easy';
  }

  /**
   * 🎯 OBTENIR RÉCOMPENSE XP SELON DIFFICULTÉ
   */
  getXPReward(difficulty) {
    const rewards = {
      'easy': 20,
      'normal': 40,
      'hard': 60,
      'expert': 100
    };
    return rewards[difficulty] || 40;
  }

  /**
   * 📝 CRÉER UNE NOUVELLE TÂCHE
   */
  async createTask(taskData, userId) {
    if (!userId) {
      throw new Error('UserId requis');
    }

    try {
      const now = new Date();
      
      if (!taskData.title || taskData.title.trim() === '') {
        throw new Error('Le titre de la tâche est requis');
      }

      const completeTaskData = {
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        status: 'todo',
        priority: taskData.priority || 'medium',
        category: taskData.category || 'general',
        complexity: taskData.complexity || 'normal',
        type: taskData.type || 'task',
        createdBy: userId,
        assignedTo: taskData.assignedTo || userId,
        estimatedTime: taskData.estimatedTime || 0,
        tags: Array.isArray(taskData.tags) ? taskData.tags : [],
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        startDate: taskData.startDate ? new Date(taskData.startDate) : null,
        createdAt: now,
        updatedAt: now,
        projectId: taskData.projectId || null,
        epicId: taskData.epicId || null,
        xpReward: this.getXPReward(taskData.complexity || 'normal'),
        metadata: {
          source: 'manual_creation',
          version: '3.0',
          createdByEmail: auth.currentUser?.email || 'unknown'
        }
      };

      const tasksCollection = collection(db, COLLECTIONS.TASKS);
      const docRef = await addDoc(tasksCollection, completeTaskData);

      console.log('✅ Tâche créée:', docRef.id, completeTaskData.title);

      await this.createActivityLog({
        userId: userId,
        type: 'task_created',
        taskId: docRef.id,
        taskTitle: completeTaskData.title,
        timestamp: now,
        metadata: { taskData: completeTaskData }
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
   * 📋 RÉCUPÉRER LES TÂCHES D'UN UTILISATEUR
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
      if (filters.priority && filters.priority !== 'all') {
        constraints.splice(-1, 0, where('priority', '==', filters.priority));
      }
      if (filters.category && filters.category !== 'all') {
        constraints.splice(-1, 0, where('category', '==', filters.category));
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
   * 🗑️ SUPPRIMER UNE TÂCHE
   */
  async deleteTask(taskId, userId) {
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

      await deleteDoc(taskRef);

      console.log('✅ Tâche supprimée:', taskId);
      
      await this.createActivityLog({
        userId: userId,
        type: 'task_deleted',
        taskId,
        taskTitle: taskData.title,
        timestamp: new Date(),
        metadata: { deletedTask: taskData }
      });

      return taskId;

    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      throw error;
    }
  }

  /**
   * 📈 STATISTIQUES TÂCHES
   */
  async getTaskStats(userId) {
    try {
      const tasks = await this.getUserTasks(userId);
      
      const now = new Date();
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        todo: tasks.filter(t => t.status === 'todo').length,
        overdue: tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== 'completed').length,
        
        byPriority: {
          urgent: tasks.filter(t => t.priority === 'urgent').length,
          high: tasks.filter(t => t.priority === 'high').length,
          medium: tasks.filter(t => t.priority === 'medium').length,
          low: tasks.filter(t => t.priority === 'low').length
        },
        
        byComplexity: {
          expert: tasks.filter(t => t.complexity === 'expert').length,
          hard: tasks.filter(t => t.complexity === 'hard').length,
          normal: tasks.filter(t => t.complexity === 'normal').length,
          easy: tasks.filter(t => t.complexity === 'easy').length
        },
        
        thisWeek: {
          created: tasks.filter(t => t.createdAt >= thisWeek).length,
          completed: tasks.filter(t => t.completedAt && t.completedAt >= thisWeek).length
        },
        
        thisMonth: {
          created: tasks.filter(t => t.createdAt >= thisMonth).length,
          completed: tasks.filter(t => t.completedAt && t.completedAt >= thisMonth).length
        },
        
        totalXPEarned: tasks
          .filter(t => t.status === 'completed' && t.xpRewarded)
          .reduce((total, task) => total + (task.xpRewarded || 0), 0),
        
        estimatedHours: tasks.reduce((total, task) => total + (task.estimatedTime || 0), 0),
        
        completionRate: tasks.length > 0 ? 
          Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
      };

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

// Service pour les projets
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
        tags: Array.isArray(projectData.tags) ? projectData.tags : [],
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

      const projectsCollection = collection(db, 'projects');
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
   * 📊 RÉCUPÉRER LES PROJETS D'UN UTILISATEUR
   */
  async getUserProjects(userId, filters = {}) {
    if (!userId) {
      throw new Error('Utilisateur non spécifié');
    }

    try {
      const projectsCollection = collection(db, 'projects');
      
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
   * 📊 ÉCOUTER LES PROJETS EN TEMPS RÉEL
   */
  subscribeToUserProjects(userId, callback) {
    const projectsCollection = collection(db, 'projects');
    
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

const taskService = new TaskService();
const projectService = new ProjectService();

export default taskService;
export { TaskService, ProjectService, projectService };
