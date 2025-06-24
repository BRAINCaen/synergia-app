// src/core/services/taskService.js
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
  serverTimestamp
} from 'firebase/firestore';
import { firebaseDb } from '../firebase.js';

const TASKS_COLLECTION = 'tasks';

class TaskService {
  constructor() {
    this.db = firebaseDb;
  }

  // Créer une tâche
  async createTask(taskData, userId) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      const task = {
        ...taskData,
        userId,
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        xpReward: this.calculateXPReward(taskData.priority, taskData.complexity),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        completedAt: null,
        tags: taskData.tags || [],
        attachments: taskData.attachments || []
      };

      const docRef = await addDoc(collection(this.db, TASKS_COLLECTION), task);
      
      console.log('✅ Tâche créée:', docRef.id);
      return { id: docRef.id, ...task };
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      throw error;
    }
  }

  // Mettre à jour une tâche
  async updateTask(taskId, updates, userId) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      const taskRef = doc(this.db, TASKS_COLLECTION, taskId);
      
      // Vérifier que la tâche appartient à l'utilisateur
      const taskSnap = await getDoc(taskRef);
      if (!taskSnap.exists() || taskSnap.data().userId !== userId) {
        throw new Error('Tâche non trouvée ou accès refusé');
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Si la tâche est marquée comme complétée
      if (updates.status === 'completed' && taskSnap.data().status !== 'completed') {
        updateData.completedAt = serverTimestamp();
      }

      await updateDoc(taskRef, updateData);
      
      console.log('✅ Tâche mise à jour:', taskId);
      return { id: taskId, ...taskSnap.data(), ...updateData };
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      throw error;
    }
  }

  // Supprimer une tâche
  async deleteTask(taskId, userId) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      const taskRef = doc(this.db, TASKS_COLLECTION, taskId);
      
      // Vérifier que la tâche appartient à l'utilisateur
      const taskSnap = await getDoc(taskRef);
      if (!taskSnap.exists() || taskSnap.data().userId !== userId) {
        throw new Error('Tâche non trouvée ou accès refusé');
      }

      await deleteDoc(taskRef);
      
      console.log('✅ Tâche supprimée:', taskId);
      return taskId;
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      throw error;
    }
  }

  // Récupérer les tâches d'un utilisateur
  async getUserTasks(userId, filters = {}) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      let q = query(
        collection(this.db, TASKS_COLLECTION),
        where('userId', '==', userId)
      );

      // Appliquer les filtres
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }

      if (filters.projectId) {
        q = query(q, where('projectId', '==', filters.projectId));
      }

      // Trier par date de création (plus récent en premier)
      q = query(q, orderBy('createdAt', 'desc'));

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const tasks = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          completedAt: data.completedAt?.toDate(),
          dueDate: data.dueDate?.toDate()
        });
      });

      console.log(`✅ ${tasks.length} tâches récupérées pour l'utilisateur ${userId}`);
      return tasks;
    } catch (error) {
      console.error('❌ Erreur récupération tâches:', error);
      throw error;
    }
  }

  // Écouter les changements de tâches en temps réel
  subscribeToUserTasks(userId, callback, filters = {}) {
    if (!this.db) {
      console.warn('Firebase non configuré - Mode offline');
      return () => {};
    }

    try {
      let q = query(
        collection(this.db, TASKS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      // Appliquer les filtres
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          tasks.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            completedAt: data.completedAt?.toDate(),
            dueDate: data.dueDate?.toDate()
          });
        });

        callback(tasks);
      }, (error) => {
        console.error('❌ Erreur écoute tâches:', error);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur abonnement tâches:', error);
      return () => {};
    }
  }

  // Récupérer une tâche par ID
  async getTaskById(taskId, userId) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      const taskRef = doc(this.db, TASKS_COLLECTION, taskId);
      const taskSnap = await getDoc(taskRef);

      if (!taskSnap.exists()) {
        throw new Error('Tâche non trouvée');
      }

      const data = taskSnap.data();
      
      // Vérifier que la tâche appartient à l'utilisateur
      if (data.userId !== userId) {
        throw new Error('Accès refusé');
      }

      return {
        id: taskSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        dueDate: data.dueDate?.toDate()
      };
    } catch (error) {
      console.error('❌ Erreur récupération tâche:', error);
      throw error;
    }
  }

  // Calculer les récompenses XP basées sur la priorité et complexité
  calculateXPReward(priority = 'medium', complexity = 'medium') {
    const priorityMultiplier = {
      low: 1,
      medium: 1.5,
      high: 2
    };

    const complexityBase = {
      low: 10,
      medium: 20,
      high: 35
    };

    return Math.floor(complexityBase[complexity] * priorityMultiplier[priority]);
  }

  // Statistiques utilisateur
  async getUserTaskStats(userId) {
    if (!this.db) {
      throw new Error('Firebase non configuré');
    }

    try {
      const allTasks = await this.getUserTasks(userId);
      
      const stats = {
        total: allTasks.length,
        completed: allTasks.filter(task => task.status === 'completed').length,
        inProgress: allTasks.filter(task => task.status === 'in_progress').length,
        todo: allTasks.filter(task => task.status === 'todo').length,
        totalXpEarned: allTasks
          .filter(task => task.status === 'completed')
          .reduce((sum, task) => sum + (task.xpReward || 0), 0),
        completionRate: 0
      };

      stats.completionRate = stats.total > 0 
        ? Math.round((stats.completed / stats.total) * 100) 
        : 0;

      return stats;
    } catch (error) {
      console.error('❌ Erreur statistiques tâches:', error);
      throw error;
    }
  }

  // Marquer une tâche comme complétée et retourner les XP gagnés
  async completeTask(taskId, userId) {
    try {
      const task = await this.getTaskById(taskId, userId);
      
      if (task.status === 'completed') {
        return { xpGained: 0, message: 'Tâche déjà complétée' };
      }

      await this.updateTask(taskId, { status: 'completed' }, userId);
      
      const xpGained = task.xpReward || this.calculateXPReward(task.priority, task.complexity);
      
      return { 
        xpGained, 
        message: `Tâche complétée ! +${xpGained} XP`,
        task: { ...task, status: 'completed' }
      };
    } catch (error) {
      console.error('❌ Erreur complétion tâche:', error);
      throw error;
    }
  }
}

// Instance singleton
export const taskService = new TaskService();
export default taskService;
