// ==========================================
// 📁 react-app/src/core/services/taskVolunteerService.js
// SERVICE DE VOLONTARIAT POUR LES TÂCHES - PURE LOGIQUE MÉTIER
// ==========================================

import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove 
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🎯 SERVICE DE VOLONTARIAT POUR LES TÂCHES
 */
class TaskVolunteerService {
  constructor() {
    console.log('🙋‍♂️ TaskVolunteerService initialisé');
  }

  /**
   * 🙋‍♂️ SE PORTER VOLONTAIRE POUR UNE TÂCHE
   */
  async volunteerForTask(taskId, userId) {
    try {
      console.log('🙋‍♂️ [VOLUNTEER] Candidature pour tâche:', { taskId, userId });

      // Vérifier que la tâche existe
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();

      // Vérifier que l'utilisateur n'est pas déjà assigné
      if (taskData.assignedTo && taskData.assignedTo.includes(userId)) {
        throw new Error('Vous êtes déjà assigné à cette tâche');
      }

      // Vérifier que l'utilisateur ne s'est pas déjà porté volontaire
      if (taskData.volunteers && taskData.volunteers.includes(userId)) {
        throw new Error('Vous vous êtes déjà porté volontaire pour cette tâche');
      }

      // Ajouter l'utilisateur à la liste des volontaires
      await updateDoc(taskRef, {
        volunteers: arrayUnion(userId),
        volunteerApplications: arrayUnion({
          userId: userId,
          appliedAt: serverTimestamp(),
          status: 'pending'
        }),
        updatedAt: serverTimestamp()
      });

      // Enregistrer dans l'historique
      await this.logVolunteerAction(taskId, userId, 'applied');

      console.log('✅ [VOLUNTEER] Candidature enregistrée avec succès');
      return { 
        success: true,
        message: 'Candidature envoyée avec succès' 
      };

    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur candidature:', error);
      throw error;
    }
  }

  /**
   * ❌ SE DÉSASSIGNER D'UNE TÂCHE
   */
  async unassignFromTask(taskId, userId) {
    try {
      console.log('❌ [UNASSIGN] Désassignation de tâche:', { taskId, userId });

      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();

      // Vérifier que l'utilisateur est bien assigné
      if (!taskData.assignedTo || !taskData.assignedTo.includes(userId)) {
        throw new Error('Vous n\'êtes pas assigné à cette tâche');
      }

      // Retirer l'utilisateur de la liste d'assignation
      await updateDoc(taskRef, {
        assignedTo: arrayRemove(userId),
        volunteers: arrayRemove(userId), // Au cas où il serait aussi dans les volontaires
        updatedAt: serverTimestamp()
      });

      // Enregistrer dans l'historique
      await this.logVolunteerAction(taskId, userId, 'unassigned');

      console.log('✅ [UNASSIGN] Désassignation réussie');
      return { 
        success: true,
        message: 'Vous vous êtes désassigné de cette tâche' 
      };

    } catch (error) {
      console.error('❌ [UNASSIGN] Erreur désassignation:', error);
      throw error;
    }
  }

  /**
   * 📊 VÉRIFIER LE STATUT D'ASSIGNATION
   */
  async checkAssignmentStatus(taskId, userId) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        return { assigned: false, volunteered: false };
      }

      const taskData = taskDoc.data();
      
      return {
        assigned: taskData.assignedTo && taskData.assignedTo.includes(userId),
        volunteered: taskData.volunteers && taskData.volunteers.includes(userId),
        isCreator: taskData.createdBy === userId
      };

    } catch (error) {
      console.error('❌ [STATUS] Erreur vérification statut:', error);
      return { assigned: false, volunteered: false };
    }
  }

  /**
   * 📋 OBTENIR LES TÂCHES DISPONIBLES POUR VOLONTARIAT
   */
  async getAvailableTasks(userId) {
    try {
      console.log('📋 [AVAILABLE] Recherche tâches disponibles pour:', userId);

      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('status', '==', 'open'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const availableTasks = [];

      snapshot.forEach(doc => {
        const taskData = doc.data();
        const task = { id: doc.id, ...taskData };

        // Filtrer les tâches où l'utilisateur peut se porter volontaire
        const isNotAssigned = !taskData.assignedTo || !taskData.assignedTo.includes(userId);
        const isNotCreator = taskData.createdBy !== userId;
        const isNotVolunteer = !taskData.volunteers || !taskData.volunteers.includes(userId);

        if (isNotAssigned && isNotCreator && isNotVolunteer) {
          availableTasks.push(task);
        }
      });

      console.log(`📋 [AVAILABLE] ${availableTasks.length} tâches disponibles trouvées`);
      return availableTasks;

    } catch (error) {
      console.error('❌ [AVAILABLE] Erreur récupération tâches disponibles:', error);
      return [];
    }
  }

  /**
   * 📋 OBTENIR LES TÂCHES ASSIGNÉES À UN UTILISATEUR
   */
  async getMyAssignedTasks(userId) {
    try {
      console.log('📋 [MY-TASKS] Recherche tâches assignées pour:', userId);

      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('assignedTo', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const myTasks = [];

      snapshot.forEach(doc => {
        const taskData = doc.data();
        myTasks.push({ id: doc.id, ...taskData });
      });

      console.log(`📋 [MY-TASKS] ${myTasks.length} tâches assignées trouvées`);
      return myTasks;

    } catch (error) {
      console.error('❌ [MY-TASKS] Erreur récupération tâches assignées:', error);
      return [];
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DE VOLONTARIAT
   */
  async getVolunteerStats(userId) {
    try {
      console.log('📊 [STATS] Calcul statistiques volontariat pour:', userId);

      const tasksRef = collection(db, 'tasks');
      const snapshot = await getDocs(tasksRef);
      
      let stats = {
        totalVolunteered: 0,
        tasksCompleted: 0,
        tasksInProgress: 0,
        successRate: 0
      };

      snapshot.forEach(doc => {
        const taskData = doc.data();
        
        // Compter les candidatures
        if (taskData.volunteers && taskData.volunteers.includes(userId)) {
          stats.totalVolunteered++;
        }
        
        // Compter les tâches assignées
        if (taskData.assignedTo && taskData.assignedTo.includes(userId)) {
          if (taskData.status === 'completed') {
            stats.tasksCompleted++;
          } else if (taskData.status === 'in_progress') {
            stats.tasksInProgress++;
          }
        }
      });

      // Calculer le taux de réussite
      const totalAssigned = stats.tasksCompleted + stats.tasksInProgress;
      stats.successRate = totalAssigned > 0 ? 
        Math.round((stats.tasksCompleted / totalAssigned) * 100) : 0;

      console.log('📊 [STATS] Statistiques calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ [STATS] Erreur calcul statistiques:', error);
      return {
        totalVolunteered: 0,
        tasksCompleted: 0,
        tasksInProgress: 0,
        successRate: 0
      };
    }
  }

  /**
   * 📝 ENREGISTRER UNE ACTION DE VOLONTARIAT
   */
  async logVolunteerAction(taskId, userId, action) {
    try {
      const logEntry = {
        taskId,
        userId,
        action, // 'applied', 'approved', 'rejected', 'unassigned'
        timestamp: serverTimestamp(),
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };

      const logsRef = collection(db, 'volunteer_logs');
      await addDoc(logsRef, logEntry);

      console.log(`📝 [LOG] Action de volontariat enregistrée: ${action}`);

    } catch (error) {
      console.error('❌ [LOG] Erreur enregistrement log:', error);
      // Ne pas faire échouer l'action principale si le log échoue
    }
  }

  /**
   * ✅ APPROUVER UN VOLONTAIRE (pour les créateurs de tâches)
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

      // Assigner la tâche au volontaire
      const currentAssigned = taskData.assignedTo || [];
      const updatedVolunteers = (taskData.volunteers || []).filter(id => id !== volunteerId);
      const updatedApplications = (taskData.volunteerApplications || []).filter(app => app.userId !== volunteerId);

      await updateDoc(taskRef, {
        assignedTo: arrayUnion(volunteerId),
        volunteers: updatedVolunteers,
        volunteerApplications: updatedApplications,
        status: 'in_progress',
        updatedAt: serverTimestamp()
      });

      // Enregistrer dans l'historique
      await this.logVolunteerAction(taskId, volunteerId, 'approved');

      console.log('✅ [APPROVE] Volontaire approuvé et assigné');
      return { 
        success: true,
        message: 'Volontaire approuvé et assigné à la tâche'
      };

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

      // Retirer le volontaire
      const updatedVolunteers = (taskData.volunteers || []).filter(id => id !== volunteerId);
      const updatedApplications = (taskData.volunteerApplications || []).filter(app => app.userId !== volunteerId);

      await updateDoc(taskRef, {
        volunteers: updatedVolunteers,
        volunteerApplications: updatedApplications,
        updatedAt: serverTimestamp()
      });

      // Enregistrer dans l'historique
      await this.logVolunteerAction(taskId, volunteerId, 'rejected');

      console.log('✅ [REJECT] Volontaire rejeté');
      return { 
        success: true,
        message: 'Candidature rejetée'
      };

    } catch (error) {
      console.error('❌ [REJECT] Erreur rejet volontaire:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENIR LES CANDIDATURES POUR UNE TÂCHE
   */
  async getTaskApplications(taskId) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        return [];
      }

      const taskData = taskDoc.data();
      return taskData.volunteerApplications || [];

    } catch (error) {
      console.error('❌ [APPLICATIONS] Erreur récupération candidatures:', error);
      return [];
    }
  }

  /**
   * 📊 OBTENIR L'HISTORIQUE DES ACTIONS DE VOLONTARIAT
   */
  async getVolunteerHistory(userId, limit = 20) {
    try {
      const logsRef = collection(db, 'volunteer_logs');
      const q = query(
        logsRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(q);
      const history = [];

      snapshot.forEach(doc => {
        history.push({ id: doc.id, ...doc.data() });
      });

      return history;

    } catch (error) {
      console.error('❌ [HISTORY] Erreur récupération historique:', error);
      return [];
    }
  }

  /**
   * 🔍 RECHERCHER DES TÂCHES PAR CRITÈRES
   */
  async searchTasksForVolunteering(searchCriteria, userId) {
    try {
      console.log('🔍 [SEARCH] Recherche tâches avec critères:', searchCriteria);

      const tasksRef = collection(db, 'tasks');
      let q = query(tasksRef, where('status', '==', 'open'));

      // Appliquer les filtres supplémentaires si fournis
      if (searchCriteria.category) {
        q = query(q, where('category', '==', searchCriteria.category));
      }

      if (searchCriteria.priority) {
        q = query(q, where('priority', '==', searchCriteria.priority));
      }

      const snapshot = await getDocs(q);
      const matchingTasks = [];

      snapshot.forEach(doc => {
        const taskData = doc.data();
        const task = { id: doc.id, ...taskData };

        // Vérifier que l'utilisateur peut se porter volontaire
        const canVolunteer = this.canUserVolunteerForTask(task, userId);
        
        if (canVolunteer) {
          // Filtrer par texte si spécifié
          if (searchCriteria.text) {
            const searchText = searchCriteria.text.toLowerCase();
            const titleMatch = task.title?.toLowerCase().includes(searchText);
            const descMatch = task.description?.toLowerCase().includes(searchText);
            
            if (titleMatch || descMatch) {
              matchingTasks.push(task);
            }
          } else {
            matchingTasks.push(task);
          }
        }
      });

      console.log(`🔍 [SEARCH] ${matchingTasks.length} tâches trouvées`);
      return matchingTasks;

    } catch (error) {
      console.error('❌ [SEARCH] Erreur recherche tâches:', error);
      return [];
    }
  }

  /**
   * 🔍 VÉRIFIER SI UN UTILISATEUR PEUT SE PORTER VOLONTAIRE
   */
  canUserVolunteerForTask(task, userId) {
    if (!task || !userId) return false;

    // Ne peut pas se porter volontaire pour ses propres tâches
    if (task.createdBy === userId) return false;

    // Ne peut pas se porter volontaire si déjà assigné
    if (task.assignedTo && task.assignedTo.includes(userId)) return false;

    // Ne peut pas se porter volontaire si déjà candidat
    if (task.volunteers && task.volunteers.includes(userId)) return false;

    // La tâche doit être ouverte
    if (task.status !== 'open') return false;

    return true;
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES GLOBALES DE VOLONTARIAT
   */
  async getGlobalVolunteerStats() {
    try {
      const tasksRef = collection(db, 'tasks');
      const snapshot = await getDocs(tasksRef);
      
      let stats = {
        totalTasks: 0,
        openTasks: 0,
        tasksWithVolunteers: 0,
        totalVolunteers: 0,
        avgVolunteersPerTask: 0
      };

      let totalVolunteerCount = 0;

      snapshot.forEach(doc => {
        const taskData = doc.data();
        stats.totalTasks++;
        
        if (taskData.status === 'open') {
          stats.openTasks++;
        }
        
        if (taskData.volunteers && taskData.volunteers.length > 0) {
          stats.tasksWithVolunteers++;
          totalVolunteerCount += taskData.volunteers.length;
        }
      });

      stats.totalVolunteers = totalVolunteerCount;
      stats.avgVolunteersPerTask = stats.tasksWithVolunteers > 0 ? 
        Math.round(totalVolunteerCount / stats.tasksWithVolunteers * 100) / 100 : 0;

      return stats;

    } catch (error) {
      console.error('❌ [GLOBAL-STATS] Erreur calcul statistiques globales:', error);
      return {
        totalTasks: 0,
        openTasks: 0,
        tasksWithVolunteers: 0,
        totalVolunteers: 0,
        avgVolunteersPerTask: 0
      };
    }
  }

  /**
   * 📝 ENREGISTRER UNE ACTION DE VOLONTARIAT
   */
  async logVolunteerAction(taskId, userId, action) {
    try {
      const logEntry = {
        taskId,
        userId,
        action, // 'applied', 'approved', 'rejected', 'unassigned'
        timestamp: serverTimestamp(),
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };

      const logsRef = collection(db, 'volunteer_logs');
      await addDoc(logsRef, logEntry);

      console.log(`📝 [LOG] Action de volontariat enregistrée: ${action}`);

    } catch (error) {
      console.error('❌ [LOG] Erreur enregistrement log:', error);
      // Ne pas faire échouer l'action principale si le log échoue
    }
  }

  /**
   * 🧹 NETTOYER LES CANDIDATURES EXPIRÉES
   */
  async cleanupExpiredApplications(daysOld = 30) {
    try {
      console.log('🧹 [CLEANUP] Nettoyage candidatures expirées...');

      const tasksRef = collection(db, 'tasks');
      const snapshot = await getDocs(tasksRef);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let cleanedCount = 0;

      for (const docSnap of snapshot.docs) {
        const taskData = docSnap.data();
        
        if (taskData.volunteerApplications && taskData.volunteerApplications.length > 0) {
          const validApplications = taskData.volunteerApplications.filter(app => {
            if (!app.appliedAt) return true; // Garder les apps sans date
            
            const appDate = app.appliedAt.toDate ? app.appliedAt.toDate() : new Date(app.appliedAt);
            return appDate > cutoffDate;
          });

          if (validApplications.length !== taskData.volunteerApplications.length) {
            await updateDoc(doc(db, 'tasks', docSnap.id), {
              volunteerApplications: validApplications,
              updatedAt: serverTimestamp()
            });
            
            cleanedCount++;
          }
        }
      }

      console.log(`🧹 [CLEANUP] ${cleanedCount} tâches nettoyées`);
      return { cleanedTasks: cleanedCount };

    } catch (error) {
      console.error('❌ [CLEANUP] Erreur nettoyage candidatures expirées:', error);
      return { cleanedTasks: 0, error: error.message };
    }
  }
}

// Instance globale du service
export const taskVolunteerService = new TaskVolunteerService();

// Export par défaut
export default taskVolunteerService;
