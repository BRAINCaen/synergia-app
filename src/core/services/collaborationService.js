// ==========================================
// 📁 react-app/src/core/services/collaborationService.js
// Service de collaboration SIMPLIFIÉ - Sans requêtes complexes
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
 * 🤝 SERVICE DE COLLABORATION SIMPLIFIÉ
 */
class CollaborationService {
  constructor() {
    this.listeners = new Map();
    this.notificationQueue = [];
  }

  // ========================
  // 💬 SYSTÈME DE COMMENTAIRES SIMPLIFIÉ
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
        authorId: userId, // Pour compatibilité
        content: content.trim(),
        mentions,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isEdited: false,
        reactions: {},
        replyTo: commentData.replyTo || null,
        attachments: commentData.attachments || [],
        // ✅ CORRECTION: Pas de champ isDeleted pour éviter l'index complexe
      };

      const docRef = await addDoc(collection(db, 'comments'), comment);
      
      console.log('✅ Commentaire ajouté:', docRef.id);
      return { id: docRef.id, ...comment };

    } catch (error) {
      console.error('❌ Erreur ajout commentaire:', error);
      throw error;
    }
  }

  /**
   * 🔄 METTRE À JOUR UN COMMENTAIRE
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
      
      // Vérification de permission plus flexible
      const isOwner = commentData.userId === userId || commentData.authorId === userId;
      
      if (!isOwner) {
        console.warn('⚠️ Tentative de modification par:', userId, 'Propriétaire:', commentData.userId || commentData.authorId);
        throw new Error('Permission refusée - Vous ne pouvez modifier que vos propres commentaires');
      }

      // Préparer les données de mise à jour
      const updateData = {
        content: updates.content || commentData.content,
        updatedAt: serverTimestamp(),
        isEdited: true,
        lastEditBy: userId
      };

      await updateDoc(commentRef, updateData);

      console.log('✅ Commentaire mis à jour:', commentId);
      return { id: commentId, ...commentData, ...updateData };

    } catch (error) {
      console.error('❌ Erreur mise à jour commentaire:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UN COMMENTAIRE
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
      
      // Vérification de permission plus flexible
      const isOwner = commentData.userId === userId || commentData.authorId === userId;
      
      if (!isOwner) {
        console.warn('⚠️ Tentative de suppression par:', userId, 'Propriétaire:', commentData.userId || commentData.authorId);
        throw new Error('Permission refusée - Vous ne pouvez supprimer que vos propres commentaires');
      }

      // ✅ CORRECTION: Suppression simple avec marquage textuel
      await updateDoc(commentRef, {
        content: '[Commentaire supprimé]',
        deletedAt: serverTimestamp(),
        deletedBy: userId,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Commentaire marqué comme supprimé:', commentId);
      return commentId;

    } catch (error) {
      console.error('❌ Erreur suppression commentaire:', error);
      throw error;
    }
  }

  /**
   * 📖 RÉCUPÉRER LES COMMENTAIRES D'UNE ENTITÉ - VERSION SIMPLIFIÉE
   */
  async getComments(entityType, entityId, limitCount = 50) {
    try {
      // ✅ CORRECTION: Requête simple sans filtre sur isDeleted
      const q = query(
        collection(db, 'comments'),
        where('entityType', '==', entityType),
        where('entityId', '==', entityId),
        orderBy('createdAt', 'asc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const comments = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Filtrer les commentaires supprimés côté client
        if (data.content !== '[Commentaire supprimé]') {
          comments.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date()
          });
        }
      });

      console.log(`✅ ${comments.length} commentaires récupérés pour ${entityType}:${entityId}`);
      return comments;

    } catch (error) {
      console.error('❌ Erreur récupération commentaires:', error);
      return []; // Retourner tableau vide au lieu de throw
    }
  }

  /**
   * 🎧 ÉCOUTER LES COMMENTAIRES EN TEMPS RÉEL - VERSION SIMPLIFIÉE
   */
  subscribeToComments(entityType, entityId, callback) {
    try {
      // ✅ CORRECTION: Requête simple sans filtre complexe
      const q = query(
        collection(db, 'comments'),
        where('entityType', '==', entityType),
        where('entityId', '==', entityId),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const comments = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          
          // Filtrer les commentaires supprimés côté client
          if (data.content !== '[Commentaire supprimé]') {
            comments.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(),
              updatedAt: data.updatedAt?.toDate?.() || new Date()
            });
          }
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
   * 📬 CRÉER DES NOTIFICATIONS POUR LES MENTIONS - VERSION SIMPLIFIÉE
   */
  async createMentionNotifications(commentId, mentions, fromUserId, entityType, entityId) {
    try {
      // Version simplifiée sans batch
      for (const mentionedUserId of mentions) {
        if (mentionedUserId === fromUserId) continue;

        await addDoc(collection(db, 'notifications'), {
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

      console.log(`✅ ${mentions.length} notifications de mention créées`);

    } catch (error) {
      console.error('❌ Erreur création notifications mention:', error);
    }
  }

  /**
   * 📝 LOGGER L'ACTIVITÉ - VERSION SIMPLIFIÉE
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
   * ✅ MÉTHODES MANQUANTES AJOUTÉES
   */
  
  // Récupérer l'activité d'une entité
  async getEntityActivity(entityType, entityId, limitCount = 20) {
    try {
      const q = query(
        collection(db, 'activities'),
        where('entityType', '==', entityType),
        where('entityId', '==', entityId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const activities = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date()
        });
      });

      return activities;

    } catch (error) {
      console.error('❌ Erreur récupération activité entité:', error);
      return [];
    }
  }

  // Récupérer les notifications d'un utilisateur
  async getUserNotifications(userId, limitCount = 50) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const notifications = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date()
        });
      });

      return notifications;

    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      return [];
    }
  }

  // Marquer une notification comme lue
  async markNotificationAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
      
      console.log('✅ Notification marquée comme lue:', notificationId);
      return true;

    } catch (error) {
      console.error('❌ Erreur marquage notification:', error);
      return false;
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
