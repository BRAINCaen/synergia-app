// ==========================================
// 📁 react-app/src/core/services/taskProjectIntegration.js
// SERVICE INTÉGRATION TÂCHES-PROJETS COMPLET CORRIGÉ
// ==========================================

import { 
  collection, 
  doc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase.js';

// ✅ IMPORT CORRIGÉ : Utiliser les instances directement
import { taskService } from './taskService.js';
import { projectService } from './projectService.js';

/**
 * 🔗 SERVICE D'INTÉGRATION TÂCHES-PROJETS CORRIGÉ
 */
class TaskProjectIntegrationService {
  constructor() {
    // ✅ CORRECTION : Utiliser les instances directement
    this.taskService = taskService;
    this.projectService = projectService;
    console.log('🔗 TaskProjectIntegrationService initialisé avec services corrects');
  }

  /**
   * 📝 ASSIGNER UNE TÂCHE À UN PROJET
   */
  async assignTaskToProject(taskId, projectId, userId) {
    try {
      console.log(`🔗 Assignation tâche ${taskId} au projet ${projectId}`);
      
      // ✅ CORRECTION : Utiliser la méthode getProject qui existe maintenant
      const projectData = await this.projectService.getProject(projectId);
      if (!projectData) {
        throw new Error('Projet non trouvé');
      }
      
      console.log('✅ Projet trouvé:', projectData.title);
      
      // ✅ CORRECTION : Utiliser updateTask correctement
      const updateResult = await this.taskService.updateTask(taskId, {
        projectId: projectId,
        updatedAt: serverTimestamp()
      });
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Erreur mise à jour tâche');
      }
      
      console.log('✅ Tâche mise à jour avec projectId');
      
      // Mettre à jour la progression du projet
      await this.updateProjectProgress(projectId);
      
      console.log('✅ Tâche assignée au projet avec succès');
      return { success: true, error: null };
      
    } catch (error) {
      console.error('❌ Erreur assignation tâche à projet:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔗 DÉTACHER UNE TÂCHE D'UN PROJET
   */
  async unassignTaskFromProject(taskId, userId) {
    try {
      console.log(`🔗 Détachement tâche ${taskId} du projet`);
      
      // Récupérer la tâche pour obtenir le projectId
      const task = await this.taskService.getTask(taskId);
      if (!task) {
        throw new Error('Tâche non trouvée');
      }
      
      const projectId = task.projectId;
      
      // Mettre à jour la tâche (retirer le projectId)
      const updateResult = await this.taskService.updateTask(taskId, {
        projectId: null,
        updatedAt: serverTimestamp()
      });
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Erreur mise à jour tâche');
      }
      
      // Mettre à jour la progression du projet si applicable
      if (projectId) {
        await this.updateProjectProgress(projectId);
      }
      
      console.log('✅ Tâche détachée du projet avec succès');
      return { success: true, error: null };
      
    } catch (error) {
      console.error('❌ Erreur détachement tâche du projet:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 METTRE À JOUR LA PROGRESSION D'UN PROJET
   */
  async updateProjectProgress(projectId) {
    try {
      console.log(`📊 Mise à jour progression projet ${projectId}`);
      
      // Récupérer toutes les tâches du projet
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      let totalTasks = 0;
      let completedTasks = 0;
      
      tasksSnapshot.forEach((doc) => {
        const taskData = doc.data();
        totalTasks++;
        if (taskData.status === 'completed') {
          completedTasks++;
        }
      });
      
      // Calculer le pourcentage de progression
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      console.log(`📊 Progression calculée: ${completedTasks}/${totalTasks} = ${progress}%`);
      
      // Mettre à jour le projet
      const updateResult = await this.projectService.updateProject(projectId, {
        progress: progress,
        taskCount: totalTasks,
        completedTaskCount: completedTasks,
        updatedAt: serverTimestamp()
      });
      
      if (updateResult.success) {
        console.log(`✅ Progression projet ${projectId} mise à jour: ${progress}%`);
        return { success: true, progress, error: null };
      } else {
        throw new Error(updateResult.error);
      }
      
    } catch (error) {
      console.error('❌ Erreur mise à jour progression projet:', error);
      return { success: false, progress: 0, error: error.message };
    }
  }

  /**
   * 📝 ASSIGNER PLUSIEURS TÂCHES À UN PROJET
   */
  async assignMultipleTasksToProject(taskIds, projectId, userId) {
    try {
      console.log(`🔗 Assignation multiple: ${taskIds.length} tâches au projet ${projectId}`);
      
      // Vérifier que le projet existe
      const projectData = await this.projectService.getProject(projectId);
      if (!projectData) {
        throw new Error('Projet non trouvé');
      }
      
      const batch = writeBatch(db);
      
      // Mettre à jour toutes les tâches en lot
      for (const taskId of taskIds) {
        const taskRef = doc(db, 'tasks', taskId);
        batch.update(taskRef, {
          projectId: projectId,
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
      console.log('✅ Batch update terminé');
      
      // Mettre à jour la progression du projet
      await this.updateProjectProgress(projectId);
      
      console.log('✅ Assignation multiple terminée avec succès');
      return { success: true, error: null };
      
    } catch (error) {
      console.error('❌ Erreur assignation multiple:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES D'INTÉGRATION
   */
  async getIntegrationStats(userId) {
    try {
      console.log(`📊 Récupération stats intégration pour ${userId}`);
      
      // Récupérer toutes les tâches de l'utilisateur
      const userTasks = await this.taskService.getUserTasks(userId);
      
      if (!userTasks || userTasks.length === 0) {
        return {
          totalTasks: 0,
          assignedTasks: 0,
          unassignedTasks: 0,
          assignmentRate: 0
        };
      }
      
      // Calculer les statistiques
      const assignedTasks = userTasks.filter(task => task.projectId && task.projectId !== null);
      const unassignedTasks = userTasks.filter(task => !task.projectId || task.projectId === null);
      
      const stats = {
        totalTasks: userTasks.length,
        assignedTasks: assignedTasks.length,
        unassignedTasks: unassignedTasks.length,
        assignmentRate: userTasks.length > 0 ? 
          Math.round((assignedTasks.length / userTasks.length) * 100) : 0
      };
      
      console.log('📊 Statistiques d\'intégration:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur récupération statistiques intégration:', error);
      return {
        totalTasks: 0,
        assignedTasks: 0,
        unassignedTasks: 0,
        assignmentRate: 0
      };
    }
  }

  /**
   * 📋 OBTENIR TOUTES LES TÂCHES D'UN PROJET
   */
  async getProjectTasks(projectId) {
    try {
      console.log(`📋 Récupération tâches du projet ${projectId}`);
      
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      
      tasksSnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`📋 Tâches du projet ${projectId}:`, tasks.length);
      return tasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches du projet:', error);
      return [];
    }
  }

  /**
   * 📋 OBTENIR TOUS LES PROJETS AVEC LEURS TÂCHES
   */
  async getProjectsWithTasks(userId) {
    try {
      console.log(`📋 Récupération projets avec tâches pour ${userId}`);
      
      // Récupérer les projets de l'utilisateur
      const projects = await this.projectService.getUserProjects(userId);
      
      // Pour chaque projet, récupérer ses tâches
      const projectsWithTasks = await Promise.all(
        projects.map(async (project) => {
          const tasks = await this.getProjectTasks(project.id);
          return {
            ...project,
            tasks: tasks,
            actualTaskCount: tasks.length,
            actualCompletedCount: tasks.filter(t => t.status === 'completed').length
          };
        })
      );
      
      console.log(`📋 Projets avec tâches récupérés:`, projectsWithTasks.length);
      return projectsWithTasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération projets avec tâches:', error);
      return [];
    }
  }

  /**
   * 🔄 SYNCHRONISER TOUS LES PROJETS
   * Recalcule la progression de tous les projets d'un utilisateur
   */
  async synchronizeAllProjects(userId) {
    try {
      console.log(`🔄 Synchronisation de tous les projets pour ${userId}`);
      
      const projects = await this.projectService.getUserProjects(userId);
      const results = [];
      
      for (const project of projects) {
        const result = await this.updateProjectProgress(project.id);
        results.push({
          projectId: project.id,
          projectTitle: project.title,
          ...result
        });
      }
      
      console.log('✅ Synchronisation terminée:', results);
      return { success: true, results, error: null };
      
    } catch (error) {
      console.error('❌ Erreur synchronisation projets:', error);
      return { success: false, results: [], error: error.message };
    }
  }
}

// ✅ Export de l'instance singleton
const taskProjectIntegration = new TaskProjectIntegrationService();

export { taskProjectIntegration };
export default taskProjectIntegration;
