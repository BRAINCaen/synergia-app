// ==========================================
// 📁 react-app/src/core/services/taskProjectIntegration.js
// Service d'intégration tâches-projets RÉPARÉ pour le build
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

// ✅ IMPORT CORRIGÉ : Utiliser l'export de l'index.js
import { taskService as TaskService, projectService as ProjectService } from './index.js';

/**
 * 🔗 SERVICE D'INTÉGRATION TÂCHES-PROJETS
 * Gère la liaison entre les tâches et les projets
 */
class TaskProjectIntegrationService {
  constructor() {
    // Créer des instances des services
    this.taskService = new TaskService();
    this.projectService = new ProjectService();
    console.log('🔗 TaskProjectIntegrationService initialisé');
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
      await this.projectService.updateProjectProgress(projectId);
      
      console.log('✅ Tâche assignée au projet avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur assignation tâche-projet:', error);
      throw error;
    }
  }

  /**
   * 🔄 RETIRER UNE TÂCHE D'UN PROJET
   */
  async removeTaskFromProject(taskId) {
    try {
      console.log(`🔄 Retrait tâche ${taskId} de son projet`);
      
      // Récupérer la tâche pour connaître le projectId
      const taskQuery = query(
        collection(db, 'tasks'),
        where('__name__', '==', taskId)
      );
      
      const taskSnapshot = await getDocs(taskQuery);
      if (taskSnapshot.empty) {
        throw new Error('Tâche non trouvée');
      }
      
      const taskData = taskSnapshot.docs[0].data();
      const oldProjectId = taskData.projectId;
      
      // Mettre à jour la tâche pour retirer le projectId
      await this.taskService.updateTask(taskId, {
        projectId: null,
        updatedAt: serverTimestamp()
      });
      
      // Mettre à jour la progression de l'ancien projet
      if (oldProjectId) {
        await this.projectService.updateProjectProgress(oldProjectId);
      }
      
      console.log('✅ Tâche retirée du projet avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur retrait tâche-projet:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER TOUTES LES TÂCHES D'UN PROJET
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
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate() || null
        });
      });
      
      console.log(`📋 ${tasks.length} tâches trouvées pour le projet ${projectId}`);
      return tasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches projet:', error);
      return [];
    }
  }

  /**
   * 📊 CALCULER LES STATISTIQUES D'UN PROJET
   */
  async getProjectTaskStats(projectId) {
    try {
      const tasks = await this.getProjectTasks(projectId);
      
      const stats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        validation_pending: tasks.filter(t => t.status === 'validation_pending').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        rejected: tasks.filter(t => t.status === 'rejected').length
      };
      
      // Calculer le pourcentage de progression
      stats.progressPercentage = stats.total > 0 ? 
        Math.round((stats.completed / stats.total) * 100) : 0;
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur calcul stats projet:', error);
      return {
        total: 0, todo: 0, in_progress: 0, validation_pending: 0, 
        completed: 0, rejected: 0, progressPercentage: 0
      };
    }
  }

  /**
   * 🎯 MARQUER UNE TÂCHE DE PROJET COMME TERMINÉE
   */
  async completeProjectTask(taskId, completionData) {
    try {
      console.log(`🎯 Completion tâche projet ${taskId}`);
      
      // Marquer la tâche comme terminée
      const result = await this.taskService.completeTask(taskId, completionData);
      
      if (result.success) {
        // Récupérer le projectId de la tâche
        const taskQuery = query(
          collection(db, 'tasks'),
          where('__name__', '==', taskId)
        );
        
        const taskSnapshot = await getDocs(taskQuery);
        if (!taskSnapshot.empty) {
          const taskData = taskSnapshot.docs[0].data();
          if (taskData.projectId) {
            // Mettre à jour la progression du projet
            await this.projectService.updateProjectProgress(taskData.projectId);
          }
        }
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur completion tâche projet:', error);
      throw error;
    }
  }

  /**
   * 🔄 SYNCHRONISER TOUS LES PROJETS
   * Met à jour la progression de tous les projets basée sur leurs tâches
   */
  async syncAllProjects(userId) {
    try {
      console.log('🔄 Synchronisation de tous les projets...');
      
      // Récupérer tous les projets de l'utilisateur
      const userProjects = await this.projectService.getUserProjects(userId);
      
      const batch = writeBatch(db);
      let updateCount = 0;
      
      for (const project of userProjects) {
        try {
          const stats = await this.getProjectTaskStats(project.id);
          
          // Préparer les mises à jour
          const projectRef = doc(db, 'projects', project.id);
          batch.update(projectRef, {
            progress: stats.progressPercentage,
            taskCount: stats.total,
            completedTaskCount: stats.completed,
            updatedAt: serverTimestamp()
          });
          
          updateCount++;
          
        } catch (projectError) {
          console.error(`❌ Erreur sync projet ${project.id}:`, projectError);
        }
      }
      
      // Exécuter le batch
      if (updateCount > 0) {
        await batch.commit();
        console.log(`✅ ${updateCount} projets synchronisés`);
      }
      
      return { success: true, updated: updateCount };
      
    } catch (error) {
      console.error('❌ Erreur synchronisation projets:', error);
      throw error;
    }
  }

  /**
   * 📅 RÉCUPÉRER LES TÂCHES DE PROJET AVEC ÉCHÉANCES
   */
  async getProjectTasksWithDeadlines(projectId) {
    try {
      const tasks = await this.getProjectTasks(projectId);
      
      // Filtrer et trier par échéance
      const tasksWithDeadlines = tasks
        .filter(task => task.dueDate && task.status !== 'completed')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      
      // Categoriser par urgence
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
      const oneWeekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      const categorized = {
        overdue: tasksWithDeadlines.filter(t => new Date(t.dueDate) < now),
        urgent: tasksWithDeadlines.filter(t => {
          const dueDate = new Date(t.dueDate);
          return dueDate >= now && dueDate <= threeDaysFromNow;
        }),
        upcoming: tasksWithDeadlines.filter(t => {
          const dueDate = new Date(t.dueDate);
          return dueDate > threeDaysFromNow && dueDate <= oneWeekFromNow;
        }),
        later: tasksWithDeadlines.filter(t => new Date(t.dueDate) > oneWeekFromNow)
      };
      
      return categorized;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches avec échéances:', error);
      return { overdue: [], urgent: [], upcoming: [], later: [] };
    }
  }
}

// Instance singleton
const taskProjectIntegration = new TaskProjectIntegrationService();

// Exports
export { taskProjectIntegration };
export default taskProjectIntegration;
