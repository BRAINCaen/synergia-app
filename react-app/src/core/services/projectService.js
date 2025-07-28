// ==========================================
// 📁 react-app/src/core/services/projectService.js
// SERVICE PROJETS - CORRECTION MINIMALE SANS CASSER L'EXISTANT
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
 * 📁 SERVICE COMPLET DE GESTION DES PROJETS - CORRECTION MINIMALE
 */
class ProjectService {
  constructor() {
    console.log('📁 ProjectService initialisé');
  }

  /**
   * ➕ CRÉER UN NOUVEAU PROJET - ORDRE PARAMÈTRES CORRIGÉ
   */
  async createProject(projectData, userId) {
    try {
      console.log('➕ [CREATE] Création projet:', projectData?.title || 'Sans titre');

      // Validation simple
      if (!projectData || !userId) {
        throw new Error('Données de projet et utilisateur requis');
      }

      if (!projectData.title || projectData.title.trim() === '') {
        throw new Error('Le titre du projet est obligatoire');
      }

      // Préparation des données sans sanitization complexe pour éviter les bugs
      const newProject = {
        title: projectData.title.trim(),
        description: projectData.description?.trim() || '',
        status: projectData.status || 'planning',
        priority: projectData.priority || 'medium',
        category: projectData.category || 'general',
        createdBy: userId.trim(),
        teamMembers: [userId],
        tags: projectData.tags || [],
        budget: projectData.budget || 0,
        actualSpent: 0,
        progress: 0,
        tasks: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('🔥 [CREATE] Envoi à Firebase...');
      const docRef = await addDoc(collection(db, 'projects'), newProject);
      
      console.log('✅ [CREATE] Projet créé avec ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...newProject
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
   * ✏️ METTRE À JOUR UN PROJET
   */
  async updateProject(projectId, updates) {
    try {
      console.log('✏️ [UPDATE] Mise à jour projet:', projectId);

      if (!projectId || !updates) {
        throw new Error('ID du projet et données de mise à jour requis');
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'projects', projectId), updateData);
      
      console.log('✅ [UPDATE] Projet mis à jour');
      
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
}

// Export de l'instance
export const projectService = new ProjectService();

// Export de la classe pour compatibilité
export default ProjectService;
