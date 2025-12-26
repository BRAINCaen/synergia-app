// ==========================================
// 📁 react-app/src/core/services/taskValidationService.js
// SERVICE DE VALIDATION DES QUÊTES - VERSION COMPLÈTE AVEC UPLOAD
// ✅ CORRIGÉ : Upload Firebase Storage + Stockage preuves dans tasks
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
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { db, storage } from '../firebase.js';
import { getAuth } from 'firebase/auth';

// ✅ IMPORT DU SERVICE DE NOTIFICATIONS
import notificationService from './notificationService.js';

// 🌳 IMPORT DU SERVICE DE SKILLS
import { skillService } from './skillService.js';

/**
 * 🎯 SERVICE DE VALIDATION DES QUÊTES
 * Gère la soumission, l'upload des preuves et la validation par les admins
 */
class TaskValidationService {
  constructor() {
    this.COLLECTION_NAME = 'task_validations';
    console.log('🎯 TaskValidationService initialisé');
  }

  /**
   * 📊 CALCULER LES XP SELON LA DIFFICULTÉ
   */
  calculateXPForDifficulty(difficulty) {
    const xpByDifficulty = {
      'easy': 10,
      'facile': 10,
      'normal': 25,
      'normale': 25,
      'medium': 25,
      'moyenne': 25,
      'hard': 50,
      'difficile': 50,
      'expert': 100,
      'légendaire': 150
    };
    return xpByDifficulty[difficulty?.toLowerCase()] || 25;
  }

  /**
   * 📤 UPLOAD D'UN FICHIER VERS FIREBASE STORAGE (API REST avec timeout)
   * @param {File} file - Le fichier à uploader
   * @param {string} taskId - L'ID de la tâche
   * @param {string} userId - L'ID de l'utilisateur
   * @param {string} type - 'photo' ou 'video'
   * @returns {Promise<string|null>} L'URL de téléchargement ou null si erreur
   */
  async uploadMediaToStorage(file, taskId, userId, type) {
    try {
      if (!file) return null;

      console.log(`📤 [UPLOAD] Début upload ${type}:`, {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type
      });

      // Créer un nom de fichier unique
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || (type === 'photo' ? 'jpg' : 'mp4');
      const filePath = `task-validations/${userId}/${taskId}_${type}_${timestamp}.${extension}`;

      // Récupérer le token d'authentification
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }
      const token = await user.getIdToken();

      // Configuration upload REST API (plus fiable que le SDK)
      const bucket = 'synergia-app-f27e7.firebasestorage.app';
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=multipart&name=${encodeURIComponent(filePath)}`;

      console.log(`📤 [UPLOAD] Upload REST API vers: ${filePath}`);

      // Upload avec timeout de 2 minutes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      try {
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': file.type
          },
          body: file,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('❌ [UPLOAD] Erreur réponse:', errorText);
          throw new Error(`Erreur upload: ${uploadResponse.status}`);
        }

        // Récupérer le token de téléchargement depuis la réponse
        const uploadData = await uploadResponse.json();
        const downloadToken = uploadData.downloadTokens;

        // Construire l'URL de téléchargement AVEC le token d'accès
        let downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(filePath)}?alt=media`;
        if (downloadToken) {
          downloadURL += `&token=${downloadToken}`;
        }

        console.log(`✅ [UPLOAD] ${type} uploadé avec succès:`, downloadURL);
        return downloadURL;

      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error('❌ [UPLOAD] Timeout - fichier trop volumineux ou connexion lente');
        }
        throw fetchError;
      }

    } catch (error) {
      console.error(`❌ [UPLOAD] Erreur upload ${type}:`, error);

      // Gérer les erreurs spécifiques
      if (error.message?.includes('Timeout') || error.name === 'AbortError') {
        console.warn('⚠️ [UPLOAD] Le fichier est peut-être trop volumineux. Essayez un fichier plus petit.');
      } else if (error.message?.includes('401') || error.message?.includes('403')) {
        console.warn('⚠️ [UPLOAD] Erreur d\'autorisation - vérifier les règles Firebase Storage');
      }

      // Ne pas bloquer la soumission si l'upload échoue
      return null;
    }
  }

  /**
   * 🛡️ VÉRIFIER LES PERMISSIONS ADMIN
   */
  async checkAdminPermissions(userId) {
    try {
      console.log('🔍 [TaskValidation] Vérification permissions admin pour:', userId);
      
      if (!userId) {
        console.warn('⚠️ checkAdminPermissions: userId manquant');
        return false;
      }

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
   * ✅ VERSION COMPLÈTE AVEC UPLOAD ET STOCKAGE DANS TASKS
   */
  async submitTaskForValidation(validationData) {
    try {
      const {
        taskId,
        userId,
        taskTitle,
        projectId,
        difficulty,
        comment,
        photoFile,
        videoFile
      } = validationData;

      console.log('📝 [SUBMIT] Début soumission validation:', { 
        taskId, 
        userId,
        hasComment: !!comment,
        hasPhoto: !!photoFile, 
        hasVideo: !!videoFile 
      });

      // 1. Upload des fichiers si présents
      let photoUrl = null;
      let videoUrl = null;

      if (photoFile) {
        console.log('📸 [SUBMIT] Upload de la photo...');
        photoUrl = await this.uploadMediaToStorage(photoFile, taskId, userId, 'photo');
      }

      if (videoFile) {
        console.log('🎬 [SUBMIT] Upload de la vidéo...');
        videoUrl = await this.uploadMediaToStorage(videoFile, taskId, userId, 'video');
      }

      // 2. Calculer les XP
      const xpAmount = this.calculateXPForDifficulty(difficulty);

      // 3. Récupérer les infos utilisateur pour le nom
      let userName = 'Utilisateur';
      let userEmail = '';
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userName = userData.displayName || userData.profile?.displayName || userData.email?.split('@')[0] || 'Utilisateur';
          userEmail = userData.email || '';
        }
      } catch (e) {
        console.warn('⚠️ [SUBMIT] Impossible de récupérer le nom utilisateur');
      }

      // 4. Préparer les données de validation
      const submissionData = {
        taskId,
        userId,
        userName,
        userEmail,
        taskTitle: taskTitle || 'Tâche sans titre',
        projectId: projectId || null,
        difficulty: difficulty || 'normal',
        comment: comment || '',
        photoUrl: photoUrl,
        videoUrl: videoUrl,
        status: 'pending',
        submittedAt: serverTimestamp(),
        type: 'task_submission',
        xpAmount: xpAmount,
        reviewedBy: null,
        reviewedAt: null,
        adminComment: null
      };

      // 5. Créer le document dans task_validations (pour l'historique)
      console.log('💾 [SUBMIT] Création document task_validations...');
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), submissionData);
      console.log('✅ [SUBMIT] Document validation créé:', docRef.id);

      // ✅ 6. METTRE À JOUR LE DOCUMENT TASKS AVEC LES PREUVES
      console.log('🔄 [SUBMIT] Mise à jour document tasks avec preuves...');
      const taskUpdateData = {
        status: 'validation_pending',
        submittedForValidation: true,
        validationRequestId: docRef.id,
        updatedAt: serverTimestamp(),
        // ✅ STOCKAGE DES PREUVES DANS LE DOCUMENT TASKS
        validationComment: comment || '',
        validationPhotoUrl: photoUrl,
        validationVideoUrl: videoUrl,
        validationSubmittedAt: serverTimestamp(),
        validationSubmittedBy: userId
      };

      await updateDoc(doc(db, 'tasks', taskId), taskUpdateData);
      console.log('✅ [SUBMIT] Document tasks mis à jour avec preuves');

      // 7. Envoyer notification aux admins
      try {
        console.log('🔔 [SUBMIT] Envoi notification aux admins...');
        await notificationService.notifyQuestValidationPending({
          questId: taskId,
          validationId: docRef.id,
          questTitle: taskTitle || 'Quête sans titre',
          userId: userId,
          userName: userName,
          xpAmount: xpAmount
        });
        console.log('✅ [SUBMIT] Notification envoyée');
      } catch (notifError) {
        console.warn('⚠️ [SUBMIT] Erreur notification (non bloquante):', notifError);
      }

      console.log('✅ [SUBMIT] Validation soumise avec succès !');

      return {
        success: true,
        validationId: docRef.id,
        message: 'Tâche soumise pour validation avec succès',
        xpAmount: xpAmount,
        photoUrl: photoUrl,
        videoUrl: videoUrl
      };

    } catch (error) {
      console.error('❌ [SUBMIT] Erreur soumission validation:', error);
      throw new Error(`Erreur soumission: ${error.message}`);
    }
  }

  /**
   * 🔍 RÉCUPÉRER LES VALIDATIONS EN ATTENTE
   */
  async getPendingValidations() {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Erreur récupération validations:', error);
      return [];
    }
  }

  /**
   * 👀 S'ABONNER AUX VALIDATIONS EN ATTENTE (temps réel)
   */
  subscribeToValidationRequests(callback) {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        const validations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(validations);
      });
    } catch (error) {
      console.error('❌ Erreur subscription validations:', error);
      return () => {};
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
        adminComment: adminComment || 'Approuvé'
      });

      // Mettre à jour la tâche
      if (validationData.taskId) {
        await updateDoc(doc(db, 'tasks', validationData.taskId), {
          status: 'completed',
          completedAt: serverTimestamp(),
          validatedBy: adminUserId,
          adminComment: adminComment,
          updatedAt: serverTimestamp()
        });

        // 🌳 DISTRIBUER L'XP AUX COMPÉTENCES
        try {
          // Récupérer les infos de la tâche pour les requiredSkills
          const taskDoc = await getDoc(doc(db, 'tasks', validationData.taskId));
          if (taskDoc.exists()) {
            const taskData = taskDoc.data();
            const requiredSkills = taskData.requiredSkills || taskData.skills || [];

            if (requiredSkills.length > 0) {
              console.log('🌳 [SKILLS] Distribution XP skills:', {
                userId: validationData.userId,
                xpAmount: validationData.xpAmount,
                skills: requiredSkills
              });

              const skillResults = await skillService.distributeQuestSkillXP(
                validationData.userId,
                validationData.xpAmount,
                requiredSkills
              );

              console.log('🌳 [SKILLS] XP distribué:', skillResults);
            } else {
              console.log('🌳 [SKILLS] Aucun skill requis pour cette quête');
            }
          }
        } catch (skillError) {
          console.warn('⚠️ [SKILLS] Erreur distribution XP skills (non bloquante):', skillError);
        }
      }

      // 🔔 Notifier l'utilisateur
      try {
        await notificationService.notifyQuestApproved(validationData.userId, {
          questId: validationData.taskId,
          questTitle: validationData.taskTitle,
          xpAmount: validationData.xpAmount
        });
        console.log('🔔 [NOTIF] Utilisateur notifié de l\'approbation');
      } catch (notifError) {
        console.warn('⚠️ [NOTIF] Erreur notification utilisateur:', notifError);
      }

      console.log('✅ [APPROVE] Validation approuvée');
      return { success: true, validationId };

    } catch (error) {
      console.error('❌ [APPROVE] Erreur:', error);
      throw error;
    }
  }

  /**
   * ❌ REJETER UNE VALIDATION
   */
  async rejectValidation(validationId, adminUserId, adminComment) {
    try {
      console.log('❌ [REJECT] Rejet validation:', validationId);

      if (!adminComment?.trim()) {
        throw new Error('Un commentaire est requis pour rejeter');
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

      // Remettre la tâche en cours
      if (validationData.taskId) {
        await updateDoc(doc(db, 'tasks', validationData.taskId), {
          status: 'in_progress',
          submittedForValidation: false,
          rejectedAt: serverTimestamp(),
          rejectedBy: adminUserId,
          rejectionReason: adminComment,
          // Effacer les preuves de validation
          validationComment: null,
          validationPhotoUrl: null,
          validationVideoUrl: null,
          updatedAt: serverTimestamp()
        });
      }

      // 🔔 Notifier l'utilisateur
      try {
        await notificationService.notifyQuestRejected(validationData.userId, {
          questId: validationData.taskId,
          questTitle: validationData.taskTitle,
          reason: adminComment
        });
        console.log('🔔 [NOTIF] Utilisateur notifié du rejet');
      } catch (notifError) {
        console.warn('⚠️ [NOTIF] Erreur notification utilisateur:', notifError);
      }

      console.log('❌ [REJECT] Validation rejetée');
      return { success: true, validationId };

    } catch (error) {
      console.error('❌ [REJECT] Erreur:', error);
      throw error;
    }
  }

  /**
   * 📊 STATISTIQUES DE VALIDATION
   */
  async getValidationStats() {
    try {
      const allDocs = await getDocs(collection(db, this.COLLECTION_NAME));
      
      let pending = 0;
      let approved = 0;
      let rejected = 0;
      
      allDocs.forEach(doc => {
        const status = doc.data().status;
        if (status === 'pending') pending++;
        else if (status === 'approved') approved++;
        else if (status === 'rejected') rejected++;
      });
      
      return {
        total: allDocs.size,
        pending,
        approved,
        rejected
      };
    } catch (error) {
      console.error('❌ Erreur stats validation:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
  }

  /**
   * 🔄 MÉTHODE LEGACY POUR COMPATIBILITÉ
   */
  async validateTaskRequest(validationId, adminUserId, adminComment, approved) {
    if (approved) {
      return this.approveValidation(validationId, adminUserId, adminComment);
    } else {
      return this.rejectValidation(validationId, adminUserId, adminComment);
    }
  }
}

// ✅ INSTANCE UNIQUE
const taskValidationService = new TaskValidationService();

// ✅ EXPORTS MULTIPLES POUR COMPATIBILITÉ
export { taskValidationService };
export default taskValidationService;

console.log('🎯 TaskValidationService prêt - Version avec upload Firebase Storage');
