// ==========================================
// 📁 react-app/src/core/services/storageService.js
// SERVICE FIREBASE STORAGE AVEC API REST (FORMAT MULTIPART CORRIGÉ)
// ==========================================

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { getAuth } from 'firebase/auth';

/**
 * 🔑 Obtenir le token d'authentification Firebase
 */
const getAuthToken = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }
    
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('❌ [STORAGE] Erreur récupération token:', error);
    throw error;
  }
};

/**
 * 📷 UPLOAD AVATAR UTILISATEUR (API REST - FORMAT MULTIPART)
 * @param {string} userId - ID de l'utilisateur
 * @param {File} file - Fichier image à uploader
 * @returns {Promise<string>} URL de l'image uploadée
 */
export const uploadUserAvatar = async (userId, file) => {
  try {
    console.log('📷 [STORAGE] Upload avatar pour user:', userId);
    
    // Validation du fichier
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    // Vérifier que c'est bien une image
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image');
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('L\'image ne doit pas dépasser 5MB');
    }

    // Créer le nom de fichier unique
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `avatar_${userId}_${timestamp}.${fileExtension}`;
    const filePath = `avatars/${userId}/${fileName}`;

    console.log('📤 [STORAGE] Upload vers:', filePath);

    // Récupérer le token d'authentification
    const token = await getAuthToken();

    // Configuration de l'upload via API REST avec FormData
    const bucket = 'synergia-app-f27e7.firebasestorage.app';
    
    // Créer FormData pour l'upload multipart
    const formData = new FormData();
    formData.append('file', file);

    // URL d'upload avec uploadType=multipart
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=multipart&name=${encodeURIComponent(filePath)}`;

    console.log('🔗 [STORAGE] URL upload:', uploadUrl);

    // Upload du fichier via fetch avec FormData
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: file // Envoyer le fichier directement, pas FormData
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ [STORAGE] Erreur upload:', errorText);
      throw new Error(`Erreur upload: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    console.log('✅ [STORAGE] Upload réussi:', uploadData);

    // Construire l'URL de téléchargement public
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(filePath)}?alt=media`;
    console.log('🔗 [STORAGE] URL de téléchargement:', downloadURL);

    // Mettre à jour le profil utilisateur dans Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      photoURL: downloadURL,
      updatedAt: new Date()
    });

    console.log('✅ [STORAGE] Profil mis à jour dans Firestore');

    return downloadURL;

  } catch (error) {
    console.error('❌ [STORAGE] Erreur upload avatar:', error);
    throw error;
  }
};

/**
 * 🗑️ SUPPRIMER UN AVATAR UTILISATEUR (API REST)
 * @param {string} photoURL - URL de l'image à supprimer
 */
export const deleteUserAvatar = async (photoURL) => {
  try {
    if (!photoURL || !photoURL.includes('firebase')) {
      console.log('⚠️ [STORAGE] Pas d\'avatar Firebase à supprimer');
      return;
    }

    // Extraire le chemin depuis l'URL
    const urlParts = photoURL.split('/o/');
    if (urlParts.length < 2) {
      throw new Error('URL invalide');
    }
    
    const pathWithQuery = urlParts[1];
    const path = decodeURIComponent(pathWithQuery.split('?')[0]);
    
    console.log('🗑️ [STORAGE] Suppression:', path);

    // Récupérer le token d'authentification
    const token = await getAuthToken();

    // Configuration de la suppression via API REST
    const bucket = 'synergia-app-f27e7.firebasestorage.app';
    const deleteUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}`;

    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error('❌ [STORAGE] Erreur suppression:', errorText);
      throw new Error(`Erreur suppression: ${deleteResponse.status}`);
    }
    
    console.log('✅ [STORAGE] Avatar supprimé');
  } catch (error) {
    console.error('❌ [STORAGE] Erreur suppression avatar:', error);
    throw error;
  }
};

/**
 * 📁 UPLOAD FICHIER GÉNÉRIQUE (API REST)
 * @param {string} path - Chemin de destination dans Storage
 * @param {File} file - Fichier à uploader
 * @returns {Promise<string>} URL du fichier uploadé
 */
export const uploadFile = async (path, file) => {
  try {
    console.log('📁 [STORAGE] Upload fichier vers:', path);

    // Récupérer le token d'authentification
    const token = await getAuthToken();

    // Configuration de l'upload via API REST
    const bucket = 'synergia-app-f27e7.firebasestorage.app';
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=multipart&name=${encodeURIComponent(path)}`;

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: file
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Erreur upload: ${uploadResponse.status} - ${errorText}`);
    }

    // Construire l'URL de téléchargement
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
    console.log('✅ [STORAGE] Fichier uploadé:', downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('❌ [STORAGE] Erreur upload fichier:', error);
    throw error;
  }
};

/**
 * 🗑️ SUPPRIMER UN FICHIER (API REST)
 * @param {string} fileURL - URL du fichier à supprimer
 */
export const deleteFile = async (fileURL) => {
  try {
    if (!fileURL || !fileURL.includes('firebase')) {
      console.log('⚠️ [STORAGE] Pas de fichier Firebase à supprimer');
      return;
    }

    // Extraire le chemin depuis l'URL
    const urlParts = fileURL.split('/o/');
    if (urlParts.length < 2) {
      throw new Error('URL invalide');
    }
    
    const pathWithQuery = urlParts[1];
    const path = decodeURIComponent(pathWithQuery.split('?')[0]);

    // Récupérer le token d'authentification
    const token = await getAuthToken();

    // Configuration de la suppression via API REST
    const bucket = 'synergia-app-f27e7.firebasestorage.app';
    const deleteUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}`;

    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      throw new Error(`Erreur suppression: ${deleteResponse.status}`);
    }
    
    console.log('✅ [STORAGE] Fichier supprimé');
  } catch (error) {
    console.error('❌ [STORAGE] Erreur suppression fichier:', error);
    throw error;
  }
};

/**
 * 📤 UPLOAD AVEC PROGRESSION (XMLHttpRequest)
 * @param {File} file - Fichier à uploader
 * @param {string} path - Chemin de destination
 * @param {Function} onProgress - Callback de progression (0-100)
 * @returns {Promise<string>} URL du fichier uploadé
 */
export const uploadFileWithProgress = async (file, path, onProgress) => {
  try {
    console.log('📤 [STORAGE] Upload avec progression vers:', path);

    // Récupérer le token d'authentification
    const token = await getAuthToken();

    // Configuration de l'upload
    const bucket = 'synergia-app-f27e7.firebasestorage.app';
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=multipart&name=${encodeURIComponent(path)}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Gestion de la progression
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          if (onProgress) {
            onProgress(percentComplete);
          }
          console.log(`📊 [STORAGE] Progression: ${percentComplete}%`);
        }
      });

      // Gestion de la réussite
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
          console.log('✅ [STORAGE] Upload terminé:', downloadURL);
          resolve(downloadURL);
        } else {
          reject(new Error(`Erreur upload: ${xhr.status} - ${xhr.responseText}`));
        }
      });

      // Gestion des erreurs
      xhr.addEventListener('error', () => {
        reject(new Error('Erreur réseau lors de l\'upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload annulé'));
      });

      // Configuration et envoi de la requête
      xhr.open('POST', uploadUrl);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(file);
    });

  } catch (error) {
    console.error('❌ [STORAGE] Erreur upload avec progression:', error);
    throw error;
  }
};

/**
 * 📎 UPLOAD PIÈCE JOINTE POUR UNE QUÊTE (CRÉATION)
 * Supporte images et vidéos sans limite de taille
 * @param {File} file - Fichier à uploader
 * @param {string} userId - ID de l'utilisateur
 * @param {function} onProgress - Callback de progression
 * @returns {Promise<{url: string, name: string, type: string, size: number}>}
 */
export const uploadTaskAttachment = async (file, userId, onProgress = () => {}) => {
  try {
    console.log('📎 [STORAGE] Upload pièce jointe quête:', file.name, '- Taille:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    // Créer le nom de fichier unique
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${safeFileName}`;
    const filePath = `tasks/attachments/${userId}/${fileName}`;

    console.log('📤 [STORAGE] Upload vers:', filePath);

    // Récupérer le token d'authentification
    const token = await getAuthToken();

    // Configuration de l'upload via API REST
    const bucket = 'synergia-app-f27e7.firebasestorage.app';
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=multipart&name=${encodeURIComponent(filePath)}`;

    // Simuler la progression
    onProgress(10);

    // Upload du fichier via fetch
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type
      },
      body: file
    });

    onProgress(80);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ [STORAGE] Erreur upload:', errorText);
      throw new Error(`Erreur upload: ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();
    console.log('✅ [STORAGE] Upload réussi:', uploadData.name);

    // Construire l'URL de téléchargement
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(filePath)}?alt=media`;

    onProgress(100);

    return {
      url: downloadURL,
      name: file.name,
      type: file.type,
      size: file.size,
      path: filePath
    };

  } catch (error) {
    console.error('❌ [STORAGE] Erreur upload pièce jointe:', error);
    throw error;
  }
};

/**
 * 🖼️ UPLOAD MÉDIA POUR VALIDATION DE QUÊTE
 * Supporte images et vidéos sans limite de taille
 * @param {File} file - Fichier à uploader
 * @param {string} userId - ID de l'utilisateur
 * @param {string} taskId - ID de la quête
 * @param {function} onProgress - Callback de progression
 * @returns {Promise<{url: string, type: string}>}
 */
export const uploadValidationMedia = async (file, userId, taskId, onProgress = () => {}) => {
  try {
    console.log('🖼️ [STORAGE] Upload média validation:', file.name, '- Taille:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      throw new Error('Seules les images et vidéos sont acceptées');
    }

    // Créer le nom de fichier unique
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const mediaType = isImage ? 'photo' : 'video';
    const fileName = `${mediaType}_${timestamp}.${fileExtension}`;
    const filePath = `tasks/validations/${taskId}/${userId}/${fileName}`;

    console.log('📤 [STORAGE] Upload vers:', filePath);

    // Récupérer le token d'authentification
    const token = await getAuthToken();

    // Configuration de l'upload via API REST
    const bucket = 'synergia-app-f27e7.firebasestorage.app';
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=multipart&name=${encodeURIComponent(filePath)}`;

    onProgress(10);

    // Upload du fichier via fetch
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type
      },
      body: file
    });

    onProgress(80);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ [STORAGE] Erreur upload média:', errorText);
      throw new Error(`Erreur upload: ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();
    console.log('✅ [STORAGE] Upload média réussi:', uploadData.name);

    // Construire l'URL de téléchargement
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(filePath)}?alt=media`;

    onProgress(100);

    return {
      url: downloadURL,
      type: isImage ? 'image' : 'video',
      name: file.name,
      size: file.size,
      path: filePath
    };

  } catch (error) {
    console.error('❌ [STORAGE] Erreur upload média validation:', error);
    throw error;
  }
};

/**
 * 📚 UPLOAD MULTIPLE FICHIERS
 * Upload plusieurs fichiers en parallèle
 * @param {File[]} files - Tableau de fichiers à uploader
 * @param {string} userId - ID de l'utilisateur
 * @param {string} context - Contexte ('task' ou 'validation')
 * @param {string} taskId - ID de la quête (optionnel)
 * @param {function} onProgress - Callback de progression globale
 * @returns {Promise<Array>}
 */
export const uploadMultipleFiles = async (files, userId, context = 'task', taskId = null, onProgress = () => {}) => {
  try {
    console.log(`📚 [STORAGE] Upload multiple: ${files.length} fichiers`);

    if (!files || files.length === 0) {
      return [];
    }

    const results = [];
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileProgress = (progress) => {
        const globalProgress = Math.round(((i * 100) + progress) / totalFiles);
        onProgress(globalProgress);
      };

      let result;
      if (context === 'validation' && taskId) {
        result = await uploadValidationMedia(file, userId, taskId, fileProgress);
      } else {
        result = await uploadTaskAttachment(file, userId, fileProgress);
      }

      results.push(result);
    }

    console.log(`✅ [STORAGE] ${results.length} fichiers uploadés avec succès`);
    return results;

  } catch (error) {
    console.error('❌ [STORAGE] Erreur upload multiple:', error);
    throw error;
  }
};

export default {
  uploadUserAvatar,
  deleteUserAvatar,
  uploadFile,
  deleteFile,
  uploadFileWithProgress,
  uploadTaskAttachment,
  uploadValidationMedia,
  uploadMultipleFiles
};
