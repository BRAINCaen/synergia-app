// 📨 SERVICE DE MESSAGERIE FIREBASE COMPLET
// react-app/src/core/services/messagingService.js

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  writeBatch,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';

export class MessagingService {
  
  /**
   * 📨 ENVOYER UN MESSAGE
   */
  async sendMessage(fromUserId, toUserId, subject, content, metadata = {}) {
    try {
      console.log('📨 Envoi message:', { fromUserId, toUserId, subject });
      
      const messageData = {
        fromUserId,
        toUserId,
        subject: subject.trim(),
        content: content.trim(),
        timestamp: serverTimestamp(),
        read: false,
        starred: false,
        archived: false,
        conversationId: this.generateConversationId(fromUserId, toUserId),
        metadata: {
          type: 'direct_message',
          priority: 'normal',
          ...metadata
        }
      };
      
      const docRef = await addDoc(collection(db, 'messages'), messageData);
      
      console.log('✅ Message envoyé avec ID:', docRef.id);
      return { success: true, messageId: docRef.id };
      
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📬 RÉCUPÉRER LES MESSAGES REÇUS
   */
  async getReceivedMessages(userId, options = {}) {
    try {
      console.log('📬 Récupération messages pour:', userId);
      
      const {
        unreadOnly = false,
        limitCount = 50,
        includeArchived = false
      } = options;
      
      let messagesQuery = query(
        collection(db, 'messages'),
        where('toUserId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(messagesQuery);
      let messages = [];
      
      snapshot.forEach(doc => {
        const messageData = { id: doc.id, ...doc.data() };
        
        // Filtrage selon les options
        if (unreadOnly && messageData.read) return;
        if (!includeArchived && messageData.archived) return;
        
        messages.push(messageData);
      });
      
      console.log('✅ Messages récupérés:', messages.length);
      return messages;
      
    } catch (error) {
      console.error('❌ Erreur récupération messages:', error);
      return [];
    }
  }

  /**
   * 📨 RÉCUPÉRER LES MESSAGES ENVOYÉS
   */
  async getSentMessages(userId, limitCount = 50) {
    try {
      console.log('📨 Récupération messages envoyés pour:', userId);
      
      const messagesQuery = query(
        collection(db, 'messages'),
        where('fromUserId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(messagesQuery);
      const messages = [];
      
      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('✅ Messages envoyés récupérés:', messages.length);
      return messages;
      
    } catch (error) {
      console.error('❌ Erreur récupération messages envoyés:', error);
      return [];
    }
  }

  /**
   * 💬 RÉCUPÉRER UNE CONVERSATION
   */
  async getConversation(userId1, userId2, limitCount = 100) {
    try {
      const conversationId = this.generateConversationId(userId1, userId2);
      console.log('💬 Récupération conversation:', conversationId);
      
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(messagesQuery);
      const messages = [];
      
      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('✅ Conversation récupérée:', messages.length, 'messages');
      return messages;
      
    } catch (error) {
      console.error('❌ Erreur récupération conversation:', error);
      return [];
    }
  }

  /**
   * ✅ MARQUER UN MESSAGE COMME LU
   */
  async markAsRead(messageId) {
    try {
      console.log('✅ Marquage message lu:', messageId);
      
      await updateDoc(doc(db, 'messages', messageId), {
        read: true,
        readAt: serverTimestamp()
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur marquage lu:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ⭐ METTRE UN MESSAGE EN FAVORIS
   */
  async toggleStarred(messageId, starred = true) {
    try {
      console.log('⭐ Toggle favoris message:', messageId, starred);
      
      await updateDoc(doc(db, 'messages', messageId), {
        starred,
        starredAt: starred ? serverTimestamp() : null
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur toggle favoris:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📁 ARCHIVER UN MESSAGE
   */
  async toggleArchived(messageId, archived = true) {
    try {
      console.log('📁 Toggle archivage message:', messageId, archived);
      
      await updateDoc(doc(db, 'messages', messageId), {
        archived,
        archivedAt: archived ? serverTimestamp() : null
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur toggle archivage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ SUPPRIMER DES MESSAGES (BATCH)
   */
  async deleteMessages(messageIds) {
    try {
      console.log('🗑️ Suppression messages:', messageIds.length);
      
      const batch = writeBatch(db);
      
      messageIds.forEach(messageId => {
        const messageRef = doc(db, 'messages', messageId);
        batch.delete(messageRef);
      });
      
      await batch.commit();
      
      console.log('✅ Messages supprimés avec succès');
      return { success: true, deletedCount: messageIds.length };
      
    } catch (error) {
      console.error('❌ Erreur suppression messages:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 OBTENIR STATISTIQUES MESSAGERIE
   */
  async getMessagingStats(userId) {
    try {
      console.log('📊 Statistiques messagerie pour:', userId);
      
      // Messages reçus
      const receivedQuery = query(
        collection(db, 'messages'),
        where('toUserId', '==', userId)
      );
      const receivedSnapshot = await getDocs(receivedQuery);
      
      // Messages envoyés
      const sentQuery = query(
        collection(db, 'messages'),
        where('fromUserId', '==', userId)
      );
      const sentSnapshot = await getDocs(sentQuery);
      
      let stats = {
        totalReceived: 0,
        totalSent: 0,
        unreadCount: 0,
        starredCount: 0,
        archivedCount: 0
      };
      
      // Analyse messages reçus
      receivedSnapshot.forEach(doc => {
        const message = doc.data();
        stats.totalReceived++;
        if (!message.read) stats.unreadCount++;
        if (message.starred) stats.starredCount++;
        if (message.archived) stats.archivedCount++;
      });
      
      // Compte messages envoyés
      stats.totalSent = sentSnapshot.size;
      
      console.log('✅ Statistiques calculées:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur calcul statistiques:', error);
      return {
        totalReceived: 0,
        totalSent: 0,
        unreadCount: 0,
        starredCount: 0,
        archivedCount: 0
      };
    }
  }

  /**
   * 🔔 ÉCOUTER LES NOUVEAUX MESSAGES EN TEMPS RÉEL
   */
  subscribeToNewMessages(userId, callback) {
    console.log('🔔 Abonnement nouveaux messages pour:', userId);
    
    const messagesQuery = query(
      collection(db, 'messages'),
      where('toUserId', '==', userId),
      where('read', '==', false),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = [];
      
      snapshot.forEach(doc => {
        newMessages.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('🔔 Nouveaux messages détectés:', newMessages.length);
      callback(newMessages);
    });
    
    return unsubscribe;
  }

  /**
   * 🆔 GÉNÉRER ID DE CONVERSATION
   */
  generateConversationId(userId1, userId2) {
    // Trier les IDs pour avoir un ID cohérent
    const sortedIds = [userId1, userId2].sort();
    return `conv_${sortedIds[0]}_${sortedIds[1]}`;
  }

  /**
   * 🔍 RECHERCHER DANS LES MESSAGES
   */
  async searchMessages(userId, searchTerm, options = {}) {
    try {
      console.log('🔍 Recherche messages:', searchTerm);
      
      const {
        searchInSent = true,
        searchInReceived = true,
        limitCount = 50
      } = options;
      
      const results = [];
      
      // Recherche dans les messages reçus
      if (searchInReceived) {
        const receivedQuery = query(
          collection(db, 'messages'),
          where('toUserId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
        
        const receivedSnapshot = await getDocs(receivedQuery);
        
        receivedSnapshot.forEach(doc => {
          const message = { id: doc.id, ...doc.data() };
          if (
            message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            message.content.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            results.push({ ...message, type: 'received' });
          }
        });
      }
      
      // Recherche dans les messages envoyés
      if (searchInSent) {
        const sentQuery = query(
          collection(db, 'messages'),
          where('fromUserId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
        
        const sentSnapshot = await getDocs(sentQuery);
        
        sentSnapshot.forEach(doc => {
          const message = { id: doc.id, ...doc.data() };
          if (
            message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            message.content.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            results.push({ ...message, type: 'sent' });
          }
        });
      }
      
      // Trier par timestamp
      results.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      
      console.log('✅ Résultats recherche:', results.length);
      return results.slice(0, limitCount);
      
    } catch (error) {
      console.error('❌ Erreur recherche messages:', error);
      return [];
    }
  }
}

// Export instance unique
export const messagingService = new MessagingService();
