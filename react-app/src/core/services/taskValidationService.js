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
        // Continuer sans les médias en cas d'erreur CORS
      }

      // Créer la demande de validation même sans média
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
        submissionVersion: '1.1',
        source: 'synergia_app',
        corsIssue: !photoUrl && !videoUrl && (photoFile || videoFile) // Indicateur si problème CORS
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
        corsWarning: !photoUrl && !videoUrl && (photoFile || videoFile)
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
      
      await uploadBytes(photoRef, photoFile);
      const downloadURL = await getDownloadURL(photoRef);
      
      console.log('✅ Photo uploadée:', downloadURL);
      return downloadURL;
      
    } catch (error) {
      console.error('❌ Erreur upload photo:', error);
      
      // Si erreur CORS, essayer une approche alternative
      if (error.message.includes('CORS') || error.code === 'storage/unauthorized') {
        console.warn('⚠️ Problème CORS détecté, soumission sans photo');
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
      
      await uploadBytes(videoRef, videoFile);
      const downloadURL = await getDownloadURL(videoRef);
      
      console.log('✅ Vidéo uploadée:', downloadURL);
      return downloadURL;
      
    } catch (error) {
      console.error('❌ Erreur upload vidéo:', error);
      
      // Si erreur CORS, essayer une approche alternative
      if (error.message.includes('CORS') || error.code === 'storage/unauthorized') {
        console.warn('⚠️ Problème CORS détecté, soumission sans vidéo');
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
   * ✅ APPROUVER UNE VALIDATION (Admin seulement)
   */
  async approveValidation(validationId, adminId, adminComment = '') {
    try {
      const isAdmin = await this.checkAdminPermissions(adminId);
      if (!isAdmin) {
        throw new Error('Permissions insuffisantes');
      }

      const validationRef = doc(db, 'task_validations', validationId);
      const validationDoc = await getDoc(validationRef);
      
      if (!validationDoc.exists()) {
        throw new Error('Validation introuvable');
      }

      const validationData = validationDoc.data();

      // Mettre à jour la validation
      await updateDoc(validationRef, {
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: serverTimestamp(),
        adminComment: adminComment || 'Tâche approuvée'
      });

      // Attribuer les XP à l'utilisateur
      await this.awardXPToUser(
        validationData.userId, 
        validationData.xpAmount, 
        validationData.taskId, 
        validationData.taskTitle
      );

      // Mettre à jour la tâche
      await updateDoc(doc(db, 'tasks', validationData.taskId), {
        status: 'completed',
        completedAt: serverTimestamp(),
        validatedBy: adminId,
        adminComment: adminComment,
        updatedAt: serverTimestamp()
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
   * 🏆 ATTRIBUER XP À UN UTILISATEUR
   */
  async awardXPToUser(userId, xpAmount, taskId, taskTitle) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.warn('⚠️ Utilisateur introuvable pour attribution XP:', userId);
        return;
      }

      const userData = userDoc.data();
      const currentXP = userData.gamification?.totalXp || 0;
      const currentLevel = userData.gamification?.level || 1;
      const tasksCompleted = userData.gamification?.tasksCompleted || 0;

      const newXP = currentXP + xpAmount;
      const newLevel = this.calculateLevel(newXP);

      await updateDoc(userRef, {
        'gamification.totalXp': newXP,
        'gamification.level': newLevel,
        'gamification.tasksCompleted': tasksCompleted + 1,
        'gamification.lastActivityDate': serverTimestamp(),
        'gamification.lastXpGain': {
          amount: xpAmount,
          source: 'task_completion',
          taskId: taskId,
          taskTitle: taskTitle,
          date: new Date().toISOString()
        }
      });

      console.log('🏆 XP attribués:', { userId, xpAmount, newXP, newLevel });

    } catch (error) {
      console.error('❌ Erreur attribution XP:', error);
      throw error;
    }
  }

  /**
   * 📊 CALCULER LE NIVEAU BASÉ SUR L'XP
   */
  calculateLevel(totalXp) {
    if (totalXp < 100) return 1;
    if (totalXp < 200) return 2;
    if (totalXp < 350) return 3;
    if (totalXp < 550) return 4;
    if (totalXp < 800) return 5;
    
    return Math.floor((totalXp - 800) / 300) + 6;
  }

  /**
   * ❌ REJETER UNE VALIDATION (Admin seulement)
   */
  async rejectValidation(validationId, adminId, rejectionReason = '') {
    try {
      const isAdmin = await this.checkAdminPermissions(adminId);
      if (!isAdmin) {
        throw new Error('Permissions insuffisantes');
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
        reviewedBy: adminId,
        reviewedAt: serverTimestamp(),
        adminComment: rejectionReason || 'Validation rejetée',
        rejectionReason: rejectionReason
      });

      // Mettre à jour la tâche
      await updateDoc(doc(db, 'tasks', validationData.taskId), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: adminId,
        rejectionReason: rejectionReason,
        updatedAt: serverTimestamp()
      });

      console.log(`❌ Validation ${validationId} rejetée par ${adminId}`);
      
      return {
        success: true,
        message: 'Validation rejetée'
      };

    } catch (error) {
      console.error('❌ Erreur rejet validation:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER LES VALIDATIONS EN ATTENTE
   */
  async getPendingValidations() {
    try {
      console.log('📋 Récupération validations en attente...');
      
      const q = query(
        collection(db, 'task_validations'),
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const validations = [];
      
      for (const doc of querySnapshot.docs) {
        const validationData = doc.data();
        
        // Enrichir avec les données utilisateur
        const userData = await this.getUserData(validationData.userId);
        validations.push({
          id: doc.id,
          ...validationData,
          userName: userData?.profile?.displayName || userData?.displayName || 'Utilisateur',
          userEmail: userData?.email || ''
        });
      }
      
      console.log('✅ Validations récupérées:', validations.length);
      return validations;
      
    } catch (error) {
      console.error('❌ Erreur récupération validations:', error);
      return [];
    }
  }

  /**
   * 👤 RÉCUPÉRER LES DONNÉES D'UN UTILISATEUR
   */
  async getUserData(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data();
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Erreur récupération données utilisateur:', error);
      return null;
    }
  }
}

// Export de l'instance
export const taskValidationService = new TaskValidationService();
export default TaskValidationService;
