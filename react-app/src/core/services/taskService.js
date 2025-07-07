// ==========================================
// 📁 react-app/src/core/services/taskService.js
// SERVICE FIREBASE POUR LA GESTION DES TÂCHES - AVEC API REST STORAGE
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc,
  getDocs,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase.js';
import StorageService from './storageService.js';

// Constantes pour les statuts des tâches
const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  VALIDATION_PENDING: 'validation_pending',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
};

/**
 * 📋 SERVICE DE GESTION DES TÂCHES AVEC STORAGE API REST
 */
class TaskService {
  
  constructor() {
    this.COLLECTION_NAME = 'tasks';
    this.storageService = new StorageService();
  }

  /**
   * 📸 UPLOAD D'UNE PHOTO/VIDÉO DE TÂCHE - AVEC API REST
   */
  async uploadTaskMedia(taskId, userId, mediaFile) {
    try {
      console.log('📸 Upload média avec API REST:', {
        taskId,
        fileName: mediaFile.name,
        size: `${(mediaFile.size / 1024 / 1024).toFixed(2)} MB`,
        type: mediaFile.type
      });
      
      // ✅ Utilisation du service de storage API REST
      const result = await this.storageService.uploadTaskMedia(taskId, userId, mediaFile);
      
      console.log('✅ Upload API REST réussi:', {
        url: result.url,
        path: result.path,
        type: result.type
      });
      
      return {
        url: result.url,
        type: result.type,
        size: result.size,
        name: result.name,
        path: result.path,
        uploadedAt: result.uploadedAt
      };
      
    } catch (error) {
      console.error('❌ Erreur upload média API REST:', error);
      
      // ✅ Messages d'erreur spécifiques
      if (error.message.includes('Utilisateur non connecté')) {
        throw new Error('Vous devez être connecté pour uploader des fichiers.');
      } else if (error.message.includes('Upload failed: 403')) {
        throw new Error('Permissions insuffisantes pour l\'upload. Vérifiez vos règles Firebase.');
      } else if (error.message.includes('Upload failed: 401')) {
        throw new Error('Authentification échouée. Reconnectez-vous.');
      } else if (error.message.includes('network')) {
        throw new Error('Problème de connexion réseau. Vérifiez votre connexion internet.');
      }
      
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UN MÉDIA DE TÂCHE
   */
  async deleteTaskMedia(mediaPath) {
    try {
      if (!mediaPath) return false;
      
      const result = await this.storageService.deleteFile(mediaPath);
      
      console.log('✅ Média supprimé via API REST:', mediaPath);
      return result;
      
    } catch (error) {
      console.error('❌ Erreur suppression média:', error);
      // Ne pas faire échouer si le fichier n'existe pas
      return false;
    }
  }

  /**
   * 📝 CRÉER UNE NOUVELLE TÂCHE
   */
  async createTask(taskData, userId) {
    try {
      const newTask = {
        title: taskData.title,
        description: taskData.description || '',
        status: TASK_STATUS.TODO,
        priority: taskData.priority || 'normal',
        difficulty: taskData.difficulty || 'normal',
        userId: userId,
        assignedTo: taskData.assignedTo || userId,
        projectId: taskData.projectId || null,
        tags: taskData.tags || [],
        estimatedTime: taskData.estimatedTime || null,
        actualTime: taskData.actualTime || null,
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        dueDate: taskData.dueDate ? 
          Timestamp.fromDate(new Date(taskData.dueDate)) : null,
        
        // Statuts de validation
        submittedAt: null,
        validatedAt: null,
        validatedBy: null,
        adminComment: null,
        submissionComment: null,
        hasMedia: false,
        mediaUrl: null,
        mediaType: null,
        mediaPath: null,
        
        // Métadonnées
        source: 'synergia_app',
        version: '1.0'
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), newTask);
      
      console.log('✅ Tâche créée avec ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...newTask,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER LES TÂCHES D'UN UTILISATEUR
   */
  async getUserTasks(userId) {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate() || null,
          submittedAt: data.submittedAt?.toDate() || null,
          validatedAt: data.validatedAt?.toDate() || null
        });
      });
      
      console.log(`✅ ${tasks.length} tâches récupérées pour l'utilisateur ${userId}`);
      return tasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches:', error);
      throw error;
    }
  }

  /**
   * 📝 METTRE À JOUR UNE TÂCHE
   */
  async updateTask(taskId, updates) {
    try {
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      const taskRef = doc(db, this.COLLECTION_NAME, taskId);
      await updateDoc(taskRef, updateData);
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      throw error;
    }
  }

  /**
   * 🎯 SOUMETTRE UNE TÂCHE POUR VALIDATION - AVEC API REST
   */
  async submitTaskForValidation(taskId, submissionData) {
    try {
      const { comment, photoFile } = submissionData || {};
      
      console.log('📝 Soumission tâche pour validation:', {
        taskId,
        hasComment: !!comment,
        hasMedia: !!photoFile,
        mediaType: photoFile?.type,
        mediaSize: photoFile ? `${(photoFile.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'
      });

      // ✅ Récupérer d'abord la tâche pour avoir l'userId
      const taskRef = doc(db, this.COLLECTION_NAME, taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tâche non trouvée');
      }
      
      const taskData = taskSnap.data();
      let mediaData = null;

      // ✅ Gestion de l'upload avec API REST
      if (photoFile) {
        try {
          console.log('📸 Upload média avec API REST...');
          mediaData = await this.uploadTaskMedia(taskId, taskData.userId, photoFile);
          console.log('✅ Média uploadé avec succès via API REST:', {
            url: mediaData.url,
            type: mediaData.type,
            size: `${(mediaData.size / 1024 / 1024).toFixed(2)} MB`
          });
        } catch (uploadError) {
          console.error('❌ Erreur upload média:', uploadError);
          
          // ✅ Soumission sans média en cas d'erreur
          console.warn('⚠️ Tâche sera soumise sans média à cause de l\'erreur d\'upload');
          
          // Créer un objet d'erreur personnalisé
          const errorForUser = new Error(`Upload échoué: ${uploadError.message}. La tâche sera soumise sans média.`);
          errorForUser.allowSubmissionWithoutMedia = true;
          throw errorForUser;
        }
      }

      // ✅ Mettre à jour la tâche avec les nouvelles données
      const updateData = {
        status: TASK_STATUS.VALIDATION_PENDING,
        submissionComment: comment || '',
        submittedAt: serverTimestamp(),
        hasMedia: !!mediaData,
        mediaUrl: mediaData?.url || null,
        mediaType: mediaData?.type || null,
        mediaPath: mediaData?.path || null,
        updatedAt: serverTimestamp()
      };

      await this.updateTask(taskId, updateData);
      
      const resultMessage = mediaData ? 
        'Tâche soumise pour validation admin avec média' : 
        'Tâche soumise pour validation admin';
      
      console.log('✅ Tâche soumise avec succès:', {
        taskId,
        hasMedia: !!mediaData,
        mediaType: mediaData?.type,
        status: TASK_STATUS.VALIDATION_PENDING
      });
      
      return {
        success: true,
        message: resultMessage,
        status: TASK_STATUS.VALIDATION_PENDING,
        mediaUrl: mediaData?.url,
        mediaType: mediaData?.type,
        hasMedia: !!mediaData
      };
      
    } catch (error) {
      console.error('❌ Erreur soumission validation:', error);
      
      // ✅ Gestion spéciale pour les erreurs d'upload avec option de continuer
      if (error.allowSubmissionWithoutMedia) {
        try {
          const updateData = {
            status: TASK_STATUS.VALIDATION_PENDING,
            submissionComment: submissionData?.comment || '',
            submittedAt: serverTimestamp(),
            hasMedia: false,
            mediaUrl: null,
            mediaType: null,
            mediaPath: null,
            updatedAt: serverTimestamp()
          };

          await this.updateTask(taskId, updateData);
          
          return {
            success: true,
            message: 'Tâche soumise pour validation admin (sans média suite à l\'erreur d\'upload)',
            status: TASK_STATUS.VALIDATION_PENDING,
            hasMedia: false,
            warning: error.message
          };
          
        } catch (fallbackError) {
          console.error('❌ Erreur soumission fallback:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }

  /**
   * ✅ VALIDER UNE TÂCHE (Admin seulement)
   */
  async validateTask(taskId, adminId, approved, adminComment = '') {
    try {
      const updateData = {
        status: approved ? TASK_STATUS.COMPLETED : TASK_STATUS.REJECTED,
        validatedBy: adminId,
        validatedAt: serverTimestamp(),
        adminComment: adminComment,
        updatedAt: serverTimestamp()
      };
      
      if (approved) {
        updateData.completedAt = serverTimestamp();
      }
      
      const taskRef = doc(db, this.COLLECTION_NAME, taskId);
      await updateDoc(taskRef, updateData);
      
      console.log(`✅ Tâche ${approved ? 'approuvée' : 'rejetée'} par admin:`, taskId);
      
      return {
        success: true,
        approved,
        message: approved ? 'Tâche validée avec succès' : 'Tâche rejetée',
        status: updateData.status
      };
      
    } catch (error) {
      console.error('❌ Erreur validation tâche:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UNE TÂCHE
   */
  async deleteTask(taskId) {
    try {
      // Récupérer la tâche pour vérifier s'il y a un média à supprimer
      const taskRef = doc(db, this.COLLECTION_NAME, taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (taskSnap.exists()) {
        const taskData = taskSnap.data();
        
        // Supprimer le média associé s'il existe
        if (taskData.mediaPath) {
          await this.deleteTaskMedia(taskData.mediaPath);
        }
      }
      
      // Supprimer la tâche
      await deleteDoc(taskRef);
      
      console.log('✅ Tâche supprimée:', taskId);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      throw error;
    }
  }

  /**
   * 📊 RÉCUPÉRER TOUTES LES TÂCHES (Admin)
   */
  async getAllTasks() {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate() || null,
          submittedAt: data.submittedAt?.toDate() || null,
          validatedAt: data.validatedAt?.toDate() || null
        });
      });
      
      console.log(`✅ ${tasks.length} tâches récupérées (admin)`);
      return tasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération toutes les tâches:', error);
      throw error;
    }
  }

  /**
   * 📈 RÉCUPÉRER LES STATISTIQUES DES TÂCHES
   */
  async getTaskStats(userId = null) {
    try {
      const baseQuery = userId ? 
        query(collection(db, this.COLLECTION_NAME), where('userId', '==', userId)) :
        query(collection(db, this.COLLECTION_NAME));
      
      const querySnapshot = await getDocs(baseQuery);
      
      const stats = {
        total: 0,
        todo: 0,
        in_progress: 0,
        validation_pending: 0,
        completed: 0,
        rejected: 0,
        withMedia: 0
      };
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stats.total++;
        
        if (data.status && stats.hasOwnProperty(data.status)) {
          stats[data.status]++;
        }
        
        if (data.hasMedia) {
          stats.withMedia++;
        }
      });
      
      console.log('✅ Statistiques des tâches:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur récupération statistiques:', error);
      throw error;
    }
  }
}

// Export de la classe et des constantes (EXISTANT - GARDER)
export default TaskService;
export { TASK_STATUS };

// ✅ AJOUT : Export d'une instance pour la compatibilité d'import
export const taskService = new TaskService();

console.log('✅ TaskService - Instance exportée pour compatibilité build');
