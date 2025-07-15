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
  
  constructor() {
    this.name = 'TaskValidationService';
    console.log('🔄 TaskValidationService initialisé avec gestion CORS');
  }

  /**
   * 🎯 CALCULER XP SELON DIFFICULTÉ
   */
  calculateXPForDifficulty(difficulty) {
    const xpMap = {
      'easy': 10,
      'normal': 25,
      'hard': 50,
      'expert': 100
    };
    return xpMap[difficulty] || 25;
  }

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
        
        // Métadonnées
        status: 'pending',
        submittedAt: serverTimestamp(),
        reviewedAt: null,
        reviewerId: null,
        reviewComment: '',
        approved: null,
        
        // Informations utilisateur (pour éviter des jointures)
        submitterEmail: null, // À remplir plus tard si nécessaire
        submitterName: null
      };

      console.log('💾 Enregistrement demande validation:', validationRequest);
      
      // Enregistrer la demande de validation
      const validationRef = await addDoc(
        collection(db, 'validationRequests'), 
        validationRequest
      );

      console.log('✅ Demande validation créée:', validationRef.id);

      // Mettre à jour le statut de la tâche
      await this.updateTaskStatus(taskId, 'validation_pending');

      return {
        success: true,
        validationId: validationRef.id,
        xpPending: this.calculateXPForDifficulty(difficulty),
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
   * 🔄 METTRE À JOUR LE STATUT D'UNE TÂCHE
   */
  async updateTaskStatus(taskId, newStatus) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Statut tâche ${taskId} mis à jour: ${newStatus}`);
    } catch (error) {
      console.error('❌ Erreur mise à jour statut tâche:', error);
      // Ne pas faire planter la soumission pour ça
    }
  }

  /**
   * 📋 RÉCUPÉRER LES DEMANDES DE VALIDATION EN ATTENTE
   */
  async getPendingValidations(limit = 20) {
    try {
      const validationsQuery = query(
        collection(db, 'validationRequests'),
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(validationsQuery);
      const validations = [];
      
      snapshot.forEach((doc) => {
        validations.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`📋 ${validations.length} validations en attente trouvées`);
      return validations;
      
    } catch (error) {
      console.error('❌ Erreur récupération validations:', error);
      return [];
    }
  }

  /**
   * ✅ APPROUVER UNE VALIDATION
   */
  async approveValidation(validationId, reviewerId, reviewComment = '') {
    try {
      const validationRef = doc(db, 'validationRequests', validationId);
      const validationSnap = await getDoc(validationRef);
      
      if (!validationSnap.exists()) {
        throw new Error('Validation non trouvée');
      }
      
      const validationData = validationSnap.data();
      
      // Mettre à jour la validation
      await updateDoc(validationRef, {
        status: 'approved',
        approved: true,
        reviewerId,
        reviewComment,
        reviewedAt: serverTimestamp()
      });
      
      // Attribuer les XP
      if (validationData.userId && validationData.xpAmount) {
        await gamificationService.addExperience(
          validationData.userId, 
          validationData.xpAmount,
          `Tâche validée: ${validationData.taskTitle}`
        );
      }
      
      // Mettre à jour le statut de la tâche
      if (validationData.taskId) {
        await this.updateTaskStatus(validationData.taskId, 'completed');
      }
      
      console.log('✅ Validation approuvée:', validationId);
      return true;
      
    } catch (error) {
      console.error('❌ Erreur approbation validation:', error);
      throw error;
    }
  }

  /**
   * ❌ REJETER UNE VALIDATION
   */
  async rejectValidation(validationId, reviewerId, reviewComment) {
    try {
      const validationRef = doc(db, 'validationRequests', validationId);
      const validationSnap = await getDoc(validationRef);
      
      if (!validationSnap.exists()) {
        throw new Error('Validation non trouvée');
      }
      
      const validationData = validationSnap.data();
      
      // Mettre à jour la validation
      await updateDoc(validationRef, {
        status: 'rejected',
        approved: false,
        reviewerId,
        reviewComment,
        reviewedAt: serverTimestamp()
      });
      
      // Remettre la tâche en cours
      if (validationData.taskId) {
        await this.updateTaskStatus(validationData.taskId, 'in_progress');
      }
      
      console.log('❌ Validation rejetée:', validationId);
      return true;
      
    } catch (error) {
      console.error('❌ Erreur rejet validation:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DE VALIDATION D'UN UTILISATEUR
   */
  async getUserValidationStats(userId) {
    try {
      const userValidationsQuery = query(
        collection(db, 'validationRequests'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(userValidationsQuery);
      const stats = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalXPEarned: 0
      };
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        stats.total++;
        
        if (data.status === 'pending') stats.pending++;
        if (data.status === 'approved') {
          stats.approved++;
          stats.totalXPEarned += data.xpAmount || 0;
        }
        if (data.status === 'rejected') stats.rejected++;
      });
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur stats validation utilisateur:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalXPEarned: 0
      };
    }
  }

  /**
   * 🗑️ SUPPRIMER UNE VALIDATION
   */
  async deleteValidation(validationId) {
    try {
      const validationRef = doc(db, 'validationRequests', validationId);
      const validationSnap = await getDoc(validationRef);
      
      if (validationSnap.exists()) {
        const validationData = validationSnap.data();
        
        // Supprimer les médias associés si nécessaire
        if (validationData.photoUrl) {
          try {
            const photoRef = ref(storage, validationData.photoUrl);
            await deleteObject(photoRef);
          } catch (error) {
            console.warn('⚠️ Erreur suppression photo:', error);
          }
        }
        
        if (validationData.videoUrl) {
          try {
            const videoRef = ref(storage, validationData.videoUrl);
            await deleteObject(videoRef);
          } catch (error) {
            console.warn('⚠️ Erreur suppression vidéo:', error);
          }
        }
      }
      
      await deleteDoc(validationRef);
      console.log('🗑️ Validation supprimée:', validationId);
      
    } catch (error) {
      console.error('❌ Erreur suppression validation:', error);
      throw error;
    }
  }
}

// Créer et exporter une instance unique
const taskValidationService = new TaskValidationService();
export { taskValidationService };
