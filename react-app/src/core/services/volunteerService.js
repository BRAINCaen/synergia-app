// ==========================================
// 📁 react-app/src/core/services/volunteerService.js
// SERVICE COMPLET DE GESTION DU BÉNÉVOLAT
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
 * 🙋‍♂️ SERVICE COMPLET DE GESTION DU BÉNÉVOLAT
 * Centralise toutes les opérations liées au volontariat
 */
class VolunteerService {
  constructor() {
    console.log('🙋‍♂️ VolunteerService initialisé');
  }

  /**
   * 📋 RÉCUPÉRER TOUTES LES DEMANDES DE VOLONTARIAT
   */
  async getAllVolunteerRequests() {
    try {
      console.log('📋 [VOLUNTEER] Récupération demandes volontariat');

      const requestsQuery = query(
        collection(db, 'volunteerRequests'),
        orderBy('requestedAt', 'desc')
      );
      
      const requestsSnapshot = await getDocs(requestsQuery);
      const requests = [];
      
      requestsSnapshot.forEach(doc => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ [VOLUNTEER] Demandes récupérées:', requests.length);
      return requests;

    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur récupération demandes par statut:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER LES DEMANDES D'UN UTILISATEUR
   */
  async getUserVolunteerRequests(userId) {
    try {
      console.log('📋 [VOLUNTEER] Récupération demandes utilisateur:', userId);

      const requestsQuery = query(
        collection(db, 'volunteerRequests'),
        where('userId', '==', userId),
        orderBy('requestedAt', 'desc')
      );
      
      const requestsSnapshot = await getDocs(requestsQuery);
      const requests = [];
      
      requestsSnapshot.forEach(doc => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ [VOLUNTEER] Demandes utilisateur récupérées:', requests.length);
      return requests;

    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur récupération demandes utilisateur:', error);
      throw error;
    }
  }

  /**
   * ✅ APPROUVER UNE DEMANDE DE VOLONTARIAT
   */
  async approveVolunteerRequest(requestId, approverId) {
    try {
      console.log('✅ [VOLUNTEER] Approbation demande:', requestId);

      const requestRef = doc(db, 'volunteerRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        throw new Error('Demande introuvable');
      }

      const requestData = requestDoc.data();
      const batch = writeBatch(db);

      // Mettre à jour le statut de la demande
      batch.update(requestRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: approverId
      });

      if (requestData.type === 'task_volunteer') {
        // Assigner la tâche
        const taskRef = doc(db, 'tasks', requestData.taskId);
        const taskDoc = await getDoc(taskRef);
        
        if (taskDoc.exists()) {
          const taskData = taskDoc.data();
          const currentAssigned = taskData.assignedTo || [];
          
          batch.update(taskRef, {
            assignedTo: [...currentAssigned, requestData.userId],
            status: 'assigned',
            updatedAt: serverTimestamp()
          });

          // Créer l'assignation
          const assignmentRef = doc(collection(db, 'taskAssignments'));
          batch.set(assignmentRef, {
            taskId: requestData.taskId,
            taskTitle: requestData.taskTitle,
            memberId: requestData.userId,
            memberName: requestData.userName,
            memberEmail: requestData.userEmail,
            contribution: 100,
            assignedAt: serverTimestamp(),
            assignedBy: approverId,
            status: 'assigned',
            isVolunteer: true
          });
        }

      } else if (requestData.type === 'project_volunteer') {
        // Ajouter au projet
        const projectRef = doc(db, 'projects', requestData.projectId);
        const projectDoc = await getDoc(projectRef);
        
        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          const currentTeam = projectData.teamMembers || [];
          
          batch.update(projectRef, {
            teamMembers: [...currentTeam, requestData.userId],
            updatedAt: serverTimestamp()
          });

          // Créer la participation
          const participationRef = doc(collection(db, 'projectParticipations'));
          batch.set(participationRef, {
            projectId: requestData.projectId,
            projectTitle: requestData.projectTitle,
            userId: requestData.userId,
            userName: requestData.userName,
            userEmail: requestData.userEmail,
            joinedAt: serverTimestamp(),
            role: 'volunteer',
            isVolunteer: true,
            status: 'active'
          });
        }
      }

      await batch.commit();

      console.log('✅ [VOLUNTEER] Demande approuvée avec succès');
      return { success: true };

    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur approbation:', error);
      throw error;
    }
  }

  /**
   * ❌ REJETER UNE DEMANDE DE VOLONTARIAT
   */
  async rejectVolunteerRequest(requestId, rejecterId, reason = '') {
    try {
      console.log('❌ [VOLUNTEER] Rejet demande:', requestId);

      const requestRef = doc(db, 'volunteerRequests', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: rejecterId,
        rejectionReason: reason
      });

      console.log('✅ [VOLUNTEER] Demande rejetée');
      return { success: true };

    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur rejet:', error);
      throw error;
    }
  }

  /**
   * 📝 CRÉER UNE DEMANDE DE VOLONTARIAT MANUELLE
   */
  async createVolunteerRequest(requestData) {
    try {
      console.log('📝 [VOLUNTEER] Création demande manuelle:', requestData);

      const newRequest = {
        ...requestData,
        requestedAt: serverTimestamp(),
        status: 'pending'
      };

      const docRef = await addDoc(collection(db, 'volunteerRequests'), newRequest);

      console.log('✅ [VOLUNTEER] Demande créée:', docRef.id);
      return {
        id: docRef.id,
        ...newRequest
      };

    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur création demande:', error);
      throw error;
    }
  }

  /**
   * 📊 STATISTIQUES DU BÉNÉVOLAT
   */
  async getVolunteerStats() {
    try {
      console.log('📊 [VOLUNTEER] Récupération statistiques');

      const requestsSnapshot = await getDocs(collection(db, 'volunteerRequests'));
      const assignmentsSnapshot = await getDocs(
        query(collection(db, 'taskAssignments'), where('isVolunteer', '==', true))
      );
      const participationsSnapshot = await getDocs(
        query(collection(db, 'projectParticipations'), where('isVolunteer', '==', true))
      );

      const stats = {
        totalRequests: requestsSnapshot.size,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        activeVolunteerTasks: assignmentsSnapshot.size,
        activeVolunteerProjects: participationsSnapshot.size,
        taskRequests: 0,
        projectRequests: 0
      };

      requestsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'pending') stats.pendingRequests++;
        else if (data.status === 'approved') stats.approvedRequests++;
        else if (data.status === 'rejected') stats.rejectedRequests++;

        if (data.type === 'task_volunteer') stats.taskRequests++;
        else if (data.type === 'project_volunteer') stats.projectRequests++;
      });

      console.log('✅ [VOLUNTEER] Statistiques calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur statistiques:', error);
      throw error;
    }
  }

  /**
   * 📊 STATISTIQUES PAR UTILISATEUR
   */
  async getUserVolunteerStats(userId) {
    try {
      console.log('📊 [VOLUNTEER] Statistiques utilisateur:', userId);

      const userRequestsSnapshot = await getDocs(
        query(collection(db, 'volunteerRequests'), where('userId', '==', userId))
      );
      
      const userTaskAssignmentsSnapshot = await getDocs(
        query(
          collection(db, 'taskAssignments'), 
          where('memberId', '==', userId),
          where('isVolunteer', '==', true)
        )
      );
      
      const userProjectParticipationsSnapshot = await getDocs(
        query(
          collection(db, 'projectParticipations'), 
          where('userId', '==', userId),
          where('isVolunteer', '==', true)
        )
      );

      const stats = {
        totalRequests: userRequestsSnapshot.size,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        activeVolunteerTasks: 0,
        completedVolunteerTasks: 0,
        activeVolunteerProjects: 0,
        totalVolunteerHours: 0
      };

      userRequestsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'pending') stats.pendingRequests++;
        else if (data.status === 'approved') stats.approvedRequests++;
        else if (data.status === 'rejected') stats.rejectedRequests++;
      });

      userTaskAssignmentsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'assigned') stats.activeVolunteerTasks++;
        else if (data.status === 'completed') stats.completedVolunteerTasks++;
      });

      userProjectParticipationsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'active') stats.activeVolunteerProjects++;
      });

      console.log('✅ [VOLUNTEER] Statistiques utilisateur calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur statistiques utilisateur:', error);
      throw error;
    }
  }

  /**
   * 🔍 RECHERCHER DES OPPORTUNITÉS DE BÉNÉVOLAT
   */
  async searchVolunteerOpportunities(searchParams) {
    try {
      console.log('🔍 [VOLUNTEER] Recherche opportunités:', searchParams);

      const opportunities = {
        tasks: [],
        projects: []
      };

      // Rechercher les tâches ouvertes
      let tasksQuery = query(
        collection(db, 'tasks'),
        where('openToVolunteers', '==', true)
      );

      if (searchParams.status) {
        tasksQuery = query(tasksQuery, where('status', '==', searchParams.status));
      }

      const tasksSnapshot = await getDocs(tasksQuery);
      tasksSnapshot.forEach(doc => {
        const taskData = { id: doc.id, ...doc.data() };
        
        // Filtrage côté client
        let matches = true;
        
        if (searchParams.keyword) {
          const keyword = searchParams.keyword.toLowerCase();
          matches = matches && (
            taskData.title?.toLowerCase().includes(keyword) ||
            taskData.description?.toLowerCase().includes(keyword)
          );
        }

        if (searchParams.skillsRequired && taskData.skillsRequired) {
          const hasRequiredSkills = searchParams.skillsRequired.some(skill =>
            taskData.skillsRequired.includes(skill)
          );
          matches = matches && hasRequiredSkills;
        }

        if (matches) {
          opportunities.tasks.push(taskData);
        }
      });

      // Rechercher les projets ouverts
      let projectsQuery = query(
        collection(db, 'projects'),
        where('openToVolunteers', '==', true)
      );

      if (searchParams.status) {
        projectsQuery = query(projectsQuery, where('status', '==', searchParams.status));
      }

      const projectsSnapshot = await getDocs(projectsQuery);
      projectsSnapshot.forEach(doc => {
        const projectData = { id: doc.id, ...doc.data() };
        
        // Filtrage côté client
        let matches = true;
        
        if (searchParams.keyword) {
          const keyword = searchParams.keyword.toLowerCase();
          matches = matches && (
            projectData.title?.toLowerCase().includes(keyword) ||
            projectData.description?.toLowerCase().includes(keyword)
          );
        }

        if (searchParams.skillsRequired && projectData.skillsToLearn) {
          const hasRequiredSkills = searchParams.skillsRequired.some(skill =>
            projectData.skillsToLearn.includes(skill)
          );
          matches = matches && hasRequiredSkills;
        }

        if (matches) {
          opportunities.projects.push(projectData);
        }
      });

      console.log('✅ [VOLUNTEER] Opportunités trouvées:', {
        tasks: opportunities.tasks.length,
        projects: opportunities.projects.length
      });

      return opportunities;

    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur recherche opportunités:', error);
      throw error;
    }
  }

  /**
   * 📧 NOTIFIER LES ADMINS D'UNE NOUVELLE DEMANDE
   */
  async notifyAdminsOfNewRequest(requestId) {
    try {
      console.log('📧 [VOLUNTEER] Notification admins:', requestId);

      const requestDoc = await getDoc(doc(db, 'volunteerRequests', requestId));
      if (!requestDoc.exists()) {
        throw new Error('Demande introuvable');
      }

      const requestData = requestDoc.data();

      // Récupérer la liste des admins
      const adminsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'admin')
      );

      const adminsSnapshot = await getDocs(adminsQuery);
      const batch = writeBatch(db);

      adminsSnapshot.forEach(doc => {
        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, {
          userId: doc.id,
          type: 'volunteer_request',
          title: 'Nouvelle demande de bénévolat',
          message: `${requestData.userName} souhaite participer à "${requestData.taskTitle || requestData.projectTitle}"`,
          requestId: requestId,
          createdAt: serverTimestamp(),
          read: false
        });
      });

      await batch.commit();
      console.log('✅ [VOLUNTEER] Admins notifiés');

    } catch (error) {
      console.warn('⚠️ [VOLUNTEER] Erreur notification admins:', error);
      // Ne pas faire échouer l'opération principale
    }
  }

  /**
   * 📈 GÉNÉRER RAPPORT DE BÉNÉVOLAT
   */
  async generateVolunteerReport(startDate, endDate) {
    try {
      console.log('📈 [VOLUNTEER] Génération rapport:', { startDate, endDate });

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Récupérer toutes les demandes dans la période
      const requestsSnapshot = await getDocs(collection(db, 'volunteerRequests'));
      const assignments = await getDocs(
        query(collection(db, 'taskAssignments'), where('isVolunteer', '==', true))
      );
      const participations = await getDocs(
        query(collection(db, 'projectParticipations'), where('isVolunteer', '==', true))
      );

      const report = {
        period: { startDate, endDate },
        summary: {
          totalRequests: 0,
          approvedRequests: 0,
          rejectedRequests: 0,
          pendingRequests: 0,
          activeVolunteers: new Set(),
          totalVolunteerHours: 0
        },
        details: {
          requestsByType: { task_volunteer: 0, project_volunteer: 0 },
          topVolunteers: {},
          popularOpportunities: {}
        }
      };

      // Analyser les demandes
      requestsSnapshot.forEach(doc => {
        const data = doc.data();
        const requestDate = data.requestedAt?.toDate();
        
        if (requestDate && requestDate >= start && requestDate <= end) {
          report.summary.totalRequests++;
          
          if (data.status === 'approved') report.summary.approvedRequests++;
          else if (data.status === 'rejected') report.summary.rejectedRequests++;
          else if (data.status === 'pending') report.summary.pendingRequests++;
          
          report.details.requestsByType[data.type]++;
          
          // Compter les volontaires actifs
          if (data.status === 'approved') {
            report.summary.activeVolunteers.add(data.userId);
          }
        }
      });

      // Analyser les assignations de tâches
      assignments.forEach(doc => {
        const data = doc.data();
        const assignDate = data.assignedAt?.toDate();
        
        if (assignDate && assignDate >= start && assignDate <= end) {
          report.summary.activeVolunteers.add(data.memberId);
          
          // Compter dans les top volontaires
          if (!report.details.topVolunteers[data.memberName]) {
            report.details.topVolunteers[data.memberName] = 0;
          }
          report.details.topVolunteers[data.memberName]++;
        }
      });

      // Analyser les participations projets
      participations.forEach(doc => {
        const data = doc.data();
        const joinDate = data.joinedAt?.toDate();
        
        if (joinDate && joinDate >= start && joinDate <= end) {
          report.summary.activeVolunteers.add(data.userId);
          
          // Compter dans les top volontaires
          if (!report.details.topVolunteers[data.userName]) {
            report.details.topVolunteers[data.userName] = 0;
          }
          report.details.topVolunteers[data.userName]++;
        }
      });

      report.summary.activeVolunteers = report.summary.activeVolunteers.size;

      console.log('✅ [VOLUNTEER] Rapport généré:', report.summary);
      return report;

    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur génération rapport:', error);
      throw error;
    }
  }

  /**
   * 🔄 ANNULER UNE DEMANDE DE VOLONTARIAT
   */
  async cancelVolunteerRequest(requestId, userId, reason = '') {
    try {
      console.log('🔄 [VOLUNTEER] Annulation demande:', requestId);

      const requestRef = doc(db, 'volunteerRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        throw new Error('Demande introuvable');
      }

      const requestData = requestDoc.data();
      
      // Vérifier que c'est bien l'utilisateur qui a fait la demande
      if (requestData.userId !== userId) {
        throw new Error('Vous ne pouvez annuler que vos propres demandes');
      }

      // On ne peut annuler que les demandes en attente
      if (requestData.status !== 'pending') {
        throw new Error('Seules les demandes en attente peuvent être annulées');
      }

      await updateDoc(requestRef, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancelledBy: userId,
        cancellationReason: reason
      });

      console.log('✅ [VOLUNTEER] Demande annulée');
      return { success: true };

    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur annulation demande:', error);
      throw error;
    }
  }
}

// Export de l'instance
export const volunteerService = new VolunteerService();) {
      console.error('❌ [VOLUNTEER] Erreur récupération demandes:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER LES DEMANDES PAR STATUT
   */
  async getVolunteerRequestsByStatus(status) {
    try {
      console.log('📋 [VOLUNTEER] Récupération demandes par statut:', status);

      const requestsQuery = query(
        collection(db, 'volunteerRequests'),
        where('status', '==', status),
        orderBy('requestedAt', 'desc')
      );
      
      const requestsSnapshot = await getDocs(requestsQuery);
      const requests = [];
      
      requestsSnapshot.forEach(doc => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ [VOLUNTEER] Demandes récupérées:', requests.length);
      return requests;

    } catch (error
