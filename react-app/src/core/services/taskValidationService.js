// ==========================================
// 📁 react-app/src/core/services/taskValidationService.js  
// SERVICE DE VALIDATION DES TÂCHES - MÉTHODE ADMIN CORRIGÉE
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
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase.js';
import { gamificationService } from './gamificationService.js';

/**
 * 🔄 SERVICE DE VALIDATION DES TÂCHES
 * Remplace l'attribution automatique d'XP par un système de validation admin
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
        photoFile,
        xpAmount
      } = taskData;

      console.log('📝 Soumission tâche pour validation:', { taskId, userId, difficulty });

      // Upload de la photo si fournie
      let photoUrl = null;
      if (photoFile) {
        photoUrl = await this.uploadTaskPhoto(taskId, userId, photoFile);
      }

      // Créer la demande de validation
      const validationRequest = {
        // Identifiants
        taskId,
        userId,
        projectId: projectId || null,
        
        // Données de la tâche
        taskTitle: taskTitle || 'Tâche sans titre',
        difficulty: difficulty || 'normal',
        xpAmount: this.calculateXPForDifficulty(difficulty),
        
        // Preuves soumises
        comment: comment || '',
        photoUrl: photoUrl,
        
        // Statut et métadonnées
        status: 'pending', // pending, approved, rejected
        submittedAt: serverTimestamp(),
        type: 'task_completion',
        
        // Validation par admin
        reviewedBy: null,
        reviewedAt: null,
        adminComment: null,
        
        // Données enrichies
        submissionVersion: '1.0',
        source: 'synergia_app'
      };

      // Sauvegarder en Firestore
      const docRef = await addDoc(collection(db, 'task_validations'), validationRequest);
      
      console.log(`✅ Demande de validation créée: ${docRef.id}`);
      
      return {
        success: true,
        validationId: docRef.id,
        message: 'Tâche soumise pour validation avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur soumission validation:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DE VALIDATION
   */
  async getValidationStats() {
    try {
      const validationsRef = collection(db, 'task_validations');
      
      const [pendingQuery, approvedQuery, rejectedQuery] = await Promise.all([
        getDocs(query(validationsRef, where('status', '==', 'pending'))),
        getDocs(query(validationsRef, where('status', '==', 'approved'))),
        getDocs(query(validationsRef, where('status', '==', 'rejected')))
      ]);

      return {
        pending: pendingQuery.size,
        approved: approvedQuery.size, 
        rejected: rejectedQuery.size,
        total: pendingQuery.size + approvedQuery.size + rejectedQuery.size
      };
      
    } catch (error) {
      console.error('❌ Erreur stats validation:', error);
      return {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
      };
    }
  }

  /**
   * 👑 VÉRIFIER LES PERMISSIONS ADMIN (MÉTHODE CORRIGÉE)
   */
  async checkAdminPermissions(userId) {
    try {
      if (!userId) {
        console.warn('⚠️ checkAdminPermissions: userId manquant');
        return false;
      }

      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        console.warn('⚠️ checkAdminPermissions: utilisateur introuvable');
        return false;
      }

      const userData = userDoc.data();
      
      // Vérifier les différentes méthodes d'admin
      const isRoleAdmin = userData.role === 'admin';
      const isProfileRoleAdmin = userData.profile?.role === 'admin';
      const hasAdminFlag = userData.isAdmin === true;
      const hasValidatePermission = userData.permissions?.includes('validate_tasks');
      
      const isAdmin = isRoleAdmin || isProfileRoleAdmin || hasAdminFlag || hasValidatePermission;
      
      console.log('🔍 checkAdminPermissions résultat:', {
        userId,
        isRoleAdmin,
        isProfileRoleAdmin,
        hasAdminFlag,
        hasValidatePermission,
        finalResult: isAdmin
      });

      return isAdmin;

    } catch (error) {
      console.error('❌ Erreur vérification permissions admin:', error);
      return false;
    }
  }

  /**
   * 📸 UPLOAD D'UNE PHOTO DE TÂCHE
   */
  async uploadTaskPhoto(taskId, userId, photoFile) {
    try {
      const timestamp = Date.now();
      const fileName = `task-validations/${userId}/${taskId}-${timestamp}.jpg`;
      const photoRef = ref(storage, fileName);
      
      await uploadBytes(photoRef, photoFile);
      const downloadURL = await getDownloadURL(photoRef);
      
      console.log('📸 Photo uploadée:', downloadURL);
      return downloadURL;
      
    } catch (error) {
      console.error('❌ Erreur upload photo:', error);
      throw error;
    }
  }

  /**
   * 🧮 CALCULER LES XP SELON LA DIFFICULTÉ
   */
  calculateXPForDifficulty(difficulty) {
    const xpTable = {
      'easy': 10,
      'normal': 25,
      'hard': 50,
      'expert': 100
    };
    
    return xpTable[difficulty] || xpTable['normal'];
  }

  /**
   * ✅ APPROUVER UNE VALIDATION (Admin seulement)
   */
  async approveValidation(validationId, adminId, adminComment = '') {
    try {
      const isAdmin = await this.checkAdminPermissions(adminId);
      if (!isAdmin) {
        throw new Error('Permissions insuffisantes');
      }

      const validationRef = doc(db, 'task_validations', validationId);
      await updateDoc(validationRef, {
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: serverTimestamp(),
        adminComment: adminComment || 'Tâche approuvée'
      });

      console.log(`✅ Validation ${validationId} approuvée par ${adminId}`);
      
      return {
        success: true,
        message: 'Validation approuvée avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur approbation validation:', error);
      throw error;
    }
  }

  /**
   * ❌ REJETER UNE VALIDATION (Admin seulement)
   */
  async rejectValidation(validationId, adminId, adminComment = '') {
    try {
      const isAdmin = await this.checkAdminPermissions(adminId);
      if (!isAdmin) {
        throw new Error('Permissions insuffisantes');
      }

      const validationRef = doc(db, 'task_validations', validationId);
      await updateDoc(validationRef, {
        status: 'rejected',
        reviewedBy: adminId,
        reviewedAt: serverTimestamp(),
        adminComment: adminComment || 'Tâche rejetée'
      });

      console.log(`❌ Validation ${validationId} rejetée par ${adminId}`);
      
      return {
        success: true,
        message: 'Validation rejetée avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur rejet validation:', error);
      throw error;
    }
  }

  /**
   * 📋 OBTENIR TOUTES LES VALIDATIONS EN ATTENTE
   */
  async getPendingValidations() {
    try {
      const validationsQuery = query(
        collection(db, 'task_validations'),
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc')
      );
      
      const snapshot = await getDocs(validationsQuery);
      const validations = [];
      
      snapshot.forEach(doc => {
        validations.push({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate()
        });
      });
      
      return validations;
      
    } catch (error) {
      console.error('❌ Erreur récupération validations:', error);
      return [];
    }
  }

  /**
   * 🔄 ÉCOUTER LES CHANGEMENTS DE VALIDATIONS
   */
  onValidationsChange(callback, status = 'pending') {
    const validationsQuery = query(
      collection(db, 'task_validations'),
      where('status', '==', status),
      orderBy('submittedAt', 'desc')
    );
    
    return onSnapshot(validationsQuery, (snapshot) => {
      const validations = [];
      snapshot.forEach(doc => {
        validations.push({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate()
        });
      });
      
      callback(validations);
    });
  }
}

// Export de l'instance
export const taskValidationService = new TaskValidationService();
export default taskValidationService;
