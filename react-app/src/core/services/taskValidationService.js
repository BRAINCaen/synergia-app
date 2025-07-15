// ==========================================
// 📁 react-app/src/core/services/taskValidationService.js
// SERVICE DE VALIDATION CORRIGÉ - VERSION STABLE
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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🔄 SERVICE DE VALIDATION DES TÂCHES - VERSION CORRIGÉE
 */
class TaskValidationService {
  
  /**
   * 📝 SOUMETTRE UNE TÂCHE POUR VALIDATION
   */
  async submitTaskForValidation(taskData) {
    try {
      const {
        taskId,
        userId,
        taskTitle,
        projectId,
        difficulty,
        comment,
        xpAmount
      } = taskData;

      console.log('📝 Soumission tâche pour validation:', { taskId, userId, difficulty });

      const validationRequest = {
        taskId,
        userId,
        projectId: projectId || null,
        taskTitle: taskTitle || 'Tâche sans titre',
        difficulty: difficulty || 'normal',
        xpAmount: this.calculateXPForDifficulty(difficulty),
        comment: comment || '',
        status: 'pending',
        submittedAt: serverTimestamp(),
        reviewedBy: null,
        reviewedAt: null,
        adminComment: null
      };

      const docRef = await addDoc(collection(db, 'task_validations'), validationRequest);

      // Mettre à jour le statut de la tâche
      if (taskId) {
        await updateDoc(doc(db, 'tasks', taskId), {
          status: 'validation_pending',
          submittedForValidation: true,
          validationRequestId: docRef.id,
          updatedAt: serverTimestamp()
        });
      }

      return {
        success: true,
        validationId: docRef.id
      };
      
    } catch (error) {
      console.error('❌ Erreur soumission validation:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER LES DEMANDES EN ATTENTE
   */
  async getPendingValidations() {
    try {
      console.log('📋 Récupération des demandes en attente...');
      
      const q = query(
        collection(db, 'task_validations'),
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const validations = [];
      
      snapshot.forEach(doc => {
        validations.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('✅ Demandes en attente récupérées:', validations.length);
      return validations;
      
    } catch (error) {
      console.error('❌ Erreur récupération validations:', error);
      // Retourner un tableau vide au lieu de lever une erreur
      return [];
    }
  }

  /**
   * ✅ VALIDER UNE TÂCHE
   */
  async validateTask(validationId, validationData) {
    try {
      const { userId, approved, comment, xpAwarded } = validationData;
      
      console.log('✅ Validation tâche:', { validationId, approved, xpAwarded });

      // Mettre à jour la validation
      await updateDoc(doc(db, 'task_validations', validationId), {
        status: approved ? 'approved' : 'rejected',
        reviewedBy: userId,
        reviewedAt: serverTimestamp(),
        adminComment: comment || '',
        xpAwarded: approved ? (xpAwarded || 0) : 0
      });

      return {
        success: true,
        approved,
        xpAwarded: approved ? (xpAwarded || 0) : 0
      };
      
    } catch (error) {
      console.error('❌ Erreur validation tâche:', error);
      throw error;
    }
  }

  /**
   * 🔢 CALCULER XP SELON DIFFICULTÉ
   */
  calculateXPForDifficulty(difficulty) {
    const xpTable = {
      'easy': 10,
      'normal': 20,
      'medium': 20,
      'hard': 30,
      'expert': 50
    };
    
    return xpTable[difficulty] || 20;
  }

  /**
   * 📊 OBTENIR STATISTIQUES VALIDATION
   */
  async getValidationStats() {
    try {
      const snapshot = await getDocs(collection(db, 'task_validations'));
      const stats = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      };
      
      snapshot.forEach(doc => {
        const data = doc.data();
        stats.total++;
        stats[data.status] = (stats[data.status] || 0) + 1;
      });
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur stats validation:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      };
    }
  }

  /**
   * 🗑️ SUPPRIMER UNE DEMANDE DE VALIDATION
   */
  async deleteValidation(validationId) {
    try {
      await deleteDoc(doc(db, 'task_validations', validationId));
      console.log('🗑️ Demande de validation supprimée:', validationId);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur suppression validation:', error);
      throw error;
    }
  }
}

// 🔧 CORRECTION: Instance unique du service
export const taskValidationService = new TaskValidationService();
export { TaskValidationService };
export default taskValidationService;
