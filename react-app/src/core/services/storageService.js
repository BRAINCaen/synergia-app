// ==========================================
// 📁 react-app/src/core/services/storageService.js
// SERVICE D'UPLOAD FIREBASE STORAGE AVEC LE BON NOM DE BUCKET
// ==========================================

import { getAuth } from 'firebase/auth';

/**
 * 📁 SERVICE D'UPLOAD FIREBASE STORAGE AVEC API REST
 */
class StorageService {
  constructor() {
    // ✅ BON NOM DU BUCKET FIREBASE
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
      
      // ✅ Préparer les headers
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type,
        'Content-Length': file.size.toString()
      };
      
      // ✅ Ajouter métadonnées personnalisées si nécessaire
      if (metadata && Object.keys(metadata).length > 0) {
        Object.keys(metadata).forEach(key => {
          headers[`x-goog-meta-${key}`] = metadata[key];
        });
      }
      
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
      
      // ✅ Obtenir l'URL de téléchargement
      const downloadURL = await this.getDownloadURL(path);
      
      return {
        success: true,
        path: path,
        url: downloadURL,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        size: file.size,
        name: file.name,
        uploadedAt: new Date().toISOString(),
        bucket: this.bucketName,
        fullPath: result.name || path
      };
      
    } catch (error) {
      console.error('❌ Erreur upload API REST:', error);
      throw error;
    }
  }

  /**
   * 🔗 Obtenir l'URL de téléchargement d'un fichier
   */
  async getDownloadURL(path) {
    try {
      const token = await this.getAuthToken();
      const encodedPath = encodeURIComponent(path);
      
      // ✅ URL pour obtenir les métadonnées et l'URL de téléchargement
      const metadataUrl = `${this.baseUrl}/${encodedPath}`;
      
      const response = await fetch(metadataUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get download URL: ${response.status}`);
      }
      
      const metadata = await response.json();
      
      // ✅ Construire l'URL de téléchargement publique
      const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${this.bucketName}/o/${encodedPath}?alt=media`;
      
      console.log('✅ URL de téléchargement obtenue:', downloadURL);
      return downloadURL;
      
    } catch (error) {
      console.error('❌ Erreur récupération URL:', error);
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
      
      if (!response.ok && response.status !== 404) {
        throw new Error(`Delete failed: ${response.status}`);
      }
      
      console.log('✅ Fichier supprimé:', path);
      return true;
      
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      // Ne pas faire échouer si le fichier n'existe pas
      if (error.message.includes('404')) {
        return true;
      }
      throw error;
    }
  }

  /**
   * 🎯 Upload spécialisé pour les tâches
   */
  async uploadTaskMedia(taskId, userId, mediaFile) {
    try {
      const timestamp = Date.now();
      const fileExtension = mediaFile.name.split('.').pop()?.toLowerCase() || 'bin';
      const fileName = `tasks/${userId}/${taskId}_${timestamp}.${fileExtension}`;
      
      const metadata = {
        taskId: taskId,
        userId: userId,
        originalName: mediaFile.name,
        uploadedAt: new Date().toISOString()
      };
      
      console.log('📸 Upload média tâche avec API REST:', fileName);
      
      const result = await this.uploadFile(mediaFile, fileName, metadata);
      
      console.log('✅ Média tâche uploadé avec succès:', result.url);
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur upload média tâche:', error);
      throw new Error(`Erreur upload média: ${error.message}`);
    }
  }

  /**
   * 🎯 Upload spécialisé pour les profils utilisateur
   */
  async uploadUserProfile(userId, imageFile) {
    try {
      const timestamp = Date.now();
      const fileExtension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `profiles/${userId}/avatar_${timestamp}.${fileExtension}`;
      
      const metadata = {
        userId: userId,
        type: 'profile_avatar',
        originalName: imageFile.name,
        uploadedAt: new Date().toISOString()
      };
      
      console.log('👤 Upload avatar utilisateur avec API REST:', fileName);
      
      const result = await this.uploadFile(imageFile, fileName, metadata);
      
      console.log('✅ Avatar utilisateur uploadé:', result.url);
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur upload avatar:', error);
      throw new Error(`Erreur upload avatar: ${error.message}`);
    }
  }
}

export default StorageService;
