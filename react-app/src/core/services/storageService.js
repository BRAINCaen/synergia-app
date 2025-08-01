// ==========================================
// 📁 react-app/src/core/services/storageService.js
// SERVICE D'UPLOAD FIREBASE STORAGE AVEC URLS PUBLIQUES POUR LECTEUR VIDÉO
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
   * 📱 Upload pour validation de tâche
   */
  async uploadTaskValidation(file, taskId, userId) {
    try {
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileType = file.type.startsWith('video/') ? 'video' : 'photo';
      const filename = `${taskId}-${fileType}-${timestamp}.${extension}`;
      const path = `task-validations/${userId}/${filename}`;
      
      return await this.uploadFile(file, path);
      
    } catch (error) {
      console.error('❌ Erreur upload validation tâche:', error);
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
      return true;
      
    } catch (error) {
      console.error('❌ Erreur suppression fichier:', error);
      throw error;
    }
  }

  /**
   * 📊 Obtenir les informations d'un fichier
   */
  async getFileMetadata(path) {
    try {
      const token = await this.getAuthToken();
      const encodedPath = encodeURIComponent(path);
      const metadataUrl = `${this.baseUrl}/${encodedPath}`;
      
      const response = await fetch(metadataUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Metadata fetch failed: ${response.status}`);
      }
      
      const metadata = await response.json();
      console.log('📊 Métadonnées fichier:', metadata);
      
      return metadata;
      
    } catch (error) {
      console.error('❌ Erreur récupération métadonnées:', error);
      throw error;
    }
  }

  /**
   * 📋 Lister les fichiers d'un dossier
   */
  async listFiles(folder = '', maxResults = 100) {
    try {
      const token = await this.getAuthToken();
      const prefix = folder ? `&prefix=${encodeURIComponent(folder)}` : '';
      const listUrl = `${this.baseUrl}?maxResults=${maxResults}${prefix}`;
      
      const response = await fetch(listUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`List failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📋 Fichiers listés:', result.items?.length || 0);
      
      return result.items || [];
      
    } catch (error) {
      console.error('❌ Erreur listage fichiers:', error);
      throw error;
    }
  }

  /**
   * 🔄 Créer une URL de téléchargement temporaire
   */
  async createTemporaryDownloadURL(path, expirationMinutes = 60) {
    try {
      const token = await this.getAuthToken();
      const encodedPath = encodeURIComponent(path);
      
      // Calculer la date d'expiration
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + expirationMinutes);
      const expiration = expirationTime.toISOString();
      
      // URL temporaire avec expiration
      const temporaryUrl = `${this.baseUrl}/${encodedPath}?alt=media&token=${token}&expires=${expiration}`;
      
      console.log('🔄 URL temporaire créée, expire dans', expirationMinutes, 'minutes');
      
      return {
        url: temporaryUrl,
        expiresAt: expirationTime,
        expiresIn: expirationMinutes * 60 * 1000 // en millisecondes
      };
      
    } catch (error) {
      console.error('❌ Erreur création URL temporaire:', error);
      throw error;
    }
  }

  /**
   * 🎯 Valider un fichier avant upload
   */
  validateFile(file, options = {}) {
    const {
      maxSize = 100 * 1024 * 1024, // 100MB par défaut
      allowedTypes = ['image/*', 'video/*'],
      maxDuration = null // Pour les vidéos
    } = options;

    const errors = [];

    // Vérifier la taille
    if (file.size > maxSize) {
      errors.push(`Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(2)}MB (max: ${(maxSize / 1024 / 1024).toFixed(2)}MB)`);
    }

    // Vérifier le type
    const isTypeAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });

    if (!isTypeAllowed) {
      errors.push(`Type de fichier non autorisé: ${file.type}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 📈 Obtenir les statistiques d'utilisation
   */
  async getStorageStats(folder = '') {
    try {
      const files = await this.listFiles(folder);
      
      const stats = {
        totalFiles: files.length,
        totalSize: 0,
        byType: {
          images: 0,
          videos: 0,
          others: 0
        },
        sizeByType: {
          images: 0,
          videos: 0,
          others: 0
        }
      };

      files.forEach(file => {
        const size = parseInt(file.size) || 0;
        stats.totalSize += size;

        if (file.contentType?.startsWith('image/')) {
          stats.byType.images++;
          stats.sizeByType.images += size;
        } else if (file.contentType?.startsWith('video/')) {
          stats.byType.videos++;
          stats.sizeByType.videos += size;
        } else {
          stats.byType.others++;
          stats.sizeByType.others += size;
        }
      });

      console.log('📈 Statistiques stockage:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur statistiques stockage:', error);
      throw error;
    }
  }
}

// Créer et exporter une instance unique
const storageService = new StorageService();
export { storageService };
