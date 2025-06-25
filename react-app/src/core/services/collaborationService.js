// ==========================================
// 📁 react-app/src/core/services/collaborationService.js
// Service de collaboration CORRIGÉ - Permissions flexibles
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
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🤝 SERVICE DE COLLABORATION TEMPS RÉEL - VERSION CORRIGÉE
 */
class CollaborationService {
  constructor() {
    this.listeners = new Map();
    this.notificationQueue = [];
  }

  // ========================
  // 💬 SYSTÈME DE COMMENTAIRES CORRIGÉ
  // ========================

  /**
   * 📝 AJOUTER UN COMMENTAIRE
   */
  async addComment(commentData) {
    try {
      const { entityType, entityId, userId, content, mentions = [] } = commentData;

      // Validation des données
      if (!entityType || !entityId || !userId || !content?.trim()) {
        throw new Error('Données manquantes pour créer le commentaire');
      }

      const comment = {
        entityType, // 'task' ou 'project'
        entityId,
        userId,
        authorId: userId, // ✅ CORRECTION: Dupliquer pour compatibilité
        content: content.trim(),
        mentions,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isEdited: false,
        reactions: {},
        replyTo: commentData.replyTo || null,
        attachments: commentData.attachments || []
      };

      const docRef = await addDoc(collection(db, 'comments'), comment);
      
      // Créer les notifications pour les mentions
      if (mentions.length > 0) {
        await this.createMentionNotifications(docRef.id, mentions, userId, entityType, entityId);
      }

      // Logger l'activité
      await this.logActivity({
        type: 'comment_added',
        userId,
        entityType,
        entityId,
        details: { commentId: docRef.id, content: content.substring(0, 100) }
      });

      console.log('✅ Commentaire ajouté:', docRef.id);
      return { id: docRef.id, ...comment };

    } catch (error) {
      console.error('❌ Erreur ajout commentaire:', error);
      throw error;
    }
  }

  /**
   * 🔄 METTRE À JOUR UN COMMENTAIRE - VERSION CORRIGÉE
   */
  async updateComment(commentId, updates, userId) {
    try {
      if (!commentId || !userId) {
        throw new Error('Paramètres manquants pour mettre à jour le commentaire');
      }

      const commentRef = doc(db, 'comments', commentId);
      const commentSnap = await getDoc(commentRef);

      if (!commentSnap.exists()) {
        throw new Error('Commentaire non trouvé');
      }

      const commentData = commentSnap.data();
      
      // ✅ CORRECTION: Vérification de permission plus flexible
      const isOwner = commentData.userId === userId || commentData.authorId === userId;
      const isAdmin = false; // TODO: Implémenter vérification admin si nécessaire
      
      if (!isOwner && !isAdmin) {
        console.warn('⚠️ Tentative de modification par:', userId, 'Propriétaire:', commentData.userId || commentData.authorId);
        throw new Error('Permission refusée - Vous ne pouvez modifier que vos propres commentaires');
      }

      // Préparer les données de mise à jour
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        isEdited: true,
        lastEditBy: userId // ✅ Tracer qui a fait la dernière modification
      };

      // Nettoyer les champs qui ne doivent pas être modifiés
      delete updateData.userId;
      delete updateData.authorId;
      delete updateData.createdAt;
      delete updateData.id;

      await updateDoc(commentRef, updateData);

      console.log('✅ Commentaire mis à jour:', commentId);
      return { id: commentId, ...commentData, ...updateData };

    } catch (error) {
      console.error('❌ Erreur mise à jour commentaire:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UN COMMENTAIRE - VERSION CORRIGÉE
   */
  async deleteComment(commentId, userId) {
    try {
      if (!commentId || !userId) {
        throw new Error('Paramètres manquants pour supprimer le commentaire');
      }

      const commentRef = doc(db, 'comments', commentId);
      const commentSnap = await getDoc(commentRef);

      if (!commentSnap.exists()) {
        throw new Error('Commentaire non trouvé');
      }

      const commentData = commentSnap.data();
      
      // ✅ CORRECTION: Vérification de permission plus flexible
      const isOwner = commentData.userId === userId || commentData.authorId === userId;
      const isAdmin = false; // TODO: Implémenter vérification admin si nécessaire
      
      if (!isOwner && !isAdmin) {
        console.warn('⚠️ Tentative de suppression par:', userId, 'Propriétaire:', commentData.userId || commentData.authorId);
        throw new Error('Permission refusée - Vous ne pouvez supprimer que vos propres commentaires');
      }

      // ✅ OPTION 1: Suppression douce (marquer comme supprimé)
      if (true) { // Configurable
        await updateDoc(commentRef, {
          isDeleted: true,
          deletedAt: serverTimestamp(),
          deletedBy: userId,
          content: '[Commentaire supprimé]'
        });
        console.log('✅ Commentaire marqué comme supprimé:', commentId);
      } else {
        // OPTION 2: Suppression définitive
        await deleteDoc(commentRef);
        console.log('✅ Commentaire supprimé définitivement:', commentId);
      }

      // Logger l'activité
      await this.logActivity({
        type: 'comment_deleted',
        userId,
        entityType: commentData.entityType,
        entityId: commentData.entityId,
        details: { commentId }
      });

      return commentId;

    } catch (error) {
      console.error('❌ Erreur suppression commentaire:', error);
      throw error;
    }
  }

  /**
   * 📖 RÉCUPÉRER LES COMMENTAIRES D'UNE ENTITÉ
   */
  async getComments(entityType, entityId, limitCount = 50) {
    try {
      const q = query(
        collection(db, 'comments'),
        where('entityType', '==', entityType),
        where('entityId', '==', entityId),
        where('isDeleted', '!=', true), // ✅ Exclure les commentaires supprimés
        orderBy('createdAt', 'asc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const comments = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          ...data,
          // ✅ Convertir les timestamps pour compatibilité
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        });
      });

      console.log(`✅ ${comments.length} commentaires récupérés pour ${entityType}:${entityId}`);
      return comments;

    } catch (error) {
      console.error('❌ Erreur récupération commentaires:', error);
      throw error;
    }
  }

  /**
   * 🎧 ÉCOUTER LES COMMENTAIRES EN TEMPS RÉEL
   */
  subscribeToComments(entityType, entityId, callback) {
    try {
      const q = query(
        collection(db, 'comments'),
        where('entityType', '==', entityType),
        where('entityId', '==', entityId),
        where('isDeleted', '!=', true),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
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

        callback(comments);
      }, (error) => {
        console.error('❌ Erreur écoute commentaires:', error);
        callback([]); // Fallback sur tableau vide
      });

      // Stocker le listener pour nettoyage
      const listenerId = `comments_${entityType}_${entityId}`;
      this.listeners.set(listenerId, unsubscribe);

      return unsubscribe;

    } catch (error) {
      console.error('❌ Erreur souscription commentaires:', error);
      return () => {}; // Fonction vide pour éviter les erreurs
    }
  }

  /**
   * 🔍 RECHERCHER DES UTILISATEURS POUR MENTIONS
   */
  async searchUsersForMention(searchTerm, limitCount = 10) {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }

      // Recherche simple par nom/email
      const q = query(
        collection(db, 'users'),
        orderBy('displayName'),
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
            photoURL: data.photoURL
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
   * 📬 CRÉER DES NOTIFICATIONS POUR LES MENTIONS
   */
  async createMentionNotifications(commentId, mentions, fromUserId, entityType, entityId) {
    try {
      const batch = writeBatch(db);

      for (const mentionedUserId of mentions) {
        if (mentionedUserId === fromUserId) continue; // Pas de notification pour soi-même

        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, {
          userId: mentionedUserId,
          type: 'mention',
          title: 'Vous avez été mentionné',
          message: `Vous avez été mentionné dans un commentaire`,
          data: {
            commentId,
            entityType,
            entityId,
            fromUserId
          },
          read: false,
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
      console.log(`✅ ${mentions.length} notifications de mention créées`);

    } catch (error) {
      console.error('❌ Erreur création notifications mention:', error);
    }
  }

  /**
   * 📝 LOGGER L'ACTIVITÉ
   */
  async logActivity(activityData) {
    try {
      await addDoc(collection(db, 'activities'), {
        ...activityData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.warn('⚠️ Erreur log activité:', error);
      // Ne pas faire échouer l'opération principale
    }
  }

  /**
   * 🧹 NETTOYER LES LISTENERS
   */
  cleanup() {
    this.listeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
    console.log('✅ Listeners collaboration nettoyés');
  }

  /**
   * 🔧 OBTENIR LES STATISTIQUES D'UNE ENTITÉ
   */
  async getEntityStats(entityType, entityId) {
    try {
      const comments = await this.getComments(entityType, entityId, 1000);
      
      return {
        commentCount: comments.length,
        uniqueCommenters: new Set(comments.map(c => c.userId)).size,
        lastActivity: comments.length > 0 ? Math.max(...comments.map(c => c.createdAt)) : null
      };

    } catch (error) {
      console.error('❌ Erreur statistiques entité:', error);
      return {
        commentCount: 0,
        uniqueCommenters: 0,
        lastActivity: null
      };
    }
  }
}

// Export singleton
export const collaborationService = new CollaborationService();
export default collaborationService;
