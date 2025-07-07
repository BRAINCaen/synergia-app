// ==========================================
// 📁 react-app/src/core/services/taskService.js
// CORRECTION FINALE - Exports non dupliqués
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

// ✅ CONSTANTES EXPORTÉES UNE SEULE FOIS
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
        status: taskData.status || TASK_STATUS.PENDING,
        priority: taskData.priority || 'medium',
        complexity: taskData.complexity || 'medium',
        xpReward: taskData.xpReward || this.calculateDefaultXP(taskData.complexity),
        projectId: taskData.projectId || null,
        dueDate: taskData.dueDate || null,
        tags: taskData.tags || [],
        userId: userId,
        createdBy: userId,
        assignedTo: userId,
        userEmail: taskData.userEmail || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      if (!task.title.trim()) {
        throw new Error('Le titre de la tâche est obligatoire');
      }
      
      if (!userId) {
        throw new Error('L\'ID utilisateur est obligatoire');
      }
      
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), task);
      const createdTask = { id: docRef.id, ...task };
      
      console.log('✅ Tâche créée avec succès:', docRef.id);
      return createdTask;
      
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      throw new Error(`Erreur lors de la création: ${error.message}`);
    }
  }

  /**
   * ✅ CALCULER XP PAR DÉFAUT SELON LA COMPLEXITÉ
   */
  calculateDefaultXP(complexity) {
    const xpMap = {
      'low': 15,
      'medium': 25,
      'high': 40,
      'expert': 60
    };
    return xpMap[complexity] || 25;
  }

  /**
   * ✅ METTRE À JOUR UNE TÂCHE
   */
  async updateTask(taskId, updates) {
    try {
      console.log('📝 Mise à jour tâche:', taskId);
      
      if (!taskId) {
        throw new Error('ID de tâche manquant');
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      if (updates.userId) {
        updateData.createdBy = updates.userId;
        updateData.assignedTo = updates.userId;
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
      
      const task = await this.getTask(taskId);
      if (!task) {
        throw new Error('Tâche non trouvée');
      }
      
      const canDelete = task.userId === userId || 
                       task.createdBy === userId || 
                       task.assignedTo === userId;
      
      if (!canDelete) {
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
   * ✅ RÉCUPÉRER TOUTES LES TÂCHES D'UN UTILISATEUR (VERSION ROBUSTE)
   */
  async getUserTasks(userId) {
    try {
      console.log('📝 Récupération tâches utilisateur (robuste):', userId);
      
      if (!userId) {
        console.warn('⚠️ userId manquant');
        return [];
      }

      const allUserTasks = new Map();

      // STRATÉGIE 1: Requête principale par userId
      try {
        const mainQuery = query(
          collection(db, this.COLLECTION_NAME),
          where('userId', '==', userId),
          orderBy('updatedAt', 'desc')
        );
        
        const mainSnapshot = await getDocs(mainQuery);
        mainSnapshot.forEach((doc) => {
          allUserTasks.set(doc.id, { id: doc.id, ...doc.data() });
        });
        
        console.log(`📋 Stratégie 1 (userId): ${mainSnapshot.size} tâche(s)`);
      } catch (error) {
        console.warn('⚠️ Stratégie 1 échouée:', error.message);
      }

      // STRATÉGIE 2: Requête de secours par createdBy
      try {
        const backupQuery = query(
          collection(db, this.COLLECTION_NAME),
          where('createdBy', '==', userId),
          orderBy('updatedAt', 'desc')
        );
        
        const backupSnapshot = await getDocs(backupQuery);
        backupSnapshot.forEach((doc) => {
          if (!allUserTasks.has(doc.id)) {
            allUserTasks.set(doc.id, { id: doc.id, ...doc.data() });
          }
        });
        
        console.log(`📋 Stratégie 2 (createdBy): +${backupSnapshot.size} tâche(s)`);
      } catch (error) {
        console.warn('⚠️ Stratégie 2 échouée:', error.message);
      }

      // STRATÉGIE 3: Requête par assignedTo
      try {
        const assignedQuery = query(
          collection(db, this.COLLECTION_NAME),
          where('assignedTo', '==', userId),
          orderBy('updatedAt', 'desc')
        );
        
        const assignedSnapshot = await getDocs(assignedQuery);
        assignedSnapshot.forEach((doc) => {
          if (!allUserTasks.has(doc.id)) {
            allUserTasks.set(doc.id, { id: doc.id, ...doc.data() });
          }
        });
        
        console.log(`📋 Stratégie 3 (assignedTo): +${assignedSnapshot.size} tâche(s)`);
      } catch (error) {
        console.warn('⚠️ Stratégie 3 échouée:', error.message);
      }

      const tasks = Array.from(allUserTasks.values()).sort((a, b) => {
        const aTime = a.updatedAt?.seconds || 0;
        const bTime = b.updatedAt?.seconds || 0;
        return bTime - aTime;
      });

      console.log(`✅ TOTAL FINAL: ${tasks.length} tâche(s) récupérée(s) pour l'utilisateur ${userId}`);
      return tasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches utilisateur:', error);
      return [];
    }
  }

  /**
   * ✅ RÉCUPÉRER TÂCHES PAR EMAIL (STRATÉGIE DE SECOURS)
   */
  async getUserTasksByEmail(userEmail) {
    try {
      console.log('📝 Récupération tâches par email:', userEmail);
      
      const emailQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('userEmail', '==', userEmail),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(emailQuery);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ ${tasks.length} tâche(s) récupérée(s) par email`);
      return tasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches par email:', error);
      return [];
    }
  }

  /**
   * ✅ ÉCOUTER LES CHANGEMENTS EN TEMPS RÉEL
   */
  listenToUserTasks(userId, callback) {
    try {
      console.log('👂 Écoute des tâches utilisateur:', userId);
      
      if (this.listeners.has(userId)) {
        console.log('⚠️ Listener déjà actif, fermeture de l\'ancien');
        this.listeners.get(userId)();
      }

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const tasks = [];
          querySnapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() });
          });
          
          console.log(`🔄 Mise à jour temps réel: ${tasks.length} tâche(s)`);
          callback(tasks);
        },
        (error) => {
          console.error('❌ Erreur listener tâches:', error);
          callback([]);
        }
      );
      
      this.listeners.set(userId, unsubscribe);
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur création listener:', error);
      return () => {};
    }
  }

  /**
   * 🔧 RÉPARER LES TÂCHES D'UN UTILISATEUR
   */
  async repairUserTasks(userId, userEmail = null) {
    try {
      console.log('🔧 RÉPARATION des tâches pour:', userId);
      
      const allTasksSnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
      const tasksToRepair = [];
      
      allTasksSnapshot.forEach((doc) => {
        const task = doc.data();
        
        if ((task.createdBy === userId || 
             (userEmail && task.userEmail === userEmail)) &&
            task.userId !== userId) {
          tasksToRepair.push({ id: doc.id, ...task });
        }
      });

      if (tasksToRepair.length === 0) {
        console.log('ℹ️ Aucune tâche à réparer');
        return { success: true, repairedCount: 0 };
      }

      console.log(`🔧 ${tasksToRepair.length} tâche(s) à réparer`);

      const repairPromises = tasksToRepair.map(task => 
        this.updateTask(task.id, {
          userId: userId,
          userEmail: userEmail,
          repairedAt: new Date(),
          repairedBy: 'TaskService.repairUserTasks'
        })
      );

      await Promise.all(repairPromises);

      console.log(`✅ ${tasksToRepair.length} tâche(s) réparée(s) avec succès`);
      return { success: true, repairedCount: tasksToRepair.length };

    } catch (error) {
      console.error('❌ Erreur réparation tâches:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🧹 NETTOYER LES LISTENERS
   */
  removeListener(userId) {
    if (this.listeners.has(userId)) {
      this.listeners.get(userId)();
      this.listeners.delete(userId);
      console.log('🧹 Listener supprimé pour:', userId);
    }
  }

  /**
   * 🧹 NETTOYER TOUS LES LISTENERS
   */
  removeAllListeners() {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
    console.log('🧹 Tous les listeners supprimés');
  }
}

// ✅ EXPORTS CORRIGÉS - PAS DE DUPLICATION
const taskService = new TaskService();

export { taskService };
export default taskService;
