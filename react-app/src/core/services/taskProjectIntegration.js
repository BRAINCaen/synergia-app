// ==========================================
// 📁 react-app/src/core/services/taskProjectIntegration.js
// CORRECTION - Mise à jour progression projet FORCÉE
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
 * AVEC MISE À JOUR FORCÉE DE LA PROGRESSION
 */
class TaskProjectIntegrationService {
  constructor() {
    this.taskService = taskService;
    this.projectService = projectService;
    console.log('🔗 TaskProjectIntegrationService initialisé avec mise à jour forcée');
  }

  /**
   * 📝 ASSIGNER UNE TÂCHE À UN PROJET AVEC MISE À JOUR FORCÉE
   */
  async assignTaskToProject(taskId, projectId, userId) {
    try {
      console.log(`🔗 Assignation tâche ${taskId} au projet ${projectId}`);
      
      // 1. Vérifier que le projet existe
      const projectData = await this.projectService.getProject(projectId);
      if (!projectData) {
        throw new Error('Projet non trouvé');
      }
      console.log('✅ Projet trouvé:', projectData.title);
      
      // 2. Mettre à jour la tâche avec le projectId
      const updateResult = await this.taskService.updateTask(taskId, {
        projectId: projectId,
        updatedAt: serverTimestamp()
      });
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Erreur mise à jour tâche');
      }
      console.log('✅ Tâche mise à jour avec projectId');
      
      // 3. ✅ MISE À JOUR FORCÉE DE LA PROGRESSION
      const progressResult = await this.forceUpdateProjectProgress(projectId);
      console.log('📊 Résultat mise à jour progression:', progressResult);
      
      return { 
        success: true, 
        error: null,
        progress: progressResult.progress,
        taskCount: progressResult.taskCount
      };
      
    } catch (error) {
      console.error('❌ Erreur assignation tâche à projet:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 MISE À JOUR FORCÉE DE LA PROGRESSION D'UN PROJET
   * Version améliorée qui force la synchronisation
   */
  async forceUpdateProjectProgress(projectId) {
    try {
      console.log(`🔄 FORCE - Mise à jour progression projet ${projectId}`);
      
      // 1. Récupérer TOUTES les tâches du projet avec une requête directe
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      let totalTasks = 0;
      let completedTasks = 0;
      let inProgressTasks = 0;
      let pendingTasks = 0;
      
      const tasksList = [];
      tasksSnapshot.forEach((doc) => {
        const taskData = doc.data();
        tasksList.push({ id: doc.id, ...taskData });
        totalTasks++;
        
        switch (taskData.status) {
          case 'completed':
            completedTasks++;
            break;
          case 'in_progress':
            inProgressTasks++;
            break;
          case 'pending':
          default:
            pendingTasks++;
            break;
        }
      });
      
      // 2. Calculer la progression
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      console.log(`📊 Calcul progression détaillé:`, {
        projectId,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        progress: `${progress}%`,
        tâches: tasksList.map(t => `${t.title} (${t.status})`)
      });
      
      // 3. Mettre à jour le projet avec TOUTES les informations
      const updateData = {
        progress: progress,
        taskCount: totalTasks,
        completedTaskCount: completedTasks,
        inProgressTaskCount: inProgressTasks,
        pendingTaskCount: pendingTasks,
        updatedAt: serverTimestamp(),
        lastProgressUpdate: serverTimestamp(),
        // Statistiques détaillées
        taskBreakdown: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
          pending: pendingTasks,
          completionRate: progress
        }
      };
      
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, updateData);
      
      console.log(`✅ FORCE - Projet ${projectId} mis à jour:`, {
        progress: `${progress}%`,
        tâches: `${completedTasks}/${totalTasks}`,
        détail: updateData.taskBreakdown
      });
      
      return { 
        success: true, 
        progress, 
        taskCount: totalTasks,
        completedCount: completedTasks,
        breakdown: updateData.taskBreakdown,
        error: null 
      };
      
    } catch (error) {
      console.error('❌ FORCE - Erreur mise à jour progression projet:', error);
      return { 
        success: false, 
        progress: 0, 
        taskCount: 0,
        completedCount: 0,
        error: error.message 
      };
    }
  }

  /**
   * 🔄 SYNCHRONISER TOUS LES PROJETS D'UN UTILISATEUR
   * Utile pour réparer les incohérences
   */
  async synchronizeAllUserProjects(userId) {
    try {
      console.log(`🔄 SYNC - Synchronisation de tous les projets pour ${userId}`);
      
      const projects = await this.projectService.getUserProjects(userId);
      const results = [];
      
      for (const project of projects) {
        console.log(`🔄 SYNC - Traitement projet: ${project.title}`);
        const result = await this.forceUpdateProjectProgress(project.id);
        results.push({
          projectId: project.id,
          projectTitle: project.title,
          ...result
        });
      }
      
      console.log('✅ SYNC - Synchronisation terminée:', results);
      return { success: true, results, error: null };
      
    } catch (error) {
      console.error('❌ SYNC - Erreur synchronisation projets:', error);
      return { success: false, results: [], error: error.message };
    }
  }

  /**
   * 🔗 DÉTACHER UNE TÂCHE D'UN PROJET AVEC MISE À JOUR
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
        await this.forceUpdateProjectProgress(projectId);
      }
      
      console.log('✅ Tâche détachée du projet avec succès');
      return { success: true, error: null };
      
    } catch (error) {
      console.error('❌ Erreur détachement tâche du projet:', error);
      return { success: false, error: error.message };
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
      await this.forceUpdateProjectProgress(projectId);
      
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
   * 🛠️ FONCTION DE RÉPARATION MANUELLE
   * À utiliser en cas de problème de synchronisation
   */
  async repairProjectTaskSync(projectId) {
    try {
      console.log(`🛠️ RÉPARATION - Synchronisation projet ${projectId}`);
      
      const result = await this.forceUpdateProjectProgress(projectId);
      
      if (result.success) {
        console.log(`✅ RÉPARATION RÉUSSIE - Projet ${projectId} synchronisé`);
      } else {
        console.error(`❌ RÉPARATION ÉCHOUÉE - Projet ${projectId}:`, result.error);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur réparation:', error);
      return { success: false, error: error.message };
    }
  }
}

// ✅ Export de l'instance singleton
const taskProjectIntegration = new TaskProjectIntegrationService();

export { taskProjectIntegration };
export default taskProjectIntegration;
