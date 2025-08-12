// ==========================================
// 📁 react-app/src/core/services/taskValidationServiceEnhanced.js
// SERVICE DE VALIDATION AVEC INTÉGRATION HISTORIQUE COMPLÈTE
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
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase.js';
import { taskAssignmentService } from './taskAssignmentService.js';
import { taskHistoryService } from './taskHistoryService.js'; // ✅ IMPORT DU SERVICE HISTORIQUE

/**
 * 🔄 SERVICE DE VALIDATION AVEC HISTORIQUE AUTOMATIQUE
 */
class TaskValidationServiceEnhanced {
  
  /**
   * 📝 SOUMETTRE UNE TÂCHE POUR VALIDATION (Version améliorée)
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

      console.log('📝 Soumission tâche pour validation (avec historique):', { taskId, userId, difficulty });

      // Vérifier si c'est une tâche avec assignations multiples
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const task = taskDoc.data();
      const isMultipleAssignment = task.isMultipleAssignment && task.assignedTo?.length > 1;

      // Upload des médias si fournis
      let photoUrl = null;
      let videoUrl = null;

      if (photoFile) {
        photoUrl = await this.uploadTaskMedia(taskId, userId, photoFile, 'photo');
      }

      if (videoFile) {
        videoUrl = await this.uploadTaskMedia(taskId, userId, videoFile, 'video');
      }

      if (isMultipleAssignment) {
        // Pour les tâches avec assignations multiples
        return await this.submitMultipleAssignmentValidation({
          taskId,
          userId,
          taskTitle,
          projectId,
          difficulty,
          comment,
          photoUrl,
          videoUrl,
          xpAmount
        });
      } else {
        // Pour les tâches standard
        return await this.submitStandardValidation({
          taskId,
          userId,
          taskTitle,
          projectId,
          difficulty,
          comment,
          photoUrl,
          videoUrl,
          xpAmount
        });
      }

    } catch (error) {
      console.error('❌ [SUBMIT] Erreur soumission validation:', error);
      throw error;
    }
  }

  /**
   * 📝 SOUMETTRE VALIDATION STANDARD
   */
  async submitStandardValidation(data) {
    const docRef = await addDoc(collection(db, 'task_validations'), {
      type: 'standard',
      ...data,
      submittedAt: serverTimestamp(),
      status: 'pending'
    });

    return {
      success: true,
      validationId: docRef.id,
      message: 'Tâche soumise pour validation avec succès'
    };
  }

  /**
   * 📝 SOUMETTRE VALIDATION ASSIGNATION MULTIPLE
   */
  async submitMultipleAssignmentValidation(data) {
    const docRef = await addDoc(collection(db, 'task_validations'), {
      type: 'multiple_assignment',
      ...data,
      submittedAt: serverTimestamp(),
      status: 'pending'
    });

    return {
      success: true,
      validationId: docRef.id,
      message: 'Tâche multi-assignée soumise pour validation avec succès'
    };
  }

  /**
   * 📤 UPLOAD MEDIA POUR VALIDATION
   */
  async uploadTaskMedia(taskId, userId, mediaFile, type) {
    try {
      const timestamp = Date.now();
      const extension = mediaFile.name.split('.').pop();
      const fileName = `task-validations/${userId}/${taskId}-${type}-${timestamp}.${extension}`;
      const mediaRef = ref(storage, fileName);
      
      await uploadBytes(mediaRef, mediaFile);
      const downloadURL = await getDownloadURL(mediaRef);
      
      console.log(`📸 ${type} uploadé:`, downloadURL);
      return downloadURL;
      
    } catch (error) {
      console.error(`❌ Erreur upload ${type}:`, error);
      throw error;
    }
  }

  /**
   * ✅ APPROUVER UNE VALIDATION AVEC ARCHIVAGE AUTOMATIQUE
   */
  async approveValidation(validationId, adminId, adminComment = '') {
    try {
      console.log('✅ [APPROVE] DÉBUT approbation avec archivage automatique:', validationId);
      
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
      const { taskId, type } = validationData;

      console.log('✅ [APPROVE] Données validation récupérées:', { taskId, type, userId: validationData.userId });

      // Mettre à jour la validation
      await updateDoc(validationRef, {
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: serverTimestamp(),
        adminComment: adminComment || 'Tâche approuvée'
      });

      console.log('✅ [APPROVE] Validation mise à jour dans DB');

      if (type === 'multiple_assignment') {
        // Distribuer les XP pour assignation multiple
        const result = await taskAssignmentService.distributeXPToAssignees(
          taskId, 
          adminId, 
          validationData.xpAmount, 
          adminComment
        );
        
        console.log('🏆 [APPROVE] XP distribués pour assignation multiple:', result);
      } else {
        // ✅ ATTRIBUTION XP + ARCHIVAGE AUTOMATIQUE POUR TÂCHE STANDARD
        console.log('🏆 [APPROVE] Attribution XP pour tâche standard...');
        
        const xpResult = await this.awardXPToUserWithSync(
          validationData.userId, 
          validationData.xpAmount, 
          taskId, 
          validationData.taskTitle
        );

        console.log('✅ [APPROVE] XP attribués:', xpResult);

        // 📚 ARCHIVAGE AUTOMATIQUE DANS L'HISTORIQUE
        console.log('📚 [APPROVE] Début archivage automatique...');
        
        const archiveResult = await this.archiveTaskToHistory(
          taskId,
          validationData,
          adminId,
          adminComment,
          xpResult
        );

        console.log('✅ [APPROVE] Archivage terminé:', archiveResult);
      }

      console.log(`✅ [APPROVE] Validation ${validationId} approuvée par ${adminId} avec archivage complet`);
      
      return {
        success: true,
        message: 'Validation approuvée avec succès - Tâche archivée automatiquement',
        type: type,
        archived: true
      };

    } catch (error) {
      console.error('❌ [APPROVE] Erreur approbation validation:', error);
      throw error;
    }
  }

  /**
   * 📚 ARCHIVER LA TÂCHE DANS L'HISTORIQUE
   */
  async archiveTaskToHistory(taskId, validationData, adminId, adminComment, xpResult) {
    try {
      console.log('📚 [ARCHIVE] Début archivage automatique de la tâche:', taskId);

      // Récupérer les données utilisateur pour le nom
      const userRef = doc(db, 'users', validationData.userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      // Préparer les données de completion pour l'historique
      const completionData = {
        userId: validationData.userId,
        userName: userData.displayName || userData.email
