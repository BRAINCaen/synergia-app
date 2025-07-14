// ==========================================
// 📁 react-app/src/core/services/taskValidationService.js  
// SERVICE DE VALIDATION CORRIGÉ - GESTION ERREURS CORS
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
 * 🔄 SERVICE DE VALIDATION DES TÂCHES - VERSION CORS SAFE
 */
class TaskValidationService {
  
  /**
   * 📝 SOUMETTRE UNE TÂCHE POUR VALIDATION - VERSION SÉCURISÉE
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
        videoFile,
        xpAmount
      } = taskData;

      console.log('📝 Soumission tâche pour validation:', { taskId, userId, difficulty });

      // Upload des médias avec gestion d'erreur CORS
      let photoUrl = null;
      let videoUrl = null;
      let corsIssueDetected = false;

      // Essayer l'upload avec gestion d'erreur
      try {
        if (photoFile) {
          console.log('📸 Tentative upload photo...');
          photoUrl = await this.uploadTaskPhotoSafe(taskId, userId, photoFile);
        }

        if (videoFile) {
          console.log('🎬 Tentative upload vidéo...');
          videoUrl = await this.uploadTaskVideoSafe(taskId, userId, videoFile);
        }
      } catch (uploadError) {
        console.warn('⚠️ Erreur upload média (continuant sans):', uploadError.message);
        corsIssueDetected = true;
        // Continuer sans les médias en cas d'erreur CORS
      }

      // ✅ CORRECTION: Convertir les informations en données simples pour Firestore
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
        videoUrl: videoUrl,
        hasMedia: !!(photoUrl || videoUrl),
        
        // Statut et métadonnées
        status: 'pending',
        submittedAt: serverTimestamp(),
        type: 'task_completion',
        
        // Validation par admin
        reviewedBy: null,
        reviewedAt: null,
        adminComment: null,
        
        // Données enrichies
        submissionVersion: '1.2',
        source: 'synergia_app',
        
        // ✅ CORRECTION: Sauvegarder seulement des booléens/strings, pas d'objets File
        corsIssueDetected: corsIssueDetected,
        mediaFilesProvided: !!(photoFile || videoFile),
        mediaUploadSuccess: !!(photoUrl || videoUrl),
        
        // Informations sur les fichiers fournis (metadata uniquement)
        fileMetadata: {
          photoProvided: !!photoFile,
          videoProvided: !!videoFile,
          photoFileName: photoFile?.name || null,
          videoFileName: videoFile?.name || null,
          photoSize: photoFile?.size || null,
          videoSize: videoFile?.size || null
        }
      };

      // Sauvegarder la demande de validation
      const docRef = await addDoc(collection(db, 'task_validations'), validationRequest);
      
      // Mettre à jour le statut de la tâche
      await updateDoc(doc(db, 'tasks', taskId), {
        status: 'validation_pending',
        submittedForValidation: true,
        validationRequestId: docRef.id,
        lastSubmission: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Validation soumise avec succès:', docRef.id);
      
      return {
        success: true,
        validationId: docRef.id,
        hasMedia: !!(photoUrl || videoUrl),
        corsWarning: corsIssueDetected && !!(photoFile || videoFile)
      };
      
    } catch (error) {
      console.error('❌ Erreur soumission validation:', error);
      throw error;
    }
  }

  /**
   * 📸 UPLOAD PHOTO SÉCURISÉ AVEC GESTION CORS
   */
  async uploadTaskPhotoSafe(taskId, userId, photoFile) {
    try {
      const timestamp = Date.now();
      const fileName = `task-validations/${userId}/${taskId}-${timestamp}.jpg`;
      const photoRef = ref(storage, fileName);
      
      console.log('📸 Upload photo vers:', fileName);
      
      // Timeout rapide pour détecter les problèmes CORS
      const uploadPromise = uploadBytes(photoRef, photoFile);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('CORS_TIMEOUT')), 5000)
      );
      
      await Promise.race([uploadPromise, timeoutPromise]);
      const downloadURL = await getDownloadURL(photoRef);
      
      console.log('✅ Photo uploadée:', downloadURL);
      return downloadURL;
      
    } catch (error) {
      console.error('❌ Erreur upload photo:', error);
      
      // Détection améliorée des problèmes CORS
      if (error.message.includes('CORS') || 
          error.code === 'storage/unauthorized' ||
          error.message.includes('CORS_TIMEOUT') ||
          error.message.includes('ERR_FAILED')) {
        console.warn('⚠️ Problème CORS/réseau détecté, soumission sans photo');
        throw new Error('CORS_ERROR');
      }
      
      throw error;
    }
  }

  /**
   * 🎬 UPLOAD VIDÉO SÉCURISÉ AVEC GESTION CORS
   */
  async uploadTaskVideoSafe(taskId, userId, videoFile) {
    try {
      const timestamp = Date.now();
      const extension = videoFile.name.split('.').pop();
      const fileName = `task-validations/${userId}/${taskId}-video-${timestamp}.${extension}`;
      const videoRef = ref(storage, fileName);
      
      console.log('🎬 Upload vidéo vers:', fileName);
      
      // Timeout rapide pour détecter les problèmes CORS
      const uploadPromise = uploadBytes(videoRef, videoFile);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('CORS_TIMEOUT')), 5000)
      );
      
      await Promise.race([uploadPromise, timeoutPromise]);
      const downloadURL = await getDownloadURL(videoRef);
      
      console.log('✅ Vidéo uploadée:', downloadURL);
      return downloadURL;
      
    } catch (error) {
      console.error('❌ Erreur upload vidéo:', error);
      
      // Détection améliorée des problèmes CORS
      if (error.message.includes('CORS') || 
          error.code === 'storage/unauthorized' ||
          error.message.includes('CORS_TIMEOUT') ||
          error.message.includes('ERR_FAILED')) {
        console.warn('⚠️ Problème CORS/réseau détecté, soumission sans vidéo');
        throw new Error('CORS_ERROR');
      }
      
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
      const isRoleAdmin = userData.profile?.role === 'admin';
      const isProfileRoleAdmin = userData.role === 'admin';
      const hasAdminFlag = userData.isAdmin === true;
      const hasValidatePermission = userData.permissions?.includes('validate_tasks');
      
      const isAdmin = isRoleAdmin || isProfileRoleAdmin || hasAdminFlag || hasValidatePermission;
      
      console.log('🔍 checkAdminPermissions:', {
        userId,
        isRoleAdmin,
        isProfileRoleAdmin,
        hasAdminFlag,
        hasValidatePermission,
        finalResult: isAdmin
      });
      
      return isAdmin;
      
    } catch (error) {
      console.error('❌ Erreur vérification admin:', error);
      return false;
    }
  }

  /**
   * ✅ VALIDER UNE TÂCHE (ADMIN) - VERSION CORRIGÉE
   */
  async validateTask(validationId, adminData) {
    try {
      const { userId: adminId, approved, comment, xpAwarded } = adminData;
      
      // Vérifier les permissions admin
      const hasPermission = await this.checkAdminPermissions(adminId);
      if (!hasPermission) {
        throw new Error('Permissions administrateur requises');
      }

      // Récupérer la demande de validation
      const validationRef = doc(db, 'task_validations', validationId);
      const validationDoc = await getDoc(validationRef);
      
      if (!validationDoc.exists()) {
        throw new Error('Demande de validation introuvable');
      }

      const validation = validationDoc.data();
      
      // Mettre à jour la demande de validation
      await updateDoc(validationRef, {
        status: approved ? 'approved' : 'rejected',
        reviewedBy: adminId,
        reviewedAt: serverTimestamp(),
        adminComment: comment || '',
        xpAwarded: approved ? (xpAwarded || validation.xpAmount) : 0,
        approved: approved
      });

      // Mettre à jour la tâche
      const taskRef = doc(db, 'tasks', validation.taskId);
      await updateDoc(taskRef, {
        status: approved ? 'completed' : 'assigned',
        completedAt: approved ? serverTimestamp() : null,
        validatedBy: adminId,
        validatedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Si approuvé, attribuer les XP
      if (approved) {
        const xpToAward = xpAwarded || validation.xpAmount;
        
        // ✅ CORRECTION: Utiliser addXP au lieu de awardXP
        await gamificationService.addXP(validation.userId, xpToAward, `Tâche validée: ${validation.taskTitle}`);
        
        console.log('🎯 XP attribués:', xpToAward, 'à l\'utilisateur:', validation.userId);
      }
      
      console.log('✅ Tâche validée avec succès:', validation.taskId);
      
      return {
        success: true,
        approved: approved,
        xpAwarded: approved ? (xpAwarded || validation.xpAmount) : 0
      };
      
    } catch (error) {
      console.error('❌ Erreur validation tâche:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER LES DEMANDES EN ATTENTE
   */
  async getPendingValidations() {
    try {
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
      
      console.log('📋 Demandes en attente récupérées:', validations.length);
      return validations;
      
    } catch (error) {
      console.error('❌ Erreur récupération validations:', error);
      throw error;
    }
  }

  /**
   * 📊 ÉCOUTER LES DEMANDES EN TEMPS RÉEL
   */
  listenToPendingValidations(callback) {
    try {
      const q = query(
        collection(db, 'task_validations'),
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc')
      );
      
      return onSnapshot(q, (snapshot) => {
        const validations = [];
        snapshot.forEach(doc => {
          validations.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        callback(validations);
      });
      
    } catch (error) {
      console.error('❌ Erreur écoute validations:', error);
      throw error;
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

// Instance unique du service
export const taskValidationService = new TaskValidationService();
export { TaskValidationService };
