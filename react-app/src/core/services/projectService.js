// src/core/services/projectService.js
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
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { firebaseDb } from '../firebase.js';
import { taskService } from './taskService.js';

const PROJECTS_COLLECTION = 'projects';

class ProjectService {
  constructor() {
    this.db = firebaseDb;
  }

  // Créer un projet
  async createProject(projectData, userId) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      const project = {
        ...projectData,
        ownerId: userId,
        members: [userId], // Le créateur est automatiquement membre
        status: projectData.status || 'active',
        progress: 0,
        taskCount: 0,
        completedTaskCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tags: projectData.tags || [],
        settings: {
          isPublic: projectData.settings?.isPublic || false,
          allowJoin: projectData.settings?.allowJoin || false,
          ...projectData.settings
        }
      };

      const docRef = await addDoc(collection(this.db, PROJECTS_COLLECTION), project);
      
      console.log('✅ Projet créé:', docRef.id);
      return { id: docRef.id, ...project };
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
      throw error;
    }
  }

  // Mettre à jour un projet
  async updateProject(projectId, updates, userId) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      const projectRef = doc(this.db, PROJECTS_COLLECTION, projectId);
      
      // Vérifier les permissions (propriétaire ou membre)
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) {
        throw new Error('Projet non trouvé');
      }

      const projectData = projectSnap.data();
      if (projectData.ownerId !== userId && !projectData.members?.includes(userId)) {
        throw new Error('Accès refusé');
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(projectRef, updateData);
      
      console.log('✅ Projet mis à jour:', projectId);
      return { id: projectId, ...projectData, ...updateData };
    } catch (error) {
      console.error('❌ Erreur mise à jour projet:', error);
      throw error;
    }
  }

  // Supprimer un projet
  async deleteProject(projectId, userId) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      const projectRef = doc(this.db, PROJECTS_COLLECTION, projectId);
      
      // Vérifier que l'utilisateur est le propriétaire
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists() || projectSnap.data().ownerId !== userId) {
        throw new Error('Projet non trouvé ou accès refusé');
      }

      // Supprimer toutes les tâches associées au projet
      const projectTasks = await taskService.getUserTasks(userId, { projectId });
      for (const task of projectTasks) {
        await taskService.deleteTask(task.id, userId);
      }

      await deleteDoc(projectRef);
      
      console.log('✅ Projet supprimé:', projectId);
      return projectId;
    } catch (error) {
      console.error('❌ Erreur suppression projet:', error);
      throw error;
    }
  }

  // Récupérer les projets d'un utilisateur
  async getUserProjects(userId, filters = {}) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      let q = query(
        collection(this.db, PROJECTS_COLLECTION),
        where('members', 'array-contains', userId)
      );

      // Appliquer les filtres
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      // Trier par date de création (plus récent en premier)
      q = query(q, orderBy('createdAt', 'desc'));

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const projects = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projects.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          dueDate: data.dueDate?.toDate()
        });
      });

      // Calculer les statistiques pour chaque projet
      const projectsWithStats = await Promise.all(
        projects.map(async (project) => {
          const stats = await this.getProjectStats(project.id, userId);
          return { ...project, ...stats };
        })
      );

      console.log(`✅ ${projects.length} projets récupérés pour l'utilisateur ${userId}`);
      return projectsWithStats;
    } catch (error) {
      console.error('❌ Erreur récupération projets:', error);
      throw error;
    }
  }

  // Écouter les changements de projets en temps réel
  subscribeToUserProjects(userId, callback, filters = {}) {
    if (!this.db) {
      console.warn('Firebase non configuré - Mode offline');
      return () => {};
    }

    try {
      let q = query(
        collection(this.db, PROJECTS_COLLECTION),
        where('members', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const projects = [];
        
        for (const doc of snapshot.docs) {
          const data = doc.data();
          const stats = await this.getProjectStats(doc.id, userId);
          
          projects.push({
            id: doc.id,
            ...data,
            ...stats,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            dueDate: data.dueDate?.toDate()
          });
        }

        callback(projects);
      }, (error) => {
        console.error('❌ Erreur écoute projets:', error);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur abonnement projets:', error);
      return () => {};
    }
  }

  // Récupérer un projet par ID
  async getProjectById(projectId, userId) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      const projectRef = doc(this.db, PROJECTS_COLLECTION, projectId);
      const projectSnap = await getDoc(projectRef);

      if (!projectSnap.exists()) {
        throw new Error('Projet non trouvé');
      }

      const data = projectSnap.data();
      
      // Vérifier les permissions
      if (!data.members?.includes(userId) && data.ownerId !== userId) {
        throw new Error('Accès refusé');
      }

      const stats = await this.getProjectStats(projectId, userId);

      return {
        id: projectSnap.id,
        ...data,
        ...stats,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        dueDate: data.dueDate?.toDate()
      };
    } catch (error) {
      console.error('❌ Erreur récupération projet:', error);
      throw error;
    }
  }

  // Statistiques d'un projet
  async getProjectStats(projectId, userId) {
    try {
      // Récupérer toutes les tâches du projet
      const projectTasks = await taskService.getUserTasks(userId, { projectId });
      
      const stats = {
        taskCount: projectTasks.length,
        completedTaskCount: projectTasks.filter(task => task.status === 'completed').length,
        inProgressTaskCount: projectTasks.filter(task => task.status === 'in_progress').length,
        todoTaskCount: projectTasks.filter(task => task.status === 'todo').length,
        progress: 0,
        totalXpEarned: projectTasks
          .filter(task => task.status === 'completed')
          .reduce((sum, task) => sum + (task.xpReward || 0), 0)
      };

      // Calculer le pourcentage de progression
      stats.progress = stats.taskCount > 0 
        ? Math.round((stats.completedTaskCount / stats.taskCount) * 100) 
        : 0;

      return stats;
    } catch (error) {
      console.error('❌ Erreur statistiques projet:', error);
      return {
        taskCount: 0,
        completedTaskCount: 0,
        inProgressTaskCount: 0,
        todoTaskCount: 0,
        progress: 0,
        totalXpEarned: 0
      };
    }
  }

  // Ajouter un membre au projet
  async addMember(projectId, memberUserId, currentUserId) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      const projectRef = doc(this.db, PROJECTS_COLLECTION, projectId);
      const projectSnap = await getDoc(projectRef);

      if (!projectSnap.exists()) {
        throw new Error('Projet non trouvé');
      }

      const projectData = projectSnap.data();
      
      // Vérifier que l'utilisateur actuel est le propriétaire
      if (projectData.ownerId !== currentUserId) {
        throw new Error('Seul le propriétaire peut ajouter des membres');
      }

      // Vérifier que le membre n'est pas déjà dans le projet
      if (projectData.members?.includes(memberUserId)) {
        throw new Error('L\'utilisateur est déjà membre du projet');
      }

      await updateDoc(projectRef, {
        members: arrayUnion(memberUserId),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Membre ajouté au projet:', memberUserId);
      return true;
    } catch (error) {
      console.error('❌ Erreur ajout membre:', error);
      throw error;
    }
  }

  // Retirer un membre du projet
  async removeMember(projectId, memberUserId, currentUserId) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      const projectRef = doc(this.db, PROJECTS_COLLECTION, projectId);
      const projectSnap = await getDoc(projectRef);

      if (!projectSnap.exists()) {
        throw new Error('Projet non trouvé');
      }

      const projectData = projectSnap.data();
      
      // Vérifier les permissions (propriétaire ou se retirer soi-même)
      if (projectData.ownerId !== currentUserId && memberUserId !== currentUserId) {
        throw new Error('Permission refusée');
      }

      // Empêcher le propriétaire de se retirer
      if (memberUserId === projectData.ownerId) {
        throw new Error('Le propriétaire ne peut pas être retiré du projet');
      }

      await updateDoc(projectRef, {
        members: arrayRemove(memberUserId),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Membre retiré du projet:', memberUserId);
      return true;
    } catch (error) {
      console.error('❌ Erreur retrait membre:', error);
      throw error;
    }
  }

  // Rechercher des projets publics
  async searchPublicProjects(searchTerm, limit = 10) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      let q = query(
        collection(this.db, PROJECTS_COLLECTION),
        where('settings.isPublic', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      const projects = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Filtrer par terme de recherche si fourni
        if (!searchTerm || 
            data.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            data.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
          
          projects.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          });
        }
      });

      console.log(`✅ ${projects.length} projets publics trouvés`);
      return projects;
    } catch (error) {
      console.error('❌ Erreur recherche projets publics:', error);
      throw error;
    }
  }
}

// Instance singleton
export const projectService = new ProjectService();
export default projectService;
