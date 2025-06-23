// ==========================================
// 📁 react-app/src/core/services/taskService.js
// Service CORRIGÉ pour synchronisation Dashboard ↔ TaskList
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  writeBatch,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import { gameService } from './gameService.js'; // 🔧 CHANGEMENT: Utiliser gameService au lieu de gamificationService

// Collections Firestore
const COLLECTIONS = {
  TASKS: 'tasks',
  ACTIVITIES: 'activities',
  USERS: 'users'
};

class TaskService {

  /**
   * 🎯 COMPLÉTER UNE TÂCHE AVEC XP AUTOMATIQUE - CORRIGÉ
   */
  async completeTask(taskId, additionalData = {}) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      console.log('🎯 Complétion tâche:', taskId, 'par:', currentUser.email);

      // 1. Récupérer les détails de la tâche
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskSnap.data();
      
      // Vérifier que la tâche n'est pas déjà terminée
      if (taskData.status === 'completed') {
        console.warn('⚠️ Tâche déjà terminée');
        return { success: false, error: 'Tâche déjà terminée' };
      }

      // 2. Déterminer la difficulté et les XP
      const difficulty = this.determineDifficulty(taskData, additionalData);
      const xpReward = this.getXPReward(difficulty);

      // 3. Marquer la tâche comme terminée
      const now = new Date();
      const updates = {
        status: 'completed',
        completedAt: now,
        completedBy: currentUser.uid,
        updatedAt: now,
        difficulty: difficulty,
        xpRewarded: xpReward,
        ...additionalData
      };

      await updateDoc(taskRef, updates);

      // 4. 🔧 CORRECTION: Utiliser gameService (même que Dashboard)
      console.log('🎯 Ajout XP:', xpReward, 'pour task_complete (utilisateur:', currentUser.uid + ')');
      
      try {
        const xpResult = await gameService.addXP(currentUser.uid, xpReward, 'task_complete');
        console.log('✅ XP mis à jour:', xpResult?.xp || 'inconnue', '→', (xpResult?.xp || 0) + xpReward, '(niveau', xpResult?.level || 'inconnue', '→', xpResult?.level || 'inconnue' + ')');
        
        // 5. Créer l'historique d'activité
        await this.createActivityLog({
          userId: currentUser.uid,
          type: 'task_completed',
          taskId,
          taskTitle: taskData.title,
          xpGained: xpReward,
          timestamp: now,
          metadata: {
            difficulty,
            xpReward,
            originalTask: taskData
          }
        });

        console.log('✅ Tâche complétée avec succès:', {
          taskId,
          xpGained: xpReward,
          levelUp: false, // gameService ne retourne pas levelUp
          difficulty
        });

        return {
          success: true,
          taskId,
          taskData: { ...taskData, ...updates },
          xpGained: xpReward,
          difficulty,
          message: `Tâche "${taskData.title}" terminée ! +${xpReward} XP`
        };

      } catch (xpError) {
        console.error('❌ Erreur ajout XP:', xpError);
        
        // La tâche est marquée terminée même si XP échoue
        return {
          success: true,
          taskId,
          taskData: { ...taskData, ...updates },
          xpGained: 0,
          difficulty,
          message: `Tâche "${taskData.title}" terminée ! (Erreur XP)`
        };
      }

    } catch (error) {
      console.error('❌ Erreur complétion tâche:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 DÉTERMINER LA DIFFICULTÉ D'UNE TÂCHE
   */
  determineDifficulty(taskData, additionalData = {}) {
    let score = 0;
    
    // Priorité (0-4 points)
    const priority = taskData.priority?.toLowerCase() || 'medium';
    if (priority === 'urgent' || priority === 'critical') score += 4;
    else if (priority === 'high') score += 3;
    else if (priority === 'medium') score += 2;
    else if (priority === 'low') score += 1;
    
    // Complexité (0-4 points)
    const complexity = taskData.complexity?.toLowerCase() || 'medium';
    if (complexity === 'expert' || complexity === 'very_complex') score += 4;
    else if (complexity === 'complex' || complexity === 'hard') score += 3;
    else if (complexity === 'medium' || complexity === 'normal') score += 2;
    else if (complexity === 'simple' || complexity === 'easy') score += 1;
    
    // Temps estimé (0-4 points)
    const estimatedHours = taskData.estimatedHours || additionalData.estimatedHours || 0;
    if (estimatedHours > 16) score += 4;
    else if (estimatedHours > 8) score += 3;
    else if (estimatedHours > 4) score += 2;
    else if (estimatedHours > 1) score += 1;
    
    // Déterminer la difficulté finale
    if (score >= 12) return 'expert';
    else if (score >= 8) return 'hard';
    else if (score >= 4) return 'normal';
    else return 'easy';
  }

  /**
   * 🎯 OBTENIR RÉCOMPENSE XP SELON DIFFICULTÉ
   */
  getXPReward(difficulty) {
    const rewards = {
      'easy': 20,
      'normal': 40,
      'hard': 60,
      'expert': 100
    };
    return rewards[difficulty] || 40;
  }

  /**
   * 📝 CRÉER UNE NOUVELLE TÂCHE
   */
  async createTask(taskData, userId) {
    if (!userId) {
      throw new Error('UserId requis');
    }

    try {
      const now = new Date();
      
      if (!taskData.title || taskData.title.trim() === '') {
        throw new Error('Le titre de la tâche est requis');
      }

      const completeTaskData = {
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        status: 'todo',
        priority: taskData.priority || 'medium',
        category: taskData.category || 'general',
        complexity: taskData.complexity || 'normal',
        type: taskData.type || 'task',
        createdBy: userId,
        assignedTo: taskData.assignedTo || userId,
        estimatedTime: taskData.estimatedTime || 0,
        tags: Array.isArray(taskData.tags) ? taskData.tags : [],
        dueDate: taskData.dueDate || null,
        projectId: taskData.projectId || null,
        createdAt: now,
        updatedAt: now
      };

      console.log('📝 Création tâche:', completeTaskData.title);

      const docRef = await addDoc(collection(db, COLLECTIONS.TASKS), completeTaskData);
      const newTask = { id: docRef.id, ...completeTaskData };

      console.log('✅ Tâche créée:', docRef.id);

      // Créer l'historique d'activité
      await this.createActivityLog({
        userId,
        type: 'task_created',
        taskId: docRef.id,
        taskTitle: completeTaskData.title,
        timestamp: now,
        metadata: {
          priority: completeTaskData.priority,
          category: completeTaskData.category
        }
      });

      return newTask;

    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      throw error;
    }
  }

  /**
   * 🔄 METTRE À JOUR UNE TÂCHE
   */
  async updateTask(taskId, updates, userId) {
    if (!taskId || !userId) {
      throw new Error('TaskId et UserId requis');
    }

    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tâche introuvable');
      }

      const currentTask = taskSnap.data();
      
      // Vérifier les permissions
      if (currentTask.createdBy !== userId && currentTask.assignedTo !== userId) {
        throw new Error('Pas d\'autorisation pour modifier cette tâche');
      }

      const updateData = {
        ...updates,
        updatedAt: new Date(),
        updatedBy: userId
      };

      await updateDoc(taskRef, updateData);

      console.log('✅ Tâche mise à jour:', taskId);

      return { id: taskId, ...currentTask, ...updateData };

    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UNE TÂCHE
   */
  async deleteTask(taskId, userId) {
    if (!taskId || !userId) {
      throw new Error('TaskId et UserId requis');
    }

    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskSnap.data();
      
      // Vérifier les permissions
      if (taskData.createdBy !== userId) {
        throw new Error('Seul le créateur peut supprimer cette tâche');
      }

      await deleteDoc(taskRef);

      console.log('✅ Tâche supprimée:', taskId);

      // Log de l'activité
      await this.createActivityLog({
        userId,
        type: 'task_deleted',
        taskId,
        taskTitle: taskData.title,
        timestamp: new Date(),
        metadata: { originalTask: taskData }
      });

      return { success: true };

    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER LES TÂCHES D'UN UTILISATEUR
   */
  async getUserTasks(userId, filters = {}) {
    if (!userId) {
      throw new Error('UserId requis');
    }

    try {
      console.log('📋 Récupération tâches pour:', userId);

      let q = query(
        collection(db, COLLECTIONS.TASKS),
        where('assignedTo', '==', userId)
      );

      // Appliquer les filtres
      if (filters.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.priority && filters.priority !== 'all') {
        q = query(q, where('priority', '==', filters.priority));
      }

      if (filters.projectId && filters.projectId !== 'all') {
        q = query(q, where('projectId', '==', filters.projectId));
      }

      // Tri
      const orderField = filters.orderBy || 'createdAt';
      const orderDirection = filters.orderDirection || 'desc';
      q = query(q, orderBy(orderField, orderDirection));

      const snapshot = await getDocs(q);
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('📋', tasks.length, 'tâche(s) récupérée(s) pour', userId);

      return tasks;

    } catch (error) {
      console.error('❌ Erreur récupération tâches:', error);
      throw error;
    }
  }

  /**
   * 🔄 ÉCOUTER LES CHANGEMENTS EN TEMPS RÉEL
   */
  subscribeToUserTasks(userId, callback, filters = {}) {
    if (!userId) {
      throw new Error('UserId requis');
    }

    console.log('🔄 Setup real-time listener tâches pour:', userId);

    let q = query(
      collection(db, COLLECTIONS.TASKS),
      where('assignedTo', '==', userId)
    );

    // Appliquer les filtres
    if (filters.status && filters.status !== 'all') {
      q = query(q, where('status', '==', filters.status));
    }

    const orderField = filters.orderBy || 'createdAt';
    const orderDirection = filters.orderDirection || 'desc';
    q = query(q, orderBy(orderField, orderDirection));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('🔄 Mise à jour temps réel:', tasks.length, 'tâche(s)');
      callback(tasks);
    }, (error) => {
      console.error('❌ Erreur listener tâches:', error);
    });

    return unsubscribe;
  }

  /**
   * 📝 CRÉER UN LOG D'ACTIVITÉ
   */
  async createActivityLog(activityData) {
    try {
      await addDoc(collection(db, COLLECTIONS.ACTIVITIES), {
        ...activityData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.warn('⚠️ Erreur création log activité:', error);
      // Ne pas faire échouer l'opération principale
    }
  }

  /**
   * 📊 CALCULER LES STATISTIQUES
   */
  async getUserStats(userId) {
    try {
      const tasks = await this.getUserTasks(userId);
      
      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        todo: tasks.filter(t => t.status === 'todo').length,
        overdue: 0,
        totalXpEarned: 0,
        completionRate: 0
      };

      // Calculer les retards
      const now = new Date();
      stats.overdue = tasks.filter(t => 
        t.status !== 'completed' && 
        t.dueDate && 
        new Date(t.dueDate) < now
      ).length;

      // Calculer XP total des tâches
      stats.totalXpEarned = tasks
        .filter(t => t.status === 'completed')
        .reduce((total, t) => total + (t.xpRewarded || 0), 0);

      // Taux de completion
      if (stats.total > 0) {
        stats.completionRate = Math.round((stats.completed / stats.total) * 100);
      }

      return stats;

    } catch (error) {
      console.error('❌ Erreur calcul stats:', error);
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
        overdue: 0,
        totalXpEarned: 0,
        completionRate: 0
      };
    }
  }
}

// Export singleton
export default new TaskService();
