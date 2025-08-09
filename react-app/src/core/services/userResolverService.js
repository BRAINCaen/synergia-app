// ==========================================
// 📁 react-app/src/core/services/mediaUploadService.js
// SERVICE D'UPLOAD MÉDIA COMPLET POUR SYNERGIA
// ==========================================

import { getAuth } from 'firebase/auth';

/**
 * 📱 SERVICE D'UPLOAD MÉDIA SPÉCIALISÉ
 * Hérite du storageService mais avec fonctionnalités spécifiques aux médias
 */
class MediaUploadService {
  constructor() {
    this.bucketName = 'synergia-app-f27e7.firebasestorage.app';
    this.baseUrl = `https://firebasestorage.googleapis.com/v0/b/${this.bucketName}/o`;
    this.maxImageSize = 10 * 1024 * 1024; // 10MB
    this.maxVideoSize = 100 * 1024 * 1024; // 100MB
    this.supportedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    this.supportedVideoTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi'];
  }

  /**
   * 🔑 Obtenir le token d'authentification Firebase
   */
  async getAuthToken() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }
      
      const token = await user.getIdToken();
      return token;
      
    } catch (error) {
      console.error('❌ Erreur récupération token:', error);
      throw error;
    }
  }

  /**
   * ✅ VALIDATION DE FICHIER MÉDIA
   */
  validateFile(file) {
    const errors = [];
    
    if (!file) {
      errors.push('Aucun fichier sélectionné');
      return { valid: false, errors };
    }

    const isImage = this.supportedImageTypes.includes(file.type);
    const isVideo = this.supportedVideoTypes.includes(file.type);

    // Vérifier le type
    if (!isImage && !isVideo) {
      errors.push(`Type de fichier non supporté: ${file.type}`);
    }

    // Vérifier la taille
    if (isImage && file.size > this.maxImageSize) {
      errors.push(`Image trop volumineuse: ${(file.size / 1024 / 1024).toFixed(2)}MB (max: 10MB)`);
    }

    if (isVideo && file.size > this.maxVideoSize) {
      errors.push(`Vidéo trop volumineuse: ${(file.size / 1024 / 1024).toFixed(2)}MB (max: 100MB)`);
    }

    return {
      valid: errors.length === 0,
      errors,
      type: isVideo ? 'video' : 'image',
      size: file.size,
      sizeFormatted: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    };
  }

  /**
   * 📤 UPLOAD PRINCIPAL AVEC GESTION D'ERREURS
   */
  async uploadFile(file, options = {}) {
    try {
      // Validation du fichier
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const {
        folder = 'tasks',
        userId = null,
        taskTitle = null,
        onProgress = null
      } = options;

      console.log('📤 Upload média:', {
        name: file.name,
        type: validation.type,
        size: validation.sizeFormatted,
        folder
      });

      // Génération du chemin
      const timestamp = Date.now();
      const extension = file.name.split('.').pop()?.toLowerCase() || (validation.type === 'video' ? 'mp4' : 'jpg');
      const filename = `${validation.type}-${timestamp}.${extension}`;
      const path = userId ? 
        `${folder}/${userId}/${filename}` : 
        `${folder}/${filename}`;

      // Obtenir le token d'authentification
      const token = await this.getAuthToken();
      
      // Encoder le chemin pour l'URL
      const encodedPath = encodeURIComponent(path);
      
      // URL d'upload
      const uploadUrl = `${this.baseUrl}/${encodedPath}?uploadType=media`;
      
      // Headers
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type
      };

      // Simulation du progrès si callback fourni
      if (onProgress) {
        onProgress(0);
        setTimeout(() => onProgress(25), 100);
        setTimeout(() => onProgress(50), 300);
        setTimeout(() => onProgress(75), 600);
      }
      
      // Upload
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: headers,
        body: file
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur upload:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Génération de l'URL publique
      const downloadURL = await this.getPublicDownloadURL(path);

      if (onProgress) {
        onProgress(100);
      }
      
      console.log('✅ Upload média réussi:', downloadURL.substring(0, 80) + '...');
      
      return {
        success: true,
        url: downloadURL,
        path: path,
        type: validation.type,
        filename: file.name,
        size: file.size,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          userId,
          taskTitle,
          contentType: file.type
        }
      };
      
    } catch (error) {
      console.error('❌ Erreur upload média:', error);
      
      // Gestion spécifique des erreurs CORS
      if (error.message.includes('CORS') || 
          error.message.includes('TypeError: Failed to fetch') ||
          error.message.includes('ERR_FAILED')) {
        throw new Error('CORS_ERROR');
      }
      
      throw error;
    }
  }

  /**
   * 🔗 Obtenir une URL de téléchargement publique
   */
  async getPublicDownloadURL(path) {
    try {
      const token = await this.getAuthToken();
      const encodedPath = encodeURIComponent(path);
      
      // URL publique Firebase Storage
      const publicUrl = `${this.baseUrl}/${encodedPath}?alt=media&token=${token}`;
      
      return publicUrl;
      
    } catch (error) {
      console.error('❌ Erreur génération URL publique:', error);
      throw error;
    }
  }

  /**
   * 📸 UPLOAD SPÉCIFIQUE POUR IMAGES
   */
  async uploadImage(imageFile, options = {}) {
    try {
      const validation = this.validateFile(imageFile);
      
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      if (validation.type !== 'image') {
        throw new Error('Le fichier doit être une image');
      }

      return await this.uploadFile(imageFile, {
        folder: 'images',
        ...options
      });
      
    } catch (error) {
      console.error('❌ Erreur upload image:', error);
      throw error;
    }
  }

  /**
   * 🎬 UPLOAD SPÉCIFIQUE POUR VIDÉOS
   */
  async uploadVideo(videoFile, options = {}) {
    try {
      const validation = this.validateFile(videoFile);
      
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      if (validation.type !== 'video') {
        throw new Error('Le fichier doit être une vidéo');
      }

      return await this.uploadFile(videoFile, {
        folder: 'videos',
        ...options
      });
      
    } catch (error) {
      console.error('❌ Erreur upload vidéo:', error);
      throw error;
    }
  }

  /**
   * 📱 UPLOAD POUR VALIDATION DE TÂCHE
   */
  async uploadTaskValidation(file, taskId, userId) {
    try {
      console.log('📱 Upload validation tâche:', taskId);
      
      return await this.uploadFile(file, {
        folder: 'task-validations',
        userId: userId,
        taskTitle: `Task-${taskId}`,
        onProgress: (progress) => {
          console.log(`📤 Progrès upload validation: ${progress}%`);
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur upload validation tâche:', error);
      throw error;
    }
  }

  /**
   * 🏆 UPLOAD POUR AVATAR UTILISATEUR
   */
  async uploadAvatar(avatarFile, userId) {
    try {
      console.log('🏆 Upload avatar utilisateur:', userId);
      
      const validation = this.validateFile(avatarFile);
      
      if (validation.type !== 'image') {
        throw new Error('L\'avatar doit être une image');
      }

      return await this.uploadFile(avatarFile, {
        folder: 'avatars',
        userId: userId,
        taskTitle: 'Avatar'
      });
      
    } catch (error) {
      console.error('❌ Erreur upload avatar:', error);
      throw error;
    }
  }

  /**
   * 🎨 UPLOAD POUR CONTENU CRÉATIF
   */
  async uploadCreativeContent(file, contentType, userId) {
    try {
      console.log('🎨 Upload contenu créatif:', contentType);
      
      return await this.uploadFile(file, {
        folder: 'creative-content',
        userId: userId,
        taskTitle: `Creative-${contentType}`
      });
      
    } catch (error) {
      console.error('❌ Erreur upload contenu créatif:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UN FICHIER MÉDIA
   */
  async deleteFile(path) {
    try {
      const token = await this.getAuthToken();
      const encodedPath = encodeURIComponent(path);
      const deleteUrl = `${this.baseUrl}/${encodedPath}`;
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }
      
      console.log('🗑️ Fichier média supprimé:', path);
      return true;
      
    } catch (error) {
      console.error('❌ Erreur suppression fichier média:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES MÉDIAS D'UN UTILISATEUR
   */
  async getUserMediaStats(userId) {
    try {
      console.log('📊 Calcul statistiques médias utilisateur:', userId);
      
      // Cette méthode nécessiterait l'implémentation d'une API de listing
      // Pour l'instant, on retourne des statistiques simulées
      return {
        totalFiles: 0,
        totalSize: 0,
        images: 0,
        videos: 0,
        imagesSize: 0,
        videosSize: 0,
        lastUpload: null
      };
      
    } catch (error) {
      console.error('❌ Erreur statistiques médias:', error);
      throw error;
    }
  }

  /**
   * 🔧 OUTILS UTILITAIRES
   */
  
  // Formatter la taille d'un fichier
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Générer un nom de fichier unique
  generateUniqueFilename(originalName, prefix = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || '';
    return `${prefix}${timestamp}-${random}.${extension}`;
  }

  // Détecter le type de média
  getMediaType(file) {
    if (this.supportedImageTypes.includes(file.type)) {
      return 'image';
    } else if (this.supportedVideoTypes.includes(file.type)) {
      return 'video';
    }
    return 'unknown';
  }
}

// ✅ INSTANCE UNIQUE ET EXPORT
const mediaUploadService = new MediaUploadService();

export { mediaUploadService };
export default MediaUploadService;
