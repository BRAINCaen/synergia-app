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
   * 🔗 Obtenir l'URL de téléchargement publique (CORRIGÉE POUR LECTEUR VIDÉO)
   */
  async getPublicDownloadURL(path) {
    try {
      const token = await this.getAuthToken();
      const encodedPath = encodeURIComponent(path);
      
      // ✅ Obtenir un token de téléchargement publique
      const metadataUrl = `${this.baseUrl}/${encodedPath}`;
      
      const response = await fetch(metadataUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get metadata: ${response.status}`);
      }
      
      const metadata = await response.json();
      
      // ✅ Vérifier si le fichier a déjà un downloadToken
      let downloadToken = metadata.downloadTokens;
      
      // ✅ Si pas de token, en créer un
      if (!downloadToken) {
        console.log('🔑 Création token de téléchargement publique...');
        downloadToken = await this.createDownloadToken(path);
      }
      
      // ✅ Construire l'URL publique avec token
      const publicURL = `https://firebasestorage.googleapis.com/v0/b/${this.bucketName}/o/${encodedPath}?alt=media&token=${downloadToken}`;
      
      console.log('✅ URL publique générée:', publicURL);
      return publicURL;
      
    } catch (error) {
      console.error('❌ Erreur récupération URL publique:', error);
      
      // ✅ Fallback : URL simple (peut nécessiter auth)
      const encodedPath = encodeURIComponent(path);
      const fallbackURL = `https://firebasestorage.googleapis.com/v0/b/${this.bucketName}/o/${encodedPath}?alt=media`;
      
      console.warn('⚠️ Utilisation URL fallback (peut nécessiter auth):', fallbackURL);
      return fallbackURL;
    }
  }

  /**
   * 🔑 Créer un token de téléchargement public
   */
  async createDownloadToken(path) {
    try {
      const token = await this.getAuthToken();
      const encodedPath = encodeURIComponent(path);
      
      // ✅ Générer un UUID simple pour le token
      const downloadToken = 'synergia-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      // ✅ Mettre à jour les métadonnées avec le token
      const metadataUrl = `${this.baseUrl}/${encodedPath}`;
      
      const response = await fetch(metadataUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metadata: {
            downloadTokens: downloadToken
          }
        })
      });
      
      if (response.ok) {
        console.log('✅ Token de téléchargement créé:', downloadToken);
        return downloadToken;
      } else {
        throw new Error(`Failed to create download token: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Erreur création token:', error);
      // Retourner un token par défaut
      return 'public-' + Date.now();
    }
  }

  /**
   * 🔗 Obtenir l'URL de téléchargement avec token d'auth (pour cas spéciaux)
   */
  async getAuthenticatedDownloadURL(path) {
    try {
      const token = await this.getAuthToken();
      const encodedPath = encodeURIComponent(path);
      
      // ✅ URL avec token d'authentification
      const authURL = `${this.baseUrl}/${encodedPath}?alt=media&auth=${token}`;
      
      console.log('✅ URL authentifiée générée:', authURL);
      return authURL;
      
    } catch (error) {
      console.error('❌ Erreur URL authentifiée:', error);
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
      
      console.log('📸 Upload média tâche avec URL publique:', fileName);
      
      const result = await this.uploadFile(mediaFile, fileName);
      
      console.log('✅ Média tâche uploadé avec URL publique:', result.url);
      
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
      
      console.log('👤 Upload avatar avec URL publique:', fileName);
      
      const result = await this.uploadFile(imageFile, fileName);
      
      console.log('✅ Avatar uploadé avec URL publique:', result.url);
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur upload avatar:', error);
      throw new Error(`Erreur upload avatar: ${error.message}`);
    }
  }

  /**
   * 🔄 Convertir une URL privée en URL publique (utilitaire)
   */
  async makeUrlPublic(privateUrl) {
    try {
      // Extraire le chemin de l'URL privée
      const urlParts = privateUrl.split('/o/');
      if (urlParts.length < 2) {
        throw new Error('URL invalide');
      }
      
      const pathPart = urlParts[1].split('?')[0];
      const decodedPath = decodeURIComponent(pathPart);
      
      // Générer une nouvelle URL publique
      return await this.getPublicDownloadURL(decodedPath);
      
    } catch (error) {
      console.error('❌ Erreur conversion URL publique:', error);
      return privateUrl; // Retourner l'URL originale en cas d'erreur
    }
  }
}

export default StorageService;
