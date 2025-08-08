// ==========================================
// 📁 react-app/src/core/services/taskValidationService.js  
// HOTFIX URGENT - AJOUT MÉTHODE checkAdminPermissions MANQUANTE
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc,
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🛡️ SERVICE DE VALIDATION DES TÂCHES (Version corrigée)
 */
class TaskValidationService {
  constructor() {
    this.COLLECTION_NAME = 'task_validations';
    console.log('🛡️ TaskValidationService initialisé');
  }

  // ✅ MÉTHODE MANQUANTE AJOUTÉE
  /**
   * 🛡️ VÉRIFIER LES PERMISSIONS ADMIN - MÉTHODE MANQUANTE AJOUTÉE
   */
  async checkAdminPermissions(userId) {
    try {
      console.log('🔍 [TaskValidation] Vérification permissions admin pour:', userId);
      
      if (!userId) {
        console.warn('⚠️ checkAdminPermissions: userId manquant');
        return false;
      }

      // Récupérer les données utilisateur
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.warn('⚠️ Utilisateur non trouvé:', userId);
        return false;
      }

      const userData = userDoc.data();
      
      // Vérifications multiples pour admin
      const isAdminEmail = userData.email === 'alan.boehme61@gmail.com';
      const isRoleAdmin = userData.profile?.role === 'admin';
      const isProfileRoleAdmin = userData.role === 'admin';
      const hasAdminFlag = userData.isAdmin === true;
      const hasValidatePermission = userData.permissions?.includes('validate_tasks');
      const hasAdminPermission = userData.permissions?.includes('admin_access');
      
      const isAdmin = isAdminEmail || isRoleAdmin || isProfileRoleAdmin || 
                     hasAdminFlag || hasValidatePermission || hasAdminPermission;
      
      console.log('🔍 [TaskValidation] checkAdminPermissions résultat:', {
        userId,
        email: userData.email,
        isAdminEmail,
        isRoleAdmin,
        isProfileRoleAdmin,
        hasAdminFlag,
        hasValidatePermission,
        hasAdminPermission,
        finalResult: isAdmin
      });
      
      return isAdmin;
      
    } catch (error) {
      console.error('❌ Erreur vérification permissions admin:', error);
      return false;
    }
  }

  /**
   * 📝 SOUMETTRE UNE TÂCHE POUR VALIDATION
   */
  async submitTaskForValidation(taskId, userId, submissionData) {
    try {
      console.log('📝 [SUBMIT] Soumission validation:', { taskId, userId });

      const validationData = {
        taskId,
        userId,
        status: 'pending',
        submittedAt: serverTimestamp(),
        ...submissionData
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), validationData);
      
      // Marquer la tâche comme soumise
      await updateDoc(doc(db, 'tasks', taskId), {
        status: 'submitted',
        submittedForValidation: true,
        submittedAt: serverTimestamp()
      });

      console.log('✅ [SUBMIT] Tâche soumise pour validation:', docRef.id);
      return { success: true, validationId: docRef.id };

    } catch (error) {
      console.error('❌ [SUBMIT] Erreur soumission:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER TOUTES LES VALIDATIONS EN ATTENTE
   */
  async getPendingValidations() {
    try {
      console.log('📋 [GET_PENDING] Récupération validations en attente...');

      const validationsQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc')
      );

      const snapshot = await getDocs(validationsQuery);
      const validations = [];

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        try {
          // Enrichir avec les données utilisateur et tâche
          const [userDoc, taskDoc] = await Promise.all([
            getDoc(doc(db, 'users', data.userId)),
            getDoc(doc(db, 'tasks', data.taskId))
          ]);

          const userData = userDoc.exists() ? userDoc.data() : {};
          const taskData = taskDoc.exists() ? taskDoc.data() : {};

          validations.push({
            id: docSnapshot.id,
            ...data,
            user: userData,
            task: taskData,
            submittedAt: data.submittedAt?.toDate ? data.submittedAt.toDate() : new Date()
          });
        } catch (enrichError) {
          console.warn('⚠️ Erreur enrichissement validation:', enrichError);
          validations.push({
            id: docSnapshot.id,
            ...data,
            submittedAt: data.submittedAt?.toDate ? data.submittedAt.toDate() : new Date()
          });
        }
      }

      console.log(`✅ [GET_PENDING] ${validations.length} validations récupérées`);
      return validations;

    } catch (error) {
      console.error('❌ [GET_PENDING] Erreur récupération:', error);
      return [];
    }
  }

  /**
   * ✅ APPROUVER UNE VALIDATION
   */
  async approveValidation(validationId, adminUserId, adminComment = '') {
    try {
      console.log('✅ [APPROVE] Approbation validation:', validationId);

      const validationRef = doc(db, this.COLLECTION_NAME, validationId);
      const validationDoc = await getDoc(validationRef);
      
      if (!validationDoc.exists()) {
        throw new Error('Validation introuvable');
      }

      const validationData = validationDoc.data();
      
      // Mettre à jour la validation
      await updateDoc(validationRef, {
        status: 'approved',
        reviewedBy: adminUserId,
        reviewedAt: serverTimestamp(),
        adminComment: adminComment || 'Tâche approuvée'
      });

      // Marquer la tâche comme terminée
      if (validationData.taskId) {
        try {
          await updateDoc(doc(db, 'tasks', validationData.taskId), {
            status: 'completed',
            completedAt: serverTimestamp(),
            validatedBy: adminUserId,
            adminValidationComment: adminComment,
            updatedAt: serverTimestamp()
          });
          console.log('✅ [APPROVE] Tâche marquée comme terminée');
        } catch (taskError) {
          console.warn('⚠️ [APPROVE] Erreur mise à jour tâche:', taskError);
        }
      }

      console.log('✅ [APPROVE] Validation approuvée avec succès');
      return { 
        success: true, 
        validationId,
        message: 'Validation approuvée avec succès'
      };

    } catch (error) {
      console.error('❌ [APPROVE] Erreur approbation validation:', error);
      throw new Error(`Erreur approbation: ${error.message}`);
    }
  }

  /**
   * ❌ REJETER UNE VALIDATION
   */
  async rejectValidation(validationId, adminUserId, adminComment) {
    try {
      console.log('❌ [REJECT] Rejet validation:', validationId);

      if (!adminComment || adminComment.trim() === '') {
        throw new Error('Un commentaire est requis pour rejeter une validation');
      }

      const validationRef = doc(db, this.COLLECTION_NAME, validationId);
      const validationDoc = await getDoc(validationRef);
      
      if (!validationDoc.exists()) {
        throw new Error('Validation introuvable');
      }

      const validationData = validationDoc.data();
      
      // Mettre à jour la validation
      await updateDoc(validationRef, {
        status: 'rejected',
        reviewedBy: adminUserId,
        reviewedAt: serverTimestamp(),
        adminComment: adminComment.trim()
      });

      // Remettre la tâche en cours pour permettre une nouvelle soumission
      if (validationData.taskId) {
        try {
          await updateDoc(doc(db, 'tasks', validationData.taskId), {
            status: 'in_progress',
            submittedForValidation: false,
            rejectedAt: serverTimestamp(),
            rejectedBy: adminUserId,
            rejectionReason: adminComment,
            updatedAt: serverTimestamp()
          });
        } catch (taskError) {
          console.warn('⚠️ [REJECT] Erreur mise à jour tâche:', taskError);
        }
      }

      console.log('❌ [REJECT] Validation rejetée avec succès');
      return { success: true };

    } catch (error) {
      console.error('❌ [REJECT] Erreur rejet:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DE VALIDATION
   */
  async getValidationStats() {
    try {
      const validationsSnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
      
      const stats = {
        total: validationsSnapshot.size,
        pending: 0,
        approved: 0,
        rejected: 0
      };

      validationsSnapshot.forEach(doc => {
        const status = doc.data().status;
        stats[status] = (stats[status] || 0) + 1;
      });

      return stats;

    } catch (error) {
      console.error('❌ Erreur stats validation:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
  }
}

// Instance unique
const taskValidationService = new TaskValidationService();

export { taskValidationService };
export default taskValidationService;
