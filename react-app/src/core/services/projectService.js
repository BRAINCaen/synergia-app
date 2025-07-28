// ==========================================
// 📁 react-app/src/core/services/projectService.js
// SERVICE CORRIGÉ - ORDRE DES PARAMÈTRES UNIFIÉ
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
 * 🛡️ FONCTION DE NETTOYAGE DES DONNÉES POUR FIREBASE
 * Supprime tous les champs undefined/null avant envoi
 */
const sanitizeDataForFirebase = (data) => {
  const cleanData = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Ignorer les valeurs undefined, null ou chaînes vides
    if (value !== undefined && value !== null && value !== '') {
      // Traitement spécial pour les arrays
      if (Array.isArray(value)) {
        cleanData[key] = value.filter(item => item !== undefined && item !== null && item !== '');
      }
      // Traitement spécial pour les objets
      else if (typeof value === 'object' && value !== null) {
        const cleanObject = sanitizeDataForFirebase(value);
        if (Object.keys(cleanObject).length > 0) {
          cleanData[key] = cleanObject;
        }
      }
      // Valeurs primitives
      else {
        cleanData[key] = value;
      }
    }
  }
  
  return cleanData;
};

/**
 * 📁 SERVICE COMPLET DE GESTION DES PROJETS - VERSION CORRIGÉE
 */
class ProjectService {
  constructor() {
    console.log('📁 ProjectService initialisé - Paramètres unifiés');
  }

  /**
   * ➕ CRÉER UN NOUVEAU PROJET - CORRIGÉ POUR ORDRE DES PARAMÈTRES UNIFIÉ
   * SIGNATURE FINALE: createProject(projectData, userId) - comme attendu par ProjectsPage
   */
  async createProject(projectData, userId) {
    try {
      console.log('➕ [CREATE] Création projet:', projectData?.title || 'Sans titre');
      console.log('👤 [CREATE] Utilisateur:', userId);

      // 🛡️ VALIDATION DES PARAMÈTRES OBLIGATOIRES
      if (!projectData) {
        throw new Error('Les données du projet sont requises');
      }

      if (!userId) {
        throw new Error('L\'identifiant utilisateur est requis');
      }

      if (!projectData.title || projectData.title.trim() === '') {
        throw new Error('Le titre du projet est obligatoire');
      }

      // 🧹 NETTOYAGE ET PRÉPARATION DES DONNÉES
      const baseProjectData = {
        title: projectData.title.trim(),
        description: projectData.description?.trim() || '',
        status: projectData.status || 'planning',
        priority: projectData.priority || 'medium',
        category: projectData.category || 'general',
        createdBy: userId.trim(),
        teamMembers: Array.isArray(projectData.teamMembers) 
          ? [...new Set([userId, ...projectData.teamMembers])] // Créateur toujours membre
          : [userId],
        tags: Array.isArray(projectData.tags) ? projectData.tags : [],
        budget: typeof projectData.budget === 'number' ? projectData.budget : 0,
        actualSpent: 0,
        progress: 0,
        tasks: [],
        milestones: [],
        // Timestamps Firebase
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // 🛡️ NETTOYAGE FINAL - SUPPRESSION DE TOUS LES UNDEFINED
      const cleanProjectData = sanitizeDataForFirebase(baseProjectData);

      console.log('🧹 [CREATE] Données nettoyées:', Object.keys(cleanProjectData));

      // 🔥 CRÉATION DANS FIREBASE
      const docRef = await addDoc(collection(db, 'projects'), cleanProjectData);
      
      console.log('✅ [CREATE] Projet créé avec ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...cleanProjectData
      };

    } catch (error) {
      console.error('❌ [CREATE] Erreur création projet:', error);
      throw new Error(`Erreur création projet: ${error.message}`);
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
   * 👤 RÉCUPÉRER LES PROJETS D'UN UTILISATEUR
   */
  async getUserProjects(userId) {
    try {
      console.log('👤 [GET_USER] Récupération projets utilisateur:', userId);

      if (!userId) {
        console.warn('⚠️ [GET_USER] UserId manquant');
        return [];
      }

      const userProjectsQuery = query(
        collection(db, 'projects'),
        where('teamMembers', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const projectsSnapshot = await getDocs(userProjectsQuery);
      const projects = [];
      
      projectsSnapshot.forEach(doc => {
        projects.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ [GET_USER] Projets utilisateur récupérés:', projects.length);
      return projects;

    } catch (error) {
      console.error('❌ [GET_USER] Erreur récupération projets utilisateur:', error);
      throw error;
    }
  }

  /**
   * 🔍 RÉCUPÉRER UN PROJET SPÉCIFIQUE
   */
  async getProject(projectId) {
    try {
      console.log('🔍 [GET] Récupération projet:', projectId);

      if (!projectId) {
        throw new Error('ID du projet requis');
      }

      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      
      if (!projectDoc.exists()) {
        console.warn('⚠️ [GET] Projet non trouvé:', projectId);
        return null;
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
   * ✏️ METTRE À JOUR UN PROJET - AVEC NETTOYAGE DES DONNÉES
   */
  async updateProject(projectId, updates) {
    try {
      console.log('✏️ [UPDATE] Mise à jour projet:', projectId);

      if (!projectId || !updates) {
        throw new Error('ID du projet et données de mise à jour requis');
      }

      // 🧹 NETTOYAGE DES DONNÉES DE MISE À JOUR
      const cleanUpdates = sanitizeDataForFirebase({
        ...updates,
        updatedAt: serverTimestamp()
      });

      console.log('🧹 [UPDATE] Données nettoyées:', Object.keys(cleanUpdates));

      await updateDoc(doc(db, 'projects', projectId), cleanUpdates);
      
      console.log('✅ [UPDATE] Projet mis à jour');
      
      // Retourner le projet mis à jour
      return await this.getProject(projectId);

    } catch (error) {
      console.error('❌ [UPDATE] Erreur mise à jour projet:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UN PROJET
   */
  async deleteProject(projectId) {
    try {
      console.log('🗑️ [DELETE] Suppression projet:', projectId);

      if (!projectId) {
        throw new Error('ID du projet requis');
      }

      await deleteDoc(doc(db, 'projects', projectId));
      
      console.log('✅ [DELETE] Projet supprimé:', projectId);
      return true;

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

      if (!projectId || !userId) {
        throw new Error('ID du projet et utilisateur requis');
      }

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

      if (!projectId || !userId) {
        throw new Error('ID du projet et utilisateur requis');
      }

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
   * 📊 METTRE À JOUR LA PROGRESSION DU PROJET
   */
  async updateProjectProgress(projectId) {
    try {
      console.log('📊 [PROGRESS] Calcul progression projet:', projectId);

      // Récupérer les tâches du projet
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = [];
      
      tasksSnapshot.forEach(doc => {
        tasks.push(doc.data());
      });

      // Calculer la progression
      let progress = 0;
      if (tasks.length > 0) {
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        progress = Math.round((completedTasks / tasks.length) * 100);
      }

      // Mettre à jour le projet
      await updateDoc(doc(db, 'projects', projectId), {
        progress: progress,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [PROGRESS] Progression mise à jour:', progress + '%');
      return progress;

    } catch (error) {
      console.error('❌ [PROGRESS] Erreur calcul progression:', error);
      throw error;
    }
  }

  /**
   * 🔍 RECHERCHER DES PROJETS
   */
  async searchProjects(searchTerm, filters = {}) {
    try {
      console.log('🔍 [SEARCH] Recherche projets:', searchTerm);

      let projectsQuery = collection(db, 'projects');
      
      // Appliquer les filtres
      if (filters.status) {
        projectsQuery = query(projectsQuery, where('status', '==', filters.status));
      }
      
      if (filters.priority) {
        projectsQuery = query(projectsQuery, where('priority', '==', filters.priority));
      }
      
      if (filters.category) {
        projectsQuery = query(projectsQuery, where('category', '==', filters.category));
      }

      // Ajouter l'ordre
      projectsQuery = query(projectsQuery, orderBy('updatedAt', 'desc'));
      
      const projectsSnapshot = await getDocs(projectsQuery);
      let projects = [];
      
      projectsSnapshot.forEach(doc => {
        projects.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Filtrage côté client pour la recherche textuelle
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        projects = projects.filter(project => 
          project.title?.toLowerCase().includes(searchLower) ||
          project.description?.toLowerCase().includes(searchLower) ||
          project.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

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
      
      if (!originalProject) {
        throw new Error('Projet original non trouvé');
      }

      // Préparer les données du nouveau projet
      const duplicatedProjectData = {
        title: modifications.title || `${originalProject.title} (Copie)`,
        description: originalProject.description,
        category: originalProject.category,
        priority: originalProject.priority,
        tags: originalProject.tags || [],
        budget: originalProject.budget || 0,
        status: 'planning',
        // Nouveaux champs pour la copie
        teamMembers: [userId],
        progress: 0,
        actualSpent: 0,
        tasks: [],
        milestones: [],
        ...modifications
      };

      // ✅ UTILISATION CORRECTE : createProject(projectData, userId)
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

// Export de la classe pour compatibilité
export default ProjectService;

// ✅ LOG DE CONFIRMATION DES PARAMÈTRES
console.log('✅ ProjectService - Ordre des paramètres unifié');
console.log('📋 createProject(projectData, userId) - Compatible avec ProjectsPage');
console.log('🔧 Correction appliquée pour éliminer les erreurs de paramètres');
