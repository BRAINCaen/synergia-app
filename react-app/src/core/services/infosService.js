// ==========================================
// 📁 react-app/src/core/services/infosService.js
// SERVICE COMPLET DE GESTION DES INFORMATIONS - SANS LIMITES DE TAILLE
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
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase.js';

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
   * 📤 UPLOAD FICHIER (PHOTO/VIDÉO) - SANS LIMITE DE TAILLE
   */
  async uploadFile(file, userId) {
    try {
      console.log('📤 [INFOS] Upload fichier:', file.name, 'Taille:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        throw new Error('Seules les images et vidéos sont acceptées');
      }

      // ✅ AUCUNE LIMITE DE TAILLE - Upload de n'importe quelle taille accepté
      console.log('✅ [INFOS] Aucune limite de taille - Upload autorisé');

      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${userId}.${fileExtension}`;
      const storagePath = `${this.STORAGE_PATH}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      console.log('📤 [INFOS] Début upload vers Firebase Storage...');

      await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
          originalSize: file.size.toString(),
          originalName: file.name
        }
      });

      const downloadURL = await getDownloadURL(storageRef);
      
      console.log('✅ [INFOS] Fichier uploadé avec succès:', downloadURL);
      
      return {
        url: downloadURL,
        type: isVideo ? 'video' : 'image',
        filename: file.name,
        size: file.size,
        storagePath
      };

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
   * ✅ VALIDER UNE INFO
   */
  async validateInfo(infoId, userId) {
    try {
      console.log('✅ [INFOS] Validation info:', infoId);
      
      const infoRef = doc(db, this.COLLECTION_NAME, infoId);
      const infoSnap = await getDoc(infoRef);
      
      if (!infoSnap.exists()) {
        throw new Error('Information non trouvée');
      }

      const infoData = infoSnap.data();
      const validatedBy = infoData.validatedBy || {};
      
      validatedBy[userId] = new Date().toISOString();

      await updateDoc(infoRef, {
        validatedBy,
        validationCount: Object.keys(validatedBy).length
      });

      console.log('✅ [INFOS] Info validée');

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
