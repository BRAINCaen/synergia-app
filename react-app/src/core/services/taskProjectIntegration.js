// ==========================================
// 📁 react-app/src/core/services/taskProjectIntegration.js
// SERVICE D'INTÉGRATION TÂCHES-PROJETS
// ==========================================

import { 
  collection, 
  doc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { taskService } from './taskService.js';
import { projectService } from './projectService.js';

/**
 * 🔗 SERVICE D'INTÉGRATION TÂCHES-PROJETS
 */
class TaskProjectIntegration {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * 🔄 ASSIGNER UNE TÂCHE EXISTANTE À UN PROJET
   */
  async assignTaskToProject(taskId, projectId, userId) {
    try {
      console.log(`🔗 Attribution tâche ${taskId} au projet ${projectId}`);
      
      // Mettre à jour la tâche
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        projectId: projectId,
        updatedAt: serverTimestamp(),
        assignedToProjectAt: serverTimestamp(),
        assignedToProjectBy: userId
      });
      
      // Recalculer la progression du projet
      await this.updateProjectProgress(projectId);
      
      console.log('✅ Tâche assignée au projet avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur assignation tâche à projet:', error);
      throw error;
    }
  }

  /**
   * 🔄 RETIRER UNE TÂCHE D'UN PROJET
   */
  async removeTaskFromProject(taskId, userId) {
    try {
      console.log(`🗑️ Retrait tâche ${taskId} de son projet`);
      
      // Récupérer l'ancien projectId pour mise à jour
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await taskRef.get();
      const oldProjectId = taskSnap.data()?.projectId;
      
      // Mettre à jour la tâche
      await updateDoc(taskRef, {
        projectId: null,
        updatedAt: serverTimestamp(),
        removedFromProjectAt: serverTimestamp(),
        removedFromProjectBy: userId
      });
      
      // Recalculer la progression de l'ancien projet
      if (oldProjectId) {
        await this.updateProjectProgress(oldProjectId);
      }
      
      console.log('✅ Tâche retirée du projet avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur retrait tâche du projet:', error);
      throw error;
    }
  }

  /**
   * 📊 METTRE À JOUR LA PROGRESSION D'UN PROJET
   */
  async updateProjectProgress(projectId) {
    try {
      // Récupérer toutes les tâches du projet
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      
      let totalTasks = 0;
      let completedTasks = 0;
      let inProgressTasks = 0;
      let todoTasks = 0;
      
      tasksSnapshot.forEach((doc) => {
        const task = doc.data();
        totalTasks++;
        
        switch (task.status) {
          case 'completed':
            completedTasks++;
            break;
          case 'in_progress':
            inProgressTasks++;
            break;
          case 'todo':
          default:
            todoTasks++;
            break;
        }
      });
      
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Mettre à jour le projet
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        progress: progress,
        taskCount: totalTasks,
        completedTaskCount: completedTasks,
        inProgressTaskCount: inProgressTasks,
        todoTaskCount: todoTasks,
        updatedAt: serverTimestamp(),
        lastProgressUpdate: serverTimestamp()
      });
      
      console.log(`📊 Progression projet ${projectId} mise à jour: ${progress}%`);
      
      return { 
        success: true, 
        progress,
        stats: { totalTasks, completedTasks, inProgressTasks, todoTasks }
      };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour progression projet:', error);
      throw error;
    }
  }

  /**
   * 📋 OBTENIR LES TÂCHES D'UN PROJET AVEC DÉTAILS
   */
  async getProjectTasks(projectId) {
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      
      tasksSnapshot.forEach((doc) => {
        tasks.push({ 
          id: doc.id, 
          ...doc.data(),
          projectAssigned: true
        });
      });
      
      return tasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches projet:', error);
      return [];
    }
  }

  /**
   * 📋 OBTENIR LES TÂCHES NON ASSIGNÉES D'UN UTILISATEUR
   */
  async getUnassignedTasks(userId) {
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('createdBy', '==', userId),
        where('projectId', '==', null)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      
      tasksSnapshot.forEach((doc) => {
        tasks.push({ 
          id: doc.id, 
          ...doc.data(),
          projectAssigned: false
        });
      });
      
      return tasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches non assignées:', error);
      return [];
    }
  }

  /**
   * 🔄 SYNCHRONISER TOUTES LES PROGRESSIONS
   */
  async syncAllProjectsProgress(userId) {
    try {
      console.log('🔄 Synchronisation progression tous projets...');
      
      // Récupérer tous les projets de l'utilisateur
      const projects = await projectService.getUserProjects(userId);
      
      const syncPromises = projects.map(project => 
        this.updateProjectProgress(project.id)
      );
      
      await Promise.all(syncPromises);
      
      console.log(`✅ ${projects.length} projets synchronisés`);
      return { success: true, projectsCount: projects.length };
      
    } catch (error) {
      console.error('❌ Erreur synchronisation projets:', error);
      throw error;
    }
  }

  /**
   * 🔄 ASSIGNATION EN MASSE DE TÂCHES
   */
  async bulkAssignTasksToProject(taskIds, projectId, userId) {
    try {
      console.log(`🔄 Assignation en masse: ${taskIds.length} tâches → projet ${projectId}`);
      
      const batch = writeBatch(db);
      
      taskIds.forEach(taskId => {
        const taskRef = doc(db, 'tasks', taskId);
        batch.update(taskRef, {
          projectId: projectId,
          updatedAt: serverTimestamp(),
          assignedToProjectAt: serverTimestamp(),
          assignedToProjectBy: userId
        });
      });
      
      await batch.commit();
      
      // Mettre à jour la progression du projet
      await this.updateProjectProgress(projectId);
      
      console.log(`✅ ${taskIds.length} tâches assignées au projet`);
      return { success: true, taskCount: taskIds.length };
      
    } catch (error) {
      console.error('❌ Erreur assignation en masse:', error);
      throw error;
    }
  }

  /**
   * 🎧 ÉCOUTER LES CHANGEMENTS DE TÂCHES D'UN PROJET
   */
  subscribeToProjectTasks(projectId, callback) {
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );

      const unsubscribe = onSnapshot(tasksQuery, (querySnapshot) => {
        const tasks = [];
        querySnapshot.forEach((doc) => {
          tasks.push({ id: doc.id, ...doc.data() });
        });
        
        // Recalculer automatiquement la progression
        this.updateProjectProgress(projectId).catch(console.error);
        
        callback(tasks);
      });

      this.listeners.set(`project-${projectId}`, unsubscribe);
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur écoute tâches projet:', error);
      callback([]);
      return () => {};
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES D'INTÉGRATION
   */
  async getIntegrationStats(userId) {
    try {
      const [allTasks, projects] = await Promise.all([
        taskService.getUserTasks(userId),
        projectService.getUserProjects(userId)
      ]);
      
      const assignedTasks = allTasks.filter(task => task.projectId);
      const unassignedTasks = allTasks.filter(task => !task.projectId);
      
      const tasksByProject = {};
      assignedTasks.forEach(task => {
        if (!tasksByProject[task.projectId]) {
          tasksByProject[task.projectId] = [];
        }
        tasksByProject[task.projectId].push(task);
      });
      
      return {
        totalTasks: allTasks.length,
        assignedTasks: assignedTasks.length,
        unassignedTasks: unassignedTasks.length,
        totalProjects: projects.length,
        assignmentRate: allTasks.length > 0 ? 
          Math.round((assignedTasks.length / allTasks.length) * 100) : 0,
        tasksByProject,
        projectsWithTasks: Object.keys(tasksByProject).length
      };
      
    } catch (error) {
      console.error('❌ Erreur calcul statistiques intégration:', error);
      return {
        totalTasks: 0,
        assignedTasks: 0,
        unassignedTasks: 0,
        totalProjects: 0,
        assignmentRate: 0,
        tasksByProject: {},
        projectsWithTasks: 0
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
  }
}

// Export du service
const taskProjectIntegration = new TaskProjectIntegration();
export { taskProjectIntegration };
export default taskProjectIntegration;
