// ==========================================
// 📁 react-app/src/core/services/collaborationService.js
// Service de collaboration temps réel avec commentaires, mentions et notifications
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
 * 🤝 SERVICE DE COLLABORATION TEMPS RÉEL
 * 
 * Fonctionnalités complètes de collaboration :
 * - Commentaires temps réel sur tâches/projets
 * - Système de mentions (@utilisateur)
 * - Notifications intelligentes
 * - Activité en temps réel
 * - Historique des actions
 * - Gestion des permissions
 */
class CollaborationService {
  constructor() {
    this.listeners = new Map();
    this.notificationQueue = [];
  }

  // ========================
  // 💬 SYSTÈME DE COMMENTAIRES
  // ========================

  /**
   * 📝 AJOUTER UN COMMENTAIRE
   */
  async addComment(commentData) {
    try {
      const { entityType, entityId, userId, content, mentions = [] } = commentData;

      const comment = {
        entityType, // 'task' ou 'project'
        entityId,
        userId,
        content,
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
   * 🔄 METTRE À JOUR UN COMMENTAIRE
   */
  async updateComment(commentId, updates, userId) {
    try {
      const commentRef = doc(db, 'comments', commentId);
      const commentSnap = await getDoc(commentRef);

      if (!commentSnap.exists()) {
        throw new Error('Commentaire non trouvé');
      }

      const commentData = commentSnap.data();
      
      // Vérifier les permissions
      if (commentData.userId !== userId) {
        throw new Error('Permission refusée');
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        isEdited: true
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
      const commentRef = doc(db, 'comments', commentId);
      const commentSnap = await getDoc(commentRef);

      if (!commentSnap.exists()) {
        throw new Error('Commentaire non trouvé');
      }

      const commentData = commentSnap.data();
      
      // Vérifier les permissions
      if (commentData.userId !== userId) {
        throw new Error('Permission refusée');
      }

      await deleteDoc(commentRef);

      // Logger l'activité
      await this.logActivity({
        type: 'comment_deleted',
        userId,
        entityType: commentData.entityType,
        entityId: commentData.entityId,
        details: { commentId }
      });

      console.log('✅ Commentaire supprimé:', commentId);
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
        orderBy('createdAt', 'asc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const comments = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        
        // Enrichir avec les données utilisateur
        const userData = await this.getUserData(data.userId);
        
        comments.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          user: userData
        });
      }

      return comments;

    } catch (error) {
      console.error('❌ Erreur récupération commentaires:', error);
      return [];
    }
  }

  /**
   * 👂 ÉCOUTER LES COMMENTAIRES EN TEMPS RÉEL
   */
  subscribeToComments(entityType, entityId, callback) {
    try {
      const q = query(
        collection(db, 'comments'),
        where('entityType', '==', entityType),
        where('entityId', '==', entityId),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const comments = [];

        for (const change of snapshot.docChanges()) {
          if (change.type === 'added' || change.type === 'modified') {
            const data = change.doc.data();
            const userData = await this.getUserData(data.userId);
            
            comments.push({
              id: change.doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
              user: userData,
              changeType: change.type
            });
          }
        }

        callback(comments);
      });

      // Stocker le listener pour nettoyage
      const listenerId = `comments_${entityType}_${entityId}`;
      this.listeners.set(listenerId, unsubscribe);

      return unsubscribe;

    } catch (error) {
      console.error('❌ Erreur abonnement commentaires:', error);
      return () => {};
    }
  }

  // ========================
  // 🏷️ SYSTÈME DE MENTIONS
  // ========================

  /**
   * 📧 CRÉER LES NOTIFICATIONS DE MENTION
   */
  async createMentionNotifications(commentId, mentions, fromUserId, entityType, entityId) {
    try {
      const batch = writeBatch(db);
      const notificationsRef = collection(db, 'notifications');

      for (const mentionedUserId of mentions) {
        if (mentionedUserId === fromUserId) continue; // Pas de notification pour soi-même

        const notification = {
          type: 'mention',
          fromUserId,
          toUserId: mentionedUserId,
          entityType,
          entityId,
          commentId,
          message: `Vous avez été mentionné dans un commentaire`,
          isRead: false,
          createdAt: serverTimestamp()
        };

        const notificationRef = doc(notificationsRef);
        batch.set(notificationRef, notification);
      }

      await batch.commit();
      console.log(`✅ ${mentions.length} notifications de mention créées`);

    } catch (error) {
      console.error('❌ Erreur notifications mention:', error);
    }
  }

  /**
   * 🔍 RECHERCHER DES UTILISATEURS POUR MENTIONS
   */
  async searchUsersForMention(searchTerm, projectId = null) {
    try {
      let q = collection(db, 'users');

      if (projectId) {
        // Filtrer par membres du projet si spécifié
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (projectDoc.exists()) {
          const members = projectDoc.data().members || [];
          q = query(q, where('uid', 'in', members));
        }
      }

      const querySnapshot = await getDocs(q);
      const users = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const displayName = data.displayName || data.email || 'Utilisateur';
        
        if (displayName.toLowerCase().includes(searchTerm.toLowerCase())) {
          users.push({
            id: data.uid,
            name: displayName,
            email: data.email,
            avatar: data.photoURL
          });
        }
      });

      return users.slice(0, 10); // Limiter à 10 résultats

    } catch (error) {
      console.error('❌ Erreur recherche utilisateurs:', error);
      return [];
    }
  }

  // ========================
  // 🔔 SYSTÈME DE NOTIFICATIONS
  // ========================

  /**
   * 📬 RÉCUPÉRER LES NOTIFICATIONS D'UN UTILISATEUR
   */
  async getUserNotifications(userId, limitCount = 20) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('toUserId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const notifications = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        
        // Enrichir avec les données de l'expéditeur
        const fromUserData = await this.getUserData(data.fromUserId);
        
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          fromUser: fromUserData
        });
      }

      return notifications;

    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      return [];
    }
  }

  /**
   * 👁️ MARQUER UNE NOTIFICATION COMME LUE
   */
  async markNotificationAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: serverTimestamp()
      });

      console.log('✅ Notification marquée comme lue:', notificationId);

    } catch (error) {
      console.error('❌ Erreur marquer notification:', error);
    }
  }

  /**
   * 👀 MARQUER TOUTES LES NOTIFICATIONS COMME LUES
   */
  async markAllNotificationsAsRead(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('toUserId', '==', userId),
        where('isRead', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);

      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          isRead: true,
          readAt: serverTimestamp()
        });
      });

      await batch.commit();
      console.log(`✅ ${querySnapshot.size} notifications marquées comme lues`);

    } catch (error) {
      console.error('❌ Erreur marquer toutes notifications:', error);
    }
  }

  // ========================
  // 📊 ACTIVITÉ ET HISTORIQUE
  // ========================

  /**
   * 📝 LOGGER UNE ACTIVITÉ
   */
  async logActivity(activityData) {
    try {
      const activity = {
        ...activityData,
        timestamp: serverTimestamp(),
        id: doc(collection(db, 'activities')).id
      };

      await addDoc(collection(db, 'activities'), activity);

    } catch (error) {
      console.error('❌ Erreur log activité:', error);
    }
  }

  /**
   * 📈 RÉCUPÉRER L'ACTIVITÉ D'UNE ENTITÉ
   */
  async getEntityActivity(entityType, entityId, limitCount = 20) {
    try {
      const q = query(
        collection(db, 'activities'),
        where('entityType', '==', entityType),
        where('entityId', '==', entityId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const activities = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const userData = await this.getUserData(data.userId);
        
        activities.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate(),
          user: userData
        });
      }

      return activities;

    } catch (error) {
      console.error('❌ Erreur récupération activité:', error);
      return [];
    }
  }

  // ========================
  // 🛠️ MÉTHODES UTILITAIRES
  // ========================

  /**
   * 👤 RÉCUPÉRER LES DONNÉES D'UN UTILISATEUR
   */
  async getUserData(userId) {
    try {
      // Cache simple pour éviter les requêtes répétées
      if (this.userCache && this.userCache[userId]) {
        return this.userCache[userId];
      }

      const q = query(
        collection(db, 'users'),
        where('uid', '==', userId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        
        // Mettre en cache
        if (!this.userCache) this.userCache = {};
        this.userCache[userId] = {
          id: userId,
          name: userData.displayName || userData.email || 'Utilisateur',
          email: userData.email,
          avatar: userData.photoURL,
          level: userData.level || 1
        };

        return this.userCache[userId];
      }

      // Fallback si utilisateur non trouvé
      return {
        id: userId,
        name: 'Utilisateur inconnu',
        email: '',
        avatar: null,
        level: 1
      };

    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      return {
        id: userId,
        name: 'Utilisateur',
        email: '',
        avatar: null,
        level: 1
      };
    }
  }

  /**
   * 🧹 NETTOYER LES LISTENERS
   */
  cleanup() {
    this.listeners.forEach((unsubscribe, listenerId) => {
      unsubscribe();
      console.log('🧹 Listener nettoyé:', listenerId);
    });
    
    this.listeners.clear();
    this.userCache = {};
  }

  /**
   * 📊 STATISTIQUES DE COLLABORATION
   */
  async getCollaborationStats(entityType, entityId) {
    try {
      const [comments, activities] = await Promise.all([
        this.getComments(entityType, entityId),
        this.getEntityActivity(entityType, entityId)
      ]);

      const uniqueContributors = new Set();
      comments.forEach(comment => uniqueContributors.add(comment.userId));
      activities.forEach(activity => uniqueContributors.add(activity.userId));

      return {
        totalComments: comments.length,
        totalActivities: activities.length,
        uniqueContributors: uniqueContributors.size,
        lastActivity: activities[0]?.timestamp || null,
        mostActiveContributor: this.getMostActiveContributor(comments, activities)
      };

    } catch (error) {
      console.error('❌ Erreur stats collaboration:', error);
      return {
        totalComments: 0,
        totalActivities: 0,
        uniqueContributors: 0,
        lastActivity: null,
        mostActiveContributor: null
      };
    }
  }

  /**
   * 🏆 OBTENIR LE CONTRIBUTEUR LE PLUS ACTIF
   */
  getMostActiveContributor(comments, activities) {
    const contributorCount = {};

    [...comments, ...activities].forEach(item => {
      contributorCount[item.userId] = (contributorCount[item.userId] || 0) + 1;
    });

    const mostActive = Object.entries(contributorCount)
      .sort(([,a], [,b]) => b - a)[0];

    return mostActive ? { userId: mostActive[0], count: mostActive[1] } : null;
  }
}

// Instance singleton
const collaborationService = new CollaborationService();
export default collaborationService;
