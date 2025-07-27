// ==========================================
// 📁 react-app/src/core/services/collaborationService.js
// SERVICE COLLABORATION - VERSION ULTRA-SIMPLIFIÉE POUR ÉVITER LES ERREURS
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🤝 SERVICE DE COLLABORATION - VERSION FINALE ULTRA-SIMPLE
 */
class CollaborationService {
  constructor() {
    console.log('🤝 CollaborationService - Version Ultra-Simple');
  }

  /**
   * 💬 AJOUTER UN COMMENTAIRE - VERSION ULTRA-SIMPLIFIÉE
   */
  async addComment(commentData) {
    try {
      console.log('💬 Ajout commentaire ultra-simple:', commentData);

      // Validation minimale
      if (!commentData?.entityType || !commentData?.entityId || !commentData?.userId || !commentData?.content) {
        throw new Error('Données manquantes');
      }

      // Structure ultra-simple
      const comment = {
        entityType: commentData.entityType,
        entityId: commentData.entityId,
        userId: commentData.userId,
        content: commentData.content,
        createdAt: serverTimestamp()
      };

      console.log('💬 Ajout à Firestore...');
      const docRef = await addDoc(collection(db, 'comments'), comment);
      
      console.log('✅ Commentaire créé:', docRef.id);
      return {
        id: docRef.id,
        ...comment,
        createdAt: new Date()
      };

    } catch (error) {
      console.error('❌ Erreur ajout commentaire:', error);
      throw new Error(`Impossible d'ajouter le commentaire: ${error.message}`);
    }
  }

  /**
   * 📖 RÉCUPÉRER COMMENTAIRES - VERSION ULTRA-SIMPLIFIÉE
   */
  async getComments(entityType, entityId) {
    try {
      console.log('📖 Récupération commentaires:', { entityType, entityId });

      if (!entityType || !entityId) {
        return [];
      }

      // Requête la plus simple possible
      const commentsRef = collection(db, 'comments');
      const q = query(
        commentsRef,
        where('entityType', '==', entityType),
        where('entityId', '==', entityId)
      );

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

      // Tri côté client
      comments.sort((a, b) => a.createdAt - b.createdAt);

      console.log(`✅ ${comments.length} commentaires récupérés`);
      return comments;

    } catch (error) {
      console.error('❌ Erreur récupération commentaires:', error);
      
      // En cas d'erreur, essayer une approche différente
      try {
        console.log('🔄 Tentative de récupération alternative...');
        
        const allComments = await getDocs(collection(db, 'comments'));
        const filteredComments = [];
        
        allComments.forEach(doc => {
          const data = doc.data();
          if (data.entityType === entityType && data.entityId === entityId) {
            filteredComments.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(),
              updatedAt: data.updatedAt?.toDate?.() || new Date()
            });
          }
        });
        
        filteredComments.sort((a, b) => a.createdAt - b.createdAt);
        console.log(`✅ Récupération alternative: ${filteredComments.length} commentaires`);
        return filteredComments;
        
      } catch (fallbackError) {
        console.error('❌ Fallback échoué:', fallbackError);
        return [];
      }
    }
  }

  /**
   * 🗑️ SUPPRIMER UN COMMENTAIRE
   */
  async deleteComment(commentId, userId) {
    try {
      console.log('🗑️ Suppression commentaire:', { commentId, userId });

      if (!commentId || !userId) {
        throw new Error('Paramètres manquants');
      }

      const commentRef = doc(db, 'comments', commentId);
      const commentSnap = await getDoc(commentRef);

      if (!commentSnap.exists()) {
        throw new Error('Commentaire non trouvé');
      }

      const commentData = commentSnap.data();
      if (commentData.userId !== userId) {
        throw new Error('Non autorisé');
      }

      await updateDoc(commentRef, {
        content: '[Commentaire supprimé]',
        deletedAt: serverTimestamp()
      });

      console.log('✅ Commentaire supprimé');
      return commentId;

    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      throw error;
    }
  }

  /**
   * ✏️ MODIFIER UN COMMENTAIRE
   */
  async updateComment(commentId, updateData, userId) {
    try {
      console.log('✏️ Modification commentaire:', { commentId, userId });

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
        throw new Error('Non autorisé');
      }

      await updateDoc(commentRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
        isEdited: true
      });

      console.log('✅ Commentaire modifié');
      return commentId;

    } catch (error) {
      console.error('❌ Erreur modification:', error);
      throw error;
    }
  }
}

// Instance unique
const collaborationService = new CollaborationService();

// Exports
export default CollaborationService;
export { collaborationService };
