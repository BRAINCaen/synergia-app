// ==========================================
// 📁 react-app/src/core/services/collaborationService.js
// SERVICE COLLABORATION - FIX COMPLET
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
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🤝 SERVICE DE COLLABORATION - VERSION FINALE CORRIGÉE
 */
class CollaborationService {
  constructor() {
    console.log('🤝 CollaborationService initialisé - FINAL FIX');
    this.listeners = new Map();
  }

  /**
   * 💬 AJOUTER UN COMMENTAIRE - VERSION ULTRA-SIMPLIFIÉE
   */
  async addComment(commentData) {
    try {
      console.log('💬 [ADD_COMMENT] Ajout:', commentData);

      // ✅ VALIDATION BASIQUE
      if (!commentData?.entityType || !commentData?.entityId || !commentData?.userId || !commentData?.content) {
        throw new Error('Données de commentaire manquantes');
      }

      // ✅ STRUCTURE ULTRA-SIMPLE
      const commentToAdd = {
        entityType: String(commentData.entityType).trim(),
        entityId: String(commentData.entityId).trim(),
        userId: String(commentData.userId).trim(),
        content: String(commentData.content).trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('💬 [ADD_COMMENT] Ajout à Firestore...');
      const docRef = await addDoc(collection(db, 'comments'), commentToAdd);
      
      console.log('✅ [ADD_COMMENT] Succès ID:', docRef.id);

      return {
        id: docRef.id,
        ...commentToAdd,
        createdAt: new Date(),
        updatedAt: new Date()
      };

    } catch (error) {
      console.error('❌ [ADD_COMMENT] Erreur:', error);
      throw new Error(`Erreur ajout commentaire: ${error.message}`);
    }
  }

  /**
   * 📖 RÉCUPÉRER COMMENTAIRES - VERSION ULTRA-SIMPLIFIÉE
   */
  async getComments(entityType, entityId, limitCount = 50) {
    try {
      console.log('📖 [GET_COMMENTS] Récupération:', { entityType, entityId });

      if (!entityType || !entityId) {
        console.warn('⚠️ Paramètres manquants');
        return [];
      }

      // ✅ REQUÊTE LA PLUS SIMPLE POSSIBLE
      const commentsRef = collection(db, 'comments');
      const q = query(
        commentsRef,
        where('entityType', '==', String(entityType)),
        where('entityId', '==', String(entityId))
        // ✅ PAS de orderBy, PAS de limit pour éviter tout problème d'index
      );

      console.log('📖 [GET_COMMENTS] Exécution requête...');
      const snapshot = await getDocs(q);
      
      const comments = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        });
      });

      // ✅ TRI CÔTÉ CLIENT
      comments.sort((a, b) => a.createdAt - b.createdAt);

      console.log(`✅ [GET_COMMENTS] ${comments.length} commentaires récupérés`);
      return comments;

    } catch (error) {
      console.error('❌ [GET_COMMENTS] Erreur:', error);
      
      // ✅ FALLBACK ULTIME : Requête sans contraintes
      try {
        console.log('🔄 [GET_COMMENTS] Tentative fallback...');
        const fallbackSnapshot = await getDocs(collection(db, 'comments'));
        const fallbackComments = [];
        
        fallbackSnapshot.forEach(doc => {
          const data = doc.data();
          // Filtrer côté client
          if (data.entityType === String(entityType) && data.entityId === String(entityId)) {
            fallbackComments.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(),
              updatedAt: data.updatedAt?.toDate?.() || new Date()
            });
          }
        });
        
        fallbackComments.sort((a, b) => a.createdAt - b.createdAt);
        console.log(`✅ [GET_COMMENTS] Fallback: ${fallbackComments.length} commentaires`);
        return fallbackComments;
        
      } catch (fallbackError) {
        console.error('❌ [GET_COMMENTS] Fallback échoué:', fallbackError);
        return [];
      }
    }
  }

  /**
   * 🗑️ SUPPRIMER UN COMMENTAIRE
   */
  async deleteComment(commentId, userId) {
    try {
      console.log('🗑️ [DELETE_COMMENT] Suppression:', { commentId, userId });

      if (!commentId || !userId) {
        throw new Error('Paramètres manquants');
      }

      const commentRef = doc(db, 'comments', commentId);
      const commentSnap = await getDoc(commentRef);

      if (!commentSnap.exists()) {
        throw new Error('Commentaire non trouvé');
      }

      const commentData = commentSnap.data();
      
      // Vérification de permission
      if (commentData.userId !== userId) {
        throw new Error('Permission refusée');
      }

      // ✅ SUPPRESSION SIMPLE
      await updateDoc(commentRef, {
        content: '[Commentaire supprimé]',
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ [DELETE_COMMENT] Commentaire supprimé');
      return commentId;

    } catch (error) {
      console.error('❌ [DELETE_COMMENT] Erreur:', error);
      throw error;
    }
  }

  /**
   * ✏️ METTRE À JOUR UN COMMENTAIRE
   */
  async updateComment(commentId, updateData, userId) {
    try {
      console.log('✏️ [UPDATE_COMMENT] Mise à jour:', { commentId, userId });

      if (!commentId || !updateData || !userId) {
        throw new Error('Paramètres manquants');
      }

      const commentRef = doc(db, 'comments', commentId);
      const commentSnap = await getDoc(commentRef);

      if (!commentSnap.exists()) {
        throw new Error('Commentaire non trouvé');
      }

      const commentData = commentSnap.data();
      
      if (commentData.userId !== userId) {
        throw new Error('Permission refusée');
      }

      await updateDoc(commentRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
        isEdited: true
      });

      console.log('✅ [UPDATE_COMMENT] Commentaire mis à jour');
      return commentId;

    } catch (error) {
      console.error('❌ [UPDATE_COMMENT] Erreur:', error);
      throw error;
    }
  }

  /**
   * 🧹 NETTOYER LES LISTENERS
   */
  cleanup() {
    console.log('🧹 [CLEANUP] Nettoyage listeners');
    this.listeners.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('❌ Erreur nettoyage listener:', error);
      }
    });
    this.listeners.clear();
  }
}

// ✅ INSTANCE UNIQUE
const collaborationService = new CollaborationService();

// ✅ EXPORTS
export default CollaborationService;
export { collaborationService };
