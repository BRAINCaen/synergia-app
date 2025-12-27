// ==========================================
// 📁 react-app/src/core/services/infosService.js
// SERVICE COMPLET DE GESTION DES INFORMATIONS - AVEC NOTIFICATIONS
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  getDocs,
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  deleteObject
} from 'firebase/storage';
import { db, storage, auth } from '../firebase.js';
import notificationService from './notificationService.js';

/**
 * 📢 SERVICE DE GESTION DES INFORMATIONS
 */
class InfosService {
  constructor() {
    this.COLLECTION_NAME = 'infos';
    this.STORAGE_PATH = 'infos';
    this.listeners = new Map();
  }

  /**
   * 🛡️ VÉRIFIER LES PERMISSIONS ADMIN
   */
  isAdmin(user) {
    if (!user) return false;
    
    return (
      user.email === 'alan.boehme61@gmail.com' ||
      user.role === 'admin' ||
      user.isAdmin === true ||
      user.profile?.role === 'admin' ||
      user.permissions?.includes('admin_access')
    );
  }

  /**
   * 📤 UPLOAD FICHIER AVEC PROGRESSION - API REST AVEC TOKEN
   */
  async uploadFile(file, userId, onProgress) {
    try {
      console.log('📤 [INFOS] Upload fichier:', file.name, 'Taille:', (file.size / 1024 / 1024).toFixed(2), 'MB');

      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        throw new Error('Seules les images et vidéos sont acceptées');
      }

      // Vérifier l'authentification
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Utilisateur non authentifié');
      }

      // Obtenir le token d'authentification
      const token = await currentUser.getIdToken();

      // Construire le chemin du fichier
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${userId}.${fileExtension}`;
      const storagePath = `${this.STORAGE_PATH}/${fileName}`;

      // ✅ Bucket Firebase Storage (format cohérent avec storageService)
      const bucket = 'synergia-app-f27e7.firebasestorage.app';

      console.log('📤 [INFOS] Début upload vers Firebase Storage REST API...');
      console.log('📤 [INFOS] Chemin:', storagePath);

      // Simuler la progression au démarrage
      if (onProgress) {
        onProgress(10);
      }

      // ✅ TIMEOUT DE 2 MINUTES AVEC ABORTCONTROLLER
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 120000); // 2 minutes

      try {
        // URL d'upload REST API Firebase Storage
        const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}`;

        // Progression à 30%
        if (onProgress) {
          onProgress(30);
        }

        // Upload via REST API
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': file.type
          },
          body: file,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Progression à 70%
        if (onProgress) {
          onProgress(70);
        }

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('❌ [INFOS] Erreur upload:', uploadResponse.status, errorText);
          throw new Error(`Erreur upload: ${uploadResponse.status}`);
        }

        // ✅ RÉCUPÉRER LE TOKEN DE TÉLÉCHARGEMENT
        const uploadData = await uploadResponse.json();
        console.log('📊 [INFOS] Réponse upload:', uploadData);

        // Extraire le token de la réponse
        const downloadToken = uploadData.downloadTokens;

        // Construire l'URL avec le token
        let downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}?alt=media`;

        if (downloadToken) {
          downloadURL += `&token=${downloadToken}`;
          console.log('✅ [INFOS] Token de téléchargement ajouté');
        } else {
          console.warn('⚠️ [INFOS] Pas de token dans la réponse, URL sans token');
        }

        // Progression à 100%
        if (onProgress) {
          onProgress(100);
        }

        console.log('✅ [INFOS] Fichier uploadé avec succès:', downloadURL);

        return {
          url: downloadURL,
          type: isVideo ? 'video' : 'image',
          filename: file.name,
          size: file.size,
          storagePath
        };

      } catch (fetchError) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          console.error('⏱️ [INFOS] Timeout - Upload annulé après 2 minutes');
          throw new Error('Upload annulé: délai dépassé (2 minutes). Vérifiez votre connexion.');
        }

        throw fetchError;
      }

    } catch (error) {
      console.error('❌ [INFOS] Erreur upload:', error);
      throw error;
    }
  }

  /**
   * ➕ CRÉER UNE NOUVELLE INFO
   */
  async createInfo(data, user) {
    try {
      console.log('➕ [INFOS] Création info...');
      
      if (!user || !user.uid) {
        throw new Error('Utilisateur non authentifié');
      }

      const infoData = {
        ...data,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        authorEmail: user.email,
        authorAvatar: user.photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        validatedBy: {},
        validationCount: 0
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), infoData);
      
      console.log('✅ [INFOS] Info créée:', docRef.id);

      // 🔔 NOTIFIER TOUS LES UTILISATEURS DE LA NOUVELLE INFO
      try {
        await notificationService.notifyAllUsersNewInfo({
          infoId: docRef.id,
          infoTitle: data.text?.substring(0, 50) || 'Nouvelle information',
          infoType: data.type || 'general',
          authorName: user.displayName || user.email,
          priority: data.priority || 'medium'
        });
        console.log('🔔 [INFOS] Tous les utilisateurs notifiés de la nouvelle info');
      } catch (notifError) {
        console.warn('⚠️ [INFOS] Erreur notification nouvelle info:', notifError);
      }
      
      return { id: docRef.id, ...infoData };

    } catch (error) {
      console.error('❌ [INFOS] Erreur création:', error);
      throw error;
    }
  }

  /**
   * ✏️ MODIFIER UNE INFO
   */
  async updateInfo(infoId, updates, user) {
    try {
      console.log('✏️ [INFOS] Modification info:', infoId);
      
      const infoRef = doc(db, this.COLLECTION_NAME, infoId);
      const infoSnap = await getDoc(infoRef);
      
      if (!infoSnap.exists()) {
        throw new Error('Information non trouvée');
      }

      const infoData = infoSnap.data();
      const canEdit = this.isAdmin(user) || infoData.authorId === user.uid;
      
      if (!canEdit) {
        throw new Error('Permission refusée');
      }

      await updateDoc(infoRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [INFOS] Info modifiée');

    } catch (error) {
      console.error('❌ [INFOS] Erreur modification:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UNE INFO
   */
  async deleteInfo(infoId, user) {
    try {
      console.log('🗑️ [INFOS] Suppression info:', infoId);
      
      const infoRef = doc(db, this.COLLECTION_NAME, infoId);
      const infoSnap = await getDoc(infoRef);
      
      if (!infoSnap.exists()) {
        throw new Error('Information non trouvée');
      }

      const infoData = infoSnap.data();
      const canDelete = this.isAdmin(user) || infoData.authorId === user.uid;
      
      if (!canDelete) {
        throw new Error('Permission refusée');
      }

      if (infoData.media?.storagePath) {
        try {
          const fileRef = ref(storage, infoData.media.storagePath);
          await deleteObject(fileRef);
          console.log('✅ [INFOS] Fichier supprimé du Storage');
        } catch (error) {
          console.warn('⚠️ [INFOS] Erreur suppression fichier:', error);
        }
      }

      await deleteDoc(infoRef);
      
      console.log('✅ [INFOS] Info supprimée');

    } catch (error) {
      console.error('❌ [INFOS] Erreur suppression:', error);
      throw error;
    }
  }

  /**
   * ✅ VALIDER UNE INFO (AVEC NOM DU VALIDEUR)
   */
  async validateInfo(infoId, userId, userName = null, userAvatar = null) {
    try {
      console.log('✅ [INFOS] Validation info:', infoId, 'par', userId);
      
      const infoRef = doc(db, this.COLLECTION_NAME, infoId);
      const infoSnap = await getDoc(infoRef);
      
      if (!infoSnap.exists()) {
        throw new Error('Information non trouvée');
      }

      const infoData = infoSnap.data();
      const validatedBy = infoData.validatedBy || {};
      
      // ✅ STOCKER PLUS D'INFOS SUR LE VALIDEUR
      validatedBy[userId] = {
        validatedAt: new Date().toISOString(),
        userName: userName || 'Utilisateur',
        userAvatar: userAvatar || null
      };

      await updateDoc(infoRef, {
        validatedBy,
        validationCount: Object.keys(validatedBy).length
      });

      console.log('✅ [INFOS] Info validée par', userName || userId);

    } catch (error) {
      console.error('❌ [INFOS] Erreur validation:', error);
      throw error;
    }
  }

  /**
   * 📊 RÉCUPÉRER TOUTES LES INFOS
   */
  async getAllInfos() {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const infos = [];
      
      snapshot.forEach(doc => {
        infos.push({ id: doc.id, ...doc.data() });
      });

      return infos;

    } catch (error) {
      console.error('❌ [INFOS] Erreur récupération:', error);
      throw error;
    }
  }

  /**
   * 🔔 COMPTER LES INFOS NON VALIDÉES
   */
  async getUnvalidatedCount(userId) {
    try {
      const infos = await this.getAllInfos();
      const unvalidated = infos.filter(info => !info.validatedBy?.[userId]);
      return unvalidated.length;
    } catch (error) {
      console.error('❌ [INFOS] Erreur comptage:', error);
      return 0;
    }
  }

  /**
   * 🎧 ÉCOUTER EN TEMPS RÉEL
   */
  listenToInfos(callback) {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const infos = [];
          snapshot.forEach(doc => {
            infos.push({ id: doc.id, ...doc.data() });
          });
          callback(infos);
        },
        (error) => {
          console.error('❌ [INFOS] Erreur listener:', error);
        }
      );

      const listenerId = Date.now().toString();
      this.listeners.set(listenerId, unsubscribe);
      
      return listenerId;

    } catch (error) {
      console.error('❌ [INFOS] Erreur création listener:', error);
      throw error;
    }
  }

  /**
   * 🛑 ARRÊTER L'ÉCOUTE
   */
  stopListening(listenerId) {
    const unsubscribe = this.listeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
    }
  }

  /**
   * 🧹 NETTOYER
   */
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}

const infosService = new InfosService();
export default infosService;
