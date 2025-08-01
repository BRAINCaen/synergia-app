// ==========================================
// 📁 react-app/src/core/services/taskAssignmentService.js
// FICHIER COMPLET ET CORRIGÉ - REMPLACE TON FICHIER ENTIER
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
  updateDoc,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🎯 SERVICE COMPLET D'ASSIGNATION DE TÂCHES
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

      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();

      // Préparer les données d'assignation
      const assignments = [];
      for (const memberId of memberIds) {
        const memberDoc = await getDoc(doc(db, 'users', memberId));
        const memberData = memberDoc.exists() ? memberDoc.data() : {};
        
        assignments.push({
          memberId,
          memberName: memberData.displayName || memberData.name || 'Utilisateur anonyme',
          memberEmail: memberData.email || '',
          contribution: memberIds.length === 1 ? 100 : Math.round(100 / memberIds.length),
          expectedXP: Math.round((taskData.xpReward || 0) / memberIds.length),
          assignedAt: serverTimestamp(),
          status: 'assigned'
        });
      }

      const batch = writeBatch(db);

      // Mettre à jour la tâche
      const updatedTaskData = {
        assignedTo: memberIds,
        assignments: assignments,
        status: taskData.status === 'pending' ? 'assigned' : taskData.status,
        assignedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isMultipleAssignment: memberIds.length > 1
      };

      batch.update(taskRef, updatedTaskData);

      // Créer une notification pour chaque membre assigné
      for (const assignment of assignments) {
        const notificationRef = doc(collection(db, 'notifications'));
        const notificationData = {
          userId: assignment.memberId,
          type: 'task_assigned',
          title: 'Nouvelle tâche assignée',
          message: `Vous avez été assigné à la tâche "${taskData.title}"`,
          taskId: taskId,
          taskTitle: taskData.title,
          assignedBy: assignerId,
          expectedXP: assignment.expectedXP,
          contribution: assignment.contribution,
          read: false,
          createdAt: serverTimestamp()
        };
        
        batch.set(notificationRef, notificationData);
      }

      await batch.commit();

      console.log('✅ [ASSIGN] Tâche assignée avec succès');
      return { 
        success: true, 
        assignments,
        message: `Tâche assignée à ${memberIds.length} membre(s)` 
      };

    } catch (error) {
      console.error('❌ [ASSIGN] Erreur assignation tâche:', error);
      throw error;
    }
  }

  /**
   * 👤 RÉCUPÉRER LES TÂCHES ASSIGNÉES À UN UTILISATEUR
   */
  async getUserAssignedTasks(userId) {
    try {
      console.log('👤 [GET_ASSIGNED] Récupération tâches assignées:', userId);

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('assignedTo', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      
      tasksSnapshot.forEach(doc => {
        const taskData = doc.data();
        
        // Trouver l'assignation spécifique à cet utilisateur
        const userAssignment = taskData.assignments?.find(a => a.memberId === userId);
        
        tasks.push({
          id: doc.id,
          ...taskData,
          myAssignment: userAssignment || null
        });
      });

      console.log('✅ [GET_ASSIGNED] Tâches assignées récupérées:', tasks.length);
      return tasks;

    } catch (error) {
      console.error('❌ [GET_ASSIGNED] Erreur récupération tâches assignées:', error);
      throw error;
    }
  }

  /**
   * 🙋‍♂️ SE PORTER VOLONTAIRE POUR UNE TÂCHE
   */
  async volunteerForTask(taskId, userId) {
    try {
      console.log('🙋‍♂️ [VOLUNTEER] Candidature pour tâche:', { taskId, userId });

      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();
      
      // Vérifier si l'utilisateur est déjà assigné
      if (taskData.assignedTo?.includes(userId)) {
        throw new Error('Vous êtes déjà assigné à cette tâche');
      }

      // Vérifier si l'utilisateur a déjà postulé
      const existingVolunteers = taskData.volunteers || [];
      if (existingVolunteers.includes(userId)) {
        throw new Error('Vous avez déjà postulé pour cette tâche');
      }

      // Récupérer les données utilisateur
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.exists() ? userDoc.data() : {};

      // Si la tâche accepte les volontaires automatiquement
      if (taskData.autoAcceptVolunteers) {
        // Assigner directement
        const result = await this.assignTaskToMembers(taskId, [userId], taskData.createdBy);
        return { success: true, pending: false, ...result };
      }

      // Sinon, ajouter à la liste des volontaires
      const updatedVolunteers = [...existingVolunteers, userId];
      const volunteerData = {
        userId,
        userName: userData.displayName || userData.name || 'Utilisateur anonyme',
        userEmail: userData.email || '',
        appliedAt: serverTimestamp(),
        status: 'pending'
      };

      await updateDoc(taskRef, {
        volunteers: updatedVolunteers,
        volunteerApplications: [...(taskData.volunteerApplications || []), volunteerData],
        updatedAt: serverTimestamp()
      });

      // Créer une notification pour le créateur de la tâche
      const notificationRef = doc(collection(db, 'notifications'));
      const notificationData = {
        userId: taskData.createdBy,
        type: 'volunteer_application',
        title: 'Nouveau volontaire',
        message: `${userData.displayName || userData.name || 'Un utilisateur'} souhaite se porter volontaire pour "${taskData.title}"`,
        taskId: taskId,
        taskTitle: taskData.title,
        volunteerId: userId,
        volunteerName: userData.displayName || userData.name || 'Utilisateur anonyme',
        read: false,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'notifications'), notificationData);

      console.log('✅ [VOLUNTEER] Candidature enregistrée');
      return { 
        success: true, 
        pending: true,
        message: 'Candidature envoyée avec succès' 
      };

    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur candidature:', error);
      throw error;
    }
  }

  /**
   * ✅ APPROUVER UN VOLONTAIRE
   */
  async approveVolunteer(taskId, volunteerId, approverId) {
    try {
      console.log('✅ [APPROVE] Approbation volontaire:', { taskId, volunteerId, approverId });

      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();
      
      // Vérifier les permissions
      if (taskData.createdBy !== approverId) {
        throw new Error('Seul le créateur de la tâche peut approuver les volontaires');
      }

      // Assigner la tâche au volontaire approuvé
      const result = await this.assignTaskToMembers(taskId, [volunteerId], approverId);

      // Nettoyer les candidatures
      const updatedVolunteers = (taskData.volunteers || []).filter(id => id !== volunteerId);
      const updatedApplications = (taskData.volunteerApplications || []).filter(app => app.userId !== volunteerId);

      await updateDoc(taskRef, {
        volunteers: updatedVolunteers,
        volunteerApplications: updatedApplications,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [APPROVE] Volontaire approuvé et assigné');
      return { success: true, ...result };

    } catch (error) {
      console.error('❌ [APPROVE] Erreur approbation volontaire:', error);
      throw error;
    }
  }

  /**
   * ❌ REJETER UN VOLONTAIRE
   */
  async rejectVolunteer(taskId, volunteerId, rejectorId) {
    try {
      console.log('❌ [REJECT] Rejet volontaire:', { taskId, volunteerId, rejectorId });

      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();
      
      // Vérifier les permissions
      if (taskData.createdBy !== rejectorId) {
        throw new Error('Seul le créateur de la tâche peut rejeter les volontaires');
      }

      // Retirer de la liste des volontaires
      const updatedVolunteers = (taskData.volunteers || []).filter(id => id !== volunteerId);
      const updatedApplications = (taskData.volunteerApplications || []).filter(app => app.userId !== volunteerId);

      await updateDoc(taskRef, {
        volunteers: updatedVolunteers,
        volunteerApplications: updatedApplications,
        updatedAt: serverTimestamp()
      });

      // Créer une notification pour le volontaire rejeté
      const notificationRef = doc(collection(db, 'notifications'));
      const notificationData = {
        userId: volunteerId,
        type: 'volunteer_rejected',
        title: 'Candidature rejetée',
        message: `Votre candidature pour "${taskData.title}" n'a pas été retenue`,
        taskId: taskId,
        taskTitle: taskData.title,
        read: false,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'notifications'), notificationData);

      console.log('✅ [REJECT] Volontaire rejeté');
      return { success: true, message: 'Volontaire rejeté' };

    } catch (error) {
      console.error('❌ [REJECT] Erreur rejet volontaire:', error);
      throw error;
    }
  }

  /**
   * 🔄 RÉASSIGNER UNE TÂCHE
   */
  async reassignTask(taskId, newMemberIds, reassignerId) {
    try {
      console.log('🔄 [REASSIGN] Réassignation tâche:', { taskId, newMemberIds, reassignerId });

      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();
      
      // Vérifier les permissions
      if (taskData.createdBy !== reassignerId && !taskData.assignedTo?.includes(reassignerId)) {
        throw new Error('Permissions insuffisantes pour réassigner cette tâche');
      }

      // Assigner aux nouveaux membres
      const result = await this.assignTaskToMembers(taskId, newMemberIds, reassignerId);

      console.log('✅ [REASSIGN] Tâche réassignée');
      return result;

    } catch (error) {
      console.error('❌ [REASSIGN] Erreur réassignation tâche:', error);
      throw error;
    }
  }

  /**
   * 📊 RÉCUPÉRER STATISTIQUES D'ASSIGNATION
   */
  async getAssignmentStats(userId) {
    try {
      console.log('📊 [STATS] Récupération statistiques assignation:', userId);

      const assignedTasks = await this.getUserAssignedTasks(userId);
      
      const stats = {
        totalAssigned: assignedTasks.length,
        pending: assignedTasks.filter(t => t.status === 'assigned' || t.status === 'pending').length,
        inProgress: assignedTasks.filter(t => t.status === 'in_progress').length,
        completed: assignedTasks.filter(t => t.status === 'completed').length,
        totalXPEarned: assignedTasks
          .filter(t => t.status === 'completed')
          .reduce((sum, task) => sum + (task.myAssignment?.expectedXP || 0), 0),
        averageContribution: assignedTasks.length > 0 
          ? assignedTasks.reduce((sum, task) => sum + (task.myAssignment?.contribution || 0), 0) / assignedTasks.length
          : 0
      };

      console.log('✅ [STATS] Statistiques calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ [STATS] Erreur calcul statistiques:', error);
      throw error;
    }
  }
}

// ✅ INSTANCE UNIQUE
const taskAssignmentService = new TaskAssignmentService();

// ✅ EXPORTS
export default TaskAssignmentService;
export { taskAssignmentService };
