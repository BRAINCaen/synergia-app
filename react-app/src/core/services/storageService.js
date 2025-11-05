// ==========================================
// 📁 react-app/src/core/services/storageService.js
// SERVICE FIREBASE STORAGE POUR UPLOAD D'IMAGES
// ==========================================

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase.js';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 📷 UPLOAD AVATAR UTILISATEUR
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

    // Créer une référence unique pour l'avatar
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `avatar_${userId}_${timestamp}.${fileExtension}`;
    const storageRef = ref(storage, `avatars/${userId}/${fileName}`);

    console.log('📤 [STORAGE] Upload vers:', storageRef.fullPath);

    // Upload du fichier
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: userId,
        uploadedAt: new Date().toISOString()
      }
    });

    console.log('✅ [STORAGE] Upload réussi');

    // Récupérer l'URL de téléchargement
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('🔗 [STORAGE] URL générée:', downloadURL);

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
 * 🗑️ SUPPRIMER UN AVATAR UTILISATEUR
 * @param {string} photoURL - URL de l'image à supprimer
 */
export const deleteUserAvatar = async (photoURL) => {
  try {
    if (!photoURL || !photoURL.includes('firebase')) {
      console.log('⚠️ [STORAGE] Pas d\'avatar Firebase à supprimer');
      return;
    }

    // Extraire le chemin depuis l'URL
    const path = decodeURIComponent(photoURL.split('/o/')[1]?.split('?')[0]);
    if (!path) {
      throw new Error('Impossible d\'extraire le chemin du fichier');
    }

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    
    console.log('✅ [STORAGE] Avatar supprimé');
  } catch (error) {
    console.error('❌ [STORAGE] Erreur suppression avatar:', error);
    throw error;
  }
};

/**
 * 📁 UPLOAD FICHIER GÉNÉRIQUE
 * @param {string} path - Chemin de destination dans Storage
 * @param {File} file - Fichier à uploader
 * @returns {Promise<string>} URL du fichier uploadé
 */
export const uploadFile = async (path, file) => {
  try {
    console.log('📁 [STORAGE] Upload fichier vers:', path);

    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type
    });

    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ [STORAGE] Fichier uploadé:', downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('❌ [STORAGE] Erreur upload fichier:', error);
    throw error;
  }
};

/**
 * 🗑️ SUPPRIMER UN FICHIER
 * @param {string} fileURL - URL du fichier à supprimer
 */
export const deleteFile = async (fileURL) => {
  try {
    if (!fileURL || !fileURL.includes('firebase')) {
      console.log('⚠️ [STORAGE] Pas de fichier Firebase à supprimer');
      return;
    }

    const path = decodeURIComponent(fileURL.split('/o/')[1]?.split('?')[0]);
    if (!path) {
      throw new Error('Impossible d\'extraire le chemin du fichier');
    }

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    
    console.log('✅ [STORAGE] Fichier supprimé');
  } catch (error) {
    console.error('❌ [STORAGE] Erreur suppression fichier:', error);
    throw error;
  }
};

export default {
  uploadUserAvatar,
  deleteUserAvatar,
  uploadFile,
  deleteFile
};
