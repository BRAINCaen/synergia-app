// ==========================================
// 📁 react-app/src/core/services/collaborationService.js
// SERVICE COLLABORATION - FIX COMPLET pour commentaires
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
 * 🤝 SERVICE DE COLLABORATION - VERSION CORRIGÉE
 */
class CollaborationService {
  constructor() {
    console.log('🤝 CollaborationService initialisé - VERSION CORRIGÉE');
    this.listeners = new Map();
  }

  /**
   * 💬 AJOUTER UN COMMENTAIRE - VERSION CORRIGÉE
   */
  async addComment(commentData) {
    try {
      console.log('💬 [ADD_COMMENT] Ajout commentaire:', commentData);

      // ✅ VALIDATION STRICTE
      if (!commentData || typeof commentData !== 'object') {
        throw new Error('Données de commentaire invalides');
      }

      const { entityType, entityId, userId, content, replyTo = null, mentions = [] } = commentData;

      // Validation des champs requis
      if (!entityType || typeof entityType !== 'string') {
        throw new Error('entityType requis et doit être une chaîne');
      }
      if (!entityId || typeof entityId !== 'string') {
        throw new Error('entityId requis et doit être une chaîne');
      }
      if (!userId || typeof userId !== 'string') {
        throw new Error('userId requis et doit être une chaîne');
      }
      if (!content || typeof content !== 'string' || !content.trim()) {
        throw new Error('content requis et ne peut pas être vide');
      }

      // ✅ STRUCTURE CORRIGÉE
      const commentToAdd = {
        entityType: String(entityType).trim(),
        entityId: String(entityId).trim(),
        userId: String(userId).trim(),
        content: String(content).trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        replyTo: replyTo || null,
        mentions: Array.isArray(mentions) ? mentions : [],
        isEdited: false,
        deletedAt: null
      };

      console.log('💬 [ADD_COMMENT] Structure validée:', {
        entityType: commentToAdd.entityType,
        entityId: commentToAdd.entityId,
        userId: commentToAdd.userId,
        contentLength: commentToAdd.content.length
      });

      // Ajouter à Firestore
      const docRef = await addDoc(collection(db, 'comments'), commentToAdd);
      
      if (!docRef || !docRef.id) {
        throw new Error('Échec de création du commentaire dans Firestore');
      }

      console.log('✅ [ADD_COMMENT] Commentaire créé avec ID:', docRef.id);

      // Retourner le commentaire avec son ID
      return {
        id: docRef.id,
        ...commentToAdd,
        createdAt: new Date(), // Pour l'affichage immédiat
        updatedAt: new Date()
      };

    } catch (error) {
      console.error('❌ [ADD_COMMENT] Erreur:', error);
      
      // Messages d'erreur plus spécifiques
      if (error.code === 'permission-denied') {
        throw new Error('Permissions insuffisantes pour ajouter un commentaire');
      } else if (error.code === 'unavailable') {
        throw new Error('Service temporairement indisponible, veuillez réessayer');
      } else if (error.message.includes('Firebase')) {
        throw new Error('Erreur de base de données');
      } else {
        throw error;
      }
    }
  }

  /**
   * 📖 RÉCUPÉRER LES COMMENTAIRES - VERSION SIMPLIFIÉE SANS INDEX
   */
  async getComments(entityType, entityId, limitCount = 50) {
    try {
      console.log('📖 [GET_COMMENTS] Récupération:', { entityType, entityId, limitCount });

      // Validation des paramètres
      if (!entityType || !entityId) {
        console.warn('⚠️ [GET_COMMENTS] Paramètres manquants');
        return [];
      }

      // ✅ REQUÊTE SIMPLE sans orderBy pour éviter l'erreur d'index
      const commentsRef = collection(db, 'comments');
      const q = query(
        commentsRef,
        where('entityType', '==', String(entityType)),
        where('entityId', '==', String(entityId)),
        limit(limitCount)
        // ✅ SUPPRESSION DU orderBy pour éviter l'erreur d'index
      );

      const snapshot = await getDocs(q);
      const comments = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Filtrer les commentaires supprimés côté client
        if (data.content && data.content !== '[Commentaire supprimé]') {
          comments.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date()
          });
        }
      });

      // ✅ TRI CÔTÉ CLIENT par date de création
      comments.sort((a, b) => a.createdAt - b.createdAt);

      console.log(`✅ [GET_COMMENTS] ${comments.length} commentaires récupérés et triés`);
      return comments;

    } catch (error) {
      console.error('❌ [GET_COMMENTS] Erreur:', error);
      
      // ✅ FALLBACK : Si erreur d'index, requête encore plus simple
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        console.warn('⚠️ [GET_COMMENTS] Index manquant, fallback simple...');
        
        try {
          // Requête ultra-simple sans aucune contrainte
          const fallbackQ = query(
            collection(db, 'comments'),
            where('entityType', '==', String(entityType)),
            where('entityId', '==', String(entityId))
          );
          
          const fallbackSnapshot = await getDocs(fallbackQ);
          const fallbackComments = [];
          
          fallbackSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.content && data.content !== '[Commentaire supprimé]') {
              fallbackComments.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() || new Date(),
                updatedAt: data.updatedAt?.toDate?.() || new Date()
              });
            }
          });
          
          // Trier côté client et limiter
          fallbackComments.sort((a, b) => a.createdAt - b.createdAt);
          const limitedComments = fallbackComments.slice(0, limitCount);
          
          console.log(`✅ [GET_COMMENTS] Fallback: ${limitedComments.length} commentaires récupérés`);
          return limitedComments;
          
        } catch (fallbackError) {
          console.error('❌ [GET_COMMENTS] Fallback échoué:', fallbackError);
          return [];
        }
      }
      
      // Pour toute autre erreur, retourner tableau vide
      return [];
    }
  }

  /**
   * ✏️ METTRE À JOUR UN COMMENTAIRE
   */
  async updateComment(commentId, updateData, userId) {
    try {
      console.log('✏️ [UPDATE_COMMENT] Mise à jour:', { commentId, userId });

      if (!commentId || !updateData || !userId) {
        throw new Error('Paramètres manquants pour la mise à jour');
      }

      const commentRef = doc(db, 'comments', commentId);
      const commentSnap = await getDoc(commentRef);

      if (!commentSnap.exists()) {
        throw new Error('Commentaire non trouvé');
      }

      const commentData = commentSnap.data();
      
      // Vérification de permission
      if (commentData.userId !== userId) {
        throw new Error('Permission refusée - Vous ne pouvez modifier que vos propres commentaires');
      }

      // Mise à jour
      const updates = {
        ...updateData,
        updatedAt: serverTimestamp(),
        isEdited: true
      };

      await updateDoc(commentRef, updates);

      console.log('✅ [UPDATE_COMMENT] Commentaire mis à jour');
      return commentId;

    } catch (error) {
      console.error('❌ [UPDATE_COMMENT] Erreur:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UN COMMENTAIRE
   */
  async deleteComment(commentId, userId) {
    try {
      console.log('🗑️ [DELETE_COMMENT] Suppression:', { commentId, userId });

      if (!commentId || !userId) {
        throw new Error('Paramètres manquants pour la suppression');
      }

      const commentRef = doc(db, 'comments', commentId);
      const commentSnap = await getDoc(commentRef);

      if (!commentSnap.exists()) {
        throw new Error('Commentaire non trouvé');
      }

      const commentData = commentSnap.data();
      
      // Vérification de permission
      if (commentData.userId !== userId) {
        throw new Error('Permission refusée - Vous ne pouvez supprimer que vos propres commentaires');
      }

      // ✅ SUPPRESSION SOFT (marquage)
      await updateDoc(commentRef, {
        content: '[Commentaire supprimé]',
        deletedAt: serverTimestamp(),
        deletedBy: userId,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [DELETE_COMMENT] Commentaire marqué comme supprimé');
      return commentId;

    } catch (error) {
      console.error('❌ [DELETE_COMMENT] Erreur:', error);
      throw error;
    }
  }

  /**
   * 🎧 ÉCOUTER LES COMMENTAIRES EN TEMPS RÉEL - OPTIONNEL
   */
  subscribeToComments(entityType, entityId, callback) {
    try {
      console.log('🎧 [SUBSCRIBE] Écoute temps réel:', { entityType, entityId });

      // Créer l'ID unique pour ce listener
      const listenerId = `comments_${entityType}_${entityId}`;
      
      // Si un listener existe déjà pour cette entité, l'arrêter
      if (this.listeners.has(listenerId)) {
        this.listeners.get(listenerId)();
        this.listeners.delete(listenerId);
      }

      // ✅ REQUÊTE SIMPLE pour éviter les erreurs d'index
      const q = query(
        collection(db, 'comments'),
        where('entityType', '==', String(entityType)),
        where('entityId', '==', String(entityId)),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const comments = [];
          
          snapshot.forEach(doc => {
            const data = doc.data();
            
            // Filtrer les commentaires supprimés
            if (data.content && data.content !== '[Commentaire supprimé]') {
              comments.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() || new Date(),
                updatedAt: data.updatedAt?.toDate?.() || new Date()
              });
            }
          });

          // Trier côté client par date de création
          comments.sort((a, b) => a.createdAt - b.createdAt);

          console.log(`🎧 [SUBSCRIBE] ${comments.length} commentaires reçus en temps réel`);
          callback(comments);
        },
        (error) => {
          console.error('❌ [SUBSCRIBE] Erreur listener:', error);
          
          // En cas d'erreur, callback avec tableau vide
          callback([]);
        }
      );

      // Stocker le listener pour nettoyage
      this.listeners.set(listenerId, unsubscribe);

      console.log('✅ [SUBSCRIBE] Listener créé:', listenerId);
      return unsubscribe;

    } catch (error) {
      console.error('❌ [SUBSCRIBE] Erreur création listener:', error);
      
      // Retourner une fonction vide pour éviter les erreurs
      return () => {};
    }
  }

  /**
   * 🧹 NETTOYER LES LISTENERS
   */
  cleanup() {
    console.log('🧹 [CLEANUP] Nettoyage des listeners:', this.listeners.size);
    
    this.listeners.forEach((unsubscribe, listenerId) => {
      try {
        unsubscribe();
        console.log('✅ [CLEANUP] Listener arrêté:', listenerId);
      } catch (error) {
        console.error('❌ [CLEANUP] Erreur arrêt listener:', listenerId, error);
      }
    });
    
    this.listeners.clear();
  }

  /**
   * 🔍 RECHERCHER DES UTILISATEURS POUR MENTIONS - SIMPLIFIÉ
   */
  async searchUsersForMention(searchTerm, limitCount = 10) {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }

      // Requête simple sur les utilisateurs
      const q = query(
        collection(db, 'users'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const users = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        const name = data.displayName || data.email || '';
        
        // Filtrer par terme de recherche (case insensitive)
        if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
          users.push({
            id: doc.id,
            name: data.displayName || data.email,
            email: data.email,
            avatar: data.photoURL || null
          });
        }
      });

      return users;

    } catch (error) {
      console.error('❌ Erreur recherche utilisateurs:', error);
      return [];
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DE COMMENTAIRES
   */
  async getCommentStats(entityType, entityId) {
    try {
      const comments = await this.getComments(entityType, entityId);
      
      const stats = {
        total: comments.length,
        uniqueAuthors: new Set(comments.map(c => c.userId)).size,
        lastCommentDate: comments.length > 0 ? 
          Math.max(...comments.map(c => c.createdAt.getTime())) : null
      };

      return stats;

    } catch (error) {
      console.error('❌ Erreur statistiques commentaires:', error);
      return { total: 0, uniqueAuthors: 0, lastCommentDate: null };
    }
  }
}

// ✅ INSTANCE UNIQUE DU SERVICE
const collaborationService = new CollaborationService();

// ✅ EXPORTS
export default CollaborationService;
export { collaborationService };
