// ==========================================
// 📁 react-app/src/core/services/taskAssignmentService.js
// SERVICE COMPLET D'ASSIGNATION AVEC BÉNÉVOLAT
// ==========================================

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  writeBatch, 
  serverTimestamp,
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🎯 SERVICE COMPLET D'ASSIGNATION DE TÂCHES
 * Gère les assignations normales et le bénévolat
 */
class TaskAssignmentService {
  constructor() {
    console.log('🎯 TaskAssignmentService initialisé');
  }

  /**
   * 🎯 ASSIGNER UNE TÂCHE À PLUSIEURS MEMBRES
   */
  async assignTaskToMembers(taskId, memberIds, assignerId) {
    try {
      console.log('🎯 [ASSIGN] Assignation tâche:', { taskId, memberIds, assignerId });

      // Vérifier que la tâche existe
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();

      // Préparer les assignations
      const assignments = [];
      for (const memberId of memberIds) {
        const memberDoc = await getDoc(doc(db, 'users', memberId));
        const memberData = memberDoc.exists() ? memberDoc.data() : {};
        
        assignments.push({
          memberId,
          memberName: memberData.displayName || memberData.name || 'Utilisateur anonyme',
          memberEmail: memberData.email || '',
          contribution: memberIds.length === 1 ? 100 : Math.round(100 / memberIds.length)
        });
      }

      // Transaction pour assigner
      const batch = writeBatch(db);

      // Mettre à jour la tâche
      const updatedTaskData = {
        assignedTo: memberIds,
        status: taskData.status === 'pending' ? 'assigned' : taskData.status,
        assignedAt: serverTimestamp(),
        assignedBy: assignerId,
        totalMembers: assignments.length,
        updatedAt: serverTimestamp()
      };

      batch.update(taskRef, updatedTaskData);

      // Créer des enregistrements individuels d'assignation
      assignments.forEach(assignment => {
        const assignmentRef = doc(collection(db, 'taskAssignments'));
        batch.set(assignmentRef, {
          taskId,
          taskTitle: taskData.title || 'Tâche sans titre',
          memberId: assignment.memberId,
          memberName: assignment.memberName,
          memberEmail: assignment.memberEmail,
          contribution: assignment.contribution,
          assignedAt: serverTimestamp(),
          assignedBy: assignerId,
          status: 'assigned',
          dueDate: taskData.dueDate || null,
          priority: taskData.priority || 'normal',
          projectId: taskData.projectId || null
        });
      });

      // Commit de la transaction
      await batch.commit();

      console.log('✅ Tâche assignée avec succès à', assignments.length, 'membres');

      // Notifier les membres (optionnel)
      await this.notifyAssignedMembers(taskId, assignments, taskData);

      return {
        success: true,
        taskId,
        assignedMembers: assignments.length,
        contributions: assignments.map(a => ({
          member: a.memberName,
          contribution: a.contribution
        }))
      };

    } catch (error) {
      console.error('❌ Erreur assignation tâche:', error);
      throw error;
    }
  }

  /**
   * 🙋‍♂️ SE PORTER VOLONTAIRE POUR UNE TÂCHE
   */
  async volunteerForTask(taskId, userId) {
    try {
      console.log('🙋‍♂️ [VOLUNTEER] Candidature volontaire:', { taskId, userId });

      // Vérifier si la tâche existe et est disponible
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();
      
      // Vérifier si déjà assigné
      if (taskData.assignedTo && taskData.assignedTo.includes(userId)) {
        throw new Error('Vous êtes déjà assigné à cette tâche');
      }

      // Récupérer les données utilisateur
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.exists() ? userDoc.data() : {};

      // Créer une demande de volontariat ou assigner directement
      const batch = writeBatch(db);

      if (taskData.requiresApproval) {
        // Créer une demande de volontariat pour approbation
        const volunteerRequestRef = doc(collection(db, 'volunteerRequests'));
        batch.set(volunteerRequestRef, {
          taskId,
          taskTitle: taskData.title || 'Tâche sans titre',
          userId,
          userName: userData.displayName || userData.name || 'Utilisateur anonyme',
          userEmail: userData.email || '',
          requestedAt: serverTimestamp(),
          status: 'pending',
          type: 'task_volunteer'
        });

        await batch.commit();

        return {
          success: true,
          pending: true,
          message: 'Demande de volontariat envoyée et en attente d\'approbation'
        };

      } else {
        // Assigner directement la tâche
        const currentAssigned = taskData.assignedTo || [];
        batch.update(taskRef, {
          assignedTo: [...currentAssigned, userId],
          status: 'assigned',
          assignedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Créer l'enregistrement d'assignation
        const assignmentRef = doc(collection(db, 'taskAssignments'));
        batch.set(assignmentRef, {
          taskId,
          taskTitle: taskData.title || 'Tâche sans titre',
          memberId: userId,
          memberName: userData.displayName || userData.name || 'Utilisateur anonyme',
          memberEmail: userData.email || '',
          contribution: 100, // 100% si seul volontaire
          assignedAt: serverTimestamp(),
          assignedBy: 'volunteer_system',
          status: 'assigned',
          isVolunteer: true
        });

        await batch.commit();

        return {
          success: true,
          pending: false,
          message: 'Vous avez été assigné à cette tâche avec succès'
        };
      }

    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur candidature tâche:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER LES TÂCHES ASSIGNÉES À UN UTILISATEUR
   */
  async getUserAssignedTasks(userId) {
    try {
      console.log('📋 [ASSIGNMENTS] Récupération tâches assignées:', userId);

      // Méthode 1: Via les assignations
      const assignmentsQuery = query(
        collection(db, 'taskAssignments'),
        where('memberId', '==', userId),
        where('status', '==', 'assigned')
      );
      
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const taskIds = [];
      const assignmentsByTask = {};
      
      assignmentsSnapshot.forEach(doc => {
        const assignment = doc.data();
        taskIds.push(assignment.taskId);
        assignmentsByTask[assignment.taskId] = assignment;
      });

      // Récupérer les détails des tâches
      const tasks = [];
      
      if (taskIds.length > 0) {
        // Firebase limite in() à 10 éléments, diviser si nécessaire
        const chunks = this.chunkArray(taskIds, 10);
        
        for (const chunk of chunks) {
          const tasksQuery = query(
            collection(db, 'tasks'),
            where('__name__', 'in', chunk)
          );
          
          const tasksSnapshot = await getDocs(tasksQuery);
          tasksSnapshot.forEach(doc => {
            const taskData = { id: doc.id, ...doc.data() };
            const assignment = assignmentsByTask[doc.id];
            
            tasks.push({
              ...taskData,
              assignmentDetails: assignment,
              myContribution: assignment.contribution,
              isVolunteer: assignment.isVolunteer || false
            });
          });
        }
      }

      // Méthode 2: Tâches directement assignées (backup)
      const directTasksQuery = query(
        collection(db, 'tasks'),
        where('assignedTo', 'array-contains', userId)
      );
      
      const directTasksSnapshot = await getDocs(directTasksQuery);
      directTasksSnapshot.forEach(doc => {
        const taskData = { id: doc.id, ...doc.data() };
        // Éviter les doublons
        if (!tasks.find(t => t.id === doc.id)) {
          tasks.push({
            ...taskData,
            myContribution: 100, // Par défaut si pas d'assignation détaillée
            isVolunteer: false
          });
        }
      });

      console.log('✅ [ASSIGNMENTS] Tâches assignées trouvées:', tasks.length);
      return tasks;

    } catch (error) {
      console.error('❌ [ASSIGNMENTS] Erreur récupération tâches assignées:', error);
      throw error;
    }
  }

  /**
   * 📧 NOTIFIER LES MEMBRES ASSIGNÉS
   */
  async notifyAssignedMembers(taskId, assignments, taskData) {
    try {
      console.log('📧 Notification des membres assignés...');

      // Créer des notifications pour chaque membre
      const notifications = assignments.map(assignment => ({
        userId: assignment.memberId,
        type: 'task_assigned',
        title: 'Nouvelle tâche assignée',
        message: `Vous avez été assigné à la tâche "${taskData.title}" (${assignment.contribution}% de contribution)`,
        taskId: taskId,
        createdAt: serverTimestamp(),
        read: false
      }));

      // Enregistrer les notifications en batch
      const batch = writeBatch(db);
      notifications.forEach(notification => {
        const notifRef = doc(collection(db, 'notifications'));
        batch.set(notifRef, notification);
      });

      await batch.commit();
      console.log('✅ Notifications envoyées à', assignments.length, 'membres');

    } catch (error) {
      console.warn('⚠️ Erreur envoi notifications:', error);
      // Ne pas faire échouer l'assignation pour un problème de notification
    }
  }

  /**
   * 📊 METTRE À JOUR LES POURCENTAGES DE CONTRIBUTION
   */
  async updateContributionPercentages(taskId, contributions) {
    try {
      console.log('📊 [CONTRIBUTIONS] Mise à jour pourcentages:', { taskId, contributions });

      // Vérifier que le total fait 100%
      const total = Object.values(contributions).reduce((sum, value) => sum + value, 0);
      if (Math.abs(total - 100) > 0.1) {
        throw new Error(`Le total des contributions doit être 100% (actuellement ${total}%)`);
      }

      // Récupérer toutes les assignations pour cette tâche
      const assignmentsQuery = query(
        collection(db, 'taskAssignments'),
        where('taskId', '==', taskId),
        where('status', '==', 'assigned')
      );

      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const batch = writeBatch(db);

      // Mettre à jour chaque assignation
      assignmentsSnapshot.forEach(doc => {
        const assignment = doc.data();
        const newContribution = contributions[assignment.memberId];
        
        if (newContribution !== undefined) {
          batch.update(doc.ref, {
            contribution: newContribution,
            updatedAt: serverTimestamp()
          });
        }
      });

      await batch.commit();
      console.log('✅ [CONTRIBUTIONS] Pourcentages mis à jour');

      return { success: true };

    } catch (error) {
      console.error('❌ [CONTRIBUTIONS] Erreur mise à jour pourcentages:', error);
      throw error;
    }
  }

  /**
   * 🗑️ DÉSASSIGNER UN MEMBRE D'UNE TÂCHE
   */
  async unassignMemberFromTask(taskId, memberId, unassignerId) {
    try {
      console.log('🗑️ [UNASSIGN] Désassignation:', { taskId, memberId });

      // Récupérer la tâche
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();
      const batch = writeBatch(db);

      // Retirer de la liste assignedTo
      if (taskData.assignedTo && taskData.assignedTo.includes(memberId)) {
        const newAssignedTo = taskData.assignedTo.filter(id => id !== memberId);
        batch.update(taskRef, {
          assignedTo: newAssignedTo,
          updatedAt: serverTimestamp()
        });
      }

      // Supprimer l'assignation
      const assignmentQuery = query(
        collection(db, 'taskAssignments'),
        where('taskId', '==', taskId),
        where('memberId', '==', memberId)
      );

      const assignmentSnapshot = await getDocs(assignmentQuery);
      assignmentSnapshot.forEach(doc => {
        batch.update(doc.ref, {
          status: 'unassigned',
          unassignedAt: serverTimestamp(),
          unassignedBy: unassignerId
        });
      });

      await batch.commit();
      console.log('✅ [UNASSIGN] Membre désassigné avec succès');

      return { success: true };

    } catch (error) {
      console.error('❌ [UNASSIGN] Erreur désassignation:', error);
      throw error;
    }
  }

  /**
   * 📈 MARQUER UNE TÂCHE COMME TERMINÉE
   */
  async markTaskAsCompleted(taskId, userId, completionNotes = '') {
    try {
      console.log('📈 [COMPLETE] Marquage tâche terminée:', { taskId, userId });

      const batch = writeBatch(db);
      const now = serverTimestamp();

      // Mettre à jour la tâche
      const taskRef = doc(db, 'tasks', taskId);
      batch.update(taskRef, {
        status: 'completed',
        completedAt: now,
        completedBy: userId,
        completionNotes: completionNotes,
        updatedAt: now
      });

      // Mettre à jour les assignations
      const assignmentQuery = query(
        collection(db, 'taskAssignments'),
        where('taskId', '==', taskId),
        where('status', '==', 'assigned')
      );

      const assignmentSnapshot = await getDocs(assignmentQuery);
      assignmentSnapshot.forEach(doc => {
        batch.update(doc.ref, {
          status: 'completed',
          completedAt: now,
          updatedAt: now
        });
      });

      await batch.commit();
      console.log('✅ [COMPLETE] Tâche marquée comme terminée');

      return { success: true };

    } catch (error) {
      console.error('❌ [COMPLETE] Erreur marquage terminé:', error);
      throw error;
    }
  }

  /**
   * 📊 STATISTIQUES D'ASSIGNATION
   */
  async getAssignmentStats(userId) {
    try {
      console.log('📊 [STATS] Récupération statistiques:', userId);

      const assignmentsQuery = query(
        collection(db, 'taskAssignments'),
        where('memberId', '==', userId)
      );

      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      
      const stats = {
        totalAssignments: 0,
        activeAssignments: 0,
        completedAssignments: 0,
        volunteerAssignments: 0,
        totalContribution: 0,
        averageContribution: 0
      };

      let totalContributions = 0;
      let contributionCount = 0;

      assignmentsSnapshot.forEach(doc => {
        const assignment = doc.data();
        stats.totalAssignments++;
        
        if (assignment.status === 'assigned') {
          stats.activeAssignments++;
        } else if (assignment.status === 'completed') {
          stats.completedAssignments++;
        }
        
        if (assignment.isVolunteer) {
          stats.volunteerAssignments++;
        }
        
        if (assignment.contribution) {
          totalContributions += assignment.contribution;
          contributionCount++;
        }
      });

      stats.totalContribution = totalContributions;
      stats.averageContribution = contributionCount > 0 ? 
        Math.round(totalContributions / contributionCount) : 0;

      console.log('✅ [STATS] Statistiques calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ [STATS] Erreur statistiques:', error);
      throw error;
    }
  }

  /**
   * 🔧 UTILITAIRE: Diviser un tableau en chunks
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 🔍 RECHERCHER DES ASSIGNATIONS
   */
  async searchAssignments(searchParams) {
    try {
      console.log('🔍 [SEARCH] Recherche assignations:', searchParams);

      let assignmentsQuery = collection(db, 'taskAssignments');

      // Appliquer les filtres
      if (searchParams.memberId) {
        assignmentsQuery = query(assignmentsQuery, where('memberId', '==', searchParams.memberId));
      }

      if (searchParams.taskId) {
        assignmentsQuery = query(assignmentsQuery, where('taskId', '==', searchParams.taskId));
      }

      if (searchParams.status) {
        assignmentsQuery = query(assignmentsQuery, where('status', '==', searchParams.status));
      }

      if (searchParams.isVolunteer !== undefined) {
        assignmentsQuery = query(assignmentsQuery, where('isVolunteer', '==', searchParams.isVolunteer));
      }

      // Ajouter l'ordre
      assignmentsQuery = query(assignmentsQuery, orderBy('assignedAt', 'desc'));

      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const assignments = [];

      assignmentsSnapshot.forEach(doc => {
        assignments.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ [SEARCH] Assignations trouvées:', assignments.length);
      return assignments;

    } catch (error) {
      console.error('❌ [SEARCH] Erreur recherche assignations:', error);
      throw error;
    }
  }

  /**
   * 🔄 RÉASSIGNER UNE TÂCHE
   */
  async reassignTask(taskId, oldMemberId, newMemberId, reassignerId) {
    try {
      console.log('🔄 [REASSIGN] Réassignation tâche:', { taskId, oldMemberId, newMemberId });

      // D'abord désassigner l'ancien membre
      await this.unassignMemberFromTask(taskId, oldMemberId, reassignerId);

      // Puis assigner au nouveau membre
      await this.assignTaskToMembers(taskId, [newMemberId], reassignerId);

      console.log('✅ [REASSIGN] Tâche réassignée avec succès');
      return { success: true };

    } catch (error) {
      console.error('❌ [REASSIGN] Erreur réassignation:', error);
      throw error;
    }
  }
}

// Export de l'instance
export const taskAssignmentService = new TaskAssignmentService();
