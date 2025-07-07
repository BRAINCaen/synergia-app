// ==========================================
// 📁 react-app/src/core/services/taskProjectIntegration.js
// VERSION SAFE - Pour éviter les crashes lors de l'assignation
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

/**
 * 🔗 SERVICE D'INTÉGRATION TÂCHES-PROJETS VERSION SAFE
 * Version ultra-robuste qui ne crashe jamais
 */
class TaskProjectIntegrationService {
  constructor() {
    console.log('🔗 TaskProjectIntegrationService initialisé - Version SAFE');
  }

  /**
   * 📝 ASSIGNER UNE TÂCHE À UN PROJET - VERSION SAFE
   */
  async assignTaskToProject(taskId, projectId, userId) {
    try {
      console.log(`🔗 [SAFE] Assignation tâche ${taskId} au projet ${projectId}`);
      
      if (!taskId || !projectId || !userId) {
        throw new Error('Paramètres manquants pour l\'assignation');
      }

      // 1. Vérifier que la tâche existe
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tâche non trouvée');
      }
      
      console.log('✅ [SAFE] Tâche trouvée');

      // 2. Vérifier que le projet existe
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error('Projet non trouvé');
      }
      
      console.log('✅ [SAFE] Projet trouvé');

      // 3. Mettre à jour la tâche avec le projectId de façon SAFE
      const updateData = {
        projectId: projectId,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      };

      await updateDoc(taskRef, updateData);
      console.log('✅ [SAFE] Tâche mise à jour avec projectId');
      
      // 4. Mettre à jour la progression du projet de façon SAFE
      try {
        await this.updateProjectProgressSafe(projectId);
        console.log('✅ [SAFE] Progression projet mise à jour');
      } catch (progressError) {
        console.warn('⚠️ [SAFE] Erreur mise à jour progression (non-bloquante):', progressError.message);
        // On continue même si la progression échoue
      }
      
      console.log('✅ [SAFE] Assignation terminée avec succès');
      return { success: true, error: null };
      
    } catch (error) {
      console.error('❌ [SAFE] Erreur assignation tâche au projet:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ RETIRER UNE TÂCHE D'UN PROJET - VERSION SAFE
   */
  async removeTaskFromProject(taskId, userId) {
    try {
      console.log(`🗑️ [SAFE] Retrait tâche ${taskId} de son projet`);
      
      if (!taskId || !userId) {
        throw new Error('Paramètres manquants pour le retrait');
      }

      // 1. Récupérer la tâche
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tâche non trouvée');
      }

      const taskData = taskSnap.data();
      const previousProjectId = taskData.projectId;
      
      console.log('✅ [SAFE] Tâche trouvée, projectId actuel:', previousProjectId);

      // 2. Retirer le projectId de la tâche
      const updateData = {
        projectId: null,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      };

      await updateDoc(taskRef, updateData);
      console.log('✅ [SAFE] ProjectId retiré de la tâche');
      
      // 3. Mettre à jour la progression de l'ancien projet de façon SAFE
      if (previousProjectId) {
        try {
          await this.updateProjectProgressSafe(previousProjectId);
          console.log('✅ [SAFE] Progression ancien projet mise à jour');
        } catch (progressError) {
          console.warn('⚠️ [SAFE] Erreur mise à jour progression (non-bloquante):', progressError.message);
          // On continue même si la progression échoue
        }
      }
      
      console.log('✅ [SAFE] Retrait terminé avec succès');
      return { success: true, error: null };
      
    } catch (error) {
      console.error('❌ [SAFE] Erreur retrait tâche du projet:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 METTRE À JOUR LA PROGRESSION D'UN PROJET - VERSION ULTRA-SAFE
   */
  async updateProjectProgressSafe(projectId) {
    try {
      console.log(`📊 [SAFE] Mise à jour progression projet ${projectId}`);
      
      if (!projectId) {
        console.warn('⚠️ [SAFE] ProjectId manquant pour mise à jour progression');
        return { success: false, error: 'ProjectId manquant' };
      }

      // 1. Récupérer toutes les tâches du projet de façon SAFE
      let projectTasks = [];
      try {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('projectId', '==', projectId)
        );
        
        const tasksSnapshot = await getDocs(tasksQuery);
        projectTasks = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`✅ [SAFE] ${projectTasks.length} tâches trouvées pour le projet`);
      } catch (tasksError) {
        console.error('❌ [SAFE] Erreur récupération tâches projet:', tasksError);
        return { success: false, error: 'Erreur récupération tâches' };
      }
      
      // 2. Calculer les statistiques de façon SAFE
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(task => {
        const status = task.status || '';
        return status === 'completed' || status === 'done';
      }).length;
      
      const progressPercentage = totalTasks > 0 ? 
        Math.round((completedTasks / totalTasks) * 100) : 0;

      console.log(`📊 [SAFE] Stats: ${completedTasks}/${totalTasks} (${progressPercentage}%)`);

      // 3. Mettre à jour le projet de façon SAFE
      try {
        const projectRef = doc(db, 'projects', projectId);
        const progressData = {
          totalTasks,
          completedTasks,
          progressPercentage,
          lastUpdated: serverTimestamp()
        };

        await updateDoc(projectRef, progressData);
        console.log('✅ [SAFE] Progression projet mise à jour avec succès');
        
        return { 
          success: true, 
          data: progressData 
        };
        
      } catch (updateError) {
        console.error('❌ [SAFE] Erreur mise à jour document projet:', updateError);
        return { success: false, error: 'Erreur mise à jour document' };
      }
      
    } catch (error) {
      console.error('❌ [SAFE] Erreur générale mise à jour progression:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📋 RÉCUPÉRER LES TÂCHES D'UN PROJET - VERSION SAFE
   */
  async getProjectTasks(projectId) {
    try {
      console.log(`📋 [SAFE] Récupération tâches du projet ${projectId}`);
      
      if (!projectId) {
        console.warn('⚠️ [SAFE] ProjectId manquant');
        return [];
      }

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ [SAFE] ${tasks.length} tâches récupérées`);
      return tasks;
      
    } catch (error) {
      console.error('❌ [SAFE] Erreur récupération tâches projet:', error);
      return [];
    }
  }

  /**
   * 📊 RÉCUPÉRER LES STATISTIQUES D'INTÉGRATION - VERSION SAFE
   */
  async getIntegrationStats(userId) {
    try {
      console.log(`📊 [SAFE] Récupération stats intégration pour ${userId}`);
      
      if (!userId) {
        return {
          totalTasks: 0,
          tasksWithProject: 0,
          tasksWithoutProject: 0,
          integrationRate: 0
        };
      }

      // Récupérer toutes les tâches de l'utilisateur
      const userTasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId)
      );
      
      const tasksSnapshot = await getDocs(userTasksQuery);
      const allTasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const totalTasks = allTasks.length;
      const tasksWithProject = allTasks.filter(task => task.projectId).length;
      const tasksWithoutProject = totalTasks - tasksWithProject;
      const integrationRate = totalTasks > 0 ? 
        Math.round((tasksWithProject / totalTasks) * 100) : 0;
      
      const stats = {
        totalTasks,
        tasksWithProject,
        tasksWithoutProject,
        integrationRate
      };
      
      console.log('✅ [SAFE] Stats intégration:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ [SAFE] Erreur stats intégration:', error);
      return {
        totalTasks: 0,
        tasksWithProject: 0,
        tasksWithoutProject: 0,
        integrationRate: 0
      };
    }
  }

  /**
   * 🧹 NETTOYAGE ET DEBUG
   */
  async testConnection() {
    try {
      console.log('🧪 [SAFE] Test de connexion...');
      
      // Test simple de lecture Firestore
      const testQuery = query(collection(db, 'tasks'), limit(1));
      await getDocs(testQuery);
      
      console.log('✅ [SAFE] Connexion Firestore OK');
      return true;
    } catch (error) {
      console.error('❌ [SAFE] Erreur connexion:', error);
      return false;
    }
  }
}

// Export du service
export const taskProjectIntegration = new TaskProjectIntegrationService();
export default taskProjectIntegration;
