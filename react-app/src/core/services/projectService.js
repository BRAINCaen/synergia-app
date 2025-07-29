// ==========================================
// 📁 react-app/src/core/services/projectService.js
// VERSION ORIGINALE - RESTAURÉE COMPLÈTEMENT
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
  writeBatch,
  arrayUnion,
  arrayRemove
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
      
      // Vérifier que l'utilisateur a le droit de supprimer
      if (projectData.createdBy !== userId) {
        throw new Error('Vous n\'avez pas le droit de supprimer ce projet');
      }

      await deleteDoc(projectRef);

      console.log('✅ [DELETE] Projet supprimé');
      return { success: true };

    } catch (error) {
      console.error('❌ [DELETE] Erreur suppression projet:', error);
      throw error;
    }
  }

  /**
   * 👥 AJOUTER UN MEMBRE À L'ÉQUIPE
   */
  async addTeamMember(projectId, userId) {
    try {
      console.log('👥 [ADD_MEMBER] Ajout membre:', { projectId, userId });

      const projectRef = doc(db, 'projects', projectId);
      
      await updateDoc(projectRef, {
        teamMembers: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ [ADD_MEMBER] Membre ajouté à l\'équipe');
      return true;

    } catch (error) {
      console.error('❌ [ADD_MEMBER] Erreur ajout membre:', error);
      throw error;
    }
  }

  /**
   * 👥 RETIRER UN MEMBRE DE L'ÉQUIPE
   */
  async removeTeamMember(projectId, userId) {
    try {
      console.log('👥 [REMOVE_MEMBER] Retrait membre:', { projectId, userId });

      const projectRef = doc(db, 'projects', projectId);
      
      await updateDoc(projectRef, {
        teamMembers: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ [REMOVE_MEMBER] Membre retiré de l\'équipe');
      return true;

    } catch (error) {
      console.error('❌ [REMOVE_MEMBER] Erreur retrait membre:', error);
      throw error;
    }
  }

  /**
   * 🔄 CHANGER LE STATUT D'UN PROJET
   */
  async changeProjectStatus(projectId, newStatus, userId) {
    try {
      console.log('🔄 [STATUS] Changement statut projet:', { projectId, newStatus });

      const updates = { status: newStatus };

      // Ajouter timestamp selon le statut
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

      // Appliquer les filtres
      if (searchParams.status) {
        projectsQuery = query(projectsQuery, where('status', '==', searchParams.status));
      }

      if (searchParams.priority) {
        projectsQuery = query(projectsQuery, where('priority', '==', searchParams.priority));
      }

      if (searchParams.createdBy) {
        projectsQuery = query(projectsQuery, where('createdBy', '==', searchParams.createdBy));
      }

      // Ajouter l'ordre et la limite
      projectsQuery = query(
        projectsQuery, 
        orderBy('updatedAt', 'desc'),
        limit(searchParams.limit || 50)
      );

      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = [];

      projectsSnapshot.forEach(doc => {
        const project = { id: doc.id, ...doc.data() };

        // Filtrage textuel côté client
        if (searchParams.searchTerm) {
          const searchTerm = searchParams.searchTerm.toLowerCase();
          const matchesTitle = project.title?.toLowerCase().includes(searchTerm);
          const matchesDescription = project.description?.toLowerCase().includes(searchTerm);
          const matchesTags = project.tags?.some(tag => tag.toLowerCase().includes(searchTerm));

          if (matchesTitle || matchesDescription || matchesTags) {
            projects.push(project);
          }
        } else {
          projects.push(project);
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
   * 📊 OBTENIR LES STATISTIQUES DES PROJETS D'UN UTILISATEUR
   */
  async getUserProjectStats(userId) {
    try {
      console.log('📊 [STATS] Calcul statistiques projets utilisateur:', userId);

      const userProjects = await this.getUserProjects(userId);
      
      const stats = {
        totalProjects: userProjects.length,
        activeProjects: userProjects.filter(p => p.status === 'active').length,
        completedProjects: userProjects.filter(p => p.status === 'completed').length,
        planningProjects: userProjects.filter(p => p.status === 'planning').length,
        averageProgress: 0,
        totalBudget: userProjects.reduce((sum, p) => sum + (p.budget || 0), 0),
        totalSpent: userProjects.reduce((sum, p) => sum + (p.actualSpent || 0), 0)
      };

      // Calcul progression moyenne
      if (userProjects.length > 0) {
        const totalProgress = userProjects.reduce((sum, p) => sum + (p.progress || 0), 0);
        stats.averageProgress = Math.round(totalProgress / userProjects.length);
      }

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
