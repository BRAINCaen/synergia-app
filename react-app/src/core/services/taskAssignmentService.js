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
  writeBatch,
  addDoc
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
   * 🎯 ASSIGNER UNE TÂCHE À PLUSIEURS MEMBRES
   */
  async assignTaskToMembers(taskId, assignments, assignerId) {
    try {
      console.log('🎯 Assignation tâche multiple:', {
        taskId,
        membersCount: assignments.length,
        assignerId
      });

      // Vérifier que la tâche existe
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tâche non trouvée');
      }

      const taskData = taskSnap.data();

      // Utiliser une transaction pour la cohérence
      const batch = writeBatch(db);

      // Préparer les assignations
      const assignmentRecords = [];
      let totalContribution = 0;

      assignments.forEach(assignment => {
        const { memberId, memberName, memberEmail, contribution } = assignment;
        
        assignmentRecords.push({
          memberId,
          memberName: memberName || 'Membre inconnu',
          memberEmail: memberEmail || '',
          contribution: contribution || 0,
          assignedAt: serverTimestamp(),
          assignedBy: assignerId,
          status: 'assigned',
          startedAt: null,
          completedAt: null
        });

        totalContribution += (contribution || 0);
      });

      // Vérifier que les contributions totalisent 100%
      if (Math.abs(totalContribution - 100) > 0.1) {
        throw new Error(`Les contributions doivent totaliser 100% (actuellement: ${totalContribution}%)`);
      }

      // Mettre à jour la tâche
      const updatedTaskData = {
        assignedTo: assignments.map(a => a.memberId),
        assignedMembers: assignmentRecords,
        assignments: assignmentRecords, // Alias pour compatibilité
        status: taskData.status === 'draft' ? 'assigned' : taskData.status,
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
        data: {
          taskId,
          taskTitle: taskData.title,
          contribution: assignment.contribution,
          dueDate: taskData.dueDate
        },
        read: false,
        createdAt: serverTimestamp()
      }));

      // Enregistrer les notifications
      const batch = writeBatch(db);
      notifications.forEach(notification => {
        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, notification);
      });

      await batch.commit();
      console.log('✅ Notifications envoyées');

    } catch (error) {
      console.error('❌ Erreur notification membres:', error);
      // Ne pas faire planter l'assignation pour ça
    }
  }

  /**
   * 🔄 MODIFIER UNE ASSIGNATION EXISTANTE
   */
  async updateTaskAssignment(taskId, newAssignments, assignerId) {
    try {
      console.log('🔄 Modification assignation tâche:', taskId);

      // Récupérer la tâche actuelle
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tâche non trouvée');
      }

      const taskData = taskSnap.data();

      // Supprimer les anciennes assignations individuelles
      await this.removeOldAssignments(taskId);

      // Créer les nouvelles assignations
      const result = await this.assignTaskToMembers(taskId, newAssignments, assignerId);

      console.log('✅ Assignation modifiée avec succès');
      return result;

    } catch (error) {
      console.error('❌ Erreur modification assignation:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER LES ANCIENNES ASSIGNATIONS
   */
  async removeOldAssignments(taskId) {
    try {
      const assignmentsQuery = query(
        collection(db, 'taskAssignments'),
        where('taskId', '==', taskId)
      );

      const snapshot = await getDocs(assignmentsQuery);
      
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log('🗑️ Anciennes assignations supprimées');
      }

    } catch (error) {
      console.error('❌ Erreur suppression anciennes assignations:', error);
    }
  }

  /**
   * ❌ DÉSASSIGNER UNE TÂCHE
   */
  async unassignTask(taskId, assignerId) {
    try {
      console.log('❌ Désassignation tâche:', taskId);

      const taskRef = doc(db, 'tasks', taskId);
      
      // Supprimer les assignations individuelles
      await this.removeOldAssignments(taskId);

      // Mettre à jour la tâche
      await updateDoc(taskRef, {
        assignedTo: [],
        assignedMembers: [],
        assignments: [],
        status: 'draft',
        assignedAt: null,
        assignedBy: null,
        totalMembers: 0,
        updatedAt: serverTimestamp(),
        unassignedAt: serverTimestamp(),
        unassignedBy: assignerId
      });

      console.log('✅ Tâche désassignée avec succès');
      return { success: true, taskId };

    } catch (error) {
      console.error('❌ Erreur désassignation tâche:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENIR LES ASSIGNATIONS D'UN MEMBRE
   */
  async getMemberAssignments(memberId, status = null) {
    try {
      let assignmentsQuery = query(
        collection(db, 'taskAssignments'),
        where('memberId', '==', memberId)
      );

      if (status) {
        assignmentsQuery = query(assignmentsQuery, where('status', '==', status));
      }

      const snapshot = await getDocs(assignmentsQuery);
      const assignments = [];

      snapshot.forEach(doc => {
        assignments.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`📊 ${assignments.length} assignations trouvées pour ${memberId}`);
      return assignments;

    } catch (error) {
      console.error('❌ Erreur récupération assignations membre:', error);
      return [];
    }
  }

  /**
   * 📈 OBTENIR LES STATISTIQUES D'ASSIGNATION
   */
  async getAssignmentStats() {
    try {
      const assignmentsQuery = query(collection(db, 'taskAssignments'));
      const snapshot = await getDocs(assignmentsQuery);

      const stats = {
        total: 0,
        byStatus: {
          assigned: 0,
          in_progress: 0,
          completed: 0,
          overdue: 0
        },
        byMember: {},
        averageContribution: 0,
        totalContribution: 0
      };

      snapshot.forEach(doc => {
        const data = doc.data();
        stats.total++;
        
        // Par statut
        if (stats.byStatus[data.status] !== undefined) {
          stats.byStatus[data.status]++;
        }

        // Par membre
        if (data.memberId) {
          if (!stats.byMember[data.memberId]) {
            stats.byMember[data.memberId] = {
              memberName: data.memberName,
              count: 0,
              totalContribution: 0
            };
          }
          stats.byMember[data.memberId].count++;
          stats.byMember[data.memberId].totalContribution += (data.contribution || 0);
        }

        // Contribution totale
        stats.totalContribution += (data.contribution || 0);
      });

      // Contribution moyenne
      if (stats.total > 0) {
        stats.averageContribution = stats.totalContribution / stats.total;
      }

      console.log('📈 Statistiques assignations calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Erreur calcul statistiques assignations:', error);
      return {
        total: 0,
        byStatus: { assigned: 0, in_progress: 0, completed: 0, overdue: 0 },
        byMember: {},
        averageContribution: 0,
        totalContribution: 0
      };
    }
  }

  /**
   * 🔍 RECHERCHER DES ASSIGNATIONS
   */
  async searchAssignments(filters = {}) {
    try {
      let assignmentsQuery = query(collection(db, 'taskAssignments'));

      // Appliquer les filtres
      if (filters.memberId) {
        assignmentsQuery = query(assignmentsQuery, where('memberId', '==', filters.memberId));
      }

      if (filters.status) {
        assignmentsQuery = query(assignmentsQuery, where('status', '==', filters.status));
      }

      if (filters.projectId) {
        assignmentsQuery = query(assignmentsQuery, where('projectId', '==', filters.projectId));
      }

      const snapshot = await getDocs(assignmentsQuery);
      const assignments = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Filtres additionnels (qui ne peuvent pas être dans la query Firestore)
        if (filters.taskTitle && !data.taskTitle?.toLowerCase().includes(filters.taskTitle.toLowerCase())) {
          return;
        }

        if (filters.memberName && !data.memberName?.toLowerCase().includes(filters.memberName.toLowerCase())) {
          return;
        }

        assignments.push({
          id: doc.id,
          ...data
        });
      });

      return assignments;

    } catch (error) {
      console.error('❌ Erreur recherche assignations:', error);
      return [];
    }
  }

  /**
   * ✅ MARQUER UNE ASSIGNATION COMME TERMINÉE
   */
  async completeAssignment(assignmentId, completedBy) {
    try {
      const assignmentRef = doc(db, 'taskAssignments', assignmentId);
      
      await updateDoc(assignmentRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        completedBy: completedBy,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Assignation marquée comme terminée:', assignmentId);
      return { success: true, assignmentId };

    } catch (error) {
      console.error('❌ Erreur finalisation assignation:', error);
      throw error;
    }
  }

  /**
   * 🚀 DÉMARRER UNE ASSIGNATION
   */
  async startAssignment(assignmentId, startedBy) {
    try {
      const assignmentRef = doc(db, 'taskAssignments', assignmentId);
      
      await updateDoc(assignmentRef, {
        status: 'in_progress',
        startedAt: serverTimestamp(),
        startedBy: startedBy,
        updatedAt: serverTimestamp()
      });

      console.log('🚀 Assignation démarrée:', assignmentId);
      return { success: true, assignmentId };

    } catch (error) {
      console.error('❌ Erreur démarrage assignation:', error);
      throw error;
    }
  }
}

// Créer et exporter une instance unique
const taskAssignmentService = new TaskAssignmentService();
export { taskAssignmentService };
