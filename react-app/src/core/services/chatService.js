// ==========================================
// react-app/src/core/services/chatService.js
// SERVICE CHAT/MESSAGERIE - SYNERGIA v4.0
// Module: Chat en temps reel et messagerie interne
// ==========================================

import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  getDoc,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';

// ==========================================
// CONFIGURATION
// ==========================================
export const CHAT_TYPES = {
  DIRECT: 'direct',           // 1-to-1
  GROUP: 'group',             // Groupe
  TEAM: 'team',               // Equipe entiere
  PROJECT: 'project',         // Lie a un projet
  QUEST: 'quest'              // Discussion de quete
};

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',           // Messages systeme
  ACHIEVEMENT: 'achievement', // Partage de succes
  REACTION: 'reaction'        // Reaction a un message
};

// ==========================================
// SERVICE PRINCIPAL
// ==========================================
class ChatService {
  constructor() {
    this.subscriptions = new Map();
  }

  // ==========================================
  // GESTION DES CONVERSATIONS
  // ==========================================

  /**
   * Creer une nouvelle conversation
   */
  async createConversation(conversation) {
    try {
      const conversationData = {
        type: conversation.type || CHAT_TYPES.DIRECT,
        name: conversation.name || null,
        description: conversation.description || null,
        avatar: conversation.avatar || null,
        participants: conversation.participants || [],
        admins: conversation.admins || [conversation.createdBy],
        createdBy: conversation.createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
        lastMessageAt: null,
        metadata: {
          projectId: conversation.projectId || null,
          questId: conversation.questId || null,
          teamId: conversation.teamId || null,
          ...conversation.metadata
        },
        settings: {
          muted: [],
          pinned: [],
          ...conversation.settings
        }
      };

      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      return { id: docRef.id, ...conversationData };
    } catch (error) {
      console.error('Erreur creation conversation:', error);
      throw error;
    }
  }

  /**
   * Obtenir ou creer une conversation directe entre deux utilisateurs
   */
  async getOrCreateDirectConversation(userId1, userId2) {
    try {
      // Chercher une conversation existante
      const participants = [userId1, userId2].sort();
      const q = query(
        collection(db, 'conversations'),
        where('type', '==', CHAT_TYPES.DIRECT),
        where('participants', '==', participants)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }

      // Creer une nouvelle conversation
      return this.createConversation({
        type: CHAT_TYPES.DIRECT,
        participants,
        createdBy: userId1
      });
    } catch (error) {
      console.error('Erreur get/create direct conversation:', error);
      throw error;
    }
  }

  /**
   * Obtenir les conversations d'un utilisateur
   */
  async getUserConversations(userId, options = {}) {
    try {
      const { type = null, limit: maxLimit = 50 } = options;

      let q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc'),
        limit(maxLimit)
      );

      const snapshot = await getDocs(q);
      let conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (type) {
        conversations = conversations.filter(c => c.type === type);
      }

      return conversations;
    } catch (error) {
      console.error('Erreur recuperation conversations:', error);
      return [];
    }
  }

  /**
   * S'abonner aux conversations d'un utilisateur
   */
  subscribeToConversations(userId, callback) {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageAt: doc.data().lastMessageAt?.toDate() || null
      }));
      callback(conversations);
    });

    this.subscriptions.set(`conversations_${userId}`, unsubscribe);
    return unsubscribe;
  }

  /**
   * Mettre a jour une conversation
   */
  async updateConversation(conversationId, updates) {
    try {
      const ref = doc(db, 'conversations', conversationId);
      await updateDoc(ref, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur mise a jour conversation:', error);
      return false;
    }
  }

  /**
   * Ajouter des participants
   */
  async addParticipants(conversationId, userIds) {
    try {
      const ref = doc(db, 'conversations', conversationId);
      await updateDoc(ref, {
        participants: arrayUnion(...userIds),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur ajout participants:', error);
      return false;
    }
  }

  /**
   * Retirer un participant
   */
  async removeParticipant(conversationId, userId) {
    try {
      const ref = doc(db, 'conversations', conversationId);
      await updateDoc(ref, {
        participants: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur retrait participant:', error);
      return false;
    }
  }

  // ==========================================
  // GESTION DES MESSAGES
  // ==========================================

  /**
   * Envoyer un message
   */
  async sendMessage(conversationId, message) {
    try {
      const messageData = {
        conversationId,
        type: message.type || MESSAGE_TYPES.TEXT,
        content: message.content,
        senderId: message.senderId,
        senderName: message.senderName || 'Utilisateur',
        senderAvatar: message.senderAvatar || null,
        replyTo: message.replyTo || null,
        mentions: message.mentions || [],
        attachments: message.attachments || [],
        reactions: {},
        readBy: [message.senderId],
        createdAt: serverTimestamp(),
        editedAt: null,
        deleted: false
      };

      const docRef = await addDoc(
        collection(db, 'conversations', conversationId, 'messages'),
        messageData
      );

      // Mettre a jour la conversation avec le dernier message
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: {
          content: message.type === MESSAGE_TYPES.TEXT
            ? message.content.substring(0, 100)
            : `[${message.type}]`,
          senderId: message.senderId,
          senderName: message.senderName
        },
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { id: docRef.id, ...messageData };
    } catch (error) {
      console.error('Erreur envoi message:', error);
      throw error;
    }
  }

  /**
   * S'abonner aux messages d'une conversation
   */
  subscribeToMessages(conversationId, callback, options = {}) {
    const { limit: maxLimit = 100 } = options;

    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(maxLimit)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })).reverse(); // Inverser pour l'ordre chronologique

      callback(messages);
    });

    this.subscriptions.set(`messages_${conversationId}`, unsubscribe);
    return unsubscribe;
  }

  /**
   * Modifier un message
   */
  async editMessage(conversationId, messageId, newContent) {
    try {
      const ref = doc(db, 'conversations', conversationId, 'messages', messageId);
      await updateDoc(ref, {
        content: newContent,
        editedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur edition message:', error);
      return false;
    }
  }

  /**
   * Supprimer un message (soft delete)
   */
  async deleteMessage(conversationId, messageId) {
    try {
      const ref = doc(db, 'conversations', conversationId, 'messages', messageId);
      await updateDoc(ref, {
        deleted: true,
        content: '[Message supprime]'
      });
      return true;
    } catch (error) {
      console.error('Erreur suppression message:', error);
      return false;
    }
  }

  /**
   * Ajouter une reaction a un message
   */
  async addReaction(conversationId, messageId, userId, emoji) {
    try {
      const ref = doc(db, 'conversations', conversationId, 'messages', messageId);
      const messageDoc = await getDoc(ref);

      if (!messageDoc.exists()) return false;

      const reactions = messageDoc.data().reactions || {};
      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }
      if (!reactions[emoji].includes(userId)) {
        reactions[emoji].push(userId);
      }

      await updateDoc(ref, { reactions });
      return true;
    } catch (error) {
      console.error('Erreur ajout reaction:', error);
      return false;
    }
  }

  /**
   * Retirer une reaction
   */
  async removeReaction(conversationId, messageId, userId, emoji) {
    try {
      const ref = doc(db, 'conversations', conversationId, 'messages', messageId);
      const messageDoc = await getDoc(ref);

      if (!messageDoc.exists()) return false;

      const reactions = messageDoc.data().reactions || {};
      if (reactions[emoji]) {
        reactions[emoji] = reactions[emoji].filter(id => id !== userId);
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      }

      await updateDoc(ref, { reactions });
      return true;
    } catch (error) {
      console.error('Erreur retrait reaction:', error);
      return false;
    }
  }

  /**
   * Marquer comme lu
   */
  async markAsRead(conversationId, messageId, userId) {
    try {
      const ref = doc(db, 'conversations', conversationId, 'messages', messageId);
      await updateDoc(ref, {
        readBy: arrayUnion(userId)
      });
      return true;
    } catch (error) {
      console.error('Erreur marquage lu:', error);
      return false;
    }
  }

  /**
   * Obtenir le nombre de messages non lus
   */
  async getUnreadCount(conversationId, userId) {
    try {
      const q = query(
        collection(db, 'conversations', conversationId, 'messages'),
        where('readBy', 'array-contains', userId)
      );
      // Note: Firestore ne supporte pas directement "not array-contains"
      // Il faudrait une approche differente pour une implementation production
      return 0;
    } catch (error) {
      console.error('Erreur comptage non lus:', error);
      return 0;
    }
  }

  // ==========================================
  // RECHERCHE
  // ==========================================

  /**
   * Rechercher dans les messages
   */
  async searchMessages(userId, searchTerm, options = {}) {
    try {
      const { conversationId = null, limit: maxLimit = 50 } = options;

      // Obtenir les conversations de l'utilisateur
      let conversations = await this.getUserConversations(userId);
      if (conversationId) {
        conversations = conversations.filter(c => c.id === conversationId);
      }

      const results = [];
      const searchLower = searchTerm.toLowerCase();

      for (const conv of conversations.slice(0, 10)) {
        const messagesQuery = query(
          collection(db, 'conversations', conv.id, 'messages'),
          orderBy('createdAt', 'desc'),
          limit(100)
        );

        const snapshot = await getDocs(messagesQuery);
        const matches = snapshot.docs
          .filter(doc => {
            const content = doc.data().content || '';
            return content.toLowerCase().includes(searchLower);
          })
          .map(doc => ({
            id: doc.id,
            conversationId: conv.id,
            conversationName: conv.name,
            ...doc.data()
          }));

        results.push(...matches);
      }

      return results.slice(0, maxLimit);
    } catch (error) {
      console.error('Erreur recherche messages:', error);
      return [];
    }
  }

  // ==========================================
  // UTILISATEURS EN LIGNE
  // ==========================================

  /**
   * Mettre a jour le statut en ligne
   */
  async updateOnlineStatus(userId, isOnline) {
    try {
      const ref = doc(db, 'userPresence', userId);
      await updateDoc(ref, {
        isOnline,
        lastSeen: serverTimestamp()
      }).catch(async () => {
        // Si le doc n'existe pas, le creer
        await addDoc(collection(db, 'userPresence'), {
          id: userId,
          isOnline,
          lastSeen: serverTimestamp()
        });
      });
      return true;
    } catch (error) {
      console.error('Erreur mise a jour statut:', error);
      return false;
    }
  }

  /**
   * S'abonner aux statuts en ligne
   */
  subscribeToOnlineStatus(userIds, callback) {
    const q = query(
      collection(db, 'userPresence'),
      where('id', 'in', userIds.slice(0, 10)) // Firestore limite a 10
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const statuses = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        statuses[data.id] = {
          isOnline: data.isOnline,
          lastSeen: data.lastSeen?.toDate() || null
        };
      });
      callback(statuses);
    });

    return unsubscribe;
  }

  // ==========================================
  // NETTOYAGE
  // ==========================================

  /**
   * Se desabonner de toutes les ecoutes
   */
  unsubscribeAll() {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  }

  /**
   * Se desabonner d'une ecoute specifique
   */
  unsubscribe(key) {
    const unsub = this.subscriptions.get(key);
    if (unsub) {
      unsub();
      this.subscriptions.delete(key);
    }
  }
}

// Export singleton
export const chatService = new ChatService();
export default chatService;
