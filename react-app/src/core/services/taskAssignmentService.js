// ==========================================
// 📁 react-app/src/core/services/taskAssignmentService.js
// SERVICE D'ASSIGNATION CORRIGÉ - SANS BUG USER UNDEFINED
// ==========================================

import { 
  collection, 
  doc, 
  updateDoc, 
  getDoc, 
  getDocs,
  query, 
  where, 
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { membersAvailableService } from './membersAvailableService.js';

/**
 * 👥 SERVICE D'ASSIGNATION MULTIPLE DE TÂCHES - VERSION CORRIGÉE
 * Utilise le nouveau service de membres pour éviter les bugs
 */
class TaskAssignmentService {
  
  constructor() {
    this.name = 'TaskAssignmentService';
    console.log('🎯 TaskAssignmentService corrigé initialisé');
  }

  /**
   * 👤 RÉCUPÉRER TOUS LES MEMBRES DISPONIBLES POUR ASSIGNATION
   * Version corrigée utilisant le service spécialisé
   */
  async getAvailableMembers() {
    try {
      console.log('👥 Récupération membres disponibles via service corrigé...');
      
      // Utiliser le service spécialisé qui évite le bug "user is not defined"
      const members = await membersAvailableService.getAllAvailableMembers();
      
      console.log('✅ Membres récupérés sans erreur:', members.length);
      
      // Log pour debug
      if (members.length > 0) {
        console.log('📋 Premiers membres disponibles:', 
          members.slice(0, 3).map(m => ({ 
            id: m.id, 
            name: m.name, 
            email: m.email,
            isActive: m.isActive 
          }))
        );
      }
      
      return members;
      
    } catch (error) {
      console.error('❌ Erreur récupération membres (service corrigé):', error);
      console.error('Détails erreur:', error.message);
      
      // Fallback : retourner liste vide plutôt que planter
      return [];
    }
  }

  /**
   * 🔍 RECHERCHER MEMBRES DISPONIBLES
   */
  async searchAvailableMembers(searchTerm) {
    try {
      console.log('🔍 Recherche membres:', searchTerm);
      
      const filteredMembers = membersAvailableService.searchMembers(searchTerm);
      
      console.log(`✅ ${filteredMembers.length} membres trouvés pour "${searchTerm}"`);
      
      return filteredMembers;
      
    } catch (error) {
      console.error('❌ Erreur recherche membres:', error);
      return [];
    }
  }

  /**
   * 📊 OBTENIR STATISTIQUES DES MEMBRES DISPONIBLES
   */
  getAvailableMembersStats() {
    try {
      return membersAvailableService.getMembersStats();
    } catch (error) {
      console.error('❌ Erreur stats membres:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        totalXp: 0,
        averageLevel: 0,
        departments: 0
      };
    }
  }

  /**
   * 🔄 FORCER LE RECHARGEMENT DES MEMBRES
   */
  async reloadAvailableMembers() {
    try {
      console.log('🔄 Rechargement forcé des membres...');
      
      const members = await membersAvailableService.forceReload();
      
      console.log('✅ Rechargement terminé:', members.length, 'membres');
      
      return members;
      
    } catch (error) {
      console.error('❌ Erreur rechargement membres:', error);
      return [];
    }
  }

  /**
   * 🎯 ASSIGNER UNE TÂCHE À PLUSIEURS PERSONNES
   */
  async assignTaskToMembers(taskId, assignedUserIds, assignedBy) {
    try {
      console.log('🎯 Assignation tâche multiple:', { taskId, assignedUserIds, assignedBy });
      
      // Validation des paramètres
      if (!taskId) {
        throw new Error('ID de tâche manquant');
      }
      
      if (!assignedUserIds || !Array.isArray(assignedUserIds) || assignedUserIds.length === 0) {
        throw new Error('Liste des utilisateurs assignés invalide');
      }
      
      if (!assignedBy) {
        throw new Error('Utilisateur assigneur manquant');
      }

      // Récupérer la tâche actuelle
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();
      
      // Préparer les données d'assignation
      const assignmentData = assignedUserIds.map(userId => ({
        userId: userId,
        assignedAt: new Date().toISOString(),
        assignedBy: assignedBy,
        status: 'assigned', // assigned, completed, declined
        contributionPercentage: Math.round(100 / assignedUserIds.length), // Distribution égale
        hasSubmitted: false,
        submissionDate: null
      }));

      // Nettoyer les données avant mise à jour Firebase
      const cleanAssignmentData = assignmentData.map(assignment => ({
        ...assignment,
        // S'assurer qu'aucune valeur n'est undefined
        userId: assignment.userId || '',
        assignedAt: assignment.assignedAt || new Date().toISOString(),
        assignedBy: assignment.assignedBy || assignedBy,
        status: assignment.status || 'assigned',
        contributionPercentage: assignment.contributionPercentage || 0,
        hasSubmitted: assignment.hasSubmitted || false,
        submissionDate: assignment.submissionDate || null
      }));

      // Mettre à jour la tâche avec des données propres
      await updateDoc(taskRef, {
        assignedTo: assignedUserIds, // Liste des IDs assignés
        assignments: cleanAssignmentData, // Détails des assignations
        isMultipleAssignment: assignedUserIds.length > 1,
        assignmentCount: assignedUserIds.length,
        status: 'assigned',
        assignedAt: serverTimestamp(),
        lastAssignedBy: assignedBy,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Tâche assignée à', assignedUserIds.length, 'personnes');
      
      return {
        success: true,
        assignedCount: assignedUserIds.length,
        taskId: taskId,
        assignments: cleanAssignmentData
      };

    } catch (error) {
      console.error('❌ Erreur assignation multiple:', error);
      throw new Error(`Erreur assignation: ${error.message}`);
    }
  }

  /**
   * 📊 METTRE À JOUR LES POURCENTAGES DE CONTRIBUTION
   */
  async updateContributionPercentages(taskId, contributions) {
    try {
      console.log('📊 Mise à jour pourcentages:', { taskId, contributions });
      
      if (!taskId || !contributions) {
        throw new Error('Paramètres de contribution invalides');
      }
      
      // Validation que le total fait 100%
      const totalPercentage = Object.values(contributions).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
      if (totalPercentage !== 100) {
        throw new Error(`Total des pourcentages incorrect: ${totalPercentage}% (attendu: 100%)`);
      }

      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();
      const assignments = taskData.assignments || [];
      
      // Mettre à jour les pourcentages dans les assignations
      const updatedAssignments = assignments.map(assignment => ({
        ...assignment,
        contributionPercentage: contributions[assignment.userId] || assignment.contributionPercentage || 0
      }));
      
      await updateDoc(taskRef, {
        assignments: updatedAssignments,
        contributionsUpdated: true,
        contributionsUpdatedAt: serverTimestamp()
      });
      
      console.log('✅ Pourcentages mis à jour avec succès');
      
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur mise à jour contributions:', error);
      throw new Error(`Erreur mise à jour pourcentages: ${error.message}`);
    }
  }

  /**
   * ✅ MARQUER LA SOUMISSION D'UN ASSIGNÉ
   */
  async markUserSubmission(taskId, userId, submissionData) {
    try {
      console.log('📝 Soumission utilisateur:', { taskId, userId });
      
      if (!taskId || !userId) {
        throw new Error('Paramètres de soumission invalides');
      }
      
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();
      const assignments = taskData.assignments || [];
      
      // Trouver l'assignation de cet utilisateur
      const userAssignmentIndex = assignments.findIndex(a => a.userId === userId);
      if (userAssignmentIndex === -1) {
        throw new Error('Utilisateur non assigné à cette tâche');
      }

      // Mettre à jour l'assignation
      const updatedAssignments = [...assignments];
      updatedAssignments[userAssignmentIndex] = {
        ...updatedAssignments[userAssignmentIndex],
        hasSubmitted: true,
        submissionDate: new Date().toISOString(),
        submissionData: submissionData || {},
        status: 'submitted'
      };

      // Vérifier si tous ont soumis
      const allSubmitted = updatedAssignments.every(a => a.hasSubmitted);
      
      await updateDoc(taskRef, {
        assignments: updatedAssignments,
        allSubmitted: allSubmitted,
        status: allSubmitted ? 'awaiting_validation' : 'partially_submitted',
        lastSubmissionAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Soumission enregistrée');
      
      return {
        success: true,
        allSubmitted: allSubmitted,
        userSubmitted: true
      };

    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      throw new Error(`Erreur soumission: ${error.message}`);
    }
  }

  /**
   * 👥 RÉCUPÉRER LES TÂCHES ASSIGNÉES À UN UTILISATEUR
   */
  async getUserAssignedTasks(userId) {
    try {
      console.log('📋 Récupération tâches assignées:', userId);
      
      if (!userId) {
        throw new Error('ID utilisateur manquant');
      }
      
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('assignedTo', 'array-contains', userId)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      
      const tasks = tasksSnapshot.docs.map(doc => {
        const taskData = doc.data();
        const userAssignment = taskData.assignments?.find(a => a.userId === userId);
        
        return {
          id: doc.id,
          ...taskData,
          userAssignment: userAssignment,
          isMultipleAssignment: taskData.assignedTo?.length > 1,
          assignmentCount: taskData.assignedTo?.length || 1
        };
      });
      
      console.log('✅ Tâches assignées récupérées:', tasks.length);
      return tasks;

    } catch (error) {
      console.error('❌ Erreur récupération tâches assignées:', error);
      return [];
    }
  }

  /**
   * 📊 OBTENIR STATISTIQUES D'ASSIGNATION
   */
  async getAssignmentStats(userId) {
    try {
      const tasks = await this.getUserAssignedTasks(userId);
      
      return {
        totalAssigned: tasks.length,
        completed: tasks.filter(t => t.userAssignment?.status === 'submitted').length,
        pending: tasks.filter(t => t.userAssignment?.status === 'assigned').length,
        multipleAssignments: tasks.filter(t => t.isMultipleAssignment).length,
        soloAssignments: tasks.filter(t => !t.isMultipleAssignment).length
      };
      
    } catch (error) {
      console.error('❌ Erreur stats assignation:', error);
      return {
        totalAssigned: 0,
        completed: 0,
        pending: 0,
        multipleAssignments: 0,
        soloAssignments: 0
      };
    }
  }
}

// Export de l'instance
export const taskAssignmentService = new TaskAssignmentService();
export default TaskAssignmentService;
