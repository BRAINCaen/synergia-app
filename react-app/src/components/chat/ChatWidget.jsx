// ==========================================
// react-app/src/components/chat/ChatWidget.jsx
// WIDGET CHAT FLOTTANT - SYNERGIA v4.0
// Module: Chat en temps reel avec UI moderne
// ==========================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConversations, useChat, useChatWidget, useOnlinePresence } from '../../hooks/useChat';
import { CHAT_TYPES } from '../../core/services/chatService';
import { useAuthStore } from '../../shared/stores/authStore';

// ==========================================
// COMPOSANT MESSAGE
// ==========================================
function ChatMessage({ message, isOwn, onReaction }) {
  const [showReactions, setShowReactions] = useState(false);
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 group`}>
      <div className={`max-w-[75%] ${isOwn ? 'order-2' : ''}`}>
        {/* Nom expediteur (si pas le notre) */}
        {!isOwn && (
          <p className="text-xs text-white/50 mb-1 ml-2">{message.senderName}</p>
        )}

        {/* Bulle de message */}
        <div
          className={`relative px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-sm'
              : 'bg-white/10 text-white rounded-bl-sm'
          } ${message.deleted ? 'opacity-50 italic' : ''}`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

          {/* Heure et statut edite */}
          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
            {message.editedAt && (
              <span className="text-[10px] text-white/40">modifie</span>
            )}
            <span className="text-[10px] text-white/40">{formatTime(message.createdAt)}</span>
          </div>

          {/* Reactions existantes */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(message.reactions).map(([emoji, users]) => (
                <span
                  key={emoji}
                  className="px-1.5 py-0.5 bg-black/20 rounded-full text-xs"
                >
                  {emoji} {users.length}
                </span>
              ))}
            </div>
          )}

          {/* Bouton reactions */}
          <button
            onClick={() => setShowReactions(!showReactions)}
            className={`absolute -bottom-2 ${isOwn ? 'left-2' : 'right-2'}
                       opacity-0 group-hover:opacity-100 transition-opacity
                       w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center
                       text-xs hover:bg-slate-600`}
          >
            😊
          </button>

          {/* Picker reactions */}
          {showReactions && (
            <div className={`absolute -bottom-10 ${isOwn ? 'left-0' : 'right-0'}
                           bg-slate-800 rounded-full px-2 py-1 flex gap-1 shadow-xl z-10`}>
              {reactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReaction(message.id, emoji);
                    setShowReactions(false);
                  }}
                  className="w-6 h-6 hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPOSANT LISTE CONVERSATIONS
// ==========================================
function ConversationList({ conversations, onSelect, activeId }) {
  const { user } = useAuthStore();

  const getConversationName = (conv) => {
    if (conv.name) return conv.name;
    if (conv.type === CHAT_TYPES.DIRECT) {
      // Trouver l'autre participant
      const otherParticipant = conv.participants?.find(p => p !== user?.uid);
      return otherParticipant ? `Utilisateur` : 'Chat';
    }
    return 'Conversation';
  };

  const getConversationIcon = (conv) => {
    switch (conv.type) {
      case CHAT_TYPES.DIRECT: return '💬';
      case CHAT_TYPES.GROUP: return '👥';
      case CHAT_TYPES.TEAM: return '🏢';
      case CHAT_TYPES.PROJECT: return '📁';
      case CHAT_TYPES.QUEST: return '⚔️';
      default: return '💬';
    }
  };

  const formatLastMessage = (conv) => {
    if (!conv.lastMessage) return 'Aucun message';
    const content = conv.lastMessage.content || '';
    return content.length > 30 ? content.substring(0, 30) + '...' : content;
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const msgDate = new Date(date);

    if (now.toDateString() === msgDate.toDateString()) {
      return msgDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return msgDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <span className="text-4xl block mb-3">💬</span>
        <p className="text-white/60 text-sm">Aucune conversation</p>
        <p className="text-white/40 text-xs mt-1">Commencez a discuter !</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={`w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left
                     ${activeId === conv.id ? 'bg-white/10' : ''}`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500
                        flex items-center justify-center text-lg flex-shrink-0">
            {conv.avatar || getConversationIcon(conv)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white truncate">
                {getConversationName(conv)}
              </h4>
              <span className="text-[10px] text-white/40 flex-shrink-0">
                {formatTime(conv.lastMessageAt)}
              </span>
            </div>
            <p className="text-xs text-white/50 truncate mt-0.5">
              {conv.lastMessage?.senderName && conv.lastMessage.senderId !== user?.uid
                ? `${conv.lastMessage.senderName}: `
                : ''}
              {formatLastMessage(conv)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ==========================================
// COMPOSANT INPUT MESSAGE
// ==========================================
function MessageInput({ onSend, sending, placeholder = 'Votre message...' }) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !sending) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-white/10">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl
                     text-white placeholder-white/40 resize-none
                     focus:outline-none focus:border-indigo-500 text-sm"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className={`p-2.5 rounded-xl transition-all ${
            message.trim() && !sending
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
              : 'bg-white/5 text-white/30'
          }`}
        >
          {sending ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}

// ==========================================
// COMPOSANT CHAT ACTIF
// ==========================================
function ActiveChat({ conversationId, onBack }) {
  const { messages, loading, sending, sendMessage, addReaction } = useChat(conversationId);
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);

  // Scroll auto vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">Conversation</h3>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <span className="text-4xl block mb-2">👋</span>
              <p className="text-white/60 text-sm">Commencez la conversation !</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === user?.uid}
                onReaction={addReaction}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <MessageInput onSend={sendMessage} sending={sending} />
    </div>
  );
}

// ==========================================
// COMPOSANT PRINCIPAL WIDGET
// ==========================================
export default function ChatWidget() {
  const { isOpen, activeConversationId, minimized, toggle, close, minimize, maximize, selectConversation } = useChatWidget();
  const { conversations, loading } = useConversations();
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <>
      {/* Bouton flottant */}
      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-500
                 rounded-full shadow-lg flex items-center justify-center"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>

        {/* Badge notifications */}
        {conversations.filter(c => c.lastMessage?.senderId !== user?.uid).length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs
                        rounded-full flex items-center justify-center font-bold">
            {Math.min(conversations.length, 9)}
          </span>
        )}
      </motion.button>

      {/* Panel Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-24 right-6 z-50 w-80 sm:w-96
                       bg-slate-900/95 backdrop-blur-xl border border-white/10
                       rounded-2xl shadow-2xl overflow-hidden
                       ${minimized ? 'h-14' : 'h-[500px]'}`}
          >
            {/* Header */}
            <div className="p-3 border-b border-white/10 flex items-center justify-between
                         bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
              <div className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <h3 className="font-semibold text-white">Messages</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={minimized ? maximize : minimize}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {minimized ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    )}
                  </svg>
                </button>
                <button
                  onClick={close}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu */}
            {!minimized && (
              <div className="h-[calc(100%-56px)]">
                {activeConversationId ? (
                  <ActiveChat
                    conversationId={activeConversationId}
                    onBack={() => selectConversation(null)}
                  />
                ) : loading ? (
                  <div className="flex items-center justify-center h-full">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto">
                    <ConversationList
                      conversations={conversations}
                      onSelect={selectConversation}
                      activeId={activeConversationId}
                    />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
