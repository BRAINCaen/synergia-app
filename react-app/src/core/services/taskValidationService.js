// ==========================================
// 📁 react-app/src/core/services/taskValidationService.js
// SERVICE DE VALIDATION CORRIGÉ - AVEC TOUTES LES VALIDATIONS
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
 * 🔄 SERVICE DE VALIDATION DES TÂCHES - VERSION CORRIGÉE COMPLÈTE
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
   * 📋 RÉCUPÉRER LES DEMANDES EN ATTENTE SEULEMENT
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
      console.error('❌ Erreur récupération validations pending:', error);
      return [];
    }
  }

  /**
   * 📋 RÉCUPÉRER TOUTES LES VALIDATIONS (PENDING, APPROVED, REJECTED)
   */
  async getAllValidations() {
    try {
      console.log('📋 Récupération de TOUTES les validations...');
      
      const q = query(
        collection(db, 'task_validations'),
        orderBy('submittedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const validations = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        validations.push({
          id: doc.id,
          ...data,
          // S'assurer que les dates sont lisibles
          submittedAt: data.submittedAt,
          reviewedAt: data.reviewedAt
        });
      });
      
      console.log('✅ TOUTES les validations récupérées:', {
        total: validations.length,
        pending: validations.filter(v => v.status === 'pending').length,
        approved: validations.filter(v => v.status === 'approved').length,
        rejected: validations.filter(v => v.status === 'rejected').length
      });
      
      return validations;
      
    } catch (error) {
      console.error('❌ Erreur récupération toutes validations:', error);
      return [];
    }
  }

  /**
   * 📋 RÉCUPÉRER LES VALIDATIONS PAR STATUT
   */
  async getValidationsByStatus(status) {
    try {
      console.log('📋 Récupération des validations avec statut:', status);
      
      let q;
      if (status === 'all') {
        // Toutes les validations
        q = query(
          collection(db, 'task_validations'),
          orderBy('submittedAt', 'desc')
        );
      } else {
        // Statut spécifique
        q = query(
          collection(db, 'task_validations'),
          where('status', '==', status),
          orderBy('submittedAt', 'desc')
        );
      }
      
      const snapshot = await getDocs(q);
      const validations = [];
      
      snapshot.forEach(doc => {
        validations.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Validations ${status} récupérées:`, validations.length);
      return validations;
      
    } catch (error) {
      console.error(`❌ Erreur récupération validations ${status}:`, error);
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

      console.log(`✅ Validation terminée: ${validationId} - ${approved ? 'APPROUVÉE' : 'REJETÉE'}`);

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
      const allValidations = await this.getAllValidations();
      
      const stats = {
        total: allValidations.length,
        pending: allValidations.filter(v => v.status === 'pending').length,
        approved: allValidations.filter(v => v.status === 'approved').length,
        rejected: allValidations.filter(v => v.status === 'rejected').length,
        todayApproved: allValidations.filter(v => {
          if (v.status !== 'approved' || !v.reviewedAt) return false;
          try {
            const reviewDate = v.reviewedAt.toDate ? v.reviewedAt.toDate() : new Date(v.reviewedAt);
            const today = new Date();
            return reviewDate.toDateString() === today.toDateString();
          } catch {
            return false;
          }
        }).length
      };
      
      console.log('📊 Stats validation calculées:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur stats validation:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        todayApproved: 0
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

  /**
   * 🔍 VÉRIFIER LES PERMISSIONS ADMIN
   */
  async checkAdminPermissions(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return false;
      }

      const userData = userDoc.data();
      
      // Vérifications multiples pour admin
      const isRoleAdmin = userData.role === 'admin';
      const isProfileRoleAdmin = userData.profile?.role === 'admin';
      const hasAdminFlag = userData.isAdmin === true;
      const hasValidatePermission = userData.permissions?.includes('validate_tasks');
      const isAdminEmail = userData.email === 'alan.boehme61@gmail.com';
      
      const isAdmin = isRoleAdmin || isProfileRoleAdmin || hasAdminFlag || hasValidatePermission || isAdminEmail;
      
      console.log('🔍 checkAdminPermissions résultat:', {
        userId,
        isRoleAdmin,
        isProfileRoleAdmin,
        hasAdminFlag,
        hasValidatePermission,
        isAdminEmail,
        finalResult: isAdmin
      });
      
      return isAdmin;
      
    } catch (error) {
      console.error('❌ Erreur vérification permissions admin:', error);
      return false;
    }
  }
}

// 🔧 CORRECTION: Instance unique du service
export const taskValidationService = new TaskValidationService();
export { TaskValidationService };
export default taskValidationService;
