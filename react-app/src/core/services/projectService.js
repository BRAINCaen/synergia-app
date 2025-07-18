// ==========================================
// 📁 react-app/src/core/services/projectService.js
// SERVICE COMPLET DE GESTION DES PROJETS
// ==========================================

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
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 📁 SERVICE COMPLET DE GESTION DES PROJETS
 * Toutes les opérations CRUD pour les projets + bénévolat
 */
class ProjectService {
  constructor() {
    console.log('📁 ProjectService initialisé');
  }

  /**
   * ➕ CRÉER UN NOUVEAU PROJET
   */
  async createProject(projectData, userId) {
    try {
      console.log('➕ [CREATE] Création projet:', projectData.title);

      const newProject = {
        ...projectData,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: projectData.status || 'planning',
        priority: projectData.priority || 'medium',
        teamMembers: projectData.teamMembers || [userId], // Créateur automatiquement membre
        progress: 0,
        tasks: [],
        tags: projectData.tags || [],
        budget: projectData.budget || 0,
        actualSpent: 0
      };

      const docRef = await addDoc(collection(db, 'projects'), newProject);
      
      console.log('✅ [CREATE] Projet créé avec ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...newProject
      };

    } catch (error) {
      console.error('❌ [CREATE] Erreur création projet:', error);
      throw error;
    }
  }

  /**
   * 📁 RÉCUPÉRER TOUS LES PROJETS
   */
  async getAllProjects() {
    try {
      console.log('📁 [GET_ALL] Récupération de tous les projets');

      const projectsQuery = query(
        collection(db, 'projects'),
        orderBy('createdAt', 'desc')
      );
      
      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = [];
      
      projectsSnapshot.forEach(doc => {
        projects.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ [GET_ALL] Projets récupérés:', projects.length);
      return projects;

    } catch (error) {
      console.error('❌ [GET_ALL] Erreur récupération projets:', error);
      throw error;
    }
  }

  /**
   * 📄 RÉCUPÉRER UN PROJET PAR ID
   */
  async getProject(projectId) {
    try {
      console.log('📄 [GET] Récupération projet:', projectId);

      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }

      const project = {
        id: projectDoc.id,
        ...projectDoc.data()
      };

      console.log('✅ [GET] Projet récupéré:', project.title);
      return project;

    } catch (error) {
      console.error('❌ [GET] Erreur récupération projet:', error);
      throw error;
    }
  }

  /**
   * 👤 RÉCUPÉRER LES PROJETS D'UN UTILISATEUR
   */
  async getUserProjects(userId, options = {}) {
    try {
      console.log('👤 [GET_USER] Récupération projets utilisateur:', userId);

      // Récupérer les projets créés par l'utilisateur
      let createdProjectsQuery = query(
        collection(db, 'projects'),
        where('createdBy', '==', userId)
      );

      // Récupérer les projets où l'utilisateur est membre de l'équipe
      let memberProjectsQuery = query(
        collection(db, 'projects'),
        where('teamMembers', 'array-contains', userId)
      );

      // Appliquer les filtres optionnels
      if (options.status) {
        createdProjectsQuery = query(createdProjectsQuery, where('status', '==', options.status));
        memberProjectsQuery = query(memberProjectsQuery, where('status', '==', options.status));
      }

      if (options.priority) {
        createdProjectsQuery = query(createdProjectsQuery, where('priority', '==', options.priority));
        memberProjectsQuery = query(memberProjectsQuery, where('priority', '==', options.priority));
      }

      // Ordre
      createdProjectsQuery = query(createdProjectsQuery, orderBy('createdAt', 'desc'));
      memberProjectsQuery = query(memberProjectsQuery, orderBy('createdAt', 'desc'));

      // Exécuter les requêtes
      const [createdSnapshot, memberSnapshot] = await Promise.all([
        getDocs(createdProjectsQuery),
        getDocs(memberProjectsQuery)
      ]);

      const projects = new Map();

      // Ajouter les projets créés
      createdSnapshot.forEach(doc => {
        projects.set(doc.id, {
          id: doc.id,
          ...doc.data(),
          userRole: 'creator'
        });
      });

      // Ajouter les projets où l'utilisateur est membre (éviter doublons)
      memberSnapshot.forEach(doc => {
        if (!projects.has(doc.id)) {
          projects.set(doc.id, {
            id: doc.id,
            ...doc.data(),
            userRole: 'member'
          });
        }
      });

      const userProjects = Array.from(projects.values());

      // Appliquer la limite si spécifiée
      if (options.limit) {
        userProjects.splice(options.limit);
      }

      console.log('✅ [GET_USER] Projets utilisateur récupérés:', userProjects.length);
      return userProjects;

    } catch (error) {
      console.error('❌ [GET_USER] Erreur récupération projets utilisateur:', error);
      throw error;
    }
  }

  /**
   * ✏️ METTRE À JOUR UN PROJET
   */
  async updateProject(projectId, updates, userId) {
    try {
      console.log('✏️ [UPDATE] Mise à jour projet:', projectId);

      const projectRef = doc(db, 'projects', projectId);
      
      // Vérifier que le projet existe
      const projectDoc = await getDoc(projectRef);
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }

      const updatedData = {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      };

      await updateDoc(projectRef, updatedData);

      console.log('✅ [UPDATE] Projet mis à jour');
      
      return {
        id: projectId,
        ...projectDoc.data(),
        ...updatedData
      };

    } catch (error) {
      console.error('❌ [UPDATE] Erreur mise à jour projet:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UN PROJET
   */
  async deleteProject(projectId, userId) {
    try {
      console.log('🗑️ [DELETE] Suppression projet:', projectId);

      const projectRef = doc(db, 'projects', projectId);
      
      // Vérifier que le projet existe
      const projectDoc = await getDoc(projectRef);
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }

      const projectData = projectDoc.data();

      // Vérifier les permissions (seul le créateur peut supprimer)
      if (projectData.createdBy !== userId) {
        throw new Error('Vous n\'avez pas le droit de supprimer ce projet');
      }

      // Utiliser un batch pour supprimer le projet et ses données liées
      const batch = writeBatch(db);

      // Supprimer le projet
      batch.delete(projectRef);

      // Supprimer les tâches liées
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      tasksSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Supprimer les participations liées
      const participationsQuery = query(
        collection(db, 'projectParticipations'),
        where('projectId', '==', projectId)
      );

      const participationsSnapshot = await getDocs(participationsQuery);
      participationsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log('✅ [DELETE] Projet et données liées supprimés');
      return { success: true };

    } catch (error) {
      console.error('❌ [DELETE] Erreur suppression projet:', error);
      throw error;
    }
  }

  /**
   * 🙋‍♂️ REJOINDRE UN PROJET COMME BÉNÉVOLE
   */
  async joinProjectAsVolunteer(projectId, userId) {
    try {
      console.log('🙋‍♂️ [PROJECT VOLUNTEER] Candidature projet:', { projectId, userId });

      // Vérifier si le projet existe
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }

      const projectData = projectDoc.data();
      
      // Vérifier si déjà membre de l'équipe
      if (projectData.teamMembers && projectData.teamMembers.includes(userId)) {
        throw new Error('Vous faites déjà partie de ce projet');
      }

      // Récupérer les données utilisateur
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.exists() ? userDoc.data() : {};

      const batch = writeBatch(db);

      if (projectData.requiresApproval) {
        // Créer une demande pour approbation
        const volunteerRequestRef = doc(collection(db, 'volunteerRequests'));
        batch.set(volunteerRequestRef, {
          projectId,
          projectTitle: projectData.title || 'Projet sans titre',
          userId,
          userName: userData.displayName || userData.name || 'Utilisateur anonyme',
          userEmail: userData.email || '',
          requestedAt: serverTimestamp(),
          status: 'pending',
          type: 'project_volunteer',
          message: `Demande de participation au projet "${projectData.title}"`
        });

        await batch.commit();

        return {
          success: true,
          pending: true,
          message: 'Demande de participation envoyée et en attente d\'approbation'
        };

      } else {
        // Ajouter directement à l'équipe
        const currentTeam = projectData.teamMembers || [];
        batch.update(projectRef, {
          teamMembers: [...currentTeam, userId],
          updatedAt: serverTimestamp()
        });

        // Créer un enregistrement de participation
        const participationRef = doc(collection(db, 'projectParticipations'));
        batch.set(participationRef, {
          projectId,
          projectTitle: projectData.title || 'Projet sans titre',
          userId,
          userName: userData.displayName || userData.name || 'Utilisateur anonyme',
          userEmail: userData.email || '',
          joinedAt: serverTimestamp(),
          role: 'volunteer',
          isVolunteer: true,
          status: 'active'
        });

        await batch.commit();

        return {
          success: true,
          pending: false,
          message: 'Vous avez rejoint l\'équipe du projet avec succès'
        };
      }

    } catch (error) {
      console.error('❌ [PROJECT VOLUNTEER] Erreur candidature projet:', error);
      throw error;
    }
  }

  /**
   * 👥 GÉRER L'ÉQUIPE D'UN PROJET
   */
  async addTeamMember(projectId, memberId, addedBy, role = 'member') {
    try {
      console.log('👥 [TEAM] Ajout membre équipe:', { projectId, memberId, role });

      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }

      const projectData = projectDoc.data();
      const currentTeam = projectData.teamMembers || [];

      if (currentTeam.includes(memberId)) {
        throw new Error('Cette personne fait déjà partie de l\'équipe');
      }

      // Récupérer les données du nouveau membre
      const memberDoc = await getDoc(doc(db, 'users', memberId));
      const memberData = memberDoc.exists() ? memberDoc.data() : {};

      const batch = writeBatch(db);

      // Mettre à jour la liste des membres
      batch.update(projectRef, {
        teamMembers: [...currentTeam, memberId],
        updatedAt: serverTimestamp()
      });

      // Créer un enregistrement de participation
      const participationRef = doc(collection(db, 'projectParticipations'));
      batch.set(participationRef, {
        projectId,
        projectTitle: projectData.title || 'Projet sans titre',
        userId: memberId,
        userName: memberData.displayName || memberData.name || 'Utilisateur anonyme',
        userEmail: memberData.email || '',
        joinedAt: serverTimestamp(),
        addedBy,
        role,
        isVolunteer: false,
        status: 'active'
      });

      await batch.commit();

      console.log('✅ [TEAM] Membre ajouté à l\'équipe');
      return { success: true };

    } catch (error) {
      console.error('❌ [TEAM] Erreur ajout membre équipe:', error);
      throw error;
    }
  }

  /**
   * 🚪 RETIRER UN MEMBRE DE L'ÉQUIPE
   */
  async removeTeamMember(projectId, memberId, removedBy) {
    try {
      console.log('🚪 [TEAM] Retrait membre équipe:', { projectId, memberId });

      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }

      const projectData = projectDoc.data();
      const currentTeam = projectData.teamMembers || [];

      if (!currentTeam.includes(memberId)) {
        throw new Error('Cette personne ne fait pas partie de l\'équipe');
      }

      // Ne pas permettre de retirer le créateur
      if (projectData.createdBy === memberId) {
        throw new Error('Le créateur du projet ne peut pas être retiré de l\'équipe');
      }

      const batch = writeBatch(db);

      // Mettre à jour la liste des membres
      const newTeam = currentTeam.filter(id => id !== memberId);
      batch.update(projectRef, {
        teamMembers: newTeam,
        updatedAt: serverTimestamp()
      });

      // Mettre à jour le statut de participation
      const participationQuery = query(
        collection(db, 'projectParticipations'),
        where('projectId', '==', projectId),
        where('userId', '==', memberId)
      );

      const participationSnapshot = await getDocs(participationQuery);
      participationSnapshot.forEach(doc => {
        batch.update(doc.ref, {
          status: 'removed',
          removedAt: serverTimestamp(),
          removedBy
        });
      });

      await batch.commit();

      console.log('✅ [TEAM] Membre retiré de l\'équipe');
      return { success: true };

    } catch (error) {
      console.error('❌ [TEAM] Erreur retrait membre équipe:', error);
      throw error;
    }
  }

  /**
   * 📊 METTRE À JOUR LE STATUT D'UN PROJET
   */
  async updateProjectStatus(projectId, newStatus, userId) {
    try {
      console.log('📊 [STATUS] Changement statut projet:', { projectId, newStatus });

      const updates = {
        status: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      };

      // Ajouter des timestamps spécifiques selon le statut
      if (newStatus === 'active') {
        updates.startedAt = serverTimestamp();
      } else if (newStatus === 'completed') {
        updates.completedAt = serverTimestamp();
      } else if (newStatus === 'cancelled') {
        updates.cancelledAt = serverTimestamp();
      }

      await this.updateProject(projectId, updates, userId);

      console.log('✅ [STATUS] Statut mis à jour vers:', newStatus);
      return { success: true };

    } catch (error) {
      console.error('❌ [STATUS] Erreur changement statut:', error);
      throw error;
    }
  }

  /**
   * 📈 CALCULER LA PROGRESSION D'UN PROJET
   */
  async calculateProjectProgress(projectId) {
    try {
      console.log('📈 [PROGRESS] Calcul progression projet:', projectId);

      // Récupérer toutes les tâches du projet
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      
      tasksSnapshot.forEach(doc => {
        tasks.push(doc.data());
      });

      if (tasks.length === 0) {
        return 0;
      }

      // Calculer le pourcentage de tâches terminées
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const progress = Math.round((completedTasks / tasks.length) * 100);

      // Mettre à jour le projet avec la nouvelle progression
      await this.updateProject(projectId, { progress }, 'system');

      console.log('✅ [PROGRESS] Progression calculée:', progress + '%');
      return progress;

    } catch (error) {
      console.error('❌ [PROGRESS] Erreur calcul progression:', error);
      throw error;
    }
  }

  /**
   * 🔍 RECHERCHER DES PROJETS
   */
  async searchProjects(searchParams, userId) {
    try {
      console.log('🔍 [SEARCH] Recherche projets:', searchParams);

      let projectsQuery = collection(db, 'projects');

      // Filtres de base
      if (searchParams.createdBy) {
        projectsQuery = query(projectsQuery, where('createdBy', '==', searchParams.createdBy));
      } else if (searchParams.userProjects && userId) {
        // Rechercher dans les projets de l'utilisateur
        projectsQuery = query(projectsQuery, where('teamMembers', 'array-contains', userId));
      }

      if (searchParams.status) {
        projectsQuery = query(projectsQuery, where('status', '==', searchParams.status));
      }

      if (searchParams.priority) {
        projectsQuery = query(projectsQuery, where('priority', '==', searchParams.priority));
      }

      // Ordre
      projectsQuery = query(projectsQuery, orderBy('createdAt', 'desc'));

      // Limite
      if (searchParams.limit) {
        projectsQuery = query(projectsQuery, limit(searchParams.limit));
      }

      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = [];
      
      projectsSnapshot.forEach(doc => {
        const projectData = { id: doc.id, ...doc.data() };
        
        // Filtrage côté client pour les critères complexes
        let matches = true;
        
        if (searchParams.keyword) {
          const keyword = searchParams.keyword.toLowerCase();
          matches = matches && (
            projectData.title?.toLowerCase().includes(keyword) ||
            projectData.description?.toLowerCase().includes(keyword) ||
            projectData.tags?.some(tag => tag.toLowerCase().includes(keyword))
          );
        }

        if (searchParams.deadlineBefore) {
          const deadline = projectData.deadline?.toDate ? projectData.deadline.toDate() : new Date(projectData.deadline);
          matches = matches && deadline && deadline <= new Date(searchParams.deadlineBefore);
        }

        if (searchParams.deadlineAfter) {
          const deadline = projectData.deadline?.toDate ? projectData.deadline.toDate() : new Date(projectData.deadline);
          matches = matches && deadline && deadline >= new Date(searchParams.deadlineAfter);
        }

        if (matches) {
          projects.push(projectData);
        }
      });

      console.log('✅ [SEARCH] Projets trouvés:', projects.length);
      return projects;

    } catch (error) {
      console.error('❌ [SEARCH] Erreur recherche projets:', error);
      throw error;
    }
  }

  /**
   * 📊 STATISTIQUES DES PROJETS
   */
  async getProjectStats(userId) {
    try {
      console.log('📊 [STATS] Calcul statistiques projets:', userId);

      const userProjects = await this.getUserProjects(userId);

      const stats = {
        total: userProjects.length,
        planning: 0,
        active: 0,
        onHold: 0,
        completed: 0,
        cancelled: 0,
        averageProgress: 0,
        totalBudget: 0,
        totalSpent: 0
      };

      let totalProgress = 0;

      userProjects.forEach(project => {
        // Comptage par statut
        switch (project.status) {
          case 'planning':
            stats.planning++;
            break;
          case 'active':
            stats.active++;
            break;
          case 'on_hold':
            stats.onHold++;
            break;
          case 'completed':
            stats.completed++;
            break;
          case 'cancelled':
            stats.cancelled++;
            break;
        }

        // Progression moyenne
        if (project.progress) {
          totalProgress += project.progress;
        }

        // Budget
        if (project.budget) {
          stats.totalBudget += project.budget;
        }
        if (project.actualSpent) {
          stats.totalSpent += project.actualSpent;
        }
      });

      stats.averageProgress = userProjects.length > 0 ? 
        Math.round(totalProgress / userProjects.length) : 0;

      console.log('✅ [STATS] Statistiques calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ [STATS] Erreur calcul statistiques:', error);
      throw error;
    }
  }

  /**
   * 📋 DUPLIQUER UN PROJET
   */
  async duplicateProject(projectId, userId, modifications = {}) {
    try {
      console.log('📋 [DUPLICATE] Duplication projet:', projectId);

      const originalProject = await this.getProject(projectId);
      
      // Préparer les données du nouveau projet
      const duplicatedProjectData = {
        ...originalProject,
        title: modifications.title || `${originalProject.title} (Copie)`,
        status: 'planning',
        teamMembers: [userId], // Seul le créateur dans la nouvelle équipe
        progress: 0,
        tasks: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        // Retirer les champs qui ne doivent pas être dupliqués
        id: undefined,
        completedAt: undefined,
        completedBy: undefined,
        startedAt: undefined,
        actualSpent: 0,
        ...modifications
      };

      const newProject = await this.createProject(duplicatedProjectData, userId);

      console.log('✅ [DUPLICATE] Projet dupliqué:', newProject.id);
      return newProject;

    } catch (error) {
      console.error('❌ [DUPLICATE] Erreur duplication projet:', error);
      throw error;
    }
  }
}

// Export de l'instance
export const projectService = new ProjectService();
