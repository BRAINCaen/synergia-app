// ==========================================
// 📁 react-app/src/core/services/taskProjectIntegration.js
// VERSION CORRIGÉE - Toutes les méthodes ajoutées
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
  writeBatch,
  limit
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🔗 SERVICE D'INTÉGRATION TÂCHES-PROJETS COMPLET
 * Version ultra-robuste avec toutes les méthodes
 */
class TaskProjectIntegrationService {
  constructor() {
    console.log('🔗 TaskProjectIntegrationService initialisé - Version COMPLÈTE');
  }

  /**
   * 🔗 LIER UNE TÂCHE À UN PROJET (ALIAS pour assignTaskToProject)
   */
  async linkTaskToProject(taskId, projectId, userId) {
    console.log('🔗 linkTaskToProject appelé, redirection vers assignTaskToProject');
    return await this.assignTaskToProject(taskId, projectId, userId);
  }

  /**
   * 🔓 DÉLIER UNE TÂCHE D'UN PROJET (ALIAS pour removeTaskFromProject)
   */
  async unlinkTaskFromProject(taskId, userId) {
    console.log('🔓 unlinkTaskFromProject appelé, redirection vers removeTaskFromProject');
    return await this.removeTaskFromProject(taskId, userId);
  }

  /**
   * 📝 ASSIGNER UNE TÂCHE À UN PROJET
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

      // 3. Mettre à jour la tâche avec le projectId
      const updateData = {
        projectId: projectId,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      };

      await updateDoc(taskRef, updateData);
      console.log('✅ [SAFE] Tâche mise à jour avec projectId');
      
      // 4. Mettre à jour la progression du projet
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
   * 🗑️ RETIRER UNE TÂCHE D'UN PROJET
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
      
      // 3. Mettre à jour la progression de l'ancien projet
      if (previousProjectId) {
        try {
          await this.updateProjectProgressSafe(previousProjectId);
          console.log('✅ [SAFE] Progression ancien projet mise à jour');
        } catch (progressError) {
          console.warn('⚠️ [SAFE] Erreur mise à jour progression (non-bloquante):', progressError.message);
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
   * 📊 METTRE À JOUR LA PROGRESSION D'UN PROJET DE FAÇON ULTRA-SAFE
   */
  async updateProjectProgressSafe(projectId) {
    try {
      console.log(`📊 [SAFE] Mise à jour progression projet ${projectId}`);
      
      if (!projectId) {
        console.warn('⚠️ [SAFE] ProjectId manquant pour mise à jour progression');
        return { success: false, error: 'ProjectId manquant' };
      }

      // 1. Récupérer toutes les tâches du projet
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
      
      // 2. Calculer les statistiques
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(task => {
        const status = task.status || '';
        return status === 'completed' || status === 'done';
      }).length;
      
      const progressPercentage = totalTasks > 0 ? 
        Math.round((completedTasks / totalTasks) * 100) : 0;

      console.log(`📊 [SAFE] Stats: ${completedTasks}/${totalTasks} (${progressPercentage}%)`);

      // 3. Mettre à jour le projet avec les nouvelles stats
      try {
        const projectRef = doc(db, 'projects', projectId);
        
        const projectUpdateData = {
          progress: progressPercentage,
          taskCount: totalTasks,
          completedTaskCount: completedTasks,
          updatedAt: serverTimestamp()
        };

        await updateDoc(projectRef, projectUpdateData);
        console.log('✅ [SAFE] Projet mis à jour avec nouvelles stats');
        
        return { 
          success: true, 
          stats: { 
            totalTasks, 
            completedTasks, 
            progressPercentage 
          } 
        };
        
      } catch (updateError) {
        console.error('❌ [SAFE] Erreur mise à jour projet:', updateError);
        return { success: false, error: 'Erreur mise à jour projet' };
      }
      
    } catch (error) {
      console.error('❌ [SAFE] Erreur générale updateProjectProgressSafe:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES D'INTÉGRATION
   */
  async getIntegrationStats(userId) {
    try {
      console.log('📊 [SAFE] Calcul statistiques intégration pour:', userId);
      
      if (!userId) {
        console.warn('⚠️ [SAFE] UserId manquant pour stats intégration');
        return this.getEmptyStats();
      }

      // Récupérer toutes les tâches de l'utilisateur
      let userTasks = [];
      try {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', userId)
        );
        
        const tasksSnapshot = await getDocs(tasksQuery);
        userTasks = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`✅ [SAFE] ${userTasks.length} tâches trouvées pour l'utilisateur`);
      } catch (tasksError) {
        console.error('❌ [SAFE] Erreur récupération tâches utilisateur:', tasksError);
        return this.getEmptyStats();
      }
      
      // Calculer les statistiques
      const totalTasks = userTasks.length;
      const tasksWithProject = userTasks.filter(task => task.projectId && task.projectId.trim() !== '').length;
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
      return this.getEmptyStats();
    }
  }

  /**
   * 📊 CALCULER LES STATISTIQUES D'INTÉGRATION (ALIAS pour compatibilité)
   */
  calculateIntegrationStats(tasks = [], projects = []) {
    try {
      console.log('📊 [SAFE] Calcul stats avec arrays fournis:', {
        tâches: tasks.length,
        projets: projects.length
      });
      
      const totalTasks = tasks.length;
      const linkedTasks = tasks.filter(task => task.projectId && task.projectId.trim() !== '').length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const activeProjects = projects.filter(project => project.status === 'active').length;
      
      return {
        totalTasks,
        linkedTasks,
        completedTasks,
        activeProjects
      };
      
    } catch (error) {
      console.error('❌ [SAFE] Erreur calcul stats:', error);
      return {
        totalTasks: 0,
        linkedTasks: 0,
        completedTasks: 0,
        activeProjects: 0
      };
    }
  }

  /**
   * 📊 STATISTIQUES VIDES PAR DÉFAUT
   */
  getEmptyStats() {
    return {
      totalTasks: 0,
      tasksWithProject: 0,
      tasksWithoutProject: 0,
      integrationRate: 0
    };
  }

  /**
   * 🧪 TEST DE CONNEXION
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

  /**
   * 🧹 NETTOYAGE
   */
  async cleanup() {
    console.log('🧹 [SAFE] Nettoyage service TaskProjectIntegration');
    // Pas de listeners à nettoyer pour ce service
  }
}

// Export du service
export const taskProjectIntegration = new TaskProjectIntegrationService();
export default taskProjectIntegration;
