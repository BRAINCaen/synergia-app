// ==========================================
// 📁 react-app/src/core/services/taskService.js
// AJOUT MÉTHODE POUR RÉCUPÉRER TOUTES LES TÂCHES
// ==========================================

import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit as firebaseLimit,
  where,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 📋 SERVICE DES TÂCHES AVEC RÉCUPÉRATION COMPLÈTE
 */
class TaskService {
  
  constructor() {
    this.collection = 'tasks';
    console.log('📋 TaskService initialisé avec récupération complète');
  }

  /**
   * 🔄 RÉCUPÉRER ABSOLUMENT TOUTES LES TÂCHES DE LA BASE DE DONNÉES
   * Cette méthode ne filtre RIEN et récupère tout ce qui existe
   */
  async getAllTasksFromDatabase() {
    try {
      console.log('🔍 Récupération de TOUTES les tâches sans aucun filtre...');
      
      // Query la plus basique possible - TOUT récupérer
      const tasksRef = collection(db, this.collection);
      const querySnapshot = await getDocs(tasksRef);
      
      const allTasks = [];
      
      querySnapshot.forEach((doc) => {
        const taskData = {
          id: doc.id,
          ...doc.data()
        };
        allTasks.push(taskData);
      });
      
      console.log(`✅ ${allTasks.length} tâches récupérées depuis Firebase (TOUTES)`);
      
      // Afficher un échantillon pour debug
      if (allTasks.length > 0) {
        console.log('📊 Échantillon des tâches récupérées:');
        allTasks.slice(0, 5).forEach(task => {
          console.log(`- "${task.title}" (créé par: ${task.createdBy}, assigné: ${task.assignedTo || 'personne'})`);
        });
      }
      
      return allTasks;
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de toutes les tâches:', error);
      throw new Error(`Impossible de récupérer les tâches: ${error.message}`);
    }
  }

  /**
   * 📋 ANCIENNE MÉTHODE - Gardée pour compatibilité
   */
  async getAllTasks() {
    // Rediriger vers la nouvelle méthode pour garantir qu'on récupère tout
    return this.getAllTasksFromDatabase();
  }

  /**
   * 🔍 RÉCUPÉRER LES TÂCHES D'UN UTILISATEUR SPÉCIFIQUE
   */
  async getUserTasks(userId) {
    try {
      console.log(`🔍 Récupération des tâches pour l'utilisateur: ${userId}`);
      
      const tasksRef = collection(db, this.collection);
      
      // Query pour les tâches assignées à l'utilisateur OU créées par lui
      const q = query(
        tasksRef,
        where('assignedTo', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const userTasks = [];
      
      querySnapshot.forEach((doc) => {
        userTasks.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ ${userTasks.length} tâches trouvées pour l'utilisateur`);
      return userTasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches utilisateur:', error);
      throw new Error(`Impossible de récupérer les tâches utilisateur: ${error.message}`);
    }
  }

  /**
   * 📝 CRÉER UNE NOUVELLE TÂCHE
   */
  async createTask(taskData, userId) {
    try {
      console.log('📝 Création d\'une nouvelle tâche...');
      
      const tasksRef = collection(db, this.collection);
      
      const newTask = {
        ...taskData,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: taskData.status || 'todo'
      };
      
      const docRef = await addDoc(tasksRef, newTask);
      
      console.log(`✅ Tâche créée avec l'ID: ${docRef.id}`);
      return {
        id: docRef.id,
        ...newTask
      };
      
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      throw new Error(`Impossible de créer la tâche: ${error.message}`);
    }
  }

  /**
   * ✏️ METTRE À JOUR UNE TÂCHE
   */
  async updateTask(taskId, updateData) {
    try {
      console.log(`✏️ Mise à jour de la tâche: ${taskId}`);
      
      const taskRef = doc(db, this.collection, taskId);
      
      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(taskRef, updatedData);
      
      console.log(`✅ Tâche ${taskId} mise à jour`);
      return true;
      
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      throw new Error(`Impossible de mettre à jour la tâche: ${error.message}`);
    }
  }

  /**
   * 🗑️ SUPPRIMER UNE TÂCHE
   */
  async deleteTask(taskId) {
    try {
      console.log(`🗑️ Suppression de la tâche: ${taskId}`);
      
      const taskRef = doc(db, this.collection, taskId);
      await deleteDoc(taskRef);
      
      console.log(`✅ Tâche ${taskId} supprimée`);
      return true;
      
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      throw new Error(`Impossible de supprimer la tâche: ${error.message}`);
    }
  }

  /**
   * 📤 SOUMETTRE UNE TÂCHE POUR VALIDATION
   */
  async submitTask(taskId) {
    try {
      console.log(`📤 Soumission de la tâche pour validation: ${taskId}`);
      
      const taskRef = doc(db, this.collection, taskId);
      
      await updateDoc(taskRef, {
        status: 'validation_pending',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Tâche ${taskId} soumise pour validation`);
      return true;
      
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      throw new Error(`Impossible de soumettre la tâche: ${error.message}`);
    }
  }

  /**
   * 🔍 OBTENIR UNE TÂCHE SPÉCIFIQUE
   */
  async getTask(taskId) {
    try {
      console.log(`🔍 Récupération de la tâche: ${taskId}`);
      
      const taskRef = doc(db, this.collection, taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error(`Tâche ${taskId} non trouvée`);
      }
      
      const task = {
        id: taskDoc.id,
        ...taskDoc.data()
      };
      
      console.log(`✅ Tâche récupérée: ${task.title}`);
      return task;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâche:', error);
      throw new Error(`Impossible de récupérer la tâche: ${error.message}`);
    }
  }

  /**
   * 🔢 OBTENIR LES STATISTIQUES DES TÂCHES
   */
  async getTaskStats() {
    try {
      console.log('📊 Calcul des statistiques des tâches...');
      
      const allTasks = await this.getAllTasksFromDatabase();
      
      const stats = {
        total: allTasks.length,
        todo: allTasks.filter(task => task.status === 'todo').length,
        inProgress: allTasks.filter(task => task.status === 'in_progress').length,
        validationPending: allTasks.filter(task => task.status === 'validation_pending').length,
        completed: allTasks.filter(task => task.status === 'completed').length,
        assigned: allTasks.filter(task => task.assignedTo && task.assignedTo.length > 0).length,
        unassigned: allTasks.filter(task => !task.assignedTo || task.assignedTo.length === 0).length
      };
      
      console.log('📊 Statistiques calculées:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur calcul statistiques:', error);
      throw new Error(`Impossible de calculer les statistiques: ${error.message}`);
    }
  }
}

// Instance unique du service
export const taskService = new TaskService();
export default taskService;

console.log('📋 TaskService avec récupération complète initialisé');
