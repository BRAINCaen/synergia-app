// ==========================================
// react-app/src/hooks/useChat.js
// HOOK CHAT - SYNERGIA v4.0
// Module: Gestion du chat React
// ==========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../shared/stores/authStore';
import chatService, { CHAT_TYPES, MESSAGE_TYPES } from '../core/services/chatService';

// ==========================================
// HOOK CONVERSATIONS
// ==========================================
export function useConversations(options = {}) {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    unsubscribeRef.current = chatService.subscribeToConversations(
      user.uid,
      (newConversations) => {
        setConversations(newConversations);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user?.uid]);

  // Creer une conversation
  const createConversation = useCallback(async (data) => {
    if (!user?.uid) return null;
    return chatService.createConversation({
      ...data,
      createdBy: user.uid,
      participants: [...(data.participants || []), user.uid]
    });
  }, [user?.uid]);

  // Demarrer une conversation directe
  const startDirectChat = useCallback(async (otherUserId) => {
    if (!user?.uid) return null;
    return chatService.getOrCreateDirectConversation(user.uid, otherUserId);
  }, [user?.uid]);

  // Filtrer par type
  const getByType = useCallback((type) => {
    return conversations.filter(c => c.type === type);
  }, [conversations]);

  // Conversations non lues
  const unreadConversations = conversations.filter(c => {
    // Logique simplifiee - a ameliorer avec un vrai comptage
    return c.lastMessage && c.lastMessage.senderId !== user?.uid;
  });

  return {
    conversations,
    loading,
    createConversation,
    startDirectChat,
    getByType,
    unreadConversations,
    directChats: getByType(CHAT_TYPES.DIRECT),
    groupChats: getByType(CHAT_TYPES.GROUP),
    teamChats: getByType(CHAT_TYPES.TEAM)
  };
}

// ==========================================
// HOOK CHAT (CONVERSATION ACTIVE)
// ==========================================
export function useChat(conversationId) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState([]);
  const unsubscribeMessagesRef = useRef(null);

  // S'abonner aux messages
  useEffect(() => {
    if (!conversationId || !user?.uid) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    unsubscribeMessagesRef.current = chatService.subscribeToMessages(
      conversationId,
      (newMessages) => {
        setMessages(newMessages);
        setLoading(false);

        // Marquer les messages comme lus
        newMessages.forEach(msg => {
          if (!msg.readBy?.includes(user.uid)) {
            chatService.markAsRead(conversationId, msg.id, user.uid);
          }
        });
      }
    );

    return () => {
      if (unsubscribeMessagesRef.current) {
        unsubscribeMessagesRef.current();
      }
    };
  }, [conversationId, user?.uid]);

  // Envoyer un message
  const sendMessage = useCallback(async (content, type = MESSAGE_TYPES.TEXT) => {
    if (!conversationId || !user?.uid || !content.trim()) return null;

    setSending(true);
    try {
      const message = await chatService.sendMessage(conversationId, {
        content: content.trim(),
        type,
        senderId: user.uid,
        senderName: user.displayName || 'Utilisateur',
        senderAvatar: user.photoURL
      });
      return message;
    } catch (error) {
      console.error('Erreur envoi message:', error);
      return null;
    } finally {
      setSending(false);
    }
  }, [conversationId, user]);

  // Repondre a un message
  const replyToMessage = useCallback(async (messageId, content) => {
    if (!conversationId || !user?.uid || !content.trim()) return null;

    setSending(true);
    try {
      const message = await chatService.sendMessage(conversationId, {
        content: content.trim(),
        type: MESSAGE_TYPES.TEXT,
        senderId: user.uid,
        senderName: user.displayName || 'Utilisateur',
        senderAvatar: user.photoURL,
        replyTo: messageId
      });
      return message;
    } catch (error) {
      console.error('Erreur reponse message:', error);
      return null;
    } finally {
      setSending(false);
    }
  }, [conversationId, user]);

  // Editer un message
  const editMessage = useCallback(async (messageId, newContent) => {
    if (!conversationId) return false;
    return chatService.editMessage(conversationId, messageId, newContent);
  }, [conversationId]);

  // Supprimer un message
  const deleteMessage = useCallback(async (messageId) => {
    if (!conversationId) return false;
    return chatService.deleteMessage(conversationId, messageId);
  }, [conversationId]);

  // Ajouter une reaction
  const addReaction = useCallback(async (messageId, emoji) => {
    if (!conversationId || !user?.uid) return false;
    return chatService.addReaction(conversationId, messageId, user.uid, emoji);
  }, [conversationId, user?.uid]);

  // Retirer une reaction
  const removeReaction = useCallback(async (messageId, emoji) => {
    if (!conversationId || !user?.uid) return false;
    return chatService.removeReaction(conversationId, messageId, user.uid, emoji);
  }, [conversationId, user?.uid]);

  return {
    messages,
    conversation,
    loading,
    sending,
    typing,
    sendMessage,
    replyToMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    MESSAGE_TYPES
  };
}

// ==========================================
// HOOK CHAT WIDGET (FLOTTANT)
// ==========================================
export function useChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [minimized, setMinimized] = useState(false);

  const open = useCallback((conversationId = null) => {
    setIsOpen(true);
    setMinimized(false);
    if (conversationId) {
      setActiveConversationId(conversationId);
    }
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveConversationId(null);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const minimize = useCallback(() => {
    setMinimized(true);
  }, []);

  const maximize = useCallback(() => {
    setMinimized(false);
  }, []);

  const selectConversation = useCallback((id) => {
    setActiveConversationId(id);
    setMinimized(false);
  }, []);

  return {
    isOpen,
    activeConversationId,
    minimized,
    open,
    close,
    toggle,
    minimize,
    maximize,
    selectConversation
  };
}

// ==========================================
// HOOK PRESENCE EN LIGNE
// ==========================================
export function useOnlinePresence(userIds = []) {
  const { user } = useAuthStore();
  const [statuses, setStatuses] = useState({});

  // Mettre a jour son propre statut
  useEffect(() => {
    if (!user?.uid) return;

    // Marquer comme en ligne
    chatService.updateOnlineStatus(user.uid, true);

    // Marquer comme hors ligne quand on quitte
    const handleBeforeUnload = () => {
      chatService.updateOnlineStatus(user.uid, false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      chatService.updateOnlineStatus(user.uid, false);
    };
  }, [user?.uid]);

  // S'abonner aux statuts des autres utilisateurs
  useEffect(() => {
    if (userIds.length === 0) return;

    const unsubscribe = chatService.subscribeToOnlineStatus(userIds, setStatuses);
    return () => unsubscribe();
  }, [userIds.join(',')]);

  const isOnline = useCallback((userId) => {
    return statuses[userId]?.isOnline || false;
  }, [statuses]);

  const getLastSeen = useCallback((userId) => {
    return statuses[userId]?.lastSeen || null;
  }, [statuses]);

  return {
    statuses,
    isOnline,
    getLastSeen
  };
}

export default useChat;
