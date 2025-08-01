// ==========================================
// 📁 react-app/src/core/services/taskValidationServiceEnhanced.js
// SERVICE DE VALIDATION AMÉLIORÉ POUR ASSIGNATIONS MULTIPLES
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

/**
 * 🔄 SERVICE DE VALIDATION AMÉLIORÉ POUR ASSIGNATIONS MULTIPLES
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

      console.log('📝 Soumission tâche pour validation (multi):', { taskId, userId, difficulty });

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
        return await this.submitMultipleAssignmentValidation(taskData, photoUrl, videoUrl);
      } else {
        // Pour les tâches simples
        return await this.submitSingleAssignmentValidation(taskData, photoUrl, videoUrl);
      }
      
    } catch (error) {
      console.error('❌ Erreur soumission validation:', error);
      throw error;
    }
  }

  /**
   * 📝 SOUMISSION VALIDATION TÂCHE SIMPLE
   */
  async submitSingleAssignmentValidation(taskData, photoUrl, videoUrl) {
    const {
      taskId,
      userId,
      taskTitle,
      projectId,
      difficulty,
      comment,
      xpAmount
    } = taskData;

    // Créer la demande de validation classique
    const validationRequest = {
      taskId,
      userId,
      projectId: projectId || null,
      taskTitle: taskTitle || 'Tâche sans titre',
      difficulty: difficulty || 'normal',
      xpAmount: this.calculateXPForDifficulty(difficulty),
      comment: comment || '',
      photoUrl: photoUrl,
      videoUrl: videoUrl,
      status: 'pending',
      submittedAt: serverTimestamp(),
      type: 'single_assignment',
      reviewedBy: null,
      reviewedAt: null,
      adminComment: null,
      submissionVersion: '2.0',
      source: 'synergia_app'
    };

    const docRef = await addDoc(collection(db, 'task_validations'), validationRequest);

    // Mettre à jour le statut de la tâche
    await updateDoc(doc(db, 'tasks', taskId), {
      status: 'validation_pending',
      submittedForValidation: true,
      validationRequestId: docRef.id,
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      validationId: docRef.id,
      type: 'single_assignment'
    };
  }

  /**
   * 📝 SOUMISSION VALIDATION TÂCHE MULTIPLE
   */
  async submitMultipleAssignmentValidation(taskData, photoUrl, videoUrl) {
    const {
      taskId,
      userId,
      taskTitle,
      projectId,
      difficulty,
      comment,
      xpAmount
    } = taskData;

    // Marquer la soumission de cet utilisateur
    await taskAssignmentService.markUserSubmission(taskId, userId, {
      comment: comment,
      photoUrl: photoUrl,
      videoUrl: videoUrl,
      submittedAt: new Date().toISOString()
    });

    // Récupérer la tâche mise à jour
    const taskDoc = await getDoc(doc(db, 'tasks', taskId));
    const task = taskDoc.data();

    // Si tous les assignés ont soumis, créer la demande de validation globale
    if (task.allSubmitted) {
      const validationRequest = {
        taskId,
        assignedUsers: task.assignedTo,
        assignments: task.assignments,
        projectId: projectId || null,
        taskTitle: taskTitle || 'Tâche sans titre',
        difficulty: difficulty || 'normal',
        xpAmount: this.calculateXPForDifficulty(difficulty),
        status: 'pending',
        submittedAt: serverTimestamp(),
        type: 'multiple_assignment',
        assignmentCount: task.assignedTo.length,
        reviewedBy: null,
        reviewedAt: null,
        adminComment: null,
        submissionVersion: '2.0',
        source: 'synergia_app'
      };

      const docRef = await addDoc(collection(db, 'task_validations'), validationRequest);

      // Mettre à jour la tâche
      await updateDoc(doc(db, 'tasks', taskId), {
        status: 'validation_pending',
        validationRequestId: docRef.id,
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        validationId: docRef.id,
        type: 'multiple_assignment',
        allSubmitted: true
      };
    } else {
      return {
        success: true,
        type: 'multiple_assignment',
        allSubmitted: false,
        userSubmitted: true,
        remainingSubmissions: task.assignments.filter(a => !a.hasSubmitted).length
      };
    }
  }

  /**
   * 📸 UPLOAD D'UN FICHIER MÉDIA (photo/vidéo)
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
   * ✅ APPROUVER UNE VALIDATION (Version améliorée)
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
      const { taskId, type } = validationData;

      // Mettre à jour la validation
      await updateDoc(validationRef, {
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: serverTimestamp(),
        adminComment: adminComment || 'Tâche approuvée'
      });

      if (type === 'multiple_assignment') {
        // Distribuer les XP pour assignation multiple
        const result = await taskAssignmentService.distributeXPToAssignees(
          taskId, 
          adminId, 
          validationData.xpAmount, 
          adminComment
        );
        
        console.log('🏆 XP distribués pour assignation multiple:', result);
      } else {
        // Attribution XP classique pour tâche simple
        await this.awardXPToUser(validationData.userId, validationData.xpAmount, taskId, validationData.taskTitle);
        
        // Mettre à jour la tâche
        await updateDoc(doc(db, 'tasks', taskId), {
          status: 'completed',
          completedAt: serverTimestamp(),
          validatedBy: adminId,
          adminComment: adminComment
        });
      }

      console.log(`✅ Validation ${validationId} approuvée par ${adminId}`);
      
      return {
        success: true,
        message: 'Validation approuvée avec succès',
        type: type
      };

    } catch (error) {
      console.error('❌ Erreur approbation validation:', error);
      throw error;
    }
  }

  /**
   * 🏆 ATTRIBUER XP À UN UTILISATEUR UNIQUE
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
        hasValidatePermission
