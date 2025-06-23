// ==========================================
// 📁 react-app/src/core/services/taskService.js
// Service Firebase CORRIGÉ - Utilise gameService au lieu de gamificationService
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
import { gameService } from './gameService.js'; // ✅ CORRECTION: gameService au lieu de gamificationService

// Collections Firestore
const COLLECTIONS = {
  TASKS: 'tasks',
  ACTIVITIES: 'activities',
  USERS: 'users'
};

class TaskService {

  /**
   * 🎯 COMPLÉTER UNE TÂCHE AVEC XP AUTOMATIQUE - VERSION CORRIGÉE
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

      // 4. 🎮 AJOUTER XP AVEC LE NOUVEAU gameService
      console.log('🎯 Ajout XP:', xpReward, 'pour task_complete (utilisateur:', currentUser.uid + ')');
      
      const gamificationResult = await gameService.addXP(
        currentUser.uid,
        xpReward,
        'task_complete',
        {
          taskId,
          difficulty,
          taskTitle: taskData.title,
          taskCategory: taskData.category,
          timeSpent: additionalData.timeSpent || 0
        }
      );

      console.log('✅ Résultat gameService.addXP:', gamificationResult);

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
          originalTask: taskData,
          gamificationResult
        }
      });

      console.log('✅ Tâche complétée avec succès:', {
        taskId,
        xpGained: xpReward,
        levelUp: gamificationResult?.levelUp || false,
        difficulty
      });

      return {
        success: true,
        taskId,
        taskData: { ...taskData, ...updates },
        xpGained: xpReward,
        levelUp: gamificationResult?.levelUp || false,
        newLevel: gamificationResult?.level,
        newTotalXP: gamificationResult?.totalXp,
        difficulty,
        message: `Tâche "${taskData.title}" terminée ! +${xpReward} XP`
      };

    } catch (error) {
      console.error('❌ Erreur completion tâche:', error);
      throw error;
    }
  }

  /**
   * 🎯 Déterminer la difficulté d'une tâche
   */
  determineDifficulty(taskData, additionalData = {}) {
    // Facteurs de difficulté
    const factors = {
      priority: taskData.priority || 'normal',
      complexity: taskData.complexity || 'normal',
      timeSpent: additionalData.timeSpent || 0,
      description: taskData.description || '',
      tags: taskData.tags || []
    };

    // Calcul basé sur la priorité
    if (factors.priority === 'high' || factors.priority === 'urgent') {
      return 'hard';
    }
    
    if (factors.priority === 'low') {
      return 'easy';
    }

    // Calcul basé sur la complexité
    if (factors.complexity === 'high' || factors.complexity === 'complex') {
      return 'hard';
    }
    
    if (factors.complexity === 'low' || factors.complexity === 'simple') {
      return 'easy';
    }

    // Calcul basé sur le temps passé
    if (factors.timeSpent > 120) { // Plus de 2 heures
      return 'hard';
    }
    
    if (factors.timeSpent < 30) { // Moins de 30 minutes
      return 'easy';
    }

    // Calcul basé sur la description
    if (factors.description.length > 200) {
      return 'hard';
    }

    // Par défaut
    return 'normal';
  }

  /**
   * 🎯 Calculer les XP selon la difficulté
   */
  getXPReward(difficulty) {
    const xpMap = {
      'easy': 25,
      'normal': 40,
      'hard': 60,
      'epic': 100
    };

    return xpMap[difficulty] || xpMap['normal'];
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
      const cleanTaskData = {
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority || 'normal',
        complexity: taskData.complexity || 'normal',
        status: taskData.status || 'todo',
        tags: taskData.tags || [],
        projectId: taskData.projectId || null,
        assignedTo: taskData.assignedTo || userId,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
        dueDate: taskData.dueDate || null,
        estimatedTime: taskData.estimatedTime || null,
        actualTime: null,
        completedAt: null,
        completedBy: null
      };

      console.log('🚀 Données tâche à sauvegarder:', cleanTaskData);

      const docRef = await addDoc(collection(db, COLLECTIONS.TASKS), cleanTaskData);
      
      console.log('✅ Tâche créée:', docRef.id, cleanTaskData.title);
      
      await this.createActivityLog({
        userId: userId,
        type: 'task_created',
        taskId: docRef.id,
        taskTitle: cleanTaskData.title,
        timestamp: now,
        metadata: { taskData: cleanTaskData }
      });

      return { 
        id: docRef.id, 
        ...cleanTaskData 
      };

    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER LES TÂCHES D'UN UTILISATEUR
   */
  async getUserTasks(userId) {
    if (!userId) {
      throw new Error('UserId requis');
    }

    try {
      const q = query(
        collection(db, COLLECTIONS.TASKS),
        where('assignedTo', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          completedAt: data.completedAt?.toDate?.() || data.completedAt,
          dueDate: data.dueDate?.toDate?.() || data.dueDate,
          startDate: data.startDate?.toDate?.() || data.startDate
        };
      });

      console.log(`📋 ${tasks.length} tâche(s) récupérée(s) pour`, userId);
      return tasks;

    } catch (error) {
      console.error('❌ Erreur récupération tâches:', error);
      return [];
    }
  }

  /**
   * ✏️ METTRE À JOUR UNE TÂCHE
   */
  async updateTask(taskId, updates, userId) {
    if (!userId) {
      throw new Error('UserId requis');
    }

    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      
      const taskSnap = await getDoc(taskRef);
      if (!taskSnap.exists()) {
        throw new Error('Tâche introuvable');
      }

      const cleanUpdates = {
        ...updates,
        updatedAt: new Date(),
        lastUpdatedBy: userId
      };

      Object.keys(cleanUpdates).forEach(key => {
        if (cleanUpdates[key] === undefined) {
          delete cleanUpdates[key];
        }
      });

      await updateDoc(taskRef, cleanUpdates);

      console.log('✅ Tâche mise à jour:', taskId);
      
      await this.createActivityLog({
        userId: userId,
        type: 'task_updated',
        taskId,
        timestamp: new Date(),
        metadata: { updates: cleanUpdates }
      });

      return { 
        id: taskId, 
        ...taskSnap.data(), 
        ...cleanUpdates 
      };

    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UNE TÂCHE
   */
  async deleteTask(taskId, userId) {
    if (!userId) {
      throw new Error('UserId requis');
    }

    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      
      const taskSnap = await getDoc(taskRef);
      if (!taskSnap.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskSnap.data();
      
      await deleteDoc(taskRef);
      
      console.log('✅ Tâche supprimée:', taskId);
      
      await this.createActivityLog({
        userId: userId,
        type: 'task_deleted',
        taskId,
        taskTitle: taskData.title,
        timestamp: new Date(),
        metadata: { deletedTask: taskData }
      });

      return { success: true, deletedTask: taskData };

    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      throw error;
    }
  }

  /**
   * 📈 CRÉER UN LOG D'ACTIVITÉ
   */
  async createActivityLog(activityData) {
    try {
      await addDoc(collection(db, COLLECTIONS.ACTIVITIES), {
        ...activityData,
        timestamp: activityData.timestamp || new Date()
      });
    } catch (error) {
      console.error('❌ Erreur création log activité:', error);
      // Ne pas faire échouer l'opération principale
    }
  }

  /**
   * 🔄 ÉCOUTER LES CHANGEMENTS EN TEMPS RÉEL
   */
  subscribeToUserTasks(userId, callback) {
    if (!userId) {
      throw new Error('UserId requis');
    }

    const q = query(
      collection(db, COLLECTIONS.TASKS),
      where('assignedTo', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const tasks = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          completedAt: data.completedAt?.toDate?.() || data.completedAt,
          dueDate: data.dueDate?.toDate?.() || data.dueDate
        };
      });
      
      console.log('🔄 Mise à jour temps réel:', tasks.length, 'tâche(s)');
      callback(tasks);
    }, (error) => {
      console.error('❌ Erreur écoute temps réel tâches:', error);
    });
  }
}

// Export singleton
export const taskService = new TaskService();
export default taskService;
