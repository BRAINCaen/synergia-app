import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  writeBatch 
} from 'firebase/firestore';
import { db } from '../../shared/config/firebase';

// Collections Firestore
const COLLECTIONS = {
  TASKS: 'tasks',
  PROJECTS: 'projects',
  USERS: 'users'
};

// ==========================================
// 🔥 TASK SERVICE (existant)
// ==========================================

export const taskService = {
  // Créer une tâche
  createTask: async (taskData) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.TASKS), {
        ...taskData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur création tâche:', error);
      throw error;
    }
  },

  // Mettre à jour une tâche
  updateTask: async (taskId, updates) => {
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur mise à jour tâche:', error);
      throw error;
    }
  },

  // Supprimer une tâche
  deleteTask: async (taskId) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.TASKS, taskId));
    } catch (error) {
      console.error('Erreur suppression tâche:', error);
      throw error;
    }
  },

  // Récupérer les tâches d'un utilisateur
  getUserTasks: async (userId) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.TASKS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erreur récupération tâches:', error);
      throw error;
    }
  },

  // S'abonner aux tâches d'un utilisateur
  subscribeToUserTasks: (userId, callback) => {
    const q = query(
      collection(db, COLLECTIONS.TASKS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(tasks);
    });
  }
};

// ==========================================
// 🏗️ PROJECT SERVICE (nouveau)
// ==========================================

export const projectService = {
  // Créer un projet
  createProject: async (projectData) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.PROJECTS), {
        ...projectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: projectData.status || 'active'
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur création projet:', error);
      throw error;
    }
  },

  // Mettre à jour un projet
  updateProject: async (projectId, updates) => {
    try {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur mise à jour projet:', error);
      throw error;
    }
  },

  // Supprimer un projet
  deleteProject: async (projectId) => {
    try {
      // Optionnel: supprimer aussi les tâches liées
      const batch = writeBatch(db);
      
      // Supprimer le projet
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
      batch.delete(projectRef);
      
      // Récupérer et supprimer les tâches liées
      const tasksQuery = query(
        collection(db, COLLECTIONS.TASKS),
        where('projectId', '==', projectId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      
      tasksSnapshot.docs.forEach(taskDoc => {
        batch.delete(taskDoc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Erreur suppression projet:', error);
      throw error;
    }
  },

  // Récupérer les projets d'un utilisateur
  getUserProjects: async (userId, filters = {}) => {
    try {
      let q = query(
        collection(db, COLLECTIONS.PROJECTS),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      // Ajouter des filtres si nécessaire
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erreur récupération projets:', error);
      throw error;
    }
  },

  // S'abonner aux projets d'un utilisateur
  subscribeToUserProjects: (userId, callback) => {
    const q = query(
      collection(db, COLLECTIONS.PROJECTS),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(projects);
    });
  },

  // Récupérer un projet par ID
  getProjectById: async (projectId) => {
    try {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
      const snapshot = await getDoc(projectRef);
      
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      return null;
    } catch (error) {
      console.error('Erreur récupération projet:', error);
      throw error;
    }
  },

  // Récupérer les tâches d'un projet
  getProjectTasks: async (projectId) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.TASKS),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erreur récupération tâches projet:', error);
      throw error;
    }
  },

  // Calculer les statistiques d'un projet
  calculateProjectStats: async (projectId) => {
    try {
      const tasks = await projectService.getProjectTasks(projectId);
      
      const total = tasks.length;
      const completed = tasks.filter(task => task.status === 'completed').length;
      const inProgress = tasks.filter(task => task.status === 'in_progress').length;
      const todo = tasks.filter(task => task.status === 'todo').length;
      
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        total,
        completed,
        inProgress,
        todo,
        progress
      };
    } catch (error) {
      console.error('Erreur calcul stats projet:', error);
      return { total: 0, completed: 0, inProgress: 0, todo: 0, progress: 0 };
    }
  }
};

// Export par défaut pour compatibilité
export default { taskService, projectService };
