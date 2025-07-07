// ==========================================
// 📁 react-app/src/core/services/taskService.js
// CORRECTION - Ajout méthode getTask manquante
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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase.js';

// Constantes pour les statuts des tâches
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  VALIDATION_PENDING: 'validation_pending',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
};

/**
 * ✅ SERVICE DES TÂCHES AVEC MÉTHODE getTask AJOUTÉE
 */
class TaskService {
  constructor() {
    this.listeners = new Map();
    this.COLLECTION_NAME = 'tasks';
    console.log('✅ TaskService initialisé avec getTask');
  }

  /**
   * ✅ RÉCUPÉRER UNE TÂCHE PAR SON ID (MÉTHODE MANQUANTE AJOUTÉE)
   */
  async getTask(taskId) {
    try {
      console.log('📝 Récupération tâche:', taskId);
      
      const docRef = doc(db, this.COLLECTION_NAME, taskId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const taskData = { id: docSnap.id, ...docSnap.data() };
        console.log('✅ Tâche trouvée:', taskData.title);
        return taskData;
      } else {
        console.log('❌ Tâche non trouvée:', taskId);
        return null;
      }
      
    } catch (error) {
      console.error('❌ Erreur récupération tâche:', error);
      return null;
    }
  }

  /**
   * ✅ CRÉER UNE NOUVELLE TÂCHE
   */
  async createTask(taskData, userId) {
    try {
      console.log('📝 Création nouvelle tâche:', taskData.title);
      
      const task = {
        title: taskData.title || '',
        description: taskData.description || '',
        status: TASK_STATUS.PENDING,
        priority: taskData.priority || 'normal',
        difficulty: taskData.difficulty || 'normal',
        userId: userId,
        assignedTo: taskData.assignedTo || userId,
        projectId: taskData.projectId || null,
        
        // Dates
        dueDate: taskData.dueDate || null,
        completedAt: null,
        
        // XP et gamification
        xpReward: this.calculateXPForTask(taskData),
        
        // Tags et catégories
        tags: taskData.tags || [],
        category: taskData.category || '',
        
        // Métadonnées
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), task);
      console.log('✅ Tâche créée avec ID:', docRef.id);
      
      return { 
        success: true, 
        task: { id: docRef.id, ...task },
        error: null 
      };
      
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      return { 
        success: false, 
        task: null, 
        error: error.message 
      };
    }
  }

  /**
   * ✅ METTRE À JOUR UNE TÂCHE
   */
  async updateTask(taskId, updates) {
    try {
      console.log('📝 Mise à jour tâche:', taskId);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      // Si on marque comme terminé, ajouter la date
      if (updates.status === TASK_STATUS.COMPLETED && !updates.completedAt) {
        updateData.completedAt = serverTimestamp();
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, taskId);
      await updateDoc(docRef, updateData);
      
      console.log('✅ Tâche mise à jour avec succès');
      return { success: true, error: null };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ SUPPRIMER UNE TÂCHE
   */
  async deleteTask(taskId, userId) {
    try {
      console.log('📝 Suppression tâche:', taskId);
      
      // Vérifier que l'utilisateur peut supprimer cette tâche
      const task = await this.getTask(taskId);
      if (!task) {
        throw new Error('Tâche non trouvée');
      }
      
      if (task.userId !== userId && task.createdBy !== userId) {
        throw new Error('Vous n\'êtes pas autorisé à supprimer cette tâche');
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, taskId);
      await deleteDoc(docRef);
      
      console.log('✅ Tâche supprimée avec succès');
      return { success: true, error: null };
      
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ RÉCUPÉRER TOUTES LES TÂCHES D'UN UTILISATEUR
   */
  async getUserTasks(userId) {
    try {
      console.log('📝 Récupération tâches utilisateur:', userId);
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ ${tasks.length} tâches récupérées pour l'utilisateur ${userId}`);
      return tasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches utilisateur:', error);
      return [];
    }
  }

  /**
   * ✅ ÉCOUTER LES CHANGEMENTS DE TÂCHES EN TEMPS RÉEL
   */
  subscribeToUserTasks(userId, callback) {
    try {
      console.log('📝 Abonnement temps réel tâches pour:', userId);
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tasks = [];
        querySnapshot.forEach((doc) => {
          tasks.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('🔄 Mise à jour temps réel tâches:', tasks.length);
        callback(tasks);
      }, (error) => {
        console.error('❌ Erreur écoute tâches:', error);
        callback([]);
      });
      
      this.listeners.set(`tasks-${userId}`, unsubscribe);
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur setup écoute tâches:', error);
      callback([]);
      return () => {};
    }
  }

  /**
   * ✅ RECHERCHER DES TÂCHES
   */
  async searchTasks(userId, searchTerm) {
    try {
      const tasks = await this.getUserTasks(userId);
      
      if (!searchTerm || searchTerm.trim() === '') {
        return tasks;
      }
      
      const term = searchTerm.toLowerCase().trim();
      
      return tasks.filter(task => 
        task.title.toLowerCase().includes(term) ||
        task.description?.toLowerCase().includes(term) ||
        task.category?.toLowerCase().includes(term) ||
        task.tags?.some(tag => tag.toLowerCase().includes(term))
      );
      
    } catch (error) {
      console.error('❌ Erreur recherche tâches:', error);
      return [];
    }
  }

  /**
   * ✅ OBTENIR LES STATISTIQUES DES TÂCHES
   */
  async getTaskStats(userId = null) {
    try {
      const baseQuery = userId ? 
        query(collection(db, this.COLLECTION_NAME), where('userId', '==', userId)) :
        query(collection(db, this.COLLECTION_NAME));
      
      const querySnapshot = await getDocs(baseQuery);
      
      const stats = {
        total: 0,
        pending: 0,
        in_progress: 0,
        validation_pending: 0,
        completed: 0,
        rejected: 0,
        withMedia: 0
      };
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stats.total++;
        
        if (data.status && stats.hasOwnProperty(data.status)) {
          stats[data.status]++;
        }
        
        if (data.hasMedia) {
          stats.withMedia++;
        }
      });
      
      console.log('📊 Statistiques des tâches:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur récupération statistiques:', error);
      return {
        total: 0, pending: 0, in_progress: 0, validation_pending: 0, 
        completed: 0, rejected: 0, withMedia: 0
      };
    }
  }

  /**
   * ✅ CALCULER L'XP D'UNE TÂCHE
   */
  calculateXPForTask(taskData) {
    let baseXp = 20; // XP de base
    
    // Bonus selon la difficulté
    const difficultyMultipliers = {
      'easy': 1.0,
      'normal': 1.2,
      'hard': 1.5,
      'expert': 2.0
    };
    
    baseXp *= difficultyMultipliers[taskData.difficulty] || 1.0;
    
    // Bonus selon la priorité
    const priorityBonuses = {
      'low': 0,
      'normal': 5,
      'high': 10,
      'urgent': 20
    };
    
    baseXp += priorityBonuses[taskData.priority] || 0;
    
    return Math.round(baseXp);
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
    console.log('🧹 Listeners tâches nettoyés');
  }
}

// ✅ EXPORT DE LA CLASSE ET DE L'INSTANCE
export default TaskService;

// ✅ EXPORT DE L'INSTANCE SINGLETON
export const taskService = new TaskService();

console.log('✅ TaskService - Méthode getTask ajoutée avec succès');
