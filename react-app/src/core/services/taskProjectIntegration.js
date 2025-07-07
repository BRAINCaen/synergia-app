// ==========================================
// 📁 react-app/src/core/services/taskProjectIntegration.js
// Service d'intégration tâches-projets CORRIGÉ - Fix erreur constructor
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
import { taskService, projectService } from './index.js';

/**
 * 🔗 SERVICE D'INTÉGRATION TÂCHES-PROJETS
 * Gère la liaison entre les tâches et les projets
 */
class TaskProjectIntegrationService {
  constructor() {
    // ✅ CORRECTION : Utiliser les instances directement, pas de new
    this.taskService = taskService;
    this.projectService = projectService;
    console.log('🔗 TaskProjectIntegrationService initialisé - Fix constructor');
  }

  /**
   * 📝 ASSIGNER UNE TÂCHE À UN PROJET
   */
  async assignTaskToProject(taskId, projectId, userId) {
    try {
      console.log(`🔗 Assignation tâche ${taskId} au projet ${projectId}`);
      
      // Vérifier que l'utilisateur a accès au projet
      const projectDoc = await this.projectService.getProject(projectId);
      if (!projectDoc) {
        throw new Error('Projet non trouvé');
      }
      
      // Mettre à jour la tâche avec le projectId
      await this.taskService.updateTask(taskId, {
        projectId: projectId,
        updatedAt: serverTimestamp()
      });
      
      // Mettre à jour la progression du projet
      await this.updateProjectProgress(projectId);
      
      console.log('✅ Tâche assignée au projet avec succès');
      return true;
      
    } catch (error) {
      console.error('❌ Erreur assignation tâche à projet:', error);
      throw error;
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
      const projectId = task?.projectId;
      
      // Mettre à jour la tâche (retirer le projectId)
      await this.taskService.updateTask(taskId, {
        projectId: null,
        updatedAt: serverTimestamp()
      });
      
      // Mettre à jour la progression du projet si applicable
      if (projectId) {
        await this.updateProjectProgress(projectId);
      }
      
      console.log('✅ Tâche détachée du projet avec succès');
      return true;
      
    } catch (error) {
      console.error('❌ Erreur détachement tâche du projet:', error);
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
      
      tasksSnapshot.forEach((doc) => {
        const taskData = doc.data();
        totalTasks++;
        if (taskData.status === 'completed') {
          completedTasks++;
        }
      });
      
      // Calculer le pourcentage de progression
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Mettre à jour le projet
      await updateDoc(doc(db, 'projects', projectId), {
        progress: progress,
        taskCount: totalTasks,
        completedTaskCount: completedTasks,
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Progression projet ${projectId} mise à jour: ${progress}%`);
      return progress;
      
    } catch (error) {
      console.error('❌ Erreur mise à jour progression projet:', error);
      throw error;
    }
  }

  /**
   * 📝 ASSIGNER PLUSIEURS TÂCHES À UN PROJET
   */
  async assignMultipleTasksToProject(taskIds, projectId, userId) {
    try {
      console.log(`🔗 Assignation multiple: ${taskIds.length} tâches au projet ${projectId}`);
      
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
      
      // Mettre à jour la progression du projet
      await this.updateProjectProgress(projectId);
      
      console.log('✅ Assignation multiple terminée avec succès');
      return true;
      
    } catch (error) {
      console.error('❌ Erreur assignation multiple:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES D'INTÉGRATION
   */
  async getIntegrationStats(userId) {
    try {
      // Récupérer toutes les tâches de l'utilisateur
      const userTasks = await this.taskService.getUserTasks(userId);
      
      // Calculer les statistiques
      const stats = {
        totalTasks: userTasks.length,
        assignedTasks: userTasks.filter(task => task.projectId).length,
        unassignedTasks: userTasks.filter(task => !task.projectId).length,
        assignmentRate: userTasks.length > 0 ? 
          Math.round((userTasks.filter(task => task.projectId).length / userTasks.length) * 100) : 0
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
}

// ✅ Export de l'instance singleton
const taskProjectIntegration = new TaskProjectIntegrationService();

export { taskProjectIntegration };
export default taskProjectIntegration;
