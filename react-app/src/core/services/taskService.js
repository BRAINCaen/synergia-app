// src/core/services/taskService.js - Vrais services Firebase
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
  limit,
  increment,
  writeBatch,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase.js';

// =============================================================================
// 🎮 XP REWARDS & CALCULATIONS
// =============================================================================

export const XP_REWARDS = {
  // XP par priorité de tâche
  task_completed_low: 15,
  task_completed_medium: 25,
  task_completed_high: 40,
  task_completed_urgent: 60,
  
  // Bonus de performance
  early_completion: 20,        // Terminé avant échéance
  accurate_estimate: 15,       // Estimation temps ±10%
  project_completed: 100,      // Projet entier terminé
  
  // Bonus de régularité
  daily_streak: 10,           // Au moins 1 tâche/jour
  weekly_goal: 50,            // Objectif hebdomadaire atteint
};

// Calcul XP intelligent pour une tâche
export const calculateTaskXP = (task) => {
  let baseXP = XP_REWARDS[`task_completed_${task.priority}`] || 25;
  let bonusXP = 0;
  
  // Bonus completion anticipée
  if (task.dueDate && task.completedAt) {
    const dueDateMs = task.dueDate.toMillis ? task.dueDate.toMillis() : task.dueDate.getTime();
    const completedMs = task.completedAt.toMillis ? task.completedAt.toMillis() : task.completedAt.getTime();
    
    if (completedMs < dueDateMs) {
      bonusXP += XP_REWARDS.early_completion;
    }
  }
  
  // Bonus estimation précise (±10%)
  if (task.estimatedTime && task.actualTime) {
    const accuracy = Math.abs(task.actualTime - task.estimatedTime) / task.estimatedTime;
    if (accuracy <= 0.1) {
      bonusXP += XP_REWARDS.accurate_estimate;
    }
  }
  
  return baseXP + bonusXP;
};

// =============================================================================
// 📋 TASK SERVICE - VRAI FIREBASE
// =============================================================================

export class TaskService {
  static collectionRef = collection(db, 'tasks');

  // ✅ Créer une nouvelle tâche
  static async createTask(taskData, userId) {
    try {
      const now = serverTimestamp();
      
      const newTask = {
        ...taskData,
        assignedTo: taskData.assignedTo || userId,
        createdBy: userId,
        status: 'todo',
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        isXpClaimed: false,
        xpReward: 0, // Sera calculé à la completion
        tags: taskData.tags || [],
        attachments: [],
        comments: []
      };

      // Validation
      this.validateTaskData(newTask);
      
      const docRef = await addDoc(this.collectionRef, newTask);
      
      return { id: docRef.id, ...newTask };
    } catch (error) {
      console.error('Erreur création tâche:', error);
      throw new Error(`Impossible de créer la tâche: ${error.message}`);
    }
  }

  // ✅ Récupérer une tâche par ID
  static async getTask(taskId) {
    try {
      const docRef = doc(db, 'tasks', taskId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Tâche introuvable');
      }
      
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('Erreur récupération tâche:', error);
      throw error;
    }
  }

  // ✅ Récupérer les tâches d'un utilisateur
  static async getUserTasks(userId, filters = {}) {
    try {
      let q = query(
        this.collectionRef,
        where('assignedTo', '==', userId)
      );

      // Filtres optionnels
      if (filters.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }
      
      if (filters.projectId && filters.projectId !== 'all') {
        if (filters.projectId === '') {
          // Tâches sans projet
          q = query(q, where('projectId', '==', null));
        } else {
          q = query(q, where('projectId', '==', filters.projectId));
        }
      }
      
      if (filters.priority && filters.priority !== 'all') {
        q = query(q, where('priority', '==', filters.priority));
      }
      
      // Tri par défaut
      const orderField = filters.orderBy || 'createdAt';
      const orderDirection = filters.orderDirection || 'desc';
      q = query(q, orderBy(orderField, orderDirection));
      
      // Limite optionnelle
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur récupération tâches utilisateur:', error);
      throw error;
    }
  }

  // ✅ Mettre à jour une tâche
  static async updateTask(taskId, updates, userId) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      
      // Vérifier que l'utilisateur peut modifier cette tâche
      const currentTask = await this.getTask(taskId);
      if (currentTask.assignedTo !== userId && currentTask.createdBy !== userId) {
        throw new Error('Vous n\'avez pas les droits pour modifier cette tâche');
      }
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      // Validation des données
      this.validateTaskData(updateData, true);
      
      await updateDoc(taskRef, updateData);
      
      return { id: taskId, ...currentTask, ...updateData };
    } catch (error) {
      console.error('Erreur mise à jour tâche:', error);
      throw error;
    }
  }

  // 🎮 Compléter une tâche avec XP automatique
  static async completeTask(taskId, userId, actualTime = null) {
    try {
      const batch = writeBatch(db);
      const taskRef = doc(db, 'tasks', taskId);
      
      // Récupérer la tâche actuelle
      const currentTask = await this.getTask(taskId);
      
      if (currentTask.status === 'completed') {
        throw new Error('Cette tâche est déjà complétée');
      }
      
      if (currentTask.assignedTo !== userId) {
        throw new Error('Vous ne pouvez compléter que vos propres tâches');
      }
      
      const completedAt = serverTimestamp();
      
      // Calculer l'XP avec les données actuelles + actualTime
      const taskForXP = {
        ...currentTask,
        completedAt: new Date(),
        actualTime
      };
      const xpEarned = calculateTaskXP(taskForXP);
      
      // Mettre à jour la tâche
      batch.update(taskRef, {
        status: 'completed',
        completedAt,
        actualTime,
        xpReward: xpEarned,
        isXpClaimed: true,
        updatedAt: serverTimestamp()
      });
      
      // Ajouter l'XP à l'utilisateur
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, {
        totalXP: increment(xpEarned),
        lastXpGain: {
          amount: xpEarned,
          source: 'task_completed',
          taskId: taskId,
          timestamp: serverTimestamp()
        }
      });
      
      await batch.commit();
      
      return {
        taskId,
        xpEarned,
        completedAt: new Date()
      };
    } catch (error) {
      console.error('Erreur completion tâche:', error);
      throw error;
    }
  }

  // ✅ Supprimer une tâche
  static async deleteTask(taskId, userId) {
    try {
      const task = await this.getTask(taskId);
      
      if (task.createdBy !== userId) {
        throw new Error('Vous ne pouvez supprimer que vos propres tâches');
      }
      
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
      
      return taskId;
    } catch (error) {
      console.error('Erreur suppression tâche:', error);
      throw error;
    }
  }

  // 📊 Statistiques des tâches
  static async getTaskStats(userId, period = 'week') {
    try {
      const tasks = await this.getUserTasks(userId);
      
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0); // Tout
      }
      
      const filteredTasks = tasks.filter(task => {
        const taskDate = task.completedAt?.toDate ? task.completedAt.toDate() : task.completedAt;
        return taskDate && taskDate >= startDate;
      });
      
      return {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        todo: tasks.filter(t => t.status === 'todo').length,
        overdue: tasks.filter(t => {
          if (!t.dueDate || t.status === 'completed') return false;
          const dueDate = t.dueDate.toDate ? t.dueDate.toDate() : t.dueDate;
          return dueDate < now;
        }).length,
        periodCompleted: filteredTasks.filter(t => t.status === 'completed').length,
        totalXpEarned: filteredTasks.reduce((sum, t) => sum + (t.xpReward || 0), 0)
      };
    } catch (error) {
      console.error('Erreur stats tâches:', error);
      throw error;
    }
  }

  // 🔔 Écouter les changements de tâches en temps réel
  static subscribeToUserTasks(userId, callback, filters = {}) {
    let q = query(
      this.collectionRef,
      where('assignedTo', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    if (filters.status && filters.status !== 'all') {
      q = query(q, where('status', '==', filters.status));
    }

    return onSnapshot(q, (querySnapshot) => {
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(tasks);
    }, (error) => {
      console.error('Erreur subscription tâches:', error);
    });
  }

  // ✅ Validation des données de tâche
  static validateTaskData(taskData, isUpdate = false) {
    if (!isUpdate && !taskData.title?.trim()) {
      throw new Error('Le titre de la tâche est requis');
    }
    
    if (taskData.title && taskData.title.length > 100) {
      throw new Error('Le titre ne peut pas dépasser 100 caractères');
    }
    
    if (taskData.description && taskData.description.length > 500) {
      throw new Error('La description ne peut pas dépasser 500 caractères');
    }
    
    if (taskData.estimatedTime && (taskData.estimatedTime < 5 || taskData.estimatedTime > 2880)) {
      throw new Error('Le temps estimé doit être entre 5 minutes et 48 heures');
    }
    
    if (taskData.priority && !['low', 'medium', 'high', 'urgent'].includes(taskData.priority)) {
      throw new Error('Priorité invalide');
    }
    
    if (taskData.status && !['todo', 'in_progress', 'completed', 'archived'].includes(taskData.status)) {
      throw new Error('Statut invalide');
    }
    
    if (taskData.tags && taskData.tags.length > 10) {
      throw new Error('Maximum 10 tags par tâche');
    }
  }
}

// =============================================================================
// 🏗️ PROJECT SERVICE - VRAI FIREBASE
// =============================================================================

export class ProjectService {
  static collectionRef = collection(db, 'projects');

  // ✅ Créer un nouveau projet
  static async createProject(projectData, userId) {
    try {
      const now = serverTimestamp();
      
      const newProject = {
        ...projectData,
        ownerId: userId,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        members: [userId],
        isPublic: projectData.isPublic || false,
        progress: {
          total: 0,
          completed: 0,
          percentage: 0
        },
        tags: projectData.tags || []
      };

      this.validateProjectData(newProject);
      
      const docRef = await addDoc(this.collectionRef, newProject);
      return { id: docRef.id, ...newProject };
    } catch (error) {
      console.error('Erreur création projet:', error);
      throw new Error(`Impossible de créer le projet: ${error.message}`);
    }
  }

  // ✅ Récupérer un projet par ID
  static async getProject(projectId) {
    try {
      const docRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Projet introuvable');
      }
      
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('Erreur récupération projet:', error);
      throw error;
    }
  }

  // ✅ Récupérer les projets d'un utilisateur
  static async getUserProjects(userId, filters = {}) {
    try {
      let q = query(
        this.collectionRef,
        where('members', 'array-contains', userId)
      );

      if (filters.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }
      
      q = query(q, orderBy('updatedAt', 'desc'));
      
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculer la progression pour chaque projet
      for (const project of projects) {
        await this.updateProjectProgress(project.id);
      }

      return projects;
    } catch (error) {
      console.error('Erreur récupération projets utilisateur:', error);
      throw error;
    }
  }

  // 📊 Mettre à jour la progression d'un projet
  static async updateProjectProgress(projectId) {
    try {
      // Récupérer toutes les tâches du projet
      const tasksQuery = query(
        TaskService.collectionRef,
        where('projectId', '==', projectId)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => doc.data());
      
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        progress: {
          total,
          completed,
          percentage
        },
        updatedAt: serverTimestamp()
      });
      
      return { total, completed, percentage };
    } catch (error) {
      console.error('Erreur mise à jour progression:', error);
      throw error;
    }
  }

  // ✅ Validation des données de projet
  static validateProjectData(projectData, isUpdate = false) {
    if (!isUpdate && !projectData.name?.trim()) {
      throw new Error('Le nom du projet est requis');
    }
    
    if (projectData.name && projectData.name.length > 80) {
      throw new Error('Le nom ne peut pas dépasser 80 caractères');
    }
    
    if (projectData.description && projectData.description.length > 300) {
      throw new Error('La description ne peut pas dépasser 300 caractères');
    }
    
    if (projectData.color && !/^#[0-9A-Fa-f]{6}$/.test(projectData.color)) {
      throw new Error('Couleur invalide (format attendu: #RRGGBB)');
    }
    
    if (projectData.status && !['active', 'completed', 'archived', 'on_hold'].includes(projectData.status)) {
      throw new Error('Statut de projet invalide');
    }
  }

  // 🔔 Écouter les changements de projets
  static subscribeToUserProjects(userId, callback) {
    const q = query(
      this.collectionRef,
      where('members', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(projects);
    }, (error) => {
      console.error('Erreur subscription projets:', error);
    });
  }
}

export default {
  TaskService,
  ProjectService,
  XP_REWARDS,
  calculateTaskXP
};
