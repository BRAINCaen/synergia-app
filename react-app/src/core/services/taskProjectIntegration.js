// ==========================================
// 📁 react-app/src/core/services/taskProjectIntegration.js
// SERVICE D'INTÉGRATION FINAL - Sans dépendance getTask
// ==========================================

import { 
  collection, 
  doc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  getDoc,
  serverTimestamp,
  writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase.js';

// ✅ IMPORT CORRIGÉ : Utiliser les instances directement
import { taskService } from './taskService.js';
import { projectService } from './projectService.js';

/**
 * 🔗 SERVICE D'INTÉGRATION TÂCHES-PROJETS FINAL
 * Version robuste sans dépendance à getTask
 */
class TaskProjectIntegrationService {
  constructor() {
    this.taskService = taskService;
    this.projectService = projectService;
    console.log('🔗 TaskProjectIntegrationService initialisé - Version FINALE');
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
   * ❌ RETIRER UNE TÂCHE D'UN PROJET (VERSION CORRIGÉE SANS getTask)
   */
  async removeTaskFromProject(taskId, userId) {
    try {
      console.log(`🗑️ Retrait tâche ${taskId} du projet`);
      
      // ✅ NOUVELLE APPROCHE : Récupérer la tâche directement via Firebase
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tâche non trouvée');
      }
      
      const taskData = taskSnap.data();
      const projectId = taskData.projectId;
      
      console.log(`📂 Tâche "${taskData.title}" sera retirée du projet ${projectId}`);
      
      // ✅ MISE À JOUR DIRECTE : Retirer le projectId
      await updateDoc(taskRef, {
        projectId: null,
        removedFromProject: projectId,
        removedAt: serverTimestamp(),
        removedBy: userId,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Tâche retirée du projet dans Firebase');
      
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
   * 🔄 ALIAS pour compatibilité
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
   * ❌ RETIRER PLUSIEURS TÂCHES DE LEURS PROJETS
   */
  async removeMultipleTasksFromProjects(taskIds, userId) {
    try {
      console.log(`❌ Suppression multiple: ${taskIds.length} tâches de leurs projets`);
      
      const batch = writeBatch(db);
      const affectedProjects = new Set();
      
      // Récupérer les projets affectés avant suppression
      for (const taskId of taskIds) {
        const taskRef = doc(db, 'tasks', taskId);
        const taskSnap = await getDoc(taskRef);
        
        if (taskSnap.exists()) {
          const taskData = taskSnap.data();
          if (taskData.projectId) {
            affectedProjects.add(taskData.projectId);
          }
          
          // Mettre à jour la tâche
          batch.update(taskRef, {
            projectId: null,
            removedFromProjectAt: serverTimestamp(),
            removedBy: userId,
            updatedAt: serverTimestamp()
          });
        }
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
}

// ✅ Export de l'instance singleton
const taskProjectIntegration = new TaskProjectIntegrationService();

export { taskProjectIntegration };
export default taskProjectIntegration;
