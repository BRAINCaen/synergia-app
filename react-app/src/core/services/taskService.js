// ==========================================
// 📁 react-app/src/core/services/taskService.js
// SERVICE FIREBASE POUR LA GESTION DES TÂCHES - AVEC UPLOAD PHOTOS
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
  getDownloadURL 
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
   * 📸 UPLOAD D'UNE PHOTO/VIDÉO DE TÂCHE
   */
  async uploadTaskMedia(taskId, userId, mediaFile) {
    try {
      const timestamp = Date.now();
      const fileExtension = mediaFile.name.split('.').pop() || 'jpg';
      const fileName = `task-media/${userId}/${taskId}-${timestamp}.${fileExtension}`;
      const mediaRef = ref(storage, fileName);
      
      console.log('📸 Upload media vers:', fileName, `(${(mediaFile.size / 1024 / 1024).toFixed(2)} MB)`);
      
      await uploadBytes(mediaRef, mediaFile);
      const downloadURL = await getDownloadURL(mediaRef);
      
      console.log('✅ Media uploadé avec succès:', downloadURL);
      return {
        url: downloadURL,
        type: mediaFile.type.startsWith('video/') ? 'video' : 'image',
        size: mediaFile.size,
        name: mediaFile.name
      };
      
    } catch (error) {
      console.error('❌ Erreur upload media:', error);
      throw error;
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
        dueDate: taskData.dueDate ? Timestamp.fromDate(new Date(taskData.dueDate)) : null,
        
        // Statuts de validation
        submittedAt: null,
        validatedAt: null,
        validatedBy: null,
        adminComment: null,
        submissionComment: null,
        hasMedia: false,
        mediaUrl: null,
        mediaType: null,
        
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

      // Nouvelle logique: Pas d'XP automatique
      if (updates.status === TASK_STATUS.COMPLETED) {
        updateData.status = TASK_STATUS.VALIDATION_PENDING;
        updateData.submittedForValidationAt = serverTimestamp();
        console.log('📋 Tâche soumise pour validation');
      }

      const taskRef = doc(db, this.COLLECTION_NAME, taskId);
      await updateDoc(taskRef, updateData);
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      throw error;
    }
  }

  /**
   * 🎯 SOUMETTRE UNE TÂCHE POUR VALIDATION - AVEC UPLOAD PHOTO/VIDÉO
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

      // Upload du média si fourni (photo ou vidéo)
      let mediaData = null;
      if (photoFile) {
        console.log('📸 Upload média en cours...');
        
        // Récupérer d'abord la tâche pour avoir l'userId
        const taskRef = doc(db, this.COLLECTION_NAME, taskId);
        const taskSnap = await getDoc(taskRef);
        
        if (!taskSnap.exists()) {
          throw new Error('Tâche non trouvée');
        }
        
        const taskData = taskSnap.data();
        mediaData = await this.uploadTaskMedia(taskId, taskData.userId, photoFile);
        console.log('✅ Média uploadé:', mediaData);
      }

      // Mettre à jour la tâche avec les nouvelles données
      const updateData = {
        status: TASK_STATUS.VALIDATION_PENDING,
        submissionComment: comment || '',
        submittedAt: serverTimestamp(),
        hasMedia: !!photoFile,
        mediaUrl: mediaData?.url || null,
        mediaType: mediaData?.type || null,
        updatedAt: serverTimestamp()
      };

      await this.updateTask(taskId, updateData);
      
      console.log('✅ Tâche soumise pour validation avec média:', {
        taskId,
        mediaUrl: !!mediaData?.url,
        mediaType: mediaData?.type
      });
      
      return {
        success: true,
        message: 'Tâche soumise pour validation admin',
        status: TASK_STATUS.VALIDATION_PENDING,
        mediaUrl: mediaData?.url,
        mediaType: mediaData?.type
      };
      
    } catch (error) {
      console.error('❌ Erreur soumission validation:', error);
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
      
      console.log(`✅ Tâche ${approved ? 'validée' : 'rejetée'}:`, taskId);
      
      return { 
        success: true, 
        approved,
        message: `Tâche ${approved ? 'validée' : 'rejetée'} avec succès`
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
      await deleteDoc(doc(db, this.COLLECTION_NAME, taskId));
      console.log('✅ Tâche supprimée:', taskId);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      throw error;
    }
  }

  /**
   * 📊 RÉCUPÉRER LES STATISTIQUES DES TÂCHES
   */
  async getTaskStatistics(userId) {
    try {
      const tasks = await this.getUserTasks(userId);
      
      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length,
        pending: tasks.filter(t => t.status === TASK_STATUS.VALIDATION_PENDING).length,
        rejected: tasks.filter(t => t.status === TASK_STATUS.REJECTED).length,
        todo: tasks.filter(t => t.status === TASK_STATUS.TODO).length,
        inProgress: tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length
      };
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur statistiques tâches:', error);
      throw error;
    }
  }

  /**
   * 🔍 RÉCUPÉRER UNE TÂCHE PAR ID
   */
  async getTask(taskId) {
    try {
      const taskRef = doc(db, this.COLLECTION_NAME, taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (taskSnap.exists()) {
        const data = taskSnap.data();
        return {
          id: taskSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate() || null,
          submittedAt: data.submittedAt?.toDate() || null,
          validatedAt: data.validatedAt?.toDate() || null
        };
      } else {
        throw new Error('Tâche non trouvée');
      }
      
    } catch (error) {
      console.error('❌ Erreur récupération tâche:', error);
      throw error;
    }
  }

  /**
   * 🔍 RÉCUPÉRER TOUTES LES TÂCHES (Admin)
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
      console.error('❌ Erreur récupération toutes tâches:', error);
      throw error;
    }
  }

  /**
   * 🔍 RÉCUPÉRER LES TÂCHES EN ATTENTE DE VALIDATION (Admin)
   */
  async getPendingValidationTasks() {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('status', '==', TASK_STATUS.VALIDATION_PENDING),
        orderBy('submittedAt', 'desc')
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
      
      console.log(`✅ ${tasks.length} tâches en attente de validation`);
      return tasks;
      
    } catch (error) {
      console.error('❌ Erreur récupération tâches en attente:', error);
      throw error;
    }
  }

  /**
   * 📊 CALCULER LES XP SELON LA DIFFICULTÉ
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
   * 🔄 CHANGER LE STATUT D'UNE TÂCHE
   */
  async updateTaskStatus(taskId, newStatus, additionalData = {}) {
    try {
      const updateData = {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...additionalData
      };

      // Logique spéciale selon le statut
      if (newStatus === TASK_STATUS.IN_PROGRESS) {
        updateData.startedAt = serverTimestamp();
      } else if (newStatus === TASK_STATUS.VALIDATION_PENDING) {
        updateData.submittedAt = serverTimestamp();
      } else if (newStatus === TASK_STATUS.COMPLETED) {
        updateData.completedAt = serverTimestamp();
      }

      const taskRef = doc(db, this.COLLECTION_NAME, taskId);
      await updateDoc(taskRef, updateData);
      
      console.log(`✅ Statut tâche mis à jour: ${taskId} -> ${newStatus}`);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
      throw error;
    }
  }

  /**
   * 🏷️ AJOUTER DES TAGS À UNE TÂCHE
   */
  async addTagsToTask(taskId, tags) {
    try {
      const taskRef = doc(db, this.COLLECTION_NAME, taskId);
      const task = await getDoc(taskRef);
      
      if (task.exists()) {
        const currentTags = task.data().tags || [];
        const newTags = [...new Set([...currentTags, ...tags])]; // Éviter les doublons
        
        await updateDoc(taskRef, {
          tags: newTags,
          updatedAt: serverTimestamp()
        });
        
        console.log(`✅ Tags ajoutés à la tâche ${taskId}:`, tags);
        return { success: true };
      } else {
        throw new Error('Tâche non trouvée');
      }
      
    } catch (error) {
      console.error('❌ Erreur ajout tags:', error);
      throw error;
    }
  }

  /**
   * ⏱️ METTRE À JOUR LE TEMPS PASSÉ
   */
  async updateTaskTime(taskId, timeInMinutes) {
    try {
      const taskRef = doc(db, this.COLLECTION_NAME, taskId);
      await updateDoc(taskRef, {
        actualTime: timeInMinutes,
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Temps mis à jour pour la tâche ${taskId}: ${timeInMinutes}min`);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour temps:', error);
      throw error;
    }
  }

  /**
   * 🔍 RECHERCHER DES TÂCHES
   */
  async searchTasks(userId, searchTerm, filters = {}) {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId)
      );

      // Ajouter des filtres supplémentaires
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      if (filters.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }

      const querySnapshot = await getDocs(q);
      let tasks = [];
      
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

      // Filtrer par terme de recherche côté client
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        tasks = tasks.filter(task => 
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      console.log(`✅ ${tasks.length} tâches trouvées pour "${searchTerm}"`);
      return tasks;
      
    } catch (error) {
      console.error('❌ Erreur recherche tâches:', error);
      throw error;
    }
  }
}

// ✅ EXPORT CORRIGÉ - Instance unique + export nommé
const taskService = new TaskService();

// Export par défaut ET export nommé
export default taskService;
export { taskService, TASK_STATUS };
