// ==========================================
// 📁 react-app/src/core/services/taskValidationServiceEnhanced.js
// SERVICE DE VALIDATION AVEC INTÉGRATION HISTORIQUE COMPLÈTE - SYNTAX FIX
// ✅ SYSTÈME 2 COMPTEURS : totalXp (prestige) + spendableXp (dépensables)
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
import xpHistoryService from './xpHistoryService.js';
import { taskHistoryService } from './taskHistoryService.js';

/**
 * 🔄 SERVICE DE VALIDATION AVEC HISTORIQUE AUTOMATIQUE
 * ✅ SYSTÈME 2 COMPTEURS XP :
 * - totalXp : XP de PRESTIGE (classements, niveaux) → NE DIMINUE JAMAIS
 * - spendableXp : XP DÉPENSABLES (récompenses) → SE DÉDUIT À L'ACHAT
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
        // Attribution XP + Archivage automatique pour tâche standard
        console.log('🏆 [APPROVE] Attribution XP pour tâche standard...');
        
        const xpResult = await this.awardXPToUserWithSync(
          validationData.userId, 
          validationData.xpAmount, 
          taskId, 
          validationData.taskTitle
        );

        console.log('✅ [APPROVE] XP attribués:', xpResult);

        // Archivage automatique dans l'historique
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
        userName: userData.displayName || userData.email || 'Utilisateur',
        userDisplayName: userData.displayName || 'Utilisateur',
        
        // Données de validation
        validatedBy: adminId,
        validatedAt: new Date(),
        adminComment: adminComment,
        submissionComment: validationData.comment || '',
        submissionPhoto: validationData.photoUrl || null,
        submissionVideo: validationData.videoUrl || null,
        
        // Données de performance
        timeSpent: validationData.timeSpent || null,
        quality: validationData.quality || 'good',
        wasVolunteer: validationData.wasVolunteer || false,
        
        // Données du projet si disponible
        projectName: validationData.projectName || null,
        
        // Résultats XP
        xpAwarded: xpResult?.xpAwarded || validationData.xpAmount || 0,
        leveledUp: xpResult?.leveledUp || false
      };

      // Archiver la tâche dans l'historique
      const archiveResult = await taskHistoryService.archiveCompletedTask(
        taskId, 
        completionData
      );

      console.log('📚 [ARCHIVE] Tâche archivée avec succès:', archiveResult);
      
      return archiveResult;

    } catch (error) {
      console.error('❌ [ARCHIVE] Erreur archivage tâche:', error);
      // Ne pas faire échouer la validation si l'archivage échoue
      console.warn('⚠️ [ARCHIVE] Archivage échoué mais validation maintenue');
      return { success: false, error: error.message };
    }
  }

  /**
   * 🏆 ATTRIBUER XP À UN UTILISATEUR AVEC SYNCHRONISATION COMPLÈTE
   * ✅ SYSTÈME 2 COMPTEURS : totalXp (prestige) + spendableXp (dépensables)
   */
  async awardXPToUserWithSync(userId, xpAmount, taskId, taskTitle) {
    try {
      console.log('🏆 [XP-SYNC] Attribution XP avec synchronisation (2 compteurs):', { userId, xpAmount, taskId });
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.warn('⚠️ Utilisateur introuvable pour attribution XP:', userId);
        return;
      }

      const userData = userDoc.data();
      const currentGamification = userData.gamification || {};
      
      // Calculer les nouvelles valeurs
      const currentXP = currentGamification.totalXp || 0;
      const currentSpendableXP = currentGamification.spendableXp || 0;
      const currentLevel = currentGamification.level || 1;
      const currentTasksCompleted = currentGamification.tasksCompleted || 0;
      const currentWeeklyXp = currentGamification.weeklyXp || 0;
      const currentMonthlyXp = currentGamification.monthlyXp || 0;

      const newXP = currentXP + xpAmount;
      const newSpendableXP = currentSpendableXP + xpAmount;
      const newLevel = this.calculateLevel(newXP);
      const newTasksCompleted = currentTasksCompleted + 1;
      const newWeeklyXp = currentWeeklyXp + xpAmount;
      const newMonthlyXp = currentMonthlyXp + xpAmount;

      // Créer l'entrée d'historique XP
      const xpHistoryEntry = {
        amount: xpAmount,
        source: 'task_completion',
        taskId: taskId,
        taskTitle: taskTitle,
        timestamp: new Date().toISOString(),
        totalAfter: newXP
      };

      // Préparer l'historique mis à jour
      const currentXpHistory = currentGamification.xpHistory || [];
      const newXpHistory = [
        ...currentXpHistory.slice(-19), // Garder les 19 derniers
        xpHistoryEntry
      ];

      // Préparer l'historique de niveau si level up
      let newLevelHistory = currentGamification.levelHistory || [];
      if (newLevel > currentLevel) {
        const levelHistoryEntry = {
          level: newLevel,
          timestamp: new Date().toISOString(),
          xpAtLevelUp: newXP,
          source: 'task_completion'
        };
        
        newLevelHistory = [
          ...newLevelHistory.slice(-9), // Garder les 9 derniers
          levelHistoryEntry
        ];
        
        console.log(`🎉 [XP-SYNC] Level UP! ${currentLevel} → ${newLevel}`);
      }

      // ✅ Mise à jour complète avec synchronisation (SYSTÈME 2 COMPTEURS)
      const updates = {
        // ✅ XP DE PRESTIGE (classements, niveaux) - NE DIMINUE JAMAIS
        'gamification.totalXp': newXP,
        // ✅ XP DÉPENSABLES (récompenses) - SE DÉDUIT À L'ACHAT
        'gamification.spendableXp': newSpendableXP,
        'gamification.weeklyXp': newWeeklyXp,
        'gamification.monthlyXp': newMonthlyXp,
        'gamification.level': newLevel,
        'gamification.tasksCompleted': newTasksCompleted,
        'gamification.xpHistory': newXpHistory,
        'gamification.levelHistory': newLevelHistory,
        'gamification.lastActivityAt': new Date().toISOString(),
        'gamification.lastXpGain': {
          amount: xpAmount,
          source: 'task_completion',
          taskId: taskId,
          taskTitle: taskTitle,
          timestamp: new Date().toISOString()
        },
        
        // Métadonnées de synchronisation
        'syncMetadata.lastXpSync': serverTimestamp(),
        'syncMetadata.lastXpSource': 'task_validation',
        'syncMetadata.lastXpAmount': xpAmount,
        'syncMetadata.lastTaskCompleted': taskId,
        'syncMetadata.forceSync': true,
        
        // Timestamps généraux
        updatedAt: serverTimestamp()
      };

      // Effectuer la mise à jour
      await updateDoc(userRef, updates);

      // 📊 ENREGISTRER DANS L'HISTORIQUE XP
      await xpHistoryService.logXPEvent({
        userId,
        type: 'quest_completed',
        amount: xpAmount,
        balance: newXP,
        source: 'task',
        description: `Quête validée: ${taskTitle}`,
        metadata: { taskId, taskTitle }
      });

      console.log('✅ [XP-SYNC] XP attribués avec synchronisation complète (2 compteurs):', {
        userId,
        oldXP: currentXP,
        newXP,
        oldSpendableXP: currentSpendableXP,
        newSpendableXP,
        xpAmount,
        oldLevel: currentLevel,
        newLevel,
        tasksCompleted: newTasksCompleted
      });

      // Notification globale pour synchronisation immédiate
      this.notifyXPUpdate(userId, {
        totalXp: newXP,
        spendableXp: newSpendableXP,
        level: newLevel,
        tasksCompleted: newTasksCompleted,
        weeklyXp: newWeeklyXp,
        monthlyXp: newMonthlyXp,
        lastXpGain: xpAmount,
        leveledUp: newLevel > currentLevel
      });

      return {
        success: true,
        xpAwarded: xpAmount,
        newTotalXp: newXP,
        newSpendableXp: newSpendableXP,
        newLevel: newLevel,
        leveledUp: newLevel > currentLevel
      };

    } catch (error) {
      console.error('❌ [XP-SYNC] Erreur attribution XP:', error);
      throw error;
    }
  }

  /**
   * 📢 NOTIFIER MISE À JOUR XP POUR SYNCHRONISATION IMMÉDIATE
   */
  notifyXPUpdate(userId, gamificationData) {
    // Émettre un événement global pour notifier tous les composants
    const event = new CustomEvent('userXPUpdated', {
      detail: {
        userId,
        gamificationData,
        source: 'task_validation',
        timestamp: new Date().toISOString()
      }
    });
    
    window.dispatchEvent(event);
    
    // Également émettre l'événement de synchronisation générale
    const syncEvent = new CustomEvent('userDataSynced', {
      detail: {
        userId,
        gamificationData,
        source: 'task_validation_xp',
        timestamp: new Date().toISOString()
      }
    });
    
    window.dispatchEvent(syncEvent);
    
    console.log('📢 [XP-SYNC] Notifications XP émises pour synchronisation:', {
      userId,
      totalXp: gamificationData.totalXp,
      spendableXp: gamificationData.spendableXp,
      level: gamificationData.level,
      tasksCompleted: gamificationData.tasksCompleted
    });
  }

  /**
   * 📊 CALCULER LE NIVEAU BASÉ SUR L'XP (Système amélioré)
   */
  calculateLevel(totalXp) {
    if (totalXp < 100) return 1;
    if (totalXp < 200) return 2;
    if (totalXp < 350) return 3;
    if (totalXp < 550) return 4;
    if (totalXp < 800) return 5;
    if (totalXp < 1100) return 6;
    if (totalXp < 1450) return 7;
    if (totalXp < 1850) return 8;
    if (totalXp < 2300) return 9;
    if (totalXp < 2800) return 10;
    
    // À partir du niveau 10, progression linéaire
    return Math.floor((totalXp - 2800) / 500) + 11;
  }

  /**
   * 🧮 CALCULER LES XP SELON LA DIFFICULTÉ
   */
  calculateXPForDifficulty(difficulty) {
    const xpTable = {
      'easy': 10,
      'medium': 25,
      'normal': 25,
      'hard': 50,
      'expert': 100
    };
    
    return xpTable[difficulty] || xpTable['medium'];
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
   * 📋 RÉCUPÉRER LES VALIDATIONS EN ATTENTE
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
      
      console.log('📋 Validations en attente récupérées:', validations.length);
      return validations;
      
    } catch (error) {
      console.error('❌ Erreur récupération validations:', error);
      return [];
    }
  }

  /**
   * ❌ REJETER UNE VALIDATION
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
        message: 'Validation rejetée'
      };

    } catch (error) {
      console.error('❌ Erreur rejet validation:', error);
      throw error;
    }
  }

  /**
   * 🔄 ÉCOUTER LES VALIDATIONS EN TEMPS RÉEL
   */
  onValidationsUpdated(callback) {
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
  }

  /**
   * 🗑️ SUPPRIMER UNE VALIDATION
   */
  async deleteValidation(validationId, adminId) {
    try {
      const isAdmin = await this.checkAdminPermissions(adminId);
      if (!isAdmin) {
        throw new Error('Permissions insuffisantes');
      }

      await deleteDoc(doc(db, 'task_validations', validationId));
      
      console.log(`🗑️ Validation ${validationId} supprimée par ${adminId}`);
      
      return {
        success: true,
        message: 'Validation supprimée'
      };

    } catch (error) {
      console.error('❌ Erreur suppression validation:', error);
      throw error;
    }
  }

  /**
   * 📊 RÉCUPÉRER L'HISTORIQUE DES TÂCHES D'UN UTILISATEUR
   */
  async getUserTaskHistory(userId, options = {}) {
    try {
      return await taskHistoryService.getUserTaskHistory(userId, options);
    } catch (error) {
      console.error('❌ Erreur récupération historique utilisateur:', error);
      return [];
    }
  }

  /**
   * 📈 RÉCUPÉRER LES STATISTIQUES D'UN UTILISATEUR
   */
  async getUserTaskStats(userId) {
    try {
      return await taskHistoryService.getUserTaskStats(userId);
    } catch (error) {
      console.error('❌ Erreur récupération stats utilisateur:', error);
      return null;
    }
  }

  /**
   * 🔍 ANALYSER LES PERFORMANCES D'UNE TÂCHE SPÉCIFIQUE
   */
  async analyzeTaskPerformance(userId, taskTitle) {
    try {
      return await taskHistoryService.analyzeTaskTypePerformance(userId, taskTitle);
    } catch (error) {
      console.error('❌ Erreur analyse performance tâche:', error);
      return null;
    }
  }

  /**
   * 🏆 RÉCUPÉRER LE CLASSEMENT DES TÂCHES
   */
  async getTaskLeaderboard(timeframe = 'all', limit = 10) {
    try {
      return await taskHistoryService.getTaskLeaderboard(timeframe, limit);
    } catch (error) {
      console.error('❌ Erreur récupération classement:', error);
      return [];
    }
  }
}

// Export de l'instance singleton
export const taskValidationServiceEnhanced = new TaskValidationServiceEnhanced();
