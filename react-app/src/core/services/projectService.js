// core/services/projectService.js - VERSION COLLABORATIVE
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

class CollaborativeProjectService {
  constructor() {
    this.projectsCollection = collection(db, 'projects');
    this.tasksCollection = collection(db, 'tasks');
  }

  // ==========================================
  // PROJETS COLLABORATIFS
  // ==========================================

  /**
   * Créer un projet collaboratif
   */
  async createProject(projectData, creatorId, teamId) {
    try {
      const project = {
        ...projectData,
        createdBy: creatorId,
        teamId: teamId, // Projet appartient à l'équipe
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Propriétés collaboratives
        visibility: projectData.visibility || 'team', // 'team', 'public', 'private'
        members: [creatorId], // Membres assignés au projet
        managers: [creatorId], // Gestionnaires du projet
        
        // Statistiques équipe
        stats: {
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          inProgressTasks: 0,
          overdueTasks: 0,
          totalXPAwarded: 0
        },
        
        // Métadonnées collaboration
        collaboration: {
          allowMemberAddition: true,
          requireApprovalForTasks: false,
          enableComments: true,
          enableFileSharing: true
        },

        isActive: true,
        progress: 0
      };

      const docRef = await addDoc(this.projectsCollection, project);
      return { id: docRef.id, ...project };
    } catch (error) {
      console.error('Erreur création projet collaboratif:', error);
      throw error;
    }
  }

  /**
   * Ajouter un membre au projet
   */
  async addProjectMember(projectId, userId, role = 'member') {
    try {
      const projectRef = doc(this.projectsCollection, projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }

      const updates = {
        members: arrayUnion(userId),
        updatedAt: serverTimestamp()
      };

      // Si c'est un manager, l'ajouter aussi aux managers
      if (role === 'manager') {
        updates.managers = arrayUnion(userId);
      }

      await updateDoc(projectRef, updates);

      // Enregistrer l'historique d'ajout
      await addDoc(collection(db, 'projectHistory'), {
        projectId,
        action: 'member_added',
        userId: userId,
        role: role,
        timestamp: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur ajout membre projet:', error);
      throw error;
    }
  }

  /**
   * Obtenir tous les projets d'une équipe (visibles par tous)
   */
  async getTeamProjects(teamId, userId = null) {
    try {
      let projectsQuery;
      
      if (userId) {
        // Obtenir les projets où l'utilisateur est membre OU les projets publics de l'équipe
        projectsQuery = query(
          this.projectsCollection,
          where('teamId', '==', teamId),
          where('isActive', '==', true),
          orderBy('updatedAt', 'desc')
        );
      } else {
        // Admin - voir tous les projets de l'équipe
        projectsQuery = query(
          this.projectsCollection,
          where('teamId', '==', teamId),
          orderBy('updatedAt', 'desc')
        );
      }

      const snapshot = await getDocs(projectsQuery);
      const projects = [];

      for (const doc of snapshot.docs) {
        const projectData = { id: doc.id, ...doc.data() };
        
        // Filtrer selon la visibilité
        if (userId && projectData.visibility === 'private' && 
            !projectData.members.includes(userId)) {
          continue; // Ignorer les projets privés où l'utilisateur n'est pas membre
        }

        // Récupérer les tâches du projet pour calculer les stats
        const tasksSnapshot = await getDocs(
          query(this.tasksCollection, where('projectId', '==', doc.id))
        );
        
        const tasks = tasksSnapshot.docs.map(taskDoc => ({
          id: taskDoc.id,
          ...taskDoc.data()
        }));

        // Calculer les statistiques temps réel
        const stats = this.calculateProjectStats(tasks);
        projectData.stats = stats;
        projectData.tasks = tasks;

        // Récupérer les infos des membres
        projectData.memberDetails = await this.getProjectMemberDetails(projectData.members);

        projects.push(projectData);
      }

      return projects;
    } catch (error) {
      console.error('Erreur récupération projets équipe:', error);
      throw error;
    }
  }

  /**
   * Calculer les statistiques d'un projet
   */
  calculateProjectStats(tasks) {
    const stats = {
      totalTasks: tasks.length,
      completedTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      overdueTasks: 0,
      blockedTasks: 0,
      totalXPAwarded: 0,
      memberContribution: {},
      avgCompletionTime: 0,
      productivity: 0
    };

    const now = new Date();
    let totalCompletionDays = 0;
    let completedCount = 0;

    tasks.forEach(task => {
      // Comptage par statut
      switch (task.status) {
        case 'completed':
          stats.completedTasks++;
          completedCount++;
          // Calculer temps de completion
          if (task.completedAt && task.createdAt) {
            const createdDate = task.createdAt?.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
            const completedDate = task.completedAt?.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
            const daysDiff = (completedDate - createdDate) / (1000 * 60 * 60 * 24);
            totalCompletionDays += daysDiff;
          }
          break;
        case 'in-progress':
          stats.inProgressTasks++;
          break;
        case 'blocked':
          stats.blockedTasks++;
          break;
        default:
          stats.pendingTasks++;
      }

      // Tâches en retard
      if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed') {
        stats.overdueTasks++;
      }

      // XP total attribué
      if (task.xpAwarded) {
        stats.totalXPAwarded += task.xpAwarded;
      }

      // Contribution par membre
      if (task.assignedTo) {
        if (!stats.memberContribution[task.assignedTo]) {
          stats.memberContribution[task.assignedTo] = {
            total: 0,
            completed: 0,
            pending: 0,
            inProgress: 0,
            overdue: 0,
            xpEarned: 0
          };
        }

        stats.memberContribution[task.assignedTo].total++;
        
        if (task.status === 'completed') {
          stats.memberContribution[task.assignedTo].completed++;
          stats.memberContribution[task.assignedTo].xpEarned += task.xpAwarded || 0;
        } else if (task.status === 'in-progress') {
          stats.memberContribution[task.assignedTo].inProgress++;
        } else {
          stats.memberContribution[task.assignedTo].pending++;
        }

        if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed') {
          stats.memberContribution[task.assignedTo].overdue++;
        }
      }
    });

    // Calculer le temps moyen de completion
    if (completedCount > 0) {
      stats.avgCompletionTime = Math.round(totalCompletionDays / completedCount);
    }

    // Calculer la productivité (% de tâches complétées à temps)
    const tasksWithDeadlines = tasks.filter(task => task.dueDate);
    const completedOnTime = tasksWithDeadlines.filter(task => 
      task.status === 'completed' && 
      task.completedAt &&
      new Date(task.completedAt) <= new Date(task.dueDate)
    );
    
    if (tasksWithDeadlines.length > 0) {
      stats.productivity = Math.round((completedOnTime.length / tasksWithDeadlines.length) * 100);
    }

    return stats;
  }

  /**
   * Obtenir les détails des membres d'un projet
   */
  async getProjectMemberDetails(memberIds) {
    try {
      const members = [];
      
      for (const memberId of memberIds) {
        const userDoc = await getDoc(doc(db, 'users', memberId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          members.push({
            id: memberId,
            displayName: userData.displayName || userData.email,
            email: userData.email,
            level: userData.level || 1,
            xp: userData.xp || 0,
            avatar: userData.photoURL || null,
            lastActive: userData.lastActivity || null
          });
        }
      }
      
      return members;
    } catch (error) {
      console.error('Erreur récupération détails membres:', error);
      return [];
    }
  }

  // ==========================================
  // GESTION AVANCÉE PROJETS
  // ==========================================

  /**
   * Obtenir le tableau de bord d'un projet (vue détaillée)
   */
  async getProjectDashboard(projectId, userId) {
    try {
      const projectDoc = await getDoc(doc(this.projectsCollection, projectId));
      
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }

      const project = { id: projectId, ...projectDoc.data() };

      // Vérifier les permissions
      if (project.visibility === 'private' && !project.members.includes(userId)) {
        throw new Error('Accès non autorisé à ce projet');
      }

      // Récupérer toutes les tâches
      const tasksSnapshot = await getDocs(
        query(
          this.tasksCollection, 
          where('projectId', '==', projectId),
          orderBy('createdAt', 'desc')
        )
      );

      const tasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculer les métriques avancées
      const stats = this.calculateProjectStats(tasks);
      const timeline = this.generateProjectTimeline(tasks);
      const memberDetails = await this.getProjectMemberDetails(project.members);

      // Analyser les goulots d'étranglement
      const bottlenecks = this.identifyBottlenecks(tasks, memberDetails);

      // Prédictions basées sur l'historique
      const predictions = this.calculateProjectPredictions(tasks, stats);

      return {
        project,
        tasks,
        stats,
        timeline,
        members: memberDetails,
        bottlenecks,
        predictions,
        permissions: {
          canEdit: project.managers.includes(userId) || project.createdBy === userId,
          canDelete: project.createdBy === userId,
          canAddMembers: project.managers.includes(userId) || project.createdBy === userId,
          canAssignTasks: project.members.includes(userId)
        }
      };
    } catch (error) {
      console.error('Erreur récupération dashboard projet:', error);
      throw error;
    }
  }

  /**
   * Générer la timeline du projet
   */
  generateProjectTimeline(tasks) {
    const timeline = [];
    
    tasks.forEach(task => {
      // Création de tâche
      timeline.push({
        type: 'task_created',
        taskId: task.id,
        taskTitle: task.title,
        userId: task.createdBy,
        timestamp: task.createdAt,
        data: { priority: task.priority }
      });

      // Assignation
      if (task.assignedTo) {
        timeline.push({
          type: 'task_assigned',
          taskId: task.id,
          taskTitle: task.title,
          userId: task.assignedTo,
          timestamp: task.assignedAt || task.createdAt,
          data: { assignedBy: task.assignedBy }
        });
      }

      // Completion
      if (task.status === 'completed' && task.completedAt) {
        timeline.push({
          type: 'task_completed',
          taskId: task.id,
          taskTitle: task.title,
          userId: task.assignedTo,
          timestamp: task.completedAt,
          data: { xpAwarded: task.xpAwarded }
        });
      }
    });

    // Trier par timestamp
    timeline.sort((a, b) => {
      const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return dateB - dateA;
    });

    return timeline.slice(0, 50); // Limiter aux 50 derniers événements
  }

  /**
   * Identifier les goulots d'étranglement
   */
  identifyBottlenecks(tasks, members) {
    const bottlenecks = [];

    // Analyser la charge de travail par membre
    members.forEach(member => {
      const memberTasks = tasks.filter(task => task.assignedTo === member.id);
      const overdueTasks = memberTasks.filter(task => 
        task.dueDate && 
        new Date(task.dueDate) < new Date() && 
        task.status !== 'completed'
      );

      if (overdueTasks.length > 2) {
        bottlenecks.push({
          type: 'overloaded_member',
          memberId: member.id,
          memberName: member.displayName,
          overdueTasks: overdueTasks.length,
          totalTasks: memberTasks.length,
          severity: overdueTasks.length > 5 ? 'high' : 'medium'
        });
      }
    });

    // Identifier les tâches bloquées depuis longtemps
    const blockedTasks = tasks.filter(task => task.status === 'blocked');
    blockedTasks.forEach(task => {
      const blockedDate = task.blockedAt?.toDate ? task.blockedAt.toDate() : new Date(task.blockedAt);
      const daysSinceBlocked = (new Date() - blockedDate) / (1000 * 60 * 60 * 24);
      
      if (daysSinceBlocked > 3) {
        bottlenecks.push({
          type: 'long_blocked_task',
          taskId: task.id,
          taskTitle: task.title,
          daysSinceBlocked: Math.round(daysSinceBlocked),
          blocker: task.blocker,
          severity: daysSinceBlocked > 7 ? 'high' : 'medium'
        });
      }
    });

    return bottlenecks;
  }

  /**
   * Calculer les prédictions du projet
   */
  calculateProjectPredictions(tasks, stats) {
    const predictions = {};

    // Prédiction date de fin basée sur la vélocité actuelle
    if (stats.completedTasks > 0 && stats.totalTasks > stats.completedTasks) {
      const completedTasks = tasks.filter(task => task.status === 'completed');
      if (completedTasks.length >= 3) {
        // Calculer la vélocité (tâches par jour)
        const completionDates = completedTasks
          .map(task => task.completedAt?.toDate ? task.completedAt.toDate() : new Date(task.completedAt))
          .sort((a, b) => a - b);
        
        const firstCompletion = completionDates[0];
        const lastCompletion = completionDates[completionDates.length - 1];
        const timeSpan = (lastCompletion - firstCompletion) / (1000 * 60 * 60 * 24);
        
        if (timeSpan > 0) {
          const velocity = completedTasks.length / timeSpan; // tâches par jour
          const remainingTasks = stats.totalTasks - stats.completedTasks;
          const daysToComplete = remainingTasks / velocity;
          
          const estimatedCompletion = new Date();
          estimatedCompletion.setDate(estimatedCompletion.getDate() + Math.ceil(daysToComplete));
          
          predictions.estimatedCompletion = estimatedCompletion;
          predictions.confidence = Math.min(95, Math.max(60, (completedTasks.length / stats.totalTasks) * 100));
        }
      }
    }

    // Prédiction de risque basée sur les tendances
    let riskScore = 0;
    if (stats.overdueTasks > 0) riskScore += (stats.overdueTasks / stats.totalTasks) * 30;
    if (stats.blockedTasks > 0) riskScore += (stats.blockedTasks / stats.totalTasks) * 40;
    if (stats.productivity < 70) riskScore += (70 - stats.productivity) * 0.5;

    predictions.riskLevel = riskScore > 50 ? 'high' : riskScore > 25 ? 'medium' : 'low';
    predictions.riskScore = Math.round(riskScore);

    return predictions;
  }

  // ==========================================
  // ÉCOUTE TEMPS RÉEL
  // ==========================================

  /**
   * S'abonner aux changements d'un projet
   */
  subscribeToProject(projectId, callback) {
    const projectRef = doc(this.projectsCollection, projectId);
    
    return onSnapshot(projectRef, async (doc) => {
      if (doc.exists()) {
        try {
          const projectData = await this.getProjectDashboard(projectId, 'system');
          callback(projectData);
        } catch (error) {
          console.error('Erreur subscription projet:', error);
        }
      }
    });
  }

  /**
   * S'abonner aux projets d'une équipe
   */
  subscribeToTeamProjects(teamId, userId, callback) {
    const projectsQuery = query(
      this.projectsCollection,
      where('teamId', '==', teamId),
      where('isActive', '==', true)
    );

    return onSnapshot(projectsQuery, async (snapshot) => {
      try {
        const projects = await this.getTeamProjects(teamId, userId);
        callback(projects);
      } catch (error) {
        console.error('Erreur subscription projets équipe:', error);
      }
    });
  }
}

export default new CollaborativeProjectService();
