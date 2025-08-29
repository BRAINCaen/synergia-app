// ==========================================
// 📁 react-app/src/core/services/storageService.js
// SERVICE D'UPLOAD FIREBASE STORAGE AVEC URLS PUBLIQUES ET AVATAR
// ==========================================

import { getAuth } from 'firebase/auth';

/**
 * 📁 SERVICE D'UPLOAD FIREBASE STORAGE AVEC URLs PUBLIQUES
 */
class StorageService {
  constructor() {
    this.bucketName = 'synergia-app-f27e7.firebasestorage.app';
    this.baseUrl = `https://firebasestorage.googleapis.com/v0/b/${this.bucketName}/o`;
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
   * 📸 Upload d'un fichier avec l'API REST Firebase Storage
   */
  async uploadFile(file, path, metadata = {}) {
    try {
      console.log('📸 Upload API REST vers:', path, {
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type,
        bucket: this.bucketName
      });

      // ✅ Obtenir le token d'authentification
      const token = await this.getAuthToken();
      
      // ✅ Encoder le chemin pour l'URL
      const encodedPath = encodeURIComponent(path);
      
      // ✅ URL d'upload avec paramètres
      const uploadUrl = `${this.baseUrl}/${encodedPath}?uploadType=media`;
      
      // ✅ Headers minimalistes pour éviter CORS
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type
      };
      
      console.log('🔄 Démarrage upload API REST...');
      
      // ✅ Upload avec fetch
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: headers,
        body: file
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur réponse API REST:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Upload API REST réussi:', result);
      
      // ✅ Obtenir l'URL de téléchargement publique
      const downloadURL = await this.getPublicDownloadURL(path);
      
      return {
        success: true,
        path: path,
        url: downloadURL,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        size: file.size,
        metadata: result
      };
      
    } catch (error) {
      console.error('❌ Erreur upload API REST:', error);
      
      // ✅ Détecter les erreurs CORS
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
      
      // ✅ URL publique avec token d'authentification
      const publicUrl = `${this.baseUrl}/${encodedPath}?alt=media&token=${token}`;
      
      console.log('🔗 URL publique générée:', publicUrl.substring(0, 100) + '...');
      
      return publicUrl;
      
    } catch (error) {
      console.error('❌ Erreur génération URL publique:', error);
      throw error;
    }
  }

  /**
   * 📸 Upload d'une image avec gestion d'erreur
   */
  async uploadImage(imageFile, folder = 'uploads') {
    try {
      const timestamp = Date.now();
      const extension = imageFile.name.split('.').pop() || 'jpg';
      const filename = `image-${timestamp}.${extension}`;
      const path = `${folder}/${filename}`;
      
      return await this.uploadFile(imageFile, path);
      
    } catch (error) {
      console.error('❌ Erreur upload image:', error);
      throw error;
    }
  }

  /**
   * 🎬 Upload d'une vidéo avec gestion d'erreur
   */
  async uploadVideo(videoFile, folder = 'uploads') {
    try {
      const timestamp = Date.now();
      const extension = videoFile.name.split('.').pop() || 'mp4';
      const filename = `video-${timestamp}.${extension}`;
      const path = `${folder}/${filename}`;
      
      return await this.uploadFile(videoFile, path);
      
    } catch (error) {
      console.error('❌ Erreur upload vidéo:', error);
      throw error;
    }
  }

  /**
   * 👤 Upload d'un avatar utilisateur
   */
  async uploadUserAvatar(userId, avatarFile) {
    try {
      console.log('👤 Upload avatar pour utilisateur:', userId);
      
      // Validation du fichier
      if (!avatarFile) {
        throw new Error('Aucun fichier avatar fourni');
      }
      
      // Vérifier que c'est une image
      if (!avatarFile.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }
      
      // Limiter la taille (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (avatarFile.size > maxSize) {
        throw new Error('L\'avatar ne peut pas dépasser 5MB');
      }
      
      // Générer le chemin pour l'avatar
      const timestamp = Date.now();
      const extension = avatarFile.name.split('.').pop() || 'jpg';
      const filename = `avatar-${userId}-${timestamp}.${extension}`;
      const path = `avatars/${filename}`;
      
      // Upload du fichier
      const result = await this.uploadFile(avatarFile, path);
      
      console.log('✅ Avatar uploadé avec succès:', result.url);
      
      return result.url;
      
    } catch (error) {
      console.error('❌ Erreur upload avatar:', error);
      throw error;
    }
  }

  /**
   * 📱 Upload pour validation de tâche
   */
  async uploadTaskValidation(file, taskId, userId) {
    try {
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileType = file.type.startsWith('video/') ? 'video' : 'image';
      const filename = `task-${taskId}-${userId}-${timestamp}.${extension}`;
      const path = `task-validations/${filename}`;
      
      return await this.uploadFile(file, path);
      
    } catch (error) {
      console.error('❌ Erreur upload validation tâche:', error);
      throw error;
    }
  }

  /**
   * 🎨 Upload pour contenu créatif
   */
  async uploadCreativeContent(file, contentType, userId) {
    try {
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filename = `creative-${contentType}-${userId}-${timestamp}.${extension}`;
      const path = `creative-content/${filename}`;
      
      return await this.uploadFile(file, path);
      
    } catch (error) {
      console.error('❌ Erreur upload contenu créatif:', error);
      throw error;
    }
  }

  /**
   * 🗑️ Supprimer un fichier
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
      
      console.log('🗑️ Fichier supprimé:', path);
      return { success: true, path };
      
    } catch (error) {
      console.error('❌ Erreur suppression fichier:', error);
      throw error;
    }
  }

  /**
   * 📊 Obtenir les métadonnées d'un fichier
   */
  async getFileMetadata(path) {
    try {
      const token = await this.getAuthToken();
      const encodedPath = encodeURIComponent(path);
      const metadataUrl = `${this.baseUrl}/${encodedPath}`;
      
      const response = await fetch(metadataUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Get metadata failed: ${response.status}`);
      }
      
      const metadata = await response.json();
      return metadata;
      
    } catch (error) {
      console.error('❌ Erreur récupération métadonnées:', error);
      throw error;
    }
  }

  /**
   * ✅ Valider un fichier avant upload
   */
  validateFile(file, options = {}) {
    const errors = [];
    
    if (!file) {
      errors.push('Aucun fichier fourni');
      return { valid: false, errors };
    }
    
    // Vérifier la taille
    const maxSize = options.maxSize || 50 * 1024 * 1024; // 50MB par défaut
    if (file.size > maxSize) {
      errors.push(`Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(2)}MB (max: ${(maxSize / 1024 / 1024).toFixed(0)}MB)`);
    }
    
    // Vérifier le type si spécifié
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      errors.push(`Type de fichier non autorisé: ${file.type}`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      size: file.size,
      type: file.type
    };
  }
}

// Instance singleton
const storageService = new StorageService();

// Export des méthodes principales
export const {
  uploadFile,
  uploadImage,
  uploadVideo,
  uploadUserAvatar,
  uploadTaskValidation,
  uploadCreativeContent,
  getPublicDownloadURL,
  deleteFile,
  getFileMetadata,
  validateFile
} = storageService;

export default storageService;
