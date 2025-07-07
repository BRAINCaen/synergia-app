// ==========================================
// 📁 react-app/src/core/services/taskProjectIntegration.js
// VERSION CORRIGÉE - Synchronisation complète des statistiques projet
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
 * 🔗 SERVICE D'INTÉGRATION TÂCHES-PROJETS - SYNCHRONISATION COMPLÈTE
 */
class TaskProjectIntegrationService {
  constructor() {
    console.log('🔗 TaskProjectIntegrationService - SYNCHRONISATION COMPLÈTE');
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
   * 📝 ASSIGNER UNE TÂCHE À UN PROJET AVEC SYNCHRONISATION COMPLÈTE
   */
  async assignTaskToProject(taskId, projectId, userId) {
    try {
      console.log(`🔗 [SYNC] Assignation tâche ${taskId} au projet ${projectId}`);
      
      if (!taskId || !projectId || !userId) {
        throw new Error('Paramètres manquants pour l\'assignation');
      }

      // 1. Vérifier que la tâche existe
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tâche non trouvée');
      }
      
      console.log('✅ [SYNC] Tâche trouvée');

      // 2. Vérifier que le projet existe
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error('Projet non trouvé');
      }
      
      console.log('✅ [SYNC] Projet trouvé');

      // 3. Mettre à jour la tâche avec le projectId
      const updateData = {
        projectId: projectId,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      };

      await updateDoc(taskRef, updateData);
      console.log('✅ [SYNC] Tâche mise à jour avec projectId');
      
      // 4. SYNCHRONISATION COMPLÈTE du projet
      const syncResult = await this.syncProjectCompletely(projectId);
      if (syncResult.success) {
        console.log('✅ [SYNC] Projet synchronisé complètement');
      } else {
        console.warn('⚠️ [SYNC] Erreur synchronisation projet (non-bloquante):', syncResult.error);
      }
      
      console.log('✅ [SYNC] Assignation terminée avec succès');
      return { success: true, error: null };
      
    } catch (error) {
      console.error('❌ [SYNC] Erreur assignation tâche au projet:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ RETIRER UNE TÂCHE D'UN PROJET AVEC SYNCHRONISATION COMPLÈTE
   */
  async removeTaskFromProject(taskId, userId) {
    try {
      console.log(`🗑️ [SYNC] Retrait tâche ${taskId} de son projet`);
      
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
      
      console.log('✅ [SYNC] Tâche trouvée, projectId actuel:', previousProjectId);

      // 2. Retirer le projectId de la tâche
      const updateData = {
        projectId: null,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      };

      await updateDoc(taskRef, updateData);
      console.log('✅ [SYNC] ProjectId retiré de la tâche');
      
      // 3. SYNCHRONISATION COMPLÈTE de l'ancien projet
      if (previousProjectId) {
        const syncResult = await this.syncProjectCompletely(previousProjectId);
        if (syncResult.success) {
          console.log('✅ [SYNC] Ancien projet synchronisé complètement');
        } else {
          console.warn('⚠️ [SYNC] Erreur synchronisation ancien projet (non-bloquante):', syncResult.error);
        }
      }
      
      console.log('✅ [SYNC] Retrait terminé avec succès');
      return { success: true, error: null };
      
    } catch (error) {
      console.error('❌ [SYNC] Erreur retrait tâche du projet:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 SYNCHRONISER COMPLÈTEMENT UN PROJET
   * Met à jour TOUS les champs de statistiques
   */
  async syncProjectCompletely(projectId) {
    try {
      console.log(`🔄 [SYNC] Synchronisation complète projet ${projectId}`);
      
      if (!projectId) {
        console.warn('⚠️ [SYNC] ProjectId manquant pour synchronisation');
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
        
        console.log(`✅ [SYNC] ${projectTasks.length} tâches trouvées pour le projet`);
      } catch (tasksError) {
        console.error('❌ [SYNC] Erreur récupération tâches projet:', tasksError);
        return { success: false, error: 'Erreur récupération tâches' };
      }
      
      // 2. Calculer TOUTES les statistiques
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(task => {
        const status = task.status || '';
        return status === 'completed' || status === 'done';
      }).length;
      
      const inProgressTasks = projectTasks.filter(task => {
        const status = task.status || '';
        return status === 'in_progress' || status === 'active';
      }).length;
      
      const pendingTasks = projectTasks.filter(task => {
        const status = task.status || '';
        return status === 'pending' || status === 'todo';
      }).length;
      
      const blockedTasks = projectTasks.filter(task => {
        const status = task.status || '';
        return status === 'blocked';
      }).length;
      
      // Calcul du pourcentage de progression
      const progressPercentage = totalTasks > 0 ? 
        Math.round((completedTasks / totalTasks) * 100) : 0;

      // Calcul de l'XP total du projet
      const totalXp = projectTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0);
      const earnedXp = projectTasks
        .filter(task => task.status === 'completed')
        .reduce((sum, task) => sum + (task.xpReward || 0), 0);

      console.log(`📊 [SYNC] Stats calculées: ${completedTasks}/${totalTasks} (${progressPercentage}%)`);

      // 3. Mettre à jour le projet avec TOUTES les statistiques
      try {
        const projectRef = doc(db, 'projects', projectId);
        
        const completeUpdateData = {
          // ✅ STATISTIQUES DE BASE
          totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          blockedTasks,
          
          // ✅ PROGRESSION (pour l'interface)
          progress: progressPercentage,
          progressPercentage, // Alias au cas où
          completion: progressPercentage, // Autre alias
          
          // ✅ STATISTIQUES XP
          totalXp,
          earnedXp,
          remainingXp: totalXp - earnedXp,
          
          // ✅ MÉTADONNÉES
          lastSyncAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          taskCount: totalTasks, // Alias pour compatibilité
          completedTaskCount: completedTasks, // Alias pour compatibilité
          
          // ✅ INFORMATIONS SUPPLÉMENTAIRES
          hasActiveTasks: inProgressTasks > 0,
          isCompleted: totalTasks > 0 && completedTasks === totalTasks,
          tasksDistribution: {
            completed: completedTasks,
            inProgress: inProgressTasks,
            pending: pendingTasks,
            blocked: blockedTasks
          }
        };

        await updateDoc(projectRef, completeUpdateData);
        console.log('✅ [SYNC] Projet mis à jour avec statistiques complètes');
        
        return { 
          success: true, 
          stats: completeUpdateData 
        };
        
      } catch (updateError) {
        console.error('❌ [SYNC] Erreur mise à jour document projet:', updateError);
        return { success: false, error: 'Erreur mise à jour document' };
      }
      
    } catch (error) {
      console.error('❌ [SYNC] Erreur générale synchronisation complète:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES D'INTÉGRATION
   */
  async getIntegrationStats(userId) {
    try {
      console.log('📊 [SYNC] Calcul statistiques intégration pour:', userId);
      
      if (!userId) {
        console.warn('⚠️ [SYNC] UserId manquant pour stats intégration');
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
        
        console.log(`✅ [SYNC] ${userTasks.length} tâches trouvées pour l'utilisateur`);
      } catch (tasksError) {
        console.error('❌ [SYNC] Erreur récupération tâches utilisateur:', tasksError);
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
      
      console.log('✅ [SYNC] Stats intégration:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ [SYNC] Erreur stats intégration:', error);
      return this.getEmptyStats();
    }
  }

  /**
   * 📊 CALCULER LES STATISTIQUES D'INTÉGRATION (ALIAS pour compatibilité)
   */
  calculateIntegrationStats(tasks = [], projects = []) {
    try {
      console.log('📊 [SYNC] Calcul stats avec arrays fournis:', {
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
      console.error('❌ [SYNC] Erreur calcul stats:', error);
      return {
        totalTasks: 0,
        linkedTasks: 0,
        completedTasks: 0,
        activeProjects: 0
      };
    }
  }

  /**
   * 🔄 SYNCHRONISER TOUS LES PROJETS D'UN UTILISATEUR
   * Utile pour corriger toutes les incohérences
   */
  async syncAllUserProjects(userId) {
    try {
      console.log('🔄 [SYNC] Synchronisation de tous les projets utilisateur:', userId);
      
      // Récupérer tous les projets de l'utilisateur
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', userId)
      );
      
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`🔄 [SYNC] ${projects.length} projets à synchroniser`);
      
      let successCount = 0;
      let errorCount = 0;
      
      // Synchroniser chaque projet
      for (const project of projects) {
        try {
          const result = await this.syncProjectCompletely(project.id);
          if (result.success) {
            successCount++;
            console.log(`✅ [SYNC] Projet ${project.title} synchronisé`);
          } else {
            errorCount++;
            console.warn(`⚠️ [SYNC] Erreur sync projet ${project.title}:`, result.error);
          }
          
          // Petite pause pour éviter de surcharger Firebase
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          errorCount++;
          console.error(`❌ [SYNC] Erreur sync projet ${project.title}:`, error);
        }
      }
      
      console.log(`✅ [SYNC] Synchronisation terminée: ${successCount} succès, ${errorCount} erreurs`);
      
      return {
        success: true,
        totalProjects: projects.length,
        successCount,
        errorCount
      };
      
    } catch (error) {
      console.error('❌ [SYNC] Erreur synchronisation tous projets:', error);
      return {
        success: false,
        error: error.message
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
      console.log('🧪 [SYNC] Test de connexion...');
      
      // Test simple de lecture Firestore
      const testQuery = query(collection(db, 'tasks'), limit(1));
      await getDocs(testQuery);
      
      console.log('✅ [SYNC] Connexion Firestore OK');
      return true;
    } catch (error) {
      console.error('❌ [SYNC] Erreur connexion:', error);
      return false;
    }
  }

  /**
   * 🧹 NETTOYAGE
   */
  async cleanup() {
    console.log('🧹 [SYNC] Nettoyage service TaskProjectIntegration');
    // Pas de listeners à nettoyer pour ce service
  }
}

// Export du service
export const taskProjectIntegration = new TaskProjectIntegrationService();
export default taskProjectIntegration;
