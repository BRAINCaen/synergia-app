// ==========================================
// 📁 react-app/src/core/services/adminValidationService.js
// SERVICE ADMIN VALIDATION COMPLET - CORRECTION GETALLVALIDATIONS
// ==========================================

import { 
  collection, 
  doc,
  getDocs, 
  getDoc,
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🛡️ SERVICE ADMIN POUR LA VALIDATION DES TÂCHES
 */
class AdminValidationService {
  constructor() {
    console.log('🛡️ AdminValidationService initialisé');
  }

  /**
   * 📋 RÉCUPÉRER TOUTES LES VALIDATIONS - MÉTHODE MANQUANTE AJOUTÉE
   */
  async getAllValidations() {
    try {
      console.log('📋 [GET_ALL] Récupération de toutes les validations...');

      const validationsQuery = query(
        collection(db, 'task_validations'),
        orderBy('submittedAt', 'desc')
      );

      const snapshot = await getDocs(validationsQuery);
      const validations = [];

      // Enrichir chaque validation avec les données utilisateur
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        try {
          // Récupérer les informations utilisateur
          const userDoc = await getDoc(doc(db, 'users', data.userId));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          // Récupérer les informations de la tâche
          let taskData = {};
          if (data.taskId) {
            try {
              const taskDoc = await getDoc(doc(db, 'tasks', data.taskId));
              taskData = taskDoc.exists() ? taskDoc.data() : {};
            } catch (taskError) {
              console.warn('⚠️ Erreur récupération tâche:', data.taskId, taskError);
            }
          }
          
          validations.push({
            id: docSnapshot.id,
            ...data,
            // Informations utilisateur
            userName: userData.displayName || userData.name || 'Utilisateur inconnu',
            userEmail: userData.email || 'Email non disponible',
            userAvatar: userData.photoURL || null,
            // Informations tâche
            taskData: taskData,
            originalTaskTitle: taskData.title || data.taskTitle || 'Tâche inconnue'
          });
        } catch (userError) {
          console.warn('⚠️ Erreur enrichissement validation:', userError);
          // Ajouter quand même la validation avec des données par défaut
          validations.push({
            id: docSnapshot.id,
            ...data,
            userName: 'Utilisateur inconnu',
            userEmail: 'Email non disponible',
            userAvatar: null,
            taskData: {},
            originalTaskTitle: data.taskTitle || 'Tâche inconnue'
          });
        }
      }

      console.log(`✅ [GET_ALL] ${validations.length} validations récupérées`);
      return validations;

    } catch (error) {
      console.error('❌ [GET_ALL] Erreur récupération validations:', error);
      throw new Error(`Erreur récupération validations: ${error.message}`);
    }
  }

  /**
   * 📋 RÉCUPÉRER LES VALIDATIONS EN ATTENTE
   */
  async getPendingValidations() {
    try {
      console.log('📋 [GET_PENDING] Récupération validations en attente...');

      const validationsQuery = query(
        collection(db, 'task_validations'),
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc')
      );

      const snapshot = await getDocs(validationsQuery);
      const validations = [];

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        try {
          const userDoc = await getDoc(doc(db, 'users', data.userId));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          validations.push({
            id: docSnapshot.id,
            ...data,
            userName: userData.displayName || userData.name || 'Utilisateur inconnu',
            userEmail: userData.email || 'Email non disponible',
            userAvatar: userData.photoURL || null
          });
        } catch (userError) {
          console.warn('⚠️ Erreur récupération user:', userError);
          validations.push({
            id: docSnapshot.id,
            ...data,
            userName: 'Utilisateur inconnu',
            userEmail: 'Email non disponible',
            userAvatar: null
          });
        }
      }

      console.log(`✅ [GET_PENDING] ${validations.length} validations en attente`);
      return validations;

    } catch (error) {
      console.error('❌ [GET_PENDING] Erreur récupération validations en attente:', error);
      return [];
    }
  }

  /**
   * 📋 RÉCUPÉRER LES VALIDATIONS APPROUVÉES
   */
  async getApprovedValidations() {
    try {
      console.log('📋 [GET_APPROVED] Récupération validations approuvées...');

      const validationsQuery = query(
        collection(db, 'task_validations'),
        where('status', '==', 'approved'),
        orderBy('reviewedAt', 'desc')
      );

      const snapshot = await getDocs(validationsQuery);
      const validations = [];

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        try {
          const userDoc = await getDoc(doc(db, 'users', data.userId));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          // Récupérer les infos de l'admin qui a validé
          let reviewerData = {};
          if (data.reviewedBy) {
            try {
              const reviewerDoc = await getDoc(doc(db, 'users', data.reviewedBy));
              reviewerData = reviewerDoc.exists() ? reviewerDoc.data() : {};
            } catch (reviewerError) {
              console.warn('⚠️ Erreur récupération reviewer:', reviewerError);
            }
          }
          
          validations.push({
            id: docSnapshot.id,
            ...data,
            userName: userData.displayName || userData.name || 'Utilisateur inconnu',
            userEmail: userData.email || 'Email non disponible',
            reviewerName: reviewerData.displayName || reviewerData.name || 'Admin inconnu'
          });
        } catch (userError) {
          console.warn('⚠️ Erreur enrichissement validation approuvée:', userError);
          validations.push({
            id: docSnapshot.id,
            ...data,
            userName: 'Utilisateur inconnu',
            userEmail: 'Email non disponible',
            reviewerName: 'Admin inconnu'
          });
        }
      }

      console.log(`✅ [GET_APPROVED] ${validations.length} validations approuvées`);
      return validations;

    } catch (error) {
      console.error('❌ [GET_APPROVED] Erreur récupération validations approuvées:', error);
      return [];
    }
  }

  /**
   * 📋 RÉCUPÉRER LES VALIDATIONS REJETÉES
   */
  async getRejectedValidations() {
    try {
      console.log('📋 [GET_REJECTED] Récupération validations rejetées...');

      const validationsQuery = query(
        collection(db, 'task_validations'),
        where('status', '==', 'rejected'),
        orderBy('reviewedAt', 'desc')
      );

      const snapshot = await getDocs(validationsQuery);
      const validations = [];

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        try {
          const userDoc = await getDoc(doc(db, 'users', data.userId));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          validations.push({
            id: docSnapshot.id,
            ...data,
            userName: userData.displayName || userData.name || 'Utilisateur inconnu',
            userEmail: userData.email || 'Email non disponible'
          });
        } catch (userError) {
          console.warn('⚠️ Erreur enrichissement validation rejetée:', userError);
          validations.push({
            id: docSnapshot.id,
            ...data,
            userName: 'Utilisateur inconnu',
            userEmail: 'Email non disponible'
          });
        }
      }

      console.log(`✅ [GET_REJECTED] ${validations.length} validations rejetées`);
      return validations;

    } catch (error) {
      console.error('❌ [GET_REJECTED] Erreur récupération validations rejetées:', error);
      return [];
    }
  }

  /**
   * ✅ APPROUVER UNE VALIDATION
   */
  async approveValidation(validationId, adminUserId, adminComment = '') {
    try {
      console.log('✅ [APPROVE] Approbation validation:', validationId);

      const validationRef = doc(db, 'task_validations', validationId);
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
        adminComment: adminComment || 'Validation approuvée automatiquement'
      });

      // Mettre à jour la tâche correspondante
      if (validationData.taskId) {
        try {
          const taskRef = doc(db, 'tasks', validationData.taskId);
          await updateDoc(taskRef, {
            status: 'completed',
            completedAt: serverTimestamp(),
            completedBy: validationData.userId,
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

      const validationRef = doc(db, 'task_validations', validationId);
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
          const taskRef = doc(db, 'tasks', validationData.taskId);
          await updateDoc(taskRef, {
            status: 'in_progress',
            submittedForValidation: false,
            rejectedAt: serverTimestamp(),
            rejectedBy: adminUserId,
            rejectionReason: adminComment.trim(),
            updatedAt: serverTimestamp()
          });
          console.log('❌ [REJECT] Tâche remise en cours');
        } catch (taskError) {
          console.warn('⚠️ [REJECT] Erreur mise à jour tâche:', taskError);
        }
      }

      console.log('❌ [REJECT] Validation rejetée avec succès');
      return { 
        success: true, 
        validationId,
        message: 'Validation rejetée avec succès'
      };

    } catch (error) {
      console.error('❌ [REJECT] Erreur rejet validation:', error);
      throw new Error(`Erreur rejet: ${error.message}`);
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DES VALIDATIONS
   */
  async getValidationStats() {
    try {
      console.log('📊 [STATS] Calcul statistiques validations...');

      const validationsSnapshot = await getDocs(collection(db, 'task_validations'));
      
      const stats = {
        total: validationsSnapshot.size,
        pending: 0,
        approved: 0,
        rejected: 0,
        today: 0
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      validationsSnapshot.forEach(doc => {
        const data = doc.data();
        const status = data.status || 'pending';
        
        // Compter par statut
        if (stats.hasOwnProperty(status)) {
          stats[status]++;
        }
        
        // Compter celles d'aujourd'hui
        if (data.submittedAt && data.submittedAt.toDate) {
          const submittedDate = data.submittedAt.toDate();
          if (submittedDate >= today) {
            stats.today++;
          }
        }
      });

      console.log('✅ [STATS] Statistiques calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ [STATS] Erreur calcul statistiques:', error);
      return { 
        total: 0, 
        pending: 0, 
        approved: 0, 
        rejected: 0, 
        today: 0 
      };
    }
  }

  /**
   * 🔍 RECHERCHER DES VALIDATIONS
   */
  async searchValidations(searchTerm, status = null) {
    try {
      console.log('🔍 [SEARCH] Recherche validations:', { searchTerm, status });

      // Récupérer toutes les validations (ou par statut)
      let validations;
      if (status && status !== 'all') {
        switch (status) {
          case 'pending':
            validations = await this.getPendingValidations();
            break;
          case 'approved':
            validations = await this.getApprovedValidations();
            break;
          case 'rejected':
            validations = await this.getRejectedValidations();
            break;
          default:
            validations = await this.getAllValidations();
        }
      } else {
        validations = await this.getAllValidations();
      }

      // Filtrer selon le terme de recherche
      if (searchTerm && searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase();
        validations = validations.filter(validation => 
          validation.taskTitle?.toLowerCase().includes(searchLower) ||
          validation.userName?.toLowerCase().includes(searchLower) ||
          validation.userEmail?.toLowerCase().includes(searchLower) ||
          validation.comment?.toLowerCase().includes(searchLower) ||
          validation.adminComment?.toLowerCase().includes(searchLower)
        );
      }

      console.log(`✅ [SEARCH] ${validations.length} validations trouvées`);
      return validations;

    } catch (error) {
      console.error('❌ [SEARCH] Erreur recherche validations:', error);
      return [];
    }
  }
}

// Instance unique
const adminValidationService = new AdminValidationService();

// Export pour utilisation
export { adminValidationService };
export default AdminValidationService;
