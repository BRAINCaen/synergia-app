// ==========================================
// 📁 react-app/src/core/services/taskValidationService.js
// SERVICE DE VALIDATION DES TÂCHES AVEC PREUVE
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

      // Sauvegarder en Firebase
      const docRef = await addDoc(collection(db, 'validationRequests'), validationRequest);
      
      // Marquer la tâche comme "en validation"
      await this.updateTaskStatus(taskId, 'validation_pending');
      
      console.log('✅ Demande de validation créée:', docRef.id);
      
      return {
        success: true,
        requestId: docRef.id,
        message: 'Tâche soumise pour validation',
        xpAmount: validationRequest.xpAmount
      };
      
    } catch (error) {
      console.error('❌ Erreur soumission validation:', error);
      throw error;
    }
  }

  /**
   * 📷 UPLOAD PHOTO DE PREUVE
   */
  async uploadTaskPhoto(taskId, userId, photoFile) {
    try {
      // Validation du fichier
      if (!photoFile.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }
      
      if (photoFile.size > 10 * 1024 * 1024) { // 10MB max
        throw new Error('L\'image ne doit pas dépasser 10MB');
      }

      // Créer un nom de fichier unique
      const timestamp = Date.now();
      const extension = photoFile.name.split('.').pop();
      const fileName = `task-proofs/${userId}/${taskId}_${timestamp}.${extension}`;
      
      // Upload vers Firebase Storage
      const storageRef = ref(storage, fileName);
      const snapshot = await uploadBytes(storageRef, photoFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('📷 Photo de preuve uploadée:', downloadURL);
      return downloadURL;
      
    } catch (error) {
      console.error('❌ Erreur upload photo:', error);
      throw error;
    }
  }

  /**
   * ✅ VALIDER UNE DEMANDE (Admin seulement)
   */
  async validateTaskRequest(requestId, adminId, adminComment = '', approved = true) {
    try {
      console.log('✅ Validation demande:', { requestId, adminId, approved });
      
      // Récupérer la demande
      const requestRef = doc(db, 'validationRequests', requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (!requestSnap.exists()) {
        throw new Error('Demande de validation introuvable');
      }
      
      const requestData = requestSnap.data();
      
      // Vérifier que la demande est en attente
      if (requestData.status !== 'pending') {
        throw new Error('Cette demande a déjà été traitée');
      }
      
      // Mettre à jour le statut de la demande
      await updateDoc(requestRef, {
        status: approved ? 'approved' : 'rejected',
        reviewedBy: adminId,
        reviewedAt: serverTimestamp(),
        adminComment: adminComment || (approved ? 'Tâche validée' : 'Tâche rejetée')
      });
      
      if (approved) {
        // Attribuer les XP à l'utilisateur
        await gamificationService.addXP(
          requestData.userId,
          requestData.xpAmount,
          `Tâche validée: ${requestData.taskTitle}`,
          {
            source: 'admin_validation',
            taskId: requestData.taskId,
            requestId: requestId,
            validatedBy: adminId
          }
        );
        
        // Marquer la tâche comme complétée
        await this.updateTaskStatus(requestData.taskId, 'completed');
        
        // Notification utilisateur
        await this.notifyUser(requestData.userId, 'task_approved', {
          taskTitle: requestData.taskTitle,
          xpGained: requestData.xpAmount,
          adminComment
        });
        
      } else {
        // Marquer la tâche comme rejetée
        await this.updateTaskStatus(requestData.taskId, 'rejected');
        
        // Notification de rejet
        await this.notifyUser(requestData.userId, 'task_rejected', {
          taskTitle: requestData.taskTitle,
          reason: adminComment
        });
      }
      
      console.log(`✅ Demande ${approved ? 'approuvée' : 'rejetée'}:`, requestId);
      
      return {
        success: true,
        approved,
        xpAwarded: approved ? requestData.xpAmount : 0
      };
      
    } catch (error) {
      console.error('❌ Erreur validation demande:', error);
      throw error;
    }
  }

  /**
   * 📋 OBTENIR TOUTES LES DEMANDES EN ATTENTE
   */
  async getPendingValidations() {
    try {
      const q = query(
        collection(db, 'validationRequests'),
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const requests = [];
      
      querySnapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('📋 Demandes en attente récupérées:', requests.length);
      return requests;
      
    } catch (error) {
      console.error('❌ Erreur récupération demandes:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENIR LES DEMANDES PAR UTILISATEUR
   */
  async getUserValidationHistory(userId) {
    try {
      const q = query(
        collection(db, 'validationRequests'),
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const requests = [];
      
      querySnapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return requests;
      
    } catch (error) {
      console.error('❌ Erreur historique utilisateur:', error);
      throw error;
    }
  }

  /**
   * 🎯 CALCULER L'XP BASÉ SUR LA DIFFICULTÉ
   */
  calculateXPForDifficulty(difficulty) {
    const xpMap = {
      'easy': 25,
      'normal': 50,
      'hard': 100,
      'expert': 200
    };
    
    return xpMap[difficulty] || 50;
  }

  /**
   * 🔄 METTRE À JOUR LE STATUT D'UNE TÂCHE
   */
  async updateTaskStatus(taskId, status) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: status,
        updatedAt: serverTimestamp(),
        ...(status === 'completed' && { completedAt: serverTimestamp() })
      });
      
      console.log(`🔄 Statut tâche mis à jour: ${taskId} -> ${status}`);
      
    } catch (error) {
      console.error('❌ Erreur mise à jour statut tâche:', error);
      // Ne pas faire échouer tout le processus pour ça
    }
  }

  /**
   * 🔔 NOTIFIER L'UTILISATEUR
   */
  async notifyUser(userId, type, data) {
    try {
      const notification = {
        userId,
        type,
        data,
        read: false,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'notifications'), notification);
      
      // Déclencher l'événement côté client
      window.dispatchEvent(new CustomEvent('userNotification', {
        detail: { userId, type, data }
      }));
      
    } catch (error) {
      console.error('❌ Erreur notification:', error);
      // Ne pas faire échouer pour une notification
    }
  }

  /**
   * 📊 STATISTIQUES DE VALIDATION
   */
  async getValidationStats() {
    try {
      const q = query(collection(db, 'validationRequests'));
      const querySnapshot = await getDocs(q);
      
      const stats = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalXpAwarded: 0
      };
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stats.total++;
        
        if (data.status === 'pending') stats.pending++;
        else if (data.status === 'approved') {
          stats.approved++;
          stats.totalXpAwarded += data.xpAmount || 0;
        }
        else if (data.status === 'rejected') stats.rejected++;
      });
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur stats validation:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0, totalXpAwarded: 0 };
    }
  }

  /**
   * 🎧 ÉCOUTER LES DEMANDES EN TEMPS RÉEL
   */
  subscribeToValidationRequests(callback) {
    const q = query(
      collection(db, 'validationRequests'),
      where('status', '==', 'pending'),
      orderBy('submittedAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const requests = [];
      querySnapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      callback(requests);
    });
  }

  /**
   * 🧹 NETTOYER UNE PHOTO DE PREUVE
   */
  async deleteTaskPhoto(photoUrl) {
    try {
      if (!photoUrl || !photoUrl.includes('firebase')) return;
      
      const photoRef = ref(storage, photoUrl);
      await deleteObject(photoRef);
      
      console.log('🧹 Photo de preuve supprimée:', photoUrl);
      
    } catch (error) {
      console.error('❌ Erreur suppression photo:', error);
      // Ne pas faire échouer pour ça
    }
  }
}

// Export du service
export const taskValidationService = new TaskValidationService();
export default taskValidationService;
