// ==========================================
// 📁 react-app/src/core/services/taskProjectIntegration.js
// SERVICE COMPLET AVEC TOUTES LES MÉTHODES MANQUANTES
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
 * 🔗 SERVICE D'INTÉGRATION TÂCHES-PROJETS COMPLET
 * Toutes les méthodes nécessaires pour l'interface
 */
class TaskProjectIntegrationService {
  constructor() {
    this.taskService = taskService;
    this.projectService = projectService;
    console.log('🔗 TaskProjectIntegrationService initialisé - Version complète');
  }

  /**
   * 📝 ASSIGNER UNE TÂCHE À UN PROJET
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
      
      // 3. Mise à jour forcée de la progression
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
   * ❌ RETIRER UNE TÂCHE D'UN PROJET (MÉTHODE MANQUANTE)
   */
  async removeTaskFromProject(taskId, userId) {
    try {
      console.log(`❌ Suppression tâche ${taskId} du projet`);
      
      // Récupérer la tâche pour obtenir le projectId avant suppression
      const task = await this.taskService.getTask(taskId);
      if (!task) {
        throw new Error('Tâche non trouvée');
      }
      
      const projectId = task.projectId;
      console.log(`📂 Tâche "${task.title}" sera retirée du projet ${projectId}`);
      
      // Mettre à jour la tâche (retirer le projectId)
      const updateResult = await this.taskService.updateTask(taskId, {
        projectId: null,
        removedFromProject: projectId,
        removedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Erreur mise à jour tâche');
      }
      
      console.log('✅ Tâche retirée du projet');
      
      // Mettre à jour la progression du projet
      if (projectId) {
        const progressResult = await this.forceUpdateProjectProgress(projectId);
        console.log('📊 Progression projet mise à jour après suppression:', progressResult);
      }
      
      console.log('✅ Tâche retirée du projet avec succès');
      return { 
        success: true, 
        error: null,
        message: `Tâche retirée du projet avec succès`
      };
      
    } catch (error) {
      console.error('❌ Erreur suppression tâche du projet:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 ALIAS pour compatibilité (même fonction, nom différent)
   */
  async unassignTaskFromProject(taskId, userId) {
    return this.removeTaskFromProject(taskId, userId);
  }

  /**
   * 📊 MISE À JOUR FORCÉE DE LA PROGRESSION D'UN PROJET
   */
  async forceUpdateProjectProgress(projectId) {
    try {
      console.log(`🔄 FORCE - Mise à jour progression projet ${projectId}`);
      
      // 1. Récupérer TOUTES les tâches du projet
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
        progress: `${progress}%`,
        tâches: tasksList.map(t => `${t.title} (${t.status})`)
      });
      
      // 3. Mettre à jour le projet
      const updateData = {
        progress: progress,
        taskCount: totalTasks,
        completedTaskCount: completedTasks,
        inProgressTaskCount: inProgressTasks,
        pendingTaskCount: pendingTasks,
        updatedAt: serverTimestamp(),
        lastProgressUpdate: serverTimestamp()
      };
      
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, updateData);
      
      console.log(`✅ FORCE - Projet ${projectId} mis à jour: ${progress}% (${completedTasks}/${totalTasks})`);
      
      return { 
        success: true, 
        progress, 
        taskCount: totalTasks,
        completedCount: completedTasks,
        error: null 
      };
      
    } catch (error) {
      console.error('❌ FORCE - Erreur mise à jour progression projet:', error);
      return { 
        success: false, 
        progress: 0, 
        taskCount: 0,
        error: error.message 
      };
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
   * ❌ RETIRER PLUSIEURS TÂCHES D'UN PROJET
   */
  async removeMultipleTasksFromProject(taskIds, userId) {
    try {
      console.log(`❌ Suppression multiple: ${taskIds.length} tâches de leurs projets`);
      
      const batch = writeBatch(db);
      const affectedProjects = new Set();
      
      // Récupérer les projets affectés avant suppression
      for (const taskId of taskIds) {
        const task = await this.taskService.getTask(taskId);
        if (task && task.projectId) {
          affectedProjects.add(task.projectId);
        }
        
        // Mettre à jour la tâche
        const taskRef = doc(db, 'tasks', taskId);
        batch.update(taskRef, {
          projectId: null,
          removedFromProjectAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
      console.log('✅ Batch suppression terminé');
      
      // Mettre à jour la progression de tous les projets affectés
      for (const projectId of affectedProjects) {
        await this.forceUpdateProjectProgress(projectId);
      }
      
      console.log('✅ Suppression multiple terminée avec succès');
      return { success: true, error: null };
      
    } catch (error) {
      console.error('❌ Erreur suppression multiple:', error);
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
   * 🔄 SYNCHRONISER TOUS LES PROJETS D'UN UTILISATEUR
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
   * 🔄 DÉPLACER UNE TÂCHE D'UN PROJET À UN AUTRE
   */
  async moveTaskBetweenProjects(taskId, fromProjectId, toProjectId, userId) {
    try {
      console.log(`🔄 Déplacement tâche ${taskId} du projet ${fromProjectId} vers ${toProjectId}`);
      
      // Vérifier que le projet de destination existe
      const toProject = await this.projectService.getProject(toProjectId);
      if (!toProject) {
        throw new Error('Projet de destination non trouvé');
      }
      
      // Mettre à jour la tâche
      const updateResult = await this.taskService.updateTask(taskId, {
        projectId: toProjectId,
        previousProjectId: fromProjectId,
        movedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Erreur mise à jour tâche');
      }
      
      // Mettre à jour les deux projets
      await Promise.all([
        this.forceUpdateProjectProgress(fromProjectId),
        this.forceUpdateProjectProgress(toProjectId)
      ]);
      
      console.log('✅ Tâche déplacée avec succès');
      return { success: true, error: null };
      
    } catch (error) {
      console.error('❌ Erreur déplacement tâche:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🛠️ FONCTION DE RÉPARATION MANUELLE
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

  /**
   * 📊 OBTENIR UN RÉSUMÉ COMPLET DES PROJETS ET TÂCHES
   */
  async getProjectTaskSummary(userId) {
    try {
      console.log(`📊 Génération résumé complet pour ${userId}`);
      
      const [projects, tasks] = await Promise.all([
        this.projectService.getUserProjects(userId),
        this.taskService.getUserTasks(userId)
      ]);
      
      const summary = {
        totalProjects: projects.length,
        totalTasks: tasks.length,
        assignedTasks: tasks.filter(t => t.projectId).length,
        unassignedTasks: tasks.filter(t => !t.projectId).length,
        projects: projects.map(project => {
          const projectTasks = tasks.filter(t => t.projectId === project.id);
          const completedTasks = projectTasks.filter(t => t.status === 'completed');
          
          return {
            id: project.id,
            title: project.title,
            status: project.status,
            storedProgress: project.progress || 0,
            storedTaskCount: project.taskCount || 0,
            actualTaskCount: projectTasks.length,
            actualCompletedCount: completedTasks.length,
            actualProgress: projectTasks.length > 0 ? 
              Math.round((completedTasks.length / projectTasks.length) * 100) : 0,
            needsSync: (project.taskCount || 0) !== projectTasks.length
          };
        })
      };
      
      console.log('📊 Résumé généré:', summary);
      return summary;
      
    } catch (error) {
      console.error('❌ Erreur génération résumé:', error);
      return null;
    }
  }
}

// ✅ Export de l'instance singleton
const taskProjectIntegration = new TaskProjectIntegrationService();

export { taskProjectIntegration };
export default taskProjectIntegration;
