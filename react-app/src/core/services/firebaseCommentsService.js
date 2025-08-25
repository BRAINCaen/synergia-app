// ==========================================
// 📁 react-app/src/core/services/firebaseCommentsService.js
// SERVICE COMMENTAIRES FIREBASE UNIFIÉ ET FONCTIONNEL
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  onSnapshot,
  limit
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 💬 SERVICE COMMENTAIRES FIREBASE UNIFIÉ
 * Compatible avec TaskDetailModal et autres composants
 */
class FirebaseCommentsService {
  constructor() {
    console.log('💬 FirebaseCommentsService initialisé');
    this.listeners = new Map(); // Gérer les listeners temps réel
    this.collectionName = 'comments';
  }

  /**
   * 📝 AJOUTER UN COMMENTAIRE (MÉTHODE UNIFIÉE)
   * Compatible avec les signatures existantes
   */
  async addComment(entityTypeOrData, entityId, commentData) {
    try {
      let finalData;
      
      // 🔄 GESTION DES DIFFÉRENTES SIGNATURES
      if (typeof entityTypeOrData === 'object') {
        // Signature: addComment(commentData)
        finalData = entityTypeOrData;
      } else {
        // Signature: addComment(entityType, entityId, commentData)
        finalData = {
          entityType: entityTypeOrData,
          entityId: entityId,
          ...commentData
        };
      }

      console.log('📝 [COMMENTS] Ajout commentaire:', finalData);

      // 🛡️ VALIDATION STRICTE
      if (!finalData.entityType || !finalData.entityId || !finalData.content) {
        throw new Error('entityType, entityId et content sont obligatoires');
      }

      if (!finalData.userId && !finalData.authorId) {
        throw new Error('userId ou authorId est obligatoire');
      }

      // 📋 NORMALISATION DES DONNÉES
      const comment = {
        entityType: String(finalData.entityType),
        entityId: String(finalData.entityId),
        userId: String(finalData.userId || finalData.authorId),
        content: String(finalData.content).trim(),
        userName: finalData.userName || finalData.authorName || 'Utilisateur',
        userEmail: finalData.userEmail || finalData.authorEmail || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isEdited: false,
        clientTimestamp: new Date()
      };

      console.log('💾 [COMMENTS] Sauvegarde Firebase...', comment);

      // 🔥 SAUVEGARDE FIREBASE
      const docRef = await addDoc(collection(db, this.collectionName), comment);
      
      console.log('✅ [COMMENTS] Commentaire sauvé ID:', docRef.id);
      
      return {
        success: true,
        id: docRef.id,
        commentId: docRef.id, // Compatibilité
        comment: {
          id: docRef.id,
          ...comment,
          createdAt: new Date() // Pour affichage immédiat
        }
      };
      
    } catch (error) {
      console.error('❌ [COMMENTS] Erreur ajout:', error);
      throw error;
    }
  }

  /**
   * 📖 RÉCUPÉRER LES COMMENTAIRES
   */
  async getComments(entityType, entityId) {
    try {
      console.log('📖 [COMMENTS] Récupération pour:', { entityType, entityId });

      if (!entityType || !entityId) {
        console.warn('⚠️ [COMMENTS] Paramètres manquants');
        return [];
      }

      const q = query(
        collection(db, this.collectionName),
        where('entityType', '==', String(entityType)),
        where('entityId', '==', String(entityId)),
        orderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(q);
      const comments = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || data.clientTimestamp)
        });
      });

      console.log('✅ [COMMENTS] Récupérés:', comments.length);
      return comments;
      
    } catch (error) {
      console.error('❌ [COMMENTS] Erreur récupération:', error);
      return [];
    }
  }

  /**
   * 📡 LISTENER TEMPS RÉEL
   */
  subscribeToComments(entityType, entityId, callback) {
    try {
      console.log('📡 [COMMENTS] Setup listener:', { entityType, entityId });

      if (!entityType || !entityId) {
        console.warn('⚠️ [COMMENTS] Paramètres manquants pour listener');
        return null;
      }

      const listenerKey = `${entityType}_${entityId}`;

      // 🛑 Nettoyer listener existant
      if (this.listeners.has(listenerKey)) {
        this.listeners.get(listenerKey)();
        this.listeners.delete(listenerKey);
      }

      const q = query(
        collection(db, this.collectionName),
        where('entityType', '==', String(entityType)),
        where('entityId', '==', String(entityId)),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const comments = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            comments.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || data.clientTimestamp)
            });
          });
          
          console.log('📡 [COMMENTS] Mise à jour temps réel:', comments.length);
          callback(comments);
        },
        (error) => {
          console.error('❌ [COMMENTS] Erreur listener:', error);
          callback([]);
        }
      );

      // 📋 Stocker le listener
      this.listeners.set(listenerKey, unsubscribe);

      console.log('✅ [COMMENTS] Listener configuré');
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ [COMMENTS] Erreur setup listener:', error);
      return null;
    }
  }

  /**
   * ✏️ MODIFIER UN COMMENTAIRE
   */
  async updateComment(commentId, updates) {
    try {
      console.log('✏️ [COMMENTS] Modification:', commentId);

      if (!commentId || !updates) {
        throw new Error('ID commentaire et données requises');
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        isEdited: true
      };

      await updateDoc(doc(db, this.collectionName, commentId), updateData);
      
      console.log('✅ [COMMENTS] Commentaire modifié');
      return { success: true };
      
    } catch (error) {
      console.error('❌ [COMMENTS] Erreur modification:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UN COMMENTAIRE
   */
  async deleteComment(commentId) {
    try {
      console.log('🗑️ [COMMENTS] Suppression:', commentId);

      if (!commentId) {
        throw new Error('ID commentaire requis');
      }

      await deleteDoc(doc(db, this.collectionName, commentId));
      
      console.log('✅ [COMMENTS] Commentaire supprimé');
      return { success: true };
      
    } catch (error) {
      console.error('❌ [COMMENTS] Erreur suppression:', error);
      throw error;
    }
  }

  /**
   * 📊 COMPTER LES COMMENTAIRES
   */
  async getCommentCount(entityType, entityId) {
    try {
      const comments = await this.getComments(entityType, entityId);
      return comments.length;
    } catch (error) {
      console.error('❌ [COMMENTS] Erreur comptage:', error);
      return 0;
    }
  }

  /**
   * 🧹 NETTOYER LES LISTENERS
   */
  cleanup() {
    console.log('🧹 [COMMENTS] Nettoyage listeners...');
    
    this.listeners.forEach((unsubscribe, key) => {
      try {
        unsubscribe();
        console.log('🛑 [COMMENTS] Listener fermé:', key);
      } catch (error) {
        console.warn('⚠️ [COMMENTS] Erreur fermeture listener:', error);
      }
    });
    
    this.listeners.clear();
    console.log('✅ [COMMENTS] Nettoyage terminé');
  }

  /**
   * 🧪 TEST DE CONNECTIVITÉ
   */
  async testConnection() {
    try {
      console.log('🧪 [COMMENTS] Test connexion...');
      
      // Test simple avec limite 1
      const testQuery = query(collection(db, this.collectionName), limit(1));
      await getDocs(testQuery);
      
      console.log('✅ [COMMENTS] Connexion Firebase OK');
      return true;
    } catch (error) {
      console.error('❌ [COMMENTS] Erreur connexion:', error);
      return false;
    }
  }
}

// 🌐 INSTANCE GLOBALE
export const firebaseCommentsService = new FirebaseCommentsService();

// 🔄 COMPATIBILITÉ AVEC L'ANCIEN SERVICE
export const collaborationService = {
  addComment: (...args) => firebaseCommentsService.addComment(...args),
  getComments: (...args) => firebaseCommentsService.getComments(...args),
  subscribeToComments: (...args) => firebaseCommentsService.subscribeToComments(...args),
  updateComment: (...args) => firebaseCommentsService.updateComment(...args),
  deleteComment: (...args) => firebaseCommentsService.deleteComment(...args)
};

// Export par défaut
export default firebaseCommentsService;

console.log('💬 Service commentaires Firebase chargé et prêt');
