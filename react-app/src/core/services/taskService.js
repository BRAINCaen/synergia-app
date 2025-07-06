// ==========================================
// 📁 react-app/src/core/services/taskService.js
// SERVICE FIREBASE POUR LA GESTION DES TÂCHES - UPLOAD/DOWNLOAD CORRIGÉ
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
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '../firebase.js';

// Constantes pour les statuts des tâches
const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  VALIDATION_PENDING: 'validation_pending',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
};

/**
 * 📋 SERVICE DE GESTION DES TÂCHES
 */
class TaskService {
  
  constructor() {
    this.COLLECTION_NAME = 'tasks';
  }

  /**
   * 📸 UPLOAD D'UNE PHOTO/VIDÉO DE TÂCHE - VERSION CORRIGÉE
   */
  async uploadTaskMedia(taskId, userId, mediaFile) {
    try {
      if (!storage) {
        throw new Error('Firebase Storage non initialisé');
      }

      const timestamp = Date.now();
      const fileExtension = mediaFile.name.split('.').pop()?.toLowerCase() || 'bin';
      
      // ✅ Chemin simplifié pour éviter les problèmes CORS
      const fileName = `tasks/${userId}/${taskId}_${timestamp}.${fileExtension}`;
      
      console.log('📸 Upload média vers:', fileName, {
        size: `${(mediaFile.size / 1024 / 1024).toFixed(2)} MB`,
        type: mediaFile.type
      });
      
      // ✅ Créer la référence de stockage
      const mediaRef = ref(storage, fileName);
      
      // ✅ Métadonnées optimisées
      const metadata = {
        contentType: mediaFile.type,
        customMetadata: {
          taskId: taskId,
          userId: userId,
          originalName: mediaFile.name,
          uploadedAt: new Date().toISOString()
        }
      };
      
      // ✅ Upload avec retry en cas d'échec
      let uploadResult;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          uploadResult = await uploadBytes(mediaRef, mediaFile, metadata);
          break; // Succès, sortir de la boucle
        } catch (uploadError) {
          retryCount++;
          console.warn(`⚠️ Tentative d'upload ${retryCount}/${maxRetries} échouée:`, uploadError.message);
          
          if (retryCount >= maxRetries) {
            throw uploadError;
          }
          
          // Attendre 1 seconde avant de réessayer
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log('✅ Upload terminé:', uploadResult.metadata.name);
      
      // ✅ Obtenir l'URL de téléchargement avec retry
      let downloadURL;
      retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          downloadURL = await getDownloadURL(uploadResult.ref);
          break; // Succès, sortir de la boucle
        } catch (downloadError) {
          retryCount++;
          console.warn(`⚠️ Tentative de récupération URL ${retryCount}/${maxRetries} échouée:`, downloadError.message);
          
          if (retryCount >= maxRetries) {
            throw downloadError;
          }
          
          // Attendre 1 seconde avant de réessayer
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log('✅ URL de téléchargement récupérée:', downloadURL);
      
      return {
        url: downloadURL,
        type: mediaFile.type.startsWith('video/') ? 'video' : 'image',
        size: mediaFile.size,
        name: mediaFile.name,
        path: fileName,
        uploadedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Erreur upload média:', error);
      
      // ✅ Messages d'erreur spécifiques
      if (error.code === 'storage/unauthorized') {
        throw new Error('Permissions insuffisantes pour l\'upload. Vérifiez vos règles Firebase Storage.');
      } else if (error.code === 'storage/canceled') {
        throw new Error('Upload annulé par l\'utilisateur.');
      } else if (error.code === 'storage/unknown' || error.message.includes('CORS')) {
        throw new Error('Problème de configuration CORS. L\'upload peut échouer temporairement.');
      } else if (error.code === 'storage/retry-limit-exceeded') {
        throw new Error('Trop de tentatives d\'upload. Réessayez plus tard.');
      }
      
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UN MÉDIA DE TÂCHE
   */
  async deleteTaskMedia(mediaPath) {
    try {
      if (!storage || !mediaPath) return false;
      
      const mediaRef = ref(storage, mediaPath);
      await deleteObject(mediaRef);
      
      console.log('✅ Média supprimé:', mediaPath);
      return true;
      
    } catch (error) {
      console.error('❌ Erreur suppression média:', error);
      // Ne pas faire échouer si le fichier n'existe pas
      if (error.code === 'storage/object-not-found') {
        return true;
      }
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
   * 🎯 SOUMETTRE UNE TÂCHE POUR VALIDATION - VERSION CORRIGÉE
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

      // ✅ Gestion de l'upload avec fallback gracieux
      if (photoFile) {
        if (!storage) {
          console.warn('⚠️ Firebase Storage non configuré - Tâche soumise sans média');
        } else {
          try {
            console.log('📸 Upload média en cours...');
            mediaData = await this.uploadTaskMedia(taskId, taskData.userId, photoFile);
            console.log('✅ Média uploadé avec succès:', {
              url: mediaData.url,
              type: mediaData.type,
              size: `${(mediaData.size / 1024 / 1024).toFixed(2)} MB`
            });
          } catch (uploadError) {
            console.error('❌ Erreur upload média:', uploadError);
            
            // ✅ Ne pas faire échouer la soumission à cause de l'upload
            console.warn('⚠️ Tâche soumise sans média à cause de l\'erreur d\'upload');
            
            // Informer l'utilisateur mais continuer
            throw new Error(`Upload du média échoué: ${uploadError.message}. La tâche sera soumise sans média.`);
          }
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
      
      // ✅ Si c'est juste un problème d'upload, soumettre quand même sans média
      if (error.message.includes('Upload du média échoué')) {
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

// Export de la classe et des constantes
export default TaskService;
export { TASK_STATUS };
