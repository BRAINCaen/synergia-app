// ==========================================
// 📁 react-app/src/core/services/projectService.js
// SERVICE PROJETS COMPLET CORRIGÉ - Fix méthode getProject
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
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase.js';

// Constantes pour les statuts des projets
export const PROJECT_STATUS = {
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  VALIDATION_PENDING: 'validation_pending',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

export const PROJECT_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

/**
 * 📂 SERVICE DES PROJETS AVEC TOUTES LES MÉTHODES
 */
class ProjectService {
  constructor() {
    this.listeners = new Map();
    this.COLLECTION_NAME = 'projects';
    console.log('📂 ProjectService initialisé');
  }

  /**
   * ✅ CRÉER UN NOUVEAU PROJET
   */
  async createProject(projectData, userId) {
    try {
      console.log('📂 Création nouveau projet:', projectData.title);
      
      const project = {
        title: projectData.title || '',
        description: projectData.description || '',
        status: PROJECT_STATUS.ACTIVE,
        priority: projectData.priority || PROJECT_PRIORITIES.NORMAL,
        ownerId: userId,
        members: [userId], // Le créateur est automatiquement membre
        progress: 0,
        taskCount: 0,
        completedTaskCount: 0,
        tags: projectData.tags || [],
        category: projectData.category || '',
        startDate: projectData.startDate || null,
        endDate: projectData.endDate || null,
        estimatedHours: projectData.estimatedHours || null,
        budget: projectData.budget || null,
        objectives: projectData.objectives || [],
        deliverables: projectData.deliverables || [],
        
        // Métadonnées
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), project);
      console.log('✅ Projet créé avec ID:', docRef.id);
      
      return { 
        success: true, 
        project: { id: docRef.id, ...project },
        error: null 
      };
      
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
      return { 
        success: false, 
        project: null, 
        error: error.message 
      };
    }
  }

  /**
   * ✅ RÉCUPÉRER UN PROJET PAR SON ID
   */
  async getProject(projectId) {
    try {
      console.log('📂 Récupération projet:', projectId);
      
      const docRef = doc(db, this.COLLECTION_NAME, projectId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const projectData = { id: docSnap.id, ...docSnap.data() };
        console.log('✅ Projet trouvé:', projectData.title);
        return projectData;
      } else {
        console.log('❌ Projet non trouvé:', projectId);
        return null;
      }
      
    } catch (error) {
      console.error('❌ Erreur récupération projet:', error);
      return null;
    }
  }

  /**
   * ✅ RÉCUPÉRER TOUS LES PROJETS D'UN UTILISATEUR
   */
  async getUserProjects(userId) {
    try {
      console.log('📂 Récupération projets utilisateur:', userId);
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('ownerId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const projects = [];
      
      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('✅ Projets récupérés:', projects.length);
      return projects;
      
    } catch (error) {
      console.error('❌ Erreur récupération projets utilisateur:', error);
      return [];
    }
  }

  /**
   * ✅ METTRE À JOUR UN PROJET
   */
  async updateProject(projectId, updates, userId) {
    try {
      console.log('📂 Mise à jour projet:', projectId);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: userId
      };
      
      const docRef = doc(db, this.COLLECTION_NAME, projectId);
      await updateDoc(docRef, updateData);
      
      console.log('✅ Projet mis à jour avec succès');
      return { success: true, error: null };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour projet:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ SUPPRIMER UN PROJET
   */
  async deleteProject(projectId, userId) {
    try {
      console.log('📂 Suppression projet:', projectId);
      
      // Vérifier que l'utilisateur est le propriétaire
      const project = await this.getProject(projectId);
      if (!project) {
        throw new Error('Projet non trouvé');
      }
      
      if (project.ownerId !== userId) {
        throw new Error('Vous n\'êtes pas autorisé à supprimer ce projet');
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, projectId);
      await deleteDoc(docRef);
      
      console.log('✅ Projet supprimé avec succès');
      return { success: true, error: null };
      
    } catch (error) {
      console.error('❌ Erreur suppression projet:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ ÉCOUTER LES CHANGEMENTS DE PROJETS EN TEMPS RÉEL
   */
  subscribeToUserProjects(userId, callback) {
    try {
      console.log('📂 Abonnement temps réel projets pour:', userId);
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('ownerId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const projects = [];
        querySnapshot.forEach((doc) => {
          projects.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('🔄 Mise à jour temps réel projets:', projects.length);
        callback(projects);
      }, (error) => {
        console.error('❌ Erreur écoute projets:', error);
        callback([]);
      });
      
      this.listeners.set(`projects-${userId}`, unsubscribe);
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur setup écoute projets:', error);
      callback([]);
      return () => {};
    }
  }

  /**
   * ✅ CALCULER LA PROGRESSION D'UN PROJET
   */
  async calculateProjectProgress(projectId) {
    try {
      // Cette méthode sera utilisée par taskProjectIntegration
      const project = await this.getProject(projectId);
      if (!project) return 0;
      
      const { taskCount = 0, completedTaskCount = 0 } = project;
      return taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;
      
    } catch (error) {
      console.error('❌ Erreur calcul progression:', error);
      return 0;
    }
  }

  /**
   * ✅ OBTENIR LES STATISTIQUES DES PROJETS
   */
  async getProjectStats(userId) {
    try {
      const projects = await this.getUserProjects(userId);
      
      const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === PROJECT_STATUS.ACTIVE).length,
        completed: projects.filter(p => p.status === PROJECT_STATUS.COMPLETED).length,
        onHold: projects.filter(p => p.status === PROJECT_STATUS.ON_HOLD).length,
        cancelled: projects.filter(p => p.status === PROJECT_STATUS.CANCELLED).length,
        
        // Priorités
        highPriority: projects.filter(p => p.priority === PROJECT_PRIORITIES.HIGH).length,
        urgentPriority: projects.filter(p => p.priority === PROJECT_PRIORITIES.URGENT).length,
        
        // Progression moyenne
        averageProgress: projects.length > 0 ? 
          Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length) : 0,
        
        // Tâches totales
        totalTasks: projects.reduce((sum, p) => sum + (p.taskCount || 0), 0),
        completedTasks: projects.reduce((sum, p) => sum + (p.completedTaskCount || 0), 0)
      };
      
      console.log('📊 Statistiques projets:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur stats projets:', error);
      return {
        total: 0, active: 0, completed: 0, onHold: 0, cancelled: 0,
        highPriority: 0, urgentPriority: 0, averageProgress: 0,
        totalTasks: 0, completedTasks: 0
      };
    }
  }

  /**
   * ✅ RECHERCHER DES PROJETS
   */
  async searchProjects(userId, searchTerm) {
    try {
      const projects = await this.getUserProjects(userId);
      
      if (!searchTerm || searchTerm.trim() === '') {
        return projects;
      }
      
      const term = searchTerm.toLowerCase().trim();
      
      return projects.filter(project => 
        project.title.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term) ||
        project.category?.toLowerCase().includes(term) ||
        project.tags?.some(tag => tag.toLowerCase().includes(term))
      );
      
    } catch (error) {
      console.error('❌ Erreur recherche projets:', error);
      return [];
    }
  }

  /**
   * 🧹 NETTOYER LES LISTENERS
   */
  unsubscribeAll() {
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
    console.log('🧹 Listeners projets nettoyés');
  }
}

// ✅ EXPORT DE LA CLASSE ET DE L'INSTANCE
export default ProjectService;

// ✅ EXPORT DE L'INSTANCE SINGLETON
export const projectService = new ProjectService();

console.log('✅ ProjectService - Classe et instance exportées correctement');
