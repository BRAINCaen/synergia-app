// core/services/teamService.js
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  arrayUnion,
  arrayRemove,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

class TeamService {
  constructor() {
    this.teamCollection = collection(db, 'teams');
    this.membersCollection = collection(db, 'teamMembers');
    this.xpRequestsCollection = collection(db, 'xpRequests');
  }

  // ==========================================
  // GESTION ÉQUIPES
  // ==========================================

  /**
   * Créer une nouvelle équipe
   */
  async createTeam(teamData, creatorId) {
    try {
      const team = {
        ...teamData,
        createdBy: creatorId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        members: [creatorId],
        admins: [creatorId],
        settings: {
          xpValidationRequired: true,
          publicProjects: true,
          allowMemberInvites: true
        }
      };

      const docRef = await addDoc(this.teamCollection, team);
      
      // Ajouter le créateur comme membre admin
      await this.addTeamMember(docRef.id, creatorId, 'admin');
      
      return { id: docRef.id, ...team };
    } catch (error) {
      console.error('Erreur création équipe:', error);
      throw error;
    }
  }

  /**
   * Ajouter un membre à l'équipe
   */
  async addTeamMember(teamId, userId, role = 'member') {
    try {
      const memberData = {
        teamId,
        userId,
        role, // 'admin', 'manager', 'member'
        joinedAt: serverTimestamp(),
        status: 'active',
        permissions: {
          canCreateProjects: role === 'admin' || role === 'manager',
          canValidateXP: role === 'admin',
          canInviteMembers: role === 'admin' || role === 'manager',
          canManageTasks: true
        }
      };

      await addDoc(this.membersCollection, memberData);
      
      // Mettre à jour la liste des membres dans l'équipe
      const teamRef = doc(this.teamCollection, teamId);
      await updateDoc(teamRef, {
        members: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });

      return memberData;
    } catch (error) {
      console.error('Erreur ajout membre:', error);
      throw error;
    }
  }

  /**
   * Obtenir les membres d'une équipe avec leurs détails
   */
  async getTeamMembers(teamId) {
    try {
      const membersQuery = query(
        this.membersCollection,
        where('teamId', '==', teamId),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(membersQuery);
      const members = [];
      
      for (const doc of snapshot.docs) {
        const memberData = { id: doc.id, ...doc.data() };
        
        // Récupérer les infos utilisateur depuis la collection users
        const userDoc = await getDoc(doc(db, 'users', memberData.userId));
        if (userDoc.exists()) {
          memberData.user = userDoc.data();
        }
        
        members.push(memberData);
      }
      
      return members;
    } catch (error) {
      console.error('Erreur récupération membres:', error);
      throw error;
    }
  }

  // ==========================================
  // GESTION XP COLLABORATIVE
  // ==========================================

  /**
   * Demander validation XP pour une tâche
   */
  async requestXPValidation(requestData) {
    try {
      const xpRequest = {
        ...requestData,
        status: 'pending', // 'pending', 'approved', 'rejected'
        requestedAt: serverTimestamp(),
        requestedBy: requestData.userId,
        description: requestData.description || '',
        evidence: requestData.evidence || '', // Photos, liens, détails
        xpAmount: requestData.xpAmount,
        taskId: requestData.taskId,
        teamId: requestData.teamId
      };

      const docRef = await addDoc(this.xpRequestsCollection, xpRequest);
      return { id: docRef.id, ...xpRequest };
    } catch (error) {
      console.error('Erreur demande validation XP:', error);
      throw error;
    }
  }

  /**
   * Valider ou rejeter une demande XP (admin seulement)
   */
  async validateXPRequest(requestId, adminId, decision, feedback = '') {
    try {
      const requestRef = doc(this.xpRequestsCollection, requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        throw new Error('Demande XP introuvable');
      }

      const requestData = requestDoc.data();
      
      // Mettre à jour le statut de la demande
      await updateDoc(requestRef, {
        status: decision, // 'approved' ou 'rejected'
        validatedBy: adminId,
        validatedAt: serverTimestamp(),
        feedback: feedback,
        updatedAt: serverTimestamp()
      });

      // Si approuvé, attribuer les XP à l'utilisateur
      if (decision === 'approved') {
        await this.awardXP(requestData.userId, requestData.xpAmount, {
          reason: 'Task validation',
          taskId: requestData.taskId,
          validatedBy: adminId
        });
      }

      return { success: true, decision, feedback };
    } catch (error) {
      console.error('Erreur validation XP:', error);
      throw error;
    }
  }

  /**
   * Attribuer des XP à un utilisateur
   */
  async awardXP(userId, xpAmount, metadata = {}) {
    try {
      // Récupérer les données utilisateur actuelles
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur introuvable');
      }

      const userData = userDoc.data();
      const currentXP = userData.xp || 0;
      const newXP = currentXP + xpAmount;

      // Calculer le nouveau niveau
      const newLevel = Math.floor(newXP / 100) + 1;
      const currentLevel = userData.level || 1;
      const levelUp = newLevel > currentLevel;

      // Mettre à jour les données utilisateur
      await updateDoc(userRef, {
        xp: newXP,
        level: newLevel,
        updatedAt: serverTimestamp()
      });

      // Enregistrer l'historique XP
      await addDoc(collection(db, 'xpHistory'), {
        userId,
        xpAmount,
        previousXP: currentXP,
        newXP,
        previousLevel: currentLevel,
        newLevel,
        levelUp,
        reason: metadata.reason || 'Manual award',
        taskId: metadata.taskId || null,
        validatedBy: metadata.validatedBy || null,
        awardedAt: serverTimestamp()
      });

      return {
        success: true,
        xpAwarded: xpAmount,
        newXP,
        newLevel,
        levelUp
      };
    } catch (error) {
      console.error('Erreur attribution XP:', error);
      throw error;
    }
  }

  /**
   * Obtenir les demandes XP en attente (pour les admins)
   */
  async getPendingXPRequests(teamId) {
    try {
      const requestsQuery = query(
        this.xpRequestsCollection,
        where('teamId', '==', teamId),
        where('status', '==', 'pending'),
        orderBy('requestedAt', 'desc')
      );

      const snapshot = await getDocs(requestsQuery);
      const requests = [];

      for (const doc of snapshot.docs) {
        const requestData = { id: doc.id, ...doc.data() };
        
        // Récupérer les infos utilisateur
        const userDoc = await getDoc(doc(db, 'users', requestData.requestedBy));
        if (userDoc.exists()) {
          requestData.user = userDoc.data();
        }

        requests.push(requestData);
      }

      return requests;
    } catch (error) {
      console.error('Erreur récupération demandes XP:', error);
      throw error;
    }
  }

  // ==========================================
  // SURVEILLANCE ÉQUIPE (WHO DOES WHAT)
  // ==========================================

  /**
   * Obtenir l'activité de l'équipe en temps réel
   */
  async getTeamActivity(teamId) {
    try {
      // Obtenir tous les projets de l'équipe
      const projectsQuery = query(
        collection(db, 'projects'),
        where('teamId', '==', teamId),
        where('isActive', '==', true)
      );

      const projectsSnapshot = await getDocs(projectsQuery);
      const teamActivity = {
        projects: [],
        members: {},
        workload: {},
        needsHelp: [],
        blockers: []
      };

      for (const projectDoc of projectsSnapshot.docs) {
        const project = { id: projectDoc.id, ...projectDoc.data() };
        
        // Obtenir les tâches du projet
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('projectId', '==', project.id)
        );
        
        const tasksSnapshot = await getDocs(tasksQuery);
        project.tasks = tasksSnapshot.docs.map(taskDoc => ({
          id: taskDoc.id,
          ...taskDoc.data()
        }));

        // Analyser l'activité par membre
        project.tasks.forEach(task => {
          if (task.assignedTo) {
            // Comptabiliser la charge de travail
            if (!teamActivity.workload[task.assignedTo]) {
              teamActivity.workload[task.assignedTo] = {
                total: 0,
                pending: 0,
                inProgress: 0,
                overdue: 0
              };
            }

            teamActivity.workload[task.assignedTo].total++;
            
            if (task.status === 'pending') {
              teamActivity.workload[task.assignedTo].pending++;
            } else if (task.status === 'in-progress') {
              teamActivity.workload[task.assignedTo].inProgress++;
            }

            // Détecter les tâches en retard
            if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed') {
              teamActivity.workload[task.assignedTo].overdue++;
            }

            // Détecter les demandes d'aide
            if (task.needsHelp) {
              teamActivity.needsHelp.push({
                taskId: task.id,
                taskTitle: task.title,
                assignedTo: task.assignedTo,
                projectId: project.id,
                projectTitle: project.title,
                helpRequested: task.helpRequested || 'Non spécifié'
              });
            }

            // Détecter les bloqueurs
            if (task.status === 'blocked') {
              teamActivity.blockers.push({
                taskId: task.id,
                taskTitle: task.title,
                assignedTo: task.assignedTo,
                projectId: project.id,
                projectTitle: project.title,
                blocker: task.blocker || 'Non spécifié'
              });
            }
          }
        });

        teamActivity.projects.push(project);
      }

      return teamActivity;
    } catch (error) {
      console.error('Erreur récupération activité équipe:', error);
      throw error;
    }
  }

  /**
   * Signaler qu'une tâche a besoin d'aide
   */
  async requestTaskHelp(taskId, userId, helpMessage) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        needsHelp: true,
        helpRequested: helpMessage,
        helpRequestedBy: userId,
        helpRequestedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur demande aide tâche:', error);
      throw error;
    }
  }

  /**
   * Marquer une tâche comme bloquée
   */
  async blockTask(taskId, userId, blockerReason) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: 'blocked',
        blocker: blockerReason,
        blockedBy: userId,
        blockedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur blocage tâche:', error);
      throw error;
    }
  }

  // ==========================================
  // ÉCOUTE TEMPS RÉEL
  // ==========================================

  /**
   * S'abonner aux changements d'activité équipe
   */
  subscribeToTeamActivity(teamId, callback) {
    const projectsQuery = query(
      collection(db, 'projects'),
      where('teamId', '==', teamId)
    );

    return onSnapshot(projectsQuery, async (snapshot) => {
      try {
        const activity = await this.getTeamActivity(teamId);
        callback(activity);
      } catch (error) {
        console.error('Erreur subscription activité équipe:', error);
      }
    });
  }

  /**
   * S'abonner aux demandes XP en attente
   */
  subscribeToPendingXPRequests(teamId, callback) {
    const requestsQuery = query(
      this.xpRequestsCollection,
      where('teamId', '==', teamId),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc')
    );

    return onSnapshot(requestsQuery, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(requests);
    });
  }
}

export default new TeamService();
