// ==========================================
// 📁 react-app/src/core/services/taskProjectIntegration.js
// SERVICE D'INTÉGRATION CORRIGÉ - Toutes méthodes présentes
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
 * 🔗 SERVICE D'INTÉGRATION TÂCHES-PROJETS CORRIGÉ
 * Version robuste avec toutes les méthodes nécessaires
 */
class TaskProjectIntegrationService {
  constructor() {
    this.taskService = taskService;
    this.projectService = projectService;
    console.log('🔗 TaskProjectIntegrationService initialisé - Version CORRIGÉE');
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
      
      // 3. Mettre à jour la progression du projet
      await this.updateProjectProgress(projectId);
      
      console.log('✅ Assignation terminée avec succès');
      return { success: true, error: null };
      
    } catch (error) {
      console.error('❌ Erreur assignation tâche au projet:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ RETIRER UNE TÂCHE D'UN PROJET
   */
  async removeTaskFromProject(taskId, userId) {
    try {
      console.log(`🗑️ Retrait tâche ${taskId} de son projet`);
      
      // Récupérer la tâche pour connaître le projet
      const task = await this.taskService.getTask(taskId);
      if (!task) {
        throw new Error('Tâche non trouvée');
      }
      
      const previousProjectId = task.projectId;
      
      // Retirer le projectId de la tâche
      const updateResult = await this.taskService.updateTask(taskId, {
        projectId: null,
        updatedAt: serverTimestamp()
      });
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Erreur mise à jour tâche');
      }
      console.log('✅ Tâche retirée du projet');
      
      // Mettre à jour la progression de l'ancien projet
      if (previousProjectId) {
        await this.updateProjectProgress(previousProjectId);
      }
      
      console.log('✅ Retrait terminé avec succès');
      return { success: true, error: null };
      
    } catch (error) {
      console.error('❌ Erreur retrait tâche du projet:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 METTRE À JOUR LA PROGRESSION D'UN PROJET
   * ✅ MÉTHODE CORRIGÉE QUI ÉTAIT MANQUANTE
   */
  async updateProjectProgress(projectId) {
    try {
      console.log(`📊 Mise à jour progression projet ${projectId}`);
      
      if (!projectId) {
        console.warn('⚠️ ProjectId manquant pour mise à jour progression');
        return { success: false, error: 'ProjectId manquant' };
      }

      // 1. Récupérer toutes les tâches du projet
      const projectTasks = await this.getProjectTasks(projectId);
      
      // 2. Calculer les statistiques
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(task => 
        task.status === 'completed' || task.status === 'done'
      ).length;
      
      const progressPercentage = totalTasks > 0 ? 
        Math.round((completedTasks / totalTasks) * 100) : 0;

      // 3. Mettre à jour le projet
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        'progress.completed': completedTasks,
        'progress.total': totalTasks,
        'progress.percentage': progressPercentage,
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Progression mise à jour: ${completedTasks}/${totalTasks} (${progressPercentage}%)`);
      
      return { 
        success: true, 
        progress: {
          completed: completedTasks,
          total: totalTasks,
          percentage: progressPercentage
        }
      };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour progression projet:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 FORCER LA MISE À JOUR DE LA PROGRESSION
   * Alternative robuste en cas d'échec de la méthode principale
   */
  async forceUpdateProjectProgress(projectId) {
    try {
      console.log(`🔄 FORCE - Mise à jour progression projet ${projectId}`);
      
      // Vérifier que le projet existe
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        console.warn(`⚠️ Projet ${projectId} non trouvé`);
        return { success: false, error: 'Projet non trouvé' };
      }

      // Calculer la progression
      const result = await this.updateProjectProgress(projectId);
      
      if (result.success) {
        console.log('✅ FORCE - Mise à jour réussie');
      } else {
        console.warn('⚠️ FORCE - Mise à jour échouée:', result.error);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ FORCE - Erreur mise à jour progression:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ SUPPRIMER PLUSIEURS TÂCHES D'UN PROJET
   */
  async removeMultipleTasksFromProject(taskIds, userId) {
    try {
      console.log(`🗑️ Suppression multiple: ${taskIds.length} tâche(s)`);
      
      const batch = writeBatch(db);
      const affectedProjects = new Set();
      
      // Traiter chaque tâche
      for (const taskId of taskIds) {
        const task = await this.taskService.getTask(taskId);
        if (task && task.projectId) {
          affectedProjects.add(task.projectId);
          
          // Ajouter au batch
          const taskRef = doc(db, 'tasks', taskId);
          batch.update(taskRef, {
            projectId: null,
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

  /**
   * 🧮 CALCULER LES MÉTRIQUES D'UN PROJET
   */
  async calculateProjectMetrics(projectId) {
    try {
      const tasks = await this.getProjectTasks(projectId);
      
      const metrics = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        totalXp: tasks.reduce((sum, task) => sum + (task.xpReward || 0), 0),
        completedXp: tasks
          .filter(t => t.status === 'completed')
          .reduce((sum, task) => sum + (task.xpReward || 0), 0)
      };
      
      metrics.completionRate = metrics.totalTasks > 0 ? 
        Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0;
      
      return metrics;
      
    } catch (error) {
      console.error('❌ Erreur calcul métriques projet:', error);
      return null;
    }
  }
}

// ✅ Export de l'instance singleton
const taskProjectIntegration = new TaskProjectIntegrationService();

export { taskProjectIntegration };
export default taskProjectIntegration;
